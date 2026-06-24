/**
 * Live Storyteller — the strict tool contract for BYOK LLM output. This is the
 * ONLY shape the model may emit: a deliberate SUBSET of the production event
 * schema with NO engine-semantic fields (no req/roll/then/sub/arcSet/npcFx/
 * ending) — an LLM must not author control flow. `body` is always a plain string
 * (so the linter's ${}-in-plain-string rule passes trivially), fx is restricted
 * to the six stat keys with a hard magnitude clamp, and choices are capped.
 *
 * This module lives under src/live/** and is lazy-loaded; src/engine and
 * src/content never import it (enforced by a CI guard test), so the deterministic
 * core and the seeded sweep are wholly insulated from the online path.
 */
import { z } from 'zod';
import type { GameEvent, GameState } from '../engine/types';

const STAT_DELTA = z.number().int().gte(-25).lte(25);

const FxSchema = z
  .object({
    support: STAT_DELTA.optional(),
    funds: STAT_DELTA.optional(),
    influence: STAT_DELTA.optional(),
    media: STAT_DELTA.optional(),
    base: STAT_DELTA.optional(),
    heat: STAT_DELTA.optional(),
  })
  .strict(); // reject any fx key outside the six stats

const LiveChoiceSchema = z
  .object({
    label: z.string().min(1).max(140),
    hint: z.string().max(160).optional(),
    fx: FxSchema.optional(),
    set: z.record(z.string(), z.boolean()).optional(),
    tone: z.enum(['good', 'slick', 'bold']).optional(),
  })
  .strict();

export const LiveEventSchema = z
  .object({
    kicker: z.string().max(60).optional(),
    title: z.string().min(1).max(120),
    body: z.string().min(1).max(1400),
    choices: z.array(LiveChoiceSchema).min(2).max(3),
  })
  .strict();

export type LiveEvent = z.infer<typeof LiveEventSchema>;

/** The JSON Schema handed to the model as the `emit_event` tool input_schema. */
export const EMIT_EVENT_TOOL = {
  name: 'emit_event',
  description: 'Emit exactly one self-contained political dilemma for the player.',
  input_schema: {
    type: 'object',
    additionalProperties: false,
    required: ['title', 'body', 'choices'],
    properties: {
      kicker: { type: 'string', maxLength: 60 },
      title: { type: 'string', minLength: 1, maxLength: 120 },
      body: { type: 'string', minLength: 1, maxLength: 1400 },
      choices: {
        type: 'array',
        minItems: 2,
        maxItems: 3,
        items: {
          type: 'object',
          additionalProperties: false,
          required: ['label'],
          properties: {
            label: { type: 'string', minLength: 1, maxLength: 140 },
            hint: { type: 'string', maxLength: 160 },
            fx: {
              type: 'object',
              additionalProperties: false,
              properties: {
                support: { type: 'integer', minimum: -25, maximum: 25 },
                funds: { type: 'integer', minimum: -25, maximum: 25 },
                influence: { type: 'integer', minimum: -25, maximum: 25 },
                media: { type: 'integer', minimum: -25, maximum: 25 },
                base: { type: 'integer', minimum: -25, maximum: 25 },
                heat: { type: 'integer', minimum: -25, maximum: 25 },
              },
            },
            tone: { type: 'string', enum: ['good', 'slick', 'bold'] },
          },
        },
      },
    },
  },
} as const;

let counter = 0;

/** Coerce a schema-valid LiveEvent into a full GameEvent for the current turn. */
export function coerceLiveEvent(live: LiveEvent, S: GameState): GameEvent {
  counter += 1;
  return {
    id: `live_${S.phase}_${counter}`,
    paths: [S.path],
    phases: [S.phase],
    weight: 10,
    art: 'scene',
    kicker: live.kicker,
    title: live.title,
    body: live.body,
    choices: live.choices.map((c) => ({
      label: c.label,
      hint: c.hint,
      fx: c.fx,
      set: c.set,
      tone: c.tone,
    })),
  };
}

/** A live_ event id (used to keep the live key + cache out of engine paths). */
export function isLiveId(id: string): boolean {
  return id.startsWith('live_');
}
