import type { GameEvent } from '../engine/types';

/**
 * Dark Mirrors expansion — The Gilded Republic (theme-gilded).
 *
 * The path of capital: you do not run for office, you *acquire* it. Stat display
 * names are flavor only — the six engine keys remain support/funds/influence/
 * media/base/heat (Approval/Capital/Leverage/Narrative/Network/Scrutiny here).
 *
 * Flags are spread deliberately so different play styles push different blocs
 * past their thresholds and arm different Phase 3 endings:
 *   - secret_reformer  -> the give-it-back / PHILANTHROPIST route (with Approval)
 *   - corrupt_streak / dark_money / owes_donor -> the offshore / kleptocrat route
 *   - dealmaker / clean_streak / has_biographer -> lift old_money toward FIGUREHEAD
 * High Scrutiny (heat) tips the run toward "indicted". Morally symmetrical by
 * construction — every choice trades one kind of power for another, never a
 * blessed "right" answer. Fictional and non-partisan: the mechanism of money and
 * power in the abstract, never any real person, place, or movement.
 */
export const GILDED_EVENTS: GameEvent[] = [
  // ---------------- PHASE 1 ----------------
  {
    id: 'gr_first_acquisition',
    paths: ['gilded'],
    phases: [1],
    weight: 12,
    art: 'scene',
    emoji: '📰',
    title: 'The First Hostile Bid',
    body: `A wheezing little chain of local rags is bleeding out and begging to be put down. Own the presses and you own what a hundred backwater towns think happened today. The current owners are on their knees sobbing at you not to. Adorable.`,
    choices: [
      {
        label: 'Squeeze the poor bastards and steal it cheap',
        fx: { funds: 8, influence: 10, media: 6, heat: 8 },
        set: { went_negative: true },
        tone: 'bold',
        result:
          'You choke them until they fold and grab the whole lot for pocket lint. The newsrooms are yours; the staff would happily piss on your grave.',
      },
      {
        label: 'Pay full freight, buy the whole damn room',
        fx: { funds: -10, media: 10, support: 6 },
        set: { dealmaker: true, clean_streak: true },
        tone: 'good',
        result:
          'You overpay on purpose and pump every clammy hand twice. The old money families notice you bought their respect right along with the printing presses.',
      },
      {
        label: 'Cozy up to the editors and own the spin',
        fx: { media: 12, influence: 4, heat: 4 },
        set: { press_friendly: true },
        tone: 'slick',
        result:
          'You keep every last hack employed and pathetically grateful. The headlines develop a sudden, miraculous, ass-kissing slant toward you.',
      },
    ],
  },
  {
    id: 'gr_regulator_lunch',
    paths: ['gilded'],
    phases: [1],
    weight: 10,
    art: 'scene',
    emoji: '🍽️',
    title: 'A Quiet Lunch',
    body: `The regulator who could strangle your whole empire in its crib wants a "conversation" — no aides, no minutes, no witnesses. So do you. The wine list alone costs more than her takes home in a month, and you both know it.`,
    choices: [
      {
        label: 'Make her a dear friend of the family',
        fx: { influence: 10, heat: 10, funds: -4 },
        set: { owes_donor: true, dark_money: true },
        tone: 'slick',
        result:
          'By dessert she is on a cozy little retainer that appears in absolutely no ledger anywhere. Your filings will sail right through. So, eventually, might the subpoena.',
      },
      {
        label: 'Keep your hands clean and your fly zipped',
        fx: { support: 6, influence: 4, heat: -6 },
        set: { clean_streak: true },
        tone: 'good',
        result:
          'You pay your own half, talk nothing but boring policy, and leave a paper trail you would happily read aloud in church. Slower, cleaner, a real pain in the ass to bury.',
      },
      {
        label: 'Sniff around for whatever scares the hell out of her',
        roll: {
          stat: 'influence',
          dc: 52,
          success: {
            fx: { influence: 12, heat: 4 },
            set: { has_network: true },
            text: 'You find the soft underbelly — a debt, a screwup relative, a quiet little ambition — and now the regulator regulates you with all the ferocity of a wet sponge.',
          },
          fail: {
            fx: { heat: 12, support: -6 },
            text: 'You push too hard, she goes rigid as a board, and a memo about "an inappropriate approach" starts its slow, ominous crawl up the chain.',
          },
        },
        tone: 'bold',
      },
    ],
  },
  {
    id: 'gr_labor_dispute',
    paths: ['gilded'],
    phases: [1],
    crisis: true,
    art: 'crisis',
    emoji: '🪧',
    title: 'The Floor Walks Out',
    body: `The grunts at your biggest subsidiary have grown spines and stopped working. The whole floor is dead and the cameras are already chewing the chain-link at the gate. Cave and every other floor gets ideas; crush it and you're the cartoon ogre on tonight's broadcast.`,
    choices: [
      {
        label: 'Smash it flat and make a bloody example',
        fx: { funds: 6, influence: 6, heat: 14, support: -8 },
        set: { went_negative: true, stonewaller: true },
        tone: 'bold',
        result:
          'You can the ringleaders and have the place humming again by sunrise. The subsidiary runs fine; the footage of that padlocked gate runs a hell of a lot longer.',
      },
      {
        label: 'Toss them a sliver and call it partnership',
        fx: { funds: -8, support: 10, base: 8 },
        set: { dealmaker: true },
        tone: 'good',
        result:
          'You hand them a raise, a photo op, and a fistful of warm horseshit about "family." It bleeds real Capital; it buys a story you can stand next to without flinching.',
      },
      {
        label: 'Slip the organizers some quiet envelopes',
        roll: {
          stat: 'funds',
          dc: 50,
          success: {
            fx: { influence: 8, base: 6, heat: 4 },
            set: { owes_donor: true },
            text: 'A few fat envelopes and the ringleaders suddenly rediscover the deep spiritual virtue of shutting up. The walkout melts into a rumor by Tuesday.',
          },
          fail: {
            fx: { heat: 16, support: -10 },
            set: { corrupt_streak: true },
            text: 'One organizer keeps both the envelope AND the receipts, the rat. Now you have a strike *and* a glossy photograph of your cash. Brilliant.',
          },
        },
        tone: 'slick',
      },
    ],
  },
  {
    id: 'gr_offshore_question',
    paths: ['gilded'],
    phases: [1, 2],
    weight: 9,
    art: 'newspaper',
    emoji: '🏝️',
    title: 'A Reporter Finds the Structure',
    body: `Some persistent little notebook-jockey has traced a chain of shell companies straight back toward your name. None of it is technically illegal yet. That word "yet" is sweating and doing the heaviest lifting of its entire life.`,
    choices: [
      {
        label: 'Bury it another island deeper',
        fx: { funds: 12, heat: 12 },
        set: { dark_money: true, corrupt_streak: true },
        tone: 'slick',
        result:
          'You shove the whole structure one more sunny jurisdiction away from daylight. The Capital quietly breeds in the dark; so, just as quietly, does the risk of a perp walk.',
      },
      {
        label: 'Blow it all up and confess first',
        fx: { funds: -10, support: 10, heat: -10 },
        set: { secret_reformer: true, clean_streak: true },
        tone: 'good',
        result:
          'You detonate the entire shell empire and publish the guts of it before the story can. Expensive, jaw-dropping, and weirdly liberating, like ripping off a financial scab.',
      },
      {
        label: 'Charm the reporter off the scent',
        roll: {
          stat: 'media',
          dc: 53,
          success: {
            fx: { media: 8, influence: 6, heat: -4 },
            set: { press_friendly: true },
            text: 'You dangle access, fake candor, and a shinier story across the room. The thread gets dropped for a juicier spool, because reporters are magpies with deadlines.',
          },
          fail: {
            fx: { heat: 14, media: -6 },
            text: 'The charm reads exactly like a bribe attempt, because it was one. Now the offshore structure *and* the cozy lunch are both in the lede. Outstanding work.',
          },
        },
        tone: 'bold',
      },
    ],
  },

  // ---------------- PHASE 2 ----------------
  {
    id: 'gr_board_coup',
    paths: ['gilded'],
    phases: [2],
    weight: 9,
    art: 'rival',
    emoji: '🪑',
    title: 'The Coalition in the Cloakroom',
    speaker: (S) => ({ name: S.opp, role: 'a board member', avatar: S.oppAvatar }),
    body: (S) =>
      `${S.opp} has been quietly counting votes you stupidly assumed were yours, stitching together a backstabbing little coalition one creepy private dinner at a time. Next board meeting is a knifing unless you move first.`,
    choices: [
      {
        label: 'Buy the spineless swing votes outright',
        fx: { funds: -12, influence: 12, heat: 6 },
        set: { dealmaker: true, owes_donor: true },
        tone: 'slick',
        result:
          'You sweeten three wobbly directors until the arithmetic flips on its head. The coalition collapses like a soufflé; your ledger remembers every greasy favor.',
      },
      {
        label: 'Drag their dirty little dinners into the light',
        fx: { media: 8, support: 6, heat: 4 },
        set: { went_negative: true },
        tone: 'bold',
        result:
          'You leak the secret suppers and the whispering campaign curdles into a scandal of their own stupid making. The cloakroom empties faster than a fire drill.',
      },
      {
        label: 'Hand the rival a golden parachute and a smile',
        fx: { influence: 6, support: 8, base: 6 },
        set: { clean_streak: true, has_biographer: true },
        tone: 'good',
        result:
          'You give them a fancy meaningless title and a quiet pile of money to go away. The old families purr at the restraint; your biographer dampens the page over it.',
      },
    ],
  },
  {
    id: 'gr_charity_play',
    paths: ['gilded'],
    phases: [2],
    weight: 8,
    art: 'scene',
    emoji: '🎗️',
    title: 'The Grand Gesture',
    body: `Your advisors are pitching a blinding act of public generosity — a foundation, a hospital wing, a fund with your name slapped on it in eight-foot letters. The only real question is whether you mean a single syllable of it.`,
    choices: [
      {
        label: 'Actually give it away — and actually mean it',
        fx: { funds: -16, support: 14, base: 8 },
        set: { secret_reformer: true },
        tone: 'good',
        result:
          'You sign over a fortune so large your accountants physically beg you to stop. Something in the public eye softens; something behind your own ribs, alarmingly, does too.',
      },
      {
        label: 'A "charity" that funnels cash to your friends',
        fx: { media: 8, influence: 8, heat: 8 },
        set: { dark_money: true, owes_donor: true },
        tone: 'slick',
        result:
          'The grants flow exclusively to noble causes that happen to employ your cronies and seat your fat ass on every gala dais in town. Generosity, fully optimized.',
      },
      {
        label: 'A modest gift, every penny documented',
        fx: { funds: -6, support: 6, media: 4 },
        set: { clean_streak: true, has_biographer: true },
        tone: 'good',
        result:
          'You give a sensible chunk and let the paperwork do the bragging. No fireworks, but the old families nod approvingly at a man who keeps his damn receipts.',
      },
    ],
  },
  {
    id: 'gr_debt_leverage',
    paths: ['gilded'],
    phases: [2],
    weight: 8,
    art: 'scene',
    emoji: '⛓️',
    title: 'You Own Their Debt',
    body: `A rival outfit needs a vote to break its way. You have quietly hoovered up enough of their debt to decide that vote yourself, from your bathtub, with one finger. The poor saps have no idea who's holding the paper around their neck.`,
    choices: [
      {
        label: 'Call the loan and gut them like a fish',
        fx: { funds: 14, influence: 12, heat: 10, support: -6 },
        set: { corrupt_streak: true },
        tone: 'bold',
        result:
          'You flash the paper at the single worst possible second and waltz out owning them down to the carpet. The Capital is real; so is the brand-new enemy who now hates your guts.',
      },
      {
        label: 'Swap the leverage for a long, loyal leash',
        fx: { influence: 10, base: 6, funds: 4 },
        set: { dealmaker: true },
        tone: 'slick',
        result:
          'You restructure the debt in exchange for loyalty no contract could ever buy. They shuffle out weeping with gratitude and belonging to you body and soul.',
      },
      {
        label: 'Forgive a chunk, loudly, on the record',
        fx: { funds: -8, support: 10, heat: -6 },
        set: { secret_reformer: true, clean_streak: true },
        tone: 'good',
        result:
          'You write off a slice and make damn sure people watch you do it. Leverage blown on goodwill is a strange, masochistic investment that, once in a blue moon, actually pays.',
      },
    ],
  },
  {
    id: 'gr_market_crash',
    paths: ['gilded'],
    phases: [2, 3],
    crisis: true,
    art: 'crisis',
    emoji: '📉',
    title: 'The Markets Buckle',
    body: `Credit seizes up, panic spreads like a stomach bug — and your own greedy leveraged bets may well be the match that lit it. You can feast on the wreckage, or burn a fortune steadying a terrified economy that will never, ever know you saved its ungrateful ass.`,
    choices: [
      {
        label: 'Short the inferno, get fat off the fall',
        fx: { funds: 18, influence: 6, heat: 12, support: -8 },
        set: { corrupt_streak: true, dark_money: true },
        tone: 'slick',
        result:
          'You bet against the burning house with the whole neighborhood still inside, and the Capital gushes in. Somewhere an inquiry is gleefully pinning a date to your trades.',
      },
      {
        label: 'Quietly prop the whole thing up yourself',
        fx: { funds: -16, support: 12, influence: 8 },
        set: { bailed_banks: true, dealmaker: true },
        tone: 'good',
        result:
          'You shovel your own money into the holes the state is too slow and gutless to plug. The panic eases. The finance bloc will never forget who held the floor when it mattered.',
      },
      {
        label: 'Make a big loud show of bailing it out',
        roll: {
          stat: 'support',
          dc: 54,
          success: {
            fx: { support: 14, media: 8, base: 6 },
            set: { secret_reformer: true },
            text: 'You plant yourself in front of the cameras, pledge a fat relief fund, and the falling knife slows mid-air. The whole frightened public exhales your name like a prayer.',
          },
          fail: {
            fx: { support: -12, heat: 12 },
            text: 'The fund reeks of a publicity stunt and the markets call your bluff to your face. Now you own the crash AND the belly-flop of a rescue. Two for one.',
          },
        },
        tone: 'bold',
      },
    ],
  },

  // ---------------- PHASE 3 ----------------
  {
    id: 'gr_monopoly_hearing',
    paths: ['gilded'],
    phases: [3],
    weight: 8,
    art: 'newspaper',
    emoji: '⚖️',
    title: 'Called to Testify',
    body: `The legislature wants you under oath to explain how one greedy human came to own so much of so many things. The gallery is packed to the rafters. Every word out of your mouth becomes a clip before you finish saying it.`,
    choices: [
      {
        label: 'Stonewall — say a whole lot of nothing',
        fx: { influence: 6, heat: 12, support: -8 },
        set: { stonewaller: true },
        tone: 'bold',
        result:
          'You filibuster in flawless lawyer-gibberish and give up not one inch of ground. The committee turns purple; the footage of you smirking at them does absolute numbers online.',
      },
      {
        label: 'Charm the whole room and steal the story',
        roll: {
          stat: 'media',
          dc: 55,
          success: {
            fx: { media: 14, support: 10, heat: -6 },
            set: { press_friendly: true, has_biographer: true },
            text: 'You hijack the hearing into a TED talk about Building Things, and by lunch you are the noble underdog and the committee are sneering schoolyard bullies. Masterful.',
          },
          fail: {
            fx: { support: -10, heat: 10 },
            text: 'Your aw-shucks folksy answer lands like a smug fart in an elevator, the clip loops forever, and the hearing becomes the worst day you have had in years.',
          },
        },
        tone: 'slick',
      },
      {
        label: 'Offer to break up your own empire',
        fx: { funds: -12, support: 14, heat: -10 },
        set: { secret_reformer: true, clean_streak: true },
        tone: 'good',
        result:
          'You stun the entire chamber by volunteering to chop the empire up yourself. Pundits scream genius or surrender; the public, exhausted by both, just calls it decent.',
      },
    ],
  },
  {
    id: 'gr_succession_plan',
    paths: ['gilded'],
    phases: [3],
    weight: 7,
    art: 'scene',
    emoji: '👑',
    title: 'Who Inherits It All',
    body: `The empire is going to outlive your miserable carcass, and the lawyers are circling for a name on the dotted line. Every candidate owes you something different — and would owe you wildly more, or gloriously less, the second you're worm food.`,
    choices: [
      {
        label: 'Crown a lapdog heir who owes you his whole life',
        fx: { influence: 12, base: 8, heat: 4 },
        set: { dealmaker: true, owes_donor: true },
        tone: 'slick',
        result:
          'You pick the one whose every single rung you personally bolted to the ladder. The dynasty rolls on, in hock to you until the heat death of the universe.',
      },
      {
        label: 'Hand it to the old families to babysit',
        fx: { support: 8, influence: 6, base: 6 },
        set: { has_biographer: true, clean_streak: true },
        tone: 'good',
        result:
          'You braid your empire into the inbred dynasties that ran Velmora long before your grubby arrival. They finally embrace you, at long last, as one of their own.',
      },
      {
        label: 'Leave the whole lot to a public trust',
        fx: { funds: -10, support: 14, heat: -8 },
        set: { secret_reformer: true },
        tone: 'good',
        result:
          'You will the entire pile to a foundation no greedy heir can crack open. The lawyers are physically appalled; the public, just for a moment, falls head over heels for you.',
      },
    ],
  },
  {
    id: 'gr_whistleblower',
    paths: ['gilded'],
    phases: [2, 3],
    crisis: true,
    art: 'crisis',
    emoji: '🕵️',
    title: 'Someone Inside Is Talking',
    body: `Some traitor on the inside has been meeting investigators in parking garages like a bad spy movie, hauling out documents only a tiny handful of people could possibly have. The leak is real, the clock is screaming, and every single option in front of you is ugly as sin.`,
    choices: [
      {
        label: 'Bury the rat in lawyers and ruin',
        fx: { funds: -8, influence: 8, heat: 14, support: -6 },
        set: { stonewaller: true, corrupt_streak: true },
        tone: 'bold',
        result:
          'You smother the snitch under a mountain of nondisclosures and personal annihilation. The talking stops dead; the stench of it loiters in every hallway for years.',
      },
      {
        label: 'Out-leak the leaker, own the story first',
        roll: {
          stat: 'media',
          dc: 53,
          success: {
            fx: { media: 10, influence: 6, heat: -4 },
            set: { press_friendly: true, dark_money: true },
            text: 'You dump your own polished version through tame outlets before theirs ever hits the press. The whistleblower shrivels into a forgettable footnote in YOUR narrative.',
          },
          fail: {
            fx: { heat: 16, support: -10 },
            text: 'Your spin slams headfirst into their documents and loses, badly. Now there are two stories floating around and only one of them has the inconvenient virtue of being true.',
          },
        },
        tone: 'slick',
      },
      {
        label: 'Cooperate and clean house in the open',
        fx: { funds: -6, support: 12, heat: -12 },
        set: { secret_reformer: true, clean_streak: true },
        tone: 'good',
        result:
          'You crack open the books, thank the whistleblower out loud, and fire the rot yourself with your own hands. It stings like hell now and spares you the perp walk later.',
      },
    ],
  },
  {
    id: 'gr_foreign_asset',
    paths: ['gilded'],
    phases: [3],
    weight: 7,
    art: 'scene',
    emoji: '🌐',
    title: 'A Sovereign Fund Comes Calling',
    body: `A gigantic, faceless ocean of foreign money wants a piece of the empire. The terms are obscenely generous, the source is murkier than a swamp, and the strings attached are exactly as long as they need to be to wrap around your throat.`,
    choices: [
      {
        label: 'Grab the cash, ask zero questions',
        fx: { funds: 16, influence: 8, heat: 12 },
        set: { dark_money: true, owes_donor: true },
        tone: 'slick',
        result:
          'The wire clears before lunch and the Capital is frankly obscene. So, very quietly, is the growing list of things you are now physically incapable of saying no to.',
      },
      {
        label: 'Haggle like a demon, keep control',
        roll: {
          stat: 'influence',
          dc: 52,
          success: {
            fx: { funds: 10, influence: 10 },
            set: { dealmaker: true },
            text: 'You take the money and absolutely none of the leash, rigging it so they own a slice of profit but never a single vote. A tiny, beautiful, ruthless masterpiece.',
          },
          fail: {
            fx: { heat: 10, influence: -6 },
            text: 'They smile, they sign, and they bury one little clause you were too cocky to read. The stake is theirs now in every way that actually counts.',
          },
        },
        tone: 'bold',
      },
      {
        label: 'Tell them to shove it — keep it homegrown',
        fx: { funds: -8, support: 10, base: 6, heat: -6 },
        set: { clean_streak: true, has_biographer: true },
        tone: 'good',
        result:
          'You wave off a fortune just to keep the strings off your neck. The old families, who distrust outside money on pure reflex, finally decide you are one of the good ones.',
      },
    ],
  },
];
