/**
 * Loom lexicons (pure data) — small, fictional, path-agnostic noun banks the
 * grammar draws from to vary the texture of a woven event. Every entry is held to
 * the CORE content-safety bar (the build-time exhaustive weave test scans them),
 * and entries are pre-inflected display forms so substitution can't produce a/an
 * or plural disagreement. Deliberately generic Velmora political vocabulary — no
 * real place, institution, or movement.
 */
export const LEXICONS = {
  /** What is at stake / being fought over. */
  stake: [
    'control of the state broadcaster',
    'the loyalty of the capital garrison',
    'a seat on the inner council',
    'the ministry of finance',
    'the provincial assemblies',
    'the great archive and its secrets',
  ],
  /** Where the pressure is coming to a head. */
  venue: [
    'in the corridors of the ministry',
    'out in the provinces',
    'behind the closed doors of the council',
    'in the cafes and the street stalls',
    'across the evening broadcasts',
    'in the smoke of the back rooms',
  ],
  /** The form the pressure takes. */
  pressure: [
    'a leaked memorandum',
    'an anonymous dossier',
    'a midnight ultimatum',
    'a wave of resignations',
    'a coordinated whisper campaign',
    'an unflattering portrait in the press',
  ],
  /** A faction-adjacent actor making the move. */
  faction_actor: [
    'a bloc of restless deputies',
    'a circle of old-guard loyalists',
    'a syndicate of provincial bosses',
    'a clutch of ambitious deputies',
    'a knot of disillusioned aides',
  ],
  /** A flavor of demand. */
  demand: [
    'a public show of strength',
    'a quiet concession',
    'a purge of the doubters',
    'a seat at the table',
    'a share of the spoils',
  ],
} as const;

export type LexKey = keyof typeof LEXICONS;

export const LEX_KEYS = Object.keys(LEXICONS) as LexKey[];

export function lexValue(key: LexKey, index: number): string {
  const bank = LEXICONS[key];
  return bank[((index % bank.length) + bank.length) % bank.length]!;
}
