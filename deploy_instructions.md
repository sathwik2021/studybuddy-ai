# 📖 Cloudflare Production Deployment Guide — StudyBuddy AI

Complete step-by-step instructions for deploying StudyBuddy AI using Cloudflare's global edge network.

---

## 🏗️ Deployment Architecture Overview

- **Frontend App**: React 19 + Vite deployed to **Cloudflare Pages**
- **Backend API**: Hono Worker API deployed to **Cloudflare Workers**

---

## 🛠️ Step 1: Deploy Backend to Cloudflare Workers

1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Log in to your Cloudflare account via CLI:
   ```bash
   npx wrangler login
   ```

3. Set your primary OpenRouter API Key as a Cloudflare Worker secret:
   ```bash
   npx wrangler secret put OPENROUTER_API_KEY
   ```
   *Prompt will ask you to enter your API key: paste your key and press Enter.*

4. *(Optional)* Set additional OpenRouter keys for automatic round-robin rotation and fallback resilience:
   ```bash
   npx wrangler secret put OPENROUTER_API_KEY_2
   npx wrangler secret put OPENROUTER_API_KEY_3
   npx wrangler secret put OPENROUTER_API_KEY_4
   ```

5. Deploy the Worker:
   ```bash
   npm run deploy
   ```

6. Note your deployed Worker production URL format:
   ```text
   https://studybuddy-api.<your-cloudflare-subdomain>.workers.dev
   ```

---

## 🌐 Step 2: Deploy Frontend to Cloudflare Pages

### Option A: Deployment via Cloudflare Dashboard (Recommended)

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/) → **Workers & Pages**.
2. Click **Create Application** → **Pages** → **Connect to Git**.
3. Select the `sathwik2021/studybuddy-ai` repository.
4. Configure Build Settings:
   - **Framework preset**: `Vite`
   - **Root directory**: `client`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
5. Environment Variables:
   - Add variable `VITE_API_URL` = `https://studybuddy-api.<your-cloudflare-subdomain>.workers.dev/api`
6. Click **Save and Deploy**.

### Option B: Deployment via Wrangler CLI

1. Build the production bundle:
   ```bash
   cd client
   npm run build
   ```

2. Deploy directly using Wrangler Pages:
   ```bash
   npx wrangler pages deploy dist --project-name=studybuddy-ai
   ```

---

## 🔒 Exact Worker Settings & Variables Reference

| Key / Variable | Type | Production Setting / Command | Purpose |
|---|---|---|---|
| `OPENROUTER_API_KEY` | Worker Secret | `npx wrangler secret put OPENROUTER_API_KEY` | Primary OpenRouter API Authentication |
| `OPENROUTER_API_KEY_2..4` | Worker Secret | `npx wrangler secret put OPENROUTER_API_KEY_2` | Backup API Keys for key rotation |
| `CLIENT_URL` | Worker Variable | Configured in `wrangler.toml` (`CLIENT_URL = "*"`) | Allowed CORS Origin |
| `VITE_API_URL` | Pages Env Var | `https://studybuddy-api.<subdomain>.workers.dev/api` | API Base URL used by Frontend |

---

## 📋 Remaining Manual Steps in Cloudflare Dashboard

1. **Set Production CORS (Optional Restriction)**:
   - By default `wrangler.toml` sets `CLIENT_URL = "*"` to allow any frontend domain.
   - To restrict to your exact Pages domain, go to **Workers & Pages** → **studybuddy-api** → **Settings** → **Variables** → edit `CLIENT_URL` to `https://studybuddy-ai.pages.dev`.

2. **Verify Secrets**:
   - Go to **Workers & Pages** → **studybuddy-api** → **Settings** → **Variables and Secrets**.
   - Verify `OPENROUTER_API_KEY` is listed under **Secret Environment Variables**.
