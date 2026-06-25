import type { GameEvent } from '../engine/types';

/**
 * Content pack 6 — sixth volume expansion. War votes, faith leaders, and
 * spoiler candidates (ballot); spy rings, re-education, and succession plots
 * (vanguard); international prizes and dying rivals (shared); and five new
 * crises (drought, coup attempt, hostage crisis, flood, pandemic wave).
 * Fictional and non-partisan by construction.
 */
export const PACK_6: GameEvent[] = [
  // ---------------- BALLOT ----------------
  {
    id: 'p6_b_war_vote',
    paths: ['ballot'],
    phases: [2, 3],
    weight: 8,
    art: 'bulletin',
    emoji: '⚔️',
    title: 'The Strike Authorization',
    body: `Your spooks have squat for intel and the war drums are deafening: you can green-light a strike that looks decisive as hell, or sit on your hands and let every rival in Velmora scream that you've got no spine.`,
    choices: [
      {
        label: 'Hold back; demand better intelligence',
        roll: {
          stat: 'support',
          dc: 52,
          success: {
            fx: { support: 12, influence: 6, base: -2 },
            text: 'You refuse to get stampeded into a slaughter, the intel turns out to be utter horseshit, and your cold feet age into something that looks suspiciously like wisdom.',
          },
          fail: {
            fx: { support: -8, base: -4 },
            text: 'Caution reads as dithering and your rivals gorge themselves on it. Turns out being right slowly is its own special kind of punishment.',
          },
        },
        set: { peacemaker: true },
        tone: 'good',
      },
      {
        label: 'Order the strike',
        fx: { base: 10, media: 6, heat: 10, support: -2 },
        tone: 'bold',
        result:
          'You give the order and the flags come out before the smoke does. Whether history calls you decisive or a reckless prick depends entirely on what crawls out of the rubble.',
      },
    ],
  },
  {
    id: 'p6_b_faith_leader',
    paths: ['ballot'],
    phases: [1, 2],
    weight: 7,
    art: 'scene',
    emoji: '⛪',
    title: 'The Pulpit’s Price',
    body: `A robed bigshot who can deliver a flock the size of a small province will bless your campaign — provided you parrot his angry stance on some divisive moral squabble from the stage, with a straight face and zero shame.`,
    choices: [
      {
        label: 'Court the congregation',
        fx: { support: 10, base: 6, media: -2 },
        set: { owes_pulpit: true },
        tone: 'slick',
        result:
          'The pews become your precincts and the collection plate becomes your war chest. You also just rented out a chunk of your platform to a man you can never, ever evict.',
      },
      {
        label: 'Keep faith and state at a respectful distance',
        fx: { support: -2, base: 4, influence: 4 },
        set: { honest_rep: true },
        tone: 'good',
        result:
          'You thank him kindly and tell him to shove the bargain. Principle costs you an entire voting bloc and buys you the rare luxury of a clean conscience.',
      },
    ],
  },
  {
    id: 'p6_b_jobs_report',
    paths: ['ballot'],
    phases: [2, 3],
    weight: 7,
    art: 'newspaper',
    emoji: '📊',
    title: 'The Ugly Jobs Report',
    body: `The new numbers are a dumpster fire and they land the same morning you're supposed to give the speech of your life. You can spin like a lunatic, or do the unthinkable and just tell people the month was rough.`,
    choices: [
      {
        label: 'Level with the public',
        fx: { support: 8, base: 4, media: 2 },
        set: { honest_rep: true },
        tone: 'good',
        result:
          'You name the ugly number and lay out your plan to fix it. Treating voters like grown adults instead of toddlers turns out to be a shockingly rare and effective trick.',
      },
      {
        label: 'Spin it furiously',
        roll: {
          stat: 'media',
          dc: 52,
          success: {
            fx: { media: 6, support: 4 },
            text: "You dig up the one sub-figure that doesn't suck and ride it like a rented mule. The framing holds for one news cycle, which is precisely as long as you needed.",
          },
          fail: {
            fx: { support: -8, heat: 4 },
            text: 'The spin is so blatant it becomes the story. "Out of touch" sticks to you like dog crap on a hot sidewalk.',
          },
        },
        tone: 'slick',
      },
    ],
  },
  {
    id: 'p6_b_third_party',
    paths: ['ballot'],
    phases: [3],
    weight: 8,
    art: 'rival',
    emoji: '🎯',
    title: 'The Spoiler',
    body: `A glib third candidate is hoovering up exactly the voters you need to win, and the smug bastard knows it. They'll bow out of the race — but only for a promise you'll absolutely hate keeping.`,
    choices: [
      {
        label: 'Cut the deal to clear the field',
        fx: { support: 10, influence: -4, heat: 4 },
        set: { dealmaker: true },
        tone: 'slick',
        result:
          'They drop out and endorse you, with a greasy little wink toward the cabinet post you sort of implied. The math gets prettier; the IOU starts gathering interest.',
      },
      {
        label: 'Beat them honestly at the ballot box',
        roll: {
          stat: 'base',
          dc: 53,
          success: {
            fx: { base: 10, support: 8 },
            text: 'You out-hustle the spoiler and steal every last one of their voters fair and square. No debt, no strings, no greasy handshake — just raw turnout.',
          },
          fail: {
            fx: { support: -8 },
            text: 'They dig in and bleed you dry right to the finish line. The spoiler spoils, and your pride pays the tab in lost margin.',
          },
        },
        tone: 'bold',
      },
    ],
  },
  {
    id: 'p6_b_immigration',
    paths: ['ballot'],
    phases: [2, 3],
    weight: 7,
    art: 'bulletin',
    emoji: '🛂',
    title: 'The Border Bill',
    body: `A bloated compromise on who gets into Velmora sits on the table — decent in spots, brutal in others, and despised by the screaming purists on both flanks. You can actually govern, or you can grandstand like everyone else.`,
    choices: [
      {
        label: 'Pass the messy compromise',
        fx: { influence: 8, support: 6, base: -6 },
        set: { dealmaker: true },
        tone: 'good',
        result:
          'You hold your nose and ram through something that actually exists. Both flanks howl bloody murder, which is usually the exact sound a real compromise makes.',
      },
      {
        label: 'Hold out for your wing’s pure version',
        fx: { base: 10, support: -4, heat: 4 },
        tone: 'bold',
        result:
          "You refuse to deal and keep the whole mess on a respirator for the next campaign. Nothing passes, nobody's helped, but goddamn does that talking point thrive.",
      },
    ],
  },
  {
    id: 'p6_b_debate_leak',
    paths: ['ballot'],
    phases: [2, 3],
    weight: 6,
    art: 'rival',
    emoji: '📨',
    title: 'The Leaked Questions',
    speaker: (S) => ({ name: S.opp, role: 'your rival', avatar: S.oppAvatar }),
    body: (S) =>
      `A sympathetic insider slips you the debate questions in advance — a chance to bury ${S.opp} with "spontaneous" brilliance. It is also, unmistakably, cheating.`,
    choices: [
      {
        label: 'Refuse and report the leak',
        fx: { support: 8, base: 4, heat: -4 },
        set: { honest_rep: true, clean_streak: true },
        tone: 'good',
        result:
          'You hand the questions back and flag the breach like a Boy Scout. Integrity that not one living soul will ever witness is still, technically, integrity.',
      },
      {
        label: 'Study them quietly',
        fx: { media: 8, support: 4, heat: 8 },
        scandal: { id: 'debate_leak', label: 'the debate questions you were slipped', severity: 2 },
        tone: 'slick',
        result:
          'You stroll onto that stage armored to the teeth with foreknowledge and dazzle the rubes. Somewhere out there, a copy of that envelope is still breathing.',
      },
    ],
  },
  {
    id: 'p6_b_megadonor',
    paths: ['ballot'],
    phases: [1, 2, 3],
    weight: 7,
    art: 'scene',
    emoji: '💎',
    title: 'The Megadonor’s Wish',
    body: `One obscenely rich backer offers to fund your entire circus — in exchange for a quiet little veto over the one policy area he happens to froth at the mouth about.`,
    choices: [
      {
        label: 'Take the money, grant the veto',
        fx: { funds: 16, media: 4, heat: 8 },
        set: { corrupt_streak: true, owes_donor: true },
        tone: 'slick',
        result:
          'The coffers overflow till they puke. One small policy room now belongs to somebody else to redecorate however he damn well pleases.',
      },
      {
        label: 'Decline and keep your hands free',
        fx: { base: 6, support: 4, funds: -4 },
        set: { clean_streak: true },
        tone: 'good',
        result:
          'You turn down the fortune and the leash stapled to it. Congratulations on your poorer, freer, much hungrier campaign.',
      },
    ],
  },

  // ---------------- VANGUARD ----------------
  {
    id: 'p6_v_birthday_festival',
    paths: ['vanguard'],
    phases: [2, 3],
    weight: 7,
    art: 'bulletin',
    emoji: '🎆',
    title: 'The Leader’s Birthday',
    body: `The wheezing old Leader's birthday demands a spectacle, and some idiot handed you the budget and the staging. Outdo last year's groveling adoration, or quietly cheap out and risk a slight he will remember on his deathbed.`,
    choices: [
      {
        label: 'Stage the most lavish festival yet',
        fx: { influence: 8, base: 6, funds: -8, heat: 4 },
        set: { climber_rep: true },
        tone: 'slick',
        result:
          'Fireworks, weeping choirs, and a forty-foot portrait of his liver-spotted mug. The Leader is delighted, the treasury is gutted, and your stock shoots straight up.',
      },
      {
        label: 'A dignified, modest commemoration',
        fx: { support: 8, base: -2, funds: 2 },
        tone: 'good',
        result:
          'You honor the old goat without bankrupting an entire province. Some read the restraint as classy respect; others read it as a knife being slowly unsheathed.',
      },
    ],
  },
  {
    id: 'p6_v_spy_ring',
    paths: ['vanguard'],
    phases: [2, 3],
    weight: 7,
    art: 'crisis',
    emoji: '🕵️',
    title: 'The Spy Ring',
    body: `Your counter-spooks have rolled up a foreign spy ring, and the interrogations are coughing up names — some genuinely guilty, some just conveniently on your shitlist. The pile keeps growing on your desk.`,
    choices: [
      {
        label: 'Pursue only the genuinely guilty',
        roll: {
          stat: 'influence',
          dc: 54,
          success: {
            fx: { influence: 8, support: 6, heat: -2 },
            text: 'You demand actual evidence instead of convenient grudges and bag the real ring. Precision earns you a rare, deeply suspicious nod of respect.',
          },
          fail: {
            fx: { heat: 10, support: -4 },
            text: 'Your restraint gets read as going soft on traitors. The hardliners start circling your "lenience" like buzzards over roadkill.',
          },
        },
        set: { honest_rep: true },
        tone: 'good',
      },
      {
        label: 'Cast the net wide; settle old scores',
        fx: { base: 10, influence: 6, support: -8 },
        inc: { purge_count: 2 },
        set: { bloody_hands: true },
        tone: 'bold',
        result:
          'You stuff a dozen personal enemies into the "ring" like sausage casing. The Centre is thrilled to bits; the truth is now officially whatever the files say it is.',
      },
    ],
  },
  {
    id: 'p6_v_succession_plot',
    paths: ['vanguard'],
    phases: [3],
    weight: 9,
    art: 'rival',
    emoji: '🗡️',
    title: 'The Plot',
    speaker: (S) => ({ name: S.opp, role: 'a fellow conspirator', avatar: S.oppAvatar }),
    body: (S) =>
      `A cabal — ${S.opp} among them — quietly proposes to ease the failing leader aside. Join and you risk everything; refuse and you may be the loose end they tidy up.`,
    choices: [
      {
        label: 'Join the plot',
        fx: { influence: 10, base: 6, heat: 12 },
        set: { has_network: true, plotter: true },
        npcFx: { id: 'antagonist', relationship: 12 },
        tone: 'bold',
        result:
          "You clasp the conspirators' clammy hands. You are now chained to a pack of people who have proudly demonstrated they will gut a leader in his sleep.",
      },
      {
        label: 'Betray the plot to the leader',
        fx: { influence: 8, base: 8, support: -6, heat: 6 },
        inc: { purge_count: 1 },
        set: { bloody_hands: true },
        npcFx: { id: 'antagonist', relationship: -20 },
        tone: 'slick',
        result:
          "You snitch, and the plotters evaporate overnight. The Leader's gratitude is genuine and warm — and so is the fresh new list of ghosts now haunting your hallway.",
      },
    ],
  },
  {
    id: 'p6_v_re_education',
    paths: ['vanguard'],
    phases: [1, 2],
    weight: 7,
    art: 'bulletin',
    emoji: '🏫',
    title: 'The Re-education Plan',
    body: `A proposal slithers onto your desk to supersize the "re-education" camps in your region — fatter quotas, a broader buffet of who counts as "unreliable." One signature from you and the whole grim machine starts grinding.`,
    choices: [
      {
        label: 'Sign and expand the program',
        fx: { base: 10, influence: 6, support: -10, heat: 8 },
        inc: { purge_count: 2 },
        set: { bloody_hands: true, tyrant_rep: true },
        tone: 'bold',
        result:
          'You sign, and the categories of the doomed bloat by a single stroke of your pen. The Centre lovingly notes how very reliable you are.',
      },
      {
        label: 'Stall it in endless review',
        roll: {
          stat: 'influence',
          dc: 53,
          success: {
            fx: { support: 8, influence: 4, heat: 2 },
            text: 'You drown the plan in committees and breathless "concerns about logistics." It never quite moves an inch. Sabotage by paperwork, you beautiful bureaucratic bastard.',
          },
          fail: {
            fx: { heat: 10, support: -4 },
            text: 'Your foot-dragging gets clocked and resented. Somebody upstairs makes a quiet note about your enthusiasm, or the suspicious lack thereof.',
          },
        },
        set: { secret_reformer: true },
        tone: 'slick',
      },
    ],
  },
  {
    id: 'p6_v_requisition',
    paths: ['vanguard'],
    phases: [1, 2],
    weight: 7,
    art: 'crisis',
    emoji: '🌾',
    title: 'The Grain Requisition',
    body: `The Centre demands a grain quota your farmers can't hit without starving themselves stupid. The order is to rip it out of their hands anyway. The order conveniently forgets to mention the winter coming.`,
    choices: [
      {
        label: 'Seize the full quota',
        fx: { influence: 8, base: 4, support: -10, heat: 6 },
        set: { bloody_hands: true },
        tone: 'bold',
        result:
          'You scrape the granaries down to the bare splintered boards. The Centre is satisfied; the villages will remember exactly whose name to curse when the cold sets in.',
      },
      {
        label: 'Quietly under-report and leave seed grain',
        roll: {
          stat: 'influence',
          dc: 52,
          success: {
            fx: { support: 12, base: 4, influence: -2 },
            text: 'You cook the books to leave the farmers just enough to limp through. A dangerous little mercy, buried under three layers of creative accounting.',
          },
          fail: {
            fx: { heat: 12, support: -4 },
            text: "An inspector finds the gap between your books and your barns. That discrepancy now has your signature all over it, in ink that won't wash off.",
          },
        },
        set: { secret_reformer: true },
        tone: 'good',
      },
    ],
  },
  {
    id: 'p6_v_general',
    paths: ['vanguard'],
    phases: [2, 3],
    weight: 8,
    art: 'rival',
    emoji: '🎖️',
    title: 'The General’s Offer',
    speaker: (S) => ({ name: S.opp, role: 'an army commander', avatar: S.oppAvatar }),
    body: (S) =>
      `${S.opp}, who commands real soldiers, offers you his loyalty — or, between the lines, something more drastic against the Centre if you would only nod.`,
    choices: [
      {
        label: 'Accept his loyalty, refuse the coup',
        fx: { influence: 10, base: 6, heat: 4 },
        set: { has_network: true },
        npcFx: { id: 'antagonist', relationship: 16 },
        tone: 'slick',
        result:
          'You take the friendship and politely decline the treason. A general who owes you is worth a hell of a lot more breathing than he is mutinous and dead.',
      },
      {
        label: 'Report his disloyal hint upward',
        fx: { base: 8, influence: 6, heat: 6 },
        inc: { purge_count: 1 },
        npcFx: { id: 'antagonist', relationship: -18 },
        tone: 'bold',
        result:
          'You rat the general out before he can rat first. The Centre showers you in praise; the entire officer corps quietly clocks that you bite.',
      },
    ],
  },
  {
    id: 'p6_v_poet',
    paths: ['vanguard'],
    phases: [2, 3],
    weight: 7,
    art: 'scene',
    emoji: '🖋️',
    title: 'The Dissident Poet',
    body: `A beloved scribbler has cranked out verses the censors call treason and the people call gospel. Exile, prison, or a quiet pardon — what happens to this smartass is entirely your call.`,
    choices: [
      {
        label: 'Arrange a quiet exile abroad',
        fx: { support: 8, base: -2, heat: 6 },
        set: { secret_reformer: true },
        tone: 'good',
        result:
          'You shove the poet onto a train to some softer, cushier country. They live, they keep scribbling, and they never forget who quietly opened the door.',
      },
      {
        label: 'Make a harsh example',
        fx: { base: 10, influence: 4, support: -10 },
        inc: { purge_count: 1 },
        set: { bloody_hands: true, zealot_rep: true },
        tone: 'bold',
        result:
          'You toss the poet in a cell and the verses spread twice as fast out of pure spite. Turns out martyrs, the bastards, rhyme so much better.',
      },
    ],
  },

  // ---------------- SHARED ----------------
  {
    id: 'p6_s_intl_prize',
    paths: ['ballot', 'vanguard'],
    phases: [3],
    weight: 7,
    art: 'newspaper',
    emoji: '🏆',
    title: 'The International Prize',
    body: `A stuffy foreign committee wants to drape a peace prize around your neck for a deal you cut. Accepting strokes your ego raw; it also hands every rival back home a shiny "globalist" club to beat you with.`,
    choices: [
      {
        label: 'Accept it proudly abroad',
        fx: { media: 10, influence: 6, base: -4 },
        tone: 'slick',
        result:
          "You give a gracious, dewy-eyed speech in some far-off marble hall. The medal gleams; the folks back home start grumbling that they can't find your passport on a map.",
      },
      {
        label: 'Decline graciously, stay home',
        fx: { base: 8, support: 4 },
        set: { honest_rep: true },
        tone: 'good',
        result:
          'You turn it down with a humble little smile, citing all that important work left undone. Modesty plays a hell of a lot better in the provinces than any foreign trinket.',
      },
    ],
  },
  {
    id: 'p6_s_age_question',
    paths: ['ballot', 'vanguard'],
    phases: [2, 3],
    weight: 6,
    art: 'scene',
    emoji: '⏳',
    title: 'The Question of Age',
    body: `The whispers about whether you've still got the juice have curdled into open chatter. A grueling public test of vigor could shut every mouth — or, if you so much as wobble, confirm every nasty rumor on live television.`,
    choices: [
      {
        label: 'Stage a feat of energy and stamina',
        roll: {
          stat: 'base',
          dc: 52,
          success: {
            fx: { base: 8, media: 8, support: 6 },
            text: 'You smoke aides half your age in front of every camera in the room. The age question keels over and dies of pure embarrassment.',
          },
          fail: {
            fx: { support: -8, media: -4 },
            text: "You gas out on live TV and white-knuckle a railing like it's a life raft. The clip gets a cruel caption and loops for a solid, miserable week.",
          },
        },
        tone: 'bold',
      },
      {
        label: 'Reframe age as experience',
        fx: { influence: 6, support: 4 },
        tone: 'good',
        result:
          "You lean into the grey hair like it's a feature and not a flashing warning light. Wisdom is a slower sell, but the damn thing doesn't throw out its hip.",
      },
    ],
  },
  {
    id: 'p6_s_loyal_aide',
    paths: ['ballot', 'vanguard'],
    phases: [1, 2, 3],
    weight: 6,
    art: 'scene',
    emoji: '🤲',
    title: 'The Aide’s Plea',
    body: `Your most loyal aide — the poor bastard who's bled for you for years — quietly begs you to bend one rule to save their drowning sibling. They have never once asked you for a single goddamn thing.`,
    choices: [
      {
        label: 'Bend the rule, quietly',
        fx: { base: 6, heat: 8, support: -2 },
        set: { loyal_to_old_friends: true, corrupt_streak: true },
        tone: 'good',
        result:
          'You make the call you absolutely should not make, for the one person on earth who earned it. Loyalty comes with a price tag and you swipe the card without blinking.',
      },
      {
        label: 'Refuse, and explain why',
        fx: { influence: 4, base: -4, support: 4 },
        set: { clean_streak: true },
        tone: 'bold',
        result:
          "You say no to the one person who genuinely deserved a yes. Principle is never colder than the moment it costs you a friend who'd have died for you.",
      },
    ],
  },
  {
    id: 'p6_s_rival_dies',
    paths: ['ballot', 'vanguard'],
    phases: [2, 3],
    weight: 6,
    art: 'rival',
    emoji: '🕯️',
    title: 'The Rival’s Funeral',
    speaker: (S) => ({ name: S.opp, role: 'your late adversary', avatar: S.oppAvatar }),
    body: (S) =>
      `${S.opp}, who fought you for years, has died suddenly. The nation watches to see whether you eulogize an enemy with grace or settle the score from the graveside.`,
    choices: [
      {
        label: 'Deliver a generous eulogy',
        fx: { support: 10, media: 6, base: 2 },
        npcFx: { id: 'antagonist', relationship: 20 },
        set: { honest_rep: true },
        tone: 'good',
        result:
          'You honor the brawl and the brawler both. Grace toward a dead rival is the single most terrifying flex a man can pull off at a funeral.',
      },
      {
        label: 'Damn them with faint praise',
        fx: { base: 4, heat: 6, support: -6 },
        tone: 'slick',
        result:
          'You squeeze out a few icy words and an even icier smirk. Being a petty little prick at a funeral is exactly the part everyone remembers forever.',
      },
    ],
  },
  {
    id: 'p6_s_data_leak',
    paths: ['ballot', 'vanguard'],
    phases: [2, 3],
    weight: 6,
    art: 'newspaper',
    emoji: '🔓',
    title: 'The Private Files',
    body: `Your private messages — unguarded, human, and occasionally damning as hell — got hacked and are dribbling out one juicy line at a time. Damage control now decides which version of you the public gets to meet.`,
    choices: [
      {
        label: 'Get ahead of it; release them yourself',
        roll: {
          stat: 'media',
          dc: 52,
          success: {
            fx: { media: 8, support: 6, heat: -4 },
            text: 'You dump the whole pile first and slap a "transparency" bow on it. Owning the story yanks every last fang out of the leak.',
          },
          fail: {
            fx: { support: -8, heat: 8 },
            text: 'Your "transparency" gambit just floodlights the worst lines you ever typed. You handed the vultures a ready-made highlight reel.',
          },
        },
        tone: 'bold',
      },
      {
        label: 'Deny, delay, and lawyer up',
        fx: { heat: 8, influence: 4, support: -4 },
        set: { stonewaller: true },
        tone: 'slick',
        result:
          'You scream "fake!" and run out the clock with a wall of lawyers. It half-works, and the doubt clings to you like cigarette smoke in a cheap motel.',
      },
    ],
  },
  {
    id: 'p6_s_protege_returns',
    paths: ['ballot', 'vanguard'],
    phases: [3],
    weight: 6,
    art: 'rival',
    emoji: '🐍',
    title: 'The Protégé’s Ambition',
    body: `The bright-eyed deputy you once mentored now eyeballs your chair right out in the open. They soaked up everything you taught them — including the bit about not waiting your damn turn.`,
    choices: [
      {
        label: 'Bring them closer; co-opt the threat',
        fx: { influence: 8, base: 4, heat: 4 },
        set: { has_network: true },
        tone: 'slick',
        result:
          'You promote the little shark into a gilded cage of crushing responsibility. Better an heir tangled up in your sightline than a rival lurking at your spine.',
      },
      {
        label: 'Clip their wings decisively',
        fx: { base: 8, influence: 4, support: -4, heat: 6 },
        tone: 'bold',
        result:
          'You sideline the upstart before they ever get to bloom. That lesson you taught them about ruthlessness? Yeah, they took it straight to heart.',
      },
    ],
  },

  // ---------------- CRISES ----------------
  {
    id: 'p6_c_drought',
    paths: ['ballot', 'vanguard'],
    phases: [1, 2, 3],
    weight: 8,
    crisis: true,
    art: 'crisis',
    emoji: '🏜️',
    title: 'The Long Drought',
    body: `The reservoirs are cracked mudflats and the crops are curling up brown and dead. You can ration the water fairly across Velmora, or quietly funnel it to the regions that vote — or grovel — the right way.`,
    choices: [
      {
        label: 'Ration fairly, everywhere',
        fx: { support: 12, base: 4, influence: -2 },
        set: { honest_rep: true },
        tone: 'good',
        result:
          "You spread the thirst around evenly and explain exactly why. Fairness when there's nothing left to share is the hardest, most grudgingly respected thing a leader can pull.",
      },
      {
        label: 'Steer the water toward your strongholds',
        fx: { base: 8, influence: 4, support: -8, heat: 6 },
        scandal: { id: 'water_favor', label: 'the water you steered to friends', severity: 2 },
        tone: 'slick',
        result:
          'Your loyal districts stay lush and green while the rest crack open like old leather. Handy as hell — and exactly the kind of map some prick prints in big bold ink later.',
      },
    ],
  },
  {
    id: 'p6_c_coup',
    paths: ['ballot', 'vanguard'],
    phases: [2, 3],
    weight: 9,
    crisis: true,
    art: 'crisis',
    emoji: '🪖',
    title: 'The Coup Attempt',
    body: `At dawn, units you sure as hell don't control grab the broadcast tower and the bridges. The next few hours decide whether you're a leader or a footnote. The cameras, somewhere out there, are still rolling.`,
    choices: [
      {
        label: 'Go to the people; rally the streets',
        roll: {
          stat: 'support',
          dc: 53,
          success: {
            fx: { support: 16, base: 10, influence: 6 },
            text: 'You wade into the crowds with no guards and they surge up around you like a tide. The coup dissolves into nothing against a screaming wall of human bodies.',
          },
          fail: {
            fx: { support: -10, heat: 12 },
            text: "You bet the whole game on the streets and the streets choke. Now the standoff balances on a knife edge you can't even see, let alone hold.",
          },
        },
        set: { peacemaker: true },
        tone: 'bold',
      },
      {
        label: 'Crush it with loyal force',
        fx: { base: 10, influence: 8, heat: 14, support: -4 },
        inc: { purge_count: 2 },
        set: { bloody_hands: true, tyrant_rep: true },
        tone: 'bold',
        result:
          'Your loyal units take the bridges back the hard, bloody way. You survive — harder, meaner, and dripping — and the purge that follows is brutally thorough.',
      },
    ],
  },
  {
    id: 'p6_c_hostage',
    paths: ['ballot', 'vanguard'],
    phases: [2, 3],
    weight: 8,
    crisis: true,
    art: 'crisis',
    emoji: '🔫',
    title: 'The Hostage Crisis',
    body: `Gunmen have grabbed a school full of kids and a building full of cameras. Their demands are batshit impossible, the clock is screaming, and every single option ends with somebody's name carved on it.`,
    choices: [
      {
        label: 'Negotiate patiently for the children',
        roll: {
          stat: 'support',
          dc: 54,
          success: {
            fx: { support: 14, influence: 6 },
            text: 'You keep the line open through hours of white-knuckle hell and every last kid walks out breathing. Patience, just this once, dragged them home alive.',
          },
          fail: {
            fx: { support: -8, heat: 8 },
            text: 'The talks fall apart and the ending is partial and gut-wrenching. You will replay every single hour of it in your skull for years.',
          },
        },
        tone: 'good',
      },
      {
        label: 'Order an immediate assault',
        fx: { base: 8, heat: 12, support: -4 },
        tone: 'bold',
        result:
          'You send the teams crashing in fast and hard. It ends in minutes, decisively, and the cost of those minutes is yours and yours alone to lug around forever.',
      },
    ],
  },
  {
    id: 'p6_c_flood',
    paths: ['ballot', 'vanguard'],
    phases: [1, 2, 3],
    weight: 8,
    crisis: true,
    art: 'crisis',
    emoji: '🌧️',
    title: 'The Great Flood',
    body: `The river jumped its banks and swallowed half a province whole. To save the cities downstream, the engineers can blow a levee — and deliberately drown a hundred farms upstream like rats in a barrel.`,
    choices: [
      {
        label: 'Breach the levee; sacrifice the farms',
        roll: {
          stat: 'influence',
          dc: 52,
          success: {
            fx: { influence: 8, support: 6, funds: -6 },
            text: 'You make the brutal call and the cities hold. You also pay the drowned-out farmers fast and fat, which is the only thing that keeps the whole thing from burying you.',
          },
          fail: {
            fx: { support: -10, heat: 8 },
            text: 'You drown the farms and the cities flood anyway. The absolute worst of both choices, served with a heaping side of all the blame.',
          },
        },
        tone: 'bold',
      },
      {
        label: 'Refuse; fight to save everyone',
        fx: { support: 8, funds: -10, heat: 6 },
        tone: 'good',
        result:
          "You throw everything you've got at saving both and pray to nobody in particular that the sandbags hold. A gamble of pure conscience, paid in sweat and a gutted treasury.",
      },
    ],
  },
  {
    id: 'p6_c_pandemic_wave',
    paths: ['ballot', 'vanguard'],
    phases: [2, 3],
    weight: 8,
    crisis: true,
    art: 'crisis',
    emoji: '💉',
    title: 'The Second Wave',
    body: `The plague is back and there's a vaccine, but there's only enough for some. Who gets it first — the vulnerable, the essential, or the brown-nosing loyalists — is a decision history will read with a magnifying glass.`,
    choices: [
      {
        label: 'Prioritize the vulnerable and essential',
        fx: { support: 12, base: 4, influence: 4 },
        set: { honest_rep: true },
        tone: 'good',
        result:
          'You hand the first doses to the old, the sick, and the poor souls who care for them. The fairness is quiet, expensive, and dead right.',
      },
      {
        label: 'Reward the loyal and the useful first',
        fx: { base: 8, influence: 6, support: -8, heat: 6 },
        scandal: { id: 'vaccine_favor', label: 'the doses you handed to loyalists', severity: 2 },
        tone: 'slick',
        result:
          'The well-connected roll up their sleeves first while everyone else sweats it out. A list exists of who got dosed early, and lists like that always, always surface.',
      },
    ],
  },
];
