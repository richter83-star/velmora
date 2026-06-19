/**
 * NPC roster — persistent characters with relationship/loyalty meters that
 * survive across phases (stored in `S.npcs`). The recurring antagonist lives
 * here under a stable id and is carried from office to office.
 */
import type { GameState, NPC, NpcFx } from './types';

const clamp = (n: number, lo: number, hi: number): number => Math.max(lo, Math.min(hi, n));

export function getNpc(S: GameState, id: string): NPC | undefined {
  return S.npcs?.[id];
}

export function antagonist(S: GameState): NPC | undefined {
  return S.antagonistId ? S.npcs?.[S.antagonistId] : undefined;
}

/** Apply a choice's npcFx to the roster (no-op if that NPC isn't present). */
export function applyNpcFx(S: GameState, fx: NpcFx | undefined): void {
  if (!fx) return;
  const npc = S.npcs?.[fx.id];
  if (!npc) return;
  if (typeof fx.relationship === 'number') {
    npc.relationship = clamp(npc.relationship + fx.relationship, -100, 100);
  }
  if (typeof fx.loyalty === 'number') {
    npc.loyalty = clamp(npc.loyalty + fx.loyalty, 0, 100);
  }
  npc.met = true;
}
