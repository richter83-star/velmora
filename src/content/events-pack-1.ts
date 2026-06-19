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
    body: `The state's most-watched newspaper offers to endorse you — if you'll quietly soften your line on their publisher's pet issue.`,
    choices: [
      {
        label: 'Take the endorsement, soften the line',
        fx: { media: 12, support: 6, base: -4 },
        set: { owes_press: true },
        tone: 'slick',
        result: 'The front page glows. A few true believers grumble that you blinked.',
      },
      {
        label: 'Decline — keep your platform clean',
        fx: { base: 8, support: -2 },
        set: { honest_rep: true },
        tone: 'bold',
        result:
          'You keep your spine and lose the headline. Your volunteers knock on twice as many doors.',
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
    body: `A bundler offers a glittering fundraiser at a price that buys the room a great deal of your time. The optics are... rich.`,
    choices: [
      {
        label: 'Headline the dinner',
        fx: { funds: 16, heat: 6, support: -2 },
        tone: 'slick',
        result: 'The war chest swells. A tracker films you valeting a very expensive car.',
      },
      {
        label: 'Do a grassroots phone-bank instead',
        fx: { funds: 5, base: 8, media: 2 },
        set: { grassroots: true },
        tone: 'good',
        result: 'Smaller checks, bigger crowd. The narrative writes itself: people-powered.',
      },
      {
        label: 'Skim a little for "consulting"',
        req: (S) => S.stats.funds >= 10,
        reqText: 'Needs War Chest 10+',
        fx: { funds: 8, heat: 12 },
        set: { corrupt_streak: true },
        scandal: { id: 'consulting_skim', label: 'the consulting-fee skim', severity: 2 },
        tone: 'slick',
        result: 'A friendly firm invoices for work no one can quite describe. Tidy.',
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
    body: `A microphone you thought was off caught you saying something honest and impolitic. The clip is climbing.`,
    choices: [
      {
        label: 'Own it with a joke',
        roll: {
          stat: 'media',
          dc: 50,
          success: {
            fx: { support: 8, media: 6 },
            text: 'You lean in, laugh at yourself, and the gaffe becomes a relatable-guy moment.',
          },
          fail: {
            fx: { support: -8, heat: 4 },
            text: 'The joke lands flat and now there are two clips.',
          },
        },
        tone: 'bold',
      },
      {
        label: 'Apologize and move on',
        fx: { support: -2, media: 2, heat: -2 },
        tone: 'good',
        result: 'A crisp apology drains the oxygen. By Thursday it is forgotten.',
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
      `${S.opp} cuts a brutal ad about you — half true, which is the worst kind. Your team wants to fire back even harder.`,
    choices: [
      {
        label: 'Go nuclear in response',
        fx: { support: 4, media: 2, heat: 8, base: 6 },
        set: { went_negative: true },
        npcFx: { id: 'antagonist', relationship: -18 },
        tone: 'bold',
        result: 'The airwaves turn to mud. Both your numbers dip; your bases roar.',
      },
      {
        label: 'Run a positive ad instead',
        fx: { support: 6, media: 4, base: -2 },
        tone: 'good',
        result: 'You answer venom with vision. The undecideds exhale.',
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
    body: `The plan demands numbers your district cannot hit. You can report the truth, or report what the Centre wants to hear.`,
    choices: [
      {
        label: 'Cook the numbers',
        fx: { influence: 8, media: 6, heat: 8 },
        set: { cooked_books: true },
        scandal: { id: 'cooked_quota', label: 'the falsified production figures', severity: 2 },
        tone: 'slick',
        result:
          'The Centre is delighted with your "record harvest." The granaries are, regrettably, fiction.',
      },
      {
        label: 'Report the shortfall honestly',
        fx: { support: 6, base: 4, influence: -6 },
        set: { honest_rep: true },
        tone: 'bold',
        result: 'Your candor is noted — with a raised eyebrow and a thinner file of allies.',
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
    body: `A nervous clerk offers to feed you whispers from rival offices — for protection. An informant is a weapon that points both ways.`,
    choices: [
      {
        label: 'Recruit them',
        fx: { influence: 10, heat: 4 },
        set: { has_network: true, blackmailer: true },
        tone: 'slick',
        result:
          'You now hear things before they happen. You also owe a frightened person their safety.',
      },
      {
        label: 'Refuse — too dangerous',
        fx: { base: 4, heat: -4 },
        tone: 'good',
        result: 'You wave them off. Some doors are quieter left unopened.',
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
    body: `A new oath circulates — fervent, absolute, slightly unhinged. Signing first marks you as a true believer. Signing late marks you.`,
    choices: [
      {
        label: 'Sign first, sign loudest',
        fx: { base: 10, media: 4, support: -2 },
        set: { hardliner_cred: true },
        tone: 'bold',
        result:
          'Your signature leads the page. The doctrinaire wing adopts you as one of their own.',
      },
      {
        label: 'Sign quietly, mean little',
        fx: { heat: 4, influence: 2 },
        tone: 'slick',
        result:
          'You add your name in the middle of the list, where names go to be forgotten. Wise.',
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
    body: `You are offered a lakeside dacha — a perk of rank, and a gilded set of fingerprints on the ledger of privilege.`,
    choices: [
      {
        label: 'Accept the dacha',
        fx: { funds: 10, base: 4, heat: 8 },
        set: { corrupt_streak: true },
        tone: 'slick',
        result:
          'The lake is lovely. The list of who got a dacha is a document that will, someday, be read aloud.',
      },
      {
        label: 'Decline, conspicuously',
        fx: { support: 8, base: -2, heat: -6 },
        set: { ascetic_rep: true },
        tone: 'good',
        result:
          'You stay in your modest flat and let everyone know it. Humility is its own kind of theater.',
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
    body: `Someone who knew you before the power — before any of it — asks for a small, slightly improper favor. For old times.`,
    choices: [
      {
        label: 'Help them — discreetly',
        fx: { funds: -4, base: 6, heat: 4 },
        set: { loyal_to_old_friends: true },
        tone: 'good',
        result:
          'You make a call you probably should not have. It feels, briefly, like being a person again.',
      },
      {
        label: 'Gently say no',
        fx: { heat: -2, support: 2 },
        tone: 'good',
        result: 'You explain that you cannot. The silence on the line is the cost of the climb.',
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
    body: `A rumor spreads that you are gravely ill. You feel fine. Rumors do not care how you feel.`,
    choices: [
      {
        label: 'Release a vigorous public appearance',
        fx: { support: 6, media: 6, funds: -2 },
        tone: 'good',
        result: 'You chop wood / lift sandbags / jog for the cameras. The rumor wilts.',
      },
      {
        label: 'Ignore it as beneath you',
        roll: {
          stat: 'base',
          dc: 50,
          success: {
            fx: { support: 2 },
            text: 'Your silence reads as confidence. The rumor starves.',
          },
          fail: {
            fx: { support: -8, media: -4, heat: 4 },
            text: 'The silence reads as confirmation. The rumor feasts.',
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
    body: `Credit freezes overnight. Savings evaporate, banks wobble, and a frightened nation turns to you for a steady voice.`,
    choices: [
      {
        label: 'Backstop the banks, fast',
        fx: { support: 8, funds: -16, influence: 6 },
        set: { bailed_banks: true },
        tone: 'good',
        result:
          'You move before the panic does. The banks survive; the bill, and the optics of saving them, do not go away.',
      },
      {
        label: 'Let the reckless ones fail',
        roll: {
          stat: 'support',
          dc: 55,
          success: {
            fx: { support: 10, base: 8, media: 4 },
            text: 'You hold the line on moral hazard and the worst is contained. The textbooks will be kind.',
          },
          fail: {
            fx: { support: -16, heat: 10 },
            text: 'Contagion spreads. The failures you allowed become the failures you own.',
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
    body: `A plot against your life is foiled at the last moment. You are unhurt, shaken, and suddenly the most sympathetic figure in the nation.`,
    choices: [
      {
        label: 'Address the nation with calm resolve',
        fx: { support: 14, media: 8, base: 6 },
        set: { survivor: true },
        tone: 'good',
        result:
          'You speak steadily, thank the guards, and refuse to be ruled by fear. The polls surge on relief.',
      },
      {
        label: 'Use it — round up your enemies',
        fx: { base: 10, heat: 16, support: -4 },
        inc: { purge_count: 1 },
        set: { bloody_hands: true },
        tone: 'bold',
        result:
          'The plot becomes a pretext. The list of "conspirators" is longer than the conspiracy ever was.',
      },
    ],
  },
];
