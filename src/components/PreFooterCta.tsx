'use client';

import Image from 'next/image';
import CTAButton from '@/components/CTAButton';
import { MotionReveal } from '@/components/MotionReveal';

interface PreFooterCtaProps {
  title?: string;
  subtitle?: string;
  bg?: string; // can be string or Strapi media object
  cta?: {
    label?: string;
    href?: string;
    variant?: 'primary' | 'secondary' | 'hero-secondary' | 'content-primary';
  };
  embedded?: boolean; // when true, render without outer section wrapper (for combined block)
}

// Pre-footer CTA block (dark background image + CTA) used before the global footer.

export default function PreFooterCta({
  title,
  subtitle,
  bg,
  cta,
  embedded,
}: PreFooterCtaProps) {
  // Resolve background: support root-relative '/...' or full 'http...' strings
  let bgUrl = '/layout/footer/pre-footer.webp'; // default fallback
  if (typeof bg === 'string') {
    if (bg.startsWith('/') || bg.startsWith('http')) bgUrl = bg;
  }
  const hasImage = !!bgUrl;

  // Pre-footer uses MotionReveal at the wrapper level to control reveal
  // and respects prefers-reduced-motion via the utility.

  // Inner content is rendered as a plain div so the parent (Footer) can
  // choose to animate the combined pre-footer + footer as a single motion unit
  const Inner = (
    <div className="relative w-full py-16.25  rounded-[8px] rounded-b-none overflow-hidden flex flex-col items-center justify-center">
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
        <Image
          src={bgUrl}
          alt=""
          aria-hidden
          className="opacity-0 w-0 h-0 pointer-events-none select-none"
          loading="lazy"
          decoding="async"
          width={1}
          height={1}
        />
      )}

      {/* Content */}
      <div className="relative z-[1] flex flex-col items-center px-8 text-center gap-4 lg:gap-8">
        {(title || subtitle) && (
          <div className="flex flex-col items-center gap-2 lg:gap-4">
            {title && (
              <h2
                className="font-['Kanit'] font-semibold text-[22px] leading-[33px] lg:text-[28px] lg:leading-[42px] text-white"
                style={{ textShadow: '0 2px 16px rgba(0,0,0,0.5)' }}
              >
                {
                  // If title contains explicit newlines, split and render each
                  // segment as `block lg:inline` so it breaks on mobile but
                  // remains inline on larger screens. Otherwise render plain.
                  typeof title === 'string' && title.includes('\n')
                    ? title.split('\n').map((line, i, arr) => (
                        <span key={i} className="block md:inline">
                          {line.trim()}
                          {i < arr.length - 1 ? ' ' : ''}
                        </span>
                      ))
                    : title
                }
              </h2>
            )}
            {subtitle && (
              <p
                className="font-['Kanit'] font-normal text-[16px] leading-[24px] lg:text-[22px] lg:leading-[33px] text-white"
                style={{ textShadow: '0 2px 16px rgba(0,0,0,0.5)' }}
              >
                {subtitle}
              </p>
            )}
          </div>
        )}
        {cta?.label && (
          <div>
            <CTAButton
              cta={{
                label: cta.label,
                href: cta.href || '#',
                variant: 'content-primary',
              }}
              asMotion={true}
              textSize="large"
              className="backdrop-blur-sm bg-[rgba(16,99,167,0.55)] hover:bg-[rgba(16,99,167,0.75)]"
            />
          </div>
        )}
      </div>
    </div>
  );

  if (embedded) {
    // When embedded, return a plain wrapper so the parent can animate both
    // pre-footer and footer together inside a single motion container.
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
    <MotionReveal>
      <section className="w-full flex justify-center items-center px-8">
        {Inner}
        {!hasImage && (
          <div className="sr-only">Pre-footer background image missing</div>
        )}
      </section>
    </MotionReveal>
  );
}
