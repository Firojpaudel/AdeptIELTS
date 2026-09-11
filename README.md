# AdeptIELTS

[![Build Status](https://github.com/Firojpaudel/AdeptIELTS/actions/workflows/deploy.yml/badge.svg)](https://github.com/Firojpaudel/AdeptIELTS/actions/workflows/deploy.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB.svg?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF.svg?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Database](https://img.shields.io/badge/Database-Turso%20LibSQL-00E599.svg?logo=sqlite&logoColor=white)](https://turso.tech)

AdeptIELTS is an adaptive, diagnostic computer-delivered preparation platform designed for candidates taking the International English Language Testing System (IELTS) Academic and General Training examinations. 

The platform pairs authentic exam formats with deterministic evaluation algorithms, spaced-repetition vocabulary acquisition, real-time speech and writing assessment, and edge database synchronization.

---

## Table of Contents

- [Overview](#overview)
- [How It Works](#how-it-works)
  - [Adaptive Assessment Engine](#adaptive-assessment-engine)
  - [Evaluation Frameworks](#evaluation-frameworks)
  - [Spaced Repetition System](#spaced-repetition-system)
  - [Data Synchronization Architecture](#data-synchronization-architecture)
- [Platform Modules](#platform-modules)
  - [Diagnostic Calibration](#diagnostic-calibration)
  - [Reading & Listening Practice](#reading--listening-practice)
  - [Writing Coach](#writing-coach)
  - [Speaking Coach](#speaking-coach)
  - [Academic Vocabulary System](#academic-vocabulary-system)
  - [Study Activity & Streak Tracker](#study-activity--streak-tracker)
  - [Reference Library](#reference-library)
- [System Architecture](#system-architecture)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running Locally](#running-locally)
  - [Production Build](#production-build)
- [Deployment](#deployment)
  - [Deploying to GitHub Pages](#deploying-to-github-pages)
  - [Deploying to Vercel](#deploying-to-vercel)
  - [Deploying to Netlify](#deploying-to-netlify)
  - [Self-Hosted & Docker](#self-hosted--docker)
- [Repository Structure](#repository-structure)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

AdeptIELTS addresses the limitations of static practice tests by providing dynamic, calibrated practice that evolves with candidate performance. Test items adapt to the learner's demonstrated proficiency level, while writing and speaking modules provide actionable feedback mapped directly to official assessment rubrics.

### Core Capabilities

- **Diagnostic Band Estimation**: Automated baseline calibration establishing CEFR level (B1 through C2) and projected band score (0.0–9.0).
- **Split-Pane Exam Interface**: Computer-delivered test simulation featuring synchronized text highlighting, verified line citations, and authentic question types.
- **Criterion-Referenced Evaluation**: Writing and speaking responses are evaluated against official IELTS criteria with sentence-level revisions.
- **Offline-First Resilience**: All core functions operate locally without mandatory external network dependencies, featuring background edge replication.

---

## How It Works

### Adaptive Assessment Engine

The adaptive engine updates learner mastery continuously across all IELTS subskills (Skimming, Scanning, Detail Inference, Coherence, Lexical Precision, Phonological Control).

Subskill mastery is calculated using a weighted rolling heuristic:

```
Mastery = (0.45 * Recent_Accuracy) + (0.25 * Historical_Accuracy) + (0.15 * Consistency_Rate) + (0.15 * Confidence_Metric)
```

- **Difficulty Calibration**: Questions are classified by difficulty tier (1 through 5). Consistent accuracy elevates question difficulty, while repeated errors trigger targeted remediation at lower tiers.
- **Raw-to-Band Mapping**: Scores conform strictly to official IELTS raw-mark conversion tables, including standard 0.5-band rounding conventions.

### Evaluation Frameworks

#### Writing Assessment (Tasks 1 & 2)

Evaluated across the four official public assessment dimensions:

1. **Task Achievement (Task 1) / Task Response (Task 2)**: Completeness of response, thesis clarity, and development of supporting arguments.
2. **Coherence & Cohesion**: Macro-structure, paragraph unity, discourse connectors, and referential indexing.
3. **Lexical Resource**: Lexical sophistication, contextual precision, idiomatic register, and spelling fidelity.
4. **Grammatical Range & Accuracy**: Proportion of complex structural clauses, modal syntax, tense consistency, and error tolerance.

#### Speaking Assessment (Parts 1, 2 & 3)

Evaluated across four primary speech parameters:

1. **Fluency & Coherence**: Speech continuity, natural pacing, discourse expansion, and hesitation rate.
2. **Lexical Resource**: Collocational competence, topic-specific register, and avoidance of overused descriptors.
3. **Grammatical Range & Accuracy**: Syntactic variety, clause subordination, and structural accuracy.
4. **Pronunciation**: Intonation, syllable emphasis, phonological clarity, and rhythm.

### Spaced Repetition System

Vocabulary acquisition utilizes an implementation of the SuperMemo-2 (SM-2) spaced repetition algorithm:

- Headwords from the Academic Word List (AWL) are scheduled into review intervals: 1 day, 3 days, 7 days, 14 days, and 30 days.
- Ease Factor adjusts dynamically based on recall quality grades (0 through 5).
- Flashcards present IPA transcription, CEFR classification, collocational patterns, and authentic academic context sentences.

### Data Synchronization Architecture

AdeptIELTS uses an offline-first storage hierarchy:

1. **Local Persistent Cache**: Client state, profiles, question attempts, and active session timers persist to browser storage via `localStorage`.
2. **Turso LibSQL Edge Database**: Client events asynchronously replicate to a distributed SQLite edge database via `@libsql/client/web`, providing multi-device access and backup.
3. **Deterministic Fallback Engine**: If network access is lost or external inference endpoints are unreachable, deterministic rule-based analyzers provide local scoring without interruptions.

---

## Platform Modules

### Diagnostic Calibration
Provides comprehensive baseline profiling across Reading, Listening, Writing, and Speaking to identify weak subskills and establish tailored study tracks.

### Reading & Listening Practice
Presents authentic multi-paragraph reading passages with split-pane questions (Multiple Choice, Matching Headings, True/False/Not Given, Sentence Completion, Summary Completion) with line-by-line textual citations.

### Writing Coach
Supports Academic Task 1 (visual reports), General Training Task 1 (correspondence), and Task 2 (argumentative essays). Features a pre-writing strategy card, structural outlines, timed examination modes, and full Band 9 reference revisions.

### Speaking Coach
Speech capture interface supporting Part 1 short-answer questions, Part 2 cue cards with a dedicated 60-second preparation countdown, and Part 3 two-way discussions. Audio recordings are transcribed and analyzed for speech metrics.

### Academic Vocabulary System
Contains 570 Academic Word List headwords structured into frequency sublists, accompanied by interactive flipcard drills and memory retention queues.

### Study Activity & Streak Tracker
Tracks continuous study frequency with daily event aggregation across all modules. Includes calendar visualization and midnight grace-period mechanics to maintain consistent practice habits.

### Reference Library
Integrated high-definition document reader supporting standard vector PDFs and single-page archive editions of Cambridge preparation books with text searching and navigation.

---

## System Architecture

```
AdeptIELTS Architecture
┌─────────────────────────────────────────────────────────────┐
│                       Client Layer                          │
│                                                             │
│   React 18 / TypeScript SPA  │  Vite Bundler / Custom CSS   │
│   AppShell Navigation        │  Candidate Profile Context   │
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │
               ▼                             ▼
┌─────────────────────────────┐┌──────────────────────────────┐
│       Core Engines          ││        Storage Layer         │
│                             ││                              │
│  - Adaptive Engine (SM-2)   ││  - LocalStorage (Primary)    │
│  - IELTS Band Converter     ││  - Turso LibSQL Edge DB      │
│  - Study Activity Tracker   ││  - IndexedDB Session Cache   │
│  - Audio Transcription      ││                              │
└──────────────┬──────────────┘└──────────────────────────────┘
               │
              ▼
┌─────────────────────────────────────────────────────────────┐
│                     Evaluation Tier                         │
│                                                             │
│  [Free Tier AI Orchestrator] ──►Groq / Gemini / OpenRouter │
│              │                                              │
│             ▼ (Fallback / Offline)                         │
│  [Deterministic Rules Engine]                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Getting Started

### Prerequisites

- **Node.js**: version 18.0.0 or higher
- **npm**: version 9.0.0 or higher

### Installation

Clone the repository and install dependencies:

```bash
git clone git@github.com:Firojpaudel/AdeptIELTS.git
cd AdeptIELTS
npm install
```

### Environment Variables

Copy the example environment configuration:

```bash
cp .env.example .env
```

Configure the following variables in `.env`:

```env
# Database Configuration (Turso LibSQL)
VITE_TURSO_DB_URL=libsql://your-database-name.turso.io
VITE_TURSO_AUTH_TOKEN=your_turso_authentication_token

# Optional: Default AI Provider Configuration
# Supported options: 'groq' | 'gemini' | 'openrouter' | 'offline'
VITE_AI_PROVIDER=groq
VITE_AI_API_KEY=your_provider_api_key
```

*Note: All API credentials can also be entered directly in the application under Settings, where they are stored solely in the candidate's local browser environment.*

### Running Locally

Start the Vite development server:

```bash
npm run dev
```

The application will be accessible at `http://localhost:5173`.

### Production Build

Verify type safety and compile optimized static assets:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

---

## Deployment

AdeptIELTS is an entirely static client-side single-page application and can be hosted on any static site provider or CDN.

### Deploying to GitHub Pages

A fully configured GitHub Actions workflow is provided in `.github/workflows/deploy.yml`.

1. Push your repository to GitHub:
   ```bash
   git push -u origin main
   ```
2. Navigate to your repository on GitHub.
3. Open **Settings** > **Pages**.
4. Set **Source** under *Build and deployment* to **GitHub Actions**.
5. (Optional) Set repository secrets under **Settings** > **Secrets and variables** > **Actions** (`VITE_TURSO_DB_URL`, `VITE_TURSO_AUTH_TOKEN`).
6. The deployment pipeline will trigger automatically and host the application at `https://<username>.github.io/<repository>/`.

### Deploying to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy to production
vercel --prod
```

Or connect the repository via the [Vercel Dashboard](https://vercel.com). Select **Vite** as the framework preset and deploy.

### Deploying to Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --build --prod
```

### Self-Hosted & Docker

A simple static web server configuration using Nginx:

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Build and run:

```bash
docker build -t adeptielts .
docker run -p 8080:80 adeptielts
```

---

## Repository Structure

```
AdeptIELTS/
├── .github/
│   └── workflows/
│       └── deploy.yml         # GitHub Actions automated deployment workflow
├── src/
│   ├── components/            # Reusable UI components (AppShell, Timer, Modals)
│   ├── features/
│   │   ├── dashboard/         # Target band metrics, daily curriculum, skill status
│   │   ├── diagnostic/        # Initial baseline skill evaluation
│   │   ├── learn/             # Core method guides and question-type strategies
│   │   ├── mock/              # Full-length timed practice tests
│   │   ├── practice/          # Subskill question drills with evidence citations
│   │   ├── progress/          # Longitudinal skill radar and error patterns
│   │   ├── resources/         # Vector PDF Cambridge library viewer
│   │   ├── settings/          # AI model routing, database sync, and audio options
│   │   ├── speaking/          # Speech recording and pronunciation evaluation
│   │   ├── vocabulary/        # AWL flashcards with spaced repetition
│   │   └── writing/           # Task 1 and Task 2 evaluation engine
│   ├── data/                  # Standard passages, question sets, AWL vocab, prompts
│   ├── lib/                   # Heuristic calculators, AI routing, Turso client, storage
│   ├── styles/                # CSS custom property tokens, layout, and reset styles
│   ├── App.tsx                # Application root and routing
│   └── main.tsx               # Entry point
├── worker/                    # Cloudflare Worker AI reverse proxy
├── index.html                 # HTML entry point with typography preloading
├── package.json               # Dependencies and build scripts
├── tsconfig.json              # TypeScript compiler configuration
└── vite.config.ts             # Vite build configuration
```

---

## Contributing

Contributions to question banks, reading passages, and scoring calibrations are welcome.

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/new-subskill`).
3. Commit your changes (`git commit -m "feat: add IELTS Academic Reading passage set 4"`).
4. Push to the branch (`git push origin feature/new-subskill`).
5. Open a Pull Request.

---

## License

This project is licensed under the [MIT License](LICENSE).
Test materials and passages referenced in this application are strictly for educational evaluation and diagnostic study purposes.
