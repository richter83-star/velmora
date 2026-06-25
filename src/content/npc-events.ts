import type { GameEvent } from '../engine/types';

/**
 * NPC-aware events: they feature the recurring antagonist (S.opp / the
 * `antagonist` NPC) and shift the relationship meter via `npcFx`. Because the
 * antagonist persists across phases, these read as a running rivalry.
 */
export const NPC_EVENTS: GameEvent[] = [
  {
    id: 'npc_rival_overture',
    paths: ['ballot', 'vanguard'],
    phases: [1, 2, 3],
    weight: 8,
    art: 'rival',
    emoji: '🤝',
    kicker: 'The bastard wants to talk',
    title: 'The Rival Offers a Handshake',
    speaker: (S) => ({ name: S.opp, role: 'your rival', avatar: S.oppAvatar }),
    body: (S) =>
      `${S.opp} requests a private meeting. "We keep bloodying each other for the cameras," they say. "What if — just once — we didn't?"`,
    choices: [
      {
        label: `Take the truce — sheathe the knife, keep your hand on it`,
        fx: { influence: 6, base: -2 },
        npcFx: { id: 'antagonist', relationship: 18 },
        set: { rival_truce: true },
        tone: 'good',
        result: `You shake the clammy hand. The knives are still there, just tucked up your sleeves where they belong. For now.`,
      },
      {
        label: `Smile warmly, then leak the whole meeting to the press`,
        fx: { media: 6, heat: 6 },
        npcFx: { id: 'antagonist', relationship: -20 },
        set: { went_negative: true },
        tone: 'slick',
        result: `The headline — "Secret Backroom Sellout" — hits doorsteps by dawn. Your rival learns, in one gut-punch, exactly what your handshake is worth.`,
      },
    ],
  },
  {
    id: 'npc_rival_opening',
    paths: ['ballot', 'vanguard'],
    phases: [2, 3],
    weight: 8,
    req: (S) => S.stats.heat < 60,
    art: 'rival',
    emoji: '🎯',
    kicker: 'Blood in the water',
    title: 'Your Rival Steps on a Rake',
    speaker: (S) => ({ name: S.opp, role: 'your rival', avatar: S.oppAvatar }),
    body: (S) =>
      `${S.opp} has made a real mistake — the kind you could turn into a knockout blow. Or rise above.`,
    choices: [
      {
        label: `Go straight for the throat`,
        roll: {
          stat: 'media',
          dc: 50,
          success: {
            fx: { support: 10, media: 6 },
            npcFx: { id: 'antagonist', relationship: -25 },
            set: { went_negative: true },
            text: `You bury the blade live on prime time. Your rival folds like a cheap deckchair — and carves your name into the inside of their skull for later.`,
          },
          fail: {
            fx: { support: -6, heat: 8 },
            npcFx: { id: 'antagonist', relationship: -10 },
            text: `The hit whiffs and you come off looking like a schoolyard bully kicking a kid who's already down. Your rival plays the wounded saint like a goddamn virtuoso.`,
          },
        },
        tone: 'bold',
      },
      {
        label: `Take the high road — loudly, where the cameras can see`,
        fx: { support: 6, base: 2 },
        npcFx: { id: 'antagonist', relationship: 22 },
        set: { honest_rep: true },
        tone: 'good',
        result: `You decline to stomp a man who's already face-down in his own mess. The voters clock the mercy — and so, grudgingly, does the rival who knows damn well you could've finished it.`,
      },
    ],
  },
];
