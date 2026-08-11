# 🎓 StudyBuddy AI

> **Your AI-powered study companion** — A multi-model AI assistant designed specifically for university students, built on **Cloudflare Workers**, **Hono**, and **React + Vite**.

![StudyBuddy AI](https://img.shields.io/badge/StudyBuddy-AI-6366f1?style=for-the-badge)
![Cloudflare Workers](https://img.shields.io/badge/Backend-Cloudflare%20Workers-f38020?style=for-the-badge)
![Hono](https://img.shields.io/badge/Framework-Hono-e36002?style=for-the-badge)
![Multi-Model](https://img.shields.io/badge/Multi--Model-AI-8b5cf6?style=for-the-badge)
![OpenRouter](https://img.shields.io/badge/Powered%20by-OpenRouter-ec4899?style=for-the-badge)

---

## ✨ What is StudyBuddy AI?

StudyBuddy AI is a specialized AI assistant for university students. Unlike generic chatbots, it routes each task to a **dedicated AI specialist** — powered by specialized free AI models via OpenRouter — tailored for specific academic workflows.

---

## 🚀 Specialist Modes

| Mode | Description |
|------|-------------|
| 📚 **Explain Topic** | Understand any concept in simple, student-friendly language with examples |
| 📝 **Exam Answer** | Generate structured 2/5/10-mark university exam answers |
| 🧠 **Quiz Generator** | Auto-generate MCQ quizzes with answers and explanations |
| 📄 **Summarize Notes** | Convert long notes into concise summaries with key takeaways |
| 💻 **Code Assistant** | Debug, explain, and improve code across 8+ languages |
| 💬 **General Chat** | General-purpose AI assistant for any academic question |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19 + Vite |
| **Frontend Host** | Cloudflare Pages |
| **Styling** | Vanilla CSS (dark glassmorphism design system) |
| **Markdown** | `react-markdown` + `remark-gfm` + `react-syntax-highlighter` |
| **Backend** | Cloudflare Workers (Edge V8 Isolate runtime) |
| **Backend Framework** | Hono (`hono`) |
| **AI Integration** | OpenRouter Chat Completions API with native `fetch()` & Key Rotation |

---

## 🧠 Multi-Model AI Architecture

Each StudyBuddy mode is dynamically routed to a specialized AI model on OpenRouter:

| Mode | Active Model | Role |
|------|--------------|------|
| 📚 **Explain Topic** | `google/gemma-4-31b-it:free` | Clear concept breakdown & analogies |
| 📝 **Exam Answer** | `nvidia/nemotron-3-super-120b-a12b:free` | Structured academic answers |
| 🧠 **Quiz Generator** | `google/gemma-4-26b-a4b-it:free` | Accurate MCQ generation |
| 📄 **Summarize Notes** | `nvidia/nemotron-nano-12b-v2-vl:free` | Concise notes & key takeaways |
| 💻 **Code Assistant** | `nvidia/nemotron-3-super-120b-a12b:free` | Programming & debugging specialist |
| 💬 **General Chat** | `openrouter/free` | General academic chat |

> **Fallback & Key Rotation**: If a model or key hits a rate limit or standard error, the backend automatically rotates through backup OpenRouter API keys (`OPENROUTER_API_KEY_2`..`4`) and falls back to `openrouter/free`.

---

## 🔑 Getting an OpenRouter API Key

1. Visit [https://openrouter.ai](https://openrouter.ai)
2. Sign up for a free account.
3. Go to **Settings → API Keys**.
4. Click **Create Key** and copy your key.

---

## 💻 Local Development Setup

### 1. Configure Local Backend Secrets

Create `server/.dev.vars` (this file is git-ignored):

```env
OPENROUTER_API_KEY=sk-or-v1-your-primary-key-here
# Optional backup keys for rotation:
OPENROUTER_API_KEY_2=sk-or-v1-your-second-key-here
CLIENT_URL=http://localhost:5173
```

### 2. Install Dependencies

```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

### 3. Run Development Servers

Run the backend Cloudflare Worker (Port 3001):
```bash
cd server
npm run dev
```

In a second terminal, run the frontend Vite dev server (Port 5173):
```bash
cd client
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## ☁️ Deployment Instructions

### 1. Backend Deployment (Cloudflare Workers)

1. Authenticate with Wrangler:
   ```bash
   cd server
   npx wrangler login
   ```

2. Store your OpenRouter API Key securely as a Worker Secret:
   ```bash
   npx wrangler secret put OPENROUTER_API_KEY
   ```
   *(Optionally set `OPENROUTER_API_KEY_2`, `OPENROUTER_API_KEY_3`, `OPENROUTER_API_KEY_4`)*

3. Deploy the Worker:
   ```bash
   npm run deploy
   ```
   *Your production backend API URL will be: `https://studybuddy-api.<your-subdomain>.workers.dev`*

---

### 2. Frontend Deployment (Cloudflare Pages)

#### Direct CLI Deployment:
```bash
cd client
npm run build
npx wrangler pages deploy dist --project-name=studybuddy-ai
```

#### GitHub Dashboard Deployment:
1. Connect repository to Cloudflare Dashboard (**Workers & Pages → Create Pages**).
2. Set **Root directory**: `client`
3. Set **Build command**: `npm run build`
4. Set **Build output directory**: `dist`
5. Add Environment Variable:
   - `VITE_API_URL`: `https://studybuddy-api.<your-subdomain>.workers.dev/api`

---

## 🔒 Security

- The OpenRouter API key lives **strictly on the server** as a Cloudflare Worker secret (`c.env.OPENROUTER_API_KEY`).
- Secrets are **never** exposed to client browsers or committed to GitHub (`.env` and `.dev.vars` are ignored in `.gitignore`).
- All requests pass securely through the Worker edge backend.

---

*Built with ❤️ for students, by StudyBuddy AI*
