/**
 * Voice layer (Overhaul P6) — on-device SpeechSynthesis narration, loaded as its
 * OWN dynamic-import chunk so it never touches the eager entry budget. Opt-in
 * (Settings → Narration, default off). Design rules:
 *   • Never blocks: if the Web Speech API is missing, offline-muted, or has no
 *     voice, every call silently no-ops — the captioned text on screen always
 *     carries the meaning, so audio is pure enhancement.
 *   • Pure UI: never consumes the seeded RNG, so determinism is untouched.
 *   • One line at a time: a new line cancels the previous utterance.
 *   • Deterministic per-character voicing: a stable hash of the speaker key +
 *     the path's tone picks pitch/rate, so a given character always sounds the
 *     same (the Iron Provost stays a low growl; a Gilded patron stays smooth).
 */

let _voices = [];
function refreshVoices() {
  try {
    const v = window.speechSynthesis ? window.speechSynthesis.getVoices() : [];
    if (v && v.length) _voices = v;
  } catch {
    /* ignore */
  }
  return _voices;
}
try {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    refreshVoices();
    // voices populate asynchronously in some browsers
    if (typeof window.speechSynthesis.addEventListener === 'function') {
      window.speechSynthesis.addEventListener('voiceschanged', refreshVoices);
    }
  }
} catch {
  /* ignore */
}

export function isSupported() {
  try {
    return (
      typeof window !== 'undefined' &&
      'speechSynthesis' in window &&
      typeof window.SpeechSynthesisUtterance === 'function'
    );
  } catch {
    return false;
  }
}

// Per-path base tone. The path is the broad register; per-speaker jitter (below)
// distinguishes individual characters within a path.
const PATH_TONE = {
  iron: { rate: 0.92, pitch: 0.66 }, // gravelly strongman
  vanguard: { rate: 1.0, pitch: 0.82 }, // clipped apparatchik
  gilded: { rate: 1.06, pitch: 1.0 }, // smooth magnate
  anointed: { rate: 0.9, pitch: 0.92 }, // sonorous cleric
  ballot: { rate: 1.05, pitch: 1.04 }, // slick politician
};

function hash(s) {
  let h = 2166136261;
  const str = String(s == null ? '' : s);
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}

/** A deterministic {rate,pitch} for a speaker key within a path. */
export function profileFor(key, path) {
  const base = PATH_TONE[path] || { rate: 1.0, pitch: 1.0 };
  const h = hash(key || path || 'narrator');
  const pitch = clamp(base.pitch + ((h % 7) - 3) * 0.04, 0.4, 1.6);
  const rate = clamp(base.rate + (((h >> 3) % 5) - 2) * 0.03, 0.7, 1.35);
  return { rate, pitch };
}

function pickVoice() {
  const vs = _voices.length ? _voices : refreshVoices();
  if (!vs.length) return null;
  return (
    vs.find((v) => /^en(-|_|$)/i.test(v.lang) && v.localService) ||
    vs.find((v) => /^en(-|_|$)/i.test(v.lang)) ||
    vs[0]
  );
}

/** Stop any in-flight narration. */
export function stop() {
  try {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
  } catch {
    /* ignore */
  }
}

/** Speak a line, cancelling any previous one. Best-effort; never throws. */
export function speak(text, profile) {
  if (!isSupported()) return;
  const t = String(text == null ? '' : text)
    .replace(/\s+/g, ' ')
    .trim();
  if (!t) return;
  try {
    window.speechSynthesis.cancel();
    const u = new window.SpeechSynthesisUtterance(t.slice(0, 600));
    const p = profile || {};
    if (typeof p.rate === 'number') u.rate = p.rate;
    if (typeof p.pitch === 'number') u.pitch = p.pitch;
    const v = pickVoice();
    if (v) u.voice = v;
    window.speechSynthesis.speak(u);
  } catch {
    /* never block the game on speech */
  }
}
