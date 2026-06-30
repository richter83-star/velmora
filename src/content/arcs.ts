import type { ArcDef, GameEvent } from '../engine/types';
import { DARK_MIRROR_ARCS, DARK_MIRROR_ARC_EVENTS } from './arcs-dark-mirrors';

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
  ...DARK_MIRROR_ARCS,
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
    kicker: 'A quiet lunch where the wine costs more than your house',
    title: 'The Harbor Rezoning',
    body: `A property ghoul named Hollis Crane wants the rotting harbor district bulldozed and replaced with glass towers full of people who'll never visit. "Grease this through for me," he purrs over the appetizers, "and your campaign account never runs dry again." His teeth are too white. His checkbook is already out.`,
    choices: [
      {
        label: 'Quietly grease the wheels and pocket the gratitude',
        fx: { funds: 16, heat: 8, base: -2 },
        set: { harbor_deal: true },
        arcSet: { id: 'harbor', stage: 1 },
        tone: 'slick',
        result:
          'The rezoning slithers through a half-asleep committee while nobody important is looking. Crane is grateful as a man who just bought himself a politician — which is exactly what he is, and exactly what you are.',
      },
      {
        label: `Tell him to shove it — the whole thing reeks`,
        fx: { support: 8, media: 4, funds: -2 },
        set: { clean_streak: true },
        arcSet: { id: 'harbor', stage: 99 },
        tone: 'bold',
        result: `You kill the deal stone dead. Crane's shark-grin curdles, and some columnist crowns you "the one bastard who can't be bought." Cheap publicity, and the rare flattering kind.`,
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
    kicker: 'Loose threads, and a reporter who pulls',
    title: 'The Harbor Questions',
    body: `A reporter with the tenacity of a kicked-over hornet's nest has the rezoning timeline, the committee vote, AND a long-lens photo of you waddling off Crane's yacht looking very pleased with yourself. She wants a comment by morning, or she'll write the one she's already got.`,
    choices: [
      {
        label: `Stonewall the nosy cow and run out the clock`,
        fx: { heat: 10, media: -4 },
        set: { stonewalled_harbor: true },
        arcSet: { id: 'harbor', stage: 2 },
        tone: 'slick',
        result: `"No comment" becomes the headline, which is just "guilty" wearing a nicer suit. The story has legs now — long ones, and they are striding straight up your driveway.`,
      },
      {
        label: 'Get ahead of it — vomit out the whole truth first',
        fx: { heat: -14, support: -4, media: 4 },
        set: { came_clean: true },
        arcSet: { id: 'harbor', stage: 99 },
        tone: 'good',
        result:
          'You dump the records yourself before she can. It stings like hell for a week, but you lanced the boil instead of letting it fester into a full-blown obituary.',
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
    kicker: 'The reckoning, with subpoenas attached',
    title: 'The Harbor Reckoning',
    body: `A prosecutor with a hard-on for headlines just subpoenaed the harbor files. This is the moment the whole filthy business either evaporates forever — or becomes the single sentence carved on your gravestone, right under your name.`,
    choices: [
      {
        label: 'Make it disappear — whatever the hell it costs',
        fx: { funds: -18, heat: -8 },
        set: { buried_a_body: true, corrupt_streak: true },
        scandal: { id: 'harbor_coverup', label: 'the buried harbor files', severity: 4 },
        arcSet: { id: 'harbor', stage: 99 },
        tone: 'slick',
        result:
          'Files get "misplaced." Witnesses lose their memories along with their nerve. You walk away clean — and you have become, brick by brick, the exact crooked son of a bitch you once swore you ran against.',
      },
      {
        label: 'Confess on camera and eat the whole hit',
        roll: {
          stat: 'media',
          dc: 52,
          success: {
            fx: { support: 10, media: 8, heat: -12 },
            set: { honest_rep: true, secret_reformer: true },
            arcSet: { id: 'harbor', stage: 99 },
            text: 'You own every grubby detail on live television, looking sick about it. Improbably, the public eats it up — a redemption arc, broadcast in glorious high definition.',
          },
          fail: {
            fx: { support: -12, heat: 6 },
            arcSet: { id: 'harbor', stage: 99 },
            ending: 'scandal',
            text: 'The confession becomes the scandal of the decade, and decidedly not the inspiring, tears-on-camera kind.',
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
    kicker: 'A powerful friend with a very long memory',
    title: 'The Patron Extends His Hand',
    body: `Secretary Volkov, a Council heavyweight with a smile like a closing drawer, decides you're worth owning. "Talent rises faster," he says, swirling his drink, "when a big hand up top is pulling. I can be that hand — you'd only have to remember, forever, whose fingers lifted you."`,
    choices: [
      {
        label: 'Kiss the ring and take his patronage',
        fx: { influence: 14, funds: 8, heat: 4 },
        set: { has_patron: true },
        arcSet: { id: 'patron', stage: 1 },
        tone: 'slick',
        result:
          'Locked doors swing wide overnight. You rise like a cork — and a ledger of debts cracks open with your name scrawled fat across the very top line.',
      },
      {
        label: `Owe no bastard a thing — climb the rope alone`,
        fx: { support: 8, base: 4, influence: -4 },
        set: { own_man: true, clean_streak: true },
        arcSet: { id: 'patron', stage: 99 },
        tone: 'bold',
        result:
          'You decline, polite as a funeral. The climb will be slower, lonelier, and full of splinters — but every debt at the top will be yours alone, and blessedly few.',
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
    kicker: 'The debt comes due, with interest',
    title: "The Patron's Favor",
    body: `Volkov needs a problem to vanish — a shipment, a ledger, one inconveniently honest inspector. "A small thing," he murmurs, "for family." It is not a small thing. It is the kind of thing that leaves a paper trail long enough to hang two men, side by side.`,
    choices: [
      {
        label: 'Handle the dirty errand — you owe the old snake',
        fx: { influence: 8, heat: 10 },
        set: { compromised: true },
        scandal: { id: 'patron_favor', label: 'the favor you buried for your patron', severity: 3 },
        arcSet: { id: 'patron', stage: 2 },
        tone: 'slick',
        result:
          'It is done, clean as a wiped knife. Volkov beams like a proud father. Somewhere out there a record now exists that could end the both of you in a single afternoon.',
      },
      {
        label: 'Quietly weasel out and put some daylight between you',
        fx: { influence: -8, heat: -6, base: 4 },
        set: { own_man: true },
        arcSet: { id: 'patron', stage: 99 },
        tone: 'good',
        result:
          'You suddenly have reasons to be everywhere he is not. Volkov clocks the chill — and a patron snubbed is a dangerous animal, but so is a leash you finally chewed through.',
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
    kicker: 'The reckoning, knives out',
    title: 'The Patron Falls',
    body: `Volkov's enemies in the Standing Committee are circling for the kill, and every soul in the building knows you're his pet creature. The only question left: do you go down clutching his coattails, or do you put the knife in his back first and call it ambition?`,
    choices: [
      {
        label: 'Denounce the old man first — stab before he sinks you',
        fx: { influence: 10, base: 8, heat: -6 },
        inc: { purge_count: 1 },
        set: { bloody_hands: true, struck_first: true },
        arcSet: { id: 'patron', stage: 99 },
        tone: 'bold',
        result:
          'You stand up and read the charges out yourself, cool as a corpse. Volkov gapes as they march him out the door. You built this man; now you have unbuilt him, plank by plank. The Committee files away just how little your hand shook.',
      },
      {
        label: `Stand by the doomed bastard — loyalty, whatever it costs`,
        roll: {
          stat: 'influence',
          dc: 56,
          success: {
            fx: { base: 10, support: 6, heat: -4 },
            set: { has_network: true, honest_rep: true },
            arcSet: { id: 'patron', stage: 99 },
            text: "Against all sane odds, your loyalty holds the wall, and a handful of waverers crawl to your side out of sheer respect. Volkov survives, shrunken and grey — and he never, ever forgets the one man who didn't bolt.",
          },
          fail: {
            fx: { support: -12, heat: 16 },
            arcSet: { id: 'patron', stage: 99 },
            ending: 'purge',
            text: 'Loyalty to a sinking man just buys you a slower, wetter drowning. They come kicking your door in that very same week.',
          },
        },
        tone: 'good',
      },
    ],
  },
  ...DARK_MIRROR_ARC_EVENTS,
];
