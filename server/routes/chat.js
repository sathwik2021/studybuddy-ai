import { Hono } from 'hono';
import { sendChatRequest } from '../services/openrouter.js';
import { getModels, SPECIALISTS } from '../config/models.js';

const chatApp = new Hono();

const VALID_MODES = ['explain', 'exam', 'quiz', 'summary', 'code', 'chat'];

// POST /chat (relative to router mount point)
chatApp.post('/chat', async (c) => {
  let body;
  try {
    body = await c.req.json();
  } catch (err) {
    return c.json({ error: 'Invalid JSON request body.' }, 400);
  }

  const { mode, message, history } = body;

  // Validate mode
  if (!mode || !VALID_MODES.includes(mode)) {
    return c.json(
      { error: 'Invalid mode. Must be one of: ' + VALID_MODES.join(', ') },
      400
    );
  }

  // Validate message
  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return c.json({ error: 'Message cannot be empty.' }, 400);
  }

  const env = c.env || {};
  if (!env.OPENROUTER_API_KEY) {
    return c.json(
      {
        error:
          'OpenRouter API key is not configured. Please add OPENROUTER_API_KEY to your environment variables or secrets.',
      },
      500
    );
  }

  try {
    const result = await sendChatRequest({
      mode,
      message: message.trim(),
      history: Array.isArray(history) ? history : [],
      env,
    });

    return c.json(result);
  } catch (error) {
    console.error('OpenRouter error:', error.errorData || error.message);

    const status = error.status || 500;
    const errData = error.errorData?.error;

    if (status === 401) {
      return c.json({ error: 'Invalid API key. Please check your OPENROUTER_API_KEY.' }, 401);
    }
    if (status === 429) {
      return c.json({ error: 'Rate limit exceeded. Please wait a moment and try again.' }, 429);
    }
    if (status === 402) {
      return c.json({ error: 'Insufficient credits on OpenRouter. Please check your account.' }, 402);
    }

    const message_err = errData?.message || error.message || 'An unexpected error occurred.';
    return c.json({ error: message_err }, status > 499 ? 500 : status);
  }
});

// GET /config — Return model config for the frontend to display
chatApp.get('/config', (c) => {
  const models = getModels(c.env || {});
  const config = {};
  for (const mode of VALID_MODES) {
    config[mode] = {
      model: models[mode],
      specialist: SPECIALISTS[mode],
    };
  }
  return c.json({ modes: config });
});

export default chatApp;
