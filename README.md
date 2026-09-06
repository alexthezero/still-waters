# Still Waters

A gentle Christian prayer companion, built for GitHub Pages.

**Live site:** https://alexthezero.github.io/still-waters/

## How it works

Choose a situation to immediately open one of three complete, individually written prayers. “Read another prayer” stays with that situation and visits every prayer in its set before repeating. A fresh visit starts a new shuffled order.

There are **45 original prayers**: three for each of 14 situations, plus three general prayers for “Just pray over me.”

| Situation | Focus |
| --- | --- |
| I'm overwhelmed | Strength, limits, and accepting help |
| My mind won't settle | Worry, fear, and uncertainty |
| My relationship feels strained | Communication, mutual care, and boundaries |
| Motherhood feels heavy | Parenting, identity, and receiving care |
| Work is weighing on me | Pressure, workplace relationships, and career direction |
| I don't know what to do | Decisions and waiting |
| I'm carrying family worries | Caring without controlling every outcome |
| Money feels uncertain | Provision and practical wisdom |
| I'm hurt or holding on | Healing, forgiveness, and accountability |
| I'm missing someone | Grief and loss |
| I feel far from God | Honest questions and returning to prayer |
| I feel unseen or alone | Belonging and personal worth |
| I need rest tonight | Releasing the day and receiving rest |
| I want to give thanks | Gratitude within real life |

Each prayer includes a title, a brief encouragement, and a related Scripture reference. Reflections are original devotional thoughts, not Bible quotations. The Psalm 23 excerpt on the home screen is identified as KJV.

## GitHub Pages

The live experience is plain HTML, CSS, and JavaScript at the repository root. It requires no build, API key, account, or paid prayer service. The existing GitHub Pages publication follows the main branch.

- `index.html`: accessible situation choices, prayer reading, and saved journal.
- `styles.css`: responsive cream and forest-green design.
- `prayers.js`: complete prayer catalog and in-memory shuffle rotation.
- `app.js`: navigation, optional text matching, and device-local journal.
- `icon.svg` and `manifest.webmanifest`: existing web app identity.
- `functions/api/pray.js`: retained optional Cloudflare Pages prayer endpoint.
- `_headers`: retained Cloudflare Pages headers; GitHub Pages does not apply this file.

## Privacy and saved prayers

Choosing a situation does not send a prayer request, store a situation history, or require an account. Rotation state lasts only in the open page.

The optional “I'd like to put it into words” section uses local keyword matching on the GitHub Pages host. It selects a written prayer; it does not generate a custom interpretation or echo the person's text. The person can explicitly choose the situation if the suggested match is not suitable. Raw text is not copied into new journal entries.

A prayer is saved only when “Save this prayer” is selected. The journal uses the existing `still-waters-prayer-journal-v1` browser-storage key so earlier entries remain available at the same site origin. It is not encrypted, password protected, or synced between devices. Anyone using the same browser profile can open it. Clearing browser data removes it.

Saving the same catalog prayer twice is prevented. If storage is blocked or full, the app reports that the change could not be saved. A full journal does not silently discard earlier prayers.

No analytics, advertising, camera, microphone, location, or payment features are included. The existing Google Fonts stylesheets make font requests; Scripture links open Bible Gateway only when selected.

## Optional server-generated prayers

The original Cloudflare Pages function is preserved for a deployment that supports it. GitHub Pages does **not** run this function. Scenario choices always use the written catalog.

On a non-GitHub host, submitting a free-text concern tries `./api/pray`. An explicitly configured `window.STILL_WATERS_API_URL` can also select an endpoint. The form discloses when words may be sent to that service and OpenAI. Requests time out after 15 seconds and fall back to a clearly identified written prayer.

Configure `OPENAI_API_KEY` on the server only. Never put it in client code or GitHub. The existing `OPENAI_MODEL` setting is retained. API responses use `store: false`; this is not a promise about provider logging or retention. Server hosting and API usage have their own requirements and costs.

Prayers offer encouragement without claiming divine revelation, predicting outcomes, assigning blame, or asking a person to remain in an unsafe relationship. They can accompany support from trusted people and a faith community.

## Verification

The update was checked for JavaScript syntax, valid local asset references, unique HTML IDs, and matching script hooks. Catalog checks cover all 45 complete prayers. Rotation checks cover every situation, full cycles, cycle boundaries, and switching between situations. Browser visual testing was not part of this update.
