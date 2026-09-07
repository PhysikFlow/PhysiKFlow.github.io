#!/bin/bash

# FlowFace PWA — Model Downloader
# Baixa modelos ONNX para detecção e reconhecimento facial

set -e

echo "🔽 FlowFace — Baixando modelos ONNX..."
echo ""

# Criar pasta de modelos
mkdir -p models
cd models

# Base URL do repositório
BASE_URL="https://raw.githubusercontent.com/yakhyo/face-reidentification/main/weights"

# Modelos para download
declare -A MODELS=(
  ["scrfd_500m.onnx"]="det_500m.onnx"
  ["scrfd_2.5g.onnx"]="det_2.5g.onnx"
  ["scrfd_10g.onnx"]="det_10g.onnx"
  ["arcface_mbf.onnx"]="w600k_mbf.onnx"
  ["arcface_r50.onnx"]="w600k_r50.onnx"
)

# Função para baixar com progresso
download_model() {
  local output_name=$1
  local source_name=$2
  local url="${BASE_URL}/${source_name}"
  
  if [ -f "$output_name" ]; then
    echo "✅ $output_name já existe"
    return
  fi
  
  echo "📥 Baixando $output_name..."
  if curl -L -o "$output_name" "$url" --progress-bar; then
    echo "✅ $output_name baixado com sucesso"
  else
    echo "❌ Erro ao baixar $output_name"
    rm -f "$output_name"
    return 1
  fi
}

echo "=========================================="
echo "  Modelos de Detecção (SCRFD)"
echo "=========================================="
echo ""

download_model "scrfd_500m.onnx" "det_500m.onnx"
download_model "scrfd_2.5g.onnx" "det_2.5g.onnx"
download_model "scrfd_10g.onnx" "det_10g.onnx"

echo ""
echo "=========================================="
echo "  Modelos de Reconhecimento (ArcFace)"
echo "=========================================="
echo ""

download_model "arcface_mbf.onnx" "w600k_mbf.onnx"
download_model "arcface_r50.onnx" "w600k_r50.onnx"

echo ""
echo "=========================================="
echo "  Resumo"
echo "=========================================="
echo ""
echo "📦 Modelos disponíveis:"
echo ""

ls -lh *.onnx 2>/dev/null || echo "Nenhum modelo encontrado"

echo ""
echo "=========================================="
echo "  Recomendações"
echo "=========================================="
echo ""
echo "🎯 Para PWA mobile (mais leve):"
echo "   - Detector: scrfd_500m.onnx (2.41 MB)"
echo "   - Reconhecimento: arcface_mbf.onnx (12.99 MB)"
echo ""
echo "🎯 Para desktop (melhor precisão):"
echo "   - Detector: scrfd_2.5g.onnx (3.14 MB)"
echo "   - Reconhecimento: arcface_r50.onnx (166 MB)"
echo ""
echo "✅ Concluído!"
