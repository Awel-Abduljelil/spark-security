// src/lib/designTokens.ts
/**
 * Utility module for reading CSS custom properties and constructing
 * RGBA strings for use in canvas-based background effects.
 *
 * Tokens are expected to be defined as CSS custom properties in main.css,
 * e.g. `--fx-green: 0 255 70`.
 */

// Raw token values defined in main.css – exported for convenience.
export const TOKENS = {
  "--accent": "#39ff14",
  "--fx-green-bright": "rgb(190 255 190)",
  "--fx-green-soft": "rgb(90 255 130)",
  "--fx-node": "rgb(70 255 120)",
  "--fx-red": "rgb(250 0 0)",
} as const;

/**
 * Reads the current computed value of a CSS custom property from the document root.
 * Returns the raw value as defined in the stylesheet (e.g. "0 255 70").
 *
 * @param name The custom property name without the leading `--`, e.g. 'fx-green'
 *               or with the leading `--`, e.g. '--fx-green'. Both forms are accepted.
 */
export function readRgbToken(name: string): string {
  const prop = name.startsWith("--") ? name : `--${name}`;
  const root = document.documentElement;
  if (!root) return "";
  return getComputedStyle(root).getPropertyValue(prop).trim();
}

/**
 * Constructs an rgba string from a space‑separated RGB token.
 *
 * @param token A token like "0 255 70"
 * @param alpha Opacity multiplier (0‑1)
 */
export function rgbaFromToken(token: string, alpha: number): string {
  const parts = token.trim().split(/\s+/).map(Number);
  if (parts.length !== 3) return `rgba(0, 0, 0, ${alpha})`;
  const [r, g, b] = parts;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Convenience wrapper: reads a token from the stylesheet and returns an rgba value.
 *
 * @param name CSS custom property name, e.g. '--fx-green'
 * @param alpha Opacity multiplier (0‑1)
 */
export function withAlpha(name: string, alpha: number): string {
  const token = readRgbToken(name);
  return rgbaFromToken(token, alpha);
}
