# Asistente de Programación (MCP/A2A)

Este proyecto es una interfaz para un agente de programación local (MCP/A2A) que utiliza modelos de lenguaje grandes (LLMs) como LM Studio u Ollama para asistir en tareas de codificación en Node.js, React.js, FastAPI y Python.

## Estructura del Proyecto

## Prerrequisitos

Asegúrate de tener instalado lo siguiente:

* **Node.js y npm/yarn**: Para el frontend y el backend.
* **Python y pip**: Para el agente de Python.
* **LM Studio o Ollama**: Con al menos un modelo de lenguaje descargado y ejecutándose.

## Configuración y Ejecución

Sigue estos pasos para poner en marcha la aplicación:

### 1. Configurar LM Studio o Ollama

Asegúrate de que tu modelo de lenguaje preferido esté descargado y el servidor de inferencia esté funcionando:

* **LM Studio**: Inicia LM Studio, descarga un modelo (ej. `Code Llama`, `Mixtral`), y luego ve a la pestaña "Local Inference Server" para iniciar el servidor. La API estará en `http://localhost:1234/v1`.
* **Ollama**: Instala Ollama y descarga un modelo (ej. `ollama pull codellama`). Ollama se ejecuta como un servicio por defecto, y su API está en `http://localhost:11434/v1`.

Ajusta las variables de entorno en `agent/.env` según tu configuración (LM Studio o Ollama, y el nombre del modelo).

### 2. Configurar y Ejecutar el Agente de Python

1.  Navega al directorio `agent`:
    ```bash
    cd agent
    ```
2.  Crea un entorno virtual (opcional pero recomendado):
    ```bash
    python -m venv venv
    source venv/bin/activate  # En Linux/macOS
    # venv\Scripts\activate   # En Windows
    ```
3.  Instala las dependencias:
    ```bash
    pip install -r requirements.txt
    ```
4.  Crea el archivo `.env` en el directorio `agent/` con la configuración de tu LLM (ver `agent/.env` de ejemplo arriba).
5.  Navega al directorio `agent/src`:
    ```bash
    cd src
    ```
6.  Ejecuta el servidor FastAPI:
    ```bash
    uvicorn main:app --reload --host 0.0.0.0 --port 8000
    ```
    El agente de Python estará disponible en `http://localhost:8000`.

### 3. Configurar y Ejecutar el Backend de Node.js

1.  Abre una nueva terminal y navega al directorio `server`:
    ```bash
    cd server
    ```
2.  Instala las dependencias:
    ```bash
    npm install
    ```
3.  Crea el archivo `.env` en el directorio `server/` con la configuración del puerto y la URL del agente de Python (ver `server/.env` de ejemplo arriba).
4.  Navega al directorio `server/src`:
    ```bash
    cd src
    ```
5.  Ejecuta el servidor Node.js:
    ```bash
    node index.js
    # O para desarrollo con reinicio automático:
    # npm run dev
    ```
    El backend de Node.js estará disponible en `http://localhost:3001`.

### 4. Configurar y Ejecutar el Frontend de React

1.  Abre una nueva terminal y navega al directorio `client`:
    ```bash
    cd client
    ```
2.  Instala las dependencias:
    ```bash
    npm install
    ```
3.  Ejecuta la aplicación React:
    ```bash
    npm start
    ```
    Esto abrirá tu navegador en `http://localhost:3000` con la interfaz de usuario.

## Uso

Una vez que todos los componentes estén en funcionamiento:

1.  Abre tu navegador en `http://localhost:3000`.
2.  Escribe tus preguntas de programación en el campo de texto.
3.  Opcionalmente, pega fragmentos de código relevantes en el área de texto de código para proporcionar más contexto al agente.
4.  Haz clic en "Enviar a Agente" para obtener una respuesta.

¡Disfruta de tu asistente de programación local!