# Rules for Coding Agents

## Before coding

Read:
- PRODUCT.md
- ARCHITECTURE.md
- DESIGN.md
- PERFORMANCE.md

## Never

- create a generic AI dashboard
- expose API keys
- invent IELTS scoring rules
- invent IELTS question formats
- republish copyrighted content without permission
- create fake testimonials
- create fake statistics
- add unnecessary dependencies
- overengineer infrastructure
- build microservices for MVP
- use AI where deterministic logic is enough

## Always

- preserve design consistency
- optimize for fast load
- use semantic HTML
- validate generated questions
- handle loading/error/empty states
- support keyboard navigation
- make mobile usable
- keep provider integrations abstracted
- document architectural decisions

## UI review

Before finalizing a page ask:

What is the primary user task?

What is the strongest visual hierarchy?

What can be removed?

Does this look like an intentionally designed education product?

Would a professional product designer approve the spacing and typography?

Does the page look AI-generated?

If yes, redesign it.

## Code review

Ask:

Can this be simpler?

Can this be faster?

Does this require a dependency?

Can this be deterministic?

Does this belong in the frontend or Worker?

## Product review

Ask:

Does this help the learner improve?

If not, remove it.
