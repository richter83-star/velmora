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
    body: `{rival}, currently {disposition}, is sliding into {faction_actor}'s DMs behind your back — and the shiny prize on the table is {stake}. Sit on your ass and the floor drops out from under you; jump first and everyone sees exactly how badly you want it.`,
    choices: [
      {
        label: 'Outbid the bastard — wave fatter cash at {faction_actor}',
        fx: { funds: -8, influence: 8, base: 4 },
        set: { dealmaker: true },
        tone: 'slick',
        result:
          'You buy the whole room before {rival} can clear his throat. It guts your purse, but the prize stays yours.',
      },
      {
        label: 'Drag the dirty little plot into the daylight',
        fx: { media: 7, heat: 8, influence: 3 },
        set: { went_negative: true },
        tone: 'bold',
        result:
          'You yank it out into the open by the scruff. {rival} slinks off, somehow even more of a sourpuss than before.',
      },
      {
        label: "Let it slide — you've got bigger fish frying",
        fx: { influence: -6, support: 3 },
        result: 'You wave off the duel. {rival} pockets the prize and the message: you flinched.',
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
    title: 'The Ones You Left on Read',
    body: `{coolBloc} — the faction you've ghosted hardest — are huddling {venue}, and the word trickling back is {demand}. Cold friends curdle into warm enemies fast if you keep treating them like furniture.`,
    choices: [
      {
        label: 'Haul your ass over there and actually listen',
        fx: { support: 6, influence: 4, funds: -4 },
        set: { grassroots: true },
        tone: 'good',
        result:
          'You turn up where nobody expected you. {coolBloc} thaw a degree or two, suspicious the whole time.',
      },
      {
        label: 'Quietly buy their loyalty back under the table',
        fx: { funds: -10, influence: 6 },
        set: { dealmaker: true, owes_donor: true },
        tone: 'slick',
        result:
          'A discreet little envelope changes hands. {coolBloc} stand down — for now, and for a price you will absolutely pay later.',
      },
      {
        label: "Let 'em stew — strength doesn't grovel",
        fx: { base: 5, heat: 6, support: -4 },
        set: { hardliner_cred: true },
        tone: 'bold',
        result:
          "You make a public art form out of not giving a damn. {coolBloc} won't forget it, and neither will you when they knife you.",
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
    body: `Word reaches you of {pressure} aimed dead-center at your {weakStat} — the soft, squishy gap in your armor that {rival} has clearly been ogling for weeks. The longer it festers, the deeper the knife goes.`,
    choices: [
      {
        label: 'Patch up the {weakStat} no matter what it costs',
        fx: { influence: 6, funds: -6, heat: -3 },
        set: { clean_streak: true },
        tone: 'good',
        result: 'You pour every last coin and favour into the gap. It holds. Barely, but it holds.',
      },
      {
        label: 'Change the damn subject — drown them in the {strongStat}',
        fx: { media: 8, base: 4, heat: 4 },
        tone: 'slick',
        result:
          'You shove your good side under every nose in the room and let the ugly bit smear out of focus.',
      },
      {
        label: 'Find whoever lit this fuse and break their fingers',
        fx: { heat: 10, influence: 4, support: -3 },
        set: { went_negative: true },
        tone: 'bold',
        result:
          'You answer the knife with a bigger knife. The bleeding slows; the gawking crowd does not.',
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
    body: `{warmBloc}, the faction that's been screaming your name the loudest, sent a polite little note: their undying loyalty now comes bundled with {demand}. The ones who carried you up the mountain are a real bitch to tell no.`,
    choices: [
      {
        label: "Cough it up — loyalty's worth the squeeze",
        fx: { influence: 6, funds: -6, base: 5 },
        set: { pledged: true },
        tone: 'good',
        result:
          '{warmBloc} get exactly what they whined for. Their loyalty hardens into something close to a creepy little cult of you.',
      },
      {
        label: 'Tell them no — sweetly — and remind them who runs this',
        fx: { influence: 5, support: -4 },
        set: { honest_rep: true },
        tone: 'bold',
        result:
          'You hold the line and pat them on the head. {warmBloc} bitch and moan, but they stay glued to you.',
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
    body: `For once the shitstorm has blown over, and {venue} the room is finally yours. A rare breather to fatten up your {strongStat} before the next reckoning kicks the door in, while {rival} licks his wounds somewhere out of sight.`,
    choices: [
      {
        label: 'Stack the {strongStat} higher while the coast is clear',
        fx: { influence: 5, base: 5, media: 3 },
        set: { has_network: true },
        tone: 'good',
        result: 'You spend the lull like a pro. The whole machine runs a notch tighter and meaner.',
      },
      {
        label: 'Patch up grudges and bank some goodwill',
        fx: { support: 7, heat: -4 },
        set: { honest_rep: true },
        tone: 'good',
        result:
          'You blow the quiet on people instead of power. It pays you back in patience, which is boring but useful.',
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
    body: `{rival}, currently {disposition}, slid you a back-channel offer: a truce and a slice of {stake}, if you'll stand shoulder to shoulder against the rest of the vultures. The hand is out. You can't see what the other one's doing under the table.`,
    choices: [
      {
        label: 'Shake on it — keep your enemies close and frisked',
        fx: { influence: 8, funds: 5, heat: 4 },
        set: { dealmaker: true },
        tone: 'slick',
        result:
          'You clasp the offered hand. Somewhere, {rival} is smiling, which historically means somebody is about to get screwed.',
      },
      {
        label: "Tell him to pound sand — you don't split a throne",
        fx: { base: 5, support: 3, influence: -3 },
        set: { hardliner_cred: true },
        tone: 'bold',
        result:
          'You send the messenger home empty-handed. {rival} expected nothing less from a stubborn prick like you.',
      },
      {
        label: 'Fake a yes, then bury the blade in his back',
        fx: { influence: 6, heat: 9 },
        set: { went_negative: true, blackmailer: true },
        tone: 'bold',
        result:
          'You take the hand only to learn where the wrist is softest. The double-cross keeps nicely on ice.',
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
    body: `{venue}, {faction_actor} have stopped giving a single damn what the center tells them. They're running wild in your name without so much as a by-your-leave — and your {weakStat} is too pathetically thin to just bark them back into the kennel.`,
    choices: [
      {
        label: 'Buy off their ringleaders before this turns into a wildfire',
        fx: { influence: 7, funds: -5, base: 4 },
        set: { has_network: true },
        tone: 'slick',
        result:
          'You fold the loudmouths into the fold with cushy titles. The center holds, greased and grumbling.',
      },
      {
        label: 'Make a brutal example of the biggest mouth',
        fx: { base: 6, heat: 10, support: -5 },
        set: { bloody_hands: true },
        inc: { purge_count: 1 },
        tone: 'bold',
        result:
          'One example, made loud and made public. The provinces shut the hell up — and start watching you like a cornered cat.',
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
    body: `Some outlet you don't own is running {pressure} — and it paints you exactly the way {rival} jerks off to at night. It'll hit {office} before you do unless you decide right now how to swat it.`,
    choices: [
      {
        label: 'Buy the outlet — or just the spineless editor',
        fx: { funds: -9, media: 8 },
        set: { dark_money: true, owes_donor: true },
        tone: 'slick',
        result:
          'A quiet little acquisition. The next portrait is suddenly so flattering it should be illegal.',
      },
      {
        label: 'Drown it with a better story of your own',
        fx: { media: 6, support: 4, heat: 2 },
        set: { media_friend: true },
        tone: 'good',
        result:
          "You don't bury the story; you blot out its sun until nobody can see the little thing.",
      },
      {
        label: 'Ignore it — the mutts always bark at the next cart',
        fx: { heat: 5, support: -3 },
        result: 'You give it nothing to gnaw on. Starved of you, the story mostly eats itself.',
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
    body: `The great archive is sitting on something with your stink all over it, and {pressure} hints {rival} has been snooping through pages he's got no business touching. Buried shit has a gift for clawing back up at the absolute worst moment.`,
    choices: [
      {
        label: 'Beat him there and scrub the record clean',
        fx: { influence: 6, heat: 7 },
        set: { cooked_books: true },
        tone: 'bold',
        result: 'The incriminating pages develop a very convenient, very suspicious gap. For now.',
      },
      {
        label: 'Get ahead of it — confess the small to smother the huge',
        fx: { media: 5, support: 5, heat: -4 },
        set: { honest_rep: true },
        tone: 'good',
        result:
          'You toss them a tiny truth to gnaw on so they never sniff out the rotting one. Works like a charm. This time.',
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
    body: `So close to the summit you can taste it, and the only thing wedged between you and the top is {stake}. {warmBloc} will carry you the final stretch — in exchange, naturally, for {demand}.`,
    choices: [
      {
        label: 'Promise them the moon; sort the mess out from the top',
        fx: { influence: 9, base: 5, heat: 5 },
        set: { dealmaker: true, owes_donor: true },
        tone: 'slick',
        result:
          "You spend promises you have zero intention of keeping. The summit's closer for the lie.",
      },
      {
        label: 'Crawl the last mile on your own damn terms',
        fx: { support: 6, influence: 4, base: -4 },
        set: { honest_rep: true },
        tone: 'bold',
        result:
          'You spit on the toll and walk the final stretch alone. Lighter in the pockets, and a whole lot more exposed.',
      },
    ],
  },
];
