import { describe, it, expect, beforeEach } from 'vitest';
import { avatarHtml, setArtManifest, loadArtManifest, charKey } from '../../src/render/portrait';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const desc = { side: 'L', hair: 3, acc: 1, suit: 2, skin: 0 } as any;
const fallback = (d: unknown, mood: string, sweat: boolean) =>
  `<svg data-mood="${mood}" data-sweat="${sweat}"></svg>`;

describe('portrait resolver', () => {
  beforeEach(() => setArtManifest({ art: {}, voice: {} })); // reset to no-art

  it('falls back to the legacy SVG when no art exists', () => {
    const html = avatarHtml(desc, 'smug', { fallback, sweat: true });
    expect(html).toBe('<svg data-mood="smug" data-sweat="true"></svg>');
  });

  it('passes (descriptor, mood, sweat) to the fallback', () => {
    let got: [unknown, string, boolean] | null = null;
    avatarHtml(desc, 'angry', {
      sweat: false,
      fallback: (d, m, s) => ((got = [d, m, s]), '<svg></svg>'),
    });
    expect(got).toEqual([desc, 'angry', false]);
  });

  it('returns a <picture> with the /art/ src when the manifest has the character', () => {
    const key = charKey(desc);
    setArtManifest({
      art: {
        [key]: {
          expr: { smug: 'iron/boss-smug.avif', neutral: 'iron/boss.avif' },
          webp: { smug: 'iron/boss-smug.webp' },
        },
      },
      voice: {},
    });
    const html = avatarHtml(desc, 'smug', { fallback, alt: 'The Boss' });
    expect(html).toContain('<picture');
    expect(html).toContain('src="/art/iron/boss-smug.avif"');
    expect(html).toContain('srcset="/art/iron/boss-smug.webp"');
    expect(html).toContain('alt="The Boss"');
    expect(html).toContain('loading="lazy"');
  });

  it('falls back to the neutral expression when the requested mood is missing', () => {
    const key = charKey(desc);
    setArtManifest({ art: { [key]: { expr: { neutral: 'x/n.avif' } } }, voice: {} });
    expect(avatarHtml(desc, 'worried', { fallback })).toContain('src="/art/x/n.avif"');
  });

  it('charKey is stable + deterministic and prefers an explicit id', () => {
    expect(charKey(desc)).toBe(charKey({ ...desc }));
    expect(charKey({ id: 'antagonist' })).toBe('antagonist');
    expect(charKey('plain')).toBe('plain');
  });

  it('never throws and returns "" with no fallback + no art', () => {
    expect(avatarHtml(desc, 'neutral', {})).toBe('');
  });

  it('loadArtManifest tolerates a failed fetch (keeps empty → fallback)', async () => {
    const m = await loadArtManifest(async () => {
      throw new Error('offline');
    });
    expect(m.art).toEqual({});
  });

  it('loadArtManifest ingests a served manifest', async () => {
    const m = await loadArtManifest(
      async () =>
        ({
          ok: true,
          json: async () => ({ art: { z: { expr: { neutral: 'z.avif' } } }, voice: {} }),
        }) as unknown as Response,
    );
    expect(m.art.z).toBeTruthy();
  });
});
