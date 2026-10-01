# FlowFace — câmera de acesso do PhysikFlow

PWA que transforma um celular, tablet ou notebook na câmera de acesso da academia.

**O que ele faz:**
- acha o rosto e orienta a pessoa ("aproxime-se", "olhe de frente", "fique parado");
- escolhe três quadros bons e recorta o rosto (JPEG 320×320, ~20 KB);
- manda os recortes, cifrados, ao PhysikFlow da recepção e mostra a resposta ("Olá, Maria").

**Quem reconhece é o PhysikFlow no computador da recepção,** com o mesmo índice da busca por rosto. Neste aparelho não existe vetor facial, cadastro nem banco de rostos: nada biométrico mora nele.

> **Dois modos, escolhidos no card da câmera, no PhysikFlow:**
> - **Teste (sombra), o padrão:** a câmera só identifica. O PhysikFlow responde quem é, compara com as passagens da catraca e conta os acertos, mas não abre nada. O totem diz "Modo teste: use o cartão ou o facial para entrar."
> - **Abre:** com a câmera escolhida para uma catraca e a chave "Abre a catraca" ligada, o PhysikFlow decide como decide para o cartão e abre para quem a câmera reconhece. O totem diz "Pode passar, Maria" ou o motivo de não abrir ("Plano vencido em 31/12. Procure a recepção.").

## Pareamento e conexão (`conexao.js`)

No PhysikFlow: aba **Dispositivos → Adicionar dispositivo → Câmera no celular ou tablet**, e no card da câmera, **Mostrar código**. O QR abre este app com `#par=<convite>`.

- **O convite** traz o id da câmera, um segredo de 32 bytes, os endereços do PC na rede e a porta (7793). Vai para o `localStorage` e **sai da barra de endereço na hora**: o segredo não fica no histórico.
- **Quem hospeda o servidor é o próprio PhysikFlow**, sem programa a parte. O app tenta os endereços do convite em ordem (o último que funcionou primeiro) e reconecta sozinho, com espera crescente até 30 s.
- **Aperto de mão mútuo:** HMAC-SHA256 do segredo sobre dois nonces. O aparelho só manda rosto depois de o PC provar que conhece o segredo.
- **Cada mensagem** vai em AES-256-GCM, com chave da sessão (HKDF-SHA256) e numerada. Quadro repetido, fora de ordem ou adulterado é recusado.
- **Nada fica aqui:** os recortes saem, a resposta volta. Nem o totem nem o PC guardam a imagem (P-138).

É o espelho de `backend/face/totem/TotemProtocol.h`, no repositório do app. Mudou um, muda o outro: o teste `CameraTotemTests` do app roda este arquivo no Node contra o servidor de verdade.

**O que a tela de descanso diz:**

| Situação | Tela |
|---|---|
| pareado e conectado | Pronto · Recepção |
| procurando o PC | Procurando o computador… (ou o motivo: rede local bloqueada, computador fora da rede) |
| segredo errado ou câmera removida | Pareamento recusado: leia o código de novo no PhysikFlow |
| outro aparelho pareou a mesma câmera | Outro aparelho assumiu esta câmera. Toque para retomar |
| nunca pareado | Sem computador pareado: leia o código no PhysikFlow |

**Esquecer o pareamento:** painel técnico → botão **Esquecer pareamento**. **Parear de novo**, no card da câmera, invalida o código antigo e derruba o aparelho que o usava.

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
├── conexao.js             pareamento e conversa cifrada com o PhysikFlow
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

**Pedem só o que o PC precisa para reconhecer.** Onde o rosto está na tela não importa: o recorte vai atrás dele, e o contorno é só um convite. O tamanho conta em px da imagem da câmera, que é o que chega ao PC, e não contra o contorno.

A captura acontece com tudo certo por 0,25 s. Uma leitura ruim isolada no meio (um quadro sem rosto, ou com os pontos errados) não zera essa espera. A instrução na tela mostra o primeiro portão que falhar por mais de 0,3 s:

| Portão | Regra | Instrução |
|---|---|---|
| tamanho | rosto com ≥ 64 px de largura na imagem da câmera | Aproxime-se |
| caber na imagem | até 35% da caixa do rosto pode passar da borda (embaixo e nos lados o PC aguenta); passando disso, rosto maior que 90% da imagem é perto demais | Mostre o rosto inteiro na tela / Afaste-se um pouco |
| testa na imagem | acima dos olhos, pelo menos 0,15 da distância olho-boca até a borda de cima | Mostre o rosto inteiro na tela |
| de lado | o nariz tem de estar entre os olhos (de lado ~40° ou mais, não) | Olhe de frente para a câmera |
| inclinado | a linha dos olhos até 25° — mas o detector lê a inclinação para menos (30° de verdade lê ~7°), então só pega cabeça deitada | Endireite a cabeça |
| para cima ou para baixo | nariz entre 25% e 90% do caminho dos olhos à boca | Olhe de frente para a câmera |
| luz | brilho médio do miolo do rosto entre 28 e 235 | Pouca luz no rosto / Luz forte demais no rosto |
| parado | < 2 larguras de rosto por segundo | Fique parado um instante |

**Por que o "de frente" ficou tão largo:** os cinco pontos do detector, com o rosto pequeno na imagem de 320 px, erram mais do que a pose. O mesmo rosto parado lia 0,26 de longe e 0,63 de perto (1 = de frente) — o portão antigo, de 0,55, virava exigência de distância. Só o nariz fora de entre os olhos é sinal firme de rosto de lado.

**Por que a testa tem regra própria:** com a testa fora da imagem, o detector desenha a caixa só até a borda, e o portão de "caber na imagem" não percebe. Sem testa, o PC reconhece mal: com 35% do rosto fora no alto, 34 de 81. Nos lados e embaixo ele aguenta bem mais corte.

**A lupa (longe).** Na imagem inteira reduzida a 320 px, um rosto de 80 px na câmera fica com 20 — e abaixo disso o detector já não o achava. Com um rosto menor que 160 px à vista, a detecção passa a olhar só a região em volta dele, onde ele ocupa ~1/5 da entrada: acha rostos de ~40 px e acerta os pontos. Procurando alguém, ela alterna a imagem inteira com o miolo ampliado 2x, por onde costuma vir quem chega de longe. A entrada do detector continua com 320 px, então o custo não muda. Painel técnico: a linha "Entrada" diz `lupa`, `miolo` ou `conferencia`.

**Tentar de novo sozinho.** Se o PC responde sem nome (não teve certeza, não achou o rosto, estava ocupado), o totem faz outra captura 0,9 s depois, com a pessoa ainda na frente, até duas vezes. Nome reconhecido (liberado ou negado) é resposta final. Entre as tentativas a tela diz "vou tentar de novo", sem vermelho; só a última resposta sem nome manda procurar a recepção. No card da câmera, cada tentativa conta como uma identificação.

**Outra pessoa, do zero.** Se o rosto na frente muda de lugar (quem estava saiu e ficou quem vinha atrás), a contagem recomeça. Antes, um rosto que nunca sumia (um cartaz, alguém parado ao fundo) prendia o totem em "Captura feita" para todo mundo que chegasse depois.

**Medido** no laboratório do app (`tools/face-lab/tolerancia.py`: 300 retratos, com o caminho inteiro câmera → este app → PC → regra de porta) e num Edge headless com câmera falsa:
- **Alcance:** com a lupa, o totem acha rosto de 44 px em 243 de 300 (antes, 2) e de 60 px em 296 (antes, 68).
- **O que o PC reconhece:** é a mesma foto do índice, então o número é otimista.
  - rosto de 60 px: 296 de 300;
  - até 20% do rosto fora da imagem: de 278 a 300;
  - cabeça inclinada 15°: 299;
  - borrão de 8 px: 300;
  - luz 35: 296.
- **Os portões antigos barravam boa parte disso,** mesmo sem contar o contorno. Dos reconhecidos, barravam 209 de 299 com o rosto de 90 px, 127 de 299 com a cabeça inclinada 15° e 230 de 297 com luz 50. Os novos barram só abaixo de 64 px, a testa cortada e a luz abaixo de 28.
- **Pessoa errada:** zero aceites errados com rosto pequeno, cortado, inclinado ou borrado. Os 6 que houve, em 17.085 recortes, vieram de 4 pessoas com um parecido forte na base, 5 deles com o rosto grande e inteiro (P-136, no repositório do app).
- **Edge headless,** com o rosto de teste `lena.jpg` (amostra do OpenCV), em 14 cenas:
  - a versão anterior não capturou em nenhuma: a lena é de 3/4, e o "de frente" de 0,55 a barrava;
  - mesmo sem esse portão, a anterior capturou só no meio e com pouca luz;
  - a nova capturou em 10, em 0,3 a 0,6 s: no meio, no canto, na borda, no alto, a 100 e a 80 px, a 400 px, inclinada 15°, com pouca luz e balançando;
  - ficaram de fora o rosto de 64 px (no limite), o de 50 px ("Aproxime-se"), o longe fora do meio e a inclinação de 25°.

Todos os limites, e os de ritmo, lupa, vigia e mola, ficam em `CONFIG`, no começo do `app.js`.

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
- **Com o PhysikFlow:** no card da câmera, **Abrir neste computador** abre este app já pareado, pelo mesmo caminho de um tablet. Para testar uma cópia local, mude o endereço do app em `local-settings.ini` (`cameraTotem/app`); `localhost` e `127.0.0.1` são aceitos em qualquer porta.

## Navegadores

- **Chrome e Edge, no Android e no desktop:** é o alvo.
- **Permissão de rede local:** na primeira conexão, o Chrome pergunta se a página pode acessar dispositivos na rede local. Sem essa permissão o totem não acha o PC, e a tela diz isso.
- **iOS:** fora da primeira versão (P-140). Falar com o computador pela rede local a partir de uma página HTTPS depende do "Local Network Access" do Chrome, que o Safari não tem.
