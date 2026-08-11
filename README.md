# 🎓 StudyBuddy AI

> **Your AI-powered study companion** — A multi-model AI assistant designed specifically for university students.

![StudyBuddy AI](https://img.shields.io/badge/StudyBuddy-AI-6366f1?style=for-the-badge)
![Multi-Model](https://img.shields.io/badge/Multi--Model-AI-8b5cf6?style=for-the-badge)
![OpenRouter](https://img.shields.io/badge/Powered%20by-OpenRouter-ec4899?style=for-the-badge)

---

## ✨ What is StudyBuddy AI?

StudyBuddy AI is a specialized AI assistant for university students. Unlike a generic chatbot, it routes each task to a **dedicated AI specialist** — each powered by a different free AI model via OpenRouter — optimized for that specific academic task.

---

## 🚀 Features

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
| Frontend | React + Vite |
| Styling | Vanilla CSS (dark glassmorphism) |
| Markdown | react-markdown + remark-gfm |
| Syntax Highlight | react-syntax-highlighter (Prism) |
| Backend | Node.js + Express |
| AI API | OpenRouter (free models) |
| HTTP | axios |

---

## 🧠 Multi-Model AI Architecture

Each StudyBuddy mode is routed to a **different specialized free AI model** via OpenRouter:

| Mode | Model | Why |
|------|-------|-----|
| 📚 Explain Topic | `meta-llama/llama-3.2-3b-instruct:free` | Good at clear explanations |
| 📝 Exam Answer | `meta-llama/llama-3.1-8b-instruct:free` | Strong structured writing |
| 🧠 Quiz Generator | `mistralai/mistral-7b-instruct:free` | Great at instruction following |
| 📄 Summarize Notes | `google/gemma-3-1b-it:free` | Efficient at summarization |
| 💻 Code Assistant | `qwen/qwen2.5-coder-7b-instruct:free` | Specialized code model |
| 💬 General Chat | `meta-llama/llama-3.2-1b-instruct:free` | Fast general-purpose |

> **Fallback**: If a model is unavailable, the server automatically retries with `meta-llama/llama-3.2-1b-instruct:free`.

You can override any model in `server/.env`:

```env
EXPLAIN_MODEL=your-preferred-model
EXAM_MODEL=your-preferred-model
```

---

## 🔑 Getting an OpenRouter API Key

1. Visit [https://openrouter.ai](https://openrouter.ai)
2. Sign up for a free account
3. Go to **Settings → API Keys**
4. Click **Create Key** and copy it
5. Free-tier models (`:free` suffix) are available at no cost

---

## ⚙️ Configuration

### 1. Create `server/.env`

Copy the example file:

```bash
cp .env.example server/.env
```

Then edit `server/.env`:

```env
OPENROUTER_API_KEY=sk-or-v1-your-actual-key-here
PORT=3001
CLIENT_URL=http://localhost:5173
```

---

## 📦 Installation

### Install all dependencies

```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

---

## ▶️ Running the Application

You need **two terminals** running simultaneously:

### Terminal 1 — Backend Server

```bash
cd server
node index.js
```

You should see:
```
🎓 StudyBuddy AI Server running on http://localhost:3001
📡 OpenRouter API key: ✅ Configured
```

### Terminal 2 — Frontend Dev Server

```bash
cd client
npm run dev
```

Then open **http://localhost:5173** in your browser.

---

## 💡 Free Model Usage Notes

- All configured models have a `:free` suffix — they are **completely free** on OpenRouter.
- Free models may have **rate limits** (typically 20 requests/minute).
- Free models may occasionally be **unavailable** — the app will automatically fall back to a working model.
- For best results, keep messages concise and focused.

---

## 📁 Project Structure

```
studybuddy-ai/
├── client/                    # React + Vite frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Sidebar.jsx    # Mode navigation sidebar
│   │   │   ├── Header.jsx     # Chat header with specialist info
│   │   │   ├── ChatArea.jsx   # Message display with markdown
│   │   │   ├── InputArea.jsx  # Message input
│   │   │   └── EmptyState.jsx # Welcome screen with examples
│   │   ├── config/
│   │   │   └── modes.js       # Mode definitions + example prompts
│   │   ├── services/
│   │   │   └── api.js         # API communication layer
│   │   ├── App.jsx            # Main app component
│   │   └── App.css            # Complete styling
│   ├── index.html
│   └── vite.config.js         # Vite + API proxy config
│
├── server/                    # Node.js + Express backend
│   ├── config/
│   │   ├── models.js          # Centralized model routing config
│   │   └── prompts.js         # System prompts for each mode
│   ├── routes/
│   │   └── chat.js            # POST /api/chat endpoint
│   ├── services/
│   │   └── openrouter.js      # OpenRouter API integration
│   ├── index.js               # Express server entry point
│   └── .env                   # Your API key (not in git!)
│
├── .env.example               # Template for environment variables
├── .gitignore                 # Keeps secrets out of git
└── README.md                  # This file
```

---

## 🔒 Security

- The OpenRouter API key is **never** sent to the frontend.
- The key lives in `server/.env` which is excluded from git via `.gitignore`.
- All AI requests are proxied through the Express backend.

---

*Built with ❤️ for students, by StudyBuddy AI*
