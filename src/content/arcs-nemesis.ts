import type { ArcDef, GameEvent, PathKey } from '../engine/types';

/**
 * G6 — the deep living cast: two authored, cross-phase arcs that give the run a
 * cast with a beginning, a betrayal, and a payoff.
 *
 * - `nemesis` (all paths): a 3-stage rivalry with your recurring antagonist. Every
 *   stage moves the antagonist relationship (npcFx) — so the G3.5 reaction shots and
 *   the G5 Cast Ledger read the arc you actually played — and sets a terminal flag the
 *   epilogue turns into a curtain call. It never gates progress: every stage offers an
 *   exit choice to stage 99, so a stalled arc simply ends.
 * - `defector` (all paths): a 2-stage loyalty arc with a lieutenant you raise up, who
 *   then turns on you and returns to be dealt with.
 *
 * All content is fictional TV-MA satire — no real figures, regimes, or faiths — and
 * RNG-free (advancement is choice-driven), so it never perturbs the seeded sweep.
 */

const ALL_PATHS: PathKey[] = ['ballot', 'vanguard', 'iron', 'gilded', 'anointed'];
const paths = (): PathKey[] => [...ALL_PATHS];

export const NEMESIS_ARCS: ArcDef[] = [
  {
    id: 'nemesis',
    title: 'The Rival',
    paths: paths(),
    entryStage: 0,
    terminalStages: [99],
    desc: 'The one enemy who climbs beside you the whole way up — from a first sneer to a final reckoning that history will remember by both your names.',
  },
  {
    id: 'defector',
    title: 'The Deputy',
    paths: paths(),
    entryStage: 0,
    terminalStages: [99],
    desc: "You raise a loyal lieutenant into real power. Whether they become your right hand or your knife in the dark is a choice you make — twice.",
  },
];

export const NEMESIS_ARC_EVENTS: GameEvent[] = [
  // ── NEMESIS · stage 0 — the rivalry ignites ────────────────────────────────
  {
    id: 'arc_nemesis_0',
    arc: { id: 'nemesis', stage: 0 },
    paths: paths(),
    phases: [1, 2],
    weight: 30,
    art: 'rival',
    emoji: '🔪',
    kicker: 'Every hero needs one; yours just walked in',
    title: 'The First Sneer',
    speaker: (S) => ({ name: S.opp, role: 'your rival', avatar: S.oppAvatar }),
    body: `They corner you after the vote, smiling the way a cat smiles at a slower cat. "Enjoy the view from there," your rival murmurs, "because I'm taking the stairs behind you the whole way — and I've got a longer knife." It's theatre. It's also, unmistakably, a promise.`,
    choices: [
      {
        label: 'Promise them a war they will lose',
        fx: { heat: 6, base: 4 },
        set: { nemesis_engaged: true },
        npcFx: { id: 'antagonist', relationship: -20 },
        arcSet: { id: 'nemesis', stage: 1 },
        tone: 'bold',
        result:
          'You smile back and tell them, quietly, exactly how it ends for people who take the stairs behind you. The rivalry is lit now — a fuse that will burn for the rest of your career.',
      },
      {
        label: 'Offer a truce nobody will believe',
        fx: { media: 4, support: 4 },
        set: { nemesis_truce_early: true },
        npcFx: { id: 'antagonist', relationship: 14 },
        arcSet: { id: 'nemesis', stage: 99 },
        tone: 'good',
        result:
          'You extend a hand and a compliment, and — warily, absurdly — they take it. The feud that might have defined you fizzles before it starts. Some rivalries die of politeness.',
      },
    ],
  },
  // ── NEMESIS · stage 1 — the betrayal ───────────────────────────────────────
  {
    id: 'arc_nemesis_1',
    arc: { id: 'nemesis', stage: 1 },
    paths: paths(),
    phases: [2, 3],
    weight: 32,
    art: 'crisis',
    emoji: '🩸',
    kicker: 'They found the soft part and they pushed',
    title: 'The Knife Arrives',
    speaker: (S) => ({ name: S.opp, role: 'your rival', avatar: S.oppAvatar }),
    body: `Your rival didn't wait for a fair fight. They leaked the ugliest thing they could find, timed to gut you on your worst week, then went on camera to look wounded on your behalf. "I only want what's best," they say, dabbing a dry eye. The audience is enormous.`,
    choices: [
      {
        label: 'Total war — bury them under their own filth',
        fx: { heat: 14, media: 4, funds: -6 },
        set: { nemesis_war: true, blackmailer: true },
        npcFx: { id: 'antagonist', relationship: -24 },
        arcSet: { id: 'nemesis', stage: 2 },
        tone: 'slick',
        result:
          'You open the vault you kept on them — and it is deeper than theirs. By the weekend the story is about their sins, not yours. This is a fight to the political death now, and you just drew first blood.',
      },
      {
        label: 'Co-opt them — make the snake owe you',
        fx: { funds: -10, influence: 8 },
        set: { nemesis_pact: true, has_network: true },
        npcFx: { id: 'antagonist', relationship: 20 },
        arcSet: { id: 'nemesis', stage: 99 },
        tone: 'slick',
        result:
          'Instead of a bullet you send an offer — a real one, obscene enough that refusing it would be stupid. They take the deal, and a rival becomes that far more useful thing: an ally who knows exactly what you are.',
      },
    ],
  },
  // ── NEMESIS · stage 2 — the reckoning ──────────────────────────────────────
  {
    id: 'arc_nemesis_2',
    arc: { id: 'nemesis', stage: 2 },
    paths: paths(),
    phases: [2, 3],
    weight: 34,
    art: 'rival',
    emoji: '⚔️',
    kicker: 'The whole climb was always heading here',
    title: 'The Reckoning',
    speaker: (S) => ({ name: S.opp, role: 'your rival', avatar: S.oppAvatar, expr: 'betrayed' }),
    body: `It comes down to this room. Your rival is finished — the votes, the money, the friends have all quietly crossed to your side — and they know it. "Go on then," they say, and for once there's no performance left in the voice. "You've won. The only question left is what kind of winner you are."`,
    choices: [
      {
        label: 'Destroy them completely — salt the earth',
        fx: { heat: 12, base: 6, support: -4 },
        set: { nemesis_destroyed: true, bloody_hands: true },
        npcFx: { id: 'antagonist', relationship: -30 },
        arcSet: { id: 'nemesis', stage: 99 },
        tone: 'dark',
        result:
          'You take everything — the seat, the name, the future, the last shred of dignity. They leave with nothing, and everyone watching learns the precise price of standing behind you on the stairs. It is a lesson nobody forgets.',
      },
      {
        label: 'Let them live, ruined and watching',
        fx: { support: 8, media: 6 },
        set: { nemesis_spared: true, peacemaker: true },
        npcFx: { id: 'antagonist', relationship: 10 },
        arcSet: { id: 'nemesis', stage: 99 },
        tone: 'bold',
        result:
          'You win, and then you do the one thing they never would have: you let them keep their skin. Mercy costs you nothing and buys you a legend — the enemy you beat and then, unbearably, pitied.',
      },
    ],
  },

  // ── DEFECTOR · stage 0 — the lieutenant rises ──────────────────────────────
  {
    id: 'arc_defector_0',
    arc: { id: 'defector', stage: 0 },
    paths: paths(),
    phases: [1, 2],
    weight: 28,
    art: 'scene',
    emoji: '🤝',
    kicker: 'The most dangerous people are the ones who are right',
    title: 'The Ambitious Deputy',
    body: `Wren Osei has run your operation since the beginning — smarter than you on paper, and loyal in the way of people who haven't yet been tested. Now they want a real title, real power, a seat at the actual table. "I've earned it," they say, and the infuriating thing is that they have.`,
    choices: [
      {
        label: 'Hand them the keys — a partner, not a servant',
        fx: { influence: 10, base: 4 },
        set: { defector_empowered: true },
        arcSet: { id: 'defector', stage: 1 },
        tone: 'bold',
        result:
          'You give Wren everything they ask for and more. They run twice as hard for you now — brilliant, tireless, and holding, for the first time, enough rope to hang you with if they ever choose to.',
      },
      {
        label: 'Keep them leashed — grateful and small',
        fx: { influence: 4, base: -2 },
        set: { defector_leashed: true },
        arcSet: { id: 'defector', stage: 99 },
        tone: 'slick',
        result:
          "You give Wren a nicer title and none of the power behind it. They smile, thank you, and go quiet — the specific quiet of someone filing the moment away. But leashed, they can't reach your throat.",
      },
    ],
  },
  // ── DEFECTOR · stage 1 — the return ────────────────────────────────────────
  {
    id: 'arc_defector_1',
    arc: { id: 'defector', stage: 1 },
    paths: paths(),
    phases: [2, 3],
    weight: 30,
    art: 'crisis',
    emoji: '🎭',
    kicker: 'The rope, it turns out, was long enough',
    title: "The Deputy's Turn",
    body: `Wren Osei is standing shoulder to shoulder with the opposition at the podium, holding a folder with your name on the tab and your worst decisions inside it. "You made me powerful enough to matter," they say, not even angry, "and then treated me like I was still fetching your coffee." Every camera in the country is pointed at that folder.`,
    choices: [
      {
        label: 'Make an example — end them, publicly',
        fx: { heat: 12, base: 6, support: -4 },
        set: { defector_crushed: true, bloody_hands: true },
        arcSet: { id: 'defector', stage: 99 },
        tone: 'dark',
        result:
          "You come down on Wren with everything the office allows and a few things it doesn't. The folder never gets read; the messenger becomes the story. Your remaining lieutenants take a long, careful note of how betrayal is repaid here.",
      },
      {
        label: 'Win them back — the wound was yours to heal',
        fx: { funds: -8, support: 6, media: 4 },
        set: { defector_reconciled: true, peacemaker: true },
        arcSet: { id: 'defector', stage: 99 },
        tone: 'good',
        result:
          'You do the humiliating, unpolitical thing: you admit, out loud, that you were wrong. You give Wren the seat you should have given them the first time. They close the folder — and become, against all odds, the ally who outlasts every enemy you have left.',
      },
    ],
  },
];
