const API_URL = "https://itemdest-default-rtdb.firebaseio.com/relatorios.json";

// ==========================
// FIREBASE CONFIG
// ==========================
const firebaseConfig = {
  apiKey: "AIzaSyDyyExbjOq0RJIxFfz8a2ghFgr0reJYdOI",
  authDomain: "itemdest.firebaseapp.com",
  databaseURL: "https://itemdest-default-rtdb.firebaseio.com",
  projectId: "itemdest",
  storageBucket: "itemdest.firebasestorage.app",
  messagingSenderId: "145242057741",
  appId: "1:145242057741:web:dfc986550ac1a3d007b944",
  measurementId: "G-C7JCTMN2Y8"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const provider = new firebase.auth.GoogleAuthProvider();

// ==========================
// CONFIG
// ==========================
const CACHE_KEY = "relatorio_cache_v2";
const SELECTED_UNIT_KEY = "relatorio_unidade_ativa";
const CACHE_TTL = 1000 * 60 * 60 * 6;

const UNIT_LABELS = {
  "58780-000": "Itaporanga",
  "58970-000": "Conceicao"
};

let relatoriosPorUnidade = {};
let unidadeSelecionada = localStorage.getItem(SELECTED_UNIT_KEY) || "";

// ==========================
// HELPERS
// ==========================
const qs = (id) => document.getElementById(id);

const setText = (id, value) => {
  const el = qs(id);
  if (el) el.textContent = value;
};

const formatBRL = (v) => {
  return "R$ " + Number(v || 0).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

function toArray(value) {
  if (Array.isArray(value)) return value;
  if (!value || typeof value !== "object") return [];

  return Object.entries(value)
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([, item]) => item)
    .filter(Boolean);
}

function isReportNode(value) {
  return Boolean(value && typeof value === "object" && (
    value.resumo ||
    value.mesAMes ||
    value.topPessoas ||
    value.topPlanosGlobal ||
    value.meta
  ));
}

function normalizarRelatorios(data) {
  if (!data || typeof data !== "object") return {};

  const unidades = Object.fromEntries(
    Object.entries(data).filter(([, value]) => isReportNode(value))
  );

  if (Object.keys(unidades).length) {
    return unidades;
  }

  if (isReportNode(data)) {
    return { geral: data };
  }

  return {};
}

function nomeUnidade(unitId) {
  if (!unitId) return "Nenhuma";
  if (UNIT_LABELS[unitId]) return UNIT_LABELS[unitId];
  if (unitId === "geral") return "Geral";

  const cepMatch = unitId.match(/^(\d{5})-?(\d{3})$/);
  if (cepMatch) return `Unidade ${cepMatch[1]}`;

  return unitId
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
    .slice(0, 28);
}

function descricaoUnidade(unitId) {
  const name = nomeUnidade(unitId);
  return UNIT_LABELS[unitId] ? `${name} (${unitId})` : name;
}

function limparDashboard(message = "Sem dados carregados.") {
  setText("totalGeralHero", formatBRL(0));
  setText("totalGeral", formatBRL(0));
  setText("total30", formatBRL(0));
  setText("total3m", formatBRL(0));
  setText("totalAlunos", "---");
  setText("totalAtivos", "---");
  setText("totalAtrasados", "---");
  setText("pctAtivos", "---");
  setText("pctAtrasados", "---");
  setText("ultimaSync", "---");
  setText("statusCache", message);
  setText("unidadeAtiva", "---");

  const chart = qs("graficoMensal");
  if (chart) chart.innerHTML = `<div class="mini-note">${message}</div>`;

  const ranking = qs("rankingPessoas");
  if (ranking) ranking.innerHTML = `<tr><td colspan="3" class="mini-note">${message}</td></tr>`;

  const valores = qs("listaValores");
  if (valores) {
    valores.innerHTML = `<div class="list-item"><strong>Sem dados</strong><span>${message}</span></div>`;
  }
}

function popularComboUnidades() {
  const select = qs("unitSelect");
  if (!select) return;

  const unitIds = Object.keys(relatoriosPorUnidade).sort((a, b) => {
    return nomeUnidade(a).localeCompare(nomeUnidade(b), "pt-BR");
  });

  if (!unitIds.length) {
    select.innerHTML = '<option value="">Sem relatorios</option>';
    select.disabled = true;
    return;
  }

  select.disabled = false;

  if (!unitIds.includes(unidadeSelecionada)) {
    unidadeSelecionada = unitIds[0];
  }

  select.innerHTML = unitIds
    .map((unitId) => {
      const selected = unitId === unidadeSelecionada ? " selected" : "";
      return `<option value="${unitId}"${selected}>${descricaoUnidade(unitId)}</option>`;
    })
    .join("");
}

function selecionarUnidade(unitId) {
  if (!unitId || !relatoriosPorUnidade[unitId]) return;

  unidadeSelecionada = unitId;
  localStorage.setItem(SELECTED_UNIT_KEY, unitId);

  const select = qs("unitSelect");
  if (select && select.value !== unitId) select.value = unitId;

  aplicarTudo(relatoriosPorUnidade[unitId], unitId);
}

function aplicarRelatorios(data) {
  relatoriosPorUnidade = normalizarRelatorios(data);
  popularComboUnidades();

  if (!Object.keys(relatoriosPorUnidade).length) {
    limparDashboard("Nenhum relatorio encontrado");
    return;
  }

  selecionarUnidade(unidadeSelecionada);
}

// ==========================
// CACHE
// ==========================
function salvarCache(data) {
  localStorage.setItem(CACHE_KEY, JSON.stringify({
    t: Date.now(),
    d: data
  }));
}

function carregarCache() {
  const raw = localStorage.getItem(CACHE_KEY);
  if (!raw) return null;

  try {
    const obj = JSON.parse(raw);
    if (Date.now() - obj.t > CACHE_TTL) return null;
    return obj.d;
  } catch {
    return null;
  }
}

// ==========================
// AUTHORIZATION CHECK
// ==========================
async function checkAuthorization() {
  const user = auth.currentUser;
  if (!user) return false;

  try {
    const authorizedRef = firebase.database().ref("authorized_users/" + user.uid);
    const snapshot = await authorizedRef.once("value");
    return snapshot.exists();
  } catch (error) {
    console.error("Authorization check failed:", error.code, error.message);
    return false;
  }
}

// ==========================
// FETCH
// ==========================
async function buscarFirebase() {
  const isAuthorized = await checkAuthorization();
  if (!isAuthorized) {
    showUnauthorizedMessage();
    return;
  }

  try {
    const user = auth.currentUser;
    const token = await user.getIdToken();
    const res = await fetch(API_URL + "?auth=" + encodeURIComponent(token));

    if (!res.ok) throw new Error("HTTP " + res.status);

    const data = await res.json();
    if (!data) throw new Error("sem dados");

    salvarCache(data);
    aplicarRelatorios(data);
    setText("statusCache", "online");
  } catch (err) {
    console.warn("Usando cache por erro no Firebase:", err.message);
    const cache = carregarCache();
    if (cache) {
      aplicarRelatorios(cache);
      setText("statusCache", "cache local");
      return;
    }

    if (err.message.includes("401") || err.message.includes("403")) {
      showUnauthorizedMessage();
    } else {
      limparDashboard("Erro ao carregar Firebase");
    }
  }
}

function showUnauthorizedMessage() {
  const select = qs("unitSelect");
  if (select) {
    select.innerHTML = '<option value="">Acesso restrito</option>';
    select.disabled = true;
  }

  limparDashboard("Acesso restrito");
  setText("ultimaSync", "Acesso restrito");
  setText("statusCache", "Nao autorizado");
}

// ==========================
// APLICACAO
// ==========================
function aplicarTudo(data, unitId = unidadeSelecionada) {
  aplicarResumo(data.resumo || {});
  aplicarMensal(data.mesAMes || {});
  aplicarRanking(data.topPessoas || {});
  aplicarDistribuicao(data.topPlanosGlobal || {});
  atualizarSync(data.meta || {});
  setText("unidadeAtiva", descricaoUnidade(unitId));
}

// ==========================
// RESUMO
// ==========================
function aplicarResumo(resumo) {
  const totalGeral = resumo.total || 0;
  const atrasados = resumo.atrasados || 0;
  const ativos = resumo.ativos || 0;
  const alunos = resumo.alunos || 0;
  const total30d = resumo.total30d || 0;
  const total3m = resumo.total3m || 0;

  setText("totalGeralHero", formatBRL(totalGeral));
  setText("totalGeral", formatBRL(totalGeral));
  setText("totalAtrasados", atrasados);
  setText("totalAlunos", alunos);
  setText("totalAtivos", ativos);
  setText("total30", formatBRL(total30d));
  setText("total3m", formatBRL(total3m));

  const pctAtivos = alunos > 0 ? Math.round((ativos / alunos) * 100) : 0;
  const pctAtrasados = alunos > 0 ? Math.round((atrasados / alunos) * 100) : 0;
  setText("pctAtivos", pctAtivos + "%");
  setText("pctAtrasados", pctAtrasados + "%");

  const bars = document.querySelectorAll(".progress-line .bar i");
  if (bars[0]) bars[0].style.width = pctAtivos + "%";
  if (bars[1]) bars[1].style.width = pctAtrasados + "%";
}

// ==========================
// MENSAL
// ==========================
function aplicarMensal(mesAMes) {
  const container = qs("graficoMensal");
  if (!container) return;

  container.innerHTML = "";

  const entries = Array.isArray(mesAMes)
    ? mesAMes.map((item) => [`${item.ano}-${String(item.mesNumero || item.mes).padStart(2, "0")}`, item.valor])
    : Object.entries(mesAMes);

  if (!entries.length) {
    container.innerHTML = '<div class="mini-note">Sem dados mensais.</div>';
    return;
  }

  entries.sort((a, b) => a[0].localeCompare(b[0]));

  const valores = entries.map((entry) => Number(entry[1]) || 0);
  const max = Math.max(...valores, 1);

  for (const [mes, valor] of entries) {
    const percent = (Number(valor || 0) / max) * 100;
    const row = document.createElement("div");
    row.className = "chart-row";
    row.innerHTML = `
      <div class="chart-label">${mes}</div>
      <div class="chart-track">
        <div class="chart-fill" style="width:${percent}%"></div>
      </div>
      <div class="chart-label">${formatBRL(valor)}</div>
    `;
    container.appendChild(row);
  }
}

// ==========================
// RANKING
// ==========================
function aplicarRanking(topPessoas) {
  const tbody = qs("rankingPessoas");
  if (!tbody) return;

  const pessoas = toArray(topPessoas);
  tbody.innerHTML = "";

  if (!pessoas.length) {
    tbody.innerHTML = '<tr><td colspan="3" class="mini-note">Sem dados carregados.</td></tr>';
    return;
  }

  pessoas.forEach((pessoa, idx) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>#${pessoa.id || pessoa.codigo || "-"}</td>
      <td>${formatBRL(pessoa.total)}</td>
      <td><span class="badge">Top ${idx + 1}</span></td>
    `;
    tbody.appendChild(tr);
  });
}

// ==========================
// DISTRIBUICAO
// ==========================
function aplicarDistribuicao(topPlanos) {
  const container = qs("listaValores");
  if (!container) return;

  const planos = toArray(topPlanos);
  container.innerHTML = "";

  if (!planos.length) {
    container.innerHTML = '<div class="list-item"><strong>Sem dados</strong><span>aguardando carregamento</span></div>';
    return;
  }

  const mapa = {};
  planos.forEach((plano) => {
    const valor = Number(plano.valor || 0);
    if (!mapa[valor]) mapa[valor] = 0;
    mapa[valor] += Number(plano.qtd || 0);
  });

  Object.entries(mapa)
    .sort((a, b) => b[1] - a[1])
    .forEach(([valor, qtd]) => {
      const item = document.createElement("div");
      item.className = "list-item";
      item.innerHTML = `
        <strong>${formatBRL(valor)}</strong>
        <span>${qtd} registros</span>
      `;
      container.appendChild(item);
    });
}

// ==========================
// SYNC
// ==========================
function atualizarSync(meta) {
  const rawTimestamp = meta.geradoEm || meta.lastUpdate || Date.now();
  const data = new Date(rawTimestamp);
  const formatted = Number.isNaN(data.getTime())
    ? String(rawTimestamp)
    : data.toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });

  setText("ultimaSync", formatted);
}

// ==========================
// AUTHENTICATION
// ==========================
function signInWithGoogle() {
  auth.signInWithPopup(provider)
    .then((result) => {
      updateUIForSignedInUser(result.user);
    })
    .catch((error) => {
      if (error.code === "auth/popup-blocked" || error.code === "auth/popup-closed-by-user") {
        signInWithGoogleRedirect();
      } else {
        alert("Erro ao fazer login: " + error.message);
      }
    });
}

function signInWithGoogleRedirect() {
  auth.signInWithRedirect(provider)
    .catch((error) => {
      alert("Erro ao fazer login: " + error.message);
    });
}

function handleRedirectResult() {
  auth.getRedirectResult()
    .then((result) => {
      if (result.user) updateUIForSignedInUser(result.user);
    })
    .catch((error) => {
      if (error.code !== "auth/no-credential") {
        alert("Erro ao fazer login: " + error.message);
      }
    });
}

function signOut() {
  auth.signOut()
    .then(() => {
      relatoriosPorUnidade = {};
      updateUIForSignedOutUser();
    })
    .catch((error) => {
      console.error("Sign out error:", error);
    });
}

function updateUIForSignedInUser(user) {
  const googleBtn = document.querySelector(".google-btn");
  if (!googleBtn) return;

  googleBtn.innerHTML = `
    ${user.displayName}
    <img src="${user.photoURL}" alt="Profile" style="width: 18px; height: 18px; border-radius: 50%; margin-left: 8px;">
  `;
  googleBtn.onclick = signOut;
}

function updateUIForSignedOutUser() {
  const googleBtn = document.querySelector(".google-btn");
  if (!googleBtn) return;

  googleBtn.innerHTML = `
    Entrar
    <svg width="18" height="18" viewBox="0 0 48 48">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.69 1.22 9.18 3.6l6.85-6.85C35.9 2.7 30.37 0 24 0 14.64 0 6.4 5.38 2.44 13.22l7.98 6.2C12.28 13.12 17.7 9.5 24 9.5z"></path>
      <path fill="#4285F4" d="M46.1 24.5c0-1.63-.15-3.2-.43-4.7H24v9h12.4c-.54 2.9-2.2 5.36-4.7 7.02l7.3 5.67C43.9 37.4 46.1 31.4 46.1 24.5z"></path>
      <path fill="#FBBC05" d="M10.42 28.42a14.5 14.5 0 0 1 0-8.84l-7.98-6.2A23.9 23.9 0 0 0 0 24c0 3.86.93 7.52 2.44 10.62l7.98-6.2z"></path>
      <path fill="#34A853" d="M24 48c6.48 0 11.92-2.14 15.9-5.8l-7.3-5.67c-2.03 1.37-4.63 2.18-8.6 2.18-6.3 0-11.72-3.62-13.58-8.92l-7.98 6.2C6.4 42.62 14.64 48 24 48z"></path>
    </svg>
  `;
  googleBtn.onclick = signInWithGoogle;
}

// ==========================
// INIT
// ==========================
function init() {
  handleRedirectResult();

  const select = qs("unitSelect");
  if (select) {
    select.addEventListener("change", (event) => selecionarUnidade(event.target.value));
  }

  auth.onAuthStateChanged(async (user) => {
    if (!user) {
      updateUIForSignedOutUser();
      showUnauthorizedMessage();
      return;
    }

    updateUIForSignedInUser(user);
    const isAuthorized = await checkAuthorization();

    if (!isAuthorized) {
      showUnauthorizedMessage();
      return;
    }

    const cache = carregarCache();
    if (cache) {
      aplicarRelatorios(cache);
      setText("statusCache", "cache local");
      setTimeout(buscarFirebase, 1500);
    } else {
      buscarFirebase();
    }
  });

  const googleBtn = document.querySelector(".google-btn");
  if (googleBtn) googleBtn.onclick = signInWithGoogle;
}

document.addEventListener("DOMContentLoaded", init);
