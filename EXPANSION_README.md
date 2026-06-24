# Velmora — The Dark Mirrors

> An expansion pack for **Velmora — Rise to Power**. Three new roads to power, each a distinct machine for making a ruler, layered onto the same engine as the two base paths. Additive only: the Ballot and Vanguard paths and all existing content are untouched.

The base game gives you two roads everyone can see: win the people at the ballot box, or climb the one-party machine. **The Dark Mirrors** adds the three roads the base game deliberately leaves unnamed — the strongman, the magnate, and the cleric. Same six stats, same cartoon engine, three new vocabularies of power.

---

## What's in the pack

| Path                    | System          | One-line premise                                                                         | Promotion mechanic                                      |
| ----------------------- | --------------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| **The Iron Order**      | Strongman state | Parliament failed; the people want order, and you will take everything else in exchange. | `purge` — eliminate rivals, don't merely beat them      |
| **The Gilded Republic** | Plutocracy      | The government isn't your enemy — it's your portfolio.                                   | `acquisition` — rivals are bought, not defeated         |
| **The Anointed Path**   | Theocracy       | The Council speaks for the divine; you will speak for the Council.                       | `council` — rivals are out-prayed, anointed not elected |

All three are **morally symmetrical** with the base two: you can succeed on any path and fail on any path. The game's lens is _how power works and what it costs_, never _which system is good_. The endings carry the moral weight, not the path framing.

---

## How the three roads differ

Every path remaps the same six internal stats to its own vocabulary, so the engine (clamping, gauges, contests, ending math) is shared — only the labels, the events, the promotion mechanic, and the endings change.

### The Iron Order — _theme-iron_

- **Start:** Fervor 44 · War Chest 28 · Cohesion 36 · Propaganda 32 · Vanguard 50 · Exposure 18 — a high paramilitary base and high scrutiny; you must seize money and the airwaves.
- **Stats:** support→**Fervor**, funds→**War Chest**, influence→**Cohesion**, media→**Propaganda**, base→**Vanguard**, heat→**Exposure**.
- **Factions:** the Ultras · the Officer Corps · the Industrialists.
- **Promotion — `purge`:** a paramilitary loyalty roll keyed on Cohesion + Vanguard; Exposure bleeds your strength. Win and a rival is removed from public life; lose and the movement consolidates against you.
- **Finale ranks:** THE ARCHITECT · THE DESPOT · THE PUPPET · THE STRONGMAN · THE WRECKAGE · THE WARLORD (default).
- **Failure:** NEUTRALIZED (Exposure ≥ 100) · THE MOVEMENT COLLAPSED (Fervor ≤ 0).

### The Gilded Republic — _theme-gilded_

- **Start:** Approval 38 · Capital 70 · Leverage 40 · Narrative 35 · Network 30 · Scrutiny 12 — money is your starting advantage; you've never needed to be liked and haven't built your web yet.
- **Stats:** support→**Approval**, funds→**Capital**, influence→**Leverage**, media→**Narrative**, base→**Network**, heat→**Scrutiny**.
- **Factions:** the Old Families · the Tech Barons · the Finance Bloc.
- **Promotion — `acquisition`:** a wealth-weighted contest dominated by Capital, seconded by Leverage. Rivals are absorbed into the portfolio; money is quiet, so a clean win barely raises Scrutiny.
- **Finale ranks:** THE DYNASTY · THE MONOPOLIST · THE PHILANTHROPIST · THE FIGUREHEAD · THE WRECKAGE · THE PROPRIETOR (default).
- **Failure:** INDICTED (Scrutiny ≥ 100) · OUTBID (Approval ≤ 0).

### The Anointed Path — _theme-anointed_

- **Start:** Devotion 52 · Treasury 32 · Authority 30 · Doctrine 38 · Congregation 48 · Heresy 8 — the faithful love you from the start, but you're an outsider in the Council; heresy comes slowly, then all at once.
- **Stats:** support→**Devotion**, funds→**Treasury**, influence→**Authority**, media→**Doctrine**, base→**Congregation**, heat→**Heresy**.
- **Factions:** the Orthodox · the Reformists · the Mystics.
- **Promotion — `council`:** a piety-weighted blessing keyed on Devotion + Authority; Heresy bleeds your strength. The Council anoints you — no vote, just the laying on of hands.
- **Finale ranks:** THE SAINT · THE INQUISITOR · THE ORACLE · THE REFORMER · THE CARETAKER · THE SHEPHERD (default).
- **Failure:** EXCOMMUNICATED (Heresy ≥ 100) · THE FLOCK DIVIDED (Devotion ≤ 0).

Each path's six finale ranks are reached by **how you played**, not which buttons you mashed — the flags your choices set (a clean-hands climb, a trail of purges, a captured donor bloc, a cult of personality, a reform coalition) decide which mirror you see at the top. Every rank is reachable: the reachability is asserted in the unit suite, and a seeded sweep confirms each path produces a spread of endings under play.

---

## Content & safety statement

The Dark Mirrors paths sit closer to real ideological territory than the base game, and the content contract is correspondingly strict and **enforced by an automated linter in CI**:

1. **No real ideology, religion, nation, party, regime, leader, or living person is named, depicted, or caricatured** in any player-visible string. The nations are fictional (the Iron State, the Free Territories, the Sacred Covenant — all of Velmora); the paths are _The Iron Order_, _The Gilded Republic_, _The Anointed Path_. The mechanics are recognizable; the labels are invented.
2. Events are written at the level of the **mechanism** of power ("your inner circle is fracturing"), never the **identity** of any real movement, place, or era.
3. The religious path uses only a **non-denominational** vocabulary of devotion, doctrine, and heresy, and an abstract radiant-eye emblem — no cross, crescent, star, scripture, deity, or clergy title of any real faith.
4. A content-safety **denylist** (real ideology / regime / institution / religion / leader terms, plus banned symbols) scans every event and ending string and the static path/faction/advisor data on every `content:validate` run; a hit fails the build.
5. **Age rating target: Teen / PEGI 12.** Violence is political and consequence-based; no graphic content. The game is fiction and satire — a study of how power corrupts and what it costs, not an endorsement of any system it depicts.

---

## Distribution

Per the project's product direction, the base game (Ballot + Vanguard) stays **free**, and The Dark Mirrors is the **paid expansion**. The gate is a client-side entitlement (`MetaState.entitlements.expansion`, checked via `isExpansionUnlocked`) — the content ships in the bundle, with no separate download and no pay-to-win. During development and in the current build the entitlement defaults to **unlocked**, so all five paths are always playable; wiring a real purchase flow to that seam is a later, intentionally-deferred step.

---

## For developers

The expansion is data + a few engine branches, not a fork:

- **Paths / stats / factions / phases:** `src/content/paths.ts` (`iron` / `gilded` / `anointed` keys) and `src/engine/factions.ts` (`BLOCS`).
- **Event banks:** `src/content/events-iron.ts`, `events-gilded.ts`, `events-anointed.ts` (12 each) + `events-shared.ts` (3 shared crises), all wired into `src/content/all-events.ts`.
- **Promotion math:** `promoPlayerStrength` branches for `purge` / `acquisition` / `council` in `src/engine/contest.ts`.
- **Endings:** per-path finale blocks (`ironFinale` / `gildedFinale` / `anointedFinale`) and the six new failure causes in `src/engine/endings.ts`, dispatched ahead of the generic ballot/vanguard chain.
- **Advisors:** four per path in `src/engine/cabinet.ts`.
- **Theme + path cards:** `body.theme-iron|gilded|anointed` token blocks and `.path-card.iron|gilded|anointed` in `src/styles.css`; the cards + the Dark Mirrors separator in `index.html`.
- **Tests:** `tests/unit/endings.test.ts` (per-rank reachability), `tests/unit/sweep.test.ts` (5-path seeded reachability sweep, ≥4 distinct ending ranks per path), `tests/e2e/expansion.spec.ts` (all five roads selectable; each new path plays to a tagged ending with zero console errors).

See `EXPANSION_BRIEF.md` for the original design spec and `docs/PROGRESS.md` for the phase-by-phase build ledger.
