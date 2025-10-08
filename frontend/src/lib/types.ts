// Strapi API Response Types
export interface StrapiResponse<T> {
  data: T;
  meta?: any;
}

export interface StrapiEntity {
  id: number;
  attributes: any;
}

// Title Line Component
export interface TitleLine {
  text: string;
  color: 'brandBlue' | 'accentRed' | 'white';
}

// Desktop Title Component (single line, two colors)
export interface DesktopTitle {
  leftText: string;
  leftColor: 'brandBlue' | 'accentRed' | 'white';
  rightText: string;
  rightColor: 'brandBlue' | 'accentRed' | 'white';
}

// Mobile Title Component (multiple lines)
export interface MobileTitle {
  lines: TitleLine[];
}

// Responsive Title Component
export interface ResponsiveTitle {
  desktop: DesktopTitle;
  mobile: MobileTitle;
}

// CTA Component
export interface CTA {
  label: string;
  href?: string;
  variant: 'primary' | 'secondaryLight' | 'secondaryDark' | 'outline';
  icon?: 'none' | 'arrowRight' | 'external';
  newTab?: boolean;
}

// Hero Section
export interface HeroSection {
  background: any; // Strapi media object
  title: ResponsiveTitle;
  subtitle: string;
  primaryCta: CTA;
  secondaryCta?: CTA;
}

// Homepage Data
export interface HomepageData {
  hero: HeroSection;
  // ... other sections
}
