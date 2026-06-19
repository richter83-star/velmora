# VELMORA — Progress Ledger

> **Source of truth for continuity.** Re-read this at the start of every session before doing anything. Update it at the end of every session. See `ROADMAP.md` for the full phase plan.

**Last updated:** 2026-06-18
**Current phase:** Phase 2 — Content Engine Depth (in progress)
**Current branch:** `phase-1-foundation` (Phase 1 + early Phase 2 commits; not pushed — split at PR time)
**Baseline tag:** `v0-prototype` (the verified pre-migration prototype)
**Build/run:** `npm install` → `npm run dev` (HMR) · `npm run build` + `npm run preview` (serves `dist/` at :4173)

---

## Status at a glance

- [x] Phase 0 — Audit & Architecture (plan approved)
- [x] Phase 1 — Foundation & Tooling — acceptance criteria met
- [~] Phase 2 — Content Engine Depth — **in progress** (engine split #1 + story arcs done)
- [ ] Phases 3–12 — not started

### Phase 1 checklist

- [x] git init + baseline commit + `v0-prototype` tag + `phase-1-foundation` branch
- [x] In-repo living ledger (`docs/ROADMAP.md`, `docs/PROGRESS.md`)
- [x] Vite + TS scaffold; CSS/script ported verbatim (toolchain green, behavior identical)
- [x] Seeded RNG at the `rng()` seam (+ 11 determinism unit tests)
- [x] Content extracted to typed modules + Zod schema + `content:validate` (the 6 checks)
- [x] Vitest unit tests + Playwright smoke (both paths) + offline E2E
- [x] `vite-plugin-pwa` (injectManifest) preserving the custom service worker
- [x] CI workflow + deploy docs (README, nginx compose → `dist/`, `vercel.json`)
- [x] Phase 1 verification — all gates green
- [~] Engine decomposition — **proceeding incrementally in Phase 2** (endings extracted); remaining `engine/`+`ui/` split continues opportunistically as systems are added.

### Phase 2 checklist (Content Engine Depth — in progress)

- [x] Engine split #1: endings → `src/engine/endings.ts` (14 branches `endingId`-tagged; AD-4) + 8 unit tests
- [x] **Story arc system** — `engine/arcs.ts` + `content/arcs.ts`; cross-phase `S.arcs` state; the 3-stage _Harbor Deal_ (ballot) arc; schema/linter extended for arcs; arc unit tests + E2E (initiates → resolves to terminal stage 99 across phases)
- [x] **Persistent NPC roster + recurring antagonist** — `engine/npcs.ts` + `content/npcs.ts`/`npc-events.ts`; `S.npcs` roster with relationship/loyalty; the antagonist is created once and is the recurring opponent every phase; `npcFx` on choices; schema/linter + units + E2E (persists across phases)
- [ ] Scandals-with-memory + per-run modifiers + difficulty modes + scenario-of-the-day entry
- [ ] Phase 2 verification (NPC/arc schema+linter, all gates) + PROGRESS update
- [ ] (Parity) a vanguard-path arc to match the ballot Harbor arc

---

## Phase 1 summary (PR-style)

**What changed.** Re-platformed the single-file prototype onto **Vite + TypeScript (strict)** with a content-as-data layer, an automated test suite, and CI — without changing gameplay.

- **Toolchain:** Vite 8 + TS 6, ESLint (flat) + Prettier, `.gitattributes` (LF). `index.html` is the Vite entry; the engine moved to `src/main.js`, the design system to `src/styles.css`.
- **Seeded RNG:** `src/engine/rng.ts` (mulberry32 + xmur3, serializable state) replaces the single `rng()` seam; seed + generator state persist in the save (reproducible runs / shareable seeds). `beginCareer` reads `?seed=` / `window.__VELMORA_SEED`.
- **Content as data:** `src/content/{events,paths,traits,world,names}.ts` + `src/engine/types.ts`. `src/content/schema.ts` (Zod) + `src/content/lint.ts` enforce the 6 checks (dup ids, unresolved `then`, invalid fx/roll stat keys, unreachable `queueOnly`, `${}` in plain strings, unknown ending causes). The prototype bank passes clean.
- **PWA:** `vite-plugin-pwa` injectManifest injects the hashed-asset precache into the hand-written `src/sw.js` (kept font cache + offline nav fallback; manual `SHELL_VERSION` retired).
- **Tests:** Vitest (RNG + content, 14 tests) and Playwright (smoke both paths → ending, zero console errors; offline: SW install → network cut → reload serves shell → fresh game offline). Drives system Chrome via `channel` locally; CI uses bundled chromium.
- **CI/deploy:** `.github/workflows/ci.yml` (verify · e2e · lighthouse), `vercel.json`, `lighthouserc.json` (warn-only budgets), README rewritten for the build-step + `dist/` deploy.

**How verified.** `lint · typecheck · content:validate · test · format:check · build · test:e2e` all green locally. Invariants 1–6 hold (E2E proves 1–2; localStorage fallback + themes + fictional content unchanged; deploy docs updated for 6). CI not yet run (branch unpushed).

**Acceptance vs. brief.** Phase 1 acceptance ("identical gameplay; tools green; content linter passes") is **met**. The full decomposition of `src/main.js` into `engine/`/`ui/` submodules is a maintainability refinement (improves Phase 2+ authoring) and is **deferred** to a focused, E2E-guarded pass — see deferred item above. `main.js` remains a single ES module (eslint/prettier-ignored) for now.

---

## Architecture decisions (ADR-lite)

- **AD-1 — Toolchain:** Vite + TS (strict) + ES modules + content-as-data (Zod); PWA via `vite-plugin-pwa`. Trade-off accepted: a build step; deploy serves `dist/` (Vercel `vercel.json` + nginx volume `./dist`).
- **AD-2 — Service worker:** `vite-plugin-pwa` **injectManifest** wraps the hand-written `src/sw.js`; gains hashed-asset precache + auto cache-busting.
- **AD-3 — Seeded RNG:** mulberry32 (xmur3 seed) behind the existing helper names; seed + state in the save. "Identical gameplay" = identical rules/distributions.
- **AD-4 — Endings reachability:** endings computed in `evaluateEnding()`; reachability is asserted by the (future) seed sweep, and `ending` causes are linted. Lift endings to data in Phase 3.
- **AD-5 — Line endings:** `.gitattributes` (`* text=auto eol=lf`) for clean Linux CI.
- **AD-6 — Story arcs:** arc steps are ordinary events tagged `arc:{id,stage}`, drawable only when `S.arcs[id]===stage`; choices/roll-branches advance via `arcSet:{id,stage}`. `S.arcs` persists across phases (never reset), so arcs span offices. The `ARCS` registry drives validation + the future codex.

- **AD-7 — Recurring antagonist:** the antagonist NPC is created once at career start and reused by `assignOpponent` as the contest opponent every phase (rising with you), so the rival is one continuous nemesis. Old saves fall back to the original per-phase random opponent. Content references it by the stable id `antagonist` (`KNOWN_NPC_IDS`). The antagonist's relationship feeds contest difficulty (`antagonistContestModifier`, ±15 opponent strength) and shows as a disposition on the contest screen, so `npcFx` choices carry mechanical stakes.

## Open questions / flagged decisions

- **Fonts:** keep Google Fonts CDN through Phase 8; self-host + subset in Phase 9/11 (perf + EU consent).
- **`CLAUDE-FABLE-5.md`:** gitignored, left on disk (not part of the game).
- **Monetization (Phase 11):** concrete path TBD; architected behind flags regardless.

## Debug ledger

- **Offline asset cache-miss (fixed).** After the offline reload, hashed JS/CSS failed with `net::ERR_FAILED` despite being precached and the SW controlling the page. Root cause: `caches.match()` honors the stored response's `Vary` header (`vite preview` serves assets with `Vary: Accept-Encoding`), so the lookup missed offline. Fix: `ignoreVary: true` on all `caches.match` calls in `src/sw.js`. (The lone remaining offline `ERR_FAILED` is the non-precached sourcemap — benign, filtered in the test.)

---

## Session log

### Session 1 — 2026-06-18

- Phase 0: audited the prototype directly; wrote + got approval on the plan (`~/.claude/plans/wild-churning-lagoon.md`).
- Phase 1: delivered the full foundation (commits `9d44c9a` → `15fd210` on `phase-1-foundation`): git baseline + tag, docs ledger, Vite/TS scaffold, ESLint/Prettier, seeded RNG + tests, content extraction + Zod + linter, Vitest + Playwright smoke/offline, vite-plugin-pwa, CI + deploy docs. All gates green; behavior preserved.
- Deferred within Phase 1: full `src/main.js` engine/ui decomposition (now proceeding incrementally in Phase 2).
- Phase 2 (same session — user chose to fold the engine split in): extracted endings → `engine/endings.ts` (`881d429`); built the cross-phase **story arc system** + the Harbor Deal arc (`9c3636b`). `src/main.js` now 843 lines.
- Phase 2 cont.: **persistent NPC roster + recurring antagonist** (`d197a7f`) — antagonist carried across phases as the opponent; `npcFx` relationship meters; schema/linter + tests. 34 unit/content + 6 E2E green.
- Phase 2 cont.: **antagonist hostility wired into the contest** (`a48fe32`) — relationship shifts opponent strength ±15; disposition shown on the contest screen. 37 unit/content + 6 E2E green.

## Next steps (concrete)

1. **Phase 2 — NPC roster:** formalize an NPC model (id/name/avatar + relationship/loyalty) in `S`, a recurring antagonist across phases, events that reference/affect NPCs; extend schema + linter.
2. **Phase 2 — scandals-with-memory, per-run modifiers, difficulty modes, scenario-of-the-day** entry (wire `dailySeed`).
3. Add a **vanguard-path arc** for parity with the ballot Harbor arc.
4. Continue the **engine/ui decomposition** opportunistically (next candidates: `draw`/`promotion` logic or the avatar generator → `ui/`).
5. When Phase 2 acceptance is met: update this ledger, then push `phase-1-foundation` and open a PR (CI: verify · e2e · lighthouse) before Phase 3.
