# agent/src/core/file_reader.py (Nuevo archivo)
import os

# Define un directorio base seguro al que el agente puede acceder
# ¡CAMBIA ESTO A UNA RUTA SEGURA EN TU SISTEMA!
SAFE_BASE_DIR = "/ruta/a/tu/directorio/de/proyectos/seguro"

def read_file_content(file_path: str) -> str:
    """
    Lee el contenido de un archivo de forma segura.
    """
    # Construye la ruta completa y normaliza para evitar path traversal
    abs_path = os.path.abspath(os.path.join(SAFE_BASE_DIR, file_path))

    # Asegúrate de que la ruta resuelta esté dentro del directorio seguro
    if not abs_path.startswith(os.path.abspath(SAFE_BASE_DIR)):
        raise ValueError("Acceso denegado: La ruta del archivo está fuera del directorio seguro.")

    if not os.path.exists(abs_path):
        raise FileNotFoundError(f"Archivo no encontrado: {file_path}")

    if not os.path.isfile(abs_path):
        raise ValueError(f"La ruta no es un archivo: {file_path}")

    try:
        with open(abs_path, 'r', encoding='utf-8') as f:
            content = f.read()
        return content
    except Exception as e:
        raise IOError(f"Error al leer el archivo {file_path}: {e}")

# En agent/src/main.py (modificado)
# ...
from .core.file_reader import read_file_content, SAFE_BASE_DIR # Importa la función y la ruta segura

class AgentRequest(BaseModel):
    prompt: str
    code: str = ""
    file_path: str = "" # Nuevo campo para la ruta del archivo

@app.post("/generate_code_suggestion")
async def generate_code_suggestion(request: AgentRequest):
    messages = [SYSTEM_MESSAGE]

    file_content = ""
    if request.file_path:
        try:
            file_content = read_file_content(request.file_path)
            messages.append({"role": "user", "content": f"Aquí está el contenido del archivo '{request.file_path}':\n```\n{file_content}\n```\n"})
        except (FileNotFoundError, ValueError, IOError) as e:
            messages.append({"role": "user", "content": f"No se pudo leer el archivo '{request.file_path}': {e}. Por favor, ignora esta solicitud de archivo si no es relevante."})
            print(f"Advertencia: {e}") # Log the warning

    if request.code:
        messages.append({"role": "user", "content": f"Aquí está mi código actual:\n```\n{request.code}\n```\n"})

    messages.append({"role": "user", "content": request.prompt})

    # ... (resto de la llamada al LLM como antes)