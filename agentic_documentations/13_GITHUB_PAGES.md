# GitHub Pages Deployment

## Architecture

GitHub repository
→ GitHub Actions
→ build
→ Pages artifact
→ GitHub Pages

The application must be a static build.

## Backend separation

Do not put AI credentials into GitHub Pages.

Use:

Browser
→ Cloudflare Worker
→ AI provider

## Environment

Frontend:
PUBLIC_APP_URL only

Worker:
AI_PROVIDER_KEY
CORS_ORIGIN
RATE_LIMIT_CONFIG

## Deployment checklist

- GitHub Pages enabled
- GitHub Actions deployment configured
- custom domain configured if needed
- HTTPS verified
- Worker deployed
- CORS verified
- secrets stored server-side
- no API key in browser bundle

## GitHub Pages constraints

GitHub Pages is intended for static sites and has published-size, build-time, bandwidth and usage constraints. It should not be treated as the backend for a SaaS application.

Use it as the fast static frontend only.
