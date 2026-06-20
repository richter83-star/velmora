/**
 * Run-state factory (pure) — builds a fresh GameState with the default field
 * values shared by the live engine (startCareer) and the headless simulator
 * (createRun), so the two construct identical run shapes. Caller-specific setup
 * that follows (trait bonus, world roll, antagonist, opponent, rivals,
 * difficulty, modifiers) is layered on by each caller afterward.
 */
import type { GameState, Stats, PathKey } from './types';
import { initBlocs } from './factions';

export interface BlankRunOpts {
  version: string;
  seed: number;
  rngState: number;
  path: PathKey;
  stats: Stats;
  player: GameState['player'];
  difficulty: string;
  daily: boolean;
}

export function blankRun(opts: BlankRunOpts): GameState {
  return {
    version: opts.version,
    seed: opts.seed,
    rngState: opts.rngState,
    path: opts.path,
    phase: 1,
    phaseTurn: 0,
    totalTurns: 0,
    stats: opts.stats,
    player: opts.player,
    world: {},
    rivals: [],
    usedOpp: [],
    opp: '',
    oppAvatar: '',
    npcs: {},
    antagonistId: '',
    scandals: [],
    activeScandal: null,
    difficulty: opts.difficulty,
    modifiers: [],
    daily: opts.daily,
    blocs: initBlocs(opts.path),
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
}
