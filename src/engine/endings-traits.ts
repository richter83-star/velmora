/**
 * Endings — small shared trait helpers (Overhaul P6 budget split).
 *
 * `purges` and `dominantTrait` are tiny pure readers used by BOTH the heavy
 * endings module (evaluateEnding + its long verdict prose) and the meta layer.
 * Keeping them here lets `meta.ts` import them without dragging the whole endings
 * bank — with its kilobytes of TV-MA payoff text — into the eager entry chunk.
 * `evaluateEnding` is now dynamic-imported at game-over, so the entry stays lean.
 */
import type { GameState } from './types';

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
