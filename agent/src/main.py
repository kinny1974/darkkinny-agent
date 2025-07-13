from fastapi import FastAPI, Request
from pydantic import BaseModel
import openai
import uvicorn
import os
import httpx

app = FastAPI()

# --- Configuration for LM Studio or Ollama ---
# Get API base URL from environment variable, default to Ollama
OPENAI_API_BASE = os.getenv("OPENAI_API_BASE", "http://localhost:11434/v1")
# Get model name from environment variable, default to a common Ollama model
MODEL_NAME = os.getenv("MODEL_NAME", "codellama") # Or "mixtral", "llama2", etc.
# API Key is often not needed for local LLMs, but included for compatibility
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "ollama") # Or "lm-studio"

client = openai.OpenAI(base_url=OPENAI_API_BASE, api_key=OPENAI_API_KEY)

# Define the agent's role (system message)
SYSTEM_MESSAGE = {
    "role": "system",
    "content": "Eres un asistente de programación experto en Node.js, React.js, FastAPI y Python. Tienes acceso a los archivos de la carpeta seleccionada por el usuario. Puedes analizar, limpiar, refactorizar o realizar otras operaciones sobre estos archivos. Proporciona soluciones de código concisas, explicaciones claras y ejemplos prácticos. Siempre responde con el lenguaje de programación relevante a la pregunta. Si se proporciona código, analiza el código y proporciona sugerencias o soluciones basadas en él. Cuando proporciones código, asegúrate de envolverlo en bloques de código Markdown con el lenguaje especificado (por ejemplo, ```python\nprint(\"Hola\")\n```)."
}

class FileContent(BaseModel):
    path: str
    content: str

class AgentRequest(BaseModel):
    prompt: str
    code: str = ""
    folderContent: list[FileContent] = []
    model_name: str | None = None

class FolderContentRequest(BaseModel):
    folderContent: list[FileContent]


@app.post("/process-folder-content")
async def process_folder_content(request: FolderContentRequest):
    print("Received folder content:")
    for file in request.folderContent:
        print(f"Path: {file.path}\nContent:\n{file.content[:200]}...\n") # Print first 200 chars
    return {"message": "Folder content received and processed by agent."}

@app.get("/list_models")
async def list_models():
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{OPENAI_API_BASE.replace('/v1', '')}/api/tags")
            response.raise_for_status()
            models_data = response.json()
            # Ollama returns models under a 'models' key, each with a 'name'
            model_names = [model["name"] for model in models_data.get("models", [])]
            return {"models": model_names}
    except httpx.RequestError as e:
        print(f"Error connecting to Ollama: {e}")
        return {"error": f"Could not connect to Ollama at {OPENAI_API_BASE.replace('/v1', '')}. Please ensure Ollama is running.", "detail": str(e)}, 500
    except Exception as e:
        print(f"Error listing models: {e}")
        return {"error": "An unexpected error occurred while listing models.", "detail": str(e)}, 500

@app.post("/generate_code_suggestion")
async def generate_code_suggestion(request: AgentRequest):

    messages = [SYSTEM_MESSAGE]
    
    # Determine which model to use
    current_model = request.model_name if request.model_name else MODEL_NAME
    
    # Add code snippet to context if provided
    if request.code:
        messages.append({"role": "user", "content": f"Aquí está mi código actual:\n```\n{request.code}\n```\n"})
    
    # Add folder content to context if provided
    if request.folderContent:
        folder_content_str = ""
        for file_data in request.folderContent:
            folder_content_str += f"File: {file_data.path}\n```\n{file_data.content}\n```\n\n"
        messages.append({"role": "user", "content": f"Aquí están los archivos de la carpeta seleccionada:\n{folder_content_str}"})
    
    # Add user's prompt to context
    messages.append({"role": "user", "content": request.prompt})

    try:
        completion = client.chat.completions.create(
            model=current_model,
            messages=messages,
            temperature=0.7, # Adjust creativity
            max_tokens=1000, # Limit response length
            stream=False
        )
        response_content = completion.choices[0].message.content
        return {"role": "assistant", "content": response_content}
    except Exception as e:
        print(f"Error calling LLM: {e}")
        return {"role": "system", "content": f"Error del LLM: {e}"}, 500

if __name__ == "__main__":
    # Ensure LM Studio or Ollama server is running before starting this
    print(f"Starting FastAPI agent with LLM model: {MODEL_NAME} from {OPENAI_API_BASE}")
    uvicorn.run(app, host="0.0.0.0", port=8000)