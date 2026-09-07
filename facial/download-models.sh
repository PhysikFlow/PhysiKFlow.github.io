#!/bin/bash

# FlowFace PWA — Model Downloader
# Baixa modelos ONNX para detecção e reconhecimento facial

set -e

echo "🔽 FlowFace — Baixando modelos ONNX..."
echo ""

# Criar pasta de modelos
mkdir -p models
cd models

PACKAGE_URL="https://github.com/deepinsight/insightface/releases/download/v0.7/buffalo_s.zip"
PACKAGE_FILE=".buffalo_s.zip"

echo "📥 Baixando pacote oficial InsightFace buffalo_s..."
curl -fL "$PACKAGE_URL" -o "$PACKAGE_FILE" --progress-bar
unzip -j -o "$PACKAGE_FILE" 'det_500m.onnx' -d .
unzip -j -o "$PACKAGE_FILE" 'w600k_mbf.onnx' -d .
mv -f det_500m.onnx scrfd_500m.onnx
mv -f w600k_mbf.onnx arcface_mbf.onnx
rm -f "$PACKAGE_FILE"

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
echo "🎯 Pacote usado pelo PWA: buffalo_s (detector leve + ArcFace MobileFaceNet)"
echo ""
echo "✅ Concluído!"
