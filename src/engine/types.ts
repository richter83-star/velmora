/**
 * Core type model for Velmora's engine + content.
 *
 * `GameState` is the serializable run state (the prototype's `S`). Content
 * authors get these types for free: because the event/choice arrays are
 * declared with these types, the inline `(s) => …` functions are contextually
 * typed (no implicit `any`), and the data shapes are checked at compile time.
 * Zod (see content/schema.ts) enforces the same shapes at runtime.
 */

export type StatKey = 'support' | 'funds' | 'influence' | 'media' | 'base' | 'heat';
export type PathKey = 'ballot' | 'vanguard' | 'iron' | 'gilded' | 'anointed';

export type Stats = Record<StatKey, number>;
/** Hidden booleans + integer counters set by choices. */
export type Flags = Record<string, number | boolean | undefined>;

/** Stat deltas applied by a choice/outcome. */
export type Fx = Partial<Record<StatKey, number>>;
/** Flags to set (booleans, or small string/number markers). */
export type SetFlags = Record<string, boolean | number | string>;
/** Integer counters to add to. */
export type IncFlags = Record<string, number>;

/** Queue a delayed follow-up event. */
export interface ThenRef {
  id: string;
  inTurns?: number;
}

/** One side of a dice-rolled choice. */
export interface RollOutcome {
  fx?: Fx;
  set?: SetFlags;
  inc?: IncFlags;
  text?: string;
  then?: ThenRef[];
  ending?: string;
  arcSet?: ArcAdvance;
  npcFx?: NpcFx;
  scandal?: ScandalSeed;
  scandalResolve?: 'buried' | 'resolved' | 'exposed';
  /** Id of an event shown immediately as a sub-decision (no turn advance). */
  sub?: string;
}

export interface Roll {
  stat: StatKey;
  dc: number;
  success: RollOutcome;
  fail: RollOutcome;
}

export interface Speaker {
  name: string;
  role?: string;
  avatar?: string;
}

export interface Choice {
  label: string;
  hint?: string;
  fx?: Fx;
  req?: (s: GameState) => boolean;
  reqText?: string;
  set?: SetFlags;
  inc?: IncFlags;
  roll?: Roll;
  result?: string;
  then?: ThenRef[];
  /** A cause string that ends the game immediately. */
  ending?: string;
  /** Advance/branch a story arc to a stage when chosen. */
  arcSet?: ArcAdvance;
  /** Adjust an NPC's meters when chosen. */
  npcFx?: NpcFx;
  /** Record a latent scandal that may resurface later. */
  scandal?: ScandalSeed;
  /** Resolve the currently-resurfacing scandal. */
  scandalResolve?: 'buried' | 'resolved' | 'exposed';
  /** Id of an event shown immediately as a sub-decision (no turn advance). */
  sub?: string;
  /** Cosmetic accent: 'good' | 'slick' | 'bold'. */
  tone?: string;
}

/** "newspaper" | "bulletin" | "crisis" | "rival" | "scene" (open for new motifs). */
export type EventArt = string;

export interface GameEvent {
  id: string;
  paths: PathKey[];
  phases: number[];
  weight?: number;
  recurring?: boolean;
  queueOnly?: boolean;
  crisis?: boolean;
  /** Marks this event as a step of a story arc — drawable only at the matching stage. */
  arc?: ArcRef;
  req?: (s: GameState) => boolean;
  art?: EventArt;
  emoji?: string;
  kicker?: string;
  title: string;
  body: string | ((s: GameState) => string);
  speaker?: (s: GameState) => Speaker;
  choices: Choice[];
}

export interface Faction {
  id: string;
  name: string;
  desc: string;
}

export interface PromoConfig {
  type: 'election' | 'powerplay' | 'finale' | 'purge' | 'acquisition' | 'council';
  label: string;
  emoji: string;
  baseOpp?: number;
  oppTitle?: string;
}

export interface PhaseConfig {
  n: number;
  title: string;
  kicker: string;
  goalTurns: number;
  emoji: string;
  promo: PromoConfig;
}

export interface PathConfig {
  key: PathKey;
  land: string;
  theme: string;
  statNames: Record<StatKey, string>;
  start: Stats;
  factions: Faction[];
  phases: PhaseConfig[];
  oppNames: string[];
}

export interface Trait {
  id: string;
  name: string;
  emoji: string;
  desc: string;
  fx: Fx;
}

export interface WorldOption {
  k: string;
  t: string;
  mood?: number;
  d?: number;
}

export interface WorldTable {
  economy: WorldOption[];
  mood: WorldOption[];
  tension: WorldOption[];
}

/** The serializable run state (the prototype's `S`). */
export interface GameState {
  version: string;
  seed: number;
  rngState: number;
  path: PathKey;
  phase: number;
  phaseTurn: number;
  totalTurns: number;
  stats: Stats;
  player: { name: string; title: string; avatar: unknown; faction: string; trait: string };
  world: { economy?: WorldOption; mood?: WorldOption; tension?: WorldOption };
  rivals: unknown[];
  usedOpp: string[];
  opp: string;
  oppAvatar: string;
  flags: Flags;
  /** Story-arc stages (arcId -> stage); persists across phases. */
  arcs: Record<string, number>;
  /** Persistent NPC roster (npcId -> NPC); survives across phases. */
  npcs: Record<string, NPC>;
  /** The recurring antagonist's npc id (carried across phases). */
  antagonistId: string;
  /** Latent/resolved scandals that can resurface (scandals with memory). */
  scandals: Scandal[];
  /** Id of the scandal currently resurfacing, or null. */
  activeScandal: string | null;
  /** Difficulty mode id. */
  difficulty: string;
  /** Per-run modifier ids rolled at start. */
  modifiers: string[];
  /** True if this run is the shared scenario-of-the-day. */
  daily: boolean;
  /** Faction/bloc standings (blocId -> 0..100); initialized at run start. */
  blocs?: Record<string, number>;
  /** Appointed advisors (cabinet), each with a loyalty meter. */
  cabinet?: { id: string; loyalty: number }[];
  /** Pending advisor slate offered at a promotion (UI state), or null. */
  cabinetOffer?: string[] | null;
  /** Id of an immediate sub-decision event to show next (no turn advance), or null. */
  pendingSub?: string | null;
  seen: string[];
  queue: ThenRef[];
  log: unknown[];
  lastResult: unknown;
  lastDeltas: unknown;
  pendingDeath: string | null;
  pendingEndingCause: string | null;
  mode: string;
  over: boolean;
  ending: Ending | null;
  promo: unknown;
  current: string | null;
  /** New Game+ tier (Phase 8). Optional so legacy saves migrate to 0. */
  ngPlus?: number;
}

export interface LegacyEntry {
  l: string;
  v: string;
}

export type EndingCause =
  | 'scandal'
  | 'purge'
  | 'collapse'
  | 'revolution'
  | 'lost_election'
  | 'lost_powerplay'
  | 'resign'
  | 'finale'
  | 'arrested'
  | 'dissolved'
  | 'indicted'
  | 'hostile_takeover'
  | 'excommunicated'
  | 'schism';

export interface Ending {
  /** Stable identifier for the ending branch (used by the reachability sweep). */
  endingId: string;
  emoji: string;
  rank: string;
  win: boolean;
  verdict: string;
  title: string;
  text: string;
  legacy?: LegacyEntry[];
}

export interface ArcRef {
  id: string;
  stage: number;
}

export interface ArcAdvance {
  id: string;
  stage: number;
}

export interface ArcDef {
  id: string;
  title: string;
  paths: PathKey[];
  /** Stage at which the arc's entry event becomes eligible (default 0). */
  entryStage?: number;
  /** Stages that close the arc out. */
  terminalStages?: number[];
  desc?: string;
}

export type NpcKind = 'antagonist' | 'ally' | 'rival' | 'patron' | 'aide';

export interface NPC {
  id: string;
  name: string;
  role: string;
  kind: NpcKind;
  /** Pre-built cartoon avatar SVG markup. */
  avatar: string;
  /** -100 (sworn enemy) .. +100 (devoted); 0 neutral. */
  relationship: number;
  /** 0..100, for allies/aides. */
  loyalty: number;
  met: boolean;
  firstPhase: number;
}

/** Adjust an NPC's meters from a choice/outcome. */
export interface NpcFx {
  id: string;
  relationship?: number;
  loyalty?: number;
}

export type ScandalStatus = 'latent' | 'buried' | 'resolved' | 'exposed';

/** A scandal a choice can plant; it lies latent until it resurfaces. */
export interface ScandalSeed {
  id: string;
  label: string;
  /** 1 (minor) .. 5 (career-ending). */
  severity: number;
}

export interface Scandal extends ScandalSeed {
  phase: number;
  turn: number;
  status: ScandalStatus;
}

export interface DifficultyDef {
  id: string;
  name: string;
  desc: string;
  /** Added to each starting stat (+ easier, − harder). */
  startStat: number;
  /** Added to contest opponent strength (− easier, + harder). */
  oppBonus: number;
  /** Crisis-chance multiplier. */
  crisisMult: number;
  /** Scandal-resurface-chance multiplier. */
  scandalMult: number;
}

export interface ModifierDef {
  id: string;
  name: string;
  desc: string;
  fx?: Fx;
  flags?: Record<string, boolean | number>;
  scandalSeed?: ScandalSeed;
  /** Shift the antagonist's starting relationship. */
  antagonistRel?: number;
}
