const DEFAULT_SERVER = "http://localhost:3000";
const COOKIE_NAMES = [
  "better-auth.session_token",
  "__Secure-better-auth.session_token",
];

const urlInput = document.getElementById("url");
const priceInput = document.getElementById("priceTarget");
const addBtn = document.getElementById("addBtn");
const statusEl = document.getElementById("status");
const serverInput = document.getElementById("serverUrl");
const saveServerBtn = document.getElementById("saveServerBtn");

function setStatus(message, kind = "info") {
  statusEl.textContent = message;
  statusEl.className = `status ${kind}`;
}

async function getServerUrl() {
  const { serverUrl } = await chrome.storage.local.get("serverUrl");
  return serverUrl || DEFAULT_SERVER;
}

async function getActiveTabUrl() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab?.url || "";
}

async function getSessionToken(serverUrl) {
  for (const name of COOKIE_NAMES) {
    const cookie = await chrome.cookies.get({ url: serverUrl, name });
    if (cookie?.value) return cookie.value;
  }
  return null;
}

async function init() {
  const serverUrl = await getServerUrl();
  serverInput.value = serverUrl;

  const tabUrl = await getActiveTabUrl();
  urlInput.value = tabUrl;

  if (!tabUrl || !/^https?:\/\//.test(tabUrl)) {
    setStatus("Esta página não pode ser monitorada.", "error");
    addBtn.disabled = true;
    return;
  }

  setStatus("Pronto para adicionar.", "info");
}

saveServerBtn.addEventListener("click", async () => {
  const value = serverInput.value.trim().replace(/\/+$/, "");
  if (!value) {
    setStatus("URL do servidor inválida.", "error");
    return;
  }
  await chrome.storage.local.set({ serverUrl: value });
  setStatus("Servidor salvo.", "success");
});

addBtn.addEventListener("click", async () => {
  const url = urlInput.value;
  const rawTarget = priceInput.value.trim();
  const priceTarget = rawTarget === "" ? 0 : Number(rawTarget);

  if (rawTarget !== "" && (Number.isNaN(priceTarget) || priceTarget < 0)) {
    setStatus("Preço alvo inválido.", "error");
    return;
  }

  const serverUrl = await getServerUrl();
  const token = await getSessionToken(serverUrl);

  if (!token) {
    setStatus(
      "Faça login no painel do Price Monitor antes de usar a extensão.",
      "error",
    );
    return;
  }

  addBtn.disabled = true;
  setStatus("Enviando...", "info");

  try {
    const response = await fetch(`${serverUrl}/api/add-product`, {
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
      // ignore parse error, fall back to status code
    }

    if (response.ok && data?.success) {
      setStatus("Produto adicionado ao painel!", "success");
      priceInput.value = "";
      return;
    }

    const fallbackByStatus = {
      400: "Dados inválidos.",
      401: "Sessão expirada. Faça login no painel novamente.",
      403: "A extensão é exclusiva do plano Hacker.",
      502: "Não foi possível ler este produto. Verifique se a loja é suportada.",
    };

    setStatus(
      data?.error || fallbackByStatus[response.status] || "Erro ao adicionar.",
      "error",
    );
  } catch (err) {
    console.error(err);
    setStatus(
      "Erro de conexão. Verifique se o painel está rodando.",
      "error",
    );
  } finally {
    addBtn.disabled = false;
  }
});

init();
