/**
 * FlowFace — câmera de acesso do PhysikFlow (PWA).
 *
 * O papel deste app é achar o rosto, orientar a pessoa e escolher bons
 * quadros. Quem RECONHECE é o PhysikFlow no computador da recepção, com o
 * mesmo índice da busca por rosto. Aqui não existe vetor facial, cadastro nem
 * banco de rostos: nada biométrico mora no aparelho.
 *
 * O envio ao computador (pareamento + rede local) ainda não existe. Até lá, a
 * captura para na tela e diz isso.
 *
 * Por que o quadrado acompanha o rosto sem atraso:
 *   - a detecção roda num worker, sobre uma imagem de 320 px (nunca o quadro
 *     cheio), e só um quadro por vez fica em voo;
 *   - o desenho roda a cada quadro da tela, num canvas, sem transição de CSS;
 *   - um filtro One Euro tira o tremido parado sem segurar o movimento, e a
 *     posição é adiantada pelo tempo que a detecção levou.
 */

const params = new URLSearchParams(location.search);

const CONFIG = {
  MODEL_URL: new URL('./models/yunet-2023mar-dinamico.onnx', import.meta.url).href,
  WORKER_URL: new URL('./detector.worker.js', import.meta.url),

  // 720p basta: o detector vê bem menos, e a resolução cheia só serve para o
  // recorte que irá ao computador.
  CAMERA: { width: 1280, height: 720, frameRate: 30 },

  // Lado maior da imagem entregue ao detector. O rosto de quem está diante
  // do totem é grande; em aparelho lento a entrada encolhe sozinha.
  DETECT_SIDE_MAX: 320,
  DETECT_SIDE_MIN: 192,
  DETECT_SIDE_STEP: 32,
  SLOW_MS: 70,
  FAST_MS: 28,

  SCORE_CAPTURE: 0.75,

  FACE_GONE_MS: 450,      // sem rosto por isso: o quadrado some
  NEXT_ATTEMPT_MS: 1500,  // sem rosto por isso: nova tentativa liberada
  HOLD_MS: 400,           // tudo certo por isso: captura
  SHOTS: 3,
  SHOT_GAP_MS: 120,
  CROP_SCALE: 2.2,        // recorte = maior lado do rosto × isto
  CROP_SIDE: 320,         // px do recorte (rosto com ~150 px)
  JPEG_QUALITY: 0.85,
  PREDICT_MAX_MS: 120,    // até quanto a posição é adiantada

  // Portões de qualidade
  SIZE_MIN: 0.45,         // largura do rosto / largura do contorno
  SIZE_MAX: 1.05,
  FACE_MIN_PX: 90,        // rosto na imagem cheia da câmera
  CENTER_TOL: 0.45,       // fração dos raios do contorno
  FRONTAL_MIN: 0.55,      // nariz entre os olhos: 1 = de frente
  ROLL_MAX_DEG: 15,
  PITCH_MIN: 0.3,
  PITCH_MAX: 0.78,
  LIGHT_MIN: 50,
  LIGHT_MAX: 220,
  STILL_MAX: 0.6          // larguras de rosto por segundo
};

const MENSAGENS = {
  semRosto: 'Olhe para a câmera',
  longe: 'Aproxime-se',
  perto: 'Afaste-se um pouco',
  fora: 'Centralize o rosto no contorno',
  lado: 'Olhe de frente para a câmera',
  inclinado: 'Endireite a cabeça',
  escuro: 'Pouca luz no rosto',
  claro: 'Luz forte demais no rosto',
  mexendo: 'Fique parado um instante',
  incerto: 'Olhe para a câmera',
  ok: 'Segure assim…'
};

// ------------------------------------------------------------------ DOM ---

const $ = (id) => document.getElementById(id);
const el = {
  rest: $('rest'),
  restPulse: $('restPulse'),
  restStatus: $('restStatus'),
  camera: $('camera'),
  video: $('video'),
  overlay: $('overlay'),
  brand: $('brand'),
  statusDot: $('statusDot'),
  statusText: $('statusText'),
  faceTarget: $('faceTarget'),
  stats: $('stats'),
  statRender: $('statRender'),
  statDetect: $('statDetect'),
  statInfer: $('statInfer'),
  statInput: $('statInput'),
  statEngine: $('statEngine'),
  statFace: $('statFace'),
  captures: $('captures'),
  instruction: $('instruction'),
  closeBtn: $('close'),
  message: $('message'),
  messageTitle: $('messageTitle'),
  messageText: $('messageText'),
  loading: $('loadingOverlay'),
  loadingText: $('loadingText')
};
const ctx = el.overlay.getContext('2d');

// ---------------------------------------------------------------- state ---

const state = {
  phase: 'rest',            // rest | starting | camera
  worker: null,
  detector: null,           // Promise do init
  detectorReady: false,
  engine: null,             // {ms, threads}
  pending: new Map(),
  msgId: 0,

  stream: null,
  fake: null,               // fonte de teste (?fonte=)
  mirror: true,
  wakeLock: null,
  vfcHandle: 0,
  frameRaf: 0,
  renderRaf: 0,
  lastVideoTime: -1,

  busy: false,
  detectSide: CONFIG.DETECT_SIDE_MAX,
  inferMs: [],
  lastInput: null,

  layout: null,
  layoutDirty: true,

  track: null,
  lastFaceAt: 0,
  lastReason: 'semRosto',
  okSince: 0,
  attempt: 'livre',         // livre | capturando | capturado
  messageTimer: 0,
  captureUrls: [],

  debug: params.has('debug') || storageGet('flowface.debug') === '1',
  counters: { t0: performance.now(), render: 0, detect: 0 }
};

// Para inspecionar pelo console durante testes.
window.flowface = { state, CONFIG };

// ------------------------------------------------------------- helpers ---

function storageGet(chave) {
  try { return localStorage.getItem(chave); } catch { return null; }
}

function storageSet(chave, valor) {
  try { localStorage.setItem(chave, valor); } catch { /* sem armazenamento */ }
}

const sleep = (ms) => new Promise((ok) => setTimeout(ok, ms));
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

function median(lista) {
  if (!lista.length) return 0;
  const s = [...lista].sort((a, b) => a - b);
  return s[s.length >> 1];
}

function iou(a, b) {
  const x1 = Math.max(a.x, b.x);
  const y1 = Math.max(a.y, b.y);
  const x2 = Math.min(a.x + a.w, b.x + b.w);
  const y2 = Math.min(a.y + a.h, b.y + b.h);
  const inter = Math.max(0, x2 - x1) * Math.max(0, y2 - y1);
  const uniao = a.w * a.h + b.w * b.h - inter;
  return uniao > 0 ? inter / uniao : 0;
}

/**
 * One Euro filter (Casiez et al., 2012): corta muito quando o valor está
 * parado (some o tremido) e pouco quando ele anda (some o atraso).
 * Valores em fração do quadro; tempo em segundos.
 */
class OneEuro {
  constructor(minCutoff, beta, dCutoff = 1) {
    this.minCutoff = minCutoff;
    this.beta = beta;
    this.dCutoff = dCutoff;
    this.x = 0;
    this.dx = 0;
    this.t = -1;
  }

  static alpha(cutoff, dt) {
    const tau = 1 / (2 * Math.PI * cutoff);
    return 1 / (1 + tau / dt);
  }

  filter(valor, t) {
    if (this.t < 0) {
      this.x = valor;
      this.dx = 0;
      this.t = t;
      return valor;
    }
    const dt = Math.max(1e-3, t - this.t);
    this.t = t;
    const aD = OneEuro.alpha(this.dCutoff, dt);
    this.dx = aD * ((valor - this.x) / dt) + (1 - aD) * this.dx;
    const a = OneEuro.alpha(this.minCutoff + this.beta * Math.abs(this.dx), dt);
    this.x = a * valor + (1 - a) * this.x;
    return this.x;
  }
}

function novoRastro() {
  return {
    cx: new OneEuro(1.5, 12),
    cy: new OneEuro(1.5, 12),
    w: new OneEuro(1.0, 4),
    h: new OneEuro(1.0, 4),
    t: 0,          // instante do quadro detectado (ms)
    seenAt: 0,     // quando o resultado chegou (ms)
    raw: null
  };
}

// --------------------------------------------------------------- worker ---

function iniciarDetector() {
  if (state.detector) return state.detector;

  state.worker = new Worker(CONFIG.WORKER_URL, { type: 'module' });
  state.worker.onmessage = ({ data }) => {
    if (data.type === 'faces') {
      onFaces(data);
      return;
    }
    if (data.type === 'error' && data.op === 'detect') {
      state.busy = false;
      console.warn('Detecção falhou:', data.message);
      return;
    }
    const pedido = state.pending.get(data.id);
    if (!pedido) return;
    state.pending.delete(data.id);
    if (data.type === 'error') pedido.reject(new Error(data.message));
    else pedido.resolve(data);
  };
  state.worker.onerror = (e) => {
    console.error('Worker do detector:', e.message || e);
    for (const p of state.pending.values()) p.reject(new Error(e.message || 'worker caiu'));
    state.pending.clear();
  };

  setRestStatus('Carregando detector…', 'loading');
  state.detector = chamarWorker('init', { modelUrl: CONFIG.MODEL_URL })
    .then((pronto) => {
      state.detectorReady = true;
      state.engine = pronto;
      setRestStatus('Terminal pronto', 'ok');
      console.info(`Detector pronto em ${pronto.ms} ms (${pronto.threads} thread)`);
      return pronto;
    })
    .catch((erro) => {
      console.error('Detector não carregou:', erro);
      setRestStatus('Detector não carregou — toque para tentar de novo', 'error');
      state.worker.terminate();
      state.worker = null;
      state.detector = null;
      throw erro;
    });
  return state.detector;
}

function chamarWorker(type, payload, transfer = []) {
  const id = ++state.msgId;
  return new Promise((resolve, reject) => {
    state.pending.set(id, { resolve, reject });
    state.worker.postMessage({ type, id, ...payload }, transfer);
  });
}

// --------------------------------------------------------------- câmera ---

async function abrirCamera() {
  const fonte = params.get('fonte');
  if (fonte) return abrirFonteDeTeste(fonte);

  if (!navigator.mediaDevices?.getUserMedia) {
    throw Object.assign(new Error('sem getUserMedia'), { name: 'NotSupportedError' });
  }
  const stream = await navigator.mediaDevices.getUserMedia({
    video: {
      facingMode: { ideal: 'user' },
      width: { ideal: CONFIG.CAMERA.width },
      height: { ideal: CONFIG.CAMERA.height },
      frameRate: { ideal: CONFIG.CAMERA.frameRate }
    },
    audio: false
  });
  state.stream = stream;
  const ajustes = stream.getVideoTracks()[0]?.getSettings?.() || {};
  // Câmera de trás não se espelha; a frontal e a webcam, sim (como selfie).
  state.mirror = ajustes.facingMode !== 'environment';
  el.video.srcObject = stream;
  await tocarVideo();
}

async function tocarVideo() {
  if (el.video.readyState < 1) {
    await new Promise((ok) => el.video.addEventListener('loadedmetadata', ok, { once: true }));
  }
  await el.video.play().catch(() => {});
}

/**
 * ?fonte=<imagem ou vídeo do mesmo site>: testa sem câmera. Uma imagem vira
 * um "vídeo" que passeia devagar (?movimento=0 para parada).
 */
async function abrirFonteDeTeste(url) {
  state.mirror = false;
  if (/\.(mp4|webm|mov|m4v)(\?|$)/i.test(url)) {
    el.video.srcObject = null;
    el.video.src = url;
    el.video.loop = true;
    await tocarVideo();
    return;
  }

  const img = new Image();
  img.src = url;
  await img.decode();
  const W = 1280;
  const H = 720;
  const tela = document.createElement('canvas');
  tela.width = W;
  tela.height = H;
  const c = tela.getContext('2d');
  const mexe = params.get('movimento') !== '0';
  const escala = (H * 0.9) / img.height;
  const t0 = performance.now();

  const pintar = () => {
    const t = (performance.now() - t0) / 1000;
    const dx = mexe ? Math.sin(t * 2 * Math.PI * 0.25) * W * 0.12 : 0;
    const dy = mexe ? Math.sin(t * 2 * Math.PI * 0.5) * H * 0.04 : 0;
    const w = img.width * escala;
    const h = img.height * escala;
    c.fillStyle = '#1b1d22';
    c.fillRect(0, 0, W, H);
    c.drawImage(img, (W - w) / 2 + dx, (H - h) / 2 + dy, w, h);
    state.fake.raf = requestAnimationFrame(pintar);
  };
  state.fake = { raf: 0 };
  pintar();
  el.video.srcObject = tela.captureStream(30);
  await tocarVideo();
}

function fecharCamera() {
  if (state.fake) {
    cancelAnimationFrame(state.fake.raf);
    state.fake = null;
  }
  const origem = el.video.srcObject;
  if (origem) origem.getTracks().forEach((t) => t.stop());
  state.stream = null;
  el.video.srcObject = null;
  el.video.removeAttribute('src');
  el.video.load();
}

function mensagemDeErroDaCamera(erro) {
  switch (erro?.name) {
    case 'NotAllowedError':
    case 'SecurityError':
      return 'Permita o uso da câmera nas configurações do navegador';
    case 'NotFoundError':
    case 'OverconstrainedError':
      return 'Nenhuma câmera encontrada';
    case 'NotReadableError':
      return 'A câmera está em uso por outro app';
    case 'NotSupportedError':
      return 'Este navegador não dá acesso à câmera';
    default:
      return 'Câmera indisponível';
  }
}

// ------------------------------------------------------ laço de quadros ---

const temVfc = 'requestVideoFrameCallback' in HTMLVideoElement.prototype;

function agendarQuadro() {
  if (state.phase !== 'camera') return;
  if (temVfc) state.vfcHandle = el.video.requestVideoFrameCallback(onQuadro);
  else state.frameRaf = requestAnimationFrame((agora) => onQuadro(agora, null));
}

async function onQuadro(agora, meta) {
  agendarQuadro();
  if (state.busy || !state.detectorReady || document.hidden) return;
  if (!meta) {
    // Sem requestVideoFrameCallback: só quadro novo interessa.
    if (el.video.currentTime === state.lastVideoTime) return;
    state.lastVideoTime = el.video.currentTime;
  }

  const vw = el.video.videoWidth;
  const vh = el.video.videoHeight;
  if (!vw || !vh) return;
  const s = state.detectSide / Math.max(vw, vh);
  const width = Math.round(vw * s);
  const height = Math.round(vh * s);
  // Instante do quadro, para adiantar o desenho pelo tempo da detecção.
  const t = meta?.presentationTime || performance.now();

  state.busy = true;
  try {
    const bitmap = await createImageBitmap(el.video, {
      resizeWidth: width,
      resizeHeight: height,
      resizeQuality: 'low'
    });
    state.worker.postMessage({ type: 'detect', id: 0, t, bitmap, width, height }, [bitmap]);
  } catch (erro) {
    state.busy = false;
    console.warn('Quadro não capturado:', erro);
  }
}

function ajustarEntrada(ms) {
  state.inferMs.push(ms);
  if (state.inferMs.length > 15) state.inferMs.shift();
  if (state.inferMs.length < 10) return;
  const m = median(state.inferMs);
  if (m > CONFIG.SLOW_MS && state.detectSide > CONFIG.DETECT_SIDE_MIN) {
    state.detectSide -= CONFIG.DETECT_SIDE_STEP;
    state.inferMs.length = 0;
  } else if (m < CONFIG.FAST_MS && state.detectSide < CONFIG.DETECT_SIDE_MAX) {
    state.detectSide += CONFIG.DETECT_SIDE_STEP;
    state.inferMs.length = 0;
  }
}

function onFaces({ t, ms, faces, input }) {
  state.busy = false;
  if (state.phase !== 'camera') return;
  state.counters.detect++;
  state.lastInput = input;
  ajustarEntrada(ms);

  const agora = performance.now();
  const rosto = escolherRosto(faces);
  if (!rosto) {
    semRosto(agora);
    return;
  }

  let rastro = state.track;
  const perdido = !rastro || agora - rastro.seenAt > CONFIG.FACE_GONE_MS;
  if (perdido || iou(rastro.raw, rosto) < 0.1) rastro = state.track = novoRastro();

  const ts = t / 1000;
  rastro.cx.filter(rosto.x + rosto.w / 2, ts);
  rastro.cy.filter(rosto.y + rosto.h / 2, ts);
  rastro.w.filter(rosto.w, ts);
  rastro.h.filter(rosto.h, ts);
  rastro.t = t;
  rastro.seenAt = agora;
  rastro.raw = rosto;
  state.lastFaceAt = agora;

  const motivo = avaliar(rosto, rastro);
  state.lastReason = motivo;
  orientar(motivo, agora);
}

// O maior rosto é, quase sempre, quem está diante do totem.
function escolherRosto(faces) {
  let melhor = null;
  for (const f of faces) {
    if (!melhor || f.w * f.h > melhor.w * melhor.h) melhor = f;
  }
  return melhor;
}

function semRosto(agora) {
  state.lastReason = 'semRosto';
  state.okSince = 0;
  if (agora - state.lastFaceAt > CONFIG.NEXT_ATTEMPT_MS && state.attempt === 'capturado') {
    state.attempt = 'livre';
  }
  if (state.attempt === 'livre' && agora - state.lastFaceAt > CONFIG.FACE_GONE_MS) {
    setInstruction(MENSAGENS.semRosto);
    setTarget(false);
  }
}

// ------------------------------------------------------------- portões ---

function avaliar(f, rastro) {
  const L = state.layout;
  if (!L) return 'semRosto';
  const vw = el.video.videoWidth;
  const vh = el.video.videoHeight;

  if (f.score < CONFIG.SCORE_CAPTURE) return 'incerto';

  // Tamanho, relativo ao contorno que a pessoa vê.
  const larguraNaTela = f.w * L.dispW;
  const proporcao = larguraNaTela / (2 * L.oval.rx);
  if (proporcao < CONFIG.SIZE_MIN || f.w * vw < CONFIG.FACE_MIN_PX) return 'longe';
  if (proporcao > CONFIG.SIZE_MAX) return 'perto';

  // Centro do rosto dentro do miolo do contorno (na tela, já espelhada).
  let sx = L.offX + (f.x + f.w / 2) * L.dispW;
  if (state.mirror) sx = L.cw - sx;
  const sy = L.offY + (f.y + f.h / 2) * L.dispH;
  const ex = (sx - L.oval.cx) / (L.oval.rx * CONFIG.CENTER_TOL);
  const ey = (sy - L.oval.cy) / (L.oval.ry * CONFIG.CENTER_TOL);
  if (ex * ex + ey * ey > 1) return 'fora';

  // Pose, pelos cinco pontos (em px da câmera, para não distorcer ângulos).
  const [od, oe, nariz, bd, be] = f.landmarks.map(([x, y]) => [x * vw, y * vh]);
  const a = Math.abs(nariz[0] - od[0]);
  const b = Math.abs(oe[0] - nariz[0]);
  if (Math.min(a, b) / Math.max(a, b, 1e-6) < CONFIG.FRONTAL_MIN) return 'lado';
  const giro = Math.abs((Math.atan2(oe[1] - od[1], oe[0] - od[0]) * 180) / Math.PI);
  if (Math.min(giro, 180 - giro) > CONFIG.ROLL_MAX_DEG) return 'inclinado';
  const olhosY = (od[1] + oe[1]) / 2;
  const bocaY = (bd[1] + be[1]) / 2;
  const altura = (nariz[1] - olhosY) / Math.max(bocaY - olhosY, 1e-6);
  if (altura < CONFIG.PITCH_MIN || altura > CONFIG.PITCH_MAX) return 'lado';

  if (f.light < CONFIG.LIGHT_MIN) return 'escuro';
  if (f.light > CONFIG.LIGHT_MAX) return 'claro';

  // Parado: velocidade do centro em larguras de rosto por segundo.
  const velocidade = Math.hypot(rastro.cx.dx * vw, rastro.cy.dx * vh) / Math.max(f.w * vw, 1);
  if (velocidade > CONFIG.STILL_MAX) return 'mexendo';

  return 'ok';
}

function orientar(motivo, agora) {
  if (state.attempt === 'capturando') return;
  if (state.attempt === 'capturado') {
    setInstruction('Captura feita', 'done');
    setTarget(false);
    return;
  }
  if (motivo !== 'ok') {
    state.okSince = 0;
    setInstruction(MENSAGENS[motivo]);
    setTarget(false);
    return;
  }
  if (!state.okSince) state.okSince = agora;
  setInstruction(MENSAGENS.ok, 'ok');
  setTarget(true);
  if (agora - state.okSince >= CONFIG.HOLD_MS) capturar();
}

// -------------------------------------------------------------- captura ---

async function capturar() {
  state.attempt = 'capturando';
  setInstruction('Capturando…', 'ok');
  const fotos = [];
  try {
    for (let i = 0; i < CONFIG.SHOTS; i++) {
      if (i) await sleep(CONFIG.SHOT_GAP_MS);
      if (state.phase !== 'camera' || state.lastReason !== 'ok' || !state.track?.raw) break;
      fotos.push(await recortar(state.track.raw));
    }
  } catch (erro) {
    console.warn('Captura falhou:', erro);
  }
  if (state.phase !== 'camera') return;
  if (!fotos.length) {
    state.attempt = 'livre';
    state.okSince = 0;
    return;
  }

  state.attempt = 'capturado';
  mostrarCapturas(fotos);
  // Honesto: sem computador pareado, nada sai daqui.
  showMessage('Rosto capturado', 'Sem computador pareado: nada foi enviado.', 'info');
  setInstruction('Captura feita', 'done');
  setTarget(false);
}

async function recortar(f) {
  const vw = el.video.videoWidth;
  const vh = el.video.videoHeight;
  const lado = Math.round(Math.min(Math.max(f.w * vw, f.h * vh) * CONFIG.CROP_SCALE, vw, vh));
  const cx = (f.x + f.w / 2) * vw;
  const cy = (f.y + f.h / 2) * vh;
  const sx = Math.round(clamp(cx - lado / 2, 0, vw - lado));
  const sy = Math.round(clamp(cy - lado / 2, 0, vh - lado));
  const saida = Math.min(CONFIG.CROP_SIDE, lado);
  const bitmap = await createImageBitmap(el.video, sx, sy, lado, lado, {
    resizeWidth: saida,
    resizeHeight: saida,
    resizeQuality: 'high'
  });
  const r = await chamarWorker('encode', { bitmap, quality: CONFIG.JPEG_QUALITY }, [bitmap]);
  return { blob: r.blob, width: r.width, height: r.height };
}

function mostrarCapturas(fotos) {
  for (const url of state.captureUrls) URL.revokeObjectURL(url);
  state.captureUrls = [];
  el.captures.replaceChildren();
  for (const foto of fotos) {
    const url = URL.createObjectURL(foto.blob);
    state.captureUrls.push(url);
    const fig = document.createElement('figure');
    const img = document.createElement('img');
    img.src = url;
    img.alt = '';
    img.draggable = false;
    const leg = document.createElement('figcaption');
    leg.textContent = `${Math.round(foto.blob.size / 1024)} KB`;
    fig.append(img, leg);
    el.captures.append(fig);
  }
}

// -------------------------------------------------------------- desenho ---

function medir() {
  const caixa = el.camera.getBoundingClientRect();
  if (!caixa.width || !caixa.height) return;
  const vw = el.video.videoWidth || 16;
  const vh = el.video.videoHeight || 9;
  // O vídeo usa object-fit: cover — escala até cobrir e corta o que sobra.
  const escala = Math.max(caixa.width / vw, caixa.height / vh);
  const dispW = vw * escala;
  const dispH = vh * escala;
  const alvo = el.faceTarget.getBoundingClientRect();
  state.layout = {
    cw: caixa.width,
    ch: caixa.height,
    dispW,
    dispH,
    offX: (caixa.width - dispW) / 2,
    offY: (caixa.height - dispH) / 2,
    oval: {
      cx: alvo.left - caixa.left + alvo.width / 2,
      cy: alvo.top - caixa.top + alvo.height / 2,
      rx: alvo.width / 2,
      ry: alvo.height / 2
    }
  };
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const w = Math.round(caixa.width * dpr);
  const h = Math.round(caixa.height * dpr);
  if (el.overlay.width !== w || el.overlay.height !== h) {
    el.overlay.width = w;
    el.overlay.height = h;
  }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function desenhar(agora) {
  state.renderRaf = requestAnimationFrame(desenhar);
  if (state.layoutDirty) {
    medir();
    state.layoutDirty = false;
  }
  const L = state.layout;
  if (!L) return;
  state.counters.render++;
  ctx.clearRect(0, 0, L.cw, L.ch);

  const r = state.track;
  if (r?.raw) {
    const desde = agora - r.seenAt;
    const alfa = desde <= CONFIG.FACE_GONE_MS ? 1 : 1 - (desde - CONFIG.FACE_GONE_MS) / 180;
    if (alfa > 0) {
      // Adianta pelo tempo desde o quadro detectado (o vídeo na tela já é
      // mais novo que ele), com folga para não passar do ponto.
      const dt = (clamp(agora - r.t, 0, CONFIG.PREDICT_MAX_MS) / 1000) * 0.8;
      const cx = r.cx.x + r.cx.dx * dt;
      const cy = r.cy.x + r.cy.dx * dt;
      const w = r.w.x + r.w.dx * dt * 0.5;
      const h = r.h.x + r.h.dx * dt * 0.5;
      const pronto = state.lastReason === 'ok' || state.attempt !== 'livre';
      cantoneiras(
        L.offX + (cx - w / 2) * L.dispW,
        L.offY + (cy - h / 2) * L.dispH,
        w * L.dispW,
        h * L.dispH,
        pronto ? '#70e0a3' : 'rgba(255,255,255,0.92)',
        alfa
      );
      if (state.debug) pontos(r.raw.landmarks, L, alfa);
    }
  }

  if (agora - state.counters.t0 >= 500) atualizarStats(agora);
}

function cantoneiras(x, y, w, h, cor, alfa) {
  const L = Math.max(10, Math.min(w, h) * 0.22);
  const r = Math.min(10, L * 0.45);
  ctx.save();
  ctx.globalAlpha = alfa;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(x, y + L);
  ctx.arcTo(x, y, x + L, y, r);
  ctx.lineTo(x + L, y);
  ctx.moveTo(x + w - L, y);
  ctx.arcTo(x + w, y, x + w, y + L, r);
  ctx.lineTo(x + w, y + L);
  ctx.moveTo(x + w, y + h - L);
  ctx.arcTo(x + w, y + h, x + w - L, y + h, r);
  ctx.lineTo(x + w - L, y + h);
  ctx.moveTo(x + L, y + h);
  ctx.arcTo(x, y + h, x, y + h - L, r);
  ctx.lineTo(x, y + h - L);
  // Contorno escuro por baixo: o traço aparece em fundo claro também.
  ctx.strokeStyle = 'rgba(0,0,0,0.35)';
  ctx.lineWidth = 5;
  ctx.stroke();
  ctx.strokeStyle = cor;
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.restore();
}

function pontos(landmarks, L, alfa) {
  ctx.save();
  ctx.globalAlpha = alfa;
  ctx.fillStyle = '#ffd166';
  for (const [x, y] of landmarks) {
    ctx.beginPath();
    ctx.arc(L.offX + x * L.dispW, L.offY + y * L.dispH, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function atualizarStats(agora) {
  const s = (agora - state.counters.t0) / 1000;
  if (state.debug && state.phase === 'camera') {
    el.statRender.textContent = `${Math.round(state.counters.render / s)} fps`;
    el.statDetect.textContent = `${Math.round(state.counters.detect / s)} /s`;
    el.statInfer.textContent = state.inferMs.length ? `${Math.round(median(state.inferMs))} ms` : '--';
    el.statInput.textContent = state.lastInput ? `${state.lastInput[0]}×${state.lastInput[1]}` : '--';
    el.statEngine.textContent = state.engine ? `wasm · ${state.engine.threads} thread` : '--';
    el.statFace.textContent = state.lastReason === 'semRosto' ? '--' : state.lastReason;
  }
  state.counters = { t0: agora, render: 0, detect: 0 };
}

// ------------------------------------------------------------------- UI ---

let instrucaoAtual = '';

function setInstruction(texto, tipo = '') {
  const chave = `${tipo}|${texto}`;
  if (chave === instrucaoAtual) return;
  instrucaoAtual = chave;
  el.instruction.textContent = texto;
  el.instruction.className = `instruction${tipo ? ` ${tipo}` : ''}`;
}

let alvoOk = false;

function setTarget(ok) {
  if (ok === alvoOk) return;
  alvoOk = ok;
  el.faceTarget.classList.toggle('ok', ok);
}

function setStatus(tipo, texto) {
  el.statusDot.className = `status-dot${tipo === 'ok' ? '' : ` ${tipo}`}`;
  el.statusText.textContent = texto;
}

function setRestStatus(texto, tipo) {
  el.restStatus.textContent = texto;
  el.restPulse.className = `pulse${tipo === 'ok' ? '' : ` ${tipo}`}`;
}

function showMessage(titulo, texto, tipo = '') {
  el.messageTitle.textContent = titulo;
  el.messageText.textContent = texto;
  el.message.className = `message show ${tipo}`;
  clearTimeout(state.messageTimer);
  state.messageTimer = setTimeout(() => el.message.classList.remove('show'), 2400);
}

function setDebug(ligado) {
  state.debug = ligado;
  storageSet('flowface.debug', ligado ? '1' : '0');
  el.stats.hidden = !ligado;
  el.captures.hidden = !ligado;
}

async function manterTelaAcesa() {
  try {
    if ('wakeLock' in navigator && !state.wakeLock) {
      state.wakeLock = await navigator.wakeLock.request('screen');
      state.wakeLock.addEventListener('release', () => { state.wakeLock = null; });
    }
  } catch { /* sem permissão ou sem suporte: segue sem */ }
}

// ------------------------------------------------------------ navegação ---

async function entrar() {
  if (state.phase !== 'rest') return;
  state.phase = 'starting';
  el.rest.classList.add('hidden');
  el.camera.classList.add('active');
  setStatus('warning', 'Iniciando…');
  setInstruction('Iniciando câmera…');

  if (!state.detectorReady) {
    el.loadingText.textContent = 'Carregando detector…';
    el.loading.classList.add('show');
    try {
      await iniciarDetector();
    } catch (erro) {
      el.loading.classList.remove('show');
      setStatus('error', 'Detector não carregou');
      setInstruction(`Detector não carregou: ${erro.message}`, 'error');
      state.phase = 'erro';
      return;
    }
    el.loading.classList.remove('show');
    if (state.phase !== 'starting') return;
  }

  try {
    await abrirCamera();
  } catch (erro) {
    console.error('Câmera:', erro);
    fecharCamera();
    setStatus('error', 'Câmera indisponível');
    setInstruction(mensagemDeErroDaCamera(erro), 'error');
    state.phase = 'erro';
    return;
  }
  if (state.phase !== 'starting') {
    fecharCamera();
    return;
  }

  state.phase = 'camera';
  el.camera.classList.toggle('mirror', state.mirror);
  state.layoutDirty = true;
  state.counters = { t0: performance.now(), render: 0, detect: 0 };
  setStatus('ok', params.get('fonte') ? 'Fonte de teste' : 'Câmera ligada');
  setInstruction(MENSAGENS.semRosto);
  agendarQuadro();
  state.renderRaf = requestAnimationFrame(desenhar);
  manterTelaAcesa();
  setTimeout(() => el.camera.classList.add('show-target'), 250);
}

function sair() {
  if (state.phase === 'rest') return;
  state.phase = 'rest';
  if (temVfc && state.vfcHandle) el.video.cancelVideoFrameCallback(state.vfcHandle);
  cancelAnimationFrame(state.frameRaf);
  cancelAnimationFrame(state.renderRaf);
  fecharCamera();
  state.wakeLock?.release().catch(() => {});
  state.wakeLock = null;
  state.track = null;
  state.attempt = 'livre';
  state.okSince = 0;
  state.lastReason = 'semRosto';
  state.lastFaceAt = 0;
  state.busy = false;

  if (state.layout) ctx.clearRect(0, 0, state.layout.cw, state.layout.ch);
  el.camera.classList.remove('active', 'show-target');
  el.message.classList.remove('show');
  el.loading.classList.remove('show');
  el.rest.classList.remove('hidden');
  setTarget(false);
  if (!state.detector) iniciarDetector().catch(() => {});
}

// --------------------------------------------------------------- eventos ---

el.rest.addEventListener('click', entrar);
el.closeBtn.addEventListener('click', sair);

window.addEventListener('keydown', (e) => {
  if ((e.key === 'Enter' || e.key === ' ') && state.phase === 'rest') {
    e.preventDefault();
    entrar();
  } else if (e.key === 'Escape') {
    sair();
  } else if (e.key === 'd' || e.key === 'D') {
    setDebug(!state.debug);
  }
});

// Três toques na marca liga o painel técnico (no tablet não há teclado).
let toques = [];
el.brand.addEventListener('pointerup', () => {
  const agora = performance.now();
  toques = toques.filter((t) => agora - t < 700);
  toques.push(agora);
  if (toques.length >= 3) {
    toques = [];
    setDebug(!state.debug);
  }
});

// Totem: nada de menu de toque longo, arrastar imagem ou selecionar texto.
document.addEventListener('contextmenu', (e) => e.preventDefault());
document.addEventListener('dragstart', (e) => e.preventDefault());

new ResizeObserver(() => { state.layoutDirty = true; }).observe(el.camera);
el.video.addEventListener('resize', () => { state.layoutDirty = true; });

document.addEventListener('visibilitychange', () => {
  if (document.hidden) return;
  if (state.phase === 'camera') manterTelaAcesa();
  state.counters = { t0: performance.now(), render: 0, detect: 0 };
});

// ----------------------------------------------------------------- início ---

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js').catch((e) => console.warn('Service worker:', e));
}

setDebug(state.debug);
// O detector carrega enquanto a tela de descanso está parada: ao tocar, já
// está pronto.
iniciarDetector().catch(() => {});
