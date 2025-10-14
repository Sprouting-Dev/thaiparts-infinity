'use client';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import CTAButton from './CTAButton';
import type { CTAVariant } from '@/lib/button-styles';

interface Brand {
  segments?: Array<{
    text: string;
    color: 'primary' | 'secondary' | 'red' | 'blue';
  }>;
  logo?: string; // absolute URL already resolved upstream if possible
}

interface FooterInfo {
  phone?: string; // legacy single string
  phones?: string[]; // future array form
}

interface NavbarCTA {
  label: string;
  href?: string;
  variant: CTAVariant;
  enabled?: boolean;
}

interface NavbarInfo {
  ctas?: NavbarCTA[];
}

interface Props {
  brand?: Brand;
  footer?: FooterInfo;
  navbar?: NavbarInfo;
}

export default function Header({ brand, navbar }: Props) {
  // Brand rendering using segments approach
  const renderBrandText = () => {
    // Use segments from Strapi (preferred)
    if (brand?.segments && brand.segments.length > 0) {
      return brand.segments.map((segment, i) => (
        <span key={i} className={getColorClass(segment.color)}>
          {segment.text}
          {i < brand.segments!.length - 1 ? ' ' : ''}
        </span>
      ));
    }

    // Fallback to default segments
    return (
      <>
        <span className="text-[#1063A7]">THAIPARTS</span>{' '}
        <span className="text-[#E92928]">INFINITY</span>
      </>
    );
  };

  const getColorClass = (color: string) => {
    switch (color) {
      case 'primary':
        return 'text-[#1063A7]';
      case 'blue':
        return 'text-[#1063A7]';
      case 'secondary':
        return 'text-[#E92928]';
      case 'red':
        return 'text-[#E92928]';
      default:
        return 'text-[#1063A7]';
    }
  };

  // Debug: log navbar data in development
  if (process.env.NODE_ENV === 'development') {
    console.log('[Header] navbar data:', navbar);
    console.log('[Header] navbar.ctas:', navbar?.ctas);
  }

  // Get enabled CTAs from navbar (use Strapi data, minimal fallback)
  const enabledCTAs = navbar?.ctas?.filter(cta => cta.enabled !== false) || [];

  // Show fallback message in development if no CTAs configured
  if (process.env.NODE_ENV === 'development' && enabledCTAs.length === 0) {
    console.log(
      '[Header] No CTAs configured in Strapi navbar. Please add CTAs in Global > Navbar > CTAs'
    );
  }
  return (
    // Responsive Header positioned at top
    <motion.header
      className="fixed w-full left-1/2 transform -translate-x-1/2 top-0 flex flex-col items-center justify-center p-4 z-[2] order-2"
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 140, damping: 18 }}
    >
      {/* Header container (unified for all breakpoints) */}
      <div
        className="w-full rounded-full flex items-center p-4 relative backdrop-blur-md"
        style={{
          background: 'rgba(255, 255, 255, 0.5)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.12)',
        }}
      >
        {/* Brand (single element, responsive sizing) */}
        <div
          className="flex items-center gap-2"
          style={{ filter: 'drop-shadow(0px 2px 32px #FFFFFF)' }}
        >
          {brand?.logo ? (
            <div className="relative w-[32px] h-[32px] md:w-[40px] md:h-[40px] lg:w-[48px] lg:h-[48px] flex items-center justify-center">
              <Image
                src={brand.logo || "/thaiparts-infinity-logo.svg"}
                alt="Brand Logo"
                width={48}
                height={48}
                className="object-cover"
                sizes="(max-width: 1024px) 32px, 48px"
                priority
              />
            </div>
          ) : (
            <div className="bg-[url('/thaiparts-infinity-logo.svg')] bg-cover w-[32px] h-[32px] md:w-[40px] md:h-[40px] lg:w-[48px] lg:h-[48px] rounded-full" />
          )}
          <Link
            href="/"
            className="font-['Kanit'] font-medium whitespace-nowrap text-[16px] leading-[24px] md:text-[18px] md:leading-[26px] tracking-wide lg:text-[22px] lg:leading-[33px]"
          >
            {renderBrandText()}
          </Link>
        </div>

        {/* Unified hamburger: right on mobile, centered (absolute) on desktop */}
        <button
          aria-label="เปิดเมนูนำทาง"
          className="ml-auto flex items-center justify-center hover:scale-105 active:scale-95 transition-transform rounded-full lg:ml-0 lg:w-[32px] lg:h-[32px] lg:absolute lg:left-1/2 lg:top-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2"
          style={{ filter: 'drop-shadow(0px 2px 24px rgba(0,0,0,0.15))' }}
        >
          <svg
            className="block lg:hidden"
            width="18"
            height="12"
            viewBox="0 0 18 12"
            fill="none"
          >
            <rect
              x="0"
              y="0"
              width="18"
              height="2.5"
              rx="1.25"
              fill="#1063A7"
            />
            <rect
              x="0"
              y="4.75"
              width="18"
              height="2.5"
              rx="1.25"
              fill="#1063A7"
            />
            <rect
              x="0"
              y="9.5"
              width="18"
              height="2.5"
              rx="1.25"
              fill="#1063A7"
            />
          </svg>
          <svg
            className="hidden lg:block"
            width="24"
            height="15"
            viewBox="0 0 24 15"
            fill="none"
          >
            <rect
              x="0"
              y="0"
              width="24"
              height="2.5"
              rx="1.25"
              fill="#1063A7"
            />
            <rect
              x="0"
              y="6.25"
              width="24"
              height="2.5"
              rx="1.25"
              fill="#1063A7"
            />
            <rect
              x="0"
              y="12.5"
              width="24"
              height="2.5"
              rx="1.25"
              fill="#1063A7"
            />
          </svg>
        </button>

        {/* Desktop Contact Container */}
        <div className="hidden lg:flex items-center gap-3 ml-auto">
          {enabledCTAs.map((cta, index) => (
            <CTAButton key={index} cta={cta} asMotion={true} textSize="small" />
          ))}
        </div>
      </div>
    </motion.header>
  );
}
