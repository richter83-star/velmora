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
    body: `A staffer slides you a plan for an "unofficial" account — a fat, untraceable pile of cash for the favors that can't ever touch a ledger. It would fix a shitload of problems today. It would become one enormous, career-ending problem later.`,
    choices: [
      {
        label: 'Set it up — nice and quiet',
        fx: { funds: 14, heat: 6 },
        set: { corrupt_streak: true },
        scandal: { id: 'slush_fund', label: 'the off-the-books slush fund', severity: 2 },
        tone: 'slick',
        result:
          'The money sloshes exactly where it needs to. You make a religion out of never writing down a single goddamn cent of it.',
      },
      {
        label: 'Refuse to touch the filthy thing',
        fx: { support: 4, funds: -2 },
        set: { clean_streak: true },
        tone: 'good',
        result:
          'You strangle it in the crib. Some problems are best never dragged kicking into the world.',
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
    title: 'The Skeleton Walks Again',
    body: (S) => {
      const sc = (S.scandals ?? []).find((x) => x.id === S.activeScandal);
      const what = sc ? sc.label : 'an old indiscretion';
      return `A reporter has been digging, and ${what} is about to see daylight. You thought this was behind you. It is not behind you.`;
    },
    choices: [
      {
        label: 'Bury the body again — cash and a firm squeeze',
        req: (S) => S.stats.funds >= 12,
        reqText: 'Needs War Chest 12+',
        fx: { funds: -12, heat: -6 },
        set: { buried_a_body: true, corrupt_streak: true },
        scandalResolve: 'buried',
        tone: 'slick',
        result:
          'It glugs back down beneath the surface. One more person now knows you will gladly pay through the nose to keep it there.',
      },
      {
        label: 'Get ahead of it — cough up the old sin yourself',
        fx: { support: -6, heat: -16, media: 4 },
        set: { honest_rep: true },
        scandalResolve: 'resolved',
        tone: 'good',
        result:
          'You spill it on your own terms, your own podium. It stings like hell for one news cycle, then it is genuinely, blessedly dead.',
      },
      {
        label: 'Deny every last word of it',
        roll: {
          stat: 'media',
          dc: 55,
          success: {
            fx: { heat: -8 },
            scandalResolve: 'resolved',
            text: 'You stonewall so flat and so bored that the story keels over and dies of sheer tedium. This time.',
          },
          fail: {
            fx: { support: -14, heat: 14 },
            scandalResolve: 'exposed',
            ending: 'scandal',
            text: 'The denial becomes the whole story. The receipts crawl out into the light an hour later. You are cooked.',
          },
        },
        tone: 'bold',
      },
    ],
  },
];
