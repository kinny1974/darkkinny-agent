#!/bin/bash

echo "Setting up and running DarkKinny Agent..."

# --- Check for Ollama ---
echo ""
echo "Checking for Ollama installation..."
if ! command -v ollama &> /dev/null
then
    echo "Ollama is not installed or not in PATH. Please install Ollama from https://ollama.com/download"
    echo "and ensure it's running before proceeding."
    exit 1
else
    echo "Ollama is installed."
fi

# --- Check for Node.js ---
echo ""
echo "Checking for Node.js installation..."
if ! command -v node &> /dev/null
then
    echo "Node.js is not installed. Please install Node.js from https://nodejs.org/en/download/"
    exit 1
else
    echo "Node.js is installed."
fi

# --- Python Agent Setup ---
echo ""
echo "Setting up Python Agent virtual environment and dependencies..."
cd agent || exit
if [ ! -d ".venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv .venv
fi
source .venv/bin/activate
if [ $? -ne 0 ]; then
    echo "Failed to activate virtual environment. Ensure Python3 is installed and in PATH."
    exit 1
fi
echo "Installing Python dependencies..."
pip install -r requirements.txt
if [ $? -ne 0 ]; then
    echo "Failed to install Python dependencies."
    exit 1
fi
echo "Python Agent setup complete."
cd ..

# --- Node.js Server Setup ---
echo ""
echo "Setting up Node.js Server dependencies..."
cd server || exit
echo "Installing Node.js server dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "Failed to install Node.js server dependencies."
    exit 1
fi
echo "Node.js Server setup complete."
cd ..

# --- Node.js Client Setup ---
echo ""
echo "Setting up Node.js Client dependencies..."
cd cliente || exit
echo "Installing Node.js client dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "Failed to install Node.js client dependencies."
    exit 1
fi
echo "Node.js Client setup complete."
cd ..

# --- Starting Components ---
echo ""
echo "Starting Agent, Server, and Client..."

echo "Starting Python Agent..."
python3 agent/src/main.py &
AGENT_PID=$!

echo "Starting Node.js Server..."
node server/src/index.js &
SERVER_PID=$!

echo "Starting Node.js Client..."
npm --prefix cliente run start &
CLIENT_PID=$!

echo ""
echo "All components are attempting to start in the background."
echo "Check your browser for the client application (usually http://localhost:5173/)."
echo "To stop the processes, run: kill $AGENT_PID $SERVER_PID $CLIENT_PID"

wait $AGENT_PID $SERVER_PID $CLIENT_PID
