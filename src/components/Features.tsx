'use client';
import Image from 'next/image';
import CTAButton from '@/components/CTAButton';
import MotionGridItem from '@/components/MotionGridItem';
import { MotionReveal } from '@/components/MotionReveal';
import MotionTitleLine from '@/components/MotionTitleLine';

interface FeatureItem {
  icon: string; // static root-relative or absolute URL to public asset
  title: string;
  description: string;
}

type Segment = {
  text: string;
  color: 'primary' | 'secondary' | 'blue' | 'red';
  mobileBreak?: boolean;
};

interface FeaturesProps {
  // titleSegments can be a flat array of colored segments, or an array-of-arrays
  // to render multi-line titles where each inner array becomes one title line.
  titleSegments: Segment[] | Segment[][]; // required colored segments for title (flat or grouped)
  items: FeatureItem[];
  description?: string; // optional CMS-provided paragraph
  cta?: { label: string; href?: string; variant?: string; newTab?: boolean }; // optional CTA from CMS
  showCta?: boolean; // whether to show CTA (default true)
  showDot?: boolean; // show the small red badge before the title
  dotColor?: string; // allow customizing the dot color
}

export default function Features({
  titleSegments,
  items,
  description,
  cta,
  showCta = true,
  showDot = true,
  dotColor = '#E92928',
}: FeaturesProps) {
  // Debug logging to see what props we receive
  if (process.env.NODE_ENV === 'development') {
    // console.log('[Features] Props received:', { titleSegments, description, cta, itemsCount: items.length });
  }

  // Simple fallbacks - no complex conditionals
  const paragraph =
    description ||
    'เราคือผู้ให้บริการ อะไหล่และระบบ Automation ครบวงจร (One Stop Service) สำหรับอุตสาหกรรมหนัก ด้วยพันธกิจหลักในการช่วยโรงงานของคุณ ลดความเสี่ยง (Reduce Risk) และ ลดการหยุดทำงาน (Minimize Downtime) อย่างแท้จริง';
  const buttonLabel = cta?.label || 'ดูผลิตภัณฑ์ทั้งหมด';
  const buttonHref = cta?.href || '#';
  // Normalize title groups: if grouped, first group is header, rest render below paragraph.
  let headerTitleGroup: Segment[] | null = null;
  let belowTitleGroups: Segment[][] = [];

  if (
    Array.isArray(titleSegments) &&
    titleSegments.length > 0 &&
    Array.isArray(titleSegments[0])
  ) {
    const groups = titleSegments as Segment[][];
    headerTitleGroup = groups[0] || null;
    belowTitleGroups = groups.slice(1);
  }

  return (
    <MotionReveal>
      <section className="w-full flex flex-col items-center gap-4 lg:gap-8 smooth-transition">
        {/* Unified Header - responsive across all breakpoints */}
        <div className="w-full flex flex-col items-start gap-4">
          {/* Title with optional dot and support for grouped segments */}
          <div className="flex items-start lg:items-center justify-start gap-2">
            {showDot ? (
              <div className="py-3">
                <div
                  className="w-[8px] h-[8px] lg:w-4 lg:h-4 rounded-full flex-shrink-0"
                  style={{ background: dotColor }}
                />
              </div>
            ) : null}

            <h2 className="font-['Kanit'] font-medium text-[22px] lg:text-[28px] leading-[33px] lg:leading-[42px] text-left">
              {headerTitleGroup
                ? headerTitleGroup.map((seg, i) => (
                    <span
                      key={i}
                      className={
                        segmentColorClass(seg.color) +
                        (seg.mobileBreak ? ' block lg:inline' : '')
                      }
                    >
                      {seg.text}
                      {i < headerTitleGroup!.length - 1 ? ' ' : ''}
                    </span>
                  ))
                : // flat segments in header
                  (titleSegments as Segment[]).map((seg, i) => (
                    <span
                      key={i}
                      className={
                        segmentColorClass(seg.color) +
                        (seg.mobileBreak ? ' block lg:inline' : '')
                      }
                    >
                      {seg.text}
                      {i < (titleSegments as Segment[]).length - 1 ? ' ' : ''}
                    </span>
                  ))}
            </h2>
          </div>

          {/* Description paragraph (now CMS-driven with fallback) */}
          <p className="w-full max-w-none lg:max-w-4xl font-['Kanit'] font-normal text-[16px] leading-[24px] lg:text-[22px] lg:leading-[33px] text-[#333333] text-left">
            {paragraph}
          </p>

          {/* CTA Button - optional, controlled via showCta prop */}
          {showCta ? (
            <CTAButton
              cta={{
                label: buttonLabel,
                href: buttonHref,
                variant: 'content-primary',
              }}
              asMotion={true}
              textSize="large"
              className="font-medium lg:font-semibold"
            />
          ) : null}
          {/* (moved) belowTitleGroups will be rendered above the grid */}
        </div>

        {/* (moved) remaining title groups will render as a full-width grid child */}

        {/* Grid wrapper: render additional title lines above the grid, then the grid itself */}
        <div className="w-full flex flex-col gap-6">
          {belowTitleGroups.length > 0 && (
            <div className="w-full">
              {belowTitleGroups.map((line, li) => (
                <div key={li} className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 lg:w-4 lg:h-4 rounded-full flex-shrink-0"
                    style={{ background: dotColor }}
                  />
                  <div className="flex flex-wrap">
                    {line.map((seg, si) => (
                      <MotionTitleLine
                        key={si}
                        className={`text-[22px] lg:text-[28px] leading-[33px] lg:leading-[42px] font-medium ${segmentColorClass(
                          seg.color
                        )}`}
                      >
                        {seg.text}
                        {si < line.length - 1 ? ' ' : ''}
                      </MotionTitleLine>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-2 md:gap-4 lg:gap-8">
            {items.map((item, i) => (
              <MotionGridItem key={i} index={i}>
                <div className="bg-[#1063A70A] rounded-lg lg:rounded-2xl p-4 flex flex-col items-center gap-6 lg:justify-between">
                  <div className="flex flex-col items-center gap-4 lg:gap-6">
                    {/* Feature Title */}
                    <h3 className="font-['Kanit'] font-medium text-[#1063A7] text-[22px] lg:text-[28px] leading-[33px] lg:leading-[42px] text-center lg:flex lg:items-center">
                      {item.title}
                    </h3>

                    {/* Icon */}
                    <div className="w-16 h-16 lg:w-24 lg:h-24 flex items-center justify-center flex-shrink-0">
                      {typeof item.icon === 'string' ? (
                        <Image
                          src={item.icon}
                          alt={item.title}
                          className="w-full h-full object-contain"
                          width={96}
                          height={96}
                        />
                      ) : null}
                    </div>
                  </div>

                  {/* Description split into two stacked spans (supports "\n" in the string) */}
                  <div
                    className="font-['Kanit'] font-normal text-[#1063A7] text-center items-center text-[16px] leading-[24px] lg:text-[22px] lg:leading-[32px] flex flex-col"
                    style={{ textShadow: '0px 0px 2px rgba(0,0,0,0.12)' }}
                  >
                    {(() => {
                      const parts = String(item.description || '').split('\n');
                      const first = parts[0] || '';
                      const second = parts.slice(1).join(' '); // join remaining lines into second span
                      return (
                        <>
                          <span className="break-words">{first}</span>
                          {second ? (
                            <span className="break-words">{second}</span>
                          ) : null}
                        </>
                      );
                    })()}
                  </div>
                </div>
              </MotionGridItem>
            ))}
          </div>
        </div>
      </section>
    </MotionReveal>
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
