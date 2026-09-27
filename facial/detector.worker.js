/**
 * FlowFace — detector de rosto (Web Worker, módulo).
 *
 * YuNet 2023mar, o mesmo detector do PhysikFlow no desktop, rodando no ONNX
 * Runtime Web (WASM). Tudo o que pesa roda aqui, fora da thread da tela: a
 * leitura dos pixels, a rede e a codificação do recorte em JPEG.
 *
 * Mensagens:
 *   init   {modelUrl}                      -> ready  {ms, threads}
 *   detect {t, bitmap, width, height}      -> faces  {t, ms, faces, input}
 *   motion {bitmap, reset, pixel}          -> motion {fracao, ms}
 *   encode {bitmap, quality}               -> jpeg   {blob, width, height}
 * Erros voltam como {type:'error', id, op, message}.
 */

const ORT_VERSION = '1.30.0';
const ORT_BASE = `https://cdn.jsdelivr.net/npm/onnxruntime-web@${ORT_VERSION}/dist/`;

// Mesmos cortes do desktop (FaceDetectorYN: confiança 0,6, NMS 0,3).
const SCORE_MIN = 0.6;
const NMS_IOU = 0.3;
const STRIDES = [8, 16, 32];

let ort = null;
let session = null;
let canvas = null;
let ctx = null;
let tensorData = null;

self.onmessage = async ({ data }) => {
  try {
    if (data.type === 'init') await init(data);
    else if (data.type === 'detect') await detect(data);
    else if (data.type === 'motion') motion(data);
    else if (data.type === 'encode') await encode(data);
  } catch (error) {
    data.bitmap?.close?.();
    self.postMessage({ type: 'error', id: data.id, op: data.type, message: String(error?.message || error) });
  }
};

async function init({ id, modelUrl }) {
  const t0 = performance.now();
  ort = await import(`${ORT_BASE}ort.wasm.min.mjs`);
  ort.env.wasm.wasmPaths = ORT_BASE;
  // Várias threads exigem página isolada (COOP/COEP), que o GitHub Pages não
  // dá. Uma thread basta para o YuNet em 320 px.
  ort.env.wasm.numThreads = self.crossOriginIsolated
    ? Math.min(4, navigator.hardwareConcurrency || 1)
    : 1;

  const resposta = await fetch(modelUrl);
  if (!resposta.ok) throw new Error(`modelo não baixou (HTTP ${resposta.status})`);
  const modelo = new Uint8Array(await resposta.arrayBuffer());
  session = await ort.InferenceSession.create(modelo, {
    executionProviders: ['wasm'],
    graphOptimizationLevel: 'all'
  });

  // A primeira execução prepara os kernels; melhor aqui do que no 1º rosto.
  prepare(320, 192);
  tensorData.fill(0);
  await session.run({ input: new ort.Tensor('float32', tensorData, [1, 3, 192, 320]) });

  self.postMessage({
    type: 'ready',
    id,
    ms: Math.round(performance.now() - t0),
    threads: ort.env.wasm.numThreads
  });
}

function prepare(W, H) {
  if (!canvas || canvas.width !== W || canvas.height !== H) {
    canvas = new OffscreenCanvas(W, H);
    ctx = canvas.getContext('2d', { willReadFrequently: true });
    tensorData = new Float32Array(3 * W * H);
  }
}

async function detect({ id, t, bitmap, width, height }) {
  // A rede quer lados múltiplos de 32; o resto fica preto, como no OpenCV.
  const W = Math.ceil(width / 32) * 32;
  const H = Math.ceil(height / 32) * 32;
  prepare(W, H);

  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, W, H);
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  const px = ctx.getImageData(0, 0, W, H).data;

  // BGR, planar, 0..255, sem média: o blobFromImage padrão do OpenCV.
  const plano = W * H;
  for (let i = 0, j = 0; i < plano; i++, j += 4) {
    tensorData[i] = px[j + 2];
    tensorData[plano + i] = px[j + 1];
    tensorData[2 * plano + i] = px[j];
  }

  const t0 = performance.now();
  const saidas = await session.run({ input: new ort.Tensor('float32', tensorData, [1, 3, H, W]) });
  const ms = performance.now() - t0;

  const faces = decode(saidas, W, H).map((f) => ({
    score: f.score,
    x: f.x / width,
    y: f.y / height,
    w: f.w / width,
    h: f.h / height,
    // olho direito, olho esquerdo, ponta do nariz, canto direito e esquerdo da boca
    landmarks: f.pts.map(([x, y]) => [x / width, y / height]),
    light: meanLuma(px, W, f)
  }));

  self.postMessage({ type: 'faces', id, t, ms, faces, input: [width, height] });
}

// Espelho de face_detect.cpp (OpenCV), conferido contra o FaceDetectorYN.
function decode(saidas, W, H) {
  const rostos = [];
  for (const passo of STRIDES) {
    const cols = W / passo;
    const rows = H / passo;
    const cls = saidas[`cls_${passo}`].data;
    const obj = saidas[`obj_${passo}`].data;
    const bbox = saidas[`bbox_${passo}`].data;
    const kps = saidas[`kps_${passo}`].data;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const i = r * cols + c;
        const score = Math.sqrt(clamp01(cls[i]) * clamp01(obj[i]));
        if (score < SCORE_MIN) continue;

        const cx = (c + bbox[i * 4]) * passo;
        const cy = (r + bbox[i * 4 + 1]) * passo;
        const w = Math.exp(bbox[i * 4 + 2]) * passo;
        const h = Math.exp(bbox[i * 4 + 3]) * passo;
        const pts = [];
        for (let n = 0; n < 5; n++) {
          pts.push([(kps[i * 10 + 2 * n] + c) * passo, (kps[i * 10 + 2 * n + 1] + r) * passo]);
        }
        rostos.push({ score, x: cx - w / 2, y: cy - h / 2, w, h, pts });
      }
    }
  }

  rostos.sort((a, b) => b.score - a.score);
  const ficam = [];
  for (const f of rostos) {
    if (ficam.every((g) => iou(f, g) <= NMS_IOU)) ficam.push(f);
  }
  return ficam;
}

// Brilho médio do miolo do rosto (0..255), para o aviso de luz.
function meanLuma(px, W, f) {
  const H = px.length / (4 * W);
  const x0 = Math.max(0, Math.round(f.x + f.w * 0.2));
  const x1 = Math.min(W - 1, Math.round(f.x + f.w * 0.8));
  const y0 = Math.max(0, Math.round(f.y + f.h * 0.2));
  const y1 = Math.min(H - 1, Math.round(f.y + f.h * 0.8));
  let soma = 0;
  let n = 0;
  for (let y = y0; y <= y1; y += 2) {
    const linha = y * W;
    for (let x = x0; x <= x1; x += 2) {
      const j = (linha + x) * 4;
      soma += 0.299 * px[j] + 0.587 * px[j + 1] + 0.114 * px[j + 2];
      n++;
    }
  }
  return n ? soma / n : 0;
}

// ------------------------------------------------------------ movimento ---
// O vigia do descanso: compara uma miniatura em cinza (64 px de largura) com
// um fundo que acompanha a cena devagar. Custa uma fração de milissegundo e
// deixa o detector de rosto desligado enquanto nada acontece.
const ADAPTA_FUNDO = 0.1;   // a 4 leituras/s, o fundo "esquece" em ~2,5 s
let vigia = null;           // { canvas, ctx, fundo: Float32Array, luma: Float32Array }

function motion({ id, bitmap, reset, pixel }) {
  const t0 = performance.now();
  const w = bitmap.width;
  const h = bitmap.height;
  if (!vigia || vigia.canvas.width !== w || vigia.canvas.height !== h) {
    const canvas = new OffscreenCanvas(w, h);
    vigia = {
      canvas,
      ctx: canvas.getContext('2d', { willReadFrequently: true }),
      fundo: null,
      luma: new Float32Array(w * h)
    };
  }
  vigia.ctx.drawImage(bitmap, 0, 0);
  bitmap.close();
  const px = vigia.ctx.getImageData(0, 0, w, h).data;

  const n = w * h;
  const luma = vigia.luma;
  let soma = 0;
  for (let i = 0, j = 0; i < n; i++, j += 4) {
    luma[i] = 0.299 * px[j] + 0.587 * px[j + 1] + 0.114 * px[j + 2];
    soma += luma[i];
  }

  let fracao = 0;
  if (reset || !vigia.fundo) {
    vigia.fundo = Float32Array.from(luma);
  } else {
    const fundo = vigia.fundo;
    let somaFundo = 0;
    for (let i = 0; i < n; i++) somaFundo += fundo[i];
    // A exposição automática clareia ou escurece a imagem inteira: isso não é
    // movimento. Tira a mudança média antes de comparar ponto a ponto.
    const luz = (soma - somaFundo) / n;
    let mudou = 0;
    for (let i = 0; i < n; i++) {
      if (Math.abs(luma[i] - fundo[i] - luz) > pixel) mudou++;
      fundo[i] += (luma[i] - fundo[i]) * ADAPTA_FUNDO;
    }
    fracao = mudou / n;
  }

  self.postMessage({ type: 'motion', id, fracao, ms: performance.now() - t0 });
}

async function encode({ id, bitmap, quality }) {
  const c = new OffscreenCanvas(bitmap.width, bitmap.height);
  c.getContext('2d').drawImage(bitmap, 0, 0);
  bitmap.close();
  const blob = await c.convertToBlob({ type: 'image/jpeg', quality });
  self.postMessage({ type: 'jpeg', id, blob, width: c.width, height: c.height });
}

function clamp01(v) {
  return v < 0 ? 0 : v > 1 ? 1 : v;
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
