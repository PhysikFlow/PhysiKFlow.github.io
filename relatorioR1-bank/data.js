/* PhysikFlow Gestão — Firebase + renderização */
(() => {
  const API_URL = "https://itemdest-default-rtdb.firebaseio.com/relatorios.json";
  const firebaseConfig = {
    apiKey: "AIzaSyDyyExbjOq0RJIxFfz8a2ghFgr0reJYdOI",
    authDomain: "itemdest.firebaseapp.com",
    databaseURL: "https://itemdest-default-rtdb.firebaseio.com",
    projectId: "itemdest",
    storageBucket: "itemdest.firebasestorage.app",
    messagingSenderId: "145242057741",
    appId: "1:145242057741:web:dfc986550ac1a3d007b944"
  };

  const CACHE_KEY = "relatorio_cache_v2";
  const SELECTED_UNIT_KEY = "relatorio_unidade_ativa";
  const CACHE_TTL = 1000 * 60 * 60 * 6;

  const UNIT_LABELS = {
    "58780-000": "Itaporanga",
    "58970-000": "Conceição"
  };

  const DONUT_COLORS = ["#00d084", "#3b82f6", "#8b5cf6", "#f59e0b", "#ef6b63", "#42d2b8"];

  let relatoriosPorUnidade = {};
  let unidadeSelecionada = localStorage.getItem(SELECTED_UNIT_KEY) || "";
  let deferredInstallPrompt = null;
  let appAuthorized = false;
  let authStateReady = false;

  firebase.initializeApp(firebaseConfig);
  const auth = firebase.auth();
  const provider = new firebase.auth.GoogleAuthProvider();

  const qs = (id) => document.getElementById(id);
  const setText = (id, value) => {
    const el = qs(id);
    if (el) el.textContent = value;
  };

  const escapeHTML = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  }[char]));

  const formatBRL = (v) => "R$ " + Number(v || 0).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  const formatNumero = (v, digits = 2) => Number(v || 0).toLocaleString("pt-BR", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits
  });

  const formatPercent = (v, digits = 1) => formatNumero(v, digits) + "%";
  const formatHora = (hora) => {
    const value = Number(hora);
    return Number.isFinite(value) ? String(value).padStart(2, "0") + ":00" : "--:00";
  };

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

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
      value.resumo || value.mesAMes || value.topPessoas || value.topPlanosGlobal || value.meta
    ));
  }

  function normalizarRelatorios(data) {
    if (!data || typeof data !== "object") return {};
    if (data.relatorios && typeof data.relatorios === "object") return normalizarRelatorios(data.relatorios);
    const unidades = Object.fromEntries(Object.entries(data).filter(([, value]) => isReportNode(value)));
    if (Object.keys(unidades).length) return unidades;
    if (isReportNode(data)) return { geral: data };
    return {};
  }

  function nomeUnidade(unitId) {
    if (!unitId) return "Nenhuma";
    if (UNIT_LABELS[unitId]) return UNIT_LABELS[unitId];
    if (unitId === "geral") return "Geral";
    const cepMatch = unitId.match(/^(\d{5})-?(\d{3})$/);
    if (cepMatch) return `Unidade ${cepMatch[1]}`;
    return unitId.replace(/[_-]+/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()).slice(0, 28);
  }

  function labelUnidade(unitId) {
    if (!unitId) return "Nenhuma";
    if (unitId === "geral") return "Todas as unidades";
    return nomeUnidade(unitId);
  }

  function normalizarResumo(raw = {}) {
    return {
      total: Number(raw.total ?? raw.totalGeral ?? 0),
      total30d: Number(raw.total30d ?? raw.totalUltimos30Dias ?? 0),
      total3m: Number(raw.total3m ?? raw.totalUltimos3Meses ?? 0),
      alunos: Number(raw.alunos ?? raw.totalAlunos ?? 0),
      ativos: Number(raw.ativos ?? raw.totalAlunosAtivos ?? 0),
      atrasados: Number(raw.atrasados ?? raw.totalAlunosAtrasados ?? 0),
      diariasTotal: Number(raw.diariasTotal ?? raw.totalDiarias ?? 0),
      diariasCount: Number(raw.diariasCount ?? raw.qtdDiarias ?? 0),
      ticketMedio30d: Number(raw.ticketMedio30d ?? raw.ticketMedio30Dias ?? 0),
      ticketMedioGeral: Number(raw.ticketMedioGeral ?? raw.ticketMedio ?? 0)
    };
  }

  function normalizarRelatorio(relatorio) {
    if (!relatorio || typeof relatorio !== "object") return relatorio;

    const topPessoas = relatorio.topPessoas ?? relatorio.totalPorPessoa ?? [];
    const pessoas = toArray(topPessoas).map((p) => ({
      ...p,
      codigo: p.codigo ?? p.codigoPessoa ?? p.id,
      total: Number(p.total ?? 0)
    }));

    return {
      ...relatorio,
      resumo: normalizarResumo(relatorio.resumo || {}),
      topPessoas: pessoas,
      topPlanosGlobal: relatorio.topPlanosGlobal ?? relatorio.topPlanos ?? []
    };
  }

  function normalizarRelatoriosMap(data) {
    const raw = normalizarRelatorios(data);
    return Object.fromEntries(
      Object.entries(raw).map(([key, value]) => [key, normalizarRelatorio(value)])
    );
  }

  function formatRatioPercent(v, digits = 0) {
    return formatNumero(Number(v || 0) * 100, digits) + "%";
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
        { valor: Number(item.valor) || 0, qtd: Number(item.qtd) || 0 }
      ]);
    }
    return Object.entries(diariasMensais || {}).map(([mes, item]) => [
      mes,
      { valor: Number((item && item.valor) || 0), qtd: Number((item && item.qtd) || 0) }
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
    if (unidades.length === 1) return normalizarRelatorio(unidades[0]);

    const resumo = {
      total: 0, total30d: 0, total3m: 0, alunos: 0, ativos: 0, atrasados: 0,
      diariasTotal: 0, diariasCount: 0, ticketMedio30d: 0, ticketMedioGeral: 0
    };
    let pesoTicket30 = 0, pesoTicketGeral = 0, pesoAlunos = 0, pesoFreq = 0, somaFreq = 0;

    unidades.forEach((relatorio) => {
      const item = normalizarResumo(relatorio.resumo || {});
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
      if (alunos > 0 && freq > 0) { somaFreq += freq * alunos; pesoFreq += alunos; }
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

    const horasLista = Object.entries(horasMap).map(([h, v]) => [Number(h), Number(v) || 0]).sort((a, b) => a[0] - b[0]);
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
        if (atual) { atual.total += Number(pessoa.total) || 0; return; }
        pessoaMap.set(key, { ...pessoa, total: Number(pessoa.total) || 0 });
      });
    });

    const topPessoas = [...pessoaMap.values()].sort((a, b) => b.total - a.total).slice(0, 30);
    const totalPessoas = topPessoas.reduce((acc, p) => acc + (Number(p.total) || 0), 0);
    topPessoas.forEach((p) => { p.percentual = totalPessoas > 0 ? (p.total / totalPessoas) * 100 : 0; });

    const planoMap = new Map();
    unidades.forEach((relatorio) => {
      toArray(relatorio.topPlanosGlobal).forEach((plano) => {
        const key = String(plano.valor ?? plano.label ?? plano.qtd ?? "");
        if (!key) return;
        const atual = planoMap.get(key);
        if (atual) { atual.qtd += Number(plano.qtd) || 0; atual.percentual += Number(plano.percentual) || 0; return; }
        planoMap.set(key, { valor: Number(plano.valor) || 0, qtd: Number(plano.qtd) || 0, percentual: Number(plano.percentual) || 0 });
      });
    });

    const topPlanosGlobal = [...planoMap.values()].sort((a, b) => b.percentual - a.percentual || b.qtd - a.qtd).slice(0, 15);

    let meta = {};
    let latestTs = 0;
    unidades.forEach((relatorio) => {
      const item = relatorio.meta || {};
      const ts = new Date(item.geradoEm || item.lastUpdate || 0).getTime();
      if (ts >= latestTs) { latestTs = ts; meta = item; }
    });

    return {
      resumo, mesAMes: agregarMapaMensal(unidades, "mesAMes"),
      diariasMensais: agregarMapaMensal(unidades, "diariasMensais"),
      diarias: { total: resumo.diariasTotal, count: resumo.diariasCount },
      picoHoras: { ...horasMap, pico, vale },
      topPessoas, topPlanosGlobal,
      frequencia: { mediaPorAluno30d: pesoFreq > 0 ? somaFreq / pesoFreq : 0 },
      meta
    };
  }

  function setFin(id, value) {
    const el = qs(id);
    if (!el) return;
    el.dataset.fin = String(Number(value) || 0);
    window.PFGestao?.applyFinancialToElement?.(el);
  }

  function formatSyncDate(rawTimestamp) {
    const data = new Date(rawTimestamp);
    if (Number.isNaN(data.getTime())) return String(rawTimestamp);
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfYesterday = new Date(startOfToday);
    startOfYesterday.setDate(startOfYesterday.getDate() - 1);
    const startOfSyncDay = new Date(data.getFullYear(), data.getMonth(), data.getDate());
    const time = data.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    if (startOfSyncDay.getTime() === startOfToday.getTime()) return `Hoje, ${time}`;
    if (startOfSyncDay.getTime() === startOfYesterday.getTime()) return `Ontem, ${time}`;
    return data.toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
  }

  function mesLabel(mesKey) {
    const [ano, mes] = String(mesKey).split("-");
    const date = new Date(Number(ano), Number(mes) - 1, 1);
    if (Number.isNaN(date.getTime())) return mesKey;
    const label = date.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "");
    return label.charAt(0).toUpperCase() + label.slice(1);
  }

  function aggregateMesEntries(mesAMes) {
    const map = {};
    mergeMesEntries(mesAMes).forEach(([mes, valor]) => {
      map[mes] = (map[mes] || 0) + (Number(valor) || 0);
    });
    return Object.entries(map).sort((a, b) => a[0].localeCompare(b[0]));
  }

  function calcularTendencia(mesAMes) {
    const entries = aggregateMesEntries(mesAMes);
    if (entries.length < 2) return null;
    const atual = Number(entries[entries.length - 1][1]) || 0;
    const anterior = Number(entries[entries.length - 2][1]) || 0;
    if (anterior <= 0) return null;
    return ((atual - anterior) / anterior) * 100;
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

  function renderHome(resumo, mesAMes, meta, unitId) {
    const alunos = Number(resumo.alunos) || 0;
    const ativos = Number(resumo.ativos) || 0;
    const atrasados = Number(resumo.atrasados) || 0;
    const pctAtivos = alunos > 0 ? Math.round((ativos / alunos) * 1000) / 10 : 0;
    const pctAtrasados = alunos > 0 ? Math.round((atrasados / alunos) * 1000) / 10 : 0;

    setFin("heroReceita", resumo.total30d);
    setFin("heroTicket", resumo.ticketMedio30d);
    setFin("heroDiarias", resumo.diariasTotal);

    const trend = calcularTendencia(mesAMes);
    const trendEl = qs("heroTrend");
    if (trendEl) {
      if (trend === null) {
        trendEl.textContent = "Sem comparativo mensal";
        trendEl.className = "hero-trend";
      } else {
        const positive = trend >= 0;
        trendEl.textContent = `${positive ? "+" : ""}${formatNumero(trend, 1)}% vs mês anterior`;
        trendEl.className = `hero-trend ${positive ? "positive" : "negative"}`;
      }
    }

    setText("chipAtivos", ativos.toLocaleString("pt-BR"));
    setText("chipAtrasados", atrasados.toLocaleString("pt-BR"));
    setText("chipTotal", alunos.toLocaleString("pt-BR"));
    setText("chipPctAtivos", formatPercent(pctAtivos));
    setText("chipPctAtrasados", formatPercent(pctAtrasados));
    setText("cobrancasBadge", String(atrasados));
    setText("unitPillLabel", labelUnidade(unitId));

    const syncLabel = meta.geradoEm || meta.lastUpdate ? formatSyncDate(meta.geradoEm || meta.lastUpdate) : "aguardando sync";
    setText("homeSubtitle", `Resumo da operação · ${labelUnidade(unitId)} · ${syncLabel}`);
  }

  function renderOperacional(resumo, unitId) {
    const alunos = Number(resumo.alunos) || 0;
    const ativos = Number(resumo.ativos) || 0;
    const atrasados = Number(resumo.atrasados) || 0;
    const pctAtivos = alunos > 0 ? Math.round((ativos / alunos) * 1000) / 10 : 0;
    const pctAtrasados = alunos > 0 ? Math.round((atrasados / alunos) * 1000) / 10 : 0;

    setText("opAtivos", ativos.toLocaleString("pt-BR"));
    setText("opAtrasados", atrasados.toLocaleString("pt-BR"));
    setText("opPctAtivos", formatPercent(pctAtivos) + " da base");
    setText("opPctAtrasados", formatPercent(pctAtrasados) + " da base");

    const barAtivos = qs("opProgressAtivos");
    const barAtrasados = qs("opProgressAtrasados");
    if (barAtivos) barAtivos.style.width = pctAtivos + "%";
    if (barAtrasados) barAtrasados.style.width = pctAtrasados + "%";

    const container = qs("opUnidadesList");
    if (!container) return;

    if (unitId !== "geral") {
      container.innerHTML = `<div class="list-row"><span>${escapeHTML(labelUnidade(unitId))}<small>${alunos} alunos</small></span><span class="status-dot ${pctAtrasados > 15 ? "warn" : "good"}">${formatPercent(pctAtivos)} em dia</span></div>`;
      return;
    }

    const rows = Object.entries(relatoriosPorUnidade).map(([id, rel]) => {
      const r = rel.resumo || {};
      const total = Number(r.alunos) || 0;
      const ok = Number(r.ativos) || 0;
      const pct = total > 0 ? Math.round((ok / total) * 1000) / 10 : 0;
      return `<div class="list-row"><span>${escapeHTML(nomeUnidade(id))}<small>${total} alunos</small></span><span class="status-dot ${pct < 75 ? "warn" : "good"}">${formatPercent(pct)} em dia</span></div>`;
    }).join("");

    container.innerHTML = rows || '<div class="empty-note">Sem unidades carregadas.</div>';
  }

  function renderFinanceiro(resumo, topPlanos) {
    setFin("finTotal", resumo.total);
    setFin("fin30", resumo.total30d);
    setFin("fin3m", resumo.total3m);
    setFin("finTicket30", resumo.ticketMedio30d);
    setFin("finTicketGeral", resumo.ticketMedioGeral);

    const container = qs("finPlanosList");
    if (!container) return;
    const planos = toArray(topPlanos).slice(0, 6);
    if (!planos.length) {
      container.innerHTML = '<div class="empty-note">Sem dados de planos.</div>';
      return;
    }

    container.innerHTML = planos.map((plano) => {
      const valor = Number(plano.valor) || 0;
      const pct = Number(plano.percentual) || 0;
      const qtd = Number(plano.qtd) || 0;
      return `<div class="list-row"><span><span data-fin="${valor}">R$ ••••</span><small>${formatPercent(pct, 1)} da base</small></span><strong>${qtd} alunos</strong></div>`;
    }).join("");

    container.querySelectorAll("[data-fin]").forEach((el) => window.PFGestao?.applyFinancialToElement?.(el));
  }

  function renderAlunos(resumo, unitId) {
    setText("alunosResumo", `${Number(resumo.alunos) || 0} alunos · ${labelUnidade(unitId)}`);
    const container = qs("alunosList");
    if (!container) return;

    if (unitId === "geral") {
      container.innerHTML = Object.entries(relatoriosPorUnidade).map(([id, rel]) => {
        const r = rel.resumo || {};
        return `<div class="list-row"><span><strong>${escapeHTML(nomeUnidade(id))}</strong><small>${Number(r.alunos) || 0} cadastrados</small></span><span class="status-dot ${Number(r.atrasados) > 0 ? "warn" : "good"}">${Number(r.ativos) || 0} em dia</span></div>`;
      }).join("") || '<div class="empty-note">Sem dados.</div>';
      return;
    }

    container.innerHTML = `
      <div class="list-row"><span><strong>Em dia</strong><small>Alunos adimplentes</small></span><strong>${Number(resumo.ativos) || 0}</strong></div>
      <div class="list-row"><span><strong>Em atraso</strong><small>Pendências de mensalidade</small></span><strong>${Number(resumo.atrasados) || 0}</strong></div>
      <div class="list-row"><span><strong>Total</strong><small>Base cadastrada</small></span><strong>${Number(resumo.alunos) || 0}</strong></div>
    `;
  }

  function renderCobrancas(resumo) {
    const atrasados = Number(resumo.atrasados) || 0;
    const alunos = Number(resumo.alunos) || 0;
    const pct = alunos > 0 ? Math.round((atrasados / alunos) * 1000) / 10 : 0;
    setText("cobrResumo", `${atrasados} alunos com pendência`);
    setText("cobrPct", formatPercent(pct) + " da base ativa");
    setFin("cobrEstimativa", (Number(resumo.ticketMedio30d) || 0) * atrasados);
  }

  function renderDiarias(diarias, diariasMensais, resumo) {
    const total = Number(diarias.total ?? resumo.diariasTotal ?? 0);
    const count = Number(diarias.count ?? resumo.diariasCount ?? 0);
    setFin("diariasTotal", total);
    setText("diariasCount", `${count.toLocaleString("pt-BR")} lançamentos no caderno`);

    const container = qs("diariasList");
    if (!container) return;
    const entries = mergeDiariasEntries(diariasMensais).sort((a, b) => b[0].localeCompare(a[0])).slice(0, 6);
    if (!entries.length) {
      container.innerHTML = '<div class="empty-note">Sem diárias sincronizadas.</div>';
      return;
    }

    container.innerHTML = entries.map(([mes, item]) => {
      const valor = Number(item.valor) || 0;
      const qtd = Number(item.qtd) || 0;
      return `<div class="list-row"><span><strong>${escapeHTML(mesLabel(mes))}</strong><small>${qtd} diárias</small></span><small class="credit" data-fin="${valor}">R$ ••••</small></div>`;
    }).join("");

    container.querySelectorAll("[data-fin]").forEach((el) => window.PFGestao?.applyFinancialToElement?.(el));
  }

  function renderHistorico(mesAMes) {
    const container = qs("chartHistorico");
    if (!container) return;
    const entries = aggregateMesEntries(mesAMes);
    if (!entries.length) {
      container.innerHTML = '<div class="empty-note">Sem histórico mensal.</div>';
      return;
    }

    const recent = entries.slice(-8);
    const max = Math.max(...recent.map(([, v]) => Number(v) || 0), 1);

    container.innerHTML = recent.map(([mes, valor]) => {
      const amount = Number(valor) || 0;
      const pct = (amount / max) * 100;
      return `
        <div class="chart-row-h">
          <span class="chart-row-label">${escapeHTML(mesLabel(mes))}</span>
          <div class="chart-track"><i class="chart-fill" style="width:${pct}%"></i></div>
          <strong class="chart-row-value" data-fin="${amount}">R$ ••••</strong>
        </div>
      `;
    }).join("");

    container.querySelectorAll("[data-fin]").forEach((el) => window.PFGestao?.applyFinancialToElement?.(el));
  }

  function renderOperacao(picoHoras, frequencia) {
    const pico = picoHoras.pico || {};
    const vale = picoHoras.vale || {};
    setText("opPico", formatHora(pico.hora));
    setText("opPicoMedia", formatRatioPercent(pico.media, 0));
    setText("opVale", formatHora(vale.hora));
    setText("opValeMedia", formatRatioPercent(vale.media, 0));
    setText("opFreq", formatNumero(frequencia.mediaPorAluno30d, 2));

    const container = qs("chartHoras");
    if (!container) return;
    const horas = Object.entries(picoHoras || {})
      .filter(([hora, valor]) => /^\d{1,2}$/.test(hora) && typeof valor !== "object")
      .map(([hora, valor]) => [Number(hora), Number(valor) || 0])
      .sort((a, b) => a[0] - b[0]);

    if (!horas.length) {
      container.innerHTML = '<div class="empty-note">Sem dados por horário.</div>';
      return;
    }

    const max = Math.max(...horas.map(([, v]) => v), 1);
    const picoHora = Number(pico.hora);

    container.innerHTML = `<div class="hour-grid-scroll">${horas.map(([hora, valor]) => {
      const h = (valor / max) * 100;
      const peak = hora === picoHora ? " peak" : "";
      return `<div class="hour-bar${peak}" style="--h: ${h}%"><span>${formatHora(hora).replace(":00", "h")}</span></div>`;
    }).join("")}</div>`;
  }

  function renderDetalhes(topPlanos, topPessoas) {
    const planos = toArray(topPlanos).filter((p) => Number(p.percentual) > 0).slice(0, 4);
    const donut = qs("donutVisual");
    const legend = qs("donutLegend");

    if (donut && planos.length) {
      let cursor = 0;
      const parts = planos.map((plano, index) => {
        const pct = Number(plano.percentual) || 0;
        const start = cursor;
        cursor += pct;
        return `${DONUT_COLORS[index % DONUT_COLORS.length]} ${start}% ${cursor}%`;
      });
      const rest = clamp(100 - cursor, 0, 100);
      if (rest > 0.5) parts.push(`#777d89 ${cursor}% 100%`);
      donut.style.background = `conic-gradient(${parts.join(", ")})`;
    }

    if (legend) {
      if (!planos.length) {
        legend.innerHTML = '<div class="empty-note">Sem distribuição.</div>';
      } else {
        legend.innerHTML = planos.map((plano, index) => {
          const valor = Number(plano.valor) || 0;
          const pct = Number(plano.percentual) || 0;
          const qtd = Number(plano.qtd) || 0;
          return `<div><i class="c${index + 1}"></i> <span data-fin="${valor}">R$ ••••</span> <small>${formatPercent(pct, 1)} · ${qtd} alunos</small></div>`;
        }).join("");
        legend.querySelectorAll("[data-fin]").forEach((el) => window.PFGestao?.applyFinancialToElement?.(el));
      }
    }

    const ranking = qs("rankingList");
    if (!ranking) return;
    const pessoas = toArray(topPessoas).slice(0, 8);
    if (!pessoas.length) {
      ranking.innerHTML = '<div class="empty-note">Sem ranking disponível.</div>';
      return;
    }

    ranking.innerHTML = pessoas.map((pessoa, idx) => {
      const nome = pessoa.nome || `Aluno #${pessoa.codigo || pessoa.id || idx + 1}`;
      const codigo = pessoa.codigo || pessoa.id || "-";
      return `<div class="list-row"><span><strong>${idx + 1}. ${escapeHTML(nome)}</strong><small>#${escapeHTML(codigo)}</small></span><strong data-fin="${Number(pessoa.total) || 0}">R$ ••••</strong></div>`;
    }).join("");

    ranking.querySelectorAll("[data-fin]").forEach((el) => window.PFGestao?.applyFinancialToElement?.(el));
  }

  function renderUnidades() {
    const container = qs("unitList");
    if (!container) return;

    const unitIds = Object.keys(relatoriosPorUnidade).sort((a, b) => nomeUnidade(a).localeCompare(nomeUnidade(b), "pt-BR"));
    const hasMultiple = unitIds.length > 1;

    let html = "";
    if (hasMultiple) {
      html += `<button type="button" class="unit-card${unidadeSelecionada === "geral" ? " active" : ""}" data-unit="geral"><span class="unit-card-icon"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="m9 12 2 2 4-4" /></svg></span><span class="unit-card-copy"><strong>Todas as unidades</strong><small>Visão consolidada</small></span></button>`;
    }

    html += unitIds.map((id) => {
      const r = relatoriosPorUnidade[id].resumo || {};
      const total = Number(r.alunos) || 0;
      const ok = Number(r.ativos) || 0;
      const pct = total > 0 ? Math.round((ok / total) * 100) : 0;
      const active = unidadeSelecionada === id ? " active" : "";
      return `<button type="button" class="unit-card${active}" data-unit="${escapeHTML(id)}"><span class="unit-card-icon"><svg viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /></svg></span><span class="unit-card-copy"><strong>${escapeHTML(nomeUnidade(id))}</strong><small>${total} alunos · ${pct}% em dia</small></span></button>`;
    }).join("");

    container.innerHTML = html || '<div class="empty-note">Nenhuma unidade encontrada.</div>';

    container.querySelectorAll("[data-unit]").forEach((btn) => {
      btn.addEventListener("click", () => selecionarUnidadeAndNotify(btn.dataset.unit));
    });
  }

  function renderConta(meta, unitId) {
    setText("accountUnit", labelUnidade(unitId));
    setText("accountSync", formatSyncDate(meta.geradoEm || meta.lastUpdate || Date.now()));
    setText("accountFinPref", document.body.classList.contains("financial-visible") ? "Visíveis" : "Ocultos por padrão");
  }

  function aplicarTudo(data, unitId = unidadeSelecionada) {
    const normalized = normalizarRelatorio(data);
    const resumo = normalized.resumo || {};
    renderHome(resumo, normalized.mesAMes || {}, normalized.meta || {}, unitId);
    renderOperacional(resumo, unitId);
    renderFinanceiro(resumo, normalized.topPlanosGlobal || []);
    renderAlunos(resumo, unitId);
    renderCobrancas(resumo);
    renderDiarias(normalized.diarias || {}, normalized.diariasMensais || {}, resumo);
    renderHistorico(normalized.mesAMes || {});
    renderOperacao(normalized.picoHoras || {}, normalized.frequencia || {});
    renderDetalhes(normalized.topPlanosGlobal || [], normalized.topPessoas || []);
    renderUnidades();
    renderConta(normalized.meta || {}, unitId);
    window.PFGestao?.refreshFinancialDisplay?.();
  }

  function limparDashboard(message = "Sem dados carregados.") {
    ["heroReceita", "heroTicket", "heroDiarias", "finTotal", "fin30", "fin3m", "finTicket30", "finTicketGeral", "diariasTotal", "cobrEstimativa"].forEach((id) => setFin(id, 0));
    ["chipAtivos", "chipAtrasados", "chipTotal", "opAtivos", "opAtrasados", "cobrancasBadge"].forEach((id) => setText(id, "---"));
    setText("homeSubtitle", message);
    updateSyncDot(message);
    ["chartHistorico", "chartHoras", "rankingList", "finPlanosList", "diariasList", "opUnidadesList", "unitList"].forEach((id) => {
      const el = qs(id);
      if (el) el.innerHTML = `<div class="empty-note">${escapeHTML(message)}</div>`;
    });
  }

  function selecionarUnidade(unitId) {
    if (!unitId) return;
    unidadeSelecionada = unitId;
    localStorage.setItem(SELECTED_UNIT_KEY, unitId);
    setText("unitPillLabel", labelUnidade(unitId));

    if (unitId === "geral") {
      if (!Object.keys(relatoriosPorUnidade).length) return;
      aplicarTudo(agregarRelatorioGeral(), "geral");
      return;
    }
    if (!relatoriosPorUnidade[unitId]) return;
    aplicarTudo(relatoriosPorUnidade[unitId], unitId);
  }

  function aplicarRelatorios(data) {
    relatoriosPorUnidade = normalizarRelatoriosMap(data);
    const unitIds = Object.keys(relatoriosPorUnidade);
    if (!unitIds.length) {
      limparDashboard("Nenhum relatório encontrado");
      return;
    }

    const hasMultiple = unitIds.length > 1;
    const valid = unidadeSelecionada === "geral"
      ? hasMultiple
      : unitIds.includes(unidadeSelecionada);

    if (!valid) unidadeSelecionada = hasMultiple ? "geral" : unitIds[0];
    selecionarUnidade(unidadeSelecionada);
  }

  function selecionarUnidadeAndNotify(unitId) {
    selecionarUnidade(unitId);
    window.PFGestao?.onUnitSelected?.();
  }

  function salvarCache(data) {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ t: Date.now(), d: data }));
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

  async function checkAuthorization() {
    const user = auth.currentUser;
    if (!user) return false;
    try {
      const snapshot = await firebase.database().ref("authorized_users/" + user.uid).once("value");
      return snapshot.exists();
    } catch {
      return false;
    }
  }

  async function buscarFirebase() {
    const isAuthorized = await checkAuthorization();
    if (!isAuthorized) { showUnauthorizedMessage(); return; }

    try {
      const token = await auth.currentUser.getIdToken();
      const res = await fetch(API_URL + "?auth=" + encodeURIComponent(token));
      if (!res.ok) throw new Error("HTTP " + res.status);
      const data = await res.json();
      if (!data) throw new Error("sem dados");
      salvarCache(data);
      aplicarRelatorios(data);
      setText("statusCache", "online");
      updateSyncDot("online");
    } catch (err) {
      const cache = carregarCache();
      if (cache) {
        aplicarRelatorios(cache);
        setText("statusCache", "cache local");
        updateSyncDot("cache local");
        return;
      }
      limparDashboard(err.message.includes("401") || err.message.includes("403") ? "Acesso restrito" : "Erro ao carregar");
    }
  }

  function setLoginMessage(message = "", type = "error") {
    const el = qs("loginMessage");
    if (!el) return;
    if (!message) { el.hidden = true; el.textContent = ""; return; }
    el.hidden = false;
    el.textContent = message;
    el.classList.toggle("is-info", type === "info");
  }

  function showLogin({ error = "" } = {}) {
    qs("loginScreen")?.classList.remove("is-hidden");
    qs("appShell")?.classList.add("is-hidden");
    appAuthorized = false;
    if (error) setLoginMessage(error);
    else setLoginMessage();
    updateLoginButton();
  }

  function showApp() {
    qs("loginScreen")?.classList.add("is-hidden");
    qs("appShell")?.classList.remove("is-hidden");
    appAuthorized = true;
    setLoginMessage();
    updateInstallButtons();
  }

  function showUnauthorizedMessage() {
    appAuthorized = false;
    limparDashboard("Acesso restrito");
    showLogin({ error: "Acesso restrito. Solicite autorização ao administrador." });
  }

  function updateLoginButton() {
    const btn = qs("loginGoogleBtn");
    if (!btn) return;
    const loginVisible = !qs("loginScreen")?.classList.contains("is-hidden");
    const canSignIn = authStateReady && loginVisible && !auth.currentUser;
    btn.disabled = !canSignIn;
    const label = btn.querySelector(".login-btn-label");
    if (label) label.textContent = authStateReady ? "Entrar com Google" : "Verificando sessão...";
  }

  function updateUIForSignedInUser(user) {
    if (!user) return;
    const firstName = (user.displayName || "Gestor").trim().split(/\s+/)[0];
    setText("homeUserName", firstName || "Gestor");
    setText("accountName", user.displayName || "Usuário");
    setText("accountEmail", user.email || "---");

    const avatar = qs("accountAvatar");
    const fallback = qs("homeAvatarFallback");
    const initial = (user.displayName || user.email || "P").charAt(0).toUpperCase();

    if (avatar && user.photoURL) {
      avatar.style.backgroundImage = `url("${user.photoURL}")`;
      avatar.textContent = "";
    } else if (avatar) {
      avatar.style.backgroundImage = "";
      avatar.textContent = initial;
    }
    if (fallback) fallback.textContent = initial;
  }

  async function isAppInstalled() {
    if (window.navigator.standalone === true) return true;
    if (typeof navigator.getInstalledRelatedApps !== "function") return false;
    try {
      return (await navigator.getInstalledRelatedApps()).length > 0;
    } catch {
      return false;
    }
  }

  async function updateInstallButtons() {
    const buttons = [...document.querySelectorAll("[data-install-app]")];
    const canInstall = !(await isAppInstalled()) && Boolean(deferredInstallPrompt);
    buttons.forEach((btn) => { btn.hidden = !canInstall; });
  }

  async function promptInstall() {
    if (!deferredInstallPrompt) return;
    deferredInstallPrompt.prompt();
    await deferredInstallPrompt.userChoice;
    deferredInstallPrompt = null;
    updateInstallButtons();
  }

  async function handleAuthState(user) {
    if (!authStateReady) authStateReady = true;

    if (!user) {
      showLogin();
      updateLoginButton();
      return;
    }

    updateLoginButton();
    updateUIForSignedInUser(user);
    setLoginMessage("Verificando acesso...", "info");
    updateSyncDot("carregando");

    const isAuthorized = await checkAuthorization();
    if (!isAuthorized) {
      showUnauthorizedMessage();
      return;
    }

    showApp();
    const cache = carregarCache();
    if (cache) {
      aplicarRelatorios(cache);
      setText("statusCache", "cache local");
      updateSyncDot("cache local");
      setTimeout(buscarFirebase, 1200);
    } else {
      setText("statusCache", "carregando");
      buscarFirebase();
    }
  }

  function initAuth() {
    showLogin();
    updateSyncDot("idle");
    updateLoginButton();

    qs("loginGoogleBtn")?.addEventListener("click", () => {
      if (!authStateReady || auth.currentUser) return;
      setLoginMessage("Conectando com Google...", "info");
      auth.signInWithPopup(provider).catch((error) => {
        if (error.code === "auth/popup-blocked" || error.code === "auth/popup-closed-by-user") {
          auth.signInWithRedirect(provider);
        } else {
          setLoginMessage("Erro ao fazer login: " + error.message);
        }
      });
    });

    qs("logoutBtn")?.addEventListener("click", () => {
      auth.signOut().then(() => {
        relatoriosPorUnidade = {};
        showLogin();
      });
    });

    auth.getRedirectResult().catch(() => undefined);
    auth.onAuthStateChanged(handleAuthState);

    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      deferredInstallPrompt = e;
      updateInstallButtons();
    });
    window.addEventListener("appinstalled", () => {
      deferredInstallPrompt = null;
      updateInstallButtons();
    });
    document.querySelectorAll("[data-install-app]").forEach((btn) => {
      btn.addEventListener("click", promptInstall);
    });
  }

  window.PFGestao = {
    initAuth,
    selecionarUnidade,
    onFinancialToggle(visible) {
      setText("accountFinPref", visible ? "Visíveis" : "Ocultos por padrão");
    }
  };
})();
