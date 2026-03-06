#!/bin/bash
# Sincroniza os markdowns da pasta fonte para o dashboard
# Use sempre que editar arquivos em inteligencia-mercado/

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SOURCE="$SCRIPT_DIR/inteligencia-mercado/"
DEST="$SCRIPT_DIR/dashboard/src/docs/"

echo "Sincronizando docs..."
cp "$SOURCE"*.md "$DEST"
echo "Pronto. Arquivos copiados de inteligencia-mercado/ para dashboard/src/docs/"
