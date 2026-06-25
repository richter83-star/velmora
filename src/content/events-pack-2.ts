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
    body: `The lights are roasting your skull, the buzzer hates you personally, and one half-swallowed sentence will outlive every policy you ever bothered to write.`,
    choices: [
      {
        label: 'Swing for the killer zinger',
        roll: {
          stat: 'media',
          dc: 52,
          success: {
            fx: { media: 12, support: 8 },
            text: 'The line lands like a brick through a window. By breakfast some clown is selling it on a coffee mug.',
          },
          fail: {
            fx: { media: -8, support: -6, heat: 4 },
            text: 'The line dies face-down in the mud. The clip of you standing there waiting for a laugh that never comes loops until the heat death of the universe.',
          },
        },
        tone: 'bold',
      },
      {
        label: 'Play it safe — hug the talking points',
        fx: { support: 4, base: 2, media: 1 },
        tone: 'good',
        result:
          'No fireworks, no faceplant. The pundits call it "presidential," which is a polite word for boring as hell.',
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
    body: `A voter heaves themselves up, voice trembling with pure rage, and lobs the exact question your staff got down on their knees and begged you to dodge.`,
    choices: [
      {
        label: 'Answer straight, even if it draws blood',
        roll: {
          stat: 'support',
          dc: 50,
          success: {
            fx: { support: 10, base: 6 },
            text: 'You give it to them raw and unspun. The room goes dead silent, then thaws into something like respect. Honesty is rarer than a unicorn in this racket.',
          },
          fail: {
            fx: { support: -6, media: -4 },
            text: 'Honesty without makeup leaves a bruise. The clip gets captioned by someone who clearly wants you dead.',
          },
        },
        tone: 'bold',
      },
      {
        label: 'Pivot to a rehearsed nothing-burger',
        fx: { media: 2, base: -4, heat: 2 },
        tone: 'slick',
        result:
          'You glide right past the question like a greased eel. The questioner sits down seething and immediately starts a forty-post thread about you.',
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
    body: `An "independent" outfit with a flag-waving name and a donor nobody can find wants to nuke the airwaves on your behalf. Coordinating is illegal. Winking, last anyone checked, is not.`,
    choices: [
      {
        label: 'Wink, then study the ceiling',
        fx: { media: 10, funds: 6, heat: 10 },
        set: { dark_money: true },
        scandal: { id: 'shadow_money', label: 'the untraceable ad blitz', severity: 2 },
        tone: 'slick',
        result:
          'The ads are brutal, gorgeous, and completely deniable. Somewhere a sweaty reporter starts yanking on one loose thread.',
      },
      {
        label: 'Publicly disown the bastards',
        fx: { support: 8, base: 4, media: -2 },
        set: { clean_hands: true },
        tone: 'good',
        result:
          'You loudly denounce the exact help you were quietly praying for. The do-gooders applaud; your ad budget quietly sobs in a corner.',
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
    body: `You can promise the district a shiny mega-thing — a bridge, a stadium, a glorious tomorrow. The crowd will lose its mind. The budget has not been informed of any of this.`,
    choices: [
      {
        label: 'Promise it huge, find the money later (lol)',
        fx: { support: 12, base: 6, media: 6 },
        set: { promised_megaproject: true },
        then: [{ id: 'p2_b_megaproject_due', inTurns: 3 }],
        tone: 'bold',
        result:
          'The golden shovels gleam in the sun. The invoice is a headache for some future, more hungover version of you.',
      },
      {
        label: 'Promise only what you can actually afford',
        fx: { base: -2, influence: 6, support: 2 },
        tone: 'good',
        result:
          'You pledge a modest, fully-costed little upgrade. Turns out nobody throws their hat in the air for a sensible drainage ditch.',
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
    body: `The glittering project you swore to build is now a muddy hole and a cost estimate that keeps having children. The press, naturally, has gorgeous high-resolution photos of the hole.`,
    choices: [
      {
        label: 'Dump in the cash and damn well finish it',
        req: (S) => S.stats.funds >= 14,
        reqText: 'Needs War Chest 14+',
        fx: { funds: -14, support: 12, base: 6 },
        tone: 'good',
        result:
          'You finally cut the ribbon. "Promise kept" is the single most expensive headline you will ever be conned into buying.',
      },
      {
        label: 'Quietly kill it and pin it on the contractors',
        fx: { support: -10, heat: 6, base: -4 },
        tone: 'slick',
        result:
          'You point a trembling finger at the contractors. The hole remains, now a proud monument to your big stupid optimism.',
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
      `A staffer slides a folder across your desk: ugly, unverified, and — God help everyone — quite possibly true filth about ${S.opp}. Using it would be a knife fight in a broom closet.`,
    choices: [
      {
        label: 'Leak it through a friendly rag',
        fx: { media: 6, support: 4, heat: 8 },
        set: { went_negative: true },
        npcFx: { id: 'antagonist', relationship: -16 },
        tone: 'slick',
        result:
          'The story runs and runs. Your rival swears bloody vengeance, and the gloves are now off for good, possibly the bones too.',
      },
      {
        label: 'Refuse to lay a finger on it',
        fx: { base: 6, support: 2 },
        npcFx: { id: 'antagonist', relationship: 8 },
        tone: 'good',
        result:
          'You feed the folder to the shredder. Even your rival, hearing about it, gives a small grudging nod, like a wolf tipping its hat.',
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
    body: `A wildly famous entertainer wants to stump for you. Gigantic reach, a planet-sized ego, and a long résumé of saying truly deranged things directly into hot microphones.`,
    choices: [
      {
        label: 'Hand them the main stage',
        roll: {
          stat: 'media',
          dc: 48,
          success: {
            fx: { media: 12, support: 8, base: 4 },
            text: 'They are electric and, by some miracle, actually on-message. The rally trends for once for reasons that do not require an apology tour.',
          },
          fail: {
            fx: { media: -6, heat: 6, support: -4 },
            text: 'They start improvising. You then spend two full days explaining to the nation what they "really meant."',
          },
        },
        tone: 'bold',
      },
      {
        label: 'One quiet photo, nothing live',
        fx: { media: 4, funds: 4 },
        tone: 'slick',
        result:
          'One controlled photo, one controlled caption, zero hot mics. Dull, safe, and it works.',
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
    body: `A disgraced official is going on trial. The verdict, obviously, was typed up weeks ago. The Centre just wants to know exactly how loud and how slobberingly you intend to applaud.`,
    choices: [
      {
        label: 'Howl for the harshest sentence',
        fx: { base: 10, influence: 6, heat: 10, support: -4 },
        inc: { purge_count: 1 },
        set: { bloody_hands: true },
        scandal: { id: 'show_trial', label: 'your role in the rigged tribunal', severity: 3 },
        npcFx: { id: 'antagonist', relationship: -10 },
        tone: 'bold',
        result:
          'You bay for blood and the Centre nods along, pleased. Files get kept. In this place, the files are ALWAYS kept.',
      },
      {
        label: 'Mumble through the bare minimum',
        fx: { heat: 4, base: -4, support: 4 },
        tone: 'slick',
        result:
          'You clap just hard enough to survive and just soft enough to still sleep at night. A very delicate little bit of arithmetic.',
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
    body: `The great parade looms: missiles riding flatbeds, kids waving flags they can't read, and a reviewing stand where your exact spot screams your exact rank to everyone with eyes.`,
    choices: [
      {
        label: 'Elbow your way toward the front',
        fx: { influence: 8, base: 4, heat: 6 },
        set: { climber_rep: true },
        tone: 'slick',
        result:
          'You shuffle three precious places closer to the centre. Everyone clocks it. In this crowd, everyone ALWAYS clocks it.',
      },
      {
        label: 'Stand back and clap for the workers',
        fx: { support: 8, base: 4, heat: -4 },
        tone: 'good',
        result:
          'You cheer the marching mob instead of yourself. The cameras hunt down your humble little smile regardless.',
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
    body: `A big fish clears a rock out of your path before you even think to ask — a rival reassigned to nowhere, a file that "fell behind a cabinet." Generosity like this is a loan at loan-shark rates.`,
    choices: [
      {
        label: 'Take it with a smile, swallow the debt',
        fx: { influence: 12, base: 4 },
        set: { owes_patron: true },
        then: [{ id: 'p2_v_favor_called', inTurns: 3 }],
        tone: 'slick',
        result:
          'Suddenly the climb gets a whole lot smoother. Somewhere, in some ledger, a fresh line appears with your name scrawled next to a very large number.',
      },
      {
        label: 'Decline — keep your hands clean',
        fx: { base: 6, influence: -4, heat: -2 },
        tone: 'bold',
        result:
          'You thank them and walk. Independence is a luxury, and you have decided, foolishly or not, that you can afford it.',
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
    body: `Your patron's errand boy shows up grinning. The tab is due: bury one inconvenient inquiry, and bury the inspector running it right alongside.`,
    choices: [
      {
        label: 'Pay up — do the dirty thing',
        fx: { influence: 8, heat: 12, support: -6 },
        set: { patron_owns: true },
        scandal: { id: 'buried_inquiry', label: 'the inquiry you made disappear', severity: 2 },
        tone: 'slick',
        result:
          'The inquiry vanishes into thin air. You are now, forever and irreversibly, a guy who makes inquiries vanish. Welcome to the family.',
      },
      {
        label: 'Refuse and make a dangerous enemy',
        fx: { base: 6, influence: -10, heat: 6 },
        set: { defied_patron: true },
        tone: 'bold',
        result:
          'You say no. The grin drops off his face like a dead bird. You have just swapped a debt for a blood feud.',
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
    body: `The warehouses are running on fumes. You can ration honestly and cop to the shortage, or fake a feast for the cameras while the bread lines stretch around the block before sunrise.`,
    choices: [
      {
        label: 'Ration honestly, eat the pain together',
        roll: {
          stat: 'support',
          dc: 50,
          success: {
            fx: { support: 12, base: 6 },
            text: 'You take a cut for yourself too and say so out loud. The people grumble, then grudgingly respect a leader who bleeds with them.',
          },
          fail: {
            fx: { support: -8, heat: 6 },
            text: 'Turns out fairness feeds nobody. A growling stomach does not give a damn about your noble little gesture, and the grumbling gets teeth.',
          },
        },
        tone: 'good',
      },
      {
        label: 'Fake the feast, hide the lines',
        fx: { media: 8, influence: 4, heat: 8 },
        set: { potemkin: true },
        tone: 'slick',
        result:
          'The newsreels groan under mountains of fake bread. The real bread lines, just out of frame, groan a hell of a lot louder.',
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
    body: `A pack of bootlickers proposes a colossal statue of you in the central square — bronze, heroic, and faintly hilarious. Vanity is a trap. So, irritatingly, is fake humility.`,
    choices: [
      {
        label: 'Approve the giant bronze you',
        fx: { base: 10, media: 6, funds: -8, heat: 6 },
        set: { cult_of_self: true },
        tone: 'bold',
        result:
          'Bronze-you gazes nobly off at the horizon. Real-you privately prays the thing ages better than you do.',
      },
      {
        label: 'Decline — "build a school instead"',
        fx: { support: 10, base: -2, heat: -4 },
        set: { ascetic_rep: true },
        tone: 'good',
        result:
          'You shovel the bronze budget into a schoolhouse. The selfless gesture is, of course, photographed from roughly nine hundred flattering angles.',
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
      `A mid-level paper-pusher just bolted across the border, and ${S.opp} is loudly hinting to anyone who'll listen that you personally signed their travel papers. You did not. But truth crawls, and rumor sprints.`,
    choices: [
      {
        label: 'Get out front — choke the rumor dead',
        roll: {
          stat: 'influence',
          dc: 52,
          success: {
            fx: { influence: 8, base: 6, heat: -4 },
            text: 'You slap down the real paperwork before the lie can set. The smear curdles and slides right back onto your rival instead. Delicious.',
          },
          fail: {
            fx: { heat: 10, support: -6 },
            text: 'Your denial shows up well after the accusation, which in this game means it shows up dead on arrival.',
          },
        },
        npcFx: { id: 'antagonist', relationship: -8 },
        tone: 'bold',
      },
      {
        label: 'Zip it and pray it blows over',
        fx: { heat: 6, influence: -2 },
        tone: 'slick',
        result:
          'You say nothing and hope real hard. Hope, it turns out, is not a counter-intelligence strategy.',
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
    body: `A fawning scribbler wants to chronicle your glorious rise. They will turn you into a legend — and, along the way, learn exactly where every single body is buried.`,
    choices: [
      {
        label: 'Throw the doors wide open',
        fx: { media: 10, support: 4, heat: 6 },
        set: { has_biographer: true },
        tone: 'slick',
        result:
          'The puff piece will be downright heavenly. The research notes, should they ever leak, considerably less so.',
      },
      {
        label: 'Keep them at arm’s length',
        fx: { base: 4, heat: -2 },
        tone: 'good',
        result:
          'You feed them cute anecdotes and nothing that could get you indicted. The book comes out thinner, and a lot safer.',
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
    body: `Internal documents are dribbling into the press, one humiliating page at a time. Some rat under your own roof has their hand firmly on the hose.`,
    choices: [
      {
        label: 'Hunt the rat, no mercy',
        roll: {
          stat: 'influence',
          dc: 54,
          success: {
            fx: { influence: 8, base: 6, heat: 2 },
            text: 'You sniff out the source and make a quiet, total, lesson-shaped example of them. The leaks stop dead by morning.',
          },
          fail: {
            fx: { heat: 12, support: -6 },
            text: 'Your dragnet hauls in loyal idiots and screaming headlines. The actual leaker keeps cheerfully leaking.',
          },
        },
        set: { leak_hunt: true },
        scandal: { id: 'leak_purge', label: 'the heavy-handed leak hunt', severity: 2 },
        tone: 'bold',
      },
      {
        label: 'Starve it — say absolutely nothing',
        fx: { media: -2, heat: -2, base: 2 },
        tone: 'good',
        result:
          'You refuse to feed the beast. Deprived of your sweet, sweet panic, the story slowly slinks off the front page.',
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
    body: `A glossy envoy from some fat, faraway power offers friendship, investment, and a soft little expectation of favors that will turn up later, uninvited, at the worst possible moment.`,
    choices: [
      {
        label: 'Hug the partnership tight',
        fx: { funds: 12, influence: 6, base: -4 },
        set: { foreign_friends: true },
        tone: 'slick',
        result:
          'The investment is real and fat and generous. So, eventually, will be the bill, payable in things you really did not want to give up.',
      },
      {
        label: 'Keep a polite, frosty distance',
        fx: { base: 6, support: 2, funds: -2 },
        tone: 'good',
        result:
          'You shake the hand and promise jack squat. Turns out sovereignty is way cheaper to keep than to buy back later.',
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
    body: `A scary-smart young deputy is hungry, sharp, and very obviously memorizing your every move. A protégé is a lovely asset, right up until it sprouts teeth and bites the hand.`,
    choices: [
      {
        label: 'Mentor them and lift them up',
        fx: { influence: 8, base: 6, support: 2 },
        set: { has_protege: true },
        tone: 'good',
        result:
          'You build yourself a loyal lieutenant. You may also be building, with your own two hands, the rival who eventually runs your exact playbook on you.',
      },
      {
        label: 'Keep them small and grateful',
        fx: { influence: 4, heat: 4, base: -2 },
        tone: 'slick',
        result:
          'You clip their little wings just enough to keep them grounded. Resentment, though, is patient as hell, and it has a long memory.',
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
    body: `Your inner circle has cooked up an obscene birthday blowout in your honor. It would be a delightful evening and an absolutely catastrophic photograph.`,
    choices: [
      {
        label: 'Throw yourself the full gala',
        fx: { base: 6, funds: -6, heat: 6 },
        tone: 'slick',
        result:
          'The cake is the size of a small car. So, the very next morning, is the op-ed about the cake.',
      },
      {
        label: 'Shrink it into a charity drive',
        fx: { support: 8, media: 4, base: -2 },
        tone: 'good',
        result:
          'You swap the ice sculpture of your own head for a food bank. The optics practically wrap themselves up with a bow.',
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
    body: `A nasty fast sickness is hopping district to district like it's got somewhere to be. The hospitals are jamming up, the public is wetting itself, and every hour you dither gets counted against you later.`,
    choices: [
      {
        label: 'Slam it shut, hard and early',
        roll: {
          stat: 'support',
          dc: 53,
          success: {
            fx: { support: 12, influence: 6, funds: -8 },
            text: 'You move like your hair is on fire and the curve actually bends. The cost is brutal and real — but so are all those empty hospital beds.',
          },
          fail: {
            fx: { support: -10, heat: 8 },
            text: 'You move fast and the public loses its mind over the price tag long before they ever see the payoff.',
          },
        },
        set: { locked_down: true },
        tone: 'bold',
      },
      {
        label: 'Keep it open, fake the calm',
        fx: { funds: 6, support: -6, heat: 10 },
        tone: 'slick',
        result:
          'The economy keeps humming a little while longer. The wards fill up nice and quiet, and the bill just sits there, tapping its foot.',
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
    body: `A neighbor's troops "accidentally" wander across the line and just plant themselves there, daring you to do something about it. Too soft and you look gutless; too hard and you've started a war you can't even name.`,
    choices: [
      {
        label: 'Answer with a big show of force',
        roll: {
          stat: 'base',
          dc: 54,
          success: {
            fx: { base: 12, support: 8, heat: 6 },
            text: 'You pile up your forces and stare them flat in the eye. They blink first, and suddenly you look like a goddamn wall.',
          },
          fail: {
            fx: { support: -8, heat: 14 },
            text: 'The standoff snowballs, and the cost in frayed nerves and burned treasure climbs by the hour.',
          },
        },
        tone: 'bold',
      },
      {
        label: 'Open a quiet back-channel',
        fx: { influence: 8, support: 2, base: -4 },
        set: { dealmaker: true },
        tone: 'slick',
        result:
          'One discreet phone call walks everybody back from the ledge. The hawks scream "weakness"; the people still breathing call it Tuesday.',
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
    body: `At dusk the whole capital goes dark. Elevators freeze mid-floor, traffic knots into one giant honking tantrum, and a jittery city cranes its neck to see whether you're going to lose your nerve.`,
    choices: [
      {
        label: 'Grab the wheel yourself',
        roll: {
          stat: 'influence',
          dc: 50,
          success: {
            fx: { influence: 10, support: 8, base: 4 },
            text: 'You stand up a command post and the lights blink back on by dawn. Competence, performed loudly in public, is pure gold.',
          },
          fail: {
            fx: { support: -8, heat: 8 },
            text: 'You grab the wheel and personally own every bit of the chaos when the grid stays stone dark into a second miserable night.',
          },
        },
        tone: 'bold',
      },
      {
        label: 'Delegate the fix, hog the reassuring',
        fx: { media: 6, support: 2, base: -2 },
        tone: 'good',
        result:
          'You hand the wrench to the engineers and the microphone straight to yourself. A perfectly reasonable division of labor, really.',
      },
    ],
  },
];
