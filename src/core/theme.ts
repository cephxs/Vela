import type { VelaTheme, ThemeName } from './options';
import { BEARISH, BULLISH } from './palette';

// The reference dark palette: the fstarlabs neutrals — base surface, muted ink for axis
// text, and the 6% / 10% ink rings as grid and frame, flattened to hex so canvas, settings
// color inputs and WebGL all take them as-is.
export const DARK_THEME: VelaTheme = {
    background: '#111111',
    textColor: '#a1a1a1',
    gridColor: '#1f1f1f',
    borderColor: '#282828',
    upColor: BULLISH,
    downColor: BEARISH,
    fontFamily: '-apple-system, system-ui, "Trebuchet MS", Roboto, Ubuntu, sans-serif',
};

export const LIGHT_THEME: VelaTheme = {
    // The light mirror of the dark neutrals: the dark ink becomes the surface and the dark
    // surface becomes the ink, with the same 6% (grid) and 10% (border) rings of that ink
    // flattened to hex on the plot.
    background: '#fafafa',
    textColor: '#6b6b6b',
    gridColor: '#ececec',
    borderColor: '#e3e3e3',
    // Candle hues are shared across themes: switching themes recolors surfaces and
    // text, never the series (a green candle stays the same green on white).
    upColor: BULLISH,
    downColor: BEARISH,
    fontFamily: '-apple-system, system-ui, "Trebuchet MS", Roboto, Ubuntu, sans-serif',
};

export function resolveTheme(theme?: ThemeName | VelaTheme): VelaTheme {
    if (!theme || theme === 'dark') return DARK_THEME;
    if (theme === 'light') return LIGHT_THEME;
    return theme;
}
