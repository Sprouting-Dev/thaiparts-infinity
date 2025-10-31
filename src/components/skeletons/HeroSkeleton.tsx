'use client';
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function HeroSkeleton({
  align = 'center',
}: {
  align?: 'left' | 'center' | 'right';
}) {
  const alignClass =
    align === 'left'
      ? 'items-start text-start'
      : align === 'right'
        ? 'items-end text-end'
        : 'items-center text-center';

  return (
    <section className="relative w-full h-[420px] md:h-[560px] lg:h-[720px] xl:h-[900px]">
      <div className="absolute inset-0 bg-gradient-to-br from-neutral-200 to-neutral-300 rounded-2xl" />

      {/* Bottom Glass Panel */}
      <div className="absolute inset-x-0 bottom-0 w-full flex justify-center">
        {/* rounded top to match other glass panels across the site */}
        <div className="w-full flex flex-col items-center justify-center p-6 lg:p-12 gap-4 bg-[rgba(16,99,167,0.06)] backdrop-blur-[6px] saturate-125 rounded-t-2xl overflow-hidden">
          <div
            className={`w-full flex flex-col gap-2 max-w-[375px] sm:max-w-[600px] lg:max-w-full ${alignClass}`}
          >
            <Skeleton className="h-8 w-3/4 lg:h-12 lg:w-1/2 mb-2" />
            <Skeleton className="h-4 w-full lg:h-6 lg:w-3/4" />
          </div>

          <div className="flex items-center justify-center gap-3">
            <Skeleton className="h-10 w-32 rounded-full" />
            <Skeleton className="h-10 w-32 rounded-full" />
          </div>
        </div>
      </div>
    </section>
  );
}
