# VELMORA — The Mature Cartoon Overhaul (plan)

> Drafted 2026-06-24 via a planning workflow (3 system maps → 6-lane design panel → synthesis). The source-of-truth plan for the multi-session production overhaul. Re-read alongside `docs/PROGRESS.md`.

## What it becomes

VELMORA stays the same deterministic, offline-capable, installable 5-path strategy PWA — but every speaker becomes a drawn **Family-Guy / South-Park-grade cartoon caricature** with a savage **TV-MA mouth** and a real **voice**, behind a re-scoped **Mature (17+)** content gate. The entry stays a sub-70 kB shell that boots instantly; **all art + audio live OUTSIDE the JS budget** as content-hashed, service-worker-cached packs that become offline-permanent per path on first visit.

## North star — stickiness

**A cast players form opinions about, and a line they can't believe shipped.** Today's parametric SVG faces + Teen prose are forgettable. The overhaul gives each of the 5 paths a distinct comedic identity (the Ballot operator, the Vanguard zealot, Pastor Mammon of the Hollow Church of the Ledger, the Iron Provost, the Gilded patron) with a real face AND a profane voice. **Graphics** give the stat-meters a recognizable mouth; **characters** give that mouth a consistent personality across ~357 events so "what will this prick say next" pulls the session forward; **voices** make the punchlines clip-able and shareable. Earn-as-you-play asset caching adds a soft collection loop. The cheapest growth loop a no-backend PWA has.

## Why graphics → characters → voices (forced by dependencies, not taste)

1. **Graphics first** — the portrait resolver is the engine seam everything hangs off; characters need a face to wear, voices need a mouth to speak from. It must be proven pure/deterministic/never-blocking before any heavy asset exists. Also the cheapest, highest-visibility win (CSS budget has huge headroom).
2. **Characters second** — a character = a consistent face (from the art pipeline) + a consistent voice-in-prose across ~357 events; the TV-MA rewrite gives each path its identity, and it depends on the re-scoped content gate landing first.
3. **Voices last** — a voice is meaningless without a character to own it and a written line to speak; it reads its caption from the rewritten body and is the heaviest/riskiest lane (offline quality, production matrix), so deferring it lets the game ship sticky + shareable even if voice slips.

## Phases (each leaves the game playable + all gates green)

| #      | Phase                                                                        | Lanes               | Effort | Goal                                                                                                                                                     |
| ------ | ---------------------------------------------------------------------------- | ------------------- | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **P0** | Budget reclamation + asset-delivery rails (BLOCKING, zero art)               | tech                | M      | Make room + build the rails before any pixel/sample. Entry is ~66/70 kB gz — **~3.7 kB headroom is the single binding constraint.**                      |
| **P1** | Pure portrait resolver behind a never-blocking fallback                      | graphics/tech       | M      | One pure resolver decides WHICH portrait, never WHETHER one loaded — determinism + offline survive. No new art; legacy SVG stays visible.                |
| **P2** | Art pipeline lock + first path's full pack                                   | graphics/stickiness | XL     | Lock the drawn-art format + delivery, ship ONE path's full cast to validate load/cache/offline/LCP/budget before scaling.                                |
| **P3** | Mature gate re-scope + age gate + legal re-rating (lands BEFORE the rewrite) | content             | M      | Flip the boundary to TV-MA-with-red-lines so the gate is the executable definition the rewrite is validated against. Text-only, zero asset impact.       |
| **P4** | TV-MA prose rewrite — static banks + generative layer (the long pole)        | content/stickiness  | L      | Give the faced cast its savage mouth across ~357 events + the Loom/Live layers. **Prose-only** so ids/fx/structure/saves/sweep survive byte-identically. |
| **P5** | Scale art to all 5 paths                                                     | graphics/tech       | XL     | Roll the proven path-2 pipeline across the other four paths.                                                                                             |
| **P6** | Voice layer + captions + a11y                                                | voices/a11y         | L      | Audible voices last — stream per-line, degrade gracefully, never block, always captioned.                                                                |
| **P7** | Final hardening + boundary verification + ship                               | all                 | M      | Prove every hard constraint holds simultaneously; ship Mature, voiced, fully-faced VELMORA.                                                              |

### Key per-phase gates

- **P0:** entry ≤70 kB, total JS ≤300 kB, CSS ≤30 kB unchanged; new asset gates exist + pass with zero art; seeded sweep byte-identical.
- **P1:** seeded sweep byte-identical with assets STUBBED vs LOADED; visually unchanged (legacy SVG); save load/migration tested for legacy raw-SVG + new key-based avatars.
- **P3:** all three gate suites prove the new boundary (profanity passes; porn + real-person-sexual + real-religion-mockery fire); age-gate axe-clean/keyboard/offline.
- **P4:** after every batch — `content:validate` green, diff-guard confirms zero structural change, seeded sweep unchanged; per-path human spot-read signs off the red lines.

## Asset & budget model (3 tiers, all art/audio OUTSIDE the JS budget)

- **EAGER** (in JS/CSS budget): entry shell, CSS, woff2 fonts, a tiny set of low-res placeholder/HUD portraits. **All new render/audio code MUST be dynamic-imported chunks** (like `loadBank`/`loadLive`) — never inline in the IIFE, or it fails the size gate.
- **LAZY** (outside JS budget): per-path art packs under `public/art/<path>/`, fetched on path-select, SW runtime-cached (offline-permanent after first visit). `public/art` is NOT in `dist/assets`, so `check-size.mjs`'s `*.js`/`*.css` scan ignores it — but every key is content-hashed via a build-time manifest.
- **STREAMED** (outside JS budget): voice per-line, never precached, with on-device `SpeechSynthesis` offline fallback + the existing synth SFX as the always-on bed.
- **Proposed NEW budgets** (added to `check-size.mjs` as a SEPARATE gate — new dimensions, not relaxations): JS gates unchanged (70/300/30 kB); shell-art ≤40 kB, per-path pack ≤250 kB gz, single portrait/expr-sheet ≤20 kB, single voice clip ≤40 kB, total eager-precache (shell+fonts+shell-art) ≤600 kB.
- **Art format:** base-body + swappable expression-overlay (atlas) so 5 expressions reuse one body (collapses the 5-path × N-char × 5-expr matrix); AVIF + WebP `<picture>` fallback.
- **Offline guarantee:** core play + legacy-SVG fallback + SFX are 100% offline always; real portraits/voices become offline-permanent per path after first visit; SpeechSynthesis covers voice offline before any clip caches; the only online surface stays the opt-in BYOK Live Storyteller.

## Content-boundary plan (re-scope the gate, never delete it)

`src/content/denylist.ts` is the single source of truth (re-imported by `lint.ts` build gate, `weave.ts` Loom, `live/safety.ts`), so one edit propagates to all three; `scanCore`/`scanStrict`/`scanRealizedText` signatures stay unchanged (zero call-site edits).

- **ALLOW** (no code change — profanity was never code-gated, only an authoring convention): heavy profanity, crude/sexual innuendo, gross-out, cartoon violence, savage dark satire — routed through **fictional Velmora stand-ins** (mock the MECHANISM of power/ideology/institutional hypocrisy via invented caricatures).
- **STILL BLOCK the three red lines:** (a) real-named-religion mockery — recommend KEEPING bare real-religion names blocked in CORE (authors route through the Concordat / Hollow Church of the Ledger / Pastor Mammon); (b) sexualizing/defaming a REAL living person — ADD a `REAL_PERSON_SEXUAL` family in STRICT, AND keep the STRICT real-living-person NAME net fully intact so the Live LLM can never name one (makes non-deterministic context-detection unnecessary; false positives just fall back on-device); (c) explicit porn — ADD a `FORBIDDEN_PORN` lexicon to BOTH tiers.
- **PLUS:** a locally-remembered first-run **age gate (17+/18+)**, updated legal/store rating + disclaimer (honest note that an offline localStorage age gate is self-attest, defeatable by clearing storage — the accepted ceiling for a no-backend PWA), and a TV-MA-with-boundaries rewrite of the `live/prompt.ts` system prompt.
- The gate enforces **tokens, not spirit** — the real control for the static bank is a **voice bible + per-path human spot-read** (documented so nobody assumes green CI = on-boundary).

## Decisions the user must make (early — some gate paid spend)

1. **ART SOURCE** (gates P2, biggest unblocker): AI-generated (e.g. the Higgsfield image MCP) vs commissioned vs hybrid. Recommend **AI-gen + human-cleanup on the base-body+overlay atlas** to keep the matrix + 250 kB/pack budget tractable.
2. **VOICE SOURCE/STRATEGY** (gates P6): SpeechSynthesis-only first (free, offline, inconsistent) then layer pre-rendered hero-line clips, vs commit now to a recorded/paid-TTS pipeline. Recommend **SpeechSynthesis-first**, add streamed hero-line clips later.
3. **TOOLS:** static atlas `<picture>` portraits (recommended — trivially reduced-motion-safe, lighter) vs Rive/Lottie animated lip-flap (defer until post-P5).
4. **NEW BUDGETS:** confirm/adjust shell-art ≤40 / pack ≤250 / portrait ≤20 / voice ≤40 / eager-precache ≤600 kB; JS gates unchanged.
5. **CONTENT POSTURE ×3:** (a) real-religion — keep bare names blocked in CORE (recommended) or relax to as-mockery; (b) confirm hard-block ALL real living-person names in STRICT (recommended); (c) confirm full profanity ceiling with NO profanity denylist (green CI = on-boundary except the named red lines).
6. **AGE THRESHOLD:** 17+ (TV-MA/store norm) vs 18+ — pick one, use consistently.
7. **REWRITE OWNERSHIP:** who writes/approves the ~357-event TV-MA pass (and whether the BYOK Live model may DRAFT candidate prose a human then edits).
8. **STORE/DISTRIBUTION:** web-only vs an app store with IARC (determines how formal the rating/age-gate evidence must be).
9. **PAID SERVICES sign-off:** AI-image credits and/or paid TTS spend, before P2 and P6.

## Risk-ranked

1. **CRITICAL — entry budget:** ~3.7 kB headroom; any inline resolver/voice/manifest code or static character-registry import fails `check-size`. → all new code dynamic-imported; reclaim headroom FIRST (P0).
2. **CRITICAL — art production at scale:** 5 paths × (antagonist + ~20 advisors + player) × ~5 expressions. → lock the base-body+overlay atlas, prove ONE path (P2) before scaling; pick the art source first.
3. **HIGH — voice quality offline:** SpeechSynthesis varies wildly. → ship SpeechSynthesis-first with captions ALWAYS on so meaning never depends on audio; layer clips later.
4. **HIGH — determinism leak:** if portrait/voice selection consumes the seeded RNG or async timing feeds game math, the sweep breaks. → resolver is `pure(id,mood,seed)`; fetch latency sits behind the fallback; sweep assertion runs identically with assets stubbed.
5. **HIGH — content-gate mis-scope (legal):** regex can't read sexual CONTEXT about a real person. → hard-block ALL real-living-person NAMES in STRICT (context-detection unnecessary) + per-path human review.
6. **MEDIUM:** tonal drift across 357 events; rewrite breaking structure (prose-only diff-guard mandatory); SW precache blowup (narrow glob FIRST); CWV/LCP on above-the-fold portraits (eager placeholder); save migration (keep `safeAvatar` for legacy).
7. **ACCEPTED CEILING:** the age gate is localStorage self-attest only — a legal-disclaimer note, not a code bug.

## First move

**Execute P0 immediately, ship nothing visual:** narrow `vite.config` globPatterns to shell-only (drop png/svg + the duplicate woff), split `src/sw.js` into eager-shell precache + `/art/` and `/voice/` runtime cache-on-first-fetch groups, and extend `scripts/check-size.mjs` with the separate asset-budget gate (JS gates untouched). This is the BLOCKING prerequisite for every other lane, ships with the game fully playable + all gates green, and forces the early architectural decisions before any expensive art/voice production. In parallel, surface the two cost-gating decisions (ART SOURCE, VOICE STRATEGY) so procurement/approval runs alongside P0/P1 engineering.
