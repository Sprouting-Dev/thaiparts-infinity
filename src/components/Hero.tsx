// src/components/Hero.tsx
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import CTAButton from '@/components/CTAButton';
import type { CTAVariant } from '@/lib/button-styles';
import type PageHeroSchema from '@/types/page';
import { sanitizeHtml } from '@/lib/sanitize';
import type { PossibleMediaInput } from '@/types/strapi';
import { mediaUrl } from '@/lib/strapi';

type CTA = {
  label: string;
  href?: string;
  variant?: CTAVariant;
  newTab?: boolean;
};
type Align = 'left' | 'center' | 'right';

export default function Hero(props: {
  title?: string;
  subtitle?: string;
  background?: string;
  ctas: CTA[];
  panel?: { enabled?: boolean; align?: Align };
  hero_schema?: PageHeroSchema & {
    quote?: string | null; // ใช้ช่องเดียว: Title + <hr> + Subtitle
    isShowButton?: boolean;
    button_1?: string | null;
    button_2?: string | null;
    hero_image?: unknown; // Strapi media
  };
}) {
  // ----- Background (Strapi media → URL)
  // Strict Strapi-only: prefer hero_schema.hero_image, then props.background.
  // Do NOT fall back to a local placeholder image here to avoid masking missing CMS content.
  const cmsImage = mediaUrl(
    props.hero_schema?.hero_image as unknown as PossibleMediaInput
  );
  const backgroundPath = cmsImage || props.background;

  // If no background provided, do not render the Hero (strict Strapi-only)
  // NOTE: we avoid returning early before hooks to respect react-hooks rules.

  // ----- แยก Title/Subtitle จาก quote โดยแบ่งด้วย <hr> -----
  const raw = (props.hero_schema?.quote ?? '').trim();

  const normalized = useMemo(
    () =>
      raw
        .replace(/\r\n/g, '\n')
        .replace(/\u00A0/g, ' ')
        .replace(/\s+$/g, ''),
    [raw]
  );

  const [titleHTML, subtitleHTML] = useMemo(() => {
    const [t = '', s = ''] = normalized.split(/<hr\s*\/?>/i).map(v => v.trim());
    // Sanitize CMS-provided HTML immediately so server-render output matches client
    return [sanitizeHtml(t), sanitizeHtml(s)];
  }, [normalized]);

  // กัน hydration mismatch ตอนใช้ dangerouslySetInnerHTML
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const hasTitle = !!titleHTML || !!props.title;
  const hasSubtitle = !!subtitleHTML || !!props.subtitle;

  // จัดตำแหน่ง panel/ข้อความตาม align
  const align: Align = props.panel?.align ?? 'center';
  const alignClass =
    align === 'left'
      ? 'items-start text-start'
      : align === 'right'
        ? 'items-end text-end'
        : 'items-center text-center';

  const textAlignOnly =
    align === 'left'
      ? 'text-left'
      : align === 'right'
        ? 'text-right'
        : 'text-center';

  // Dev overlay เฉพาะโหมด development
  // Development overlay removed for production cleanliness

  // ซ่อน panel ถ้า disabled
  const panelEnabled = props.panel?.enabled !== false;

  // If no background provided, do not render the Hero (strict Strapi-only)
  if (!backgroundPath) return null;

  return (
    <section className="relative w-full h-[568px] md:h-[720px] lg:h-[900px] xl:h-[1024px]">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden">
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
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-black/30 to-black/70" />
      </div>

      {/* Bottom Glass Panel */}
      {panelEnabled && (
        <div className="absolute inset-x-0 bottom-0 w-full flex justify-center">
          <div className="w-full flex flex-col items-center justify-center p-8 lg:p-16 gap-4 border-t border-white/10 bg-[rgba(16,99,167,0.06)] backdrop-blur-[8px] saturate-125">
            <div
              className={`w-full flex flex-col gap-2 max-w-[375px] sm:max-w-[600px] lg:max-w-full ${alignClass}`}
            >
              {/* Title */}
              {hasTitle && (
                <h1
                  className={`font-[Kanit] font-medium text-[22px] leading-[33px] lg:text-[36px] lg:leading-[54px] drop-shadow-[0_2px_16px_rgba(0,0,0,0.5)] ${textAlignOnly}`}
                  suppressHydrationWarning
                  {...(mounted && titleHTML
                    ? { dangerouslySetInnerHTML: { __html: titleHTML } }
                    : { children: props.title ?? '' })}
                />
              )}

              {/* Subtitle */}
              {hasSubtitle && (
                <div
                  className={`text-[16px] leading-[24px] lg:text-[22px] lg:leading-[33px] drop-shadow-[0_2px_16px_rgba(0,0,0,0.5)] ${textAlignOnly}`}
                  style={{ color: '#F5F5F5' }}
                  suppressHydrationWarning
                  {...(mounted && subtitleHTML
                    ? { dangerouslySetInnerHTML: { __html: subtitleHTML } }
                    : { children: props.subtitle ?? '' })}
                />
              )}
            </div>

            {/* CTA Buttons */}
            <div className="flex items-center justify-center flex-wrap gap-2 lg:gap-4 font-medium">
              {props.hero_schema?.isShowButton ? (
                <>
                  {props.hero_schema?.button_1 && (
                    <CTAButton
                      cta={{
                        label: props.hero_schema.button_1!,
                        href: props.ctas?.[0]?.href ?? '/contact-us',
                        variant: 'primary',
                      }}
                      textSize="large"
                      asMotion={true}
                    />
                  )}
                  {props.hero_schema?.button_2 && (
                    <CTAButton
                      cta={{
                        label: props.hero_schema.button_2!,
                        href: props.ctas?.[1]?.href ?? '/products',
                        variant: 'hero-secondary',
                      }}
                      textSize="large"
                      asMotion={true}
                    />
                  )}
                </>
              ) : (
                <>
                  {props.ctas?.[0] && (
                    <CTAButton
                      cta={{
                        label: props.ctas[0].label,
                        href: props.ctas[0].href,
                        variant: props.ctas[0].variant ?? 'primary',
                      }}
                      textSize="large"
                      asMotion={true}
                    />
                  )}
                  {props.ctas?.[1] && (
                    <CTAButton
                      cta={{
                        label: props.ctas[1].label,
                        href: props.ctas[1].href,
                        variant: props.ctas[1].variant ?? 'hero-secondary',
                      }}
                      textSize="large"
                      asMotion={true}
                    />
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* dev overlay removed */}
    </section>
  );
}
