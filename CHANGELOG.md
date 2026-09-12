# Changelog

All notable changes to the Adept IELTS Adaptive Platform will be documented in this file.

---

## [v0.2] - 2026-09-12

### What Was Made Better (Summary of Major Improvements)

Version 0.2 introduces major platform advancements focused on first-class multi-provider AI parity, authentic Cambridge 9-band diagnostic evaluation, side-by-side comparative model analysis, and streamlined, clutter-free user experience engineering.

#### 1. Official Live Documentation Model Alignment & Multi-Provider Architecture
- Google Gemini (AI Studio):
  - Calibrated directly against Google AI Studio official documentation (`https://aistudio.google.com/docs`).
  - Native support and presets for `gemini-3.8-flash`, `gemini-3.5-flash`, `gemini-3.5-pro`, `gemini-2.5-flash`, and `gemini-2.0-flash`.
  - Automated 5-tier cascade fallback (`gemini-3.8-flash` -> `gemini-3.5-flash` -> `gemini-3.5-pro` -> `gemini-2.5-flash` -> `gemini-2.0-flash`) ensuring zero downtime, quota resilience, and protection against 404 model errors.
- Anthropic Claude:
  - Calibrated directly against Claude Platform documentation (`https://platform.claude.com/docs/en/models/overview`).
  - Native support and presets for `claude-sonnet-5`, `claude-opus-5`, `claude-haiku-4-5`, `claude-3-7-sonnet-20250219`, and `claude-3-5-sonnet-latest`.
  - Browser-direct execution via `'anthropic-dangerous-direct-browser-access': 'true'` header.
- OpenAI:
  - Calibrated directly against OpenAI API Platform documentation (`https://developers.openai.com/api/docs/models.md`).
  - Native support and presets for `gpt-6-astra`, `gpt-5.6-terra`, `gpt-5.4-mini`, `gpt-4.1-mini`, `gpt-4o-mini`, and `gpt-4o`.
  - Multi-tier resilience cascade preventing request failures across differing organization access tiers.
- Unified Dispatcher (`executeLLMRequest`):
  - Every AI capability (Writing Coach, Speaking Examiner, Question Explanation, Exam Critique, and Procedural Question Generation) runs through the centralized router with zero prompt drift.
- Settings View Live Connection Tester:
  - Interactive "Test Connection" button providing live latency measurements and instant status verification before starting exams.

#### 2. Authentic Cambridge IELTS 9-Band AI Critic & Deep Diagnostics
- Empathetic & Authoritative Examiner Persona:
  - Calibrated prompt structures strictly against official Cambridge and IDP 9-band public descriptors.
- Clear "What Went Right" vs. "What Went Wrong":
  - Detailed praise for candidate strengths contrasted with actionable critiques of score-limiting flaws.
- Band 8.5+ Lexical Resource Upgrades:
  - Replaces everyday expressions with precise academic collocations and provides examiner rationale.
- Sentence-by-Sentence Elevations:
  - Before/after comparisons pinpointing syntactic cohesion and lexical nuance.
- Complete Examiner Band 8.5+ Model Solutions:
  - Full model essays and spoken responses for every prompt.

#### 3. Side-by-Side Model Comparison Layouts
- Writing Coach:
  - Three-tab diagnostic suite: Diagnostic Rubric, Side-by-Side Model (candidate draft vs. Band 8.5+ examiner solution), and Lexical Resource Upgrades.
- Speaking Examiner:
  - Tabbed interface comparing candidate audio transcript with native-speaker Band 8.5+ speech delivery.
- Full Mock Exam:
  - Instant Cambridge writing diagnostic and model solutions embedded directly in exam results.

#### 4. Decluttered & Polished Candidate Dashboard
- Clean Study Plan Header:
  - Replaced fragmented headings and redundant badges with a clean, confident title: Study Plan & Mastery.
  - Housed the instant Target Band modifier inside an elegant, compact pill badge.
- Direct Candidate Routing:
  - Returning candidates bypass guest landing pages and land straight on the Candidate Dashboard.
  - Removed clutter from the marketing hero for signed-in users while keeping high-contrast primary actions.
- Micro-Interactions:
  - Diagonal 45-degree rotation (`rotate(-45deg)`) on the primary hero button arrow badge on hover.
  - Clean horizontal nudges for card links to prevent button wrapping.

---

## [v0.1] - 2026-09-12

### Initial Stable Foundation
- Authentic IELTS Speaking Modules:
  - Dedicated interfaces for Speaking Part 1 (Introduction & Interview), Part 2 (Long Turn / Cue Card with 1-minute prep timer), and Part 3 (Two-way Discussion).
  - Audio recording with real-time waveform visualization and playback.
- Adaptive Practice Engine:
  - Reading and Listening test sections with real Cambridge-style question types (MCQs, Sentence Completion, Summary Completion, True/False/Not Given).
  - Spaced repetition vocabulary trainer with 3D flashcard flip interactions.
- Full Timed Mock Exams:
  - Academic & General Training test configurations with official Cambridge timing rules.
- Edge Persistence & Security:
  - Turso LibSQL edge database integration with AES-256 GCM client-side encryption for user API keys.
  - Supabase Auth integration with seamless guest-to-candidate migration.
