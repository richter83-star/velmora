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
    body: `An insurgent from your own side is running to your flank, calling you a sellout to anyone with a microphone. Ignore them and they grow; engage them and you elevate them.`,
    choices: [
      {
        label: 'Tack toward them to close the lane',
        fx: { base: 10, support: -4, media: 2 },
        set: { pledged: true },
        tone: 'slick',
        result: 'You adopt half their platform and starve them of oxygen. Your flank cheers; the center squints.',
      },
      {
        label: 'Hold the center and outlast them',
        fx: { support: 8, base: -4, influence: 4 },
        tone: 'good',
        result: 'You refuse to chase. It is a bet that the grown-up lane is wider than the loud one.',
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
    body: `Your signature bill is one vote from passing, and the opposition is talking it to death on the floor. You can cut a grubby deal for the last vote, or let the bill die clean.`,
    choices: [
      {
        label: 'Trade a favor for the final vote',
        fx: { influence: 8, support: 6, heat: 6 },
        set: { dealmaker: true },
        tone: 'slick',
        result: 'You buy the vote with a bridge to nowhere in someone’s district. The bill passes; the receipt exists.',
      },
      {
        label: 'Let it die and run on the fight',
        fx: { base: 8, support: 2, media: 4 },
        tone: 'bold',
        result: 'You lose the bill and win the martyrdom. "They blocked it" is a serviceable campaign ad.',
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
    body: `Sixteen towns in five days on a bus that smells of coffee and ambition. Every diner is a photo op and a chance to say exactly the wrong thing while tired.`,
    choices: [
      {
        label: 'Grind the full retail-politics circuit',
        roll: {
          stat: 'support',
          dc: 50,
          success: {
            fx: { support: 12, base: 6 },
            text: 'You shake every hand and remember every name. The local coverage is a love letter.',
          },
          fail: {
            fx: { support: -4, heat: 4 },
            text: 'On day four, exhausted, you mangle a town’s name on camera. Small, sticky, and looping.',
          },
        },
        tone: 'good',
      },
      {
        label: 'Do fewer stops, more fundraisers',
        fx: { funds: 10, base: -2 },
        tone: 'slick',
        result: 'You trade handshakes for checks. The war chest grows; the "where were you?" ads write themselves.',
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
    body: `Over a very good steak, a very smooth lobbyist explains how aligned your interests truly are, and how grateful certain friends would be.`,
    choices: [
      {
        label: 'Let yourself be befriended',
        fx: { funds: 12, influence: 6, heat: 8 },
        set: { corrupt_streak: true },
        scandal: { id: 'lobby_lunch', label: 'the lobbyist on speed-dial', severity: 2 },
        tone: 'slick',
        result: 'You pick up nothing but the relationship. The check, in every sense, is taken care of.',
      },
      {
        label: 'Keep it correct and arm’s-length',
        fx: { support: 4, base: 4, funds: -2 },
        set: { clean_streak: true },
        tone: 'good',
        result: 'You pay for your own steak and promise nothing. The lobbyist smiles and crosses you off a list.',
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
    body: `The district’s biggest employer is shutting its gates, and a thousand families are looking to you to do something — anything — that fits in a headline.`,
    choices: [
      {
        label: 'Fight for a costly public rescue',
        fx: { support: 10, funds: -10, base: 6 },
        tone: 'good',
        result: 'You move heaven and the treasury to save the jobs. It is expensive, popular, and arguably worth it.',
      },
      {
        label: 'Promise retraining and a brighter future',
        roll: {
          stat: 'media',
          dc: 50,
          success: {
            fx: { support: 6, media: 6 },
            text: 'You sell the pivot to tomorrow convincingly. Hope, well-delivered, buys time.',
          },
          fail: {
            fx: { support: -8, base: -4 },
            text: '"Learn to code" lands like a slap. The clip follows you to every plant gate after.',
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
      `The result is a hair’s breadth, and ${S.opp} is demanding a recount while hinting darkly about "irregularities." The lawyers are circling; the cameras are live.`,
    choices: [
      {
        label: 'Fight the recount tooth and nail',
        roll: {
          stat: 'influence',
          dc: 54,
          success: {
            fx: { influence: 10, support: 8, base: 4 },
            text: 'Your lawyers are better and your margin holds. The result is certified; your rival fumes.',
          },
          fail: {
            fx: { support: -8, heat: 10 },
            text: 'The fight drags and the doubt sets in. Even a win now wears an asterisk.',
          },
        },
        npcFx: { id: 'antagonist', relationship: -14 },
        tone: 'bold',
      },
      {
        label: 'Call for calm and an honest count',
        fx: { support: 6, base: 4, media: 4 },
        set: { honest_rep: true },
        tone: 'good',
        result: 'You insist every vote be counted and the process trusted. Statesmanship is a slow, expensive flex.',
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
      `One last debate against ${S.opp} before the nation votes. Everything you have built comes down to ninety minutes and one unscripted moment.`,
    choices: [
      {
        label: 'Bait them into losing their cool',
        roll: {
          stat: 'media',
          dc: 54,
          success: {
            fx: { media: 12, support: 10 },
            text: 'You needle, they snap, and the split-screen does the rest. The room is yours.',
          },
          fail: {
            fx: { support: -8, heat: 4 },
            text: 'You go for the jugular and miss; you look like the aggressor. Sympathy swings to them.',
          },
        },
        npcFx: { id: 'antagonist', relationship: -8 },
        tone: 'bold',
      },
      {
        label: 'Rise above and look presidential',
        fx: { support: 8, media: 6, base: 2 },
        tone: 'good',
        result: 'You stay gracious while they swing. Calm, in a brawl, reads as strength.',
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
    body: `Your sector’s targets for the new plan are due. Promise too much and you will be blamed for the shortfall; promise too little and you look like a saboteur.`,
    choices: [
      {
        label: 'Pledge heroic, impossible numbers',
        fx: { influence: 10, base: 6, heat: 8 },
        set: { cooked_books: true },
        tone: 'slick',
        result: 'The Centre adores your ambition. Reality will file its objection later, in red ink.',
      },
      {
        label: 'Submit honest, achievable targets',
        fx: { support: 6, base: 2, influence: -4 },
        set: { honest_rep: true },
        tone: 'bold',
        result: 'You promise what you can deliver. Caution is a quiet sort of courage here, and it shows in your file.',
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
    body: `A manuscript crosses your desk — beautiful, dangerous, and unmistakably critical of the Party. You can stamp it dead, pass it up the line, or quietly let it breathe.`,
    choices: [
      {
        label: 'Ban it and flag the author',
        fx: { base: 8, influence: 4, support: -6 },
        inc: { purge_count: 1 },
        set: { zealot_rep: true },
        tone: 'bold',
        result: 'You kill the book and name the writer. The shelves stay safe and a little emptier.',
      },
      {
        label: 'Lose the file in a drawer',
        fx: { support: 8, heat: 8 },
        set: { secret_reformer: true },
        tone: 'good',
        result: 'You let the pages live by simply never finding them. A small, dangerous act of mercy.',
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
    body: `A figure purged years ago — perhaps unjustly — is up for quiet rehabilitation. Backing it admits the old verdict was wrong, which is its own kind of confession.`,
    choices: [
      {
        label: 'Champion their return',
        fx: { support: 10, base: -4, heat: 6 },
        set: { secret_reformer: true, peacemaker: true },
        tone: 'good',
        result: 'You argue for mercy and memory. Restoring one name suggests others were wronged too — and people notice.',
      },
      {
        label: 'Let the dead stay buried',
        fx: { base: 6, influence: 4, support: -2 },
        tone: 'slick',
        result: 'You decline to reopen old wounds, which is to say, old files. Some doors stay shut for everyone’s safety.',
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
    body: `You are sent abroad to a congress of allied parties, all smiles and secret rankings. A misjudged toast here echoes for years in the corridors back home.`,
    choices: [
      {
        label: 'Outshine the delegation, claim the spotlight',
        fx: { media: 8, influence: 6, base: 4, heat: 6 },
        set: { climber_rep: true },
        tone: 'slick',
        result: 'You give the speech everyone repeats. Your own delegation’s smiles tighten by a degree.',
      },
      {
        label: 'Defer modestly to your seniors',
        fx: { influence: 6, base: 4, heat: -2 },
        set: { has_network: true },
        tone: 'good',
        result: 'You let your elders shine and bank the gratitude. Patience compounds in a system built on it.',
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
    body: `A distant province is quietly ignoring directives and running itself. The Centre wants it brought to heel; the province wants to be left alone. You are sent to settle it.`,
    choices: [
      {
        label: 'Crush the defiance, make an example',
        roll: {
          stat: 'base',
          dc: 54,
          success: {
            fx: { base: 10, influence: 8, heat: 6 },
            text: 'You bring the province to heel before it becomes a habit. The Centre is pleased; the province is silent.',
          },
          fail: {
            fx: { support: -8, heat: 12 },
            text: 'Your heavy hand turns sullen compliance into open resentment. The example backfires.',
          },
        },
        inc: { purge_count: 1 },
        set: { bloody_hands: true },
        tone: 'bold',
      },
      {
        label: 'Negotiate a quiet autonomy',
        fx: { influence: 6, support: 8, base: -4 },
        set: { dealmaker: true, secret_reformer: true },
        tone: 'slick',
        result: 'You let the province keep its dignity and the Centre keep its map. Both call it a win; both watch you closely.',
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
    body: `A grey, tireless functionary has served you flawlessly and now expects his reward — a promotion he has earned and is not remotely qualified for.`,
    choices: [
      {
        label: 'Promote him; loyalty above all',
        fx: { base: 8, influence: 4, support: -4 },
        set: { has_network: true },
        tone: 'slick',
        result: 'You reward the loyalty, not the competence. He will never betray you and never excel. A fair trade, mostly.',
      },
      {
        label: 'Promote on merit instead',
        fx: { influence: 8, support: 4, base: -4 },
        tone: 'good',
        result: 'You pick the abler stranger over the faithful drudge. Competence rises; a quiet grudge takes root.',
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
    body: `A rival whispers that your recent positions smell of "deviation" from the line. The accusation is vague, which makes it impossible to disprove and dangerous to ignore.`,
    choices: [
      {
        label: 'Out-orthodox your accuser',
        roll: {
          stat: 'base',
          dc: 52,
          success: {
            fx: { base: 10, influence: 6, heat: -4 },
            text: 'You quote the doctrine back chapter and verse until your accuser looks like the deviationist. Reversed.',
          },
          fail: {
            fx: { heat: 12, support: -6 },
            text: 'Your defense protests too much, and the whisper hardens into a file note.',
          },
        },
        tone: 'bold',
      },
      {
        label: 'Confess a small error, perform humility',
        fx: { support: 4, base: -2, heat: -4 },
        tone: 'slick',
        result: 'You admit to a minor lapse and thank the Party for its correction. Self-criticism, fluently performed, is armor.',
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
    body: `A former aide — bitter, observant, and recently fired — is shopping a memoir. They know where the rhetorical bodies are buried, and the publisher is interested.`,
    choices: [
      {
        label: 'Discredit the author preemptively',
        roll: {
          stat: 'media',
          dc: 52,
          success: {
            fx: { media: 6, base: 4, heat: 2 },
            text: 'You paint them as a disgruntled nobody before the book lands. It sells three copies and a shrug.',
          },
          fail: {
            fx: { support: -8, heat: 8 },
            text: 'Attacking them makes them sympathetic and the book essential. Pre-orders spike on your outrage.',
          },
        },
        scandal: { id: 'aide_memoir', label: 'the aide who wrote it all down', severity: 2 },
        tone: 'slick',
      },
      {
        label: 'Rise above it and say nothing',
        fx: { support: 2, base: 2, media: -2 },
        tone: 'good',
        result: 'You let the book come and go without feeding it your fury. Starved of a fight, it fades to a remainder bin.',
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
    body: `Your protection officers want to wrap you in a moving fortress — no rope lines, no surprises, no crowds. Safer, certainly, and a wall between you and everyone who put you here.`,
    choices: [
      {
        label: 'Keep the crowds and the risk',
        fx: { support: 8, base: 6, heat: 4 },
        tone: 'good',
        result: 'You wade into the rope lines against advice. The connection is real; so, your detail mutters, is the danger.',
      },
      {
        label: 'Accept the bubble',
        fx: { heat: -6, influence: 4, support: -4 },
        tone: 'slick',
        result: 'You let them seal you in. Safe, scheduled, and slowly, you stop hearing the country you govern.',
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
    body: `A tense summit with a rival power. A deal is on the table that trades a little pride for a lot of stability — or you can play to the cameras back home and walk away hard.`,
    choices: [
      {
        label: 'Strike the pragmatic deal',
        roll: {
          stat: 'influence',
          dc: 52,
          success: {
            fx: { influence: 10, support: 8, base: -2 },
            text: 'You give a little, get a lot, and sell it as peace through strength. The historians will be kind.',
          },
          fail: {
            fx: { support: -6, heat: 6 },
            text: 'The deal is reasonable and the optics are terrible. "Weak" is the word that sticks at home.',
          },
        },
        set: { peacemaker: true },
        tone: 'good',
      },
      {
        label: 'Walk away to look strong',
        fx: { base: 8, media: 4, support: -2, heat: 4 },
        tone: 'bold',
        result: 'You stride out for the cameras. The base roars; the problem you came to solve rides home with you.',
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
    body: `Your spouse, long kept offstage, is suddenly a story — charming the public and, inconveniently, outshining you. They want a real role; your handlers want them controllable.`,
    choices: [
      {
        label: 'Hand them a genuine portfolio',
        fx: { support: 8, media: 6, influence: -2 },
        tone: 'good',
        result: 'You give them real work and real credit. The partnership charms the country and complicates the dinner table.',
      },
      {
        label: 'Keep them decorative and on-message',
        fx: { media: 4, base: 2, support: -2 },
        tone: 'slick',
        result: 'You keep them smiling and scripted. Safer for the campaign, colder at home.',
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
    body: `A spontaneous movement of young admirers has sprung up in your name — idealistic, energetic, and entirely beyond your control. Such things can lift you or curdle overnight.`,
    choices: [
      {
        label: 'Embrace and organize them',
        fx: { base: 10, media: 6, support: 4 },
        set: { cult_building: true },
        tone: 'bold',
        result: 'You give the movement banners and a structure. The energy is electric and now, usefully, yours.',
      },
      {
        label: 'Bless them but keep your distance',
        fx: { support: 6, base: 2 },
        tone: 'good',
        result: 'You thank them warmly and avoid owning their every excess. Affection without liability — wise, if a little cool.',
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
    body: `Hostile code has crippled the ministries, the grid flickers, and no one can yet say who did it. The public wants a name and a fix; you have neither, yet.`,
    choices: [
      {
        label: 'Lead a calm, competent response',
        roll: {
          stat: 'influence',
          dc: 52,
          success: {
            fx: { influence: 12, support: 8, base: 4 },
            text: 'You convene the experts, level with the public, and restore the systems. Competence under pressure is gold.',
          },
          fail: {
            fx: { support: -8, heat: 8 },
            text: 'The fix drags and the briefings contradict each other. The chaos becomes a story about you.',
          },
        },
        tone: 'good',
      },
      {
        label: 'Blame a foreign enemy, rally the flag',
        fx: { base: 10, media: 6, heat: 8, support: -2 },
        tone: 'bold',
        result: 'You name a culprit before the evidence does. The flags wave; the attribution may not survive scrutiny.',
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
    body: `Engineers report a fracture in the great upstream dam, and the towns below it are sleeping. Evacuate and you may cause panic over nothing; wait and you may drown a valley.`,
    choices: [
      {
        label: 'Order the evacuation now',
        roll: {
          stat: 'support',
          dc: 48,
          success: {
            fx: { support: 12, influence: 6, funds: -6 },
            text: 'You empty the valley before the worst. If the dam holds, they grumble; if it goes, you saved thousands.',
          },
          fail: {
            fx: { support: -4, heat: 4 },
            text: 'You move the valley and the dam holds. "Overreaction," they call it — the cheapest possible mistake.',
          },
        },
        tone: 'good',
      },
      {
        label: 'Reinforce quietly and avoid panic',
        fx: { funds: -6, heat: 10, support: -4 },
        tone: 'slick',
        result: 'You patch in secret and pray. If the crews are fast enough, no one ever knows how close it came.',
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
    body: `The whole country has downed tools — trains still, ports silent, a nation holding its breath. The strikers want concessions; the hardliners want them broken.`,
    choices: [
      {
        label: 'Negotiate and grant real concessions',
        roll: {
          stat: 'base',
          dc: 50,
          success: {
            fx: { support: 12, base: 6, funds: -6 },
            text: 'You sit with the organizers and give enough to restart the country. Costly, and it holds.',
          },
          fail: {
            fx: { support: -6, heat: 6 },
            text: 'Your concessions read as weakness to some and stinginess to others. The trains move; the grumbling stays.',
          },
        },
        set: { peacemaker: true },
        tone: 'good',
      },
      {
        label: 'Break the strike with force',
        fx: { base: 8, heat: 16, support: -10 },
        inc: { purge_count: 1 },
        set: { bloody_hands: true, tyrant_rep: true },
        scandal: { id: 'broke_strike', label: 'the strike you broke by force', severity: 3 },
        tone: 'bold',
        result: 'The trains run again under guard. Order is restored, and a grievance is filed in a million memories.',
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
    body: `The ground heaves and a city falls in on itself. The rescue window is measured in hours, the cameras arrive in minutes, and the whole nation watches how you move.`,
    choices: [
      {
        label: 'Go to the rubble and lead in person',
        roll: {
          stat: 'support',
          dc: 50,
          success: {
            fx: { support: 14, base: 8, media: 6 },
            text: 'You are there in the dust, organizing, lifting, present. The image of it outlives the disaster.',
          },
          fail: {
            fx: { support: -6, heat: 6 },
            text: 'You arrive and get in the rescuers’ way; the visit looks staged. Good intentions, bad optics.',
          },
        },
        tone: 'good',
      },
      {
        label: 'Run the response from the capital',
        fx: { influence: 8, funds: -8, support: 2 },
        tone: 'slick',
        result: 'You coordinate efficiently from a war room. The aid flows well; the absence from the rubble is noted.',
      },
    ],
  },
];
