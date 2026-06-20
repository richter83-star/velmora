# VELMORA — Expansion Pack: Three New Paths
## Add-On Brief for Claude Code

> Drop this file alongside `COMMERCIAL_BRIEF.md` in the repo. Reference it as the full spec for the expansion pack. Follow the same Operating Protocol as the main brief: plan-mode first, one phase at a time, test gates before advancing, invariants hold after every change.

---

## 0. What This Is

Three new playable paths added to VELMORA as a discrete, self-contained expansion pack. Each is a distinct power system with its own stat vocabulary, factions, phase arc, promotion mechanic, crisis pool, advisor roster, event bank, ending tree, visual theme, and fictional nation. Together they form **"The Dark Mirrors" expansion** — three roads to power that the ballot path and vanguard path deliberately leave unnamed.

The existing two paths and all existing content stay untouched. The expansion is additive only.

---

## 1. Content-Safety Contract (non-negotiable, enforced by the content linter)

The same invariants from `COMMERCIAL_BRIEF.md` apply here with extra force, because these paths are closer to real-world ideological territory:

1. **No real ideology names appear in gameplay.** The paths are named *The Iron Order*, *The Gilded Republic*, and *The Anointed Path*. The words "fascism," "capitalism," "communism," "Islam," "Christianity," "Judaism," or any real religion's name never appear in event text, choice text, ending text, UI labels, or any player-visible string. The mechanics are recognizable; the labels are fictional.
2. **No real nations, leaders, parties, movements, or ongoing conflicts are depicted, referenced, or caricatured.** Nations are fictional (see Section 3). Events are written at the level of the *mechanism* of power, not the *identity* of any real movement.
3. **All three paths are morally symmetrical with the existing two.** You can succeed on any path and fail on any path. The game's moral lens is "power corrupts and here are its mechanics" — not "these systems are evil and those are good." The endings provide the moral weight, not the path framing.
4. **The content linter must flag any string matching a blocklist of real ideology/religion/nation/leader names.** Add this check to the CI step introduced in Phase 1 of the main brief.
5. **Age rating target stays T (Teen) / PEGI 12.** Violence is political and consequence-based; no graphic content.

---

## 2. Architecture Notes

### How new paths slot into the existing engine

The engine already supports multiple paths via the `PATHS{}` object. Each new path is one new key in `PATHS{}`, following the exact same schema as `ballot` and `vanguard`:

```js
PATHS.iron = {
  key, land, theme,
  statNames: { support, funds, influence, media, base, heat },
  start: { support, funds, influence, media, base, heat },
  factions: [ {id, name, desc}, ... ],
  phases: [
    { n, title, kicker, goalTurns, emoji, promo:{type, label, emoji, baseOpp, oppTitle} },
    ...
  ],
  oppNames: [ ... ]
}
```

**New promo types introduced by the expansion:**

| Path | Phase 1–2 promo type | Mechanic |
|---|---|---|
| Iron Order | `"purge"` | Paramilitary loyalty roll; spend Fervor + Cohesion; rival is eliminated, not merely defeated |
| Gilded Republic | `"acquisition"` | Wealth-weighted contest; spend Capital + Leverage; rivals are bought, not beaten |
| Anointed Path | `"council"` | Piety-weighted blessing; spend Faith + Devotion; rivals are outprayed, not outfought |

Each new promo type needs: a `promoPlayerStrength` branch, a `promoBoosts` branch, a `renderPromotion` display variant, and a `resolvePromotion` result text variant. The finale promo type stays `"finale"` for all three — the engine already handles it generically.

**New stat vocabulary:** Each path remaps the six internal stat keys to path-flavored display names via `statNames`. The keys (`support`, `funds`, `influence`, `media`, `base`, `heat`) are the same across all five paths; only the labels change. This means all existing engine logic (clamping, gauges, floaties, event fx, ending math) works without modification.

**New death causes:** Each path adds two new cause strings (heat-death and support-death variants). Add them to `deathCause()` and `evaluateEnding()` switch blocks.

**New themes:** Three new CSS theme classes. Each overrides the same `--bg1`, `--bg2`, `--accent`, `--accent2`, `--gold` tokens that the ballot and vanguard themes use.

**New path cards:** Three new `<article class="path-card [key]">` elements added to the `#screen-path` grid. Add corresponding CSS `.path-card.[key]` gradient rules.

**Advisor catalog extension:** Each new path adds 4 advisors to the existing `ADVISORS{}` object, following the same schema.

**Content linter extension:** Add all new event IDs to the uniqueness check; add new `then:` reference validation; add the ideology-name blocklist check.

---

## 3. The Three Paths

---

### PATH A — The Iron Order

**Fictional nation:** The Iron State of Velmora — a nation in crisis, gripped by economic humiliation and institutional failure, ripe for a strongman.

**Theme:** `theme-iron` — ash grey (`--bg1:#2E2E2E`) and burnt orange (`--bg2:#1A0F00`), accent crimson (`--accent:#C0392B`), gold highlight (`--gold:#E67E22`). The visual language is propaganda posters, stamped seals, torch-lit rallies.

**The premise:** You are a decorated military officer turned political agitator. The parliament has failed. The people want order. You will give it to them — and take everything else in exchange.

**Stat remapping:**

| Internal key | Iron Order display name | What it means |
|---|---|---|
| `support` | **Fervor** | Mass enthusiasm; the crowd's belief in the movement |
| `funds` | **War Chest** | Movement financing; arms, uniforms, printing presses |
| `influence` | **Cohesion** | Internal unity of the Order; officers loyal and aligned |
| `media` | **Propaganda** | Control of the information environment |
| `base` | **Vanguard** | The paramilitary core; the true believers who do the work |
| `heat` | **Exposure** | Scrutiny from courts, press, foreign powers, internal doubters |

**Starting stats:** `{ support:44, funds:28, influence:36, media:32, base:50, heat:18 }`
(High base — the paramilitary is your foundation. High heat — you're already watched. Low funds and media — you have to seize them.)

**Death causes:**
- `heat >= 100` → `"arrested"` — The courts, the military, or a foreign coalition moved first.
- `support <= 0` → `"dissolved"` — The movement collapsed from within; you became a cautionary tale.

**Factions (three internal factions of the Order):**

| id | Name | Description |
|---|---|---|
| `ultras` | The Ultras | True believers. Total commitment, zero compromise. They want the whole thing, now. |
| `officers` | The Officer Corps | Disciplined pragmatists. They want order, not ideology. Will follow a winner. |
| `industrialists` | The Industrialists | Money and manufacturing. Backed you because the unions frightened them. Expect returns. |

**Phase arc:**

| Phase | Title | Kicker | Goal Turns | Promo |
|---|---|---|---|---|
| 1 | Movement Leader | The Streets | 7 | `purge` — *The Loyalty Test* — eliminate a rival faction leader. baseOpp: 44 |
| 2 | Chief of State | The Ministries | 7 | `purge` — *The Night of Reckoning* — consolidate all power in one night. baseOpp: 52 |
| 3 | Supreme Leader | The Iron Palace | 8 | `finale` — *The Final Reckoning* |

**Opponent name pool:** `["Dresner","Halvik","Motte","Cern","Ault","Braun","Veck","Ostler","Faul","Sieg"]`

**Promotion mechanic — `purge`:**
- Player strength = `cohesion*0.40 + vanguard*0.32 + propaganda*0.14 + fervor*0.14 - exposure*0.20`
- Boosts:
  - 🪖 *Deploy the Vanguard* — spend Vanguard 16 → +9 strength
  - 📢 *Blanket the Airwaves* — spend Propaganda 12 → +7 strength
  - 🗡️ *Find the Dirt* — spend Cohesion 10 → +6 strength, +8 Exposure
- Win: rival is "removed from public life"; player gains Cohesion + Vanguard. Exposure spikes.
- Lose: rival survives and consolidates against you → `endGame("arrested")` or `endGame("dissolved")` depending on dominant stat.

**Advisors (4):**

| id | Name | Role | Passive | Description |
|---|---|---|---|---|
| `rally_master` | Klaus Hern | Rally Director | `base:+1, support:+1` | Keeps the crowd hot. Vanguard and Fervor tick up every turn. |
| `censor` | Dir. Voss | Press Censor | `media:+2, heat:+1` | Propaganda rises; so does the foreign scrutiny of why you need it. |
| `treasurer_iron` | Mag. Blum | Movement Treasurer | `funds:+2, heat:+1` | Money flows in; where from is nobody's business. |
| `jurist` | Prof. Kels | Legal Architect | `heat:-2, influence:+1` | Makes everything you do technically lawful. One point of Exposure cooled per turn. |

**Endings (finale, flag-branched):**

| Rank | Trigger | Title |
|---|---|---|
| THE ARCHITECT | `cohesion>=65 && vanguard>=55 && exposure<50` | *The State You Built* |
| THE DESPOT | `bloody_hands || purge_count>=4 || exposure>=70` | *Fear Is the Only Law* |
| THE MARTYR | `dissolved` (support loss) | *The Movement Outlived You* |
| THE PUPPET | `industrialists standing>=70 && cohesion<45` | *The Men Behind the Desk* |
| THE STRONGMAN | `composite>=130 && support>=50` | *Stability, At a Price* |
| THE WRECKAGE | `composite<=70` | *What You Left Behind* |
| DEFAULT | — | *Order, More or Less* |

**Failure endings:**
- `arrested` → **NEUTRALIZED** — "The courts, the generals, or a foreign coalition moved in the night. The trial is theatrical and the verdict predetermined. You become the thing you always accused others of being: a warning."
- `dissolved` → **THE MOVEMENT COLLAPSED** — "You gave them a cause and they gave you everything — until the day the cause ran dry and they gave you nothing at all. The party dissolves into splinter groups, each claiming your name while ignoring your fate."

---

### PATH B — The Gilded Republic

**Fictional nation:** The Free Territories of Velmora — a nation where everything has a price, and the price of power is simply higher than the price of everything else.

**Theme:** `theme-gilded` — deep navy (`--bg1:#1A2744`) and midnight green (`--bg2:#0B1A12`), accent gold (`--accent:#D4AF37`), secondary emerald (`--accent2:#2E8B57`). The visual language is mahogany boardrooms, champagne toasts, offshore ledgers.

**The premise:** You are a wealthy heir turned corporate operator. The government isn't your enemy — it's your portfolio. You will acquire it, piece by piece, until there's nothing left to buy and no one left to answer to.

**Stat remapping:**

| Internal key | Gilded Republic display name | What it means |
|---|---|---|
| `support` | **Approval** | Public favorable ratings; useful for legitimacy theater |
| `funds` | **Capital** | Raw financial firepower; the primary resource on this path |
| `influence` | **Leverage** | Favors held, compromises owned, votes controlled |
| `media` | **Narrative** | Who owns the story; which outlets are on the payroll |
| `base` | **Network** | The web of loyalists, donors, fixers, and heirs apparent |
| `heat` | **Scrutiny** | Regulators, journalists, prosecutors, and foreign auditors |

**Starting stats:** `{ support:38, funds:70, influence:40, media:35, base:30, heat:12 }`
(Very high Capital — money is your starting advantage. Low support — you've never needed to be liked. Low base — you haven't built your network yet.)

**Death causes:**
- `heat >= 100` → `"indicted"` — A prosecutor with nothing to lose just found your offshore accounts.
- `support <= 0` → `"hostile_takeover"` — A rival faction of the elite moved against you while the public watched and cheered.

**Factions (three elite blocs):**

| id | Name | Description |
|---|---|---|
| `old_money` | The Old Families | Dynasties who have owned Velmora for generations. Suspicious of new entrants; invaluable once won. |
| `tech_barons` | The Tech Barons | New money, global reach, asymmetric influence. Impatient, data-driven, amoral. |
| `finance_bloc` | The Finance Bloc | Banks, funds, and instruments you don't need to understand to use. They understand you perfectly. |

**Phase arc:**

| Phase | Title | Kicker | Goal Turns | Promo |
|---|---|---|---|---|
| 1 | Board Member | The Boardroom | 7 | `acquisition` — *The Hostile Bid* — outspend a rival for control of a key institution. baseOpp: 44 |
| 2 | Chairman | The Tower | 7 | `acquisition` — *The Consolidation* — acquire the last independent check on your power. baseOpp: 53 |
| 3 | The Architect | The Summit | 8 | `finale` — *The Final Reckoning* |

**Opponent name pool:** `["Voss","Hartley","Maren","Strix","Calloway","Dunne","Feld","Quint","Ashmore","Lorne"]`

**Promotion mechanic — `acquisition`:**
- Player strength = `capital*0.55 + leverage*0.25 + narrative*0.12 + network*0.08`
- Boosts:
  - 💰 *Outbid Everyone* — spend Capital 20 → +10 strength
  - 🤝 *Call in the Favors* — spend Leverage 16 → +8 strength
  - 📰 *Buy the Coverage* — spend Narrative 12 → +6 strength, +5 Scrutiny
- Win: rival is "absorbed into the portfolio." Player gains Capital + Leverage. Low Scrutiny spike (money is quiet).
- Lose: rival acquires enough to block you → `endGame("hostile_takeover")`.

**Advisors (4):**

| id | Name | Role | Passive | Description |
|---|---|---|---|---|
| `tax_counsel` | Ms. Pryor | Tax Architect | `funds:+3, heat:+1` | Capital accumulates faster; so does the interest of auditors. |
| `pr_chief` | Dax Rowan | Public Relations Chief | `support:+1, media:+1` | The face the public sees costs one point of Approval and one of Narrative per turn. |
| `fixer_gilded` | T.K. Marsh | The Fixer | `influence:+2, heat:+1` | Leverage grows steadily. The methods are unspecified. |
| `regulator` | Cmsr. Fell | Captured Regulator | `heat:-3` | Three points of Scrutiny cooled per turn. The Commissioner is very well compensated. |

**Endings (finale, flag-branched):**

| Rank | Trigger | Title |
|---|---|---|
| THE DYNASTY | `network>=65 && capital>=60 && scrutiny<40` | *The Empire That Outlasts You* |
| THE MONOPOLIST | `capital>=75 && leverage>=60` | *When You Own Everything* |
| THE INDICTED | `indicted` (heat death) | *The Prosecutors Finally Got There* |
| THE PHILANTHROPIST | `secret_reformer && support>=55` | *You Gave It All Back (Most of It)* |
| THE FIGUREHEAD | `old_money standing>=70 && leverage<40` | *The Old Families Were Always in Charge* |
| THE WRECKAGE | `composite<=70` | *A Fortune, Spent on the Wrong Things* |
| DEFAULT | — | *Comfortable, Powerful, Unremarkable* |

**Failure endings:**
- `indicted` → **INDICTED** — "The prosecutor had nothing to lose, which is exactly the kind of prosecutor you never anticipated. The offshore structures unravel on a live feed. You spend more on legal fees in one month than most people earn in a lifetime. It doesn't help."
- `hostile_takeover` → **OUTBID** — "A rival faction of the elite moved while you were overextended and the public was looking. There is a poetry to it — you built your whole career on the acquisition, and then you became the acquired."

---

### PATH C — The Anointed Path

**Fictional nation:** The Sacred Covenant of Velmora — a nation governed by divine mandate, where temporal and spiritual power have merged into one unquestioned authority.

**Theme:** `theme-anointed` — deep violet (`--bg1:#2C1654`) and midnight indigo (`--bg2:#130A26`), accent ivory (`--accent:#F5F0E8`), secondary amber (`--accent2:#C9942A`). The visual language is cathedral ceilings, illuminated manuscripts, candlelight, gold leaf.

**The premise:** You are a minor cleric with major ambitions. The faithful need a shepherd. The Council needs a successor. The nation needs a miracle. You may provide all three — or simply make yourself indistinguishable from one.

**Stat remapping:**

| Internal key | Anointed Path display name | What it means |
|---|---|---|
| `support` | **Devotion** | The faithful's belief in your divine mandate |
| `funds` | **Treasury** | Temple wealth; tithes, donations, endowments |
| `influence` | **Authority** | Your standing within the Council hierarchy |
| `media` | **Doctrine** | Control of sacred texts, sermons, and the theological narrative |
| `base` | **Congregation** | The true believers; your grassroots spiritual base |
| `heat` | **Heresy** | Accusations of impiety, corruption, or deviation from doctrine |

**Starting stats:** `{ support:52, funds:32, influence:30, media:38, base:48, heat:8 }`
(High Devotion and Congregation — the faithful love you from the start. Low Authority — you're still an outsider in the Council. Lowest starting heat of any path — heresy accusations come slowly, then all at once.)

**Death causes:**
- `heat >= 100` → `"excommunicated"` — The Council declared you a heretic and stripped you of all standing.
- `support <= 0` → `"schism"` — The congregation fractured; a rival claimed the mandate and took the flock.

**Factions (three theological blocs within the Council):**

| id | Name | Description |
|---|---|---|
| `orthodox` | The Orthodox | Guardians of tradition. Ancient texts, unchanged doctrine, zero tolerance for innovation. |
| `reformists` | The Reformists | Believers in a living faith. Accessible, modern in form if not in content, politically useful. |
| `mystics` | The Mystics | Charismatic, visionary, unpredictable. The people love them. The Council fears them. So do you. |

**Phase arc:**

| Phase | Title | Kicker | Goal Turns | Promo |
|---|---|---|---|---|
| 1 | Parish Elder | The Temple | 7 | `council` — *The Elevation* — receive the Council's blessing over a rival cleric. baseOpp: 43 |
| 2 | High Prelate | The Council Chamber | 7 | `council` — *The Convocation* — be named the Council's voice before the nation. baseOpp: 51 |
| 3 | Supreme Shepherd | The Sacred Seat | 8 | `finale` — *The Final Reckoning* |

**Opponent name pool:** `["Brother Cael","Sister Maro","Elder Voss","Father Dren","Prior Ishe","Deacon Alm","Canon Rett","Abbess Sura","Prelate Nim","Brother Fael"]`

**Promotion mechanic — `council`:**
- Player strength = `devotion*0.35 + authority*0.30 + congregation*0.20 + doctrine*0.15 - heresy*0.18`
- Boosts:
  - 🙏 *Call for Prayer* — spend Congregation 14 → +8 strength (the people speak)
  - 📜 *Issue a Doctrine* — spend Doctrine 12 → +7 strength
  - 🤐 *Silence a Rival* — spend Authority 10 → +6 strength, +6 Heresy (you become what you oppose)
- Win: the Council anoints you. Devotion surges. No vote — no election — just the laying on of hands.
- Lose: a rival is anointed instead → `endGame("schism")`.

**Advisors (4):**

| id | Name | Role | Passive | Description |
|---|---|---|---|---|
| `theologian` | Brother Aldo | Chief Theologian | `media:+2, heat:-1` | Doctrine grows and Heresy cools. His interpretations are creative but internally consistent. |
| `almoner` | Sister Bex | Almoner-General | `funds:+2, support:+1` | Tithes flow. The congregation feels the care. Treasury and Devotion both tick up. |
| `inquisitor` | Grand Prior Wael | Prior of Discipline | `base:+1, heat:+2` | Congregation tightens. So does the definition of heresy. |
| `diplomat_faith` | Envoy Cira | Secular Liaison | `influence:+1, heat:-2` | Manages the Council's relationship with the temporal world. Heresy accusations cool. |

**Endings (finale, flag-branched):**

| Rank | Trigger | Title |
|---|---|---|
| THE SAINT | `secret_reformer && devotion>=65 && heresy<30` | *They Will Canonize You* |
| THE INQUISITOR | `bloody_hands || purge_count>=3 || heresy>=65` | *The Faith Became a Weapon* |
| THE REFORMER | `reformists standing>=70 && doctrine>=55` | *You Opened the Door* |
| THE ORACLE | `own_cult && devotion>=60` | *They Believed Every Word* |
| THE SCHISMATIC | `schism` (support loss) | *The Flock Divided* |
| THE CARETAKER | `composite<=80` | *You Held the Seat Warm* |
| DEFAULT | — | *A Long, Quiet Reign* |

**Failure endings:**
- `excommunicated` → **EXCOMMUNICATED** — "The Council convened in extraordinary session and the verdict was unanimous. You are stripped of all titles, all standing, all access to the sacred buildings you spent your life climbing. The proclamation is read from every pulpit in the nation. You have never felt so alone, or so precisely located."
- `schism` → **THE FLOCK DIVIDED** — "Devotion is not a resource you can manufacture — it must be earned, and you spent yours. A rival claimed the mandate and the congregation followed, because the congregation always follows whoever speaks to the thing they need most. Tonight that is not you."

---

## 4. Events — Per-Path Banks

Each new path requires **a minimum of 10 events** to ship and must scale to 40+ by commercial release. The following are the required seed events for each path. All follow the existing event schema exactly.

### Content rules for expansion events
- Event bodies are at the *mechanism* level: "your inner circle is fracturing," not "like [real movement] in [real country] in [real year]."
- Choices never have a "correct" answer that the game rewards with moral approval — only strategic consequences.
- Crisis events (`crisis:true`) are held from the normal pool and injected on instability. Each path needs at least 2 crisis events.
- All opponent names in `speaker:` references use `S.opp` and `S.oppAvatar`, same as the existing paths.

### Iron Order — 12 seed events

```
io_first_rally        Phase 1  weight:12  art:scene    The first mass rally; how far do you push the crowd?
io_press_takeover     Phase 1  weight:10  art:newspaper Seize a newspaper or let it keep printing?
io_officers_test      Phase 1  weight:10  art:rival     The Officer Corps demands a loyalty demonstration
io_uniform_decree     Phase 2  weight:9   art:bulletin  Mandate the uniform; force visible allegiance
io_night_action       Phase 2  weight:8   art:crisis    A rival faction leader disappears overnight
io_foreign_pressure   Phase 2  weight:9   art:crisis    A foreign power threatens sanctions
io_industrialist_deal Phase 1,2 weight:8  art:scene     The Industrialists want a return on their investment
io_purge_list         Phase 2,3 weight:7  art:bulletin  The list of names your inner circle has compiled
io_monument           Phase 3  weight:8   art:scene     Build the monument or spend the money on grain?
io_successor          Phase 3  weight:7   art:rival     Someone in the Order is already positioning
io_martyrdom_play     Phase 2,3 crisis:true art:crisis  An assassination attempt — real or arranged?
io_foreign_war        Phase 3  crisis:true art:crisis   A border incident the Order can exploit — or can't contain
```

### Gilded Republic — 12 seed events

```
gr_first_acquisition  Phase 1  weight:12  art:scene    Your first hostile acquisition — a local newspaper chain
gr_regulator_lunch    Phase 1  weight:10  art:scene    The regulator wants a "conversation"; so do you
gr_labor_dispute      Phase 1  weight:10  art:crisis   Workers at your subsidiary want to organize
gr_offshore_question  Phase 1,2 weight:9  art:newspaper A journalist found the offshore structure
gr_board_coup         Phase 2  weight:9   art:rival    A board member is building a rival coalition
gr_charity_play       Phase 2  weight:8   art:scene    A public philanthropic gesture; how genuine?
gr_debt_leverage      Phase 2  weight:8   art:scene    You own enough of their debt to control the vote
gr_market_crash       Phase 2,3 crisis:true art:crisis  A financial crisis you may have caused, or can fix
gr_monopoly_hearing   Phase 3  weight:8   art:newspaper The parliament calls you to testify
gr_succession_plan    Phase 3  weight:7   art:scene    Who inherits the empire, and what do they owe you?
gr_whistleblower      Phase 2,3 crisis:true art:crisis  An insider is talking to investigators
gr_foreign_asset      Phase 3  weight:7   art:scene    A foreign sovereign wealth fund wants in
```

### Anointed Path — 12 seed events

```
ap_first_sermon       Phase 1  weight:12  art:scene    Your first major sermon; how do you frame the mandate?
ap_heresy_accusation  Phase 1  weight:10  art:bulletin  A rival has questioned your interpretation of doctrine
ap_tithes_question    Phase 1  weight:10  art:scene    The congregation notices where the tithes go
ap_miracle_rumor      Phase 1,2 weight:9  art:scene    A story spreads that you performed a miracle; clarify or cultivate?
ap_council_faction    Phase 2  weight:9   art:rival    The Orthodox want a concession before they bless your elevation
ap_secular_deal       Phase 2  weight:8   art:scene    A government official offers material support for doctrinal flexibility
ap_schism_seed        Phase 2  weight:8   art:bulletin  A splinter group is preaching a competing interpretation
ap_crusade_question   Phase 2,3 crisis:true art:crisis  A crisis in a distant province is being framed as divine justice
ap_inquisition        Phase 3  weight:8   art:bulletin  Convene a formal review of doctrinal compliance — or don't
ap_succession_rite    Phase 3  weight:7   art:scene    The question of who follows you is already being asked
ap_famine             Phase 2,3 crisis:true art:crisis  A famine. Does the Sacred Covenant feed the people or pray with them?
ap_dissent_within     Phase 3  weight:7   art:rival    A senior member of the Council is privately a skeptic
```

### Shared expansion crises (all three new paths, `paths:["iron","gilded","anointed"]`)

```
xp_popular_uprising   crisis:true  Phase 2,3   The people in the square; crowd grows faster than your response
xp_foreign_embargo    crisis:true  Phase 2,3   Economic isolation; your foreign backers are under pressure
xp_internal_betrayal  crisis:true  Phase 2,3   Someone in your inner circle has been feeding information to a rival
```

---

## 5. Visual Design Spec

### Path card CSS (add to the existing `.path-card` block)

```css
.path-card.iron     { background: linear-gradient(135deg, #5C1010, #1A0A00); }
.path-card.gilded   { background: linear-gradient(135deg, #1A3050, #0A1A0C); }
.path-card.anointed { background: linear-gradient(135deg, #3D1A6E, #130A26); }
```

### Theme overrides (add after existing theme blocks)

```css
body.theme-iron {
  --bg1:#2E2E2E; --bg2:#1A0F00;
  --accent:#C0392B; --accent2:#E67E22; --gold:#E67E22; --accent-ink:#fff;
}
body.theme-gilded {
  --bg1:#1A2744; --bg2:#0B1A12;
  --accent:#D4AF37; --accent2:#2E8B57; --gold:#D4AF37; --accent-ink:#1A1726;
}
body.theme-anointed {
  --bg1:#2C1654; --bg2:#130A26;
  --accent:#F5F0E8; --accent2:#C9942A; --gold:#C9942A; --accent-ink:#1A1726;
}
```

### Path card icons (inline SVG, one per card)

**Iron Order:** A clenched iron fist inside a gear, stamped like a seal. Crimson and orange.

**Gilded Republic:** A coin tower atop a building with classical columns. Gold and deep navy.

**Anointed Path:** A crescent-and-star motif abstracted into a non-denominational radiant eye above an open book. Ivory and violet. (The "radiant eye" is a universal divine-authority symbol with no real-religion specificity; explicitly avoid any cross, crescent, star of David, or other real religious iconography.)

---

## 6. `openCreate` Extension

The existing `openCreate(path)` function needs three new branches for the label strings:

```js
// eyebrow / title
"iron"     → eyebrow: "The Iron Order · Strongman State"
             title:   "Build Your Officer"
             lbl-name: "Your name"
             lbl-faction: "Your wing of the Order"

"gilded"   → eyebrow: "The Gilded Republic · Oligarchy"
             title:   "Build Your Magnate"
             lbl-name: "Your name"
             lbl-faction: "Your financial bloc"

"anointed" → eyebrow: "The Anointed Path · Theocracy"
             title:   "Build Your Cleric"
             lbl-name: "Your name"
             lbl-faction: "Your theological wing"
```

---

## 7. Path Select Screen — New Card Copy

Add these three articles to `#screen-path` after the existing two cards. Include a visual separator or section header: **"The Dark Mirrors — Expansion Pack"**.

### Iron Order card
```
tag:    "The Iron Order · Strongman State"
h3:     "Seize Control"
p:      "The parliament has failed. The people want order. You will give it to them — and take everything else in exchange. Power is not voted for here. It is taken, consolidated, and held by force of will and organized fear."
rungs:  Movement Leader → Chief of State → Supreme Leader
```

### Gilded Republic card
```
tag:    "The Gilded Republic · Oligarchy"
h3:     "Buy the Game"
p:      "Everything has a price. Regulations. Reputations. Votes. You have capital where others have principles. Power here isn't seized or elected — it's acquired, quietly, until there's nothing left that isn't yours."
rungs:  Board Member → Chairman → The Architect
```

### Anointed Path card
```
tag:    "The Anointed Path · Theocracy"
h3:     "Claim the Mandate"
p:      "The Council speaks for the divine. You will speak for the Council. Power here flows from devotion — the congregation's belief in your mandate. Lose it, and no army saves you. Keep it, and no law can touch you."
rungs:  Parish Elder → High Prelate → Supreme Shepherd
```

---

## 8. Phased Implementation Plan

Follow the same gate discipline as the main brief. Each step must leave the game shippable (all five — later eight — paths playable) before advancing.

### Step 1 — Foundation (plan mode first; await approval)
- Audit the existing engine for any hard-coded path checks (`S.path==="ballot"` etc.) that would need to become multi-path switches.
- Add the three new `PATHS{}` entries (stat names, start stats, factions, phases, oppNames).
- Add the three new theme CSS classes and path card CSS.
- Add the three new path cards to `#screen-path` with the expansion separator.
- Extend `openCreate()` with the three new label branches.
- Extend `deathCause()` and `evaluateEnding()` with the six new cause strings and their failure ending text.
- Add the three new promo type branches to `promoPlayerStrength()`, `promoBoosts()`, and `renderPromotion()`.
- Add the 12 new advisors to `ADVISORS{}`.
- **Gate:** all five paths reach the path-select screen, all three new theme classes render, character creation works on all five paths. E2E auto-playthrough passes on all five paths (both existing and three new) with zero errors.

### Step 2 — Seed Events
- Implement all 36 seed events (12 per path) plus the 3 shared expansion crises.
- Wire advisor-appointment events for the 12 new advisors (following the pattern of `b_spin_hire`, `v_security_hire`, etc.).
- Run content linter: validate all new event IDs, `then:` references, and run the ideology-name blocklist check.
- **Gate:** content linter clean; E2E plays all five paths with seed events firing without errors; no blocklist hits.

### Step 3 — Endings + Tuning
- Implement all 21 new finale endings (7 per path) in `evaluateEnding()`.
- Tune starting stats and event weights via a seeded sweep: run 50 seeds per path, assert that each path produces at least 4 distinct ending ranks across runs.
- **Gate:** ending reachability check passes across seed sweep; all five paths meet the global quality bars.

### Step 4 — Polish + Pack Framing
- Add the expansion separator UI to the path-select screen.
- Write the `EXPANSION_README.md` — what the three paths are, how they differ mechanically, content disclaimer, content safety statement.
- Update `COMMERCIAL_BRIEF.md` to reflect eight total paths (five now, three DLC).
- Bump `SHELL_VERSION` in `sw.js`.
- Run full regression: Lighthouse, axe, seeded E2E on all paths.
- **Gate:** Lighthouse ≥90 all categories; all paths green; `EXPANSION_README.md` present.

---

## 9. Pricing / Packaging Model (for the business brief)

The expansion is designed to ship as a discrete content pack under the freemium model described in `COMMERCIAL_BRIEF.md` Phase 11. Suggested approach:

- The base game (ballot + vanguard) remains free to play.
- The expansion (iron + gilded + anointed) is gated behind a one-time unlock, implemented as a `flags.expansion_unlocked` boolean checked at path-select. The content is in the bundle (no separate download); the gate is a client-side flag set by the purchase flow.
- **Rationale:** the three new paths are mechanically distinct enough to justify a separate purchase, the gate is trivially implementable without a backend, and the "try the free paths first, buy the expansion if you want more" funnel is the cleanest indie monetization loop for this type of game.
- **Implementation note:** do not implement the payment gate until Phase 11 of the main brief. For all development and testing phases, treat `flags.expansion_unlocked = true` as the default so paths are always accessible during development.

---

## 10. Invariant Reminder

After every step, re-verify:
1. All **five** paths (ballot, vanguard, iron, gilded, anointed) play start-to-finish with zero errors in the E2E suite.
2. The **content linter** passes with zero blocklist hits.
3. The PWA stays **installable and offline-capable**.
4. The cartoon visual identity is **preserved and extended** — the three new themes use the same token system, the same font stack, the same card/gauge/avatar components.
5. No real ideology name, religion name, nation name, political party name, or living person's name appears in any player-visible string.
