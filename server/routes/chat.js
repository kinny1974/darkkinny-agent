const express = require('express');
const router = express.Router();
const agentService = require('../services/agentService');

router.post('/chat', async (req, res) => {
  const { prompt, code } = req.body;

  if (!prompt && !code) {
    return res.status(400).json({ error: 'Prompt o código son requeridos.' });
  }

  try {
    const agentResponse = await agentService.getAgentResponse(prompt, code);
    res.json(agentResponse);
  } catch (error) {
    console.error('Error en el endpoint /api/chat:', error);
    res.status(500).json({ error: error.message || 'Error al comunicarse con el agente de Python.' });
  }
});

module.exports = router;