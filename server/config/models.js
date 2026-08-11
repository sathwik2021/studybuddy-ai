// Centralized model configuration for StudyBuddy AI
// Each mode uses a different free OpenRouter model

export const DEFAULT_MODELS = {
  explain: 'google/gemma-4-31b-it:free',
  exam:    'nvidia/nemotron-3-super-120b-a12b:free',
  quiz:    'google/gemma-4-26b-a4b-it:free',
  summary: 'nvidia/nemotron-nano-12b-v2-vl:free',
  code:    'nvidia/nemotron-3-super-120b-a12b:free',
  chat:    'openrouter/free',
};

export const DEFAULT_FALLBACK_MODEL = 'openrouter/free';

export function getModels(env = {}) {
  return {
    explain: env.EXPLAIN_MODEL || DEFAULT_MODELS.explain,
    exam:    env.EXAM_MODEL    || DEFAULT_MODELS.exam,
    quiz:    env.QUIZ_MODEL    || DEFAULT_MODELS.quiz,
    summary: env.SUMMARY_MODEL || DEFAULT_MODELS.summary,
    code:    env.CODE_MODEL    || DEFAULT_MODELS.code,
    chat:    env.CHAT_MODEL    || DEFAULT_MODELS.chat,
  };
}

export function getFallbackModel(env = {}) {
  return env.FALLBACK_MODEL || DEFAULT_FALLBACK_MODEL;
}

// Human-readable specialist names for each mode
export const SPECIALISTS = {
  explain: { name: '📚 Concept Specialist', icon: '📚' },
  exam:    { name: '📝 Exam Specialist',    icon: '📝' },
  quiz:    { name: '🧠 Quiz Specialist',    icon: '🧠' },
  summary: { name: '📄 Notes Specialist',   icon: '📄' },
  code:    { name: '💻 Code Specialist',    icon: '💻' },
  chat:    { name: '💬 Chat Assistant',     icon: '💬' },
};

