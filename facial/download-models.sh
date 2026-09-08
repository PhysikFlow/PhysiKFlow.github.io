#!/bin/bash

# FlowFace PWA — Model Downloader
# Baixa modelos ONNX para detecção e reconhecimento facial

set -e

echo "🔽 FlowFace — Baixando modelos ONNX..."
echo ""

# Criar pasta de modelos
mkdir -p models
cd models

ARCHIVE_URL="https://github.com/deepinsight/insightface/releases/download/v0.7/buffalo_s.zip"
ARCHIVE="buffalo_s.zip"

echo "📥 Baixando pesos oficiais InsightFace buffalo_s..."
curl --fail --location --retry 3 --progress-bar -o "$ARCHIVE" "$ARCHIVE_URL"
unzip -o "$ARCHIVE" det_500m.onnx w600k_mbf.onnx
rm -f "$ARCHIVE"

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
echo "🎯 Conjunto padrão:"
echo "   - Detector: det_500m.onnx (SCRFD-500MF)"
echo "   - Reconhecimento: w600k_mbf.onnx (MobileFaceNet / ArcFace)"
echo ""
echo "✅ Concluído!"
