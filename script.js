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
  aplicarMensal(data.mensal || {});
}

// ==========================
// RESUMO
// ==========================
function aplicarResumo(resumo) {
  const financeiro = resumo.financeiro || {};
  const alunos = resumo.alunos || {};

  const totalGeral = financeiro.totalGeral || 0;

  setText("totalGeralHero", formatBRL(totalGeral));
  setText("totalGeral", formatBRL(totalGeral));
  setText("totalAtrasados", alunos.atrasados || 0);

  // estimativas leves (sem custo backend)
  setText("total30", formatBRL(totalGeral * 0.1));
  setText("total3m", formatBRL(totalGeral * 0.3));
}

// ==========================
// MENSAL
// ==========================
function aplicarMensal(mensal) {
  const container = qs("graficoMensal");
  if (!container) return;

  container.innerHTML = "";

  const entries = Object.entries(mensal);
  if (!entries.length) return;

  // ordena YYYY-MM corretamente
  entries.sort((a, b) => a[0].localeCompare(b[0]));

  const valores = entries.map(e => e[1].valor || 0);
  const max = Math.max(...valores, 1);

  for (const [mes, obj] of entries) {
    const valor = obj.valor || 0;
    const percent = (valor / max) * 100;

    const row = document.createElement("div");
    row.className = "chart-row";

    row.innerHTML = `
      <div class="chart-label">${mes}</div>
      <div class="chart-track">
        <div class="chart-fill" style="width:${percent}%"></div>
      </div>
      <div class="chart-label">${valor}</div>
    `;

    container.appendChild(row);
  }
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
// THEME
// ==========================
const themeBtn = document.getElementById("themeToggle");

if (themeBtn) {
  themeBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark");
  });
}

// ==========================
// START
// ==========================
document.addEventListener("DOMContentLoaded", init);