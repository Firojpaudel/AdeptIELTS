# Suggested Repository Structure

ielts-platform/
├── docs/
│   ├── PRODUCT.md
│   ├── ARCHITECTURE.md
│   ├── FRONTEND.md
│   ├── AI.md
│   ├── CONTENT.md
│   ├── LEARNING_ENGINE.md
│   ├── DATA.md
│   ├── DESIGN.md
│   ├── SECURITY.md
│   ├── PERFORMANCE.md
│   ├── ROADMAP.md
│   ├── FREE_AI_STACK.md
│   ├── GITHUB_PAGES.md
│   └── AGENT_RULES.md
│
├── src/
│   ├── components/
│   ├── features/
│   │   ├── dashboard/
│   │   ├── diagnostic/
│   │   ├── learn/
│   │   ├── practice/
│   │   ├── writing/
│   │   ├── speaking/
│   │   ├── mock/
│   │   └── progress/
│   ├── lib/
│   ├── data/
│   ├── routes/
│   └── styles/
│
├── worker/
│   ├── src/
│   │   ├── index.ts
│   │   ├── providers/
│   │   ├── prompts/
│   │   ├── cache/
│   │   └── rate-limit/
│   └── wrangler.toml
│
├── public/
├── .github/
│   └── workflows/
│       └── deploy.yml
│
├── package.json
├── vite.config.ts
├── tsconfig.json
└── README.md

Keep frontend and Worker deployable independently.
