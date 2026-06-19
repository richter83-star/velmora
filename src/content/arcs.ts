import type { ArcDef, GameEvent } from '../engine/types';

/**
 * Arc registry (metadata for validation + the future codex). The actual steps
 * are the arc-tagged events in ARC_EVENTS below.
 */
export const ARCS: ArcDef[] = [
  {
    id: 'harbor',
    title: 'The Harbor Deal',
    paths: ['ballot'],
    entryStage: 0,
    terminalStages: [99],
    desc: 'A sweetheart rezoning that can make your career or end it — and it follows you across all three offices.',
  },
];

/**
 * The Harbor Deal — a 3-stage corruption arc that initiates as a Senator and
 * resolves as far away as the Presidency. First choices always advance the arc
 * (0 → 1 → 2 → 99); the alternatives exit it early. High weight so the thread
 * surfaces reliably while the arc is live.
 */
export const ARC_EVENTS: GameEvent[] = [
  {
    id: 'arc_harbor_0',
    arc: { id: 'harbor', stage: 0 },
    paths: ['ballot'],
    phases: [1],
    weight: 30,
    art: 'scene',
    emoji: '🏗️',
    kicker: 'A quiet lunch',
    title: 'The Harbor Rezoning',
    body: `A developer named Hollis Crane wants the derelict harbor district rezoned for luxury towers. "Smooth this through," he smiles, "and the campaign will never want for money again."`,
    choices: [
      {
        label: 'Quietly grease the wheels',
        fx: { funds: 16, heat: 8, base: -2 },
        set: { harbor_deal: true },
        arcSet: { id: 'harbor', stage: 1 },
        tone: 'slick',
        result:
          'The rezoning slips through a sleepy committee. Crane is very, very grateful — and very good at remembering favors.',
      },
      {
        label: 'Refuse — it stinks',
        fx: { support: 8, media: 4, funds: -2 },
        set: { clean_streak: true },
        arcSet: { id: 'harbor', stage: 99 },
        tone: 'bold',
        result:
          "You kill the deal. Crane's smile vanishes; a columnist calls you 'the one who can't be bought.' Cheap publicity, and the good kind.",
      },
    ],
  },
  {
    id: 'arc_harbor_1',
    arc: { id: 'harbor', stage: 1 },
    paths: ['ballot'],
    phases: [1, 2],
    weight: 32,
    art: 'newspaper',
    emoji: '🕵️',
    kicker: 'Loose threads',
    title: 'The Harbor Questions',
    body: `A dogged reporter has the rezoning timeline, the committee vote, and a photo of you leaving Crane's yacht. She wants a comment by morning.`,
    choices: [
      {
        label: 'Stonewall and run out the clock',
        fx: { heat: 10, media: -4 },
        set: { stonewalled_harbor: true },
        arcSet: { id: 'harbor', stage: 2 },
        tone: 'slick',
        result:
          '"No comment" becomes the headline. The story has legs now — and they are walking steadily toward you.',
      },
      {
        label: 'Get ahead of it — disclose everything',
        fx: { heat: -14, support: -4, media: 4 },
        set: { came_clean: true },
        arcSet: { id: 'harbor', stage: 99 },
        tone: 'good',
        result:
          'You release the records first. It bruises for a week, but the wound closes instead of festering.',
      },
    ],
  },
  {
    id: 'arc_harbor_2',
    arc: { id: 'harbor', stage: 2 },
    paths: ['ballot'],
    phases: [2, 3],
    weight: 34,
    art: 'crisis',
    emoji: '⚖️',
    kicker: 'The reckoning',
    title: 'The Harbor Reckoning',
    body: `A prosecutor has subpoenaed the harbor files. This is the moment the whole thing either disappears for good — or becomes the only line in your obituary.`,
    choices: [
      {
        label: 'Make it disappear — whatever it costs',
        fx: { funds: -18, heat: -8 },
        set: { buried_a_body: true, corrupt_streak: true },
        arcSet: { id: 'harbor', stage: 99 },
        tone: 'slick',
        result:
          'Files are misplaced, witnesses lose interest. You are safe — and you have become precisely the kind of person you once ran against.',
      },
      {
        label: 'Confess and take the hit',
        roll: {
          stat: 'media',
          dc: 52,
          success: {
            fx: { support: 10, media: 8, heat: -12 },
            set: { honest_rep: true, secret_reformer: true },
            arcSet: { id: 'harbor', stage: 99 },
            text: 'You own it on live television. Improbably, the public rewards the honesty — a redemption arc, on the record.',
          },
          fail: {
            fx: { support: -12, heat: 6 },
            arcSet: { id: 'harbor', stage: 99 },
            ending: 'scandal',
            text: 'The confession becomes the story of the decade, and not the redemptive kind.',
          },
        },
        tone: 'bold',
      },
    ],
  },
];
