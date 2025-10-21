'use client';
import { motion, useReducedMotion } from 'framer-motion';
import React from 'react';

export function MotionReveal({
  children,
  stagger = 0.06,
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

export const revealItem = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0 },
};
