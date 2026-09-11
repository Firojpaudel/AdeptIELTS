# Free / Low-Cost AI Stack

## Goal

Maximize useful free capacity without compromising architecture.

## Frontend

GitHub Pages.

## Serverless API

Cloudflare Workers Free.

Use it as:
- AI proxy
- secret holder
- rate limiter
- lightweight API
- optional cache gateway

## AI

Primary candidate:
Groq free plan

Secondary:
Cloudflare Workers AI free allocation

Design the provider abstraction so other providers can be added later.

## Important

Free tiers change.

Never hard-code assumptions about:
- exact RPM
- exact RPD
- model availability
- free token quotas

Check provider documentation during deployment.

## Cost-saving hierarchy

1. deterministic code
2. local/browser logic
3. cached result
4. small/cheap model
5. larger model only when necessary

## Model routing examples

Simple explanation:
small/fast model

Question classification:
small model

Vocabulary generation:
small model

Writing evaluation:
stronger model

Speaking evaluation:
stronger model

Complex tutor interaction:
stronger model

## Fallback

If Provider A returns 429:
→ Provider B

If all AI providers fail:
→ deterministic fallback

Never make the entire application unusable because an AI provider is temporarily unavailable.
