# Content Architecture

## Source hierarchy

### Tier 1: Official IELTS
Primary source of truth for:
- test format
- task types
- assessment criteria
- official sample material where permitted

### Tier 2: Trusted English education
- British Council
- IDP IELTS
- Cambridge English
- Cambridge Write & Improve
- BBC Learning English

### Tier 3: Platform-original content
Generate original:
- lessons
- exercises
- reading passages
- listening scripts
- speaking prompts
- vocabulary drills
- grammar drills
- mock questions

## Copyright rule

Do not scrape and republish copyrighted content simply because it is publicly accessible.

Store metadata and links where appropriate.
Use official embeds only when permitted.
Generate original practice content for scalable coverage.

## Content metadata

Each resource:

id
title
provider
url
skill
level
type
description
license_status
usage_mode
last_verified

Each question:

id
skill
subskill
question_type
test_type
difficulty
target_band
topic
passage_id
answer
explanation
source_type
validation_status

## Content validation

AI-generated question pipeline:

generate
→ grammar check
→ answer check
→ ambiguity check
→ difficulty check
→ evidence check
→ human spot-check
→ publish

Do not ship unvalidated AI questions.
