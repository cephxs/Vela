// The design tokens, as PURE DATA (no DOM) so every layer can share one vocabulary: the UI
// kit writes them onto its hosts, and the renderer's own chrome writes them onto the chart
// container. The chart's `VelaTheme` stays the single source of truth — there is no second
// UI palette to drift from it.
//
// STATIC tokens (spacing, radii, z-index, motion, type scale) are theme-independent;
// THEME tokens are computed per `VelaTheme`.

import type { VelaTheme } from './options';
import { isDarkColor, withAlpha } from './color';
import { ACCENT, ACCENT_BRIGHT, HIGHLIGHT } from './palette';

/** Theme-independent tokens — the shared spacing/shape/motion/type scale. */
export const STATIC_TOKENS: Record<string, string> = {
    '--vela-space-1': '4px',
    '--vela-space-2': '8px',
    '--vela-space-3': '12px',
    '--vela-space-4': '16px',
    '--vela-radius-sm': '4px',
    '--vela-radius-md': '6px',
    '--vela-radius-lg': '10px',
    '--vela-z-tooltip': '60',
    '--vela-z-menu': '50',
    '--vela-z-dialog': '40',
    // Form popovers portal to <body> (or a chart host) and must sit above a dialog
    // whose own stacking context may be nested inside the chart container.
    '--vela-z-popover': '6000',
    '--vela-ease': 'cubic-bezier(0.22, 1, 0.36, 1)',
    '--vela-dur-fast': '90ms',
    '--vela-dur-med': '160ms',
    '--vela-font-size-sm': '11px',
    '--vela-font-size-md': '12px',
    '--vela-font-size-lg': '14px',
};

// The two neutral schemes. Each is one ink stepped by alpha (6 / 10 / 15 / 20 / 30 / 40 / 50)
// over three fixed surfaces: the plot, a floating surface for menus and dialogs, and a
// sunken one for fields. Light is the mirror of dark: the ink and the plot swap roles, and
// elevation keeps its logic (floating goes to the extreme, sunken steps toward the ink).
const NEUTRALS = {
    dark:  { ink: '#fafafa', inkMuted: '#a1a1a1', elevated: '#0a0a0a', sunken: '#3d3d3d', shadowAlpha: 0.4 },
    light: { ink: '#111111', inkMuted: '#6b6b6b', elevated: '#ffffff', sunken: '#ebebeb', shadowAlpha: 0.15 },
} as const;

/** Compute every theme token as a `--vela-*` → value map for one theme. */
export function themeTokens(t: VelaTheme): Record<string, string> {
    const n = isDarkColor(t.background) ? NEUTRALS.dark : NEUTRALS.light;
    // Every border, state and secondary-text token is a rung of the ink's alpha ladder,
    // never its own gray.
    const a = (alpha: number) => withAlpha(n.ink, alpha);
    return {
        '--vela-font': t.fontFamily,
        '--vela-bg': t.background,
        '--vela-surface': t.background,
        // Floating chrome (menus, dialogs) and recessed fields (inputs, selects) sit on
        // their own surfaces — both opaque, or candles read through a panel.
        '--vela-surface-elev': n.elevated,
        '--vela-surface-sunken': n.sunken,
        // Chrome text is brighter than the chart's own axis ink, which stays recessive.
        '--vela-fg': n.ink,
        '--vela-fg-muted': n.inkMuted,
        '--vela-fg-faint': a(0.4),
        '--vela-border': a(0.1),
        '--vela-border-strong': a(0.2),
        // Barely-there rules INSIDE a panel (row separators), where a full border would
        // chop the list into boxes.
        '--vela-border-faint': a(0.06),
        '--vela-hover': a(0.06),
        '--vela-active': a(0.1),
        // A stronger hover for rows inside an already-tinted surface (menu items in an
        // active flyout), where the normal wash would not separate from it.
        '--vela-hover-strong': a(0.15),
        '--vela-focus': a(0.2),
        // The solid center line of a hovered pane separator; its soft band is `--vela-active`.
        '--vela-separator-hover-line': a(0.5),
        '--vela-scroll': a(0.3),
        '--vela-accent': ACCENT,
        '--vela-accent-bright': ACCENT_BRIGHT,
        '--vela-highlight': HIGHLIGHT,
        // The inverse chip: a filled selected state (active tab, ticked checkbox). Its ink
        // must contrast the fill, so the pair flips together with the theme.
        '--vela-selected-bg': n.ink,
        '--vela-selected-fg': t.background,
        // Fixed ink for saturated fills (accent buttons, categorical avatars) — those fills
        // are theme-independent, so their ink is too.
        '--vela-fg-on-fill': '#fafafa',
        '--vela-up': t.upColor,
        '--vela-down': t.downColor,
        '--vela-danger': t.downColor,
        '--vela-shadow': `0 4px 10px 1px rgba(10,10,10,${n.shadowAlpha})`,
        '--vela-shadow-dialog': `0 6px 15px 1.5px rgba(0,0,0,${n.shadowAlpha})`,
        '--vela-backdrop': withAlpha(t.background, 0.7),
    };
}
