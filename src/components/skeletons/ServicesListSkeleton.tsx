'use client';
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function ServicesListSkeleton() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-b from-white to-[var(--color-background)]">
      <div className="px-4 lg:px-0 max-w-[970px] w-full pt-[128px] lg:pt-[246px]">
        <div className="w-full flex flex-col gap-8 items-center">
          <div>
            <div className="flex flex-col items-start gap-4">
              <div className="flex items-center gap-3 lg:gap-4 mb-4">
                <Skeleton className="w-3 h-3 rounded-full" />
                <Skeleton className="h-6 w-64" />
              </div>
              <Skeleton className="h-4 w-full mb-3" />
              <Skeleton className="h-4 w-full" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-[2.1875rem] w-full">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-lg overflow-hidden">
                <Skeleton className="w-full h-40 rounded-lg mb-3" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
