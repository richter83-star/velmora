import { describe, it, expect } from 'vitest';
import { createRng } from '../../src/engine/rng';
import { stateSlots } from '../../src/engine/grammar/slots';
import {
  weaveTemplate,
  reweave,
  realize,
  eligibleTemplates,
  isWovenId,
  baseEventId,
  type Template,
} from '../../src/engine/grammar/weave';
import { TEMPLATES } from '../../src/content/templates';
import { PATHS } from '../../src/content/paths';
import type { GameState, PathKey, StatKey } from '../../src/engine/types';

function makeState(
  path: PathKey,
  opts: { weak?: StatKey; rel?: number; phase?: number } = {},
): GameState {
  const stats: Record<StatKey, number> = {
    support: 50,
    funds: 50,
    influence: 50,
    media: 50,
    base: 50,
    heat: 20,
  };
  if (opts.weak) stats[opts.weak] = 5;
  const facs = PATHS[path].factions;
  const blocs: Record<string, number> = {};
  facs.forEach((f, i) => (blocs[f.id] = i === 0 ? 10 : 60));
  return {
    version: 't',
    seed: 1,
    rngState: 1,
    path,
    phase: opts.phase ?? 2,
    phaseTurn: 1,
    totalTurns: 6,
    stats,
    player: {
      name: 'P',
      title: PATHS[path].phases[(opts.phase ?? 2) - 1]!.title,
      avatar: null,
      faction: facs[0]!.id,
      trait: 'orator',
    },
    world: {},
    rivals: [],
    usedOpp: [],
    opp: PATHS[path].oppNames[0]!,
    oppAvatar: '',
    flags: {},
    arcs: {},
    npcs: {
      antagonist: {
        id: 'antagonist',
        name: PATHS[path].oppNames[0]!,
        role: 'Rival',
        kind: 'antagonist',
        avatar: '',
        relationship: opts.rel ?? -40,
        loyalty: 0,
        met: true,
        firstPhase: 1,
      },
    },
    antagonistId: 'antagonist',
    scandals: [],
    activeScandal: null,
    difficulty: 'standard',
    modifiers: [],
    daily: false,
    blocs,
    seen: [],
    queue: [],
    log: [],
    lastResult: null,
    lastDeltas: null,
    pendingDeath: null,
    pendingEndingCause: null,
    mode: 'play',
    over: false,
    ending: null,
    promo: null,
    current: null,
  };
}

describe('grammar/slots.stateSlots', () => {
  it('reads the rival, weakest stat (path vocabulary), and alienated bloc from S', () => {
    const ss = stateSlots(makeState('iron', { weak: 'influence', rel: -70 }));
    expect(ss.rival).toBe(PATHS.iron.oppNames[0]);
    expect(ss.disposition).toBe('a bitter enemy');
    expect(ss.weakStat).toBe(PATHS.iron.statNames.influence); // "Cohesion"
    expect(ss.coolBloc).toBe(PATHS.iron.factions[0]!.name); // forced cool
  });
});

describe('grammar/weave', () => {
  it('weaves a schema-valid, woven-id event for each path', () => {
    const rng = createRng('w');
    for (const path of ['ballot', 'vanguard', 'iron', 'gilded', 'anointed'] as const) {
      const tpl = eligibleTemplates(makeState(path), TEMPLATES)[0]!;
      const ev = weaveTemplate(tpl, makeState(path), rng);
      expect(ev, path).not.toBeNull();
      expect(isWovenId(ev!.id)).toBe(true);
      expect(baseEventId(ev!.id)).toBe(tpl.id);
      expect(ev!.paths).toEqual([path]);
      expect(ev!.title).not.toMatch(/\{/); // no orphan tokens
    }
  });

  it('reweave(id, S) reproduces the exact woven event (reload path)', () => {
    const S = makeState('gilded', { weak: 'support', rel: 20 });
    const rng = createRng('seed-x');
    const tpl = eligibleTemplates(S, TEMPLATES).find((t) => (t.lex?.length ?? 0) >= 2)!;
    const woven = weaveTemplate(tpl, S, rng)!;
    // Simulate save/reload: rebuild purely from the composite id + S, no rng.
    const rebuilt = reweave(woven.id, S, TEMPLATES);
    expect(rebuilt).not.toBeNull();
    expect(JSON.stringify(rebuilt)).toBe(JSON.stringify(woven));
  });

  it('reweave returns null for an unknown template or a non-woven id', () => {
    const S = makeState('ballot');
    expect(reweave('authored_event_id', S, TEMPLATES)).toBeNull();
    expect(reweave('lm_does_not_exist#1.2', S, TEMPLATES)).toBeNull();
  });

  it('realize rejects a template that would produce denylisted text', () => {
    const S = makeState('ballot');
    const bad: Template = {
      id: 'lm_bad',
      paths: ['ballot'],
      phases: [2],
      title: 'The Soviet Question',
      body: 'A test.',
      choices: [{ label: 'ok', fx: { support: 1 } }],
    };
    expect(realize(bad, S, [])).toBeNull(); // "Soviet" is denylisted
  });
});
