# VELMORA — Progress Ledger

> **Source of truth for continuity.** Re-read this at the start of every session before doing anything. Update it at the end of every session. See `ROADMAP.md` for the full phase plan.

**Last updated:** 2026-06-20
**Current phase:** **Phase 10 COMPLETE** — Testing & QA Hardening (engine coverage gated ≥80% in CI; enlarged seed sweep 120/path + no-soft-lock bound; flagged on-device error reporting). Next: Phase 11 — Business, Distribution & Legal (**decision-gated**: monetization model + store/analytics are product/credential calls). (Phases 5–7 done lean; CI green incl. Lighthouse perf+a11y ≥90 gate + bundle budget; a full UX/UI redesign is scheduled after Phase 12, then the deferred "Dark Mirrors" expansion.)
**Roadmap note (2026-06-20):** Per product direction, sequence is **finish core (Phases 5–12) → massive UX/UI redesign → "Dark Mirrors" expansion** (see `EXPANSION_BRIEF.md`, deferred). Phases 5–7 are deliberately kept lean since the redesign will own final visual polish; the expansion brief targets the pre-migration architecture and needs a retarget pass before it's built.
**Current branch:** `phase-1-foundation` → **PR #1** (all pushed; 98 unit + 12 E2E green)
**Baseline tag:** `v0-prototype` (the verified pre-migration prototype)
**Build/run:** `npm install` → `npm run dev` (HMR) · `npm run build` + `npm run preview` (serves `dist/` at :4173)

---

## Status at a glance

- [x] Phase 0 — Audit & Architecture (plan approved)
- [x] Phase 1 — Foundation & Tooling — acceptance criteria met
- [x] Phase 2 — Content Engine Depth — **complete** (arcs on both paths, NPC roster + antagonist, scandals-with-memory, difficulty/modifiers/daily)
- [x] Phase 3 — Content Volume — **complete** (251 events, ticker, personalized epilogue; all endings reachable in the seed sweep)
- [x] Phase 4 — Systems Depth — **complete** (ideology axes, faction/coalition math, approval decay, trait perks, cabinet/advisors, crisis sub-decisions)
- [x] Phase 5 — UX, Onboarding & Accessibility — **complete** (a11y foundation, codex, settings, tutorial, run-summary, axe-clean, responsive)
- [x] Phase 6 — Audio & Juice — **complete (lean)** (opt-in synth SFX for choices/promotions/endings; Sound setting, default off, persisted)
- [x] Phase 7 — Art Expansion — **complete (lean)** (broadened procedural avatar variety; full art direction deferred to the redesign)
- [x] Phase 8 — Meta-Progression & Persistence — **complete** (save slots, autosave, run history/stats, achievements, unlockables, New Game+; designed + adversarially reviewed via workflows)
- [x] Phase 9 — Performance — **complete** (lazy-loaded event-bank chunk, CI bundle budget, Lighthouse perf+a11y gated ≥90)
- [x] Phase 10 — Testing & QA Hardening — **complete** (engine coverage gated ≥80% in CI; sweep 120/path + no-soft-lock; flagged error reporting)
- [ ] Phases 11–12 — not started (Phase 11 partly **decision-gated**)

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
- **Content packs 4–9 + arc-injection fix** (`5496a7a`…`931bd52`): drove the bank **96 → 251**, meeting the Phase 3 250+ target. Packs span governing dilemmas, media circus, vanguard apparatus, summits, and ~46 crises across both paths and all phases; choices feed the ending flags. Fixed a real design problem surfaced by the growing bank — authored arcs were being diluted toward invisibility, so added an **arc-progression injection** to the shared draw (entry ~0.16/turn, continue 0.35/turn), raising arc entry-surfacing ~41% → ~78% and guaranteeing started arcs reach their reckoning. Final sweep: repeat-rate 0.014/0.007, 146–147 distinct events/path. The content test now asserts the 250+ milestone. 71 unit/content + 10 E2E green throughout.
- **Content pack 3** (`a608887`): +20 events (`events-pack-3.ts`), tilted to early-game depth (phase 1 was thinnest — ballot 34→40, vanguard 30→37 eligible) plus phase-3 capstones and two crises; choices set ending-feeding flags (secret_reformer/bloody_hands/corrupt_streak/cult_building/has_network/purge_count) and add two then-chains (the boss collects; the reform circle exposed). Bank **76 → 96** (crises 13→16). Sweep: repeat-rate 0.027/0.016, 62–63 distinct/path. 71 unit/content + 10 E2E green.
- **Headline ticker** (`28fa3ce`): a fake-news newswire crawl under the HUD — `content/headlines.ts` `pickHeadlines(S)` mixes generic press satire with path/phase-flavored and state-reactive lines (high heat, active scandal, corruption, cult, etc.), rotated by the turn counter and pure (never touches the gameplay RNG). aria-hidden decorative; reduced-motion aware. E2E asserts it renders.
- **Personalized epilogue** (`b653bc0`): `engine/epilogue.ts` `buildEpilogue(S)` closes the ending screen with up to three flag-driven "Years Later…" beats + a rival-parting note + a path-flavored closer, so two runs reaching the same ending read differently. 4 unit tests; smoke asserts beats render on both paths.
- **Phase 3 acceptance — MET:** 251 validated events (100% schema-valid); cross-run repeat-rate 0.014/0.007 over 50 seeded runs/path (gate < 0.2); all 14 endingIds producible (endings unit test); fictional/non-partisan invariant held. **Phase 3 closed.**

### Session 3 — 2026-06-20

- Reviewed `EXPANSION_BRIEF.md` ("The Dark Mirrors" 3-path expansion). Verdict: sound design, but **build it after core + redesign** — it's out of roadmap sequence (core was at Phase 5/12) and, more importantly, it targets the **pre-migration single-file architecture** (`PATHS{}` literal, `openCreate`/`deathCause`/`evaluateEnding`/`renderPromotion`, `ADVISORS{}`, `SHELL_VERSION`) that no longer exists; needs a retarget pass + four gap fixes (emergent-faction wiring for new blocs, ending-cause enum/linter, `own_cult`↔`cult_building` flag reconciliation, sim/sweep wiring) before it's executable.
- Product direction set: **finish core (5–12) → massive UX/UI redesign → expansion.** Phases 5–7 kept lean (redesign owns final visuals), running continuously.
- **Closed Phase 5** with five increments (`aadbd3d` settings · `169fcea` tutorial · `853ef1a` run-summary · `ab858e6` axe+contrast+responsive). Added `@axe-core/playwright`. New E2E: settings, tutorial, axe, responsive (24 E2E total, all green; 98 unit; typecheck/build/lint green). Real WCAG 1.4.3 contrast bugs fixed at token level (kept reversible for the redesign).
- **Closed Phases 6 (lean audio) & 7 (lean art)** (`b6a7ddb`, `ff39265`); pushed Phases 1–7 to PR #1 (CI green). Set ultracode mode.
- **Closed Phase 8 (Meta-Progression & Persistence)** under ultracode: ran a design workflow (Map→Design→Synthesize blueprint) and an adversarial review workflow; implemented in 4 commits (`e72ff1a` meta+history+achievements+Records · `89ccc70` save slots · `503241e` New Game+ · `ac8ca7d` review hardening). 111 unit + 33 E2E green. (Review note: a transient API rate-limit killed 16/18 verifier subagents; those candidate findings were re-verified by hand — all false positives or lean-acceptable; the one confirmed gap was fixed.)
- **Closed Phase 9 (Performance)** under ultracode: ran a measure→plan workflow, then implemented the code-split + CI budget gate + Lighthouse gate (`854cb7f` + lighthouse commit). Initial JS parse 99.8kB→32.6kB gzip; offline intact; 111 unit + 33 E2E green. CI verified green (Lighthouse `NO_FCP` flake from `numberOfRuns:3` fixed by reverting to 1; perf+a11y gate clears ≥0.9).
- **Closed Phase 10 (Testing & QA Hardening)** (`33c9872`): engine coverage gated ≥80% in CI (per-glob thresholds), +12 branch tests, sweep enlarged to 120/path with a no-soft-lock bound, flagged on-device error reporting. 125 unit + 34 E2E green. Phase 11 is partly decision-gated (monetization/store/analytics) — flagged to the user.

## Phase 4 — Systems Depth (complete)

Per the roadmap: faction/bloc meters, ideology axes + coalition math, treasury/economy, cabinet/advisors with loyalty, trait/perk synergies, crisis sub-decisions, term limits/approval decay. Accept: no soft-locks in auto-play; documented; unit-tested where non-trivial.

- **Ideology axes** (`22e42fc`): `engine/ideology.ts` `deriveIdeology(S)` → two axes (Rule Velvet↔Iron, Hands Clean↔Dirty) shown as a **Political Profile** on the ending. 4 unit tests.
- **Faction/bloc standings + coalition math** (`6b8710d`): `engine/factions.ts` — each path's three factions get live 0–100 meters that move EMERGENTLY from the stat deltas + flags the existing 251 events already produce (no per-event authoring). Wired through `resolve.ts` (shift on every choice) and `contest.ts` (`coalitionContestMod` feeds promotion strength — happy coalition lifts, alienated drags). HUD bloc strip + "The Coalition" ending summary. 5 unit tests; smoke asserts HUD blocs + ending coalition.
- **Approval decay / term dynamics** (`eedfbfb`): `advanceTurnState` erodes support while riding high (the cost of incumbency) and faster under scrutiny / a sour economy, with no baseline drain on weak runs. Sweep-verified (avg phase ~1.8–2.0, arcs stay reachable). 2 unit tests.
- **Trait perks** (`0bc0f9e`): `engine/perks.ts` delivers the ongoing synergy each trait advertised (orator/operator/rainmaker easier signature-stat rolls + contest edge; clean sheds scrutiny faster), hooked via `doRoll`/`promoPlayerStrength`/`advanceTurnState`. 3 unit tests.
- **Cabinet / advisors with loyalty** (`72e7cf9`, `8ef5bf0`): `engine/cabinet.ts` — at each promotion you appoint an advisor from a seeded slate (a new "cabinet" UI mode, with a decline option); each grants a passive per-turn stat lift and carries a loyalty meter that drifts with the flags your choices set. A cratered advisor (loyalty ≤ 22) **resigns and leaks** (heat hit + loses their perk), so loyalty matters. HUD loyalty chips, an ending "Your Cabinet" summary, save/resume migration, and headless auto-appointment so the sim exercises it. 7 unit tests; smoke asserts the appointment screen + HUD chip.
- **Crisis sub-decisions** (`c497c25`): a choice can carry a `sub` pointer to an event shown immediately in the same turn (no advance), distinct from delayed `then`-chains. `sub` on Choice/RollOutcome + schema + linter (`sub` refs resolve, queueOnly targets reachable); `resolve.ts` returns it, `main.js` afterResult shows it, `sim.ts` resolves it inline. `content/crisis-subs.ts` ships two crisis chains. 2 unit tests. **Phase 4 closed — all 6 systems shipped.**

## Phase 5 — UX, Onboarding & Accessibility (complete)

Per the roadmap: skippable tutorial, full settings, main menu, codex/almanac, run-summary, responsive layouts, **WCAG 2.1 AA**, annoyance budget. Accept: axe clean on key screens; Lighthouse a11y ≥ 90; keyboard-only E2E passes.

- **Accessibility foundation** (`2341354`): fixed the WCAG 1.4.4 zoom lock (dropped `maximum-scale`/`user-scalable=no`); added a skip-to-game link, a polite ARIA live region, and a `main` landmark; live announcements (new decisions, outcome + stat deltas, promotions, ending); focus moves to the heading on each screen transition with visible `:focus-visible` outlines; choices were already real `<button>`s so play is keyboard-operable. New `a11y.spec.ts` proves keyboard-only play + the live region. (Lighthouse a11y score is gated in CI.)
- **Codex / Almanac** (`e476e8c`): an in-game reference (`#screen-codex`, reached via "📖 The Almanac" on the title) that surfaces the systems — how to rule, the six stats, the four systems, and per-path sections listing each path's factions (from `content/paths`) and advisors (from `engine/cabinet`), plus the starting traits. Built from live data so it never drifts; accessible (heading focus on open, focus returned to trigger on close). New `codex.spec.ts`.
- **Settings panel** (`aadbd3d`): a `#screen-settings` reached from the title with persisted **reduce-motion** and **high-contrast** toggles (role=switch, keyboard-operable) plus a clear-saved-career action. New `velmora_settings_v1` store mirrors the save's localStorage+in-memory fallback; `applySettings()` toggles `body.force-reduce-motion`/`body.high-contrast`, `setTheme()` preserves those classes across theme swaps, and `reduced()` now also honors the setting. New `settings.spec.ts` (apply + persist-across-reload + keyboard).
- **Skippable tutorial** (`169fcea`): a 4-step accessible modal (`#tutorial`, role=dialog/aria-modal, Escape to skip, focus moved in/restored out) shown once on first career (persisted `tutorialSeen`) and replayable from Settings. Test helpers dismiss it so playthroughs aren't blocked. New `tutorial.spec.ts` (first-run + skip + no-reappear + replay).
- **Run-summary** (`853ef1a`): a "By the Numbers" recap on the ending (highest office, years served, decisions, difficulty, scandals, purges), data-driven from `S`. Smoke asserts it renders.
- **axe sweep + contrast fixes** (`ab858e6`): `axe.spec.ts` runs `@axe-core/playwright` (WCAG 2.0/2.1 A/AA) over title, settings, codex, path, create, game, and ending — **zero serious/critical**. Fixed real WCAG 1.4.3 failures surfaced by it: darkened `--accent` (#E63B5B→#CC2D4F; vanguard #E5332A→#C42A1F) so white text clears 4.5:1; pinned the small section heads (`.ideo-head`/`.coal-head`→#2F5BC8, `.rs-head`→#1A7A50) to theme-independent accessible shades (the vanguard `--accent2` is gold, which failed on cream); dark text on green delta/coalition tags; darker `.delta.down` red; dark `.muted` inside light panels. **axe must scan the settled state** — the scan neutralizes the `.screen` entrance fade, else dark text mid-fade reads as low-contrast (false positives).
- **Responsive gate** (`ab858e6`): `responsive.spec.ts` asserts no horizontal overflow at 320/375/768/1024/1440 across the key screens.
- **Main menu:** the title screen serves this role (New · Continue · How to Rule · Almanac · Settings · Scenario of the Day).
- **Phase 5 acceptance — MET:** axe clean on key screens; keyboard-only play (a11y.spec); responsive at standard breakpoints; Lighthouse a11y gated in CI. 24 E2E + 98 unit green. **Phase 5 closed.**
- **Decision-gated later phases (true blockers needing user input):** Phase 11 monetization model (product call), opt-in analytics + store packaging (credentials/services). Phase 6–7 art/audio creative direction is **no longer a near-term blocker** — they're built lean with functional defaults (synth audio, procedural art) because the post-Phase-12 redesign owns the real creative direction.

## Phase 6 — Audio & Juice (complete, lean)

- **Opt-in synth SFX** (`b6a7ddb`): a tiny Web Audio module in `main.js` (`actx()` lazy `AudioContext`, `blip()`, `sfx(name)`) plays short oscillator cues — `click` on every choice, `promote`/`fail` on the promotion result, `win`/`lose` on the ending. Gated behind a new **Sound** setting (`SETTINGS.sound`, default **off**, persisted in `velmora_settings_v1`); the context is created lazily on first use and `resume()`d (autoplay-policy safe). New `audio.spec.ts` (toggle persists across reload; sound-on playthrough raises no console errors). Default-off means every other E2E is unaffected. Ambient pads / haptics intentionally deferred to the post-Phase-12 redesign.

## Phase 7 — Art Expansion (complete, lean)

- **Avatar variety** (`ff39265`): broadened the parametric avatar generator — two new accessories (beard rendered behind the mouth so expressions still read; earring) and two hair colors — via the existing `randAvatar`/`buildAvatar` system. The generator is durable (survives a reskin); full art direction (backgrounds, cosmetics, animated emblem, icon set) is deferred to the redesign. Existing E2E exercise avatar rendering on create/game/ending; all green.

## Phase 8 — Meta-Progression & Persistence (complete)

Designed and reviewed with multi-agent workflows (a Map→Design→Synthesize blueprint, then an adversarial dimension-review with per-finding verification). Built in the blueprint's shippable increments.

- **Meta store** (`e72ff1a`): pure logic in `src/engine/meta.ts` (no I/O) — `defaultMeta`/`mergeMeta`, `recordRun`/`recordStart`, achievements catalog + `unlockAchievements`, `UNLOCKABLES` + `refreshUnlockables`, all immutable. `main.js` owns the `velmora_meta_v1` store with its **own** in-memory fallback global `window._velmoraMeta` (the three fallbacks — `_velmoraMem`/`_velmoraSet`/`_velmoraMeta` — never merge). `recordRunOutcome()` rolls the finished run into META **before** `clearSave()` in `endGame`, wrapped so a meta failure can never block the ending. 12 unit tests.
- **Records screen** (`e72ff1a`): `#screen-records` (🏅 Records on the title) — lifetime stats, an achievements grid (13, set-once; locked = dashed + 🔒), unlockables, and "Past Lives" (history ring buffer, cap 50). Built from META; axe-clean.
- **Save slots** (`89ccc70`): 3 slots at `velmora_save_v1__{0,1,2}`; the legacy bare `velmora_save_v1` is adopted as slot 0 and rewritten under the prefixed key on next save. `save/loadRaw/hasSave/clearSave` route through `activeSlot`; the save-data fallback became a per-slot map (tolerating a legacy string as slot 0). New `#screen-slots` picker (Resume / Delete / Start-in-slot). Default new-game flow stays `btn-new → path` when the active slot is free (so existing E2E/quick-start are unchanged); `quickStart` diverts to the picker only when the active slot is occupied, so an in-progress career is never clobbered.
- **New Game+** (`503241e`): one optional `ngPlus` field (GameState/BlankRunOpts, default 0 → `sim.ts` and the seed sweep untouched; one resume migration line). Win bumps `META.ngPlus.maxCleared`; a create-screen tier selector (0..maxCleared) appears once unlocked and is **hidden for daily runs** (daily is always tier 0). Effects are deterministic functions of the tier, reusing the difficulty knobs: opponent `+4·tier`, crisis/scandal `×(1+0.1·tier)`, `1+min(tier,2)` starting modifier rolls — so a given seed+tier reproduces exactly.
- **Review hardening** (`ac8ca7d`): the adversarial review confirmed one low-severity gap — `mergeMeta` didn't numerically validate stored stats — now fixed by whitelisting + coercing stat fields (tamper/garbage/future-proof); made the NG+ `maxCleared` bump immutable; added a coercion unit test and a **sandbox E2E** (localStorage fully blocked → game plays start→finish, meta falls back to its global, zero console errors). 16 of 18 verifier agents were lost to a transient API rate-limit and were re-verified by hand (all false positives or lean-acceptable).
- **Acceptance — MET:** saves persist & migrate (legacy-adoption + ngPlus migration E2E); both paths green; offline intact; **111 unit + 33 E2E** green (added meta units; records/slots/ngplus/migration/sandbox/audio E2E). **Phase 8 closed.**

## Architecture decisions (Phase 8)

- **AD-11 — Two persistence tiers:** ephemeral per-slot run saves (full serialized `S`) + a durable cross-run META store. Pure logic in `engine/meta.ts`; I/O + UI in `main.js`. Each store keeps a distinct in-memory fallback global. `S.version` remains the per-run anchor; `META.metaVersion` anchors the meta schema (additive merges, no value-gating yet).
- **AD-12 — New Game+ as a deterministic tier:** a single integer scales existing difficulty knobs; no new content, no stat-table forks. Optional field ⇒ legacy saves and the headless sweep need no changes. Disabled for daily so the shared scenario stays identical for everyone.

## Phase 9 — Performance (complete)

Measured first (a measure→plan workflow): the build was one monolithic JS chunk **~99.8 kB gzip**, of which the 251-event bank was **~67.6 kB (~68%)** — and it parsed before the title screen even painted, though title/menu need none of it. zod already tree-shakes to 0 bytes; the win was code-splitting + a budget gate, not manual tree-shaking.

- **Lazy event bank** (`854cb7f`): removed 4 dead content imports (`ARC_EVENTS`/`NPC_EVENTS`/`SCANDAL_EVENTS`/`PACK_1`) that pinned data to the entry chunk, then replaced the static `content/all-events` import with `loadBank()` (dynamic `import()`, cached). `startCareer`/`resumeGame` are now `async` and `await loadBank()` before the first event; the chunk is **prefetched on title idle** (`requestIdleCallback`) so career start is instant. Result: a separate `all-events-*.js` chunk (**67.3 kB gzip**, lazy) and an entry chunk down to **32.6 kB gzip** — a ~67% cut to initial JS parse, same total transfer. The lazy chunk is auto-precached by the SW (`injectManifest` globs include js; verified it's in the precache manifest), so **offline start still works** (offline E2E green).
- **CI bundle-budget gate** (`854cb7f`): zero-dep `scripts/check-size.mjs` (`npm run size`) gzips the built assets and **fails** when the initial entry chunk > 70 kB, total JS > 300 kB, or CSS > 30 kB (warns on a large non-entry chunk / CSS). Added to the CI verify job after build — locks the win in and prevents regression as the expansion adds packs 10+.
- **Lighthouse gate** (`<this commit>`): flipped `lighthouserc.json` performance + accessibility to **error ≥0.9** (from warn 0.8/0.9) with `numberOfRuns: 3` to cut runner variance; renamed the CI job. (Verified on the CI Lighthouse job after push.)
- **Acceptance — MET:** initial JS within budget and enforced; offline + installable intact; 60fps unaffected (no runtime-hotspot changes needed — the win was the data split); **111 unit + 33 E2E** green. **Phase 9 closed.**

## Architecture decisions (Phase 9)

- **AD-13 — Content is lazy data, engine is eager:** the engine already took the event pool as a parameter (`chooseNext(S, EVENTS, …)`), so the bank splits cleanly at the data boundary with no engine refactor. One dynamic-import seam at `content/all-events` (not per-pack) keeps it simple; both paths and the headless sim still share one pool (sim keeps a static import for the deterministic sweep). The SW precaches the lazy chunk, so code-splitting never costs offline capability.

## Phase 10 — Testing & QA Hardening (complete)

The engine was already past the bar (95.4% stmts / 82.3% branch / 98.3% lines) — Phase 10 **locks it in** and hardens the sweep.

- **Coverage gate** (`33c9872`): `vitest.config.ts` now sets per-glob thresholds — `src/engine/**` must hold **statements 90 · branches 80 · functions 90 · lines 90** (content is data, not gated). CI's verify job runs `npm run test:cov` (replacing `npm test`) so the threshold is enforced. Added `tests/unit/engine-branches.test.ts` (+12) covering the weakest fallback branches in `factions`/`cabinet`; engine branch 82.3→**84.4%**.
- **Enlarged + hardened sweep** (`33c9872`): `sweep.test.ts` now runs **120 seeds/path** (was 50) and adds a **no-soft-lock** assertion (max draws < 300, well under the sim's 600-draw safety guard) on top of the existing every-run-reaches-an-ending / repeat-rate / variety / ending-spread gates.
- **Flagged error reporting** (`33c9872`): an opt-in (`SETTINGS.errorReports`, default **off**) on-device collector — `window`/`unhandledrejection` listeners record sanitized messages to a capped ring buffer (no network; there is no backend — this is the scaffold a future endpoint would drain). Settings toggle + `error-reporting.spec.ts` (off-by-default, records-when-on, persists).
- **Skipped (deliberate):** visual-regression baselines — a full UX/UI redesign after Phase 12 would immediately invalidate them; revisit post-redesign.
- **Acceptance — MET:** engine coverage ≥80% enforced in CI; large seeded sweep green incl. no-soft-lock; **125 unit + 34 E2E** green. **Phase 10 closed.**

## Architecture decisions (Phase 10)

- **AD-14 — Gate logic, not data:** coverage thresholds target `src/engine/**` only. Event packs are data whose meaningful coverage comes from the seed sweep + E2E, so per-line unit thresholds on `content/**` would be noise. The sweep (now 120/path) is the real behavioral safety net; the no-soft-lock bound turns "every run ends" into an enforced invariant.

## Next steps (concrete)

1. **Phase 11 — Business, Distribution & Legal (partly decision-gated):**
   - **Needs user decisions:** the monetization model (the EXPANSION_BRIEF assumes a one-time `flags.expansion_unlocked` gate, base game free); the analytics provider/consent approach; store-packaging targets + credentials (TWA / MS Store / itch).
   - **Can proceed without decisions (lean):** SEO + Open Graph meta + social card, a privacy-policy/terms draft, monetization **flag scaffolding** (no real pricing wired), and an opt-in analytics **scaffold** (default off, no backend). i18n externalization is deferred to post-redesign (the redesign reworks UI strings).
2. **Phase 12 — Launch Readiness:** full regression, Lighthouse all ≥90 on prod, changelog + semver, release build, deploy Vercel + Traefik, launch checklist.
3. At a checkpoint: keep `phase-1-foundation` pushed so **PR #1** CI runs (verify · e2e · lighthouse). (Optional, low priority: retire the `src/main.js` lint/typecheck ignores by extracting the UI layer → `ui/`.)
4. **After Phase 12:** the massive UX/UI redesign, then retarget + build the `EXPANSION_BRIEF.md` expansion.
