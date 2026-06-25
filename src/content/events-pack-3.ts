import type { GameEvent } from '../engine/types';

/**
 * Content pack 3 — third volume expansion toward a commercial-size bank, tilted
 * toward early-game depth (the thinnest cells were phase 1, especially on the
 * vanguard path) plus phase-3 capstone dilemmas and two new crises. Choices set
 * flags the ending logic actually reads (secret_reformer, bloody_hands,
 * corrupt_streak, cult_building, has_network, purge_count) so they carry
 * downstream weight. Two delayed then-chains (the machine's favor; the reform
 * circle exposed). Fictional and non-partisan by construction.
 */
export const PACK_3: GameEvent[] = [
  // ---------------- BALLOT ----------------
  {
    id: 'p3_b_first_rally',
    paths: ['ballot'],
    phases: [1, 2],
    weight: 9,
    art: 'scene',
    emoji: '📢',
    title: 'Your First Big Rally',
    body: `The hall is half-empty an hour before doors and your gut is screaming that you're a fraud. Then a trickle of warm bodies, then a flood of them. The microphone sits there like a loaded dare.`,
    choices: [
      {
        label: 'Swing for a balls-out barn-burner of a speech',
        roll: {
          stat: 'media',
          dc: 48,
          success: {
            fx: { media: 10, support: 8, base: 6 },
            text: 'You catch a rhythm and the room loses its damn mind. The clip of the crowd screaming raises money for a solid week while you sleep.',
          },
          fail: {
            fx: { support: -4, base: -2 },
            text: 'You overreach, fumble the thread, and earn the limp golf-clap of polite pity. You will rewrite this speech in your head until you die.',
          },
        },
        tone: 'bold',
      },
      {
        label: 'Keep it warm, simple, and human',
        fx: { support: 6, base: 4 },
        set: { honest_rep: true },
        tone: 'good',
        result:
          'You ditch the pyrotechnics and just talk to them like people. It does not go viral, but every poor bastard in that room walks out believing you.',
      },
    ],
  },
  {
    id: 'p3_b_local_machine',
    paths: ['ballot'],
    phases: [1],
    weight: 8,
    art: 'rival',
    emoji: '🎩',
    title: 'The Local Machine',
    body: `A ward boss wearing a gold ring on every greasy finger offers you turnout no volunteer army could dream of — a wall of votes, gift-wrapped. Nothing in this fat bastard's math is ever free.`,
    choices: [
      {
        label: 'Take the machine’s turnout',
        fx: { support: 12, base: 6, heat: 8 },
        set: { owes_boss: true, corrupt_streak: true },
        then: [{ id: 'p3_b_machine_due', inTurns: 3 }],
        tone: 'slick',
        result:
          'The numbers land like clockwork. So, eventually, will the boss — clutching a list of exactly what your soul costs.',
      },
      {
        label: 'Build your own ground game',
        fx: { base: 10, support: 2, funds: -4 },
        set: { clean_streak: true },
        tone: 'good',
        result:
          'You do it the slow, miserable way — clipboards, damp church basements, feet screaming in your shoes. It is yours, and no greasy bastard can ever repossess it.',
      },
    ],
  },
  {
    id: 'p3_b_machine_due',
    paths: ['ballot'],
    phases: [1, 2, 3],
    weight: 6,
    queueOnly: true,
    art: 'rival',
    emoji: '🧾',
    title: 'The Boss Collects',
    body: `The ward boss who handed you a wall of votes is parked in your doorway, smiling like a shark, waving a contract he would dearly love you to bless with your virgin signature.`,
    choices: [
      {
        label: 'Sign the sweetheart deal',
        fx: { funds: 6, base: 4, heat: 12 },
        set: { corrupt_streak: true },
        scandal: { id: 'machine_contract', label: 'the boss’s no-bid contract', severity: 2 },
        tone: 'slick',
        result:
          'You bless the filthy thing. The boss is purring, and you are now a permanent entry in his little ledger of owned men.',
      },
      {
        label: 'Refuse and burn the bridge',
        fx: { base: -8, support: 6, heat: -4 },
        set: { defied_boss: true },
        tone: 'bold',
        result:
          'You tell the prick no. He gathers up his machine and his grudge and waddles home. Rest assured, both come back hungrier.',
      },
    ],
  },
  {
    id: 'p3_b_door_knock',
    paths: ['ballot'],
    phases: [1, 2],
    weight: 7,
    art: 'scene',
    emoji: '🚪',
    title: 'The Grind',
    body: `It's freezing, it's pissing rain, and there are four hundred more doors. Your staff gently suggests you could just park your ass on a call-time block and beg rich people for money instead.`,
    choices: [
      {
        label: 'Knock every door yourself',
        fx: { base: 10, support: 6, funds: -2 },
        set: { grassroots: true, clean_streak: true },
        tone: 'good',
        result:
          'You shake frozen hands until your own go dead and useless. The local rag runs a photo titled, simply, "Showed Up," and that one word does more than any ad.',
      },
      {
        label: 'Spend the day dialing donors',
        fx: { funds: 12, base: -4 },
        tone: 'slick',
        result:
          'You shake down a tidy pile of cash from a warm leather chair. The doors stay unknocked, and somebody out there clocks exactly which one you picked.',
      },
    ],
  },
  {
    id: 'p3_b_convention',
    paths: ['ballot'],
    phases: [3],
    weight: 12,
    art: 'newspaper',
    emoji: '🎉',
    title: 'The Convention Speech',
    body: `Tens of thousands packed in the hall, tens of millions slumped on couches at home, and a teleprompter holding the most important words of your sorry life. This is the moment that becomes the montage.`,
    choices: [
      {
        label: 'Reach for history — go big',
        roll: {
          stat: 'media',
          dc: 55,
          success: {
            fx: { media: 14, support: 12, base: 6 },
            text: 'You deliver the speech of a goddamn generation. Hardened strategists openly weep into their lanyards. The bounce is obscene.',
          },
          fail: {
            fx: { media: -6, support: -6, heat: 4 },
            text: 'You aim for the rafters and clip a wing on the way up. The pundits call it "ambitious," which is the noise critics make when something faceplants.',
          },
        },
        tone: 'bold',
      },
      {
        label: 'Give the safe, unifying address',
        fx: { support: 8, media: 6, base: 2 },
        tone: 'good',
        result:
          'You hit every mark and offend not one living soul. Solid, presidential, and so forgettable it dissolves before the balloons hit the floor — exactly as designed.',
      },
    ],
  },
  {
    id: 'p3_b_october_surprise',
    paths: ['ballot'],
    phases: [2, 3],
    weight: 8,
    art: 'rival',
    emoji: '🃏',
    title: 'The October Surprise',
    speaker: (S) => ({ name: S.opp, role: 'your rival', avatar: S.oppAvatar }),
    body: (S) =>
      `Days before the vote, ${S.opp}’s camp drops a damaging story about you — timed for maximum damage and minimum time to respond. The clock is a weapon now.`,
    choices: [
      {
        label: 'Hit back hard and immediately',
        roll: {
          stat: 'media',
          dc: 53,
          success: {
            fx: { media: 8, support: 8, heat: 4 },
            text: 'You flood every screen with your own version before theirs can dry. The big surprise fizzles out on the launch pad like a wet firework.',
          },
          fail: {
            fx: { support: -10, heat: 8 },
            text: 'Your frantic scramble reads as panic, which reads as guilt. The story sprouts legs, then wheels, then a full marching band.',
          },
        },
        npcFx: { id: 'antagonist', relationship: -12 },
        tone: 'bold',
      },
      {
        label: 'Stay calm and let allies carry the rebuttal',
        fx: { support: 2, base: 2, media: -2 },
        tone: 'good',
        result:
          'You keep your dignity and let the surrogates roll around in the mud for you. Slower, steadier, and your manicured hands stay spotless.',
      },
    ],
  },

  // ---------------- VANGUARD ----------------
  {
    id: 'p3_v_first_posting',
    paths: ['vanguard'],
    phases: [1],
    weight: 9,
    art: 'bulletin',
    emoji: '🗄️',
    title: 'Your First Posting',
    body: `A grey ministry, a grey desk, and a teetering stack of files that quietly decide whether strangers get to keep breathing. The clerk giving you the tour mentions, very casually, exactly who snitches on whom.`,
    choices: [
      {
        label: 'Master the paperwork; become indispensable',
        fx: { influence: 10, base: 4 },
        set: { has_network: true },
        tone: 'slick',
        result:
          'You learn which form moves which mountain and which one buries a man alive. Quietly, you become the bastard who knows where every body is filed.',
      },
      {
        label: 'Quietly protect the people in the files',
        fx: { support: 8, base: 4, heat: 4 },
        set: { honest_rep: true },
        tone: 'good',
        result:
          'You misplace the right paperwork and "lose" the documents that get people shot. Small mercies, and a small, growing chance you join them.',
      },
    ],
  },
  {
    id: 'p3_v_denunciation',
    paths: ['vanguard'],
    phases: [1, 2],
    weight: 9,
    art: 'bulletin',
    emoji: '📛',
    title: 'The Denunciation',
    body: `A colleague — competent, decent, and now mysteriously branded "unreliable" — is to be denounced at the section meeting. Every eye in the room is glued to whether your hand goes up.`,
    choices: [
      {
        label: 'Denounce them loudly',
        fx: { base: 8, influence: 6, support: -6, heat: 4 },
        inc: { purge_count: 1 },
        set: { bloody_hands: true },
        tone: 'bold',
        result:
          'You read the charges with a conviction you absolutely do not feel. Your colleague is gone by sunrise. The right people notice your enthusiasm.',
      },
      {
        label: 'Stay silent and study your shoes',
        fx: { heat: 6, base: -2 },
        tone: 'slick',
        result:
          'You neither accuse nor defend. Cowardice, it turns out, is the precise thing that keeps you breathing till the next meeting.',
      },
      {
        label: 'Quietly warn them the night before',
        req: (S) => S.stats.influence >= 12,
        reqText: 'Needs Standing 12+',
        fx: { support: 8, influence: -6, heat: 6 },
        set: { secret_reformer: true },
        tone: 'good',
        result:
          'One whispered word in a cold stairwell. They vanish before the meeting — fled, not dragged off. A debt is owed, and your own neck is now on the block.',
      },
    ],
  },
  {
    id: 'p3_v_study_circle',
    paths: ['vanguard'],
    phases: [1, 2],
    weight: 8,
    art: 'scene',
    emoji: '📚',
    title: 'The Study Circle',
    body: `In a back room reeking of cheap smoke and genuine danger, a few trusted souls read the forbidden books and dream up a kinder country. They want to know if you're one of them or a rat.`,
    choices: [
      {
        label: 'Join them — quietly believe',
        fx: { support: 8, base: 4, heat: 8 },
        set: { secret_reformer: true },
        then: [{ id: 'p3_v_circle_exposed', inTurns: 4 }],
        tone: 'good',
        result:
          'You pull up a chair and a colossal risk. For the first time in years, hope stops feeling like a loaded gun pointed at your own head.',
      },
      {
        label: 'Decline — too dangerous to dream',
        fx: { influence: 4, base: 2, heat: -4 },
        tone: 'slick',
        result:
          'You mumble an excuse and leave the books unopened. Some windows are a hell of a lot safer painted shut.',
      },
      {
        label: 'Report the circle to the organs',
        fx: { base: 10, influence: 6, support: -8 },
        inc: { purge_count: 1 },
        set: { bloody_hands: true, zealot_rep: true },
        tone: 'bold',
        result:
          'You cough up every name. The back room is scrubbed empty within the week, and your file earns a shiny gold star sitting in a permanent stain.',
      },
    ],
  },
  {
    id: 'p3_v_circle_exposed',
    paths: ['vanguard'],
    phases: [1, 2, 3],
    weight: 6,
    queueOnly: true,
    art: 'crisis',
    emoji: '🔦',
    title: 'The Circle Is Exposed',
    body: `The study circle has been sniffed out, and an investigator with patient, dead eyes is working the room one body at a time, asking who else showed up. Your name is one nervous answer away.`,
    choices: [
      {
        label: 'Deny everything, coldly',
        roll: {
          stat: 'influence',
          dc: 55,
          success: {
            fx: { influence: 6, base: 4, heat: -4 },
            text: 'You meet those patient dead eyes with colder ones and give the bastard exactly nothing. The thread crawls off in some other direction.',
          },
          fail: {
            fx: { heat: 16, support: -8 },
            text: 'Your denial comes one heartbeat too fast. The investigator jots something down, then underlines it twice, just for you.',
          },
        },
        tone: 'slick',
      },
      {
        label: 'Take the fall to shield the others',
        fx: { support: 12, influence: -10, heat: 10 },
        set: { secret_reformer: true, martyr_rep: true },
        tone: 'bold',
        result:
          'You eat the whole blame so the rest walk free. It guts you, body and career, and somewhere a handful of people will whisper your name for the rest of their lives.',
      },
    ],
  },
  {
    id: 'p3_v_zeal_audition',
    paths: ['vanguard'],
    phases: [1],
    weight: 8,
    art: 'bulletin',
    emoji: '🔥',
    title: 'Auditioning Your Zeal',
    body: `At the rally, the truest believers elbow each other to chant the loudest and pledge the most insane crap. Fervor is being weighed by the pound, and your volume is your entire résumé.`,
    choices: [
      {
        label: 'Out-zealot the zealots',
        fx: { base: 12, media: 4, support: -4, heat: 4 },
        set: { hardliner_cred: true },
        tone: 'bold',
        result:
          'You bellow the slogans louder than any frothing maniac in the square. The doctrinaire wing claims you as their own rabid son, for better and much worse.',
      },
      {
        label: 'Clap along, mean none of it',
        fx: { heat: 4, influence: 2 },
        tone: 'slick',
        result:
          'You flap your lips and save your throat. Faked fervor is cheaper than the real poison and reads exactly the same from the stage.',
      },
    ],
  },
  {
    id: 'p3_v_succession',
    paths: ['vanguard'],
    phases: [3],
    weight: 10,
    art: 'rival',
    emoji: '👑',
    title: 'The Succession Whisper',
    speaker: (S) => ({ name: S.opp, role: 'a rival heir', avatar: S.oppAvatar }),
    body: (S) =>
      `The old leader is failing, and the corridors hum with the only question that matters: who is next. ${S.opp} is maneuvering openly. The throne is close enough to touch.`,
    choices: [
      {
        label: 'Position yourself as the inevitable heir',
        fx: { influence: 12, base: 8, heat: 10 },
        set: { climber_rep: true },
        npcFx: { id: 'antagonist', relationship: -14 },
        tone: 'bold',
        result:
          'You let it be known, without ever stooping to say it, that the future has your face stapled to it. Your rival starts sharpening accordingly.',
      },
      {
        label: 'Build a coalition behind a compromise figure',
        fx: { influence: 8, support: 6, base: -2 },
        set: { has_network: true },
        tone: 'slick',
        result:
          'You play kingmaker instead of king. Power somebody owes you is sometimes a hell of a lot safer to hold than power with your fingerprints all over it.',
      },
    ],
  },
  {
    id: 'p3_v_cult_building',
    paths: ['vanguard'],
    phases: [2, 3],
    weight: 8,
    art: 'bulletin',
    emoji: '🖼️',
    title: 'The Portrait Committee',
    body: `An eager little bureau proposes plastering your face on every schoolroom wall, every morning broadcast, every kid's primer. The whole adoration machine is idling at the line, begging for the green light.`,
    choices: [
      {
        label: 'Let the cult bloom',
        fx: { base: 10, media: 8, support: 4, heat: 6 },
        set: { cult_building: true, own_cult: true },
        tone: 'bold',
        result:
          'Your mug multiplies overnight like a glorious rash. Being everywhere at once turns out to be a flavor of immortality and a flavor of prison cell.',
      },
      {
        label: 'Forbid it — "the Party, not the man"',
        fx: { support: 8, base: -2, heat: -4 },
        set: { ascetic_rep: true },
        tone: 'good',
        result:
          'You order your own giant face scraped off the walls. Modesty, performed at industrial scale, is its own sneaky little flex of power.',
      },
    ],
  },

  // ---------------- SHARED ----------------
  {
    id: 'p3_s_family_ask',
    paths: ['ballot', 'vanguard'],
    phases: [1, 2],
    weight: 7,
    art: 'scene',
    emoji: '👨‍👩‍👦',
    title: 'Blood and Office',
    body: `A relative wants a cushy posting they did absolutely nothing to earn. Family loyalty yanks one way; the stink of nepotism and your own paper-thin patience yank the other.`,
    choices: [
      {
        label: 'Find them a comfortable sinecure',
        fx: { base: 4, heat: 8, support: -4 },
        set: { nepotism: true, corrupt_streak: true },
        scandal: { id: 'family_sinecure', label: 'the relative on the payroll', severity: 1 },
        tone: 'slick',
        result:
          'You make the call. Blood is honored, and a future headline gets quietly written, notarized, and filed under "inevitable."',
      },
      {
        label: 'Tell them no, gently but firmly',
        fx: { base: -2, support: 6, influence: 2 },
        set: { clean_streak: true },
        tone: 'good',
        result:
          'You hold the line and choke down the arctic silence at the next family dinner. Principles, it turns out, cost the most at your own damn table.',
      },
    ],
  },
  {
    id: 'p3_s_idealism',
    paths: ['ballot', 'vanguard'],
    phases: [1, 2],
    weight: 7,
    art: 'scene',
    emoji: '🕯️',
    title: 'A Late Night of Conviction',
    body: `Past midnight, alone with a draft and a cold coffee, you can publish the gutless speech your handlers blessed — or the honest one that actually lives somewhere in your chest.`,
    choices: [
      {
        label: 'Publish the honest one',
        roll: {
          stat: 'support',
          dc: 50,
          success: {
            fx: { support: 12, base: 8 },
            text: 'You say the true thing plainly, and it lands square in the gut. People are starving for one bastard who actually means a word he says.',
          },
          fail: {
            fx: { support: -6, heat: 6 },
            text: 'You say the true thing and it gets clipped, gutted, and rammed back down your throat by lunch. Honesty is a coin flip with a knife on both sides.',
          },
        },
        set: { peacemaker: true },
        tone: 'bold',
      },
      {
        label: 'Run the safe, approved draft',
        fx: { media: 4, support: 2, base: -2 },
        tone: 'slick',
        result:
          'You file the version that survived a focus group with all its teeth pulled. It says nothing and risks nothing, which is the whole gutless point.',
      },
    ],
  },
  {
    id: 'p3_s_old_rival_truce',
    paths: ['ballot', 'vanguard'],
    phases: [2, 3],
    weight: 7,
    art: 'rival',
    emoji: '🤝',
    title: 'The Offered Truce',
    speaker: (S) => ({ name: S.opp, role: 'your old adversary', avatar: S.oppAvatar }),
    body: (S) =>
      `${S.opp}, who has fought you at every rung, requests a private meeting and — astonishingly — offers a truce. It could be sincere. It could be a trap with good manners.`,
    choices: [
      {
        label: 'Accept the truce in good faith',
        fx: { influence: 8, support: 6, base: -2 },
        npcFx: { id: 'antagonist', relationship: 18 },
        tone: 'good',
        result:
          'You shake the hand and actually mean it. The war cools off, and for one weird minute you both remember you used to be regular schmucks before all this.',
      },
      {
        label: 'Smile, agree, and prepare a knife',
        fx: { influence: 6, heat: 6, base: 2 },
        npcFx: { id: 'antagonist', relationship: -10 },
        set: { backstabber: true },
        tone: 'slick',
        result:
          'You toast the truce with one hand and keep the other one wrapped around a blade behind your back. Trust is a resource you flatly refuse to blow on this prick.',
      },
    ],
  },
  {
    id: 'p3_s_press_award',
    paths: ['ballot', 'vanguard'],
    phases: [2, 3],
    weight: 6,
    art: 'newspaper',
    emoji: '🏅',
    title: 'The Press Dinner',
    body: `The press association hands out its little gold trinkets over rubbery chicken and worse wine, and tradition demands the powerful stand up and roast their own asses. The room is wall-to-wall people who quote you for a living.`,
    choices: [
      {
        label: 'Be self-deprecating and charming',
        fx: { media: 10, support: 4 },
        set: { press_friendly: true },
        tone: 'good',
        result:
          'You stick every joke, including the brutal ones aimed at yourself. The columnists waddle home a few degrees fonder of you.',
      },
      {
        label: 'Settle scores from the podium',
        fx: { media: -6, base: 6, heat: 6 },
        tone: 'bold',
        result:
          'You grab the mic and start swinging at your critics. Your base eats it up with a spoon; every single bastard holding a pen writes the date down.',
      },
    ],
  },

  // ---------------- CRISES ----------------
  {
    id: 'p3_c_famine',
    paths: ['ballot', 'vanguard'],
    phases: [2, 3],
    weight: 10,
    crisis: true,
    art: 'crisis',
    emoji: '🌾',
    title: 'The Harvest Fails',
    body: `A dead harvest slams into an empty reserve, and hunger starts strolling the provinces like it owns them. Pride howls at you to project strength; cold arithmetic mutters that you'd better start begging.`,
    choices: [
      {
        label: 'Swallow your pride and request foreign aid',
        roll: {
          stat: 'support',
          dc: 50,
          success: {
            fx: { support: 12, funds: 6, base: -4 },
            text: 'The grain ships dock and the bread lines shrink. Admitting you needed help cost you a chunk of face and saved a staggering number of skinny bastards.',
          },
          fail: {
            fx: { support: -6, heat: 6 },
            text: 'The aid rolls in trailing cameras and conditions, and your rivals scream "surrender" from every rooftop. Full bellies, bruised ego, terrible optics.',
          },
        },
        tone: 'good',
      },
      {
        label: 'Hide the shortage, project abundance',
        fx: { media: 6, influence: 4, support: -8, heat: 10 },
        set: { potemkin: true },
        scandal: { id: 'hidden_famine', label: 'the famine you covered up', severity: 3 },
        tone: 'slick',
        result:
          'The newsreels overflow with golden loaves while the provinces quietly shrivel. A lie this fat does not stay buried — it claws its way back up eventually.',
      },
    ],
  },
  {
    id: 'p3_c_uprising',
    paths: ['ballot', 'vanguard'],
    phases: [2, 3],
    weight: 9,
    crisis: true,
    art: 'crisis',
    emoji: '✊',
    title: 'Unrest in the Streets',
    body: `The squares flood with furious crowds, and the order rolls up the chain to land on your desk: scatter them, or shut up and hear them out. The whole damn nation is watching which way you flinch.`,
    choices: [
      {
        label: 'Go down and listen to the crowd',
        roll: {
          stat: 'base',
          dc: 52,
          success: {
            fx: { support: 14, base: 8, heat: -4 },
            text: 'You walk into the square with no guards and actually listen. The sheer balls of it stuns everyone, and the rage melts into something you can work with.',
          },
          fail: {
            fx: { support: -6, heat: 8 },
            text: 'You try to listen and get screamed flat into the pavement. A leader drowned out by his own people is not a great look, optically speaking.',
          },
        },
        set: { peacemaker: true },
        tone: 'good',
      },
      {
        label: 'Order a hard crackdown',
        fx: { base: 6, heat: 16, support: -10 },
        inc: { purge_count: 1 },
        set: { bloody_hands: true, tyrant_rep: true },
        scandal: { id: 'crackdown', label: 'the night you cleared the square', severity: 3 },
        tone: 'bold',
        result:
          'The square is swept empty by dawn and quiet for a reason nobody dares say out loud. That quiet sends you the bill later, all at once, with interest.',
      },
    ],
  },
  {
    id: 'p3_c_scandal_eve',
    paths: ['ballot', 'vanguard'],
    phases: [2, 3],
    weight: 8,
    crisis: true,
    art: 'newspaper',
    emoji: '🗞️',
    title: 'The Story Lands at Midnight',
    body: `A reporter calls for comment on a story running in six hours — one with documents, names, and your grubby fingerprints faintly smudged all over it. There's just enough time to react, beautifully or like a panicking idiot.`,
    choices: [
      {
        label: 'Get ahead of it — confess the small to bury the large',
        roll: {
          stat: 'media',
          dc: 52,
          success: {
            fx: { media: 8, support: 6, heat: -6 },
            text: 'You toss them a cute little sin before they can print the monstrous one. The framing becomes yours, and the truly damning part stays in the dark.',
          },
          fail: {
            fx: { support: -10, heat: 10 },
            text: 'Your pre-emptive confession just screams that there is something to bury. The reporter adds one extra paragraph and a smug little grin.',
          },
        },
        tone: 'slick',
      },
      {
        label: 'Stonewall and lawyer up',
        fx: { heat: 8, influence: 4, support: -4 },
        set: { stonewaller: true },
        tone: 'bold',
        result:
          'You say absolutely nothing through a wall of pricey lawyers. The silence holds the line and quietly screams "guilty" to anyone with a pulse.',
      },
    ],
  },
];
