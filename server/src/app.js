const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const chatRoutes = require('../routes/chat');

const app = express();

// Middleware
app.use(cors()); // Habilita CORS para permitir solicitudes desde tu frontend de React
app.use(bodyParser.json()); // Para analizar el cuerpo de las solicitudes JSON

// Routes
app.use('/api', chatRoutes);

app.get('/api/models', async (req, res) => {
  try {
    const agentResponse = await fetch('http://localhost:8000/list_models');
    if (!agentResponse.ok) {
      const errorData = await agentResponse.json();
      throw new Error(errorData.detail || 'Error from agent service.');
    }
    const models = await agentResponse.json();
    res.json(models);
  } catch (error) {
    console.error('Error fetching models from agent:', error.name, error.message, error.stack);
    res.status(500).json({ error: error.message || 'Internal server error.' });
  }
});

app.post('/api/chat', async (req, res) => {
  const { prompt, code, folderContent, model_name } = req.body;

  try {
    const agentResponse = await fetch('http://localhost:8000/generate_code_suggestion', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt, code, folderContent, model_name }),
    });

    if (!agentResponse.ok) {
      const errorData = await agentResponse.json();
      throw new Error(errorData.detail || 'Error from agent service.');
    }

    const result = await agentResponse.json();
    res.json(result);

  } catch (error) {
    console.error('Error al comunicarse con el agente:', error);
    res.status(500).json({ error: error.message || 'Error interno del servidor.' });
  }
});

app.post('/api/upload-folder-content', async (req, res) => {
  const { folderContent } = req.body;

  if (!folderContent || !Array.isArray(folderContent)) {
    return res.status(400).json({ error: 'Invalid folder content provided.' });
  }

  try {
    // Forward to FastAPI agent
    const agentResponse = await fetch('http://localhost:8000/process-folder-content', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ folderContent }),
    });

    if (!agentResponse.ok) {
      const errorData = await agentResponse.json();
      throw new Error(errorData.detail || 'Error from agent service.');
    }

    const result = await agentResponse.json();
    res.json({ message: 'Folder content sent to agent successfully.', agentResult: result });

  } catch (error) {
    console.error('Error forwarding folder content to agent:', error.name, error.message, error.stack);
    res.status(500).json({ error: error.message || 'Internal server error.' });
  }
});

// Basic error handling (optional, but good practice)
app.get('/', (req, res) => {
  res.send('Server is running!');
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

module.exports = app;