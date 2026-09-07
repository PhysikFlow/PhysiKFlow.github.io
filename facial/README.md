# FlowFace PWA — Detector Facial

PWA de detecção e reconhecimento facial offline usando ONNX Runtime Web.

## Stack

- **Câmera:** Web APIs (`getUserMedia`)
- **IA:** ONNX Runtime Web (WebGPU → WASM fallback)
- **Detector:** SCRFD/BlazeFace/YOLO-face
- **Reconhecimento:** ArcFace
- **Performance:** Web Worker
- **Offline:** Service Worker + IndexedDB
- **Backend:** Supabase (opcional)

## Estrutura

```
facial/
├── index.html          # HTML principal
├── styles.css          # Estilos
├── app.js              # Lógica principal
├── db.js               # IndexedDB
├── supabase.js         # Integração Supabase
├── detector.worker.js  # Web Worker de inferência
├── sw.js               # Service Worker
├── manifest.json       # Manifest PWA
├── icon.svg            # Ícone SVG
└── models/             # Modelos ONNX (criar pasta)
    ├── scrfd_500m.onnx
    └── arcface_mbf.onnx
```

## Modelos ONNX

Para funcionar, você precisa dos seguintes modelos ONNX:

### Detector Facial (SCRFD)
- **Arquivo:** `scrfd_500m.onnx`
- **Fonte:** pacote oficial InsightFace `buffalo_s`
- **Download:** Execute `download-models.sh`

### Reconhecimento Facial (ArcFace)
- **Arquivo:** `arcface_mbf.onnx`
- **Fonte:** pacote oficial InsightFace `buffalo_s`
- **Download:** Execute `download-models.sh`

### Alternativas Open Source

1. **YOLO-face** - https://github.com/deepcam-cn/yolov5-face
2. **BlazeFace** - https://github.com/tensorflow/tfjs-models/tree/master/face-detection
3. **MediaPipe Face Detection** - https://google.github.io/mediapipe/solutions/face_detection.html

## Setup

### 1. Criar pasta de modelos

```bash
mkdir -p facial/models
```

### 2. Baixar/Converter modelos

```bash
# Exemplo com pip
pip install onnxruntime

# Converter do InsightFace
python -c "
import onnxruntime as ort
# Carregar modelo e exportar
"
```

### 3. Gerar ícones PNG

Abra `generate-icons.html` no navegador e salve os PNGs gerados.

### 4. Configurar Supabase (opcional)

Crie as seguintes tabelas no Supabase:

```sql
-- Usuários
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Embeddings
CREATE TABLE embeddings (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  name TEXT,
  embedding FLOAT8[],
  device_id TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Log de acessos
CREATE TABLE access_log (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID,
  user_name TEXT,
  recognized BOOLEAN,
  device_id TEXT,
  timestamp TIMESTAMP DEFAULT NOW()
);
```

### 5. Configurar RLS (Row Level Security)

```sql
-- Habilitar RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_log ENABLE ROW LEVEL SECURITY;

-- Políticas (ajuste conforme necessidade)
CREATE POLICY "Allow all operations" ON users FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON embeddings FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON access_log FOR ALL USING (true);
```

### 6. Configurar no app

No app, acesse o Supabase pelo console do navegador:

```javascript
// No console do navegador
await db.setConfig('supabase_url', 'https://seu-projeto.supabase.co');
await db.setConfig('supabase_key', 'sua-chave-anon');
```

## Uso

### Modo Normal

1. Abra `index.html` no navegador
2. Toque na tela para ativar a câmera
3. Olhe para a câmera
4. O sistema detectará e reconhecerá rostos cadastrados

### Modo Cadastro

1. Pressione `Ctrl+Shift+R` ou toque 3 vezes na área da câmera
2. Digite o nome da pessoa
3. Olhe para a câmera
4. O rosto será cadastrado automaticamente

### Atalhos

- **Enter** - Ativar câmera
- **Escape** - Voltar para tela inicial
- **Ctrl+Shift+R** - Modo cadastro

## Funcionalidades

### Offline

- Service Worker cacheia todos os arquivos
- IndexedDB armazena embeddings localmente
- Funciona sem internet após primeiro carregamento

### WebGPU Acceleration

- Detecta automaticamente se WebGPU está disponível
- Usa WASM como fallback
- Performance superior em dispositivos compatíveis

### Web Worker

- Inferência roda fora da thread principal
- Interface continua responsiva
- Processamento paralelo de frames

### Sync com Supabase

- Sincronização automática a cada 5 minutos
- Sync quando a página fica visível
- Upload de novos embeddings
- Log de acessos

## Navegadores Suportados

- Chrome 90+
- Edge 90+
- Firefox 90+
- Safari 15+

**Nota:** WebGPU requer Chrome 113+ ou Edge 113+

## Troubleshooting

### Câmera não funciona

- Verifique as permissões do navegador
- Teste em HTTPS (requisito para `getUserMedia`)
- Verifique se outro app não está usando a câmera

### Modelos não carregam

- Verifique se os arquivos `.onnx` estão na pasta `models/`
- Verifique o console do navegador para erros
- Teste com modelos menores primeiro

### Performance ruim

- Use dispositivo com WebGPU
- Reduza a resolução da câmera
- Aumente `DETECTION_INTERVAL` no `app.js`

## Licença

MIT
