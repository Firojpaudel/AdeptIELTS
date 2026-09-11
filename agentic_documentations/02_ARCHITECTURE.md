# System Architecture

## MVP architecture

                ┌───────────────────────────┐
                │       GitHub Pages        │
                │   Static Web Application  │
                └─────────────┬─────────────┘
                              │ HTTPS
                              ▼
                ┌───────────────────────────┐
                │ Cloudflare Worker/API     │
                │ Secrets + AI proxy        │
                └───────┬─────────┬─────────┘
                        │         │
              ┌─────────▼───┐ ┌──▼────────────┐
              │ AI Provider  │ │ Lightweight   │
              │ Router       │ │ persistence   │
              └──────┬───────┘ └───────────────┘
                     │
          ┌──────────┼───────────┐
          ▼          ▼           ▼
       Groq       Cloudflare   Optional
       /free      Workers AI   provider
                     │
                     ▼
               AI responses

For early MVP, keep durable learner state primarily client-side where acceptable.
Do not introduce a database until real multi-device accounts or server-side persistence is needed.

## Why

GitHub Pages is excellent for static assets but cannot safely hold API secrets or act as the backend. The frontend should therefore remain static while a tiny serverless proxy handles AI credentials.

## Deployment

GitHub Actions:
source → install → build → static artifact → GitHub Pages

Backend:
Cloudflare Worker → deployed independently

## Future

When usage justifies it:

GitHub Pages
→ Worker
→ Supabase/Postgres
→ Redis/Upstash if needed
→ AI providers

Do not build these components before they solve a real problem.
