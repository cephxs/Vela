import { describe, expect, it } from 'vitest';

// The chrome type scale is three token steps (sm/md/lg) at two weights (400/600). Any
// pixel size, odd weight or tracking written straight into a widget or kit stylesheet
// is a fourth step waiting to drift — it goes through the tokens, or the line says why
// not with this marker.
const EXEMPT_MARKER = 'type-exempt';

/** The one caps-label spec (SECTION_LABEL_CSS) and the watermark's display tracking. */
const TRACKING_ALLOWED = ['src/ui/styles.ts', 'src/widget/watermark.ts'];

const SIZE = /font(?:-size)?:\s*\d+px/;
const WEIGHT = /font-weight:\s*(?:500|550|700)\b/;
const TRACKING = /letter-spacing/;

type RawGlob = (pattern: string, options: { query: string; import: string; eager: true }) => Record<string, string>;

const sources = Object.entries(
    (import.meta as unknown as { glob: RawGlob }).glob('../src/{widget,ui}/**/*.ts', { query: '?raw', import: 'default', eager: true }),
).map(([path, text]) => [path.replace(/^\.\.\//, ''), text] as const);

describe('type literals', () => {
    it('stay on the token scale', () => {
        const strays: string[] = [];
        for (const [file, text] of sources) {
            text.split('\n').forEach((line, i) => {
                // Icon boxes size their glyph by font-size; that is geometry, not type.
                if (line.includes(EXEMPT_MARKER) || line.includes('.vela-icon')) return;
                if (SIZE.test(line) || WEIGHT.test(line)) strays.push(`${file}:${i + 1} ${line.trim()}`);
                if (TRACKING.test(line) && !TRACKING_ALLOWED.includes(file)) strays.push(`${file}:${i + 1} ${line.trim()}`);
            });
        }
        expect(strays, `use var(--vela-font-size-*) / 400 or 600 / SECTION_LABEL_CSS, or mark the line \`${EXEMPT_MARKER}: reason\``).toEqual([]);
    });

    it('scans the real source (so a green result means something)', () => {
        expect(sources.length).toBeGreaterThan(40);
        expect(sources.find(([f]) => f === 'src/ui/styles.ts')?.[1]).toMatch(TRACKING);
        expect(SIZE.test('font-size: 13px;')).toBe(true);
        expect(SIZE.test('font: 14px var(--vela-font);')).toBe(true);
        expect(SIZE.test('font-size: var(--vela-font-size-lg);')).toBe(false);
        expect(WEIGHT.test('font-weight: 600;')).toBe(false);
    });
});
