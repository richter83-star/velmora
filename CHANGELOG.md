# Changelog

All notable changes to VELMORA. This project follows [Semantic Versioning](https://semver.org).

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

[1.0.0]: https://github.com/richter83-star/velmora/releases/tag/v1.0.0
