'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import React from 'react';
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
}

export default function CTAButton({
  cta,
  asMotion = false,
  className,
  textSize = 'medium',
}: Props) {
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
  const combinedClassName =
    `${baseClassName} ${textSizeClasses} ${cta.className || ''} ${
      className || ''
    }`.trim();

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

  // Use href directly (no special contact logic needed)
  const finalHref = cta.href ?? '#';

  if (asMotion) {
    return (
      <motion.a
        href={finalHref}
        className={combinedClassName}
        style={buttonStyle}
        whileHover={{
          scale: 1.02,
          ...(style.borderGradient
            ? {
                '--btn-bg': style.hoverBg,
              }
            : {
                background: style.hoverBg,
              }),
        }}
        whileTap={{ scale: 0.98 }}
        onClick={cta.onClick}
      >
        <span style={{ position: 'relative', zIndex: 1 }}>{cta.label}</span>
      </motion.a>
    );
  }

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
