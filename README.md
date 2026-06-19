# Velmora — Rise to Power

A cartoon political-strategy game that runs entirely in the browser as an installable, offline-capable PWA. Start as a nobody and climb to head of state down one of two very different roads — win elections in **The Republic of Velmora**, or claw up the one-party machine of **The People's Union of Velmora**. The choices are the game: every decision shifts six stats, sets hidden flags, and bends toward one of a dozen branching endings.

Built with **Vite + TypeScript**; ships as a self-contained, offline-capable, installable PWA. No backend.

---

## Quick start (local)

Requires **Node 20+**.

```bash
npm install
npm run dev      # Vite dev server with HMR
```

For a production build and a local preview over HTTP (needed for the service worker + install prompt):

```bash
npm run build    # outputs to dist/
npm run preview  # serves dist/ at http://localhost:4173
```

On Chrome/Edge desktop you'll see an install icon in the address bar; on mobile, "Add to Home Screen." Opening the built `index.html` as a `file://` page renders the game but disables offline/install — service workers need `http(s)://`.

### Scripts

| Script                     | Purpose                        |
| -------------------------- | ------------------------------ |
| `npm run dev`              | Vite dev server                |
| `npm run build`            | Production build to `dist/`    |
| `npm run preview`          | Serve the production build     |
| `npm run lint`             | ESLint                         |
| `npm run typecheck`        | `tsc --noEmit`                 |
| `npm test`                 | Vitest unit + content tests    |
| `npm run content:validate` | Content schema + linter gate   |
| `npm run test:e2e`         | Playwright smoke + offline E2E |

---

## Deploy

A static build, so any static host works — deploy the **`dist/`** folder.

### Vercel (simplest)

```bash
vercel          # preview deploy
vercel --prod   # production
```

`vercel.json` sets the build command (`npm run build`) and output directory (`dist`); Vercel installs, builds, and serves `dist/` at the domain root. Custom domain via the Vercel dashboard.

### Contabo VPS behind Traefik

Build the site (`npm run build`), then serve the `dist/` output from a tiny static container and let Traefik route to it. Drop the `velmora/` folder (containing `dist/`) next to a compose file:

```yaml
services:
  velmora:
    image: nginx:alpine
    restart: unless-stopped
    volumes:
      - ./velmora/dist:/usr/share/nginx/html:ro # serve the built output
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

> **Cache-busting is automatic now.** `vite-plugin-pwa` precaches content-hashed assets and revisions the service worker on every build, so returning visitors pick up new builds without any manual version bump — just rebuild and redeploy.

---

## Why it's never the same game

Replayability comes from **systems, not a branching script**. Every run re-rolls the world and draws from weighted pools, so two playthroughs on the same path diverge fast:

- **Seeded, reproducible runs** — all randomness flows through one seeded PRNG. A run carries its seed (and generator state) in the save, so a given seed reproduces a run exactly — handy for shareable seeds, a daily scenario, and deterministic tests.
- **Randomized world-state** — economy (boom → crisis), public mood, and geopolitical tension are re-rolled at the start of each phase and color which events fire and how hard.
- **Generated rival roster** — your opponent for each office is drawn from a per-path name pool with randomized strength, then carried into events as a named character (with their own generated cartoon avatar).
- **Weighted random event draws** — events have weights and phase/path gates; a per-phase `seen[]` list prevents repeats, so the bank doesn't recycle until it's genuinely drained.
- **Instability-scaled crisis injection** — recessions, scandals, wars, assassinations, pandemics and coups are held out of the normal pool and injected on a probability that climbs with tension, a bad economy, high heat, and the final phase.
- **Dice-rolled risky choices** — "roll" choices resolve against a stat with a win chance derived from how far above/below the difficulty you are, branching into success/fail outcomes (and sometimes queuing delayed follow-up events).
- **Flag-branched endings** — choices set hidden flags (`bloody_hands`, `secret_reformer`, `own_cult`, `corrupt_streak`, a `purge_count` counter, and many more). The finale weighs those flags plus a composite score to award one of ~12 endings, from _The Reformer_ to _The Tyrant_ to a forgettable _Footnote_.

The contests themselves (elections / power-plays / the finale) also roll outcomes you can swing by spending resources on boosts beforehand — so even a strong position isn't a guaranteed win.

---

## Project layout

```
velmora/
├── index.html            # Vite entry (markup; design system + engine loaded as modules)
├── src/
│   ├── main.js           # engine + UI (being decomposed into typed modules)
│   ├── styles.css        # cartoon CSS design system (tokens + ballot/vanguard themes)
│   ├── sw.js             # service worker (injectManifest: precache + fonts + offline fallback)
│   ├── engine/           # rng.ts (seeded PRNG), types.ts (type model)
│   └── content/          # events/paths/traits/world/names (data) + schema.ts + lint.ts
├── public/               # manifest.json, icons/ (copied to dist as-is)
├── tests/
│   ├── unit/             # Vitest — RNG determinism, engine logic
│   ├── content/          # content validation gate
│   └── e2e/              # Playwright — smoke (both paths) + offline
├── docs/                 # ROADMAP.md, PROGRESS.md (living ledger)
└── vite/ts/eslint/vitest/playwright configs
```

The fonts (Bungee / Fredoka / Space Mono) load from Google Fonts with system fallbacks, runtime-cached by the service worker so they survive offline after the first online visit.

---

## Adding your own content

The game's depth scales with the size of the event bank. Events are plain objects in **`src/content/events.ts`** (`EVENTS.push({ … })`). Add one, then run `npm run content:validate` — a Zod schema + linter catch duplicate ids, unresolved `then` references, invalid stat keys, `${...}` in plain strings, unreachable events, and unknown ending causes before you ever load the game.

### Event schema

```text
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
  speaker,                  // optional (S) => ({ name, role, avatar })
  choices: [
    {
      label,                // button text
      hint,                 // optional preview chip
      fx,                   // stat deltas, e.g. { support: 8, heat: -4 }
      req(S), reqText,      // optional gate + the "locked" explanation shown to the player
      set,                  // flags to set, e.g. { went_negative: true }
      inc,                  // integer flag counters to add, e.g. { purge_count: 1 }
      roll,                 // { stat, dc, success: {...}, fail: {...} } for dice outcomes
      result,               // the outcome text shown after choosing
      then,                 // [{ id, inTurns }] — queue a delayed follow-up event
      ending,               // a cause string to end the game immediately
      tone                  // "good" | "slick" | "bold" (purely cosmetic accent)
    }
  ]
}
```

Stats use internal keys `support, funds, influence, media, base, heat` (each clamped 0–100). `heat` is the "bad" stat — high heat is dangerous, and the UI renders rising heat as a negative. Per-path display names are applied automatically (e.g. `support` shows as "Approval" on the ballot path, "Legitimacy" on the vanguard path).

### The one interpolation rule that matters

When a `body` (or `result`) is a **plain backtick string**, it must contain **no `${...}`** — there's no game state in scope at definition time. Only **function bodies**, written `body:(S)=>\`…\``, may interpolate state, because `S` is passed in at runtime. The content linter fails the build if you get this wrong.

---

## Quality gates

Every change is gated by an automated suite — run locally, or in CI via `.github/workflows/ci.yml`:

- **Unit** (Vitest) — seeded-RNG determinism and engine logic.
- **Content** — Zod schema + linter over the event bank (`npm run content:validate`).
- **E2E** (Playwright) — plays **both** paths start-to-finish asserting zero console/runtime errors, and verifies the PWA installs and runs **fully offline** (network cut, reload serves the shell, a fresh game starts).
- **Build + Lighthouse CI** — production build with budgets (warn-only for now; tightened toward ≥90 in later phases).

See `docs/ROADMAP.md` for the full phase plan and `docs/PROGRESS.md` for current status.

---

## Reuse angle

The interesting reusable primitive here isn't the political theme — it's the **deterministic-feeling-but-stochastic scenario engine**: weighted event banks with phase gates, flag-driven state, dice-rolled branches, instability-scaled crisis injection, and flag-weighted terminal scoring, all client-side and offline. That same engine maps cleanly onto training simulations, compliance-scenario drills, onboarding decision-trees, or any "make a sequence of consequential choices and see where they land you" product surface. The event schema above is the authoring layer; swap the content bank and the theming and the machine carries over.
