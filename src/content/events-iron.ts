import type { GameEvent } from '../engine/types';

/**
 * Dark Mirrors expansion — The Iron Order (theme-iron) event bank.
 *
 * Twelve dilemmas of a movement clawing from the streets to the Iron Palace.
 * Stat display names on this path: support=Fervor, funds=War Chest,
 * influence=Cohesion, media=Propaganda, base=Vanguard, heat=Exposure.
 *
 * Bloc levers (see engine/factions BLOCS.iron):
 *   ultras         warm[bloody_hands, zealot_rep, grassroots] cool[dealmaker, secret_reformer]
 *   officers       warm[has_network, clean_streak, pledged]   cool[corrupt_streak, went_negative]
 *   industrialists warm[dealmaker, owes_donor, dark_money]    cool[grassroots, went_negative]
 *
 * Finale-feeding flags spread across choices so different play styles reach
 * different Phase 3 endings: bloody_hands + purge_count (the iron fist),
 * zealot_rep (the true believer), dark_money/owes_donor/dealmaker (THE PUPPET
 * of the industrialists), and a rarer secret_reformer route out.
 *
 * Fictional and non-partisan by construction — satire of the MECHANISM of
 * power, never the identity of any real movement, leader, nation, or creed.
 * Validated by the content linter like every other bank.
 */
export const IRON_EVENTS: GameEvent[] = [
  // ---------------- PHASE 1 ----------------
  {
    id: 'io_first_rally',
    paths: ['iron'],
    phases: [1],
    weight: 12,
    art: 'scene',
    emoji: '🪧',
    title: 'The First Mass Rally',
    body: `The square is packed and the crowd is yours — restless, roaring, waiting for a signal. How far you push them tonight is how far they will go tomorrow.`,
    choices: [
      {
        label: 'Whip them into a frenzy — let fists fly',
        fx: { base: 12, support: 8, heat: 12, influence: -4 },
        set: { bloody_hands: true, grassroots: true },
        tone: 'bold',
        result:
          'The chanting turns to charging. A few shop windows pay for the night, and the Vanguard tastes its own strength.',
      },
      {
        label: 'A disciplined march — banners, no blood',
        fx: { base: 8, influence: 6, support: 4, heat: 2 },
        set: { pledged: true },
        tone: 'good',
        result:
          'Ranks in step, voices in time, not a pane cracked. The officers watching from the kerb give a slow, approving nod.',
      },
      {
        label: 'Deliver a fiery creed and let them carry it home',
        fx: { support: 10, media: 6, base: 6 },
        set: { zealot_rep: true },
        tone: 'bold',
        result:
          'You give them words sharp enough to live by. They leave reciting you, which is better than obeying you.',
      },
    ],
  },
  {
    id: 'io_press_takeover',
    paths: ['iron'],
    phases: [1],
    weight: 10,
    art: 'newspaper',
    emoji: '📰',
    title: 'The Last Free Press',
    body: `One stubborn paper still prints what it likes about you. Your people have the keys to its presses and a list of reasons. The question is only whether you use them.`,
    choices: [
      {
        label: 'Seize the presses tonight',
        fx: { media: 14, influence: 6, heat: 14, support: -4 },
        set: { bloody_hands: true },
        tone: 'bold',
        result:
          'By dawn the masthead prints your morning instead of its own. The empty editor’s chair makes the others very quiet.',
      },
      {
        label: 'Buy it quietly through a friendly backer',
        fx: { media: 10, funds: -6, heat: 4 },
        set: { dark_money: true, dealmaker: true },
        tone: 'slick',
        result:
          'A donor you have never publicly met owns it by Friday. The paper’s tone improves without a single broken lock.',
      },
      {
        label: 'Leave it printing — let it look like proof you fear nothing',
        fx: { support: 6, influence: 4, heat: -6 },
        set: { secret_reformer: true },
        tone: 'good',
        result:
          'You let the critics shout into the wind. Abroad, observers note the Order tolerates a dissenting page. For now.',
      },
    ],
  },
  {
    id: 'io_officers_test',
    paths: ['iron'],
    phases: [1],
    weight: 10,
    art: 'rival',
    emoji: '🎖️',
    title: 'The Officer Corps Demands a Demonstration',
    speaker: (S) => ({ name: S.opp, role: 'a colonel of the Officer Corps', avatar: S.oppAvatar }),
    body: (S) =>
      `${S.opp} arrives with epaulettes and a flat stare. The Corps will throw its discipline behind you — but first you must prove you can command, not merely shout. Pick a man, the colonel says, and have him broken.`,
    choices: [
      {
        label: 'Hand them a name — show you can be obeyed',
        fx: { influence: 10, base: 6, heat: 10, support: -4 },
        inc: { purge_count: 1 },
        set: { bloody_hands: true, has_network: true },
        tone: 'bold',
        result:
          'You name a quartermaster who skimmed the stores. He is gone by morning. The colonel salutes you, properly, for the first time.',
      },
      {
        label: 'Pledge them a clean chain of command instead',
        fx: { influence: 8, base: 4, support: 2 },
        set: { pledged: true, clean_streak: true },
        tone: 'good',
        result:
          'You promise rank by merit and orders without poison. The colonel is unconvinced but intrigued — discipline is its own seduction.',
      },
      {
        label: 'Refuse the demonstration — you take no orders',
        fx: { support: 8, base: 6, influence: -8, heat: 4 },
        set: { zealot_rep: true },
        tone: 'bold',
        result:
          'You will not be tested like a recruit. The ultras adore the defiance; the colonel files it away, and files are never lost.',
      },
    ],
  },

  // ---------------- PHASE 2 ----------------
  {
    id: 'io_uniform_decree',
    paths: ['iron'],
    phases: [2],
    weight: 9,
    art: 'bulletin',
    emoji: '🧥',
    title: 'The Uniform Decree',
    body: `Your inner circle drafts a decree: one cut, one colour, one armband, worn by every man who claims to be with you. Visible allegiance, or visible refusal — there is to be no third thing.`,
    choices: [
      {
        label: 'Mandate it — and punish the bare-armed',
        fx: { base: 12, media: 8, heat: 12, support: -6 },
        set: { bloody_hands: true, zealot_rep: true },
        tone: 'bold',
        result:
          'The streets turn a single colour overnight. Those who hesitate are remembered, then visited.',
      },
      {
        label: 'Make it voluntary — let pride do the work',
        fx: { base: 8, support: 6, influence: 2 },
        set: { grassroots: true },
        tone: 'good',
        result:
          'You hand them the armband as an honour, not an order. The true believers wear it to bed; the rest are shamed into it by Sunday.',
      },
      {
        label: 'Let an industrialist fund the cloth — at a price',
        fx: { funds: 10, base: 6, heat: 6 },
        set: { owes_donor: true, dealmaker: true },
        tone: 'slick',
        result:
          'A mill owner clothes the whole movement and bills you in influence, not coin. Every armband is now stitched with his interest.',
      },
    ],
  },
  {
    id: 'io_night_action',
    paths: ['iron'],
    phases: [2],
    crisis: true,
    art: 'crisis',
    emoji: '🌑',
    title: 'A Disappearance in the Night',
    body: `A rival faction leader who would never bend to you has simply vanished overnight. Your security chief will not meet your eyes. Whatever happened, the city will look to you to explain it — or to own it.`,
    choices: [
      {
        label: 'Claim it openly — let the silence be a warning',
        fx: { base: 14, influence: 8, heat: 18, support: -8 },
        inc: { purge_count: 1 },
        set: { bloody_hands: true, zealot_rep: true },
        tone: 'bold',
        result:
          'You say only that disloyalty has a cost, and let the empty chair finish the sentence. The Vanguard stands a little taller; abroad, a file thickens.',
      },
      {
        label: 'Disavow it — pin it on overzealous underlings',
        fx: { support: 6, media: 4, base: -6, heat: 4 },
        set: { secret_reformer: true },
        tone: 'slick',
        result:
          'You profess shock and promise an inquiry that will find nothing. The ultras feel betrayed; the cautious feel relieved.',
      },
      {
        label: 'Have the officers quietly find the truth',
        roll: {
          stat: 'influence',
          dc: 54,
          success: {
            fx: { influence: 10, base: 4, heat: -6 },
            set: { has_network: true, clean_streak: true },
            text: 'Your officers produce the culprit before the rumours set, and the Order looks like a thing with rules. The Corps respects a leader who polices his own.',
          },
          fail: {
            fx: { heat: 14, support: -8 },
            text: 'The inquiry leaks before it concludes, and now everyone assumes the worst — which, this time, is also true.',
          },
        },
        tone: 'bold',
      },
    ],
  },
  {
    id: 'io_foreign_pressure',
    paths: ['iron'],
    phases: [2],
    weight: 9,
    art: 'crisis',
    emoji: '🌐',
    title: 'The Sanctions Threat',
    body: `A wealthy power beyond your borders threatens to choke your trade unless the Order softens. Their envoy is polite, their fleet is not far, and their deadline is short. Defiance is glorious and expensive.`,
    choices: [
      {
        label: 'Defy them — turn the threat into a rallying cry',
        fx: { support: 12, base: 10, funds: -10, heat: 8 },
        set: { zealot_rep: true, grassroots: true },
        tone: 'bold',
        result:
          'You read the ultimatum aloud to a roaring crowd and tear it in half. Fervor soars; the granaries, soon enough, will not.',
      },
      {
        label: 'Cut a quiet deal to keep the trade flowing',
        fx: { funds: 12, influence: 6, base: -8, heat: 4 },
        set: { dealmaker: true, secret_reformer: true },
        tone: 'slick',
        result:
          'You give the envoy concessions no rally will ever hear about. The War Chest stays full; the true believers smell compromise.',
      },
      {
        label: 'Let your industrialist backers broker it',
        fx: { funds: 10, media: 4, heat: 6 },
        set: { owes_donor: true, dark_money: true },
        tone: 'slick',
        result:
          'Your patrons have friends across that border. The sanctions evaporate, and the bill arrives later, payable in obedience.',
      },
    ],
  },
  {
    id: 'io_industrialist_deal',
    paths: ['iron'],
    phases: [1, 2],
    weight: 8,
    art: 'scene',
    emoji: '🏭',
    title: 'The Industrialists Want Their Return',
    body: `The mill owners who bankrolled your rise file into your office without an appointment. They did not fear the unions so you could ignore them now. They want contracts, exemptions, and a seat at every table.`,
    choices: [
      {
        label: 'Give them everything they ask',
        fx: { funds: 16, influence: 6, base: -8, heat: 8 },
        set: { dealmaker: true, owes_donor: true, dark_money: true },
        tone: 'slick',
        result:
          'The War Chest overflows and the factories hum your anthem. You are also, quietly, theirs.',
      },
      {
        label: 'Take their money, honour none of it',
        fx: { funds: 10, base: 6, heat: 10, support: -2 },
        set: { went_negative: true, bloody_hands: true },
        tone: 'bold',
        result:
          'You pocket the donations and tear up the promises. One mill owner is found to have a tax problem the very next week.',
      },
      {
        label: 'Refuse — the Order serves no man’s ledger',
        fx: { support: 10, base: 8, funds: -8, influence: -4 },
        set: { zealot_rep: true, grassroots: true },
        tone: 'bold',
        result:
          'You throw the petitioners out and tell the rally about it. The streets cheer; the financiers begin, very calmly, to look elsewhere.',
      },
    ],
  },
  {
    id: 'io_purge_list',
    paths: ['iron'],
    phases: [2, 3],
    weight: 7,
    art: 'bulletin',
    emoji: '📋',
    title: 'The List',
    body: `Your inner circle lays a folder on your desk: names, gathered carefully, of everyone who has ever wavered. Some are rivals. Some are merely tired. Crossing a name off is so very easy now.`,
    choices: [
      {
        label: 'Approve the whole list',
        fx: { base: 12, influence: 8, heat: 16, support: -8 },
        inc: { purge_count: 1 },
        set: { bloody_hands: true, zealot_rep: true },
        tone: 'bold',
        result:
          'By the week’s end the wavering are gone and the loyal are terrified into devotion. Cohesion, of a kind, has never been higher.',
      },
      {
        label: 'Strike only the genuine traitors — by the book',
        fx: { influence: 8, base: 4, support: 2, heat: 4 },
        set: { clean_streak: true, has_network: true },
        tone: 'good',
        result:
          'You let the officers verify each name and spare the merely weary. The Corps notes, approvingly, that even your knives have rules.',
      },
      {
        label: 'Burn the list — make mercy your warning',
        fx: { support: 10, influence: -6, base: -4, heat: -6 },
        set: { secret_reformer: true },
        tone: 'good',
        result:
          'You feed the folder to the fire in front of them. Some are moved; the hardest men in the room quietly start a list of their own.',
      },
    ],
  },

  // ---------------- PHASE 3 ----------------
  {
    id: 'io_monument',
    paths: ['iron'],
    phases: [3],
    weight: 8,
    art: 'scene',
    emoji: '🗿',
    title: 'The Monument or the Grain',
    body: `The treasury can fund one great thing this season: a towering iron monument to the Order in the capital square, or enough grain to carry the lean districts through the winter. Not both.`,
    choices: [
      {
        label: 'Raise the monument — let them look up and believe',
        fx: { base: 12, media: 10, support: 6, funds: -12, heat: 6 },
        set: { zealot_rep: true },
        tone: 'bold',
        result:
          'The iron colossus throws a shadow across the whole square. The hungry districts admire it from a distance, on empty stomachs.',
      },
      {
        label: 'Buy the grain — feed the faithful first',
        fx: { support: 14, base: 6, funds: -10, heat: -4 },
        set: { grassroots: true, clean_streak: true },
        tone: 'good',
        result:
          'The granaries open and the lean districts eat. No statue rises, but a generation will remember who fed them.',
      },
      {
        label: 'Let a donor fund the monument for a favour',
        fx: { media: 8, base: 6, funds: 4, heat: 8 },
        set: { dark_money: true, owes_donor: true, dealmaker: true },
        tone: 'slick',
        result:
          'A grateful industrialist pays for the bronze and the grain both — and carves his initials, very small, into the base.',
      },
    ],
  },
  {
    id: 'io_successor',
    paths: ['iron'],
    phases: [3],
    weight: 7,
    art: 'rival',
    emoji: '♟️',
    title: 'The Heir Apparent',
    speaker: (S) => ({ name: S.opp, role: 'a rising figure in the Order', avatar: S.oppAvatar }),
    body: (S) =>
      `${S.opp} has been collecting loyalists, learning your speeches, and standing a little too close to the cameras. Someone is already measuring your chair. The only question is how you measure them.`,
    choices: [
      {
        label: 'Eliminate the threat before it ripens',
        fx: { base: 10, influence: 8, heat: 14, support: -6 },
        inc: { purge_count: 1 },
        set: { bloody_hands: true, went_negative: true },
        tone: 'bold',
        result:
          'The ambitious upstart is reassigned to a very distant, very cold posting. The chair is yours again, and emptier.',
      },
      {
        label: 'Bind them to you with rank and reward',
        fx: { influence: 8, base: 4, funds: -6 },
        set: { has_network: true, dealmaker: true },
        tone: 'slick',
        result:
          'You make the rival a partner with everything to lose. Ambition, well-paid, makes a surprisingly loyal lieutenant — for now.',
      },
      {
        label: 'Name a true successor and mean it',
        fx: { support: 8, influence: 6, base: -2 },
        set: { secret_reformer: true, clean_streak: true },
        tone: 'good',
        result:
          'You announce a line of succession with rules instead of knives. The Corps is stunned; the ultras mutter that strongmen do not retire.',
      },
    ],
  },
  {
    id: 'io_martyrdom_play',
    paths: ['iron'],
    phases: [2, 3],
    crisis: true,
    art: 'crisis',
    emoji: '🎯',
    title: 'The Attempt on Your Life',
    body: `A shot is fired, a guard is hit, and you are unharmed and suddenly the most sympathetic figure in the land. Your security chief swears it was real. Your propaganda chief is already drafting the legend. You alone know which to believe.`,
    choices: [
      {
        label: 'Make a martyrdom of it — round up your enemies',
        fx: { base: 12, support: 8, heat: 16, influence: 4 },
        inc: { purge_count: 1 },
        set: { bloody_hands: true, zealot_rep: true },
        tone: 'bold',
        result:
          'The "plot" becomes a pretext, and the list of conspirators is longer than any conspiracy could ever be. Fervor burns white-hot.',
      },
      {
        label: 'Stage the survival for the cameras — grief and steel',
        roll: {
          stat: 'media',
          dc: 52,
          success: {
            fx: { media: 12, support: 10, base: 6 },
            set: { zealot_rep: true, dark_money: true },
            text: 'The footage of you rising bloodied-but-unbowed loops on every screen. A backer quietly funds the whole production, and the legend writes itself.',
          },
          fail: {
            fx: { media: -8, heat: 12, support: -6 },
            set: { went_negative: true },
            text: 'A camera catches the rehearsal. The staged miracle curdles into a scandal you cannot un-film.',
          },
        },
        tone: 'slick',
      },
      {
        label: 'Tell the plain truth and refuse to exploit it',
        fx: { support: 10, influence: 4, base: -6, heat: -4 },
        set: { secret_reformer: true, clean_streak: true },
        tone: 'good',
        result:
          'You thank the guard by name, mourn honestly, and round up no one. The cautious exhale; the hardliners are baffled by the waste of a perfect crisis.',
      },
    ],
  },
  {
    id: 'io_foreign_war',
    paths: ['iron'],
    phases: [3],
    crisis: true,
    art: 'crisis',
    emoji: '🔥',
    title: 'The Border Incident',
    body: `A skirmish flares along the frontier — a few shots, a disputed flag, a column of smoke. It is small enough to bury and large enough to ride to glory. The Order has never been more ready, or more exposed.`,
    choices: [
      {
        label: 'Escalate — let the Order forge itself in fire',
        roll: {
          stat: 'base',
          dc: 56,
          success: {
            fx: { base: 14, support: 12, heat: 10 },
            set: { zealot_rep: true, bloody_hands: true },
            text: 'You answer the provocation with overwhelming force and the frontier holds. The Vanguard returns as heroes, and the Order is unbreakable.',
          },
          fail: {
            fx: { support: -12, base: -6, heat: 18 },
            text: 'The skirmish becomes a war you cannot pay for. The columns of smoke are now your own cities, and the cost arrives in coffins.',
          },
        },
        tone: 'bold',
      },
      {
        label: 'Contain it — buy the peace with backers’ gold',
        fx: { funds: -8, influence: 8, base: -4, heat: 2 },
        set: { dealmaker: true, owes_donor: true },
        tone: 'slick',
        result:
          'Your industrialist patrons fund a discreet settlement before the smoke clears. The frontier quiets; you owe them a war’s worth of gratitude.',
      },
      {
        label: 'Stand down publicly and call for calm',
        fx: { support: 6, influence: 6, base: -8, heat: -8 },
        set: { secret_reformer: true, clean_streak: true },
        tone: 'good',
        result:
          'You choose the unglamorous peace and say so plainly. Foreign observers soften; the ultras spit that an Iron leader blinked.',
      },
    ],
  },
];
