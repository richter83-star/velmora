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
    body: `A struggling chain of local newspapers is ripe for the taking. Own the presses and you own how a hundred towns learn what happened. The current owners are begging you not to.`,
    choices: [
      {
        label: 'Crush the resistance, take it cheap',
        fx: { funds: 8, influence: 10, media: 6, heat: 8 },
        set: { went_negative: true },
        tone: 'bold',
        result:
          'You squeeze until they fold and buy the lot for pennies. The newsrooms are yours; the goodwill is not.',
      },
      {
        label: 'Pay a fair price, win the room',
        fx: { funds: -10, media: 10, support: 6 },
        set: { dealmaker: true, clean_streak: true },
        tone: 'good',
        result:
          'You overpay on purpose and shake every hand twice. The old families note that you bought respect along with the presses.',
      },
      {
        label: 'Befriend the editors, run the narrative',
        fx: { media: 12, influence: 4, heat: 4 },
        set: { press_friendly: true },
        tone: 'slick',
        result:
          'You keep them all employed and very grateful. The headlines develop a curious, flattering slant.',
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
    body: `The regulator who could halt your every move wants a "conversation" — no aides, no minutes. So do you. The wine list alone costs more than her monthly salary.`,
    choices: [
      {
        label: 'Make her a friend of the family',
        fx: { influence: 10, heat: 10, funds: -4 },
        set: { owes_donor: true, dark_money: true },
        tone: 'slick',
        result:
          'By dessert she is on a quiet retainer that appears in no ledger. Your filings will sail through. So might the eventual subpoena.',
      },
      {
        label: 'Keep it strictly above board',
        fx: { support: 6, influence: 4, heat: -6 },
        set: { clean_streak: true },
        tone: 'good',
        result:
          'You pay your half, talk only policy, and leave a paper trail you would happily read aloud. Slower, cleaner, harder to bury.',
      },
      {
        label: 'Probe for what she fears',
        roll: {
          stat: 'influence',
          dc: 52,
          success: {
            fx: { influence: 12, heat: 4 },
            set: { has_network: true },
            text: 'You find the soft spot — a debt, a relative, a quiet ambition — and now the regulator regulates gently.',
          },
          fail: {
            fx: { heat: 12, support: -6 },
            text: 'You overreach, she stiffens, and a memo about "an inappropriate approach" begins its slow climb upward.',
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
    body: `Workers at your largest subsidiary are organizing, and the whole floor has stopped. The cameras are already at the gate. Concede and others will ask; crush it and you become the villain of the evening broadcast.`,
    choices: [
      {
        label: 'Break it hard, make an example',
        fx: { funds: 6, influence: 6, heat: 14, support: -8 },
        set: { went_negative: true, stonewaller: true },
        tone: 'bold',
        result:
          'You replace the leaders and reopen by morning. The subsidiary runs; the footage of the locked gate runs longer.',
      },
      {
        label: 'Cut a deal, share a sliver',
        fx: { funds: -8, support: 10, base: 8 },
        set: { dealmaker: true },
        tone: 'good',
        result:
          'You give them a raise and a photo op and call it partnership. It costs real Capital; it buys a story you can stand next to.',
      },
      {
        label: 'Quietly buy off the organizers',
        roll: {
          stat: 'funds',
          dc: 50,
          success: {
            fx: { influence: 8, base: 6, heat: 4 },
            set: { owes_donor: true },
            text: 'A few private envelopes and the leaders rediscover the virtues of patience. The walkout dissolves into a rumor.',
          },
          fail: {
            fx: { heat: 16, support: -10 },
            set: { corrupt_streak: true },
            text: 'One organizer keeps the envelope and the receipts. Now there is a strike *and* a photograph of cash.',
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
    body: `A persistent journalist has traced a chain of shell entities back toward your name. Nothing is illegal yet. "Yet" is doing heroic work in that sentence.`,
    choices: [
      {
        label: 'Deepen the maze offshore',
        fx: { funds: 12, heat: 12 },
        set: { dark_money: true, corrupt_streak: true },
        tone: 'slick',
        result:
          'You move the structure one jurisdiction further from daylight. The Capital compounds quietly; so does the risk.',
      },
      {
        label: 'Unwind it and disclose',
        fx: { funds: -10, support: 10, heat: -10 },
        set: { secret_reformer: true, clean_streak: true },
        tone: 'good',
        result:
          'You collapse the whole apparatus and publish the lot before the story can. Costly, startling, and oddly freeing.',
      },
      {
        label: 'Charm the reporter off the trail',
        roll: {
          stat: 'media',
          dc: 53,
          success: {
            fx: { media: 8, influence: 6, heat: -4 },
            set: { press_friendly: true },
            text: 'You offer access, candor, and a better story elsewhere. The thread is quietly dropped for a juicier spool.',
          },
          fail: {
            fx: { heat: 14, media: -6 },
            text: 'The charm reads as a bribe attempt. Now the structure *and* the lunch are in the lede.',
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
      `${S.opp} has been counting votes you assumed were yours, building a rival coalition one private dinner at a time. The next board meeting will be an ambush unless you move first.`,
    choices: [
      {
        label: 'Buy out the swing votes',
        fx: { funds: -12, influence: 12, heat: 6 },
        set: { dealmaker: true, owes_donor: true },
        tone: 'slick',
        result:
          'You sweeten three directors until the math reverses. The coalition collapses; your ledger remembers the favors.',
      },
      {
        label: 'Expose their methods publicly',
        fx: { media: 8, support: 6, heat: 4 },
        set: { went_negative: true },
        tone: 'bold',
        result:
          'You leak the dinners and the whispering campaign curdles into a scandal of their own making. The cloakroom empties.',
      },
      {
        label: 'Offer the rival a graceful exit',
        fx: { influence: 6, support: 8, base: 6 },
        set: { clean_streak: true, has_biographer: true },
        tone: 'good',
        result:
          'You hand them a dignified title and a quiet payout. The old families admire the restraint; your biographer loves the chapter.',
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
    body: `Your advisors propose a dazzling act of public generosity — a foundation, a wing, a fund. The only open question is whether you mean a word of it.`,
    choices: [
      {
        label: 'Give it away — and mean it',
        fx: { funds: -16, support: 14, base: 8 },
        set: { secret_reformer: true },
        tone: 'good',
        result:
          'You sign over a fortune that even your accountants beg you to keep. Something in the public eye shifts; something in yours does too.',
      },
      {
        label: 'A foundation that funds your friends',
        fx: { media: 8, influence: 8, heat: 8 },
        set: { dark_money: true, owes_donor: true },
        tone: 'slick',
        result:
          'The grants flow to causes that happen to employ allies and seat you on every gala dais. Generosity, optimized.',
      },
      {
        label: 'A modest, well-documented gift',
        fx: { funds: -6, support: 6, media: 4 },
        set: { clean_streak: true, has_biographer: true },
        tone: 'good',
        result:
          'You give a sensible sum and let the paperwork speak. No fireworks, but the old families nod at a man who keeps receipts.',
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
    body: `A rival enterprise needs a vote to go its way. You have quietly bought enough of its debt to decide that vote yourself. They do not yet know who holds the paper.`,
    choices: [
      {
        label: 'Call the loan, seize control',
        fx: { funds: 14, influence: 12, heat: 10, support: -6 },
        set: { corrupt_streak: true },
        tone: 'bold',
        result:
          'You reveal the paper at the worst possible moment and walk out owning them. The Capital is real; so is the new enemy.',
      },
      {
        label: 'Trade the leverage for a long alliance',
        fx: { influence: 10, base: 6, funds: 4 },
        set: { dealmaker: true },
        tone: 'slick',
        result:
          'You restructure the debt in exchange for loyalty no contract could buy. They walk out grateful and yours.',
      },
      {
        label: 'Forgive part of it, on the record',
        fx: { funds: -8, support: 10, heat: -6 },
        set: { secret_reformer: true, clean_streak: true },
        tone: 'good',
        result:
          'You write off a slice and let the gesture be seen. Leverage spent on goodwill is a strange investment that sometimes pays.',
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
    body: `Credit seizes and a panic spreads — one your own leveraged plays may have lit. You can profit from the wreckage, or spend a fortune steadying a frightened economy that will never know you did.`,
    choices: [
      {
        label: 'Short the collapse, profit from the fall',
        fx: { funds: 18, influence: 6, heat: 12, support: -8 },
        set: { corrupt_streak: true, dark_money: true },
        tone: 'slick',
        result:
          'You bet against the burning house and the Capital pours in. Somewhere an inquiry pins a date to your trades.',
      },
      {
        label: 'Backstop the system, quietly',
        fx: { funds: -16, support: 12, influence: 8 },
        set: { bailed_banks: true, dealmaker: true },
        tone: 'good',
        result:
          'You inject your own money where the state cannot move fast enough. The panic eases. The finance bloc will remember who held the floor.',
      },
      {
        label: 'Take it public — bail it out loudly',
        roll: {
          stat: 'support',
          dc: 54,
          success: {
            fx: { support: 14, media: 8, base: 6 },
            set: { secret_reformer: true },
            text: 'You stand in front of the cameras, pledge a relief fund, and the falling knife slows. The public exhales your name.',
          },
          fail: {
            fx: { support: -12, heat: 12 },
            text: 'The fund looks like a stunt and the markets call your bluff. Now you own both the crash and the failed rescue.',
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
    body: `Parliament wants you under oath to explain how one person came to own so much of so many things. The gallery is full. Every answer becomes a clip before you finish it.`,
    choices: [
      {
        label: 'Stonewall — answer nothing useful',
        fx: { influence: 6, heat: 12, support: -8 },
        set: { stonewaller: true },
        tone: 'bold',
        result:
          'You filibuster in fluent legalese and concede not an inch. The committee fumes; the footage of you smirking does numbers.',
      },
      {
        label: 'Charm the room, own the narrative',
        roll: {
          stat: 'media',
          dc: 55,
          success: {
            fx: { media: 14, support: 10, heat: -6 },
            set: { press_friendly: true, has_biographer: true },
            text: 'You turn the hearing into a keynote about building things. By lunch you are the sympathetic figure and they are the bullies.',
          },
          fail: {
            fx: { support: -10, heat: 10 },
            text: 'A folksy answer lands as arrogance, the clip loops, and the hearing becomes your worst day in years.',
          },
        },
        tone: 'slick',
      },
      {
        label: 'Volunteer to break up the empire',
        fx: { funds: -12, support: 14, heat: -10 },
        set: { secret_reformer: true, clean_streak: true },
        tone: 'good',
        result:
          'You stun the chamber by offering to split the empire yourself. Pundits call it genius or surrender; the public just calls it decent.',
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
    body: `The empire will outlive you, and the lawyers want a name on the line. Each candidate owes you something different — and would owe you more, or less, once you are gone.`,
    choices: [
      {
        label: 'Anoint a loyal heir who owes you everything',
        fx: { influence: 12, base: 8, heat: 4 },
        set: { dealmaker: true, owes_donor: true },
        tone: 'slick',
        result:
          'You pick the one whose every rung you built. The dynasty continues, indebted to you in perpetuity.',
      },
      {
        label: 'Hand it to the old families to steward',
        fx: { support: 8, influence: 6, base: 6 },
        set: { has_biographer: true, clean_streak: true },
        tone: 'good',
        result:
          'You braid your empire into the dynasties that ran Velmora before you. They embrace you, at last, as one of their own.',
      },
      {
        label: 'Leave it to a public trust',
        fx: { funds: -10, support: 14, heat: -8 },
        set: { secret_reformer: true },
        tone: 'good',
        result:
          'You will the whole thing to a foundation no heir can raid. The lawyers are appalled; the public is, briefly, in love.',
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
    body: `An insider has been meeting investigators in parking garages, carrying documents only a handful of people could have. The leak is real, the timeline is short, and the choices are all ugly.`,
    choices: [
      {
        label: 'Bury them in lawyers and silence',
        fx: { funds: -8, influence: 8, heat: 14, support: -6 },
        set: { stonewaller: true, corrupt_streak: true },
        tone: 'bold',
        result:
          'You smother the insider in nondisclosures and ruin. The talking stops; the smell of it lingers in every hallway.',
      },
      {
        label: 'Out-leak them — control the story first',
        roll: {
          stat: 'media',
          dc: 53,
          success: {
            fx: { media: 10, influence: 6, heat: -4 },
            set: { press_friendly: true, dark_money: true },
            text: 'You drop your own version through friendly outlets before theirs lands. The insider becomes a footnote in your narrative.',
          },
          fail: {
            fx: { heat: 16, support: -10 },
            text: 'Your spin collides with their documents and loses. Now there are two stories and only one of them is true.',
          },
        },
        tone: 'slick',
      },
      {
        label: 'Cooperate, clean house in public',
        fx: { funds: -6, support: 12, heat: -12 },
        set: { secret_reformer: true, clean_streak: true },
        tone: 'good',
        result:
          'You open the books, thank the insider, and fire the rot yourself. It hurts now and saves you the indictment later.',
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
    body: `An immense, faceless pool of foreign money wants a stake in the empire. The terms are generous, the source is opaque, and the strings are exactly as long as they need to be.`,
    choices: [
      {
        label: 'Take the money, ask no questions',
        fx: { funds: 16, influence: 8, heat: 12 },
        set: { dark_money: true, owes_donor: true },
        tone: 'slick',
        result:
          'The wire clears before lunch and the Capital is staggering. So, quietly, is the list of things you now cannot refuse.',
      },
      {
        label: 'Negotiate hard, keep control',
        roll: {
          stat: 'influence',
          dc: 52,
          success: {
            fx: { funds: 10, influence: 10 },
            set: { dealmaker: true },
            text: 'You take the money and none of the leash, structuring it so they own profit but never a vote. A small masterpiece.',
          },
          fail: {
            fx: { heat: 10, influence: -6 },
            text: 'They smile, sign, and bury a clause you missed. The stake is theirs in all the ways that matter.',
          },
        },
        tone: 'bold',
      },
      {
        label: 'Decline — keep the empire homegrown',
        fx: { funds: -8, support: 10, base: 6, heat: -6 },
        set: { clean_streak: true, has_biographer: true },
        tone: 'good',
        result:
          'You turn down a fortune to keep the strings off. The old families, who distrust outside money on principle, finally trust you.',
      },
    ],
  },
];
