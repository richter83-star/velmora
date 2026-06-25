/**
 * Endings — evaluateEnding(S, cause) reads final stats + the flags your choices
 * set, and composes a personalized verdict + scorecard. Lifted verbatim from the
 * prototype; each branch now carries a stable `endingId` so the reachability
 * sweep (Phase 3) can assert every ending is producible.
 *
 * cause: scandal | purge | collapse | revolution | lost_election |
 *        lost_powerplay | resign | finale
 */
import type { GameState, Stats, Ending, LegacyEntry } from './types';
import { PATHS } from '../content/paths';

function flag(S: GameState, k: string): number | boolean {
  return S.flags[k] || 0;
}
export function purges(S: GameState): number {
  const n = S.flags.purge_count;
  return typeof n === 'number' ? n : 0;
}

export function dominantTrait(S: GameState): string {
  const f = S.flags;
  if (f.bloody_hands || f.tyrant_rep || purges(S) >= 4) return 'Iron Fist';
  if (f.secret_reformer || f.peacemaker) return 'The Hidden Reformer';
  if (f.own_cult || f.cult_building) return 'Cult of Personality';
  if (f.corrupt_streak || f.cooked_books) return 'Sticky Fingers';
  if (f.foreign_ties) return 'Foreign Entanglements';
  if (f.has_network || f.blackmailer) return 'Master of the Backroom';
  if (f.honest_rep || f.clean_streak || f.secret_decent) return 'Unusually Principled';
  if (f.hawk || f.struck_first) return 'The Hard Liner';
  if (f.media_friend || f.progressive) return 'Media Darling';
  return 'Pragmatic Survivor';
}

export function scorecard(S: GameState, verdict: string): LegacyEntry[] {
  const P = PATHS[S.path];
  const office = S.player.title || P.phases[Math.max(0, S.phase - 1)]?.title || '';
  const yrs = S.totalTurns || 0;
  return [
    { l: S.path === 'ballot' ? 'Highest Office' : 'Highest Rank', v: office },
    { l: 'Years in the Arena', v: String(yrs) },
    { l: 'Defining Trait', v: dominantTrait(S) },
    { l: 'Verdict', v: verdict },
  ];
}

/* ============================================================================
 * Dark Mirrors expansion — per-path finale (win-state) ending blocks. Each is an
 * ordered first-match chain ending in a `true` catch-all. Dispatched from
 * evaluateEnding BEFORE the generic ballot/vanguard chain, because the iron and
 * anointed "clean" routes set secret_reformer/peacemaker, which the generic
 * reformer branch would otherwise steal. Designed + adversarially reachability-
 * verified (every rank has a reachable, non-shadowed niche under random play).
 * ========================================================================== */

/** The Iron Order finale: cohesion(influence)+vanguard(base) build; exposure(heat) bleeds. */
function ironFinale(S: GameState, st: Stats, composite: number): Ending {
  const f = S.flags;
  const industrialists = S.blocs?.['industrialists'] ?? 50;
  if (st.influence >= 65 && st.base >= 55 && st.heat < 50) {
    return {
      endingId: 'iron_architect',
      emoji: '🏛️',
      rank: 'THE ARCHITECT',
      win: true,
      verdict: 'The State You Built',
      title: 'The State You Built',
      text: `You didn't just kick the doors of the Iron Palace in — you built a machine that keeps grinding even when your fat ass isn't in the chair. Cohesion is absolute: the Officer Corps salutes a chain of command with actual rules instead of knives, and the Vanguard finally acts like a disciplined fist instead of a drunk mob with a flag and a grudge. Exposure stayed breathable because you never once handed the courts or the foreign bean-counters a juicy headline. History will scream about your methods for a century, but it won't argue about the scoreboard: a state with a spine, an Order that outlives the prick who ordered it. That's the rarest trick any strongman pulls, and you didn't stumble into it — you meant every bolt of it.`,
    };
  }
  if (f.bloody_hands || purges(S) >= 4 || st.heat >= 70) {
    return {
      endingId: 'iron_despot',
      emoji: '⛓️',
      rank: 'THE DESPOT',
      win: true,
      verdict: 'Fear Is the Only Law',
      title: 'Fear Is the Only Law',
      text: `You clawed your way to the top and then made damn sure nobody under you could so much as glance upward without pissing themselves. The empty chairs, the airbrushed photos, the friendly little 3 a.m. house calls — those aren't the price of your rule, you absolute ghoul, they ARE the rule. Cohesion's never been tighter, because terror is the most efficient glue ever bottled. The trains run, the rallies bellow your name till their throats bleed, and not one soul asks where the doubters went, because every last one of them already knows. You're powerful, you're untouchable, and you're sitting alone on top of a very cold mountain that you personally froze solid with the screams of everyone who used to like you.`,
    };
  }
  if (industrialists >= 70 && st.influence < 50) {
    return {
      endingId: 'iron_puppet',
      emoji: '🎭',
      rank: 'THE PUPPET',
      win: true,
      verdict: 'The Men Behind the Desk',
      title: 'The Men Behind the Desk',
      text: `You took the Iron Palace, and the bastards who paid for the marble took you — gift-wrapped, with a bow. The War Chest never went dry because the mill owners kept topping it off, and every armband, every contract, every hushed little deal across the border came pre-stitched with their grubby fingerprints. But Cohesion was the tab: the Order answers to their ledger long before it answers to you, and the officers all know it, the smug pricks. You give the speeches; they sign the budget. You wave from the balcony like a trained seal; they decide what the balcony's even for. You're the face of a regime, and somewhere behind a desk the size of a tennis court, the men who actually run the place are quietly debating whether they still need the face.`,
    };
  }
  if (composite >= 130 && st.support >= 50) {
    return {
      endingId: 'iron_strongman',
      emoji: '🎖️',
      rank: 'THE STRONGMAN',
      win: true,
      verdict: 'Stability, At a Price',
      title: 'Stability, At a Price',
      text: `They begged for order and you shoved it down their throats — not gentle, not free, but stable as a brick to the skull. Fervor stayed sky-high because the crowds finally got what the parliament never coughed up: the sense that somebody, anybody, was in charge and wasn't bluffing. The streets are calm, the borders hold, the anthem plays right on the dot. The historians won't love you, but they'll respect you, and the people give you something warmer than respect and quieter than worship. The bill was paid in freedoms nobody bothered to itemize at the time. Oh, they'll get itemized eventually — just not by anyone with the spine left to mail you the invoice.`,
    };
  }
  if (composite <= 70) {
    return {
      endingId: 'iron_wreckage',
      emoji: '🏚️',
      rank: 'THE WRECKAGE',
      win: true,
      verdict: 'What You Left Behind',
      title: 'What You Left Behind',
      text: `You reached the Iron Palace and found a hollow throne squatting in a gutted-out husk of a country. The rallies thinned to a sad little drizzle, the Vanguard wandered off, the granaries echoed, and Exposure crawled up every wall like black mold. You won the shiny title and inherited the smoking pile you made winning it — a capital that obeys out of pure exhaustion instead of belief, an Order held together by inertia and the cold dread that whatever comes next will somehow be worse. Technically, yes, you're the Supreme Leader. What you're supreme OVER is mostly rubble, rats, and the long grey silence of a nation just waiting for you to finally drop dead.`,
    };
  }
  return {
    endingId: 'iron_default',
    emoji: '🪙',
    rank: 'THE WARLORD',
    win: true,
    verdict: 'Order, More or Less',
    title: 'Order, More or Less',
    text: `You took the Iron Palace and then, more or less, you held onto the damn thing. No glorious terror, no puppet strings up your back, no statue worth the bother of toppling — just a steady, blue-collar grip on a nation that badly needed gripping. The Order holds because YOU hold it, day after grey-ass day, with a competence that never quite tips over into legend or catastrophe. The frontier's quiet enough, the crowds are loyal enough, the doubters are watched enough. Order, more or less. It's not the gleaming regime the propaganda swore up and down it'd be, but it's yours, and in this rotten line of work, simply still being the boss when the credits roll is its own filthy little victory.`,
  };
}

/** The Gilded Republic finale: capital(funds) dominates; network(base)/scrutiny(heat) shape the legacy. */
function gildedFinale(S: GameState, st: Stats, composite: number): Ending {
  const f = S.flags;
  const oldMoney = S.blocs?.['old_money'] ?? 50;
  if (st.base >= 60 && st.funds >= 60 && st.heat < 40) {
    return {
      endingId: 'gilded_dynasty',
      emoji: '🏛️',
      rank: 'THE DYNASTY',
      win: true,
      verdict: 'An Empire Built to Last',
      title: 'The Empire That Outlasts You',
      text: `You didn't just win the game — you became the goddamn board the rest of them play it on. The portfolio is an institution now, the institution's a habit, the habit's a kind of weather everybody just lives inside and stops noticing, like smog. Your Network snakes into every chamber that matters and your Capital is so quiet the regulators gave up and went home years ago. When you finally croak, the empire won't so much mourn you as keep humming along without missing a beat, which is the only immortality money has ever actually bought any of these sad rich bastards. Your name turns into an adjective for things too enormous to fail and too discreet to ever, ever question.`,
    };
  }
  if (st.funds >= 75 && st.influence >= 60) {
    return {
      endingId: 'gilded_monopolist',
      emoji: '💰',
      rank: 'THE MONOPOLIST',
      win: true,
      verdict: 'You Own Everything',
      title: 'When You Own Everything',
      text: `There's a point where competition stops being a market and starts being a courtesy you've graciously decided to quit extending. You blew right past it. Every rival outfit is a tenant now, every independent watchdog a department, every choke point a toll booth you personally man. Your Capital sailed past the number where it means anything as petty as a yacht and deep into the number where it means leverage over entire nations. People don't buy from you and sell to you so much as they just exist inside your gravity, like moons. It's not really a republic anymore, technically, but nobody's coined a sharper word for it — and the few who might are already cashing your checks.`,
    };
  }
  if (f.secret_reformer && st.support >= 55 && st.funds < 60) {
    return {
      endingId: 'gilded_philanthropist',
      emoji: '🎗️',
      rank: 'THE PHILANTHROPIST',
      win: true,
      verdict: 'You Gave It Back (Most of It)',
      title: 'You Gave It All Back (Most of It)',
      text: `Somewhere up the greasy ladder you did the one thing fortunes are engineered specifically never to do: you let go of some of it. Not all — let's not insult each other, the wings have your name gouged in three feet deep and the foundations still jump when you whistle — but enough that the public buys the conversion, and belief, you finally figured out, is the only Approval that compounds tax-free. You handed back the offshore labyrinth, the leverage, the cleanest slice of the empire, and the cameras that used to hunt you like a rabid dog now light you up like a saint. The cynics swear it was the slickest acquisition of your whole career: you bought yourself a soul at a fire-sale discount and the market priced it generously. You let them keep thinking that. You alone know which parts you actually meant.`,
    };
  }
  if (oldMoney >= 70 && st.influence < 40) {
    return {
      endingId: 'gilded_figurehead',
      emoji: '🎭',
      rank: 'THE FIGUREHEAD',
      win: true,
      verdict: 'The Old Families Hold the Strings',
      title: 'The Old Families Were Always in Charge',
      text: `You finally got let in — the dinners, the boxes at the regatta, the slow approving nod that purrs you're one of us now. Took you a humiliating number of years to clock that the nod was a leash. The Old Families pulled you in close precisely BECAUSE you'd blown your whole Leverage stack chasing their approval instead of power they'd have had to actually respect, and an heir who needs to be liked is an heir who can be managed like a houseplant. The empire still wears your name on the letterhead. The decisions get made one floor up, in rooms that were old and mahogany before your money was even printed. You're the face on the building. They are the lease, and they can not-renew you whenever they damn well please.`,
    };
  }
  if (composite <= 70) {
    return {
      endingId: 'gilded_wreckage',
      emoji: '🥀',
      rank: 'THE WRECKAGE',
      win: true,
      verdict: 'A Fortune, Misspent',
      title: 'A Fortune, Spent on the Wrong Things',
      text: `You won. Write it down somewhere, frame it, because almost nothing else from these years is worth keeping in the box. You had more Capital than the men who founded nations and you torched it like a jackass trying to fill a hole by digging it deeper — on Scrutiny you personally invited, on enemies you generously bankrolled, on a story not one living soul believed twice. The empire's still standing, technically, the way a building "stands" after the fire's through with it: a blackened shape, a stink, a hazard to anyone dumb enough to walk too close. You can afford literally anything now except the single thing you were always actually short on, and the auditors are still down in the basement, patiently, endlessly counting.`,
    };
  }
  return {
    endingId: 'gilded_default',
    emoji: '🥂',
    rank: 'THE PROPRIETOR',
    win: true,
    verdict: 'Comfortable, Powerful, Unremarkable',
    title: 'Comfortable, Powerful, Unremarkable',
    text: `You hauled yourself to the Summit and discovered it was just an office like any other, only quieter and higher up and a real bitch to leave. You're wealthy past the point of arithmetic and powerful in the dull, beige way that gets your calls returned and your tables held, and that, it turns out, is the entire haul. No dynasty drags your name into the next century, no scandal drags it into the gutter, no crowd loves you and no prosecutor can be bothered to want you. You bought the whole game and then mostly just kept the lights on — a steady, capable, profoundly forgettable hand on a fortune that'll be somebody else's headache soon enough. Most players would saw off a finger for your ending. Not one of them will remember your name by Tuesday.`,
  };
}

/**
 * The Anointed Path finale: devotion(support)+authority(influence) carry;
 * heresy(heat) bleeds. Ordering note (deviates intentionally from the brief's
 * naive table to give every rank a live, non-shadowed lane under play): overt
 * coercion (bloody_hands / runaway Heresy) reads as INQUISITOR, and a SAINT must
 * have clean hands. Absent overt coercion, your INSTITUTIONAL identity — a
 * personality cult (ORACLE) or a reform coalition (REFORMER) — defines you
 * before a merely quiet purge-count collapses everything back into INQUISITOR.
 */
function anointedFinale(S: GameState, st: Stats, composite: number): Ending {
  const f = S.flags;
  const reformists = S.blocs?.['reformists'] ?? 50;
  const inquisitor: Ending = {
    endingId: 'anointed_inquisitor',
    emoji: '🔥',
    rank: 'THE INQUISITOR',
    win: true,
    verdict: 'The Faith Became a Weapon',
    title: 'The Faith Became a Weapon',
    text: `Somewhere up the holy ladder the sermons quit being about mercy and started being about a list of names. You discovered that a charge of heresy, aimed just right, does the work of a thousand boring arguments — and brother, you aimed it like a fire hose. The doubters got silenced, the splinter parishes got padlocked, the bread got rationed strictly to the loyal and the loud. The faith you inherited as a warm little covenant of comfort, you're leaving behind as a cattle prod with your sweaty fingerprints melted into the grip. They obey you completely now, in the exact way the terrified always obey. You kept telling yourself the cause sanctified the cruelty. Turns out the cause, all along, was just you, you self-righteous prick.`,
  };
  // Pure piety with clean hands — canonization is impossible with blood on them.
  if (f.secret_reformer && st.support >= 65 && st.heat < 30 && !f.bloody_hands) {
    return {
      endingId: 'anointed_saint',
      emoji: '😇',
      rank: 'THE SAINT',
      win: true,
      verdict: 'They Will Canonize You',
      title: 'They Will Canonize You',
      text: `You climbed every rung of the Council and not once reached for the knife it kept politely sliding across the table at you. You cracked open the ledgers, fed the hungry without first demanding to know what they believed, and shielded the doubter sitting at your own dinner table. Your Devotion is the real, un-cut stuff — not manufactured, not beaten out of anyone, just earned the slow stupid honest way — and your Heresy ledger is so thin the inquisitors gave up squinting at it. When you finally lie down for good, the petitions for your canonization start before the candles even gutter out. They'll bicker for a century over whether you were truly touched by something higher. You won't be around to whisper the boring truth: you were only, stubbornly, unfashionably, kind.`,
    };
  }
  // Overt coercion always reads as the Inquisitor, whatever else you were.
  if (f.bloody_hands || st.heat >= 65) return inquisitor;
  // Absent overt coercion, your institutional identity defines you.
  if (f.own_cult && st.support >= 60) {
    return {
      endingId: 'anointed_oracle',
      emoji: '👁️',
      rank: 'THE ORACLE',
      win: true,
      verdict: 'They Believed Every Word',
      title: 'They Believed Every Word',
      text: `You never quite outright lied. You just declined, very humbly, to correct anybody, and let the wonder fatten in the retelling until the line between the shepherd and the Almighty got too blurry for anyone to bother finding. The miracle you definitely did not perform became scripture; the succession you refused to name became proof there could only ever be you, forever, amen. Pilgrims drag the sick and the desperate to your door, and your Devotion is total — a congregation that doesn't just follow you, it believes you, every syllable, like disbelief itself had become physically impossible to perform. It's the safest power there is and the loneliest. You built a whole faith with exactly one article of doctrine, and the article is your name spelled in gold.`,
    };
  }
  if (reformists >= 70 && st.media >= 55) {
    return {
      endingId: 'anointed_reformer',
      emoji: '🕊️',
      rank: 'THE REFORMER',
      win: true,
      verdict: 'You Opened the Door',
      title: 'You Opened the Door',
      text: `You didn't burn the old temple to the ground — you wedged its heavy doors open and let some actual air finally move through the stink. The Reformists, who spent a whole generation white-knuckling it for one of their own to reach the Sacred Seat, finally got their shepherd, and your iron grip on Doctrine meant not one Orthodox elder could call the changes anything but faithful. You modernized the form without gutting the guts, made the mandate answer for itself, and built a faith confident enough to survive an honest question without fainting. The traditionalists grumble that you let the world in. The young ones say you let the light in. Both are right, which is the most a reformer can ever realistically hope to be.`,
    };
  }
  // A quiet purger with no saintly, cultic, or reformist identity is still an Inquisitor.
  if (purges(S) >= 3) return inquisitor;
  if (composite <= 250) {
    return {
      endingId: 'anointed_caretaker',
      emoji: '🪑',
      rank: 'THE CARETAKER',
      win: true,
      verdict: 'You Held the Seat Warm',
      title: 'You Held the Seat Warm',
      text: `You reached the Sacred Seat, and that sentence is hauling basically all the weight in this room. You weren't a saint and you weren't a tyrant, weren't an oracle and weren't a reformer — you were a glorified janitor who kept the candles lit and the doctrine roughly where you found it. The Council got its successor; the congregation got its shepherd; the famine and the schism and the foreign embargo each rolled in, did their thing, rolled out, and left you standing pretty much exactly where you started. Nobody's reading your name from the pulpit a hundred years from now, except as the beige little nobody wedged between two people who actually mattered. You held the seat warm for whoever showed up next. In a faith that runs on raw fervor, quiet competence is its own quiet little heresy.`,
    };
  }
  return {
    endingId: 'anointed_default_reign',
    emoji: '🕯️',
    rank: 'THE SHEPHERD',
    win: true,
    verdict: 'A Long, Quiet Reign',
    title: 'A Long, Quiet Reign',
    text: `There was no schism, no inquisition, no canonization — just a reign that went on, and on, and on, and quietly got the job done. You learned the Council's rhythms and the congregation's needs and kept both fed enough to stay loyal and frightened enough to stay obedient. You blessed the harvests, refereed the squabbling elders, and let the sharp dangerous questions die of old age in a corner rather than ever actually answer the damn things. When the histories get written you'll fill a respectable, snore-inducing chapter: a shepherd who held the flock together through a stretch of profoundly ordinary years, asked for little, and was rarely loved and never once truly feared. The Sacred Covenant endured under your hand. Whether it ever GREW is a question you were always very, very careful never to put to a vote.`,
  };
}

export function evaluateEnding(S: GameState, cause: string): Ending {
  const ballot = S.path === 'ballot';
  const st = S.stats;
  const composite = st.support + st.base + st.influence + st.media - st.heat;
  let e: Ending;

  /* ---- failure / removal endings ---- */
  if (cause === 'scandal') {
    e = {
      endingId: 'scandal',
      emoji: '📰',
      rank: 'DISGRACED',
      win: false,
      verdict: 'Disgraced',
      title: ballot ? 'Impeached' : 'Expelled in Disgrace',
      text: `The Scrutiny swelled into a flood no amount of slick spin could plug. ${flag(S, 'corrupt_streak') ? 'The money trail was just too damn long to bury. ' : ''}They drag you in front of the cameras, the gavel comes down like a guillotine, and the whole career you built gets dismantled live on the evening news while the nation chews popcorn. They'll be using your name as a cautionary verb for a solid generation.`,
    };
  } else if (cause === 'purge') {
    e = {
      endingId: 'purge',
      emoji: '🚪',
      rank: 'PURGED',
      win: false,
      verdict: 'Purged',
      title: 'Vanished from the Photographs',
      text: `Suspicion crept all the way up to the leadership, and in the Union that's a sentence, not a mood. ${flag(S, 'foreign_ties') ? 'The foreign contacts were the loose thread they yanked. ' : ''}One ordinary morning your office gets reassigned, your portrait comes off the wall, and the official record gets quietly scrubbed to suggest you were never even here, you ghost. ${purges(S) >= 3 ? 'You marched plenty of poor bastards down this exact corridor yourself. There is a grim, perfect symmetry to it.' : ''}`,
    };
  } else if (cause === 'collapse') {
    e = {
      endingId: 'collapse',
      emoji: '📉',
      rank: 'REPUDIATED',
      win: false,
      verdict: 'Repudiated',
      title: 'The People Turned Away',
      text: `Approval bled out of you drip by sad little drip until there was nothing left holding the whole act up. The donors stopped picking up; the cameras went chasing fresher, prettier faces. ${flag(S, 'went_negative') ? "You'd torched every bridge you might've crawled back across. " : ''}You shuffle out of public life as a footnote with a Wikipedia page nobody can be bothered to update.`,
    };
  } else if (cause === 'revolution') {
    e = {
      endingId: 'revolution',
      emoji: '🔥',
      rank: 'OVERTHROWN',
      win: false,
      verdict: 'Overthrown',
      title: 'The Square Won',
      text: `Legitimacy is the one damn thing the Party can't crank out of a factory forever. The day it ran dry, the people did the unthinkable and the soldiers just... stood there and let them. ${flag(S, 'bloody_hands') ? 'They remembered the square you had cleared. They returned the favor with interest. ' : ''}History will brawl about you for a century, which, let's be honest, is more than most cadres ever get.`,
    };
  } else if (cause === 'lost_election') {
    e = {
      endingId: 'lost_election',
      emoji: '🗳️',
      rank: 'DEFEATED',
      win: false,
      verdict: 'Defeated at the Polls',
      title: `Conceding ${['the Senate seat', "the Governor's race", 'the Presidency'][Math.max(0, S.phase - 1)] ?? ''}`,
      text: `The votes rolled in and they just weren't enough. You give the gracious concession speech with that exact fixed, dead-eyed smile every loser wears like a mask. ${composite > 120 ? "You were good — maybe even great — but in a democracy 'almost' packs your bags and sends you home all the same. " : ''}Somewhere a strategist is already three chapters into the tell-all book about everything you screwed up.`,
    };
  } else if (cause === 'lost_powerplay') {
    e = {
      endingId: 'lost_powerplay',
      emoji: '♟️',
      rank: 'OUTMANEUVERED',
      win: false,
      verdict: 'Outmaneuvered',
      title: 'A Rival Rose Instead',
      text: `In the windowless little rooms where the real decisions actually get made, somebody counted you up and found you short. ${flag(S, 'struck_first') ? 'You lunged too early and flashed your whole hand to the table. ' : 'You waited one beat too long, and that beat belonged to somebody hungrier. '}A rival's portrait goes up exactly where yours might have hung. You get 'promoted' to some honorary post with a title a mile long and a telephone that doesn't connect to anything.`,
    };
  } else if (cause === 'resign') {
    e = {
      endingId: 'resign',
      emoji: '🚶',
      rank: 'WALKED AWAY',
      win: false,
      verdict: 'Stepped Aside',
      title: 'You Chose the Door',
      text: `Not every story ends in a faceplant or a crown. You stared down the road ahead — the compromises, the knives, the bloodsucking cameras — and you just... stopped climbing. ${ballot ? 'You stroll back into private life with your reputation intact and your ambitions left blue-balled and unanswered.' : 'In the Union, the ones who walk away quietly are the lucky few. Somehow, you were lucky.'} The game grinds on without you, and forgets your face faster than you'd like.`,
    };
  } else if (cause === 'arrested') {
    e = {
      endingId: 'arrested',
      emoji: '🚓',
      rank: 'NEUTRALIZED',
      win: false,
      verdict: 'Neutralized',
      title: 'Removed in the Night',
      text: `The courts, the generals, or some faraway coalition moved first, and they moved in the dark like they always do. ${flag(S, 'foreign_ties') ? 'The foreign ledger was the thread they pulled until you unraveled. ' : ''}The trial is pure theater and the verdict was typed up before anyone sat down. You become the exact thing you spent your whole career accusing everybody else of being: a warning sign with a face.`,
    };
  } else if (cause === 'dissolved') {
    e = {
      endingId: 'dissolved',
      emoji: '💢',
      rank: 'DISSOLVED',
      win: false,
      verdict: 'Dissolved',
      title: 'The Movement Collapsed',
      text: `You handed them a cause and they handed you everything — right up until the morning the cause ran dry and they handed you a great big steaming nothing. ${flag(S, 'bloody_hands') ? 'The ones who did the dirty work remembered real well who pointed them at it. ' : ''}The Order shatters into squabbling factions, each one waving your name around while cheerfully ignoring how you ended up.`,
    };
  } else if (cause === 'indicted') {
    e = {
      endingId: 'indicted',
      emoji: '⚖️',
      rank: 'INDICTED',
      win: false,
      verdict: 'Indicted',
      title: 'The Prosecutors Got There',
      text: `The prosecutor had absolutely nothing left to lose, which is precisely the breed you never see coming. ${flag(S, 'corrupt_streak') ? 'The offshore structures come apart live on a courtroom feed. ' : ''}You burn more on legal fees in a single month than most people earn in a whole grinding lifetime. Doesn't help you one bit.`,
    };
  } else if (cause === 'hostile_takeover') {
    e = {
      endingId: 'hostile_takeover',
      emoji: '📉',
      rank: 'OUTBID',
      win: false,
      verdict: 'Outbid',
      title: 'The Acquired',
      text: `A rival pack of elites pounced the second you were overextended and the public was busy gawking elsewhere. There's a vicious little poetry to it: you built your entire career on the acquisition, and then, at the buzzer, you became the acquired.`,
    };
  } else if (cause === 'excommunicated') {
    e = {
      endingId: 'excommunicated',
      emoji: '🔔',
      rank: 'EXCOMMUNICATED',
      win: false,
      verdict: 'Excommunicated',
      title: 'Stripped of All Standing',
      text: `The Council slammed into extraordinary session and the verdict came back unanimous, the vultures. ${flag(S, 'bloody_hands') ? 'The discipline you used to dish out so freely is now pointed straight at your chest. ' : ''}They strip you of every title and bar you from the sacred halls you spent your entire life clawing up. The proclamation gets read aloud from every single pulpit. You have never felt so alone — or so precisely, publicly located.`,
    };
  } else if (cause === 'schism') {
    e = {
      endingId: 'schism',
      emoji: '➗',
      rank: 'SCHISM',
      win: false,
      verdict: 'Schism',
      title: 'The Flock Divided',
      text: `Devotion isn't a resource you can crank out on demand — it has to be earned, and you spent yours down to the lint. A rival snatched the mandate and the congregation trotted off after them, because the congregation always trots after whoever speaks to the thing they need most. And tonight, pal, that ain't you.`,
    };
  } else if (S.path === 'iron') {
    e = ironFinale(S, st, composite);
  } else if (S.path === 'gilded') {
    e = gildedFinale(S, st, composite);
  } else if (S.path === 'anointed') {
    e = anointedFinale(S, st, composite);
  } else {
    /* ---------- FINALE (ballot / vanguard) — what kind of ruler? ---------- */
    const f = S.flags;
    if ((f.secret_reformer || f.peacemaker) && st.support >= 55 && purges(S) <= 1) {
      e = {
        endingId: 'reformer',
        emoji: '🕊️',
        rank: ballot ? 'STATESMAN' : 'THE REFORMER',
        win: true,
        verdict: ballot ? 'A Principled Leader' : 'The One Who Opened the Door',
        title: ballot ? 'The Leader Who Kept Their Soul' : 'The Great Liberalization',
        text: ballot
          ? `You clawed your way to the summit without selling off the last sad scrap of yourself, which up here is basically a miracle. You governed with a steadiness the historians will call wisdom and your rivals called naive, gutless idiocy — right up until the moment it actually worked. The Republic is a more decent place for your having climbed it. That's a rare-as-hell sentence to write about anybody who ever touched real power.`
          : `You spent a whole lifetime mastering every one of the Party's knives, and then — astonishingly, insanely — you used the top job to set them all down. You loosened the chokehold, threw open the windows, let the Union finally take a breath. The hardliners scream betrayal; the people call it the morning. The statue they put up for you is going to be controversial as hell and very, very large.`,
      };
    } else if (f.bloody_hands || f.tyrant_rep || purges(S) >= 5 || st.heat >= 70) {
      e = {
        endingId: 'tyrant',
        emoji: '⛓️',
        rank: 'THE TYRANT',
        win: true,
        verdict: 'Ruled by Fear',
        title: ballot ? 'The Strongman of the Republic' : 'Absolute Power',
        text: `You bullied your way to the top and then made damn sure nobody could ever yank you back down. ${purges(S) >= 5 ? `At least ${purges(S)} careers got shoveled into a ditch to clear your path. ` : ''}Your rule is total, your portrait's on every wall, your enemies are exactly nowhere. The trains run on time and not one soul dares ask out loud where the dissidents went. You're powerful, you're secure, and you're alone at the very peak of a very cold mountain that nobody else is dumb enough to climb.`,
      };
    } else if (f.own_cult || (f.cult_building && st.media >= 60)) {
      e = {
        endingId: 'beloved',
        emoji: '🌟',
        rank: 'THE BELOVED LEADER',
        win: true,
        verdict: 'A Living Legend',
        title: 'The Cult of You',
        text: `Your mug is on the currency, the stamps, the schoolroom walls. Children belt out songs with your name jammed into the chorus. ${st.support >= 55 ? 'And the genuinely freaky part is that a whole lot of the adoration is REAL — you actually gave them something to believe in. ' : 'Whether they truly love you or just perform it flawlessly out of self-preservation is a question nobody is suicidal enough to ask out loud. '}You've become less a person than a symbol, which is precisely what you always wanted, and lonelier than your dumb ass ever expected.`,
      };
    } else if (f.corrupt_streak && st.funds >= 55) {
      e = {
        endingId: 'kleptocrat',
        emoji: '💰',
        rank: 'THE KLEPTOCRAT',
        win: true,
        verdict: 'Rich and in Charge',
        title: 'Power Was Just the Beginning',
        text: `You won the whole damn game and quietly stripped it for copper the entire way up. The treasury and your personal fortune got real hard to tell apart, and you liked it exactly like that, you greedy bastard. ${ballot ? 'Reforms got proposed; you happened to own the people doing the proposing. ' : "The Party's wealth flowed through channels that just so happened to detour through your pockets. "}You'll die comfortable, powerful, and stuffed to the gills with offshore accounts in nations that wouldn't extradite their own grandmother.`,
      };
    } else if (composite >= 150 && st.support >= 55) {
      e = {
        endingId: 'great_leader',
        emoji: '🏆',
        rank: 'THE GREAT LEADER',
        win: true,
        verdict: 'Genuinely Beloved',
        title: ballot ? 'A Presidency for the History Books' : 'The Architect of the Age',
        text: `You reached the top strong, popular, and fully in command — the rarest damn trifecta in this whole rotten business. You spend your time at the summit actually governing, and governing well, the show-off. ${flag(S, 'clean_streak') || flag(S, 'honest_rep') ? 'That you pulled it off with your hands mostly clean will baffle the cynics until the day they die. ' : ''}When you finally step down, the crowds are real and the tears are real and the whole era just takes your name and runs with it.`,
      };
    } else if (composite <= 70 || st.support < 40) {
      e = {
        endingId: 'placeholder',
        emoji: '🪑',
        rank: 'THE PLACEHOLDER',
        win: true,
        verdict: 'Technically Won',
        title: ballot ? 'A Forgettable Term' : 'A Caretaker at the Top',
        text: `You got there. That tiny sentence is sweating under a LOT of weight. You reached the highest office in the land and then... mostly just held the chair down. No catastrophe, no triumph, a steady grey drizzle of perfectly adequate decisions. ${st.heat >= 50 ? 'You blew most of your authority just keeping ahead of the scandals snapping at your heels. ' : ''}You'll end up a trivia answer — the leader people half-remember, wedged forgettably between two who were actually interesting.`,
      };
    } else {
      e = {
        endingId: 'operator',
        emoji: '🎖️',
        rank: 'THE OPERATOR',
        win: true,
        verdict: 'A Capable Hand',
        title: ballot ? 'A Solid, Real Presidency' : 'A Secure Reign',
        text: `You climbed the entire ladder on pure competence and nerve, and you run the joint like somebody who damn well earned the keys. ${flag(S, 'has_network') ? 'The network you built holds the whole rickety structure upright — favors owed in every office that matters, IOUs in every drawer. ' : ''}Not beloved enough for legend, not feared enough for nightmare, but powerful, effective, and firmly, unmistakably the one in charge. Most who sit down to this game would kill for your ending. A few of them, in fact, did.`,
      };
    }
  }
  e.legacy = scorecard(S, e.verdict);
  return e;
}
