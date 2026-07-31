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
const APP_BUILD_ID = "2026-07-30-ai-preview-1";
const APP_BUILD_CACHE_KEY = "relatorio_app_build_seen";
const AI_CHAT_HISTORY_KEY = "relatorio_ai_chat_history_v1";
const AI_MEMORY_KEY = "relatorio_ai_memory_v1";
const AI_CLOUD_SESSION_KEY = "relatorio_ai_cloud_session_v1";
const AI_CLOUD_OUTBOX_KEY = "relatorio_ai_cloud_outbox_v1";
const AI_REPLY_CACHE_KEY = "relatorio_ai_reply_cache_v1";
const AI_REPLY_CACHE_TTL_MS = 1000 * 60 * 3;
const AI_REPLY_CACHE_MAX_ENTRIES = 20;
const AI_CHAT_VISIBLE_MESSAGE_LIMIT = 12;
const AI_MODEL_HISTORY_MESSAGE_LIMIT = 10;
const AI_MODEL_HISTORY_CHAR_LIMIT = 12000;
const AI_MEMORY_FACT_LIMIT = 20;
const AI_MEMORY_PREFERENCE_LIMIT = 20;
const AI_MEMORY_GAP_LIMIT = 30;
const AI_CLOUD_ROOT = "ai_assistant";
const SELECTED_UNIT_KEY = "relatorio_unidade_ativa";
const INICIO_SEGMENT_KEY = "relatorio_inicio_segmento";
const CACHE_TTL = 1000 * 60 * 60 * 6;
const REPORT_ROOT = "relatorios";
const UNITS_ROOT = "units";
const PAGAMENTOS_BY_DATE_ROOT = "pagamentosByDate";
const PHYSIK_SERVER_CONFIG_ROOT = "app_config/physik_server";
const GEMINI_CONFIG_ROOT = "app_config/gemini";
const PHOTO_LINK_CACHE_KEY = "relatorio_photo_links_v1";
const PHOTO_LINK_REFRESH_GRACE_SECONDS = 300;
const AI_ANALYTICS_AREA = "financeiro";
const AI_ANALYTICS_DATASETS = {
  manifest: "manifest.json",
  daily: "daily_summary.json",
  finance: "finance_rollup.json",
  daily_summary: "daily_summary.json",
  finance_rollup: "finance_rollup.json",
  students: "students_index.json",
  students_index: "students_index.json",
  retention: "retention_summary.json",
  retention_summary: "retention_summary.json",
  risk: "risk_alerts.json",
  risk_alerts: "risk_alerts.json",
  activity: "student_activity_rollup.json",
  student_activity_rollup: "student_activity_rollup.json",
  student_finance: "student_finance_rollup.json",
  student_finance_rollup: "student_finance_rollup.json",
  lifecycle: "student_lifecycle_rollup.json",
  student_lifecycle_rollup: "student_lifecycle_rollup.json",
  attendance: "attendance_rollup.json",
  attendance_rollup: "attendance_rollup.json",
  plans: "plan_rollup.json",
  plan_rollup: "plan_rollup.json",
  periods: "finance_periods.json",
  finance_periods: "finance_periods.json",
  receivables: "receivables_rollup.json",
  receivables_rollup: "receivables_rollup.json",
  payment_methods: "payment_methods_rollup.json",
  payment_methods_rollup: "payment_methods_rollup.json",
  cashflow: "cashflow_rollup.json",
  cashflow_rollup: "cashflow_rollup.json",
  expenses: "expense_rollup.json",
  expense_rollup: "expense_rollup.json",
  renewals: "renewals_rollup.json",
  renewals_rollup: "renewals_rollup.json",
  conversion: "conversion_funnel.json",
  conversion_funnel: "conversion_funnel.json",
  leads: "lead_funnel_rollup.json",
  lead_funnel_rollup: "lead_funnel_rollup.json",
  marketing: "marketing_attribution_rollup.json",
  marketing_attribution_rollup: "marketing_attribution_rollup.json",
  campaigns: "campaign_opportunities.json",
  campaign_opportunities: "campaign_opportunities.json",
  live: "live_occupancy.json",
  live_occupancy: "live_occupancy.json",
  duration: "training_duration_rollup.json",
  training_duration_rollup: "training_duration_rollup.json",
  staff: "staff_performance_rollup.json",
  staff_performance_rollup: "staff_performance_rollup.json",
  classes: "classes_rollup.json",
  classes_rollup: "classes_rollup.json",
  feedback: "feedback_rollup.json",
  feedback_rollup: "feedback_rollup.json",
  equipment: "equipment_rollup.json",
  equipment_rollup: "equipment_rollup.json",
  operations: "operations_alerts.json",
  operations_alerts: "operations_alerts.json",
  goals: "goals_progress.json",
  goals_progress: "goals_progress.json",
  executive: "daily_executive_summary.json",
  daily_executive_summary: "daily_executive_summary.json"
};
const AI_ANALYTICS_BASE_KEYS = ["manifest", "daily", "finance"];
const AI_ANALYTICS_ALL_KEYS = [
  "manifest",
  "daily",
  "finance",
  "students",
  "retention",
  "risk",
  "activity",
  "student_finance",
  "lifecycle",
  "attendance",
  "plans",
  "periods",
  "receivables",
  "payment_methods",
  "cashflow",
  "expenses",
  "renewals",
  "conversion",
  "leads",
  "marketing",
  "campaigns",
  "live",
  "duration",
  "staff",
  "classes",
  "feedback",
  "equipment",
  "operations",
  "goals",
  "executive"
];
const GEMINI_MAX_OUTPUT_TOKENS = 4096;
const GEMINI_DEFAULT_FALLBACK_MODELS = [
  "gemini-3.5-flash-lite",
  "gemini-flash-latest"
];
const AI_COMPACT_DEFAULT_ARRAY_LIMIT = 12;
const AI_COMPACT_ARRAY_LIMITS = {
  monthly: 12,
  avulsosMonthly: 12,
  paymentValueDistribution: 8,
  topStudents: 8,
  peakHours: 12
};
const GEMINI_STREAM_UNAVAILABLE_KEY = "relatorio_gemini_stream_unavailable";
const GEMINI_STREAM_ENABLED = false;
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
let alunosUiState = { pageScrollTop: 0, units: {} };
let pendingStudentFocus = null;
let pagamentosHojePorUnidade = {};
const alunosFetchPromises = new Map();
const pagamentosHojeFetchPromises = new Map();
const photoLinkMemoryCache = new Map();
let studentModalEscapeBound = false;
let unidadeSelecionada = localStorage.getItem(SELECTED_UNIT_KEY) || "";
let physikServerConfig = null;
let physikServerConfigPromise = null;
let physikServerConfigError = "";
let geminiConfig = null;
let geminiConfigPromise = null;
let geminiConfigError = "";
let firebaseRealtimeStarted = false;
let firebaseRealtimeApplyTimer = null;
let firebaseRealtimeFallbackTimer = null;
let firebaseRealtimeDateTimer = null;
let firebaseRealtimeTodayKey = "";
let firebaseRealtimeUnitsReady = false;
let deferredInstallPrompt = null;
let appAuthorized = false;
let authStateReady = false;
let pendingLoginError = "";
let inicioSegmento = localStorage.getItem(INICIO_SEGMENT_KEY) || "operacional";
let financeSubView = null;
let aiChatBusy = false;
const aiChatHistory = [];
let aiMemory = createEmptyAiMemory();
let aiCloudSyncState = "local";
let aiCloudSyncDetail = "Aguardando sincronização";
let aiCloudSessionId = "";
let aiCloudSessionReady = false;
let aiCloudOutboxFlushing = false;
let aiUserStateUid = "";
const studentVirtualState = new Map();
const firebaseRealtimeUnsubscribers = new Map();
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

function renderInlineMarkdown(value) {
  const codeTokens = [];
  const mathTokens = [];
  let html = String(value ?? "").replace(/\$([^$\n]+)\$/g, (_, math) => {
    const token = `@@MATH_${mathTokens.length}@@`;
    mathTokens.push(`<span class="ai-md-math">${escapeHTML(formatInlineMath(math))}</span>`);
    return token;
  });

  html = escapeHTML(html).replace(/`([^`]+)`/g, (_, code) => {
    const token = `@@CODE_${codeTokens.length}@@`;
    codeTokens.push(`<code>${code}</code>`);
    return token;
  });

  html = html
    .replace(/~~([^~]+)~~/g, "<s>$1</s>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/__([^_]+)__/g, "<strong>$1</strong>")
    .replace(/\*([^*\n]+)\*/g, "<em>$1</em>")
    .replace(/_([^_\n]+)_/g, "<em>$1</em>");

  codeTokens.forEach((code, index) => {
    html = html.replace(`@@CODE_${index}@@`, code);
  });

  mathTokens.forEach((math, index) => {
    html = html.replace(`@@MATH_${index}@@`, math);
  });

  return html;
}

function formatInlineMath(value) {
  return String(value || "")
    .replace(/\\text\{([^}]+)\}/g, "$1")
    .replace(/\\mathrm\{([^}]+)\}/g, "$1")
    .replace(/\\operatorname\{([^}]+)\}/g, "$1")
    .replace(/\\cdot/g, "·")
    .replace(/\\times/g, "x")
    .replace(/\\,/g, " ")
    .replace(/\\/g, "")
    .trim();
}

const isMarkdownHr = (line) => /^\s*(?:-{3,}|\*{3,}|_{3,})\s*$/.test(line);
const isMarkdownTableSeparator = (line) => /^\s*\|?\s*:?-{3,}:?\s*(?:\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(line);
const isMarkdownTableRow = (line) => line.includes("|") && !isMarkdownHr(line);

function splitMarkdownTableRow(line) {
  let clean = line.trim();
  if (clean.startsWith("|")) clean = clean.slice(1);
  if (clean.endsWith("|")) clean = clean.slice(0, -1);
  return clean.split("|").map((cell) => cell.trim());
}

function renderMarkdownTable(lines) {
  const header = splitMarkdownTableRow(lines[0] || "");
  const bodyRows = lines.slice(2).filter((line) => isMarkdownTableRow(line));

  const headHtml = header
    .map((cell) => `<th>${renderInlineMarkdown(cell)}</th>`)
    .join("");

  const bodyHtml = bodyRows
    .map((line) => {
      const cells = splitMarkdownTableRow(line);
      return `<tr>${cells.map((cell) => `<td>${renderInlineMarkdown(cell)}</td>`).join("")}</tr>`;
    })
    .join("");

  return `<div class="ai-md-table-wrap"><table><thead><tr>${headHtml}</tr></thead><tbody>${bodyHtml}</tbody></table></div>`;
}

function renderMarkdownList(lines, ordered = false) {
  const tag = ordered ? "ol" : "ul";
  const marker = ordered ? /^\s*\d+\.\s+/ : /^\s*[-*+]\s+/;
  const items = lines
    .filter((line) => marker.test(line))
    .map((line) => {
      const depth = Math.min(Math.floor((line.match(/^\s*/)?.[0].length || 0) / 2), 3);
      return `<li class="ai-md-indent-${depth}">${renderInlineMarkdown(line.replace(marker, ""))}</li>`;
    })
    .join("");

  return `<${tag}>${items}</${tag}>`;
}

function renderParagraph(lines) {
  return `<p>${renderInlineMarkdown(lines.join("\n")).replace(/\n/g, "<br>")}</p>`;
}

function collectParagraph(lines, startIndex) {
  const block = [];
  let index = startIndex;

  while (index < lines.length) {
    const line = lines[index];
    if (!line.trim()) break;
    if (/^```/.test(line.trim())) break;
    if (/^#{1,4}\s+/.test(line)) break;
    if (isMarkdownHr(line)) break;
    if (/^\s*>\s?/.test(line)) break;
    if (/^\s*[-*+]\s+/.test(line)) break;
    if (/^\s*\d+\.\s+/.test(line)) break;
    if (isMarkdownTableRow(line) && isMarkdownTableSeparator(lines[index + 1] || "")) break;

    block.push(line);
    index += 1;
  }

  return { block, index };
}

function renderBasicMarkdown(value) {
  const text = String(value ?? "").replace(/\r\n/g, "\n").trim();
  if (!text) return "";

  const html = [];
  const lines = text.split("\n");
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];

    if (!line.trim()) {
      index += 1;
      continue;
    }

    if (/^```/.test(line.trim())) {
      const code = [];
      index += 1;
      while (index < lines.length && !/^```/.test(lines[index].trim())) {
        code.push(lines[index]);
        index += 1;
      }
      if (index < lines.length) index += 1;
      html.push(`<pre><code>${escapeHTML(code.join("\n"))}</code></pre>`);
      continue;
    }

    if (/^#{1,4}\s+/.test(line)) {
      html.push(`<strong class="ai-md-heading">${renderInlineMarkdown(line.replace(/^#{1,4}\s+/, ""))}</strong>`);
      index += 1;
      continue;
    }

    if (isMarkdownHr(line)) {
      html.push('<hr class="ai-md-hr">');
      index += 1;
      continue;
    }

    if (/^\s*>\s?/.test(line)) {
      const block = [];
      while (index < lines.length && /^\s*>\s?/.test(lines[index])) {
        block.push(lines[index].replace(/^\s*>\s?/, ""));
        index += 1;
      }
      html.push(`<blockquote>${renderBasicMarkdown(block.join("\n"))}</blockquote>`);
      continue;
    }

    if (isMarkdownTableRow(line) && isMarkdownTableSeparator(lines[index + 1] || "")) {
      const tableLines = [line, lines[index + 1]];
      index += 2;
      while (index < lines.length && isMarkdownTableRow(lines[index]) && lines[index].trim()) {
        tableLines.push(lines[index]);
        index += 1;
      }
      html.push(renderMarkdownTable(tableLines));
      continue;
    }

    if (/^\s*[-*+]\s+/.test(line)) {
      const block = [];
      while (index < lines.length && /^\s*[-*+]\s+/.test(lines[index])) {
        block.push(lines[index]);
        index += 1;
      }
      html.push(renderMarkdownList(block, false));
      continue;
    }

    if (/^\s*\d+\.\s+/.test(line)) {
      const block = [];
      while (index < lines.length && /^\s*\d+\.\s+/.test(lines[index])) {
        block.push(lines[index]);
        index += 1;
      }
      html.push(renderMarkdownList(block, true));
      continue;
    }

    const paragraph = collectParagraph(lines, index);
    if (paragraph.block.length) {
      html.push(renderParagraph(paragraph.block));
      index = paragraph.index;
      continue;
    }

    html.push(renderParagraph([line]));
    index += 1;
  }

  return html.join("");
}

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

function stopFirebaseRealtimeSync() {
  firebaseRealtimeUnsubscribers.forEach((unsubscribe) => {
    try {
      unsubscribe();
    } catch (error) {
      console.warn("Falha ao remover listener Firebase:", error.code || error.message);
    }
  });
  firebaseRealtimeUnsubscribers.clear();
  firebaseRealtimeStarted = false;
  firebaseRealtimeUnitsReady = false;

  if (firebaseRealtimeApplyTimer) {
    clearTimeout(firebaseRealtimeApplyTimer);
    firebaseRealtimeApplyTimer = null;
  }

  if (firebaseRealtimeFallbackTimer) {
    clearTimeout(firebaseRealtimeFallbackTimer);
    firebaseRealtimeFallbackTimer = null;
  }

  if (firebaseRealtimeDateTimer) {
    clearTimeout(firebaseRealtimeDateTimer);
    firebaseRealtimeDateTimer = null;
  }
}

function watchFirebaseValue(path, label, onValue) {
  if (firebaseRealtimeUnsubscribers.has(label)) return;

  const ref = db.ref(path);
  const handleValue = (snapshot) => onValue(snapshot.val());
  const handleError = (error) => {
    console.warn("Listener Firebase falhou:", label, error.code || error.message, error.message);
    setText("statusCache", "realtime indisponivel");
    updateSyncDot("erro");
  };

  ref.on("value", handleValue, handleError);
  firebaseRealtimeUnsubscribers.set(label, () => ref.off("value", handleValue));
}

function unwatchFirebaseLabel(label) {
  const unsubscribe = firebaseRealtimeUnsubscribers.get(label);
  if (!unsubscribe) return;

  unsubscribe();
  firebaseRealtimeUnsubscribers.delete(label);
}

function scheduleRealtimeApply() {
  if (firebaseRealtimeApplyTimer) clearTimeout(firebaseRealtimeApplyTimer);

  firebaseRealtimeApplyTimer = setTimeout(() => {
    firebaseRealtimeApplyTimer = null;

    const reports = stripReportsHeavyFields(relatoriosPorUnidade);
    if (!Object.keys(reports).length) return;
    salvarCache(reports);
    aplicarRelatorios(reports);
    setText("statusCache", "online ao vivo");
    updateSyncDot("online");
  }, 180);
}

function reconcileRealtimeUnitListeners(unitIds) {
  const activeUnits = new Set(unitIds);
  const todayKey = getTodayDateKey();
  firebaseRealtimeTodayKey = todayKey;

  [...firebaseRealtimeUnsubscribers.keys()].forEach((label) => {
    const reportMatch = label.match(/^report:([^:]+):/);
    const paymentMatch = label.match(/^paymentsToday:([^:]+)$/);
    const unitId = reportMatch?.[1] || paymentMatch?.[1];
    if (unitId && !activeUnits.has(unitId)) {
      unwatchFirebaseLabel(label);
      delete relatoriosPorUnidade[unitId];
      delete pagamentosHojePorUnidade[unitId];
    }
  });

  unitIds.forEach((unitId) => {
    relatoriosPorUnidade[unitId] = relatoriosPorUnidade[unitId] || {};

    REPORT_LIGHT_FIELDS.forEach((field) => {
      watchFirebaseValue(`${REPORT_ROOT}/${unitId}/${field}`, `report:${unitId}:${field}`, (value) => {
        if (!relatoriosPorUnidade[unitId]) relatoriosPorUnidade[unitId] = {};
        if (value === null || value === undefined) {
          delete relatoriosPorUnidade[unitId][field];
        } else {
          relatoriosPorUnidade[unitId][field] = value;
        }
        scheduleRealtimeApply();
      });
    });

    watchFirebaseValue(`${PAGAMENTOS_BY_DATE_ROOT}/${unitId}/${todayKey}`, `paymentsToday:${unitId}`, (value) => {
      pagamentosHojePorUnidade[unitId] = toArray(value);
      if (financeSubView?.view === "dia" && financeSubView.unitId === unitId) {
        renderFinanceSubView();
      }
    });
  });
}

function scheduleRealtimeDateRollover() {
  if (firebaseRealtimeDateTimer) clearTimeout(firebaseRealtimeDateTimer);

  const nextMidnight = new Date();
  nextMidnight.setHours(24, 0, 5, 0);
  const delay = Math.max(1000, nextMidnight.getTime() - Date.now());

  firebaseRealtimeDateTimer = setTimeout(() => {
    firebaseRealtimeDateTimer = null;
    [...firebaseRealtimeUnsubscribers.keys()]
      .filter((label) => label.startsWith("paymentsToday:"))
      .forEach(unwatchFirebaseLabel);

    pagamentosHojePorUnidade = {};
    reconcileRealtimeUnitListeners(Object.keys(unitsMeta));
    if (financeSubView?.view === "dia") renderFinanceSubView();
    scheduleRealtimeDateRollover();
  }, delay);
}

function startFirebaseRealtimeSync() {
  if (firebaseRealtimeStarted) return;
  firebaseRealtimeStarted = true;
  firebaseRealtimeUnitsReady = false;

  watchFirebaseValue(UNITS_ROOT, "units", (value) => {
    unitsMeta = normalizeUnitsMap(value);
    firebaseRealtimeUnitsReady = true;
    reconcileRealtimeUnitListeners(Object.keys(unitsMeta));
    scheduleRealtimeApply();
  });

  watchFirebaseValue(PHYSIK_SERVER_CONFIG_ROOT, "physikServerConfig", (value) => {
    const previousKey = physikServerConfig ? `${physikServerConfig.baseUrl}|${physikServerReadToken(physikServerConfig)}` : "";
    const nextConfig = normalizePhysikServerConfig(value);
    const nextKey = nextConfig ? `${nextConfig.baseUrl}|${physikServerReadToken(nextConfig)}` : "";
    physikServerConfig = nextConfig;
    physikServerConfigPromise = null;
    physikServerConfigError = physikServerConfig ? "" : (value ? "config-invalida" : "config-null");

    if (previousKey && nextKey && previousKey !== nextKey) {
      alunosPorUnidade = {};
      alunosFetchPromises.clear();
      photoLinkMemoryCache.clear();
      localStorage.removeItem(PHOTO_LINK_CACHE_KEY);
      if (getActivePageTab() === "alunos") renderAlunosUnitsCards(true);
    }
  });

  watchFirebaseValue(GEMINI_CONFIG_ROOT, "geminiConfig", (value) => {
    geminiConfig = normalizeGeminiConfig(value);
    geminiConfigPromise = null;
    geminiConfigError = geminiConfig ? "" : (value ? "config-invalida" : "config-null");
  });

  firebaseRealtimeFallbackTimer = setTimeout(() => {
    firebaseRealtimeFallbackTimer = null;
    if (!firebaseRealtimeUnitsReady || !Object.keys(relatoriosPorUnidade).length) {
      buscarFirebase();
    }
  }, 5000);

  scheduleRealtimeDateRollover();
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

function normalizeGeminiConfig(value) {
  if (!value || typeof value !== "object") return null;

  const enabled = value.enabled !== false;
  const apiKey = String(value.apiKey || "").trim();
  const model = String(value.model || "gemini-flash-latest").trim();
  const fallbackModels = Array.isArray(value.fallbackModels)
    ? value.fallbackModels.map((item) => String(item || "").trim()).filter(Boolean)
    : String(value.fallbackModel || "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

  if (!enabled || !apiKey || !model) return null;

  return { enabled, apiKey, model, fallbackModels };
}

async function carregarGeminiConfig(force = false) {
  if (!force && geminiConfig) return geminiConfig;
  if (!force && geminiConfigPromise) return geminiConfigPromise;

  geminiConfigError = "";
  geminiConfigPromise = readFirebaseValue(GEMINI_CONFIG_ROOT, "gemini-config")
    .then((value) => {
      geminiConfig = normalizeGeminiConfig(value);
      if (!geminiConfig) geminiConfigError = value ? "config-invalida" : "config-null";
      return geminiConfig;
    })
    .catch((error) => {
      console.warn("Config Gemini indisponivel:", error.code || error.status || error.message, error.message);
      geminiConfigError = error.code || error.status || error.message || "erro-config";
      geminiConfig = null;
      return null;
    })
    .finally(() => {
      geminiConfigPromise = null;
    });

  return geminiConfigPromise;
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
          <button
            type="button"
            class="finance-payment-student"
            data-student-nav
            data-unit-id="${escapeHTML(financeSubView?.unitId || "")}"
            data-student-name="${escapeHTML(getPaymentStudentName(payment))}"
            data-student-card="${escapeHTML(payment?.cartao || payment?.alunoId || payment?.codigoPessoa || "")}"
          >${escapeHTML(getPaymentStudentName(payment))}</button>
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

  qs("financeSubList")?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-student-nav]");
    if (!button) return;

    navegarParaAlunoDoPagamento({
      unitId: button.dataset.unitId,
      nome: button.dataset.studentName,
      cartao: button.dataset.studentCard
    });
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

function parseStudentExpiryDate(value) {
  const raw = String(value || "").trim();
  const isoMatch = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
  const brMatch = raw.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  const parts = isoMatch
    ? [Number(isoMatch[1]), Number(isoMatch[2]), Number(isoMatch[3])]
    : brMatch
      ? [Number(brMatch[3]), Number(brMatch[2]), Number(brMatch[1])]
      : null;

  if (!parts) return null;
  const [year, month, day] = parts;
  const parsed = new Date(year, month - 1, day);
  if (
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month - 1 ||
    parsed.getDate() !== day
  ) {
    return null;
  }

  return parsed;
}

function studentExpiryPresentation(student) {
  if (student?.perfil === "colaborador") {
    return { label: "-", state: "valid" };
  }

  const expiryDate = parseStudentExpiryDate(student?.vencimento);
  if (!expiryDate) {
    return { label: formatDateBR(student?.vencimento), state: "unknown" };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return {
    label: formatDateBR(student.vencimento),
    state: expiryDate >= today ? "valid" : "expired"
  };
}

function renderStudentExpiryBadge(student) {
  const expiry = studentExpiryPresentation(student);
  return `<b class="student-expiry-badge student-expiry-badge--${expiry.state}">${escapeHTML(expiry.label)}</b>`;
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

function studentDomKey(student) {
  return `${student?.unidadeId || ""}|${student?.cartao || student?.id || ""}`;
}

function renderStudentCard(student) {
  const perfil = student.perfil === "colaborador" ? "colaborador" : "aluno";

  return `
    <article
      class="student-card"
      role="button"
      tabindex="0"
      data-student-card
      data-unit-id="${escapeHTML(student.unidadeId || "")}"
      data-student-cartao="${escapeHTML(student.cartao || "")}"
      data-student-key="${escapeHTML(studentDomKey(student))}"
    >
      ${renderStudentPhoto(student)}
      <div class="student-card-body">
        <strong class="student-name">${escapeHTML(student.nome)}</strong>
        <span class="student-meta"><span>Cartão</span><b>${escapeHTML(student.cartao)}</b></span>
        <span class="student-meta"><span>Perfil</span><b class="student-profile student-profile--${perfil}">${perfilLabel(perfil)}</b></span>
        <span class="student-meta"><span>Vencimento</span>${renderStudentExpiryBadge(student)}</span>
      </div>
    </article>
  `;
}

function studentsUnitUiState(unitId) {
  if (!alunosUiState.units[unitId]) {
    alunosUiState.units[unitId] = { query: "", scrollLeft: 0 };
  }
  return alunosUiState.units[unitId];
}

function saveStudentsPageState() {
  const page = document.querySelector('.app-page[data-page="alunos"]');
  if (page) alunosUiState.pageScrollTop = page.scrollTop || 0;

  document.querySelectorAll(".students-unit-block").forEach((unitBlock) => {
    const unitId = unitBlock.dataset.unitBlock;
    if (!unitId) return;

    const state = studentsUnitUiState(unitId);
    const input = unitBlock.querySelector(".students-search");
    state.query = input ? input.value || "" : state.query || "";
    const scroller = unitBlock.querySelector(".students-scroll");
    state.scrollLeft = scroller ? scroller.scrollLeft || 0 : state.scrollLeft || 0;
  });
}

function restoreStudentsPageScroll() {
  const page = document.querySelector('.app-page[data-page="alunos"]');
  if (!page) return;

  window.requestAnimationFrame(() => {
    page.scrollTop = alunosUiState.pageScrollTop || 0;
  });
}

function findPreparedStudent(unitId, cartao) {
  const key = String(cartao || "").trim();
  if (!unitId || !key) return null;

  const state = studentVirtualState.get(unitId);
  const fromState = state?.students?.find((student) => String(student.cartao) === key || String(student.id) === key);
  if (fromState) return fromState;

  return alunosDaUnidade(unitId).map((student) => prepareStudentRecord(student, unitId))
    .find((student) => String(student.cartao) === key || String(student.id) === key) || null;
}

function filterStudentsInUnit(unitBlock, query, resetScroll = true) {
  const state = getStudentsUnitState(unitBlock);
  const scroll = unitBlock.querySelector(".students-scroll");
  if (!state || !scroll) return;

  const normalized = normalizeStudentSearch(query);
  const unitUi = studentsUnitUiState(unitBlock.dataset.unitBlock || "");
  unitUi.query = query || "";

  state.query = normalized;
  state.filtered = normalized
    ? state.students.filter((student) => student._search.includes(normalized))
    : state.students;
  state.lastStart = -1;
  state.lastEnd = -1;
  state.lastQuery = "";
  if (resetScroll) {
    scroll.scrollLeft = 0;
    unitUi.scrollLeft = 0;
  }
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

function studentDetailLabel(key) {
  const labels = {
    cpf: "CPF",
    rg: "RG",
    email: "E-mail",
    endereco: "Endereco",
    nascimento: "Nascimento",
    plano: "Plano",
    modalidade: "Modalidade",
    turma: "Turma",
    situacao: "Situacao",
    status: "Status"
  };
  if (labels[key]) return labels[key];

  return String(key || "")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function studentExtraDetailRows(student) {
  const hiddenKeys = new Set([
    "id",
    "nome",
    "cartao",
    "codigo",
    "perfil",
    "vencimento",
    "telefone",
    "unidadeId",
    "unitId",
    "physikUnitId",
    "foto",
    "photo",
    "fotoUrl",
    "pagamentos",
    "_search"
  ]);

  return Object.entries(student || {})
    .filter(([key, value]) => (
      !hiddenKeys.has(key) &&
      value !== undefined &&
      value !== null &&
      ["string", "number", "boolean"].includes(typeof value) &&
      String(value).trim() !== ""
    ))
    .map(([key, value]) => [studentDetailLabel(key), String(value)]);
}

function studentDetailRows(student) {
  const expiry = studentExpiryPresentation(student);
  const rows = [
    ["Unidade", nomeUnidade(student.unidadeId)],
    ["Cartão", student.cartao],
    ["Perfil", perfilLabel(student.perfil)],
    ["Vencimento", expiry.label, `student-expiry-badge student-expiry-badge--${expiry.state}`],
    ["Telefone", student.telefone],
    ["Código", student.codigo]
  ].concat(studentExtraDetailRows(student));

  return rows
    .filter(([, value]) => value !== undefined && value !== null && String(value).trim() !== "")
    .map(([label, value, valueClass = ""]) => `
      <div class="student-detail-row">
        <span>${escapeHTML(label)}</span>
        <strong${valueClass ? ` class="${escapeHTML(valueClass)}"` : ""}>${escapeHTML(value)}</strong>
      </div>
    `).join("");
}

function formatStudentPaymentDate(payment) {
  return payment?.data || payment?.pagoEm || payment?.timestampCreatedAt || payment?.createdAt || "---";
}

function studentPaymentBadges(payment) {
  const badges = [
    { label: "Data", value: formatDateBR(formatStudentPaymentDate(payment)) },
    {
      label: "Forma",
      value: payment?.formaPagamento || payment?.meioPagamento || payment?.metodoPagamento || payment?.forma
    },
    { label: "Status", value: payment?.status || payment?.situacao }
  ];

  return badges
    .filter(({ value }) => value !== undefined && value !== null && String(value).trim() !== "")
    .map(({ label, value }) => `
      <span class="student-payment-badge">
        <small>${escapeHTML(label)}</small>
        ${escapeHTML(value)}
      </span>
    `).join("");
}

function renderStudentPayments(student) {
  const payments = toArray(student?.pagamentos);
  if (!payments.length) return '<div class="mini-note">Nenhum pagamento disponível.</div>';

  return payments.map((payment) => `
    <article class="student-payment-item">
      <div class="student-payment-header">
        <strong class="student-payment-title">${escapeHTML(payment?.descricao || payment?.plano || payment?.tipo || "Pagamento")}</strong>
        <b class="student-payment-amount">${formatBRL(payment?.valor ?? payment?.valorPago ?? payment?.total ?? 0)}</b>
      </div>
      <div class="student-payment-badges">${studentPaymentBadges(payment)}</div>
      ${payment?.observacao ? `<p class="student-payment-note">${escapeHTML(payment.observacao)}</p>` : ""}
    </article>
  `).join("");
}

function ensureStudentModal() {
  let modal = qs("studentDetailModal");
  if (modal) return modal;

  modal = document.createElement("div");
  modal.id = "studentDetailModal";
  modal.className = "student-detail-modal is-hidden";
  modal.setAttribute("aria-hidden", "true");
  modal.innerHTML = `
    <div class="student-detail-backdrop" data-student-modal-close></div>
    <section class="student-detail-dialog" role="dialog" aria-modal="true" aria-labelledby="studentDetailTitle">
      <button type="button" class="student-detail-close" data-student-modal-close aria-label="Fechar">×</button>
      <div class="student-detail-content"></div>
    </section>
  `;
  document.body.appendChild(modal);

  modal.addEventListener("click", (event) => {
    if (event.target.closest("[data-student-modal-close]")) closeStudentModal();
  });

  if (!studentModalEscapeBound) {
    studentModalEscapeBound = true;
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeStudentModal();
    });
  }

  return modal;
}

function openStudentModal(student) {
  if (!student) return;

  const modal = ensureStudentModal();
  const content = modal.querySelector(".student-detail-content");
  if (!content) return;

  content.innerHTML = `
    <div class="student-detail-photo-wrap">
      ${renderStudentPhoto(student)}
    </div>
    <div class="student-detail-main">
      <header class="student-detail-header">
        <span>${escapeHTML(nomeUnidade(student.unidadeId))}</span>
        <h2 id="studentDetailTitle">${escapeHTML(student.nome || "Aluno")}</h2>
      </header>
      <div class="student-detail-grid">
        ${studentDetailRows(student)}
      </div>
      <section class="student-detail-payments">
        <h3>Pagamentos</h3>
        ${renderStudentPayments(student)}
      </section>
    </div>
  `;

  bindStudentImageFallbacks(content);
  hydrateStudentPhotos(content);
  modal.classList.remove("is-hidden");
  modal.setAttribute("aria-hidden", "false");
  modal.querySelector("[data-student-modal-close]")?.focus({ preventScroll: true });
}

function closeStudentModal() {
  const modal = qs("studentDetailModal");
  if (!modal || modal.classList.contains("is-hidden")) return;
  modal.classList.add("is-hidden");
  modal.setAttribute("aria-hidden", "true");
}

function openStudentModalByCard(card) {
  const student = findPreparedStudent(card?.dataset.unitId, card?.dataset.studentCartao);
  openStudentModal(student);
}

function focusStudentInUnit({ unitId, nome = "", cartao = "" } = {}) {
  if (!unitId) return;

  const unitBlock = Array.from(document.querySelectorAll(".students-unit-block"))
    .find((block) => block.dataset.unitBlock === unitId);
  if (!unitBlock) return;

  const query = String(nome || cartao || "").trim();
  const unitUi = studentsUnitUiState(unitId);
  unitUi.query = query;
  unitUi.scrollLeft = 0;

  const input = unitBlock.querySelector(".students-search");
  if (input) input.value = query;
  filterStudentsInUnit(unitBlock, query);

  window.requestAnimationFrame(() => {
    unitBlock.scrollIntoView({ block: "start", behavior: prefersReducedMotion() ? "auto" : "smooth" });
    const scroller = unitBlock.querySelector(".students-scroll");
    if (!scroller) return;

    const state = getStudentsUnitState(unitBlock);
    const targetIndex = state?.filtered.findIndex((student) => {
      const sameCard = cartao && String(student.cartao || "") === String(cartao);
      const sameName = query && normalizeStudentSearch(student.nome || "") === normalizeStudentSearch(query);
      return sameCard || sameName;
    });

    if (targetIndex >= 0) {
      scroller.scrollLeft = Math.max(0, targetIndex * (STUDENT_CARD_WIDTH + STUDENT_CARD_GAP) - 12);
      unitUi.scrollLeft = scroller.scrollLeft;
      renderVirtualStudents(unitBlock);
    }
  });
}

function navegarParaAlunoDoPagamento({ unitId, nome = "", cartao = "" } = {}) {
  if (!unitId) return;

  const unitUi = studentsUnitUiState(unitId);
  unitUi.query = String(nome || cartao || "").trim();
  unitUi.scrollLeft = 0;

  pendingStudentFocus = { unitId, nome, cartao };
  setActiveTab("alunos", true, true);
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
    const unitUi = studentsUnitUiState(unitId);
    const query = unitUi.query || "";
    const normalizedQuery = normalizeStudentSearch(query);
    const filtered = normalizedQuery
      ? alunos.filter((student) => student._search.includes(normalizedQuery))
      : alunos;
    studentVirtualState.set(unitId, {
      students: alunos,
      filtered,
      query: normalizedQuery,
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
              value="${escapeHTML(query)}"
            />
          </label>
        </div>
        <div class="students-scroll"${filtered.length ? "" : " hidden"}>
          <div class="students-virtual-track">
            <div class="students-virtual-spacer" data-virtual-spacer="before" aria-hidden="true"></div>
            <div class="students-grid"></div>
            <div class="students-virtual-spacer" data-virtual-spacer="after" aria-hidden="true"></div>
          </div>
        </div>
        <p class="students-empty"${filtered.length ? " hidden" : ""}>Nenhum aluno encontrado.</p>
      </section>
    `;
  });

  container.innerHTML = html;
  container.querySelectorAll(".students-unit-block").forEach((unitBlock) => {
    const unitId = unitBlock.dataset.unitBlock;
    const scroller = unitBlock.querySelector(".students-scroll");
    if (scroller) scroller.scrollLeft = studentsUnitUiState(unitId).scrollLeft || 0;
    renderVirtualStudents(unitBlock);
  });
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

  container.addEventListener("click", (event) => {
    const card = event.target.closest("[data-student-card]");
    if (!card) return;
    openStudentModalByCard(card);
  });

  container.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;

    const card = event.target.closest("[data-student-card]");
    if (!card) return;
    event.preventDefault();
    openStudentModalByCard(card);
  });

  container.addEventListener("scroll", (event) => {
    const scroller = event.target.closest?.(".students-scroll");
    if (!scroller) return;

    const unitBlock = scroller.closest(".students-unit-block");
    if (!unitBlock) return;

    window.requestAnimationFrame(() => {
      studentsUnitUiState(unitBlock.dataset.unitBlock).scrollLeft = scroller.scrollLeft || 0;
      renderVirtualStudents(unitBlock);
    });
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

const TAB_ORDER = ["inicio", "financeiro", "alunos", "ia", "conta"];
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

  if (currentTab === "alunos") {
    saveStudentsPageState();
  }

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
      renderAlunosUnitsCards(true).then(() => {
        if (pendingStudentFocus) {
          const focus = pendingStudentFocus;
          pendingStudentFocus = null;
          focusStudentInUnit(focus);
          return;
        }

        restoreStudentsPageScroll();
      });
    } else {
      scrollActivePageToTop();
    }
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
// AI LAB CHAT
// ==========================
function renderAiMemoryPanel() {
  const count = qs("aiMemoryCount");
  const sync = qs("aiMemorySync");
  const syncText = qs("aiMemorySyncText");
  const summary = qs("aiMemorySummary");
  const facts = qs("aiMemoryFacts");
  const preferences = qs("aiMemoryPreferences");
  const gaps = qs("aiMemoryGaps");
  const gapCount = qs("aiMemoryGapCount");

  const rememberedCount = aiMemory.facts.length + aiMemory.preferences.length;
  if (count) count.textContent = String(rememberedCount);
  if (sync) sync.dataset.state = aiCloudSyncState;
  if (syncText) syncText.textContent = aiCloudSyncDetail;

  if (summary) {
    summary.textContent = aiMemory.summary || "Ainda não há anotações.";
    summary.classList.toggle("ai-memory-empty", !aiMemory.summary);
  }

  if (facts) {
    facts.innerHTML = aiMemory.facts.length
      ? aiMemory.facts.map((fact) => `
        <span class="ai-memory-chip">
          <strong>${escapeHTML(fact.key)}</strong>
          ${escapeHTML(fact.value)}
        </span>
      `).join("")
      : '<span class="ai-memory-chip-empty">Nenhum fato anotado.</span>';
  }

  if (preferences) {
    preferences.innerHTML = aiMemory.preferences.length
      ? aiMemory.preferences.map((preference) => `
        <span class="ai-memory-chip">${escapeHTML(preference)}</span>
      `).join("")
      : '<span class="ai-memory-chip-empty">Nenhuma preferência anotada.</span>';
  }

  const visibleGaps = [...aiMemory.dataGaps]
    .filter((gap) => gap.status !== "resolved")
    .sort((a, b) => Number(b.updatedAt) - Number(a.updatedAt))
    .slice(0, 10);
  if (gapCount) gapCount.textContent = String(visibleGaps.length);
  if (gaps) {
    gaps.innerHTML = visibleGaps.length
      ? visibleGaps.map((gap) => `
        <article class="ai-memory-gap">
          <strong>${escapeHTML(gap.summary)}</strong>
          ${gap.reason ? `<p>${escapeHTML(gap.reason)}</p>` : ""}
          ${gap.suggestedDatasets.length ? `
            <div class="ai-memory-gap-tags">
              ${gap.suggestedDatasets.map((dataset) => `<span>${escapeHTML(dataset)}</span>`).join("")}
            </div>
          ` : ""}
        </article>
      `).join("")
      : '<span class="ai-memory-chip-empty">Nenhuma lacuna registrada.</span>';
  }
}

function setAiMemoryPanelOpen(isOpen) {
  const panel = qs("aiMemoryPanel");
  const backdrop = qs("aiMemoryBackdrop");
  const toggle = qs("aiMemoryToggle");
  if (!panel || !backdrop || !toggle) return;

  panel.classList.toggle("is-hidden", !isOpen);
  backdrop.classList.toggle("is-hidden", !isOpen);
  panel.setAttribute("aria-hidden", String(!isOpen));
  toggle.setAttribute("aria-expanded", String(isOpen));

  if (isOpen) {
    renderAiMemoryPanel();
    qs("aiMemoryClose")?.focus({ preventScroll: true });
  } else {
    toggle.focus({ preventScroll: true });
  }
}

function setAiBusy(isBusy) {
  aiChatBusy = isBusy;
  const send = qs("aiChatSend");
  const input = qs("aiChatInput");
  if (send) send.disabled = isBusy;
  if (input) input.disabled = isBusy;
}

function isAiChatNearBottom() {
  const messages = qs("aiChatMessages");
  if (!messages) return true;
  return messages.scrollHeight - messages.scrollTop - messages.clientHeight < 96;
}

function scrollAiChatToBottom({ force = false } = {}) {
  const messages = qs("aiChatMessages");
  if (!messages) return;
  if (!force && !isAiChatNearBottom()) return;

  requestAnimationFrame(() => {
    messages.scrollTop = messages.scrollHeight;
  });
}

function appendAiMessage(role, text, { loading = false } = {}) {
  const messages = qs("aiChatMessages");
  if (!messages) return null;

  const item = document.createElement("article");
  item.className = `ai-message ai-message-${role}${loading ? " is-loading" : ""}`;
  item.dataset.rawText = text;

  const content = document.createElement("div");
  content.className = "ai-message-content";
  if (role === "assistant" && !loading) {
    content.innerHTML = renderBasicMarkdown(text);
  } else {
    content.textContent = text;
  }
  item.appendChild(content);
  if (role === "assistant" && !loading) {
    attachAiCopyButton(item, text);
  }
  messages.appendChild(item);
  scrollAiChatToBottom({ force: true });

  return item;
}

function trimAiHistory() {
  if (aiChatHistory.length > AI_CHAT_VISIBLE_MESSAGE_LIMIT) {
    aiChatHistory.splice(0, aiChatHistory.length - AI_CHAT_VISIBLE_MESSAGE_LIMIT);
  }
}

function aiUserStorageKey(baseKey, user = auth.currentUser) {
  const uid = String(user?.uid || "").trim();
  return uid ? `${baseKey}:${uid}` : `${baseKey}:anonymous`;
}

function loadAiChatHistory() {
  try {
    const raw = localStorage.getItem(aiUserStorageKey(AI_CHAT_HISTORY_KEY));
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter((item) => (
        (item?.role === "user" || item?.role === "assistant") &&
        typeof item.text === "string" &&
        item.text.trim()
      ))
      .slice(-AI_CHAT_VISIBLE_MESSAGE_LIMIT);
  } catch (error) {
    console.warn("Historico do chat IA invalido:", error);
    return [];
  }
}

function saveAiChatHistory() {
  try {
    trimAiHistory();
    localStorage.setItem(aiUserStorageKey(AI_CHAT_HISTORY_KEY), JSON.stringify(aiChatHistory));
  } catch (error) {
    console.warn("Falha ao salvar historico do chat IA:", error);
  }
}

function resetAiChatVisual(user = auth.currentUser) {
  const messages = qs("aiChatMessages");
  if (!messages) return;

  const firstName = String(user?.displayName || "").trim().split(/\s+/)[0];
  const greeting = firstName
    ? `Olá, ${firstName}. A IA do PhysikFlow está em fase de testes. Ela pode interpretar dados incorretamente, omitir informações ou apresentar conclusões imprecisas. Use as respostas como apoio e confirme decisões financeiras, operacionais e cadastrais nos dados oficiais do sistema. Como posso ajudar?`
    : "Olá. A IA do PhysikFlow está em fase de testes. Ela pode interpretar dados incorretamente, omitir informações ou apresentar conclusões imprecisas. Use as respostas como apoio e confirme decisões financeiras, operacionais e cadastrais nos dados oficiais do sistema. Como posso ajudar?";

  messages.innerHTML = "";
  appendAiMessage("assistant", greeting);
}

function restoreAiChatHistory(user = auth.currentUser) {
  const messages = qs("aiChatMessages");
  if (!messages) return;

  const restored = loadAiChatHistory();
  if (!restored.length) {
    resetAiChatVisual(user);
    return;
  }

  aiChatHistory.splice(0, aiChatHistory.length, ...restored);
  messages.innerHTML = "";
  restored.forEach((item) => appendAiMessage(item.role, item.text));
}

function createEmptyAiMemory() {
  return {
    schemaVersion: "1.0.0",
    summary: "",
    facts: [],
    preferences: [],
    dataGaps: [],
    updatedAt: 0
  };
}

function normalizeAiMemory(value) {
  const source = value && typeof value === "object" ? value : {};
  const facts = Array.isArray(source.facts)
    ? source.facts
      .filter((fact) => fact && typeof fact === "object" && String(fact.key || "").trim() && String(fact.value || "").trim())
      .map((fact) => ({
        key: String(fact.key).trim().slice(0, 80),
        value: String(fact.value).trim().slice(0, 500),
        source: String(fact.source || "user").trim().slice(0, 40),
        updatedAt: Number(fact.updatedAt) || Date.now()
      }))
      .slice(-AI_MEMORY_FACT_LIMIT)
    : [];

  const preferences = Array.isArray(source.preferences)
    ? source.preferences
      .map((item) => String(item || "").trim().slice(0, 500))
      .filter(Boolean)
      .slice(-AI_MEMORY_PREFERENCE_LIMIT)
    : [];

  const normalizedGaps = Array.isArray(source.dataGaps)
    ? source.dataGaps
      .filter((gap) => gap && typeof gap === "object" && String(gap.summary || gap.reason || "").trim())
      .map((gap) => ({
        id: String(gap.id || stableHash(`${gap.summary || ""}|${gap.reason || ""}|${gap.unitId || ""}`)),
        summary: String(gap.summary || "Dado necessário").trim().slice(0, 500),
        reason: String(gap.reason || "").trim().slice(0, 1000),
        suggestedDatasets: Array.isArray(gap.suggestedDatasets)
          ? gap.suggestedDatasets.map((item) => String(item || "").trim().slice(0, 120)).filter(Boolean).slice(0, 12)
          : [],
        unitId: String(gap.unitId || "").trim().slice(0, 120),
        status: String(gap.status || "open").trim().slice(0, 40),
        createdAt: Number(gap.createdAt) || Date.now(),
        updatedAt: Number(gap.updatedAt) || Date.now(),
        occurrences: Math.max(1, Number(gap.occurrences) || 1)
      }))
    : [];
  const dataGaps = Array.from(
    new Map(normalizedGaps.map((gap) => [gap.id, gap])).values()
  ).slice(-AI_MEMORY_GAP_LIMIT);

  return {
    schemaVersion: "1.0.0",
    summary: String(source.summary || "").trim().slice(0, 2000),
    facts,
    preferences,
    dataGaps,
    updatedAt: Number(source.updatedAt) || 0
  };
}

function loadAiMemoryLocal() {
  try {
    const raw = localStorage.getItem(aiUserStorageKey(AI_MEMORY_KEY));
    return normalizeAiMemory(raw ? JSON.parse(raw) : null);
  } catch (error) {
    console.warn("Memoria local da IA invalida:", error);
    return createEmptyAiMemory();
  }
}

function saveAiMemoryLocal() {
  try {
    localStorage.setItem(aiUserStorageKey(AI_MEMORY_KEY), JSON.stringify(aiMemory));
  } catch (error) {
    console.warn("Falha ao salvar memoria local da IA:", error);
  }
}

function aiMemoryForPrompt() {
  return {
    summary: aiMemory.summary,
    facts: aiMemory.facts.map(({ key, value }) => ({ key, value })),
    preferences: aiMemory.preferences
  };
}

function normalizedMemoryKey(value) {
  return normalizeStudentSearch(value).replace(/\s+/g, "_").slice(0, 80);
}

function mergeAiMemoryPatch(patch, { persistCloud = true } = {}) {
  if (!patch || typeof patch !== "object") return;

  const next = normalizeAiMemory(aiMemory);
  const summary = String(patch.summary || "").trim();
  if (summary) next.summary = summary.slice(0, 2000);

  const factsByKey = new Map(next.facts.map((fact) => [normalizedMemoryKey(fact.key), fact]));
  (Array.isArray(patch.facts) ? patch.facts : []).forEach((fact) => {
    const key = String(fact?.key || "").trim();
    const value = String(fact?.value || "").trim();
    const normalizedKey = normalizedMemoryKey(key);
    if (!normalizedKey || !value) return;
    factsByKey.set(normalizedKey, {
      key: key.slice(0, 80),
      value: value.slice(0, 500),
      source: String(fact?.source || "user").slice(0, 40),
      updatedAt: Date.now()
    });
  });
  next.facts = Array.from(factsByKey.values()).slice(-AI_MEMORY_FACT_LIMIT);

  const preferencesByKey = new Map(
    next.preferences.map((preference) => [normalizeStudentSearch(preference), preference])
  );
  (Array.isArray(patch.preferences) ? patch.preferences : []).forEach((item) => {
    const preference = String(item || "").trim().slice(0, 500);
    if (preference) preferencesByKey.set(normalizeStudentSearch(preference), preference);
  });
  next.preferences = Array.from(preferencesByKey.values()).slice(-AI_MEMORY_PREFERENCE_LIMIT);

  const gapsById = new Map(next.dataGaps.map((gap) => [gap.id, gap]));
  const addedGaps = [];
  (Array.isArray(patch.dataGaps) ? patch.dataGaps : []).forEach((item) => {
    const summary = String(item?.summary || "").trim().slice(0, 500);
    const reason = String(item?.reason || "").trim().slice(0, 1000);
    if (!summary && !reason) return;
    const unitId = String(item?.unitId || unidadeSelecionada || "").trim().slice(0, 120);
    const id = stableHash(`${normalizeStudentSearch(summary)}|${normalizeStudentSearch(reason)}|${unitId}`);
    const previous = gapsById.get(id);
    const gap = {
      id,
      summary: summary || "Dado necessário",
      reason,
      suggestedDatasets: Array.isArray(item?.suggestedDatasets)
        ? item.suggestedDatasets.map((dataset) => String(dataset || "").trim().slice(0, 120)).filter(Boolean).slice(0, 12)
        : [],
      unitId,
      status: "open",
      createdAt: previous?.createdAt || Date.now(),
      updatedAt: Date.now(),
      occurrences: (previous?.occurrences || 0) + 1
    };
    gapsById.set(id, gap);
    addedGaps.push(gap);
  });
  next.dataGaps = Array.from(gapsById.values())
    .sort((a, b) => Number(a.updatedAt) - Number(b.updatedAt))
    .slice(-AI_MEMORY_GAP_LIMIT);
  next.updatedAt = Date.now();

  aiMemory = next;
  saveAiMemoryLocal();
  renderAiMemoryPanel();

  if (persistCloud) {
    void persistAiMemoryCloud();
    if (addedGaps.length) void persistAiGapsCloud(addedGaps);
  }
}

function seedAiMemoryFromUser(user) {
  const displayName = String(user?.displayName || "").trim();
  if (!displayName) return;
  mergeAiMemoryPatch({
    facts: [{ key: "nome", value: displayName, source: "auth" }]
  });
}

function aiCloudUserPath(branch, user = auth.currentUser) {
  const uid = String(user?.uid || "").trim();
  return uid ? `${AI_CLOUD_ROOT}/${branch}/${uid}` : "";
}

function setAiCloudSyncState(state, detail = "") {
  aiCloudSyncState = state;
  aiCloudSyncDetail = detail || (state === "cloud" ? "Sincronizado na nuvem" : "Salvo neste dispositivo");
  renderAiMemoryPanel();
}

function setAiCloudSuccessState(detail) {
  const pending = loadAiCloudOutbox().length;
  if (pending) {
    setAiCloudSyncState("local", `${pending} mensagem(ns) aguardando sincronização`);
    return;
  }
  setAiCloudSyncState("cloud", detail);
}

function aiSessionDayKey(date = new Date()) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0")
  ].join("-");
}

function getAiCloudSessionId(user = auth.currentUser) {
  const uid = String(user?.uid || "").trim();
  if (!uid) return "";

  try {
    const raw = localStorage.getItem(aiUserStorageKey(AI_CLOUD_SESSION_KEY, user));
    const saved = raw ? JSON.parse(raw) : null;
    if (saved?.uid === uid && saved?.day === aiSessionDayKey() && saved?.id) {
      return String(saved.id);
    }
  } catch (error) {
    console.warn("Sessao local da IA invalida:", error);
  }

  const randomId = crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
  const id = `${aiSessionDayKey()}-${randomId}`.replace(/[^a-zA-Z0-9_-]/g, "");
  localStorage.setItem(aiUserStorageKey(AI_CLOUD_SESSION_KEY, user), JSON.stringify({
    id,
    uid,
    day: aiSessionDayKey(),
    createdAt: Date.now()
  }));
  return id;
}

async function ensureAiCloudSession(user = auth.currentUser, requestedSessionId = "") {
  if (!appAuthorized || !user?.uid) return "";
  const sessionId = requestedSessionId || getAiCloudSessionId(user);
  if (!sessionId) return "";
  if (aiCloudSessionReady && aiCloudSessionId === sessionId) return sessionId;

  const metaPath = `${aiCloudUserPath("conversations", user)}/${sessionId}/meta`;
  const metaRef = db.ref(metaPath);
  const snapshot = await metaRef.once("value");
  const commonMeta = {
    schemaVersion: "1.0.0",
    userUid: user.uid,
    userName: user.displayName || "",
    userEmail: user.email || "",
    unitId: unidadeSelecionada || "",
    appBuildId: APP_BUILD_ID,
    updatedAt: firebase.database.ServerValue.TIMESTAMP
  };

  if (snapshot.exists()) {
    await metaRef.update(commonMeta);
  } else {
    await metaRef.set({
      ...commonMeta,
      createdAt: firebase.database.ServerValue.TIMESTAMP,
      clientCreatedAt: new Date().toISOString()
    });
  }

  aiCloudSessionId = sessionId;
  aiCloudSessionReady = true;
  return sessionId;
}

function loadAiCloudOutbox(user = auth.currentUser) {
  try {
    const raw = localStorage.getItem(aiUserStorageKey(AI_CLOUD_OUTBOX_KEY, user));
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed)
      ? parsed.filter((item) => item?.id && item?.sessionId && item?.text)
      : [];
  } catch (error) {
    console.warn("Fila local da conversa IA invalida:", error);
    return [];
  }
}

function saveAiCloudOutbox(outbox, user = auth.currentUser) {
  try {
    localStorage.setItem(aiUserStorageKey(AI_CLOUD_OUTBOX_KEY, user), JSON.stringify(outbox));
  } catch (error) {
    console.warn("Falha ao salvar fila local da conversa IA:", error);
  }
}

function removeAiCloudOutboxItem(messageId, user = auth.currentUser) {
  saveAiCloudOutbox(
    loadAiCloudOutbox(user).filter((item) => item.id !== messageId),
    user
  );
}

async function flushAiCloudOutbox(user = auth.currentUser) {
  if (aiCloudOutboxFlushing || !appAuthorized || !user?.uid) return false;
  const initialOutbox = loadAiCloudOutbox(user);
  if (!initialOutbox.length) return true;
  const initialIds = new Set(initialOutbox.map((item) => item.id));

  aiCloudOutboxFlushing = true;
  try {
    for (const item of initialOutbox) {
      if (auth.currentUser?.uid !== user.uid) break;
      const sessionId = await ensureAiCloudSession(user, item.sessionId);
      if (!sessionId) break;

      const sessionPath = `${aiCloudUserPath("conversations", user)}/${sessionId}`;
      await db.ref(`${sessionPath}/meta`).update({
        updatedAt: firebase.database.ServerValue.TIMESTAMP,
        lastRole: item.role,
        lastMessagePreview: String(item.text).slice(0, 240),
        unitId: item.unitId || ""
      });

      const messageRef = db.ref(`${sessionPath}/messages/${item.id}`);
      try {
        await messageRef.set({
          schemaVersion: "1.0.0",
          role: item.role,
          text: item.text,
          source: item.source,
          status: item.status,
          unitId: item.unitId,
          createdAt: firebase.database.ServerValue.TIMESTAMP,
          clientCreatedAt: item.clientCreatedAt
        });
      } catch (writeError) {
        const existing = await messageRef.once("value").catch(() => null);
        if (!existing?.exists()) throw writeError;
      }

      removeAiCloudOutboxItem(item.id, user);
    }

    const remaining = loadAiCloudOutbox(user);
    if (remaining.length) {
      setAiCloudSyncState("local", `${remaining.length} mensagem(ns) aguardando sincronização`);
      if (!remaining.some((item) => initialIds.has(item.id))) {
        setTimeout(() => void flushAiCloudOutbox(user), 0);
      }
      return false;
    }

    setAiCloudSyncState("cloud", "Conversa sincronizada na nuvem");
    return true;
  } catch (error) {
    console.warn("Falha ao enviar fila da conversa IA:", error.code || error.message);
    const pending = loadAiCloudOutbox(user).length;
    setAiCloudSyncState("local", `${pending} mensagem(ns) aguardando regras ou conexão`);
    return false;
  } finally {
    aiCloudOutboxFlushing = false;
  }
}

function archiveAiCloudMessage(role, text, metadata = {}) {
  const user = auth.currentUser;
  if (!appAuthorized || !user?.uid || !String(text || "").trim()) return false;

  const sessionId = getAiCloudSessionId(user);
  const messageId = db.ref(`${AI_CLOUD_ROOT}/message_ids`).push().key
    || `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  const outbox = loadAiCloudOutbox(user);
  outbox.push({
    id: messageId,
    sessionId,
    role: role === "assistant" ? "assistant" : "user",
    text: String(text),
    source: String(metadata.source || "chat"),
    status: String(metadata.status || "ok"),
    unitId: unidadeSelecionada || "",
    clientCreatedAt: new Date().toISOString()
  });
  saveAiCloudOutbox(outbox, user);
  setAiCloudSyncState("local", `${outbox.length} mensagem(ns) aguardando sincronização`);
  return flushAiCloudOutbox(user);
}

async function persistAiMemoryCloud() {
  const user = auth.currentUser;
  const path = aiCloudUserPath("memory", user);
  if (!appAuthorized || !path) return false;

  try {
    await db.ref(path).set({
      schemaVersion: "1.0.0",
      summary: aiMemory.summary,
      facts: aiMemory.facts,
      preferences: aiMemory.preferences,
      updatedAt: firebase.database.ServerValue.TIMESTAMP,
      clientUpdatedAt: new Date().toISOString()
    });
    setAiCloudSuccessState("Memória sincronizada na nuvem");
    return true;
  } catch (error) {
    console.warn("Falha ao sincronizar memoria IA:", error.code || error.message);
    setAiCloudSyncState("local", "Memória salva apenas neste dispositivo");
    return false;
  }
}

async function persistAiGapsCloud(gaps) {
  const user = auth.currentUser;
  const path = aiCloudUserPath("gaps", user);
  if (!appAuthorized || !path || !Array.isArray(gaps) || !gaps.length) return false;

  const updates = {};
  gaps.forEach((gap) => {
    updates[gap.id] = {
      ...gap,
      userUid: user.uid,
      userName: user.displayName || "",
      updatedAt: firebase.database.ServerValue.TIMESTAMP,
      clientUpdatedAt: new Date().toISOString()
    };
  });

  try {
    await db.ref(path).update(updates);
    setAiCloudSuccessState("Lacunas de dados sincronizadas");
    return true;
  } catch (error) {
    console.warn("Falha ao sincronizar lacunas IA:", error.code || error.message);
    setAiCloudSyncState("local", "Lacunas salvas apenas neste dispositivo");
    return false;
  }
}

async function loadAiMemoryCloud(user = auth.currentUser) {
  const path = aiCloudUserPath("memory", user);
  if (!appAuthorized || !path) return null;

  try {
    const snapshot = await db.ref(path).once("value");
    return snapshot.exists() ? normalizeAiMemory(snapshot.val()) : null;
  } catch (error) {
    console.warn("Falha ao carregar memoria IA da nuvem:", error.code || error.message);
    setAiCloudSyncState("local", "Usando memória deste dispositivo");
    return null;
  }
}

async function loadAiGapsCloud(user = auth.currentUser) {
  const path = aiCloudUserPath("gaps", user);
  if (!appAuthorized || !path) return [];

  try {
    const snapshot = await db.ref(path).once("value");
    const value = snapshot.val();
    return value && typeof value === "object"
      ? normalizeAiMemory({ dataGaps: Object.values(value) }).dataGaps
      : [];
  } catch (error) {
    console.warn("Falha ao carregar lacunas IA da nuvem:", error.code || error.message);
    return [];
  }
}

async function initializeAiUserState(user) {
  if (!user?.uid || aiUserStateUid === user.uid) return;
  aiUserStateUid = user.uid;
  aiCloudSessionReady = false;
  aiCloudSessionId = "";
  aiChatHistory.splice(0);
  aiMemory = loadAiMemoryLocal();
  restoreAiChatHistory(user);
  renderAiMemoryPanel();

  const [cloudMemory, cloudGaps] = await Promise.all([
    loadAiMemoryCloud(user),
    loadAiGapsCloud(user)
  ]);
  if (cloudMemory && cloudMemory.updatedAt >= aiMemory.updatedAt) {
    aiMemory = normalizeAiMemory({
      ...cloudMemory,
      dataGaps: [...aiMemory.dataGaps, ...cloudGaps]
    });
    saveAiMemoryLocal();
  } else if (cloudGaps.length) {
    aiMemory = normalizeAiMemory({
      ...aiMemory,
      dataGaps: [...aiMemory.dataGaps, ...cloudGaps]
    });
    saveAiMemoryLocal();
  }

  seedAiMemoryFromUser(user);
  renderAiMemoryPanel();
  void ensureAiCloudSession(user)
    .then(async () => {
      const synced = await flushAiCloudOutbox(user);
      if (synced) setAiCloudSyncState("cloud", "Arquivo de conversa preparado");
    })
    .catch((error) => {
      console.warn("Arquivo de conversa IA indisponivel:", error.code || error.message);
      setAiCloudSyncState("local", "Publique as regras do Firebase para ativar a nuvem");
    });
}

function stableHash(input) {
  const text = String(input || "");
  let hash = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

function loadAiReplyCache() {
  try {
    const raw = localStorage.getItem(AI_REPLY_CACHE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch (error) {
    console.warn("Cache de respostas IA invalido:", error);
    return {};
  }
}

function saveAiReplyCache(cache) {
  try {
    const entries = Object.entries(cache)
      .filter(([, item]) => item?.text && Number(item.createdAt))
      .sort((a, b) => Number(b[1].createdAt) - Number(a[1].createdAt))
      .slice(0, AI_REPLY_CACHE_MAX_ENTRIES);

    localStorage.setItem(AI_REPLY_CACHE_KEY, JSON.stringify(Object.fromEntries(entries)));
  } catch (error) {
    console.warn("Falha ao salvar cache de respostas IA:", error);
  }
}

function aiReplyCacheKey({ message, context, modelPlan, history = [], memory = null }) {
  return stableHash(JSON.stringify({
    message: String(message || "").trim(),
    contextHash: stableHash(JSON.stringify(context || {})),
    historyHash: stableHash(JSON.stringify(history || [])),
    memoryHash: stableHash(JSON.stringify(memory || {})),
    models: modelPlan
  }));
}

function getCachedAiReply(cacheKey) {
  const cache = loadAiReplyCache();
  const item = cache[cacheKey];
  if (!item?.text || !Number(item.createdAt)) return "";

  if (Date.now() - Number(item.createdAt) > AI_REPLY_CACHE_TTL_MS) {
    delete cache[cacheKey];
    saveAiReplyCache(cache);
    return "";
  }

  return item.text;
}

function setCachedAiReply(cacheKey, text, model) {
  if (!text || !cacheKey) return;
  const cache = loadAiReplyCache();
  cache[cacheKey] = {
    text,
    model: model || "",
    createdAt: Date.now()
  };
  saveAiReplyCache(cache);
}

async function copyTextToClipboard(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  textarea.remove();
}

function attachAiCopyButton(message, text) {
  if (!message || message.querySelector(".ai-copy-btn")) return;

  const button = document.createElement("button");
  button.type = "button";
  button.className = "ai-copy-btn";
  button.innerHTML = `
    <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
    <span>Copiar</span>
  `;

  button.addEventListener("click", async () => {
    try {
      await copyTextToClipboard(message.dataset.rawText || text || "");
      button.classList.add("copied");
      button.querySelector("span").textContent = "Copiado";
      window.setTimeout(() => {
        button.classList.remove("copied");
        button.querySelector("span").textContent = "Copiar";
      }, 1400);
    } catch (error) {
      console.warn("Falha ao copiar mensagem:", error);
      button.querySelector("span").textContent = "Erro";
    }
  });

  message.appendChild(button);
}

function aiCommandHelp() {
  return [
    "**Comandos locais de teste**",
    "",
    "| Comando | O que faz |",
    "|---|---|",
    "| `/help` | Mostra esta lista. |",
    "| `/mock` | Gera uma resposta fake com Markdown completo, sem gastar Gemini. |",
    "| `/json` | Busca `manifest`, `daily_summary` e `finance_rollup` da unidade atual. |",
    "| `/json manifest` | Busca apenas `manifest.json`. |",
    "| `/json daily` | Busca apenas `daily_summary.json`. |",
    "| `/json finance` | Busca apenas `finance_rollup.json`. |",
    "| `/json students` | Testa o futuro `students_index.json`. |",
    "| `/json risk` | Testa o futuro `risk_alerts.json`. |",
    "| `/json all` | Testa todos os datasets conhecidos, inclusive os ainda planejados. |",
    "| `/context` | Mostra o contexto analitico que seria enviado para a IA. |",
    "| `/context compact` | Mostra a versao compactada que a chamada Gemini recebe. |",
    "| `/memory` | Abre o caderno com memória, preferências e dados faltantes. |",
    "| `/desktop <pedido>` | Gera um `desktop_request` para dados/acoes que dependem do app desktop. |",
    "",
    "Opcional: passe a unidade no final, por exemplo `/json finance 58780-000`, `/context 58780-000` ou `/context compact 58780-000`."
  ].join("\n");
}

function aiMockReply() {
  return [
    "## Mock local do chat",
    "",
    "Esta resposta **nao chamou o Gemini** e serve para testar visual.",
    "",
    "---",
    "",
    "### Lista",
    "",
    "- **Negrito** funcionando",
    "- _Italico_ funcionando",
    "- ~~Tachado~~ funcionando",
    "- `codigo inline` funcionando",
    "",
    "### Tabela",
    "",
    "| Grandeza | Simbolo | Unidade |",
    "|---|---|---|",
    "| Massa | $m$ | $\\text{kg}$ |",
    "| Forca | $F$ | $\\text{N}$ |",
    "| Energia | $E$ | $\\text{J}$ |",
    "",
    "### Bloco de codigo",
    "",
    "```json",
    JSON.stringify({
      type: "tool_call",
      tool: "get_dashboard_summary",
      args: { unitId: "demo" }
    }, null, 2),
    "```",
    "",
    "> Se isto apareceu formatado, o renderizador esta ok."
  ].join("\n");
}

function aiUnitIds() {
  return [...new Set([
    ...Object.keys(unitsMeta || {}),
    ...Object.keys(relatoriosPorUnidade || {})
  ])].filter(Boolean).sort((a, b) => nomeUnidade(a).localeCompare(nomeUnidade(b), "pt-BR"));
}

function resolveAiUnitId(input = "") {
  const requested = String(input || "").trim().toLowerCase();
  const unitIds = aiUnitIds();

  if (requested) {
    const direct = unitIds.find((unitId) => unitId.toLowerCase() === requested);
    if (direct) return direct;

    const byName = unitIds.find((unitId) => nomeUnidade(unitId).toLowerCase() === requested);
    if (byName) return byName;
  }

  if (unidadeSelecionada && unitIds.includes(unidadeSelecionada)) return unidadeSelecionada;
  return unitIds[0] || "";
}

function aiDatasetKeys(input = "") {
  const key = String(input || "").trim().toLowerCase();
  if (!key) return uniqueAnalyticsDatasetKeys(AI_ANALYTICS_BASE_KEYS);
  if (key === "all") return uniqueAnalyticsDatasetKeys(AI_ANALYTICS_ALL_KEYS);
  return AI_ANALYTICS_DATASETS[key] ? uniqueAnalyticsDatasetKeys([key]) : [];
}

function uniqueAnalyticsDatasetKeys(keys) {
  const seenFiles = new Set();
  return keys.filter((key) => {
    const fileName = AI_ANALYTICS_DATASETS[key];
    if (!fileName || seenFiles.has(fileName)) return false;
    seenFiles.add(fileName);
    return true;
  });
}

function datasetKeyFromAnalyticsPath(path = "") {
  const fileName = String(path || "").split("/").pop();
  return Object.keys(AI_ANALYTICS_DATASETS).find((key) => AI_ANALYTICS_DATASETS[key] === fileName) || "";
}

async function fetchAnalyticsDataset(unitId, datasetKey, config, bearerToken) {
  const fileName = AI_ANALYTICS_DATASETS[datasetKey];
  const ttl = Math.max(60, Math.min(Number(config.linkTtlSeconds) || 86400, 86400));
  const attempts = [];

  for (const physikUnitId of physikUnitIdCandidates(unitId)) {
    const objectId = `analytics/${physikUnitId}/${fileName}`;
    const linkUrl = physikServerObjectUrl(config, AI_ANALYTICS_AREA, objectId, ttl);
    attempts.push(objectId);

    try {
      const link = await fetchJsonWithTimeout(linkUrl, {
        headers: {
          Authorization: `Bearer ${bearerToken}`
        }
      }, FIREBASE_REST_TIMEOUT_MS);

      const signedUrl = resolvePhysikServerUrl(config, link?.urlPath);
      if (!signedUrl) {
        return { ok: false, datasetKey, fileName, attempts, error: "signed-url-ausente" };
      }

      const data = await fetchJsonWithTimeout(signedUrl, {}, FIREBASE_REST_TIMEOUT_MS);
      return { ok: true, datasetKey, fileName, objectId, data };
    } catch (error) {
      if (error?.status && error.status !== 404) {
        return {
          ok: false,
          datasetKey,
          fileName,
          attempts,
          error: error.status || error.code || error.message || "erro"
        };
      }
    }
  }

  return { ok: false, datasetKey, fileName, attempts, error: "nao-encontrado" };
}

async function fetchAnalyticsBundle(unitId, datasetKeys = AI_ANALYTICS_BASE_KEYS) {
  const config = await carregarPhysikServerConfig();
  const bearerToken = physikServerReadToken(config);

  if (!config || config.status !== "online" || !bearerToken) {
    return {
      ok: false,
      unitId,
      error: "physik-server-indisponivel",
      diagnostics: {
        config: config ? "ok" : "ausente",
        status: config?.status || "ausente",
        token: tokenDebug(bearerToken),
        erroConfig: physikServerConfigError || "nenhum"
      },
      results: []
    };
  }

  const results = await Promise.all(
    datasetKeys.map((key) => fetchAnalyticsDataset(unitId, key, config, bearerToken))
  );

  return {
    ok: results.some((result) => result.ok),
    unitId,
    error: "",
    diagnostics: null,
    results
  };
}

function datasetKeysFromAnalyticsManifest(manifest) {
  const keys = [...AI_ANALYTICS_BASE_KEYS];
  const datasets = manifest?.datasets;
  if (!datasets || typeof datasets !== "object") return uniqueAnalyticsDatasetKeys(keys);

  Object.entries(datasets).forEach(([name, meta]) => {
    const directKey = String(name || "").toLowerCase();
    if (AI_ANALYTICS_DATASETS[directKey]) keys.push(directKey);

    const pathKey = datasetKeyFromAnalyticsPath(meta?.path);
    if (pathKey) keys.push(pathKey);
  });

  return uniqueAnalyticsDatasetKeys(keys);
}

async function fetchAnalyticsContextBundle(unitId) {
  const baseBundle = await fetchAnalyticsBundle(unitId, AI_ANALYTICS_BASE_KEYS);
  if (!baseBundle.ok) return baseBundle;

  const manifest = analyticsDataByKind(baseBundle.results).analytics_manifest;
  const contextKeys = datasetKeysFromAnalyticsManifest(manifest);
  const baseFiles = new Set(baseBundle.results.map((result) => result.fileName));
  const extraKeys = contextKeys.filter((key) => !baseFiles.has(AI_ANALYTICS_DATASETS[key]));

  if (!extraKeys.length) return baseBundle;

  const extraBundle = await fetchAnalyticsBundle(unitId, extraKeys);
  return {
    ...baseBundle,
    ok: baseBundle.ok || extraBundle.ok,
    results: [...baseBundle.results, ...extraBundle.results]
  };
}

function summarizeAnalyticsPayload(data) {
  if (!data || typeof data !== "object") return String(data ?? "null");

  const keys = Object.keys(data);
  const summary = {};
  keys.slice(0, 10).forEach((key) => {
    const value = data[key];
    if (Array.isArray(value)) summary[key] = `array(${value.length})`;
    else if (value && typeof value === "object") summary[key] = `object(${Object.keys(value).length})`;
    else summary[key] = value;
  });

  return JSON.stringify(summary, null, 2);
}

function renderAnalyticsCommandResult(unitId, results) {
  const rows = results.map((result) => {
    const status = result.ok ? "OK" : "Falhou";
    const detail = result.ok ? result.objectId : `${result.error} (${(result.attempts || []).join(", ") || "sem tentativa"})`;
    return `| ${result.fileName} | ${status} | ${detail} |`;
  });

  const previews = results
    .filter((result) => result.ok)
    .map((result) => [
      `### ${result.fileName}`,
      "",
      "```json",
      summarizeAnalyticsPayload(result.data),
      "```"
    ].join("\n"));

  return [
    `## JSON analitico: ${nomeUnidade(unitId) || unitId}`,
    "",
    "| Dataset | Status | Detalhe |",
    "|---|---|---|",
    ...rows,
    "",
    previews.length ? previews.join("\n\n") : "> Nenhum dataset foi baixado com sucesso."
  ].join("\n");
}

async function handleAiJsonCommand(args) {
  const firstArg = String(args[0] || "").toLowerCase();
  const datasetKey = firstArg && AI_ANALYTICS_DATASETS[firstArg]
    ? String(args.shift()).toLowerCase()
    : (firstArg === "all" ? String(args.shift()).toLowerCase() : "");
  const datasetKeys = aiDatasetKeys(datasetKey);
  if (!datasetKeys.length) return `Comando desconhecido. Use:\n\n${aiCommandHelp()}`;

  const unitId = resolveAiUnitId(args.join(" "));
  if (!unitId) {
    return [
      "Nao encontrei nenhuma unidade carregada no PWA.",
      "",
      "Abra o app autenticado e aguarde os relatorios carregarem antes de usar `/json`."
    ].join("\n");
  }

  const bundle = await fetchAnalyticsBundle(unitId, datasetKeys);
  if (!bundle.ok && bundle.error === "physik-server-indisponivel") {
    return [
      "Nao consegui acessar o PhysikServer para buscar os JSONs analiticos.",
      "",
      "Detalhes tecnicos:",
      `- config: ${bundle.diagnostics.config}`,
      `- status: ${bundle.diagnostics.status}`,
      `- token: ${bundle.diagnostics.token}`,
      `- erroConfig: ${bundle.diagnostics.erroConfig}`
    ].join("\n");
  }

  return renderAnalyticsCommandResult(unitId, bundle.results);
}

function reportSnapshotForAi(unitId) {
  const report = relatoriosPorUnidade[unitId] || {};
  const resumo = report.resumo || {};
  const frequencia = report.frequencia || {};

  return {
    hasReport: Boolean(Object.keys(report).length),
    resumo: {
      alunos: Number(resumo.alunos) || 0,
      ativos: Number(resumo.ativos) || 0,
      atrasados: Number(resumo.atrasados) || 0,
      total30d: Number(resumo.total30d || resumo.total) || 0,
      ticketMedio30d: Number(resumo.ticketMedio30d) || 0,
      ticketMedioGeral: Number(resumo.ticketMedioGeral) || 0
    },
    frequencia: {
      mediaPorAluno30d: Number(frequencia.mediaPorAluno30d) || 0
    }
  };
}

function analyticsDataByKind(results) {
  const data = {};

  results.forEach((result) => {
    if (!result.ok) return;
    const kind = result.data?.kind || result.datasetKey;
    data[kind] = result.data;
  });

  return data;
}

function buildDesktopRequestTemplate({
  unitId,
  reason,
  missingData = [],
  suggestedDatasets = [],
  priority = "normal",
  expectedShape = null
} = {}) {
  const request = {
    type: "desktop_request",
    schemaVersion: "1.0.0",
    requestedAt: new Date().toISOString(),
    unitId: unitId || "",
    unitName: unitId ? nomeUnidade(unitId) : "",
    reason: reason || "O PWA nao tem dados suficientes para responder com seguranca.",
    missingData,
    suggestedDatasets,
    suggestedOwner: "PhysikFlow Desktop / report worker",
    priority,
    status: "draft"
  };

  if (expectedShape) request.expectedShape = expectedShape;
  return request;
}

function inferDesktopRequestNeeds(reason = "") {
  const normalized = String(reason || "").toLowerCase();

  if (/(evas|reten|retenc|risco|churn|abandono)/.test(normalized)) {
    return {
      priority: "high",
      missingData: [
        "students_index com id, nome, status, plano atual, vencimento e ultimo_acesso",
        "student_activity_rollup com frequencia por aluno em 7/30/60/90 dias",
        "student_finance_rollup com atraso, valor em aberto e historico resumido de pagamentos",
        "retention_summary com funil de risco por unidade",
        "risk_alerts com score, motivos e data de calculo por aluno"
      ],
      suggestedDatasets: [
        "students_index",
        "student_activity_rollup",
        "student_finance_rollup",
        "retention_summary",
        "risk_alerts"
      ],
      expectedShape: {
        datasets: {
          students_index: {
            path: "analytics/{unitId}/students_index.json",
            fields: ["studentId", "name", "status", "currentPlan", "dueDate", "lastAccessAt", "tags"]
          },
          risk_alerts: {
            path: "analytics/{unitId}/risk_alerts.json",
            fields: ["studentId", "riskScore", "riskLevel", "reasons", "recommendedAction", "calculatedAt"]
          },
          retention_summary: {
            path: "analytics/{unitId}/retention_summary.json",
            fields: ["period", "riskBuckets", "inactiveTrend", "recoveredStudents", "lostStudents"]
          }
        }
      }
    };
  }

  if (/(aluno|cliente|pessoa|buscar|encontrar|perfil)/.test(normalized)) {
    return {
      priority: "normal",
      missingData: [
        "students_index com campos seguros para busca e filtro no PWA",
        "get_student_snapshot sob demanda para detalhes de um aluno especifico"
      ],
      suggestedDatasets: ["students_index"],
      expectedShape: {
        datasets: {
          students_index: {
            path: "analytics/{unitId}/students_index.json",
            fields: ["studentId", "name", "status", "currentPlan", "dueDate", "lastAccessAt"]
          }
        },
        tools: ["get_student_snapshot"]
      }
    };
  }

  if (/(pagamento|receita|fatur|lucro|saiu|despesa|receber|inadimpl|atras|pix|cart|dinheiro|desconto|ticket)/.test(normalized)) {
    return {
      priority: "high",
      missingData: [
        "finance_periods com entradas por hoje/semana/quinzena/mes/ano",
        "receivables_rollup com valores a receber e vencidos",
        "payment_methods_rollup com dinheiro, Pix, cartao e outros metodos por periodo",
        "student_finance_rollup com inadimplentes e descontos por aluno",
        "cashflow_rollup e expense_rollup para responder lucro, nao apenas receita"
      ],
      suggestedDatasets: [
        "finance_periods",
        "receivables_rollup",
        "payment_methods_rollup",
        "student_finance_rollup",
        "cashflow_rollup",
        "expense_rollup"
      ],
      expectedShape: {
        datasets: {
          finance_periods: {
            path: "analytics/{unitId}/finance_periods.json",
            fields: ["today", "thisWeek", "thisFortnight", "thisMonth", "thisYear"]
          },
          receivables_rollup: {
            path: "analytics/{unitId}/receivables_rollup.json",
            fields: ["openTotal", "overdueTotal", "dueToday", "dueThisWeek"]
          },
          payment_methods_rollup: {
            path: "analytics/{unitId}/payment_methods_rollup.json",
            fields: ["period", "method", "count", "total"]
          }
        }
      }
    };
  }

  if (/(frequent|movimento|horario|domingo|sabado|segunda|manha|tarde|noite|catraca|academia agora|treinando|tempo medio|lotado)/.test(normalized)) {
    return {
      priority: "high",
      missingData: [
        "attendance_rollup com acessos por dia, semana, horario, turno e weekday",
        "student_activity_rollup com ultimo acesso, habitos e queda brusca de frequencia por aluno",
        "live_occupancy para perguntas sobre quem esta na academia agora",
        "training_duration_rollup para tempo medio e sessoes longas"
      ],
      suggestedDatasets: [
        "attendance_rollup",
        "student_activity_rollup",
        "live_occupancy",
        "training_duration_rollup"
      ],
      expectedShape: {
        datasets: {
          attendance_rollup: {
            path: "analytics/{unitId}/attendance_rollup.json",
            fields: ["periods", "byWeekday", "byHour", "byShift"]
          },
          student_activity_rollup: {
            path: "analytics/{unitId}/student_activity_rollup.json",
            fields: ["buckets", "topInactive", "habitSegments"]
          }
        },
        tools: ["get_students_by_attendance_window", "get_current_occupancy"]
      }
    };
  }

  if (/(campanha|lead|matricula|indic|oferta|upgrade|renova|promoc|experimental|diaria)/.test(normalized)) {
    return {
      priority: "normal",
      missingData: [
        "student_lifecycle_rollup com matriculas, cancelamentos e reativacoes",
        "renewals_rollup com vencimentos, renovacoes e nao renovados",
        "conversion_funnel com diaria/aula experimental/leads que viraram matricula",
        "marketing_attribution_rollup com origem/campanha das matriculas",
        "campaign_opportunities com alunos elegiveis para renovacao, upgrade, retorno e indicacao"
      ],
      suggestedDatasets: [
        "student_lifecycle_rollup",
        "renewals_rollup",
        "conversion_funnel",
        "marketing_attribution_rollup",
        "campaign_opportunities"
      ],
      expectedShape: {
        datasets: {
          campaign_opportunities: {
            path: "analytics/{unitId}/campaign_opportunities.json",
            fields: ["studentId", "opportunityType", "score", "reason", "recommendedOffer"]
          }
        }
      }
    };
  }

  if (/(funcionario|professor|turma|reclam|elog|satisf|equipamento|manutenc|operacional|meta|resumo completo|o que precisa ser feito)/.test(normalized)) {
    return {
      priority: "normal",
      missingData: [
        "staff_performance_rollup com matriculas e pagamentos por funcionario",
        "classes_rollup com turmas, professores e lotacao por horario",
        "feedback_rollup com reclamacoes, elogios e satisfacao",
        "equipment_rollup com chamados e manutencao",
        "goals_progress com metas e progresso",
        "daily_executive_summary com alertas e acoes recomendadas"
      ],
      suggestedDatasets: [
        "staff_performance_rollup",
        "classes_rollup",
        "feedback_rollup",
        "equipment_rollup",
        "operations_alerts",
        "goals_progress",
        "daily_executive_summary"
      ],
      expectedShape: {
        datasets: {
          daily_executive_summary: {
            path: "analytics/{unitId}/daily_executive_summary.json",
            fields: ["highlights", "alerts", "recommendedActions"]
          }
        }
      }
    };
  }

  return {
    priority: "normal",
    missingData: ["dados nao disponiveis no snapshot atual"],
    suggestedDatasets: ["students_index", "retention_summary", "risk_alerts"],
    expectedShape: null
  };
}

async function buildAiContext(unitInput = "") {
  const unitId = resolveAiUnitId(unitInput);
  const context = {
    schemaVersion: "1.0.0",
    kind: "physikflow_ai_context",
    generatedAt: new Date().toISOString(),
    activePage: getActivePageTab(),
    unit: unitId ? {
      id: unitId,
      name: nomeUnidade(unitId)
    } : null,
    availableUnits: aiUnitIds().map((id) => ({
      id,
      name: nomeUnidade(id)
    })),
    operationalSnapshot: unitId ? reportSnapshotForAi(unitId) : null,
    analyticsStatus: [],
    analytics: {},
    gaps: []
  };

  if (!unitId) {
    context.gaps.push("Nenhuma unidade carregada no PWA.");
    context.desktopRequestTemplate = buildDesktopRequestTemplate({
      reason: "PWA sem unidade carregada para montar contexto.",
      missingData: ["units", "reports"]
    });
    return context;
  }

  const bundle = await fetchAnalyticsContextBundle(unitId);
  context.analyticsStatus = bundle.results.map((result) => ({
    dataset: result.fileName,
    ok: result.ok,
    objectId: result.objectId || "",
    error: result.ok ? "" : result.error
  }));
  context.analytics = analyticsDataByKind(bundle.results);

  if (!context.analytics.daily_summary) context.gaps.push("daily_summary ausente.");
  if (!context.analytics.finance_rollup) context.gaps.push("finance_rollup ausente.");
  if (!context.analytics.analytics_manifest && !context.analytics.manifest) context.gaps.push("manifest analitico ausente.");
  if (!context.analytics.students_index) context.gaps.push("students_index ainda nao publicado; busca de alunos profunda continua limitada.");

  if (context.gaps.length) {
    context.desktopRequestTemplate = buildDesktopRequestTemplate({
      unitId,
      reason: "Complementar datasets analiticos para respostas mais profundas no PWA.",
      missingData: context.gaps,
      suggestedDatasets: [
        "students_index",
        "student_activity_rollup",
        "student_finance_rollup",
        "retention_summary",
        "risk_alerts"
      ]
    });
  }

  return context;
}

function compactArrayForAi(value, key, notes, path, depth) {
  const limit = AI_COMPACT_ARRAY_LIMITS[key] || AI_COMPACT_DEFAULT_ARRAY_LIMIT;
  const shouldKeepTail = key === "monthly" || key === "avulsosMonthly";
  const sliced = value.length > limit
    ? (shouldKeepTail ? value.slice(-limit) : value.slice(0, limit))
    : value;

  if (value.length > limit) {
    const kept = shouldKeepTail ? `ultimos ${limit}` : `primeiros ${limit}`;
    notes.push(`${path}: array(${value.length}) reduzido para ${kept}`);
  }

  return sliced.map((item, index) => compactValueForAi(item, String(index), notes, `${path}[${index}]`, depth + 1));
}

function compactValueForAi(value, key, notes, path, depth = 0) {
  if (Array.isArray(value)) {
    return compactArrayForAi(value, key, notes, path, depth);
  }

  if (!value || typeof value !== "object") return value;

  const keys = Object.keys(value);
  if (depth >= 7) {
    notes.push(`${path}: objeto profundo resumido`);
    return {
      __summary: "object",
      keys: keys.slice(0, 20)
    };
  }

  return keys.reduce((acc, childKey) => {
    const childPath = path ? `${path}.${childKey}` : childKey;
    acc[childKey] = compactValueForAi(value[childKey], childKey, notes, childPath, depth + 1);
    return acc;
  }, {});
}

function compactAiContextForGemini(context) {
  const notes = [];
  const compacted = compactValueForAi(context, "context", notes, "context");

  if (compacted && typeof compacted === "object" && !Array.isArray(compacted)) {
    compacted.contextDelivery = {
      compactedForGemini: true,
      outputTokenBudget: GEMINI_MAX_OUTPUT_TOKENS,
      note: "O comando /context mostra o contexto completo; a chamada Gemini recebe uma versao compactada para evitar cortes.",
      reductions: notes
    };
  }

  return compacted;
}

function contextSizeNote(context) {
  const bytes = new Blob([JSON.stringify(context)]).size;
  return `${bytes.toLocaleString("pt-BR")} bytes`;
}

async function handleAiContextCommand(args) {
  const normalizedArgs = [...args];
  const compactMode = normalizedArgs.some((arg) => String(arg || "").toLowerCase() === "compact");
  const unitInput = normalizedArgs
    .filter((arg) => String(arg || "").toLowerCase() !== "compact")
    .join(" ");
  const fullContext = await buildAiContext(unitInput);
  const context = compactMode ? compactAiContextForGemini(fullContext) : fullContext;

  return [
    `## Contexto IA: ${context.unit?.name || "sem unidade"}${compactMode ? " (compacto Gemini)" : ""}`,
    "",
    `Tamanho aproximado: ${contextSizeNote(context)}`,
    "",
    context.gaps.length
      ? `> Lacunas detectadas: ${context.gaps.join(" | ")}`
      : "> Contexto analitico basico disponivel.",
    "",
    "```json",
    JSON.stringify(context, null, 2),
    "```"
  ].join("\n");
}

function handleAiDesktopCommand(args) {
  const text = args.join(" ").trim();
  const unitId = resolveAiUnitId("");
  const inferred = inferDesktopRequestNeeds(text);
  const request = buildDesktopRequestTemplate({
    unitId,
    reason: text || "Gerar dados complementares para a IA do PWA.",
    missingData: inferred.missingData,
    suggestedDatasets: inferred.suggestedDatasets,
    priority: inferred.priority,
    expectedShape: inferred.expectedShape
  });

  return [
    "## Pedido para o app desktop",
    "",
    "Este JSON ainda nao executa nada. Ele serve como contrato para a proxima fase.",
    "",
    "```json",
    JSON.stringify(request, null, 2),
    "```"
  ].join("\n");
}

async function handleAiLocalCommand(message) {
  const text = String(message || "").trim();
  if (!text.startsWith("/")) return null;

  const [commandRaw, ...args] = text.split(/\s+/);
  const command = commandRaw.toLowerCase();

  if (command === "/help" || command === "/comandos") return aiCommandHelp();
  if (command === "/mock") return aiMockReply();
  if (command === "/json") return handleAiJsonCommand(args);
  if (command === "/context" || command === "/contexto") return handleAiContextCommand(args);
  if (command === "/memory" || command === "/memoria") {
    setAiMemoryPanelOpen(true);
    return "Abri o caderno da conversa. Ele mostra o que foi lembrado e quais dados ainda fizeram falta.";
  }
  if (command === "/desktop") return handleAiDesktopCommand(args);

  return [
    `Comando local desconhecido: \`${commandRaw}\``,
    "",
    aiCommandHelp()
  ].join("\n");
}

function updateAiLoadingMessage(element, text, isError = false, { forceScroll = false } = {}) {
  if (!element) return;
  const shouldStick = forceScroll || isAiChatNearBottom();
  element.classList.remove("is-loading");
  if (isError) element.classList.add("ai-message-error");
  element.dataset.rawText = text;
  const content = element.querySelector(".ai-message-content");
  if (content) {
    content.innerHTML = isError ? escapeHTML(text) : renderBasicMarkdown(text);
  }
  if (!isError) {
    attachAiCopyButton(element, text);
  }
  if (shouldStick) scrollAiChatToBottom({ force: true });
}

function extractGeminiText(data) {
  const parts = data?.candidates?.[0]?.content?.parts || [];
  return parts
    .map((part) => part?.text || "")
    .filter(Boolean)
    .join("\n")
    .trim();
}

function aiModelConversationHistory(history = aiChatHistory) {
  const selected = [];
  let usedCharacters = 0;

  [...history]
    .slice(-AI_MODEL_HISTORY_MESSAGE_LIMIT)
    .reverse()
    .forEach((item) => {
      const text = String(item?.text || "").trim().slice(0, 4000);
      if (!text || (item?.role !== "user" && item?.role !== "assistant")) return;
      if (usedCharacters + text.length > AI_MODEL_HISTORY_CHAR_LIMIT) return;
      selected.unshift({
        role: item.role === "assistant" ? "model" : "user",
        parts: [{ text }]
      });
      usedCharacters += text.length;
    });

  return selected;
}

function parseAiResponseEnvelope(text) {
  const raw = String(text || "");
  const metadataPattern = /<physikflow_meta>\s*(?:```json\s*)?([\s\S]*?)(?:```\s*)?<\/physikflow_meta>/i;
  const match = raw.match(metadataPattern);
  if (!match) {
    const metadataStart = raw.toLowerCase().indexOf("<physikflow_meta>");
    return {
      text: (metadataStart >= 0 ? raw.slice(0, metadataStart) : raw).trim(),
      memoryPatch: null
    };
  }

  let memoryPatch = null;
  try {
    const parsed = JSON.parse(match[1].trim());
    memoryPatch = parsed && typeof parsed === "object" ? parsed : null;
  } catch (error) {
    console.warn("Bloco interno de memoria IA invalido:", error.message);
  }

  return {
    text: raw.replace(metadataPattern, "").trim(),
    memoryPatch
  };
}

function createGeminiRequestBody(message, context = null, history = aiChatHistory, memory = aiMemoryForPrompt()) {
  const contextText = [
    "Memoria persistente sobre o usuario e suas preferencias:",
    "```json",
    JSON.stringify(memory || {}),
    "```",
    "",
    ...(context
      ? [
      "Contexto analitico disponivel no PWA:",
      "```json",
      JSON.stringify(context),
      "```",
        ""
      ]
      : []),
    "Pergunta atual do usuario:",
    message
  ].join("\n");

  return {
    systemInstruction: {
      parts: [{
        text: [
          "Voce e a IA em testes do portal PhysikFlow.",
          "Responda em portugues do Brasil, de forma clara e objetiva.",
          "Por padrao, limite respostas comuns a ate 500 palavras ou 8 bullets; aprofunde apenas quando o usuario pedir.",
          "Use apenas o contexto fornecido pelo PWA e deixe claro quando uma conclusao for limitada pelos dados disponiveis.",
          "Nao invente dados de alunos, pagamentos, auditoria ou historico se eles nao estiverem no contexto.",
          "Se a pergunta exigir dados que dependem do app desktop ou de datasets ainda ausentes, responda de forma util e inclua um bloco JSON `desktop_request` sugerindo o que o desktop deve gerar.",
          "Use a memoria e o historico recente para manter continuidade natural, sem repetir perguntas ja respondidas.",
          "Ao final de toda resposta, acrescente um bloco interno `<physikflow_meta>` com JSON compacto e depois feche com `</physikflow_meta>`.",
          "O JSON interno deve ter apenas `summary`, `facts`, `preferences` e `dataGaps`.",
          "`summary` deve ser um resumo curto e atualizado do que e util lembrar sobre o usuario.",
          "`facts` deve conter somente fatos que o proprio usuario declarou claramente, como nome, funcao ou unidade; nunca deduza dados sensiveis.",
          "`preferences` deve conter preferencias de comunicacao ou trabalho expressas pelo usuario.",
          "`dataGaps` deve ser preenchido apenas quando a resposta ficou limitada por dados ausentes, usando objetos com `summary`, `reason`, `suggestedDatasets` e `unitId`.",
          "Use arrays vazios quando nao houver novidade e nao explique nem mencione o bloco interno na resposta.",
          "Nao mencione tokens, chaves ou detalhes internos de seguranca."
        ].join(" ")
      }]
    },
    contents: [
      ...aiModelConversationHistory(history),
      {
        role: "user",
        parts: [{ text: contextText }]
      }
    ],
    generationConfig: {
      maxOutputTokens: GEMINI_MAX_OUTPUT_TOKENS
    }
  };
}

function uniqueGeminiModels(models) {
  const seen = new Set();
  return models
    .map((model) => String(model || "").trim())
    .filter((model) => {
      if (!model || seen.has(model)) return false;
      seen.add(model);
      return true;
    });
}

function geminiModelPlan(config) {
  return uniqueGeminiModels([
    config?.model,
    ...(config?.fallbackModels || []),
    ...GEMINI_DEFAULT_FALLBACK_MODELS
  ]);
}

function geminiGenerateEndpointForModel(model) {
  return `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;
}

function geminiGenerateEndpoint(config) {
  return geminiGenerateEndpointForModel(config.model);
}

function geminiStreamEndpoint(config) {
  return `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(config.model)}:streamGenerateContent?alt=sse`;
}

function geminiFinishNotice(finishReason) {
  if (!finishReason || finishReason === "STOP") return "";

  if (finishReason === "MAX_TOKENS") {
    return `\n\n> Resposta interrompida pelo limite de tokens da API (${GEMINI_MAX_OUTPUT_TOKENS}). O contexto ja foi compactado para reduzir esse risco; se repetir, peca uma resposta mais curta ou use /desktop para solicitar um dataset mais especifico.`;
  }

  return `\n\n> Resposta encerrada pela API. finishReason: ${finishReason}`;
}

function geminiShouldFallback(error) {
  if (!error) return false;
  if (error.status === 401 || error.status === 403 || error.apiStatus === "UNAUTHENTICATED") return false;

  return (
    [400, 404, 408, 409, 429, 500, 502, 503, 504].includes(Number(error.status)) ||
    ["INVALID_ARGUMENT", "NOT_FOUND", "RESOURCE_EXHAUSTED", "ABORTED", "UNAVAILABLE", "DEADLINE_EXCEEDED", "INTERNAL"].includes(error.apiStatus)
  );
}

async function callGeminiModel({ apiKey, model, message, context, history, memory }) {
  const response = await fetch(geminiGenerateEndpointForModel(model), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-goog-api-key": apiKey
    },
    body: JSON.stringify(createGeminiRequestBody(message, context, history, memory))
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data?.error?.message || `HTTP ${response.status}`);
    error.status = response.status;
    error.reason = data?.error?.details?.find((detail) => detail?.reason)?.reason || "";
    error.apiStatus = data?.error?.status || "";
    error.model = model;
    throw error;
  }

  return {
    text: extractGeminiText(data) || "Recebi, mas a resposta veio vazia.",
    finishReason: data?.candidates?.[0]?.finishReason || "",
    model
  };
}

async function requestGeminiChatReply(message, options = {}) {
  const config = await carregarGeminiConfig();
  if (!config) {
    const error = new Error(geminiConfigError || "gemini-config-missing");
    error.reason = geminiConfigError || "gemini-config-missing";
    throw error;
  }

  const context = compactAiContextForGemini(await buildAiContext());
  const modelPlan = geminiModelPlan(config);
  const history = aiChatHistory.slice();
  const memory = aiMemoryForPrompt();
  const cacheKey = aiReplyCacheKey({ message, context, modelPlan, history, memory });

  if (options.useCache !== false) {
    const cached = getCachedAiReply(cacheKey);
    if (cached) return cached;
  }

  const errors = [];
  for (const model of modelPlan) {
    try {
      const result = await callGeminiModel({
        apiKey: config.apiKey,
        model,
        message,
        context,
        history,
        memory
      });
      const reply = result.text + geminiFinishNotice(result.finishReason);
      if (!result.finishReason || result.finishReason === "STOP") {
        setCachedAiReply(cacheKey, reply, result.model);
      }
      return reply;
    } catch (error) {
      errors.push(error);
      if (!geminiShouldFallback(error)) throw error;
    }
  }

  const lastError = errors[errors.length - 1] || new Error("gemini-failed");
  lastError.fallbackAttempts = errors.map((error) => ({
    model: error.model || "",
    status: error.status || "",
    apiStatus: error.apiStatus || "",
    reason: error.reason || "",
    message: error.message || ""
  }));
  throw lastError;
}

function geminiUserErrorMessage(error) {
  const fallbackAttempts = Array.isArray(error?.fallbackAttempts)
    ? error.fallbackAttempts.map((attempt) => [
      attempt.model ? `model=${attempt.model}` : "",
      attempt.status ? `status=${attempt.status}` : "",
      attempt.apiStatus ? `apiStatus=${attempt.apiStatus}` : "",
      attempt.reason ? `reason=${attempt.reason}` : "",
      attempt.message ? `message=${attempt.message}` : ""
    ].filter(Boolean).join(" | ")).filter(Boolean)
    : [];
  const details = [
    error?.status ? `status: ${error.status}` : "",
    error?.apiStatus ? `apiStatus: ${error.apiStatus}` : "",
    error?.reason ? `reason: ${error.reason}` : "",
    error?.model ? `model: ${error.model}` : "",
    error?.message ? `message: ${error.message}` : "",
    ...fallbackAttempts.map((attempt) => `fallback: ${attempt}`)
  ].filter(Boolean);

  const technical = details.length
    ? ["", "Detalhes tecnicos:", ...details.map((detail) => `- ${detail}`)].join("\n")
    : "";

  if (error?.reason === "config-null" || error?.reason === "config-invalida" || error?.reason === "gemini-config-missing") {
    return [
      "A IA ainda nao encontrou uma configuracao valida no Firebase.",
      "",
      "Confira `/app_config/gemini` com `enabled`, `apiKey` e `model`.",
      technical
    ].join("\n");
  }

  if (error?.status === 401 || error?.apiStatus === "UNAUTHENTICATED") {
    return [
      "A chave Gemini configurada no portal foi recusada pela API.",
      "",
      "Confira se a chave publicada em `/app_config/gemini/apiKey` esta ativa no Google AI Studio.",
      technical
    ].join("\n");
  }

  if (error?.status === 403 || error?.reason === "API_KEY_SERVICE_BLOCKED") {
    return [
      "A chave foi reconhecida, mas o acesso ao Gemini esta bloqueado neste projeto.",
      "",
      "Verifique se a Generative Language API esta ativa para essa chave.",
      technical
    ].join("\n");
  }

  return [
    "Nao consegui responder agora. Tente novamente em instantes.",
    technical
  ].join("\n");
}

function parseGeminiSseChunk(buffer, onText, onFinish) {
  const events = buffer.split(/\n\n/);
  const rest = events.pop() || "";

  events.forEach((eventBlock) => {
    const dataLines = eventBlock
      .split(/\n/)
      .map((line) => line.trim())
      .filter((line) => line.startsWith("data:"))
      .map((line) => line.replace(/^data:\s?/, ""));

    if (!dataLines.length) return;

    const payload = dataLines.join("\n");
    if (payload === "[DONE]") return;

    try {
      const data = JSON.parse(payload);
      const text = extractGeminiText(data);
      if (text) onText(text);
      const finishReason = data?.candidates?.[0]?.finishReason;
      if (finishReason) onFinish(finishReason);
    } catch (error) {
      console.warn("Gemini stream parse error:", error);
    }
  });

  return rest;
}

async function requestGeminiChatReplyStream(message, onUpdate) {
  if (!GEMINI_STREAM_ENABLED) {
    const fallback = await requestGeminiChatReply(message);
    onUpdate(fallback);
    return fallback;
  }

  if (sessionStorage.getItem(GEMINI_STREAM_UNAVAILABLE_KEY) === "1") {
    const fallback = await requestGeminiChatReply(message);
    onUpdate(fallback);
    return fallback;
  }

  const config = await carregarGeminiConfig();
  if (!config) {
    const error = new Error(geminiConfigError || "gemini-config-missing");
    error.reason = geminiConfigError || "gemini-config-missing";
    throw error;
  }

  let response;
  try {
    const context = compactAiContextForGemini(await buildAiContext());
    const history = aiChatHistory.slice();
    const memory = aiMemoryForPrompt();
    response = await fetch(geminiStreamEndpoint(config), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-goog-api-key": config.apiKey
      },
      body: JSON.stringify(createGeminiRequestBody(message, context, history, memory))
    });
  } catch (error) {
    console.warn("Gemini stream unavailable, falling back:", error);
    const fallback = await requestGeminiChatReply(message);
    onUpdate(fallback);
    return fallback;
  }

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    if (response.status === 401 || response.status === 403) {
      sessionStorage.setItem(GEMINI_STREAM_UNAVAILABLE_KEY, "1");
    }
    console.warn("Gemini stream unavailable, falling back:", data?.error?.message || response.status);
    const fallback = await requestGeminiChatReply(message);
    onUpdate(fallback);
    return fallback;
  }

  if (!response.body) {
    const fallback = await requestGeminiChatReply(message);
    onUpdate(fallback);
    return fallback;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let fullText = "";
  let finishReason = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true }).replace(/\r\n/g, "\n");
    buffer = parseGeminiSseChunk(
      buffer,
      (text) => {
        fullText += text;
        onUpdate(fullText);
      },
      (reason) => {
        finishReason = reason;
      }
    );
  }

  buffer += decoder.decode();
  parseGeminiSseChunk(
    `${buffer}\n\n`,
    (text) => {
      fullText += text;
      onUpdate(fullText);
    },
    (reason) => {
      finishReason = reason;
    }
  );

  if (!fullText.trim()) {
    const fallback = await requestGeminiChatReply(message);
    onUpdate(fallback);
    return fallback;
  }

  return fullText + geminiFinishNotice(finishReason);
}

async function handleAiChatSubmit(event) {
  event.preventDefault();
  if (aiChatBusy) return;

  const input = qs("aiChatInput");
  const message = input?.value.trim();
  if (!message) return;

  input.value = "";
  input.style.height = "";
  appendAiMessage("user", message);
  const loading = appendAiMessage("assistant", "Pensando...", { loading: true });
  setAiBusy(true);
  void archiveAiCloudMessage("user", message, { source: "chat" });

  try {
    const localReply = await handleAiLocalCommand(message);
    const rawReply = localReply ?? await requestGeminiChatReplyStream(message, (partialReply) => {
      updateAiLoadingMessage(loading, parseAiResponseEnvelope(partialReply).text, false);
    });
    const parsedReply = localReply
      ? { text: rawReply, memoryPatch: null }
      : parseAiResponseEnvelope(rawReply);
    const reply = parsedReply.text || "Recebi sua mensagem, mas a resposta veio vazia.";

    if (parsedReply.memoryPatch) {
      mergeAiMemoryPatch(parsedReply.memoryPatch);
    }

    aiChatHistory.push({ role: "user", text: message }, { role: "assistant", text: reply });
    saveAiChatHistory();
    updateAiLoadingMessage(loading, reply);
    void archiveAiCloudMessage("assistant", reply, {
      source: localReply ? "local-command" : "gemini"
    });
  } catch (error) {
    console.error("Gemini chat error:", error);
    const errorReply = geminiUserErrorMessage(error);
    updateAiLoadingMessage(
      loading,
      errorReply,
      true
    );
    void archiveAiCloudMessage("assistant", errorReply, {
      source: "gemini",
      status: "error"
    });
  } finally {
    setAiBusy(false);
    input?.focus();
  }
}

function setupAiChat() {
  const form = qs("aiChatForm");
  const input = qs("aiChatInput");
  if (!form || !input) return;

  document.querySelectorAll(".ai-message-assistant:not(.is-loading)").forEach((message) => {
    const content = message.querySelector(".ai-message-content");
    const text = message.dataset.rawText || content?.textContent || "";
    message.dataset.rawText = text;
    attachAiCopyButton(message, text);
  });

  renderAiMemoryPanel();
  form.addEventListener("submit", handleAiChatSubmit);
  qs("aiMemoryToggle")?.addEventListener("click", () => setAiMemoryPanelOpen(true));
  qs("aiMemoryClose")?.addEventListener("click", () => setAiMemoryPanelOpen(false));
  qs("aiMemoryBackdrop")?.addEventListener("click", () => setAiMemoryPanelOpen(false));

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && qs("aiMemoryPanel")?.getAttribute("aria-hidden") === "false") {
      setAiMemoryPanelOpen(false);
    }
  });

  window.addEventListener("online", () => {
    if (appAuthorized) void flushAiCloudOutbox();
  });

  input.addEventListener("input", () => {
    input.style.height = "auto";
    input.style.height = `${Math.min(input.scrollHeight, 128)}px`;
  });

  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      form.requestSubmit();
    }
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
  stopFirebaseRealtimeSync();
  localStorage.removeItem(CACHE_KEY);
  localStorage.removeItem(AI_REPLY_CACHE_KEY);
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
          key.startsWith("relatorio-r1-prod-") ||
          key.startsWith("relatorio-r1-v") ||
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
  stopFirebaseRealtimeSync();
  aiUserStateUid = "";
  aiCloudSessionId = "";
  aiCloudSessionReady = false;
  aiChatHistory.splice(0);
  aiMemory = createEmptyAiMemory();
  setAiCloudSyncState("local", "Entre para sincronizar a memória");
  resetAiChatVisual(null);
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
  await initializeAiUserState(user);
  setText("statusCache", "carregando");
  updateSyncDot("carregando");

  const cache = carregarCache();
  if (cache) {
    aplicarRelatorios(cache);
    setText("statusCache", "cache local");
    updateSyncDot("cache local");
  } else {
    setText("statusCache", "carregando");
    updateSyncDot("carregando");
  }

  startFirebaseRealtimeSync();
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
  setupAiChat();
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
