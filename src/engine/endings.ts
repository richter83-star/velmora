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
      text: `You did not just seize the Iron Palace — you built something that will stand without you in the room. Your Cohesion is total: the Officer Corps salutes a chain of command with rules, not knives, and the Vanguard is a disciplined instrument rather than a mob with a flag. Exposure stayed survivable because you never gave the courts or the foreign ledgers the easy headline. History will argue about your methods for a century, but it will not argue about the result: a state with bones, an order that outlasts the man who ordered it. That is the rarest thing a strongman ever achieves, and you achieved it on purpose.`,
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
      text: `You reached the summit and then made certain no one beneath you could ever look up without flinching. The empty chairs, the edited photographs, the visits paid in the small hours — these are not the cost of your rule, they are the rule. Cohesion of a kind has never been higher, because terror is a very efficient kind of unity. The trains run, the rallies roar your name, and no one asks where the doubters went, because everyone already knows. You are powerful, you are secure, and you sit alone at the top of a very cold mountain that you froze yourself.`,
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
      text: `You took the Iron Palace, and the men who paid for the marble took you. Your War Chest never ran dry because the mill owners kept it full — and every armband, every contract, every quiet settlement abroad was stitched with their interest. But Cohesion was the price: the Order answers to their ledger before it answers to you, and the officers know it. You give the speeches; they approve the budget. You wave from the balcony; they decide what the balcony is for. You are the face of a regime, and somewhere behind a very large desk, the people who actually run it are deciding whether they still need the face.`,
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
      text: `They wanted order and you delivered it — not gentle, not free, but unmistakably stable. Fervor stayed high because the crowds got what the parliament never gave them: a sense that someone, finally, was in charge and meant it. The streets are calm, the borders hold, the anthem plays on schedule. You did not earn the historians' love, but you earned their respect, and from the people something warmer than respect and quieter than worship. The price was paid in freedoms nobody itemized at the time. They will be itemized eventually — but not by anyone with the standing to send you the bill.`,
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
      text: `You reached the Iron Palace and found a hollow throne in a hollowed-out state. The rallies thinned, the Vanguard drifted, the granaries emptied, and Exposure crept up every wall like damp. You won the title and inherited the ruin you made winning it — a capital that obeys out of exhaustion rather than belief, an Order held together by inertia and the fear that whatever comes next will be worse. You are technically the Supreme Leader. What you are supreme over is mostly rubble and the long, grey silence of people waiting for you to be done.`,
    };
  }
  return {
    endingId: 'iron_default',
    emoji: '🪙',
    rank: 'THE WARLORD',
    win: true,
    verdict: 'Order, More or Less',
    title: 'Order, More or Less',
    text: `You took the Iron Palace and then, mostly, you kept it. No glorious terror, no captured strings, no statue worth toppling — just a steady, workmanlike grip on a nation that needed gripping. The Order holds because you hold it, day after grey day, with a competence that never quite curdles into legend or catastrophe. The frontier is quiet enough, the crowds are loyal enough, the doubters are watched enough. Order, more or less. It is not the regime the propaganda promised, but it is yours, and in this business simply still being in charge at the end is its own kind of victory.`,
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
      text: `You did not merely win the game — you made yourself the board it is played on. The portfolio is now an institution, the institution a habit, the habit a kind of weather everyone simply lives inside. Your Network reaches into every chamber that matters and your Capital is quiet enough that the regulators stopped looking years ago. When you are gone, the empire will not so much mourn you as continue, which is the only immortality money has ever actually purchased. Your name becomes an adjective for things too large to fail and too discreet to question.`,
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
      text: `There comes a point where competition is simply a courtesy you have chosen to stop extending. You reached it. Every rival enterprise is now a tenant, every independent check a department, every choke point a toll you collect. Your Capital is past the number where it means anything personal and well into the number where it means leverage over nations. People do not buy from you and sell to you so much as they exist within the radius of you. It is not a republic anymore, exactly, but no one has found a more accurate word, and the ones who might are on your payroll.`,
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
      text: `Somewhere on the climb you did the one thing fortunes are built never to do: you let go. Not all of it — let us be honest, the wings have your name carved deep and the foundations answer to your hand — but enough that the public believes the conversion, and belief, you have learned, is the only Approval that compounds. You gave back the offshore maze, the leverage, the cleanest slice of the empire, and the cameras that once hunted you now light you kindly. Cynics insist it was the smartest acquisition of your career: you bought a soul at a steep discount and the market valued it generously. You let them think so. You know which parts you meant.`,
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
      text: `You were welcomed in at last — the dinners, the boxes at the regatta, the quiet nod that says you are one of us now. It took you years to notice the nod was a leash. The Old Families embraced you precisely because you had spent your Leverage on their approval instead of on power they would have had to respect, and an heir who needs to be liked is an heir who can be managed. The empire still bears your name. The decisions are made one tier above you, in rooms that were old before your money was new. You are the face on the building. They are the lease.`,
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
      text: `You won. You should write that down, because almost nothing else from these years is worth keeping. You had more Capital than the founders of nations and you spent it like a man trying to fill a hole by digging it deeper — on Scrutiny you provoked, on enemies you bought, on a story no one believed twice. The empire stands, technically, the way a building stands after the fire: a shape, a smell, a hazard to anyone who walks too close. You can afford anything now except the only thing you were ever actually short of, and the auditors are still, patiently, counting.`,
    };
  }
  return {
    endingId: 'gilded_default',
    emoji: '🥂',
    rank: 'THE PROPRIETOR',
    win: true,
    verdict: 'Comfortable, Powerful, Unremarkable',
    title: 'Comfortable, Powerful, Unremarkable',
    text: `You reached the Summit and discovered it was an office like any other, only quieter and higher and harder to leave. You are wealthy beyond accounting and powerful in the unglamorous way that gets calls returned and tables held, and that, it turns out, is the whole of it. No dynasty carries your name into the next century, no scandal drags it into the gutter, no crowd loves you and no prosecutor wants you. You bought the game and then mostly just maintained it — a steady, capable, profoundly forgettable hand on a fortune that will be someone else's problem soon enough. Most players would envy you. None of them will remember you.`,
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
    text: `Somewhere on the climb the sermons stopped being about mercy and started being about enemies. You discovered that a charge of heresy, properly aimed, does the work of a thousand arguments — and you aimed it often. The doubters were silenced, the splinter parishes shuttered, the bread rationed to the loyal. The faith you inherited as a covenant of comfort, you left as an instrument of fear with your fingerprints on the handle. They obey you now, completely, in the way the frightened always obey. You told yourself the cause sanctified the cruelty. The cause, it turns out, was you.`,
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
      text: `You climbed every rung of the Council and never once reached for the knife it offered you. You opened the ledgers, fed the hungry without asking what they believed, and protected the doubter at your own table. Your Devotion is the genuine article — not manufactured, not coerced, simply earned — and your Heresy ledger is so thin the inquisitors gave up looking. When you finally rest, the petitions for your canonization begin before the candles burn out. They will argue for a century over whether you were truly touched by something higher. You will not be there to tell them the quiet truth: you were only, stubbornly, kind.`,
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
      text: `You never quite lied. You simply declined to correct them, and let the wonder swell in the retelling until the line between the shepherd and the divine grew too faint to find. The miracle you did not perform became scripture; the succession you refused to share became proof that there could only ever be you. Pilgrims arrive with the sick and the desperate, and your Devotion is total — a congregation that does not merely follow you but believes you, every word, as though disbelief had become physically impossible. It is the safest kind of power and the loneliest. You built a faith with exactly one article, and the article is your name.`,
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
      text: `You did not tear the old temple down — you propped its heavy doors open and let the air move through. The Reformists, who spent a generation waiting for one of their own to reach the Sacred Seat, finally got their shepherd, and your command of Doctrine meant no Orthodox elder could call the changes anything but faithful. You modernized the form without gutting the substance, made the mandate answerable, and built a faith confident enough to survive a question. The traditionalists mutter that you let the world in. The young say you let the light in. Both are right, which is the most a reformer can ever hope to be.`,
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
      text: `You reached the Sacred Seat, and that sentence is carrying most of the weight here. You were not a saint and not a tyrant, not an oracle and not a reformer — you were a steward who kept the candles lit and the doctrine more or less where you found it. The Council got its successor; the congregation got its shepherd; the famine and the schism and the foreign embargo each came and went and left you roughly where you started. No one will read your name from the pulpit a hundred years from now, except as the unremarkable figure between two who mattered. You held the seat warm for whoever came next. In a faith built on fervor, quiet competence is its own small heresy.`,
    };
  }
  return {
    endingId: 'anointed_default_reign',
    emoji: '🕯️',
    rank: 'THE SHEPHERD',
    win: true,
    verdict: 'A Long, Quiet Reign',
    title: 'A Long, Quiet Reign',
    text: `There was no schism, no inquisition, no canonization — only a reign that went on, and on, and quietly worked. You learned the Council's rhythms and the congregation's needs and kept both fed enough to stay loyal and faithful enough to stay obedient. You blessed the harvests, mediated the elders, and let the sharper questions die of old age rather than answer them. When the histories are written you will fill a respectable chapter: a shepherd who held the flock together through ordinary years, asked for little, and was rarely loved and never quite feared. The Sacred Covenant endured under your hand. Whether it grew is a question you were always careful never to put to a vote.`,
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
      text: `The Scrutiny became a flood no spin could hold back. ${flag(S, 'corrupt_streak') ? 'The money trail was simply too long. ' : ''}You're hauled before the cameras, gavel falls, and the career you built is dismantled live on the evening news. They'll use your name as a cautionary verb for a generation.`,
    };
  } else if (cause === 'purge') {
    e = {
      endingId: 'purge',
      emoji: '🚪',
      rank: 'PURGED',
      win: false,
      verdict: 'Purged',
      title: 'Vanished from the Photographs',
      text: `Suspicion reached the leadership, and in the Union that is a sentence, not a feeling. ${flag(S, 'foreign_ties') ? 'The foreign contacts were the thread they pulled. ' : ''}One morning your office is reassigned, your portrait comes down, and the official record is quietly edited to suggest you were never there at all. ${purges(S) >= 3 ? 'You sent many down this same corridor. There is a grim symmetry to it.' : ''}`,
    };
  } else if (cause === 'collapse') {
    e = {
      endingId: 'collapse',
      emoji: '📉',
      rank: 'REPUDIATED',
      win: false,
      verdict: 'Repudiated',
      title: 'The People Turned Away',
      text: `Approval bled out drop by drop until there was nothing holding you up. The donors stopped calling; the cameras found fresher faces. ${flag(S, 'went_negative') ? "You'd burned every bridge you might have walked back across. " : ''}You leave public life as a footnote with a Wikipedia page nobody updates.`,
    };
  } else if (cause === 'revolution') {
    e = {
      endingId: 'revolution',
      emoji: '🔥',
      rank: 'OVERTHROWN',
      win: false,
      verdict: 'Overthrown',
      title: 'The Square Won',
      text: `Legitimacy is the one thing the Party cannot manufacture forever. When it ran out, the people did the unthinkable and the soldiers did not stop them. ${flag(S, 'bloody_hands') ? 'They remembered the square you cleared. They returned the favor. ' : ''}History will argue about you for a century, which is more than most cadres get.`,
    };
  } else if (cause === 'lost_election') {
    e = {
      endingId: 'lost_election',
      emoji: '🗳️',
      rank: 'DEFEATED',
      win: false,
      verdict: 'Defeated at the Polls',
      title: `Conceding ${['the Senate seat', "the Governor's race", 'the Presidency'][Math.max(0, S.phase - 1)] ?? ''}`,
      text: `The votes came in and they weren't enough. You give the gracious concession speech with the fixed smile every losing candidate wears. ${composite > 120 ? "You were good — maybe even great — but in democracy 'almost' sends you home all the same. " : ''}Somewhere a strategist is already writing the book on what you did wrong.`,
    };
  } else if (cause === 'lost_powerplay') {
    e = {
      endingId: 'lost_powerplay',
      emoji: '♟️',
      rank: 'OUTMANEUVERED',
      win: false,
      verdict: 'Outmaneuvered',
      title: 'A Rival Rose Instead',
      text: `In the windowless rooms where it's actually decided, you were counted and found short. ${flag(S, 'struck_first') ? 'You moved too soon and showed your hand. ' : 'You waited a beat too long, and the beat belonged to someone else. '}A rival's portrait goes up where yours might have. You're 'promoted' to an honorary post with a long title and no telephone.`,
    };
  } else if (cause === 'resign') {
    e = {
      endingId: 'resign',
      emoji: '🚶',
      rank: 'WALKED AWAY',
      win: false,
      verdict: 'Stepped Aside',
      title: 'You Chose the Door',
      text: `Not every story ends in a fall or a crown. You looked at the road ahead — the compromises, the knives, the cameras — and you simply stopped climbing. ${ballot ? 'You return to private life with your reputation intact and your ambitions unanswered.' : 'In the Union, the ones who walk away quietly are the lucky ones. You were lucky.'} The game goes on without you.`,
    };
  } else if (cause === 'arrested') {
    e = {
      endingId: 'arrested',
      emoji: '🚓',
      rank: 'NEUTRALIZED',
      win: false,
      verdict: 'Neutralized',
      title: 'Removed in the Night',
      text: `The courts, the generals, or a foreign coalition moved first, and they moved in the dark. ${flag(S, 'foreign_ties') ? 'The foreign ledger was the thread they pulled. ' : ''}The trial is theatrical and the verdict predetermined. You become the thing you always accused others of being: a warning.`,
    };
  } else if (cause === 'dissolved') {
    e = {
      endingId: 'dissolved',
      emoji: '💢',
      rank: 'DISSOLVED',
      win: false,
      verdict: 'Dissolved',
      title: 'The Movement Collapsed',
      text: `You gave them a cause and they gave you everything — until the day the cause ran dry and they gave you nothing at all. ${flag(S, 'bloody_hands') ? 'The ones who did the work remembered who pointed them at it. ' : ''}The Order splinters into factions, each claiming your name while ignoring your fate.`,
    };
  } else if (cause === 'indicted') {
    e = {
      endingId: 'indicted',
      emoji: '⚖️',
      rank: 'INDICTED',
      win: false,
      verdict: 'Indicted',
      title: 'The Prosecutors Got There',
      text: `The prosecutor had nothing to lose, which is exactly the kind you never anticipated. ${flag(S, 'corrupt_streak') ? 'The offshore structures unravel on a live feed. ' : ''}You spend more on legal fees in one month than most people earn in a lifetime. It doesn't help.`,
    };
  } else if (cause === 'hostile_takeover') {
    e = {
      endingId: 'hostile_takeover',
      emoji: '📉',
      rank: 'OUTBID',
      win: false,
      verdict: 'Outbid',
      title: 'The Acquired',
      text: `A rival faction of the elite moved while you were overextended and the public was looking. There is a poetry to it: you built your whole career on the acquisition, and then you became the acquired.`,
    };
  } else if (cause === 'excommunicated') {
    e = {
      endingId: 'excommunicated',
      emoji: '🔔',
      rank: 'EXCOMMUNICATED',
      win: false,
      verdict: 'Excommunicated',
      title: 'Stripped of All Standing',
      text: `The Council convened in extraordinary session and the verdict was unanimous. ${flag(S, 'bloody_hands') ? 'The discipline you once dispensed is now aimed at you. ' : ''}You are stripped of every title and barred from the sacred halls you spent your life climbing. The proclamation is read from every pulpit. You have never felt so alone, or so precisely located.`,
    };
  } else if (cause === 'schism') {
    e = {
      endingId: 'schism',
      emoji: '➗',
      rank: 'SCHISM',
      win: false,
      verdict: 'Schism',
      title: 'The Flock Divided',
      text: `Devotion is not a resource you can manufacture — it must be earned, and you spent yours. A rival claimed the mandate and the congregation followed, because the congregation always follows whoever speaks to the thing they need most. Tonight that is not you.`,
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
          ? `You reached the summit without selling the last of yourself. You governed with a steadiness that historians will call wisdom and rivals called naivety — right up until it worked. The Republic is more decent for your having climbed it. A rare sentence to write about anyone in power.`
          : `You spent a lifetime learning the Party's knives, and then — astonishingly — you used the top job to put them down. You loosened the grip, opened the windows, let the Union breathe. Hardliners call it betrayal; the people call it the morning. The statue they build you will be controversial and very, very large.`,
      };
    } else if (f.bloody_hands || f.tyrant_rep || purges(S) >= 5 || st.heat >= 70) {
      e = {
        endingId: 'tyrant',
        emoji: '⛓️',
        rank: 'THE TYRANT',
        win: true,
        verdict: 'Ruled by Fear',
        title: ballot ? 'The Strongman of the Republic' : 'Absolute Power',
        text: `You made it to the top and then made sure no one could ever take you down. ${purges(S) >= 5 ? `At least ${purges(S)} careers were buried to clear your path. ` : ''}Your rule is total, your portrait everywhere, your enemies nowhere. The trains run on time and no one asks where the dissidents went. You are powerful, secure, and alone at the very top of a very cold mountain.`,
      };
    } else if (f.own_cult || (f.cult_building && st.media >= 60)) {
      e = {
        endingId: 'beloved',
        emoji: '🌟',
        rank: 'THE BELOVED LEADER',
        win: true,
        verdict: 'A Living Legend',
        title: 'The Cult of You',
        text: `Your face is on the currency, the stamps, the schoolroom walls. Children sing songs with your name in the chorus. ${st.support >= 55 ? 'And the remarkable thing is that much of the adoration is real — you gave them something to believe in. ' : 'Whether they truly love you or merely perform it perfectly is a question no one dares ask aloud. '}You have become less a person than a symbol, which is exactly what you wanted, and lonelier than you expected.`,
      };
    } else if (f.corrupt_streak && st.funds >= 55) {
      e = {
        endingId: 'kleptocrat',
        emoji: '💰',
        rank: 'THE KLEPTOCRAT',
        win: true,
        verdict: 'Rich and in Charge',
        title: 'Power Was Just the Beginning',
        text: `You won the whole game and quietly looted it along the way. The treasury and your personal fortune became difficult to tell apart, and you preferred it that way. ${ballot ? 'Reforms were proposed; you owned the people proposing them. ' : "The Party's wealth flowed through channels that happened to pass through you. "}You'll die comfortable, powerful, and with offshore accounts in nations that don't extradite.`,
      };
    } else if (composite >= 150 && st.support >= 55) {
      e = {
        endingId: 'great_leader',
        emoji: '🏆',
        rank: 'THE GREAT LEADER',
        win: true,
        verdict: 'Genuinely Beloved',
        title: ballot ? 'A Presidency for the History Books' : 'The Architect of the Age',
        text: `You reached the top strong, popular, and in command — the rarest trifecta in politics. You spend your time at the summit actually governing, and governing well. ${flag(S, 'clean_streak') || flag(S, 'honest_rep') ? 'That you did it with your hands mostly clean will baffle cynics forever. ' : ''}When you finally step down, the crowds are real and the tears are real and the era takes your name.`,
      };
    } else if (composite <= 70 || st.support < 40) {
      e = {
        endingId: 'placeholder',
        emoji: '🪑',
        rank: 'THE PLACEHOLDER',
        win: true,
        verdict: 'Technically Won',
        title: ballot ? 'A Forgettable Term' : 'A Caretaker at the Top',
        text: `You got there. That sentence is doing a lot of work. You reached the highest office and then... mostly held it. No catastrophe, no triumph, a steady drift of adequate decisions. ${st.heat >= 50 ? 'You spent most of your authority just surviving the scandals nipping at your heels. ' : ''}You'll be a trivia answer — the leader people half-remember, between two more interesting ones.`,
      };
    } else {
      e = {
        endingId: 'operator',
        emoji: '🎖️',
        rank: 'THE OPERATOR',
        win: true,
        verdict: 'A Capable Hand',
        title: ballot ? 'A Solid, Real Presidency' : 'A Secure Reign',
        text: `You climbed the whole ladder on competence and nerve, and you run the place like someone who earned it. ${flag(S, 'has_network') ? 'The network you built holds the whole structure together — favors owed in every office that matters. ' : ''}Not beloved enough for legend, not feared enough for nightmare, but powerful, effective, and firmly, unmistakably in charge. Most who play this game would kill for your ending. Some did.`,
      };
    }
  }
  e.legacy = scorecard(S, e.verdict);
  return e;
}
