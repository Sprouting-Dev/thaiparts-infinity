import Image from 'next/image';
import CTAButton from '@/components/CTAButton';

/**
 * Hero component (Desktop + Mobile) aligned to Figma spec with responsive breakpoints.
 * - Removes forced min-width 1440px (prevents horizontal scroll on smaller screens)
 * - Uses a full-bleed background + centered inner container (max-w-[1440px])
 * - Mobile overlay hidden on lg screens to avoid duplicate rendering
 * - CTA rendering de-duplicated via helper
 */
export default function Hero(props: {
  title: {
    desktop: {
      leftText: string;
      leftColor: 'brandBlue' | 'accentRed' | 'white';
      rightText: string;
      rightColor: 'brandBlue' | 'accentRed' | 'white';
    };
    mobile: {
      lines: { text: string; color: 'brandBlue' | 'accentRed' | 'white' }[];
    };
  };
  background?: string;
  subtitle: string;
  ctas: { label: string; href?: string; variant: any; newTab?: boolean }[];
  panel: { enabled: boolean; align: 'left' | 'center' | 'right' };
}) {
  // Debug logging for background prop
  if (process.env.NODE_ENV === 'development') {
    console.log('[Hero] Props received:', {
      background: props.background,
      title: props.title,
    });
  }

  const color = (v: 'brandBlue' | 'accentRed' | 'white') => {
    switch (v) {
      case 'brandBlue':
        return 'text-[#1063A7]';
      case 'accentRed':
        return 'text-[#E92928]';
      case 'white':
        return 'text-white';
      default:
        return 'text-[#1063A7]';
    }
  };

  // Use provided background if present, otherwise fall back to the public asset in /public/homepage
  const backgroundPath = props.background ?? '/homepage/homepage-hero.png';

  return (
    <section className="relative w-screen h-[568px] md:h-[720px] lg:h-[900px] xl:h-[1024px] smooth-transition">
      {/* Full-bleed responsive background image + gradient overlay */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Single responsive background image (use public asset when no prop provided) */}
        <div className="absolute inset-0">
          <Image
            src={backgroundPath}
            alt=""
            fill
            className="object-cover object-center"
            priority
            sizes="100vw"
          />
        </div>
        {/* Gradient overlay (no blur on background) */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-black/30 to-black/70" />
      </div>

      {/* Subtle Glass Panel (Figma-like) */}
      <div className="absolute inset-x-0 bottom-0 w-full flex justify-center">
        {/* Main glass panel with subtle blur */}
        <div
          className="w-full flex flex-col items-center justify-center p-8 md:p-16 gap-4 backdrop-blur-sm smooth-transition border-t border-white/10"
          style={{
            background: 'rgba(16, 99, 167, 0.06)',
            backdropFilter: 'blur(8px) saturate(120%)',
            WebkitBackdropFilter: 'blur(8px) saturate(120%)',
            boxShadow:
              '0 -1px 0 rgba(255, 255, 255, 0.1), 0 4px 16px rgba(0, 0, 0, 0.2)',
          }}
        >
          {/* Title and Subtitle Container - responsive width */}
          <div className="flex flex-col items-center gap-2 w-full">
            {/* Mobile Title (3 lines stacked) */}
            <h1
              className="lg:hidden font-[Kanit] font-medium text-[22px] leading-[33px] text-center"
              style={{ textShadow: '0px 2px 16px rgba(0,0,0,0.5)' }}
            >
              {props.title.mobile.lines.map((line, index) => (
                <span key={index} className={`${color(line.color)} block`}>
                  {line.text}
                </span>
              ))}
            </h1>

            {/* Desktop Title (single line, two colors) */}
            <h1
              className="hidden lg:block font-[Kanit] font-medium text-[36px] leading-[54px] text-center"
              style={{ textShadow: '0px 2px 16px rgba(0,0,0,0.5)' }}
            >
              <span className={color(props.title.desktop.leftColor)}>
                {props.title.desktop.leftText}{' '}
              </span>
              <span className={color(props.title.desktop.rightColor)}>
                {props.title.desktop.rightText}
              </span>
            </h1>
            <p
              className="text-[#F5F5F5] text-center font-normal text-[16px] leading-[24px] lg:text-[22px] lg:leading-[33px] lg:max-w-[665px]"
              style={{ textShadow: '0px 2px 16px rgba(0,0,0,0.5)' }}
            >
              {props.subtitle}
            </p>
          </div>

          {/* CTA Buttons - using CTAButton with responsive padding */}
          <div className="flex items-center justify-center flex-wrap gap-2 lg:gap-4">
            {props.ctas?.[0] && (
              <CTAButton
                cta={{
                  label: props.ctas[0].label,
                  href: props.ctas[0].href,
                  variant: 'primary',
                }}
                textSize="large"
              />
            )}
            {props.ctas?.[1] && (
              <CTAButton
                cta={{
                  label: props.ctas[1].label,
                  href: props.ctas[1].href,
                  variant: 'hero-secondary',
                }}
                textSize="large"
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
