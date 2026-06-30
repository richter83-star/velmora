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
- **P2 — Map render (read-only).** Top-down canvas map of the provinces,
  theme-aware per path, shown with the HUD. The world is visible and reacts to
  the existing stat changes. No new interaction yet.
- **P3 — Rule phase (interaction).** A between-event map phase: act on provinces
  (develop / garrison / suppress / allocate / sway). Turn = rule phase + event
  phase. Actions cost and pay off through the derived stats.
- **P4 — World ↔ event loop.** Events fire from province state (regional crises,
  threshold triggers); arcs/scandals localize to regions; choice outcomes write
  back to the map. The two layers become one game.
- **P5 — Living map (animation).** The visible motion payoff: provinces pulse and
  shift on change, unrest spreads across borders, the capital grows, influence
  animates. Reduced-motion-safe, in-budget.
- **P6 — Balance, content, onboarding, polish.** Tune the economy, region-flavored
  content, tutorialize the new loop, perf/budget pass, full QA on all 5 paths.

## Open design questions (resolve before P1)

1. **Map style:** abstract stylized provinces (fits the cartoon riso aesthetic,
   easiest to theme per path) vs a hex grid vs a hand-authored map per path.
2. **Province count / scale:** a tight ~6–10 region board (readable, mobile-first)
   vs a denser map. Mobile-first argues for few, meaningful regions.
3. **How hard the strategy bites:** light (the map flavors + feeds the narrative)
   vs deep (real resource/territory management that can win or lose runs on its
   own). The user picked "Full Civ" → lean deep, but stage the depth across P3/P4.
4. **Stat reframing:** keep the six stats as the nation aggregates, or rename/
   reshape them to read as a ruler's dashboard once the map backs them.
