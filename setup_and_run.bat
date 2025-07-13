@echo off
echo Setting up and running DarkKinny Agent...

:: --- Check for Ollama ---
echo.
echo Checking for Ollama installation...
ollama --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Ollama is not installed or not in PATH. Please install Ollama from https://ollama.com/download
    echo and ensure it's running before proceeding.
    pause
    exit /b 1
) else (
    echo Ollama is installed.
)

:: --- Check for Node.js ---
echo.
echo Checking for Node.js installation...
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo Node.js is not installed. Please install Node.js from https://nodejs.org/en/download/
    pause
    exit /b 1
) else (
    echo Node.js is installed.
)

:: --- Python Agent Setup ---
echo.
echo Setting up Python Agent virtual environment and dependencies...
cd agent
if not exist .venv (
    echo Creating Python virtual environment...
    python -m venv .venv
)
call .venv\Scripts\activate
if %errorlevel% neq 0 (
    echo Failed to activate virtual environment. Ensure Python is installed and in PATH.
    pause
    exit /b 1
)
echo Installing Python dependencies...
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo Failed to install Python dependencies.
    pause
    exit /b 1
)
echo Python Agent setup complete.
cd ..

:: --- Node.js Server Setup ---
echo.
echo Setting up Node.js Server dependencies...
cd server
echo Installing Node.js server dependencies...
npm install
if %errorlevel% neq 0 (
    echo Failed to install Node.js server dependencies.
    pause
    exit /b 1
)
echo Node.js Server setup complete.
cd ..

:: --- Node.js Client Setup ---
echo.
echo Setting up Node.js Client dependencies...
cd cliente
echo Installing Node.js client dependencies...
npm install
if %errorlevel% neq 0 (
    echo Failed to install Node.js client dependencies.
    pause
    exit /b 1
)
echo Node.js Client setup complete.
cd ..

:: --- Starting Components ---
echo.
echo Starting Agent, Server, and Client...

echo Starting Python Agent...
start /B python agent\src\main.py

echo Starting Node.js Server...
start /B node server\src\index.js

echo Starting Node.js Client...
start /B npm --prefix cliente run start

echo.
echo All components are attempting to start in the background.
echo You can close this window, but the processes will continue to run.
echo Check your browser for the client application (usually http://localhost:5173/).
echo To stop the processes, you may need to use Task Manager (Windows) or 'kill' command (Linux).
pause
