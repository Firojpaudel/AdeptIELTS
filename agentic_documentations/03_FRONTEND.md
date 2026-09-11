# Frontend Architecture

## Recommended stack

- React
- TypeScript
- Vite
- Tailwind CSS only if it helps implementation speed
- React Router or lightweight routing
- Recharts or a similarly lightweight charting library
- Web Audio APIs for browser recording/playback where possible

Avoid large component frameworks that make the bundle unnecessarily heavy.

## Pages

Public:
- /
- /about
- /resources

Onboarding:
- /start
- /diagnostic
- /results

Application:
- /dashboard
- /learn
- /learn/:lesson
- /practice
- /practice/:session
- /writing
- /speaking
- /mock
- /mock/:id
- /progress
- /vocabulary
- /settings

## Core components

- AppShell
- Sidebar
- Topbar
- ProgressSummary
- SkillMeter
- LessonView
- QuestionView
- AnswerFeedback
- WritingEditor
- SpeakingRecorder
- ExamTimer
- MockExamShell
- ProgressChart
- ErrorBreakdown
- ResourceCard

## State

Prefer local React state and a small global store only where necessary.

Persist MVP learner state using localStorage/IndexedDB.

Never put API secrets in frontend environment variables.

## Static hosting constraint

All routes must work when built as a static site.

Use SPA fallback configuration appropriate for GitHub Pages or a static-routing strategy.

## First-load priority

Load:
- shell
- typography
- critical CSS
- dashboard data

Lazy-load:
- charts
- speaking recorder
- mock exam modules
- heavy editors
- optional visualizations
