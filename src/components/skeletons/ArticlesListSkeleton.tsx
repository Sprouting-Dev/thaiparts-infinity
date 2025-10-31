'use client';
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function ArticlesListSkeleton() {
  return (
    <div className="bg-[#F5F5F5] min-h-screen w-full">
      <main className="w-full flex flex-col items-center pt-24">
        <div className="container-970 mx-4 lg:mx-0 flex flex-col gap-8 py-8">
          <Skeleton className="h-10 w-1/2 mb-6" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <article key={i} className="rounded-lg p-4">
                <Skeleton className="w-full h-40 rounded-lg mb-4" />
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full" />
              </article>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
