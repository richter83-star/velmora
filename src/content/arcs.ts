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
  {
    id: 'patron',
    title: "The Patron's Shadow",
    paths: ['vanguard'],
    entryStage: 0,
    terminalStages: [99],
    desc: 'A Council patron lifts you up — and the debt follows you to the top, where you must betray him or fall with him.',
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
        scandal: { id: 'harbor_coverup', label: 'the buried harbor files', severity: 4 },
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

  // ---- The Patron's Shadow (vanguard) — patronage → compromise → purge ----
  {
    id: 'arc_patron_0',
    arc: { id: 'patron', stage: 0 },
    paths: ['vanguard'],
    phases: [1],
    weight: 30,
    art: 'rival',
    emoji: '🤵',
    kicker: 'A powerful friend',
    title: 'The Patron Extends His Hand',
    body: `Secretary Volkov, a Council heavyweight, takes an interest in you. "Talent rises faster," he says, "when someone above is pulling. I can be that someone — you would only need to remember who lifted you."`,
    choices: [
      {
        label: 'Accept his patronage',
        fx: { influence: 14, funds: 8, heat: 4 },
        set: { has_patron: true },
        arcSet: { id: 'patron', stage: 1 },
        tone: 'slick',
        result:
          'Doors open overnight. You rise — and a ledger of obligation opens with your name at the very top.',
      },
      {
        label: 'Owe no one — climb alone',
        fx: { support: 8, base: 4, influence: -4 },
        set: { own_man: true, clean_streak: true },
        arcSet: { id: 'patron', stage: 99 },
        tone: 'bold',
        result:
          'You decline, politely. The climb will be slower and lonelier — but the debts will be yours alone, and few.',
      },
    ],
  },
  {
    id: 'arc_patron_1',
    arc: { id: 'patron', stage: 1 },
    paths: ['vanguard'],
    phases: [1, 2],
    weight: 32,
    art: 'scene',
    emoji: '🧾',
    kicker: 'The debt comes due',
    title: "The Patron's Favor",
    body: `Volkov needs a problem to disappear — a shipment, a ledger, an inconvenient inspector. "A small thing," he says, "for family." It is not a small thing, and it is the kind of thing that leaves a paper trail.`,
    choices: [
      {
        label: 'Handle it — you owe him',
        fx: { influence: 8, heat: 10 },
        set: { compromised: true },
        scandal: { id: 'patron_favor', label: 'the favor you buried for your patron', severity: 3 },
        arcSet: { id: 'patron', stage: 2 },
        tone: 'slick',
        result:
          'It is done, cleanly. Volkov is pleased. Somewhere a record now exists that could end you both.',
      },
      {
        label: 'Quietly refuse and create distance',
        fx: { influence: -8, heat: -6, base: 4 },
        set: { own_man: true },
        arcSet: { id: 'patron', stage: 99 },
        tone: 'good',
        result:
          'You find reasons to be elsewhere. Volkov notices the cooling — a patron scorned is dangerous, but so is a leash.',
      },
    ],
  },
  {
    id: 'arc_patron_2',
    arc: { id: 'patron', stage: 2 },
    paths: ['vanguard'],
    phases: [2, 3],
    weight: 34,
    art: 'crisis',
    emoji: '🔪',
    kicker: 'The reckoning',
    title: 'The Patron Falls',
    body: `Volkov's enemies in the Standing Committee are winning, and everyone knows you are his creature. The only question left is whether you fall with him — or use the knife first.`,
    choices: [
      {
        label: 'Denounce him first — strike before he drags you down',
        fx: { influence: 10, base: 8, heat: -6 },
        inc: { purge_count: 1 },
        set: { bloody_hands: true, struck_first: true },
        arcSet: { id: 'patron', stage: 99 },
        tone: 'bold',
        result:
          'You stand and read the charges yourself. Volkov stares as they lead him out. You made him; now you have unmade him. The Committee notes your cold efficiency.',
      },
      {
        label: 'Stand by him — loyalty, whatever it costs',
        roll: {
          stat: 'influence',
          dc: 56,
          success: {
            fx: { base: 10, support: 6, heat: -4 },
            set: { has_network: true, honest_rep: true },
            arcSet: { id: 'patron', stage: 99 },
            text: 'Improbably, your loyalty holds the line, and a few waverers rally to you for it. Volkov survives, diminished — and he does not forget who stood up.',
          },
          fail: {
            fx: { support: -12, heat: 16 },
            arcSet: { id: 'patron', stage: 99 },
            ending: 'purge',
            text: 'Loyalty to a falling man is only a slower fall. They come for you the same week.',
          },
        },
        tone: 'good',
      },
    ],
  },
];
