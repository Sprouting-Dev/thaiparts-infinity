// Centralized category badge style mapping
// Keeping hex values here to avoid duplication across components.
// If future design system tokens are introduced, replace with CSS variables.

export type CategoryBadgeColor = 'blue' | 'teal' | 'red' | 'navy' | 'green' | 'greenAlt' | 'orange' | 'gray' | 'redAlt';

const STYLE_MAP: Record<CategoryBadgeColor, { bg: string; text: string }> = {
  blue: { bg: 'bg-[#D7F5FF]', text: 'text-[#007AA3]' },
  teal: { bg: 'bg-[#D7FFFF]', text: 'text-[#008080]' },
  red: { bg: 'bg-[#FFD7D7]', text: 'text-[#E92928]' },
  navy: { bg: 'bg-[#D5ECFF]', text: 'text-[#1063A7]' },
  green: { bg: 'bg-[#E7FFD5]', text: 'text-[#629938]' },
  greenAlt: { bg: 'bg-[#F7FFE8]', text: 'text-[#99CC33]'},
  orange: { bg: 'bg-[#FFF8E6]', text: 'text-[#FFB600]' },  
  gray: { bg: 'bg-[#D5ECFF]', text: 'text-[#4A6F9E]' },    
  redAlt: { bg: 'bg-[#FFD6D5]', text: 'text-[#E92928]' },
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
    'Temperature & Level Control' : 'greenAlt',
    'Analysis & Safety Systems': 'orange',
  };
  
  return tagColorMap[tagName] || null;
}
