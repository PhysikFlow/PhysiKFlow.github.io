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
  "58970-000": "Conceição"
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
  return nomeUnidade(unitId);
}

function limparDashboard(message = "Sem dados carregados.") {
  setText("totalGeralHero", formatBRL(0));
  setText("totalGeral", formatBRL(0));
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
  setText("horaPico", "--:00");
  setText("mediaPico", "--");
  setText("horaVale", "--:00");
  setText("mediaVale", "--");
  setText("janelaDias", "-- dias");
  setText("versaoRelatorio", "v--");
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

  const horas = qs("graficoHoras");
  if (horas) horas.innerHTML = `<div class="mini-note">${message}</div>`;
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
  aplicarFrequencia(data.frequencia || {});
  aplicarMensal(data.mesAMes || {});
  aplicarHoras(data.picoHoras || {});
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
  const ticket30 = resumo.ticketMedio30d || 0;
  const ticketGeral = resumo.ticketMedioGeral || 0;

  setText("totalGeralHero", formatBRL(totalGeral));
  setText("totalGeral", formatBRL(totalGeral));
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

  const bars = document.querySelectorAll(".progress-line .bar i");
  if (bars[0]) bars[0].style.width = pctAtivos + "%";
  if (bars[1]) bars[1].style.width = pctAtrasados + "%";
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
      <g class="${className}" tabindex="0"
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
  const tbody = qs("rankingPessoas");
  if (!tbody) return;

  const pessoas = toArray(topPessoas);
  tbody.innerHTML = "";

  if (!pessoas.length) {
    tbody.innerHTML = '<tr><td colspan="3" class="mini-note">Sem dados carregados.</td></tr>';
    return;
  }

  pessoas.forEach((pessoa, idx) => {
    const codigo = pessoa.codigo || pessoa.id || "-";
    const nome = pessoa.nome || `Pessoa ${codigo}`;
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>
        <strong class="person-name">${escapeHTML(nome)}</strong>
        <span class="person-code">#${escapeHTML(codigo)}</span>
      </td>
      <td>${formatBRL(pessoa.total)}</td>
      <td><span class="badge">Top ${idx + 1} - ${formatPercent(pessoa.percentual, 2)}</span></td>
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
      tabindex="0"
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
  setText("janelaDias", meta.janelaDias ? `${meta.janelaDias} dias` : "-- dias");
  setText("versaoRelatorio", meta.versao ? `v${meta.versao}` : "v--");
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
