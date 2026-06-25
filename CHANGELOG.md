# Changelog

All notable changes to VELMORA. This project follows [Semantic Versioning](https://semver.org).

## [Unreleased] — 2026-06-25 — The Mature Cartoon Overhaul

VELMORA grows up: the same deterministic, offline, installable 5-path PWA, now a
savage adult-cartoon (South Park / Veep) political satire behind a Mature gate.
Built across phases P2–P7, each leaving the game shippable with every gate green.

### Content & rating

- **Re-rated Mature (17+) / TV-MA.** A first-run, on-device, self-attested age gate
  (focus-trapped, axe-clean, offline, persisted) and updated Terms/disclaimer.
- **Full TV-MA prose sweep:** all **294 event dilemmas**, every ending payoff, the
  Loom generative templates + lexicons, and the ticker headlines rewritten to a
  profane, crude, merciless voice — all fictional, inside hard red lines.
- **Content boundary as an executable gate:** `denylist.ts` re-scoped to
  TV-MA-with-red-lines (profanity passes; explicit porn, sexualizing a real
  person, and mocking a real named religion all fire). The red lines are now
  CI-enforced over *every* prose surface (events, Loom, endings, headlines).
- A **prose-only diff-guard** proved the entire rewrite changed only wording —
  zero changes to ids, effects, flags, rolls, or logic — so saves stay loadable
  and the seeded sweep stays byte-identical.

### Graphics & voice (the stickiness pillars)

- **Drawn cartoon art pipeline:** a pure portrait resolver behind a never-blocking
  legacy-SVG fallback, a reproducible `scripts/process-art.mjs` encoder, and the
  first hand-cleaned portrait (the Iron Provost). Art ships as lazy, SW-cached,
  budget-gated packs — outside the JS budget.
- **Opt-in on-device voice narration** (SpeechSynthesis): deterministic
  per-character voices, always-on captions, best-effort + never-blocking +
  offline. Ships as a 0.8 kB lazy chunk.

### Engineering

- Reclaimed entry-budget headroom by code-splitting the endings bank out of the
  eager chunk (loaded at game-over, SW-precached, offline-safe).
- New asset-delivery rails (per-path `/art/` + `/voice/` SW runtime caches; a
  separate asset budget gate) keep heavy media off the JS budget.

## [1.0.0] — 2026-06-21 — Core game, launch-ready

The first complete, shippable release: a cartoon political-strategy PWA where you
climb from a nobody to head of state down two very different roads — the ballot
box (**The Republic of Velmora**) or the one-party machine (**The People's Union
of Velmora**). Fictional nation, fictional parties, real dilemmas.

### Gameplay & content

- Two full paths, three offices each, with a seeded RNG so runs are reproducible
  and shareable.
- **251 validated events** across both paths, all phases, crises, and multi-event
  story arcs; a recurring antagonist; scandals-with-memory; difficulty modes;
  per-run modifiers; and a daily "Scenario of the Day."
- **Systems depth:** ideology axes, faction/bloc standings with coalition math,
  treasury/economy pressure, a cabinet of advisors with loyalty, trait-perk
  synergies, crisis sub-decisions, and approval decay.
- A dozen branching endings with a personalized "Years Later…" epilogue and an
  ideology/coalition/cabinet scorecard.

### Experience (Phases 5–7, lean)

- **Accessibility (WCAG 2.1 AA):** keyboard-only playable, ARIA live region,
  focus management, skip link, zoom unlocked. Automated **axe** sweep is clean on
  every key screen; real WCAG 1.4.3 contrast issues fixed.
- Settings (reduce-motion, high-contrast, sound, error-reporting), a skippable
  replayable tutorial, an in-game Almanac/codex, and a run summary.
- Opt-in synth sound effects (default off). Broader procedural avatar variety.

### Meta-progression & persistence (Phase 8)

- **Three save slots** with autosave + a picker, plus legacy single-save adoption.
- Cross-run profile: run history, lifetime stats, **13 achievements**, and
  unlockables on a new **Records** screen.
- **New Game+** tiers (deterministic, daily-safe).

### Performance (Phase 9)

- The 251-event bank is **code-split into a lazy, precached chunk**: initial JS
  parse dropped from ~99.8 kB to ~32.6 kB gzip with offline preserved.
- A deterministic CI **bundle-size budget** gate (`npm run size`).

### Quality & business (Phases 10–11)

- Engine unit coverage **gated ≥80%** in CI; a 120-seeds/path headless sweep with
  a no-soft-lock bound; flagged on-device error reporting.
- SEO + Open Graph metadata, `robots.txt`, a free-base/paid-expansion entitlement
  scaffold (no pay-to-win), and privacy/terms drafts.

### Engineering

- Vite + TypeScript (strict), content-as-data with Zod validation + a content
  linter, pure engine modules shared by the live game and a headless simulator.
- PWA via `vite-plugin-pwa` (installable, fully offline). `localStorage` wrapped
  with an in-memory fallback (sandbox-safe).
- CI: lint · typecheck · content-validate · coverage-gated unit · build · bundle
  budget · Playwright E2E (smoke + offline + a11y) · Lighthouse (advisory).

### The Dark Mirrors expansion (five paths total)

- Three new playable roads to power layered onto the same engine — **The Iron
  Order** (strongman), **The Gilded Republic** (plutocracy), and **The Anointed
  Path** (theocracy) — each with its own stat vocabulary, factions, promotion
  mechanic (purge / acquisition / council), advisors, and 12+ seed events.
- **18 bespoke finale endings** (6 per new path) plus per-path failure causes,
  all reachability-proven; the seeded sweep covers all five paths (≥4 ending
  ranks each). Fictional and non-partisan by construction, enforced by a
  content-safety denylist in CI.

### AI replayability stack

- **AI Director** (on-device, default on): a pure, seeded director that reads
  your playstyle each turn and reshapes the run from the existing bank —
  playstyle-targeted selection, tension pacing, and an adaptive nemesis that
  presses where you're weak. Zero generated text; fully offline; reproducible.
- **Story Weaver** (on-device generative grammar, default on): weaves
  state-bound dilemmas from authored skeletons, every realization schema- and
  denylist-validated; an exhaustive build-time gate proves the generated surface
  is safe.
- **Live Storyteller** (opt-in, default off): bring your own Anthropic key and a
  model writes brand-new dilemmas at runtime — every line schema- and
  STRICT-denylist-checked before display, quarantined from the deterministic
  core, with full on-device fallback. Your key stays on your device.

### Launch polish

- Production security headers (CSP, HSTS, X-Content-Type-Options,
  Referrer-Policy, Permissions-Policy, X-Frame-Options) via `vercel.json`.
- Absolute canonical / Open Graph / Twitter metadata with a dedicated 1200×630
  social card, accurate five-path copy, JSON-LD `VideoGame` schema, and a
  sitemap. Reachable in-app Privacy / Terms / Source links.
- Installable PWA manifest hardened (`id`, shortcuts, install screenshots,
  maskable icon).

[1.0.0]: https://github.com/richter83-star/velmora/releases/tag/v1.0.0
