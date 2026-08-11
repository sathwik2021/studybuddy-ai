# 🚀 Deploying StudyBuddy AI on Cloudflare Workers & Pages

This project has been converted from an Express backend to a **Cloudflare Worker** API backend, making it natively ready for deployment on **Cloudflare Workers** (backend) and **Cloudflare Pages** (frontend).

---

## 🛠️ Architecture Overview

- **Backend**: `server/` (Cloudflare Worker using Hono framework)
- **Frontend**: `client/` (React + Vite single-page application)

---

## 💻 Local Development

### 1. Start the Worker Backend (Port 3001)
```bash
cd server
npm run dev
```
This runs `wrangler dev --port 3001` which loads local environment secrets from `server/.dev.vars`.

### 2. Start the Frontend Client (Port 5173)
```bash
cd client
npm run dev
```
Vite will proxy `/api/*` requests automatically to `http://localhost:3001`.

---

## ☁️ Deployment Instructions

### Part 1: Deploy Backend to Cloudflare Workers

1. **Log in to Cloudflare CLI**:
   ```bash
   cd server
   npx wrangler login
   ```

2. **Set your OpenRouter API Key secrets in Cloudflare**:
   ```bash
   npx wrangler secret put OPENROUTER_API_KEY
   # Enter your key when prompted
   
   # Optional: set backup keys for automatic rotation
   npx wrangler secret put OPENROUTER_API_KEY_2
   npx wrangler secret put OPENROUTER_API_KEY_3
   npx wrangler secret put OPENROUTER_API_KEY_4
   ```

3. **Deploy the Worker**:
   ```bash
   npm run deploy
   ```
   *Output will provide your deployed backend URL, e.g.: `https://studybuddy-api.<your-subdomain>.workers.dev`*

---

### Part 2: Deploy Frontend to Cloudflare Pages

#### Option A: Via Direct Wrangler CLI
1. Build the Vite frontend:
   ```bash
   cd client
   npm run build
   ```
2. Deploy to Cloudflare Pages:
   ```bash
   npx wrangler pages deploy dist --project-name=studybuddy-ai
   ```

#### Option B: Via Cloudflare Dashboard (GitHub Integration)
1. Push your repository to GitHub.
2. Go to **Cloudflare Dashboard** → **Workers & Pages** → **Create application** → **Pages** → **Connect to Git**.
3. Select your repository.
4. Set Build Settings:
   - **Framework preset**: Vite
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Root directory**: `client`
5. Add Environment Variable:
   - `VITE_API_URL`: `https://studybuddy-api.<your-subdomain>.workers.dev/api`

---

## 🔑 Environment Variables Reference

| Variable Name | Purpose | Location |
|---|---|---|
| `OPENROUTER_API_KEY` | Primary OpenRouter API Key | Worker Secrets (`wrangler secret put`) / `.dev.vars` |
| `OPENROUTER_API_KEY_2`..`4` | Backup OpenRouter API Keys for rotation | Worker Secrets (`wrangler secret put`) / `.dev.vars` |
| `CLIENT_URL` | Allowed CORS Origin | `wrangler.toml` / Worker environment vars |
| `VITE_API_URL` | Deployed Worker API base URL | Pages Environment Variables |
