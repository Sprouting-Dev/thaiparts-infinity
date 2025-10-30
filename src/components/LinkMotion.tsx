'use client';

import React from 'react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';

interface LinkMotionProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  className?: string;
  children: React.ReactNode;
}

export default function LinkMotion({
  href,
  children,
  className,
  ...rest
}: LinkMotionProps) {
  const reduce = useReducedMotion();
  const isExternal =
    typeof href === 'string' && /^(https?:|mailto:|tel:)/.test(href);

  const hoverMotion = reduce ? {} : { y: -4 };
  const transition = { duration: 0.28, ease: 'easeOut' } as const;

  if (isExternal) {
    // External links: render a regular anchor but add a subtle motion span when allowed
    if (reduce)
      return (
        <a href={href} className={className} {...rest}>
          {children}
        </a>
      );

    return (
      <a href={href} className={className} {...rest}>
        <motion.span whileHover={hoverMotion} transition={transition}>
          {children}
        </motion.span>
      </a>
    );
  }

  // Internal links - use Next.js Link
  // Next.js Link expects anchor-like props on the child; we'll forward
  // any remaining anchor props via a plain <a> element inside Link when
  // necessary to avoid mismatched prop types.
  const anchorProps: React.ComponentPropsWithoutRef<'a'> =
    rest as unknown as React.ComponentPropsWithoutRef<'a'>;

  // Prepare props to forward to Link. Cast to unknown then Record to avoid
  // explicit `any` while still allowing a flexible spread for common anchor props.
  const linkSpread = anchorProps as unknown as Record<string, unknown>;

  if (reduce) {
    return (
      <Link href={href} className={className} {...linkSpread}>
        {children}
      </Link>
    );
  }

  return (
    <Link href={href} className={className} {...linkSpread}>
      <motion.span
        style={{ display: 'inline-block' }}
        whileHover={hoverMotion}
        transition={transition}
      >
        {children}
      </motion.span>
    </Link>
  );
}
