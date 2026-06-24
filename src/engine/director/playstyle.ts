/**
 * Playstyle vector (pure) — a small unit vector describing HOW the player has
 * been governing, read entirely from already-persisted state (flags they set,
 * their stat profile). The Director uses it to surface events that resonate with
 * the player's emerging identity, so a populist-aggressor and a technocratic
 * reformer walk visibly different paths through the same event bank. Pure and
 * seed-reproducible: it is a function of S only, recomputed each turn.
 */
import type { GameState } from '../types';
import { AXES, FLAG_AXIS, type Axis } from './tags';

export type PlaystyleVec = Record<Axis, number>;

function zero(): PlaystyleVec {
  return {
    aggression: 0,
    integrity: 0,
    dealmaking: 0,
    populism: 0,
    cult: 0,
    network: 0,
    risk: 0,
  };
}

/** The player's current playstyle as a normalized axis vector. */
export function buildVector(S: GameState): PlaystyleVec {
  const v = zero();
  // 1) archetype tally from the flags the player's choices have set.
  for (const [k, val] of Object.entries(S.flags ?? {})) {
    if (!val) continue;
    const a = FLAG_AXIS[k];
    if (!a) continue;
    v[a] += typeof val === 'number' ? Math.min(3, val) : 1;
  }
  // 2) stat profile contributes a softer lean (where your power actually sits).
  const st = S.stats;
  v.dealmaking += st.funds / 80;
  v.populism += (st.base + st.support) / 200;
  v.network += (st.influence + st.media) / 200;
  v.risk += st.heat / 70;
  // 3) normalize to a unit vector so the scoring temperature (BETA) is stable
  //    across early/late game regardless of how many flags have accrued.
  const mag = Math.hypot(...AXES.map((a) => v[a])) || 1;
  for (const a of AXES) v[a] /= mag;
  return v;
}
