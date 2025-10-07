'use client';
import { motion } from 'framer-motion';
import { toAbsolute } from '@/lib/media';
import CTAButton from '@/components/CTAButton';

interface FeatureItem {
  icon: any;
  title: string;
  description: string;
}

interface FeaturesProps {
  titleSegments: {
    text: string;
    color: 'primary' | 'secondary' | 'blue' | 'red';
  }[]; // required colored segments for title
  items: FeatureItem[];
  description?: string; // optional CMS-provided paragraph
  cta?: { label: string; href?: string; variant?: string; newTab?: boolean }; // optional CTA from CMS
}

export default function Features({
  titleSegments,
  items,
  description,
  cta,
}: FeaturesProps) {
  // Debug logging to see what props we receive
  if (process.env.NODE_ENV === 'development') {
    console.log('[Features] Props received:', {
      titleSegments,
      description,
      cta,
      itemsCount: items.length,
    });
  }

  // Simple fallbacks - no complex conditionals
  const paragraph =
    description ||
    'เราคือผู้ให้บริการ อะไหล่และระบบ Automation ครบวงจร (One Stop Service) สำหรับอุตสาหกรรมหนัก ด้วยพันธกิจหลักในการช่วยโรงงานของคุณ ลดความเสี่ยง (Reduce Risk) และ ลดการหยุดทำงาน (Minimize Downtime) อย่างแท้จริง';
  const buttonLabel = cta?.label || 'ดูผลิตภัณฑ์ทั้งหมด';
  const buttonHref = cta?.href || '#';
  const buttonNewTab = cta?.newTab || false;
  return (
    <section className="w-full flex flex-col items-center gap-4 md:gap-8 smooth-transition">
      {/* Unified Header - responsive across all breakpoints */}
      <div className="w-full flex flex-col items-start gap-4">
        {/* Title with red dot */}
        <div className="flex items-center justify-start gap-2">
          <div className="w-[8px] h-[8px] md:w-4 md:h-4 rounded-full bg-[#E92928] flex-shrink-0" />
          <h2 className="font-['Kanit'] font-medium fluid-section-heading text-left">
            {titleSegments.map((seg, i) => (
              <span key={i} className={segmentColorClass(seg.color)}>
                {seg.text}
                {i < titleSegments.length - 1 ? ' ' : ''}
              </span>
            ))}
          </h2>
        </div>

        {/* Description paragraph (now CMS-driven with fallback) */}
        <p className="w-full max-w-none md:max-w-3xl lg:max-w-4xl font-['Kanit'] font-normal fluid-small md:fluid-hero-sub leading-[22px] md:leading-relaxed text-[#333333] text-left">
          {paragraph}
        </p>

        {/* CTA Button - always visible, responsive padding via button-styles */}
        <CTAButton
          cta={{
            label: buttonLabel,
            href: buttonHref,
            variant: 'content-primary',
          }}
          asMotion={true}
          textSize="large"
        />
      </div>

      {/* Unified Features Grid - responsive across all breakpoints */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 lg:gap-8">
        {items.map((item, i) => (
          <motion.div
            key={i}
            className="bg-[rgba(16,99,167,0.04)] rounded-[12px] lg:rounded-2xl px-3 py-4 lg:p-8 flex flex-col items-center gap-2 lg:gap-6 h-full lg:justify-between"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
          >
            {/* Feature Title */}
            <h3 className="font-['Kanit'] font-medium text-[#1063A7] text-center lg:flex lg:items-center">
              {item.title}
            </h3>

            {/* Icon */}
            <div className="w-[40px] h-[40px] lg:w-20 lg:h-20 xl:w-24 xl:h-24 flex items-center justify-center flex-shrink-0">
              {item.icon && (
                <img
                  src={toAbsolute(item.icon)}
                  alt={item.title}
                  className="w-full h-full object-contain"
                  loading="lazy"
                />
              )}
            </div>

            {/* Description */}
            <p
              className="font-['Kanit'] font-normal text-[#1063A7] text-center lg:w-auto lg:h-auto lg:leading-relaxed lg:flex-grow lg:flex lg:items-center"
              style={{ textShadow: '0px 0px 2px rgba(0,0,0,0.12)' }}
            >
              {item.description}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function segmentColorClass(color: string) {
  switch (color) {
    case 'primary':
    case 'blue':
      return 'text-[#1063A7]';
    case 'secondary':
    case 'red':
      return 'text-[#E92928]';
    default:
      return 'text-[#1063A7]';
  }
}
