import type { GameEvent } from '../engine/types';

/**
 * Content pack 9 — ninth volume expansion; the one that carries the bank past
 * the 250-event target. Dynasties, concessions, and make-or-break primaries
 * (ballot); named successions, reversed purges, and the resistant old guard
 * (vanguard); legacy-building, term limits, and the temptation to walk away
 * (shared); and six new crises. Fictional and non-partisan by construction.
 */
export const PACK_9: GameEvent[] = [
  // ---------------- BALLOT ----------------
  {
    id: 'p9_b_dynasty',
    paths: ['ballot'],
    phases: [3],
    weight: 6,
    art: 'scene',
    emoji: '👨‍👧',
    title: 'The Dynasty Question',
    body: `Your shockingly capable kid wants to wade into politics on your coattails, riding your last name to a head start they did exactly jack to earn. Crown a little dynasty, or make the brat sweat for it like everyone else.`,
    choices: [
      {
        label: 'Roll out the red carpet for your spawn',
        fx: { influence: 8, base: 4, heat: 6, support: -4 },
        set: { nepotism: true },
        tone: 'slick',
        result:
          'You hand your heir a launchpad with the safety off. The name kicks every door open, and the word "dynasty" trails them around like the smell of money.',
      },
      {
        label: 'Make the little climber start in the gutter',
        fx: { support: 8, base: 2 },
        set: { honest_rep: true },
        tone: 'good',
        result:
          'You refuse to gift-wrap the climb. They hate your guts about it now and might, decades from now, mumble a grudging thanks.',
      },
    ],
  },
  {
    id: 'p9_b_concession',
    paths: ['ballot'],
    phases: [3],
    weight: 8,
    art: 'newspaper',
    emoji: '🤝',
    title: 'The Close Loss',
    body: `The count is in and you got beat — barely, agonizingly, but for real. You can eat the loss with a straight face and some grace, or scream "rigged" and pick the scab until it bleeds out forever.`,
    choices: [
      {
        label: 'Concede like a grown-up',
        fx: { support: 10, base: 4, media: 6 },
        set: { honest_rep: true, peacemaker: true },
        tone: 'good',
        result:
          'You congratulate the winner through clenched teeth and thank your people. A loss taken with dignity is its own grubby little asset you cash in later.',
      },
      {
        label: 'Contest every last ballot to the death',
        fx: { base: 8, heat: 12, support: -8 },
        scandal: { id: 'contested_loss', label: 'the loss you refused to accept', severity: 2 },
        tone: 'bold',
        result:
          'You drag the result through every court and every screaming rally. The diehards stay rabid; the rest of the country gets exhausted enough to wish you would just die.',
      },
    ],
  },
  {
    id: 'p9_b_tragedy',
    paths: ['ballot'],
    phases: [2, 3],
    weight: 7,
    art: 'crisis',
    emoji: '🕯️',
    title: 'The Tragedy on the News',
    body: `Something horrific has the whole nation sobbing into the evening broadcast, and your strategists are practically drooling over the chance to dunk on your rival while the bodies are still warm.`,
    choices: [
      {
        label: 'Shut up and grieve with everyone else',
        fx: { support: 10, base: 2 },
        set: { honest_rep: true },
        tone: 'good',
        result:
          'You put the knives down for a day and just mourn alongside the country. People clock the restraint, and for once they do not hate you for it.',
      },
      {
        label: 'Cash in the point while the wound is fresh',
        roll: {
          stat: 'media',
          dc: 54,
          success: {
            fx: { base: 8, media: 4 },
            text: 'You thread the needle and land the jab without looking like a grave-robbing ghoul. Just barely.',
          },
          fail: {
            fx: { support: -12, heat: 6 },
            text: 'You look like you are tap-dancing on a coffin. The clip of it follows you around like a bad smell for the rest of the cycle.',
          },
        },
        tone: 'slick',
      },
    ],
  },
  {
    id: 'p9_b_grassroots_surge',
    paths: ['ballot'],
    phases: [1, 2],
    weight: 6,
    art: 'scene',
    emoji: '📲',
    title: 'The Small-Dollar Surge',
    body: `One sappy little moment of yours went viral and now five-dollar donations are pouring in from every broke nobody in the land. It is real, honest-to-god grassroots heat — and a giant promise you now have to not screw up.`,
    choices: [
      {
        label: 'Go all-in on the people-powered fairy tale',
        fx: { base: 10, support: 8, funds: 6 },
        set: { grassroots: true },
        tone: 'good',
        result:
          'You build the entire damn campaign around the surge. The energy is the real deal and now the expectations are roughly the size of a moon.',
      },
      {
        label: 'Pocket it quietly and keep your mouth shut',
        fx: { funds: 10, base: 2 },
        tone: 'slick',
        result:
          'You take the cash without promising the masses a brand-new sky. Less feel-good fanfic, more gas in the tank.',
      },
    ],
  },
  {
    id: 'p9_b_fringe_endorse',
    paths: ['ballot'],
    phases: [2, 3],
    weight: 6,
    art: 'newspaper',
    emoji: '📛',
    title: 'The Unwanted Endorsement',
    body: `A genuinely revolting fringe pack of weirdos has loudly endorsed you, thrilled to bits. Their voters are real bodies; their reputation is raw sewage. Your rivals are already screenshotting like it is a holy text.`,
    choices: [
      {
        label: 'Tell them to crawl back under their rock',
        fx: { support: 8, base: -4, media: 4 },
        set: { honest_rep: true },
        tone: 'good',
        result:
          'You spit the endorsement back in the bluntest words you own. You bleed a few votes and keep your conscience on the record, which is rare enough to be weird.',
      },
      {
        label: 'Zip it and keep the creeps in your column',
        fx: { base: 6, heat: 8, support: -6 },
        set: { tyrant_rep: true },
        tone: 'slick',
        result:
          'You say nothing and quietly bank the bloc. The silence is deafening, and the screenshots are forever and ever, amen.',
      },
    ],
  },
  {
    id: 'p9_b_admit_wrong',
    paths: ['ballot'],
    phases: [1, 2, 3],
    weight: 6,
    art: 'scene',
    emoji: '🙋',
    title: 'The Honest Question',
    body: `At a town hall, some calm bastard in a sweater asks you to just admit, out loud, that an old position of yours was flat wrong. The whole room leans in. So do the cameras, you poor sap.`,
    choices: [
      {
        label: 'Cop to it, no weaseling',
        fx: { support: 10, base: 2 },
        set: { honest_rep: true },
        tone: 'good',
        result:
          'You actually say "you are right, I was wrong, here is what flipped me." A politician admitting error is rare enough to trend like a damn miracle.',
      },
      {
        label: 'Die on the old hill out of pure spite',
        roll: {
          stat: 'base',
          dc: 50,
          success: {
            fx: { base: 8 },
            text: 'You plant your flag with enough fake conviction that your base cheers the sheer mulish consistency of it.',
          },
          fail: {
            fx: { support: -8, heat: 2 },
            text: 'Refusing to ever admit you were wrong reads as, you know, exactly the problem. Pig-headedness on camera is not strength, champ.',
          },
        },
        tone: 'bold',
      },
    ],
  },
  {
    id: 'p9_b_primary_day',
    paths: ['ballot'],
    phases: [1, 2],
    weight: 7,
    art: 'bulletin',
    emoji: '🗳️',
    title: 'The Decisive Primary',
    body: `It all crashes down to one monster of a primary day. You can spray yourself thin across everywhere, or dump every last coin into the handful of contests that actually decide your fate.`,
    choices: [
      {
        label: 'Pour it all into the must-wins',
        roll: {
          stat: 'base',
          dc: 52,
          success: {
            fx: { base: 12, support: 8 },
            text: 'You win where it actually counts and the math suddenly tilts your way like a loaded table. Focus eats sprawl for breakfast.',
          },
          fail: {
            fx: { support: -8, base: -2 },
            text: 'You shove all your chips on a few squares and crap out on two of them. The narrow bet leaves your flank flapping in the wind everywhere else.',
          },
        },
        tone: 'bold',
      },
      {
        label: 'Show up everywhere and grub for delegate scraps',
        fx: { support: 4, base: 4, funds: -6 },
        tone: 'slick',
        result:
          'You spread yourself paper-thin and scrape crumbs in every district. No knockout, but no faceplant either.',
      },
    ],
  },
  {
    id: 'p9_b_celebrity_run',
    paths: ['ballot'],
    phases: [1, 2],
    weight: 6,
    art: 'rival',
    emoji: '🌟',
    title: 'The Celebrity Enters',
    body: `Some wildly beloved entertainer with the political knowledge of a houseplant has jumped into the race, hoovering up all the oxygen and polling like a god on nothing but fame and a great jawline.`,
    choices: [
      {
        label: 'Play nice, then gut them on substance',
        fx: { support: 8, influence: 4, base: -2 },
        tone: 'good',
        result:
          'You treat the celeb like a serious contender and quietly keep pointing at the canyon where their knowledge should be. Substance is a slow knife, but it goes in deep.',
      },
      {
        label: 'Roast the famous amateur on sight',
        roll: {
          stat: 'media',
          dc: 52,
          success: {
            fx: { media: 6, base: 6 },
            text: 'Your jabs at the dilettante land clean and the shine flakes off them in a hurry.',
          },
          fail: {
            fx: { support: -8, media: -2 },
            text: 'Swinging at a beloved star just makes you the bad guy. Their fans turn into their voters out of pure spite, and you handed it to them.',
          },
        },
        tone: 'bold',
      },
    ],
  },

  // ---------------- VANGUARD ----------------
  {
    id: 'p9_v_child_informs',
    paths: ['vanguard'],
    phases: [1, 2],
    weight: 7,
    art: 'bulletin',
    emoji: '🧒',
    title: 'The Child’s Report',
    body: `A pint-sized little zealot has dutifully ratted out their own parent for "unreliable talk." The apparatus wants you to pin a shiny medal on the kid and cart the parent off. The kid is eight years old.`,
    choices: [
      {
        label: 'Quietly lose the snitch report',
        fx: { support: 10, base: -4, heat: 8 },
        set: { secret_reformer: true, honest_rep: true },
        tone: 'good',
        result:
          'You misplace the denunciation, hand the kid a candy and a warning, and send them home. A family lives another day because you blinked.',
      },
      {
        label: 'Medal the kid, cuff the parent',
        fx: { base: 10, influence: 4, support: -10 },
        inc: { purge_count: 1 },
        set: { bloody_hands: true, zealot_rep: true },
        tone: 'bold',
        result:
          'You pin the medal on the eight-year-old and walk the parent out. The machine gets its meal; something in the room quietly curls up and dies.',
      },
    ],
  },
  {
    id: 'p9_v_named_heir',
    paths: ['vanguard'],
    phases: [3],
    weight: 9,
    art: 'bulletin',
    emoji: '👑',
    title: 'The Poisoned Chalice',
    body: `The dying old boss has finally, with his last few wheezing breaths, named you successor — which paints a bullseye on your back the size of a parade ground. Every rival now has exactly one hobby, and it is murdering you.`,
    choices: [
      {
        label: 'Lock it all down before they can move',
        fx: { influence: 10, base: 8, heat: 10, support: -4 },
        inc: { purge_count: 1 },
        set: { has_network: true, bloody_hands: true },
        tone: 'bold',
        result:
          'You strike before your rivals stop celebrating, seizing every lever overnight. Power secured, half in blood and half in paperwork, which is how it always goes.',
      },
      {
        label: 'Buy yourself a wall of bodyguards-in-suits',
        fx: { influence: 8, support: 8, base: -2 },
        set: { has_network: true, peacemaker: true },
        tone: 'slick',
        result:
          'You purchase loyalty with cushy posts and fat promises instead of fear. Slower, softer, and a hell of a lot harder to knife in the kidneys.',
      },
    ],
  },
  {
    id: 'p9_v_reverse_purge',
    paths: ['vanguard'],
    phases: [2, 3],
    weight: 6,
    art: 'scene',
    emoji: '↩️',
    title: 'The Purge You Regret',
    body: `Some poor bastard you helped condemn years back turns out to have been innocent the whole time, and their family is still rotting for it. You could quietly set it right, if you do not mind sticking your own neck out a little.`,
    choices: [
      {
        label: 'Secretly put the family back together',
        fx: { support: 10, influence: -4, heat: 6 },
        set: { secret_reformer: true, honest_rep: true },
        tone: 'good',
        result:
          'You quietly arrange to restore the name and the pension. It cannot un-rot the lost years, but it is something, and you paid for it out of your own hide.',
      },
      {
        label: 'Let the old lie sit there and stink',
        fx: { influence: 4, base: 2, heat: -2 },
        tone: 'slick',
        result:
          'You decide cracking the file open puts you in more danger than it saves them. The case stays shut; so does whatever was left of that door inside you.',
      },
    ],
  },
  {
    id: 'p9_v_slowdown',
    paths: ['vanguard'],
    phases: [1, 2],
    weight: 6,
    art: 'bulletin',
    emoji: '🐢',
    title: 'The Slowdown',
    body: `Workers in your sector are quietly dragging their feet — not striking, just oozing along at half speed — to protest quotas a robot could not hit. The Centre is screaming "sabotage" and wants a fat list of names.`,
    choices: [
      {
        label: 'Lower the insane quotas instead of cracking skulls',
        fx: { support: 10, base: 2, influence: -4 },
        set: { secret_reformer: true },
        tone: 'good',
        result:
          'You quietly drop the impossible targets and the work picks right back up. You call it "efficiency gains"; the workers call it being able to breathe.',
      },
      {
        label: 'Round up the so-called saboteurs',
        fx: { base: 8, influence: 4, support: -8 },
        inc: { purge_count: 1 },
        set: { bloody_hands: true },
        tone: 'bold',
        result:
          'You hand the Centre its names on a platter. The slowdown ends in cold sweat, and the quotas stay just as gleefully impossible as ever.',
      },
    ],
  },
  {
    id: 'p9_v_foreign_press',
    paths: ['vanguard'],
    phases: [2, 3],
    weight: 6,
    art: 'rival',
    emoji: '📰',
    title: 'The Foreign Interview',
    body: `A sharp-toothed foreign journalist scored a rare sit-down and is circling all the questions you would chew off your own arm to avoid. Every word out of your mouth gets quoted in two languages.`,
    choices: [
      {
        label: 'Disarm them with weird, dangerous honesty',
        roll: {
          stat: 'media',
          dc: 54,
          success: {
            fx: { media: 10, support: 8, influence: 4 },
            text: 'You blindside them with unexpected candor and come off as a reformer the world can actually stomach doing business with. A clean win, abroad and at home.',
          },
          fail: {
            fx: { heat: 10, base: -4 },
            text: 'Your honesty gets chopped up out of context, and the hardliners back home start sniffing the air for the stink of deviation. Truth is expensive here, friend.',
          },
        },
        set: { secret_reformer: true },
        tone: 'bold',
      },
      {
        label: 'Stonewall the vulture with approved slogans',
        fx: { base: 6, media: -2, heat: 2 },
        tone: 'slick',
        result:
          'You answer every single question with the same three pre-chewed phrases. Safe, wooden, and about as convincing as a talking mannequin.',
      },
    ],
  },
  {
    id: 'p9_v_old_guard',
    paths: ['vanguard'],
    phases: [2, 3],
    weight: 7,
    art: 'scene',
    emoji: '🧓',
    title: 'The Old Guard',
    body: `The fossilized hardliners who actually run the machine are quietly throttling every modest little reform you try. You can purge the geezers, wait for them to drop dead, or just ditch the reforms and keep the peace.`,
    choices: [
      {
        label: 'Outwait the old bastards on purpose',
        fx: { influence: 8, support: 6, base: -2 },
        set: { secret_reformer: true, has_network: true },
        tone: 'slick',
        result:
          'You promote around them and let the actuarial tables do your purging for you. Patience, here, is the quietest blade in the drawer.',
      },
      {
        label: 'Purge the wrinkly obstructionists',
        fx: { base: 8, influence: 6, heat: 8, support: -6 },
        inc: { purge_count: 2 },
        set: { bloody_hands: true },
        tone: 'bold',
        result:
          'You sweep the old men out in one brutal season. The reforms finally move; so does a fresh chill down the spine of every office in the building.',
      },
    ],
  },
  {
    id: 'p9_v_statue_toppled',
    paths: ['vanguard'],
    phases: [3],
    weight: 7,
    art: 'crisis',
    emoji: '🗿',
    title: 'They Toppled Your Statue',
    body: `Out in some far-flung city, a mob yanked down a statue of you and dragged your bronze face through the gutter. It is small, it is contained — and it is the first time the fear has shown a crack.`,
    choices: [
      {
        label: 'Answer with reform, not a rampage',
        roll: {
          stat: 'support',
          dc: 54,
          success: {
            fx: { support: 12, base: 4, heat: -4 },
            text: 'You meet the toppling with actual concessions, and the crack seals up instead of splitting wide. Rare, freakish wisdom under fire.',
          },
          fail: {
            fx: { support: -6, heat: 8 },
            text: 'Your softness reads as a wet noodle and a second statue eats pavement the next week. Mercy with bad timing just orders seconds.',
          },
        },
        set: { peacemaker: true },
        tone: 'good',
      },
      {
        label: 'Flatten the whole city as a memo',
        fx: { base: 8, heat: 16, support: -12 },
        inc: { purge_count: 2 },
        set: { bloody_hands: true, tyrant_rep: true },
        tone: 'bold',
        result:
          'You make the city bleed so the rest do not dare twitch. The statues stand again, buffed to a shine by terror, and that terror has a long memory.',
      },
    ],
  },
  {
    id: 'p9_v_famous_prisoner',
    paths: ['vanguard'],
    phases: [2, 3],
    weight: 6,
    art: 'scene',
    emoji: '🔑',
    title: 'The Famous Prisoner',
    body: `The most famous political prisoner on the planet is rotting in your basement, and foreign powers are dangling real, juicy rewards to spring them. Mercy, leverage, or a stubborn middle finger to the world.`,
    choices: [
      {
        label: 'Trade them for something actually worth it',
        fx: { influence: 8, support: 8, base: -4 },
        set: { dealmaker: true, peacemaker: true },
        tone: 'good',
        result:
          'You swap the prisoner for genuine gains and a heap of global goodwill. The hardliners grumble into their soup; the ledger and the whole world give you a nod.',
      },
      {
        label: 'Keep them caged as a permanent trophy',
        fx: { base: 8, heat: 8, support: -6 },
        set: { tyrant_rep: true },
        tone: 'bold',
        result:
          'You keep the famous captive in the box as a shiny ornament of your iron will. The world keeps their face plastered on every poster, just to spite you.',
      },
    ],
  },

  // ---------------- SHARED ----------------
  {
    id: 'p9_s_term_limit',
    paths: ['ballot', 'vanguard'],
    phases: [3],
    weight: 8,
    art: 'bulletin',
    emoji: '⏰',
    title: 'The Term Limit',
    body: `Your time is supposed to be wrapping up, but your sycophants are whispering that you should just rip up the rulebook and squat in the chair forever. Power is delicious, the job feels half-done, and the exit is right freaking there.`,
    choices: [
      {
        label: 'Respect the limit and walk out on schedule',
        fx: { support: 12, base: -2, media: 6 },
        set: { honest_rep: true, peacemaker: true },
        tone: 'good',
        result:
          'You stroll out the door while you still could have white-knuckled the chair. Letting go of power on purpose is the single rarest move anybody pulls in this filthy game.',
      },
      {
        label: 'Shred the rules and glue yourself to the seat',
        fx: { influence: 10, base: 6, heat: 12, support: -8 },
        set: { own_cult: true, tyrant_rep: true },
        scandal: { id: 'rules_changed', label: 'the term limit you erased', severity: 3 },
        tone: 'bold',
        result:
          'You rewrite the calendar to keep your ass in the chair. The applause is thunderous; the precedent is a door that never, ever swings shut again.',
      },
    ],
  },
  {
    id: 'p9_s_legacy_library',
    paths: ['ballot', 'vanguard'],
    phases: [3],
    weight: 6,
    art: 'scene',
    emoji: '🏛️',
    title: 'The Legacy Project',
    body: `Your aides are itching to break ground on some grand shrine to your era — a library, an institute, a marble temple to how great you supposedly were. It could inspire the masses, or it could read like a pharaoh too cheap to die quietly.`,
    choices: [
      {
        label: 'Build something useful and keep it humble',
        fx: { support: 8, funds: -4, base: 2 },
        set: { honest_rep: true },
        tone: 'good',
        result:
          'You fund schools and clinics and slap your name on a tiny plaque nobody reads. The legacy lives in the using, not in the gawking.',
      },
      {
        label: 'Build a giant marble monument to your own face',
        fx: { media: 8, base: 6, funds: -8, heat: 4 },
        set: { cult_building: true },
        tone: 'slick',
        result:
          'The marble rises, vast and gleaming and just a touch like a mausoleum. History will either bow to it or snicker; either way you will be dead and unable to argue.',
      },
    ],
  },
  {
    id: 'p9_s_apology',
    paths: ['ballot', 'vanguard'],
    phases: [2, 3],
    weight: 6,
    art: 'newspaper',
    emoji: '🙏',
    title: 'The Reckoning',
    body: `The pressure is cranking up for you to formally apologize for some historic atrocity your office pulled off ages before you ever showed up. An apology heals and admits; silence covers your butt and denies everything.`,
    choices: [
      {
        label: 'Give a full, no-hedging apology',
        fx: { support: 10, base: -2, media: 4 },
        set: { honest_rep: true, peacemaker: true },
        tone: 'good',
        result:
          'You name the old crime out loud and ask forgiveness with zero weasel-words. The gesture costs you a chunk of your base and buys you a whole country.',
      },
      {
        label: 'Refuse to grovel for ancient history',
        fx: { base: 8, heat: 4, support: -6 },
        tone: 'bold',
        result:
          'You decline to kneel for the dead past. Your base calls it spine; the people who got wronged call it the wound, still wide open and oozing.',
      },
    ],
  },
  {
    id: 'p9_s_surprise_alliance',
    paths: ['ballot', 'vanguard'],
    phases: [2, 3],
    weight: 6,
    art: 'rival',
    emoji: '🫱',
    title: 'The Unlikely Alliance',
    speaker: (S) => ({ name: S.opp, role: 'an old enemy', avatar: S.oppAvatar }),
    body: (S) =>
      `${S.opp}, your bitterest rival, proposes a startling alliance against a greater common threat. The logic is sound; the trust is nonexistent.`,
    choices: [
      {
        label: 'Shake the snake’s hand, eyes wide open',
        fx: { influence: 10, base: 4, heat: 4 },
        npcFx: { id: 'antagonist', relationship: 16 },
        set: { dealmaker: true },
        tone: 'slick',
        result:
          'You grip your enemy’s clammy paw to fend off a worse one. Strange bedfellows, and you are sleeping with one eye open and a knife under the pillow.',
      },
      {
        label: 'Tell them to pound sand; trust nobody',
        fx: { base: 6, support: -2, heat: 2 },
        npcFx: { id: 'antagonist', relationship: -8 },
        tone: 'bold',
        result:
          'You shoot the offer down flat. Now you face the bigger threat solo, with your beautiful, useless distrust intact and zero allies.',
      },
    ],
  },
  {
    id: 'p9_s_groom_successor',
    paths: ['ballot', 'vanguard'],
    phases: [3],
    weight: 6,
    art: 'scene',
    emoji: '🌿',
    title: 'Choosing an Heir',
    body: `You will not squat on this throne forever, and the question of who gets it next just got real. A loyal lump of mediocrity who will guard your legacy, or a brilliant freethinker who might leapfrog right over you?`,
    choices: [
      {
        label: 'Anoint the dangerous genius',
        fx: { support: 8, influence: 4, base: -2 },
        set: { honest_rep: true },
        tone: 'good',
        result:
          'You back the one who might outshine your whole career. The country comes out ahead; your statues might not get dusted very often.',
      },
      {
        label: 'Anoint the loyal lapdog',
        fx: { influence: 6, base: 6, heat: 2 },
        set: { has_network: true },
        tone: 'slick',
        result:
          'You pick the one who will guard your record like a junkyard dog. Your legacy is safe; the future just got a couple sizes smaller.',
      },
    ],
  },
  {
    id: 'p9_s_press_clampdown',
    paths: ['ballot', 'vanguard'],
    phases: [2, 3],
    weight: 6,
    art: 'newspaper',
    emoji: '📵',
    title: 'The Troublesome Press',
    body: `One relentless little outlet keeps printing things that are both true and absolutely brutal to you. You have all the toys to make their lives a living hell — licenses, audits, access. The itch to squeeze is real and ugly.`,
    choices: [
      {
        label: 'Leave the press alone, however much it stings',
        fx: { support: 8, base: -2, heat: -4 },
        set: { honest_rep: true },
        tone: 'good',
        result:
          'You sit on your hands and let the honest reporting bite. A free press that draws your blood is the toll you pay for not being a full-blown tyrant.',
      },
      {
        label: 'Quietly put the screws to them',
        fx: { base: 4, heat: 10, support: -6 },
        inc: { purge_count: 1 },
        set: { tyrant_rep: true },
        scandal: { id: 'press_squeeze', label: 'the outlet you strangled', severity: 2 },
        tone: 'slick',
        result:
          'Their licenses suddenly get "complicated" and their access dries up like a raisin. The reporting goes soft, and so does any fairy tale about you being a democrat.',
      },
    ],
  },
  {
    id: 'p9_s_family_threat',
    paths: ['ballot', 'vanguard'],
    phases: [2, 3],
    weight: 6,
    art: 'crisis',
    emoji: '🛡️',
    title: 'The Threat to Family',
    body: `Someone has made a credible, stomach-churning, specific threat against your family. You can wall them up in a guarded bunker and out of public life, or refuse to let some lowlife with a grudge run your whole life.`,
    choices: [
      {
        label: 'Refuse to let fear hold the leash',
        roll: {
          stat: 'base',
          dc: 52,
          success: {
            fx: { support: 10, base: 6 },
            text: 'You quietly beef up security but live out loud, and the defiance steadies the whole jittery country’s nerve.',
          },
          fail: {
            fx: { support: -6, heat: 6 },
            text: 'The bravado looks like idiot recklessness the second a scare gets close. "Why gamble with their lives?" becomes the question that sticks.',
          },
        },
        tone: 'bold',
      },
      {
        label: 'Wall them up where it is safe',
        fx: { heat: -6, influence: 2, support: -2 },
        tone: 'good',
        result:
          'You wrap your family in armor and shadow. They are safe, and a little lost to you, and that is the lousy trade you signed up for.',
      },
    ],
  },
  {
    id: 'p9_s_walk_away',
    paths: ['ballot', 'vanguard'],
    phases: [3],
    weight: 6,
    art: 'scene',
    emoji: '🚪',
    title: 'The Open Door',
    body: `Worn down to the bone, you catch yourself fantasizing about just walking the hell away — a quiet life, a clean conscience, a door standing wide open. The work is bottomless; you, sad to say, are not.`,
    choices: [
      {
        label: 'Recommit; there is still blood to spill',
        fx: { base: 8, support: 4, heat: 2 },
        tone: 'bold',
        result:
          'You square your aching shoulders and stay in the pit. The fire is banked low but not out; the work hooks its claws back into you.',
      },
      {
        label: 'Quietly plot your graceful escape',
        fx: { support: 8, base: -4 },
        set: { honest_rep: true },
        tone: 'good',
        result:
          'You start arranging an ending on your own terms. Knowing when to get out is a wisdom almost nobody in this rat-race ever picks up.',
      },
    ],
  },

  // ---------------- CRISES ----------------
  {
    id: 'p9_c_neighbor_aid',
    paths: ['ballot', 'vanguard'],
    phases: [2, 3],
    weight: 8,
    crisis: true,
    art: 'crisis',
    emoji: '🤲',
    title: 'The Neighbor’s Plea',
    body: `A neighboring nation is drowning in catastrophe and is on its knees begging you for help — but your own people are stretched thin and pissy, and being generous to foreigners is a hard sell at the dinner table.`,
    choices: [
      {
        label: 'Send real, generous aid',
        fx: { influence: 8, support: 6, funds: -10 },
        set: { peacemaker: true },
        tone: 'good',
        result:
          'You crack open the warehouses for a neighbor on the brink. It costs you grief at home and buys you something rarer than gold: gratitude that crosses a border.',
      },
      {
        label: 'Slam the door; us first',
        fx: { base: 8, support: 4, influence: -4 },
        tone: 'bold',
        result:
          'You keep the aid at home and let the neighbor twist in the wind. Defensible, popular, and remembered for a long, frosty while right next door.',
      },
    ],
  },
  {
    id: 'p9_c_outbreak_origin',
    paths: ['ballot', 'vanguard'],
    phases: [1, 2, 3],
    weight: 8,
    crisis: true,
    art: 'crisis',
    emoji: '🧫',
    title: 'The Source',
    body: `A nasty outbreak has kicked off, and every breadcrumb points straight back to a facility flying your flag. You can come clean about where it started, or quietly point a trembling finger at somebody across the border.`,
    choices: [
      {
        label: 'Fess up about where it started',
        fx: { support: 10, influence: -2, heat: -4 },
        set: { honest_rep: true },
        tone: 'good',
        result:
          'You admit where the thing crawled out of and aim everyone at the fix. The honesty bruises you, and snuffs the outbreak out a whole lot faster.',
      },
      {
        label: 'Blame some convenient foreign lab',
        roll: {
          stat: 'media',
          dc: 54,
          success: {
            fx: { base: 8, media: 4 },
            text: 'The misdirection holds and the blame drifts safely off across the border. For now, anyway.',
          },
          fail: {
            fx: { support: -12, heat: 12 },
            text: 'The real origin leaks out with your cover story stapled to it. The lie ends up bigger news than the plague itself.',
          },
        },
        scandal: { id: 'outbreak_lie', label: 'the outbreak origin you hid', severity: 3 },
        tone: 'slick',
      },
    ],
  },
  {
    id: 'p9_c_grid_sabotage',
    paths: ['ballot', 'vanguard'],
    phases: [2, 3],
    weight: 8,
    crisis: true,
    art: 'crisis',
    emoji: '🧨',
    title: 'The Sabotage',
    body: `Some bastard deliberately blew up a key chunk of infrastructure, and now the whole country is dark and scared witless. You can investigate it like a grown-up, or seize the panic to bury whichever enemies are handy.`,
    choices: [
      {
        label: 'Investigate carefully, lead the cleanup',
        roll: {
          stat: 'influence',
          dc: 52,
          success: {
            fx: { influence: 10, support: 8 },
            text: 'You nail the actual culprits and get the lights back on without a single witch-hunt. Cool, boring competence, and it pays off.',
          },
          fail: {
            fx: { support: -6, heat: 6 },
            text: 'The patient approach looks like dawdling to a terrified public that wanted heads on spikes by sunrise.',
          },
        },
        tone: 'good',
      },
      {
        label: 'Pin it on your enemies, scoop them all up',
        fx: { base: 10, heat: 12, support: -6 },
        inc: { purge_count: 2 },
        set: { bloody_hands: true, tyrant_rep: true },
        tone: 'bold',
        result:
          'You name the usual suspects and bag them before the evidence even wakes up. The lights flicker back on over a fresh batch of stuffed jails.',
      },
    ],
  },
  {
    id: 'p9_c_currency_attack',
    paths: ['ballot', 'vanguard'],
    phases: [2, 3],
    weight: 8,
    crisis: true,
    art: 'crisis',
    emoji: '📉',
    title: 'The Speculators’ Raid',
    body: `A pack of foreign vultures in suits is betting obscene fortunes against your currency, and the thing is sliding toward the floor. You can torch the reserves defending it, or let it float and just eat the haymaker.`,
    choices: [
      {
        label: 'Burn the reserves and defend the currency',
        roll: {
          stat: 'influence',
          dc: 53,
          success: {
            fx: { influence: 10, support: 6, funds: -8 },
            text: 'You spend like a drunk king and crack the speculators’ nerve. The currency holds and the raiders slink off licking fat losses.',
          },
          fail: {
            fx: { funds: -10, support: -8, heat: 6 },
            text: 'You set the reserves on fire and the vultures win anyway. Now you are broke AND the currency still face-planted. Outstanding.',
          },
        },
        tone: 'bold',
      },
      {
        label: 'Let it float, cushion the little people',
        fx: { support: 6, funds: -4, base: 2 },
        set: { honest_rep: true },
        tone: 'good',
        result:
          'You let the currency find its own sad level and spend on softening the blow for regular households. Painful, honest, and survivable.',
      },
    ],
  },
  {
    id: 'p9_c_heatwave',
    paths: ['ballot', 'vanguard'],
    phases: [1, 2, 3],
    weight: 8,
    crisis: true,
    art: 'crisis',
    emoji: '🌡️',
    title: 'The Killing Heat',
    body: `A record heatwave is cooking the old and the broke alive in their own apartments, and the power grid is wheezing toward a total faceplant under a million screaming fans.`,
    choices: [
      {
        label: 'Open cooling centers; save the vulnerable',
        fx: { support: 12, funds: -8, base: 2 },
        set: { honest_rep: true },
        tone: 'good',
        result:
          'You throw the public buildings wide open and send people to check on the shut-ins. Unglamorous, lifesaving, and quietly heroic as hell.',
      },
      {
        label: 'Protect the grid, ration the juice',
        roll: {
          stat: 'influence',
          dc: 52,
          success: {
            fx: { influence: 8, support: 4 },
            text: 'You juggle the load and keep the grid breathing through the worst of it. The blackout that never happened wins you exactly zero headlines.',
          },
          fail: {
            fx: { support: -10, heat: 6 },
            text: 'The rationing leaves all the wrong neighborhoods baking and the body count climbs. The map of who you cut off gets pored over later in great detail.',
          },
        },
        tone: 'slick',
      },
    ],
  },
  {
    id: 'p9_c_satellite',
    paths: ['ballot', 'vanguard'],
    phases: [1, 2, 3],
    weight: 7,
    crisis: true,
    art: 'crisis',
    emoji: '🛰️',
    title: 'The Falling Star',
    body: `A dead satellite is tumbling out of the sky and not one egghead can say exactly where the thing will splat. The public is half-terrified, half-delighted, and completely glued to you for a pat on the head.`,
    choices: [
      {
        label: 'Shoot people straight; give them the real odds',
        fx: { support: 10, media: 4 },
        set: { honest_rep: true },
        tone: 'good',
        result:
          'You lay out the actual, microscopic risk in plain words and the panic deflates into nerdy fascination. Honesty, delivered calm, works like a tranquilizer.',
      },
      {
        label: 'Milk the drama for a rally-round-the-flag stunt',
        roll: {
          stat: 'media',
          dc: 50,
          success: {
            fx: { media: 8, base: 6 },
            text: 'You spin the falling junk into a flag-waving festival of national grit. It lands harmlessly in a field; you look like a colossus.',
          },
          fail: {
            fx: { support: -6, heat: 4 },
            text: 'The hype curdles the moment people realize you oversold a basically-zero risk for clout. Crying wolf at the sky has a bill attached.',
          },
        },
        tone: 'slick',
      },
    ],
  },
];
