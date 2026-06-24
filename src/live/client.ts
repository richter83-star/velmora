/**
 * Live Storyteller — the BYOK network client. Calls the user's OWN Anthropic
 * endpoint with the user's OWN key (from localStorage, never bundled/committed),
 * forcing the emit_event tool so the reply is structured JSON. Pure I/O: it
 * returns the raw tool input (to be validated by safety.ts) or null on ANY
 * failure — non-ok status, timeout, offline, malformed body. The caller treats
 * null as "fall back to on-device content", so the game never blocks on it.
 *
 * Privacy/secrets: the key is read only here, sent only to the user's endpoint,
 * never logged, never persisted anywhere but the dedicated localStorage entry.
 */
import type { GameState } from '../engine/types';
import { buildPrompt } from './prompt';
import { EMIT_EVENT_TOOL } from './contract';

const ENDPOINT = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_VERSION = '2023-06-01';
const TIMEOUT_MS = 7000;

export interface LiveClientOpts {
  apiKey: string;
  model: string;
  signal?: AbortSignal;
}

/** Request one structured dilemma. Returns the raw emit_event input, or null. */
export async function requestLiveEvent(
  S: GameState,
  opts: LiveClientOpts,
): Promise<unknown | null> {
  if (!opts.apiKey || !opts.model) return null;
  const { system, user } = buildPrompt(S);
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  if (opts.signal) opts.signal.addEventListener('abort', () => ctrl.abort());
  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': opts.apiKey,
        'anthropic-version': ANTHROPIC_VERSION,
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: opts.model,
        max_tokens: 1024,
        system,
        messages: [{ role: 'user', content: user }],
        tools: [EMIT_EVENT_TOOL],
        tool_choice: { type: 'tool', name: 'emit_event' },
      }),
      signal: ctrl.signal,
    });
    if (!res.ok) return null;
    const data = await res.json();
    const block = Array.isArray(data?.content)
      ? data.content.find(
          (b: { type?: string; name?: string }) =>
            b?.type === 'tool_use' && b?.name === 'emit_event',
        )
      : null;
    return block?.input ?? null;
  } catch {
    return null; // offline, timeout, CORS, malformed — fall back silently
  } finally {
    clearTimeout(timer);
  }
}
