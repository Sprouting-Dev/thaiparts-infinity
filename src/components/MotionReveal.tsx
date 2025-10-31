'use client';
import { motion, useReducedMotion } from 'framer-motion';
import React from 'react';
import { STAGGER_DEFAULT, REVEAL_ITEM } from '@/lib/motion';

export function MotionReveal({
  children,
  stagger = STAGGER_DEFAULT,
}: {
  children: React.ReactNode;
  stagger?: number;
}) {
  const reduce = useReducedMotion();
  if (reduce) return <div>{children}</div>;

  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.15 }}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: stagger } },
      }}
    >
      {children}
    </motion.div>
  );
}

export const revealItem = REVEAL_ITEM;
