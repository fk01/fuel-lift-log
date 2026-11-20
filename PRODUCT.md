# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

(Installable PWA, used mainly from the iPhone home screen via Safari "Add to Home Screen". Mobile web, not native.)

## Users

- **Now:** the owner (fk01) plus a few friends. Each logs their own food, lifting, runs and badminton every day.
- **Later:** opened to everyone. The intended audience is ordinary people, including those with **no training or nutrition knowledge**.
- **Situations:** one-handed in the gym between sets, often in bright light; and quick check-ins through the day around meal times.
- **The job, every time the app opens:** "What do I need to do today, and how far along am I?" (from docs/UX-PLAN.md)

## Product Purpose

WeightGram gets ordinary people to start exercising and gives them the confidence to train on their own, without needing to know a lot first. It does this by keeping one day's plan in one place (meals to tick off, today's workout, cardio or sport) and removing guesswork about what to do next.

Success means a beginner opens the app, knows right away what today asks of them, and does it. The same goes for a returning user, who also sees their progress.

## Positioning

General lifting apps (Strong, Hevy) assume the user already knows what to do. Calorie counters (MyFitnessPal) cover food only. WeightGram is built for **people who don't know much yet**. It schedules the day for them and puts food, lifting, runs and badminton in one place. It also includes ready-made programs and an exercise library with demo GIFs, so a beginner can follow along instead of designing their own plan. The community shares workout and meal plans so people can copy what works.

## Operating Context

- Daily use with a weekly schedule. Day types: lifting program (e.g. Pull A), run, badminton, rest, late-session variants.
- Meal checklist with calorie/protein targets. A Cloudflare cron sends Web Push reminders (Thai time) only for meals not yet ticked.
- In-gym logging: set entry via a custom number pad (no keyboard), rest timer, workout clock, volume, share cards.
- Stats: volume, recovery, sets per muscle (muscle map), 1RM, per-exercise progression, body weight/fat, nutrition history.
- Community: share/use/like/save/comment on workout and meal plans, follow people, activity feed (opt-in), privacy, report/block, admin hide.
- Gamification: pixel hero character, XP, levels, badges.
- Login: PIN and passkey/Face ID. Data sync to the Worker, plus JSON import/export.
- Development follows docs/PROCESS.md (intent → spec + mockup → plan → test → PR).

## Capabilities and Constraints

- **Stack (existing):** Cloudflare Workers, Static Assets, D1, Cron, Web Push. The front end is plain scripts in `public/js` (not ES modules) that share globals, with load order set in `index.html`. There is no build step.
- Bump the `?v=` asset query in `public/index.html` on every UI change, because iOS caches aggressively.
- Live programs are stored in D1 (`settings` doc). `programs.js` holds only the defaults.
- Bilingual Thai/English UI with a language toggle. Exercise names are always in English.
- Undecided: when and how the app opens to the public (sign-up model beyond PIN/passkey, moderation scale).

## Brand Commitments

- Name: **WeightGram** ("Fuel & Lift" is the repo/legacy name).
- Pixel-art hero character, kept for the level card and rest bar (UX-PLAN 2.2).
- Existing assets: `public/img/weightgram.svg`, app icons, hero sprites in `public/hero/`, muscle-map images in `public/img/mus/`, exercise GIFs in `public/ex/`.

## Evidence on Hand

- docs/UX-PLAN.md (19 Nov 2026): a review of all 4 tabs at iPhone 16 Pro Max size, with a phased improvement plan.
- There are no testimonials, user counts or public metrics yet. Do not invent any.

## Product Principles

1. **Today comes first.** What needs doing today is always at the top. History and stats come after.
2. **One screen, one job, one primary button.**
3. **One way to each feature.** No duplicate entry points.
4. **Built for one hand in the gym.** Large tap targets (at least 44pt) and text that is readable in bright light.
5. **Beginner-safe.** Never assume training knowledge. Guide the user to the next action instead of asking them to plan.

## Accessibility & Inclusion

- Muted text must reach a contrast of at least 4.5:1 on the dark background (UX-PLAN 3.4).
- Full Thai/English coverage of every string, with correct singular/plural forms.
