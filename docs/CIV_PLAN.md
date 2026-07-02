# VELMORA — Civ Strategy Layer (vision + phased plan)

> Direction set 2026-06-30 after a playthrough: the card-only loop reads as
> repetitive within minutes, the micro-animations are invisible during play, and
> showing exact `▲ Cohesion +14` outcomes turns moral/strategic gut-calls into
> arithmetic. Decision (user): go **Full Civ strategy layer** (a top-down,
> interactive nation you rule, with events firing from the world) + **vague
> directional decision hints** (no numbers). This is a multi-session rebuild that
> KEEPS the narrative engine and wraps a spatial strategy layer around it.

## The core idea

Velmora today is a narrative card engine with a stats HUD. The pivot adds a
**world**: Velmora the fictional nation becomes a set of **provinces** you rule
from the top down. The existing engine is not thrown away — it becomes the
**"events fire from the world"** layer:

- **Provinces** carry state (control, unrest, development, dominant faction,
  output). The nation's six stats become **aggregates derived from the map**
  (e.g. unrest across provinces → Heat; loyal provinces → Base; output → Funds).
- Each turn has two beats: a **rule phase** (act on the map — develop, garrison,
  suppress, allocate, sway a province) and an **event phase** (the narrative
  decision, now often *triggered by* a province crossing a threshold).
- **Bidirectional loop:** the map spawns events (a province boiling over → a
  regional crisis; arcs/scandals localized to a region) and decisions write back
  to the map (an arc choice flips a province, drains a region, plants unrest).
- The "animated world" the player wanted falls out of this naturally: provinces
  pulse on change, unrest bleeds across borders, the capital grows — real motion
  that *means something*, not decorative card transitions.

## Hard constraints (unchanged invariants)

- Offline-first, installable PWA. Map render is **canvas/SVG vectors** (cheap,
  offline, in-budget) — never video/raster. Map code lazy-loads like the bank.
- Entry JS ≤70 kB, eager-precache ≤600 kB (the gates added this session stay).
- **Deterministic + seeded:** province generation and the world sim consume the
  seeded RNG in a fixed order; rendering consumes none. The seed sweep must stay
  byte-identical so saves stay loadable and runs reproducible.
- Save migration: the world model is versioned; legacy saves generate a world
  from their seed on load. `safeAvatar`/legacy paths preserved.
- Content boundary (TV-MA red lines) and the prose-only guard still apply.
- Every phase leaves the game **shippable** — both/all paths playable start→
  finish, zero console errors, all gates green.

## Phased roadmap (each phase ships)

- **P0 — Vague decision hints (DONE / in progress).** Replace the numeric `c.fx`
  chips with directional thematic signals ("your grip tightens", "the heat
  rises") + a risk marker, no numbers. Pure `render/hints.ts`, tested. Independent
  of the map; ships immediately. *Directly fixes the "takes the point away" note.*
- **P1 — World model.** Province data model (id, neighbors, control, unrest,
  development, faction, output), seeded generation per path, and nation stats
  derived from it. Engine + tests only; game plays as today. Determinism held.
- **P2 — Map render (read-only). ✅ BUILT.** Top-down Voronoi canvas map behind the
  `civMap` flag (`?civ=1` / dev-on / off-in-prod), lazy chunk (`render/map.js` +
  `engine/world-geometry.ts` + d3-delaunay, 8.6 kB, entry stays 60.4/70 kB). Riso
  style: control→ink-density, unrest→red hatch, capital→gold star, per-path theme
  tokens. Parallel a11y province button list (SR labels + keyboard focus-reveal +
  ≥44px), canvas-fail→list fallback. Redraws each turn via `renderHUD`. Adversarially
  reviewed (6 auditors); 3 findings fixed (focus-visible, centroid off-by-dup-vertex,
  backing-store squish). 296 unit tests + a `?civ=1` e2e spec.
- **P3 — Rule phase (interaction). ✅ BUILT.** Tap a province (canvas hit-test or
  the a11y list) → an action sheet: spend 1 of 2 imperial actions/turn on
  Develop/Garrison/Suppress/Sway, or set a free set-once Governor (Develop/Pacify/
  Fortify/Extract) that auto-runs each world tick. `applyWorldTick` (folded into
  the shared `advanceTurnState`, exercised by the sim too — req 7) feeds a
  DEVIATION-from-generation-baseline delta into the six stats, so an untouched
  realm is 0 for every seed by construction (sweep-safe; adversarially verified
  after a first attempt using absolute thresholds leaked a delta on ~0.67% of
  seeds). Optional, no forced screen (req 12). Accessible modal (focus trap,
  focus-preserving re-render, live-region announcements). Adversarially reviewed
  (7 auditors → 13 findings fixed, then a fix-confirmation pass).
- **P4 — World ↔ event loop. ✅ BUILT.** The deck and the map feed each other via a
  new `realmFx` on event outcomes (mutate a target province: trigger/worst/capital,
  with neighbour spread) + realm-gated event `req`s. The world tick adds restive
  contagion (a province ≥60 unrest bleeds into neighbours) and a crisis trigger
  (queues `p4_provincial_revolt`, keyed to `S.crisisProvince`). Three events:
  a flashpoint that can tip a fraying province over, the revolt crisis (crush/
  broker/let-it-burn), and a loyal-realm reward. All RNG-free, and DORMANT while
  the realm is calm, so the seed sweep stays sound (verified: 1000-run probe →
  334 flashpoints, 88 revolts, 0 cascades; sweep reachability + repeat-rate hold).
  Adversarially reviewed. [Original text below.]
  Events fire from province state (regional crises,
  threshold triggers); arcs/scandals localize to regions; choice outcomes write
  back to the map. The two layers become one game.
- **P5 — Living map (animation).** The visible motion payoff: provinces pulse and
  shift on change, unrest spreads across borders, the capital grows, influence
  animates. Reduced-motion-safe, in-budget.
- **P6 — Balance, content, onboarding, polish.** Tune the economy, region-flavored
  content, tutorialize the new loop, perf/budget pass, full QA on all 5 paths.

## Locked decisions (CEO review 2026-06-30)

Resolved in `/plan-ceo-review` (HOLD SCOPE, max effort). The user chose the
ambitious option at every fork, with the risks surfaced and accepted.

- **D1 Interaction depth:** FULL province management (not "map as flavor").
- **D2 Map style + scale:** abstract stylized riso regions, **12–18 provinces**
  (medium). NB: this contradicts the earlier "6–10 for mobile" note — 12–18 is
  the call; mobile readability of 18 themed regions is now an explicit P2 design
  task, not an assumption.
- **D3 Stat model:** DELTA-FEED (downgraded from full-replace at D9 after the
  two-model outside voice proved the blast radius). The six stats stay the source of
  truth every engine system reads; provinces FEED a bounded per-turn delta into them
  each world tick. Event `fx` keep their authored direct-delta semantics; provinces
  nudge on top. **This deletes ~80% of the code-confirmed risk:** no 8-system
  ownership rewrite, the byte-sweep stays a real guard (deterministic tick), no
  unscoped 294-event rebalance — only the new province deltas need tuning. Tighten
  toward pure aggregation later only if it earns it.
- **D4 Anti-burnout (hard requirement):** tight per-turn action budget (~1–2
  imperial actions) + governors (set-once province auto-manage). Attention is the
  scarce resource. This is what keeps D1 from becoming 4X micromanagement burnout.
- **D5 Code structure:** extract Civ logic into pure tested engine modules
  (`src/world/*`); lazy-load the canvas render. The sim/governor/derivation code is
  CORE-LOOP (runs every turn) so it counts against the 70 kB ENTRY budget — only
  the canvas drawing is lazy. Model the byte budget before P3; do not assume.
- **D6 Rollout:** one feature flag, OFF in production until ready, ON in
  local/preview. Merge each phase safely; flip live at P6.
- **D7 Strategy:** commit straight through P1–P6, NO mid-build validation gate
  (outside voice recommended a "prove it's fun after P2/P3" gate; user declined in
  favor of conviction). Accepted risk: payoff is not user-visible until P5.

### Hard requirements carried from the review (not optional)

1. **Determinism contract (before P4):** write the exact turn-phase RNG-consumption
   order (rule/governor phase → event trigger → write-back). That ordering IS the
   contract. P1's separate-stream trick does NOT survive P4's interleaving.
2. **Regression guard preserved (delta-feed):** because stats stay the source of
   truth and the province tick is deterministic, the byte-identical sweep REMAINS a
   valid guard — provided the sim ticks the realm too (see req 7). Add a belt-and-
   braces check anyway: assert stats stay in [0,100] and all endings stay reachable.
   _(Was a hard degradation under full-replace; delta-feed resolves it.)_
3. **Rebalance is now small (delta-feed):** the 294 events keep their authored direct
   `fx`; only the NEW bounded province-delta per tick needs tuning (start conservative,
   e.g. ±1–3/turn). No unscoped rewrite. _(Was a full-replace-sized rebalance; delta-
   feed shrinks it to tuning one new knob.)_
4. **D2/D4 tension is empirical:** depth (D1) vs automation (D4) is resolved by
   playtest tuning, not by argument. Watch it at P3.
5. **Defensive (P1–P2):** validate+clamp realm on save-load (else regenerate from
   seed); clamp every derived stat; wrap the canvas render so a failure falls back
   to the text HUD and never breaks the turn loop; route world-tick / rule-action /
   render failures through `recordError()`.

### Codex second pass — additional code-grounded requirements (cross-model)

6. **Flag needs a save/version contract, not just a UI hide.** P1 already writes
   `S.realm` in `startCareer` and migrates it unconditionally in `resumeGame`
   (main.js:1076/:1515). A prod-off flag that hides only UI still changes save shape,
   migration, and rollback. Define a `saveVersion`-gated realm contract.
7. **Unify sim + live run construction (still required under delta-feed).**
   `simulateRun.createRun` (sim.ts:35) never generates/ticks a realm, so the seed sweep
   won't exercise the province deltas — unify sim + live construction so the sweep
   reflects the real balance path before the province tick feeds stats.
8. **Blast radius mostly resolved by delta-feed.** `S.stats` is read/written by death
   thresholds, heat/support decay, cabinet perks, contest strength, promo spending, roll
   odds, bloc shifts, tutorials, records (turn.ts:35, contest.ts:18, main.js:518,
   factions.ts:157). Under delta-feed these keep reading/writing `S.stats` as today — no
   ownership rewrite. Remaining care: order the province delta vs the existing decay in
   the turn so they don't fight. _(Full-replace would have required rewriting all 8;
   delta-feed dissolves that.)_
9. **Province geometry must land in the P1 model before saves lock.** `Province`
   (world.ts:22) has points+neighbors but no polygon/border/hit-region; a top-down map
   needs stable geometry + touch targets. Add it now or risk changing generated worlds.
10. **Precache budget, not just entry JS.** Vite PWA precaches all `**/*.js`
    (vite.config.ts:26), so a lazy map chunk still counts against the 600 kB offline
    shell unless the SW strategy changes. D5 protects entry JS only.
11. **Per-path province vocabulary.** control/unrest/development is territorial; Gilded
    (capital/leverage/network) and Anointed (devotion/authority/heresy) need their own
    province semantics or the map flattens the paths' best flavor into generic chores.
12. **Cadence guard.** Promotion is turn-count based (main.js:431/435). A rule phase
    before every event doubles per-turn interaction; if "repetitive quickly" is the
    problem, gate the rule phase (e.g. every N turns, or only when a region demands it)
    so it doesn't slow the narrative beat it's meant to enrich.

## Map UI design (design review 2026-07-01)

Calibrated to DESIGN.md (riso/cartoon: thick ink borders, halftone, gold-foil,
per-path `--rp-*` palettes). The map lives INSIDE that language, reusing
`.panel`/`.ev` treatments and the `.tut` overlay shell — not a generic game board.

### Mobile information architecture (primary = the map)
```
PHONE — map is home; the event card enters as a bottom sheet OVER it
┌───────────────────────────┐        ┌───────────────────────────┐
│ ⚙ Yr7 · IRON · ▮▮▯ heat   │ HUD    │      [ map dimmed ]       │
├───────────────────────────┤ strip  │   ╔═══════════════════╗   │
│                           │        │   ║  EVENT (bottom    ║   │
│     [ CANVAS PROVINCE     │        │   ║  sheet, .tut/.ev  ║   │
│        MAP — tap a        │  event │   ║  shell) — choices ║   │
│        region to act ]    │ ─────▶ │   ║  with vague hints ║   │
│                           │        │   ╚═══════════════════╝   │
│  [ 1–2 imperial actions ] │        │   map recedes; the        │
└───────────────────────────┘        │   decision is the moment  │
                                      └───────────────────────────┘
```
Hierarchy: 1st the map (your nation, where attention goes), 2nd the current event
(a focused bottom sheet when one fires — map stays as context backdrop), 3rd the
HUD (one condensed line; tap to expand full meters). Tapping a province opens a
small action sheet (develop/garrison/suppress/sway) gated by the D4 action budget;
governors mean most provinces need no tap. **DECISION:** event = bottom-sheet over
a dimmed map (keeps context, reuses `.tut`), NOT a full screen swap.

### Map states (every one specified — no blank canvas ever)
- **Loading:** riso "pulled sheet" skeleton, province outlines fade in (reuse `.panel`).
- **First turn:** capital highlighted + one-line coach mark "This is <Nation>. Rule it."
- **Province at 0 control / lost:** greyed with a torn-edge/hatch "lost print" fill,
  still tappable ("lost — reconquer?"), never silently gone.
- **All provinces lost:** routes to the existing collapse ending, not a broken map.
- **Governor set:** a small `.stamp`-motif icon on the province so self-running
  regions read at a glance.
- **Action budget spent:** action chip greys ("no imperial actions left — end turn");
  taps show a "spent" toast; map still viewable.
- **Canvas error:** falls back to the text province LIST (the a11y layer) — ties to
  eng req 5; the game never breaks.

### Canvas accessibility (parallel semantic layer, not an afterthought)
A canvas is invisible to screen readers, so the interactive layer is a real button
list, not the canvas:
- Every province is ALSO a focusable `<button>` in a screen-reader list, labeled
  "<Province>, control X, unrest Y, <governor>". A "list view" toggle exposes it visually too.
- Keyboard: Tab cycles provinces in a stable order (capital first, then adjacency);
  Enter opens the action sheet; Esc closes.
- Touch targets ≥44px (province zones, action chips, governor toggles).
- Canvas gets `role="img"` + `aria-label` summary ("Map of <Nation>: N provinces, M restive");
  the button list carries the interaction.
- Colour is never the only signal — unrest also shown by hatch density / icon (colourblind-safe).
- Reduced-motion: P5 map motion respects the existing dual reduce-motion gate; the list is static.

**Design completeness: 3/10 → 8/10.** Remaining 2 points are the live visual
treatment (province shapes, palette-in-motion), which belongs at P2 via
`/design-shotgun` + `/design-review` on real pixels — deferred deliberately.

## GSTACK REVIEW REPORT

| Review | Trigger | Why | Runs | Status | Findings |
|--------|---------|-----|------|--------|----------|
| CEO Review | `/plan-ceo-review` | Scope & strategy | 1 | complete | HOLD SCOPE; 9 decisions (D1–D9); D3→delta-feed; 12 hard requirements |
| Eng Review | `/plan-eng-review` | Architecture & tests (required) | 1 | clean | 0 new forks; architecture sound under delta-feed; 1 critical gap (sim must tick realm) owned by req 7; test-coverage plan + build sequence added |
| Design Review | `/plan-design-review` | UI/UX gaps | 1 | 3/10→8/10 | Locked mobile IA (map-home + event bottom-sheet), 7 map states, and canvas a11y (parallel button list); live visual treatment deferred to P2 /design-shotgun |

- **OUTSIDE VOICE (2 models):** independent Claude reviewer (8 findings) + Codex 0.130.0 code-grounded pass (8 more, file:line-cited). Requirements 1–12 above absorb both.
- **CROSS-MODEL CONSENSUS:** both models independently flag the same core danger — full-replace + full-management carries the risk, the determinism story has holes, and the added rule-phase cadence may worsen the "repetitive" complaint. Strongest signal a review produces. Codex additionally found the flag can't isolate saves (req 6), the sweep never exercises the realm (req 7), and derived-stats' blast radius spans ~8 systems not just event fx (req 8).
- **DECISION CHANGED BY THE OUTSIDE VOICE:** on Codex's code-grounded proof that full-replace spans ~8 systems and the sweep never exercises the realm, the user downgraded D3 **full-replace → delta-feed** (D9), deleting ~80% of the code-confirmed risk while keeping the full-Civ experience. Reqs 2/3/8 shrink accordingly.
- **ENG REVIEW (added):** 4 sections evaluated; zero new architectural forks — the 12 requirements ARE the locked architecture. Added the test-coverage plan (reqs 2/7 are CRITICAL: the sweep is theater until `sim.createRun` ticks the realm), the failure-mode registry (1 critical gap, owned by req 7), and the P1→P4 build sequence (save/flag contract + RNG-order doc → province geometry → P2 render → P3 tick/actions/governors).
- **DESIGN REVIEW (added):** map UI design intent locked into the plan (mobile IA: map-home + event bottom-sheet over a dimmed map + condensed HUD; 7 map states specified; canvas a11y via a parallel focusable province list). 3/10 → 8/10; the final 2 points (live visual treatment) are deliberately deferred to P2 `/design-shotgun` on real pixels.
- **VERDICT:** CEO + ENG + DESIGN CLEARED — full-Civ scope locked with delta-feed stats, architecture sound, map UI design intent locked, 12 requirements + build sequence ready. Ready to implement P2.

NO UNRESOLVED DECISIONS
