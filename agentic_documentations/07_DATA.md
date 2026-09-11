# Data Model

## MVP

Keep most learner data local.

localStorage:
- preferences
- target band
- study settings
- lightweight progress

IndexedDB:
- practice history
- question attempts
- cached lessons
- larger local datasets

## Later server database

Tables:

users
learner_profiles
skills
subskills
lessons
questions
question_attempts
writing_submissions
writing_feedback
speaking_sessions
speaking_feedback
mock_tests
mock_attempts
vocabulary
vocabulary_reviews
study_sessions
resources

## Privacy

Do not store recordings or essays remotely unless the user explicitly submits them for processing and the system has a clear retention policy.

For MVP, process and discard audio when possible.

## Backend persistence trigger

Introduce a database only when:
- accounts are required
- cross-device sync matters
- cloud history matters
- analytics require server aggregation

Recommended future direction:
Supabase/Postgres.

Redis should be introduced only when cache/session/rate-limit load justifies it.
