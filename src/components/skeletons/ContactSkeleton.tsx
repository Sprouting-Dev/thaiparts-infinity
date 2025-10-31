'use client';
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import HeroSkeleton from './HeroSkeleton';

export default function ContactSkeleton() {
  return (
    <main className="min-h-screen bg-gray-50 overflow-x-hidden">
      {/* Hero placeholder (centered panel like real page when present) */}
      <HeroSkeleton align="center" />

      <div className="container-970 px-4 py-12 lg:py-16">
        <div className="grid grid-cols-1 gap-8 lg:gap-12 lg:grid-cols-2">
          {/* Left: ContactInfo-like card */}
          <div className="p-6 rounded-3xl bg-[#1063A70A] gap-6 flex flex-col">
            <Skeleton className="h-8 w-48 mx-auto lg:mx-0 mb-2" />
            <Skeleton className="h-5 w-3/4 mb-2" />
            <Skeleton className="h-5 w-full mb-2" />
            <Skeleton className="h-5 w-full mb-2" />

            <div className="flex flex-row gap-3 mt-2">
              <Skeleton className="w-12 h-12 rounded-xl" />
              <Skeleton className="w-12 h-12 rounded-xl" />
            </div>

            <div className="relative rounded-xl overflow-hidden shadow-md flex justify-center mt-4">
              <Skeleton className="w-full h-40" />
            </div>
          </div>

          {/* Right: ContactForm-like card */}
          <div
            className="flex flex-col p-6 gap-6 rounded-3xl"
            style={{ backgroundColor: 'rgba(16, 99, 167, 0.04)' }}
          >
            <Skeleton className="h-8 w-40 mx-auto" />

            {/* Input placeholders */}
            <Skeleton className="h-12 w-full rounded-full" />
            <Skeleton className="h-12 w-full rounded-full" />
            <Skeleton className="h-12 w-full rounded-full" />

            {/* Textarea placeholder */}
            <Skeleton className="h-36 w-full rounded-3xl" />

            {/* Submit button placeholder */}
            <div className="flex justify-center mt-2">
              <Skeleton className="h-12 w-40 rounded-full" />
            </div>

            {/* Note/info block */}
            <div className="mt-2">
              <Skeleton className="h-8 w-full rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
