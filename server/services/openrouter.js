const axios = require('axios');
const { MODELS, FALLBACK_MODEL, SPECIALISTS } = require('../config/models');
const { SYSTEM_PROMPTS } = require('../config/prompts');

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

/**
 * Load all configured API keys from environment variables.
 * Supports OPENROUTER_API_KEY (primary) plus up to 3 extras:
 *   OPENROUTER_API_KEY_2, OPENROUTER_API_KEY_3, OPENROUTER_API_KEY_4
 * Keys that are missing or still set to placeholder values are skipped.
 */
function loadApiKeys() {
  const raw = [
    process.env.OPENROUTER_API_KEY,
    process.env.OPENROUTER_API_KEY_2,
    process.env.OPENROUTER_API_KEY_3,
    process.env.OPENROUTER_API_KEY_4,
  ];

  const keys = raw.filter(
    (k) => k && k.trim() && !k.includes('your_') && !k.includes('_here')
  );

  if (keys.length === 0) {
    console.error('❌  No valid OpenRouter API keys found in .env!');
  } else {
    console.log(`🔑  Loaded ${keys.length} API key(s) for rotation.`);
  }

  return keys;
}

// Track which key index to try next (round-robin across requests)
let currentKeyIndex = 0;
let apiKeys = loadApiKeys();

/**
 * Get the next key in rotation order, cycling back to 0 when exhausted.
 * Returns { key, index } or null if no keys are available.
 */
function getNextKey(startIndex) {
  if (apiKeys.length === 0) return null;
  const index = startIndex % apiKeys.length;
  return { key: apiKeys[index], index };
}

/**
 * Build Authorization headers for a given API key.
 */
function buildHeaders(apiKey) {
  return {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
    'HTTP-Referer': 'https://studybuddy-ai.app',
    'X-Title': 'StudyBuddy AI',
  };
}

/**
 * Decide whether an error should trigger a key rotation attempt.
 * Rotate on: 401 Unauthorized, 429 Rate Limited, 402 Insufficient credits.
 */
function shouldRotateKey(error) {
  const status = error.response?.status;
  return status === 401 || status === 429 || status === 402;
}

/**
 * Attempt a single completion request with a specific key + model.
 */
async function attemptRequest(model, messages, apiKey) {
  const response = await axios.post(
    OPENROUTER_API_URL,
    { model, messages, temperature: 0.7, max_tokens: 2048 },
    { headers: buildHeaders(apiKey), timeout: 60000 }
  );
  const content = response.data?.choices?.[0]?.message?.content;
  if (!content) throw new Error('Empty response from AI model');
  return { content, model };
}

/**
 * Main entry point.
 * Tries each API key in rotation. If all keys fail for the primary model,
 * falls back to FALLBACK_MODEL and tries all keys again.
 */
async function sendChatRequest({ mode, message, history = [] }) {
  // Reload keys each request so hot-edits to .env are respected
  apiKeys = loadApiKeys();

  const primaryModel = MODELS[mode] || FALLBACK_MODEL;
  const systemPrompt  = SYSTEM_PROMPTS[mode] || SYSTEM_PROMPTS.chat;
  const specialist    = SPECIALISTS[mode]    || SPECIALISTS.chat;

  const messages = [
    { role: 'system', content: systemPrompt },
    ...history,
    { role: 'user',   content: message },
  ];

  if (apiKeys.length === 0) {
    throw new Error('No API keys configured. Please add OPENROUTER_API_KEY to server/.env');
  }

  // --- Try primary model with each key in rotation ---
  const startIndex = currentKeyIndex;
  let lastError;

  for (let i = 0; i < apiKeys.length; i++) {
    const keySlot = getNextKey(startIndex + i);
    if (!keySlot) break;

    try {
      console.log(
        `🔄  Trying key #${keySlot.index + 1} with model: ${primaryModel}`
      );
      const result = await attemptRequest(primaryModel, messages, keySlot.key);

      // Advance the global key index so the next request starts on the next key (round-robin)
      currentKeyIndex = (keySlot.index + 1) % apiKeys.length;

      return {
        success:     true,
        content:     result.content,
        model:       result.model,
        specialist:  specialist.name,
        mode,
        keyUsed:     keySlot.index + 1,
      };
    } catch (err) {
      lastError = err;
      const status = err.response?.status;
      console.warn(
        `⚠️   Key #${keySlot.index + 1} failed for model ${primaryModel} — ` +
        `HTTP ${status || err.message}`
      );

      if (!shouldRotateKey(err)) {
        // Non-auth/rate error (e.g. model unavailable) — break out and try fallback model
        break;
      }
      // Auth / rate-limit error — try next key
    }
  }

  // --- All keys failed for primary model; try FALLBACK_MODEL ---
  if (primaryModel !== FALLBACK_MODEL) {
    console.warn(`⚠️   All keys failed for ${primaryModel}. Trying fallback: ${FALLBACK_MODEL}`);

    for (let i = 0; i < apiKeys.length; i++) {
      const keySlot = getNextKey(currentKeyIndex + i);
      if (!keySlot) break;

      try {
        console.log(`🔄  Trying key #${keySlot.index + 1} with fallback model: ${FALLBACK_MODEL}`);
        const result = await attemptRequest(FALLBACK_MODEL, messages, keySlot.key);

        currentKeyIndex = (keySlot.index + 1) % apiKeys.length;

        return {
          success:      true,
          content:      result.content,
          model:        result.model,
          specialist:   specialist.name,
          mode,
          usedFallback: true,
          keyUsed:      keySlot.index + 1,
        };
      } catch (err) {
        lastError = err;
        console.warn(
          `⚠️   Key #${keySlot.index + 1} failed for fallback model — ` +
          `HTTP ${err.response?.status || err.message}`
        );
      }
    }
  }

  // Everything exhausted — throw the last error
  throw lastError || new Error('All API keys and models exhausted');
}

module.exports = { sendChatRequest };
