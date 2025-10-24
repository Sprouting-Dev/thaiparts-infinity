export type CTAVariant =
  | 'hero-secondary'
  | 'secondary'
  | 'primary'
  | 'content-primary';

export interface ButtonStyle {
  bg: string;
  hoverBg: string;
  color: string;
  padding: {
    mobile: string;
    desktop: string;
  };
  boxShadow?: string;
  textShadow?: string;
  border?: string;
  borderGradient?: string;
  borderWidth?: string;
}

export function getButtonStyle(variant: CTAVariant): ButtonStyle {
  switch (variant) {
    case 'hero-secondary':
      return {
        bg: 'rgba(0, 0, 0, 1)',
        hoverBg: 'rgba(0, 0, 0, 0.8)',
        color: '#FFFFFF',
        padding: {
          mobile: '8px 16px',
          desktop: '12px 24px',
        },
        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.12)',
        textShadow: '0px 0px 8px rgba(0, 0, 0, 0.5)',
        borderGradient: 'linear-gradient(180deg, #CCE8FF 0%, #E92928 100%)',
        borderWidth: '2px',
      };

    case 'secondary':
      return {
        bg: 'rgba(233, 41, 40, 1)', 
        hoverBg: 'rgba(233, 41, 40, 0.8)',
        color: '#FFFFFF',
        padding: {
          mobile: '8px 16px',
          desktop: '12px 24px',
        },
        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.12)',
        textShadow: '0px 0px 8px rgba(0, 0, 0, 0.5)',
        borderGradient: 'linear-gradient(180deg, #CCE8FF 0%, #E92928 100%)',
        borderWidth: '2px',
      };

    case 'primary':
      return {
        bg: '#1063A7',
        hoverBg: '#0d5491',
        color: '#FFFFFF',
        padding: {
          mobile: '8px 16px',
          desktop: '12px 24px',
        },
        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.12)',
        textShadow: '0px 2px 8px rgba(0, 0, 0, 0.5)',
        borderGradient: 'linear-gradient(180deg, #CCE8FF 0%, #1063A7 100%)',
        borderWidth: '2px',
      };

    case 'content-primary':
      return {
        bg: '#1063A7',
        hoverBg: '#0d5491',
        color: '#FFFFFF',
        padding: {
          mobile: '8px 16px',
          desktop: '12px 24px',
        },
        textShadow: '0px 2px 8px rgba(0, 0, 0, 0.5)',
        borderGradient: 'linear-gradient(180deg, #CCE8FF 0%, #1063A7 100%)',
        borderWidth: '2px',
      };

    default:
      return {
        bg: '#1063A7',
        hoverBg: '#0d5491',
        color: '#FFFFFF',
        padding: {
          mobile: '8px 16px',
          desktop: '12px 24px',
        },
      };
  }
}

export function getResponsivePaddingClasses(padding: {
  mobile: string;
  desktop: string;
}): string {
  // Convert "8px 16px" to "py-2 px-4" and "12px 24px" to "md:py-3 md:px-6"
  const mobilePy = padding.mobile.split(' ')[0] === '8px' ? 'py-2' : 'py-3';
  const mobilePx = padding.mobile.split(' ')[1] === '16px' ? 'px-4' : 'px-6';
  const desktopPy =
    padding.desktop.split(' ')[0] === '12px' ? 'md:py-3' : 'md:py-4';
  const desktopPx =
    padding.desktop.split(' ')[1] === '24px' ? 'md:px-6' : 'md:px-8';

  return `${mobilePy} ${mobilePx} ${desktopPy} ${desktopPx}`;
}

export function getButtonClassName(variant: CTAVariant): string {
  const hasGradientBorder = [
    'hero-secondary',
    'secondary',
    'primary',
    'content-primary',
  ].includes(variant);
  const style = getButtonStyle(variant);
  const paddingClasses = getResponsivePaddingClasses(style.padding);

  const baseClasses = `
    font-['Kanit'] 
    rounded-full 
    transition-colors 
    duration-200 
    flex 
    items-center 
    justify-center 
    whitespace-nowrap 
    hover:scale-[1.02] 
    active:scale-[0.98]
    ${paddingClasses}
    ${hasGradientBorder ? 'gradient-border-btn' : ''}
  `
    .trim()
    .replace(/\s+/g, ' ');

  return `${baseClasses} relative overflow-hidden`;
}
