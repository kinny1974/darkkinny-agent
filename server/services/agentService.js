const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args)); // Usaremos node-fetch para hacer la solicitud HTTP al agente FastAPI

// URL de tu agente de Python (FastAPI)
const PYTHON_AGENT_URL = process.env.PYTHON_AGENT_URL || 'http://localhost:8000';

async function getAgentResponse(prompt, code) {
  try {
    const response = await fetch(`${PYTHON_AGENT_URL}/generate_code_suggestion`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt, code }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Error del agente de Python: ${errorData.content || response.statusText}`);
    }

    const data = await response.json();
    return data; // Debería tener { role: 'assistant', content: '...' }
  } catch (error) {
    console.error('Error al llamar al agente de Python:', error);
    throw error;
  }
}

module.exports = {
  getAgentResponse,
};