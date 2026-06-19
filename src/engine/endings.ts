/**
 * Endings — evaluateEnding(S, cause) reads final stats + the flags your choices
 * set, and composes a personalized verdict + scorecard. Lifted verbatim from the
 * prototype; each branch now carries a stable `endingId` so the reachability
 * sweep (Phase 3) can assert every ending is producible.
 *
 * cause: scandal | purge | collapse | revolution | lost_election |
 *        lost_powerplay | resign | finale
 */
import type { GameState, Ending, LegacyEntry } from './types';
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
  } else {
    /* ---------- FINALE — you reached the top; what kind of ruler? ---------- */
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
