 'use client';
import { motion } from 'framer-motion';
import Image from 'next/image';
import CTAButton from '@/components/CTAButton';

interface PreFooterCtaProps {
  title?: string;
  subtitle?: string;
  bg?: string; // can be string or Strapi media object
  cta?: {
    label?: string;
    href?: string;
    variant?: 'primary' | 'secondaryLight' | 'secondaryDark' | 'outline';
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

  const fadeUp = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  // Inner content is rendered as a plain div so the parent (Footer) can
  // choose to animate the combined pre-footer + footer as a single motion unit
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
      <div className="relative z-[1] flex flex-col items-center px-6 text-center max-w-[1150px] gap-8">
        {(title || subtitle) && (
          <div className="flex flex-col items-center gap-4">
            {title && (
              <h2
                className="font-['Kanit'] font-semibold text-[28px] leading-[42px] text-white"
                style={{ textShadow: '0 2px 16px rgba(0,0,0,0.5)' }}
              >
                {title}
              </h2>
            )}
            {subtitle && (
              <p
                className="font-['Kanit'] font-normal text-[22px] leading-[33px] text-white"
                style={{ textShadow: '0 2px 16px rgba(0,0,0,0.5)' }}
              >
                {subtitle}
              </p>
            )}
          </div>
        )}
        {cta?.label && (
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
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
          </motion.div>
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
    <motion.section
      className="w-full flex justify-center items-center px-8"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={fadeUp}
    >
      {Inner}
      {!hasImage && (
        <div className="sr-only">Pre-footer background image missing</div>
      )}
    </motion.section>
  );
}
