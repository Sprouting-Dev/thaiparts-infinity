// Centralized category badge style mapping
// Keeping hex values here to avoid duplication across components.
// If future design system tokens are introduced, replace with CSS variables.

export type CategoryBadgeColor = 'blue' | 'teal' | 'red' | 'navy' | 'green';

const STYLE_MAP: Record<CategoryBadgeColor, { bg: string; text: string }> = {
  blue: { bg: 'bg-[#D7F5FF]', text: 'text-[#007AA3]' },
  teal: { bg: 'bg-[#D7FFFF]', text: 'text-[#008080]' },
  red: { bg: 'bg-[#FFD7D7]', text: 'text-[#E92928]' },
  navy: { bg: 'bg-[#D5ECFF]', text: 'text-[#1063A7]' },
  green: { bg: 'bg-[#E7FFD5]', text: 'text-[#629938]' },
};

export function getCategoryBadgeStyle(color?: string) {
  if (!color) return null; // enforce explicit assignment
  return STYLE_MAP[color as CategoryBadgeColor] || null;
}
