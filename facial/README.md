# FlowFace — câmera de acesso do PhysikFlow

PWA que transforma um celular, tablet ou notebook na câmera de acesso da academia.

**O que ele faz:**
- acha o rosto e orienta a pessoa ("aproxime-se", "olhe de frente", "fique parado");
- escolhe três quadros bons e recorta o rosto (JPEG 320×320, ~20 KB).

**Quem reconhece é o PhysikFlow no computador da recepção,** com o mesmo índice da busca por rosto. Neste aparelho não existe vetor facial, cadastro nem banco de rostos: nada biométrico mora nele.

> **Ainda não existe:** o envio ao computador (pareamento por QR + rede local). Até lá, a captura para na tela com a mensagem "Sem computador pareado: nada foi enviado." Os recortes ficam só na memória, e dá para vê-los no painel técnico.

## Arquivos

```
facial/
├── index.html
├── styles.css
├── app.js                 câmera, laço de quadros, portões de qualidade, desenho
├── detector.worker.js     YuNet no ONNX Runtime Web, fora da thread da tela
├── sw.js                  offline: site com rede primeiro; runtime e modelo com cache primeiro
├── manifest.json
├── icon.svg, icon-192.png, icon-512.png
└── models/
    ├── yunet-2023mar-dinamico.onnx   detector (0,23 MB)
    └── gerar-yunet-dinamico.py       como o arquivo acima foi gerado
```

## Modelo e runtime

- **Detector:** YuNet 2023mar, do [OpenCV Zoo](https://github.com/opencv/opencv_zoo/tree/main/models/face_detection_yunet), com licença MIT.
  - É o mesmo detector do PhysikFlow no desktop. Um rosto aceito aqui é aceito lá.
  - Tem 0,23 MB e devolve caixa, cinco pontos (olhos, nariz, cantos da boca) e confiança.
  - O arquivo original declara a entrada fixa em 640×640, e o ONNX Runtime recusa outro tamanho. `gerar-yunet-dinamico.py` troca só as dimensões declaradas; nenhum peso muda.
  - O resultado foi conferido contra o original no OpenCV: diferença 0.
  - Original: sha256 `8f2383e4dd3cfbb4553ea8718107fc0423210dc964f9f4280604804ed2552fa4`.
  - Gerado: sha256 `29609ad02d555c55ed384c6f6d6fbee3faf23c8849869495012ea750f07a2f32`.
- **Runtime:** [onnxruntime-web](https://www.npmjs.com/package/onnxruntime-web) 1.30.0, WASM, 1 thread, carregado do jsDelivr.
  - Baixa ~3 MB na primeira visita (14 MB descomprimido) e depois fica no cache do service worker.
  - Mais threads exigiriam cabeçalhos COOP/COEP, que o GitHub Pages não envia.

## Por que o quadrado agora acompanha o rosto

A versão anterior copiava o quadro inteiro (1280×720) na thread da tela a cada 100 ms. O quadrado andava com uma transição de CSS de 160 ms e congelava quando o rosto saía do centro.

Agora:
- a detecção roda num worker, sobre uma imagem de 320 px;
- só um quadro fica em voo, e o mais novo sempre vence;
- o desenho é num canvas, a cada quadro da tela;
- um filtro One Euro tira o tremido sem segurar o movimento;
- a posição é adiantada pelo tempo que a detecção levou.

**Medido** num Edge headless (Ryzen 5 5500), com a mesma câmera falsa nos dois: a foto de teste andando numa trajetória conhecida.

| | antes | agora |
|---|---|---|
| detecções por segundo | 6,6 | 30 (limite da câmera) |
| atraso do quadrado | 140 ms | 18 ms |
| erro com o rosto andando | 39 px | 6 px |
| tremido | 31 px | 5 px |
| inferência por quadro | — | 6 ms |

Em aparelho lento, a entrada do detector encolhe sozinha (320 → 192 px) quando a mediana passa de 70 ms.

## Portões de qualidade

A captura só acontece com tudo certo por 0,4 s. A instrução na tela mostra o primeiro portão que falhar:

| Portão | Regra | Instrução |
|---|---|---|
| confiança | detector ≥ 0,75 | Olhe para a câmera |
| tamanho | rosto entre 45% e 105% da largura do contorno, e ≥ 90 px na câmera | Aproxime-se / Afaste-se um pouco |
| centro | centro do rosto no miolo do contorno | Centralize o rosto no contorno |
| de frente | nariz entre os olhos (≥ 0,55), cabeça reta (≤ 15°), sem olhar para cima ou para baixo | Olhe de frente / Endireite a cabeça |
| luz | brilho médio do rosto entre 50 e 220 | Pouca luz / Luz forte demais |
| parado | < 0,6 largura de rosto por segundo | Fique parado um instante |

Os limites ficam em `CONFIG`, no começo do `app.js`.

## Testar

`getUserMedia` só funciona em HTTPS ou em `localhost`. Na raiz do repositório, rode:

```bash
python -m http.server 8080
```

e abra `http://localhost:8080/facial/`.

- **Painel técnico** (fps da tela, detecções/s, inferência, tamanho da entrada, motivo do portão, recortes capturados): três toques em "FLOWFACE", ou a tecla **D**. Também pode abrir já ligado com `?debug`.
- **Sem câmera:** `?fonte=<imagem ou vídeo do mesmo site>`. Uma imagem vira um vídeo que passeia devagar; use `&movimento=0` para parada. Use só fotos de quem consentiu, e não suba essas fotos para o repositório.

## Navegadores

- **Chrome e Edge, no Android e no desktop:** é o alvo.
- **iOS:** fora da primeira versão. Falar com o computador pela rede local a partir de uma página HTTPS depende do "Local Network Access" do Chrome, que o Safari não tem.
