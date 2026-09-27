# FlowFace — câmera de acesso do PhysikFlow

PWA que transforma um celular, tablet ou notebook na câmera de acesso da academia.

**O que ele faz:**
- acha o rosto e orienta a pessoa ("aproxime-se", "olhe de frente", "fique parado");
- escolhe três quadros bons e recorta o rosto (JPEG 320×320, ~20 KB).

**Quem reconhece é o PhysikFlow no computador da recepção,** com o mesmo índice da busca por rosto. Neste aparelho não existe vetor facial, cadastro nem banco de rostos: nada biométrico mora nele.

> **Ainda não existe:** o envio ao computador (pareamento por QR + rede local). Até lá, a captura para na tela com a mensagem "Sem computador pareado: nada foi enviado." Os recortes ficam só na memória, e dá para vê-los no painel técnico.

## Os três modos

Feito para ficar ligado o dia inteiro, em qualquer aparelho, sem gastar à toa.

| Modo | Tela | O que roda |
|---|---|---|
| **desligado** | descanso, com o que falta ("Toque para ativar a câmera", "Câmera bloqueada…") | nada |
| **descanso** | "Aproxime-se para acessar" | câmera a 5 quadros/s e um vigia de movimento (miniatura de 64 px, 4 leituras/s). O detector de rosto e o desenho ficam parados |
| **ativo** | câmera, contorno e quadrado | detector de rosto: 15/s com rosto na tela, 6/s procurando alguém |

Como o app passa de um modo para outro:
- **Ao abrir:** se a permissão da câmera já foi dada, liga sozinho em descanso. Senão, espera um toque, porque o pedido de permissão precisa de alguém na frente.
- **Acorda** com movimento (3% da imagem mudando por duas leituras seguidas) ou com um toque.
- **Volta ao descanso** depois de 15 s sem rosto, ou pelo botão ✕.
- **Aba escondida** (tablet bloqueado, outro app na frente): solta a câmera de vez e religa em descanso na volta.
- **Câmera caiu** (outro app, cabo solto): tenta religar sozinho, com espera crescente de 2 s até 30 s.

**Por que o vigia não confunde luz com gente:**
- A exposição automática clareia ou escurece a imagem inteira. O vigia tira a mudança média antes de comparar ponto a ponto.
- O fundo de referência acompanha a cena devagar (~2,5 s), então uma luz que muda de vez não fica acordando o totem.

**Medido** num Edge headless (Ryzen 5 5500), com uma câmera falsa: sala vazia, depois luz clareando 14%, depois uma pessoa entrando e saindo.
- A luz não acordou o totem.
- A pessoa acordou em ~0,5 s.
- Sem rosto, voltou ao descanso no tempo marcado.

| | detector (ms de CPU por segundo) | detecções/s |
|---|---|---|
| descanso, sala vazia | 17,5 (só o vigia) | 0 |
| ativo, pessoa na frente | 84,4 | 14,6 |
| ativo, procurando alguém | 33,6 | 5,9 |

**Outros cuidados de consumo:**
- **Sem desfoque sobre o vídeo:** nenhum elemento usa `backdrop-filter`, que refaz o desfoque a cada quadro do vídeo.
- **Nada anima sem parar:** o ponto verde do descanso pulsa três vezes e para.
- **Tela acesa:** fica acesa (Wake Lock) enquanto a câmera está ligada.

## O quadrado

- **Detecção fora da tela:** roda num worker, sobre uma imagem de 320 px, e só um quadro por vez fica em voo.
- **Filtro One Euro:** tira o tremido parado sem segurar o movimento.
- **Adiantamento:** a posição é adiantada pelo tempo que a detecção levou.
- **Mola amortecida:** o desenho persegue essa posição a cada quadro da tela. Entre uma detecção e outra (12 por segundo num celular), o quadrado **desliza em vez de pular**.
- **Tempo da mola:** acompanha o intervalo real entre detecções, ~60 ms a 15/s e ~80 ms a 12/s.

**Medido** com a mesma câmera falsa, a foto andando numa trajetória conhecida:

| | antes | agora |
|---|---|---|
| maior pulo de um quadro para o outro, a 12 detecções/s | 17–32 px | 2–5 px |
| tremido | 30 px | 5 px |
| erro com o rosto andando | 40 px | 16 px |
| atraso com o rosto andando | 164 ms | ~90–120 ms |

Com a pessoa parada, não há atraso. Adiantar mais o alvo da mola tiraria o atraso, mas o quadrado passaria do ponto quando a pessoa para (até 35 px); por isso `LEAD_MS` fica em 0.

## Arquivos

```
facial/
├── index.html
├── styles.css
├── app.js                 modos, câmera, vigia, portões de qualidade, desenho
├── detector.worker.js     YuNet no ONNX Runtime Web, vigia de movimento e JPEG, fora da thread da tela
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

Todos os limites, e os de ritmo, vigia e mola, ficam em `CONFIG`, no começo do `app.js`.

## Testar

`getUserMedia` só funciona em HTTPS ou em `localhost`. Na raiz do repositório, rode:

```bash
python -m http.server 8080
```

e abra `http://localhost:8080/facial/`.

- **Painel técnico:** tecla **D**, três toques em "FLOWFACE" com a câmera aberta, ou `?debug` na URL.
  - Com a câmera aberta: fps da tela, detecções/s, inferência, tamanho da entrada, motivo do portão, recortes capturados.
  - No descanso: quanto da imagem o vigia viu mudar e quanto custou cada leitura.
- **Sem câmera:** `?fonte=<imagem ou vídeo do mesmo site>`. Uma imagem vira um vídeo que passeia devagar; use `&movimento=0` para parada. Use só fotos de quem consentiu, e não suba essas fotos para o repositório.

## Navegadores

- **Chrome e Edge, no Android e no desktop:** é o alvo.
- **iOS:** fora da primeira versão. Falar com o computador pela rede local a partir de uma página HTTPS depende do "Local Network Access" do Chrome, que o Safari não tem.
