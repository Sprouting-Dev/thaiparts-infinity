'use client';
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function DetailSkeleton() {
  return (
    <div className="min-h-screen w-full">
      <div className="mx-4 lg:mx-62.5 mt-31.5 lg:mt-61.5">
        {/* Title row (dot + heading) */}
        <div className="mb-4 lg:mb-8">
          <div className="flex items-baseline gap-3 lg:mb-6">
            <Skeleton className="w-2 h-2 lg:w-4 lg:h-4 rounded-full" />
            <Skeleton className="h-[1.375rem] lg:h-[1.75rem] w-3/4" />
          </div>
        </div>

        {/* Main image */}
        <div className="mb-4 lg:mb-8">
          <div className="w-full">
            <Skeleton className="w-full h-[21.4375rem] lg:h-[31.25rem] rounded-2xl lg:rounded-2xl" />
          </div>
        </div>

        {/* Description paragraphs */}
        <div className="mb-8 space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-[95%]" />
          <Skeleton className="h-4 w-[90%]" />
          <Skeleton className="h-4 w-[85%]" />
          <Skeleton className="h-4 w-[70%]" />
        </div>

        {/* Specifications table */}
        <div className="mb-8">
          <div className="rounded-lg overflow-hidden">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className={`grid grid-cols-3`}>
                <div className="bg-gray-50 py-3 pr-6">
                  <Skeleton className="h-4 w-2/3" />
                </div>
                <div className="col-span-2 py-3 pl-6">
                  <Skeleton className="h-4 w-5/6" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA button */}
        <div className="text-center flex justify-center">
          <Skeleton className="h-12 w-full lg:w-[30rem] rounded-full mt-16" />
        </div>
      </div>
    </div>
  );
}
