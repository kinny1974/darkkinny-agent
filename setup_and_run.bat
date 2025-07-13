@echo off
echo Configurando y ejecutando el Agente DarkKinny...

:: --- Verificar Ollama ---
echo.
echo Verificando la instalacion de Ollama...
ollama --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Ollama no esta instalado o no esta en el PATH. Por favor, instale Ollama desde https://ollama.com/download
    echo y asegurese de que este en ejecucion antes de continuar.
    pause
    exit /b 1
) else (
    echo Ollama esta instalado.
)

:: --- Verificar Node.js ---
echo.
echo Verificando la instalacion de Node.js...
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo Node.js no esta instalado. Por favor, instale Node.js desde https://nodejs.org/en/download/
    pause
    exit /b 1
) else (
    echo Node.js esta instalado.
)

:: --- Configuracion del Agente Python ---
echo.
echo Configurando el entorno virtual y las dependencias del Agente Python...
cd agent
if not exist .venv (
    echo Creando entorno virtual de Python...
    python -m venv .venv
)
call .venv\Scripts\activate
if %errorlevel% neq 0 (
    echo Fallo al activar el entorno virtual. Asegurese de que Python este instalado y en el PATH.
    pause
    exit /b 1
)
echo Instalando dependencias de Python...
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo Fallo al instalar las dependencias de Python.
    pause
    exit /b 1
)
echo Configuracion del Agente Python completada.
cd ..

:: --- Configuracion del Servidor Node.js ---
echo.
echo Configurando las dependencias del Servidor Node.js...
cd server
echo Instalando dependencias del servidor Node.js...
npm install
if %errorlevel% neq 0 (
    echo Fallo al instalar las dependencias del servidor Node.js.
    pause
    exit /b 1
)
echo Configuracion del Servidor Node.js completada.
cd ..

:: --- Configuracion del Cliente Node.js ---
echo.
echo Configurando las dependencias del Cliente Node.js...
cd cliente
echo Instalando dependencias del cliente Node.js...
npm install
if %errorlevel% neq 0 (
    echo Fallo al instalar las dependencias del cliente Node.js.
    pause
    exit /b 1
)
echo Configuracion del Cliente Node.js completada.
cd ..

:: --- Iniciando Componentes ---
echo.
echo Iniciando Agente, Servidor y Cliente...

echo Iniciando Agente Python...
start /B python agent\src\main.py

echo Iniciando Servidor Node.js...
start /B node server\src\index.js

echo Iniciando Cliente Node.js...
start /B npm --prefix cliente run start

echo.
echo Todos los componentes estan intentando iniciarse en segundo plano.
echo Puede cerrar esta ventana, pero los procesos seguiran ejecutandose.
echo Revise su navegador para la aplicacion cliente (normalmente http://localhost:5173/).
echo Para detener los procesos, es posible que deba usar el Administrador de tareas (Windows) o el comando 'kill' (Linux).
pause