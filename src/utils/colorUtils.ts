/**
 * Color normalization utility for DOCX export.
 * The `docx` library expects colors as 6-digit hex strings (without # prefix).
 * This utility converts various color formats to the required hex format.
 */

export type ColorInput = string | undefined;

/**
 * Normalize a color value to a 6-digit hex string (without # prefix).
 * Supports:
 * - #RRGGBB or RRGGBB
 * - rgb(r, g, b)
 * - rgba(r, g, b, a)
 * - CSS named colors (falls back to default)
 * 
 * @param color - Input color in any supported format
 * @param fallback - Fallback hex color (without #) if parsing fails
 * @returns 6-digit hex string without # prefix
 */
export function normalizeColorToHex(color: ColorInput, fallback = '0F172A'): string {
  if (!color || typeof color !== 'string') {
    return fallback;
  }

  const trimmed = color.trim();

  // Already a hex string (with or without #)
  const hexMatch = trimmed.match(/^#?([0-9a-fA-F]{6})$/);
  if (hexMatch) {
    return hexMatch[1].toUpperCase();
  }

  // rgb(r, g, b) or rgba(r, g, b, a)
  const rgbMatch = trimmed.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*[\d.]+)?\s*\)$/);
  if (rgbMatch) {
    const r = Math.max(0, Math.min(255, parseInt(rgbMatch[1], 10)));
    const g = Math.max(0, Math.min(255, parseInt(rgbMatch[2], 10)));
    const b = Math.max(0, Math.min(255, parseInt(rgbMatch[3], 10)));
    return toHex(r, g, b);
  }

  // 3-digit hex (#RGB or RGB)
  const hex3Match = trimmed.match(/^#?([0-9a-fA-F]{3})$/);
  if (hex3Match) {
    const hex = hex3Match[1];
    return hex.split('').map(c => c + c).join('').toUpperCase();
  }

  // CSS named colors - limited support for common ones
  const namedColors: Record<string, string> = {
    transparent: '000000',
    black: '000000',
    white: 'FFFFFF',
    red: 'FF0000',
    green: '008000',
    blue: '0000FF',
    yellow: 'FFFF00',
    cyan: '00FFFF',
    magenta: 'FF00FF',
    gray: '808080',
    grey: '808080',
  };
  const lower = trimmed.toLowerCase();
  if (namedColors[lower]) {
    return namedColors[lower];
  }

  // Fallback for unrecognized formats
  console.warn(`[docxExport] Unrecognized color format: "${color}", using fallback`);
  return fallback;
}

/**
 * Convert RGB values to 6-digit hex string.
 */
function toHex(r: number, g: number, b: number): string {
  const toHexByte = (n: number) => n.toString(16).padStart(2, '0').toUpperCase();
  return `${toHexByte(r)}${toHexByte(g)}${toHexByte(b)}`;
}

/**
 * Parse a color string and return RGB components.
 * Returns null if parsing fails.
 */
export function parseColorToRgb(color: ColorInput): { r: number; g: number; b: number } | null {
  if (!color || typeof color !== 'string') {
    return null;
  }

  const trimmed = color.trim();

  // #RRGGBB or RRGGBB
  const hexMatch = trimmed.match(/^#?([0-9a-fA-F]{6})$/);
  if (hexMatch) {
    const hex = hexMatch[1];
    return {
      r: parseInt(hex.slice(0, 2), 16),
      g: parseInt(hex.slice(2, 4), 16),
      b: parseInt(hex.slice(4, 6), 16),
    };
  }

  // rgb(r, g, b) or rgba(r, g, b, a)
  const rgbMatch = trimmed.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*[\d.]+)?\s*\)$/);
  if (rgbMatch) {
    return {
      r: Math.max(0, Math.min(255, parseInt(rgbMatch[1], 10))),
      g: Math.max(0, Math.min(255, parseInt(rgbMatch[2], 10))),
      b: Math.max(0, Math.min(255, parseInt(rgbMatch[3], 10))),
    };
  }

  // 3-digit hex
  const hex3Match = trimmed.match(/^#?([0-9a-fA-F]{3})$/);
  if (hex3Match) {
    const hex = hex3Match[1];
    return {
      r: parseInt(hex[0] + hex[0], 16),
      g: parseInt(hex[1] + hex[1], 16),
      b: parseInt(hex[2] + hex[2], 16),
    };
  }

  return null;
}

/**
 * Create a color object with both hex and RGB representations.
 * Useful for docx library which needs hex, and for CSS-in-JS which may need RGB.
 */
export function createColorObject(color: ColorInput, fallback = '0F172A') {
  const hex = normalizeColorToHex(color, fallback);
  const rgb = parseColorToRgb(hex);
  return {
    hex,
    rgb: rgb || { r: 15, g: 23, b: 42 }, // fallback to slate-900
    cssRgb: rgb ? `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` : 'rgb(15, 23, 42)',
  };
}