import axios from 'axios';

const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && envUrl.trim() !== '') {
    let url = envUrl.trim().replace(/\/+$/, '');
    if (!url.endsWith('/api')) {
      url = `${url}/api`;
    }
    return url;
  }
  return import.meta.env.DEV
    ? '/api'
    : 'https://studybuddy-api.peecharasathwik.workers.dev/api';
};

const API_BASE = getApiBaseUrl();

const api = axios.create({
  baseURL: API_BASE,
  timeout: 90000,
});

/**
 * Send a message to StudyBuddy AI
 * @param {string} mode - The mode: explain | exam | quiz | summary | code | chat
 * @param {string} message - The user's message
 * @param {Array} history - Prior conversation messages [{role, content}]
 */
export async function sendMessage(mode, message, history = []) {
  const response = await api.post('/chat', { mode, message, history });
  return response.data;
}

/**
 * Fetch the model/specialist config from the server
 */
export async function fetchConfig() {
  const response = await api.get('/config');
  return response.data;
}
