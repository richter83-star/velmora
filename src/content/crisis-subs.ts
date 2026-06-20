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
    title: 'The Square Erupts',
    body: `A protest has boiled over into a riot, and the order to respond runs through you. What you choose in the next minutes will be replayed for years.`,
    choices: [
      {
        label: 'Send in the riot police',
        fx: { base: 4, heat: 6 },
        sub: 'cs_riot_force',
        tone: 'bold',
        result: 'You give the order to clear the square. Now comes the only question that matters: how far?',
      },
      {
        label: 'Walk out and face the crowd yourself',
        roll: {
          stat: 'support',
          dc: 52,
          success: {
            fx: { support: 12, base: 6, heat: -4 },
            text: 'You step into the square unguarded, and the fury gives way to a wary hush. You listen, and it holds.',
          },
          fail: {
            fx: { support: -6, heat: 6 },
            text: 'You try to reason with a mob and get shouted down. The gesture looks naive on every screen.',
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
    title: 'How Far Do You Go?',
    body: `The police are in the square and looking to you for the limit. There is a line here, and you are drawing it in front of the whole nation.`,
    choices: [
      {
        label: 'Targeted arrests, minimal force',
        fx: { base: 4, heat: 4, support: -2 },
        tone: 'good',
        result: 'You hold the line at restraint. The square clears slowly, and the footage, while ugly, is survivable.',
      },
      {
        label: 'Overwhelming force — end it now',
        fx: { base: 8, heat: 16, support: -10 },
        inc: { purge_count: 1 },
        set: { bloody_hands: true, tyrant_rep: true },
        scandal: { id: 'square_cleared', label: 'the night you cleared the square', severity: 3 },
        tone: 'bold',
        result: 'You bring the hammer down. The square is empty by dawn, and the silence that follows has a long memory.',
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
    title: 'The Contagion',
    body: `A fast-moving sickness is doubling by the day, and the experts want emergency powers before it is too late. Powers, once taken, are slow to give back.`,
    choices: [
      {
        label: 'Impose emergency measures',
        fx: { influence: 4, heat: 4 },
        sub: 'cs_outbreak_enforce',
        tone: 'bold',
        result: 'You declare the emergency. The harder question is how you make a frightened country comply.',
      },
      {
        label: 'Issue voluntary guidance only',
        roll: {
          stat: 'support',
          dc: 50,
          success: {
            fx: { support: 10, base: 4 },
            text: 'You trust the public with the truth and a plan, and most of them rise to it. Trust, repaid.',
          },
          fail: {
            fx: { support: -8, heat: 6 },
            text: 'Voluntary proves too slow against an exponential curve. The wards fill, and so does the criticism.',
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
    title: 'How Do You Enforce It?',
    body: `The emergency is law. Whether it is obeyed depends entirely on the hand behind it — open and persuasive, or closed and absolute.`,
    choices: [
      {
        label: 'By consent — persuade and support people',
        fx: { support: 8, funds: -6, heat: -2 },
        set: { peacemaker: true },
        tone: 'good',
        result: 'You pair the rules with real help, and the country mostly comes along willingly. Slower, kinder, sturdier.',
      },
      {
        label: 'By force — checkpoints and curfews',
        fx: { base: 8, heat: 12, support: -6 },
        set: { tyrant_rep: true },
        tone: 'bold',
        result: 'You enforce with cordons and curfews. Compliance is swift, and the resentment is patient.',
      },
    ],
  },
];
