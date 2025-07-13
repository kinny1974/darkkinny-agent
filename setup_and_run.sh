#!/bin/bash

echo "Configurando y ejecutando el Agente DarkKinny..."

# --- Verificar Ollama ---
echo ""
echo "Verificando la instalacion de Ollama..."
if ! command -v ollama &> /dev/null
then
    echo "Ollama no esta instalado o no esta en el PATH. Por favor, instale Ollama desde https://ollama.com/download"
    echo "y asegurese de que este en ejecucion antes de continuar."
    exit 1
else
    echo "Ollama esta instalado."
fi

# --- Verificar Node.js ---
echo ""
echo "Verificando la instalacion de Node.js..."
if ! command -v node &> /dev/null
then
    echo "Node.js no esta instalado. Por favor, instale Node.js desde https://nodejs.org/en/download/"
    exit 1
else
    echo "Node.js esta instalado."
fi

# --- Configuracion del Agente Python ---
echo ""
echo "Configurando el entorno virtual y las dependencias del Agente Python..."
cd agent || exit
if [ ! -d ".venv" ]; then
    echo "Creando entorno virtual de Python..."
    python3 -m venv .venv
fi
source .venv/bin/activate
if [ $? -ne 0 ]; then
    echo "Fallo al activar el entorno virtual. Asegurese de que Python3 este instalado y en el PATH."
    exit 1
fi
echo "Instalando dependencias de Python..."
pip install -r requirements.txt
if [ $? -ne 0 ]; then
    echo "Fallo al instalar las dependencias de Python."
    exit 1
fi
echo "Configuracion del Agente Python completada."
cd ..

# --- Configuracion del Servidor Node.js ---
echo ""
echo "Configurando las dependencias del Servidor Node.js..."
cd server || exit
echo "Instalando dependencias del servidor Node.js..."
npm install
if [ $? -ne 0 ]; then
    echo "Fallo al instalar las dependencias del servidor Node.js."
    exit 1
fi
echo "Configuracion del Servidor Node.js completada."
cd ..

# --- Configuracion del Cliente Node.js ---
echo ""
echo "Configurando las dependencias del Cliente Node.js..."
cd cliente || exit
echo "Instalando dependencias del cliente Node.js..."
npm install
if [ $? -ne 0 ]; then
    echo "Fallo al instalar las dependencias del cliente Node.js."
    exit 1
fi
echo "Configuracion del Cliente Node.js completada."
cd ..

# --- Iniciando Componentes ---
echo ""
echo "Iniciando Agente, Servidor y Cliente..."

echo "Iniciando Agente Python..."
python3 agent/src/main.py &
AGENT_PID=$!

echo "Iniciando Servidor Node.js..."
node server/src/index.js &
SERVER_PID=$!

echo "Iniciando Cliente Node.js..."
npm --prefix cliente run start &
CLIENT_PID=$!

echo ""
echo "Todos los componentes estan intentando iniciarse en segundo plano."
echo "Revise su navegador para la aplicacion cliente (normalmente http://localhost:5173/)."
echo "Para detener los procesos, ejecute: kill $AGENT_PID $SERVER_PID $CLIENT_PID"

wait $AGENT_PID $SERVER_PID $CLIENT_PID