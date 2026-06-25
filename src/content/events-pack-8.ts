import type { GameEvent } from '../engine/types';

/**
 * Content pack 8 — eighth volume expansion. Recall petitions, micro-targeting,
 * and broken pledges (ballot); loyalty questionnaires, fabricated hero-workers,
 * and recalled exiles (vanguard); biopics, lavish gifts, and defeated rivals
 * (shared); and five new crises (volcano, offshore spill, foreign blackmail,
 * mass poisoning, prison uprising). Fictional and non-partisan by construction.
 */
export const PACK_8: GameEvent[] = [
  // ---------------- BALLOT ----------------
  {
    id: 'p8_b_recall',
    paths: ['ballot'],
    phases: [2, 3],
    weight: 7,
    art: 'newspaper',
    emoji: '🗳️',
    title: 'The Recall Petition',
    body: `Your enemies scraped together enough signatures to drag you back to the ballot mid-term and shove you out the door. You can torch a fortune fighting it, or smirk and dare the bastards to actually beat you.`,
    choices: [
      {
        label: 'Take it seriously; campaign your ass off',
        fx: { support: 8, funds: -10, base: 4 },
        tone: 'good',
        result:
          'You treat the threat like a loaded gun, and you grind out the win anyway. Expensive, soul-crushing, and survived by a hair.',
      },
      {
        label: 'Wave it off as a sad little stunt',
        roll: {
          stat: 'base',
          dc: 52,
          success: {
            fx: { base: 8, support: 4 },
            text: 'Turns out the swagger was earned. The recall fizzles into nothing and you stroll out looking bulletproof.',
          },
          fail: {
            fx: { support: -12, heat: 6 },
            text: 'You blinked about a week too late. The "stunt" nearly took your damn head off, and the near-miss is the only story anyone tells.',
          },
        },
        tone: 'bold',
      },
    ],
  },
  {
    id: 'p8_b_microtarget',
    paths: ['ballot'],
    phases: [2, 3],
    weight: 6,
    art: 'scene',
    emoji: '🎯',
    title: 'The Data Firm',
    body: `A slick little data outfit wants to micro-target voters with messaging so personal it is genuinely creepy — stitched from data they get real cagey about whenever you ask where the hell it came from.`,
    choices: [
      {
        label: 'Hire the creeps; the edge wins it',
        fx: { media: 8, support: 6, heat: 8 },
        set: { corrupt_streak: true },
        scandal: { id: 'data_firm', label: 'the data firm’s mystery sources', severity: 2 },
        tone: 'slick',
        result:
          'The targeting is uncanny, surgical, and brutally effective. Exactly which back alley they scraped all that personal data from is a problem for Future You.',
      },
      {
        label: 'Pass; keep your hands clean',
        fx: { support: 2, base: 4 },
        set: { clean_streak: true },
        tone: 'good',
        result:
          'You wave off the creepy edge and campaign like a damn caveman. Slower, squarer, and you sleep like a baby.',
      },
    ],
  },
  {
    id: 'p8_b_pledge_break',
    paths: ['ballot'],
    phases: [2, 3],
    weight: 7,
    art: 'bulletin',
    emoji: '🤞',
    title: 'The Broken Pledge',
    body: `Reality just walked up and curb-stomped your signature campaign promise. You can break it honestly, right now, like an adult — or keep pretending it is somehow still in the mail.`,
    choices: [
      {
        label: 'Admit it can’t be done, and say why',
        fx: { support: 6, base: -4, media: 2 },
        set: { honest_rep: true },
        tone: 'good',
        result:
          'You break the promise out loud and own every stupid reason it died. Painful, clean, and weirdly it makes people trust you more.',
      },
      {
        label: 'Keep dangling the carrot forever',
        fx: { base: 4, heat: 6, support: -2 },
        tone: 'slick',
        result:
          'You swear it is "still coming" for the tenth goddamn time. The base half-buys it; the press is openly counting the months on its fingers.',
      },
    ],
  },
  {
    id: 'p8_b_empty_chair',
    paths: ['ballot'],
    phases: [3],
    weight: 7,
    art: 'rival',
    emoji: '🪑',
    title: 'The Empty Chair',
    speaker: (S) => ({ name: S.opp, role: 'your rival', avatar: S.oppAvatar }),
    body: (S) =>
      `${S.opp} is chickening out of the big debate. You can debate an empty chair like a lunatic for the cameras, or graciously let it slide and look like the only grown-up in the room.`,
    choices: [
      {
        label: 'Debate the empty chair like a madman',
        roll: {
          stat: 'media',
          dc: 50,
          success: {
            fx: { media: 10, base: 6 },
            text: `You turn the no-show into a viral monument to their cowardice. The chair never recovers; the clip never dies.`,
          },
          fail: {
            fx: { support: -6, media: -2 },
            text: 'The stunt reads as desperate and slightly unhinged. Congratulations — you just lost a debate to a piece of furniture.',
          },
        },
        npcFx: { id: 'antagonist', relationship: -10 },
        tone: 'bold',
      },
      {
        label: 'Take the high road like a saint',
        fx: { support: 6, base: 2 },
        tone: 'good',
        result:
          'You skip the mockery and just dryly note their absence. Restraint, for once in your life, scores the cleaner kill.',
      },
    ],
  },
  {
    id: 'p8_b_veterans',
    paths: ['ballot'],
    phases: [1, 2, 3],
    weight: 7,
    art: 'scene',
    emoji: '🎖️',
    title: 'The Veterans’ Fight',
    body: `Old soldiers are owed benefits the budget mysteriously "cannot find." They are sympathetic, organized, pissed off, and standing on your steps bristling with cameras and medals.`,
    choices: [
      {
        label: 'Find the damn money for them',
        fx: { support: 10, funds: -8, base: 4 },
        set: { honest_rep: true },
        tone: 'good',
        result:
          'You shake the money loose and pay the debt you owe. Some bills you simply do not get to weasel out of, and this is one of them.',
      },
      {
        label: 'Offer warm words and a study committee',
        fx: { media: 4, support: -6, heat: 4 },
        tone: 'slick',
        result:
          'You honor their sacrifice with a podium and a committee that will study the issue until everyone is dead. The medals on your steps are not buying a single word of it.',
      },
    ],
  },
  {
    id: 'p8_b_staffer_scandal',
    paths: ['ballot'],
    phases: [1, 2, 3],
    weight: 6,
    art: 'newspaper',
    emoji: '🚪',
    title: 'The Staffer’s Mess',
    body: `A senior staffer face-planted into a tabloid scandal, and the splatter is landing all over you. They are talented, loyal, and right now radioactive enough to glow in the dark.`,
    choices: [
      {
        label: 'Stand by them through the shitstorm',
        fx: { base: 4, heat: 8, support: -4 },
        set: { loyal_to_old_friends: true },
        tone: 'good',
        result:
          'You refuse to throw a good person under the bus for one bad week. Loyalty, costly and out in the open, buys you a fierce kind of devotion.',
      },
      {
        label: 'Cut them loose to stop the bleeding',
        fx: { media: 4, support: 4, base: -4 },
        tone: 'slick',
        result:
          'You accept their "resignation" before lunch. The story dies; every other staffer quietly starts polishing their résumé.',
      },
    ],
  },
  {
    id: 'p8_b_billboard',
    paths: ['ballot'],
    phases: [2, 3],
    weight: 6,
    art: 'rival',
    emoji: '🪧',
    title: 'The Billboard War',
    speaker: (S) => ({ name: S.opp, role: 'your rival', avatar: S.oppAvatar }),
    body: (S) =>
      `${S.opp} carpet-bombed the highways with a billboard that mocks you by name, the petty little goblin. Your team already has a savage comeback design loaded and ready to print.`,
    choices: [
      {
        label: 'Answer with a vicious billboard of your own',
        fx: { media: 6, base: 6, heat: 6, support: -2 },
        npcFx: { id: 'antagonist', relationship: -12 },
        tone: 'bold',
        result:
          'The highways become a knife fight in vinyl. Your base eats it up; every poor bastard commuting to work wants you both to drop dead.',
      },
      {
        label: 'Buy the next billboard over and go positive',
        fx: { support: 8, media: 4, funds: -4 },
        tone: 'good',
        result:
          'Right beside their nasty little jab, you slap up something hopeful. The contrast does the dirty work their insult was too clumsy to land.',
      },
    ],
  },
  {
    id: 'p8_b_water_project',
    paths: ['ballot'],
    phases: [1, 2],
    weight: 6,
    art: 'bulletin',
    emoji: '🚰',
    title: 'The Cheap Pipes',
    body: `Your flagship public-water project is bleeding over budget. You can slap in the cheap pipes and cut the ribbon on time, or eat the delay and use the ones that won't poison anyone.`,
    choices: [
      {
        label: 'Use the safe pipes; eat the delay',
        fx: { support: 6, funds: -6, base: 2 },
        set: { honest_rep: true },
        tone: 'good',
        result:
          'You blow the ribbon-cutting date and build the damn thing right. Boring, slow, and nobody coughs up blood in five years.',
      },
      {
        label: 'Cut the corner, hit the deadline',
        fx: { base: 8, media: 4, heat: 6 },
        scandal: { id: 'cheap_pipes', label: 'the corners cut on the water project', severity: 2 },
        tone: 'slick',
        result: `You snip the ribbon on schedule to a polite round of applause. The pipes are tomorrow's catastrophe, with your signature scrawled right there on the spec.`,
      },
    ],
  },

  // ---------------- VANGUARD ----------------
  {
    id: 'p8_v_questionnaire',
    paths: ['vanguard'],
    phases: [1, 2],
    weight: 7,
    art: 'bulletin',
    emoji: '📝',
    title: 'The Loyalty Questionnaire',
    body: `A shiny new vetting form is making the rounds through your department — nosy, invasive questions built to sniff out anyone insufficiently slobbering with devotion. You hand it out, or you "forget" to.`,
    choices: [
      {
        label: 'Administer it like a true believer',
        fx: { base: 8, influence: 4, support: -6 },
        inc: { purge_count: 1 },
        set: { zealot_rep: true },
        tone: 'bold',
        result:
          'You grade every answer and flag every flinch. Your department gets quieter, twitchier, and noticeably emptier by the week.',
      },
      {
        label: '"Lose" half the forms; pass everybody',
        roll: {
          stat: 'influence',
          dc: 52,
          success: {
            fx: { support: 8, heat: 2 },
            text: 'You wave your people through a perfectly engineered fog of paperwork. Not one poor soul gets purged on your watch.',
          },
          fail: {
            fx: { heat: 10, support: -4 },
            text: 'Your suspiciously spotless results summon a second auditor. Around here, going easy on people is itself a confession.',
          },
        },
        set: { secret_reformer: true },
        tone: 'slick',
      },
    ],
  },
  {
    id: 'p8_v_hero_worker',
    paths: ['vanguard'],
    phases: [1, 2],
    weight: 7,
    art: 'newspaper',
    emoji: '⛏️',
    title: 'The Hero Worker',
    body: `Propaganda wants a record-smashing "hero worker" out of your region for the front pages, pronto. The actual workers are exhausted, ordinary, and human — so the record would have to be conjured out of thin air.`,
    choices: [
      {
        label: 'Manufacture the legend',
        fx: { media: 10, influence: 6, heat: 4 },
        set: { potemkin: true },
        tone: 'slick',
        result:
          'You crown a hero and invent numbers no spine could ever survive. The nation gets a glorious poster; the truth gets buried in a footnote nobody reads.',
      },
      {
        label: 'Honor a real, ordinary worker instead',
        fx: { support: 8, base: 4, influence: -2 },
        set: { honest_rep: true },
        tone: 'good',
        result: `You celebrate someone genuinely decent at a genuinely normal job. The story is smaller, plainer, and — rare as hen's teeth around here — actually true.`,
      },
    ],
  },
  {
    id: 'p8_v_exile_return',
    paths: ['vanguard'],
    phases: [2, 3],
    weight: 7,
    art: 'rival',
    emoji: '🛬',
    title: 'The Recalled Exile',
    body: `A rival you once shipped into exile is to be lovingly invited home — supposedly forgiven, actually to be strangled somewhere with better lighting. You get to roll out the warm, lethal welcome mat.`,
    choices: [
      {
        label: 'Spring the trap exactly as ordered',
        fx: { influence: 8, base: 6, support: -6, heat: 4 },
        inc: { purge_count: 1 },
        set: { bloody_hands: true },
        tone: 'bold',
        result:
          'You greet him with a big warm hug and a noose tucked behind your back. The Centre purrs over your craftsmanship.',
      },
      {
        label: 'Quietly tip him off not to come',
        fx: { support: 8, influence: -6, heat: 8 },
        set: { secret_reformer: true },
        tone: 'good',
        result:
          'A coded little message reaches him just in time and he stays the hell away. The trap snaps shut on empty air, and somebody upstairs starts wondering exactly why.',
      },
    ],
  },
  {
    id: 'p8_v_informant_web',
    paths: ['vanguard'],
    phases: [1, 2, 3],
    weight: 6,
    art: 'scene',
    emoji: '🕸️',
    title: 'The Informant Web',
    body: `You can spread your informant network until every kitchen table in the land has a snitch parked at it. Total knowledge, total paranoia, and a machine that, once you build it, is a nightmare to ever switch back off.`,
    choices: [
      {
        label: 'Weave the web nice and tight',
        fx: { influence: 12, base: 4, heat: 8, support: -6 },
        set: { has_network: true, blackmailer: true },
        tone: 'slick',
        result:
          'You hear everything now — including your own name muttered in terrified little whispers. Turns out omniscience has a temperature, and it is ice cold.',
      },
      {
        label: 'Keep it small and targeted',
        fx: { influence: 6, heat: 2 },
        tone: 'good',
        result:
          'You resist the urge to bug the entire damn republic. A smaller web, and a country that stays a degree or two less terrified.',
      },
    ],
  },
  {
    id: 'p8_v_relic',
    paths: ['vanguard'],
    phases: [2, 3],
    weight: 6,
    art: 'scene',
    emoji: '⛪',
    title: 'The Old Cathedral',
    body: `The Centre wants the ancient cathedral flattened as a big middle finger to the dead order. It is also the only beautiful thing for a hundred miles in any direction, and the people are absolutely gaga over it.`,
    choices: [
      {
        label: 'Quietly repurpose it instead of leveling it',
        fx: { support: 10, base: -4, heat: 6 },
        set: { secret_reformer: true },
        tone: 'good',
        result:
          'You turn it into a museum of the people instead of a pile of rubble. The stone lives; meanwhile, some humorless type upstairs starts side-eyeing your devotion.',
      },
      {
        label: 'Blow it to dust for the cameras',
        fx: { base: 10, media: 4, support: -8 },
        tone: 'bold',
        result:
          'The domes come down in a glorious cloud of dust to applause from all the right ghouls. The whole province grieves in very careful, very quiet silence.',
      },
    ],
  },
  {
    id: 'p8_v_self_medal',
    paths: ['vanguard'],
    phases: [3],
    weight: 6,
    art: 'bulletin',
    emoji: '🏅',
    title: 'The Medal',
    body: `It is fully within your power to hand yourself the republic's highest honor for "services to the people." Nobody would dare object. Which, let us be honest, is the whole damn point.`,
    choices: [
      {
        label: 'Pin it on your own chest',
        fx: { base: 8, media: 4, support: -6, heat: 4 },
        set: { own_cult: true },
        tone: 'bold',
        result:
          'You award yourself the highest medal in the land. The applause is thunderous, deafening, and completely mandatory on pain of disappearance.',
      },
      {
        label: 'Give it to a fallen soldier’s family instead',
        fx: { support: 12, base: 2 },
        set: { honest_rep: true },
        tone: 'good',
        result:
          'You hand the honor to a grieving family on a quiet little stage. The restraint roars louder than any chunk of metal would on your chest.',
      },
    ],
  },
  {
    id: 'p8_v_border_pretext',
    paths: ['vanguard'],
    phases: [2, 3],
    weight: 7,
    art: 'crisis',
    emoji: '🎇',
    title: 'The Convenient Incident',
    body: `The Centre would find a tidy, manageable border "incident" awfully handy about now — a nice flag for everyone to rally behind. You could cook one up. Real people might catch a real bullet for the sake of the theater.`,
    choices: [
      {
        label: 'Stage the incident',
        fx: { base: 10, media: 8, heat: 8, support: -4 },
        inc: { purge_count: 1 },
        set: { bloody_hands: true },
        scandal: { id: 'false_flag', label: 'the incident you staged', severity: 3 },
        tone: 'bold',
        result:
          'A scripted little skirmish lights up the news and the flags pop out like mushrooms. A handful of actual humans pay full price for your convenient drama.',
      },
      {
        label: 'Refuse to manufacture a crisis',
        fx: { support: 8, influence: -4, base: 2 },
        set: { honest_rep: true, peacemaker: true },
        tone: 'good',
        result:
          'You decline to spill real blood for a propaganda banner. The Centre is sulking; your conscience, for once, is sleeping just fine.',
      },
    ],
  },
  {
    id: 'p8_v_singer',
    paths: ['vanguard'],
    phases: [2, 3],
    weight: 6,
    art: 'scene',
    emoji: '🎤',
    title: 'The Defiant Singer',
    body: `The nation's most beloved singer has, ever so politely, declined to perform at your festival — a tiny, public, terrifyingly dangerous "no." However you swing back at this, somebody is going to write a song about it.`,
    choices: [
      {
        label: 'Let it slide like a gentleman',
        fx: { support: 8, media: 4, base: -2 },
        set: { secret_reformer: true },
        tone: 'good',
        result:
          'You shrug, wish them well in public, and move on. A little grace defuses the bomb a tantrum would have happily detonated in your own lap.',
      },
      {
        label: 'Make their life a living hell',
        fx: { base: 8, heat: 8, support: -8 },
        inc: { purge_count: 1 },
        set: { tyrant_rep: true },
        tone: 'bold',
        result:
          'You see to it the tours dry up and the friends get real nervous, real fast. The whole country just got a crystal-clear look at exactly who you are now.',
      },
    ],
  },

  // ---------------- SHARED ----------------
  {
    id: 'p8_s_biopic',
    paths: ['ballot', 'vanguard'],
    phases: [3],
    weight: 6,
    art: 'newspaper',
    emoji: '🎥',
    title: 'The Biopic',
    body: `A big-shot director is shooting a film of your glorious life. The script fellates you generously but invents a heroic moment that flat-out never happened. You can correct it, or let the legend set like concrete.`,
    choices: [
      {
        label: 'Insist on the truth, warts and all',
        fx: { support: 8, media: 4, base: -2 },
        set: { honest_rep: true },
        tone: 'good',
        result:
          'You make them cut the made-up heroics. The film comes out smaller, truer, and you can actually sit through it without crawling under the seat.',
      },
      {
        label: 'Let the flattering lie stand',
        fx: { media: 10, base: 6, heat: 2 },
        set: { cult_building: true },
        tone: 'slick',
        result:
          'You let the cinematic bullshit harden into the official memory. Give it a generation and nobody alive will know it was invented. That, right there, is the danger.',
      },
    ],
  },
  {
    id: 'p8_s_lavish_gift',
    paths: ['ballot', 'vanguard'],
    phases: [1, 2, 3],
    weight: 6,
    art: 'scene',
    emoji: '🐎',
    title: 'The Extravagant Gift',
    body: `A foreign leader just gifted you something obscenely valuable — a jeweled saddle, a gold-plated car, the works. Keeping it is a scandal; handing it back is a diplomatic slap in the face. Pick your poison.`,
    choices: [
      {
        label: 'Donate it to the national museum',
        fx: { support: 8, media: 4, funds: -2 },
        set: { honest_rep: true },
        tone: 'good',
        result:
          'You accept it with a gracious smile and march it straight into the public collection. Insult dodged, scandal smothered in the crib.',
      },
      {
        label: 'Quietly pocket it',
        fx: { funds: 8, heat: 8, support: -4 },
        set: { corrupt_streak: true },
        scandal: { id: 'kept_gift', label: 'the gift you quietly kept', severity: 1 },
        tone: 'slick',
        result:
          'The gorgeous thing finds a cozy spot in your residence. There is an inventory of state gifts out there, and one fine day some nosy clerk is going to read it.',
      },
    ],
  },
  {
    id: 'p8_s_defeated_rival',
    paths: ['ballot', 'vanguard'],
    phases: [2, 3],
    weight: 6,
    art: 'rival',
    emoji: '🤝',
    title: 'The Defeated Rival',
    speaker: (S) => ({ name: S.opp, role: 'your beaten rival', avatar: S.oppAvatar }),
    body: (S) =>
      `You've beaten ${S.opp} like a rented mule, and now they're sitting across from you, shrunken and gray. You could hand them a real job — talent is talent — or just savor the slaughter and leave them freezing out in the cold.`,
    choices: [
      {
        label: 'Offer them a genuine role',
        fx: { influence: 8, support: 6, base: -2 },
        npcFx: { id: 'antagonist', relationship: 18 },
        set: { has_network: true },
        tone: 'good',
        result:
          'You put your old enemy to work. A rival pissing out of the tent beats one pissing in, and this one might even be useful.',
      },
      {
        label: 'Leave them out in the cold',
        fx: { base: 6, heat: 2, support: -2 },
        npcFx: { id: 'antagonist', relationship: -8 },
        tone: 'slick',
        result:
          'You let them rot in glorious irrelevance. Satisfying as hell, and a renewable supply of nicely motivated enemies for later.',
      },
    ],
  },
  {
    id: 'p8_s_sick_child',
    paths: ['ballot', 'vanguard'],
    phases: [1, 2, 3],
    weight: 6,
    art: 'scene',
    emoji: '🧸',
    title: 'The Hospital Visit',
    body: `A gravely sick kid has, heartbreakingly, asked to meet you. It would be a real, decent kindness — and your handlers, who could find an angle in a brick wall, desperately want the cameras rolling for it.`,
    choices: [
      {
        label: 'Go quietly, no cameras',
        fx: { support: 6, base: 4, media: -2 },
        set: { honest_rep: true },
        tone: 'good',
        result:
          'You visit in private and breathe a word to no one. The kindness is real precisely because not one lens was pointed at it.',
      },
      {
        label: 'Drag the press in for the moment',
        roll: {
          stat: 'media',
          dc: 50,
          success: {
            fx: { media: 10, support: 6 },
            text: 'The image of real tenderness moves the whole nation to tears. It was genuine and it was useful; turns out both can be true at once.',
          },
          fail: {
            fx: { support: -8, heat: 4 },
            text: 'The cameras make it reek of staging and the family squirms on live TV. Exploiting a sick kid plays exactly as gross as it actually is.',
          },
        },
        tone: 'slick',
      },
    ],
  },
  {
    id: 'p8_s_war_anniversary',
    paths: ['ballot', 'vanguard'],
    phases: [2, 3],
    weight: 6,
    art: 'bulletin',
    emoji: '🌹',
    title: 'The War Anniversary',
    body: `It is the anniversary of a horrific war, and you've got to give the address. You can spoon-feed them the cozy national myth, or the harder, truer story that actually does right by the dead.`,
    choices: [
      {
        label: 'Tell the hard truth',
        fx: { support: 8, base: -2, media: 2 },
        set: { honest_rep: true, peacemaker: true },
        tone: 'good',
        result: `You name the war's real cost and its real stupidity, gently. A few people bristle; the old veterans in the front row nod, slow and grateful.`,
      },
      {
        label: 'Tuck them into the comforting myth',
        fx: { base: 8, media: 6, support: 2 },
        tone: 'slick',
        result:
          'You serve up glory, sacrifice, and a tidy little fairy tale. It soothes, it flatters, and it teaches absolutely nobody a single damn thing.',
      },
    ],
  },
  {
    id: 'p8_s_vote_irregularity',
    paths: ['ballot', 'vanguard'],
    phases: [3],
    weight: 6,
    art: 'newspaper',
    emoji: '🧮',
    title: 'The Irregular Count',
    body: `Whispers say one district coughed up suspiciously perfect numbers in your favor. Poke at it and you might find something nasty; ignore it and somebody less friendly finds it first.`,
    choices: [
      {
        label: 'Order an honest audit on yourself',
        fx: { support: 8, base: 2, heat: -4 },
        set: { honest_rep: true },
        tone: 'good',
        result: `You call for a microscope on your own win. If it's clean, you look fearless; if it's not, far better that you trip over it than your enemies do.`,
      },
      {
        label: 'Let the suspiciously perfect numbers ride',
        fx: { base: 4, heat: 10, support: -4 },
        scandal: { id: 'perfect_count', label: 'the district’s too-perfect tally', severity: 2 },
        tone: 'slick',
        result:
          'You decide not to squint too hard at good news. The number stands — and so does the great big question mark hovering over it.',
      },
    ],
  },
  {
    id: 'p8_s_ghost_advisor',
    paths: ['ballot', 'vanguard'],
    phases: [2, 3],
    weight: 6,
    art: 'scene',
    emoji: '🎙️',
    title: 'The Whispering Advisor',
    body: `A brilliant, stone-cold ruthless advisor has your ear and an unholy gift for the dark arts of power. They make you sharper, deadlier, and — week by greasy week — a little more like them.`,
    choices: [
      {
        label: 'Keep the snake close',
        fx: { influence: 10, base: 4, heat: 6 },
        set: { has_network: true },
        tone: 'slick',
        result:
          'You let the whisperer steer your hand. You win more, and you recognize the face in the mirror just a little bit less.',
      },
      {
        label: 'Send them packing while you still can',
        fx: { support: 6, influence: -4, base: 2 },
        set: { clean_streak: true },
        tone: 'good',
        result:
          'You boot the dark genius out the door before they finish reassembling you into something else. A harder road — but at least you walk it as yourself.',
      },
    ],
  },

  // ---------------- CRISES ----------------
  {
    id: 'p8_c_volcano',
    paths: ['ballot', 'vanguard'],
    phases: [1, 2, 3],
    weight: 8,
    crisis: true,
    art: 'crisis',
    emoji: '🌋',
    title: 'The Ashfall',
    body: `A volcano just buried the eastern farms in ash and grounded every flight in the country. The harvest is toast, the sky is the color of a dead TV, and the people need an actual plan by nightfall.`,
    choices: [
      {
        label: 'Mobilize a huge, visible relief effort',
        fx: { support: 12, funds: -10, base: 4 },
        tone: 'good',
        result:
          'You hurl the entire weight of the state at the ash. Expensive, competent, and exactly the kind of thing people remember at the ballot box.',
      },
      {
        label: 'Downplay it to protect the markets',
        roll: {
          stat: 'media',
          dc: 52,
          success: {
            fx: { media: 6, funds: 4 },
            text: 'You keep the panic bottled and the markets purring with some very careful framing. The ash settles before the story can.',
          },
          fail: {
            fx: { support: -12, heat: 8 },
            text: 'Your "everything is fine, folks" slams headfirst into grey skies on every single screen. Denial, caught on camera, becomes the whole scandal.',
          },
        },
        tone: 'slick',
      },
    ],
  },
  {
    id: 'p8_c_oil_spill',
    paths: ['ballot', 'vanguard'],
    phases: [2, 3],
    weight: 8,
    crisis: true,
    art: 'crisis',
    emoji: '🛢️',
    title: 'The Spill',
    body: `An offshore rig blew its guts out and a black tide is oozing toward the coast. The outfit that runs it happens to be a major backer of yours, and they would so very much appreciate you going easy on them.`,
    choices: [
      {
        label: 'Hammer the company; lead the cleanup',
        fx: { support: 12, funds: -6, heat: -2 },
        set: { honest_rep: true },
        tone: 'good',
        result:
          'You make the polluter pay through the nose and front the cleanup yourself. One backer is apoplectic; one coastline is eternally grateful.',
      },
      {
        label: 'Go soft on your buddy',
        fx: { funds: 8, heat: 10, support: -8 },
        set: { corrupt_streak: true },
        scandal: { id: 'spill_favor', label: 'the polluter you protected', severity: 3 },
        tone: 'slick',
        result:
          'You cushion the blow for your pals in oil. The slick crawls onto the beaches, and — give it time — so do the questions.',
      },
    ],
  },
  {
    id: 'p8_c_blackmail',
    paths: ['ballot', 'vanguard'],
    phases: [2, 3],
    weight: 8,
    crisis: true,
    art: 'crisis',
    emoji: '📑',
    title: 'The Blackmail',
    body: `A foreign service has something genuinely damning on you, and they'll quietly trade their silence for one tidy little betrayal of your country's interests. That clock ticking on the table? It's theirs, not yours.`,
    choices: [
      {
        label: 'Refuse; brace for the bomb to drop',
        roll: {
          stat: 'support',
          dc: 54,
          success: {
            fx: { support: 12, base: 8, heat: -6 },
            text: 'You call their bluff and beat them to the punch with a confession of your own. Owning it yourself rips the weapon clean out of their hands.',
          },
          fail: {
            fx: { support: -10, heat: 10 },
            text: 'They drop it anyway and it stings like hell. But you betrayed nothing — and somewhere down the line, that is going to matter more than the bruise.',
          },
        },
        set: { honest_rep: true },
        tone: 'bold',
      },
      {
        label: 'Pay their price in the dark',
        fx: { influence: 4, heat: 12, support: -6 },
        set: { compromised: true, foreign_friends: true },
        scandal: {
          id: 'blackmail_paid',
          label: 'the secret you sold to bury a secret',
          severity: 4,
        },
        tone: 'slick',
        result:
          'You make the quiet little betrayal and the file stays six feet under. You are safe now — and you also belong to them, body and soul.',
      },
    ],
  },
  {
    id: 'p8_c_poisoning',
    paths: ['ballot', 'vanguard'],
    phases: [1, 2, 3],
    weight: 8,
    crisis: true,
    art: 'crisis',
    emoji: '🥫',
    title: 'The Tainted Supply',
    body: `A staple food got contaminated and people are dropping sick all over the country. A full recall sparks shortages and stampeding panic; a quiet one risks a whole lot more vomiting.`,
    choices: [
      {
        label: 'Order an immediate, total recall',
        fx: { support: 12, funds: -8, base: 2 },
        set: { honest_rep: true },
        tone: 'good',
        result:
          'You yank every can off every shelf and explain exactly why on every channel. Empty shelves, sure — but full, rock-solid trust.',
      },
      {
        label: 'Recall it quietly to dodge the panic',
        roll: {
          stat: 'media',
          dc: 53,
          success: {
            fx: { media: 4, support: 4 },
            text: 'You pull off a discreet recall and the outbreak fizzles out without a stampede. Threaded the needle, just barely.',
          },
          fail: {
            fx: { support: -14, heat: 12 },
            text: 'The quiet recall crawls too slow and the sickness spreads. "They knew and kept their mouths shut" is the headline now, in seventy-point type.',
          },
        },
        scandal: { id: 'quiet_recall', label: 'the outbreak you kept quiet', severity: 2 },
        tone: 'slick',
      },
    ],
  },
  {
    id: 'p8_c_prison',
    paths: ['ballot', 'vanguard'],
    phases: [2, 3],
    weight: 8,
    crisis: true,
    art: 'crisis',
    emoji: '⛓️',
    title: 'The Prison Uprising',
    body: `Inmates have seized a wing and grabbed guards as hostages, broadcasting grievances about conditions that are, mortifyingly, completely true. The whole siege is playing out live on every channel.`,
    choices: [
      {
        label: 'Negotiate and fix the conditions',
        roll: {
          stat: 'support',
          dc: 52,
          success: {
            fx: { support: 12, base: 4, influence: 4 },
            text: 'You cop to the legitimate complaints and the hostages walk out alive. Turns out fixing the actual rot is what ends the actual riot.',
          },
          fail: {
            fx: { support: -6, heat: 8 },
            text: 'Your concessions get spun as you bending over for a pack of criminals. Doing the decent thing earns you zero points and one hell of a long week.',
          },
        },
        set: { peacemaker: true },
        tone: 'good',
      },
      {
        label: 'Storm the wing',
        fx: { base: 8, heat: 12, support: -6 },
        inc: { purge_count: 1 },
        set: { bloody_hands: true },
        tone: 'bold',
        result:
          'You send the teams crashing in and the siege ends hard, fast, and bloody. The cameras catch every second of it, and so, forever, does history.',
      },
    ],
  },
];
