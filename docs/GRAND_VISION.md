# Velmora — The Paper of Record

A grander, story-driven, heavily-animated direction. Output of a creative+engineering
panel (5 recon readers → 5 competing directions → judged synthesis). The spine won on
coherence: **Velmora is already a newspaper that hasn't admitted it.**

## Vision

**You don't read the story of your reign — you print it.** Velmora becomes one
continuous newspaper going to press. Every turn is tomorrow's front page. The press
physically *runs* between choices (an ink-roller wipe, not a fade). The paper narrates
the consequence of your last act as a live STOP-PRESS lead. The pressroom runs visibly
*hotter* as stakes climb (denser ink, tighter halftone, a darkening press-lamp
vignette). The masthead editions forward (Vol. II · No. 7) and re-plates itself into a
free press or your own propaganda organ depending on how you rule. Each promotion is a
**SPECIAL EDITION** takeover. The finale is the verdict going to press with your rival
on page one. Your reign ends bound into **The Morgue** — an archive of every front page
you made.

The riso propaganda-print identity is untouched. What changes is that **the frame
becomes an actor.**

## Why this spine (scores)

| Direction | Impact | Feasibility | Coherence | Verdict |
|-----------|:---:|:---:|:---:|---|
| Cinematic Chronicle | 9 | 8 | 8 | Great ceremony grammar, but "film" is a graft onto a print aesthetic |
| **The Velmora Wire** | 9 | 8 | **10** | **SPINE** — finishes the identity already in the code |
| Crescendo (`--intensity`) | 8 | 9 | 8 | Best system-per-byte; the nervous system, not the frame |
| Dramatis Personae | 9 | 6 | 9 | Highest story payoff, heaviest authoring cost — the deep, late layer |
| The Monument | 7 | 7 | 8 | Strong beat, narrow scope — dropped as an element, its ceremony survives |

The game already ships a `VELMORA WIRE` ticker, a masthead, newspaper/bulletin/crisis
event genres, halftone press texture, STOP-PRESS headlines, and a phase ramp described
as "the press tightens as you climb." The Wire completes that; the others add a second
metaphor. Cinematic grandeur is kept — *inside* the frame, as broadsheet takeovers that
reuse the shipped cinematic stills.

## Redesign scope — "grander riso, keep identity"

**No repaint.** All 5 palettes, the type stack, every `--rp-*` token, halftone/misreg/
foil, the 31-character cast, the cinematic stills — kept. Four moves make riso grander
with no new art:

1. **The press becomes physical** — screen changes are press runs; event cards arrive as
   wet sheets sliding into registration; halftone drifts and tightens under a press lamp.
2. **Scale via broadsheet takeovers** — act breaks + finale seize the full frame as a
   Special Edition (giant Anton headline, halftone wash, a cinematic still as the page-one
   photo). Cinematic grandeur, inside the print metaphor, reusing precached assets.
3. **The ticker graduates** from décor to narrator + regime meter (free / captured / ████).
4. **The archive becomes legacy** — Codex → The Morgue: bound front pages, wanted-poster
   rivals, a cast ledger.

## Phased build plan (impact-per-effort; each phase ships something visible)

- **G1 — THE PRESS RUN** *(the spine; proves the identity in one PR)*: ink-roller press-wipe
  replacing `fadeUp` in `go()`; a live STOP-PRESS ticker narrator composed from your last
  choice; fix the event-card `slam`-every-paint jank. ~1.2kB CSS. **← start here.**
- **G2 — THE PRESSROOM RUNS HOT**: one `--intensity` token (tension + phase + heat) driving a
  press-lamp vignette, halftone density, and overshoot swell; masthead editioning; fixes a
  seeded-RNG leak in `confetti()` for free.
- **G3 — SPECIAL EDITION ACT BREAKS**: a lazy broadsheet-takeover component for promotions +
  finale, reusing the shipped stills; misreg tightens live; gold foil at Act III.
- **G3.5 — THE FRONT-PAGE CAST**: relationship-driven reaction shots on speakers; expr 5→8
  moods (betrayed/shocked/determined, parametric SVG, no art cost); the FACE-OFF showdown card.
- **G4 — THE PAPER'S SLANT**: ticker + masthead name driven by heat/cult/media (independent
  press → propaganda organ → censored ████); pre-finale countdown editions.
- **G5 — THE MORGUE**: Codex → newspaper archive; endings as bound front pages; a cast ledger;
  epilogue montage that staggers like bound pages.
- **G6 — THE LIVING CAST, DEEP** *(expensive, multi-session)*: three-stage nemesis arc, advisor
  loyalty/defection arcs, curtain-call endings. The animation is cheap; the cost is authoring
  ~20-40 arc steps and proving they never soft-lock under the 600-seed sweep. Sequence last.

Two real bugs the recon caught, fixed for free along the way: the event-card `slam` fires on
every paint (jank, G1), and `confetti()` consumes `Math.random` off the seeded stream
(determinism leak, G2).

## Decisions (taste/ambition forks)

1. **Frame** — Newspaper (recommended: completes the shipped identity) vs literal Film
   letterbox + Roman-numeral act cards. The one call that changes the visual grammar;
   everything else is stable under either.
2. **Audio** — stingers only (default; audio is opt-in and mostly unheard) vs a full adaptive
   `--intensity`-driven score as a headline feature.
3. **Story depth** — bank G1-G5 (+ the cheap cast look) first, then decide on G6 with a shipped
   product in hand, vs greenlight the full multi-session arc authoring now.
