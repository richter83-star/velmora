import type { GameEvent } from '../engine/types';

/**
 * Content pack 4 — fourth volume expansion. Governing dilemmas and the media
 * circus on the ballot side; the censor's desk, five-year plans, and ideological
 * deviation on the vanguard side; plus memoir leaks, summits, and four fresh
 * crises (cyberattack, dam, general strike, earthquake). Choices feed the
 * ending flags where it fits. Fictional and non-partisan by construction.
 */
export const PACK_4: GameEvent[] = [
  // ---------------- BALLOT ----------------
  {
    id: 'p4_b_primary',
    paths: ['ballot'],
    phases: [1, 2],
    weight: 8,
    art: 'rival',
    emoji: '🥊',
    title: 'The Primary Challenger',
    body: `Some twitchy upstart from your own side is running at you from the flank, calling you a gutless sellout to anyone holding a microphone. Ignore the little gremlin and they metastasize; punch back and you just handed them a stage.`,
    choices: [
      {
        label: 'Steal their crap platform and close the lane',
        fx: { base: 10, support: -4, media: 2 },
        set: { pledged: true },
        tone: 'slick',
        result:
          'You yank half their talking points and suffocate the brat in his own crib. Your flank howls with joy; the middle squints at you like you grew a second head.',
      },
      {
        label: 'Hold the middle and wait for them to flame out',
        fx: { support: 8, base: -4, influence: 4 },
        tone: 'good',
        result:
          'You refuse to chase the noisy little ferret. Pure gamble that the grown-up lane is fatter than the loud one screaming into a megaphone.',
      },
    ],
  },
  {
    id: 'p4_b_filibuster',
    paths: ['ballot'],
    phases: [2, 3],
    weight: 7,
    art: 'bulletin',
    emoji: '⏳',
    title: 'The Filibuster',
    body: `Your pet bill is one lousy vote from passing, and the opposition is droning it into a coma on the floor, reading the phone book if they have to. You can buy the last vote with something filthy, or let the thing die a clean little death.`,
    choices: [
      {
        label: 'Buy the last vote with something rotten',
        fx: { influence: 8, support: 6, heat: 6 },
        set: { dealmaker: true },
        tone: 'slick',
        result:
          'You purchase the vote with a bridge to absolutely nowhere in some hayseed’s district. The bill passes; the receipt, unfortunately, also exists.',
      },
      {
        label: 'Let it die and run on the corpse',
        fx: { base: 8, support: 2, media: 4 },
        tone: 'bold',
        result:
          'You lose the bill and win the pity party. "They murdered it in cold blood" is a perfectly serviceable attack ad, frankly.',
      },
    ],
  },
  {
    id: 'p4_b_bus_tour',
    paths: ['ballot'],
    phases: [2, 3],
    weight: 7,
    art: 'scene',
    emoji: '🚌',
    title: 'The Swing-District Tour',
    body: `Sixteen sad little towns in five days on a bus reeking of cold coffee and raw ambition. Every greasy diner is a photo op and a fresh chance to say something catastrophically stupid while running on three hours of sleep.`,
    choices: [
      {
        label: 'Grind the whole exhausting handshake circuit',
        roll: {
          stat: 'support',
          dc: 50,
          success: {
            fx: { support: 12, base: 6 },
            text: 'You pump every clammy hand and remember every name like a damn savant. The local coverage reads like a mash note.',
          },
          fail: {
            fx: { support: -4, heat: 4 },
            text: 'Day four, brain liquefied, you butcher a town’s name straight into a hot mic. Small, sticky, and looping till the heat death of the universe.',
          },
        },
        tone: 'good',
      },
      {
        label: 'Skip the peasants, hit the fundraisers',
        fx: { funds: 10, base: -2 },
        tone: 'slick',
        result:
          'You swap handshakes for fat checks. The war chest swells; the "where the hell were you?" ads basically write themselves.',
      },
    ],
  },
  {
    id: 'p4_b_lobbyist',
    paths: ['ballot'],
    phases: [1, 2],
    weight: 7,
    art: 'scene',
    emoji: '🍽️',
    title: 'The Lobbyist’s Lunch',
    body: `Over a steak that costs more than a voter’s rent, a lobbyist slick as a buttered eel explains how perfectly your interests align, and how deliriously grateful certain unnamed friends would be.`,
    choices: [
      {
        label: 'Let yourself get bought a very nice lunch',
        fx: { funds: 12, influence: 6, heat: 8 },
        set: { corrupt_streak: true },
        scandal: { id: 'lobby_lunch', label: 'the lobbyist on speed-dial', severity: 2 },
        tone: 'slick',
        result:
          'You walk out having promised nothing but the relationship. The check, in every grubby sense of the word, is taken care of.',
      },
      {
        label: 'Keep it clean and pay for your own damn steak',
        fx: { support: 4, base: 4, funds: -2 },
        set: { clean_streak: true },
        tone: 'good',
        result:
          'You cover your own meal and pledge jack squat. The lobbyist smiles like a shark and quietly scratches you off a list.',
      },
    ],
  },
  {
    id: 'p4_b_factory',
    paths: ['ballot'],
    phases: [1, 2],
    weight: 7,
    art: 'newspaper',
    emoji: '🏚️',
    title: 'The Plant Closes',
    body: `The district’s biggest employer is padlocking the gates, and a thousand families are staring at you to do something — anything — that fits neatly into a headline before the unemployment hits.`,
    choices: [
      {
        label: 'Blow the treasury on a costly rescue',
        fx: { support: 10, funds: -10, base: 6 },
        tone: 'good',
        result:
          'You move heaven, earth, and the entire treasury to save the jobs. Ruinously expensive, wildly popular, and arguably worth every coin.',
      },
      {
        label: 'Promise "retraining" and a glorious tomorrow',
        roll: {
          stat: 'media',
          dc: 50,
          success: {
            fx: { support: 6, media: 6 },
            text: 'You sell the pivot to the shining future and they buy it. Hope, delivered with a straight face, buys you precious time.',
          },
          fail: {
            fx: { support: -8, base: -4 },
            text: '"Just learn to code" lands like a slap across the mouth. The clip stalks you to every factory gate for the rest of your natural life.',
          },
        },
        tone: 'slick',
      },
    ],
  },
  {
    id: 'p4_b_recount',
    paths: ['ballot'],
    phases: [3],
    weight: 9,
    art: 'rival',
    emoji: '🔁',
    title: 'The Recount',
    speaker: (S) => ({ name: S.opp, role: 'your rival', avatar: S.oppAvatar }),
    body: (S) =>
      `The result is closer than a coat of paint, and ${S.opp} is screaming for a recount while muttering darkly about "irregularities." The lawyers are circling like vultures with briefcases; the cameras are very, very live.`,
    choices: [
      {
        label: 'Fight the recount with everything you’ve got',
        roll: {
          stat: 'influence',
          dc: 54,
          success: {
            fx: { influence: 10, support: 8, base: 4 },
            text: 'Your lawyers are nastier and your margin holds like a dam. The result gets certified; your rival turns a fascinating shade of purple.',
          },
          fail: {
            fx: { support: -8, heat: 10 },
            text: 'The brawl drags on and the doubt seeps in like damp. Even a win now comes stapled to a giant flashing asterisk.',
          },
        },
        npcFx: { id: 'antagonist', relationship: -14 },
        tone: 'bold',
      },
      {
        label: 'Call for calm and a clean honest count',
        fx: { support: 6, base: 4, media: 4 },
        set: { honest_rep: true },
        tone: 'good',
        result:
          'You demand every single vote be counted and the whole circus trusted. Statesmanship: a slow, expensive, smug-as-hell flex.',
      },
    ],
  },
  {
    id: 'p4_b_final_debate',
    paths: ['ballot'],
    phases: [3],
    weight: 10,
    art: 'rival',
    emoji: '🎙️',
    title: 'The Final Debate',
    speaker: (S) => ({ name: S.opp, role: 'your rival', avatar: S.oppAvatar }),
    body: (S) =>
      `One last bloodbath against ${S.opp} before the nation drags itself to the polls. Everything you’ve clawed together comes down to ninety sweaty minutes and one unscripted moment that could end you.`,
    choices: [
      {
        label: 'Bait them into a full meltdown on live TV',
        roll: {
          stat: 'media',
          dc: 54,
          success: {
            fx: { media: 12, support: 10 },
            text: 'You needle, they detonate, and the split-screen handles the rest like a hired assassin. The whole room belongs to you now.',
          },
          fail: {
            fx: { support: -8, heat: 4 },
            text: 'You lunge for the throat and whiff, and suddenly you’re the unhinged bully on stage. Every drop of sympathy floods straight to them.',
          },
        },
        npcFx: { id: 'antagonist', relationship: -8 },
        tone: 'bold',
      },
      {
        label: 'Rise above the muck and look presidential',
        fx: { support: 8, media: 6, base: 2 },
        tone: 'good',
        result:
          'You stay buttery-smooth while they flail and spit. Calm, in a knife fight, reads as raw strength to the cheap seats.',
      },
    ],
  },

  // ---------------- VANGUARD ----------------
  {
    id: 'p4_v_five_year_plan',
    paths: ['vanguard'],
    phases: [1, 2],
    weight: 8,
    art: 'bulletin',
    emoji: '📊',
    title: 'The Five-Year Plan',
    body: `Your sector’s targets for the glorious new plan are due. Promise too much and they’ll nail you to the wall for the shortfall; promise too little and you look like a wrecker plotting against the future.`,
    choices: [
      {
        label: 'Pledge heroic, batshit-impossible numbers',
        fx: { influence: 10, base: 6, heat: 8 },
        set: { cooked_books: true },
        tone: 'slick',
        result:
          'The Centre creams itself over your ambition. Reality will file its objection later, in red ink and rolling heads.',
      },
      {
        label: 'Submit honest, boring, achievable targets',
        fx: { support: 6, base: 2, influence: -4 },
        set: { honest_rep: true },
        tone: 'bold',
        result:
          'You promise only what you can actually haul in. Caution is a quiet little flavor of courage here, and it gets noted in your file.',
      },
    ],
  },
  {
    id: 'p4_v_censor',
    paths: ['vanguard'],
    phases: [1, 2],
    weight: 8,
    art: 'bulletin',
    emoji: '✒️',
    title: "The Censor's Desk",
    body: `A manuscript lands on your desk — gorgeous, dangerous, and dripping with contempt for the Party on every page. You can stamp the thing dead, kick it up the chain to cover your ass, or quietly let it breathe.`,
    choices: [
      {
        label: 'Kill the book and rat out the author',
        fx: { base: 8, influence: 4, support: -6 },
        inc: { purge_count: 1 },
        set: { zealot_rep: true },
        tone: 'bold',
        result:
          'You strangle the book in its crib and scrawl the writer’s name in the bad ledger. The shelves stay safe, ideologically pure, and a touch emptier.',
      },
      {
        label: 'Bury the file in a drawer and "forget"',
        fx: { support: 8, heat: 8 },
        set: { secret_reformer: true },
        tone: 'good',
        result:
          'You let the pages live by the simple miracle of never finding them again. A small, dangerous, career-ending act of mercy.',
      },
    ],
  },
  {
    id: 'p4_v_rehabilitation',
    paths: ['vanguard'],
    phases: [2, 3],
    weight: 7,
    art: 'scene',
    emoji: '🕊️',
    title: 'The Rehabilitation',
    body: `Some poor bastard purged years back — maybe railroaded, maybe not — is up for a quiet rehabilitation. Backing it means admitting the old verdict was garbage, which is its own special flavor of confession.`,
    choices: [
      {
        label: 'Champion the poor sod’s return',
        fx: { support: 10, base: -4, heat: 6 },
        set: { secret_reformer: true, peacemaker: true },
        tone: 'good',
        result:
          'You stand up for mercy and memory. Scrubbing one name clean hints that a whole heap of others got screwed too — and people absolutely notice.',
      },
      {
        label: 'Let the dead stay good and buried',
        fx: { base: 6, influence: 4, support: -2 },
        tone: 'slick',
        result:
          'You decline to rip open old wounds, which is to say, old files. Some doors stay welded shut for everyone’s continued breathing.',
      },
    ],
  },
  {
    id: 'p4_v_foreign_congress',
    paths: ['vanguard'],
    phases: [2, 3],
    weight: 7,
    art: 'scene',
    emoji: '🌐',
    title: 'The Fraternal Congress',
    body: `You’re shipped abroad to a congress of allied parties, all fake smiles and secret rankings and poisoned hors d’oeuvres. One badly judged toast here echoes for years in the corridors back home.`,
    choices: [
      {
        label: 'Outshine the whole delegation, hog the spotlight',
        fx: { media: 8, influence: 6, base: 4, heat: 6 },
        set: { climber_rep: true },
        tone: 'slick',
        result:
          'You give the speech everybody parrots for a week. Your own delegation’s smiles tighten by exactly one murderous degree.',
      },
      {
        label: 'Bow and scrape modestly to your elders',
        fx: { influence: 6, base: 4, heat: -2 },
        set: { has_network: true },
        tone: 'good',
        result:
          'You let the old fossils shine and bank the gratitude. Patience compounds like interest in a system built entirely on the stuff.',
      },
    ],
  },
  {
    id: 'p4_v_province_revolt',
    paths: ['vanguard'],
    phases: [2, 3],
    weight: 8,
    art: 'crisis',
    emoji: '🗺️',
    title: 'A Province Defies the Centre',
    body: `Some far-flung province is quietly ignoring every directive and running itself like a private kingdom. The Centre wants it dragged to heel; the province wants to be left the hell alone. Guess who got sent to fix it.`,
    choices: [
      {
        label: 'Crush the defiance and make a bloody example',
        roll: {
          stat: 'base',
          dc: 54,
          success: {
            fx: { base: 10, influence: 8, heat: 6 },
            text: 'You stomp the province flat before the rot spreads into a habit. The Centre purrs; the province goes very, very quiet.',
          },
          fail: {
            fx: { support: -8, heat: 12 },
            text: 'Your heavy boot turns sulky compliance into open, spitting hatred. The "example" blows up in your smug little face.',
          },
        },
        inc: { purge_count: 1 },
        set: { bloody_hands: true },
        tone: 'bold',
      },
      {
        label: 'Cut a quiet deal and let them keep their toys',
        fx: { influence: 6, support: 8, base: -4 },
        set: { dealmaker: true, secret_reformer: true },
        tone: 'slick',
        result:
          'You let the province keep its dignity and the Centre keep its precious map. Both call it a win; both start watching you like a hawk.',
      },
    ],
  },
  {
    id: 'p4_v_apparatchik',
    paths: ['vanguard'],
    phases: [1, 2],
    weight: 7,
    art: 'scene',
    emoji: '📎',
    title: 'The Loyal Apparatchik',
    body: `A grey, tireless paper-pusher has served you flawlessly for years and now expects his reward — a promotion he’s technically earned and is, in every meaningful way, spectacularly unqualified for.`,
    choices: [
      {
        label: 'Promote the drone; loyalty over everything',
        fx: { base: 8, influence: 4, support: -4 },
        set: { has_network: true },
        tone: 'slick',
        result:
          'You reward the loyalty and ignore the gaping competence chasm. He’ll never knife you and never impress anyone. A fair trade, mostly.',
      },
      {
        label: 'Promote on merit and break his little heart',
        fx: { influence: 8, support: 4, base: -4 },
        tone: 'good',
        result:
          'You pick the sharper stranger over the faithful old mule. Competence climbs; a quiet, simmering grudge plants its roots.',
      },
    ],
  },
  {
    id: 'p4_v_deviation',
    paths: ['vanguard'],
    phases: [1, 2],
    weight: 8,
    art: 'bulletin',
    emoji: '🚩',
    title: 'Charged With Deviation',
    body: `A rival is whispering that your recent positions reek of "deviation" from the line. The accusation is gloriously vague, which makes it impossible to disprove and suicidal to ignore.`,
    choices: [
      {
        label: 'Out-zealot the smug little accuser',
        roll: {
          stat: 'base',
          dc: 52,
          success: {
            fx: { base: 10, influence: 6, heat: -4 },
            text: 'You recite the doctrine back, chapter and verse, until your accuser looks like the filthy deviationist. The knife goes right back in his hand.',
          },
          fail: {
            fx: { heat: 12, support: -6 },
            text: 'Your defense protests way too much and reeks of guilt, and the whisper hardens into a permanent file note.',
          },
        },
        tone: 'bold',
      },
      {
        label: 'Grovel, confess a tiny error, perform humility',
        fx: { support: 4, base: -2, heat: -4 },
        tone: 'slick',
        result:
          'You cop to a microscopic lapse and thank the Party for lovingly correcting you. Self-flagellation, fluently performed, is bulletproof armor.',
      },
    ],
  },

  // ---------------- SHARED ----------------
  {
    id: 'p4_s_memoir',
    paths: ['ballot', 'vanguard'],
    phases: [2, 3],
    weight: 7,
    art: 'newspaper',
    emoji: '📕',
    title: 'The Tell-All Memoir',
    body: `A former aide — bitter, eagle-eyed, and freshly fired — is shopping a tell-all memoir. They know exactly where every rhetorical body is buried, and some grubby publisher is salivating.`,
    choices: [
      {
        label: 'Smear the author before the ink dries',
        roll: {
          stat: 'media',
          dc: 52,
          success: {
            fx: { media: 6, base: 4, heat: 2 },
            text: 'You paint them as a sad, disgruntled nobody before the book even hits shelves. It sells three copies and one indifferent shrug.',
          },
          fail: {
            fx: { support: -8, heat: 8 },
            text: 'Attacking them makes them a martyr and the book required reading. Pre-orders go nuclear on the back of your tantrum.',
          },
        },
        scandal: { id: 'aide_memoir', label: 'the aide who wrote it all down', severity: 2 },
        tone: 'slick',
      },
      {
        label: 'Rise above it and zip your lips',
        fx: { support: 2, base: 2, media: -2 },
        tone: 'good',
        result:
          'You let the book come and go without feeding it a single drop of your rage. Starved of a brawl, it slinks off to the remainder bin to die.',
      },
    ],
  },
  {
    id: 'p4_s_detail',
    paths: ['ballot', 'vanguard'],
    phases: [2, 3],
    weight: 6,
    art: 'scene',
    emoji: '🕶️',
    title: 'The Security Detail',
    body: `Your protection goons want to seal you inside a rolling fortress — no rope lines, no surprises, no actual humans. Safer, sure, and a nice thick wall between you and every poor sap who put you here.`,
    choices: [
      {
        label: 'Keep the crowds and the lovely risk',
        fx: { support: 8, base: 6, heat: 4 },
        tone: 'good',
        result:
          'You wade into the rope lines against every screamed objection. The connection is real; so, your detail mutters through clenched teeth, is the danger.',
      },
      {
        label: 'Climb into the bubble and seal the lid',
        fx: { heat: -6, influence: 4, support: -4 },
        tone: 'slick',
        result:
          'You let them vacuum-seal you in. Safe, scheduled, and slowly, surely, you stop hearing the country you’re supposedly running.',
      },
    ],
  },
  {
    id: 'p4_s_summit',
    paths: ['ballot', 'vanguard'],
    phases: [2, 3],
    weight: 8,
    art: 'scene',
    emoji: '🤝',
    title: 'The Summit',
    body: `A white-knuckle summit with a rival power. There’s a deal on the table that trades a thimble of pride for a bucket of stability — or you can grandstand for the cameras back home and storm out like a champ.`,
    choices: [
      {
        label: 'Take the boring, sensible deal',
        roll: {
          stat: 'influence',
          dc: 52,
          success: {
            fx: { influence: 10, support: 8, base: -2 },
            text: 'You give a sliver, grab a fortune, and sell the whole thing as peace through strength. The history books will French-kiss you for it.',
          },
          fail: {
            fx: { support: -6, heat: 6 },
            text: 'The deal is perfectly reasonable and the optics are an absolute dumpster fire. "Weak" is the word that sticks to you back home like gum.',
          },
        },
        set: { peacemaker: true },
        tone: 'good',
      },
      {
        label: 'Storm out to look like a tough guy',
        fx: { base: 8, media: 4, support: -2, heat: 4 },
        tone: 'bold',
        result:
          'You stomp out for the cameras like a wronged diva. The base roars; the problem you flew in to solve climbs into the car and rides home with you.',
      },
    ],
  },
  {
    id: 'p4_s_spouse',
    paths: ['ballot', 'vanguard'],
    phases: [1, 2, 3],
    weight: 6,
    art: 'scene',
    emoji: '💞',
    title: 'Into the Spotlight',
    body: `Your spouse, kept in a closet for years, is suddenly a whole story — charming the pants off the public and, very inconveniently, making you look like the boring one. They want a real role; your handlers want them leashed.`,
    choices: [
      {
        label: 'Hand them a real portfolio and real power',
        fx: { support: 8, media: 6, influence: -2 },
        tone: 'good',
        result:
          'You give them actual work and actual credit. The partnership melts the country’s heart and turns every dinner into a power struggle.',
      },
      {
        label: 'Keep them pretty, smiling, and on a short leash',
        fx: { media: 4, base: 2, support: -2 },
        tone: 'slick',
        result:
          'You keep them grinning and reading off cards. Safer for the campaign, frostier than a meat locker at home.',
      },
    ],
  },
  {
    id: 'p4_s_youth',
    paths: ['ballot', 'vanguard'],
    phases: [1, 2],
    weight: 7,
    art: 'scene',
    emoji: '🌻',
    title: 'The Youth Movement',
    body: `A swarm of starry-eyed young admirers has erupted in your name — idealistic, hopped-up, and totally beyond your grip. These things can rocket you to glory or curdle into a riot overnight.`,
    choices: [
      {
        label: 'Embrace the little zealots and organize them',
        fx: { base: 10, media: 6, support: 4 },
        set: { cult_building: true },
        tone: 'bold',
        result:
          'You hand the mob banners, badges, and a chain of command. The energy is pure electricity and now, usefully, it’s yours.',
      },
      {
        label: 'Bless the kids but keep them at arm’s length',
        fx: { support: 6, base: 2 },
        tone: 'good',
        result:
          'You thank them warmly and dodge owning their every dumbass stunt. Affection without liability — wise, if a little cold-blooded.',
      },
    ],
  },

  // ---------------- CRISES ----------------
  {
    id: 'p4_c_cyberattack',
    paths: ['ballot', 'vanguard'],
    phases: [2, 3],
    weight: 9,
    crisis: true,
    art: 'crisis',
    emoji: '💻',
    title: 'The Cyberattack',
    body: `Hostile code has the ministries flat on their backs, the grid is flickering like a dying bug zapper, and nobody can say who pulled the trigger. The public wants a name and a fix; you have neither, yet.`,
    choices: [
      {
        label: 'Lead a calm, competent, grown-up response',
        roll: {
          stat: 'influence',
          dc: 52,
          success: {
            fx: { influence: 12, support: 8, base: 4 },
            text: 'You round up the nerds, level with the public, and claw the systems back online. Competence under pressure is worth its weight in gold.',
          },
          fail: {
            fx: { support: -8, heat: 8 },
            text: 'The fix drags and the briefings contradict each other like drunks arguing. The whole mess curdles into a story about you.',
          },
        },
        tone: 'good',
      },
      {
        label: 'Blame a foreign devil and wave the flag',
        fx: { base: 10, media: 6, heat: 8, support: -2 },
        tone: 'bold',
        result:
          'You slap a name on it before the evidence so much as clears its throat. The flags wave; the accusation may not survive five minutes of scrutiny.',
      },
    ],
  },
  {
    id: 'p4_c_dam',
    paths: ['ballot', 'vanguard'],
    phases: [1, 2, 3],
    weight: 9,
    crisis: true,
    art: 'crisis',
    emoji: '🌊',
    title: 'The Dam Cracks',
    body: `Engineers report a fat crack splitting the great upstream dam, and the towns below are sound asleep. Evacuate and you might spark a panic over nothing; sit on your hands and you might drown an entire valley.`,
    choices: [
      {
        label: 'Order the evacuation right now',
        roll: {
          stat: 'support',
          dc: 48,
          success: {
            fx: { support: 12, influence: 6, funds: -6 },
            text: 'You empty the valley before the worst hits. If the dam holds, they grumble; if it lets go, you just saved thousands of soggy lives.',
          },
          fail: {
            fx: { support: -4, heat: 4 },
            text: 'You evacuate the valley and the dam holds just fine. "Hysterical overreaction," they sneer — the cheapest mistake a person can possibly make.',
          },
        },
        tone: 'good',
      },
      {
        label: 'Patch it on the sly and pray nobody panics',
        fx: { funds: -6, heat: 10, support: -4 },
        tone: 'slick',
        result:
          'You patch the thing in secret and pray to whatever’s listening. If the crews are fast enough, nobody ever learns how close the valley came to a bath.',
      },
    ],
  },
  {
    id: 'p4_c_strike',
    paths: ['ballot', 'vanguard'],
    phases: [2, 3],
    weight: 9,
    crisis: true,
    art: 'crisis',
    emoji: '🪧',
    title: 'The General Strike',
    body: `The whole country has thrown down its tools — trains frozen, ports dead silent, a nation holding its breath. The strikers want real concessions; the hardliners want their skulls cracked open.`,
    choices: [
      {
        label: 'Sit down and grant real concessions',
        roll: {
          stat: 'base',
          dc: 50,
          success: {
            fx: { support: 12, base: 6, funds: -6 },
            text: 'You park yourself across from the organizers and cough up enough to restart the country. Pricey, and somehow it actually holds.',
          },
          fail: {
            fx: { support: -6, heat: 6 },
            text: 'Your concessions read as spineless to some and stingy to the rest. The trains crawl back to life; the bitching never stops.',
          },
        },
        set: { peacemaker: true },
        tone: 'good',
      },
      {
        label: 'Break the strike with boots and batons',
        fx: { base: 8, heat: 16, support: -10 },
        inc: { purge_count: 1 },
        set: { bloody_hands: true, tyrant_rep: true },
        scandal: { id: 'broke_strike', label: 'the strike you broke by force', severity: 3 },
        tone: 'bold',
        result:
          'The trains run again under armed guard. Order is restored, and a fresh grievance gets carved into a million long memories.',
      },
    ],
  },
  {
    id: 'p4_c_quake',
    paths: ['ballot', 'vanguard'],
    phases: [1, 2, 3],
    weight: 9,
    crisis: true,
    art: 'crisis',
    emoji: '🏚️',
    title: 'The Earthquake',
    body: `The ground bucks and a city pancakes in on itself. The rescue window is measured in hours, the cameras roll up in minutes, and the entire nation is watching how you move with a magnifying glass.`,
    choices: [
      {
        label: 'Go to the rubble and lead with your own hands',
        roll: {
          stat: 'support',
          dc: 50,
          success: {
            fx: { support: 14, base: 8, media: 6 },
            text: 'You’re right there in the dust, barking orders, hauling slabs, present. The image of it outlives the disaster by a generation.',
          },
          fail: {
            fx: { support: -6, heat: 6 },
            text: 'You show up and trip over the actual rescuers; the whole visit reeks of staged photo op. Good intentions, dogshit optics.',
          },
        },
        tone: 'good',
      },
      {
        label: 'Run the whole thing from a cozy capital war room',
        fx: { influence: 8, funds: -8, support: 2 },
        tone: 'slick',
        result:
          'You coordinate the rescue with brutal efficiency from a comfy chair. The aid flows beautifully; your absence from the rubble gets noticed, loudly.',
      },
    ],
  },
];
