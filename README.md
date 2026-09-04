# Still Waters

**Prayer when you don't have the words.**

Still Waters is a calm, mobile-first Christian prayer companion. A person can share what is on their heart, choose a prayer topic, or simply ask to be prayed over. The app then returns a personal prayer and a curated Scripture reference. Saved prayers stay in the browser on that device.

## What is included

- Mobile-first, responsive interface
- Prayer topics for marriage, family, fear, finances, direction, forgiveness, strength, and gratitude
- “I don't know what to say — just pray for me” flow
- Server-side OpenAI prayer generation
- Built-in prayer fallback if the AI endpoint is not configured or unavailable
- Curated Scripture matching so the model does not invent Bible quotations
- Local-only prayer journal using `localStorage`
- Installable web app manifest
- Security and privacy headers for Cloudflare Pages
- Guardrails against claiming divine revelation or guaranteeing outcomes

## Recommended hosting

The static site can be previewed anywhere, including GitHub Pages. However, the AI prayer endpoint must run server-side so the OpenAI API key is never exposed in browser JavaScript.

The repository is structured for **Cloudflare Pages**:

- Static site files live at the repository root.
- The Pages Function lives at `functions/api/pray.js` and becomes `/api/pray` after deployment.
- No JavaScript framework or build process is required.

Connect this repository to a Cloudflare Pages project and configure the project to publish the repository root as a static site.

## Environment variables

Add these in the hosting provider's server-side environment settings:

### Required

`OPENAI_API_KEY`

Your OpenAI API key. Never commit this value to GitHub.

### Optional

`OPENAI_MODEL`

If omitted, Still Waters uses:

`gpt-5.6-luna`

## Local behavior before the API is configured

The app is intentionally usable even before deployment of the server-side function. If `/api/pray` is unavailable, the browser automatically falls back to the built-in prayer generator. This lets you test the interface without exposing or hard-coding an API key.

## Privacy model

Prayer concerns are not stored by the front end unless the user explicitly saves a generated prayer to the journal.

Saved journal entries are stored in that browser's `localStorage` and are not synced to a database.

When AI generation is enabled, the prayer concern is sent to the server-side function and then to the OpenAI Responses API for generation. The request uses `store: false`.

The app does not include analytics, advertising, accounts, camera access, microphone access, geolocation, payment access, or USB access.

## Pastoral design principles

The prayer engine is instructed to:

- pray rather than lecture;
- avoid shame and condemnation;
- never say that God directly revealed something to the model;
- avoid predicting outcomes or presenting certainty about God's plan;
- pray for wisdom, discernment, peace, courage, protection, humility, reconciliation, healthy boundaries, and trustworthy support when appropriate;
- avoid diagnosing medical, mental-health, legal, financial, or relationship conditions;
- encourage immediate real-world help when someone appears to be in immediate danger.

## Project structure

```text
still-waters/
├── index.html
├── styles.css
├── app.js
├── icon.svg
├── manifest.webmanifest
├── _headers
└── functions/
    └── api/
        └── pray.js
```

## Important

Still Waters is intended to support prayer and reflection. It should not be presented as a replacement for a church community, trusted pastor, licensed counselor, emergency services, or other appropriate professional support.
