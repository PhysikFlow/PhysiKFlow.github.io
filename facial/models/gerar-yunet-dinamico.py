"""Gera models/yunet-2023mar-dinamico.onnx a partir do YuNet oficial.

O YuNet do OpenCV Zoo declara a entrada fixa em 1x3x640x640. A rede em si
aceita qualquer tamanho multiplo de 32 (o OpenCV a roda assim no desktop), mas
o ONNX Runtime confere a entrada contra o que o arquivo declara e recusa
outro tamanho. Detectar em 640x640 no navegador custa ~4x o necessario: o
rosto de quem esta' diante do totem ja' e' grande.

Este script so' troca as dimensoes DECLARADAS por nomes simbolicos (altura,
largura e a contagem de cada saida) e tira as 94 anotacoes de forma das
camadas internas (`value_info`), todas calculadas para 640x640 -- com elas o
ONNX Runtime "espera" saidas de 640 e reclama a cada quadro. Ele recalcula as
formas sozinho. Nenhum peso muda. Sem dependencias: le e reescreve o protobuf
a mao.

Uso:
    python gerar-yunet-dinamico.py [caminho/do/face_detection_yunet_2023mar.onnx]

Sem argumento, baixa do OpenCV Zoo e confere o sha256.
"""
import hashlib
import sys
import urllib.request
from pathlib import Path

URL = ("https://github.com/opencv/opencv_zoo/raw/main/models/"
       "face_detection_yunet/face_detection_yunet_2023mar.onnx")
SHA256_ORIGINAL = "8f2383e4dd3cfbb4553ea8718107fc0423210dc964f9f4280604804ed2552fa4"
SAIDA = Path(__file__).with_name("yunet-2023mar-dinamico.onnx")


# ---------------------------------------------------------------- protobuf --

def ler_varint(b, p):
    r = s = 0
    while True:
        c = b[p]
        p += 1
        r |= (c & 0x7F) << s
        s += 7
        if c < 0x80:
            return r, p


def varint(v):
    out = bytearray()
    while True:
        c = v & 0x7F
        v >>= 7
        if v:
            out.append(c | 0x80)
        else:
            out.append(c)
            return bytes(out)


def campos(b):
    p, out = 0, []
    while p < len(b):
        chave, p = ler_varint(b, p)
        f, t = chave >> 3, chave & 7
        if t == 0:
            v, p = ler_varint(b, p)
        elif t == 1:
            v, p = b[p:p + 8], p + 8
        elif t == 2:
            n, p = ler_varint(b, p)
            v, p = b[p:p + n], p + n
        elif t == 5:
            v, p = b[p:p + 4], p + 4
        else:
            raise ValueError(f"tipo de campo protobuf inesperado: {t}")
        out.append((f, t, v))
    return out


def montar(lista):
    out = bytearray()
    for f, t, v in lista:
        out += varint((f << 3) | t)
        if t == 0:
            out += varint(v)
        elif t == 2:
            out += varint(len(v)) + v
        else:
            out += v
    return bytes(out)


# ------------------------------------------------------------------- ONNX --
# ModelProto.graph = 7; GraphProto.input = 11, .output = 12, .value_info = 13;
# ValueInfoProto.name = 1, .type = 2; TypeProto.tensor_type = 1;
# Tensor.shape = 2; TensorShapeProto.dim = 1; Dimension.dim_value = 1, .dim_param = 2.

def dims_simbolicas(valor, nomes):
    """Reescreve as dimensoes de um ValueInfoProto; `nomes[i]` None = mantem."""
    def no_shape(shape):
        novo, i = [], 0
        for f, t, v in campos(shape):
            if f == 1:
                if i < len(nomes) and nomes[i]:
                    v = montar([(2, 2, nomes[i].encode())])
                i += 1
            novo.append((f, t, v))
        return montar(novo)

    def no_tensor(tensor):
        return montar([(f, t, no_shape(v) if f == 2 else v) for f, t, v in campos(tensor)])

    def no_tipo(tipo):
        return montar([(f, t, no_tensor(v) if f == 1 else v) for f, t, v in campos(tipo)])

    return montar([(f, t, no_tipo(v) if f == 2 else v) for f, t, v in campos(valor)])


def nome_de(valor):
    return next(v.decode() for f, t, v in campos(valor) if f == 1)


def converter(original: bytes) -> bytes:
    modelo = campos(original)
    novo_modelo = []
    for f, t, v in modelo:
        if f == 7:
            grafo = []
            for gf, gt, gv in campos(v):
                if gf == 13:
                    continue   # formas internas de 640x640: o runtime recalcula
                if gf == 11:
                    gv = dims_simbolicas(gv, [None, None, "altura", "largura"])
                elif gf == 12:
                    # cls_8, bbox_16, kps_32...: [1, N, k]. N depende da entrada.
                    passo = nome_de(gv).split("_")[-1]
                    gv = dims_simbolicas(gv, [None, f"n_{passo}", None])
                grafo.append((gf, gt, gv))
            v = montar(grafo)
        novo_modelo.append((f, t, v))
    return montar(novo_modelo)


def main():
    if len(sys.argv) > 1:
        original = Path(sys.argv[1]).read_bytes()
    else:
        print("Baixando", URL)
        original = urllib.request.urlopen(URL).read()

    soma = hashlib.sha256(original).hexdigest()
    if soma != SHA256_ORIGINAL:
        sys.exit(f"sha256 inesperado: {soma}\nNao e' o YuNet 2023mar conferido.")

    convertido = converter(original)
    SAIDA.write_bytes(convertido)
    print(f"{SAIDA.name}: {len(convertido)} bytes, sha256 {hashlib.sha256(convertido).hexdigest()}")


if __name__ == "__main__":
    main()
