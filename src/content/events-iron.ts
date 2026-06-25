import type { GameEvent } from '../engine/types';

/**
 * Dark Mirrors expansion — The Iron Order (theme-iron) event bank.
 *
 * Twelve dilemmas of a movement clawing from the gutter to the Iron Palace,
 * written in the overhaul's savage adult-cartoon voice (Overhaul P4): profane,
 * crude, merciless satire of the strongman MECHANISM — ego, brutality,
 * propaganda, and graft — never any real movement, leader, nation, or creed.
 *
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
 * PROSE-ONLY: ids, paths, phases, fx, flags, rolls, and tone tags are locked by
 * the diff-guard; only the wording is TV-MA. Validated by the content linter.
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
    title: 'The First Big Rally',
    body: `The square is packed shoulder to sweaty shoulder, ten thousand idiots screaming your name like you personally invented bread. They're a loaded gun and you're holding the trigger. How rabid you let them get tonight is exactly how rabid they show up tomorrow.`,
    choices: [
      {
        label: `Whip them into a frenzy and let the little bastards riot`,
        fx: { base: 12, support: 8, heat: 12, influence: -4 },
        set: { bloody_hands: true, grassroots: true },
        tone: 'bold',
        result: `The chanting turns to charging. A few shop windows eat a brick, somebody's uncle gets stomped, and the Vanguard discovers it absolutely loves this. So, God help you, do you.`,
      },
      {
        label: `A clean, disciplined march — banners up, fists down`,
        fx: { base: 8, influence: 6, support: 4, heat: 2 },
        set: { pledged: true },
        tone: 'good',
        result: `Ranks in step, voices in time, not one window cracked. The officers watching from the kerb give you the slow approving nod usually reserved for a dog that finally stopped pissing indoors.`,
      },
      {
        label: `Give a frothing sermon and send them home reciting you`,
        fx: { support: 10, media: 6, base: 6 },
        set: { zealot_rep: true },
        tone: 'bold',
        result: `You hand them words sharp enough to cut themselves on. They leave chanting your name instead of obeying your orders — which is somehow both better and so very much worse.`,
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
    body: `One stubborn little newspaper still prints whatever the hell it wants about you — lately, that you're a thug with a worse haircut. Your people have the keys to its presses and a grudge the size of the building. The only question left is whether you use them.`,
    choices: [
      {
        label: `Kick the doors in and seize the presses tonight`,
        fx: { media: 14, influence: 6, heat: 14, support: -4 },
        set: { bloody_hands: true },
        tone: 'bold',
        result: `By sunrise the front page prints your morning mood instead of its own opinions. The editor's chair sits empty and warm, and every other paper in town suddenly adores you to death.`,
      },
      {
        label: `Buy the rag quietly through a friendly fat cat`,
        fx: { media: 10, funds: -6, heat: 4 },
        set: { dark_money: true, dealmaker: true },
        tone: 'slick',
        result: `Some donor you've supposedly never met owns it by Friday. The paper's tone improves dramatically without a single broken lock — money being the politest crowbar ever forged.`,
      },
      {
        label: `Let it keep printing — sneer like it's beneath you`,
        fx: { support: 6, influence: 4, heat: -6 },
        set: { secret_reformer: true },
        tone: 'good',
        result: `You let the critics scream into the void. Foreign observers note, approvingly, that the Order tolerates a dissenting page. For now. Big of you.`,
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
    title: 'The Officer Corps Wants a Demonstration',
    speaker: (S) => ({ name: S.opp, role: 'a colonel of the Officer Corps', avatar: S.oppAvatar }),
    body: (S) =>
      `${S.opp} arrives with epaulettes and a flat stare. The Corps will throw its discipline behind you — but first you must prove you can command, not merely shout. Pick a man, the colonel says, and have him broken.`,
    choices: [
      {
        label: `Hand them a name and prove you can be obeyed`,
        fx: { influence: 10, base: 6, heat: 10, support: -4 },
        inc: { purge_count: 1 },
        set: { bloody_hands: true, has_network: true },
        tone: 'bold',
        result: `You give up a quartermaster who'd been skimming the stores. He's gone by morning — properly, permanently gone — and the colonel salutes you for the first time, like you finally passed potty training.`,
      },
      {
        label: `Promise them a clean chain of command instead`,
        fx: { influence: 8, base: 4, support: 2 },
        set: { pledged: true, clean_streak: true },
        tone: 'good',
        result: `You promise rank by merit and orders without poison in them. The colonel doesn't buy it, but the old bastard's intrigued — discipline gives him something dangerously close to a thrill.`,
      },
      {
        label: `Refuse — you're nobody's trained monkey`,
        fx: { support: 8, base: 6, influence: -8, heat: 4 },
        set: { zealot_rep: true },
        tone: 'bold',
        result: `You will not be tested like some sweaty recruit. The ultras lose their goddamn minds over the defiance; the colonel just smiles and files it away — and files, in the Order, are forever.`,
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
    body: `Your inner circle slaps a decree on your desk: one cut, one colour, one armband, worn by every man who claims to march with you. Visible loyalty or visible refusal — there's to be no cute third option for fence-sitting cowards.`,
    choices: [
      {
        label: `Make it mandatory — and make the bare-armed regret it`,
        fx: { base: 12, media: 8, heat: 12, support: -6 },
        set: { bloody_hands: true, zealot_rep: true },
        tone: 'bold',
        result: `The streets go one colour overnight. Anyone who hesitates gets remembered, then gets a visit, then gets the message tattooed somewhere it'll stick.`,
      },
      {
        label: `Make it voluntary — let peer pressure do the dirty work`,
        fx: { base: 8, support: 6, influence: 2 },
        set: { grassroots: true },
        tone: 'good',
        result: `You hand out the armband like a medal instead of an order. The true believers wear the thing to bed; everyone else gets shamed into it by Sunday brunch.`,
      },
      {
        label: `Let some industrialist foot the cloth bill — at a price`,
        fx: { funds: 10, base: 6, heat: 6 },
        set: { owes_donor: true, dealmaker: true },
        tone: 'slick',
        result: `A mill owner clothes the entire movement and bills you in favours, not coin. Every armband now comes pre-stitched with his grubby little interests.`,
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
    body: `A rival faction boss who'd sooner die than kiss your ring has just... vanished. Overnight. Poof. Your security chief has suddenly developed a deep fascination with his own shoes. Whatever happened, the whole city is going to look at you to either explain it or own it.`,
    choices: [
      {
        label: `Own it loud — let the empty chair do the talking`,
        fx: { base: 14, influence: 8, heat: 18, support: -8 },
        inc: { purge_count: 1 },
        set: { bloody_hands: true, zealot_rep: true },
        tone: 'bold',
        result: `You announce only that disloyalty has a price, and let the missing man finish the sentence for you. The Vanguard stands a little taller; somewhere abroad, a very thick file gets thicker.`,
      },
      {
        label: `Disavow it — blame some overeager idiots underneath you`,
        fx: { support: 6, media: 4, base: -6, heat: 4 },
        set: { secret_reformer: true },
        tone: 'slick',
        result: `You perform shock and promise a thorough inquiry guaranteed to find jack squat. The ultras feel betrayed; the nervous types feel enormously, sweatily relieved.`,
      },
      {
        label: `Have the officers quietly dig up the truth`,
        roll: {
          stat: 'influence',
          dc: 54,
          success: {
            fx: { influence: 10, base: 4, heat: -6 },
            set: { has_network: true, clean_streak: true },
            text: `Your officers cough up the culprit before the rumours even set, and the Order suddenly looks like a thing with actual rules. The Corps respects a boss who cleans up his own messes.`,
          },
          fail: {
            fx: { heat: 14, support: -8 },
            text: `The inquiry leaks before it's finished, so now everyone just assumes the worst — which, this one time, happens to be completely true.`,
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
    body: `Some fat, faraway power threatens to strangle your trade unless the Order "moderates." Their envoy is unbearably polite, their warships are unhelpfully close, and their deadline is short. Defiance would be glorious, ruinously expensive, and possibly very stupid.`,
    choices: [
      {
        label: `Defy the bastards — turn their threat into a rally`,
        fx: { support: 12, base: 10, funds: -10, heat: 8 },
        set: { zealot_rep: true, grassroots: true },
        tone: 'bold',
        result: `You read the ultimatum aloud to a screaming crowd and tear it in half on stage. Fervor goes through the roof; the granaries, give it a month, will go straight through the floor.`,
      },
      {
        label: `Cut a quiet deal and keep the gravy flowing`,
        fx: { funds: 12, influence: 6, base: -8, heat: 4 },
        set: { dealmaker: true, secret_reformer: true },
        tone: 'slick',
        result: `You hand the envoy concessions no rally will ever, ever hear about. The War Chest stays fat; the true believers start sniffing the air for the unmistakable stink of compromise.`,
      },
      {
        label: `Let your industrialist buddies broker it`,
        fx: { funds: 10, media: 4, heat: 6 },
        set: { owes_donor: true, dark_money: true },
        tone: 'slick',
        result: `Your patrons have pals across that border. The sanctions quietly evaporate, and the invoice shows up later — payable in obedience, compounding daily.`,
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
    body: `The mill owners who bankrolled your whole glorious rise stroll into your office without knocking. They didn't crush the unions so you could forget their phone numbers. They want contracts, exemptions, and a chair at every table you sit at — preferably the big one at the head.`,
    choices: [
      {
        label: `Roll over and give them everything`,
        fx: { funds: 16, influence: 6, base: -8, heat: 8 },
        set: { dealmaker: true, owes_donor: true, dark_money: true },
        tone: 'slick',
        result: `The War Chest overflows and the factories hum your anthem down the assembly line. You're also, very quietly, their property now. Congratulations, big man.`,
      },
      {
        label: `Take their money and honour exactly none of it`,
        fx: { funds: 10, base: 6, heat: 10, support: -2 },
        set: { went_negative: true, bloody_hands: true },
        tone: 'bold',
        result: `You pocket every donation and shred every promise. One mill owner develops a sudden, fatal tax problem the very next week. Funny how that keeps happening to people who annoy you.`,
      },
      {
        label: `Throw them out — the Order isn't for sale`,
        fx: { support: 10, base: 8, funds: -8, influence: -4 },
        set: { zealot_rep: true, grassroots: true },
        tone: 'bold',
        result: `You boot the petitioners into the hallway and brag about it at the next rally. The streets roar; the money men start, very calmly, shopping for a more reasonable strongman.`,
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
    body: `Your inner circle sets a folder on your desk: names, lovingly collected, of everyone who's ever so much as flinched. Some are real rivals. Some are just tired and said something dumb at dinner. Crossing a name off has never been so easy, or so filthily tempting.`,
    choices: [
      {
        label: `Approve the whole damn list`,
        fx: { base: 12, influence: 8, heat: 16, support: -8 },
        inc: { purge_count: 1 },
        set: { bloody_hands: true, zealot_rep: true },
        tone: 'bold',
        result: `By Friday the waverers are gone and the loyalists are so terrified they've looped clean back around to genuine devotion. Cohesion, of a sort, has never been higher.`,
      },
      {
        label: `Cross off only the real traitors — by the book`,
        fx: { influence: 8, base: 4, support: 2, heat: 4 },
        set: { clean_streak: true, has_network: true },
        tone: 'good',
        result: `You let the officers verify each name and spare the merely exhausted. The Corps notes, with grudging respect, that even your knives come with a rulebook.`,
      },
      {
        label: `Burn the list and call mercy a flex`,
        fx: { support: 10, influence: -6, base: -4, heat: -6 },
        set: { secret_reformer: true },
        tone: 'good',
        result: `You feed the whole folder to the fireplace while they watch. A few of them are genuinely moved; the hardest men in the room immediately start a quiet little list of their own.`,
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
    body: `The treasury can bankroll exactly one grand gesture this season: a colossal iron monument to the Order looming over the capital square, or enough grain to drag the starving districts through winter. Pick one. The other can go eat a statue.`,
    choices: [
      {
        label: `Build the giant statue — give them something to gawk at`,
        fx: { base: 12, media: 10, support: 6, funds: -12, heat: 6 },
        set: { zealot_rep: true },
        tone: 'bold',
        result: `The iron colossus throws a shadow clean across the square. The hungry districts admire it from a respectful distance, on aggressively empty stomachs.`,
      },
      {
        label: `Buy the grain — feed the poor bastards first`,
        fx: { support: 14, base: 6, funds: -10, heat: -4 },
        set: { grassroots: true, clean_streak: true },
        tone: 'good',
        result: `The granaries swing open and the lean districts actually eat. No statue claws its way skyward, but a whole generation will remember exactly who filled their bowls.`,
      },
      {
        label: `Let a donor fund the statue — for a small favour`,
        fx: { media: 8, base: 6, funds: 4, heat: 8 },
        set: { dark_money: true, owes_donor: true, dealmaker: true },
        tone: 'slick',
        result: `A beaming industrialist coughs up for the bronze AND the grain — then carves his initials, very small and very permanent, into the base.`,
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
        label: `Squash the little climber before he ripens`,
        fx: { base: 10, influence: 8, heat: 14, support: -6 },
        inc: { purge_count: 1 },
        set: { bloody_hands: true, went_negative: true },
        tone: 'bold',
        result: `The ambitious upstart gets reassigned to a posting so distant and so cold his career needs a coroner. The chair is yours again, and emptier than ever.`,
      },
      {
        label: `Buy him off with rank and shiny rewards`,
        fx: { influence: 8, base: 4, funds: -6 },
        set: { has_network: true, dealmaker: true },
        tone: 'slick',
        result: `You make the rival a partner with everything to lose. Ambition, generously paid, makes a shockingly loyal lapdog — for now, anyway.`,
      },
      {
        label: `Name a real successor — and actually mean it`,
        fx: { support: 8, influence: 6, base: -2 },
        set: { secret_reformer: true, clean_streak: true },
        tone: 'good',
        result: `You announce a line of succession built on rules instead of knives. The Corps nearly faints; the ultras grumble that real strongmen die at their desks, thank you very much.`,
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
    body: `A shot cracks out, a guard drops, and you're standing there without a scratch and suddenly the most sympathetic man in the entire country. Your security chief swears on his mother it was real. Your propaganda chief is already three paragraphs into the legend. Only you know which one to trust.`,
    choices: [
      {
        label: `Milk it for martyrdom — round up every "enemy"`,
        fx: { base: 12, support: 8, heat: 16, influence: 4 },
        inc: { purge_count: 1 },
        set: { bloody_hands: true, zealot_rep: true },
        tone: 'bold',
        result: `The "plot" becomes a permission slip, and the list of conspirators runs longer than any actual conspiracy possibly could. Fervor burns white-hot and brainless.`,
      },
      {
        label: `Stage the survival for the cameras — grief and steel`,
        roll: {
          stat: 'media',
          dc: 52,
          success: {
            fx: { media: 12, support: 10, base: 6 },
            set: { zealot_rep: true, dark_money: true },
            text: `The footage of you rising bloodied-but-unbowed loops on every screen until the whole nation weeps. A backer quietly funds the entire production, and the legend writes its own damn self.`,
          },
          fail: {
            fx: { media: -8, heat: 12, support: -6 },
            set: { went_negative: true },
            text: `Some idiot's camera catches the rehearsal. The staged miracle curdles into a scandal you absolutely cannot un-film, no matter how many people quietly vanish.`,
          },
        },
        tone: 'slick',
      },
      {
        label: `Tell the boring truth and refuse to milk it`,
        fx: { support: 10, influence: 4, base: -6, heat: -4 },
        set: { secret_reformer: true, clean_streak: true },
        tone: 'good',
        result: `You thank the guard by name, grieve like an actual human being, and round up exactly no one. The cautious exhale; the hardliners stare at you, gutted that you wasted a flawless crisis.`,
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
    body: `A scuffle flares on the frontier — a few shots, a disputed flag, a tidy column of smoke. Small enough to bury, big enough to ride to glory on. The Order has never been so ready for a war, or so gorgeously unprepared to actually pay for one.`,
    choices: [
      {
        label: `Escalate — let the Order forge itself in fire`,
        roll: {
          stat: 'base',
          dc: 56,
          success: {
            fx: { base: 14, support: 12, heat: 10 },
            set: { zealot_rep: true, bloody_hands: true },
            text: `You answer the provocation with absolutely unhinged force and the frontier holds. The Vanguard marches home as heroes, and the Order looks unbreakable, godlike, terrifying.`,
          },
          fail: {
            fx: { support: -12, base: -6, heat: 18 },
            text: `The little skirmish becomes a war you can't possibly afford. Those tidy columns of smoke are your own cities now, and the bill comes back in coffins.`,
          },
        },
        tone: 'bold',
      },
      {
        label: `Contain it — buy the peace with other people's gold`,
        fx: { funds: -8, influence: 8, base: -4, heat: 2 },
        set: { dealmaker: true, owes_donor: true },
        tone: 'slick',
        result: `Your industrialist patrons fund a discreet little settlement before the smoke even clears. The frontier shuts up; you now owe them roughly one war's worth of gratitude.`,
      },
      {
        label: `Stand down in public and call for calm`,
        fx: { support: 6, influence: 6, base: -8, heat: -8 },
        set: { secret_reformer: true, clean_streak: true },
        tone: 'good',
        result: `You pick the deeply unsexy peace and say so straight into the cameras. Foreign observers melt with relief; the ultras spit that an Iron leader actually blinked.`,
      },
    ],
  },
];
