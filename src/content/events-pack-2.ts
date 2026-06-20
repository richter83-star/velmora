import type { GameEvent } from '../engine/types';

/**
 * Content pack 2 — second volume expansion toward a commercial-size bank.
 * Adds ballot/vanguard/shared/crisis dilemmas across all three phases, with
 * dice rolls, scandals-with-memory, antagonist relationship shifts, and two
 * delayed `then`-chains (a choice now, a reckoning later). Merged into the draw
 * pool in `all-events.ts` and validated by the content linter like every pack.
 * Fictional and non-partisan by construction — satire of power, not of anyone.
 */
export const PACK_2: GameEvent[] = [
  // ---------------- BALLOT ----------------
  {
    id: 'p2_b_debate',
    paths: ['ballot'],
    phases: [1, 2, 3],
    weight: 9,
    art: 'scene',
    emoji: '🎙️',
    title: 'The Big Debate',
    body: `The lights are hot, the buzzer is merciless, and a single fumbled sentence will outlive every policy you have ever written.`,
    choices: [
      {
        label: 'Go for the memorable zinger',
        roll: {
          stat: 'media',
          dc: 52,
          success: {
            fx: { media: 12, support: 8 },
            text: 'The line lands like a thunderclap. By morning it is a coffee mug.',
          },
          fail: {
            fx: { media: -8, support: -6, heat: 4 },
            text: 'The line dies on contact. The clip of you waiting for laughter loops forever.',
          },
        },
        tone: 'bold',
      },
      {
        label: 'Play it safe — stay on message',
        fx: { support: 4, base: 2, media: 1 },
        tone: 'good',
        result: 'No fireworks, no disasters. The pundits call it "presidential," which means dull.',
      },
    ],
  },
  {
    id: 'p2_b_townhall',
    paths: ['ballot'],
    phases: [1, 2],
    weight: 8,
    art: 'scene',
    emoji: '🪑',
    title: 'The Hostile Town Hall',
    body: `A voter stands up, voice shaking with anger, and asks the one question your staff begged you to avoid.`,
    choices: [
      {
        label: 'Answer honestly, even if it stings',
        roll: {
          stat: 'support',
          dc: 50,
          success: {
            fx: { support: 10, base: 6 },
            text: 'You level with them. The room goes quiet, then warm. Candor is a rare currency.',
          },
          fail: {
            fx: { support: -6, media: -4 },
            text: 'Honesty without polish bruises. The clip is captioned uncharitably.',
          },
        },
        tone: 'bold',
      },
      {
        label: 'Pivot to a rehearsed talking point',
        fx: { media: 2, base: -4, heat: 2 },
        tone: 'slick',
        result: 'You glide past the question. The questioner sits down, unsatisfied, and starts a thread.',
      },
    ],
  },
  {
    id: 'p2_b_superpac',
    paths: ['ballot'],
    phases: [2, 3],
    weight: 8,
    art: 'newspaper',
    emoji: '💰',
    title: 'The Shadow Money',
    body: `An "independent" group with a patriotic name and an unlisted donor wants to carpet-bomb the airwaves on your behalf. You cannot legally coordinate. You can, however, wink.`,
    choices: [
      {
        label: 'Wink, and look away',
        fx: { media: 10, funds: 6, heat: 10 },
        set: { dark_money: true },
        scandal: { id: 'shadow_money', label: 'the untraceable ad blitz', severity: 2 },
        tone: 'slick',
        result: 'The ads are devastating and deniable. Somewhere a reporter starts pulling a thread.',
      },
      {
        label: 'Publicly disavow them',
        fx: { support: 8, base: 4, media: -2 },
        set: { clean_hands: true },
        tone: 'good',
        result: 'You denounce the help you secretly wanted. Reformers cheer; your ad budget weeps.',
      },
    ],
  },
  {
    id: 'p2_b_megaproject',
    paths: ['ballot'],
    phases: [1, 2],
    weight: 8,
    art: 'bulletin',
    emoji: '🏗️',
    title: 'The Ribbon-Cutting Promise',
    body: `You can promise the district a gleaming megaproject — a bridge, a stadium, a future. The crowd would love it. The budget has not been consulted.`,
    choices: [
      {
        label: 'Promise it big, sort the money later',
        fx: { support: 12, base: 6, media: 6 },
        set: { promised_megaproject: true },
        then: [{ id: 'p2_b_megaproject_due', inTurns: 3 }],
        tone: 'bold',
        result: 'The golden shovels gleam. The invoice is a problem for a future, more tired version of you.',
      },
      {
        label: 'Promise only what you can fund',
        fx: { base: -2, influence: 6, support: 2 },
        tone: 'good',
        result: 'You pledge a modest, fully-costed improvement. Nobody cheers for a sensible culvert.',
      },
    ],
  },
  {
    id: 'p2_b_megaproject_due',
    paths: ['ballot'],
    phases: [1, 2, 3],
    weight: 6,
    queueOnly: true,
    art: 'newspaper',
    emoji: '🧾',
    title: 'The Megaproject Comes Due',
    body: `The gleaming project you promised is now a half-dug pit and a spiraling cost estimate. The press has photographs of the pit.`,
    choices: [
      {
        label: 'Pour in the money and finish it',
        req: (S) => S.stats.funds >= 14,
        reqText: 'Needs War Chest 14+',
        fx: { funds: -14, support: 12, base: 6 },
        tone: 'good',
        result: 'You cut the ribbon at last. "Promise kept" is the most expensive headline you will ever buy.',
      },
      {
        label: 'Quietly cancel and blame the contractors',
        fx: { support: -10, heat: 6, base: -4 },
        tone: 'slick',
        result: 'You point at the contractors. The pit remains, now a monument to your optimism.',
      },
    ],
  },
  {
    id: 'p2_b_oppo_dossier',
    paths: ['ballot'],
    phases: [2, 3],
    weight: 8,
    art: 'rival',
    emoji: '📁',
    title: 'The Dossier',
    speaker: (S) => ({ name: S.opp, role: 'your rival', avatar: S.oppAvatar }),
    body: (S) =>
      `A staffer slides you a folder: unflattering, unverified, and very possibly true material about ${S.opp}. Using it would be a knife fight in a phone booth.`,
    choices: [
      {
        label: 'Leak it through a friendly outlet',
        fx: { media: 6, support: 4, heat: 8 },
        set: { went_negative: true },
        npcFx: { id: 'antagonist', relationship: -16 },
        tone: 'slick',
        result: 'The story runs. Your rival vows revenge, and the gloves are now permanently off.',
      },
      {
        label: 'Refuse to touch it',
        fx: { base: 6, support: 2 },
        npcFx: { id: 'antagonist', relationship: 8 },
        tone: 'good',
        result: 'You shred the folder. Even your rival, hearing of it, gives a grudging nod.',
      },
    ],
  },
  {
    id: 'p2_b_celebrity',
    paths: ['ballot'],
    phases: [1, 2, 3],
    weight: 7,
    art: 'scene',
    emoji: '🌟',
    title: 'The Celebrity Endorsement',
    body: `A wildly famous entertainer wants to stump for you. Enormous reach, enormous ego, and a history of saying startling things into live microphones.`,
    choices: [
      {
        label: 'Put them on the main stage',
        roll: {
          stat: 'media',
          dc: 48,
          success: {
            fx: { media: 12, support: 8, base: 4 },
            text: 'They are magnetic and, mercifully, on-message. The rally trends for the right reasons.',
          },
          fail: {
            fx: { media: -6, heat: 6, support: -4 },
            text: 'They improvise. You spend two days explaining what they meant.',
          },
        },
        tone: 'bold',
      },
      {
        label: 'A quiet photo, nothing live',
        fx: { media: 4, funds: 4 },
        tone: 'slick',
        result: 'One controlled photo, one controlled caption. Boring, safe, effective.',
      },
    ],
  },

  // ---------------- VANGUARD ----------------
  {
    id: 'p2_v_show_trial',
    paths: ['vanguard'],
    phases: [2, 3],
    weight: 8,
    art: 'bulletin',
    emoji: '⚖️',
    title: 'The Show Trial',
    body: `A disgraced official is to be tried. The verdict is, of course, already written. The Centre wants to know how loudly you will applaud.`,
    choices: [
      {
        label: 'Demand the harshest sentence',
        fx: { base: 10, influence: 6, heat: 10, support: -4 },
        inc: { purge_count: 1 },
        set: { bloody_hands: true },
        scandal: { id: 'show_trial', label: 'your role in the rigged tribunal', severity: 3 },
        npcFx: { id: 'antagonist', relationship: -10 },
        tone: 'bold',
        result: 'You bay for blood and the Centre nods. Files are kept. Files are always kept.',
      },
      {
        label: 'Mumble through the minimum',
        fx: { heat: 4, base: -4, support: 4 },
        tone: 'slick',
        result: 'You clap just enough to survive and just little enough to sleep. A delicate arithmetic.',
      },
    ],
  },
  {
    id: 'p2_v_parade',
    paths: ['vanguard'],
    phases: [1, 2, 3],
    weight: 8,
    art: 'bulletin',
    emoji: '🎺',
    title: 'The Anniversary Parade',
    body: `The great parade approaches: missiles on trucks, children with flags, and a reviewing stand where your exact position signals your exact rank.`,
    choices: [
      {
        label: 'Angle for a spot near the front',
        fx: { influence: 8, base: 4, heat: 6 },
        set: { climber_rep: true },
        tone: 'slick',
        result: 'You maneuver three places closer to the center. Everyone notices. Everyone always notices.',
      },
      {
        label: 'Stand modestly and applaud the workers',
        fx: { support: 8, base: 4, heat: -4 },
        tone: 'good',
        result: 'You cheer the marching crowds, not yourself. The cameras find your humble smile anyway.',
      },
    ],
  },
  {
    id: 'p2_v_favor_owed',
    paths: ['vanguard'],
    phases: [1, 2],
    weight: 8,
    art: 'scene',
    emoji: '🤝',
    title: "A Patron's Generosity",
    body: `A senior figure clears an obstacle from your path before you even ask — a rival reassigned, a file misplaced. Generosity like this is a loan with terrible interest.`,
    choices: [
      {
        label: 'Accept gratefully, owe the debt',
        fx: { influence: 12, base: 4 },
        set: { owes_patron: true },
        then: [{ id: 'p2_v_favor_called', inTurns: 3 }],
        tone: 'slick',
        result: 'Your climb suddenly gets easier. Somewhere, a ledger gains a line with your name on it.',
      },
      {
        label: 'Decline — keep your hands free',
        fx: { base: 6, influence: -4, heat: -2 },
        tone: 'bold',
        result: 'You thank them and refuse. Independence is a luxury you have chosen to afford.',
      },
    ],
  },
  {
    id: 'p2_v_favor_called',
    paths: ['vanguard'],
    phases: [1, 2, 3],
    weight: 6,
    queueOnly: true,
    art: 'scene',
    emoji: '📜',
    title: 'The Favor Is Called',
    body: `Your patron's envoy arrives, smiling. The debt is due: bury an inconvenient inquiry, and bury the inspector with it.`,
    choices: [
      {
        label: 'Pay the debt — do as asked',
        fx: { influence: 8, heat: 12, support: -6 },
        set: { patron_owns: true },
        scandal: { id: 'buried_inquiry', label: 'the inquiry you made disappear', severity: 2 },
        tone: 'slick',
        result: 'The inquiry evaporates. You are now, irreversibly, someone who makes things evaporate.',
      },
      {
        label: 'Refuse and make a powerful enemy',
        fx: { base: 6, influence: -10, heat: 6 },
        set: { defied_patron: true },
        tone: 'bold',
        result: 'You say no. The smile vanishes. You have traded a debt for a vendetta.',
      },
    ],
  },
  {
    id: 'p2_v_rationing',
    paths: ['vanguard'],
    phases: [2, 3],
    weight: 8,
    art: 'crisis',
    emoji: '🍞',
    title: 'The Rationing Decree',
    body: `The warehouses are thin. You can ration fairly and admit scarcity, or stage abundance for the cameras while the queues grow at dawn.`,
    choices: [
      {
        label: 'Ration honestly, share the burden',
        roll: {
          stat: 'support',
          dc: 50,
          success: {
            fx: { support: 12, base: 6 },
            text: 'You take a cut yourself and say so. The people grumble, then respect the fairness.',
          },
          fail: {
            fx: { support: -8, heat: 6 },
            text: 'Fairness satisfies no one who is hungry. The grumbling sharpens.',
          },
        },
        tone: 'good',
      },
      {
        label: 'Stage abundance, hide the queues',
        fx: { media: 8, influence: 4, heat: 8 },
        set: { potemkin: true },
        tone: 'slick',
        result: 'The newsreels groan with bread. The queues, off-camera, groan louder.',
      },
    ],
  },
  {
    id: 'p2_v_statue',
    paths: ['vanguard'],
    phases: [2, 3],
    weight: 7,
    art: 'scene',
    emoji: '🗿',
    title: 'They Want to Build a Statue',
    body: `A zealous committee proposes a colossal statue of you in the central square — bronze, heroic, faintly ridiculous. Vanity is a trap, but so is false modesty.`,
    choices: [
      {
        label: 'Approve the monument',
        fx: { base: 10, media: 6, funds: -8, heat: 6 },
        set: { cult_of_self: true },
        tone: 'bold',
        result: 'The bronze you gazes nobly at the horizon. The real you hopes it ages better than most.',
      },
      {
        label: 'Decline — "a school instead"',
        fx: { support: 10, base: -2, heat: -4 },
        set: { ascetic_rep: true },
        tone: 'good',
        result: 'You redirect the bronze budget to a schoolhouse. The gesture is photographed extensively.',
      },
    ],
  },
  {
    id: 'p2_v_defector',
    paths: ['vanguard'],
    phases: [2, 3],
    weight: 8,
    art: 'rival',
    emoji: '🛂',
    title: 'The Defector',
    speaker: (S) => ({ name: S.opp, role: 'a rival official', avatar: S.oppAvatar }),
    body: (S) =>
      `A mid-level official has fled across the border, and ${S.opp} is hinting, loudly, that you signed off on their travel papers. You did not. Truth is slow; rumor is fast.`,
    choices: [
      {
        label: 'Get ahead of it — strangle the rumor',
        roll: {
          stat: 'influence',
          dc: 52,
          success: {
            fx: { influence: 8, base: 6, heat: -4 },
            text: 'You produce the real paperwork before the lie sets. The smear curdles on your rival instead.',
          },
          fail: {
            fx: { heat: 10, support: -6 },
            text: 'The denial arrives after the accusation, which is to say, too late.',
          },
        },
        npcFx: { id: 'antagonist', relationship: -8 },
        tone: 'bold',
      },
      {
        label: 'Stay silent and let it blow over',
        fx: { heat: 6, influence: -2 },
        tone: 'slick',
        result: 'You say nothing and hope. Hope is not a counter-intelligence strategy.',
      },
    ],
  },

  // ---------------- SHARED ----------------
  {
    id: 'p2_s_biographer',
    paths: ['ballot', 'vanguard'],
    phases: [1, 2, 3],
    weight: 7,
    art: 'scene',
    emoji: '📖',
    title: 'The Official Biographer',
    body: `A flattering writer wants to chronicle your rise. They will make you a legend — and, in doing so, learn where every body is buried.`,
    choices: [
      {
        label: 'Grant full access',
        fx: { media: 10, support: 4, heat: 6 },
        set: { has_biographer: true },
        tone: 'slick',
        result: 'The hagiography will be magnificent. The research, less so, if it ever leaks.',
      },
      {
        label: 'Keep them at arm’s length',
        fx: { base: 4, heat: -2 },
        tone: 'good',
        result: 'You give them anecdotes and nothing dangerous. The book is thinner and safer.',
      },
    ],
  },
  {
    id: 'p2_s_anonymous_leak',
    paths: ['ballot', 'vanguard'],
    phases: [2, 3],
    weight: 8,
    art: 'newspaper',
    emoji: '🕳️',
    title: 'The Anonymous Leak',
    body: `Internal documents are seeping into the press, one embarrassing page at a time. Someone inside your own house is holding the hose.`,
    choices: [
      {
        label: 'Hunt the leaker, ruthlessly',
        roll: {
          stat: 'influence',
          dc: 54,
          success: {
            fx: { influence: 8, base: 6, heat: 2 },
            text: 'You find the source and make a quiet, total example. The leaks stop overnight.',
          },
          fail: {
            fx: { heat: 12, support: -6 },
            text: 'Your dragnet catches loyalists and headlines. The real leaker keeps leaking.',
          },
        },
        set: { leak_hunt: true },
        scandal: { id: 'leak_purge', label: 'the heavy-handed leak hunt', severity: 2 },
        tone: 'bold',
      },
      {
        label: 'Starve it of oxygen — say nothing',
        fx: { media: -2, heat: -2, base: 2 },
        tone: 'good',
        result: 'You refuse to feed the story. Deprived of your panic, it slowly loses the front page.',
      },
    ],
  },
  {
    id: 'p2_s_envoy',
    paths: ['ballot', 'vanguard'],
    phases: [1, 2, 3],
    weight: 7,
    art: 'scene',
    emoji: '🌍',
    title: 'The Foreign Envoy',
    body: `A polished envoy from a wealthy power offers friendship, investment, and a quiet expectation of favors that will arrive later, unannounced.`,
    choices: [
      {
        label: 'Embrace the partnership',
        fx: { funds: 12, influence: 6, base: -4 },
        set: { foreign_friends: true },
        tone: 'slick',
        result: 'The investment is real and generous. So, eventually, will be the asking price.',
      },
      {
        label: 'Keep a polite distance',
        fx: { base: 6, support: 2, funds: -2 },
        tone: 'good',
        result: 'You shake hands and commit to nothing. Sovereignty is cheaper to keep than to buy back.',
      },
    ],
  },
  {
    id: 'p2_s_protege',
    paths: ['ballot', 'vanguard'],
    phases: [1, 2],
    weight: 7,
    art: 'scene',
    emoji: '🌱',
    title: 'The Rising Protégé',
    body: `A brilliant young deputy is hungry, capable, and clearly studying your every move. A protégé is an asset that grows teeth.`,
    choices: [
      {
        label: 'Mentor and elevate them',
        fx: { influence: 8, base: 6, support: 2 },
        set: { has_protege: true },
        tone: 'good',
        result: 'You build a loyal lieutenant. You also build, perhaps, a future rival with your own playbook.',
      },
      {
        label: 'Keep them small and grateful',
        fx: { influence: 4, heat: 4, base: -2 },
        tone: 'slick',
        result: 'You clip their wings just enough. Resentment is patient, and it remembers.',
      },
    ],
  },
  {
    id: 'p2_s_birthday',
    paths: ['ballot', 'vanguard'],
    phases: [1, 2, 3],
    weight: 6,
    art: 'scene',
    emoji: '🎂',
    title: 'The Lavish Birthday',
    body: `Your inner circle has planned an extravagant birthday gala in your honor. It would be a delightful evening and a terrible photograph.`,
    choices: [
      {
        label: 'Enjoy the gala in full',
        fx: { base: 6, funds: -6, heat: 6 },
        tone: 'slick',
        result: 'The cake is enormous and so, the next day, is the op-ed about the cake.',
      },
      {
        label: 'Downsize it into a charity drive',
        fx: { support: 8, media: 4, base: -2 },
        tone: 'good',
        result: 'You swap the ice sculpture for a food bank. The optics practically gift-wrap themselves.',
      },
    ],
  },

  // ---------------- CRISES ----------------
  {
    id: 'p2_c_fever',
    paths: ['ballot', 'vanguard'],
    phases: [1, 2, 3],
    weight: 10,
    crisis: true,
    art: 'crisis',
    emoji: '🦠',
    title: 'The Fever Spreads',
    body: `A fast-moving sickness jumps from district to district. The hospitals are filling, the public is frightened, and every hour of delay is counted later.`,
    choices: [
      {
        label: 'Lock down hard and early',
        roll: {
          stat: 'support',
          dc: 53,
          success: {
            fx: { support: 12, influence: 6, funds: -8 },
            text: 'You move fast and the curve bends. The cost is real, but so are the empty hospital beds.',
          },
          fail: {
            fx: { support: -10, heat: 8 },
            text: 'You move fast and the public revolts at the cost before they see the benefit.',
          },
        },
        set: { locked_down: true },
        tone: 'bold',
      },
      {
        label: 'Keep things open, project calm',
        fx: { funds: 6, support: -6, heat: 10 },
        tone: 'slick',
        result: 'The economy hums a while longer. The wards fill quietly, and the ledger waits.',
      },
    ],
  },
  {
    id: 'p2_c_border',
    paths: ['ballot', 'vanguard'],
    phases: [2, 3],
    weight: 8,
    crisis: true,
    art: 'crisis',
    emoji: '🚧',
    title: 'The Border Provocation',
    body: `A neighbor's troops "stray" across the line and sit there, daring you to react. Too soft looks weak; too hard looks like a war you cannot name.`,
    choices: [
      {
        label: 'Answer with a show of force',
        roll: {
          stat: 'base',
          dc: 54,
          success: {
            fx: { base: 12, support: 8, heat: 6 },
            text: 'You mass your forces and stare them down. They blink, and you look like a wall.',
          },
          fail: {
            fx: { support: -8, heat: 14 },
            text: 'The standoff escalates and the cost in nerves and treasure climbs by the hour.',
          },
        },
        tone: 'bold',
      },
      {
        label: 'Open a quiet back-channel',
        fx: { influence: 8, support: 2, base: -4 },
        set: { dealmaker: true },
        tone: 'slick',
        result: 'A discreet phone call walks everyone back from the edge. Hawks call it weakness; the living call it Tuesday.',
      },
    ],
  },
  {
    id: 'p2_c_blackout',
    paths: ['ballot', 'vanguard'],
    phases: [1, 2, 3],
    weight: 9,
    crisis: true,
    art: 'crisis',
    emoji: '🔌',
    title: 'The Grid Fails',
    body: `At dusk the lights die across the capital. Elevators stop, traffic snarls, and a nervous city looks to see whether you panic.`,
    choices: [
      {
        label: 'Take personal command of the response',
        roll: {
          stat: 'influence',
          dc: 50,
          success: {
            fx: { influence: 10, support: 8, base: 4 },
            text: 'You set up a command post and the power returns by dawn. Competence, visibly performed, is gold.',
          },
          fail: {
            fx: { support: -8, heat: 8 },
            text: 'You take charge and own the chaos when the grid stays dark into a second night.',
          },
        },
        tone: 'bold',
      },
      {
        label: 'Delegate and reassure the public',
        fx: { media: 6, support: 2, base: -2 },
        tone: 'good',
        result: 'You hand the wrench to the engineers and the microphone to yourself. A reasonable division of labor.',
      },
    ],
  },
];
