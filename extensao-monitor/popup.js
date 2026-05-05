const SERVER_URL = "https://price-monitor-smoky.vercel.app";
const COOKIE_NAMES = [
  "better-auth.session_token",
  "__Secure-better-auth.session_token",
];

const ICON_PLUS = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>`;

const ICON_LOADER = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>`;

const urlInput = document.getElementById("url");
const priceInput = document.getElementById("priceTarget");
const addBtn = document.getElementById("addBtn");
const btnIcon = document.getElementById("btnIcon");
const btnText = document.getElementById("btnText");
const statusEl = document.getElementById("status");
const userMenu = document.getElementById("userMenu");
const avatarBtn = document.getElementById("avatarBtn");
const avatarFallback = document.getElementById("avatarFallback");
const dropdown = document.getElementById("dropdown");
const userNameEl = document.getElementById("userName");
const userEmailEl = document.getElementById("userEmail");
const logoutBtn = document.getElementById("logoutBtn");

function setStatus(message, kind = "info") {
  statusEl.textContent = message;
  statusEl.className = `status ${kind}`;
}

function setLoading(loading) {
  if (loading) {
    addBtn.disabled = true;
    btnIcon.classList.add("spinning");
    btnIcon.innerHTML = ICON_LOADER;
    btnText.textContent = "Cadastrando...";
  } else {
    addBtn.disabled = false;
    btnIcon.classList.remove("spinning");
    btnIcon.innerHTML = ICON_PLUS;
    btnText.textContent = "Cadastrar";
  }
}

async function getActiveTabUrl() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab?.url || "";
}

async function getSessionToken() {
  for (const name of COOKIE_NAMES) {
    const cookie = await chrome.cookies.get({ url: SERVER_URL, name });
    if (cookie?.value) return cookie.value;
  }
  return null;
}

async function fetchUser(token) {
  try {
    const res = await fetch(`${SERVER_URL}/api/auth/get-session`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.user || null;
  } catch {
    return null;
  }
}

function getInitial(user) {
  const source = (user?.name || user?.email || "?").trim();
  return source.charAt(0).toUpperCase() || "?";
}

function renderUser(user) {
  if (!user) {
    userMenu.hidden = true;
    return;
  }
  userMenu.hidden = false;
  avatarFallback.textContent = getInitial(user);

  if (user.name) {
    userNameEl.textContent = user.name;
    userNameEl.hidden = false;
  } else {
    userNameEl.hidden = true;
  }
  userEmailEl.textContent = user.email || "";
}

function openDropdown() {
  dropdown.hidden = false;
  avatarBtn.setAttribute("aria-expanded", "true");
}

function closeDropdown() {
  dropdown.hidden = true;
  avatarBtn.setAttribute("aria-expanded", "false");
}

avatarBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  if (dropdown.hidden) openDropdown();
  else closeDropdown();
});

document.addEventListener("click", (e) => {
  if (!dropdown.hidden && !userMenu.contains(e.target)) closeDropdown();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeDropdown();
});

async function clearSessionCookies() {
  for (const name of COOKIE_NAMES) {
    try {
      await chrome.cookies.remove({ url: SERVER_URL, name });
    } catch {
      // ignore
    }
  }
}

logoutBtn.addEventListener("click", async () => {
  logoutBtn.disabled = true;
  const token = await getSessionToken();

  if (token) {
    try {
      await fetch(`${SERVER_URL}/api/auth/sign-out`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      // ignore — client cookies will be cleared anyway
    }
  }

  await clearSessionCookies();
  chrome.tabs.create({ url: `${SERVER_URL}/login` });
  window.close();
});

async function init() {
  const tabUrl = await getActiveTabUrl();

  if (!tabUrl || !/^https?:\/\//.test(tabUrl)) {
    urlInput.value = "Página inválida";
    addBtn.disabled = true;
    setStatus("Esta aba não pode ser monitorada.", "error");
  } else {
    urlInput.value = tabUrl;
    priceInput.focus();
  }

  const token = await getSessionToken();
  if (token) {
    const user = await fetchUser(token);
    renderUser(user);
  }
}

addBtn.addEventListener("click", async () => {
  const url = urlInput.value;
  const rawTarget = priceInput.value.trim();

  if (!rawTarget) {
    setStatus("Insira o valor desejado.", "error");
    priceInput.focus();
    return;
  }

  const priceTarget = Number(rawTarget);
  if (Number.isNaN(priceTarget) || priceTarget <= 0) {
    setStatus("Valor inválido.", "error");
    priceInput.focus();
    return;
  }

  const token = await getSessionToken();

  if (!token) {
    setStatus(
      "Faça login no painel do Price Monitor antes de usar a extensão.",
      "error",
    );
    return;
  }

  setLoading(true);
  setStatus("", "info");

  try {
    const response = await fetch(`${SERVER_URL}/api/add-product`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ url, priceTarget }),
    });

    let data = null;
    try {
      data = await response.json();
    } catch {
      // ignore
    }

    if (response.ok && data?.success) {
      setStatus("Produto adicionado!", "success");
      priceInput.value = "";
      return;
    }

    const fallbackByStatus = {
      400: "Não foi possível cadastrar.",
      401: "Sessão expirada. Faça login novamente.",
      403: "A extensão é exclusiva do plano Hacker.",
      502: "Não foi possível ler este produto.",
    };

    setStatus(
      data?.error ||
        fallbackByStatus[response.status] ||
        "Erro ao adicionar produto.",
      "error",
    );
  } catch (err) {
    console.error(err);
    setStatus("Erro de conexão. Verifique sua rede.", "error");
  } finally {
    setLoading(false);
  }
});

priceInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    addBtn.click();
  }
});

init();
