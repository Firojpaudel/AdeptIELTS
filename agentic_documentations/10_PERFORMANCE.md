# Performance

## Primary goal

The site must feel extremely fast.

## Targets

Aim for:
- fast first contentful paint
- minimal JavaScript on landing page
- lazy-loaded application modules
- compressed assets
- no huge UI libraries
- no unnecessary animation

## Bundle strategy

Initial bundle:
- app shell
- routing
- typography
- critical UI

Lazy:
- charts
- audio
- mock exam
- writing editor
- advanced analytics

## AI latency

Do not make the user wait for unnecessary AI.

Use:
- streaming responses
- small models for simple tasks
- cached explanations
- deterministic logic where possible
- parallel requests when safe

## Perceived performance

Immediately show:
- skeleton
- task context
- timer
- progress

Stream AI feedback progressively.

## Offline-first opportunities

Cache:
- lessons
- static explanations
- practice metadata
- previously downloaded exercises

Allow deterministic practice offline where practical.

## CDN

GitHub Pages provides static delivery.

Keep static assets cacheable.

Use hashed assets for long-lived caching.

## Images

Prefer SVG/CSS.
Avoid large decorative images.

## Fonts

Self-host only what is needed.
Prefer modern formats.
Avoid five-font systems.
