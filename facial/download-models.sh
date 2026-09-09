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
DETECTOR_URL="https://github.com/Linzaer/Ultra-Light-Fast-Generic-Face-Detector-1MB/raw/master/models/onnx/version-RFB-320.onnx"

echo "📥 Baixando detector leve UltraFace..."
curl --fail --location --retry 3 --progress-bar -o "ultraface-rfb-320.onnx" "$DETECTOR_URL"
echo "📥 Baixando reconhecimento InsightFace..."
curl --fail --location --retry 3 --progress-bar -o "$ARCHIVE" "$ARCHIVE_URL"
unzip -o "$ARCHIVE" w600k_mbf.onnx
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
echo "   - Detector: ultraface-rfb-320.onnx (UltraFace RFB 320)"
echo "   - Reconhecimento: w600k_mbf.onnx (MobileFaceNet / ArcFace)"
echo ""
echo "✅ Concluído!"
