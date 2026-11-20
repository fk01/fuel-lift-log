# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Thai people who lift weights on their own — office workers and other everyday lifters, beginner to intermediate, training at a commercial gym, a condo gym or at home, without a coach. Each morning they want to know: how is my body today, what do I eat today, and how do I train today. Phone in hand, often between sets or on the go.

## Product Purpose

WeightGram (tagline: Weightgramming) is a mobile web app (PWA, Thai-first with English) that runs a person's whole training day: recovery-aware workout plans, a meal plan with kcal/protein targets, logging sets and meals, and stats. Success = a person opens it every morning, knows what to do in seconds, and keeps showing up.

## Positioning

- **Three questions every morning** on one Today screen: body (muscle recovery), eat (next meal, kcal/protein), train (today's plan + place).
- **Programs belong to places**: each place (gym, condo, park, court) has its own equipment and its own copy of a program; cardio can happen anywhere.
- **Free sharing community**: people share their workout and meal plans, browse, like, save, use, comment and follow. Nothing is sold.
- **Configurable muscle recovery**: per-muscle recovery hours drive the body map, readiness and suggestions.

## Operating Context

- Morning check on Today; training at the gym with the phone (focus mode, tick sets, rest timer); ticking meals through the day.
- Bottom tabs: Today · Eat · Train · Stats · Explore · More.
- New people sign up (Google or email) and go through a 4-step onboarding that builds their own profile, targets, meals, places and starter program.
- Undo after every save; explicit Save/Cancel in editors; sheets go back one level.

## Capabilities and Constraints

- Static `public/` front end (classic scripts sharing globals) + Cloudflare Worker API + D1 (per-user docs, community tables). Deployed by Cloudflare from `main`.
- Must work well on iPhone Safari / home-screen PWA (safe areas, iOS scroll and caching quirks).
- Thai is the primary language; every string also needs English.
- Undecided: App Store release (later), any paid tier (later; currently nothing is sold).

## Brand Commitments

- Name **WeightGram**, tagline **WEIGHTGRAMMING**. Logo: a metallic "WG" monogram with a barbell through it, cyan→green neon outline, circuit/code details (source image supplied by the owner; current in-app mark is an SVG approximation at `public/img/weightgram.svg`).
- Existing dark neon look (cyan #2ee6ff → green #3dff8c on deep navy), already used across the app.

## Evidence on Hand

- Demo community data in production D1: 5 demo people (`udemo1`–`udemo5`) with 9 shared plans, comments, follows and activity — clearly demo, not real users.
- No real testimonials, user counts, press or benchmarks exist; do not invent them.

## Product Principles

1. Answer the morning questions first; everything else is one tap deeper.
2. Every action is reversible: undo, cancel, back one level.
3. The person's own plan, own places, own body — defaults never impose someone else's routine.
4. Sharing is opt-in and private by default; body weight is never shared.
5. Fast at the gym: big targets, one-handed, minimal typing.
