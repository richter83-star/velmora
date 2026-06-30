import type { ArcDef, GameEvent } from '../engine/types';

/**
 * Dark Mirrors story arcs — one 3-stage corruption/loyalty thread for each of
 * the three expansion paths (iron / gilded / anointed), which previously had no
 * arcs of their own. Each mirrors the harbor/patron shape: stage 0 is the entry
 * temptation, the first choice always advances (0 -> 1 -> 2 -> 99 terminal) and
 * the alternative exits the arc early/clean. The terminal stage offers a dark
 * exit (sets the finale's "dark" flags) and a clean roll (sets the finale's
 * "clean" flags, or trips a path-appropriate ending on a failed roll).
 *
 * Flag wiring per path (consumed by ironFinale/gildedFinale/anointedFinale in
 * engine/endings.ts):
 *   iron     — dark: bloody_hands/tyrant_rep (+purge_count); clean: secret_reformer/peacemaker
 *   gilded   — dark: corrupt_streak; clean: honest_rep
 *   anointed — dark: own_cult/cult_building (+bloody_hands at the reckoning); clean: secret_reformer/peacemaker
 */
export const DARK_MIRROR_ARCS: ArcDef[] = [
  {
    id: 'marshal',
    title: "The Marshal's Pact",
    paths: ['iron'],
    entryStage: 0,
    terminalStages: [99],
    desc: 'A rival officer offers a pact of steel — and at the top of the Order you must purge him or be purged.',
  },
  {
    id: 'leverage',
    title: 'The Leveraged Friend',
    paths: ['gilded'],
    entryStage: 0,
    terminalStages: [99],
    desc: 'A vulture financier leverages your war chest into a killing — and the cooked books follow you to the Summit.',
  },
  {
    id: 'miracle',
    title: 'The Manufactured Miracle',
    paths: ['anointed'],
    entryStage: 0,
    terminalStages: [99],
    desc: 'A coincidence gets mistaken for a wonder — claim it and a counterfeit faith follows you to the altar.',
  },
];

export const DARK_MIRROR_ARC_EVENTS: GameEvent[] = [
  // ============ THE MARSHAL'S PACT (iron) ============
  {
    id: 'arc_marshal_0',
    arc: { id: 'marshal', stage: 0 },
    paths: ['iron'],
    phases: [1],
    weight: 30,
    art: 'rival',
    emoji: '🎖️',
    kicker: 'A handshake that smells of gun oil and old blood',
    title: 'The Marshal Offers His Hand',
    body: `Marshal Dragomir Vask commands half the garrison and most of the men who'd do the ugly work without being told twice. He finds you after the parade, breath like a distillery fire. "Two fists are better than one, friend," he says, "so long as they punch the same face. Back my crackdown, I back your climb, and we split the spoils like brothers — or you can keep being a clever little nobody the officers laugh at over their cards."`,
    choices: [
      {
        label: 'Clasp the old butcher’s hand and seal the pact',
        fx: { influence: 14, base: 8, heat: 6 },
        set: { marshal_pact: true },
        arcSet: { id: 'marshal', stage: 1 },
        tone: 'slick',
        result:
          'You shake on it, and the garrison doors that were bolted against you swing wide overnight. You rise like a fist — and somewhere a tab opens with your name carved at the top, payable in the kind of currency that stains.',
      },
      {
        label: 'Keep the army yours alone — owe no man with a rank',
        fx: { base: 8, support: 6, influence: -4 },
        set: { own_man: true, clean_streak: true },
        arcSet: { id: 'marshal', stage: 99 },
        tone: 'bold',
        result:
          'You decline, flat as a rifle report. Vask’s grin goes cold and professional. The climb gets steeper and lonelier from here, but every soldier who salutes you salutes YOU — not a deal you cut in the dark with a drunk in medals.',
      },
    ],
  },
  {
    id: 'arc_marshal_1',
    arc: { id: 'marshal', stage: 1 },
    paths: ['iron'],
    phases: [1, 2],
    weight: 32,
    art: 'scene',
    emoji: '🗎',
    kicker: 'The pact’s first invoice, written in a man’s name',
    title: "The Marshal's Price",
    body: `Vask slides a single order across the table and taps it twice. A colonel — honest, popular, inconveniently alive — has been asking the wrong questions about where the grain went. "Sign," the Marshal says, "and he gets reassigned to a hole in the ground. For the Order. For us." The pen is already uncapped. It is not a small thing. It never was.`,
    choices: [
      {
        label: 'Sign the order and let the hole get dug',
        fx: { influence: 8, heat: 10 },
        inc: { purge_count: 1 },
        set: { compromised: true },
        scandal: { id: 'marshal_order', label: 'the order with the dead colonel’s name on it', severity: 3 },
        arcSet: { id: 'marshal', stage: 2 },
        tone: 'slick',
        result:
          'Your signature dries. The colonel is gone by the weekend, and the officers learn the most useful fact about you that there is: that you’ll do it. A copy of that order exists somewhere now, and it could end you and Vask in the same grey afternoon.',
      },
      {
        label: 'Tear the order in half and put daylight between you',
        fx: { influence: -8, heat: -6, base: 4 },
        set: { own_man: true },
        arcSet: { id: 'marshal', stage: 99 },
        tone: 'good',
        result:
          'You rip it, slow, while he watches. Vask’s face curdles into something patient and awful. A patron snubbed is a cornered animal — but a leash you finally bit through is a kind of freedom worth bleeding for.',
      },
    ],
  },
  {
    id: 'arc_marshal_2',
    arc: { id: 'marshal', stage: 2 },
    paths: ['iron'],
    phases: [2, 3],
    weight: 34,
    art: 'crisis',
    emoji: '⚔️',
    kicker: 'The reckoning, with the whole Officer Corps watching',
    title: 'The Marshal Becomes a Rival',
    body: `The pact outlived its usefulness the day you stopped needing him. Now Vask wants the Iron Palace for himself, and every officer in the building is standing very still, waiting to see which of you blinks first. There is no version of this where you both walk away. There is only who reads the charges, and who hears them.`,
    choices: [
      {
        label: 'Purge the old butcher first — read the charges yourself',
        fx: { influence: 12, base: 8, heat: -6 },
        inc: { purge_count: 1 },
        set: { bloody_hands: true, tyrant_rep: true, struck_first: true },
        arcSet: { id: 'marshal', stage: 99 },
        tone: 'bold',
        result:
          'You stand and read them out cold, every count, while Vask’s jaw works on a defense that never comes. They march him out past the men he commanded. You built nothing with him and you unbuild him in an afternoon, and the Corps files away exactly how steady your voice stayed.',
      },
      {
        label: 'Offer to share the Order instead — stand down the knives',
        roll: {
          stat: 'influence',
          dc: 56,
          success: {
            fx: { base: 10, support: 6, heat: -8 },
            set: { secret_reformer: true, peacemaker: true, has_network: true },
            arcSet: { id: 'marshal', stage: 99 },
            text: 'Against every instinct in the room, you split command down the middle and make it stick — rules instead of knives, a chain instead of a pile of bodies. Vask lives, smaller and stranger, and a Corps that expected a bloodbath gets a structure instead. They will never quite forgive how reasonable you were.',
          },
          fail: {
            fx: { influence: -12, heat: 16 },
            arcSet: { id: 'marshal', stage: 99 },
            ending: 'purge',
            text: 'You reach for the olive branch and Vask reaches for the garrison. Mercy, it turns out, was just a slower way to lose. They come for your door before the week is out.',
          },
        },
        tone: 'good',
      },
    ],
  },

  // ============ THE LEVERAGED FRIEND (gilded) ============
  {
    id: 'arc_leverage_0',
    arc: { id: 'leverage', stage: 0 },
    paths: ['gilded'],
    phases: [1],
    weight: 30,
    art: 'scene',
    emoji: '💼',
    kicker: 'An offer with teeth, smiling over a thirty-year scotch',
    title: 'The Vulture Makes an Offer',
    body: `Auberon Sloat got rich the way a tick gets fat — by finding something already bleeding and refusing to let go. He wants to leverage your war chest into a rigged buyout of a rival house, gut it for parts, and split the carcass. "Money’s just stored nerve, friend," he says, swirling the glass. "You’ve got the nerve. I’ve got the money. Let’s go ruin somebody together."`,
    choices: [
      {
        label: 'Take the leverage and load the gun',
        fx: { funds: 16, heat: 8, base: -2 },
        set: { leveraged: true },
        arcSet: { id: 'leverage', stage: 1 },
        tone: 'slick',
        result:
          'The buyout goes through like a knife through warm fat. Your war chest doubles, then doubles again, and a rival house is auctioned off as scrap. Sloat toasts you like a proud uncle — which is to say, like a man who now owns a piece of you.',
      },
      {
        label: 'Pass — keep your books boring and your hands clean',
        fx: { funds: -2, support: 8, media: 4 },
        set: { honest_rep: true, clean_streak: true },
        arcSet: { id: 'leverage', stage: 99 },
        tone: 'bold',
        result:
          'You wave it off. Sloat shrugs — there’s always another nerve for hire. You climb slower without his leverage, but no auditor will ever find your name stapled to a gutted company, and that quiet is worth more than the killing was.',
      },
    ],
  },
  {
    id: 'arc_leverage_1',
    arc: { id: 'leverage', stage: 1 },
    paths: ['gilded'],
    phases: [1, 2],
    weight: 32,
    art: 'newspaper',
    emoji: '🧾',
    kicker: 'A clean set of books, and one auditor who can read',
    title: 'The Books Need a Lie',
    body: `The buyout only stays legal if the numbers say it was fair, and the numbers say no such thing. Worse, a grey little auditor named Pell has the real ledger and the spine to file it. Sloat wants the report to vanish and a friendlier set of figures to take its place. The forgery is a felony with a long, patient tail.`,
    choices: [
      {
        label: 'Cook the books and bury the auditor’s report',
        fx: { funds: 12, heat: 8 },
        set: { corrupt_streak: true },
        scandal: { id: 'leverage_books', label: 'the second set of books', severity: 3 },
        arcSet: { id: 'leverage', stage: 2 },
        tone: 'slick',
        result:
          'Pell’s report gets "lost in intake." A glossier version takes its place, and the deal is reborn squeaky-clean on paper. Somewhere a true ledger still exists, though, and true ledgers have a way of crawling back into the light at the worst imaginable moment.',
      },
      {
        label: 'Walk it to the regulators yourself before Pell can',
        fx: { funds: -14, media: 6, heat: -8 },
        set: { came_clean: true, honest_rep: true },
        arcSet: { id: 'leverage', stage: 99 },
        tone: 'good',
        result:
          'You hand over the real numbers with your own name on the cover letter. It costs a fortune in fines and a worse fortune in pride — but you lanced it before it could rot into an indictment, and the Exchange grudgingly files you under "crook with a conscience."',
      },
    ],
  },
  {
    id: 'arc_leverage_2',
    arc: { id: 'leverage', stage: 2 },
    paths: ['gilded'],
    phases: [2, 3],
    weight: 34,
    art: 'crisis',
    emoji: '⚖️',
    kicker: 'The reckoning, with the Exchange leaning in to listen',
    title: 'The Vulture Turns',
    body: `Cornered by his own creditors, Sloat does what vultures do when the carcass runs out: he eyes the nearest living thing. He’ll flip on you to the prosecutors to save his own gilded hide — unless you make him, and the cooked books, disappear for good. The Exchange has gone very quiet, the way a room does before a verdict.`,
    choices: [
      {
        label: 'Buy his silence and make the whole mess vanish',
        fx: { funds: -18, heat: -8 },
        set: { buried_a_body: true, corrupt_streak: true },
        scandal: { id: 'leverage_payoff', label: 'the hush money that bought the vulture', severity: 4 },
        arcSet: { id: 'leverage', stage: 99 },
        tone: 'slick',
        result:
          'A sum with too many zeros changes hands, the true ledger feeds a furnace, and Sloat develops a sudden, total amnesia. You walk away rich and untouched — and finished becoming the exact bloodless predator you used to swear you were smarter than.',
      },
      {
        label: 'Confess the whole scheme on the record — eat the hit',
        roll: {
          stat: 'media',
          dc: 52,
          success: {
            fx: { funds: -10, media: 8, support: 8, heat: -12 },
            set: { honest_rep: true, secret_reformer: true },
            arcSet: { id: 'leverage', stage: 99 },
            text: 'You lay the entire rotten scheme out under oath, looking nauseous, and somehow the candor lands. The fines gut you, but the public decides a rich man who confesses is rarer and stranger than one who steals — a redemption with a balance sheet.',
          },
          fail: {
            fx: { support: -12, heat: 6 },
            arcSet: { id: 'leverage', stage: 99 },
            ending: 'indicted',
            text: 'Your confession doesn’t read as brave. It reads as evidence. The prosecutors thank you for it, in writing, on the indictment.',
          },
        },
        tone: 'bold',
      },
    ],
  },

  // ============ THE MANUFACTURED MIRACLE (anointed) ============
  {
    id: 'arc_miracle_0',
    arc: { id: 'miracle', stage: 0 },
    paths: ['anointed'],
    phases: [1],
    weight: 30,
    art: 'scene',
    emoji: '🕯️',
    kicker: 'A coincidence, mistaken for the hand of something higher',
    title: 'The Wonder You Did Not Perform',
    body: `A sick child you happened to stand near got better the same night, and now the parish is on its knees swearing you laid hands and pulled her back from the dark. You did no such thing. You were holding a soup bowl. But the look on their faces — that hungry, grateful, dangerous hope — is the kind of thing that builds altars. Or you could just tell them the truth.`,
    choices: [
      {
        label: 'Say nothing — let the legend fatten in the retelling',
        fx: { support: 12, influence: 6, media: 6 },
        set: { cult_building: true },
        arcSet: { id: 'miracle', stage: 1 },
        tone: 'slick',
        result:
          'You don’t lie. You simply decline, very humbly, to correct anyone, and the story swells with every mouth it passes through. By month’s end the soup bowl is gone from the telling, and your hands are glowing in it. The faithful start arriving with their sick.',
      },
      {
        label: 'Correct the record — you’re no miracle worker',
        fx: { support: -6, media: 6, heat: -6 },
        set: { secret_reformer: true, clean_streak: true },
        arcSet: { id: 'miracle', stage: 99 },
        tone: 'good',
        result:
          'You tell them plainly: a coincidence, a recovering kid, a man with a bowl. Some are disappointed, a few are angry to be robbed of their wonder — but you didn’t build your climb on a counterfeit, and that floor will hold weight the altar never could.',
      },
    ],
  },
  {
    id: 'arc_miracle_1',
    arc: { id: 'miracle', stage: 1 },
    paths: ['anointed'],
    phases: [1, 2],
    weight: 32,
    art: 'scene',
    emoji: '🤫',
    kicker: 'The lie needs feeding, and one witness wants to recant',
    title: 'The Witness Who Remembers',
    body: `The child’s own aunt was there. She knows there was no miracle, just a fever breaking on its own schedule, and her conscience has started keeping her up at night. She wants to stand in the square and say so. The myth you’ve been fattening cannot survive her telling the truth out loud — not without help going very quiet, very fast.`,
    choices: [
      {
        label: 'Silence her gently — and double down on the myth',
        fx: { support: 10, heat: 8 },
        set: { own_cult: true },
        scandal: { id: 'miracle_lie', label: 'the witness you bought into silence', severity: 3 },
        arcSet: { id: 'miracle', stage: 2 },
        tone: 'slick',
        result:
          'A stipend, a soft word, a hint of what doubt costs the doubtful — and the aunt finds reasons to stay home. The myth not only survives, it hardens into doctrine. You’ve learned the worst lesson there is: that faith, managed right, will guard its own lie.',
      },
      {
        label: 'Free her to speak — confess the coincidence yourself',
        fx: { support: -8, media: 6, heat: -8 },
        set: { came_clean: true, secret_reformer: true },
        arcSet: { id: 'miracle', stage: 99 },
        tone: 'good',
        result:
          'You stand beside her in the square and let her say every word, then add your own: it was never me. The congregation shrinks and stings for a season — but what’s left believes in something real, and you can sleep facing the altar instead of away from it.',
      },
    ],
  },
  {
    id: 'arc_miracle_2',
    arc: { id: 'miracle', stage: 2 },
    paths: ['anointed'],
    phases: [2, 3],
    weight: 34,
    art: 'crisis',
    emoji: '🔥',
    kicker: 'The reckoning, with the whole Sanctum holding its breath',
    title: 'The Rival Cries Fraud',
    body: `Hierarch Calla Venn has done the arithmetic on your miracle and found it short. She means to denounce you from her own pulpit and split the faithful down the middle — a schism with your name as the wound. You can brand her a heretic and let the devout do the rest, or you can climb the steps and tell the truth that ends the whole counterfeit.`,
    choices: [
      {
        label: 'Brand her a heretic — let the faithful tear her down',
        fx: { support: 10, influence: 8, heat: 10 },
        inc: { purge_count: 1 },
        set: { bloody_hands: true, own_cult: true },
        arcSet: { id: 'miracle', stage: 99 },
        tone: 'bold',
        result:
          'You aim the word "heretic" at her like a fire hose, and the congregation you built does exactly what frightened, devoted crowds do. Venn is shouted out of her own Sanctum. The schism never comes, because the doubt never gets to breathe — and the faith you inherited as comfort, you leave as a cudgel.',
      },
      {
        label: 'Climb the pulpit and confess the counterfeit',
        roll: {
          stat: 'support',
          dc: 56,
          success: {
            fx: { support: 6, media: 8, heat: -12 },
            set: { secret_reformer: true, peacemaker: true },
            arcSet: { id: 'miracle', stage: 99 },
            text: 'You tell them all of it — the bowl, the fever, the aunt, the years of letting it grow. You brace for the stones. Instead, improbably, the honesty becomes its own kind of miracle, and Venn lowers her charge because there’s nothing left to expose. The faith survives, scarred and truer.',
          },
          fail: {
            fx: { support: -14, heat: 8 },
            arcSet: { id: 'miracle', stage: 99 },
            ending: 'schism',
            text: 'The confession lands like a betrayal instead of a grace. The faithful split in two and take half your altar with them. Venn gets her schism after all, and your name is the crack that runs through it.',
          },
        },
        tone: 'good',
      },
    ],
  },
];
