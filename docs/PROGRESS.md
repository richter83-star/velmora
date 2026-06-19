# VELMORA — Progress Ledger

> **Source of truth for continuity.** Re-read this at the start of every session before doing anything. Update it at the end of every session. See `ROADMAP.md` for the full phase plan.

**Last updated:** 2026-06-18
**Current phase:** Phase 1 — Foundation & Tooling
**Current branch:** `phase-1-foundation`
**Baseline tag:** `v0-prototype` (the verified pre-migration prototype)
**Build/run:** _(toolchain being scaffolded — see Next Steps)_

---

## Status at a glance

- [x] Phase 0 — Audit & Architecture (plan approved)
- [ ] Phase 1 — Foundation & Tooling ← **in progress**
- [ ] Phases 2–12 — not started

### Phase 1 checklist

- [x] git init + baseline commit + `v0-prototype` tag + `phase-1-foundation` branch
- [x] In-repo living ledger (`docs/ROADMAP.md`, `docs/PROGRESS.md`)
- [ ] Vite + TS scaffold; CSS/script ported verbatim (toolchain green, behavior identical)
- [ ] Seeded RNG at the `rng()` seam
- [ ] Decompose into `engine/` `content/` `ui/` modules + Zod schemas + `content:validate`
- [ ] Vitest unit tests + Playwright smoke/offline E2E
- [ ] `vite-plugin-pwa` (injectManifest) preserving the custom service worker
- [ ] CI workflow + deploy docs (README, nginx compose, `vercel.json`)
- [ ] Phase 1 verification (all gates green; invariants 1–6) + final commit

---

## Architecture decisions (ADR-lite)

- **AD-1 — Toolchain:** Vite + TypeScript (strict) + ES modules + content-as-data validated by Zod; PWA via `vite-plugin-pwa`. Rationale: testability, content volume + safety, authoring ergonomics, performance — unachievable inside one IIFE. Trade-off: a build step; deploy now serves `dist/` (Vercel build config + nginx compose volume updated).
- **AD-2 — Service worker:** `vite-plugin-pwa` in **injectManifest** mode, wrapping the existing hand-written `sw.js` strategy (precache + cache-first font runtime cache + offline navigation fallback) so proven offline behavior is preserved while gaining hashed-asset precache + automatic cache-busting (retires manual `SHELL_VERSION` bumps).
- **AD-3 — Seeded RNG:** Replace the single `rng()` seam (`index.html:415`) with `mulberry32` (seeded via `xmur3`). Run carries its `seed` in `S` → shareable seeds + reproducible saves; scenario-of-the-day derives seed from UTC date. "Identical gameplay" = identical rules/distributions (the prototype's `Math.random` was nondeterministic anyway), validated by unit tests + seeded E2E.
- **AD-4 — Endings reachability:** endings are computed inline in `evaluateEnding()`. Tag each branch with an `endingId`; assert all reachable in the seed sweep. (May lift to a data table in Phase 3.)
- **AD-5 — Line endings:** add `.gitattributes` (`* text=auto eol=lf`, binary for images) to keep Linux CI clean on this Windows checkout.

## Open questions / flagged decisions

- **Fonts:** keep Google Fonts CDN through Phase 8; self-host + subset in Phase 9/11 (perf + EU consent).
- **`CLAUDE-FABLE-5.md`:** gitignored, left on disk (not part of the game).
- **Monetization (Phase 11):** concrete path TBD closer to that phase; architected behind flags regardless.

## Debug ledger

_(empty — record non-obvious bugs + root causes here as they arise)_

---

## Session log

### Session 1 — 2026-06-18

- Phase 0: audited the prototype directly (single-file, low-risk migration). Key seams identified: single `rng()`, single serializable `S`, `EVENTS.push` content blocks, tokenized themes, existing localStorage fallback.
- Wrote + got approval on the Phase 0 plan (`~/.claude/plans/wild-churning-lagoon.md`).
- Phase 1 begun: git baseline + tag + branch; created this ledger.

## Next steps (concrete)

1. Scaffold Vite + TS (+ `.gitattributes`, ESLint, Prettier, tsconfig strict); move CSS→`src/styles.css`, IIFE→`src/` entry; prove `npm run build` reproduces the game; commit.
2. Seeded RNG module + unit test; wire into the engine.
3. Decompose into typed modules; add Zod schemas + `content:validate`.
4. Tests (Vitest + Playwright smoke/offline), then PWA plugin, then CI + deploy docs.
5. Verify all gates + invariants; update this ledger; report PR-style summary before Phase 2.
