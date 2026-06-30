import type { ArcDef, GameEvent } from '../engine/types';

/**
 * Second-tier arcs for the two original paths, so ballot and vanguard each carry
 * more than one cross-phase thread (depth + replay variety). Same 0->1->2->99
 * shape as harbor/patron; first choice advances, the alternative exits clean.
 * Themes are deliberately distinct from the path's first arc:
 *   tape  (ballot)   — kompromat/blackmail, NOT bribery (harbor)
 *   cult  (vanguard) — a personality cult, NOT patronage (patron)
 * Flags set here are read by the generic ending chain in engine/endings.ts
 * (corrupt_streak/buried_a_body, honest_rep/secret_reformer, own_cult/
 * cult_building/tyrant_rep/bloody_hands, peacemaker).
 */
export const EXTRA_ARCS: ArcDef[] = [
  {
    id: 'tape',
    title: 'The Tape',
    paths: ['ballot'],
    entryStage: 0,
    terminalStages: [99],
    desc: 'A fixer hands you kompromat on a rival — and the question of how you got it follows you to the top.',
  },
  {
    id: 'cult',
    title: 'The Cult of You',
    paths: ['vanguard'],
    entryStage: 0,
    terminalStages: [99],
    desc: 'The propagandists want to make you a god — and a faith built on your face wants blood to keep it.',
  },
];

export const EXTRA_ARC_EVENTS: GameEvent[] = [
  // ============ THE TAPE (ballot) ============
  {
    id: 'arc_tape_0',
    arc: { id: 'tape', stage: 0 },
    paths: ['ballot'],
    phases: [1],
    weight: 30,
    art: 'rival',
    emoji: '📼',
    kicker: 'A plain envelope and a man who never blinks',
    title: 'The Fixer’s Gift',
    body: `A grey little fixer named Renn Mock slides a drive across the diner table like it’s a communion wafer. On it: your sharpest rival, caught doing the kind of thing that ends careers and marriages in the same afternoon. "No charge," Mock says, which is the most expensive thing anyone’s ever said to you. "Just remember who handed it over." Taking it makes their filth your filth.`,
    choices: [
      {
        label: 'Pocket the drive and the leverage that comes with it',
        fx: { influence: 12, media: 6, heat: 6 },
        set: { has_tape: true },
        arcSet: { id: 'tape', stage: 1 },
        tone: 'slick',
        result:
          'The drive disappears into your coat, warm as a stolen wallet. You don’t play it yet — you don’t have to. Just knowing it exists changes how you walk into rooms, and Mock now owns a small, patient piece of you.',
      },
      {
        label: 'Refuse to traffic in another man’s ruin',
        fx: { support: 8, media: 4, influence: -4 },
        set: { clean_streak: true, honest_rep: true },
        arcSet: { id: 'tape', stage: 99 },
        tone: 'bold',
        result:
          'You push it back across the table and tell Mock to find a dirtier customer. He shrugs — there’s always one. You climb without the shortcut, and you never have to wonder, at 3 a.m., whose ruin paid for your office.',
      },
    ],
  },
  {
    id: 'arc_tape_1',
    arc: { id: 'tape', stage: 1 },
    paths: ['ballot'],
    phases: [1, 2],
    weight: 32,
    art: 'scene',
    emoji: '🤐',
    kicker: 'The rival knows you know, and comes to deal',
    title: 'The Squeeze',
    body: `Your rival’s people have worked out that you’re the one holding the knife. Now they’re at your door, pale and polite, ready to give you almost anything — a withdrawn endorsement, a killed bill, a public grovel — to keep the drive in your coat. It’s the purest power you’ve ever felt, and it would leave a mark on you that no soap touches.`,
    choices: [
      {
        label: 'Squeeze them dry — own them with the threat',
        fx: { influence: 10, heat: 8 },
        set: { blackmailer: true },
        scandal: { id: 'the_tape', label: 'the drive you used to break a rival', severity: 3 },
        arcSet: { id: 'tape', stage: 2 },
        tone: 'slick',
        result:
          'They fold like a wet flag. Your rival becomes a quiet little puppet who votes how you need and smiles when you tell them to. You got everything you wanted and learned the price in the mirror later.',
      },
      {
        label: 'Wipe the drive in front of them and let them go',
        fx: { influence: -6, support: 8, heat: -8 },
        set: { came_clean: true, honest_rep: true },
        arcSet: { id: 'tape', stage: 99 },
        tone: 'good',
        result:
          'You drag the file to the trash while they watch, then empty it. The relief on their face is almost obscene. You gave up a weapon for nothing but the right to call yourself clean — and somehow that trade keeps paying out for years.',
      },
    ],
  },
  {
    id: 'arc_tape_2',
    arc: { id: 'tape', stage: 2 },
    paths: ['ballot'],
    phases: [2, 3],
    weight: 34,
    art: 'crisis',
    emoji: '🎙️',
    kicker: 'The reckoning, with a microphone in your face',
    title: 'How Did You Get It',
    body: `The story’s out that the drive existed, and now a journalist with a long memory is asking the only question that matters: how did it come into your hands, and what did you do with it? Renn Mock has gone conveniently silent. The whole grubby arrangement either vanishes for good — or becomes the headline carved over your career.`,
    choices: [
      {
        label: 'Deny everything and bury the trail for good',
        fx: { funds: -16, heat: -8 },
        set: { buried_a_body: true, corrupt_streak: true },
        scandal: { id: 'tape_trail', label: 'the buried trail back to the fixer', severity: 4 },
        arcSet: { id: 'tape', stage: 99 },
        tone: 'slick',
        result:
          'Mock retires somewhere warm on your money, the drive’s metadata gets scrubbed, and the journalist hits a wall of lawyers and lost memories. You walk away spotless on paper — and finished becoming the kind of operator you used to investigate.',
      },
      {
        label: 'Own the whole sordid arrangement on the record',
        roll: {
          stat: 'media',
          dc: 52,
          success: {
            fx: { support: 10, media: 8, heat: -12 },
            set: { honest_rep: true, secret_reformer: true },
            arcSet: { id: 'tape', stage: 99 },
            text: 'You lay it all out — the diner, the drive, the squeeze, the regret — looking like a man confessing to a priest with a camera. Improbably, the public forgives the sinner who names his own sin, and the story curdles into a redemption.',
          },
          fail: {
            fx: { support: -12, heat: 6 },
            arcSet: { id: 'tape', stage: 99 },
            ending: 'scandal',
            text: 'Your confession doesn’t play as brave. It plays as an admission, and the headline writes itself in letters a foot high.',
          },
        },
        tone: 'bold',
      },
    ],
  },

  // ============ THE CULT OF YOU (vanguard) ============
  {
    id: 'arc_cult_0',
    arc: { id: 'cult', stage: 0 },
    paths: ['vanguard'],
    phases: [1],
    weight: 30,
    art: 'scene',
    emoji: '🖼️',
    kicker: 'A flattering portrait, and the men who paint them',
    title: 'The Propagandists Call',
    body: `A trio of Party image-makers want to plaster your face down every boulevard, rewrite your dull little childhood into a fable of destiny, and teach schoolchildren a song with your name in the chorus. "A movement needs a face," the head one says, "and the Party voted yours." It is intoxicating. It is also the first brick of something that will eventually demand to be fed.`,
    choices: [
      {
        label: 'Approve the campaign — let the legend bloom',
        fx: { support: 12, influence: 6, media: 6 },
        set: { cult_building: true },
        arcSet: { id: 'cult', stage: 1 },
        tone: 'slick',
        result:
          'By spring your jaw is on every wall and your invented destiny is in every classroom. The crowds don’t just cheer the Party anymore — they cheer YOU, and the difference between those two things starts, quietly, to matter.',
      },
      {
        label: 'Kill it — you serve the Party, not a poster',
        fx: { support: 8, base: 4, media: -4 },
        set: { own_man: true, clean_streak: true },
        arcSet: { id: 'cult', stage: 99 },
        tone: 'bold',
        result:
          'You order the mock-ups burned and tell them a movement that needs one face is already dying. The image-makers leave disappointed. You stay a man instead of a mural — harder to love, impossible to topple by defacing a wall.',
      },
    ],
  },
  {
    id: 'arc_cult_1',
    arc: { id: 'cult', stage: 1 },
    paths: ['vanguard'],
    phases: [1, 2],
    weight: 32,
    art: 'rival',
    emoji: '✊',
    kicker: 'Oaths sworn to a man, not a cause',
    title: 'The Loyalty Oaths',
    body: `A fervent young cadre proposes that every officer swear a personal oath — to you, by name, not to the Party or the constitution. A blunt old comrade warns you to your face that this is the line where a movement becomes a religion and a leader becomes an idol. The cadre’s eyes are shining. The old comrade’s are tired.`,
    choices: [
      {
        label: 'Demand the oaths — bind them to you by name',
        fx: { influence: 8, base: 6, heat: 8 },
        set: { own_cult: true },
        scandal: { id: 'the_oaths', label: 'the oaths sworn to your name alone', severity: 3 },
        arcSet: { id: 'cult', stage: 2 },
        tone: 'slick',
        result:
          'They kneel and swear it, voice cracking, to you. The Party becomes a backdrop; you become the point. The old comrade doesn’t swear so much as recite, watching you the whole time like a man memorizing an exit.',
      },
      {
        label: 'Refuse — keep every oath sworn to the Party',
        fx: { influence: -6, support: 6, heat: -8 },
        set: { secret_reformer: true },
        arcSet: { id: 'cult', stage: 99 },
        tone: 'good',
        result:
          'You tell the cadre that a man you can swear to is a man you can be ordered to betray, and you’ll have no such thing. The fervor cools into something steadier and harder to weaponize. The old comrade nods once, which from him is a standing ovation.',
      },
    ],
  },
  {
    id: 'arc_cult_2',
    arc: { id: 'cult', stage: 2 },
    paths: ['vanguard'],
    phases: [2, 3],
    weight: 34,
    art: 'crisis',
    emoji: '🔥',
    kicker: 'The reckoning, with the faithful demanding a sacrifice',
    title: 'The Idol Demands',
    body: `The thing you built has grown teeth. The cult of you now demands you declare yourself beyond question and purge the doubters who keep insisting you’re merely a man. A delegation of the devout waits for your blessing to start the bonfires. You can become the infallible god they’re begging for — or climb down off the pedestal before it becomes a pyre.`,
    choices: [
      {
        label: 'Ascend — become infallible, and burn the doubters',
        fx: { support: 10, influence: 8, heat: 10 },
        inc: { purge_count: 1 },
        set: { own_cult: true, tyrant_rep: true, bloody_hands: true },
        arcSet: { id: 'cult', stage: 99 },
        tone: 'bold',
        result:
          'You give the nod, and the faithful do what the faithful do to heretics. The doubters are unpersoned by the week’s end, and you are declared, by acclamation and terror, beyond all question. You wanted to be loved. You settled, in the end, for being worshipped, which is lonelier and far better armed.',
      },
      {
        label: 'Climb down — hand the worship back to the Party',
        roll: {
          stat: 'support',
          dc: 56,
          success: {
            fx: { base: 8, support: 6, heat: -10 },
            set: { secret_reformer: true, peacemaker: true },
            arcSet: { id: 'cult', stage: 99 },
            text: 'You stand before the devout and tell them, plainly, that you are a man and only a man, and that a movement worshipping a face is a movement already rotting. It nearly breaks them — and then, improbably, it sets some of them free. The pedestal comes down without a pyre.',
          },
          fail: {
            fx: { support: -14, heat: 12 },
            arcSet: { id: 'cult', stage: 99 },
            ending: 'revolution',
            text: 'The faithful do not want a man. Told their god is mortal, they don’t calm — they riot, betrayed, and the movement you built turns its teeth on you in the square.',
          },
        },
        tone: 'good',
      },
    ],
  },
];
