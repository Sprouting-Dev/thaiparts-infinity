import React from 'react';

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
    lower === 'brand_blue' ||
    lower === 'brandblue' ||
    lower === 'primary'
  )
    return 'text-brand-blue';
  if (
    lower === 'accentred' ||
    lower === 'accent-red' ||
    lower === 'accent_red' ||
    lower === 'accentred' ||
    lower === 'accent'
  )
    return 'text-accent-red';

  // common keywords
  if (lower.includes('blue')) return 'text-brand-blue';
  if (lower.includes('red')) return 'text-accent-red';
  if (lower === 'white' || lower === 'light' || lower === 'default')
    return 'text-white';

  // fallback to brand blue when unknown (avoid generating arbitrary classes)
  return 'text-brand-blue';
}

/**
 * @deprecated Component not used. Only getTextClass function is used.
 * Consider keeping only getTextClass if the component is not needed.
 */
export default function ColoredText({
  color,
  children,
}: {
  color?: string;
  children: React.ReactNode;
}) {
  return <span className={getTextClass(color)}>{children}</span>;
}
