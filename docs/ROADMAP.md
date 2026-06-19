# VELMORA — Roadmap

The plan to take VELMORA from a verified prototype to a shippable, commercial-quality indie PWA, in incremental, independently verifiable phases. Each phase must leave the game **shippable**: both paths (ballot / vanguard) playable start→finish with zero runtime/console errors, all quality gates green, offline + installable preserved.

## Vision

A cartoon political-strategy PWA with the depth, polish, accessibility, and meta-progression of a commercial indie game — while keeping its identity (cartoon visual language, the ballot/vanguard two-theme reskin, the fictional nation of Velmora) and its self-contained, offline-first, no-backend nature.

## Invariants (must hold after every phase)

1. Fully playable start→finish on **both** paths, no runtime/console errors (proven by E2E).
2. PWA stays **installable and offline-capable**.
3. `localStorage` stays wrapped in try/catch with the **in-memory fallback** (sandboxed-storage safe).
4. Cartoon visual identity + two-theme reskin preserved.
5. Content stays **fictional and non-partisan** (satire of power in the abstract; never real people/parties/conflicts; never endorses real ideologies/violence/hatred).
6. Deployable to **Vercel** and the **Traefik/nginx** setup (now serving `dist/`).

## Global quality bars (applied throughout)

- Zero runtime/console errors across **≥50 seeded** automated playthroughs **per path**.
- Lighthouse Performance / Accessibility / Best-Practices / SEO / PWA all **≥90** on the production build.
- **WCAG 2.1 AA**: axe clean on key screens; fully **keyboard-only** playable.
- Engine **unit coverage ≥80%**; content **100% schema-valid**; **all endings reachable** in the seed sweep.
- **60fps** interactions; bundle within budget; offline + installable preserved.
- Content **count target met**; cross-run **repeat-rate below threshold**.

## Phases

| # | Phase | Crux acceptance criterion |
|---|-------|---------------------------|
| 0 | Audit & Architecture | ✅ Plan approved (Vite+TS+Zod content+vite-plugin-pwa; seeded RNG; module layout). |
| 1 | **Foundation & Tooling** | Behavior-preserving migration; seeded RNG; Zod content + content linter; ESLint/Prettier; Vitest+Playwright (smoke+offline); CI (lint·typecheck·unit·e2e·build·content-validate·Lighthouse). Identical gameplay; all gates green. |
| 2 | Content Engine Depth | Multi-event arcs, persistent NPC roster + loyalty, recurring antagonist, scandals-with-memory, per-run modifiers, difficulty modes, scenario-of-the-day. Arcs initiate/resolve across phases in E2E. |
| 3 | Content Volume | 250+ validated events; more endings + epilogue slides; flavor systems. 100% schema-valid; repeat-rate < threshold; every ending reachable in seed sweep. |
| 4 | Systems Depth | Faction/bloc meters, ideology axes + coalition math, treasury, cabinet/advisors w/ loyalty, perk synergies, crisis sub-decisions, term limits/decay. No soft-locks; documented; unit-tested. |
| 5 | UX, Onboarding & Accessibility | Tutorial, settings, main menu, codex, run-summary, responsive, **WCAG 2.1 AA**. axe clean; Lighthouse a11y ≥90; keyboard-only E2E passes. |
| 6 | Audio & Juice | Web Audio (synth-first), per-theme ambient, cues; respects reduced-motion + settings; haptics. Toggles persist; no perf regression. |
| 7 | Art Expansion | More avatar parts + cosmetics, backgrounds, motifs, animated emblem, full icon set, OG/social cards. Cohesion held; within budget. |
| 8 | Meta-Progression & Persistence | Save slots + autosave, migration-safe versioning, run history/stats, achievements, unlockables, New Game+. Saves persist & migrate; tested. |
| 9 | Performance | Code-split/lazy-load content, tree-shake, bundle budget, Lighthouse perf ≥90, 60fps, memory hygiene. Budgets enforced in CI. |
| 10 | Testing & QA Hardening | Engine coverage ≥80%, large seeded E2E sweep, optional visual-regression, opt-in error reporting (flagged). CI green incl. sweep. |
| 11 | Business, Distribution & Legal | Monetization behind flags (no pay-to-win), opt-in EU-consent analytics, legal docs, i18n externalization, store packaging (TWA/MS Store/itch), SEO+OG. |
| 12 | Launch Readiness | Lighthouse all ≥90 on prod, full regression, changelog + semver, release build, deploy Vercel + Traefik, launch checklist. |

## Sequencing rule

One phase at a time. Never start a new phase until the current one meets its acceptance criteria with all gates green and a full human-style playthrough works on both paths. Each completed phase is summarized PR-style in `PROGRESS.md`.
