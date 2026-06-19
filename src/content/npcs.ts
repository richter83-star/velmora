import type { PathKey } from '../engine/types';

/** Stable NPC ids that content (`npcFx`) is allowed to target. */
export const KNOWN_NPC_IDS = ['antagonist'] as const;

/** The recurring antagonist's role label, per path. */
export const ANTAGONIST_ROLE: Record<PathKey, string> = {
  ballot: 'your perennial rival',
  vanguard: 'the rival who is always watching',
};

/** Antagonists start hostile. */
export const ANTAGONIST_START_RELATIONSHIP = -35;
