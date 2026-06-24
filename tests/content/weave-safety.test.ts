import { describe, it, expect } from 'vitest';
import { TEMPLATES } from '../../src/content/templates';
import { LEXICONS, LEX_KEYS } from '../../src/engine/grammar/lexicons';
import { realize, eligibleTemplates, type Template } from '../../src/engine/grammar/weave';
import { scanCore, scanRealizedText } from '../../src/content/denylist';
import { PATHS } from '../../src/content/paths';
import type { GameState, PathKey, StatKey } from '../../src/engine/types';

/**
 * The combinatorial content-safety gate. Loom's generated surface is finite per
 * template, so we ENUMERATE (not sample) every lexicon-pick combination against a
 * state matrix that surfaces every state-slot value (each stat as weakest, each
 * bloc as most-alienated, each rival disposition), realize each, and assert it is
 * schema-valid AND CORE-denylist-clean AND grammatically intact. This is what
 * makes the "combinatorial content is safe" claim sound rather than sampled.
 */

const STATS: StatKey[] = ['support', 'funds', 'influence', 'media', 'base'];
const DISPOSITIONS = [-70, -30, 0, 40, 70]; // hits each dispositionLabel band

function makeState(
  path: PathKey,
  phase: number,
  weakIdx: number,
  coolIdx: number,
  dispo: number,
  oppIdx: number,
): GameState {
  const stats: Record<StatKey, number> = {
    support: 50,
    funds: 50,
    influence: 50,
    media: 50,
    base: 50,
    heat: 20,
  };
  stats[STATS[weakIdx % STATS.length]!] = 8; // forces weakStat
  stats[STATS[(weakIdx + 2) % STATS.length]!] = 92; // forces a distinct strongStat
  const facs = PATHS[path].factions;
  const blocs: Record<string, number> = {};
  facs.forEach(
    (f, i) =>
      (blocs[f.id] = i === coolIdx % facs.length ? 8 : i === (coolIdx + 1) % facs.length ? 92 : 50),
  );
  const opp = PATHS[path].oppNames[oppIdx % PATHS[path].oppNames.length]!;
  return {
    version: 't',
    seed: 1,
    rngState: 1,
    path,
    phase,
    phaseTurn: 1,
    totalTurns: 6,
    stats,
    player: {
      name: 'P',
      title: PATHS[path].phases[phase - 1]!.title,
      avatar: null,
      faction: facs[0]!.id,
      trait: 'orator',
    },
    world: {},
    rivals: [],
    usedOpp: [],
    opp,
    oppAvatar: '',
    flags: {},
    arcs: {},
    npcs: {
      antagonist: {
        id: 'antagonist',
        name: opp,
        role: 'Rival',
        kind: 'antagonist',
        avatar: '',
        relationship: dispo,
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

/** All index tuples for a template's lexicon slots. */
function lexCombos(tpl: Template): number[][] {
  const dims = (tpl.lex ?? []).map((k) => LEXICONS[k].length);
  let combos: number[][] = [[]];
  for (const n of dims) {
    const next: number[][] = [];
    for (const c of combos) for (let i = 0; i < n; i++) next.push([...c, i]);
    combos = next;
  }
  return combos;
}

describe('Loom — static skeletons + lexicons are CORE-clean', () => {
  it('every lexicon entry passes the denylist', () => {
    for (const k of LEX_KEYS)
      for (const entry of LEXICONS[k])
        expect(scanCore(entry), `lexicon ${k}: "${entry}"`).toEqual([]);
  });

  it('every template skeleton string passes the denylist', () => {
    for (const tpl of TEMPLATES) {
      const strings = [
        tpl.title,
        tpl.body,
        tpl.kicker,
        ...tpl.choices.flatMap((c) => [c.label, c.hint, c.result]),
      ];
      for (const s of strings) expect(scanCore(s), `template ${tpl.id}`).toEqual([]);
    }
  });
});

describe('Loom — exhaustive weave is schema-valid, denylist-clean, and grammatical', () => {
  it('every reachable realization across all paths is safe', () => {
    let realizations = 0;
    for (const path of ['ballot', 'vanguard', 'iron', 'gilded', 'anointed'] as const) {
      for (const phase of [1, 2, 3]) {
        const elig = eligibleTemplates(makeState(path, phase, 0, 0, 0, 0), TEMPLATES);
        for (const tpl of elig) {
          const combos = lexCombos(tpl);
          // 15 states rotate every state-slot value (5 stats x 3 blocs x 5 dispositions cover via lcm)
          for (let s = 0; s < 15; s++) {
            const S = makeState(path, phase, s, s, DISPOSITIONS[s % DISPOSITIONS.length]!, s);
            for (const picks of combos) {
              const ev = realize(tpl, S, picks);
              expect(
                ev,
                `${tpl.id} @ ${path} p${phase} state${s} picks${picks.join(',')}`,
              ).not.toBeNull();
              if (!ev) continue;
              realizations++;
              // defense in depth: the realized event re-scans clean
              expect(scanRealizedText(ev)).toEqual([]);
              // grammatical integrity: no orphan tokens, no double spaces
              const all = [
                ev.title,
                ev.body,
                ...ev.choices.flatMap((c) => [c.label, c.result ?? '']),
              ].join(' ');
              expect(all, `orphan token in ${tpl.id}`).not.toMatch(/\{[a-zA-Z_]+\}/);
              expect(all, `double space in ${tpl.id}`).not.toMatch(/ {2,}/);
              expect(ev.title.length).toBeGreaterThan(0);
              expect(ev.body.length).toBeGreaterThan(0);
            }
          }
        }
      }
    }
    expect(realizations).toBeGreaterThan(1000);
  });
});

describe('Loom — reweave reproduces a woven event exactly', () => {
  it('realize(tpl, S, picks) is deterministic in (tpl, S, picks)', () => {
    const S = makeState('iron', 2, 2, 1, -30, 3);
    const tpl = TEMPLATES.find((t) => (t.lex?.length ?? 0) >= 1)!;
    const a = realize(tpl, S, [1]);
    const b = realize(tpl, S, [1]);
    expect(a).not.toBeNull();
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });
});
