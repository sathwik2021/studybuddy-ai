const express = require('express');
const router = express.Router();
const { sendChatRequest } = require('../services/openrouter');
const { MODELS, SPECIALISTS } = require('../config/models');

const VALID_MODES = ['explain', 'exam', 'quiz', 'summary', 'code', 'chat'];

// POST /api/chat
router.post('/chat', async (req, res) => {
  const { mode, message, history } = req.body;

  // Validate
  if (!mode || !VALID_MODES.includes(mode)) {
    return res.status(400).json({
      error: 'Invalid mode. Must be one of: ' + VALID_MODES.join(', '),
    });
  }

  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return res.status(400).json({ error: 'Message cannot be empty.' });
  }

  if (!process.env.OPENROUTER_API_KEY) {
    return res.status(500).json({
      error: 'OpenRouter API key is not configured. Please add OPENROUTER_API_KEY to your .env file.',
    });
  }

  try {
    const result = await sendChatRequest({
      mode,
      message: message.trim(),
      history: Array.isArray(history) ? history : [],
    });

    return res.json(result);
  } catch (error) {
    console.error('OpenRouter error:', error.response?.data || error.message);

    const status = error.response?.status || 500;
    const errData = error.response?.data?.error;

    if (status === 401) {
      return res.status(401).json({ error: 'Invalid API key. Please check your OPENROUTER_API_KEY.' });
    }
    if (status === 429) {
      return res.status(429).json({ error: 'Rate limit exceeded. Please wait a moment and try again.' });
    }
    if (status === 402) {
      return res.status(402).json({ error: 'Insufficient credits on OpenRouter. Please check your account.' });
    }

    const message_err = errData?.message || error.message || 'An unexpected error occurred.';
    return res.status(status > 499 ? 500 : status).json({ error: message_err });
  }
});

// GET /api/config — Return model config for the frontend to display
router.get('/config', (req, res) => {
  const config = {};
  for (const mode of VALID_MODES) {
    config[mode] = {
      model: MODELS[mode],
      specialist: SPECIALISTS[mode],
    };
  }
  res.json({ modes: config });
});

module.exports = router;
