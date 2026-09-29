/**
 * FlowFace — a conversa com o PhysikFlow no computador da recepção.
 *
 * É O ESPELHO de backend/face/totem/TotemProtocol.h, no repositório do app.
 * Mudou um, muda o outro: os testes do app falam com o servidor usando
 * exatamente os passos daqui.
 *
 * Pareamento. O QR do card da câmera abre este app com #par=<convite>. O
 * convite traz o id da câmera, um segredo de 32 bytes, os endereços do PC e a
 * porta. Ele vai para o armazenamento do navegador e SAI da barra de endereço
 * na hora: o segredo não fica no histórico nem em print da tela.
 *
 * Aperto de mão MÚTUO (HMAC-SHA256 do segredo sobre os dois nonces). Este
 * aparelho só manda rosto depois de o PC provar que conhece o segredo: outro
 * programa na rede fingindo ser o PC não recebe nada. Depois, cada mensagem
 * vai em AES-256-GCM com chave da sessão (HKDF), numerada; quadro repetido ou
 * fora de ordem é recusado dos dois lados.
 *
 * Nada de rosto fica aqui: a captura sai, a resposta volta, e só.
 */

const VERSAO = 1;
const texto = new TextEncoder();
const AAD = texto.encode('flowface/1');
const INFO = texto.encode('flowface/1/sessao');
const DIRECAO_TOTEM = 1;   // este aparelho -> PC
const DIRECAO_PC = 2;      // PC -> este aparelho
const CHAVE = 'flowface.pareamento';

const PRAZO_POR_ENDERECO_MS = 8000;
const PRAZO_DA_RESPOSTA_MS = 12000;
const ECO_A_CADA_MS = 25000;
const PRAZO_DO_ECO_MS = 10000;
const ESPERA_MAX_MS = 30000;

// Recusas que não adianta repetir: o pareamento deixou de valer, ou outro
// aparelho assumiu esta câmera (insistir faria os dois se derrubarem).
const RECUSAS = {
  prova_invalida: 'Pareamento recusado: leia o código de novo no PhysikFlow',
  camera_desconhecida: 'Esta câmera não existe mais no PhysikFlow',
  camera_removida: 'Esta câmera foi removida no PhysikFlow',
  pareamento_renovado: 'O código foi trocado no PhysikFlow: leia o novo',
  versao_ou_mensagem_invalida: 'Versão diferente do PhysikFlow: atualize esta página',
  substituida: 'Outro aparelho assumiu esta câmera. Toque para retomar'
};

// ------------------------------------------------------------ base64url ---

export function b64url(bytes) {
  let s = '';
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function deB64url(txt) {
  const s = String(txt).replace(/-/g, '+').replace(/_/g, '/');
  const bin = atob(s + '='.repeat((4 - (s.length % 4)) % 4));
  const saida = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) saida[i] = bin.charCodeAt(i);
  return saida;
}

function juntar(...partes) {
  const total = partes.reduce((n, p) => n + p.length, 0);
  const saida = new Uint8Array(total);
  let i = 0;
  for (const p of partes) {
    saida.set(p, i);
    i += p.length;
  }
  return saida;
}

function iguais(a, b) {
  if (a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a[i] ^ b[i];
  return d === 0;
}

// -------------------------------------------------------------- convite ---

export function lerConvite(codigo) {
  try {
    const c = JSON.parse(new TextDecoder().decode(deB64url(codigo)));
    const segredo = deB64url(String(c.k || ''));
    const enderecos = Array.isArray(c.h) ? c.h.map(String).filter(Boolean) : [];
    if (c.v !== VERSAO || !c.i || segredo.length !== 32 || !(Number(c.p) > 0) || !enderecos.length) {
      return null;
    }
    return { cameraId: String(c.i), segredo: String(c.k), nome: String(c.n || ''), enderecos, porta: Number(c.p) };
  } catch {
    return null;
  }
}

/** O convite do link (#par=...), se houver. Sai da barra de endereço sempre. */
export function conviteDaUrl() {
  const achado = /(?:^#|&)par=([^&]+)/.exec(location.hash);
  if (!achado) return null;
  // Válido ou não, é um segredo: não fica na URL nem no histórico.
  history.replaceState(null, '', location.pathname + location.search);
  const convite = lerConvite(decodeURIComponent(achado[1]));
  if (convite) {
    try { localStorage.setItem(CHAVE, JSON.stringify(convite)); } catch { /* sem armazenamento */ }
  }
  return convite;
}

export function conviteSalvo() {
  try {
    const c = JSON.parse(localStorage.getItem(CHAVE) || 'null');
    return c && c.cameraId && c.segredo && Array.isArray(c.enderecos) && c.porta ? c : null;
  } catch {
    return null;
  }
}

// ------------------------------------------------------------- cripto ---

const sutil = globalThis.crypto?.subtle;

async function hmac(segredo, mensagem) {
  const chave = await sutil.importKey('raw', segredo, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return new Uint8Array(await sutil.sign('HMAC', chave, texto.encode(mensagem)));
}

// Os nonces entram em base64url, como texto: é o que os dois lados têm em
// mãos, e a mesma string dos dois lados.
function mensagemDaProva(lado, cameraId, nc, ns) {
  return `flowface/1/${lado}|${cameraId}|${b64url(nc)}|${b64url(ns)}`;
}

async function derivarSessao(segredo, nc, ns) {
  const base = await sutil.importKey('raw', segredo, 'HKDF', false, ['deriveBits']);
  const bits = new Uint8Array(await sutil.deriveBits(
    { name: 'HKDF', hash: 'SHA-256', salt: juntar(nc, ns), info: INFO }, base, 512));
  return {
    // [0,32) deste aparelho para o PC; [32,64) do PC para cá.
    envio: await sutil.importKey('raw', bits.slice(0, 32), 'AES-GCM', false, ['encrypt']),
    recebe: await sutil.importKey('raw', bits.slice(32, 64), 'AES-GCM', false, ['decrypt']),
    enviados: 0n,
    ultimoRecebido: 0n
  };
}

function iv(direcao, contador) {
  const v = new DataView(new ArrayBuffer(12));
  v.setUint32(0, direcao);
  v.setBigUint64(4, contador);
  return new Uint8Array(v.buffer);
}

async function selar(sessao, cabecalho, carga) {
  const json = texto.encode(JSON.stringify(cabecalho));
  const claro = new Uint8Array(4 + json.length + carga.length);
  new DataView(claro.buffer).setUint32(0, json.length);
  claro.set(json, 4);
  claro.set(carga, 4 + json.length);

  const contador = ++sessao.enviados;
  const cifrado = new Uint8Array(await sutil.encrypt(
    { name: 'AES-GCM', iv: iv(DIRECAO_TOTEM, contador), additionalData: AAD, tagLength: 128 },
    sessao.envio, claro));
  const quadro = new Uint8Array(8 + cifrado.length);
  new DataView(quadro.buffer).setBigUint64(0, contador);
  quadro.set(cifrado, 8);
  return quadro;
}

async function abrir(sessao, quadro) {
  if (quadro.length < 8 + 16) throw new Error('quadro curto demais');
  const contador = new DataView(quadro.buffer, quadro.byteOffset, 8).getBigUint64(0);
  if (contador <= sessao.ultimoRecebido) throw new Error('quadro repetido ou fora de ordem');
  const claro = new Uint8Array(await sutil.decrypt(
    { name: 'AES-GCM', iv: iv(DIRECAO_PC, contador), additionalData: AAD, tagLength: 128 },
    sessao.recebe, quadro.subarray(8)));
  if (claro.length < 4) throw new Error('quadro sem cabeçalho');
  const tamanho = new DataView(claro.buffer).getUint32(0);
  if (tamanho > claro.length - 4) throw new Error('cabeçalho maior que o quadro');
  const cabecalho = JSON.parse(new TextDecoder().decode(claro.subarray(4, 4 + tamanho)));
  // Só agora o contador anda: um quadro ruim não gasta o número de um bom.
  sessao.ultimoRecebido = contador;
  return { cabecalho, carga: claro.subarray(4 + tamanho) };
}

// ---------------------------------------------------------- o aparelho ---

function descreverAparelho() {
  const ua = navigator.userAgent;
  const android = /Android ([\d.]+)/.exec(ua);
  const versao = /(?:Edg|Chrome|CriOS)\/(\d+)/.exec(ua);
  const sistema = android ? `Android ${android[1]}`
    : /Windows/.test(ua) ? 'Windows'
    : /Mac OS X/.test(ua) ? 'macOS'
    : /Linux/.test(ua) ? 'Linux'
    : 'Aparelho';
  const navegador = /Edg\//.test(ua) ? 'Edge' : versao ? 'Chrome' : 'navegador';
  return `${sistema} · ${navegador}${versao ? ` ${versao[1]}` : ''}`;
}

// O Chrome pede licença para uma página da internet falar com a rede local.
// O nome da permissão mudou entre versões; sem ela no navegador, null.
async function permissaoDaRedeLocal() {
  for (const name of ['local-network-access', 'local-network']) {
    try {
      return (await navigator.permissions.query({ name })).state;
    } catch { /* nome desconhecido nesta versão */ }
  }
  return null;
}

// ------------------------------------------------------------- conexão ---

/**
 * Estados (evento 'estado'):
 *   sem-pareamento  nunca leu um código
 *   procurando      tentando os endereços do PC, com espera crescente
 *   conectado       aperto de mão feito: capturas podem ir
 *   recusado        o PC recusou de vez (ver RECUSAS); parado até novo código
 *                   ou, no caso "substituida", até alguém tocar na tela
 */
export class Conexao extends EventTarget {
  constructor() {
    super();
    this.convite = null;
    this.estado = 'sem-pareamento';
    this.texto = '';
    this.nomeDaCamera = '';
    this.modo = '';
    this.endereco = '';
    this.retomavel = false;

    this.ws = null;
    this.sessao = null;
    this.seq = 0;
    this.pendentes = new Map();
    this.filaEnvio = Promise.resolve();
    this.filaRecebe = Promise.resolve();
    this.geracao = 0;
    this.parado = true;
    this.espera = 1000;
    this.timerReconexao = 0;
    this.timerEco = 0;
  }

  get conectado() {
    return this.estado === 'conectado';
  }

  iniciar(convite) {
    this.parar();
    this.convite = convite;
    this.nomeDaCamera = convite.nome;
    this.parado = false;
    this.espera = 1000;
    this.retomavel = false;
    this.conectar();
  }

  /** Depois de "Outro aparelho assumiu esta câmera": volta a tentar. */
  retomar() {
    if (this.convite && this.estado === 'recusado' && this.retomavel) this.iniciar(this.convite);
  }

  parar() {
    this.parado = true;
    this.geracao++;
    clearTimeout(this.timerReconexao);
    clearTimeout(this.timerEco);
    const ws = this.ws;
    this.ws = null;
    this.sessao = null;
    ws?.close(1000, 'parado');
    this.falharPendentes('sem conexão');
  }

  esquecer() {
    this.parar();
    this.convite = null;
    this.nomeDaCamera = '';
    try { localStorage.removeItem(CHAVE); } catch { /* sem armazenamento */ }
    this.mudar('sem-pareamento', '');
  }

  /** Manda os recortes (Blobs JPEG) e espera o resultado do PC. */
  async enviarCaptura(blobs) {
    if (!this.conectado) throw new Error('sem conexão');
    const partes = await Promise.all(blobs.map(async (b) => new Uint8Array(await b.arrayBuffer())));
    return this.pedir({ t: 'captura', tamanhos: partes.map((p) => p.length) }, juntar(...partes));
  }

  // ---- por dentro ----------------------------------------------------

  mudar(estado, txt) {
    this.estado = estado;
    this.texto = txt;
    this.dispatchEvent(new CustomEvent('estado', { detail: { estado, texto: txt } }));
  }

  async conectar() {
    const geracao = ++this.geracao;
    if (!sutil) {
      // Sem WebCrypto não há canal seguro: página fora de HTTPS.
      this.mudar('recusado', 'Abra pelo endereço https do FlowFace');
      this.parado = true;
      return;
    }

    const permissao = await permissaoDaRedeLocal();
    if (geracao !== this.geracao || this.parado) return;
    this.mudar('procurando', permissao === 'denied'
      ? 'Acesso à rede local bloqueado: permita nas configurações do site'
      : permissao === 'prompt'
        ? 'Permita o acesso à rede local quando o navegador perguntar'
        : '');

    // O último endereço que funcionou vai primeiro.
    const enderecos = [...this.convite.enderecos];
    if (this.endereco && enderecos.includes(this.endereco)) {
      enderecos.splice(enderecos.indexOf(this.endereco), 1);
      enderecos.unshift(this.endereco);
    }

    let bloqueado = false;
    for (const host of enderecos) {
      if (geracao !== this.geracao || this.parado) return;
      const r = await this.tentar(host, geracao);
      if (r === 'ok') {
        this.endereco = host;
        return;
      }
      if (r === 'final') return;
      if (r === 'bloqueado') bloqueado = true;
    }
    if (geracao !== this.geracao || this.parado) return;
    this.mudar('procurando', bloqueado
      ? 'O navegador bloqueou a rede local: use o Chrome ou o Edge atualizados'
      : 'Computador não encontrado na rede');
    this.agendarReconexao();
  }

  agendarReconexao() {
    clearTimeout(this.timerReconexao);
    this.timerReconexao = setTimeout(() => {
      if (!this.parado) this.conectar();
    }, this.espera);
    this.espera = Math.min(ESPERA_MAX_MS, this.espera * 2);
  }

  /** Um endereço: 'ok' (conectado), 'falhou', 'bloqueado' ou 'final'. */
  tentar(host, geracao) {
    return new Promise((fim) => {
      let ws;
      try {
        ws = new WebSocket(`ws://${host}:${this.convite.porta}`);
      } catch {
        // Síncrono assim é o navegador recusando (conteúdo misto, sem LNA).
        fim('bloqueado');
        return;
      }
      ws.binaryType = 'arraybuffer';

      const segredo = deB64url(this.convite.segredo);
      const cameraId = this.convite.cameraId;
      const nc = crypto.getRandomValues(new Uint8Array(16));
      let ns = null;
      let fase = 'abrindo';   // abrindo | desafio | prova | aberta
      let resolvido = false;
      const concluir = (r) => {
        if (resolvido) return;
        resolvido = true;
        clearTimeout(prazo);
        fim(r);
      };
      const prazo = setTimeout(() => {
        try { ws.close(); } catch { /* ja' fechado */ }
        concluir('falhou');
      }, PRAZO_POR_ENDERECO_MS);

      ws.onopen = () => {
        if (geracao !== this.geracao) {
          ws.close();
          concluir('falhou');
          return;
        }
        fase = 'desafio';
        ws.send(JSON.stringify({ t: 'ola', v: VERSAO, i: cameraId, nc: b64url(nc), ua: descreverAparelho() }));
      };

      ws.onmessage = async (ev) => {
        if (typeof ev.data !== 'string') {
          if (fase === 'aberta') this.receber(new Uint8Array(ev.data));
          return;
        }
        let msg;
        try { msg = JSON.parse(ev.data); } catch { return; }

        if (msg.t === 'recusa') {
          const final = Object.prototype.hasOwnProperty.call(RECUSAS, msg.motivo);
          if (final) {
            this.parado = true;
            this.retomavel = msg.motivo === 'substituida';
            clearTimeout(this.timerReconexao);
            this.mudar('recusado', RECUSAS[msg.motivo]);
          }
          if (fase !== 'aberta') concluir(final ? 'final' : 'falhou');
          return;
        }

        try {
          if (fase === 'desafio' && msg.t === 'desafio') {
            ns = deB64url(msg.ns);
            fase = 'prova';
            const mac = await hmac(segredo, mensagemDaProva('cliente', cameraId, nc, ns));
            ws.send(JSON.stringify({ t: 'prova', mac: b64url(mac) }));
            return;
          }
          if (fase === 'prova' && msg.t === 'pronto') {
            const esperada = await hmac(segredo, mensagemDaProva('servidor', cameraId, nc, ns));
            if (!iguais(deB64url(msg.mac || ''), esperada)) {
              // Quem respondeu não conhece o segredo: não é o PhysikFlow.
              console.warn('FlowFace: o computador em', host, 'não provou o pareamento.');
              ws.close();
              concluir('falhou');
              return;
            }
            this.sessao = await derivarSessao(segredo, nc, ns);
            if (geracao !== this.geracao) {
              ws.close();
              concluir('falhou');
              return;
            }
            fase = 'aberta';
            this.ws = ws;
            this.nomeDaCamera = msg.nome || this.convite.nome;
            this.modo = msg.modo || '';
            this.espera = 1000;
            this.mudar('conectado', '');
            this.agendarEco();
            concluir('ok');
          }
        } catch (erro) {
          console.warn('FlowFace: aperto de mão falhou:', erro);
          ws.close();
          concluir('falhou');
        }
      };

      ws.onclose = () => {
        if (fase === 'aberta' && this.ws === ws) this.caiu();
        concluir('falhou');
      };
      ws.onerror = () => { /* o onclose vem logo em seguida */ };
    });
  }

  caiu() {
    this.ws = null;
    this.sessao = null;
    clearTimeout(this.timerEco);
    this.falharPendentes('conexão caiu');
    if (this.parado) return;   // recusa final: o estado já diz por quê
    this.mudar('procurando', 'Conexão com o computador caiu');
    this.agendarReconexao();
  }

  falharPendentes(motivo) {
    for (const p of this.pendentes.values()) {
      clearTimeout(p.timer);
      p.reject(new Error(motivo));
    }
    this.pendentes.clear();
  }

  // Um de cada vez, na ordem: cifrar é assíncrono, e o contador precisa
  // chegar ao PC em ordem crescente.
  pedir(cabecalho, carga = new Uint8Array(0), prazo = PRAZO_DA_RESPOSTA_MS) {
    const seq = ++this.seq;
    const ws = this.ws;
    const sessao = this.sessao;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pendentes.delete(seq);
        reject(new Error('sem resposta'));
      }, prazo);
      this.pendentes.set(seq, { resolve, reject, timer });
      this.filaEnvio = this.filaEnvio
        .then(async () => {
          if (!ws || this.ws !== ws || !sessao) throw new Error('sem conexão');
          ws.send(await selar(sessao, { ...cabecalho, seq }, carga));
        })
        .catch((erro) => {
          const p = this.pendentes.get(seq);
          if (!p) return;
          clearTimeout(p.timer);
          this.pendentes.delete(seq);
          p.reject(erro);
        });
    });
  }

  receber(quadro) {
    const sessao = this.sessao;
    this.filaRecebe = this.filaRecebe.then(async () => {
      if (!sessao || this.sessao !== sessao) return;
      let msg;
      try {
        msg = await abrir(sessao, quadro);
      } catch (erro) {
        console.warn('FlowFace: quadro do computador recusado:', erro.message);
        return;
      }
      const p = this.pendentes.get(msg.cabecalho.seq);
      if (!p) return;
      clearTimeout(p.timer);
      this.pendentes.delete(msg.cabecalho.seq);
      p.resolve(msg.cabecalho);
    });
  }

  // O PC pinga, e o navegador responde sozinho -- mas daqui não dá para ver
  // se o PC sumiu sem fechar (Wi-Fi caiu). Um eco de vez em quando tira a
  // dúvida: sem resposta, fecha e procura de novo.
  agendarEco() {
    clearTimeout(this.timerEco);
    this.timerEco = setTimeout(async () => {
      const ws = this.ws;
      if (!ws) return;
      try {
        await this.pedir({ t: 'eco' }, new Uint8Array(0), PRAZO_DO_ECO_MS);
        if (this.ws === ws) this.agendarEco();
      } catch {
        if (this.ws === ws) ws.close();
      }
    }, ECO_A_CADA_MS);
  }
}
