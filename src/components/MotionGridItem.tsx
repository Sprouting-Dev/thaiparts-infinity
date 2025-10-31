'use client';
import { motion, useReducedMotion } from 'framer-motion';
import React from 'react';
import { DEFAULT_EASE, MED_DUR, HOVER_SCALE } from '@/lib/motion';

export default function MotionGridItem({
  children,
  index = 0,
}: {
  children: React.ReactNode;
  index?: number;
}) {
  const reduce = useReducedMotion();
  const delay = Math.min(0.06 * index, 0.6);
  if (reduce) {
    return <div className="w-full">{children}</div>;
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: HOVER_SCALE }}
      transition={{ duration: MED_DUR, ease: DEFAULT_EASE, delay }}
      className="w-full"
    >
      {children}
    </motion.div>
  );
}
