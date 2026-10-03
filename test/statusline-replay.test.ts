// @vitest-environment jsdom
// The status line's badge: the market session state normally, the replay mode while the
// chart replays past bars — and the identity row's order and buttons.
import { describe, it, expect, vi } from 'vitest';
import { Statusline } from '../src/widget/statusline';

// jsdom ships no CSS.escape; the kit's style injection needs it for its id lookup.
(globalThis as { CSS?: unknown }).CSS ??= { escape: (v: string) => v };

function make() {
    const host = document.createElement('div');
    document.body.appendChild(host);
    const line = new Statusline(host, 'BINANCE:BTCUSDT');
    const badge = line.el.querySelector<HTMLElement>('.vela-sl-market')!;
    return { line, badge };
}

describe('Statusline badge', () => {
    it('shows the replay mode while replaying, then the market status again', () => {
        const { line, badge } = make();
        expect(badge.dataset.status).toBe('open');

        const bubble = badge.querySelector<HTMLElement>('.vela-callout')!;
        const replay = badge.querySelector<HTMLElement>('.vela-sl-replay-badge')!;
        expect([bubble.hidden, replay.hidden]).toEqual([false, true]);

        line.setReplaying(true);
        expect(badge.dataset.status).toBe('replay');
        expect([bubble.hidden, replay.hidden]).toEqual([true, false]);
        // circle and glyph in one drawing, in the inverse chip's colors (white on dark, dark on light)
        expect(replay.querySelector('circle')!.getAttribute('style')).toContain('var(--vela-selected-bg)');
        expect(replay.querySelector('path')!.getAttribute('style')).toContain('var(--vela-selected-fg)');

        line.setMarketStatus('closed'); // a session change while replaying waits for the end
        expect(badge.dataset.status).toBe('replay');

        line.setReplaying(false);
        expect(badge.dataset.status).toBe('closed');
        expect([bubble.hidden, replay.hidden]).toEqual([false, true]);
        line.destroy();
    });

});

describe('Statusline identity', () => {
    it('reads symbol, timeframe, venue in that order, with the pickers behind the first two', () => {
        const { line } = make();
        const row = line.el.querySelector<HTMLElement>('.vela-sl-identity')!;
        const classes = [...row.children].map((c) => `${c.tagName.toLowerCase()}.${c.className.split(' ')[0]}`);
        expect(classes).toEqual(['span.vela-sl-avatar', 'button.vela-sl-symbol', 'span.vela-sl-dot', 'button.vela-sl-tf', 'span.vela-sl-venue', 'span.vela-sl-market']);
        const symbol = row.querySelector<HTMLButtonElement>('.vela-sl-symbol')!;
        const tf = row.querySelector<HTMLButtonElement>('.vela-sl-tf')!;
        const venue = row.querySelector<HTMLElement>('.vela-sl-venue')!;
        expect(symbol.getAttribute('aria-label')).toBe('Change symbol');
        expect(tf.getAttribute('aria-label')).toBe('Change interval');

        line.setMeta('60', 'binance');
        expect([symbol.textContent, tf.textContent, venue.textContent, venue.title]).toEqual(['BTCUSDT', '1h', 'BINANCE', 'BINANCE']);
        line.setMeta('60', '');
        expect(venue.style.display).toBe('none');

        const openSymbol = vi.fn();
        const openTimeframe = vi.fn();
        line.attachMenu({ setPart: () => {}, chartVisible: () => true, setChartVisible: () => {}, openSymbol, openTimeframe });
        symbol.click();
        tf.click();
        expect(openSymbol).toHaveBeenCalledTimes(1);
        expect(openTimeframe).toHaveBeenCalledWith(tf);
        line.destroy();
    });
});
