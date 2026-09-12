# Changelog

All notable changes to the AdeptIELTS project are documented in this file.

The format is based on Keep a Changelog, and this project adheres to Semantic Versioning.

## [0.3.0] - 2026-09-12

### Added
- Automated daily dynamic AI model synchronization (`getOrSyncLiveModels`) querying live `/v1/models` endpoints directly from Groq, Google Gemini, OpenAI, and OpenRouter.
- 24-hour TTL local client caching (`adept_live_models_<provider>`) to prevent rate-limiting and eliminate startup latency.
- Dynamic model selection pills in Settings displaying discovered active models.
- Auto-sync status badge and last synchronized date indicator in Settings.
- On-demand "Fetch Live Models" manual discovery button for immediate provider refresh.
- Automated multi-model fallback cascade during execution to handle decommissioned or enterprise-gated checkpoints without breaking active candidate test sessions.
- Timed Exam Simulation configuration card in MockExamView with modular section selector cards and exam conduct notices.
- Groq Whisper STT fallback engine (`whisper-large-v3-turbo`) providing seamless voice transcription on mobile browsers (Android Chrome, Firefox, iOS Safari) when Web Speech API is unavailable or returns empty transcripts.
- Mobile navbar declutter: replaced overflowing name button with initials avatar circle, tightened streak indicator, reduced mobile header height to 48px, and added responsive icon-only logo on screens < 480px.
- Enhanced mobile viewport responsiveness with comfortable safe-area padding and compact touch targets.

### Changed
- Migrated Groq Cloud default model to `openai/gpt-oss-120b` and updated production presets to `openai/gpt-oss-120b`, `openai/gpt-oss-20b`, and `qwen/qwen3.8-27b`.
- Removed decommissioned `mixtral-8x7b-32768` and enterprise-gated references.
- Replaced overused generic sparkle icons across Progress, Mock Exam, and Practice sections with context-specific semantic icons (`BarChart3`, `ShieldCheck`, `Award`, `SlidersHorizontal`, `Lightbulb`).
- Restored diagonal upward hover arrow animation specifically for the candidate dashboard primary recommendation action.

---

## [0.2.0] - 2026-09-12

### Added
- Cambridge IELTS 9-band public descriptors diagnostic evaluation engine.
- Interactive Side-by-Side Model Solution comparison for Writing Task 1 and Task 2.
- Interactive Side-by-Side Model Speech comparison for Speaking Parts 1, 2, and 3.
- Lexical Resource upgrades with academic collocations and examiner pedagogical rationale.
- Sentence-level corrections with before and after elevations.
- Multi-provider AI orchestration with support for Google Gemini, Anthropic Claude, OpenAI Direct, OpenRouter, and Groq Cloud.
- Live API model discovery (`GET /openai/v1/models`) supporting real-time checkpoint synchronization.
- Fallback model cascades across Google Gemini, OpenAI, Anthropic, and Groq Cloud.
- Test Center simulation mode with continuous timers and authentic answer interfaces.

### Changed
- Updated Groq Cloud default model to active production models (`openai/gpt-oss-120b`, `openai/gpt-oss-20b`, `qwen/qwen3.8-27b`).
- Replaced decommissioned model references (`mixtral-8x7b-32768`) and enterprise-gated models.
- Refined Candidate Dashboard layout with streamlined navigation and eliminated redundant visual badges.
- Enhanced Reading passage formatting with paragraph preservation and left alignment.
- Polished multiple-choice and True/False/Not Given option cards with circular letter badges and active borders.
- Replaced overused generic sparkle icons across progress, mock, and settings views with semantic icons.
- Added diagonal upward hover motion to primary candidate dashboard action button matching the landing page.

### Security
- Added AES-256 client-side cryptographic vault for securing user-provided API keys prior to Turso Cloud Edge synchronization.

---

## [0.1.0] - 2026-09-11

### Added
- Initial release of AdeptIELTS adaptive preparation platform.
- Cambridge IELTS diagnostic baseline testing with 4-item placement evaluation.
- Reading and listening practice modules with evidence span citations.
- Spaced repetition vocabulary flashcard engine with Leitner intervals.
- Study pace planning and target band timeline tracking.
- Client-side storage persistence with Turso LibSQL Edge Database support.
