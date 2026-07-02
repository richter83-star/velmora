/**
 * World-loop events (Civ P4) — the map and the deck feed each other.
 *
 * These are the only events that carry `realmFx` (mutating province state) and
 * that gate on `S.realm`. The loop: a flashpoint can flare your worst province;
 * a flared province (unrest >= REVOLT_UNREST) spreads to neighbours and makes the
 * world tick queue `p4_provincial_revolt`, which reads `S.crisisProvince`. All
 * effects are deterministic (no RNG), so the seeded event sweep stays sound.
 *
 * Content boundary: TV-MA political satire with the standing red lines — the
 * province names are fictional (generated per run), no real ideologies / religions
 * / nations / figures.
 */
import type { GameEvent } from '../engine/types';
import { worstProvince, REVOLT_UNREST } from '../engine/world-tick';

export const WORLD_EVENTS: GameEvent[] = [
  {
    // Pressure valve: flares (or soothes) whichever province is fraying. Fires at
    // most once per run (non-recurring) so it never inflates the repeat rate; one
    // ignore can tip an already-fraying province into revolt and start the loop.
    id: 'p4_frontier_tremor',
    paths: ['ballot', 'vanguard', 'iron', 'gilded', 'anointed'],
    phases: [1, 2, 3],
    weight: 6,
    art: 'bulletin',
    emoji: '📡',
    kicker: 'From the provinces',
    req: (S) => {
      const w = worstProvince(S.realm?.provinces ?? []);
      return !!w && w.unrest >= 38 && w.unrest < REVOLT_UNREST;
    },
    title: 'A Province Starts to Fray',
    body: (S) => {
      const w = worstProvince(S.realm?.provinces ?? []);
      return w
        ? `Word crawls up from ${w.name}: markets shuttered, a governor sweating on local radio, unrest at ${w.unrest} and climbing. Small enough to ignore. That is exactly how the big ones start.`
        : `Word crawls up from the provinces: something is fraying out there, and nobody wants to be the one who names it.`;
    },
    choices: [
      {
        label: 'Pour money into it',
        hint: 'buy the calm',
        fx: { funds: -5, support: 1 },
        realmFx: { target: 'worst', unrest: -10, development: 4 },
        result: 'The cheques clear, the barricades come down, and everyone agrees never to mention how close it got.',
      },
      {
        label: 'Send in the enforcers',
        hint: 'grip over goodwill',
        fx: { support: -3, heat: 2 },
        realmFx: { target: 'worst', control: 8, unrest: -6 },
        result: 'Order returns wearing body armour. The province is quiet the way a room goes quiet when you walk in.',
      },
      {
        label: 'Let them vent',
        hint: 'cheap today, dear later',
        fx: { funds: 1 },
        realmFx: { target: 'worst', unrest: 24 },
        result: "You call it respecting local feeling. The province calls it being left to rot, and tips over the edge.",
      },
    ],
  },
  {
    // The crisis: queued by the world tick when a province tips into open revolt.
    id: 'p4_provincial_revolt',
    paths: ['ballot', 'vanguard', 'iron', 'gilded', 'anointed'],
    phases: [1, 2, 3],
    queueOnly: true,
    crisis: true,
    art: 'crisis',
    emoji: '🔥',
    kicker: 'Open revolt',
    req: (S) => !!S.crisisProvince && !!S.realm?.provinces.some((p) => p.id === S.crisisProvince),
    title: 'A Province in Open Revolt',
    body: (S) => {
      const p = S.realm?.provinces.find((q) => q.id === S.crisisProvince);
      return p
        ? `${p.name} has stopped pretending to obey. Streets barricaded, your governor's calls going straight to voicemail, unrest at ${p.unrest}. It is yours in name and nothing else. Whatever you do next, the other provinces are watching to see if defiance works.`
        : `A province has slipped its leash entirely, and the rest are watching to see what it costs.`;
    },
    choices: [
      {
        label: 'Crush it, publicly',
        hint: 'make an example',
        fx: { support: -3, funds: -6, heat: 5 },
        realmFx: { target: 'trigger', unrest: -30, control: 12 },
        result: 'It ends fast and it ends ugly, on every screen in the country. Nobody else tries it for a while.',
      },
      {
        label: 'Broker a deal',
        hint: 'trade grip for calm',
        fx: { support: 2, influence: -3 },
        realmFx: { target: 'trigger', unrest: -18, control: -6 },
        result: 'They get their concessions, you get your quiet, and both of you pretend it was strength.',
      },
      {
        label: 'Let it burn',
        hint: 'it spreads',
        fx: { support: -5, base: -3 },
        realmFx: { target: 'trigger', unrest: 8, spread: 5 },
        result: 'You do nothing, loudly. The fire finds the neighbours by morning.',
      },
    ],
  },
  {
    // Reward for actually holding the realm together: eligible only when most of it is loyal.
    id: 'p4_provinces_rally',
    paths: ['ballot', 'vanguard', 'iron', 'gilded', 'anointed'],
    phases: [2, 3],
    weight: 5,
    art: 'newspaper',
    emoji: '🎗️',
    kicker: 'A rare good day',
    req: (S) => {
      const ps = S.realm?.provinces ?? [];
      if (ps.length < 6) return false;
      const loyal = ps.filter((p) => p.control >= 65).length;
      return loyal >= Math.ceil(ps.length / 2);
    },
    title: 'The Provinces Rally to You',
    body: () =>
      `For once the reports coming up the chain are the boring kind: roads paved, quotas met, your name spoken without a curse attached. A firmly held country is a quietly powerful one. Enjoy it. It never lasts.`,
    choices: [
      {
        label: 'Tour the heartland',
        hint: 'bank the goodwill',
        fx: { support: 5, base: 4 },
        result: 'You shake the hands, cut the ribbons, and let the cameras do the rest. Approval, freely given, for now.',
      },
      {
        label: 'Levy a loyalty tax',
        hint: 'cash in the calm',
        fx: { funds: 8, support: -2 },
        realmFx: { target: 'worst', unrest: 3 },
        result: 'You monetise the peace. The treasury swells; one province mutters that gratitude used to be free.',
      },
    ],
  },
];
