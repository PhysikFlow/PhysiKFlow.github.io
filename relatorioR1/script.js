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
const db = firebase.database();
const provider = new firebase.auth.GoogleAuthProvider();
const FIREBASE_READ_TIMEOUT_MS = 15000;
const FIREBASE_REST_TIMEOUT_MS = 12000;

// ==========================
// CONFIG
// ==========================
const CACHE_KEY = "relatorio_cache_v2";
const APP_BUILD_ID = "2026-07-23-config-debug-1";
const APP_BUILD_CACHE_KEY = "relatorio_app_build_seen";
const SELECTED_UNIT_KEY = "relatorio_unidade_ativa";
const INICIO_SEGMENT_KEY = "relatorio_inicio_segmento";
const CACHE_TTL = 1000 * 60 * 60 * 6;
const REPORT_ROOT = "relatorios";
const UNITS_ROOT = "units";
const PAGAMENTOS_BY_DATE_ROOT = "pagamentosByDate";
const PHYSIK_SERVER_CONFIG_ROOT = "app_config/physik_server";
const PHOTO_LINK_CACHE_KEY = "relatorio_photo_links_v1";
const PHOTO_LINK_REFRESH_GRACE_SECONDS = 300;
const REPORT_LIGHT_FIELDS = [
  "meta",
  "resumo",
  "frequencia",
  "mesAMes",
  "diarias",
  "diariasMensais",
  "picoHoras",
  "topPessoas",
  "topPlanosGlobal"
];

let relatoriosPorUnidade = {};
let unitsMeta = {};
let alunosPorUnidade = {};
let alunosDebugPorUnidade = {};
let pagamentosHojePorUnidade = {};
const alunosFetchPromises = new Map();
const pagamentosHojeFetchPromises = new Map();
const photoLinkMemoryCache = new Map();
let unidadeSelecionada = localStorage.getItem(SELECTED_UNIT_KEY) || "";
let physikServerConfig = null;
let physikServerConfigPromise = null;
let physikServerConfigError = "";
let deferredInstallPrompt = null;
let appAuthorized = false;
let authStateReady = false;
let pendingLoginError = "";
let inicioSegmento = localStorage.getItem(INICIO_SEGMENT_KEY) || "operacional";
let financeSubView = null;
const studentVirtualState = new Map();
const STUDENT_CARD_WIDTH = 152;
const STUDENT_CARD_GAP = 10;
const STUDENT_VIRTUAL_BUFFER = 6;
const STUDENT_SEARCH_DEBOUNCE_MS = 120;

const loginView = () => document.querySelector('[data-view="login"]');
const appView = () => document.querySelector('[data-view="app"]');
const appNav = () => document.querySelector('[data-view="app-nav"]');
const appPages = () => [...document.querySelectorAll("[data-page]")];
const bottomTabs = () => [...document.querySelectorAll(".bottom-nav [data-tab]")];
const segmentButtons = () => [...document.querySelectorAll(".segment-control [data-segment]")];
const segmentPanels = () => [...document.querySelectorAll("[data-segment-panel]")];

// ==========================
// HELPERS
// ==========================
const qs = (id) => document.getElementById(id);

const setText = (id, value) => {
  const el = qs(id);
  if (el) el.textContent = value;

  if (id === "statusCache") {
    updateSyncDot(value);
  }
};

const setHtml = (id, value) => {
  const el = qs(id);
  if (el) el.innerHTML = value;
};

const isStandalone = () => {
  if (window.navigator.standalone === true) return true;

  return ["standalone", "fullscreen", "minimal-ui"].some((mode) => {
    return window.matchMedia(`(display-mode: ${mode})`).matches;
  });
};

async function isAppInstalled() {
  if (isStandalone()) return true;

  if (typeof navigator.getInstalledRelatedApps !== "function") {
    return false;
  }

  try {
    const apps = await navigator.getInstalledRelatedApps();
    return apps.length > 0;
  } catch {
    return false;
  }
}

function updateSyncDot(statusText = "") {
  const dot = qs("syncDot");
  if (!dot) return;

  const text = String(statusText || "").toLowerCase();
  let status = "idle";

  if (text.includes("online")) status = "online";
  else if (text.includes("cache")) status = "cache";
  else if (text.includes("restrito") || text.includes("nao autorizado") || text.includes("não autorizado")) status = "restricted";
  else if (text.includes("erro") || text.includes("sem dados")) status = "error";
  else if (text.includes("carregando")) status = "loading";

  dot.dataset.status = status;
}

function setLoginMessage(message = "", type = "error") {
  const el = qs("loginMessage");
  if (!el) return;

  if (!message) {
    el.hidden = true;
    el.textContent = "";
    el.classList.remove("is-info");
    return;
  }

  el.hidden = false;
  el.textContent = message;
  el.classList.toggle("is-info", type === "info");
}

function updateLoginButton() {
  const btn = qs("loginGoogleBtn");
  if (!btn) return;

  const loginVisible = !loginView()?.classList.contains("is-hidden");
  const canSignIn = authStateReady && loginVisible && !auth.currentUser;

  btn.disabled = !canSignIn;
  btn.classList.toggle("is-pending", loginVisible && !authStateReady);
  btn.setAttribute("aria-busy", loginVisible && !authStateReady ? "true" : "false");

  const label = btn.querySelector(".login-btn-label");
  if (label) {
    label.textContent = authStateReady ? "Entrar com Google" : "Verificando sessão...";
  }
}

const formatBRL = (v) => {
  return "R$ " + Number(v || 0).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

const formatNumero = (v, digits = 2) => {
  return Number(v || 0).toLocaleString("pt-BR", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits
  });
};

const formatPercent = (v, digits = 2) => {
  const value = Number(v || 0);
  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits
  }) + "%";
};

const formatRatioPercent = (v, digits = 0) => formatPercent(Number(v || 0) * 100, digits);

const formatHora = (hora) => {
  const value = Number(hora);
  if (!Number.isFinite(value)) return "--:00";
  return String(value).padStart(2, "0") + ":00";
};

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const DISTRIBUTION_COLORS = [
  "#61c07a",
  "#2d86ff",
  "#74a8f0",
  "#e2a23a",
  "#ef6b63",
  "#9b8cff",
  "#42d2b8",
  "#f37fba",
  "#b5d66b",
  "#f2c94c",
  "#56ccf2",
  "#eb5757",
  "#a3a8ff",
  "#6fcf97",
  "#f2994a"
];

const escapeHTML = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#039;"
}[char]));

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

function stripReportHeavyFields(report) {
  if (!report || typeof report !== "object") return report;

  const clean = { ...report };
  delete clean.alunos;
  delete clean.pagamentosHoje;
  return clean;
}

function stripReportsHeavyFields(data) {
  const reports = normalizarRelatorios(data);
  return Object.fromEntries(
    Object.entries(reports).map(([unitId, report]) => [unitId, stripReportHeavyFields(report)])
  );
}

function normalizarRelatorios(data) {
  if (!data || typeof data !== "object") return {};

  if (data.relatorios && typeof data.relatorios === "object") {
    return normalizarRelatorios(data.relatorios);
  }

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

async function readFirebaseValue(path, label = path) {
  try {
    const snapshot = await withTimeout(
      db.ref(path).once("value"),
      FIREBASE_READ_TIMEOUT_MS,
      label + "-timeout"
    );
    return snapshot.val();
  } catch (sdkError) {
    console.warn("Leitura via SDK falhou; tentando REST:", label, sdkError.code || sdkError.message);
    return readFirebaseRestValue(path, label);
  }
}

function normalizePhysikServerConfig(value) {
  if (!value || typeof value !== "object") return null;

  const baseUrl = String(value.baseUrl || "").trim().replace(/\/+$/, "");
  const apiBearerToken = String(value.apiBearerToken || "").trim();
  const pwaReadToken = String(value.pwaReadToken || "").trim();
  const linkTtlSeconds = Number(value.linkTtlSeconds) || 86400;
  const status = String(value.status || "").trim().toLowerCase();

  if (!baseUrl) return null;

  return {
    baseUrl,
    apiBearerToken,
    pwaReadToken,
    linkTtlSeconds,
    status: status || "online"
  };
}

async function carregarPhysikServerConfig(force = false) {
  if (!force && physikServerConfig) return physikServerConfig;
  if (!force && physikServerConfigPromise) return physikServerConfigPromise;

  physikServerConfigError = "";
  physikServerConfigPromise = readFirebaseValue(PHYSIK_SERVER_CONFIG_ROOT, "physik-server-config")
    .then((value) => {
      physikServerConfig = normalizePhysikServerConfig(value);
      if (!physikServerConfig) physikServerConfigError = value ? "config-invalida" : "config-null";
      return physikServerConfig;
    })
    .catch((error) => {
      console.warn("Config PhysikServer indisponivel:", error.code || error.message, error.message);
      physikServerConfigError = error.code || error.status || error.message || "erro-config";
      physikServerConfig = null;
      return null;
    })
    .finally(() => {
      physikServerConfigPromise = null;
    });

  return physikServerConfigPromise;
}

function loadPhotoLinkCache() {
  try {
    const raw = localStorage.getItem(PHOTO_LINK_CACHE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function savePhotoLinkCache(cache) {
  try {
    localStorage.setItem(PHOTO_LINK_CACHE_KEY, JSON.stringify(cache));
  } catch {
    // Cache de foto e apenas otimizacao.
  }
}

function getCachedPhotoLink(cacheKey) {
  const now = Math.floor(Date.now() / 1000);
  const cached = photoLinkMemoryCache.get(cacheKey) || loadPhotoLinkCache()[cacheKey];
  if (!cached || !cached.url || !cached.expires) return "";
  if (Number(cached.expires) - PHOTO_LINK_REFRESH_GRACE_SECONDS <= now) return "";
  photoLinkMemoryCache.set(cacheKey, cached);
  return cached.url;
}

function setCachedPhotoLink(cacheKey, url, expires) {
  const item = { url, expires };
  photoLinkMemoryCache.set(cacheKey, item);

  const cache = loadPhotoLinkCache();
  cache[cacheKey] = item;
  savePhotoLinkCache(cache);
}

function physikServerReadToken(config) {
  return String(config?.apiBearerToken || config?.pwaReadToken || "").trim();
}

function encodePhysikObjectId(objectId) {
  return encodeURIComponent(String(objectId || "").trim());
}

function physikServerObjectUrl(config, area, objectId, ttl) {
  return `${config.baseUrl}/links/${area}/${encodePhysikObjectId(objectId)}?ttl=${encodeURIComponent(ttl)}`;
}

function resolvePhysikServerUrl(config, urlPath) {
  if (!urlPath) return "";
  return /^https?:\/\//i.test(urlPath) ? urlPath : `${config.baseUrl}${urlPath}`;
}

function canonicalPhysikUnitId(unitId) {
  const raw = String(unitId || "").trim();
  const configuredId = String(unitsMeta[raw]?.physikServerUnitId || unitsMeta[raw]?.id || "").trim();
  const candidate = configuredId || raw;
  const aliases = {
    "58780-00": "58780-000",
    "58970-00": "58970-000"
  };

  return aliases[candidate] || candidate;
}

function physikUnitIdCandidates(unitId) {
  return [...new Set([
    canonicalPhysikUnitId(unitId),
    String(unitId || "").trim()
  ].filter(Boolean))];
}

function tokenDebug(token) {
  const value = String(token || "");
  return value ? `${value.slice(0, 6)}...${value.length}` : "ausente";
}

function setAlunosDebug(unitId, lines) {
  alunosDebugPorUnidade[unitId] = lines.filter(Boolean).join("\n");
}

async function obterSignedPhotoUrl(photoId) {
  const cleanPhotoId = String(photoId || "").trim();
  if (!cleanPhotoId) return "";

  const config = await carregarPhysikServerConfig();
  const bearerToken = physikServerReadToken(config);
  if (!config || config.status !== "online" || !bearerToken) return "";

  const cacheKey = `${config.baseUrl}|${cleanPhotoId}`;
  const cached = getCachedPhotoLink(cacheKey);
  if (cached) return cached;

  const ttl = Math.max(60, Math.min(Number(config.linkTtlSeconds) || 86400, 86400));
  const url = physikServerObjectUrl(config, "fotos", cleanPhotoId, ttl);

  try {
    const data = await fetchJsonWithTimeout(url, {
      headers: {
        Authorization: `Bearer ${bearerToken}`
      }
    }, FIREBASE_REST_TIMEOUT_MS);

    if (!data?.urlPath) return "";

    const signedUrl = resolvePhysikServerUrl(config, data.urlPath);
    if (!signedUrl) return "";

    const expires = Number(data.expires) || (Math.floor(Date.now() / 1000) + ttl);
    setCachedPhotoLink(cacheKey, signedUrl, expires);
    return signedUrl;
  } catch (error) {
    if (error?.status === 401 || error?.status === 403) {
      physikServerConfig = null;
    }
    return "";
  }
}

function normalizeUnitsMap(value) {
  if (!value || typeof value !== "object") return {};

  return Object.fromEntries(
    Object.entries(value)
      .filter(([unitId]) => unitId && unitId !== "_schema")
      .map(([unitId, unit]) => [
        unitId,
        unit && typeof unit === "object"
          ? { id: unit.id || unitId, ...unit }
          : { id: unitId, nome: String(unit || unitId) }
      ])
  );
}

async function buscarUnidadesFirebase() {
  const units = normalizeUnitsMap(await readFirebaseValue(UNITS_ROOT, "units"));
  unitsMeta = units;
  return Object.keys(units);
}

async function buscarRelatorioLeveDaUnidade(unitId) {
  const entries = await Promise.all(
    REPORT_LIGHT_FIELDS.map(async (field) => {
      const value = await readFirebaseValue(`${REPORT_ROOT}/${unitId}/${field}`, `${REPORT_ROOT}-${unitId}-${field}`);
      return [field, value];
    })
  );

  const report = Object.fromEntries(entries.filter(([, value]) => value !== null && value !== undefined));
  return isReportNode(report) ? report : null;
}

async function buscarRelatoriosEssenciais() {
  let unitIds = await buscarUnidadesFirebase();

  const entries = await Promise.all(
    unitIds.map(async (unitId) => {
      const report = await buscarRelatorioLeveDaUnidade(unitId);
      return report ? [unitId, report] : null;
    })
  );

  return Object.fromEntries(entries.filter(Boolean));
}

function nomeUnidade(unitId) {
  if (!unitId) return "Nenhuma";
  if (unitsMeta[unitId]?.nome) return unitsMeta[unitId].nome;
  if (unitId === "geral") return "Geral";

  const cepMatch = unitId.match(/^(\d{5})-?(\d{3})$/);
  if (cepMatch) return `Unidade ${cepMatch[1]}`;

  return unitId
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
    .slice(0, 28);
}

function descricaoUnidade(unitId) {
  return labelUnidade(unitId);
}

function labelUnidade(unitId) {
  if (!unitId) return "Nenhuma";
  if (unitId === "geral") return "Todas as unidades";
  return nomeUnidade(unitId);
}

function mergeMesEntries(mesAMes) {
  if (Array.isArray(mesAMes)) {
    return mesAMes.map((item) => [
      `${item.ano}-${String(item.mesNumero || item.mes).padStart(2, "0")}`,
      Number(item.valor) || 0
    ]);
  }

  return Object.entries(mesAMes || {}).map(([mes, valor]) => [mes, Number(valor) || 0]);
}

function mergeDiariasEntries(diariasMensais) {
  if (Array.isArray(diariasMensais)) {
    return diariasMensais.map((item) => [
      `${item.ano}-${String(item.mesNumero || item.mes).padStart(2, "0")}`,
      {
        valor: Number(item.valor) || 0,
        qtd: Number(item.qtd) || 0
      }
    ]);
  }

  return Object.entries(diariasMensais || {}).map(([mes, item]) => [
    mes,
    {
      valor: Number((item && item.valor) || 0),
      qtd: Number((item && item.qtd) || 0)
    }
  ]);
}

function agregarMapaMensal(unidades, field) {
  const map = {};

  unidades.forEach((relatorio) => {
    const entries = field === "diariasMensais"
      ? mergeDiariasEntries(relatorio[field] || {})
      : mergeMesEntries(relatorio[field] || {});

    entries.forEach(([mes, valor]) => {
      if (field === "diariasMensais") {
        if (!map[mes]) map[mes] = { valor: 0, qtd: 0 };
        map[mes].valor += Number(valor.valor) || 0;
        map[mes].qtd += Number(valor.qtd) || 0;
        return;
      }

      map[mes] = (map[mes] || 0) + (Number(valor) || 0);
    });
  });

  return map;
}

function agregarRelatorioGeral() {
  const unidades = Object.values(relatoriosPorUnidade);
  if (!unidades.length) return {};
  if (unidades.length === 1) return unidades[0];

  const resumo = {
    total: 0,
    total30d: 0,
    total3m: 0,
    alunos: 0,
    ativos: 0,
    atrasados: 0,
    diariasTotal: 0,
    diariasCount: 0,
    ticketMedio30d: 0,
    ticketMedioGeral: 0
  };

  let pesoTicket30 = 0;
  let pesoTicketGeral = 0;
  let pesoAlunos = 0;
  let pesoFreq = 0;
  let somaFreq = 0;

  unidades.forEach((relatorio) => {
    const item = relatorio.resumo || {};
    resumo.total += Number(item.total) || 0;
    resumo.total30d += Number(item.total30d) || 0;
    resumo.total3m += Number(item.total3m) || 0;
    resumo.alunos += Number(item.alunos) || 0;
    resumo.ativos += Number(item.ativos) || 0;
    resumo.atrasados += Number(item.atrasados) || 0;
    resumo.diariasTotal += Number(item.diariasTotal) || 0;
    resumo.diariasCount += Number(item.diariasCount) || 0;

    const alunos = Number(item.alunos) || 0;
    if (alunos > 0) {
      pesoTicket30 += (Number(item.ticketMedio30d) || 0) * alunos;
      pesoTicketGeral += (Number(item.ticketMedioGeral) || 0) * alunos;
      pesoAlunos += alunos;
    }

    const freq = Number((relatorio.frequencia || {}).mediaPorAluno30d) || 0;
    if (alunos > 0 && freq > 0) {
      somaFreq += freq * alunos;
      pesoFreq += alunos;
    }
  });

  if (pesoAlunos > 0) {
    resumo.ticketMedio30d = pesoTicket30 / pesoAlunos;
    resumo.ticketMedioGeral = pesoTicketGeral / pesoAlunos;
  }

  const horasMap = {};
  unidades.forEach((relatorio) => {
    Object.entries(relatorio.picoHoras || {}).forEach(([hora, valor]) => {
      if (/^\d{1,2}$/.test(hora) && typeof valor !== "object") {
        horasMap[hora] = (horasMap[hora] || 0) + (Number(valor) || 0);
      }
    });
  });

  const horasLista = Object.entries(horasMap)
    .map(([hora, valor]) => [Number(hora), Number(valor) || 0])
    .sort((a, b) => a[0] - b[0]);

  let pico = { hora: 0, media: 0 };
  let vale = { hora: 0, media: horasLista.length ? horasLista[0][1] : 0 };

  horasLista.forEach(([hora, valor]) => {
    if (valor >= pico.media) pico = { hora, media: valor };
    if (valor <= vale.media) vale = { hora, media: valor };
  });

  const pessoaMap = new Map();
  unidades.forEach((relatorio) => {
    toArray(relatorio.topPessoas).forEach((pessoa) => {
      const key = String(pessoa.codigo || pessoa.id || pessoa.nome || "");
      if (!key) return;

      const atual = pessoaMap.get(key);
      if (atual) {
        atual.total += Number(pessoa.total) || 0;
        return;
      }

      pessoaMap.set(key, {
        ...pessoa,
        total: Number(pessoa.total) || 0
      });
    });
  });

  const topPessoas = [...pessoaMap.values()]
    .sort((a, b) => b.total - a.total)
    .slice(0, 30);
  const totalPessoas = topPessoas.reduce((acc, pessoa) => acc + (Number(pessoa.total) || 0), 0);
  topPessoas.forEach((pessoa) => {
    pessoa.percentual = totalPessoas > 0 ? (pessoa.total / totalPessoas) * 100 : 0;
  });

  const planoMap = new Map();
  unidades.forEach((relatorio) => {
    toArray(relatorio.topPlanosGlobal).forEach((plano) => {
      const key = String(plano.valor ?? plano.label ?? plano.qtd ?? "");
      if (!key) return;

      const atual = planoMap.get(key);
      if (atual) {
        atual.qtd += Number(plano.qtd) || 0;
        atual.percentual += Number(plano.percentual) || 0;
        return;
      }

      planoMap.set(key, {
        valor: Number(plano.valor) || 0,
        qtd: Number(plano.qtd) || 0,
        percentual: Number(plano.percentual) || 0
      });
    });
  });

  const topPlanosGlobal = [...planoMap.values()]
    .sort((a, b) => b.percentual - a.percentual || b.qtd - a.qtd)
    .slice(0, 15);

  let meta = {};
  let latestTs = 0;
  unidades.forEach((relatorio) => {
    const item = relatorio.meta || {};
    const ts = new Date(item.geradoEm || item.lastUpdate || 0).getTime();
    if (ts >= latestTs) {
      latestTs = ts;
      meta = item;
    }
  });

  return {
    resumo,
    mesAMes: agregarMapaMensal(unidades, "mesAMes"),
    diariasMensais: agregarMapaMensal(unidades, "diariasMensais"),
    diarias: {
      total: resumo.diariasTotal,
      count: resumo.diariasCount
    },
    picoHoras: {
      ...horasMap,
      pico,
      vale
    },
    topPessoas,
    topPlanosGlobal,
    frequencia: {
      mediaPorAluno30d: pesoFreq > 0 ? somaFreq / pesoFreq : 0
    },
    meta
  };
}

function atualizarBadgeOperacional(resumo = {}) {
  const badge = qs("operacionalBadge");
  if (!badge) return;

  const atrasados = Number(resumo.atrasados) || 0;
  const alunos = Number(resumo.alunos) || 0;

  badge.classList.remove("ok", "warn", "bad");

  if (alunos <= 0) {
    badge.textContent = "Sem dados";
    return;
  }

  if (atrasados === 0) {
    badge.textContent = "Tudo OK";
    badge.classList.add("ok");
    return;
  }

  badge.textContent = `${atrasados} em atraso`;
  badge.classList.add(atrasados / alunos > 0.15 ? "bad" : "warn");
}

function atualizarRotulosContexto(unitId = unidadeSelecionada) {
  const label = labelUnidade(unitId);
  const sufixo = ` · ${label}`;

  setText("inicioSubtitle", `Resumo operacional${sufixo}`);
  setText("labelTotalAlunos", `Alunos cadastrados${sufixo}`);
  setText("helpTotalAlunos", `Base ativa${sufixo}`);
  setText("subPainelAlunos", `Distribuição entre em dia e em atraso${sufixo}`);
  setText("heroLabelContext", `Receita acumulada${sufixo}`);
  setText("heroHelpContext", `Histórico completo${sufixo}`);
  setText("helpTotal30", `Janela recente${sufixo}`);
  setText("helpTotal3m", `Tendência de curto prazo${sufixo}`);
  setText("helpTicket30", `Média por aluno · 30 dias${sufixo}`);
  setText("helpTicketGeral", `Média histórica${sufixo}`);
  setText("helpDiarias", label);
  setText("subListaValores", `Participação dos maiores valores${sufixo}`);
  setText("subRankingPessoas", `Ranking limitado${sufixo}`);
  setText("contextHistorico", `Faturamento mês a mês${sufixo}`);
  setText("contextOperacao", `Fluxo por horário${sufixo}`);
}

function limparDashboard(message = "Sem dados carregados.") {
  setText("totalGeralHero", formatBRL(0));
  setText("totalGeral", formatBRL(0));
  setText("totalDiarias", formatBRL(0));
  setText("diariasCount", "0");
  setText("total30", formatBRL(0));
  setText("total3m", formatBRL(0));
  setText("ticket30", formatBRL(0));
  setText("ticketGeral", formatBRL(0));
  setText("frequencia30", "0,00");
  setText("totalAlunos", "---");
  setText("totalAtivos", "---");
  setText("totalAtrasados", "---");
  setText("pctAtivos", "---");
  setText("pctAtrasados", "---");
  setText("pctAtivosFinanceiro", "---");
  setText("pctAtrasadosFinanceiro", "---");
  setText("horaPico", "--:00");
  setText("mediaPico", "--");
  setText("horaVale", "--:00");
  setText("mediaVale", "--");
  setText("janelaDias", "-- dias");
  setText("versaoRelatorio", "v--");
  setText("ultimaSync", "---");
  setText("statusCache", message);
  setText("unidadeAtiva", "---");
  atualizarBadgeOperacional({});

  const chart = qs("graficoMensal");
  if (chart) chart.innerHTML = `<div class="mini-note">${message}</div>`;

  const diariasChart = qs("graficoDiarias");
  if (diariasChart) diariasChart.innerHTML = `<div class="mini-note">${message}</div>`;

  const ranking = qs("rankingPessoas");
  if (ranking) ranking.innerHTML = `<div class="mini-note">${escapeHTML(message)}</div>`;

  updateSyncDot(message);

  const valores = qs("listaValores");
  if (valores) {
    valores.innerHTML = `<div class="list-item"><strong>Sem dados</strong><span>${message}</span></div>`;
  }

  const horas = qs("graficoHoras");
  if (horas) horas.innerHTML = `<div class="mini-note">${message}</div>`;

  const unitsGrid = qs("unitsGrid");
  if (unitsGrid) {
    unitsGrid.innerHTML = `<div style="text-align: center; grid-column: 1/-1; color: var(--muted); padding: 2rem;">${escapeHTML(message)}</div>`;
  }

  const financeUnitsGrid = qs("financeUnitsGrid");
  if (financeUnitsGrid) {
    financeUnitsGrid.innerHTML = `<div style="text-align: center; grid-column: 1/-1; color: var(--muted); padding: 2rem;">${escapeHTML(message)}</div>`;
  }

  const alunosUnitsGrid = qs("alunosUnitsGrid");
  if (alunosUnitsGrid) {
    alunosUnitsGrid.innerHTML = `<div style="text-align: center; color: var(--muted); padding: 2rem;">${escapeHTML(message)}</div>`;
  }

  closeFinanceSubView(false, false);
}

function listarUnitIds() {
  return Object.keys(relatoriosPorUnidade).sort((a, b) => {
    return nomeUnidade(a).localeCompare(nomeUnidade(b), "pt-BR");
  });
}

function resolverUnidadeAtiva(preferredId = unidadeSelecionada) {
  const unitIds = listarUnitIds();
  if (!unitIds.length) return "";

  const hasMultiple = unitIds.length > 1;
  if (preferredId === "geral" && hasMultiple) return "geral";
  if (preferredId && relatoriosPorUnidade[preferredId]) return preferredId;
  return hasMultiple ? "geral" : unitIds[0];
}

function popularComboUnidades() {
  const unitIds = listarUnitIds();
  unidadeSelecionada = resolverUnidadeAtiva(unidadeSelecionada);

  const select = qs("unitSelect");
  if (!select) return;

  if (!unitIds.length) {
    select.innerHTML = '<option value="">Sem relatorios</option>';
    select.disabled = true;
    return;
  }

  select.disabled = false;

  const hasMultiple = unitIds.length > 1;
  const geralOption = hasMultiple
    ? `<option value="geral"${unidadeSelecionada === "geral" ? " selected" : ""}>Todas as unidades</option>`
    : "";

  select.innerHTML = geralOption + unitIds
    .map((unitId) => {
      const selected = unitId === unidadeSelecionada ? " selected" : "";
      return `<option value="${unitId}"${selected}>${nomeUnidade(unitId)}</option>`;
    })
    .join("");
}

function selecionarUnidade(unitId) {
  const resolved = resolverUnidadeAtiva(unitId);
  if (!resolved) return;

  unidadeSelecionada = resolved;
  localStorage.setItem(SELECTED_UNIT_KEY, resolved);

  const select = qs("unitSelect");
  if (select && select.value !== resolved) select.value = resolved;

  if (resolved === "geral") {
    aplicarTudo(agregarRelatorioGeral(), "geral");
    return;
  }

  aplicarTudo(relatoriosPorUnidade[resolved], resolved);
}

function aplicarRelatorios(data) {
  relatoriosPorUnidade = stripReportsHeavyFields(data);
  popularComboUnidades();

  if (!Object.keys(relatoriosPorUnidade).length) {
    limparDashboard("Nenhum relatorio encontrado");
    return;
  }

  selecionarUnidade(unidadeSelecionada);
}

// ==========================
// NEW LAYOUT RENDERING FUNCTIONS
// ==========================
function renderUnitsCards() {
  const grid = qs("unitsGrid");
  if (!grid) return;

  const unitIds = Object.keys(relatoriosPorUnidade).sort((a, b) =>
    nomeUnidade(a).localeCompare(nomeUnidade(b), "pt-BR")
  );
  const activeUnitIds = new Set(unitIds);
  [...studentVirtualState.keys()].forEach((unitId) => {
    if (!activeUnitIds.has(unitId)) studentVirtualState.delete(unitId);
  });

  if (!unitIds.length) {
    grid.innerHTML = '<div class="inicio-empty">Sem unidades disponíveis</div>';
    return;
  }

  grid.innerHTML = unitIds.map((unitId) => {
    const ativos = Number(relatoriosPorUnidade[unitId]?.resumo?.ativos) || 0;
    return `
      <div class="inicio-unit-row">
        <span class="inicio-live-dot" aria-hidden="true"></span>
        <span class="inicio-unit-name">${escapeHTML(nomeUnidade(unitId))}</span>
        <span class="inicio-unit-count">${ativos.toLocaleString("pt-BR")}</span>
      </div>
    `;
  }).join("");
}

function renderFinanceUnitsCards() {
  const grid = qs("financeUnitsGrid");
  if (!grid) return;

  const unitIds = Object.keys(relatoriosPorUnidade).sort((a, b) =>
    nomeUnidade(a).localeCompare(nomeUnidade(b), "pt-BR")
  );

  if (!unitIds.length) {
    grid.innerHTML = '<div style="text-align: center; grid-column: 1/-1; color: var(--muted); padding: 2rem;">Sem unidades disponíveis</div>';
    return;
  }

  let html = '';
  unitIds.forEach(unitId => {
    const data = relatoriosPorUnidade[unitId];
    const resumo = data.resumo || {};
    const totalAcumulado = Number(resumo.total) || 0;
    const totalDiarias = Number(resumo.diariasTotal) || 0;
    const ticketMedio = Number(resumo.ticketMedioGeral) || 0;
    const ticket30d = Number(resumo.ticketMedio30d) || 0;

    html += `
      <div class="unit-card">
        <div class="unit-card-header">${nomeUnidade(unitId)}</div>
        <div class="unit-card-info">
          <div class="unit-card-row">
            <span class="unit-label unit-label--acumulado"><span class="unit-dot" aria-hidden="true"></span>Total acumulado</span>
            <strong>${formatBRL(totalAcumulado)}</strong>
          </div>
          <div class="unit-card-row">
            <span class="unit-label unit-label--diarias"><span class="unit-dot" aria-hidden="true"></span>Total diárias</span>
            <strong>${formatBRL(totalDiarias)}</strong>
          </div>
          <div class="unit-card-row">
            <span class="unit-label unit-label--ticket"><span class="unit-dot" aria-hidden="true"></span>Ticket médio</span>
            <strong>${formatBRL(ticketMedio)}</strong>
          </div>
          <div class="unit-card-row">
            <span class="unit-label unit-label--ticket30d"><span class="unit-dot" aria-hidden="true"></span>Ticket 30d</span>
            <strong>${formatBRL(ticket30d)}</strong>
          </div>
          <div class="finance-unit-actions">
            <button type="button" class="finance-nav-btn" data-finance-view="dia" data-unit-id="${escapeHTML(unitId)}">
              <span>Ver hoje</span>
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 18 6-6-6-6" /></svg>
            </button>
            <button type="button" class="finance-nav-btn" data-finance-view="mes" data-unit-id="${escapeHTML(unitId)}">
              <span>Ver mês a mês</span>
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 18 6-6-6-6" /></svg>
            </button>
          </div>
        </div>
      </div>
    `;
  });

  grid.innerHTML = html;
}

const MONTH_SHORT = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

function formatMonthLabel(monthKey) {
  const match = String(monthKey).match(/^(\d{4})-(\d{2})$/);
  if (!match) return monthKey;
  return `${MONTH_SHORT[Number(match[2]) - 1]}/${match[1]}`;
}

const PLAN_TYPES = ["diario", "semanal", "quinzenal", "mensal", "trimestral"];
const PLAN_TYPE_LABELS = {
  diario: "diário",
  semanal: "semanal",
  quinzenal: "quinzenal",
  mensal: "mensal",
  trimestral: "trimestral"
};
function getFinanceTodayBreakdown(unitId) {
  const payments = getFinanceTodayPayments(unitId);
  if (payments.length) return groupFinanceTodayPayments(payments);

  return { lines: [], total: 0 };
}

function getTodayDateKey() {
  try {
    return new Date().toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" });
  } catch {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
}

async function carregarPagamentosHojeFirebase(unitId) {
  if (pagamentosHojePorUnidade[unitId]) return pagamentosHojePorUnidade[unitId];
  if (pagamentosHojeFetchPromises.has(unitId)) return pagamentosHojeFetchPromises.get(unitId);

  const promise = readFirebaseValue(
    `${PAGAMENTOS_BY_DATE_ROOT}/${unitId}/${getTodayDateKey()}`,
    `pagamentos-hoje-${unitId}`
  )
    .then((data) => {
      const pagamentos = toArray(data);
      pagamentosHojePorUnidade[unitId] = pagamentos;
      return pagamentos;
    })
    .catch((error) => {
      console.warn("Pagamentos do dia indisponiveis:", error.code || error.message, error.message);
      pagamentosHojePorUnidade[unitId] = [];
      return [];
    })
    .finally(() => {
      pagamentosHojeFetchPromises.delete(unitId);
    });

  pagamentosHojeFetchPromises.set(unitId, promise);
  return promise;
}

function getFinanceTodayPayments(unitId) {
  const fromLazyFirebase = pagamentosHojePorUnidade[unitId];
  if (fromLazyFirebase?.length) return fromLazyFirebase;

  return [];
}

function getPaymentPlanType(payment) {
  return String(payment?.plano || payment?.tipoPlano || payment?.type || "outros")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function getPaymentPlanLabel(type) {
  return PLAN_TYPE_LABELS[type] || type.replace(/[_-]+/g, " ");
}

function getPaymentAmount(payment) {
  return Number(payment?.valor ?? payment?.amount ?? payment?.total ?? 0) || 0;
}

function formatPaymentTime(payment) {
  const direct = payment?.hora || payment?.time;
  if (direct) return String(direct).slice(0, 5);

  const timestamp = payment?.pagoEm || payment?.paidAt || payment?.createdAt;
  if (!timestamp) return "--:--";

  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return "--:--";

  return date.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit"
  });
}

function getPaymentStudentName(payment) {
  return payment?.alunoNome || payment?.nomeAluno || payment?.studentName || "Aluno sem nome";
}

function getPaymentMethod(payment) {
  return payment?.formaPagamento || payment?.metodo || payment?.paymentMethod || "forma nao informada";
}

function groupFinanceTodayPayments(payments) {
  const groups = new Map();

  payments.forEach((payment) => {
    const type = getPaymentPlanType(payment);
    if (!groups.has(type)) {
      groups.set(type, {
        type,
        qtd: 0,
        total: 0,
        payments: []
      });
    }

    const group = groups.get(type);
    group.qtd += 1;
    group.total += getPaymentAmount(payment);
    group.payments.push(payment);
  });

  const lines = [...groups.values()]
    .map((group) => ({
      ...group,
      label: `${group.qtd}x ${getPaymentPlanLabel(group.type)}`
    }))
    .sort((a, b) => {
      const orderA = PLAN_TYPES.indexOf(a.type);
      const orderB = PLAN_TYPES.indexOf(b.type);
      return (orderA === -1 ? 99 : orderA) - (orderB === -1 ? 99 : orderB);
    });

  const total = lines.reduce((sum, line) => sum + line.total, 0);
  return { lines, total };
}

function getFinanceMonthlyEntries(unitId) {
  const data = relatoriosPorUnidade[unitId] || {};
  const entries = mergeMesEntries(data.mesAMes || {});
  entries.sort((a, b) => a[0].localeCompare(b[0]));
  return entries.slice(-18);
}

function renderFinanceSubViewList(entries, labelFormatter) {
  if (!entries.length) {
    return '<div class="mini-note">Sem dados para exibir.</div>';
  }

  return [...entries].reverse().map(([label, value]) => `
    <div class="finance-data-row">
      <span>${escapeHTML(labelFormatter(label))}</span>
      <strong>${formatBRL(value)}</strong>
    </div>
  `).join("");
}

function renderFinanceTodayList(breakdown) {
  if (!breakdown.lines.length) {
    return '<div class="mini-note">Sem dados para exibir.</div>';
  }

  const rows = breakdown.lines.map((line) => {
    const details = toArray(line.payments)
      .sort((a, b) => formatPaymentTime(a).localeCompare(formatPaymentTime(b)))
      .map((payment) => `
        <div class="finance-payment-row">
          <time>${escapeHTML(formatPaymentTime(payment))}</time>
          <span>${escapeHTML(getPaymentStudentName(payment))}</span>
          <strong>${escapeHTML(getPaymentMethod(payment))}</strong>
        </div>
      `).join("");

    if (!details) {
      return `
        <div class="finance-data-row">
          <span>${escapeHTML(line.label)}</span>
          <strong>${formatBRL(line.total)}</strong>
        </div>
      `;
    }

    return `
      <details class="finance-data-group">
        <summary class="finance-data-row">
          <span>${escapeHTML(line.label)}</span>
          <strong>${formatBRL(line.total)}</strong>
        </summary>
        <div class="finance-payment-list">
          ${details}
        </div>
      </details>
    `;
  }).join("");

  return `${rows}
    <div class="finance-data-row is-total">
      <span>Total do dia</span>
      <strong>${formatBRL(breakdown.total)}</strong>
    </div>`;
}

function renderFinanceSubView() {
  if (!financeSubView) return;

  const { view, unitId } = financeSubView;
  const unitName = nomeUnidade(unitId);
  const isDaily = view === "dia";

  setText("financeSubKicker", unitName);
  setText("financeSubTitle", isDaily ? "Hoje" : "Mês a mês");

  const list = qs("financeSubList");
  if (!list) return;

  if (isDaily) {
    if (!pagamentosHojePorUnidade[unitId] && !pagamentosHojeFetchPromises.has(unitId)) {
      list.innerHTML = '<div class="mini-note">Carregando pagamentos...</div>';
      carregarPagamentosHojeFirebase(unitId).then(() => {
        if (financeSubView?.view === "dia" && financeSubView?.unitId === unitId) {
          renderFinanceSubView();
        }
      });
      return;
    }

    list.innerHTML = renderFinanceTodayList(getFinanceTodayBreakdown(unitId));
    return;
  }

  list.innerHTML = renderFinanceSubViewList(
    getFinanceMonthlyEntries(unitId),
    formatMonthLabel
  );
}

function financeStackViewport() {
  return qs("financeStackViewport");
}

function financeStackTrack() {
  return qs("financeStackTrack");
}

function getFinanceSlideWidth() {
  const viewport = financeStackViewport();
  return viewport ? Math.round(viewport.getBoundingClientRect().width) : 0;
}

function syncFinanceStackMetrics() {
  const viewport = financeStackViewport();
  if (!viewport) return 0;

  const width = getFinanceSlideWidth();
  if (width > 0) {
    viewport.style.setProperty("--finance-slide-width", `${width}px`);
  }

  return width;
}

function setFinanceStackLayer(layer, animate = false) {
  const track = financeStackTrack();
  const listLayer = qs("financeStackList");
  const subView = qs("financeSubView");
  const showSubView = layer === "subview";

  const width = syncFinanceStackMetrics();
  if (!track || !width) return;

  const offset = showSubView ? width : 0;
  const useMotion = animate && !prefersReducedMotion();

  if (useMotion) {
    track.style.transition = `transform ${PAGE_SLIDE_MS}ms ${PAGE_SLIDE_EASING}`;
  } else {
    track.style.transition = "none";
  }

  track.style.transform = `translate3d(-${offset}px, 0, 0)`;

  if (!useMotion) {
    track.offsetHeight;
    track.style.removeProperty("transition");
  }

  if (listLayer) {
    listLayer.classList.toggle("active", !showSubView);
    listLayer.setAttribute("aria-hidden", showSubView ? "true" : "false");
  }

  if (subView) {
    subView.classList.toggle("active", showSubView);
    subView.setAttribute("aria-hidden", showSubView ? "false" : "true");
  }
}

function openFinanceSubView(view, unitId, pushHistory = true, animate = true) {
  if (!relatoriosPorUnidade[unitId]) return;

  const enteringFromList = !financeSubView;
  financeSubView = { view, unitId };
  renderFinanceSubView();
  setFinanceStackLayer("subview", animate && enteringFromList);

  if (pushHistory) {
    history.pushState(
      { financeSubView: { view, unitId } },
      "",
      `#financeiro/${view}/${encodeURIComponent(unitId)}`
    );
  }

  scrollActivePageToTop();
}

function closeFinanceSubView(updateHash = true, animate = true) {
  const leavingSubView = Boolean(financeSubView);
  financeSubView = null;
  setFinanceStackLayer("list", animate && leavingSubView);

  if (updateHash && getActivePageTab() === "financeiro") {
    history.replaceState(null, "", "#financeiro");
  }
}

function parseFinanceHash() {
  const parts = location.hash.replace("#", "").split("/").filter(Boolean);
  if (parts[0] !== "financeiro" || parts.length < 3) return null;

  const view = parts[1];
  if (view !== "dia" && view !== "mes") return null;

  return { view, unitId: decodeURIComponent(parts.slice(2).join("/")) };
}

function setupScrollChaining() {
  document.addEventListener("wheel", (event) => {
    const horizontalScroll = event.target.closest(".students-scroll");
    if (!horizontalScroll) return;
    if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;

    scrollActivePageBy(event.deltaY);
  }, { passive: true });
}

function setupFinanceStackSwipe() {
  const viewport = financeStackViewport();
  const track = financeStackTrack();
  if (!viewport || !track) return;

  let gesture = null;
  let docBound = false;

  const unbindDoc = () => {
    if (!docBound) return;
    document.removeEventListener("pointermove", onMove, true);
    document.removeEventListener("pointerup", onFinish, true);
    document.removeEventListener("pointercancel", onFinish, true);
    docBound = false;
  };

  const reset = () => {
    gesture = null;
    viewport.classList.remove("is-swiping");
  };

  const onMove = (event) => {
    if (!gesture || event.pointerId !== gesture.pointerId) return;

    const dx = event.clientX - gesture.startX;
    const dy = event.clientY - gesture.startY;
    gesture.lastX = event.clientX;
    gesture.lastTime = event.timeStamp;

    if (gesture.mode === "pending") {
      if (Math.abs(dx) < SWIPE_AXIS_LOCK_PX && Math.abs(dy) < SWIPE_AXIS_LOCK_PX) return;

      // Só volta com gesto horizontal dominante para a direita.
      if (Math.abs(dy) > Math.abs(dx) * 1.15 || dx <= 0) {
        unbindDoc();
        reset();
        return;
      }

      if (!financeSubView) {
        unbindDoc();
        reset();
        return;
      }

      gesture.mode = "horizontal";
      viewport.classList.add("is-swiping");
    }

    if (gesture.mode !== "horizontal") return;

    event.preventDefault();

    // Arrasta a subview de volta em direção à lista (offset entre width e 0).
    const pulled = Math.max(0, Math.min(gesture.width, dx));
    const offset = gesture.width - pulled;
    track.style.transition = "none";
    track.style.transform = `translate3d(-${offset}px, 0, 0)`;
  };

  const onFinish = (event) => {
    if (!gesture || event.pointerId !== gesture.pointerId) return;

    unbindDoc();
    viewport.classList.remove("is-swiping");

    if (gesture.mode !== "horizontal") {
      reset();
      return;
    }

    const dx = event.clientX - gesture.startX;
    const duration = Math.max(event.timeStamp - gesture.startTime, 1);
    const velocity = dx / duration;
    const passedDistance = dx >= SWIPE_COMMIT_PX;
    const passedFlick = velocity >= SWIPE_VELOCITY_COMMIT && dx >= SWIPE_FLICK_MIN_PX;
    const shouldClose = passedDistance || passedFlick;

    reset();

    if (shouldClose) {
      if (history.state?.financeSubView) {
        history.back();
        return;
      }
      closeFinanceSubView(true, true);
      return;
    }

    // Não fechou: volta a subview para a posição aberta.
    setFinanceStackLayer("subview", true);
  };

  viewport.addEventListener(
    "pointerdown",
    (event) => {
      if (event.pointerType === "mouse" && event.button !== 0) return;
      if (!financeSubView) return;
      if (event.target.closest("input, textarea, select, [contenteditable='true']")) return;
      if (event.target.closest("button, a")) return;

      const width = syncFinanceStackMetrics();
      if (!width) return;

      gesture = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        startTime: event.timeStamp,
        lastX: event.clientX,
        lastTime: event.timeStamp,
        width,
        mode: "pending"
      };

      if (!docBound) {
        document.addEventListener("pointermove", onMove, { capture: true, passive: false });
        document.addEventListener("pointerup", onFinish, true);
        document.addEventListener("pointercancel", onFinish, true);
        docBound = true;
      }
    },
    { passive: true }
  );
}

function setupFinanceSubView() {
  setFinanceStackLayer("list", false);
  setupFinanceStackSwipe();

  qs("financeSubBack")?.addEventListener("click", () => {
    if (history.state?.financeSubView) {
      history.back();
      return;
    }
    closeFinanceSubView(true, true);
  });

  qs("financeUnitsGrid")?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-finance-view]");
    if (!button) return;

    openFinanceSubView(button.dataset.financeView, button.dataset.unitId, true, true);
  });

  window.addEventListener("popstate", () => {
    if (!appAuthorized) return;

    const parsed = parseFinanceHash();
    if (parsed && relatoriosPorUnidade[parsed.unitId]) {
      const enteringFromList = !financeSubView;
      financeSubView = parsed;
      renderFinanceSubView();
      setFinanceStackLayer("subview", enteringFromList);
      return;
    }

    if (getActivePageTab() === "financeiro") {
      closeFinanceSubView(false, true);
    }
  });
}

const NO_PHOTO_SVG = `<svg viewBox="0 0 24 32" aria-hidden="true"><rect x="1" y="1" width="22" height="30" rx="3" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.12)"/><circle cx="12" cy="11" r="4.5" fill="rgba(255,255,255,0.08)"/><path d="M5 27c1.8-4.2 4.4-6.5 7-6.5s5.2 2.3 7 6.5" fill="rgba(255,255,255,0.06)"/></svg>`;

function formatDateBR(value) {
  if (!value) return "---";
  const raw = String(value).trim();
  const isoMatch = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) return `${isoMatch[3]}/${isoMatch[2]}/${isoMatch[1]}`;

  const brMatch = raw.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (brMatch) return raw;

  return raw;
}

function perfilLabel(perfil) {
  return perfil === "colaborador" ? "Colaborador" : "Aluno";
}

function studentPhotoId(student) {
  const unitId = String(student?.physikUnitId || canonicalPhysikUnitId(student?.unidadeId || student?.unitId)).trim();
  const cartao = String(student?.cartao || "").trim();
  return unitId && cartao ? `${unitId}/${cartao}.jpg` : "";
}

function renderEmptyStudentPhoto(photoId = "") {
  const attr = photoId ? ` data-photo-id="${escapeHTML(photoId)}"` : "";
  return `<div class="student-photo student-photo--empty"${attr}>${NO_PHOTO_SVG}</div>`;
}

function renderStudentPhoto(student) {
  if (student.foto) {
    return `<img class="student-photo" src="${escapeHTML(student.foto)}" alt="" loading="lazy" referrerpolicy="no-referrer" />`;
  }

  return renderEmptyStudentPhoto(studentPhotoId(student));
}

function renderStudentCard(student) {
  const perfil = student.perfil === "colaborador" ? "colaborador" : "aluno";

  return `
    <article class="student-card">
      ${renderStudentPhoto(student)}
      <div class="student-card-body">
        <strong class="student-name">${escapeHTML(student.nome)}</strong>
        <span class="student-meta"><span>Cartão</span><b>${escapeHTML(student.cartao)}</b></span>
        <span class="student-meta"><span>Perfil</span><b class="student-profile student-profile--${perfil}">${perfilLabel(perfil)}</b></span>
        <span class="student-meta"><span>Vencimento</span><b>${formatDateBR(student.vencimento)}</b></span>
      </div>
    </article>
  `;
}

function filterStudentsInUnit(unitBlock, query) {
  const state = getStudentsUnitState(unitBlock);
  const scroll = unitBlock.querySelector(".students-scroll");
  if (!state || !scroll) return;

  const normalized = normalizeStudentSearch(query);
  state.query = normalized;
  state.filtered = normalized
    ? state.students.filter((student) => student._search.includes(normalized))
    : state.students;
  state.lastStart = -1;
  state.lastEnd = -1;
  state.lastQuery = "";
  scroll.scrollLeft = 0;
  renderVirtualStudents(unitBlock);
}

function normalizeStudentSearch(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function prepareStudentRecord(student, unitId = "") {
  const cartao = String(student?.cartao || student?.id || "").trim();
  const perfil = student.perfil === "colaborador" ? "colaborador" : "aluno";
  return {
    ...student,
    id: String(student?.id || cartao),
    cartao,
    perfil,
    unidadeId: String(student?.unidadeId || student?.unitId || unitId || "").trim(),
    _search: normalizeStudentSearch(`${student.nome} ${cartao} ${perfilLabel(perfil)} ${student.codigo || ""}`)
  };
}

function getStudentsUnitState(unitBlock) {
  const unitId = unitBlock?.dataset.unitBlock;
  return unitId ? studentVirtualState.get(unitId) : null;
}

function getStudentVirtualWindow(scroller, total) {
  const itemSize = STUDENT_CARD_WIDTH + STUDENT_CARD_GAP;
  const viewportWidth = Math.max(scroller.clientWidth || 0, STUDENT_CARD_WIDTH);
  const visibleCount = Math.max(1, Math.ceil(viewportWidth / itemSize));
  const start = clamp(Math.floor(scroller.scrollLeft / itemSize) - STUDENT_VIRTUAL_BUFFER, 0, total);
  const end = clamp(start + visibleCount + (STUDENT_VIRTUAL_BUFFER * 2), start, total);

  return { start, end, itemSize };
}

function updateStudentsMeta(unitBlock, visible) {
  const count = unitBlock.querySelector("[data-students-count]");
  if (count) count.textContent = `${visible.toLocaleString("pt-BR")} aluno${visible === 1 ? "" : "s"}`;
}

function replaceWithStudentPhotoFallback(node) {
  const fallback = document.createElement("div");
  fallback.className = "student-photo student-photo--empty";
  fallback.innerHTML = NO_PHOTO_SVG;
  node.replaceWith(fallback);
}

function bindStudentImageFallbacks(scope) {
  scope.querySelectorAll("img.student-photo").forEach((img) => {
    img.addEventListener("error", () => {
      replaceWithStudentPhotoFallback(img);
    }, { once: true });
  });
}

function hydrateStudentPhotos(scope) {
  scope.querySelectorAll("[data-photo-id]").forEach((placeholder) => {
    if (placeholder.dataset.photoLoading === "true") return;
    const photoId = placeholder.dataset.photoId;
    if (!photoId) return;

    placeholder.dataset.photoLoading = "true";
    obterSignedPhotoUrl(photoId).then((url) => {
      if (!url || !placeholder.isConnected) return;

      const img = document.createElement("img");
      img.className = "student-photo";
      img.alt = "";
      img.loading = "lazy";
      img.referrerPolicy = "no-referrer";
      img.src = url;
      img.addEventListener("error", () => {
        replaceWithStudentPhotoFallback(img);
      }, { once: true });
      placeholder.replaceWith(img);
    }).catch(() => {
      // Foto remota indisponivel nao deve quebrar a lista.
    });
  });
}

function renderVirtualStudents(unitBlock) {
  const state = getStudentsUnitState(unitBlock);
  const scroller = unitBlock?.querySelector(".students-scroll");
  const grid = unitBlock?.querySelector(".students-grid");
  const before = unitBlock?.querySelector("[data-virtual-spacer='before']");
  const after = unitBlock?.querySelector("[data-virtual-spacer='after']");
  const empty = unitBlock?.querySelector(".students-empty");
  if (!state || !scroller || !grid || !before || !after || !empty) return;

  const total = state.filtered.length;
  updateStudentsMeta(unitBlock, total);
  scroller.hidden = total === 0;
  empty.hidden = total > 0;

  if (!total) {
    before.style.width = "0px";
    after.style.width = "0px";
    grid.innerHTML = "";
    state.lastStart = 0;
    state.lastEnd = 0;
    return;
  }

  const { start, end, itemSize } = getStudentVirtualWindow(scroller, total);
  if (start === state.lastStart && end === state.lastEnd && state.lastQuery === state.query) return;

  state.lastStart = start;
  state.lastEnd = end;
  state.lastQuery = state.query;

  before.style.width = `${start * itemSize}px`;
  after.style.width = `${Math.max(0, (total - end) * itemSize)}px`;
  grid.innerHTML = state.filtered.slice(start, end).map(renderStudentCard).join("");
  bindStudentImageFallbacks(grid);
  hydrateStudentPhotos(grid);
}

function normalizarAlunosPhysikServer(data, unitId, physikUnitId) {
  if (!data || typeof data !== "object") return [];

  return Object.entries(data)
    .filter(([cartao, aluno]) => cartao && aluno && typeof aluno === "object")
    .map(([cartao, aluno]) => ({
      ...aluno,
      id: String(aluno.id || cartao),
      cartao: String(cartao).trim(),
      unidadeId: String(unitId || "").trim(),
      physikUnitId: String(physikUnitId || unitId || "").trim(),
      foto: ""
    }))
    .filter((aluno) => aluno.cartao);
}

async function carregarAlunosPhysikServer(unitId) {
  if (alunosPorUnidade[unitId]) return alunosPorUnidade[unitId];
  if (alunosFetchPromises.has(unitId)) return alunosFetchPromises.get(unitId);

  setAlunosDebug(unitId, [
    `unit=${unitId}`,
    "status=carregando"
  ]);

  const promise = carregarPhysikServerConfig()
    .then(async (config) => {
      const bearerToken = physikServerReadToken(config);
      const debug = [
        `unit=${unitId}`,
        `base=${config?.baseUrl || "ausente"}`,
        `status=${config?.status || "ausente"}`,
        `token=${tokenDebug(bearerToken)}`,
        `ids=${physikUnitIdCandidates(unitId).join(",") || "nenhum"}`,
        physikServerConfigError ? `configErro=${physikServerConfigError}` : ""
      ];

      if (!config || config.status !== "online" || !bearerToken) {
        setAlunosDebug(unitId, [...debug, "erro=config/token"]);
        return [];
      }

      const ttl = Math.max(60, Math.min(Number(config.linkTtlSeconds) || 86400, 86400));
      for (const physikUnitId of physikUnitIdCandidates(unitId)) {
        const objectId = `${physikUnitId}/alunos.json`;
        const linkUrl = physikServerObjectUrl(config, "alunos", objectId, ttl);
        debug.push(`try=${objectId}`);

        try {
          const link = await fetchJsonWithTimeout(linkUrl, {
            headers: {
              Authorization: `Bearer ${bearerToken}`
            }
          }, FIREBASE_REST_TIMEOUT_MS);

          const signedUrl = resolvePhysikServerUrl(config, link?.urlPath);
          if (!signedUrl) {
            debug.push("link=sem-urlPath");
            continue;
          }
          debug.push("link=ok");

          const data = await fetchJsonWithTimeout(signedUrl, {}, FIREBASE_REST_TIMEOUT_MS);
          const alunos = normalizarAlunosPhysikServer(data, unitId, physikUnitId);
          alunosPorUnidade[unitId] = alunos;
          setAlunosDebug(unitId, [
            ...debug,
            `json=ok`,
            `alunos=${alunos.length}`
          ]);
          return alunos;
        } catch (error) {
          debug.push(`http=${error?.status || error?.code || error?.message || "erro"}`);
          if (error?.status !== 404) {
            setAlunosDebug(unitId, debug);
            throw error;
          }
        }
      }

      alunosPorUnidade[unitId] = [];
      setAlunosDebug(unitId, [...debug, "erro=nao-encontrado"]);
      return [];
    })
    .catch((error) => {
      console.warn("Alunos via PhysikServer indisponiveis:", error.status || error.code || error.message, error.message);
      alunosPorUnidade[unitId] = [];
      setAlunosDebug(unitId, [
        `unit=${unitId}`,
        `erro=${error.status || error.code || error.message || "falha"}`
      ]);
      return [];
    })
    .finally(() => {
      alunosFetchPromises.delete(unitId);
    });

  alunosFetchPromises.set(unitId, promise);
  return promise;
}

function alunosDaUnidade(unitId, data) {
  if (alunosPorUnidade[unitId]?.length) return alunosPorUnidade[unitId];

  return [];
}

async function renderAlunosUnitsCards(loadRemote = false) {
  const container = qs("alunosUnitsGrid");
  if (!container) return;

  const unitIds = Object.keys(relatoriosPorUnidade).sort((a, b) =>
    nomeUnidade(a).localeCompare(nomeUnidade(b), "pt-BR")
  );

  if (!unitIds.length) {
    container.innerHTML = '<div style="text-align: center; color: var(--muted); padding: 2rem;">Sem unidades disponíveis</div>';
    return;
  }

  if (loadRemote) {
    container.innerHTML = '<div style="text-align: center; color: var(--muted); padding: 2rem;">Carregando alunos...</div>';
    await Promise.all(unitIds.map((unitId) => carregarAlunosPhysikServer(unitId)));
  } else if (!unitIds.some((unitId) => alunosPorUnidade[unitId]?.length)) {
    container.innerHTML = '<div style="text-align: center; color: var(--muted); padding: 2rem;">Abra a aba para carregar os alunos.</div>';
    return;
  }

  let html = "";
  unitIds.forEach((unitId) => {
    const data = relatoriosPorUnidade[unitId];
    const alunos = alunosDaUnidade(unitId, data).map((student) => prepareStudentRecord(student, unitId));
    const debug = alunosDebugPorUnidade[unitId] || `unit=${unitId}\nstatus=sem tentativa`;
    studentVirtualState.set(unitId, {
      students: alunos,
      filtered: alunos,
      query: "",
      lastStart: -1,
      lastEnd: -1,
      lastQuery: ""
    });

    html += `
      <section class="students-unit-block" data-unit-block="${escapeHTML(unitId)}">
        <div class="students-unit-header">
          <div class="students-unit-title-wrap">
            <h3 class="students-unit-title">${escapeHTML(nomeUnidade(unitId))}</h3>
            <span class="students-count" data-students-count>${alunos.length.toLocaleString("pt-BR")} aluno${alunos.length === 1 ? "" : "s"}</span>
          </div>
          <label class="students-search-wrap">
            <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
            <input
              type="search"
              class="students-search"
              placeholder="Buscar por nome, cartão ou perfil"
              autocomplete="off"
              spellcheck="false"
            />
          </label>
        </div>
        <div class="students-scroll"${alunos.length ? "" : " hidden"}>
          <div class="students-virtual-track">
            <div class="students-virtual-spacer" data-virtual-spacer="before" aria-hidden="true"></div>
            <div class="students-grid"></div>
            <div class="students-virtual-spacer" data-virtual-spacer="after" aria-hidden="true"></div>
          </div>
        </div>
        <p class="students-empty"${alunos.length ? " hidden" : ""}>Nenhum aluno encontrado.</p>
        <pre class="students-debug">${escapeHTML(debug)}</pre>
      </section>
    `;
  });

  container.innerHTML = html;
  container.querySelectorAll(".students-unit-block").forEach(renderVirtualStudents);
  observeStudentScrollers(container);
}

function setupStudentsSearch() {
  const container = qs("alunosUnitsGrid");
  if (!container || container.dataset.searchBound === "true") return;

  container.dataset.searchBound = "true";
  container.addEventListener("input", (event) => {
    const input = event.target.closest(".students-search");
    if (!input) return;

    const unitBlock = input.closest(".students-unit-block");
    if (!unitBlock) return;

    clearTimeout(unitBlock._studentsSearchTimer);
    unitBlock._studentsSearchTimer = setTimeout(() => {
      filterStudentsInUnit(unitBlock, input.value);
    }, STUDENT_SEARCH_DEBOUNCE_MS);
  });

  container.addEventListener("focusin", (event) => {
    const input = event.target.closest(".students-search");
    if (!input) return;

    const unitBlock = input.closest(".students-unit-block");
    if (!unitBlock) return;

    window.setTimeout(() => {
      unitBlock.scrollIntoView({ block: "start", behavior: prefersReducedMotion() ? "auto" : "smooth" });
      getActiveAppPage()?.scrollBy({ top: -8, behavior: "auto" });
    }, 260);
  });

  container.addEventListener("scroll", (event) => {
    const scroller = event.target.closest?.(".students-scroll");
    if (!scroller) return;

    const unitBlock = scroller.closest(".students-unit-block");
    if (!unitBlock) return;

    window.requestAnimationFrame(() => renderVirtualStudents(unitBlock));
  }, true);

  container.addEventListener("wheel", (event) => {
    const scroller = event.target.closest(".students-scroll");
    if (!scroller) return;

    if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
    scrollActivePageBy(event.deltaY);
    event.preventDefault();
    event.stopPropagation();
  }, { passive: false });

  if ("ResizeObserver" in window) {
    container._studentsResizeObserver = new ResizeObserver((entries) => {
      entries.forEach((entry) => {
        const unitBlock = entry.target.closest(".students-unit-block");
        if (unitBlock) renderVirtualStudents(unitBlock);
      });
    });
    observeStudentScrollers(container);
  }
}

function observeStudentScrollers(container) {
  const observer = container?._studentsResizeObserver;
  if (!observer) return;

  observer.disconnect();
  container.querySelectorAll(".students-scroll").forEach((scroller) => observer.observe(scroller));
}

function updateKPIs(data) {
  const resumo = data.resumo || {};
  const ativos = Number(resumo.ativos) || 0;
  const alunos = Number(resumo.alunos) || 0;
  const atrasados = Number(resumo.atrasados) || 0;
  const frequencia = Number((data.frequencia || {}).mediaPorAluno30d) || 0;

  setText("kpiAtivos", ativos);
  setText("kpiAcessos", Math.round(frequencia * ativos) || "---");

  // TODO: Calcular "Novos" do período
  const mesAMes = data.mesAMes || {};
  const meses = Object.keys(mesAMes).sort().slice(-2);
  setText("kpiNovos", meses.length > 0 ? "---" : "---");

  const risco = alunos > 0 ? Math.round((atrasados / alunos) * 100) : 0;
  setText("kpiRisco", risco + "%");
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
function withTimeout(promise, ms, label = "timeout") {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error(label)), ms);
    })
  ]);
}

function databaseRestUrl(path) {
  const cleanPath = String(path || "")
    .split("/")
    .filter(Boolean)
    .map(encodeURIComponent)
    .join("/");

  return `${firebaseConfig.databaseURL.replace(/\/+$/, "")}/${cleanPath}.json`;
}

async function fetchJsonWithTimeout(url, options = {}, ms = FIREBASE_REST_TIMEOUT_MS) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), ms);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      cache: "no-store"
    });

    if (!response.ok) {
      const error = new Error(`HTTP ${response.status}`);
      error.status = response.status;
      throw error;
    }

    return response.json();
  } finally {
    clearTimeout(timeoutId);
  }
}

async function readFirebaseRestValue(path, label = path) {
  const user = auth.currentUser;
  if (!user) throw new Error("auth-missing");

  const token = await user.getIdToken();
  const url = `${databaseRestUrl(path)}?auth=${encodeURIComponent(token)}`;

  return fetchJsonWithTimeout(url, {}, FIREBASE_REST_TIMEOUT_MS)
    .catch((error) => {
      console.error("Leitura REST falhou:", label, error.status || error.code || error.message, error.message);
      throw error;
    });
}

function isAuthorizedUserValue(value) {
  return value === true;
}

async function checkAuthorization() {
  const user = auth.currentUser;
  if (!user) {
    return { authorized: false, unavailable: false };
  }

  const path = "authorized_users/" + user.uid;

  try {
    const authorizedRef = db.ref(path);
    const snapshot = await withTimeout(
      authorizedRef.once("value"),
      FIREBASE_READ_TIMEOUT_MS,
      "authorization-timeout"
    );
    const value = snapshot.val();
    const authorized = isAuthorizedUserValue(value);
    if (!authorized) {
      console.warn("Usuario sem autorizacao efetiva:", {
        uid: user.uid,
        email: user.email,
        expected: true,
        actual: value
      });
    }
    return { authorized, unavailable: false };
  } catch (sdkError) {
    console.warn("Authorization SDK check failed; trying REST:", sdkError.code || sdkError.message, sdkError.message);

    try {
      const value = await readFirebaseRestValue(path, "authorization-rest");
      const authorized = isAuthorizedUserValue(value);
      if (!authorized) {
        console.warn("Usuario sem autorizacao efetiva via REST:", {
          uid: user.uid,
          email: user.email,
          expected: true,
          actual: value
        });
      }
      return { authorized, unavailable: false };
    } catch (restError) {
      return {
        authorized: false,
        unavailable: true,
        error: restError
      };
    }
  }
}

// ==========================
// FETCH
// ==========================
async function buscarFirebase() {
  const authorization = await checkAuthorization();
  if (!authorization.authorized) {
    if (authorization.unavailable) {
      showAuthorizationUnavailableMessage(authorization.error);
    } else {
      showUnauthorizedMessage();
    }
    return;
  }

  try {
    // Lê via SDK autenticado (mesmo canal da autorização).
    // O fetch REST antigo podia ficar pendurado sem timeout.
    const data = await buscarRelatoriosEssenciais();
    if (!Object.keys(data).length) throw new Error("sem dados");

    salvarCache(data);
    aplicarRelatorios(data);
    setText("statusCache", "online");
    updateSyncDot("online");
  } catch (err) {
    const code = err.code || "";
    const message = err.message || String(err);
    console.warn("Usando cache por erro no Firebase:", code || message, message);

    const cache = carregarCache();
    if (cache) {
      aplicarRelatorios(cache);
      setText("statusCache", "cache local");
      updateSyncDot("cache local");
      return;
    }

    const denied = code === "PERMISSION_DENIED"
      || /permission|401|403|unauthorized|nao autorizado|não autorizado/i.test(message);

    if (denied) {
      limparDashboard("Permissao negada no Firebase");
      setText("ultimaSync", "Permissao negada");
      setText("statusCache", "Erro de permissao");
      return;
    }

    if (/timeout/i.test(message)) {
      limparDashboard("Firebase demorou demais. Tente de novo.");
      return;
    }

    limparDashboard("Erro ao carregar Firebase");
  }
}

function showUnauthorizedMessage() {
  appAuthorized = false;

  const select = qs("unitSelect");
  if (select) {
    select.innerHTML = '<option value="">Acesso restrito</option>';
    select.disabled = true;
  }

  limparDashboard("Acesso restrito");
  setText("ultimaSync", "Acesso restrito");
  setText("statusCache", "Nao autorizado");

  pendingLoginError = "Acesso restrito. Solicite autorização ao administrador.";
  showLogin({ error: pendingLoginError });

  // Encerra a sessão para liberar o botão de login (senão currentUser trava o botão).
  if (auth.currentUser) {
    auth.signOut().catch((error) => {
      console.error("Sign out after unauthorized:", error);
      updateLoginButton();
    });
  } else {
    updateLoginButton();
  }
}

function showAuthorizationUnavailableMessage(error) {
  appAuthorized = false;
  console.error("Authorization unavailable:", error?.status || error?.code || error?.message, error?.message);

  limparDashboard("Firebase indisponivel");
  setText("ultimaSync", "Falha ao validar acesso");
  setText("statusCache", "Erro ao validar acesso");

  pendingLoginError = "Nao foi possivel validar seu acesso no Firebase agora. Tente novamente em alguns instantes.";
  showLogin({ error: pendingLoginError });

  if (auth.currentUser) {
    auth.signOut().catch((signOutError) => {
      console.error("Sign out after authorization failure:", signOutError);
      updateLoginButton();
    });
  } else {
    updateLoginButton();
  }
}

// ==========================
// APLICACAO
// ==========================
function aplicarTudo(data, unitId = unidadeSelecionada) {
  aplicarResumo(data.resumo || {});
  aplicarFrequencia(data.frequencia || {});
  aplicarMensal(data.mesAMes || {});
  aplicarDiarias(data.diarias || {}, data.diariasMensais || {}, data.resumo || {});
  aplicarHoras(data.picoHoras || {});
  aplicarRanking(data.topPessoas || {});
  aplicarDistribuicao(data.topPlanosGlobal || {});
  atualizarSync(data.meta || {});
  setText("unidadeAtiva", labelUnidade(unitId));
  atualizarRotulosContexto(unitId);

  // NEW: Render cards for new layout
  renderUnitsCards();
  renderFinanceUnitsCards();
  renderAlunosUnitsCards();
  updateKPIs(data);
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
  const ticket30 = resumo.ticketMedio30d || 0;
  const ticketGeral = resumo.ticketMedioGeral || 0;
  const diariasTotal = resumo.diariasTotal || 0;
  const diariasCount = resumo.diariasCount || 0;

  setText("totalGeralHero", formatBRL(totalGeral));
  setText("totalGeral", formatBRL(totalGeral));
  setText("totalDiarias", formatBRL(diariasTotal));
  setText("diariasCount", diariasCount);
  setText("totalAtrasados", atrasados);
  setText("totalAlunos", alunos);
  setText("totalAtivos", ativos);
  setText("total30", formatBRL(total30d));
  setText("total3m", formatBRL(total3m));
  setText("ticket30", formatBRL(ticket30));
  setText("ticketGeral", formatBRL(ticketGeral));

  const pctAtivos = alunos > 0 ? Math.round((ativos / alunos) * 100) : 0;
  const pctAtrasados = alunos > 0 ? Math.round((atrasados / alunos) * 100) : 0;
  setText("pctAtivos", pctAtivos + "%");
  setText("pctAtrasados", pctAtrasados + "%");
  setText("pctAtivosFinanceiro", pctAtivos + "%");
  setText("pctAtrasadosFinanceiro", pctAtrasados + "%");

  const bars = document.querySelectorAll(".progress-line .bar i");
  if (bars[0]) bars[0].style.width = pctAtivos + "%";
  if (bars[1]) bars[1].style.width = pctAtrasados + "%";

  atualizarBadgeOperacional(resumo);
}

// ==========================
// FREQUENCIA
// ==========================
function aplicarFrequencia(frequencia) {
  setText("frequencia30", formatNumero(frequencia.mediaPorAluno30d, 2));
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
// DIARIAS
// ==========================
function aplicarDiarias(diariasResumo, diariasMensais, resumo = {}) {
  const container = qs("graficoDiarias");
  const total = Number(diariasResumo.total ?? resumo.diariasTotal ?? 0);
  const count = Number(diariasResumo.count ?? resumo.diariasCount ?? 0);

  setText("totalDiarias", formatBRL(total));
  setText("diariasCount", count.toLocaleString("pt-BR"));

  if (!container) return;

  container.innerHTML = "";

  const entries = Array.isArray(diariasMensais)
    ? diariasMensais.map((item) => [`${item.ano}-${String(item.mesNumero || item.mes).padStart(2, "0")}`, item])
    : Object.entries(diariasMensais || {});

  if (!entries.length) {
    container.innerHTML = '<div class="mini-note">Sem diarias sincronizadas.</div>';
    return;
  }

  entries.sort((a, b) => a[0].localeCompare(b[0]));

  const valores = entries.map(([, item]) => Number((item && item.valor) || 0));
  const max = Math.max(...valores, 1);

  for (const [mes, item] of entries) {
    const valor = Number((item && item.valor) || 0);
    const qtd = Number((item && item.qtd) || 0);
    const percent = (valor / max) * 100;
    const row = document.createElement("div");
    row.className = "chart-row";
    row.innerHTML = `
      <div class="chart-label">${escapeHTML(mes)}</div>
      <div class="chart-track">
        <div class="chart-fill diaria-fill" style="width:${percent}%"></div>
      </div>
      <div class="chart-label">${formatBRL(valor)}<small>${qtd}x</small></div>
    `;
    container.appendChild(row);
  }
}

// ==========================
// HORAS
// ==========================
function aplicarHoras(picoHoras) {
  const container = qs("graficoHoras");
  if (!container) return;

  const horas = Object.entries(picoHoras || {})
    .filter(([hora, valor]) => /^\d{1,2}$/.test(hora) && typeof valor !== "object")
    .map(([hora, valor]) => [Number(hora), Number(valor) || 0])
    .sort((a, b) => a[0] - b[0]);

  const pico = picoHoras.pico || {};
  const vale = picoHoras.vale || {};

  setText("horaPico", formatHora(pico.hora));
  setText("mediaPico", formatRatioPercent(pico.media, 0));
  setText("horaVale", formatHora(vale.hora));
  setText("mediaVale", formatRatioPercent(vale.media, 0));

  container.innerHTML = "";
  if (!horas.length) {
    container.innerHTML = '<div class="mini-note">Sem dados por hora.</div>';
    return;
  }

  const max = Math.max(...horas.map(([, valor]) => valor), 1);
  const padding = { top: 22, right: 28, bottom: 48, left: 52 };
  const width = 720;
  const height = 260;
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;
  const denominator = horas.length > 1 ? horas.length - 1 : 1;
  const points = horas.map(([hora, valor], index) => ({
    hora,
    valor,
    x: padding.left + (plotWidth * index) / denominator,
    y: padding.top + plotHeight - (clamp(valor / max, 0, 1) * plotHeight)
  }));
  const linePath = buildSmoothPath(points);
  const areaPath = points.length
    ? `${linePath} L ${points[points.length - 1].x} ${padding.top + plotHeight} L ${points[0].x} ${padding.top + plotHeight} Z`
    : "";
  const gridLines = Array.from({ length: 4 }, (_, index) => {
    const ratio = index / 3;
    const y = padding.top + plotHeight * ratio;
    const value = max * (1 - ratio);
    return `
      <g class="hour-grid-line">
        <line x1="${padding.left}" y1="${y}" x2="${width - padding.right}" y2="${y}"></line>
        <text x="${padding.left - 12}" y="${y + 4}">${formatRatioPercent(value, 0)}</text>
      </g>
    `;
  }).join("");
  const labelEvery = Math.max(1, Math.ceil(horas.length / 8));
  const axisLabels = points.map((point, index) => {
    if (index % labelEvery !== 0 && index !== points.length - 1) return "";
    return `<text class="hour-axis-label" x="${point.x}" y="${height - 16}">${formatHora(point.hora)}</text>`;
  }).join("");
  const pointMarkup = points.map((point) => {
    const isHot = point.hora === Number(pico.hora);
    const isCold = point.hora === Number(vale.hora);
    const className = ["hour-point", isHot ? "hot" : "", isCold ? "cold" : ""].filter(Boolean).join(" ");
    return `
      <g class="${className}"
        aria-label="${formatHora(point.hora)} com ${formatRatioPercent(point.valor, 0)}"
        data-hour="${formatHora(point.hora)}" data-value="${formatRatioPercent(point.valor, 0)}"
        data-x="${point.x}" data-y="${point.y}">
        <circle class="hour-hit" cx="${point.x}" cy="${point.y}" r="18"></circle>
        <circle class="hour-dot halo" cx="${point.x}" cy="${point.y}" r="10"></circle>
        <circle class="hour-dot core" cx="${point.x}" cy="${point.y}" r="5"></circle>
      </g>
    `;
  }).join("");

  container.innerHTML = `
    <div class="hour-chart-panel">
      <svg class="hour-line-chart" viewBox="0 0 ${width} ${height}" role="img" aria-label="Grafico de linha por horario">
        <defs>
          <linearGradient id="hourLineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#61c07a"></stop>
            <stop offset="48%" stop-color="#2d86ff"></stop>
            <stop offset="100%" stop-color="#74a8f0"></stop>
          </linearGradient>
          <linearGradient id="hourAreaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#2d86ff" stop-opacity="0.28"></stop>
            <stop offset="100%" stop-color="#2d86ff" stop-opacity="0"></stop>
          </linearGradient>
          <filter id="hourGlow" x="-20%" y="-40%" width="140%" height="180%">
            <feGaussianBlur stdDeviation="4" result="blur"></feGaussianBlur>
            <feMerge>
              <feMergeNode in="blur"></feMergeNode>
              <feMergeNode in="SourceGraphic"></feMergeNode>
            </feMerge>
          </filter>
        </defs>
        <rect class="hour-plot-bg" x="${padding.left}" y="${padding.top}" width="${plotWidth}" height="${plotHeight}" rx="18"></rect>
        ${gridLines}
        <path class="hour-area" d="${areaPath}"></path>
        <path class="hour-line-glow" d="${linePath}"></path>
        <path class="hour-line" d="${linePath}"></path>
        ${axisLabels}
        ${pointMarkup}
      </svg>
      <div class="hour-tooltip" role="status" aria-live="polite"></div>
    </div>
  `;

  bindHourTooltip(container);
}

function buildSmoothPath(points) {
  if (!points.length) return "";
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  const commands = [`M ${points[0].x} ${points[0].y}`];
  for (let index = 0; index < points.length - 1; index += 1) {
    const current = points[index];
    const next = points[index + 1];
    const previous = points[index - 1] || current;
    const after = points[index + 2] || next;
    const tension = 0.18;
    const cp1x = current.x + (next.x - previous.x) * tension;
    const cp1y = current.y + (next.y - previous.y) * tension;
    const cp2x = next.x - (after.x - current.x) * tension;
    const cp2y = next.y - (after.y - current.y) * tension;

    commands.push(`C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${next.x} ${next.y}`);
  }

  return commands.join(" ");
}

function bindHourTooltip(container) {
  const tooltip = container.querySelector(".hour-tooltip");
  const panel = container.querySelector(".hour-chart-panel");
  if (!tooltip || !panel) return;

  const showTooltip = (target) => {
    const point = target.closest(".hour-point");
    if (!point) return;

    const x = Number(point.dataset.x) || 0;
    const y = Number(point.dataset.y) || 0;
    tooltip.innerHTML = `<strong>${point.dataset.hour}</strong><span>${point.dataset.value}</span>`;
    tooltip.style.left = `${clamp((x / 720) * 100, 10, 90)}%`;
    tooltip.style.top = `${clamp((y / 260) * 100, 16, 90)}%`;
    tooltip.classList.add("visible");
  };

  container.querySelectorAll(".hour-point").forEach((point) => {
    point.addEventListener("mouseenter", () => showTooltip(point));
    point.addEventListener("focus", () => showTooltip(point));
    point.addEventListener("mouseleave", () => tooltip.classList.remove("visible"));
    point.addEventListener("blur", () => tooltip.classList.remove("visible"));
  });
}

// ==========================
// RANKING
// ==========================
function aplicarRanking(topPessoas) {
  const container = qs("rankingPessoas");
  if (!container) return;

  const pessoas = toArray(topPessoas);
  container.innerHTML = "";

  if (!pessoas.length) {
    container.innerHTML = '<div class="mini-note">Sem dados carregados.</div>';
    return;
  }

  pessoas.forEach((pessoa, idx) => {
    const codigo = pessoa.codigo || pessoa.id || "-";
    const nome = pessoa.nome || `Pessoa ${codigo}`;
    const card = document.createElement("article");
    card.className = "ranking-card";
    card.innerHTML = `
      <div class="ranking-card-top">
        <div>
          <strong class="person-name">${escapeHTML(nome)}</strong>
          <span class="person-code">#${escapeHTML(codigo)}</span>
        </div>
        <span class="ranking-total">${formatBRL(pessoa.total)}</span>
      </div>
      <span class="ranking-badge">Top ${idx + 1} · ${formatPercent(pessoa.percentual, 2)}</span>
    `;
    container.appendChild(card);
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

  const fatiasBase = planos
    .map((plano) => ({
      valor: Number(plano.valor || 0),
      qtd: Number(plano.qtd || 0),
      percentual: Number(plano.percentual || 0)
    }))
    .filter((plano) => plano.percentual > 0 || plano.qtd > 0)
    .sort((a, b) => b.percentual - a.percentual || b.qtd - a.qtd)
    .slice(0, 15);

  if (!fatiasBase.length) {
    container.innerHTML = '<div class="list-item"><strong>Sem dados</strong><span>aguardando carregamento</span></div>';
    return;
  }

  const somaBase = fatiasBase.reduce((total, fatia) => total + fatia.percentual, 0);
  const escala = somaBase > 100 ? 100 / somaBase : 1;
  const fatias = fatiasBase.map((fatia, index) => ({
    label: formatBRL(fatia.valor),
    qtd: fatia.qtd,
    percentualOriginal: fatia.percentual,
    percentual: fatia.percentual * escala,
    color: DISTRIBUTION_COLORS[index % DISTRIBUTION_COLORS.length]
  }));
  const somaFatias = fatias.reduce((total, fatia) => total + fatia.percentual, 0);
  const percentualOutros = clamp(100 - somaFatias, 0, 100);

  if (percentualOutros > 0.01) {
    fatias.push({
      label: "Outros",
      qtd: null,
      percentualOriginal: percentualOutros,
      percentual: percentualOutros,
      color: "#777d89",
      muted: true
    });
  }

  const totalRegistros = fatiasBase.reduce((total, fatia) => total + fatia.qtd, 0);
  let cursor = -90;
  const slices = fatias.map((fatia) => {
    const start = cursor;
    const end = cursor + fatia.percentual * 3.6;
    cursor = end;
    return { ...fatia, path: describeDonutSlice(120, 120, 88, 52, start, end) };
  });

  const sliceMarkup = slices.map((fatia) => `
    <path class="donut-slice${fatia.muted ? " muted" : ""}"
      d="${fatia.path}"
      fill="${fatia.color}"
      data-label="${escapeHTML(fatia.label)}"
      data-percent="${formatPercent(fatia.percentualOriginal, 2)}"
      data-qtd="${fatia.qtd === null ? "" : `${fatia.qtd} registros`}">
    </path>
  `).join("");
  const legendMarkup = fatias.map((fatia) => `
    <div class="donut-legend-item${fatia.muted ? " muted" : ""}">
      <i style="--slice-color:${fatia.color}"></i>
      <strong>${escapeHTML(fatia.label)}</strong>
      <span>${formatPercent(fatia.percentualOriginal, 2)}</span>
      <small>${fatia.qtd === null ? "restante" : `${fatia.qtd} registros`}</small>
    </div>
  `).join("");

  container.innerHTML = `
    <div class="donut-dashboard">
      <div class="donut-stage">
        <svg class="donut-chart" viewBox="0 0 240 240" role="img" aria-label="Grafico pizza da distribuicao por valor">
          <circle class="donut-track" cx="120" cy="120" r="88"></circle>
          ${sliceMarkup}
          <circle class="donut-hole" cx="120" cy="120" r="50"></circle>
        </svg>
        <div class="donut-center">
          <strong>${formatPercent(somaBase > 100 ? 100 : somaBase, 1)}</strong>
          <span>top 15</span>
        </div>
        <div class="donut-tooltip" role="status" aria-live="polite"></div>
      </div>
      <div class="donut-legend" aria-label="Legenda da distribuicao por valor">
        ${legendMarkup}
      </div>
    </div>
    <div class="donut-foot">
      <span>Top 15 valores</span>
      <strong>${totalRegistros} registros</strong>
    </div>
  `;

  bindDonutTooltip(container);
}

function describeDonutSlice(cx, cy, outerRadius, innerRadius, startAngle, endAngle) {
  if (endAngle - startAngle >= 359.99) endAngle = startAngle + 359.99;

  const outerStart = polarToCartesian(cx, cy, outerRadius, endAngle);
  const outerEnd = polarToCartesian(cx, cy, outerRadius, startAngle);
  const innerStart = polarToCartesian(cx, cy, innerRadius, startAngle);
  const innerEnd = polarToCartesian(cx, cy, innerRadius, endAngle);
  const largeArc = endAngle - startAngle <= 180 ? "0" : "1";

  return [
    "M", outerStart.x, outerStart.y,
    "A", outerRadius, outerRadius, 0, largeArc, 0, outerEnd.x, outerEnd.y,
    "L", innerStart.x, innerStart.y,
    "A", innerRadius, innerRadius, 0, largeArc, 1, innerEnd.x, innerEnd.y,
    "Z"
  ].join(" ");
}

function polarToCartesian(cx, cy, radius, angleInDegrees) {
  const angleInRadians = (angleInDegrees - 90) * Math.PI / 180;

  return {
    x: cx + radius * Math.cos(angleInRadians),
    y: cy + radius * Math.sin(angleInRadians)
  };
}

function bindDonutTooltip(container) {
  const tooltip = container.querySelector(".donut-tooltip");
  if (!tooltip) return;

  container.querySelectorAll(".donut-slice").forEach((slice) => {
    const showTooltip = () => {
      const detail = slice.dataset.qtd ? `<small>${slice.dataset.qtd}</small>` : "<small>restante</small>";
      tooltip.innerHTML = `<strong>${slice.dataset.label}</strong><span>${slice.dataset.percent}</span>${detail}`;
      tooltip.classList.add("visible");
    };

    slice.addEventListener("mouseenter", showTooltip);
    slice.addEventListener("focus", showTooltip);
    slice.addEventListener("mouseleave", () => tooltip.classList.remove("visible"));
    slice.addEventListener("blur", () => tooltip.classList.remove("visible"));
  });
}

// ==========================
// SYNC
// ==========================
function formatSyncDate(rawTimestamp) {
  const data = new Date(rawTimestamp);
  if (Number.isNaN(data.getTime())) return String(rawTimestamp);

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);
  const startOfSyncDay = new Date(data.getFullYear(), data.getMonth(), data.getDate());

  const time = data.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit"
  });

  if (startOfSyncDay.getTime() === startOfToday.getTime()) {
    return `Hoje, ${time}`;
  }

  if (startOfSyncDay.getTime() === startOfYesterday.getTime()) {
    return `Ontem, ${time}`;
  }

  return data.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function atualizarSync(meta) {
  const rawTimestamp = meta.geradoEm || meta.lastUpdate || Date.now();
  setText("ultimaSync", formatSyncDate(rawTimestamp));
  setText("janelaDias", meta.janelaDias ? `${meta.janelaDias} dias` : "-- dias");
  setText("versaoRelatorio", meta.versao ? `v${meta.versao}` : "v--");
}

// ==========================
// APP SHELL
// ==========================
function showLogin({ error = "", info = "" } = {}) {
  document.body.classList.remove("app-ready");
  loginView()?.classList.remove("is-hidden");
  appView()?.classList.add("is-hidden");
  appNav()?.classList.add("is-hidden");
  appAuthorized = false;

  if (error) setLoginMessage(error, "error");
  else if (info) setLoginMessage(info, "info");
  else setLoginMessage();

  updateInstallButtons();
  updateLoginButton();
}

function showApp() {
  document.body.classList.add("app-ready");
  loginView()?.classList.add("is-hidden");
  appView()?.classList.remove("is-hidden");
  appNav()?.classList.remove("is-hidden");
  appAuthorized = true;
  setLoginMessage();

  syncPageSlideMetrics();

  const hashTab = location.hash.replace("#", "").split("/")[0];
  const validTabs = appPages().map((page) => page.dataset.page);
  setActiveTab(validTabs.includes(hashTab) ? hashTab : "inicio", false, false);
  updateInstallButtons();
}

function getActiveAppPage() {
  return appPages().find((page) => page.classList.contains("active"));
}

function scrollActivePageToTop() {
  getActiveAppPage()?.scrollTo({ top: 0, behavior: "instant" });
}

function scrollActivePageBy(deltaY) {
  const page = getActiveAppPage();
  if (page) {
    page.scrollBy({ top: deltaY, behavior: "auto" });
    return;
  }

  window.scrollBy({ top: deltaY, left: 0, behavior: "auto" });
}

function getActivePageTab() {
  return getActiveAppPage()?.dataset.page || "inicio";
}

function updateTopbarTitle() {
  const title = qs("viewTitle");
  if (!title) return;

  const activeTab = getActivePageTab();
  if (activeTab !== "inicio") {
    const activeButton = bottomTabs().find((tab) => tab.dataset.tab === activeTab);
    title.textContent = activeButton?.dataset.title || activeButton?.textContent.trim() || "Início";
    return;
  }

  title.textContent = inicioSegmento === "financeiro" ? "Financeiro" : "Início";
}

const TAB_ORDER = ["inicio", "financeiro", "alunos", "conta"];
const PAGE_SLIDE_MS = 380;
const PAGE_SLIDE_EASING = "cubic-bezier(0.32, 0.72, 0, 1)";
const SWIPE_COMMIT_PX = 96;
const SWIPE_AXIS_LOCK_PX = 14;
const SWIPE_FLICK_MIN_PX = 36;
const SWIPE_VELOCITY_COMMIT = 0.55;
const SWIPE_EDGE_RESISTANCE = 0.34;
let pageSlideLock = false;
let tabSwipeGesture = null;
let tabSwipeSuppressClick = false;

function appPagesTrack() {
  return qs("appPagesTrack");
}

function appPagesViewport() {
  return qs("appPagesViewport");
}

function getPageSlideWidth() {
  const viewport = appPagesViewport();
  return viewport ? Math.round(viewport.getBoundingClientRect().width) : 0;
}

function syncPageSlideMetrics() {
  const viewport = appPagesViewport();
  if (!viewport) return 0;

  const width = getPageSlideWidth();
  if (width > 0) {
    viewport.style.setProperty("--page-slide-width", `${width}px`);
  }

  return width;
}

function getPageSlideGap() {
  const track = appPagesTrack();
  if (!track) return 0;

  const gap = parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap);
  if (Number.isFinite(gap) && gap > 0) {
    return Math.round(gap);
  }

  const rootGap = getComputedStyle(document.documentElement).getPropertyValue("--page-slide-gap").trim();
  if (rootGap.endsWith("rem")) {
    const rem = parseFloat(rootGap);
    const rootSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
    if (Number.isFinite(rem) && Number.isFinite(rootSize)) {
      return Math.round(rem * rootSize);
    }
  }

  return 14;
}

function getPageSlideStep() {
  const width = syncPageSlideMetrics();
  if (!width) return 0;
  return width + getPageSlideGap();
}

function getTabIndex(tabName) {
  const index = TAB_ORDER.indexOf(tabName);
  return index >= 0 ? index : 0;
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function applyTabClasses(targetTab) {
  appPages().forEach((page) => {
    const isActive = page.dataset.page === targetTab;
    page.classList.toggle("active", isActive);
    page.setAttribute("aria-hidden", isActive ? "false" : "true");
  });
}

function setTrackOffset(offsetPx, animate = false) {
  const track = appPagesTrack();
  if (!track) return;

  const useMotion = animate && !prefersReducedMotion();

  if (useMotion) {
    track.style.transition = `transform ${PAGE_SLIDE_MS}ms ${PAGE_SLIDE_EASING}`;
  } else {
    track.style.transition = "none";
  }

  track.style.transform = `translate3d(-${offsetPx}px, 0, 0)`;

  if (!useMotion) {
    track.offsetHeight;
    track.style.removeProperty("transition");
  }
}

function setTrackIndex(tabName, animate = false) {
  const step = getPageSlideStep();
  if (!step) return;

  const index = getTabIndex(tabName);
  setTrackOffset(index * step, animate);
}

function releasePageSlideLockAfterTransition() {
  const track = appPagesTrack();
  if (!track) {
    pageSlideLock = false;
    return;
  }

  let finished = false;
  const cleanup = () => {
    if (finished) return;
    finished = true;
    track.removeEventListener("transitionend", onTransitionEnd);
    track.style.removeProperty("transition");
    pageSlideLock = false;
  };

  const onTransitionEnd = (event) => {
    if (event.target === track && event.propertyName === "transform") {
      cleanup();
    }
  };

  track.addEventListener("transitionend", onTransitionEnd);
  setTimeout(cleanup, PAGE_SLIDE_MS + 50);
}

function snapTrackToTab(tabName) {
  pageSlideLock = true;
  setTrackIndex(tabName, true);
  releasePageSlideLockAfterTransition();
}

function isBlockingOverlayOpen() {
  return Boolean(
    document.querySelector(
      'dialog[open], [popover]:popover-open, [aria-modal="true"]:not(.is-hidden)'
    )
  );
}

function isTabSwipeBlocked() {
  if (!appAuthorized) return true;
  if (pageSlideLock) return true;
  if (financeSubView) return true;
  if (isBlockingOverlayOpen()) return true;

  const login = loginView();
  if (login && !login.classList.contains("is-hidden")) return true;

  const appShell = appView();
  if (appShell && appShell.classList.contains("is-hidden")) return true;

  return false;
}

function isHorizontalScrollerElement(element) {
  const scroller = element?.closest(".students-scroll");
  if (!scroller) return false;
  return scroller.scrollWidth > scroller.clientWidth + 2;
}

function isTabSwipeStartBlocked(target) {
  if (isTabSwipeBlocked()) return true;
  if (target.closest("input, textarea, select, [contenteditable='true']")) return true;
  if (isHorizontalScrollerElement(target)) return true;
  return false;
}

function getRubberBandOffset(rawOffset, minOffset, maxOffset) {
  if (rawOffset < minOffset) {
    return minOffset - (minOffset - rawOffset) * SWIPE_EDGE_RESISTANCE;
  }
  if (rawOffset > maxOffset) {
    return maxOffset + (rawOffset - maxOffset) * SWIPE_EDGE_RESISTANCE;
  }
  return rawOffset;
}

function resetTabSwipeGesture() {
  const viewport = appPagesViewport();
  if (tabSwipeGesture?.mode === "horizontal") {
    viewport?.classList.remove("is-swiping");
  }
  tabSwipeGesture = null;
}

function setupTabSwipeNavigation() {
  const viewport = appPagesViewport();
  if (!viewport) return;

  let docListenersBound = false;

  const unbindDocumentSwipeListeners = () => {
    if (!docListenersBound) return;
    document.removeEventListener("pointermove", onPointerMove, true);
    document.removeEventListener("pointerup", onPointerFinish, true);
    document.removeEventListener("pointercancel", onPointerFinish, true);
    docListenersBound = false;
  };

  const onPointerMove = (event) => {
    const gesture = tabSwipeGesture;
    if (!gesture || event.pointerId !== gesture.pointerId) return;

    const dx = event.clientX - gesture.startX;
    const dy = event.clientY - gesture.startY;
    gesture.lastX = event.clientX;
    gesture.lastTime = event.timeStamp;

    if (gesture.mode === "pending") {
      if (Math.abs(dx) < SWIPE_AXIS_LOCK_PX && Math.abs(dy) < SWIPE_AXIS_LOCK_PX) {
        return;
      }

      if (Math.abs(dy) > Math.abs(dx) * 1.15) {
        unbindDocumentSwipeListeners();
        resetTabSwipeGesture();
        return;
      }

      if (isTabSwipeBlocked()) {
        unbindDocumentSwipeListeners();
        resetTabSwipeGesture();
        return;
      }

      gesture.mode = "horizontal";
      gesture.suppressClick = true;
      pageSlideLock = true;
      viewport.classList.add("is-swiping");
    }

    if (gesture.mode !== "horizontal") return;

    event.preventDefault();

    const minOffset = 0;
    const maxOffset = (TAB_ORDER.length - 1) * gesture.step;
    const rawOffset = gesture.baseIndex * gesture.step - dx;
    const offset = getRubberBandOffset(rawOffset, minOffset, maxOffset);
    setTrackOffset(offset, false);
  };

  const onPointerFinish = (event) => {
    const gesture = tabSwipeGesture;
    if (!gesture || event.pointerId !== gesture.pointerId) return;

    unbindDocumentSwipeListeners();
    viewport.classList.remove("is-swiping");

    if (gesture.mode !== "horizontal") {
      resetTabSwipeGesture();
      return;
    }

    const dx = event.clientX - gesture.startX;
    const dy = event.clientY - gesture.startY;
    const duration = Math.max(event.timeStamp - gesture.startTime, 1);
    const velocity = dx / duration;
    const horizontalDominant = Math.abs(dx) > Math.abs(dy);
    const passedDistance = Math.abs(dx) >= SWIPE_COMMIT_PX && horizontalDominant;
    const passedFlick =
      Math.abs(velocity) >= SWIPE_VELOCITY_COMMIT &&
      Math.abs(dx) >= SWIPE_FLICK_MIN_PX &&
      horizontalDominant;

    let targetIndex = gesture.baseIndex;

    if (passedDistance || passedFlick) {
      if (dx < 0 && gesture.baseIndex < TAB_ORDER.length - 1) {
        targetIndex = gesture.baseIndex + 1;
      } else if (dx > 0 && gesture.baseIndex > 0) {
        targetIndex = gesture.baseIndex - 1;
      }
    }

    const targetTab = TAB_ORDER[targetIndex];
    const suppressClick = gesture.suppressClick;
    const currentTab = gesture.currentTab;
    resetTabSwipeGesture();

    if (suppressClick) {
      tabSwipeSuppressClick = true;
      window.setTimeout(() => {
        tabSwipeSuppressClick = false;
      }, 0);
    }

    if (!targetTab || targetTab === currentTab) {
      snapTrackToTab(currentTab);
      return;
    }

    pageSlideLock = false;
    setActiveTab(targetTab, true, true);
  };

  viewport.addEventListener(
    "pointerdown",
    (event) => {
      if (event.pointerType === "mouse" && event.button !== 0) return;
      if (isTabSwipeStartBlocked(event.target)) return;

      const width = syncPageSlideMetrics();
      const step = getPageSlideStep();
      if (!width || !step) return;

      tabSwipeGesture = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        startTime: event.timeStamp,
        lastX: event.clientX,
        lastTime: event.timeStamp,
        width,
        step,
        baseIndex: getTabIndex(getActivePageTab()),
        currentTab: getActivePageTab(),
        mode: "pending",
        suppressClick: false,
      };

      if (!docListenersBound) {
        document.addEventListener("pointermove", onPointerMove, { passive: false, capture: true });
        document.addEventListener("pointerup", onPointerFinish, { passive: true, capture: true });
        document.addEventListener("pointercancel", onPointerFinish, { passive: true, capture: true });
        docListenersBound = true;
      }
    },
    { passive: true, capture: true }
  );

  viewport.addEventListener(
    "click",
    (event) => {
      if (tabSwipeSuppressClick) {
        event.preventDefault();
        event.stopPropagation();
      }
    },
    true
  );
}

function runPageSlide(toTab, onComplete) {
  const track = appPagesTrack();
  if (!track) {
    onComplete();
    return;
  }

  let finished = false;
  const cleanup = () => {
    if (finished) return;
    finished = true;
    track.style.removeProperty("transition");
    pageSlideLock = false;
    onComplete();
  };

  const onTransitionEnd = (event) => {
    if (event.target === track && event.propertyName === "transform") {
      track.removeEventListener("transitionend", onTransitionEnd);
      cleanup();
    }
  };

  track.addEventListener("transitionend", onTransitionEnd);
  setTrackIndex(toTab, true);
  setTimeout(cleanup, PAGE_SLIDE_MS + 40);
}

function setActiveSegment(segmentName, shouldPersist = true) {
  const validSegments = segmentPanels().map((panel) => panel.dataset.segmentPanel);
  const targetSegment = validSegments.includes(segmentName) ? segmentName : "operacional";
  inicioSegmento = targetSegment;

  segmentButtons().forEach((button) => {
    button.classList.toggle("active", button.dataset.segment === targetSegment);
  });

  segmentPanels().forEach((panel) => {
    panel.classList.toggle("active", panel.dataset.segmentPanel === targetSegment);
  });

  if (shouldPersist) {
    localStorage.setItem(INICIO_SEGMENT_KEY, targetSegment);
  }

  updateTopbarTitle();
}

function setupSegmentControl() {
  segmentButtons().forEach((button) => {
    button.addEventListener("click", () => setActiveSegment(button.dataset.segment));
  });

  setActiveSegment(inicioSegmento, false);
}

function setActiveTab(tabName, shouldUpdateHash = true, animate = false) {
  const validTabs = appPages().map((page) => page.dataset.page);
  const targetTab = validTabs.includes(tabName) ? tabName : "inicio";
  const currentTab = getActivePageTab();

  if (pageSlideLock && animate) return;

  if (targetTab !== "financeiro" && financeSubView) {
    closeFinanceSubView(false, false);
  }

  const finishTabSwitch = () => {
    bottomTabs().forEach((tab) => {
      tab.classList.toggle("active", tab.dataset.tab === targetTab);
    });

    updateTopbarTitle();

    const parsedFinance = targetTab === "financeiro" ? parseFinanceHash() : null;

    if (shouldUpdateHash) {
      if (parsedFinance && relatoriosPorUnidade[parsedFinance.unitId]) {
        history.replaceState(
          { financeSubView: parsedFinance },
          "",
          `#financeiro/${parsedFinance.view}/${encodeURIComponent(parsedFinance.unitId)}`
        );
      } else {
        history.replaceState(null, "", `#${targetTab}`);
      }
    }

    if (parsedFinance && relatoriosPorUnidade[parsedFinance.unitId]) {
      openFinanceSubView(parsedFinance.view, parsedFinance.unitId, false, false);
    } else if (targetTab === "financeiro") {
      closeFinanceSubView(false, false);
    }

    if (targetTab === "alunos") {
      renderAlunosUnitsCards(true);
    }

    scrollActivePageToTop();
  };

  const shouldAnimate =
    animate &&
    currentTab !== targetTab &&
    !prefersReducedMotion();

  if (shouldAnimate) {
    pageSlideLock = true;
    applyTabClasses(targetTab);
    bottomTabs().forEach((tab) => {
      tab.classList.toggle("active", tab.dataset.tab === targetTab);
    });
    runPageSlide(targetTab, finishTabSwitch);
    return;
  }

  applyTabClasses(targetTab);
  setTrackIndex(targetTab, false);
  finishTabSwitch();
}

function setupPageSlideMetrics() {
  syncPageSlideMetrics();
  syncFinanceStackMetrics();

  window.addEventListener(
    "resize",
    () => {
      if (pageSlideLock) return;
      const currentTab = getActivePageTab();
      syncPageSlideMetrics();
      setTrackIndex(currentTab, false);

      if (currentTab === "financeiro") {
        syncFinanceStackMetrics();
        setFinanceStackLayer(financeSubView ? "subview" : "list", false);
      }
    },
    { passive: true }
  );
}

function setupBottomNav() {
  bottomTabs().forEach((tab) => {
    tab.addEventListener("click", () => setActiveTab(tab.dataset.tab, true, true));
  });

  window.addEventListener("hashchange", () => {
    if (!appAuthorized) return;

    const parsed = parseFinanceHash();
    if (parsed && relatoriosPorUnidade[parsed.unitId]) {
      setActiveTab("financeiro", false);
      openFinanceSubView(parsed.view, parsed.unitId, false, false);
      return;
    }

    const hashTab = location.hash.replace("#", "").split("/")[0];
    if (hashTab) setActiveTab(hashTab, false, true);
  });
}

// ==========================
// PWA INSTALL
// ==========================
async function updateInstallButtons() {
  const buttons = [...document.querySelectorAll("[data-install-app], [data-install-app-account]")];
  const installed = await isAppInstalled();
  const canInstall = !installed && Boolean(deferredInstallPrompt);

  buttons.forEach((button) => {
    button.hidden = !canInstall;
    button.classList.toggle("is-hidden", !canInstall);
  });
}

async function promptInstall() {
  if (!deferredInstallPrompt) {
    updateInstallButtons();
    return;
  }

  deferredInstallPrompt.prompt();
  await deferredInstallPrompt.userChoice;
  deferredInstallPrompt = null;
  updateInstallButtons();
}

function setupPwaInstall() {
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredInstallPrompt = event;
    updateInstallButtons();
  });

  window.addEventListener("appinstalled", () => {
    deferredInstallPrompt = null;
    updateInstallButtons();
  });

  window.matchMedia("(display-mode: standalone)").addEventListener("change", updateInstallButtons);

  document.querySelectorAll("[data-install-app], [data-install-app-account]").forEach((button) => {
    button.addEventListener("click", promptInstall);
  });

  updateInstallButtons();
}

async function clearAppStorageCaches() {
  localStorage.removeItem(CACHE_KEY);
  relatoriosPorUnidade = {};
  unitsMeta = {};
  alunosPorUnidade = {};
  alunosDebugPorUnidade = {};
  pagamentosHojePorUnidade = {};
  alunosFetchPromises.clear();
  pagamentosHojeFetchPromises.clear();

  if ("caches" in window) {
    const keys = await caches.keys();
    await Promise.all(
      keys
        .filter((key) => (
          key.startsWith("relatorio-r1-") ||
          key.startsWith("relatorio-r1-v") ||
          key.startsWith("relatorio-r1-beta-") ||
          key.startsWith("relatorio-r1-bank-")
        ))
        .map((key) => caches.delete(key))
    );
  }

  navigator.serviceWorker?.controller?.postMessage({ type: "CLEAR_APP_CACHES" });
}

function reloadWithCacheBust() {
  const url = new URL(window.location.href);
  url.searchParams.set("refresh", APP_BUILD_ID);
  window.location.replace(url.toString());
}

async function forceAppRefresh() {
  const button = qs("refreshAppBtn");
  if (button) {
    button.disabled = true;
    button.textContent = "Atualizando...";
  }

  setText("statusCache", "atualizando app");
  updateSyncDot("carregando");

  try {
    await clearAppStorageCaches();

    if ("serviceWorker" in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        await registration.update();
        const worker = registration.waiting || registration.installing;
        if (worker) worker.postMessage({ type: "SKIP_WAITING" });
      }
    }
  } finally {
    window.setTimeout(reloadWithCacheBust, 250);
  }
}

async function enforceBuildCacheReset() {
  const seenBuild = localStorage.getItem(APP_BUILD_CACHE_KEY);
  if (seenBuild === APP_BUILD_ID) return;

  localStorage.setItem(APP_BUILD_CACHE_KEY, APP_BUILD_ID);
  await clearAppStorageCaches();
}

function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;

  window.addEventListener("load", () => {
    let refreshing = false;

    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (refreshing) return;
      refreshing = true;
      reloadWithCacheBust();
    });

    navigator.serviceWorker.register(`sw.js?v=${encodeURIComponent(APP_BUILD_ID)}`, { updateViaCache: "none" })
      .then((registration) => {
        registration.update();

        if (registration.waiting) {
          registration.waiting.postMessage({ type: "SKIP_WAITING" });
        }

        registration.addEventListener("updatefound", () => {
          const worker = registration.installing;
          if (!worker) return;

          worker.addEventListener("statechange", () => {
            if (worker.state === "installed" && navigator.serviceWorker.controller) {
              worker.postMessage({ type: "SKIP_WAITING" });
            }
          });
        });
      })
      .catch(() => {
        // App still works as a static page without service worker.
      });
  });
}

// ==========================
// AUTHENTICATION
// ==========================
function signInWithGoogle() {
  if (!authStateReady || auth.currentUser) return;

  pendingLoginError = "";
  setLoginMessage("Conectando com Google...", "info");

  auth.signInWithPopup(provider).catch((error) => {
    if (error.code === "auth/popup-blocked") {
      signInWithGoogleRedirect();
      return;
    }

    if (error.code === "auth/popup-closed-by-user" || error.code === "auth/cancelled-popup-request") {
      setLoginMessage();
      updateLoginButton();
      return;
    }

    setLoginMessage("Erro ao fazer login: " + error.message, "error");
    updateLoginButton();
  });
}

function signInWithGoogleRedirect() {
  auth.signInWithRedirect(provider).catch((error) => {
    setLoginMessage("Erro ao fazer login: " + error.message, "error");
  });
}

function handleRedirectResult() {
  auth.getRedirectResult().catch((error) => {
    if (error.code !== "auth/no-credential") {
      setLoginMessage("Erro ao fazer login: " + error.message, "error");
    }
  });
}

function signOut() {
  auth.signOut()
    .then(() => {
      relatoriosPorUnidade = {};
      physikServerConfig = null;
      physikServerConfigPromise = null;
      physikServerConfigError = "";
      photoLinkMemoryCache.clear();
      localStorage.removeItem(PHOTO_LINK_CACHE_KEY);
      updateUIForSignedOutUser();
    })
    .catch((error) => {
      console.error("Sign out error:", error);
    });
}

function updateUIForSignedInUser(user) {
  if (!user) return;

  const name = qs("accountName");
  const email = qs("accountEmail");
  const uid = qs("accountUid");
  const avatar = qs("accountAvatar");
  const fallback = qs("accountAvatarFallback");

  if (name) name.textContent = user.displayName || "Usuário";
  if (email) email.textContent = user.email || "---";
  if (uid) uid.textContent = "UID: " + user.uid;

  const inicioName = qs("inicioUserName");
  if (inicioName) {
    const firstName = (user.displayName || "Gestor").trim().split(/\s+/)[0];
    inicioName.textContent = firstName || "Gestor";
  }

  if (avatar && user.photoURL) {
    avatar.src = user.photoURL;
    avatar.alt = user.displayName || "Perfil";
    avatar.hidden = false;
    if (fallback) fallback.hidden = true;
  } else if (fallback) {
    const initial = (user.displayName || user.email || "?").charAt(0).toUpperCase();
    fallback.textContent = initial;
    fallback.hidden = false;
    if (avatar) avatar.hidden = true;
  }
}

function updateUIForSignedOutUser() {
  const error = pendingLoginError;
  pendingLoginError = "";
  physikServerConfig = null;
  physikServerConfigPromise = null;
  physikServerConfigError = "";
  photoLinkMemoryCache.clear();
  localStorage.removeItem(PHOTO_LINK_CACHE_KEY);
  showLogin(error ? { error } : {});
  updateSyncDot("idle");
  updateLoginButton();
}

async function handleAuthState(user) {
  if (!authStateReady) {
    authStateReady = true;
  }

  if (!user) {
    updateUIForSignedOutUser();
    updateLoginButton();
    return;
  }

  updateLoginButton();
  updateUIForSignedInUser(user);
  setLoginMessage("Verificando acesso...", "info");
  updateSyncDot("carregando");

  const authorization = await checkAuthorization();

  // Sessão pode ter mudado enquanto a checagem rodava (ex.: signOut paralelo).
  if (auth.currentUser?.uid !== user.uid) {
    updateLoginButton();
    return;
  }

  if (!authorization.authorized) {
    if (authorization.unavailable) {
      showAuthorizationUnavailableMessage(authorization.error);
    } else {
      showUnauthorizedMessage();
    }
    return;
  }

  showApp();
  setText("statusCache", "carregando");
  updateSyncDot("carregando");

  const cache = carregarCache();
  if (cache) {
    aplicarRelatorios(cache);
    setText("statusCache", "cache local");
    updateSyncDot("cache local");
    setTimeout(buscarFirebase, 1500);
  } else {
    buscarFirebase();
  }
}

// ==========================
// INIT
// ==========================

async function init() {
  await enforceBuildCacheReset();

  setupBottomNav();
  setupPageSlideMetrics();
  setupTabSwipeNavigation();
  setupSegmentControl();
  setupStudentsSearch();
  setupScrollChaining();
  setupFinanceSubView();
  setupPwaInstall();
  registerServiceWorker();
  handleRedirectResult();

  showLogin();
  updateSyncDot("idle");
  updateLoginButton();

  const select = qs("unitSelect");
  if (select) {
    select.addEventListener("change", (event) => selecionarUnidade(event.target.value));
  }

  qs("loginGoogleBtn")?.addEventListener("click", signInWithGoogle);
  qs("logoutBtn")?.addEventListener("click", signOut);
  qs("refreshAppBtn")?.addEventListener("click", forceAppRefresh);

  auth.onAuthStateChanged(handleAuthState);

  // Evita botão preso em "Verificando sessão..." se o Auth nunca responder.
  setTimeout(() => {
    if (authStateReady) return;
    authStateReady = true;
    setLoginMessage("Não foi possível verificar a sessão. Tente entrar novamente.", "error");
    updateLoginButton();
  }, 10000);
}

document.addEventListener("DOMContentLoaded", init);
