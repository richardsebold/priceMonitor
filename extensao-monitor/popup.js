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

async function init() {
  const tabUrl = await getActiveTabUrl();

  if (!tabUrl || !/^https?:\/\//.test(tabUrl)) {
    urlInput.value = "Página inválida";
    addBtn.disabled = true;
    setStatus("Esta aba não pode ser monitorada.", "error");
    return;
  }

  urlInput.value = tabUrl;
  priceInput.focus();
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
