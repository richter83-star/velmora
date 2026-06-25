/**
 * Meta-progression (Phase 8) — PURE logic for the cross-run profile: lifetime
 * stats, a run-history ring buffer, an achievements catalog, and unlockables.
 *
 * No I/O lives here (the engine stays pure, like blankRun): src/main.js owns the
 * localStorage read/write with its in-memory fallback and calls these helpers.
 * Everything is immutable — recordRun/unlockAchievements return NEW meta objects.
 */
import type { GameState } from './types';
import { purges, dominantTrait } from './endings-traits';

export const META_VERSION = 1;
export const HISTORY_CAP = 50;
export const SLOT_COUNT = 3;

/** The seven winning ending ids (a completed "collection" — see endings.ts). */
export const WIN_ENDING_IDS = [
  'reformer',
  'tyrant',
  'beloved',
  'kleptocrat',
  'great_leader',
  'placeholder',
  'operator',
] as const;

export interface RunRecord {
  ts: number;
  path: string;
  endingId: string;
  win: boolean;
  rank: string;
  title: string;
  phase: number;
  totalTurns: number;
  difficulty: string;
  daily: boolean;
  modifiers: string[];
  ngPlus: number;
  seed: number | string | null;
  composite: number;
  purges: number;
  scandals: number;
  dominantTrait: string;
}

export interface MetaStats {
  runsStarted: number;
  runsFinished: number;
  wins: number;
  losses: number;
  byPath: { ballot: number; vanguard: number };
  bestComposite: number;
  totalYears: number;
  totalPurges: number;
  totalScandals: number;
  bestNgPlus: number;
}

export interface MetaState {
  metaVersion: number;
  activeSlot: number;
  stats: MetaStats;
  history: RunRecord[];
  achievements: Record<string, { ts: number }>;
  unlockables: Record<string, boolean>;
  ngPlus: { maxCleared: number; lastSeed: number | string | null };
  /** Paid-content entitlements (Phase 11, no pay-to-win). The base game (ballot
   * + vanguard) is always free; the future "Dark Mirrors" expansion gates its
   * extra paths on `expansion`. Default true while the purchase flow + expansion
   * content do not exist yet, so development/testing always has access. */
  entitlements: { expansion: boolean };
}

export function defaultStats(): MetaStats {
  return {
    runsStarted: 0,
    runsFinished: 0,
    wins: 0,
    losses: 0,
    byPath: { ballot: 0, vanguard: 0 },
    bestComposite: 0,
    totalYears: 0,
    totalPurges: 0,
    totalScandals: 0,
    bestNgPlus: 0,
  };
}

export function defaultMeta(): MetaState {
  return {
    metaVersion: META_VERSION,
    activeSlot: 0,
    stats: defaultStats(),
    history: [],
    achievements: {},
    unlockables: {},
    ngPlus: { maxCleared: 0, lastSeed: null },
    entitlements: { expansion: true },
  };
}

/** Whether the paid expansion's extra paths are unlocked (Phase 11 gate seam).
 * Defaults to true until a real purchase flow ships. */
export function isExpansionUnlocked(meta: MetaState): boolean {
  return meta.entitlements?.expansion !== false;
}

/**
 * Normalize possibly-partial / legacy stored meta into a complete MetaState.
 * Additive + defensive so future fields and old data both load cleanly.
 */
/** Coerce any stored value to a finite number, falling back to a default. */
function num(v: unknown, d = 0): number {
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : d;
}

export function mergeMeta(stored: unknown): MetaState {
  const m = defaultMeta();
  if (!stored || typeof stored !== 'object') return m;
  const s = stored as Partial<MetaState> & Record<string, unknown>;
  if (s.activeSlot !== undefined) m.activeSlot = clampSlot(num(s.activeSlot));
  // Whitelist + numerically coerce stat fields so tampered/garbage/future data
  // can never poison the lifetime rollups (recordRun does += / Math.max on these).
  if (s.stats && typeof s.stats === 'object') {
    const ss = s.stats as unknown as Record<string, unknown>;
    const bp = (ss.byPath && typeof ss.byPath === 'object' ? ss.byPath : {}) as Record<
      string,
      unknown
    >;
    m.stats = {
      runsStarted: num(ss.runsStarted),
      runsFinished: num(ss.runsFinished),
      wins: num(ss.wins),
      losses: num(ss.losses),
      byPath: { ballot: num(bp.ballot), vanguard: num(bp.vanguard) },
      bestComposite: num(ss.bestComposite),
      totalYears: num(ss.totalYears),
      totalPurges: num(ss.totalPurges),
      totalScandals: num(ss.totalScandals),
      bestNgPlus: num(ss.bestNgPlus),
    };
  }
  if (Array.isArray(s.history)) m.history = s.history.slice(-HISTORY_CAP) as RunRecord[];
  if (s.achievements && typeof s.achievements === 'object')
    m.achievements = { ...(s.achievements as Record<string, { ts: number }>) };
  if (s.unlockables && typeof s.unlockables === 'object')
    m.unlockables = { ...(s.unlockables as Record<string, boolean>) };
  if (s.ngPlus && typeof s.ngPlus === 'object') {
    const ng = s.ngPlus as unknown as Record<string, unknown>;
    m.ngPlus = {
      maxCleared: num(ng.maxCleared),
      lastSeed: (ng.lastSeed as number | string | null) ?? null,
    };
  }
  if (s.entitlements && typeof s.entitlements === 'object') {
    const ent = s.entitlements as unknown as Record<string, unknown>;
    m.entitlements = { expansion: ent.expansion !== false };
  }
  return m;
}

function clampSlot(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(SLOT_COUNT - 1, Math.floor(n)));
}

export function composite(S: GameState): number {
  const st = S.stats;
  return st.support + st.base + st.influence + st.media - st.heat;
}

function ngPlusOf(S: GameState): number {
  const n = (S as GameState & { ngPlus?: number }).ngPlus;
  return typeof n === 'number' && n > 0 ? n : 0;
}

/** Build an immutable history record from a finished run (S.ending must be set). */
export function runRecord(S: GameState, ts: number): RunRecord {
  const e = S.ending;
  return {
    ts,
    path: S.path,
    endingId: e ? e.endingId : 'unknown',
    win: !!(e && e.win),
    rank: e ? e.rank : '',
    title: e ? e.title : '',
    phase: S.phase,
    totalTurns: S.totalTurns || 0,
    difficulty: S.difficulty,
    daily: !!S.daily,
    modifiers: Array.isArray(S.modifiers) ? S.modifiers.slice() : [],
    ngPlus: ngPlusOf(S),
    seed: S.seed != null ? S.seed : null,
    composite: composite(S),
    purges: purges(S),
    scandals: Array.isArray(S.scandals) ? S.scandals.length : 0,
    dominantTrait: dominantTrait(S),
  };
}

/** Record a finished run: append to history (capped) and roll up lifetime stats. Returns NEW meta. */
export function recordRun(meta: MetaState, S: GameState, ts: number): MetaState {
  const rec = runRecord(S, ts);
  const history = meta.history.concat(rec).slice(-HISTORY_CAP);
  const st = { ...meta.stats, byPath: { ...meta.stats.byPath } };
  st.runsFinished += 1;
  if (rec.win) st.wins += 1;
  else st.losses += 1;
  if (rec.path === 'ballot' || rec.path === 'vanguard') st.byPath[rec.path] += 1;
  st.bestComposite = Math.max(st.bestComposite, rec.composite);
  st.totalYears += rec.totalTurns;
  st.totalPurges += rec.purges;
  st.totalScandals += rec.scandals;
  st.bestNgPlus = Math.max(st.bestNgPlus, rec.ngPlus);
  return { ...meta, history, stats: st };
}

/** Count a run start in lifetime stats. Returns NEW meta. */
export function recordStart(meta: MetaState): MetaState {
  return { ...meta, stats: { ...meta.stats, runsStarted: meta.stats.runsStarted + 1 } };
}

/* ----------------------------- achievements ----------------------------- */

export interface Achievement {
  id: string;
  name: string;
  desc: string;
  emoji: string;
  /** Unlock test, evaluated at run end with the finished run and post-recordRun meta. */
  test: (S: GameState, meta: MetaState) => boolean;
}

function f(S: GameState, k: string): boolean {
  return !!S.flags[k];
}
function isWin(S: GameState): boolean {
  return !!(S.ending && S.ending.win);
}
function endingIs(S: GameState, id: string): boolean {
  return !!(S.ending && S.ending.endingId === id);
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_run',
    name: 'Welcome to Power',
    desc: 'Finish your first career, win or lose.',
    emoji: '🎬',
    test: (_S, m) => m.stats.runsFinished >= 1,
  },
  {
    id: 'kept_their_soul',
    name: 'Kept Their Soul',
    desc: 'Reach the summit as the Reformer.',
    emoji: '🕊️',
    test: (S) => endingIs(S, 'reformer'),
  },
  {
    id: 'iron_fist',
    name: 'Iron Fist',
    desc: 'End a run having ordered 5 or more purges.',
    emoji: '⛓️',
    test: (S) => purges(S) >= 5,
  },
  {
    id: 'follow_the_money',
    name: 'Follow the Money',
    desc: 'Win as the Kleptocrat.',
    emoji: '💰',
    test: (S) => endingIs(S, 'kleptocrat'),
  },
  {
    id: 'cult_of_you',
    name: 'Cult of You',
    desc: 'Win as the Beloved Leader.',
    emoji: '🌟',
    test: (S) => endingIs(S, 'beloved'),
  },
  {
    id: 'historic',
    name: 'For the History Books',
    desc: 'Win as the Great Leader.',
    emoji: '🏆',
    test: (S) => endingIs(S, 'great_leader'),
  },
  {
    id: 'spotless',
    name: 'Spotless to the Summit',
    desc: 'Win with clean hands and no blood on them.',
    emoji: '✨',
    test: (S) => isWin(S) && (f(S, 'honest_rep') || f(S, 'clean_streak')) && !f(S, 'bloody_hands'),
  },
  {
    id: 'ironclad',
    name: 'Ironclad',
    desc: 'Win a run on Ironclad difficulty.',
    emoji: '🛡️',
    test: (S) => isWin(S) && S.difficulty === 'ironclad',
  },
  {
    id: 'teflon',
    name: 'Teflon',
    desc: 'Win despite weathering 3 or more scandals.',
    emoji: '🧴',
    test: (S) => isWin(S) && (Array.isArray(S.scandals) ? S.scandals.length : 0) >= 3,
  },
  {
    id: 'walked_away',
    name: 'The Door Was Open',
    desc: 'Choose to resign and walk away from power.',
    emoji: '🚶',
    test: (S) => endingIs(S, 'resign'),
  },
  {
    id: 'both_aisles',
    name: 'Both Sides of the Aisle',
    desc: 'Finish a career on each path.',
    emoji: '⚖️',
    test: (_S, m) => m.stats.byPath.ballot > 0 && m.stats.byPath.vanguard > 0,
  },
  {
    id: 'again_harder',
    name: 'Again, Harder',
    desc: 'Finish a run at New Game+ tier 2 or higher.',
    emoji: '🔁',
    test: (S) => ngPlusOf(S) >= 2,
  },
  {
    id: 'complete_almanac',
    name: 'Complete Almanac',
    desc: 'Reach all seven winning endings across your careers.',
    emoji: '📖',
    test: (_S, m) => {
      const seen = new Set(m.history.filter((r) => r.win).map((r) => r.endingId));
      return WIN_ENDING_IDS.every((id) => seen.has(id));
    },
  },
];

/**
 * Evaluate the catalog against a finished run (set-once). Returns the new meta
 * and the list of newly-unlocked ids (for toasts/announcements).
 */
export function unlockAchievements(
  meta: MetaState,
  S: GameState,
  ts: number,
): { meta: MetaState; newly: string[] } {
  const achievements = { ...meta.achievements };
  const newly: string[] = [];
  for (const a of ACHIEVEMENTS) {
    if (achievements[a.id]) continue; // set-once, never overwrite
    let ok = false;
    try {
      ok = a.test(S, meta);
    } catch {
      /* a throwing test simply never unlocks */
    }
    if (ok) {
      achievements[a.id] = { ts };
      newly.push(a.id);
    }
  }
  return { meta: { ...meta, achievements }, newly };
}

/* ----------------------------- unlockables ----------------------------- */

export interface Unlockable {
  id: string;
  name: string;
  desc: string;
  emoji: string;
  test: (meta: MetaState) => boolean;
}

export const UNLOCKABLES: Unlockable[] = [
  {
    id: 'ng_plus_access',
    name: 'New Game+',
    desc: 'Win any career to unlock harder New Game+ tiers.',
    emoji: '🔓',
    test: (m) => m.ngPlus.maxCleared > 0,
  },
  {
    id: 'ironclad_badge',
    name: 'Ironclad Crest',
    desc: 'A crest on the create screen, earned by winning on Ironclad.',
    emoji: '🛡️',
    test: (m) => !!m.achievements.ironclad,
  },
  {
    id: 'veteran',
    name: 'Seasoned Operator',
    desc: 'Finish five careers.',
    emoji: '🎖️',
    test: (m) => m.stats.runsFinished >= 5,
  },
  {
    id: 'almanac_complete',
    name: 'Full Collection',
    desc: 'Reach every winning ending at least once.',
    emoji: '📚',
    test: (m) => {
      const seen = new Set(m.history.filter((r) => r.win).map((r) => r.endingId));
      return WIN_ENDING_IDS.every((id) => seen.has(id));
    },
  },
];

/** Recompute unlockables from meta; returns NEW meta with the unlockables map refreshed. */
export function refreshUnlockables(meta: MetaState): MetaState {
  const unlockables = { ...meta.unlockables };
  for (const u of UNLOCKABLES) {
    if (u.test(meta)) unlockables[u.id] = true;
  }
  return { ...meta, unlockables };
}

export function isUnlocked(meta: MetaState, id: string): boolean {
  return !!meta.unlockables[id];
}
