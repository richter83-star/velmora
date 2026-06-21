import type { PathKey } from '../engine/types';

/** Stable NPC ids that content (`npcFx`) is allowed to target. */
export const KNOWN_NPC_IDS = ['antagonist'] as const;

/** The recurring antagonist's role label, per path. */
export const ANTAGONIST_ROLE: Record<PathKey, string> = {
  ballot: 'your perennial rival',
  vanguard: 'the rival who is always watching',
  iron: 'the rival who covets the movement',
  gilded: 'the rival who wants your portfolio',
  anointed: 'the rival who claims the mandate',
};

/** Antagonists start hostile. */
export const ANTAGONIST_START_RELATIONSHIP = -35;
