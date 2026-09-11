# Adaptive Learning Engine

## Goal

Choose the most useful next activity rather than simply randomizing questions.

## Learner state

For each skill/subskill store:

- attempts
- accuracy
- average time
- recent accuracy
- confidence
- last practiced
- error count
- streak
- estimated mastery

## Simple MVP mastery score

Use a transparent heuristic rather than a complex ML model.

mastery =
0.45 * recent_accuracy
+ 0.25 * overall_accuracy
+ 0.15 * consistency
+ 0.15 * confidence

Clamp to 0..1.

This can later be replaced by a more sophisticated model.

## Activity selection

Prioritize:

1. severe weakness
2. repeated recent errors
3. overdue review
4. target-band difficulty
5. variety
6. learner preference

## Difficulty

Use:
- beginner
- intermediate
- upper-intermediate
- advanced

Map these to approximate IELTS bands only as an internal targeting aid.

Do not claim exact equivalence between CEFR and IELTS bands.

## Remediation loop

Example:

Learner fails True/False/Not Given three times.

System:
1. identifies question-type weakness
2. teaches distinction between false and not given
3. gives 3 easy questions
4. gives 3 medium questions
5. gives one timed set
6. updates mastery

## Study plan

Plan generation should use:
- target band
- current estimate
- exam date
- available minutes
- weakest skills
- recent performance

Recompute weekly or when significant evidence changes.

## Spaced review

Use simple intervals initially:
1 day
3 days
7 days
14 days
30 days

Later add a better scheduler if required.
