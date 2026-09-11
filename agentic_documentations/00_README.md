# IELTS Adaptive Learning Platform — Modular Blueprint

This repository specification defines a fast, low-cost, AI-guided IELTS preparation platform.

Primary deployment target:
- Static frontend on GitHub Pages
- Lightweight serverless AI/API layer only where secrets or server-side processing are required
- Prefer Cloudflare Workers/Pages Functions for the first backend layer
- No traditional VPS, Kubernetes, microservices, or managed database requirement for MVP

Core loop:

DIAGNOSE → LEARN → PRACTISE → ASSESS → REMEDIATE → REPEAT

The product is an adaptive learning system, not a generic AI chatbot.

Read in this order:
1. PRODUCT.md
2. ARCHITECTURE.md
3. FRONTEND.md
4. AI.md
5. CONTENT.md
6. LEARNING_ENGINE.md
7. DATA.md
8. DESIGN.md
9. SECURITY.md
10. PERFORMANCE.md
11. ROADMAP.md
12. AGENT_RULES.md
