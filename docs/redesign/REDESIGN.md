# VELMORA — UX/UI Redesign (design-of-record)

**Chosen direction:** **Overprint — Risograph Propaganda** ("Two inks. One nation. Your face on every wall.")
Selected by the product owner from a 5-direction exploration (judge-panel workflow). Prototype: `docs/redesign/overprint-prototype.html` (open in a browser; toggles for theme + the print-fidelity ramp).

## Why this direction

A risograph-printed propaganda artifact — the thing a regime's ministry of information would actually produce — which is the exact genre for a rise-to-power game. Its signature move fuses concept with mechanic: **print fidelity IS the progress meter.** Early phases read as a cheap, single-ink, mis-registered handbill; the apex reads as crisp dual-ink registration with gold foil. It is a **pure-CSS reskin** riding the existing `body.theme-*` class swap (no new JS, initial JS stays ~33 kB), it **fixes the verified offline-PWA font violation** (self-hosted fonts), and it kills the existing white-on-dark contrast failures by moving all reading onto paper surfaces. Grafts the runner-up "Ballot & Banner" editorial hierarchy (border-weight contrast, masthead HUD, compressed stat-ledger) as a second wave.

Scores (of 35): DOSSIER/Brutalist 32 · **Overprint 31** · Cardstock 31 · Ballot&Banner 29 · Chiaroscuro 27. (Overprint chosen over the top score for feasibility + concept-mechanic fusion + lower risk.)

## Token system (drop into `:root` / `body.theme-*` in `src/styles.css`)

Per theme: **three printable inks over one paper**, plus derived layers. All text pairings AA-verified against the **solid** ink (never the screened halftone tint, so the axe gate can't be gamed).

- `--paper` / `--paper-2` — warm uncoated ground (ALL reading happens here)
- `--ink-key` — near-black, ALL body text + borders (~13–15:1 on paper)
- `--ink-spot` — loud accent ink (knockout chips, primary buttons, hero bands); `--spot-ink` = text reversed out of it (pre-vetted ≥4.5:1)
- `--ink-b` — second ink (overprints with `--ink-spot` via `mix-blend-mode:multiply` → genuine third color)
- `--foil` — metallic accent, **decorative / large / ≥3px stroke only, NEVER body text** (the gold-fails-4.5:1 rule, encoded as a lint/QA item)
- `--halftone` (spot at low alpha, dot texture) · `--misreg` (off-register ghost)
- Fidelity ramp tokens: `--misreg` (offset), `--dot` (halftone fineness), `--foil-on` — driven by a "press tier" derived from `phases[].n`

Themes (AA-checked): **neutral** paper `#FBF1DC` / key `#161320` / spot `#C8324A`; **ballot** paper `#F4F6FB` / key `#11203F` / spot `#1F407F` (federal); **vanguard** paper `#F3E7D8` / key `#1A0907` / spot `#B22118` (blood). Future expansion themes pre-specified: **iron** (bone/burnt-amber), **gilded** (cream/deep-green + gold), **anointed** (bone/indigo) — same 6 tokens, no layout fork.

**Type (self-hosted, subset .woff2):** display = a condensed poster grotesque (prototype uses **Anton**); body = a readable grotesque/serif (prototype uses **Hanken Grotesk**); stencil accent for kickers/stamps (**Stardos Stencil**); mono for datelines/numerals (**Space Mono**). The .70rem-label → 2.4rem-headline leap IS the hierarchy.

**Other tokens:** border-weight hierarchy `--bw-hero:5px / --bw-base:3px / --bw-hair:1.5px` (the grafted elevation move); offset hard shadows kept + a `--shadow-misreg` off-register double-shadow; motion `--ease-print` riso ink-settle, sharper `--d-slam`. `high-contrast` collapses paper→white, key→black, drops halftone/misreg, fattens rules (the escape hatch guaranteeing axe across all themes). `reduced-motion` (OS + `body.force-reduce-motion`) removes press-action motion while the **static** print aesthetic survives.

## Build plan (each step independently shippable; gates green every step)

1. **Tokens first** — add the riso token set to `:root` + theme blocks (mapping from existing names so nothing breaks; no screen consumes them yet) + the 3 future theme blocks. Gate: build + check-size + axe unchanged.
2. **Fonts** — self-host + subset (.woff2), drop the Google Fonts `<link>`s, `@font-face` + precache for offline. Fixes the runtime-network PWA violation. Gate: check-size (font budget), axe, offline smoke.
3. **Global primitives** — `.btn`/`.panel`/`.chip`/`.eyebrow`, border-weight hierarchy, off-register shadow, halftone ground, the phase-fidelity hook. Gate: axe across all themes incl. high-contrast + reduced-motion.
4. **Title + colophon** — closes the confirmed white-on-dark AA failures by moving credits onto a paper colophon.
5. **Game / HUD** — the press-strip HUD + compressed "index of the state" stat-ledger + phase-keyed fidelity; tokenize the gauge `FILL` map. (Highest-value screen.)
6. **Event card + choices** — masthead band, serif body w/ drop-cap, 5 print variants, slam+misreg-snap; choices as the numbered "ballot."
7. **Path-select + create** — facing campaign handbills (scoped theme tokens) + "File a Candidacy" dossier.
8. **Contest + ending** — "Election Night / The Verdict" board + "History's Verdict" commemorative front page; tokenize remaining inline hexes + confetti palette; apex foil.
9. **Codex/Records/Slots/Settings/Tutorial** — "ministry archive" treatment; full axe matrix (6 themes × high-contrast × reduced-motion) + visual regression + Lighthouse.
10. **Optional B&B deepening** — full broadsheet-grid restructuring + avatar SVG color tokenization + variable-serif upgrade (only if budget/axe stay green).

## Decisions for the product owner (don't block step 1)

1. **Print-fidelity granularity** — per-phase (`phases[].n`, granular, more impressive) vs a few milestones (fewer CSS states to QA across themes)? *Default: per-phase, 3 tiers (one per office).*
2. **Font sign-off** — ship a **static** editorial serif (guaranteed budget headroom) vs attempt a subset-variable serif? *Default: static.*
3. **Avatar/seal palette** — keep the current cartoon avatar palette for v1 (reads fine on paper) and defer per-theme re-inking to step 10? *Default: keep for v1.*
4. **Foil at apex** — a subtle metallic CSS sheen vs a flat gold ink (unambiguously AA + cheap)? *Default: flat gold, sheen only if reduced-motion-gated.*
5. **Release scope** — ship per-screen reskins (steps 1–9) as the v1 redesign and treat the full broadsheet-grid rebuild (step 10) as a fast-follow? *Default: yes, 1–9 = v1.*
6. **Future-theme content safety** — confirm the iron/gilded/anointed ink choices don't read as a specific real flag/movement (the content linter covers names/symbols, not palettes).

## Status

- [x] Design-direction exploration (5 directions, scored, synthesized) — workflow
- [x] Direction chosen: **Overprint** · prototype built + render-verified (zero console errors, all 3 current themes)
- [ ] Step 1 — token foundation (next)
- [ ] Steps 2–10
