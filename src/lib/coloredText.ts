// Central color mapper used across components to map CMS color tokens
// to Tailwind classes. Keep this single source of truth to make
// future color changes or token mappings easier.
/**
 * Map named tokens or CSS color values to Tailwind text color classes.
 * Supported named tokens (design tokens):
 * - 'brandBlue' -> #1063A7
 * - 'accentRed' -> #E92928
 * - 'white' -> white
 * The function also accepts common names containing 'blue'/'red' and raw 6-char hex values.
 */
export function getTextClass(color?: string) {
  if (!color) return 'text-[#1063A7]';
  const val = String(color).trim();
  const lower = val.toLowerCase();

  // explicit design tokens -> map to named classes defined in globals.css
  if (
    lower === 'brandblue' ||
    lower === 'brand-blue' ||
    lower === '#1063a7' ||
    lower === '1063a7'
  )
    return 'text-[var(--brand-blue)]';

  if (
    lower === 'accentred' ||
    lower === 'accent-red' ||
    lower === '#e92928' ||
    lower === 'e92928'
  )
    return 'text-[var(--accent-red)]';

  if (lower === 'white' || lower === '#ffffff' || lower === 'ffffff')
    return 'text-white';

  // fallback: if string contains 'blue' -> brand blue
  if (lower.includes('blue')) return 'text-[var(--brand-blue)]';
  // if string contains 'red' -> accent red
  if (lower.includes('red')) return 'text-[var(--accent-red)]';

  // If it's a 6-char hex without #, add the hash
  if (/^[0-9a-f]{6}$/i.test(val)) return `text-[#${val}]`;

  // Try to parse as hex color
  if (val.startsWith('#')) return `text-[${val}]`;

  // Default fallback
  return 'text-[#1063A7]';
}
