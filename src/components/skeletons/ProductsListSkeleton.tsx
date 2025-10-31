'use client';
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProductsListSkeleton() {
  return (
    <div className="px-4 container-970">
      <div className="mt-32 lg:mt-61.5 w-full flex justify-between items-center">
        <div className="flex items-center">
          <Skeleton className="h-6 w-48 mr-4" />
        </div>

        <Skeleton className="h-8 w-40" />
      </div>

      <div className="mt-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="rounded-lg p-4">
              <Skeleton className="w-full h-40 rounded-md mb-4" />
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
