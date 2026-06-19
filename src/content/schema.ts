/**
 * Zod schemas mirroring the content types (runtime structural validation).
 * Semantic checks (duplicate ids, unresolved `then`, bad stat keys, `${}` in
 * plain strings, unreachable events, ending causes) live in `lint.ts`.
 */
import { z } from 'zod';

export const STAT_KEYS = ['support', 'funds', 'influence', 'media', 'base', 'heat'] as const;
export const PATH_KEYS = ['ballot', 'vanguard'] as const;
export const VALID_PHASES = [1, 2, 3] as const;
export const ENDING_CAUSES = [
  'scandal',
  'purge',
  'collapse',
  'revolution',
  'lost_election',
  'lost_powerplay',
  'resign',
  'finale',
] as const;

// Functions can't be deeply validated; just assert they're callable.
const fnSchema = z.custom<(s: unknown) => unknown>((v) => typeof v === 'function');

const numberRecord = z.record(z.string(), z.number());
const flagRecord = z.record(z.string(), z.union([z.boolean(), z.number(), z.string()]));

const thenRef = z.object({
  id: z.string().min(1),
  inTurns: z.number().int().positive().optional(),
});

const rollOutcome = z.object({
  fx: numberRecord.optional(),
  set: flagRecord.optional(),
  inc: numberRecord.optional(),
  text: z.string().optional(),
  then: z.array(thenRef).optional(),
  ending: z.string().optional(),
});

const roll = z.object({
  stat: z.string(),
  dc: z.number(),
  success: rollOutcome,
  fail: rollOutcome,
});

const choice = z.object({
  label: z.string().min(1),
  hint: z.string().optional(),
  fx: numberRecord.optional(),
  req: fnSchema.optional(),
  reqText: z.string().optional(),
  set: flagRecord.optional(),
  inc: numberRecord.optional(),
  roll: roll.optional(),
  result: z.string().optional(),
  then: z.array(thenRef).optional(),
  ending: z.string().optional(),
  tone: z.string().optional(),
});

export const EventSchema = z.object({
  id: z.string().min(1),
  paths: z.array(z.enum(PATH_KEYS)).min(1),
  phases: z.array(z.number().int()).min(1),
  weight: z.number().optional(),
  recurring: z.boolean().optional(),
  queueOnly: z.boolean().optional(),
  crisis: z.boolean().optional(),
  req: fnSchema.optional(),
  art: z.string().optional(),
  emoji: z.string().optional(),
  kicker: z.string().optional(),
  title: z.string().min(1),
  body: z.union([z.string(), fnSchema]),
  speaker: fnSchema.optional(),
  choices: z.array(choice).min(1),
});
