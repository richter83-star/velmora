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
    kicker: 'An unexpected call',
    title: 'The Rival Extends a Hand',
    speaker: (S) => ({ name: S.opp, role: 'your rival', avatar: S.oppAvatar }),
    body: (S) =>
      `${S.opp} requests a private meeting. "We keep bloodying each other for the cameras," they say. "What if — just once — we didn't?"`,
    choices: [
      {
        label: 'Take the truce — for now',
        fx: { influence: 6, base: -2 },
        npcFx: { id: 'antagonist', relationship: 18 },
        set: { rival_truce: true },
        tone: 'good',
        result: 'You shake hands. The knives are still there, just sheathed. For now.',
      },
      {
        label: 'Smile, then leak the meeting',
        fx: { media: 6, heat: 6 },
        npcFx: { id: 'antagonist', relationship: -20 },
        set: { went_negative: true },
        tone: 'slick',
        result:
          'The story — "secret backroom deal" — runs by morning. Your rival understood the lesson immediately.',
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
    kicker: 'A vulnerability',
    title: 'Your Rival Stumbles',
    speaker: (S) => ({ name: S.opp, role: 'your rival', avatar: S.oppAvatar }),
    body: (S) =>
      `${S.opp} has made a real mistake — the kind you could turn into a knockout blow. Or rise above.`,
    choices: [
      {
        label: 'Go for the throat',
        roll: {
          stat: 'media',
          dc: 50,
          success: {
            fx: { support: 10, media: 6 },
            npcFx: { id: 'antagonist', relationship: -25 },
            set: { went_negative: true },
            text: 'You land the blow on prime time. Your rival reels — and will remember exactly who did it.',
          },
          fail: {
            fx: { support: -6, heat: 8 },
            npcFx: { id: 'antagonist', relationship: -10 },
            text: 'The attack misfires and you look like a bully. Your rival plays the victim beautifully.',
          },
        },
        tone: 'bold',
      },
      {
        label: 'Show mercy — publicly',
        fx: { support: 6, base: 2 },
        npcFx: { id: 'antagonist', relationship: 22 },
        set: { honest_rep: true },
        tone: 'good',
        result:
          'You decline to pile on. Voters notice the grace — and so, quietly, does your rival.',
      },
    ],
  },
];
