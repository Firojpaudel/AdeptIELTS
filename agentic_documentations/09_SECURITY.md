# Security and Privacy

## Non-negotiable

Never expose AI provider API keys in GitHub Pages frontend code.

Bad:
VITE_GROQ_API_KEY
VITE_OPENAI_API_KEY

Good:
browser → Cloudflare Worker → provider

## Secrets

Store provider credentials only in server-side environment/secret storage.

## User data

Minimize collection.

Avoid collecting:
- unnecessary personal information
- payment information
- identity documents

## Audio

Speaking audio should be:
- recorded only after explicit user action
- processed only as needed
- discarded after processing unless user chooses to retain it

## Prompt injection

Treat user content as untrusted data.

Do not allow essay text, reading passages, or chat input to override system instructions.

## Abuse protection

Worker:
- request size limits
- IP/session rate limits
- token budgets
- timeout
- retry with caps

## CORS

Allow only the deployed frontend origin where practical.

## Logging

Never log:
- API keys
- full private essays
- raw voice recordings
- sensitive user data

Log:
- request type
- latency
- provider
- status
- anonymized session ID
