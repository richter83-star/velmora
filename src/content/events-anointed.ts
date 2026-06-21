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
    title: 'The First Sermon',
    body: `The hall is full and the silence is yours to fill. Your first great sermon will define the mandate: a covenant of mercy, an unbending law, or a wonder no one can argue with.`,
    choices: [
      {
        label: 'Preach a covenant of mercy and reform',
        fx: { support: 10, media: 6, heat: -4 },
        set: { secret_reformer: true, honest_rep: true },
        tone: 'good',
        result:
          'You speak of a living, forgiving faith. The young lean forward; a few elders fold their arms.',
      },
      {
        label: 'Preach the unbending letter of the law',
        fx: { media: 10, base: 8, support: -2 },
        set: { hardliner_cred: true },
        tone: 'bold',
        result:
          'You give them iron certainty. The Orthodox stamp their approval; the doubtful go quiet.',
      },
      {
        label: 'Stage a moment of breathtaking spectacle',
        fx: { media: 6, base: 8, heat: 4 },
        set: { cult_building: true },
        tone: 'slick',
        result:
          'Candles, song, and a hush that feels like lightning. They leave certain they witnessed something.',
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
    title: 'A Question of Interpretation',
    body: `A rival cleric circulates a tract arguing your reading of the sacred texts is dangerously wrong. The charge of heresy travels faster than any rebuttal.`,
    choices: [
      {
        label: 'Out-argue them in open disputation',
        roll: {
          stat: 'media',
          dc: 50,
          success: {
            fx: { media: 12, support: 6, heat: -4 },
            text: 'You dismantle the tract line by line. The hall converts; the accuser studies the floor.',
          },
          fail: {
            fx: { media: -8, heat: 8 },
            text: 'You fumble a passage and the room notices. Now there are two heretics in the debate.',
          },
        },
        tone: 'bold',
      },
      {
        label: 'Concede a point, build a bridge',
        fx: { support: 6, heat: -4, media: -2 },
        set: { peacemaker: true, secret_reformer: true },
        tone: 'good',
        result:
          'You grant the accuser was half-right and thank them for it. Humility, it turns out, is also doctrine.',
      },
      {
        label: 'Brand the accuser a sower of discord',
        fx: { base: 8, media: 4, heat: 8 },
        set: { hardliner_cred: true, went_negative: true },
        tone: 'slick',
        result:
          'You make the question itself the crime. The faithful nod; a quiet ledger of grievance opens.',
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
    title: 'Where the Tithes Go',
    body: `The congregation gives generously, and lately some have begun to ask, politely but pointedly, exactly where the offering ends up.`,
    choices: [
      {
        label: 'Open the ledgers for all to read',
        fx: { support: 10, heat: -6, funds: -4 },
        set: { honest_rep: true, clean_streak: true },
        tone: 'good',
        result:
          'You post the accounts on the door. The transparency costs you a little grandeur and buys you trust.',
      },
      {
        label: 'Channel the surplus into the Treasury, quietly',
        fx: { funds: 12, heat: 8, support: -2 },
        set: { corrupt_streak: true },
        scandal: { id: 'ap_tithe_skim', label: 'the unaccounted offerings', severity: 2 },
        tone: 'slick',
        result:
          'The coffers swell and the questions are smoothly redirected. A receipt that does not exist cannot be found.',
      },
      {
        label: 'Spend it visibly on the poor',
        fx: { support: 8, base: 6, funds: -8 },
        set: { peacemaker: true, grassroots: true },
        tone: 'good',
        result:
          'Bread, blankets, and a procession the cameras adore. The Treasury thins; the congregation swells.',
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
    title: 'The Rumor of a Miracle',
    body: `A story is spreading that, at the last vigil, you healed a dying child with a touch. You know what really happened. The faithful would rather not.`,
    choices: [
      {
        label: 'Cultivate the miracle, say nothing to deny it',
        fx: { support: 10, base: 10, heat: 8 },
        set: { own_cult: true, cult_building: true },
        tone: 'slick',
        result:
          'You let the wonder grow in the telling. Pilgrims begin arriving with the sick and the desperate.',
      },
      {
        label: 'Gently and publicly clarify the truth',
        fx: { support: 6, heat: -6, base: -4 },
        set: { honest_rep: true, secret_reformer: true },
        tone: 'good',
        result:
          'You explain the child was already mending. Some are disappointed; the honest love you for it.',
      },
      {
        label: 'Turn it into a parable about faith',
        roll: {
          stat: 'media',
          dc: 50,
          success: {
            fx: { media: 12, support: 6 },
            text: 'You reframe the rumor as a lesson, not a claim. Elegant — wonder without a lie.',
          },
          fail: {
            fx: { media: -6, heat: 6 },
            text: 'The nuance is lost in retelling. Half the province now expects you to do it again.',
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
    title: 'The Orthodox Price',
    speaker: (S) => ({ name: S.opp, role: 'a senior Orthodox elder', avatar: S.oppAvatar }),
    body: (S) =>
      `${S.opp} arrives with a velvet ultimatum: the Orthodox will bless your elevation, but only if you first denounce the reformers and recant your softer teachings.`,
    choices: [
      {
        label: 'Recant publicly and embrace the old law',
        fx: { media: 8, base: 8, influence: 6, support: -4 },
        set: { hardliner_cred: true, zealot_rep: true },
        tone: 'bold',
        result:
          'You bend the knee to tradition and the elders bless you. The reformers you abandoned remember.',
      },
      {
        label: 'Refuse — keep your conscience and your reformers',
        fx: { support: 8, influence: -6, heat: 4 },
        set: { secret_reformer: true, honest_rep: true },
        tone: 'good',
        result:
          'You decline the blessing and keep your soul. The elder departs with a smile that promises trouble.',
      },
      {
        label: 'Promise the words, mean none of them',
        fx: { influence: 8, heat: 6, media: 2 },
        set: { dealmaker: true },
        tone: 'slick',
        result:
          'You give the Orthodox their recantation and the reformers a wink. Two faces, one elevation.',
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
    title: 'The Magistrate’s Offer',
    body: `A polished government official offers the Covenant land, gold, and protection — in exchange for a few quiet doctrinal accommodations the state finds convenient.`,
    choices: [
      {
        label: 'Take the gold, soften the doctrine',
        fx: { funds: 14, influence: 6, support: -4, heat: 6 },
        set: { dealmaker: true },
        scandal: { id: 'ap_secular_pact', label: 'the secret pact with the magistrate', severity: 2 },
        tone: 'slick',
        result:
          'The Treasury overflows and the sermons quietly adjust. Somewhere a scribe keeps a copy of the bargain.',
      },
      {
        label: 'Refuse — the faith is not for sale',
        fx: { support: 10, base: 6, funds: -4 },
        set: { honest_rep: true, peacemaker: true },
        tone: 'good',
        result:
          'You send the official away empty-handed. Poorer, prouder, and harder to buy next time.',
      },
      {
        label: 'Take the protection, refuse the strings',
        roll: {
          stat: 'influence',
          dc: 52,
          success: {
            fx: { influence: 10, funds: 6, heat: -2 },
            text: 'You pocket the shield and dodge the leash. The official respects a sharper negotiator than expected.',
          },
          fail: {
            fx: { heat: 10, support: -4 },
            text: 'You overplay it; the offer curdles into a grudge with a long memory.',
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
    title: 'The Splinter Preacher',
    body: `In the outer parishes a charismatic splinter group preaches a rival interpretation, drawing crowds and calling you a relic. A schism is a wound that can fester or close.`,
    choices: [
      {
        label: 'Welcome them back with open arms',
        fx: { support: 8, base: 6, heat: -4 },
        set: { peacemaker: true, secret_reformer: true },
        tone: 'good',
        result:
          'You travel to them, listen, and offer a place at the table. Most return; the faith grows a wider door.',
      },
      {
        label: 'Out-preach them and absorb their crowd',
        roll: {
          stat: 'support',
          dc: 52,
          success: {
            fx: { support: 12, base: 8, media: 4 },
            text: 'You hold a counter-vigil so luminous their crowd drifts to you. The splinter quietly dissolves.',
          },
          fail: {
            fx: { support: -8, heat: 6 },
            text: 'Your rally underwhelms beside theirs. The splinter names a martyr and gains a banner.',
          },
        },
        tone: 'bold',
      },
      {
        label: 'Declare them heretics and shut them down',
        fx: { base: 8, media: 4, heat: 12, support: -4 },
        set: { hardliner_cred: true, went_negative: true },
        scandal: { id: 'ap_schism_crackdown', label: 'the suppression of the splinter parish', severity: 2 },
        tone: 'slick',
        result:
          'You brand them outcasts and bar the doors. Order is restored; the resentment goes underground.',
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
    title: 'A Distant Catastrophe',
    body: `A disaster strikes a distant province, and zealous voices in your own ranks are calling it divine judgment — and demanding you bless a march to "cleanse" the survivors.`,
    choices: [
      {
        label: 'Refuse — send aid, not armies',
        fx: { support: 10, base: -4, heat: -6, funds: -8 },
        set: { peacemaker: true, honest_rep: true },
        tone: 'good',
        result:
          'You send grain and healers and call vengeance a sin. The merciful bless you; the zealots seethe.',
      },
      {
        label: 'Bless the march as holy justice',
        fx: { base: 12, media: 6, heat: 16, support: -6 },
        inc: { purge_count: 1 },
        set: { bloody_hands: true, zealot_rep: true },
        tone: 'bold',
        result:
          'You give the rage a scripture to wear. The faithful surge; the cost will be tallied in another ledger.',
      },
      {
        label: 'Stall — call a fast and a council',
        roll: {
          stat: 'influence',
          dc: 54,
          success: {
            fx: { influence: 8, support: 6, heat: -4 },
            text: 'You buy time with solemn ritual, and the fury cools before it can be aimed.',
          },
          fail: {
            fx: { heat: 10, base: -4 },
            text: 'Delay reads as weakness; the zealots act without your blessing, and own you anyway.',
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
    title: 'The Review of Compliance',
    body: `Your hardliners urge you to convene a formal review of doctrinal compliance — names, questions, consequences. A loud skeptic in the back rows would be the first to answer for it.`,
    choices: [
      {
        label: 'Convene a fair, transparent review',
        fx: { support: 6, media: 6, heat: -4 },
        set: { honest_rep: true, secret_reformer: true },
        tone: 'good',
        result:
          'You let everyone speak and publish the findings. It satisfies few and indicts no one. Justice, slow and dull.',
      },
      {
        label: 'Silence the doubter and make an example',
        fx: { base: 10, media: 4, heat: 14, support: -6 },
        inc: { purge_count: 1 },
        set: { bloody_hands: true, own_cult: true },
        scandal: { id: 'ap_silenced_doubter', label: 'the doubter you made vanish', severity: 3 },
        tone: 'bold',
        result:
          'The skeptic is stripped of voice and rank before the assembly. The room learns the new arithmetic of doubt.',
      },
      {
        label: 'Decline the whole exercise',
        fx: { support: 4, base: -4, heat: -2 },
        set: { peacemaker: true },
        tone: 'slick',
        result:
          'You wave the review away as beneath the faith. The hardliners file the refusal under disappointments.',
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
    title: 'The Question of Succession',
    body: `You are not gone, yet the whisper is everywhere: who follows you? How you answer decides whether the Covenant becomes an institution, a dynasty, or a cult of one.`,
    choices: [
      {
        label: 'Establish an open council to choose freely',
        fx: { support: 8, influence: 6, heat: -4 },
        set: { honest_rep: true, peacemaker: true },
        tone: 'good',
        result:
          'You build a process larger than yourself. The faith gains a spine that can outlive any single shepherd.',
      },
      {
        label: 'Name a loyal hardliner to guard the law',
        fx: { base: 10, media: 4, influence: 4 },
        set: { hardliner_cred: true, zealot_rep: true },
        tone: 'bold',
        result:
          'You anoint a true believer who will let nothing soften. The Orthodox exhale; the reformers brace.',
      },
      {
        label: 'Let no one rival you — be the only answer',
        fx: { support: 8, base: 8, heat: 10 },
        set: { own_cult: true, cult_building: true },
        tone: 'slick',
        result:
          'You make succession unthinkable and devotion personal. After you, they will be told, there is only memory.',
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
    body: `The harvest fails and the people are starving. They look to the Covenant: does the faith open its granaries to feed them, or call them to fast and pray through the trial?`,
    choices: [
      {
        label: 'Open the granaries and feed everyone',
        fx: { support: 12, base: 8, funds: -16 },
        set: { peacemaker: true, grassroots: true },
        tone: 'good',
        result:
          'You empty the storehouses without asking who believes. The Treasury bleeds; the gratitude is bottomless.',
      },
      {
        label: 'Call a sacred fast and pray for deliverance',
        roll: {
          stat: 'support',
          dc: 53,
          success: {
            fx: { support: 14, base: 10, media: 6 },
            text: 'The rains come on the third day of the fast. The faithful call it proof; you say nothing to spoil it.',
          },
          fail: {
            fx: { support: -16, heat: 12 },
            text: 'The fast drags on and the graves do not. Prayer, the hungry note, is not bread.',
          },
        },
        tone: 'bold',
      },
      {
        label: 'Feed only the devout, ration by loyalty',
        fx: { base: 10, funds: -6, heat: 12, support: -6 },
        set: { zealot_rep: true, hardliner_cred: true },
        scandal: { id: 'ap_famine_ration', label: 'the bread withheld from the doubtful', severity: 3 },
        tone: 'slick',
        result:
          'The faithful eat; the wavering learn the price of doubt. Devotion has never been so suddenly popular.',
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
    title: 'The Skeptic on the Council',
    speaker: (S) => ({ name: S.opp, role: 'a senior Council member', avatar: S.oppAvatar }),
    body: (S) =>
      `In private, ${S.opp} confesses they no longer believe — yet still serves on your Council, competent and quietly corrosive. A doubter at the heart of the faith is a delicate problem.`,
    choices: [
      {
        label: 'Keep their counsel, protect their secret',
        fx: { influence: 8, support: 4, heat: -2 },
        set: { secret_reformer: true, peacemaker: true },
        tone: 'good',
        result:
          'You shield the doubter and keep their sharp mind close. A faith confident enough to hold a skeptic.',
      },
      {
        label: 'Expose and excommunicate them',
        fx: { base: 10, media: 6, heat: 12, support: -6 },
        inc: { purge_count: 1 },
        set: { bloody_hands: true, went_negative: true },
        scandal: { id: 'ap_council_purge', label: 'the council member you cast out', severity: 2 },
        tone: 'bold',
        result:
          'You name them before the assembly and strip the robe. The Council learns that doubt is no longer survivable.',
      },
      {
        label: 'Quietly demote and reassign them',
        roll: {
          stat: 'influence',
          dc: 50,
          success: {
            fx: { influence: 8, heat: -4 },
            text: 'You shuffle them into harmless obscurity. No drama, no martyr, no loose ends.',
          },
          fail: {
            fx: { heat: 8, support: -4 },
            text: 'The reassignment is read as exile, and the whispers about why begin at once.',
          },
        },
        tone: 'slick',
      },
    ],
  },
];
