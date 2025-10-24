// Product Card Skeleton Component
export const ProductCardSkeleton = () => {
  return (
    <div className="w-full h-auto bg-secondary transition-shadow duration-300 overflow-hidden animate-pulse">
      {/* Image skeleton */}
      <div className="relative aspect-video bg-gray-300"></div>

      <div className="py-4">
        {/* Tag skeleton */}
        <div className="mb-2">
          <div className="h-6 bg-gray-300 rounded-full w-48"></div>
        </div>

        {/* Title skeleton */}
        <div className="space-y-2 mb-2">
          <div className="h-6 bg-gray-300 rounded w-full"></div>
          <div className="h-6 bg-gray-300 rounded w-3/4"></div>
        </div>
      </div>
    </div>
  );
};

// Category Section Skeleton
export const CategorySectionSkeleton = ({ itemCount = 6 }: { itemCount?: number }) => {
  return (
    <div className="mb-12">
      {/* Category title skeleton */}
      <div className="w-full px-4 mt-[2.4375rem]">
        <div className="h-8 bg-gray-300 rounded w-80 animate-pulse"></div>
      </div>
      
      {/* Products grid skeleton */}
      <div className="px-4 mt-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {[...Array(itemCount)].map((_, index) => (
            <ProductCardSkeleton key={index} />
          ))}
        </div>
      </div>
    </div>
  );
};

// Products Page Skeleton (for initial load)
export const ProductsPageSkeleton = () => {
  return (
    <div>
      {/* Spare Parts section */}
      <CategorySectionSkeleton itemCount={6} />
      
      {/* PLC/SCADA section */}
      <CategorySectionSkeleton itemCount={4} />
      
      {/* Instrumentation section */}
      <CategorySectionSkeleton itemCount={3} />
    </div>
  );
};

// Filter Loading Skeleton (for filter changes)
export const FilterLoadingSkeleton = () => {
  return (
    <div className="mb-12">
      {/* Category title skeleton */}
      <div className="w-full px-4 mt-[2.4375rem]">
        <div className="h-8 bg-gray-300 rounded w-80 animate-pulse"></div>
      </div>
      
      {/* Products grid skeleton */}
      <div className="px-4 mt-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <ProductCardSkeleton key={index} />
          ))}
        </div>
      </div>
    </div>
  );
};