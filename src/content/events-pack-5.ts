import type { GameEvent } from '../engine/types';

/**
 * Content pack 5 — fifth volume expansion. Redistricting and policy votes on the
 * ballot side; purge quotas, samizdat, and committee knife-fights on the
 * vanguard side; documentaries and anniversaries shared; and five new crises
 * (refugees, terror, bank run, wildfire, chemical spill). Fictional and
 * non-partisan by construction.
 */
export const PACK_5: GameEvent[] = [
  // ---------------- BALLOT ----------------
  {
    id: 'p5_b_gerrymander',
    paths: ['ballot'],
    phases: [2, 3],
    weight: 7,
    art: 'newspaper',
    emoji: '🗺️',
    title: 'The Redistricting Map',
    body: `Your party holds the magic pen that redraws the district lines, and holy hell is that pen tempting. A few greasy little curves and you lock in your majority for a decade — while the map ends up looking exactly as bent and crooked as you are.`,
    choices: [
      {
        label: 'Draw the map like a drunk lizard and win anyway',
        fx: { influence: 10, base: 6, heat: 8 },
        set: { corrupt_streak: true },
        scandal: { id: 'gerrymander', label: 'the district map you bent', severity: 2 },
        tone: 'slick',
        result:
          'The lines slither off into shapes God never intended. Safe seats, a soft little scandal, and one cartographer who is absolutely going to sing to somebody someday.',
      },
      {
        label: 'Hand the pen to a fairness commission like a sucker',
        fx: { support: 10, base: -4, influence: -2 },
        set: { clean_streak: true },
        tone: 'good',
        result:
          'You give away the pen to look like a saint, and a saint you do look. Your safe seats get a little less safe, you noble idiot.',
      },
    ],
  },
  {
    id: 'p5_b_healthcare',
    paths: ['ballot'],
    phases: [2, 3],
    weight: 8,
    art: 'bulletin',
    emoji: '🏥',
    title: 'The Healthcare Vote',
    body: `Your big shiny reform finally hits the floor. Pass the real thing and you change millions of lives; gut it into mush and you can actually scrape the votes together. Pick your poison: purity, or the math that doesn't give a damn about your feelings.`,
    choices: [
      {
        label: 'Hold out for the full, ballsy version',
        roll: {
          stat: 'support',
          dc: 54,
          success: {
            fx: { support: 14, base: 8 },
            text: 'Against every smug prediction, you whip the votes for the real deal. A genuine, generation-defining win that nobody thought your sorry coalition had in it.',
          },
          fail: {
            fx: { support: -8, base: -4, heat: 4 },
            text: 'You grab for everything and the coalition splits like cheap pants. The bill dies face-down in the gutter and every greasy finger points at you.',
          },
        },
        tone: 'bold',
      },
      {
        label: 'Swallow the half-loaf compromise',
        fx: { support: 8, influence: 6, base: -2 },
        set: { dealmaker: true },
        tone: 'good',
        result:
          'You pass the watered-down sludge and call it "a start." Real help reaches real people; the purity freaks scream betrayal from their fainting couches.',
      },
    ],
  },
  {
    id: 'p5_b_endorsement_war',
    paths: ['ballot'],
    phases: [1, 2],
    weight: 7,
    art: 'scene',
    emoji: '⭐',
    title: 'The Kingmaker',
    body: `A wrinkled, sainted elder statesman — whose blessing yanks voters around like puppets — will endorse you. Catch: you have to swallow his beloved, half-mummified pet cause and pretend you love it too.`,
    choices: [
      {
        label: 'Take the blessing, choke down the dead cause',
        fx: { support: 10, influence: 6, base: -2 },
        set: { owes_elder: true },
        tone: 'slick',
        result:
          'The old relic anoints you on a sunny stage while the cameras weep. You also inherit a position you would not touch with a borrowed pole.',
      },
      {
        label: 'Tell the old man to keep his strings',
        fx: { base: 8, support: -2, media: 2 },
        tone: 'bold',
        result:
          'You decline the strings and the blessing in one go. Independence feels great and looks great — right up until you need that last lousy point and it is not there.',
      },
    ],
  },
  {
    id: 'p5_b_volunteer',
    paths: ['ballot'],
    phases: [1, 2],
    weight: 6,
    art: 'scene',
    emoji: '📱',
    title: 'The Volunteer’s Mistake',
    body: `Some twitchy young volunteer posted something genuinely revolting under the campaign banner. It is going viral at light speed, and unfortunately it is technically your name stamped on the account.`,
    choices: [
      {
        label: 'Eat the blame and cover the kid',
        fx: { support: 6, media: 4, base: -2 },
        set: { honest_rep: true },
        tone: 'good',
        result:
          'You own the screwup, apologize like a grownup, and shield the dumb kid. Accountability, done with a little grace, kills the pile-on dead.',
      },
      {
        label: 'Feed the volunteer to the wolves',
        fx: { media: 4, heat: 4, base: -4 },
        tone: 'slick',
        result:
          'You fire them loud enough for the cheap seats and stroll off. The story dies; your own staff quietly clocks exactly how fast you cut a rope when it suits you.',
      },
    ],
  },
  {
    id: 'p5_b_polling_dip',
    paths: ['ballot'],
    phases: [2, 3],
    weight: 7,
    art: 'newspaper',
    emoji: '📉',
    title: 'The Sudden Slump',
    body: `Your numbers just yeeted themselves off a cliff for reasons nobody can name. The consultants are sweating through their suits and screaming for a dramatic reinvention; your gut says hold the goddamn line.`,
    choices: [
      {
        label: 'Reinvent — new hair, new face, new everything',
        roll: {
          stat: 'media',
          dc: 52,
          success: {
            fx: { media: 8, support: 10 },
            text: 'The reboot sticks and the whole story flips to "comeback." Reinvention, when it actually works, looks like raw genius instead of a mid-life crisis.',
          },
          fail: {
            fx: { support: -8, base: -4 },
            text: 'The makeover stinks of flop sweat and desperation. "Who even ARE these people anymore?" becomes the only question anybody asks.',
          },
        },
        tone: 'slick',
      },
      {
        label: 'Keep your nerve and your damn message',
        fx: { base: 8, support: 4 },
        tone: 'bold',
        result:
          'You refuse to flinch and just ride out the storm. Sometimes a slump is only weather; you decline to wet yourself and call it the apocalypse.',
      },
    ],
  },
  {
    id: 'p5_b_townhall_walkout',
    paths: ['ballot'],
    phases: [1, 2, 3],
    weight: 6,
    art: 'scene',
    emoji: '🚶',
    title: 'The Staged Walkout',
    body: `Mid-speech, a clump of activists stands up and stomps out in a perfectly rehearsed huff, cameras suspiciously pre-positioned for maximum drama. The room — and the clip — is now yours to play with.`,
    choices: [
      {
        label: 'Call them back and actually hear them out',
        fx: { support: 8, media: 6, base: -2 },
        set: { peacemaker: true },
        tone: 'good',
        result:
          'You holler after them to come sit down and talk it out. The graciousness completely upstages their precious little stunt.',
      },
      {
        label: 'Roast them on the way out the door',
        fx: { base: 8, media: 2, support: -4, heat: 2 },
        tone: 'bold',
        result:
          'You land a vicious one-liner at their retreating backs. Your crowd howls; the clip lives forever and cuts you right back whenever it feels like it.',
      },
    ],
  },
  {
    id: 'p5_b_corruption_probe',
    paths: ['ballot'],
    phases: [2, 3],
    weight: 7,
    art: 'newspaper',
    emoji: '🔎',
    title: 'The Ethics Probe',
    body: `An ethics committee cracks open your office's spending records. There's probably nothing damning in there. Probably. That word "probably" is sweating and pulling a double shift.`,
    choices: [
      {
        label: 'Throw the books wide open and play clean',
        fx: { support: 6, base: 4, heat: -4 },
        set: { clean_streak: true },
        tone: 'good',
        result:
          'You hand over the ledgers and the calendars without a fuss. Transparency is boring as dishwater, which is exactly how you want this thing to feel.',
      },
      {
        label: 'Stonewall the bastards behind procedure',
        fx: { influence: 4, heat: 10, support: -4 },
        scandal: { id: 'ethics_stonewall', label: 'the inquiry you stonewalled', severity: 2 },
        tone: 'slick',
        result:
          'Your lawyers spin the probe into a hedge maze with no exit. It works — but now the maze itself is the headline, you slippery turd.',
      },
    ],
  },

  // ---------------- VANGUARD ----------------
  {
    id: 'p5_v_purge_quota',
    paths: ['vanguard'],
    phases: [2, 3],
    weight: 8,
    art: 'bulletin',
    emoji: '📋',
    title: 'The Quota of Names',
    body: `The organs have handed down a number from on high: this many enemies are to be dug up in your district by month's end. The enemies do not actually exist. The quota, the smug, sphincter-clenching quota, absolutely does.`,
    choices: [
      {
        label: 'Fill the quota with real, living names',
        fx: { base: 10, influence: 6, support: -8, heat: 6 },
        inc: { purge_count: 2 },
        set: { bloody_hands: true, tyrant_rep: true },
        tone: 'bold',
        result:
          'You hand up a list of the inconvenient and the unlucky, sealed with a smile. The quota is met. So is a line you can never, ever scrub yourself back across.',
      },
      {
        label: 'Stuff it with the already-dead and long-fled',
        roll: {
          stat: 'influence',
          dc: 54,
          success: {
            fx: { influence: 6, support: 8, heat: -2 },
            text: 'You pad the list with corpses and people three borders away. The number tickles the Centre pink and not one living soul takes a scratch.',
          },
          fail: {
            fx: { heat: 14, support: -4 },
            text: 'Some pencil-pushing auditor notices your "enemies" are suspiciously impossible to arrest, on account of being dead. The questions follow you all the way home.',
          },
        },
        set: { secret_reformer: true },
        tone: 'slick',
      },
    ],
  },
  {
    id: 'p5_v_samizdat',
    paths: ['vanguard'],
    phases: [1, 2],
    weight: 7,
    art: 'scene',
    emoji: '🗞️',
    title: 'The Samizdat',
    body: `A grubby carbon-copied underground pamphlet is getting passed hand to sweaty hand — and it's funny, it's true, and it's gloriously treasonous. You can hunt it, crush it, or just try really, REALLY hard to never find it.`,
    choices: [
      {
        label: 'Hunt the press, drag people off in cuffs',
        fx: { base: 8, influence: 4, support: -6 },
        inc: { purge_count: 1 },
        set: { zealot_rep: true },
        tone: 'bold',
        result:
          'You track down the typewriter and the hands that fed it paper. The pamphlets stop cold; the legend of the damn things only gets bigger.',
      },
      {
        label: 'Read it, snort, and look the other way',
        fx: { support: 6, heat: 6 },
        set: { secret_reformer: true },
        tone: 'good',
        result:
          'You pocket a copy for the laughs and aim the manhunt at a bunch of empty rooms. The truth gets to live another week on your watch.',
      },
    ],
  },
  {
    id: 'p5_v_monument',
    paths: ['vanguard'],
    phases: [2, 3],
    weight: 7,
    art: 'bulletin',
    emoji: '🗿',
    title: 'The Predecessor’s Statue',
    body: `The old leader has fallen out of favor, and the giant ugly statue of him squatting in the square is now, delicately, your steaming problem. Topple it with fireworks, or sneak it off into a ditch at three in the morning?`,
    choices: [
      {
        label: 'Yank it down with a brass band and fireworks',
        fx: { base: 8, media: 6, heat: 6 },
        set: { climber_rep: true },
        tone: 'bold',
        result:
          'You stage the toppling for every camera in the land. The crowd cheers the shiny new era and gets a free lesson in exactly how fast an era can curdle.',
      },
      {
        label: 'Sneak it off to rot in a field somewhere',
        fx: { influence: 6, support: 2, heat: -2 },
        tone: 'slick',
        result:
          'You have the thing gone by dawn with zero ceremony. No spectacle, no backlash, no whining martyr cast in bronze. Just a hole and a hauling bill.',
      },
    ],
  },
  {
    id: 'p5_v_defector_family',
    paths: ['vanguard'],
    phases: [2, 3],
    weight: 7,
    art: 'scene',
    emoji: '👪',
    title: 'The Defector’s Family',
    body: `A big-name figure has bolted abroad and made the Centre look like a sack of clowns. Their frail old parents and little kids are still here, and the lovely question of what to do with them just got dumped on your desk.`,
    choices: [
      {
        label: 'Quietly tuck the innocent family out of reach',
        fx: { support: 10, base: -4, heat: 8 },
        set: { secret_reformer: true, honest_rep: true },
        tone: 'good',
        result: `You "lose" the paperwork that would punish little kids for a grown coward's choice. A real risk, taken in the dark, for the dangerous crime of basic decency.`,
      },
      {
        label: 'Make a screaming example of them',
        fx: { base: 8, influence: 4, support: -8 },
        inc: { purge_count: 1 },
        set: { bloody_hands: true },
        tone: 'bold',
        result:
          "You make the family eat the defector's tab right down to the grandkids. The message lands loud and clear — and so does the kind of ghoul you have turned into.",
      },
    ],
  },
  {
    id: 'p5_v_war_hero',
    paths: ['vanguard'],
    phases: [2, 3],
    weight: 7,
    art: 'rival',
    emoji: '🎖️',
    title: 'The Inconvenient Hero',
    speaker: (S) => ({ name: S.opp, role: 'a decorated rival', avatar: S.oppAvatar }),
    body: (S) =>
      `${S.opp}, a chest-full-of-medals war hero, is dangerously, nauseatingly beloved — the exact flavor of popularity that gives the Centre night sweats and turns you into a very handy knife.`,
    choices: [
      {
        label: 'Engineer the hero’s spectacular faceplant',
        roll: {
          stat: 'influence',
          dc: 54,
          success: {
            fx: { influence: 10, base: 6, heat: 6 },
            text: 'You stitch together a quiet little case and the hero gets reassigned to the ass-end of nowhere. The Centre sends a thank-you card; everyone else just learns to fear you.',
          },
          fail: {
            fx: { heat: 12, support: -6 },
            text: 'Your swipe at a national darling is clumsy and very, very seen. Sympathy hardens around them like cement, and every suspicious eye in the room swings to you.',
          },
        },
        npcFx: { id: 'antagonist', relationship: -16 },
        inc: { purge_count: 1 },
        tone: 'bold',
      },
      {
        label: 'Cozy up and ride their coattails instead',
        fx: { influence: 6, support: 6, base: 2 },
        npcFx: { id: 'antagonist', relationship: 14 },
        set: { has_network: true },
        tone: 'slick',
        result:
          "You hitch your wagon to the hero's blazing star instead of snuffing it. A powerful friend, sure — and a powerful loaded gun pointed lovingly at your own foot.",
      },
    ],
  },
  {
    id: 'p5_v_committee',
    paths: ['vanguard'],
    phases: [3],
    weight: 9,
    art: 'bulletin',
    emoji: '🪑',
    title: 'The Central Committee Vote',
    body: `A vote that'll rearrange the whole rotten top of the Party is barreling in, and the blocs are circling like sharks. Your fistful of proxies could tip the thing — toward a reformer, a hardliner, or a delicious pile of chaos you can pick clean.`,
    choices: [
      {
        label: 'Throw your weight behind the soft-hearted reformer',
        fx: { support: 10, influence: 6, base: -6, heat: 6 },
        set: { secret_reformer: true, peacemaker: true },
        tone: 'good',
        result:
          'You blow your proxies on the gentler tomorrow. If they win, you ride up the elevator with them; if they lose, congrats, your vote is now carved in the record forever.',
      },
      {
        label: 'Back the iron-fisted bastard and bank the IOU',
        fx: { base: 10, influence: 8, support: -4 },
        set: { has_network: true },
        tone: 'slick',
        result:
          'You prop up the hardliner and the fat debt he now owes you. Safe, cynical, and — most importantly — the kind of move that lets you keep breathing.',
      },
    ],
  },
  {
    id: 'p5_v_disaster_cover',
    paths: ['vanguard'],
    phases: [1, 2],
    weight: 7,
    art: 'crisis',
    emoji: '🏭',
    title: 'The Industrial Accident',
    body: `A factory you rushed into existence just blew itself to hell with a body count to match. The Centre can NEVER find out it was your corner-cutting, and not some imaginary saboteur, that lit the fuse.`,
    choices: [
      {
        label: 'Bury it; pin it on a "wrecker"',
        fx: { influence: 6, base: 4, heat: 12, support: -6 },
        inc: { purge_count: 1 },
        set: { bloody_hands: true },
        scandal: {
          id: 'factory_coverup',
          label: 'the accident you blamed on a scapegoat',
          severity: 3,
        },
        tone: 'slick',
        result:
          'You hang the whole thing on some poor innocent "saboteur" and waltz away whistling. The truth gets buried right there with the victims — for now, anyway.',
      },
      {
        label: 'Tell the ugly truth and eat the consequences',
        fx: { support: 8, influence: -8, base: -2 },
        set: { honest_rep: true },
        tone: 'bold',
        result:
          'You tell the Centre it was your own haste and stick your neck out for the chop. Honesty here is basically career suicide with a cherry on top; you do it anyway.',
      },
    ],
  },

  // ---------------- SHARED ----------------
  {
    id: 'p5_s_documentary',
    paths: ['ballot', 'vanguard'],
    phases: [2, 3],
    weight: 6,
    art: 'scene',
    emoji: '🎬',
    title: 'The Documentary Crew',
    body: `A fancy, respected filmmaker wants months of fly-on-the-wall access to your sweaty inner life. Played right, it's a glowing legacy reel; played wrong, it's a hundred hours of high-definition evidence against you.`,
    choices: [
      {
        label: 'Throw the doors open, let them film everything',
        roll: {
          stat: 'media',
          dc: 52,
          success: {
            fx: { media: 12, support: 8 },
            text: 'The raw candor reads as iron confidence and the film basically canonizes you. A reckless gamble that paid out in pure legend.',
          },
          fail: {
            fx: { media: -6, heat: 8 },
            text: 'The camera catches a tantrum, a flat-out lie, and one genuinely cruel little moment. The edit, it turns out, is not exactly on Team You.',
          },
        },
        tone: 'bold',
      },
      {
        label: 'Hand them a tightly leashed version',
        fx: { media: 6, base: 2 },
        tone: 'slick',
        result:
          'You let them shoot only the pre-chewed, choreographed moments. The film comes out glossy, safe, and about as convincing as a campaign smile.',
      },
    ],
  },
  {
    id: 'p5_s_health_scare',
    paths: ['ballot', 'vanguard'],
    phases: [2, 3],
    weight: 6,
    art: 'scene',
    emoji: '🩻',
    title: 'The Health Scare',
    body: `A routine checkup turns up something the doctors want to "keep an eye on." Nothing urgent, they swear — but in your chair, one private little fact is always a single leak away from being a screaming public circus.`,
    choices: [
      {
        label: 'Lay it out plainly and keep grinding',
        fx: { support: 8, media: 4, base: 2 },
        set: { honest_rep: true },
        tone: 'good',
        result:
          'You tell the public the unvarnished truth and just keep working. Admitting you are a mortal meat-sack, weirdly, makes them trust you more.',
      },
      {
        label: 'Lock it in a drawer and fake the vigor',
        fx: { influence: 4, heat: 6, support: -2 },
        set: { stonewaller: true },
        tone: 'slick',
        result:
          'You bury the file and strut around like a prize bull. The secret holds — one small, ticking little time bomb sitting in a locked drawer with your name on it.',
      },
    ],
  },
  {
    id: 'p5_s_ghostwriter',
    paths: ['ballot', 'vanguard'],
    phases: [1, 2, 3],
    weight: 6,
    art: 'newspaper',
    emoji: '✍️',
    title: 'The Vision Book',
    body: `Your big "memoir of ideas" is overdue, and some absurdly gifted ghostwriter has cranked out a draft. It's smarter and sharper than anything you'd ever puke onto a page — and it crams bold words in your mouth you might actually have to defend out loud.`,
    choices: [
      {
        label: 'Slap your name on the bold version and run',
        fx: { media: 8, base: 6, heat: 4 },
        tone: 'bold',
        result:
          'The book detonates into a sensation and the ideas are now yours to own — live, on every stage, under every hot light, until the day you die.',
      },
      {
        label: 'Sand the spicy bits down to mush',
        fx: { media: 4, support: 2 },
        tone: 'slick',
        result:
          'You file every sharp edge down into safe, gummy platitudes. It sells modestly, offends nobody, and commits you to precisely jack squat.',
      },
    ],
  },
  {
    id: 'p5_s_satire',
    paths: ['ballot', 'vanguard'],
    phases: [1, 2, 3],
    weight: 6,
    art: 'scene',
    emoji: '🎭',
    title: 'The Mocking Mural',
    body: `A brutally funny caricature of your stupid face has popped up — on a wall, on every phone, on the smirking lips of every comedian in the land. However you react becomes the next, even bigger, joke at your expense.`,
    choices: [
      {
        label: 'Laugh along and buy the original off the artist',
        fx: { support: 8, media: 6, base: -2 },
        tone: 'good',
        result:
          "You praise the artist's brass and hang a copy in your own office. Good humor flips the mockery clean around into a standing ovation for you.",
      },
      {
        label: 'Send goons to scrub it off the wall',
        fx: { heat: 8, base: 2, support: -6 },
        tone: 'bold',
        result:
          'You dispatch someone to wipe the wall clean. By nightfall the image is plastered across ten thousand walls and your thin little skin is the headline.',
      },
    ],
  },
  {
    id: 'p5_s_anniversary',
    paths: ['ballot', 'vanguard'],
    phases: [3],
    weight: 6,
    art: 'bulletin',
    emoji: '🎗️',
    title: 'The Anniversary',
    body: `It's been a whole decade since you first grabbed the chair, and the occasion demands a speech. You can polish the gleaming legacy and blow yourself, or admit — just this once — what you'd do differently.`,
    choices: [
      {
        label: 'Trumpet the flawless, immaculate legacy',
        fx: { media: 8, base: 6, heat: 2 },
        set: { cult_building: true },
        tone: 'bold',
        result:
          'You recite the triumphs and quietly skip the body count. The faithful roar themselves hoarse; the historians silently sharpen their pens.',
      },
      {
        label: 'Cop to one real, honest-to-God regret',
        fx: { support: 10, base: -2 },
        set: { honest_rep: true },
        tone: 'good',
        result:
          'You name one true screwup out loud, in front of everyone. Vulnerability, from a decade-deep power-junkie, lands like a thunderclap nobody saw coming.',
      },
    ],
  },

  // ---------------- CRISES ----------------
  {
    id: 'p5_c_refugees',
    paths: ['ballot', 'vanguard'],
    phases: [2, 3],
    weight: 9,
    crisis: true,
    art: 'crisis',
    emoji: '⛺',
    title: 'The Refugee Wave',
    body: `A war next door has flushed a tide of terrified families straight at your border. Open arms wrench the country apart at the seams; slammed gates wrench the conscience — and, more pressingly, the cameras.`,
    choices: [
      {
        label: 'Open the gates and organize the relief',
        roll: {
          stat: 'support',
          dc: 52,
          success: {
            fx: { support: 12, media: 6, funds: -8 },
            text: 'You take them in with order and a shred of dignity. The cost is brutally real; so is the moral high ground it buys you to stand on and gloat.',
          },
          fail: {
            fx: { support: -8, heat: 8 },
            text: 'Your big heart badly outran your logistics; the camps overflow into a swamp and the backlash boils. Mercy, run on a shoestring, becomes its own disaster.',
          },
        },
        set: { peacemaker: true },
        tone: 'good',
      },
      {
        label: 'Slam the border shut, flex the muscle',
        fx: { base: 10, heat: 8, support: -6 },
        tone: 'bold',
        result:
          'You bolt the gates and the hardliners go feral with joy. The pictures at the fence are not exactly the ones you want carved on your tombstone.',
      },
    ],
  },
  {
    id: 'p5_c_terror',
    paths: ['ballot', 'vanguard'],
    phases: [2, 3],
    weight: 9,
    crisis: true,
    art: 'crisis',
    emoji: '🚨',
    title: 'The Attack',
    body: `A bomb just gutted a packed square. The wounded are still being counted, the public is somewhere between gut-sick and rabid, and every single syllable you cough up in the next hour is going to ricochet for years.`,
    choices: [
      {
        label: 'Steady the nation; don’t grab a power-grab',
        roll: {
          stat: 'support',
          dc: 52,
          success: {
            fx: { support: 14, base: 8, influence: 4 },
            text: 'You grieve right alongside the country and flatly refuse to let blind fear rewrite the laws. Restraint, in that white-knuckle moment, is what actual leadership looks like.',
          },
          fail: {
            fx: { support: -6, heat: 6 },
            text: 'A terrified mob baying for blood mistakes your calm for spinelessness. The polls happily punish you for the sin of not losing your mind.',
          },
        },
        tone: 'good',
      },
      {
        label: 'Grab sweeping emergency powers',
        fx: { base: 10, influence: 8, heat: 12, support: -4 },
        inc: { purge_count: 1 },
        set: { bloody_hands: true, tyrant_rep: true },
        tone: 'bold',
        result:
          'You snatch up vast new powers "just for the duration." Emergencies, as history loves to point out, have a real funny habit of never quite, ever ending.',
      },
    ],
  },
  {
    id: 'p5_c_bank_run',
    paths: ['ballot', 'vanguard'],
    phases: [1, 2, 3],
    weight: 9,
    crisis: true,
    art: 'crisis',
    emoji: '🏦',
    title: 'The Bank Run',
    body: `A rumor metastasized into a full-blown stampede: lines snake around every bank in sight, and the entire financial system could seize up and die by closing time. The only thing propping it up is confidence, and confidence is evaporating like spit on a griddle.`,
    choices: [
      {
        label: 'Publicly guarantee every last deposit',
        roll: {
          stat: 'influence',
          dc: 50,
          success: {
            fx: { influence: 10, support: 10, funds: -8 },
            text: "You shove the full faith of the state behind everyone's savings, and the panic lets out one long shaky breath. A bluff that absolutely had to land, and somehow did.",
          },
          fail: {
            fx: { support: -8, heat: 8 },
            text: 'Nobody buys the guarantee and the lines only get longer. Promising everyone everything, then being called a liar to your face, is the worst seat in the whole house.',
          },
        },
        tone: 'bold',
      },
      {
        label: 'Slam a bank holiday on it to stop the bleed',
        fx: { influence: 6, support: -4, heat: 6 },
        tone: 'slick',
        result:
          'You freeze the whole system solid to choke off the panic. It works, more or less, and everyone spends the rest of their lives remembering the day you locked up their money.',
      },
    ],
  },
  {
    id: 'p5_c_wildfire',
    paths: ['ballot', 'vanguard'],
    phases: [1, 2, 3],
    weight: 8,
    crisis: true,
    art: 'crisis',
    emoji: '🔥',
    title: 'The Fire Season',
    body: `Walls of flame are chewing through the dry hills and marching straight at the towns. The crews are stretched to the snapping point, and the smoke has rolled right into the capital and onto every front page in the country.`,
    choices: [
      {
        label: 'Throw every last resource into the fight',
        fx: { support: 10, funds: -12, base: 4 },
        tone: 'good',
        result:
          'You dump the whole treasury on the flames and stand shoulder to shoulder with the crews. Wildly expensive, soul-crushingly exhausting, and the obvious right call.',
      },
      {
        label: 'Spin the optics, ration the actual response',
        roll: {
          stat: 'media',
          dc: 50,
          success: {
            fx: { media: 6, funds: -4 },
            text: 'You stage the perfect heroic photos and spend the absolute bare minimum. The coverage fawns over you; the hills, charred to the bone, are rather less impressed.',
          },
          fail: {
            fx: { support: -10, heat: 8 },
            text: 'A town you cheaped out on burns down live on national television. The optics you tried to manage turn around and manage the hell out of you instead.',
          },
        },
        tone: 'slick',
      },
    ],
  },
  {
    id: 'p5_c_chemical',
    paths: ['ballot', 'vanguard'],
    phases: [2, 3],
    weight: 8,
    crisis: true,
    art: 'crisis',
    emoji: '☣️',
    title: 'The Chemical Spill',
    body: `A derailed tanker just poisoned the river feeding three towns. The company is stalling and lawyering up, the water is sketchy as hell, and the people want a straight answer about whether it's safe to pour their kid a glass.`,
    choices: [
      {
        label: 'Order a hard shutdown and spill the whole truth',
        fx: { support: 12, funds: -8, heat: -2 },
        set: { honest_rep: true },
        tone: 'good',
        result:
          'You cut the water, truck in clean supplies, and tell the unvarnished truth fast. Costly, correct, and — rarest of all — actually believed.',
      },
      {
        label: 'Tell everyone to relax while you "study it"',
        roll: {
          stat: 'media',
          dc: 52,
          success: {
            fx: { media: 6, base: 4 },
            text: 'Your soothing act holds and the tests crawl back somewhere short of catastrophic. You bought time on a coin flip, and this one rare time it came up heads.',
          },
          fail: {
            fx: { support: -12, heat: 12 },
            text: 'The "everything\'s fine, folks" briefing ages like warm milk the second the test results leak. Reassurance flips into full-blown cover-up in a single news cycle.',
          },
        },
        scandal: { id: 'water_spin', label: 'the water you called safe', severity: 2 },
        tone: 'slick',
      },
    ],
  },
];
