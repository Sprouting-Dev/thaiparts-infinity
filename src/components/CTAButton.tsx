'use client';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import {
  getButtonStyle,
  getButtonClassName,
  type CTAVariant,
} from '@/lib/button-styles';

interface CTAButton {
  label: string;
  href?: string;
  variant: CTAVariant;
  className?: string;
  onClick?: () => void;
}

type TextSize = 'small' | 'medium' | 'large';

interface Props {
  cta: CTAButton;
  asMotion?: boolean; // Use framer-motion or regular Link
  className?: string; // Additional CSS classes
  textSize?: TextSize; // 'small' (navbar/grid), 'medium' (default), 'large' (hero/feature/pre-footer)
  loading?: boolean; // show spinner and disabled state
  loadingLabel?: string; // text to display while loading (defaults to Thai 'กำลังส่ง...')
}

export default function CTAButton({
  cta,
  asMotion = false,
  className,
  textSize = 'medium',
  loading = false,
  loadingLabel = '',
}: Props) {
  // Avoid rendering framer-motion markup on the server to prevent
  // hydration mismatch when the motion DOM differs from the server HTML.
  // We render a regular Link on the server and switch to motion on the
  // client once mounted if `asMotion` is requested.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const style = getButtonStyle(cta.variant);
  const baseClassName = getButtonClassName(cta.variant);

  // Get text size classes based on textSize prop
  const getTextSizeClasses = (size: TextSize): string => {
    switch (size) {
      case 'small':
        return 'text-[14px] leading-[21px] lg:text-[16px] lg:leading-[24px]'; // mobile: 14px/21px, desktop: 16px/24px
      case 'large':
        return 'text-[14px] leading-[21px] lg:text-[22px] lg:leading-[33px]'; // mobile: 14px/21px, desktop: 22px/33px
      case 'medium':
      default:
        return 'text-[14px] leading-[21px]'; // mobile only: 14px/21px
    }
  };

  const textSizeClasses = getTextSizeClasses(textSize);
  // Allow CTA text to wrap on small screens but keep single-line on larger
  // viewports so long labels don't overflow on mobile.
  const wrapClass = 'whitespace-normal sm:whitespace-nowrap break-words';

  const combinedClassName =
    `${baseClassName} ${textSizeClasses} ${wrapClass} ${cta.className || ''} ${
      className || ''
    }`.trim();

  // When loading, add muted/disabled Tailwind classes instead of using an overlay
  const loadingClass = loading ? 'opacity-60 cursor-not-allowed' : '';
  const finalClassName = `${combinedClassName} ${loadingClass}`.trim();

  const buttonStyle = {
    color: style.color,
    ...(style.boxShadow && { boxShadow: style.boxShadow }),
    ...(style.textShadow && { textShadow: style.textShadow }),
    ...(style.borderGradient
      ? {
          // Gradient border: CSS handles background (padding handled by Tailwind classes)
          '--border-gradient': style.borderGradient,
          '--border-width': style.borderWidth || '2px',
          '--btn-bg': style.bg,
        }
      : {
          // No gradient: set background (padding handled by Tailwind classes)
          background: style.bg,
          ...(style.border && { border: style.border }),
        }),
  };

  const hoverStyle = {
    ...(style.borderGradient
      ? ({
          '--btn-bg': style.hoverBg,
        } as React.CSSProperties)
      : {
          background: style.hoverBg,
        }),
  };

  const reduceMotion = useReducedMotion();
  const hoverTransition = { duration: 0.18 };

  // Use href directly (no special contact logic needed)
  // If no href is provided, render a <button> instead of an anchor to
  // avoid a default '#' that would navigate the page to the top when
  // clicked (common for onClick-only CTAs like form submit).
  const finalHref = cta.href ?? undefined;

  if (asMotion && mounted && !reduceMotion) {
    if (finalHref && !loading) {
      return (
        <motion.a
          href={finalHref}
          className={combinedClassName}
          style={buttonStyle}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={hoverTransition}
          onHoverStart={e => {
            const el = (e && (e.currentTarget as HTMLElement)) || null;
            if (!el) return;
            if (style.borderGradient) {
              el.style.setProperty('--btn-bg', style.hoverBg || '');
            } else if (style.hoverBg) {
              el.style.background = style.hoverBg as string;
            }
          }}
          onHoverEnd={e => {
            const el = (e && (e.currentTarget as HTMLElement)) || null;
            if (!el) return;
            if (style.borderGradient) {
              el.style.setProperty('--btn-bg', (style.bg as string) || '');
            } else if (style.bg) {
              el.style.background = style.bg as string;
            }
          }}
          onClick={cta.onClick}
        >
          <span style={{ position: 'relative', zIndex: 1 }}>{cta.label}</span>
        </motion.a>
      );
    }

    // Render a motion.button (used for no-href flows or when loading)
    return (
      <motion.button
        type="button"
        className={finalClassName}
        style={buttonStyle}
        whileHover={loading ? undefined : { scale: 1.02 }}
        whileTap={loading ? undefined : { scale: 0.98 }}
        transition={hoverTransition}
        onHoverStart={e => {
          const el = (e && (e.currentTarget as HTMLElement)) || null;
          if (!el) return;
          if (style.borderGradient) {
            el.style.setProperty('--btn-bg', style.hoverBg || '');
          } else if (style.hoverBg) {
            el.style.background = style.hoverBg as string;
          }
        }}
        onHoverEnd={e => {
          const el = (e && (e.currentTarget as HTMLElement)) || null;
          if (!el) return;
          if (style.borderGradient) {
            el.style.setProperty('--btn-bg', (style.bg as string) || '');
          } else if (style.bg) {
            el.style.background = style.bg as string;
          }
        }}
        onClick={loading ? undefined : cta.onClick}
        disabled={loading}
        aria-busy={loading}
        aria-disabled={loading}
      >
        {loading ? (
          <span
            style={{ position: 'relative', zIndex: 1 }}
            className="flex items-center justify-center"
          >
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            {loadingLabel}
          </span>
        ) : (
          <span style={{ position: 'relative', zIndex: 1 }}>{cta.label}</span>
        )}
        {/* Add a subtle overlay/span to ensure pointer events are blocked and the appearance is muted while loading. */}
        {/** loading state handled via disabled + Tailwind classes (opacity/cursor) */}
      </motion.button>
    );
  }

  // If reduced motion is preferred, fall back to the static Link variant even when asMotion is requested.

  if (finalHref && !loading) {
    return (
      <Link
        href={finalHref}
        className={combinedClassName}
        style={buttonStyle}
        onClick={cta.onClick}
        onMouseEnter={e => {
          Object.assign(e.currentTarget.style, hoverStyle);
        }}
        onMouseLeave={e => {
          if (style.borderGradient) {
            e.currentTarget.style.setProperty('--btn-bg', style.bg);
          } else {
            e.currentTarget.style.background = style.bg;
          }
        }}
      >
        <span style={{ position: 'relative', zIndex: 1 }}>{cta.label}</span>
      </Link>
    );
  }

  // Default: render a non-motion button (handles loading or no-href flows)
  return (
    <button
      type="button"
      className={finalClassName}
      style={buttonStyle}
      onClick={loading ? undefined : cta.onClick}
      onMouseEnter={e => {
        Object.assign(e.currentTarget.style, hoverStyle);
      }}
      onMouseLeave={e => {
        if (style.borderGradient) {
          e.currentTarget.style.setProperty('--btn-bg', style.bg);
        } else {
          e.currentTarget.style.background = style.bg;
        }
      }}
      disabled={loading}
      aria-busy={loading}
      aria-disabled={loading}
    >
      {loading ? (
        <span
          className="flex items-center justify-center"
          style={{ position: 'relative', zIndex: 1 }}
        >
          <svg
            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          {loadingLabel}
        </span>
      ) : (
        <span style={{ position: 'relative', zIndex: 1 }}>{cta.label}</span>
      )}
    </button>
  );
}
