import Image from 'next/image';
import CTAButton from '@/components/CTAButton';
import MotionTitleLine from '@/components/MotionTitleLine';
import { MotionReveal } from '@/components/MotionReveal';
import React from 'react';

/**
 * Hero component (Desktop + Mobile) aligned to Figma spec with responsive breakpoints.
 * - Removes forced min-width 1440px (prevents horizontal scroll on smaller screens)
 * - Uses a full-bleed background + centered inner container (max-w-[1440px])
 * - Mobile overlay hidden on lg screens to avoid duplicate rendering
 * - CTA rendering de-duplicated via helper
 */
export default function Hero(props: {
  title: {
    // canonical: desktop must provide segments (array of lines; each line is array of segments)
    desktop: {
      segments: {
        text: string;
        color: 'brandBlue' | 'accentRed' | 'white';
      }[][];
      // when true, render all segments on a single inline line instead of multiple stacked lines
      inline?: boolean;
    };
    // mobile supports either a flat array of segments (each rendered as its own line)
    // or an array-of-arrays (grouped segments per line). `inline` flattens into one line.
    mobile: {
      lines:
        | { text: string; color: 'brandBlue' | 'accentRed' | 'white' }[]
        | { text: string; color: 'brandBlue' | 'accentRed' | 'white' }[][];
      inline?: boolean;
    };
  };
  background?: string;
  subtitle: string;
  /** when true, render subtitle with whitespace-pre-line so `\n` becomes line breaks */
  preserveSubtitleNewlines?: boolean;
  ctas: { label: string; href?: string; variant: string; newTab?: boolean }[];
  panel: { enabled: boolean; align: 'left' | 'center' | 'right' };
}) {
  // Development-only debug logging (kept minimal)
  if (process.env.NODE_ENV === 'development') {
    // Keep one-liners only when actively debugging; comment out by default.
    // console.log('[Hero] Props received:', { background: props.background, title: props.title });
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

  // Determine panel alignment classes from props.panel.align (left | center | right)
  const panelAlign = props.panel?.align ?? 'left';
  const containerAlignClass =
    panelAlign === 'center'
      ? 'items-center'
      : panelAlign === 'right'
        ? 'items-end'
        : 'items-start';
  const textAlignMobile =
    panelAlign === 'center'
      ? 'text-center'
      : panelAlign === 'right'
        ? 'text-right'
        : 'text-left';
  const textAlignDesktop =
    panelAlign === 'center'
      ? 'text-center'
      : panelAlign === 'right'
        ? 'text-right'
        : 'text-left';

  type Segment = { text: string; color: 'brandBlue' | 'accentRed' | 'white' };

  // desktop.segments is required now (segments-only API)
  const desktopLines: Segment[][] = props.title.desktop?.segments ?? [];

  // Normalize mobile lines to a canonical Segment[][] and capture per-line inline flags.
  // Supported input shapes for `mobile.lines`:
  // - Segment[]               -> each entry becomes its own line
  // - Segment[][]             -> each inner array is a grouped line
  // - { segments: Segment[]; inline?: boolean }[] -> explicit per-line inline control
  type MobileLineInput =
    | Segment
    | Segment[]
    | { segments: Segment[]; inline?: boolean };

  // Type guard to detect explicit per-line objects with `segments` and optional `inline`
  function isMobileLineObject(
    x: unknown
  ): x is { segments: Segment[]; inline?: boolean } {
    return (
      typeof x === 'object' &&
      x !== null &&
      Array.isArray((x as { segments?: unknown }).segments)
    );
  }

  const mobileRaw = props.title.mobile.lines as MobileLineInput[];
  const mobileLines: Segment[][] = [];
  const mobileInlineFlags: boolean[] = [];

  if (Array.isArray(mobileRaw) && mobileRaw.length > 0) {
    for (const item of mobileRaw) {
      if (!item) continue;
      if (Array.isArray(item)) {
        // grouped segments for this line
        mobileLines.push(item as Segment[]);
        mobileInlineFlags.push(false);
      } else if (isMobileLineObject(item)) {
        const obj = item;
        mobileLines.push(obj.segments || []);
        mobileInlineFlags.push(Boolean(obj.inline));
      } else {
        // single segment becomes its own line
        mobileLines.push([item as Segment]);
        mobileInlineFlags.push(false);
      }
    }
  }

  // Build mobile title nodes ahead of JSX to avoid complex nested ternaries in markup.
  const mobileTitleNodes = (() => {
    if (mobileInlineFlags.length > 0) {
      return mobileLines.map((segments, index) => {
        const inlineFlag = mobileInlineFlags[index] ?? false;
        return (
          <div key={index} className={inlineFlag ? 'block md:inline' : 'block'}>
            {segments.map((seg, si) => (
              <span key={si} className={color(seg.color)}>
                {seg.text}
                {si < segments.length - 1 ? ' ' : ''}
              </span>
            ))}
          </div>
        );
      });
    }

    if (props.title.mobile.inline) {
      return (
        <div className="block">
          {mobileLines.flat().map((seg, i, arr) => (
            <span key={i} className={color(seg.color)}>
              {seg.text}
              {i < arr.length - 1 ? ' ' : ''}
            </span>
          ))}
        </div>
      );
    }

    return mobileLines.map((segments, index) => (
      <div key={index} className="block">
        {segments.map((seg, si) => (
          <span key={si} className={color(seg.color)}>
            {seg.text}
            {si < segments.length - 1 ? ' ' : ''}
          </span>
        ))}
      </div>
    ));
  })();

  return (
    // Use w-full instead of w-screen to avoid 100vw-related overflow when
    // vertical scrollbars are present or parent transforms are applied.
    <section className="relative w-full h-[568px] md:h-[720px] lg:h-[900px] xl:h-[1024px]">
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
          className="w-full flex flex-col items-center justify-center p-8 lg:p-16 gap-4 backdrop-blur-sm smooth-transition border-t border-white/10"
          style={{
            background: 'rgba(16, 99, 167, 0.06)',
            backdropFilter: 'blur(8px) saturate(120%)',
            WebkitBackdropFilter: 'blur(8px) saturate(120%)',
            boxShadow:
              '0 -1px 0 rgba(255, 255, 255, 0.1), 0 4px 16px rgba(0, 0, 0, 0.2)',
          }}
        >
          {/* Title and Subtitle Container - responsive width */}
          <div
            className={`flex flex-col ${containerAlignClass} gap-2 w-full max-w-[375px] sm:max-w-[600px] lg:max-w-full`}
          >
            {/* Mobile Title (stacked or inline groups) */}
            <h1
              className={`lg:hidden font-[Kanit] font-medium text-[22px] ${textAlignMobile}`}
              style={{ textShadow: '0px 2px 16px rgba(0,0,0,0.5)' }}
            >
              <MotionReveal>
                {React.Children.toArray(mobileTitleNodes).map((node, i) => (
                  <MotionTitleLine key={i} className="block">
                    {node as React.ReactNode}
                  </MotionTitleLine>
                ))}
              </MotionReveal>
            </h1>

            {/* Desktop Title: support flexible segments or legacy fields */}
            <h1
              className={`hidden lg:block font-[Kanit] font-medium text-[36px] ${'lg:' + textAlignDesktop}`}
              style={{ textShadow: '0px 2px 16px rgba(0,0,0,0.5)' }}
            >
              <MotionReveal>
                {props.title.desktop.inline ? (
                  <MotionTitleLine className="block">
                    {desktopLines.flat().map((seg, i, arr) => (
                      <span key={i} className={color(seg.color)}>
                        {seg.text}
                        {i < arr.length - 1 ? ' ' : ''}
                      </span>
                    ))}
                  </MotionTitleLine>
                ) : (
                  desktopLines.length > 0 &&
                  desktopLines.map((segments, li) => (
                    <MotionTitleLine key={li} className="block">
                      {segments.map((seg, si) => (
                        <span key={si} className={color(seg.color)}>
                          {seg.text}
                          {si < segments.length - 1 ? ' ' : ''}
                        </span>
                      ))}
                    </MotionTitleLine>
                  ))
                )}
              </MotionReveal>
            </h1>
            <p
              className={`${props.preserveSubtitleNewlines ? 'whitespace-pre-line ' : ''}${textAlignMobile} ${'lg:' + textAlignDesktop} text-[#F5F5F5] font-normal text-[16px] leading-[24px] lg:text-[22px] lg:leading-[33px]`}
              style={{ textShadow: '0px 2px 16px rgba(0,0,0,0.5)' }}
            >
              {props.subtitle}
            </p>
          </div>

          {/* CTA Buttons - using CTAButton with responsive padding */}
          <div className="flex items-center justify-center flex-wrap gap-2 lg:gap-4 font-medium">
            {props.ctas?.[0] && (
              <CTAButton
                cta={{
                  label: props.ctas[0].label,
                  href: props.ctas[0].href,
                  variant: 'primary',
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
                  variant: 'hero-secondary',
                }}
                textSize="large"
                asMotion={true}
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
