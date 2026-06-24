/**
 * Adaptive Nemesis (pure) — turns the recurring antagonist into an adversary
 * whose strategy is a function of how YOU have played. Each turn it reads your
 * live build (weakest/strongest stat, most-alienated bloc, worst latent scandal,
 * heat) and commits to a doctrine; the doctrine picks an axis of events to press
 * and how hard the rival fights at the next contest. Deterministic from S, so
 * the seed reproduces it exactly while a different playstyle on the same seed
 * faces a different opponent. Generates no text — it only biases selection and
 * the (already-clamped) contest, so it never touches the content-safety surface.
 */
import type { GameState, StatKey } from '../types';
import { blocList } from '../factions';
import { latentScandals } from '../scandals';
import { antagonist, antagonistContestModifier } from '../npcs';
import type { Axis } from './tags';

export type Doctrine =
  | 'saboteur'
  | 'coalition_raider'
  | 'muckraker'
  | 'institutionalist'
  | 'opportunist';

export interface NemesisPlan {
  doctrine: Doctrine;
  /** The event axis the rival pushes pressure toward this turn. */
  pressureAxis: Axis;
  /** Added to the contest hostility input (already-clamped downstream). */
  contestEdge: number;
}

const STAT_AXIS: Record<StatKey, Axis> = {
  support: 'populism',
  base: 'populism',
  funds: 'dealmaking',
  influence: 'network',
  media: 'network',
  heat: 'risk',
};

const STATS: readonly StatKey[] = ['support', 'funds', 'influence', 'media', 'base'];

const clamp = (n: number, a: number, b: number): number => Math.max(a, Math.min(b, n));

/** The rival's plan for this turn — a pure read of the player's build. */
export function planNemesis(S: GameState): NemesisPlan {
  const st = S.stats;
  // weakest / strongest non-heat stat
  let weak: StatKey = 'support';
  let strong: StatKey = 'support';
  for (const k of STATS) {
    if (st[k] < st[weak]) weak = k;
    if (st[k] > st[strong]) strong = k;
  }
  const blocs = blocList(S);
  const minBloc = blocs.length
    ? blocs.reduce((m, b) => (b.value < m.value ? b : m))
    : { value: 50 };
  const worstScandal = latentScandals(S).reduce((m, s) => Math.max(m, s.severity ?? 0), 0);

  const scores: Record<Doctrine, number> = {
    saboteur: 60 - st[weak], // exploit your weakest lever
    coalition_raider: 50 - minBloc.value, // raid the bloc you alienated
    muckraker: worstScandal * 0.7 + Math.max(0, st.heat - 45) * 0.6, // weaponize your dirt
    institutionalist: st[strong] - 58, // starve your strongest lever
    opportunist: 10, // baseline: rile the public against you
  };
  let doctrine: Doctrine = 'opportunist';
  for (const d of Object.keys(scores) as Doctrine[]) if (scores[d] > scores[doctrine]) doctrine = d;

  const pressureAxis: Axis =
    doctrine === 'saboteur'
      ? STAT_AXIS[weak]
      : doctrine === 'coalition_raider'
        ? 'network'
        : doctrine === 'muckraker'
          ? 'risk'
          : doctrine === 'institutionalist'
            ? STAT_AXIS[strong]
            : 'populism';

  // The rival presses harder the more exploitable your build is, on top of its
  // standing hostility — but bounded so the contest never becomes unwinnable
  // (the downstream clamps protect the ending spread).
  const a = antagonist(S);
  const hostility = a ? antagonistContestModifier(a.relationship) : 0;
  const doctrineBonus = clamp(scores[doctrine] * 0.18, 0, 7);
  const contestEdge = clamp(hostility + doctrineBonus, -15, 18);

  return { doctrine, pressureAxis, contestEdge };
}
