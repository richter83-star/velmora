import type { GameEvent } from '../engine/types';

/** Events the engine injects directly (not drawn from the random pool). */
export const ENGINE_INJECTED_EVENT_IDS = ['scandal_resurfaces'] as const;

export const SCANDAL_EVENTS: GameEvent[] = [
  // A reliable scandal source in ordinary play.
  {
    id: 'sc_slush_fund',
    paths: ['ballot', 'vanguard'],
    phases: [1, 2],
    weight: 9,
    art: 'scene',
    emoji: '💵',
    kicker: 'Off the books',
    title: 'The Slush Fund',
    body: `A staffer proposes an "unofficial" account — untraceable money for the favors that can't go on the books. It would solve a lot of problems now. It would become a problem later.`,
    choices: [
      {
        label: 'Set it up — quietly',
        fx: { funds: 14, heat: 6 },
        set: { corrupt_streak: true },
        scandal: { id: 'slush_fund', label: 'the off-the-books slush fund', severity: 2 },
        tone: 'slick',
        result:
          'The money flows where it needs to. You make a point of never writing any of it down.',
      },
      {
        label: 'Refuse to touch it',
        fx: { support: 4, funds: -2 },
        set: { clean_streak: true },
        tone: 'good',
        result: 'You shut it down before it starts. Some problems are best never created.',
      },
    ],
  },
  // The reckoning — queueOnly; the engine injects it when a latent scandal comes due.
  {
    id: 'scandal_resurfaces',
    queueOnly: true,
    paths: ['ballot', 'vanguard'],
    phases: [1, 2, 3],
    art: 'newspaper',
    emoji: '🗞️',
    kicker: 'It came back',
    title: 'The Past Resurfaces',
    body: (S) => {
      const sc = (S.scandals ?? []).find((x) => x.id === S.activeScandal);
      const what = sc ? sc.label : 'an old indiscretion';
      return `A reporter has been digging, and ${what} is about to see daylight. You thought this was behind you. It is not behind you.`;
    },
    choices: [
      {
        label: 'Bury it again — money and pressure',
        req: (S) => S.stats.funds >= 12,
        reqText: 'Needs War Chest 12+',
        fx: { funds: -12, heat: -6 },
        set: { buried_a_body: true, corrupt_streak: true },
        scandalResolve: 'buried',
        tone: 'slick',
        result:
          'It sinks back beneath the surface. Someone new now knows you will pay to keep it there.',
      },
      {
        label: 'Get ahead of it — confess the old sin',
        fx: { support: -6, heat: -16, media: 4 },
        set: { honest_rep: true },
        scandalResolve: 'resolved',
        tone: 'good',
        result:
          'You disclose it on your own terms. It stings for a news cycle, then it is genuinely finished.',
      },
      {
        label: 'Deny everything',
        roll: {
          stat: 'media',
          dc: 55,
          success: {
            fx: { heat: -8 },
            scandalResolve: 'resolved',
            text: 'You stonewall so flatly the story dies of boredom. This time.',
          },
          fail: {
            fx: { support: -14, heat: 14 },
            scandalResolve: 'exposed',
            ending: 'scandal',
            text: 'The denial becomes the story. The receipts surface an hour later. It is over.',
          },
        },
        tone: 'bold',
      },
    ],
  },
];
