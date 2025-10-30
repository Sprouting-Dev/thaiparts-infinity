// Centralized category badge style mapping
// Keeping hex values here to avoid duplication across components.
// If future design system tokens are introduced, replace with CSS variables.

export type CategoryBadgeColor =
  | 'blue'
  | 'teal'
  | 'red'
  | 'navy'
  | 'green'
  | 'greenAlt'
  | 'orange'
  | 'gray'
  | 'redAlt';

const STYLE_MAP: Record<CategoryBadgeColor, { bg: string; text: string }> = {
  blue: { bg: 'bg-brand-blue-light', text: 'text-badge-blue' },
  teal: { bg: 'bg-teal', text: 'text-teal' },
  red: { bg: 'bg-red-light', text: 'text-accent-red' },
  navy: { bg: 'bg-navy-light', text: 'text-navy' },
  green: { bg: 'bg-green-light', text: 'text-green' },
  greenAlt: { bg: 'bg-green-alt', text: 'text-green-alt' },
  orange: { bg: 'bg-orange-light', text: 'text-orange' },
  gray: { bg: 'bg-gray-light', text: 'text-gray' },
  redAlt: { bg: 'bg-red-alt', text: 'text-red-alt' },
};

export function getCategoryBadgeStyle(color?: CategoryBadgeColor | null) {
  if (!color) return null; // enforce explicit assignment
  return STYLE_MAP[color] || null;
}

export function getColorByTagName(tagName: string): CategoryBadgeColor | null {
  const tagColorMap: Record<string, CategoryBadgeColor> = {
    'Mechanical & Power Transmission Systems': 'blue',
    'Fluid & Pneumatic Systems': 'teal',
    'Electrical & Control Hardware': 'red',
    'Core Controllers & Logic': 'navy',
    'Actuators & Motion Control': 'redAlt',
    'Networking & Data Communication': 'gray',
    'Specialised & Integrated Systems': 'navy',
    'Pressure & Flow Control': 'green',
    'Temperature & Level Control': 'greenAlt',
    'Analysis & Safety Systems': 'orange',
  };

  return tagColorMap[tagName] || null;
}
