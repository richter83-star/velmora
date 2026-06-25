import type { GameEvent } from '../engine/types';

/**
 * Content pack 1 — the first volume expansion toward a commercial-size event
 * bank. Merged into the draw pool in the engine boot; validated by the content
 * linter like every other event. Fictional and non-partisan by construction.
 */
export const PACK_1: GameEvent[] = [
  // ---------------- BALLOT ----------------
  {
    id: 'p1_b_endorsement',
    paths: ['ballot'],
    phases: [1, 2],
    weight: 9,
    art: 'newspaper',
    emoji: '📣',
    title: 'A Coveted Endorsement',
    body: `Velmora's most-watched rag will slap its blessing on your ugly mug — but only if you'll quietly grow a spine made of wet noodles on the one issue their publisher actually gives a damn about.`,
    choices: [
      {
        label: 'Take the endorsement, gut your own line like a fish',
        fx: { media: 12, support: 6, base: -4 },
        set: { owes_press: true },
        tone: 'slick',
        result:
          'The front page jerks you off in eight-point font. A few true believers grumble that you blinked like a virgin at a strip club.',
      },
      {
        label: `Tell them to shove it — keep your platform clean`,
        fx: { base: 8, support: -2 },
        set: { honest_rep: true },
        tone: 'bold',
        result: `You keep your balls and lose the headline. Your volunteers, high on your stubborn martyr energy, knock on twice as many goddamn doors.`,
      },
    ],
  },
  {
    id: 'p1_b_fundraiser',
    paths: ['ballot'],
    phases: [1, 2, 3],
    weight: 8,
    art: 'scene',
    emoji: '🥂',
    title: 'The Five-Figure Dinner',
    body: `A bundler dangles a glittering fundraiser at a price that buys the whole room a generous chunk of your soul. The optics are... obscenely rich.`,
    choices: [
      {
        label: 'Headline the rich-prick dinner',
        fx: { funds: 16, heat: 6, support: -2 },
        tone: 'slick',
        result: `The War Chest gorges itself. Some tracker films you handing your keys to a valet for a car worth more than a hospital.`,
      },
      {
        label: 'Do a grubby grassroots phone-bank instead',
        fx: { funds: 5, base: 8, media: 2 },
        set: { grassroots: true },
        tone: 'good',
        result: `Smaller checks, fatter crowd. The narrative writes its own damn self: man of the unwashed people.`,
      },
      {
        label: `Skim a little off the top for "consulting"`,
        req: (S) => S.stats.funds >= 10,
        reqText: 'Needs War Chest 10+',
        fx: { funds: 8, heat: 12 },
        set: { corrupt_streak: true },
        scandal: { id: 'consulting_skim', label: 'the consulting-fee skim', severity: 2 },
        tone: 'slick',
        result: `A friendly firm bills you for work no living soul can describe. Squeaky clean. Definitely not theft. Definitely.`,
      },
    ],
  },
  {
    id: 'p1_b_gaffe',
    paths: ['ballot'],
    phases: [1, 2, 3],
    weight: 8,
    art: 'scene',
    emoji: '🎤',
    title: 'The Hot Mic',
    body: `A microphone you swore was dead caught you saying something honest, impolitic, and absolutely career-flavored. The clip is climbing like a horny squirrel.`,
    choices: [
      {
        label: 'Own it with a joke',
        roll: {
          stat: 'media',
          dc: 50,
          success: {
            fx: { support: 8, media: 6 },
            text: `You lean in, laugh at your own dumb ass, and the gaffe curdles into a relatable-guy moment. The crowd eats it like free shrimp.`,
          },
          fail: {
            fx: { support: -8, heat: 4 },
            text: `The joke face-plants in front of God and everybody, and now there are two clips dragging your name through the mud.`,
          },
        },
        tone: 'bold',
      },
      {
        label: 'Grovel and move on',
        fx: { support: -2, media: 2, heat: -2 },
        tone: 'good',
        result: `A crisp little apology sucks all the oxygen out of the scandal. By Thursday nobody remembers your name, let alone your sin.`,
      },
    ],
  },
  {
    id: 'p1_b_attack_ad',
    paths: ['ballot'],
    phases: [2, 3],
    weight: 8,
    art: 'rival',
    emoji: '📺',
    title: 'The Attack Ad',
    speaker: (S) => ({ name: S.opp, role: 'your rival', avatar: S.oppAvatar }),
    body: (S) =>
      `${S.opp} cuts a vicious little ad about you — half true, which is the kind that actually leaves a mark. Your team is frothing to fire back twice as dirty.`,
    choices: [
      {
        label: 'Go absolutely nuclear in response',
        fx: { support: 4, media: 2, heat: 8, base: 6 },
        set: { went_negative: true },
        npcFx: { id: 'antagonist', relationship: -18 },
        tone: 'bold',
        result: `The airwaves turn to raw sewage. Both your numbers take a hit; your rabid bases howl like it's feeding time.`,
      },
      {
        label: 'Run a sappy positive ad instead',
        fx: { support: 6, media: 4, base: -2 },
        tone: 'good',
        result: `You answer venom with hope and soft piano music. The undecideds exhale and pretend they weren't enjoying the bloodbath.`,
      },
    ],
  },

  // ---------------- VANGUARD ----------------
  {
    id: 'p1_v_quota',
    paths: ['vanguard'],
    phases: [1, 2],
    weight: 9,
    art: 'bulletin',
    emoji: '🏭',
    title: 'The Impossible Quota',
    body: `The plan demands numbers your district couldn't hit with a borrowed miracle. You can report the ugly truth, or report the fairy tale the Centre is desperate to jerk off to.`,
    choices: [
      {
        label: 'Cook the books like a short-order liar',
        fx: { influence: 8, media: 6, heat: 8 },
        set: { cooked_books: true },
        scandal: { id: 'cooked_quota', label: 'the falsified production figures', severity: 2 },
        tone: 'slick',
        result: `The Centre creams itself over your "record harvest." The granaries are, regrettably, complete and total fiction.`,
      },
      {
        label: 'Report the shortfall like an honest idiot',
        fx: { support: 6, base: 4, influence: -6 },
        set: { honest_rep: true },
        tone: 'bold',
        result: `Your candor is noted — with a raised eyebrow, a wrinkled nose, and a noticeably thinner stack of friends.`,
      },
    ],
  },
  {
    id: 'p1_v_informant',
    paths: ['vanguard'],
    phases: [1, 2, 3],
    weight: 8,
    art: 'scene',
    emoji: '🕯️',
    title: 'The Informant',
    body: `A twitchy little clerk offers to feed you whispers from rival offices — in exchange for not ending up in a ditch. An informant is a knife that loves to swivel and stab the hand holding it.`,
    choices: [
      {
        label: 'Recruit the rat',
        fx: { influence: 10, heat: 4 },
        set: { has_network: true, blackmailer: true },
        tone: 'slick',
        result: `You now hear about backstabs before the knife's even sharpened. You also owe a terrified human being his continued breathing privileges.`,
      },
      {
        label: 'Refuse — too radioactive',
        fx: { base: 4, heat: -4 },
        tone: 'good',
        result: `You wave the poor bastard off. Some doors stay a hell of a lot quieter when you leave them shut.`,
      },
    ],
  },
  {
    id: 'p1_v_loyalty_oath',
    paths: ['vanguard'],
    phases: [1, 2],
    weight: 8,
    art: 'bulletin',
    emoji: '✍️',
    title: 'The Loyalty Oath',
    body: `A new oath is making the rounds — fervent, absolute, and slightly foaming at the mouth. Signing first brands you a true believer. Signing late brands you, period.`,
    choices: [
      {
        label: 'Sign first, sign loudest, sign in blood if they let you',
        fx: { base: 10, media: 4, support: -2 },
        set: { hardliner_cred: true },
        tone: 'bold',
        result: `Your name leads the page like a screaming headline. The frothing true-believer wing adopts you as one of their own rabid pups.`,
      },
      {
        label: 'Sign quietly, mean jack squat',
        fx: { heat: 4, influence: 2 },
        tone: 'slick',
        result: `You bury your name in the soggy middle of the list, where signatures go to be forgotten. Cowardly. Wise. Same thing.`,
      },
    ],
  },
  {
    id: 'p1_v_dacha',
    paths: ['vanguard'],
    phases: [2, 3],
    weight: 8,
    art: 'scene',
    emoji: '🏡',
    title: 'The State Dacha',
    body: `Somebody offers you a lakeside dacha — a perk of rank and a gilded set of greasy fingerprints right on the ledger of who got fat off the people.`,
    choices: [
      {
        label: 'Grab the dacha with both hands',
        fx: { funds: 10, base: 4, heat: 8 },
        set: { corrupt_streak: true },
        tone: 'slick',
        result: `The lake is gorgeous. The list of who scored a dacha is a document that will, one glorious day, be read aloud at somebody's tribunal.`,
      },
      {
        label: 'Decline, loudly, for the cameras',
        fx: { support: 8, base: -2, heat: -6 },
        set: { ascetic_rep: true },
        tone: 'good',
        result: `You stay in your sad little flat and make damn sure everyone knows about your noble suffering. Humility, it turns out, is just theater with worse lighting.`,
      },
    ],
  },

  // ---------------- SHARED ----------------
  {
    id: 'p1_s_old_friend',
    paths: ['ballot', 'vanguard'],
    phases: [1, 2],
    weight: 7,
    art: 'scene',
    emoji: '👴',
    title: 'An Old Friend Calls',
    body: `Somebody who knew you back when you were nobody — before the power, before the ego, before the haircut — calls in a small, slightly filthy favor. For old times' sake, you sentimental sap.`,
    choices: [
      {
        label: 'Help him — quietly, off the books',
        fx: { funds: -4, base: 6, heat: 4 },
        set: { loyal_to_old_friends: true },
        tone: 'good',
        result: `You make a phone call you absolutely should not have made. For one stupid second it feels like being a human being again instead of a power-suit with teeth.`,
      },
      {
        label: 'Gently tell him to pound sand',
        fx: { heat: -2, support: 2 },
        tone: 'good',
        result: `You explain that you simply can't. The silence on the line is the price of admission to the top of the heap.`,
      },
    ],
  },
  {
    id: 'p1_s_health_rumor',
    paths: ['ballot', 'vanguard'],
    phases: [2, 3],
    weight: 7,
    art: 'newspaper',
    emoji: '🩺',
    title: 'The Health Rumor',
    body: `Word's going around that you're knocking on death's door. You feel fine as hell. Unfortunately, rumors don't give two shits how you feel.`,
    choices: [
      {
        label: 'Stage a sweaty, vigorous public appearance',
        fx: { support: 6, media: 6, funds: -2 },
        tone: 'good',
        result: `You chop wood / haul sandbags / jog for the cameras like a maniac proving a point. The rumor wilts like a sad little flower.`,
      },
      {
        label: 'Ignore it as beneath your majesty',
        roll: {
          stat: 'base',
          dc: 50,
          success: {
            fx: { support: 2 },
            text: `Your silence reads as ice-cold confidence. The rumor starves to death in the corner.`,
          },
          fail: {
            fx: { support: -8, media: -4, heat: 4 },
            text: `Your silence reads as a deathbed confession. The rumor feasts on your political corpse.`,
          },
        },
        tone: 'slick',
      },
    ],
  },

  // ---------------- CRISES ----------------
  {
    id: 'p1_c_market_crash',
    paths: ['ballot', 'vanguard'],
    phases: [1, 2, 3],
    weight: 10,
    crisis: true,
    art: 'crisis',
    emoji: '📉',
    title: 'The Markets Seize',
    body: `Credit freezes solid overnight. Savings evaporate, banks wobble like drunks on ice, and a terrified nation spins around to stare at you for a single steady word.`,
    choices: [
      {
        label: 'Backstop the banks, fast, before they shit themselves',
        fx: { support: 8, funds: -16, influence: 6 },
        set: { bailed_banks: true },
        tone: 'good',
        result: `You move before the panic can. The banks survive; the bill, and the lovely optics of bailing out a pack of rich gamblers, refuse to go away.`,
      },
      {
        label: 'Let the reckless greedy bastards burn',
        roll: {
          stat: 'support',
          dc: 55,
          success: {
            fx: { support: 10, base: 8, media: 4 },
            text: `You hold the line on moral hazard and the fire stays contained. The history books will hand you a halo for this one.`,
          },
          fail: {
            fx: { support: -16, heat: 10 },
            text: `The rot spreads everywhere. The failures you so bravely allowed are suddenly, gloriously, entirely your fault.`,
          },
        },
        tone: 'bold',
      },
    ],
  },
  {
    id: 'p1_c_assassination',
    paths: ['ballot', 'vanguard'],
    phases: [2, 3],
    weight: 8,
    crisis: true,
    art: 'crisis',
    emoji: '🎯',
    title: 'The Attempt',
    body: `Some idiot's plot to murder you gets foiled at the very last second. You're unhurt, rattled, and overnight the most sympathetic son of a bitch in all of Velmora.`,
    choices: [
      {
        label: 'Address the nation with calm, steely resolve',
        fx: { support: 14, media: 8, base: 6 },
        set: { survivor: true },
        tone: 'good',
        result: `You speak rock-steady, thank the guards, and refuse to let fear run the show. The polls surge on pure sweet relief.`,
      },
      {
        label: 'Milk it — round up every enemy you ever sneered at',
        fx: { base: 10, heat: 16, support: -4 },
        inc: { purge_count: 1 },
        set: { bloody_hands: true },
        tone: 'bold',
        result: `The plot becomes a permission slip with your name on it. The list of "conspirators" runs longer than any actual conspiracy could ever dream of being.`,
      },
    ],
  },
];
