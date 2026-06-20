/**
 * Headless run simulator — plays a full career with no DOM, using the SHARED
 * engine modules (draw `chooseNext`, `applyChoice`, mutation helpers, ending
 * logic) plus faithful pure ports of the factory / turn / contest. Enables a
 * fast seeded sweep (repeat-rate + ending reachability) without a browser.
 *
 * The choice policy is a seeded random unlocked choice, so the sweep exercises
 * varied flag/stat paths and reaches a spread of endings.
 */
import type { GameState, GameEvent, PathKey } from './types';
import { createRng, type Rng } from './rng';
import { ALL_EVENTS } from '../content/all-events';
import { PATHS } from '../content/paths';
import { TRAITS } from '../content/traits';
import { WORLD } from '../content/world';
import { DIFFICULTIES, DEFAULT_DIFFICULTY, MODIFIERS } from '../content/setup';
import { ANTAGONIST_ROLE, ANTAGONIST_START_RELATIONSHIP } from '../content/npcs';
import { difficultyById, applyDifficultyStart, rollModifiers, applyModifier } from './setup';
import { antagonist, antagonistContestModifier } from './npcs';
import { evaluateEnding } from './endings';
import { chooseNext } from './draw';
import { applyFx } from './mutate';
import { applyChoice } from './resolve';

const clamp = (n: number, a = 0, b = 100): number => Math.max(a, Math.min(b, n));

const curPhase = (S: GameState) => PATHS[S.path].phases[S.phase - 1]!;

function deathCause(S: GameState): string | null {
  if (S.stats.heat >= 100) return S.path === 'ballot' ? 'scandal' : 'purge';
  if (S.stats.support <= 0) return S.path === 'ballot' ? 'collapse' : 'revolution';
  return null;
}

function promoPlayerStrength(S: GameState): number {
  const s = S.stats;
  if (curPhase(S).promo.type === 'election') {
    return s.support * 0.5 + s.media * 0.24 + s.funds * 0.14 + s.base * 0.12;
  }
  return clamp(
    s.influence * 0.42 + s.base * 0.3 + s.media * 0.14 + s.support * 0.14 - s.heat * 0.22,
    0,
    100,
  );
}

/** Build a fresh run state (faithful port of startCareer's pure parts). */
function createRun(path: PathKey, difficulty: string, rng: Rng): GameState {
  const P = PATHS[path];
  const S: GameState = {
    version: 'sim',
    seed: rng.seed,
    rngState: rng.getState(),
    path,
    phase: 1,
    phaseTurn: 0,
    totalTurns: 0,
    stats: { ...P.start },
    player: {
      name: 'Sim',
      title: P.phases[0]!.title,
      avatar: null,
      faction: P.factions[0]!.id,
      trait: TRAITS[0]!.id,
    },
    world: {},
    rivals: [],
    usedOpp: [],
    opp: '',
    oppAvatar: '',
    npcs: {},
    antagonistId: '',
    scandals: [],
    activeScandal: null,
    difficulty: difficulty || DEFAULT_DIFFICULTY,
    modifiers: [],
    daily: false,
    flags: {},
    arcs: {},
    seen: [],
    queue: [],
    log: [],
    lastResult: null,
    lastDeltas: null,
    pendingDeath: null,
    pendingEndingCause: null,
    mode: 'event',
    over: false,
    ending: null,
    promo: null,
    current: null,
  };
  const tr = TRAITS.find((t) => t.id === S.player.trait);
  if (tr) applyFx(S, tr.fx);
  S.world = {
    economy: rng.pick(WORLD.economy),
    mood: rng.pick(WORLD.mood),
    tension: rng.pick(WORLD.tension),
  };
  const oppName = rng.pick(P.oppNames);
  S.usedOpp.push(oppName);
  S.npcs.antagonist = {
    id: 'antagonist',
    name: oppName,
    role: ANTAGONIST_ROLE[path],
    kind: 'antagonist',
    avatar: '',
    relationship: ANTAGONIST_START_RELATIONSHIP,
    loyalty: 0,
    met: false,
    firstPhase: 1,
  };
  S.antagonistId = 'antagonist';
  S.opp = oppName;
  applyDifficultyStart(S, difficultyById(DIFFICULTIES, S.difficulty));
  const mods = rollModifiers(rng, MODIFIERS, 1);
  S.modifiers = mods.map((m) => m.id);
  for (const m of mods) applyModifier(S, m);
  return S;
}

/** Resolve the contest (faithful port). Returns an ending cause if the run ends, else null (phase advanced). */
function runContest(S: GameState, rng: Rng): string | null {
  const ph = curPhase(S);
  if (ph.promo.type === 'finale') return 'finale';
  const diff = difficultyById(DIFFICULTIES, S.difficulty);
  const a = antagonist(S);
  const hostility = a ? antagonistContestModifier(a.relationship) : 0;
  const oppStrength = clamp(
    (ph.promo.baseOpp ?? 50) + rng.int(-5, 9) + (S.phase - 1) * 3 + hostility + diff.oppBonus,
    20,
    90,
  );
  const wc = clamp(50 + (promoPlayerStrength(S) - oppStrength) * 1.4, 4, 96);
  if (rng.next() * 100 >= wc) {
    return ph.promo.type === 'election' ? 'lost_election' : 'lost_powerplay';
  }
  // advance phase
  S.phase++;
  S.phaseTurn = 0;
  S.player.title = curPhase(S).title;
  if (a) S.opp = a.name;
  if (rng.chance(0.55)) {
    const axis = rng.pick(['economy', 'mood', 'tension'] as const);
    S.world[axis] = rng.pick(WORLD[axis]);
  }
  return null;
}

/** Pick a random unlocked choice (seeded). */
function randomUnlocked(S: GameState, ev: GameEvent, rng: Rng): number {
  const idxs: number[] = [];
  ev.choices.forEach((c, i) => {
    if (!c.req || c.req(S)) idxs.push(i);
  });
  if (!idxs.length) return 0;
  return idxs[rng.int(0, idxs.length - 1)]!;
}

export interface RunTrace {
  path: PathKey;
  endingId: string;
  cause: string;
  drawn: string[];
  turns: number;
  phaseReached: number;
}

/** Simulate one full seeded run and return its trace. */
export function simulateRun(opts: {
  seed: string | number;
  path: PathKey;
  difficulty?: string;
}): RunTrace {
  const rng = createRng(opts.seed);
  const S = createRun(opts.path, opts.difficulty ?? DEFAULT_DIFFICULTY, rng);
  const diff = difficultyById(DIFFICULTIES, S.difficulty);
  const drawOpts = { crisisMult: diff.crisisMult, scandalMult: diff.scandalMult };
  const drawn: string[] = [];
  let cause: string | null = null;
  let guard = 0;

  while (!cause && guard++ < 600) {
    const d = chooseNext(S, ALL_EVENTS, rng, drawOpts);
    if (d.type === 'promotion') {
      cause = runContest(S, rng);
      continue;
    }
    drawn.push(d.event.id);
    cause = applyChoice(S, d.event, randomUnlocked(S, d.event, rng), rng)?.endingCause ?? null;
    if (cause) break;
    cause = deathCause(S);
    if (cause) break;
    // advanceTurn
    S.totalTurns++;
    S.phaseTurn++;
    for (const q of S.queue) q.inTurns = (q.inTurns ?? 0) - 1;
    S.stats.heat = clamp(S.stats.heat - 2);
    cause = deathCause(S);
    if (cause) break;
    if (S.phaseTurn >= curPhase(S).goalTurns) cause = runContest(S, rng);
  }

  const finalCause = cause ?? 'resign';
  const ending = evaluateEnding(S, finalCause);
  return {
    path: opts.path,
    endingId: ending.endingId,
    cause: finalCause,
    drawn,
    turns: S.totalTurns,
    phaseReached: S.phase,
  };
}
