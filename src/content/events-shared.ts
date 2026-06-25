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
    title: 'The Square Fills Up With Angry Pricks',
    body: `By sunup the central square is jammed and still bleaking in more bodies. It's not a mob yet — but it's standing there working up the nerve to become one, and ten thousand pairs of pissed-off eyes are locked on whatever stupid thing you do next.`,
    choices: [
      {
        label: 'Send the loyalists to crack some skulls',
        fx: { base: 6, support: -8, media: -4, heat: 14 },
        set: { bloody_hands: true, went_negative: true },
        tone: 'bold',
        result:
          'The square is empty by lunch. The photos of how you emptied it will outlive you, your kids, and your statue.',
      },
      {
        label: 'Grow a pair and go face them yourself',
        roll: {
          stat: 'media',
          dc: 52,
          success: {
            fx: { support: 14, media: 10, heat: -6 },
            text: 'You find the magic words. The crowd lets out one big collective sigh, and for one sweaty night they belong to you again.',
          },
          fail: {
            fx: { support: -10, media: -6, heat: 8 },
            text: 'The words come out wrong and clammy. The chant mutates into something with your name in it and the word "out" right after.',
          },
        },
        tone: 'bold',
      },
      {
        label: 'Toss them a concession and a bullshit committee',
        fx: { support: 8, influence: -4, heat: -6 },
        set: { peacemaker: true },
        tone: 'good',
        result:
          'You hand them a committee and a fat juicy promise. It buys time — which is the only thing power ever actually buys, the lying bastard.',
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
    title: 'Everyone Abroad Slams the Door in Your Face',
    body: `Word lands that the trade borders are clamping shut. Your foreign money men have all gone mysteriously unreachable, and the few who pick up want to know what the hell you can still do for them before they bother.`,
    choices: [
      {
        label: 'Lean on the backers who hate being named',
        fx: { funds: 14, heat: 10 },
        set: { dark_money: true, owes_donor: true },
        tone: 'slick',
        result:
          'The cash slithers in through channels nobody will ever say out loud at a podium. You owe somebody now, and that somebody never, ever forgets.',
      },
      {
        label: 'Cinch the belt and white-knuckle it',
        fx: { funds: -12, base: 8, support: 4, heat: -4 },
        set: { clean_streak: true },
        tone: 'bold',
        result:
          'You ration, then you ration the rationing, then you put the empty bellies on a poster and call the whole starving mess a heroic show of grit.',
      },
      {
        label: 'Open a sneaky back channel and grovel a little',
        roll: {
          stat: 'influence',
          dc: 50,
          success: {
            fx: { funds: 8, influence: 6, heat: -8 },
            text: 'A quiet little handshake pries one door back open. Just enough to come up for air without anyone snapping a photo.',
          },
          fail: {
            fx: { support: -6, heat: 12 },
            text: 'The back channel springs a leak. Now the whole damn country knows you were the one on your knees asking nicely.',
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
    title: 'Some Rat Is Selling Your Secrets',
    body: `Somebody close has been smuggling your words out of the room. The pattern is screaming obvious; the face is not — not yet. One of the smiling pricks who eats at your table is a leaky little snitch.`,
    speaker: (S) => ({ name: S.opp, role: 'the rival who benefits', avatar: S.oppAvatar }),
    choices: [
      {
        label: 'Purge the whole inner circle just to be safe',
        fx: { base: -4, influence: 6, heat: 10 },
        set: { bloody_hands: true },
        inc: { purge_count: 1 },
        tone: 'bold',
        result:
          'You cut nice and wide to make damn sure you got the right one. The survivors are extremely loyal now, and extremely quiet, and extremely sweaty.',
      },
      {
        label: 'Bait the rat with juicy fake info',
        roll: {
          stat: 'influence',
          dc: 54,
          success: {
            fx: { influence: 12, media: 6, heat: -4 },
            set: { has_network: true },
            text: 'The lie pops out of exactly the wrong mouth. Now you know the face, you own the moment, and the rat has no clue you watched him do it.',
          },
          fail: {
            fx: { influence: -8, heat: 10 },
            text: 'The trap gets clocked. Whoever it is now knows you are hunting — and a spooked rat is a rat that bites first.',
          },
        },
        tone: 'slick',
      },
      {
        label: 'Let the rat run and feed it poison',
        fx: { influence: 8, heat: 4 },
        set: { has_network: true, blackmailer: true },
        tone: 'slick',
        result: `You keep the pipe wide open and decide exactly what filth flows down it. The most useful traitor alive is one who's grinning, certain he's the one winning.`,
      },
    ],
  },
];
