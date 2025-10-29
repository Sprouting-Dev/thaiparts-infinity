"use client";

<<<<<<< HEAD
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
=======
import { useState, useEffect, useCallback } from 'react';
>>>>>>> origin/dev
import { Product } from '@/types/product';
import { productAPI } from '@/services/productService';
import { ProductFilter, ProductCard } from '@/components';
import { categoryMapping, getProductsByCategory } from '@/lib/categoryMapping';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProductsPage() {
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFilterLoading, setIsFilterLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async (retryCount = 0) => {
    try {
      setIsLoading(true);
      const response = await productAPI.getProducts();
      setProducts(response.products);
      setError(null);
    } catch (err) {
      if (retryCount < 2 && (err as Error).message.includes('401')) {
        setTimeout(() => {
          fetchProducts(retryCount + 1);
        }, 1000 * (retryCount + 1));
        return;
      }
      setError('Failed to fetch products');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleFilterChange = (filterId: string) => {
    setIsFilterLoading(true);
    setSelectedFilter(filterId);
    
    setTimeout(() => {
      setIsFilterLoading(false);
    }, 300);
  };

<<<<<<< HEAD
  const handleProductClick = (product: Product) => {
    const slugOrId = product.slug || String(product.id);
    router.push(`/products/${slugOrId}`);
  };

=======
>>>>>>> origin/dev
  const getFilteredProducts = () => {
    if (selectedFilter === 'all') {
      return {
        'plc-scada': getProductsByCategory(products, 'plc-scada'),
        'spare-parts': getProductsByCategory(products, 'spare-parts'),
        'instrumentation': getProductsByCategory(products, 'instrumentation')
      };
    } else {
      return {
        [selectedFilter]: getProductsByCategory(products, selectedFilter)
      };
    }
  };

  const filteredProductsByCategory = getFilteredProducts();

  const renderProductSection = (categoryKey: string, products: Product[]) => {
    const categoryInfo = categoryMapping[categoryKey];
    if (!categoryInfo || products.length === 0) return null;
    return (
      <div key={categoryKey} className="mb-12">
        <h2 className="text-primary lg:text-[1.375rem] font-medium w-full px-4 mt-[2.4375rem] underline decoration-[var(--color-accent)] decoration-1.5 underline-offset-8">
          {categoryInfo.title}
        </h2>
        <div className="px-4 mt-5 lg:mt-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {products.map(product => (
              <ProductCard 
                key={product.id} 
                product={product}
                showPrice={true}
                showStock={true}
              />
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
<<<<<<< HEAD
    <div className="px-4 lg:px-58.75">
      <div className="mt-32 lg:mt-61.5 w-full flex justify-between items-center">
        <h1 className="pl-5 text-primary font-medium lg:text-[1.375rem] flex items-baseline lg:items-center gap-4">
          <span className="w-2 h-2 lg:w-4 lg:h-4 bg-accent rounded-full"></span>
          อะไหล่และระบบที่เราเชี่ยวชาญ
        </h1>
        <ProductFilter
          selectedOption={selectedFilter}
          onOptionSelect={handleFilterChange}
          className="mr-5"
        />
=======
    <>
      <div className="px-4 lg:px-58.75">
        <div className="mt-32 lg:mt-61.5 w-full flex justify-between items-center">
          <h1 className="pl-5 text-primary font-medium lg:text-[1.375rem] flex items-baseline lg:items-center gap-4">
            <span className="w-2 h-2 lg:w-4 lg:h-4 bg-accent rounded-full"></span>
            อะไหล่และระบบที่เราเชี่ยวชาญ
          </h1>

          <ProductFilter
            selectedOption={selectedFilter}
            onOptionSelect={handleFilterChange}
            className="mr-5"
          />
        </div>

        {isLoading && <ProductsListSkeleton />}

        {!isLoading && isFilterLoading && <FilterChangeSkeleton />}

        {error && (
          <div className="text-center py-8">
            <p className="text-red-500 text-lg">{error}</p>
          </div>
        )}

        {!isLoading && !isFilterLoading && !error && (
          <div>
            {Object.entries(filteredProductsByCategory).map(([categoryKey, categoryProducts]) => 
              renderProductSection(categoryKey, categoryProducts)
            )}
            
            {Object.values(filteredProductsByCategory).every(products => products.length === 0) && (
              <div className="text-center py-8">
                <p className="text-gray-500 text-lg">ไม่พบสินค้าในหมวดหมู่นี้</p>
              </div>
            )}
          </div>
        )}
>>>>>>> origin/dev
      </div>
      {isLoading && <ProductsPageSkeleton />}
      {!isLoading && isFilterLoading && <FilterLoadingSkeleton />}
      {error && (
        <div className="text-center py-8">
          <p className="text-red-500 text-lg ">{error}</p>
        </div>
      )}
      {!isLoading && !isFilterLoading && !error && (
        <div>
          {Object.entries(filteredProductsByCategory).map(([categoryKey, categoryProducts]) => 
            renderProductSection(categoryKey, categoryProducts)
          )}
          {Object.values(filteredProductsByCategory).every(products => products.length === 0) && (
            <div className="text-center py-8">
              <p className="text-gray-500 text-lg">ไม่พบสินค้าในหมวดหมู่นี้</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Skeleton Components
function ProductCardSkeleton() {
  return (
    <div className="w-full h-auto bg-secondary transition-shadow duration-300 overflow-hidden">
      <div className="relative aspect-video">
        <Skeleton className="absolute inset-0" />
      </div>
      <div className="py-4">
        <div className="mb-2">
          <Skeleton className="h-6 w-48 rounded-full" />
        </div>
        <div className="space-y-2 mb-2">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-3/4" />
        </div>
      </div>
    </div>
  );
}

function CategorySectionSkeleton({ itemCount = 6 }: { itemCount?: number }) {
  return (
    <div className="mb-12">
      <div className="w-full px-4 mt-[2.4375rem]">
        <Skeleton className="h-8 w-80" />
      </div>
      <div className="px-4 mt-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.from({ length: itemCount }).map((_, index) => (
            <ProductCardSkeleton key={index} />
          ))}
        </div>
      </div>
    </div>
  );
}

function ProductsListSkeleton() {
  return (
    <div>
      <CategorySectionSkeleton itemCount={6} />
      <CategorySectionSkeleton itemCount={4} />
      <CategorySectionSkeleton itemCount={3} />
    </div>
  );
}

function FilterChangeSkeleton() {
  return (
    <div className="mb-12">
      <div className="w-full px-4 mt-[2.4375rem]">
        <Skeleton className="h-8 w-80" />
      </div>
      <div className="px-4 mt-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <ProductCardSkeleton key={index} />
          ))}
        </div>
      </div>
    </div>
  );
}
