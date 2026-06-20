# VELMORA — Progress Ledger

> **Source of truth for continuity.** Re-read this at the start of every session before doing anything. Update it at the end of every session. See `ROADMAP.md` for the full phase plan.

**Last updated:** 2026-06-19
**Current phase:** Phase 3 — Content Volume (in progress; bank at **76** events, ~49 eligible per path, toward the 250+ target)
**Current branch:** `phase-1-foundation` → **PR #1** (pushed; CI green through the engine extraction; re-running on pack 2)
**Baseline tag:** `v0-prototype` (the verified pre-migration prototype)
**Build/run:** `npm install` → `npm run dev` (HMR) · `npm run build` + `npm run preview` (serves `dist/` at :4173)

---

## Status at a glance

- [x] Phase 0 — Audit & Architecture (plan approved)
- [x] Phase 1 — Foundation & Tooling — acceptance criteria met
- [x] Phase 2 — Content Engine Depth — **complete** (arcs on both paths, NPC roster + antagonist, scandals-with-memory, difficulty/modifiers/daily)
- [~] Phase 3 — Content Volume — **in progress** (event-pack structure + pack 1; event bank ~50, target 250+)
- [ ] Phases 4–12 — not started

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
- [x] **Scandals-with-memory** — `engine/scandals.ts` + `content/scandals.ts`; latent scandals resurface as a reckoning event (bury again / confess / deny on a roll); the Harbor cover-up plants one; schema/linter + units + E2E
- [x] **Difficulty modes + per-run modifiers + scenario-of-the-day** — `content/setup.ts` + `engine/setup.ts`; 3 difficulty modes feed start stats / contest / crisis / scandal frequency; 1 seeded modifier per run; create-screen difficulty chips + a "Scenario of the Day" title button (UTC daily seed)
- [x] **Vanguard-path arc** — "The Patron's Shadow" (patronage → compromise → purge), parity with the ballot Harbor arc
- [x] **Phase 2 verification** — schema/linter cover all new content types; arc E2E on **both** paths; all gates green (51 unit/content + 10 E2E)

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

- **AD-8 — Scandals with memory:** choices plant latent `Scandal` records (`S.scandals`); `nextEvent` injects a "The Past Resurfaces" reckoning when one is due (chance scales with severity/heat/phase). Resolving sets status (buried/resolved/exposed) so each resurfaces at most once. Engine-injected events (`ENGINE_INJECTED_EVENT_IDS`) are exempt from the unreachable-`queueOnly` lint.

- **AD-9 — Run setup:** `S.difficulty` (Storyteller/Standard/Ironclad) scales starting stats (`applyDifficultyStart`), contest opponent strength (`oppBonus`), and crisis/scandal frequency (`crisisMult`/`scandalMult`, via a `curDifficulty()` helper). One per-run modifier is rolled from the seed (`rollModifiers`) and applied at start (`applyModifier`). "Scenario of the Day" sets `DRAFT.seed = dailySeed()` so a given date plays the same run for everyone.

- **AD-10 — Engine decomposition + sweep:** the draw engine is extracted to a pure `engine/draw.ts` (`chooseNext`) shared by `main.js` and a headless `engine/sim.ts`; `content/all-events.ts` is the single draw pool. A deterministic `sweep.test.ts` runs 50 sims/path gating repeat-rate (< 0.2), event variety (≥ 18 distinct), and ending spread (≥ 3). **Update (Session 2): the extraction is now complete** — `engine/mutate.ts` (mutation helpers + dice roll), `engine/resolve.ts` (`applyChoice`), `engine/turn.ts` (`deathCause` + `advanceTurnState`), `engine/contest.ts` (promo player/opponent strength + win chance), and `engine/state.ts` (`blankRun` factory) are all shared by the live engine and the simulator. Neither `main.js` nor `sim.ts` duplicates any gameplay logic; only caller-specific concerns stay local (main: avatars, rivals, toast, theme, rendering, interactive promotion; sim: headless control loop + choice policy). The `main.js` lint/typecheck ignores remain only because of its DOM/render layer, not engine logic.

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
- Phase 2 cont.: **scandals-with-memory** (`c60c333`) — latent scandals resurface as a reckoning event; engine + content + schema/linter. 43 unit/content + 7 E2E green.
- Phase 2 cont.: **difficulty modes + per-run modifiers + scenario-of-the-day** (`502111f`) — `content/setup.ts` + `engine/setup.ts`; create-screen difficulty chips, seeded modifiers, daily title button. 50 unit/content + 9 E2E green.
- Phase 2 done: **vanguard "Patron's Shadow" arc** (`a39e4e2`) for path parity. **Phase 2 complete** — acceptance met (arcs initiate/resolve across phases in E2E on both paths; content linter green; all new types in the schema). 51 unit/content + 10 E2E green.

### Session 2 — 2026-06-19

- Pushed `phase-1-foundation` and opened **PR #1** (richter83-star/velmora); CI (verify · e2e · lighthouse) **green** on the foundation commit; GitGuardian clean.
- Phase 3 kicked off (`5025dea`): scalable **event-pack** structure + **content pack 1** (+12 events; bank ~50); **all-14-endings reachability gate**; arc E2E made robust to content growth (multi-seed via the `?seed=` URL hook, asserting the arc advances in at least one run). 52 unit/content + 10 E2E green.
- Engine decomposition + sweep (`cf450a4`): extracted the pure draw engine (`engine/draw.ts`, shared via `chooseNext`), single-sourced the pool (`content/all-events.ts`), built a headless simulator (`engine/sim.ts`) + a seeded sweep gate (50 runs/path: repeat-rate < 0.2, ≥18 distinct events, ≥3 endings). 62 unit/content + 10 E2E green.
- **Engine extraction finished** (`177cba4` → `14f9a1b` → `5c9f812`): unified the live engine and the simulator onto shared pure modules — `mutate` (helpers + roll), `resolve` (`applyChoice`), `turn` (`deathCause`/`advanceTurnState`), `contest` (promo strength/opponent/odds), and `state` (`blankRun`). `main.js`'s `resolveChoice`/`advanceTurn`/promotion + `sim.ts` now call the same code; orphaned imports cleaned; +9 turn/contest unit tests. 71 unit/content + 10 E2E green; the seed sweep is byte-for-byte unchanged (sim behavior preserved through the refactor).
- **Content pack 2** (`7d396c5`): +22 events (`events-pack-2.ts`) across ballot/vanguard/shared/crisis + all phases, with rolls, scandals, antagonist relationship shifts, and two delayed `then`-chains. Bank **54 → 76** (~49 eligible/path). Sweep: repeat-rate **0.013/0.022** (gate < 0.2), 49 distinct events/path, 6–8 endings. Also hardened the recurring-antagonist E2E to be content-growth-robust (multi-seed via `?seed=` + a fast `playToPhaseOrEnding` helper, replacing a brittle pinned seed). 71 unit/content + 10 E2E green.
- **Phase 3 cadence (continues):** keep adding validated event packs toward 250+, watching the sweep's variety/repeat-rate metrics; expand endings + epilogues; add the headline-ticker flavor.

## Next steps (concrete)

1. **Phase 3 — Content Volume:** scale the event bank toward **250+** validated events across paths/phases/crises/arcs; more endings + epilogue slides; flavor systems (headline ticker). Hold the fictional/non-partisan invariant. Targets: 100% schema-valid, cross-run repeat-rate below threshold over 50 seeded runs/path, every ending reachable in a seed sweep.
2. Build the **ending-reachability seed sweep** (AD-4) and consider lifting endings to data as volume grows.
3. **Engine logic extraction is complete.** What remains for retiring the `src/main.js` lint/typecheck ignores is the **UI layer** (rendering, drawer, avatar generator → `ui/`) — optional, lower priority than content volume.
4. At a checkpoint: push `phase-1-foundation` and open a PR so CI runs (verify · e2e · lighthouse).
