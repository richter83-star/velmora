import type { GameEvent } from '../engine/types';

/**
 * "Dark Mirrors" expansion — The Anointed Path event bank.
 *
 * The faith is fictional and non-denominational: no real religion, scripture,
 * deity, or clergy title from any real tradition appears anywhere in player-
 * visible text. The drama is the MECHANISM of sacred power — devotion, doctrine,
 * authority, congregation, and the slow accumulation of heresy — never the
 * identity of any real movement, leader, or belief.
 *
 * Stat display names (flavor only): support=Devotion, funds=Treasury,
 * influence=Authority, media=Doctrine, base=Congregation, heat=Heresy.
 * fx/roll use ONLY the six engine keys.
 *
 * Bloc/finale flags are spread across choices so different play styles push
 * different blocs past 70 and set different Phase 3 finale flags:
 *   - secret_reformer (+ low Heresy)  => THE SAINT
 *   - bloody_hands + purge_count      => THE INQUISITOR
 *   - own_cult / cult_building        => THE ORACLE
 *   - honest_rep / peacemaker         => THE REFORMER
 *   - runaway Heresy                  => excommunicated
 *
 * Merged into the draw pool by the orchestrator; validated by the content linter
 * like every other bank.
 */
export const ANOINTED_EVENTS: GameEvent[] = [
  // ---------------- PHASE 1 ----------------
  {
    id: 'ap_first_sermon',
    paths: ['anointed'],
    phases: [1],
    weight: 12,
    art: 'scene',
    emoji: '🕯️',
    title: 'The First Big Sermon',
    body: `The hall is rammed and dead silent, every sweaty face tilted up at you like you personally hung the moon. This first sermon decides what flavor of holy grift you're selling: a hug, a boot, or a magic trick nobody can disprove.`,
    choices: [
      {
        label: 'Sell them a warm, forgiving, huggy faith',
        fx: { support: 10, media: 6, heat: -4 },
        set: { secret_reformer: true, honest_rep: true },
        tone: 'good',
        result: `You preach a faith that actually likes people. The kids eat it up; a few crusty old bastards in the front row cross their arms like you just insulted their mothers.`,
      },
      {
        label: 'Sell them the rulebook, every brutal page of it',
        fx: { media: 10, base: 8, support: -2 },
        set: { hardliner_cred: true },
        tone: 'bold',
        result: `You hand them cast-iron certainty and zero wiggle room. The hardliners stamp their approval like a herd of pious bulls; the wafflers shut their mouths fast.`,
      },
      {
        label: 'Skip the words — give them a goddamn light show',
        fx: { media: 6, base: 8, heat: 4 },
        set: { cult_building: true },
        tone: 'slick',
        result: `Candles, chanting, and a hush so thick you could bottle it. They stagger out absolutely certain they saw something — they didn't, but try telling them that.`,
      },
    ],
  },
  {
    id: 'ap_heresy_accusation',
    paths: ['anointed'],
    phases: [1],
    weight: 10,
    art: 'bulletin',
    emoji: '📜',
    title: 'Some Clown Says You Read It Wrong',
    body: `A rival cleric is passing around a smug little pamphlet claiming your reading of the holy books is dangerously, embarrassingly wrong. The word "heretic" travels a hell of a lot faster than any correction.`,
    choices: [
      {
        label: 'Drag him into open debate and humiliate him',
        roll: {
          stat: 'media',
          dc: 50,
          success: {
            fx: { media: 12, support: 6, heat: -4 },
            text: `You tear the pamphlet apart line by line until the room flips and the poor bastard is studying his own shoes. Game over, pal.`,
          },
          fail: {
            fx: { media: -8, heat: 8 },
            text: `You botch one lousy passage and the whole room clocks it. Now there are two heretics flailing on stage instead of one.`,
          },
        },
        tone: 'bold',
      },
      {
        label: 'Give him a point, build a little bridge',
        fx: { support: 6, heat: -4, media: -2 },
        set: { peacemaker: true, secret_reformer: true },
        tone: 'good',
        result: `You admit the prick was half right and thank him for the trouble. Turns out swallowing your pride plays as humility, and humility plays as holy.`,
      },
      {
        label: 'Brand him a troublemaking heretic and bury him',
        fx: { base: 8, media: 4, heat: 8 },
        set: { hardliner_cred: true, went_negative: true },
        tone: 'slick',
        result: `You make the question itself a sin. The faithful nod along like bobbleheads; somewhere, a quiet little grudge-ledger creaks open with your name on it.`,
      },
    ],
  },
  {
    id: 'ap_tithes_question',
    paths: ['anointed'],
    phases: [1],
    weight: 10,
    art: 'scene',
    emoji: '🪙',
    title: 'Where the Hell the Money Goes',
    body: `The flock empties its pockets every week, and lately a few of them have started asking — polite, but pointed — exactly which pocket all that holy coin ends up in.`,
    choices: [
      {
        label: 'Nail the books to the door for everyone to see',
        fx: { support: 10, heat: -6, funds: -4 },
        set: { honest_rep: true, clean_streak: true },
        tone: 'good',
        result: `You post every last receipt right on the front door. It costs you a little mystery and a little gold, and buys you a flock that won't frisk you in the parking lot.`,
      },
      {
        label: 'Quietly funnel the surplus into your own coffers',
        fx: { funds: 12, heat: 8, support: -2 },
        set: { corrupt_streak: true },
        scandal: { id: 'ap_tithe_skim', label: 'the unaccounted offerings', severity: 2 },
        tone: 'slick',
        result: `The vault fills up and the nosy questions get smoothly steered into a ditch. A receipt that was never written can never be found, can it.`,
      },
      {
        label: 'Blow it on the poor where everyone can watch',
        fx: { support: 8, base: 6, funds: -8 },
        set: { peacemaker: true, grassroots: true },
        tone: 'good',
        result: `Bread, blankets, and a parade the cameras can't get enough of. The Treasury gets skinny; the pews get packed with grateful new bodies.`,
      },
    ],
  },
  {
    id: 'ap_miracle_rumor',
    paths: ['anointed'],
    phases: [1, 2],
    weight: 9,
    art: 'scene',
    emoji: '✨',
    title: 'The Rumor You Did a Miracle',
    body: `Word is racing around that at the last vigil you healed a dying kid with one touch. You know exactly what happened — bugger all — and the faithful would very much prefer you keep that to yourself.`,
    choices: [
      {
        label: 'Feed the miracle, deny absolutely nothing',
        fx: { support: 10, base: 10, heat: 8 },
        set: { own_cult: true, cult_building: true },
        tone: 'slick',
        result: `You let the lie fatten itself with every retelling. Soon pilgrims are dragging the sick and the desperate to your door expecting an encore.`,
      },
      {
        label: 'Stand up and gently kill the rumor dead',
        fx: { support: 6, heat: -6, base: -4 },
        set: { honest_rep: true, secret_reformer: true },
        tone: 'good',
        result: `You tell them the kid was already on the mend, no magic required. The thrill-seekers sulk off disappointed; the honest ones love you twice as hard for it.`,
      },
      {
        label: 'Spin it into a fable about faith and dodge the lie',
        roll: {
          stat: 'media',
          dc: 50,
          success: {
            fx: { media: 12, support: 6 },
            text: `You reframe the whole thing as a lesson, not a brag. Slick as hell — wonder delivered, no actual lie on the books.`,
          },
          fail: {
            fx: { media: -6, heat: 6 },
            text: `The nuance gets mangled in the retelling and now half the province is lining up expecting you to do it again on command.`,
          },
        },
        tone: 'bold',
      },
    ],
  },

  // ---------------- PHASE 2 ----------------
  {
    id: 'ap_council_faction',
    paths: ['anointed'],
    phases: [2],
    weight: 9,
    art: 'rival',
    emoji: '⛪',
    title: 'The Orthodox Shakedown',
    speaker: (S) => ({ name: S.opp, role: 'a senior Orthodox elder', avatar: S.oppAvatar }),
    body: (S) =>
      `${S.opp} sweeps in with a velvet-gloved ultimatum: the Orthodox will bless your rise to the top — but only if you publicly trash the reformers and grovel back to your meaner old teachings first.`,
    choices: [
      {
        label: 'Grovel on cue and bear-hug the old law',
        fx: { media: 8, base: 8, influence: 6, support: -4 },
        set: { hardliner_cred: true, zealot_rep: true },
        tone: 'bold',
        result: `You bend the knee to the dusty old book and the elders anoint you with smug little smiles. The reformers you threw under the cart, however, have very long memories.`,
      },
      {
        label: 'Tell them to shove it — keep your reformers',
        fx: { support: 8, influence: -6, heat: 4 },
        set: { secret_reformer: true, honest_rep: true },
        tone: 'good',
        result: `You wave off the blessing and keep your conscience intact. The elder leaves wearing a smile that basically guarantees you a knife in the future.`,
      },
      {
        label: 'Say the words, mean not one syllable',
        fx: { influence: 8, heat: 6, media: 2 },
        set: { dealmaker: true },
        tone: 'slick',
        result: `You hand the Orthodox their grovel and slip the reformers a wink behind your back. Two faces, one promotion, zero shame. Beautiful.`,
      },
    ],
  },
  {
    id: 'ap_secular_deal',
    paths: ['anointed'],
    phases: [2],
    weight: 8,
    art: 'scene',
    emoji: '🤝',
    title: 'The Magistrate’s Sweet Little Offer',
    body: `A slick government suit slides up with land, gold, and muscle for the Covenant — all yours, in exchange for a few quiet little tweaks to doctrine that just so happen to make the state's life easier.`,
    choices: [
      {
        label: 'Grab the gold, water down the gospel',
        fx: { funds: 14, influence: 6, support: -4, heat: 6 },
        set: { dealmaker: true },
        scandal: {
          id: 'ap_secular_pact',
          label: 'the secret pact with the magistrate',
          severity: 2,
        },
        tone: 'slick',
        result: `The Treasury floods and the sermons quietly soften to match. Somewhere a nosy little scribe is tucking a copy of that bargain into a drawer for a rainy day.`,
      },
      {
        label: 'Refuse — the faith is not for goddamn sale',
        fx: { support: 10, base: 6, funds: -4 },
        set: { honest_rep: true, peacemaker: true },
        tone: 'good',
        result: `You boot the suit out empty-handed. Broker, prouder, and a hell of a lot harder to buy the next time someone tries.`,
      },
      {
        label: 'Take the muscle, dodge the leash',
        roll: {
          stat: 'influence',
          dc: 52,
          success: {
            fx: { influence: 10, funds: 6, heat: -2 },
            text: `You pocket the protection and wriggle clean out of the strings. The suit walks off grudgingly impressed you out-haggled him.`,
          },
          fail: {
            fx: { heat: 10, support: -4 },
            text: `You push your luck one inch too far and the whole offer curdles into a grudge with a very long memory.`,
          },
        },
        tone: 'bold',
      },
    ],
  },
  {
    id: 'ap_schism_seed',
    paths: ['anointed'],
    phases: [2],
    weight: 8,
    art: 'bulletin',
    emoji: '🔥',
    title: 'The Breakaway Loudmouth',
    body: `Out in the boondock parishes some charismatic splinter preacher is pulling crowds with a rival sermon and calling you a washed-up old fossil. A schism is a wound — it can scab over or it can rot the whole arm off.`,
    choices: [
      {
        label: 'Hug it out and welcome them back',
        fx: { support: 8, base: 6, heat: -4 },
        set: { peacemaker: true, secret_reformer: true },
        tone: 'good',
        result: `You schlep out there, actually listen, and hand them a seat at the table. Most of them trickle back; the faith just grew itself a wider front door.`,
      },
      {
        label: 'Out-preach the bastard and steal his crowd',
        roll: {
          stat: 'support',
          dc: 52,
          success: {
            fx: { support: 12, base: 8, media: 4 },
            text: `You throw a counter-vigil so blinding his whole crowd drifts over to your side. The splinter fizzles out without a fight.`,
          },
          fail: {
            fx: { support: -8, heat: 6 },
            text: `Your rally lands with a wet thud next to his. Now the splinter's got a martyr, a banner, and a grudge.`,
          },
        },
        tone: 'bold',
      },
      {
        label: 'Brand them heretics and slam the doors',
        fx: { base: 8, media: 4, heat: 12, support: -4 },
        set: { hardliner_cred: true, went_negative: true },
        scandal: {
          id: 'ap_schism_crackdown',
          label: 'the suppression of the splinter parish',
          severity: 2,
        },
        tone: 'slick',
        result: `You stamp them outcasts and bolt the doors shut. Order, technically, restored — and a whole lot of fresh resentment now festering in the dark.`,
      },
    ],
  },
  {
    id: 'ap_crusade_question',
    paths: ['anointed'],
    phases: [2, 3],
    crisis: true,
    art: 'crisis',
    emoji: '⚔️',
    title: 'A Disaster Far Away',
    body: `Some faraway province just got flattened, and the frothing zealots in your own ranks are screaming it's divine punishment — and demanding you bless a march to go "cleanse" whatever poor survivors are left.`,
    choices: [
      {
        label: 'Refuse — send food, not a goddamn mob',
        fx: { support: 10, base: -4, heat: -6, funds: -8 },
        set: { peacemaker: true, honest_rep: true },
        tone: 'good',
        result: `You ship grain and healers and call the whole revenge fantasy a sin. The decent folk bless you for it; the zealots stew in their own bile.`,
      },
      {
        label: 'Bless the march and call slaughter "justice"',
        fx: { base: 12, media: 6, heat: 16, support: -6 },
        inc: { purge_count: 1 },
        set: { bloody_hands: true, zealot_rep: true },
        tone: 'bold',
        result: `You hand the rage a holy costume to wear. The faithful stampede off howling; the body count gets filed under someone else's problem, for now.`,
      },
      {
        label: 'Stall like a coward — call a fast and a council',
        roll: {
          stat: 'influence',
          dc: 54,
          success: {
            fx: { influence: 8, support: 6, heat: -4 },
            text: `You burn the heat off with solemn ritual and a lot of fasting, and the bloodlust cools before anyone can point it at a target.`,
          },
          fail: {
            fx: { heat: 10, base: -4 },
            text: `The stalling reads as gutlessness; the zealots march without your say-so and somehow you still get the blame.`,
          },
        },
        tone: 'slick',
      },
    ],
  },

  // ---------------- PHASE 3 ----------------
  {
    id: 'ap_inquisition',
    paths: ['anointed'],
    phases: [3],
    weight: 8,
    art: 'bulletin',
    emoji: '🗝️',
    title: 'The Loyalty Inquisition',
    body: `Your hardliners are itching for a big formal purity check — names, questions, consequences, the whole grim circus. There's a mouthy skeptic in the back rows they'd just love to make the very first example.`,
    choices: [
      {
        label: 'Run it fair, open, and boring on purpose',
        fx: { support: 6, media: 6, heat: -4 },
        set: { honest_rep: true, secret_reformer: true },
        tone: 'good',
        result: `You let everyone yap, then publish the findings. It thrills nobody and convicts nobody. Justice: slow, dull, and bulletproof.`,
      },
      {
        label: 'Make the doubter disappear as a lesson',
        fx: { base: 10, media: 4, heat: 14, support: -6 },
        inc: { purge_count: 1 },
        set: { bloody_hands: true, own_cult: true },
        scandal: { id: 'ap_silenced_doubter', label: 'the doubter you made vanish', severity: 3 },
        tone: 'bold',
        result: `The skeptic gets stripped of voice and rank in front of the whole assembly. The room does the math real quick and decides doubt is suddenly very expensive.`,
      },
      {
        label: 'Wave the whole sordid circus away',
        fx: { support: 4, base: -4, heat: -2 },
        set: { peacemaker: true },
        tone: 'slick',
        result: `You dismiss the inquisition as beneath the faith and refuse to play. The hardliners file your refusal in the thick folder marked "disappointments."`,
      },
    ],
  },
  {
    id: 'ap_succession_rite',
    paths: ['anointed'],
    phases: [3],
    weight: 7,
    art: 'scene',
    emoji: '👁️',
    title: 'Who Gets Your Chair',
    body: `You're not dead yet, but the whisper is everywhere: who's next? How you answer decides whether the Covenant turns into a real institution, a grubby family business, or a one-man fan club.`,
    choices: [
      {
        label: 'Set up an open council to pick freely',
        fx: { support: 8, influence: 6, heat: -4 },
        set: { honest_rep: true, peacemaker: true },
        tone: 'good',
        result: `You build something bigger than your own ego. The faith grows an actual backbone that can outlast any single windbag in robes.`,
      },
      {
        label: 'Crown a loyal hardliner to guard the rulebook',
        fx: { base: 10, media: 4, influence: 4 },
        set: { hardliner_cred: true, zealot_rep: true },
        tone: 'bold',
        result: `You anoint a true believer who'll never let one rule soften. The Orthodox breathe easy; the reformers start eyeing the exits.`,
      },
      {
        label: 'Allow no successor — be the only damn answer',
        fx: { support: 8, base: 8, heat: 10 },
        set: { own_cult: true, cult_building: true },
        tone: 'slick',
        result: `You make replacing you literally unthinkable and the worship personal. After you, they'll be told, there's nothing but the memory of your gorgeous face.`,
      },
    ],
  },
  {
    id: 'ap_famine',
    paths: ['anointed'],
    phases: [2, 3],
    crisis: true,
    art: 'crisis',
    emoji: '🍞',
    title: 'The Famine',
    body: `The harvest tanks and the people are starving in the streets. They turn their hollow eyes to the Covenant: does the faith fling open its granaries, or tell them to fast and pray their bellies full?`,
    choices: [
      {
        label: 'Throw open the granaries and feed everybody',
        fx: { support: 12, base: 8, funds: -16 },
        set: { peacemaker: true, grassroots: true },
        tone: 'good',
        result: `You empty the storehouses without checking anyone's faith first. The Treasury hemorrhages; the gratitude is so deep you could drown in it.`,
      },
      {
        label: 'Call a sacred fast and pray for a damn miracle',
        roll: {
          stat: 'support',
          dc: 53,
          success: {
            fx: { support: 14, base: 10, media: 6 },
            text: `The rains roll in on the third day of the fast. The faithful scream it's proof; you keep your mouth shut and let them have it.`,
          },
          fail: {
            fx: { support: -16, heat: 12 },
            text: `The fast drags on and on, and the only thing filling up is the graveyard. Prayer, the starving have noticed, is not bread.`,
          },
        },
        tone: 'bold',
      },
      {
        label: 'Feed only the faithful, ration by loyalty',
        fx: { base: 10, funds: -6, heat: 12, support: -6 },
        set: { zealot_rep: true, hardliner_cred: true },
        scandal: {
          id: 'ap_famine_ration',
          label: 'the bread withheld from the doubtful',
          severity: 3,
        },
        tone: 'slick',
        result: `The true believers eat; the wafflers learn exactly what doubt costs per loaf. Devotion has never gotten so popular so fast.`,
      },
    ],
  },
  {
    id: 'ap_dissent_within',
    paths: ['anointed'],
    phases: [3],
    weight: 7,
    art: 'rival',
    emoji: '🎭',
    title: 'The Faithless Councilman',
    speaker: (S) => ({ name: S.opp, role: 'a senior Council member', avatar: S.oppAvatar }),
    body: (S) =>
      `Behind closed doors, ${S.opp} admits they've stopped believing a single word of it — yet still sits on your Council, sharp as a tack and quietly poisonous. A non-believer wedged into the heart of the faith is one delicate little headache.`,
    choices: [
      {
        label: 'Keep them close, keep their secret buried',
        fx: { influence: 8, support: 4, heat: -2 },
        set: { secret_reformer: true, peacemaker: true },
        tone: 'good',
        result: `You cover for the doubter and keep that razor brain right where you can use it. A faith cocky enough to babysit a skeptic without flinching.`,
      },
      {
        label: 'Out them and boot them in front of everyone',
        fx: { base: 10, media: 6, heat: 12, support: -6 },
        inc: { purge_count: 1 },
        set: { bloody_hands: true, went_negative: true },
        scandal: { id: 'ap_council_purge', label: 'the council member you cast out', severity: 2 },
        tone: 'bold',
        result: `You name them in front of the whole assembly and rip the robe off their back. The Council learns, real fast, that doubt is now a terminal condition.`,
      },
      {
        label: 'Quietly demote them into a broom closet',
        roll: {
          stat: 'influence',
          dc: 50,
          success: {
            fx: { influence: 8, heat: -4 },
            text: `You shuffle them off into harmless nowhere. No drama, no martyr, no loose threads dangling. Clean.`,
          },
          fail: {
            fx: { heat: 8, support: -4 },
            text: `The reassignment reads as exile, and the second the door shuts the whole place starts whispering about why.`,
          },
        },
        tone: 'slick',
      },
    ],
  },
];
