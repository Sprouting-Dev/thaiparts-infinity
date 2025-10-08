'use client';
import { motion } from 'framer-motion';
import CTAButton from '@/components/CTAButton';

interface PreFooterCtaProps {
  title?: string;
  subtitle?: string;
  bg?: any; // can be string or Strapi media object
  cta?: {
    label?: string;
    href?: string;
    variant?: 'primary' | 'secondaryLight' | 'secondaryDark' | 'outline';
  };
  embedded?: boolean; // when true, render without outer section wrapper (for combined block)
}

// Pre-footer CTA block (dark background image + CTA) used before the global footer.
import { toAbsolute } from '@/lib/media';

export default function PreFooterCta({
  title,
  subtitle,
  bg,
  cta,
  embedded,
}: PreFooterCtaProps) {
  // Resolve to absolute URL (handles Strapi media object or string)
  const bgUrl = toAbsolute(bg);

  // Decide if we have a valid image
  const hasImage = !!bgUrl;

  const Inner = (
    <div className="relative w-full h-[260px] lg:h-[310px] rounded-[8px] rounded-b-none overflow-hidden flex flex-col items-center justify-center">
      {/* Background layer */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: hasImage
            ? `linear-gradient(180deg, rgba(0,0,0,0) 0%, #000 100%), url(${bgUrl})`
            : 'linear-gradient(180deg, rgba(0,0,0,0) 0%, #000 100%)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />

      {/* Optional hidden preload img to encourage early decode */}
      {hasImage && (
        <img
          src={bgUrl}
          alt=""
          aria-hidden
          className="opacity-0 w-0 h-0 pointer-events-none select-none"
          loading="lazy"
          decoding="async"
        />
      )}

      {/* Content */}
      <div className="relative z-[1] flex flex-col items-center px-6 text-center max-w-[1150px] gap-8">
        {(title || subtitle) && (
          <div className="flex flex-col items-center gap-4">
            {title && (
              <h2
                className="font-['Kanit'] font-semibold fluid-section-heading text-white"
                style={{ textShadow: '0 2px 16px rgba(0,0,0,0.5)' }}
              >
                {title}
              </h2>
            )}
            {subtitle && (
              <p
                className="font-['Kanit'] font-normal fluid-hero-sub text-white"
                style={{ textShadow: '0 2px 16px rgba(0,0,0,0.5)' }}
              >
                {subtitle}
              </p>
            )}
          </div>
        )}
        {cta?.label && (
          <CTAButton
            cta={{
              label: cta.label,
              href: cta.href || '#',
              variant: 'primary',
            }}
            asMotion={true}
            textSize="large"
            className="backdrop-blur-sm bg-[rgba(16,99,167,0.55)] hover:bg-[rgba(16,99,167,0.75)]"
          />
        )}
      </div>
    </div>
  );

  if (embedded) {
    return (
      <div className="w-full">
        {Inner}
        {!hasImage && (
          <div className="sr-only">Pre-footer background image missing</div>
        )}
      </div>
    );
  }

  return (
    <section className="w-full flex justify-center items-center px-8">
      {Inner}
      {!hasImage && (
        <div className="sr-only">Pre-footer background image missing</div>
      )}
    </section>
  );
}
