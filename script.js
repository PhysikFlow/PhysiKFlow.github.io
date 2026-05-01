const API_URL = "https://itemdest-default-rtdb.firebaseio.com/relatorios.json";

// ==========================
// CONFIG
// ==========================
const CACHE_KEY = "relatorio_cache_v1";
const CACHE_TTL = 1000 * 60 * 60 * 6; // 6 HORAS

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
    minimumFractionDigits: 2
  });
};

// ==========================
// CACHE
// ==========================
function salvarCache(data) {
  const payload = {
    t: Date.now(),
    d: data
  };
  localStorage.setItem(CACHE_KEY, JSON.stringify(payload));
}

function carregarCache() {
  const raw = localStorage.getItem(CACHE_KEY);
  if (!raw) return null;

  try {
    const obj = JSON.parse(raw);

    // verifica TTL
    if (Date.now() - obj.t > CACHE_TTL) {
      return null;
    }

    return obj.d;
  } catch {
    return null;
  }
}

// ==========================
// FETCH
// ==========================
async function buscarFirebase() {
  try {
    const res = await fetch(API_URL);

    if (!res.ok) throw new Error("HTTP " + res.status);

    const data = await res.json();

    if (!data) throw new Error("sem dados");

    salvarCache(data);

    aplicarTudo(data);

    console.log("✔ atualizado do Firebase");

  } catch (err) {
    console.warn("⚠ usando cache (erro fetch):", err.message);
  }
}

// ==========================
// APLICAÇÃO
// ==========================
function aplicarTudo(data) {
  aplicarResumo(data.resumo || {});
  aplicarMensal(data.mesAMes || {});
  aplicarRanking(data.topPessoas || []);
  aplicarDistribuicao(data.topPlanosGlobal || []);
  atualizarSync(data.meta || {});
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

  // Percentuais
  if (alunos > 0) {
    const pctAtivos = Math.round((ativos / alunos) * 100);
    const pctAtrasados = Math.round((atrasados / alunos) * 100);
    setText("pctAtivos", pctAtivos + "%");
    setText("pctAtrasados", pctAtrasados + "%");
  }
}

// ==========================
// MENSAL
// ==========================
function aplicarMensal(mesAMes) {
  const container = qs("graficoMensal");
  if (!container) return;

  container.innerHTML = "";

  const entries = Object.entries(mesAMes);
  if (!entries.length) return;

  // ordena YYYY-MM corretamente
  entries.sort((a, b) => a[0].localeCompare(b[0]));

  const valores = entries.map(e => e[1]);
  const max = Math.max(...valores, 1);

  for (const [mes, valor] of entries) {
    const percent = (valor / max) * 100;

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

  tbody.innerHTML = "";

  if (!topPessoas || !topPessoas.length) {
    tbody.innerHTML = '<tr><td colspan="3" class="mini-note">Sem dados carregados.</td></tr>';
    return;
  }

  topPessoas.forEach((pessoa, idx) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>#${pessoa.id}</td>
      <td>${formatBRL(pessoa.total)}</td>
      <td><span class="badge">Top ${idx + 1}</span></td>
    `;
    tbody.appendChild(tr);
  });
}

// ==========================
// DISTRIBUIÇÃO
// ==========================
function aplicarDistribuicao(topPlanos) {
  const container = qs("listaValores");
  if (!container) return;

  container.innerHTML = "";

  if (!topPlanos || !topPlanos.length) {
    container.innerHTML = '<div class="list-item"><strong>Sem dados</strong><span>aguardando carregamento</span></div>';
    return;
  }

  // agrupa por valor
  const mapa = {};
  topPlanos.forEach(plano => {
    const valor = plano.valor;
    if (!mapa[valor]) {
      mapa[valor] = 0;
    }
    mapa[valor] += plano.qtd || 0;
  });

  // ordena por quantidade DESC
  const sorted = Object.entries(mapa).sort((a, b) => b[1] - a[1]);

  sorted.forEach(([valor, qtd]) => {
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
  const timestamp = meta.lastUpdate || Date.now();
  const data = new Date(timestamp);
  const formatted = data.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });

  setText("ultimaSync", formatted);
  setText("statusCache", "ativo");
}

// ==========================
// INIT
// ==========================
function init() {
  // 1. tenta cache (instantâneo)
  const cache = carregarCache();

  if (cache) {
    aplicarTudo(cache);

    // opcional: atualizar em background sem pressa
    setTimeout(buscarFirebase, 2000);

    console.log("⚡ carregado do cache");
  } else {
    // sem cache → busca direto
    buscarFirebase();
  }
}


// ==========================
// START
// ==========================
document.addEventListener("DOMContentLoaded", init);