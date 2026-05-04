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

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const provider = new firebase.auth.GoogleAuthProvider();

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
// AUTHORIZATION CHECK
// ==========================
async function checkAuthorization() {
  const user = auth.currentUser;
  if (!user) {
    return false;
  }

  try {
    // Check if user is in authorized_users list
    const authorizedRef = firebase.database().ref('authorized_users/' + user.uid);
    const snapshot = await authorizedRef.once('value');
    return snapshot.exists();
  } catch (error) {
    console.error("❌ Authorization check failed:", error);
    return false;
  }
}

// ==========================
// FETCH
// ==========================
async function buscarFirebase() {
  // Check if user is authenticated and authorized
  const isAuthorized = await checkAuthorization();
  if (!isAuthorized) {
    console.warn("⚠ User not authorized to access data");
    showUnauthorizedMessage();
    return;
  }

  try {
    // Add auth token to request
    const user = auth.currentUser;
    const token = await user.getIdToken();
    
    const res = await fetch(API_URL, {
      headers: {
        'Authorization': 'Bearer ' + token
      }
    });

    if (!res.ok) throw new Error("HTTP " + res.status);

    const data = await res.json();

    if (!data) throw new Error("sem dados");

    salvarCache(data);

    aplicarTudo(data);

    console.log("✔ atualizado do Firebase");

  } catch (err) {
    console.warn("⚠ usando cache (erro fetch):", err.message);
    if (err.message.includes('401') || err.message.includes('403')) {
      showUnauthorizedMessage();
    }
  }
}

function showUnauthorizedMessage() {
  // Clear existing data
  document.querySelectorAll('.metric-value').forEach(el => el.textContent = '—');
  document.getElementById('graficoMensal').innerHTML = '<div class="mini-note">Acesso restrito</div>';
  document.getElementById('rankingPessoas').innerHTML = '<tr><td colspan="3" class="mini-note">Acesso restrito</td></tr>';
  document.getElementById('listaValores').innerHTML = '<div class="list-item"><strong>Acesso restrito</strong><span>Sem permissão</span></div>';
  
  // Show message in technical section
  document.getElementById('ultimaSync').textContent = 'Acesso restrito';
  document.getElementById('statusCache').textContent = 'Não autorizado';
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
// AUTHENTICATION
// ==========================
function signInWithGoogle() {
  // Try popup first (better UX)
  auth.signInWithPopup(provider)
    .then((result) => {
      console.log("✅ User signed in:", result.user.displayName);
      updateUIForSignedInUser(result.user);
    })
    .catch((error) => {
      console.error("❌ Popup sign-in failed, trying redirect:", error);
      
      // If popup is blocked, try redirect
      if (error.code === 'auth/popup-blocked' || error.code === 'auth/popup-closed-by-user') {
        console.log("🔄 Using redirect fallback for mobile/popup blocked");
        signInWithGoogleRedirect();
      } else {
        alert("Erro ao fazer login: " + error.message);
      }
    });
}

function signInWithGoogleRedirect() {
  auth.signInWithRedirect(provider)
    .then(() => {
      console.log("🔄 Redirecting to Google sign-in...");
    })
    .catch((error) => {
      console.error("❌ Redirect sign-in error:", error);
      alert("Erro ao fazer login: " + error.message);
    });
}

// Handle redirect result when returning from Google
function handleRedirectResult() {
  auth.getRedirectResult()
    .then((result) => {
      if (result.user) {
        console.log("✅ User signed in via redirect:", result.user.displayName);
        updateUIForSignedInUser(result.user);
      }
    })
    .catch((error) => {
      console.error("❌ Redirect result error:", error);
      if (error.code !== 'auth/no-credential') {
        alert("Erro ao fazer login: " + error.message);
      }
    });
}

function signOut() {
  auth.signOut()
    .then(() => {
      console.log("✅ User signed out");
      updateUIForSignedOutUser();
    })
    .catch((error) => {
      console.error("❌ Sign out error:", error);
    });
}

function updateUIForSignedInUser(user) {
  const googleBtn = document.querySelector('.google-btn');
  if (googleBtn) {
    googleBtn.innerHTML = `
      ${user.displayName}
      <img src="${user.photoURL}" alt="Profile" style="width: 18px; height: 18px; border-radius: 50%; margin-left: 8px;">
    `;
    googleBtn.onclick = signOut;
  }
}

function updateUIForSignedOutUser() {
  const googleBtn = document.querySelector('.google-btn');
  if (googleBtn) {
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
}

// ==========================
// INIT
// ==========================
function init() {
  // Handle redirect result first (for mobile fallback)
  handleRedirectResult();

  // Set up authentication state listener
  auth.onAuthStateChanged(async (user) => {
    if (user) {
      console.log("👤 User is signed in:", user.displayName);
      updateUIForSignedInUser(user);
      
      // Check authorization and fetch data
      const isAuthorized = await checkAuthorization();
      if (isAuthorized) {
        console.log("✅ User authorized, loading data...");
        
        // Try cache first
        const cache = carregarCache();
        if (cache) {
          aplicarTudo(cache);
          setTimeout(buscarFirebase, 2000);
          console.log("⚡ carregado do cache");
        } else {
          buscarFirebase();
        }
      } else {
        console.log("⚠ User not authorized");
        showUnauthorizedMessage();
      }
    } else {
      console.log("🔓 No user is signed in");
      updateUIForSignedOutUser();
      showUnauthorizedMessage();
    }
  });

  // Set up Google button click handler
  const googleBtn = document.querySelector('.google-btn');
  if (googleBtn) {
    googleBtn.onclick = signInWithGoogle;
  }
}


// ==========================
// START
// ==========================
document.addEventListener("DOMContentLoaded", init);