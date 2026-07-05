# Engine-as-a-library — DX review

Reviewing Velmora's scenario engine as a developer library, for an edtech / training-sim
developer who needs reproducible branching drills. Scope: the `src/engine/` machine, not
the game. No code changed; this is the review + an extraction plan.

## Verdict

The tech is excellent. The library does not exist yet.

- **DX today: ~2.5 / 10.** A developer cannot install it (`package.json` is `private`, no
  `exports`/`types`), there is no entry point, no example, and the core imports the game's
  content, so it cannot run the developer's own scenarios without forking. Time-to-hello-world
  is effectively infinite.
- **DX achievable: ~8 / 10** with a focused extraction (decouple content, add a public API +
  barrel, package it, document the determinism contract, ship one quickstart).
- **The one thing to sell:** deterministic, byte-reproducible replays. For training and
  compliance, that is an auditable record of exactly what a learner would experience, re-runnable
  forever. No mainstream branching engine offers this. That is the wedge.

## Target developer persona

```
Who:       Edtech / training-sim developer building branching compliance / training drills
Context:   Evaluating engines for "make consequential choices, see where they land"; reproducible
           replays (audit trails) are a hard requirement
Tolerance: ~30 min eval; copies from the README; abandons without a fast working scenario
Expects:   npm install, a typed API, an author-friendly event schema, one runnable example
```

## Developer perspective (empathy narrative)

I need a branching-scenario engine for a compliance-training product. Reproducibility is
non-negotiable: our auditors must be able to replay any learner's run exactly. I find Velmora
because someone linked its README, which literally says the engine "maps cleanly onto training
simulations, compliance-scenario drills, onboarding decision-trees." That is my exact use case,
so I lean in.

Then I try to use it. There is no `npm install` line for the engine, because the package is
`private` and exports nothing. I open the repo. There are 26 files under `src/engine/` and no
`index`, so I do not know where to start. I find `simulateRun` in `sim.ts` and think "that is my
entry point," but it imports `ALL_EVENTS` and `PATHS` from the game's political-satire content, so
running it gives me *Velmora's* scenario, not mine. There is no doc explaining how to bring my own
content. I would have to read and reverse-engineer the whole engine to extract it. Thirty minutes
in, I have run nothing of my own. I bookmark it as "interesting, revisit if they package it," and
go evaluate Ink.

## First-time developer report

```
T+0:00  Read README. "training simulations, compliance drills" — this is it. Excited.
T+0:30  Look for install. Package is private, no exports. No npm line. Confused.
T+1:00  Open the repo. 26 engine files, no index.ts. Where is the front door?
T+2:00  Find simulateRun(). It imports ../content (ALL_EVENTS, PATHS). It runs THEIR game, not mine.
T+4:00  Search for "bring your own content" / an authoring guide. Nothing for external devs.
T+6:00  Conclude: great engine, but it is an internal engine, not a library. Leave.
```

The punchline is the same for the empathy narrative and the confusion log: the wall is not the
tech, it is that there is no door. Everything behind the wall is strong.

## Competitive benchmark

| Engine | TTHW | Strong DX | Gap for THIS persona |
|--------|------|-----------|----------------------|
| Ink / inkjs (inkle) | minutes | Purpose-built authoring language, runtime, good docs, shipped games | Not reproducible-by-seed; no stats / scoring / crisis layer |
| Twine (Harlowe / SugarCube) | minutes | Visual authoring, huge community, low-code | Not a typed headless engine; weak for programmatic reproducible sims |
| Yarn Spinner | minutes | Great in Unity gamedev | Unity-first, not web/TS; not for training pipelines |
| XState | minutes | Deterministic, typed, superb docs + inspector | Generic state machine; no event bank, weighted draws, arcs, scoring |
| **Velmora engine** | **∞ today** | Deterministic replays + offline + TS + a real stats/arcs/crisis/scoring model | Unpublished, no API surface, no docs, content-coupled |

Honest read: everyone beats it today on packaging, authoring tooling, docs, and community. It can
genuinely win on one axis none of them own — **reproducible, auditable, seed-deterministic runs
plus a built-in scenario-scoring model.** For compliance/training that axis is the whole ballgame.

## The magical moment

For this persona it is not "a pretty card." It is:

> Run your scenario with a seed. Get a full decision trace and a scored outcome. Run it again with
> the same seed. Get the byte-identical trace. You can now prove, audit, and reproduce exactly what
> any learner would experience.

Delivery vehicle: a copy-paste quickstart that authors ~3 events, runs a seed, and asserts
`replay(seed) === run(seed)` in under 5 minutes; later, a hosted browser playground.

## DX scorecard (today → achievable)

| # | Dimension | Today | Achievable | The gap, in one line |
|---|-----------|:-----:|:----------:|----------------------|
| 1 | Getting started / TTHW | 1 | 8 | Cannot install or run anything; needs a package + a <5-min quickstart |
| 2 | API ergonomics | 3 | 8 | Real API exists but is spread over 26 modules with no barrel and no `createEngine` facade; caller hand-wires the loop |
| 3 | Authoring schema | 4 | 7 | Expressive + zod-validated, but undocumented and high concept-load (flags/phases/arcs/rolls/weights) for a first scenario |
| 4 | Content decoupling | 3 | 8 | `sim.ts` + `endings.ts` import `../content`; the core is not cleanly runnable on the dev's own bank |
| 5 | Determinism (as a product) | 2 | 9 | The determinism is real and strong, but it is not an exposed API or a documented contract — the killer feature is hidden |
| 6 | Docs / findability | 1 | 8 | Zero external-developer docs, examples, or authoring guide |
| 7 | Packaging / credibility | 1 | 8 | `private`, no `exports`/`types`/LICENSE/CHANGELOG/SemVer posture; nothing signals "safe to depend on" |
| 8 | Competitive standing | 3 | 8 | Loses on tooling/docs/community; wins uniquely on reproducibility + scoring if surfaced |

Aggregate: **~2.3 today → ~8.0 achievable.** The delta is almost entirely packaging, surfacing,
and docs — not engine work. The hard part (a correct deterministic engine) is already done.

### What a 10 looks like, per dimension
1. `npm create scenario-app` scaffolds a runnable training drill in one command.
2. Simple case is one call `run(scenario, seed)`; the complex case uses the same API (progressive disclosure).
3. A minimal scenario is ~5 lines; every field discoverable via TS autocomplete + a schema reference; validator errors state problem + cause + fix.
4. The engine core has zero content imports; content is 100% pluggable; Velmora is just one content pack.
5. A first-class `replay(seed)` / `verify()` API, a written determinism SLA, and a property test the dev can run.
6. A docs site with a live playground and one complete worked compliance-drill example.
7. Mature package: dual ESM, exported types, LICENSE, SemVer + CHANGELOG, near-zero deps, tree-shakeable.
8. The obvious pick when you need reproducible, scored, offline scenarios in TypeScript.

## Extraction roadmap (concrete, ordered by leverage)

- **E0 — Decouple content from core.** Remove `../content` imports from `sim.ts` + `endings.ts`;
  inject `events` / `paths` / `endings` as parameters. Deliverable: the core runs an arbitrary bank.
- **E1 — Public API + barrel.** Add `src/engine/index.ts` exporting a curated surface:
  `createEngine({ events, paths, config })` → `.run(seed)` (headless) + `.step()` (interactive) +
  `.replay(seed)`, plus the ~10 real public types. The facade hides the draw → resolve → advance loop.
- **E2 — Package it.** Separate build/package (e.g. `scenario-engine`): drop `private`, add
  `exports`/`module`/`types`, dual ESM, `LICENSE`, SemVer + `CHANGELOG`. Velmora's political content
  becomes a content pack that depends on the engine.
- **E3 — Determinism as a feature.** Ship `replay(seed)` / `verify()` and a written determinism
  contract (what is guaranteed, what breaks it). Publish the seed-sweep property test as an example.
- **E4 — Authoring DX.** Documented schema reference, a "minimal viable scenario" starter (id / body /
  choices / fx; advanced fields optional), and `validateScenario()` surfacing zod errors as
  problem + cause + fix.
- **E5 — Docs + the magical-moment quickstart.** Developer README, a <5-min quickstart that authors a
  small compliance drill and asserts identical replay, one complete worked example, an API + schema
  reference. Optional: a browser playground.
- **E6 — Credibility polish.** CI badge, exported types verified, changelog discipline, low deps,
  an `examples/` directory.

Rough sizing with AI assist: E0-E3 are the load-bearing 60% and are a few focused days of work
(human) / a handful of sessions (CC). E4-E6 are docs + polish.

## The decision

This is not a small side quest; it is a product pivot decision (ship a developer library alongside,
or instead of leaning on, the consumer game). The review's job is to make it a good decision, not to
make it for you. The engine is worth extracting *if* you want to be in the developer-tools business
for reproducible scenario sims; if the game is the product, this stays a "someday" note.
