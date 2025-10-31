'use client';
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import HeroSkeleton from './HeroSkeleton';

export default function HomeSkeleton() {
  return (
    <div className="bg-[#F5F5F5] min-h-screen w-full">
      <main className="w-full flex flex-col gap-16 justify-center items-center">
        <div className="container-970 mx-4 lg:mx-0 mt-10 lg:mt-20">
          {/* Hero */}
          <div className="mb-8">
            <HeroSkeleton align="center" />
          </div>

          {/* Features / sections */}
          <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <section key={i} className="p-4 rounded-lg">
                <div className="flex items-center gap-3 mb-3">
                  <Skeleton className="w-3 h-3 rounded-full" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-5/6" />
              </section>
            ))}
          </div>
        </div>

        {/* Preview rows: products / services / articles */}
        <div className="container-970 mt-12 mx-4 lg:mx-0 space-y-12">
          <div>
            <Skeleton className="h-8 w-48 mb-6" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="rounded-md overflow-hidden">
                  <Skeleton className="w-full h-40 rounded-md mb-3" />
                  <Skeleton className="h-5 w-3/4" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
