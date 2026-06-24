/**
 * Loom templates (authored content) — token-bearing event skeletons the grammar
 * weaves with live state (your rival, the bloc you've alienated, your weakest
 * lever) and small fictional lexicons. Each is held to the CORE content-safety
 * bar by the exhaustive build-time weave test (every reachable realization is
 * schema-validated + denylist-scanned). Tokens only fill TEXT; each choice's `fx`
 * is authored fixed, so the effect always matches the narrative.
 *
 * Tokens: state — {rival} {disposition} {weakStat} {strongStat} {coolBloc}
 * {warmBloc} {office}; lexicon (declared per-template in `lex`) — {stake} {venue}
 * {pressure} {faction_actor} {demand}.
 */
import type { Template } from '../engine/grammar/weave';
import type { PathKey } from '../engine/types';

const ALL: PathKey[] = ['ballot', 'vanguard', 'iron', 'gilded', 'anointed'];

export const TEMPLATES: Template[] = [
  {
    id: 'lm_rival_move',
    paths: ALL,
    phases: [1, 2, 3],
    weight: 11,
    art: 'rival',
    lex: ['stake', 'faction_actor'],
    title: 'A Move on the Board',
    body: `{rival}, now {disposition}, is quietly courting {faction_actor} — and the prize on the table is {stake}. Let it stand and the ground shifts under you; move first and you show your hand.`,
    choices: [
      {
        label: 'Outbid them — make {faction_actor} a better offer',
        fx: { funds: -8, influence: 8, base: 4 },
        set: { dealmaker: true },
        tone: 'slick',
        result: 'You buy the room before {rival} can. It costs, but the prize stays yours.',
      },
      {
        label: 'Expose the play before it ripens',
        fx: { media: 7, heat: 8, influence: 3 },
        set: { went_negative: true },
        tone: 'bold',
        result: 'You drag it into the daylight. {rival} retreats, sourer than before.',
      },
      {
        label: 'Let it go — you have bigger fronts',
        fx: { influence: -6, support: 3 },
        result: 'You decline the duel. {rival} takes the prize and the message.',
      },
    ],
  },
  {
    id: 'lm_cold_bloc',
    paths: ALL,
    phases: [2, 3],
    weight: 10,
    art: 'scene',
    lex: ['venue', 'demand'],
    title: 'The Ones You Let Drift',
    body: `{coolBloc} — the faction you have most neglected — are meeting {venue}, and the word coming back is {demand}. Cold allies become warm enemies if you let them.`,
    choices: [
      {
        label: 'Go to them yourself and listen',
        fx: { support: 6, influence: 4, funds: -4 },
        set: { grassroots: true },
        tone: 'good',
        result: 'You show up where you were not expected. {coolBloc} thaw, a little.',
      },
      {
        label: 'Buy back their loyalty quietly',
        fx: { funds: -10, influence: 6 },
        set: { dealmaker: true, owes_donor: true },
        tone: 'slick',
        result: 'A discreet arrangement. {coolBloc} stand down — for now, for a price.',
      },
      {
        label: 'Let them stew — strength answers to no one',
        fx: { base: 5, heat: 6, support: -4 },
        set: { hardliner_cred: true },
        tone: 'bold',
        result: 'You make an example of indifference. {coolBloc} remember it.',
      },
    ],
  },
  {
    id: 'lm_weak_lever',
    paths: ALL,
    phases: [1, 2, 3],
    weight: 11,
    art: 'bulletin',
    lex: ['pressure'],
    title: 'The Crack They Found',
    body: `Word reaches you of {pressure} aimed squarely at your {weakStat} — the soft place in your armor that {rival} has clearly been studying. The longer it sits, the deeper it cuts.`,
    choices: [
      {
        label: 'Shore up the {weakStat} at any cost',
        fx: { influence: 6, funds: -6, heat: -3 },
        set: { clean_streak: true },
        tone: 'good',
        result: 'You pour everything into the gap. It holds.',
      },
      {
        label: 'Change the subject — flood the {strongStat}',
        fx: { media: 8, base: 4, heat: 4 },
        tone: 'slick',
        result: 'You lean on what you are strong in and let the weak spot blur.',
      },
      {
        label: 'Strike at whoever is behind it',
        fx: { heat: 10, influence: 4, support: -3 },
        set: { went_negative: true },
        tone: 'bold',
        result: 'You answer the knife with a knife. The bleeding slows; the scrutiny does not.',
      },
    ],
  },
  {
    id: 'lm_loyal_demand',
    paths: ALL,
    phases: [1, 2],
    weight: 9,
    art: 'scene',
    lex: ['demand'],
    title: 'The Price of the Faithful',
    body: `{warmBloc}, the faction most behind you, have sent word: their continued loyalty now comes with {demand}. The ones who carried you up are the hardest to refuse.`,
    choices: [
      {
        label: 'Grant it — loyalty is worth the cost',
        fx: { influence: 6, funds: -6, base: 5 },
        set: { pledged: true },
        tone: 'good',
        result:
          '{warmBloc} get what they asked. Their loyalty hardens into something like devotion.',
      },
      {
        label: 'Refuse, gently, and remind them who leads',
        fx: { influence: 5, support: -4 },
        set: { honest_rep: true },
        tone: 'bold',
        result: 'You hold the line. {warmBloc} grumble, but they stay.',
      },
    ],
  },
  {
    id: 'lm_consolidate',
    paths: ALL,
    phases: [1, 2, 3],
    weight: 8,
    art: 'scene',
    lex: ['venue'],
    title: 'A Quiet Hour',
    body: `For once the storm has passed, and {venue} the room is yours. A rare chance to consolidate your {strongStat} before the next reckoning, while {rival} regroups out of sight.`,
    choices: [
      {
        label: 'Build on the {strongStat} while you can',
        fx: { influence: 5, base: 5, media: 3 },
        set: { has_network: true },
        tone: 'good',
        result: 'You use the lull well. The machine runs a little tighter.',
      },
      {
        label: 'Mend fences and bank some goodwill',
        fx: { support: 7, heat: -4 },
        set: { honest_rep: true },
        tone: 'good',
        result: 'You spend the quiet on people, not power. It pays in patience.',
      },
    ],
  },
  {
    id: 'lm_overture',
    paths: ALL,
    phases: [1, 2],
    weight: 9,
    art: 'rival',
    lex: ['stake'],
    title: 'An Unexpected Hand',
    body: `{rival}, currently {disposition}, has sent a back-channel offer: a truce, and a share of {stake}, if you will stand together against the others. The hand is extended. You cannot see what is in the other one.`,
    choices: [
      {
        label: 'Take the deal — keep your enemies close',
        fx: { influence: 8, funds: 5, heat: 4 },
        set: { dealmaker: true },
        tone: 'slick',
        result: 'You clasp the offered hand. Somewhere, {rival} is smiling, which is rarely good.',
      },
      {
        label: 'Refuse — you do not share a throne',
        fx: { base: 5, support: 3, influence: -3 },
        set: { hardliner_cred: true },
        tone: 'bold',
        result: 'You send the messenger back empty. {rival} expected nothing less.',
      },
      {
        label: 'Pretend to accept, then turn it on them',
        fx: { influence: 6, heat: 9 },
        set: { went_negative: true, blackmailer: true },
        tone: 'bold',
        result: 'You take the hand only to study the wrist. The double-cross will keep.',
      },
    ],
  },
  {
    id: 'lm_provincial',
    paths: ALL,
    phases: [2, 3],
    weight: 9,
    art: 'crisis',
    lex: ['venue', 'faction_actor'],
    title: 'Trouble in the Provinces',
    body: `{venue}, {faction_actor} have stopped waiting for instructions from the center. They are acting in your name without your leave — and your {weakStat} is too thin to simply command them back into line.`,
    choices: [
      {
        label: 'Co-opt their leaders before this spreads',
        fx: { influence: 7, funds: -5, base: 4 },
        set: { has_network: true },
        tone: 'slick',
        result: 'You fold the ringleaders into the fold. The center holds.',
      },
      {
        label: 'Make a hard example of the loudest',
        fx: { base: 6, heat: 10, support: -5 },
        set: { bloody_hands: true },
        inc: { purge_count: 1 },
        tone: 'bold',
        result: 'One example, publicly made. The provinces go quiet, and watchful.',
      },
    ],
  },
  {
    id: 'lm_press',
    paths: ['ballot', 'gilded', 'iron', 'anointed'],
    phases: [1, 2],
    weight: 9,
    art: 'newspaper',
    lex: ['pressure'],
    title: 'An Unflattering Portrait',
    body: `An outlet you do not control is running {pressure} — and it paints you exactly as {rival} would wish. It will reach {office} before you do unless you decide how to answer.`,
    choices: [
      {
        label: 'Buy the outlet, or at least its editor',
        fx: { funds: -9, media: 8 },
        set: { dark_money: true, owes_donor: true },
        tone: 'slick',
        result: 'A quiet acquisition. The next portrait is far kinder.',
      },
      {
        label: 'Answer it with a better story of your own',
        fx: { media: 6, support: 4, heat: 2 },
        set: { media_friend: true },
        tone: 'good',
        result: 'You do not bury the story; you outshine it.',
      },
      {
        label: 'Ignore it — the dogs will bark at the next caravan',
        fx: { heat: 5, support: -3 },
        result: 'You give it nothing to feed on. Mostly, it starves.',
      },
    ],
  },
  {
    id: 'lm_archive',
    paths: ['vanguard', 'iron', 'gilded', 'anointed'],
    phases: [2, 3],
    weight: 8,
    art: 'bulletin',
    lex: ['pressure'],
    title: 'The Archive Stirs',
    body: `The great archive holds something that touches you, and {pressure} suggests {rival} has been reading where they should not. Buried things have a way of choosing the worst moment to surface.`,
    choices: [
      {
        label: 'Get there first and clean the record',
        fx: { influence: 6, heat: 7 },
        set: { cooked_books: true },
        tone: 'bold',
        result: 'The relevant pages develop a convenient gap. For now.',
      },
      {
        label: 'Get ahead of it — confess the small to hide the large',
        fx: { media: 5, support: 5, heat: -4 },
        set: { honest_rep: true },
        tone: 'good',
        result: 'You give them a smaller truth to chew on. It works, this time.',
      },
    ],
  },
  {
    id: 'lm_consolidate_late',
    paths: ALL,
    phases: [3],
    weight: 8,
    art: 'scene',
    lex: ['stake', 'demand'],
    title: 'The Last Mile',
    body: `So close to the summit now, and the only thing between you and it is {stake}. {warmBloc} will help carry you the final distance — in return, naturally, for {demand}.`,
    choices: [
      {
        label: 'Promise them everything; sort it out from the top',
        fx: { influence: 9, base: 5, heat: 5 },
        set: { dealmaker: true, owes_donor: true },
        tone: 'slick',
        result: 'You spend promises you may not keep. The summit is closer for it.',
      },
      {
        label: 'Climb the last mile on your own terms',
        fx: { support: 6, influence: 4, base: -4 },
        set: { honest_rep: true },
        tone: 'bold',
        result: 'You refuse the toll and walk the last stretch alone. Lighter, and more exposed.',
      },
    ],
  },
];
