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
    'who gets to lie to the whole country every night',
    'the loyalty of the goons holding the capital',
    'a warm chair at the table where the real thieving happens',
    'the vault and every grubby coin in it',
    'the herd of bootlicking provincial assemblies',
    'the great archive and all the blackmail buried in it',
  ],
  /** Where the pressure is coming to a head. */
  venue: [
    'in the piss-stained corridors of the ministry',
    'out in the godforsaken provinces',
    'behind the slammed doors of the council',
    'down in the cafes where the gossiping rats gather',
    'all over the evening broadcasts everyone pretends not to watch',
    'in the cigar smoke and stink of the back rooms',
  ],
  /** The form the pressure takes. */
  pressure: [
    'a leaked memo nobody was supposed to scribble',
    "a fat anonymous dossier of everyone's filth",
    'a midnight ultimatum delivered by some sweating flunky',
    'a stampede of cowards resigning at once',
    "a slithering whisper campaign that won't shut up",
    'a hatchet job in the press with an unflattering nose drawn on you',
  ],
  /** A faction-adjacent actor making the move. */
  faction_actor: [
    'a pack of restless deputies smelling blood',
    'a circle of mummified old-guard loyalists',
    'a syndicate of fat-necked provincial bosses',
    "a clutch of deputies who'd sell their own mothers for a step up",
    'a knot of disillusioned aides who finally grew a spine',
  ],
  /** A flavor of demand. */
  demand: [
    'a big swinging show of strength',
    'a quiet little spineless concession',
    'a purge to bin the doubters',
    'a fat seat at the table',
    'a greedy cut of the spoils',
  ],
} as const;

export type LexKey = keyof typeof LEXICONS;

export const LEX_KEYS = Object.keys(LEXICONS) as LexKey[];

export function lexValue(key: LexKey, index: number): string {
  const bank = LEXICONS[key];
  return bank[((index % bank.length) + bank.length) % bank.length]!;
}
