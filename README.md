# Velmora — Rise to Power

A cartoon political-strategy game that runs entirely in the browser as an installable, offline-capable PWA. Start as a nobody and climb to head of state down one of two very different roads — win elections in **The Republic of Velmora**, or claw up the one-party machine of **The People's Union of Velmora**. The choices are the game: every decision shifts six stats, sets hidden flags, and bends toward one of a dozen branching endings.

No build step, no framework, no backend. Three files plus icons.

---

## Quick start (local)

The game **must be served over HTTP** — not opened as a `file://` page. Service workers and the install prompt only work from `http(s)://`. Opening `index.html` directly will still render the game, but offline support and "Install" will silently not engage.

Pick any static server:

```bash
# Python (already on most machines)
python3 -m http.server 8080

# or Node
npx serve .

# or PHP
php -S localhost:8080
```

Then open `http://localhost:8080/`. On Chrome/Edge desktop you'll see an install icon in the address bar; on mobile, "Add to Home Screen."

---

## Deploy

It's a static site, so any static host works. Two paths for your stack:

### Vercel (simplest)

From the project folder:

```bash
vercel          # preview deploy
vercel --prod   # production
```

No `vercel.json` needed — Vercel serves the folder as-is and the relative paths (`manifest.json`, `sw.js`, `icons/…`) resolve correctly at the domain root. Custom domain via the Vercel dashboard.

### Contabo VPS behind Traefik

Serve the folder from a tiny static container and let Traefik route to it. Drop the `velmora/` folder next to a compose file:

```yaml
services:
  velmora:
    image: nginx:alpine
    restart: unless-stopped
    volumes:
      - ./velmora:/usr/share/nginx/html:ro
    labels:
      - 'traefik.enable=true'
      - 'traefik.http.routers.velmora.rule=Host(`velmora.yourdomain.com`)'
      - 'traefik.http.routers.velmora.entrypoints=websecure'
      - 'traefik.http.routers.velmora.tls.certresolver=letsencrypt'
      - 'traefik.http.services.velmora.loadbalancer.server.port=80'
    networks:
      - traefik # whatever external network your Traefik already uses

networks:
  traefik:
    external: true
```

`docker compose up -d`, point the DNS A record at the box, and Let's Encrypt issues the cert on first request. (Adjust the network name and certresolver to match your existing Traefik setup.)

> **One operational note:** when you change `index.html` or any icon, **bump `SHELL_VERSION` in `sw.js`** (e.g. `v1.0.0` → `v1.0.1`). The service worker precaches the app shell; the version string is what tells returning visitors' browsers to drop the old cache and pull the new build. Without a bump, repeat visitors keep playing the cached version.

---

## Why it's never the same game

Replayability comes from **systems, not a branching script**. Every run re-rolls the world and draws from weighted pools, so two playthroughs on the same path diverge fast:

- **Randomized world-state** — economy (boom → crisis), public mood, and geopolitical tension are re-rolled at the start of each phase and color which events fire and how hard.
- **Generated rival roster** — your opponent for each office is drawn from a per-path name pool with randomized strength, then carried into events as a named character (with their own generated cartoon avatar).
- **Weighted random event draws** — events have weights and phase/path gates; a per-phase `seen[]` list prevents repeats, so the bank doesn't recycle until it's genuinely drained.
- **Instability-scaled crisis injection** — recessions, scandals, wars, assassinations, pandemics and coups are held out of the normal pool and injected on a probability that climbs with tension, a bad economy, high heat, and the final phase.
- **Dice-rolled risky choices** — "roll" choices resolve against a stat with a win chance derived from how far above/below the difficulty you are, branching into success/fail outcomes (and sometimes queuing delayed follow-up events).
- **Flag-branched endings** — choices set hidden flags (`bloody_hands`, `secret_reformer`, `own_cult`, `corrupt_streak`, a `purge_count` counter, and many more). The finale weighs those flags plus a composite score to award one of ~12 endings, from _The Reformer_ to _The Tyrant_ to a forgettable _Footnote_.

The contests themselves (elections / power-plays / the finale) also roll outcomes you can swing by spending resources on boosts beforehand — so even a strong position isn't a guaranteed win.

---

## File map

```
velmora/
├── index.html        # the entire game — markup, cartoon CSS design system, and JS engine (one IIFE)
├── manifest.json     # PWA metadata (name, theme, icons, standalone/portrait)
├── sw.js             # service worker: precache app shell, runtime-cache fonts, offline fallback
├── icons/
│   ├── icon-192.png
│   ├── icon-512.png
│   ├── icon-512-maskable.png   # 12% safe-zone padding for Android adaptive icons
│   └── favicon-64.png
└── README.md
```

Everything game-related lives in `index.html`. The fonts (Bungee / Fredoka / Space Mono) load from Google Fonts with system fallbacks, and are runtime-cached by the service worker so they survive offline after the first online visit.

---

## Adding your own content

The game's depth scales directly with the size of the event bank, and adding events is the intended way to grow it. Events are plain objects pushed into the `EVENTS` array in `index.html` (search for `EVENTS.push(`). Add a new object to any `EVENTS.push(...)` block.

### Event schema

```
{
  id,                       // unique string
  paths,                    // ["ballot"], ["vanguard"], or both
  phases,                   // subset of [1,2,3] — which offices this can appear in
  weight,                   // relative draw frequency (default 10)
  recurring,                // true = repeatable within a phase (default false)
  queueOnly,                // true = never drawn randomly; only fires via a `then` queue
  crisis,                   // true = held out of the normal pool, injected on instability
  req(S),                   // optional gate: (state) => boolean
  art,                      // "newspaper" | "bulletin" | "crisis" | "rival" | "scene"
  emoji, kicker, title,     // presentation
  body,                     // string OR (S) => string   (see interpolation rule below)
  speaker,                  // optional (S) => ({name, role, avatar})
  choices: [
    {
      label,                // button text
      hint,                 // optional preview chip
      fx,                   // stat deltas, e.g. {support:8, heat:-4}
      req(S), reqText,      // optional gate + the "locked" explanation shown to the player
      set,                  // flags to set, e.g. {went_negative:true}
      inc,                  // integer flag counters to add, e.g. {purge_count:1}
      roll,                 // {stat, dc, success:{...}, fail:{...}} for dice outcomes
      result,               // the outcome text shown after choosing
      then,                 // [{id, inTurns}] — queue a delayed follow-up event
      ending,               // a cause string to end the game immediately
      tone                  // "good" | "slick" | "bold" (purely cosmetic accent)
    }
  ]
}
```

Stats use internal keys `support, funds, influence, media, base, heat` (each clamped 0–100). `heat` is the "bad" stat — high heat is dangerous, and the UI renders rising heat as a negative. Per-path display names are applied automatically (e.g. `support` shows as "Approval" on the ballot path, "Legitimacy" on the vanguard path).

### The one interpolation rule that matters

When a `body` (or `result`) is a **plain backtick string**, it must contain **no `${...}`** — there's no game state in scope at definition time. Only **function bodies**, written `body:(S)=>\`…\``, may interpolate state, because `S` is passed in at runtime:

```js
// ✅ static text — no interpolation
body: `A reporter is asking uncomfortable questions about the harbor deal.`;

// ✅ dynamic text — S is in scope
body: (S) => `Comrade ${S.opp} corners you after the meeting. "Are you loyal — to me?"`;
```

Mixing these up (putting `${...}` in a plain string) is the single most common authoring mistake. Add an event, then reload over HTTP and play into its phase to see it.

---

## PWA / verification notes

This build was validated headlessly before delivery:

- **JS syntax** — clean (`node --check`).
- **Full play-through, both paths** — driven start-to-finish in headless Chromium over HTTP. Both reached terminal endings (a mid-game election loss on one run, a full three-phase finale on the other) with **zero uncaught exceptions and zero console errors**.
- **Rendering** — title, path select, character creation (with live cartoon avatar), and the in-game HUD (avatar + all six stat gauges) all render.
- **Service worker** — registers and takes control over HTTP; `manifest.json` serves `200`.
- **Offline** — with the network cut, a reload served the app shell from cache (`200`) and a fresh game started successfully offline.

What still benefits from a quick human pass: subjective game balance/difficulty tuning, and running Lighthouse in Chrome DevTools for the installability score on your actual domain.

---

## Reuse angle

The interesting reusable primitive here isn't the political theme — it's the **deterministic-feeling-but-stochastic scenario engine**: weighted event banks with phase gates, flag-driven state, dice-rolled branches, instability-scaled crisis injection, and flag-weighted terminal scoring, all client-side and offline. That same engine maps cleanly onto training simulations, compliance-scenario drills, onboarding decision-trees, or any "make a sequence of consequential choices and see where they land you" product surface. The event schema above is the authoring layer; swap the content bank and the theming and the machine carries over.
