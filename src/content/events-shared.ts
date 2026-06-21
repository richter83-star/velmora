import type { GameEvent } from '../engine/types';

/**
 * Shared expansion crises — the three instability events common to all three
 * "Dark Mirrors" paths (iron / gilded / anointed). Written path-agnostically
 * (no path-specific stat display names in the prose) so they read correctly
 * whichever new system the player is climbing. Crisis-pool only (crisis:true),
 * injected on instability like every other crisis. Fictional / non-partisan.
 */
export const SHARED_CRISES: GameEvent[] = [
  {
    id: 'xp_popular_uprising',
    paths: ['iron', 'gilded', 'anointed'],
    phases: [2, 3],
    crisis: true,
    weight: 8,
    art: 'crisis',
    emoji: '🪧',
    kicker: 'The Streets Decide',
    title: 'The Square Fills',
    body: `By dawn the central square is full and still filling. The crowd is not yet a mob — but it is deciding what it will become, and it is watching what you do next.`,
    choices: [
      {
        label: 'Send the loyalists to clear it',
        fx: { base: 6, support: -8, media: -4, heat: 14 },
        set: { bloody_hands: true, went_negative: true },
        tone: 'bold',
        result: 'The square empties by noon. The photographs will outlive you.',
      },
      {
        label: 'Go out and face them yourself',
        roll: {
          stat: 'media',
          dc: 52,
          success: {
            fx: { support: 14, media: 10, heat: -6 },
            text: 'You find the words. The crowd exhales, and for one night they are yours again.',
          },
          fail: {
            fx: { support: -10, media: -6, heat: 8 },
            text: 'The words land wrong. The chant changes to something with your name in it.',
          },
        },
        tone: 'bold',
      },
      {
        label: 'Offer a concession and a commission',
        fx: { support: 8, influence: -4, heat: -6 },
        set: { peacemaker: true },
        tone: 'good',
        result: 'You give them a committee and a promise. It buys time, which is the only thing power ever really buys.',
      },
    ],
  },
  {
    id: 'xp_foreign_embargo',
    paths: ['iron', 'gilded', 'anointed'],
    phases: [2, 3],
    crisis: true,
    weight: 8,
    art: 'crisis',
    emoji: '⛔',
    kicker: 'Isolation',
    title: 'The Doors Close Abroad',
    body: `Word comes that the borders of trade are tightening. Your foreign backers are suddenly hard to reach, and the ones who answer want to know what you can still offer them.`,
    choices: [
      {
        label: 'Lean on your quiet backers',
        fx: { funds: 14, heat: 10 },
        set: { dark_money: true, owes_donor: true },
        tone: 'slick',
        result: 'The money arrives through channels no one will ever audit out loud. You owe someone now.',
      },
      {
        label: 'Tighten the belt and tough it out',
        fx: { funds: -12, base: 8, support: 4, heat: -4 },
        set: { clean_streak: true },
        tone: 'bold',
        result: 'You ration, then ration the rationing, and make the scarcity itself a show of resolve.',
      },
      {
        label: 'Open a back channel to negotiate',
        roll: {
          stat: 'influence',
          dc: 50,
          success: {
            fx: { funds: 8, influence: 6, heat: -8 },
            text: 'A discreet arrangement reopens one door. Enough to breathe.',
          },
          fail: {
            fx: { support: -6, heat: 12 },
            text: 'The back channel leaks. Now everyone knows you were the one asking.',
          },
        },
        tone: 'slick',
      },
    ],
  },
  {
    id: 'xp_internal_betrayal',
    paths: ['iron', 'gilded', 'anointed'],
    phases: [2, 3],
    crisis: true,
    weight: 8,
    art: 'crisis',
    emoji: '🕳️',
    kicker: 'The Mole',
    title: 'The Leak',
    body: `Someone close has been carrying your words out of the room. The pattern is unmistakable; the face is not — not yet.`,
    speaker: (S) => ({ name: S.opp, role: 'the rival who benefits', avatar: S.oppAvatar }),
    choices: [
      {
        label: 'Purge the inner circle to be sure',
        fx: { base: -4, influence: 6, heat: 10 },
        set: { bloody_hands: true },
        inc: { purge_count: 1 },
        tone: 'bold',
        result: 'You cut wide to be certain you cut the right one. The survivors are very loyal, and very quiet.',
      },
      {
        label: 'Set a trap with false information',
        roll: {
          stat: 'influence',
          dc: 54,
          success: {
            fx: { influence: 12, media: 6, heat: -4 },
            set: { has_network: true },
            text: 'The lie surfaces in the wrong mouth. Now you know the face, and you own the moment.',
          },
          fail: {
            fx: { influence: -8, heat: 10 },
            text: 'The trap is spotted. Whoever it is now knows you are hunting.',
          },
        },
        tone: 'slick',
      },
      {
        label: 'Let it run and feed them poison',
        fx: { influence: 8, heat: 4 },
        set: { has_network: true, blackmailer: true },
        tone: 'slick',
        result: 'You keep the channel open and choose what flows through it. The most useful traitor is one who thinks they are winning.',
      },
    ],
  },
];
