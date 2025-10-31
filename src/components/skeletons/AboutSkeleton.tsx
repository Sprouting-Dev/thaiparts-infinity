'use client';
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import HeroSkeleton from './HeroSkeleton';

export default function AboutSkeleton() {
  return (
    <div className="bg-[#F5F5F5] min-h-screen w-full">
      <main className="w-full flex flex-col justify-center items-center">
        <div className="container-970 mx-4 lg:mx-0 mt-10 lg:mt-20 max-w-5xl">
          <HeroSkeleton align="center" />
          <div className="mt-6">
            <Skeleton className="h-10 w-1/2 mb-6" />
            <Skeleton className="w-full h-64 rounded-2xl mb-8" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      </main>
    </div>
  );
}
