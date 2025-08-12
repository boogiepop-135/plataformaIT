#!/usr/bin/env bash
# Build script para Railway
set -o errexit

echo "🚀 Iniciando build script para Railway..."

# Install Node dependencies and build frontend
echo "📦 Instalando dependencias de Node.js..."
npm install
echo "🏗️  Construyendo frontend..."
npm run build

# Install Python dependencies
echo "📦 Instalando dependencias de Python..."
pip install -r requirements.txt

# Copiar archivos del frontend al directorio static
echo "📁 Copiando archivos del frontend..."
mkdir -p src/static
if [ -d "dist" ]; then
    cp -r dist/* src/static/
    echo "✅ Frontend copiado exitosamente"
else
    echo "⚠️  No se encontró directorio dist"
fi

# Inicializar base de datos
echo "🗄️  Inicializando base de datos..."
cd src
python init_db.py
cd ..

echo "✅ Build completado exitosamente!"
