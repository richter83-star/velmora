import type { GameEvent } from '../engine/types';

/**
 * Crisis sub-decisions (Phase 4) — crises whose first choice branches
 * IMMEDIATELY into a follow-up decision in the same turn (via a choice's `sub`
 * pointer), rather than queuing one for later like a `then`-chain. The follow-up
 * events are `queueOnly` so they only ever appear as the second beat of their
 * crisis. Fictional and non-partisan by construction.
 */
export const CRISIS_SUB_EVENTS: GameEvent[] = [
  {
    id: 'cs_riot',
    paths: ['ballot', 'vanguard'],
    phases: [2, 3],
    weight: 9,
    crisis: true,
    art: 'crisis',
    emoji: '🔥',
    title: 'The Square Goes Feral',
    body: `A protest curdled into a full-blown riot, and now ten thousand sweaty maniacs are flipping cars while every camera in Velmora points at you. The order to respond stops at your desk. Whatever you bark in the next sixty seconds gets replayed at your funeral.`,
    choices: [
      {
        label: 'Sic the riot squad on the bastards',
        fx: { base: 4, heat: 6 },
        sub: 'cs_riot_force',
        tone: 'bold',
        result:
          'You give the word to crack heads and clear the square. Now comes the only question anyone will remember: how many heads, and how hard?',
      },
      {
        label: 'Stroll out there and face the screaming horde yourself',
        roll: {
          stat: 'support',
          dc: 52,
          success: {
            fx: { support: 12, base: 6, heat: -4 },
            text: 'You wade in with no guards and no plan, and the rage just... deflates into a nervous hush. You shut up and listen, and the mob — bless its tiny collective brain — listens back.',
          },
          fail: {
            fx: { support: -6, heat: 6 },
            text: 'You try to reason with a pack of brick-throwers and get howled off your feet. On every screen you look exactly like the naive jackass you turned out to be.',
          },
        },
        set: { peacemaker: true },
        tone: 'good',
      },
    ],
  },
  {
    id: 'cs_riot_force',
    paths: ['ballot', 'vanguard'],
    phases: [1, 2, 3],
    weight: 6,
    queueOnly: true,
    art: 'crisis',
    emoji: '🛡️',
    kicker: 'The order is given',
    title: 'So How Far Do You Take It?',
    body: `The boots are in the square and the commander is staring at you, waiting to know exactly how nasty he's allowed to get. There's a line here, and you're about to draw it in fresh blood in front of the entire nation.`,
    choices: [
      {
        label: 'Pick off the ringleaders, keep the batons mostly holstered',
        fx: { base: 4, heat: 4, support: -2 },
        tone: 'good',
        result:
          'You hold the leash at "restraint." The square empties at a crawl, and while the footage is ugly as sin, it is the kind of ugly a man can survive.',
      },
      {
        label: 'Overwhelming force — flatten the whole thing right now',
        fx: { base: 8, heat: 16, support: -10 },
        inc: { purge_count: 1 },
        set: { bloody_hands: true, tyrant_rep: true },
        scandal: { id: 'square_cleared', label: 'the night you cleared the square', severity: 3 },
        tone: 'bold',
        result:
          'You drop the hammer like it owes you money. The square is spotless and silent by dawn — and that silence has a very, very long memory.',
      },
    ],
  },
  {
    id: 'cs_outbreak',
    paths: ['ballot', 'vanguard'],
    phases: [1, 2, 3],
    weight: 9,
    crisis: true,
    art: 'crisis',
    emoji: '🦠',
    title: 'The Plague Express',
    body: `Some vile little bug is doubling its body count every damn day, and the lab coats are begging you for emergency powers before the whole country starts dropping. Trouble is, powers are like a clingy ex — easy to grab, a nightmare to give back.`,
    choices: [
      {
        label: 'Slam down emergency measures',
        fx: { influence: 4, heat: 4 },
        sub: 'cs_outbreak_enforce',
        tone: 'bold',
        result:
          'You declare the emergency. Now for the genuinely hard part: how the hell you bully a terrified, snot-nosed country into actually doing what it is told.',
      },
      {
        label: 'Just suggest people behave and hope for the best',
        roll: {
          stat: 'support',
          dc: 50,
          success: {
            fx: { support: 10, base: 4 },
            text: 'You hand the public the ugly truth and a real plan, and — miracle of miracles — most of them actually step up. Treat people like adults, occasionally they act like it.',
          },
          fail: {
            fx: { support: -8, heat: 6 },
            text: 'Turns out "pretty please" loses a footrace against an exponential curve every single time. The wards fill up, and so does the mountain of people screaming that you fumbled it.',
          },
        },
        set: { honest_rep: true },
        tone: 'good',
      },
    ],
  },
  {
    id: 'cs_outbreak_enforce',
    paths: ['ballot', 'vanguard'],
    phases: [1, 2, 3],
    weight: 6,
    queueOnly: true,
    art: 'bulletin',
    emoji: '🚧',
    kicker: 'Emergency declared',
    title: 'And How Do You Make Them Obey?',
    body: `The emergency is law now. Whether anyone actually listens comes down entirely to the fist behind it — an open palm offering bread, or a closed knuckle promising worse.`,
    choices: [
      {
        label: 'By bribery and kindness — coax them, prop them up',
        fx: { support: 8, funds: -6, heat: -2 },
        set: { peacemaker: true },
        tone: 'good',
        result:
          'You bolt the rules to real help — cash, food, a hand on the shoulder — and the country mostly shuffles along willingly. Slower, softer, and a hell of a lot harder to topple.',
      },
      {
        label: 'By brute force — checkpoints, curfews, and a boot on the throat',
        fx: { base: 8, heat: 12, support: -6 },
        set: { tyrant_rep: true },
        tone: 'bold',
        result:
          'You enforce it with cordons and curfews and goons on every corner. Compliance is gorgeously instant; the resentment, however, is in absolutely no hurry at all.',
      },
    ],
  },
];
