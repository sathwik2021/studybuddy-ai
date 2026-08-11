import { getModels, getFallbackModel, SPECIALISTS } from '../config/models.js';
import { SYSTEM_PROMPTS } from '../config/prompts.js';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

/**
 * Load all configured API keys from env bindings.
 * Supports OPENROUTER_API_KEY (primary) plus up to 3 extras:
 *   OPENROUTER_API_KEY_2, OPENROUTER_API_KEY_3, OPENROUTER_API_KEY_4
 */
function loadApiKeys(env = {}) {
  const raw = [
    env.OPENROUTER_API_KEY,
    env.OPENROUTER_API_KEY_2,
    env.OPENROUTER_API_KEY_3,
    env.OPENROUTER_API_KEY_4,
  ];

  const keys = raw.filter(
    (k) => k && typeof k === 'string' && k.trim() && !k.includes('your_') && !k.includes('_here')
  );

  if (keys.length === 0) {
    console.error('❌ No valid OpenRouter API keys found in env bindings!');
  } else {
    console.log(`🔑 Loaded ${keys.length} API key(s) for rotation.`);
  }

  return keys;
}

// Track which key index to try next (round-robin across requests)
let currentKeyIndex = 0;

/**
 * Get the next key in rotation order, cycling back to 0 when exhausted.
 */
function getNextKey(apiKeys, startIndex) {
  if (!apiKeys || apiKeys.length === 0) return null;
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
 * Decide whether an error status should trigger a key rotation attempt.
 * Rotate on: 401 Unauthorized, 429 Rate Limited, 402 Insufficient credits.
 */
function shouldRotateKey(status) {
  return status === 401 || status === 429 || status === 402;
}

/**
 * Attempt a single completion request with a specific key + model using native fetch.
 */
async function attemptRequest(model, messages, apiKey) {
  const response = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers: buildHeaders(apiKey),
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.7,
      max_tokens: 2048,
    }),
  });

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch (e) {
      errorData = null;
    }
    const errMessage = errorData?.error?.message || `HTTP ${response.status}: ${response.statusText}`;
    const err = new Error(errMessage);
    err.status = response.status;
    err.errorData = errorData;
    throw err;
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) throw new Error('Empty response from AI model');
  return { content, model };
}

/**
 * Main entry point for chat requests.
 */
export async function sendChatRequest({ mode, message, history = [], env = {} }) {
  const apiKeys = loadApiKeys(env);
  const models = getModels(env);
  const fallbackModel = getFallbackModel(env);

  const primaryModel = models[mode] || fallbackModel;
  const systemPrompt  = SYSTEM_PROMPTS[mode] || SYSTEM_PROMPTS.chat;
  const specialist    = SPECIALISTS[mode]    || SPECIALISTS.chat;

  const messages = [
    { role: 'system', content: systemPrompt },
    ...history,
    { role: 'user',   content: message },
  ];

  if (apiKeys.length === 0) {
    throw new Error('No OpenRouter API keys configured. Please add OPENROUTER_API_KEY to your environment bindings.');
  }

  // --- Try primary model with each key in rotation ---
  const startIndex = currentKeyIndex;
  let lastError;

  for (let i = 0; i < apiKeys.length; i++) {
    const keySlot = getNextKey(apiKeys, startIndex + i);
    if (!keySlot) break;

    try {
      console.log(`🔄 Trying key #${keySlot.index + 1} with model: ${primaryModel}`);
      const result = await attemptRequest(primaryModel, messages, keySlot.key);

      // Advance the global key index for next request
      currentKeyIndex = (keySlot.index + 1) % apiKeys.length;

      return {
        success:    true,
        content:    result.content,
        model:      result.model,
        specialist: specialist.name,
        mode,
        keyUsed:    keySlot.index + 1,
      };
    } catch (err) {
      lastError = err;
      const status = err.status;
      console.warn(
        `⚠️ Key #${keySlot.index + 1} failed for model ${primaryModel} — ` +
        `HTTP ${status || err.message}`
      );

      if (!shouldRotateKey(status)) {
        // Non-auth/rate error (e.g. model unavailable) — try fallback model
        break;
      }
      // Auth / rate-limit error — try next key
    }
  }

  // --- All keys failed for primary model; try FALLBACK_MODEL ---
  if (primaryModel !== fallbackModel) {
    console.warn(`⚠️ All keys failed for ${primaryModel}. Trying fallback: ${fallbackModel}`);

    for (let i = 0; i < apiKeys.length; i++) {
      const keySlot = getNextKey(apiKeys, currentKeyIndex + i);
      if (!keySlot) break;

      try {
        console.log(`🔄 Trying key #${keySlot.index + 1} with fallback model: ${fallbackModel}`);
        const result = await attemptRequest(fallbackModel, messages, keySlot.key);

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
          `⚠️ Key #${keySlot.index + 1} failed for fallback model — ` +
          `HTTP ${err.status || err.message}`
        );
      }
    }
  }

  // Everything exhausted — throw the last error
  throw lastError || new Error('All API keys and models exhausted');
}
