// Centralized model configuration for StudyBuddy AI
// Each mode uses a different free OpenRouter model

const MODELS = {
  explain: process.env.EXPLAIN_MODEL || 'google/gemma-4-31b-it:free',
  exam:    process.env.EXAM_MODEL    || 'nvidia/nemotron-3-super-120b-a12b:free',
  quiz:    process.env.QUIZ_MODEL    || 'google/gemma-4-26b-a4b-it:free',
  summary: process.env.SUMMARY_MODEL || 'nvidia/nemotron-nano-12b-v2-vl:free',
  code:    process.env.CODE_MODEL    || 'nvidia/nemotron-3-super-120b-a12b:free',
  chat:    process.env.CHAT_MODEL    || 'openrouter/free',
};

// Fallback model if a specific model is unavailable
const FALLBACK_MODEL = process.env.FALLBACK_MODEL || 'openrouter/free';

// Human-readable specialist names for each mode
const SPECIALISTS = {
  explain: { name: '📚 Concept Specialist', icon: '📚' },
  exam:    { name: '📝 Exam Specialist',    icon: '📝' },
  quiz:    { name: '🧠 Quiz Specialist',    icon: '🧠' },
  summary: { name: '📄 Notes Specialist',   icon: '📄' },
  code:    { name: '💻 Code Specialist',    icon: '💻' },
  chat:    { name: '💬 Chat Assistant',     icon: '💬' },
};

module.exports = { MODELS, FALLBACK_MODEL, SPECIALISTS };
