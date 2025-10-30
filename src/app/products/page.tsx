'use client';

import { useState, useEffect, useCallback } from 'react';
import { Product } from '@/types/product';
import { productAPI } from '@/services/productService';
import { ProductFilter, ProductCard } from '@/components';
import CTAButton from '@/components/CTAButton';
import { categoryMapping, getProductsByCategory } from '@/lib/categoryMapping';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProductsPage() {
  const [selectedFilter, setSelectedFilter] = useState('all');
  // Products grouped by category (paginated incremental fetch)
  const [productsByCategory, setProductsByCategory] = useState<
    Record<string, Product[]>
  >({});
  const [pageByCategory, setPageByCategory] = useState<Record<string, number>>(
    {}
  );
  const [hasMoreByCategory, setHasMoreByCategory] = useState<
    Record<string, boolean>
  >({});
  const [loadingByCategory, setLoadingByCategory] = useState<
    Record<string, boolean>
  >({});
  const [isLoading, setIsLoading] = useState(true);
  const [isFilterLoading, setIsFilterLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helper: fetch a page for a specific category
  const fetchCategoryPage = useCallback(
    async (categoryKey: string, page = 1, retryCount = 0) => {
      try {
        // set per-category loading state
        setLoadingByCategory(prev => ({ ...prev, [categoryKey]: true }));
        setIsLoading(true);
        const response = await productAPI.getProducts({
          category: categoryKey,
          page,
          pageSize: 6,
        });

        // If server returned no products for this category, fallback to a
        // larger unfiltered fetch and filter client-side. This handles cases
        // where Strapi tagging shapes differ from our expectations.
        let finalProducts = response.products;
        let finalHasMore = response.hasMore;

        if (response.products.length === 0) {
          try {
            const fallback = await productAPI.getProducts({
              page: 1,
              pageSize: 100,
            });
            const matched = getProductsByCategory(
              fallback.products,
              categoryKey
            );
            finalProducts = matched;
            finalHasMore = false; // unknown in this fallback
          } catch (fallbackErr) {
            // keep finalProducts as empty
            console.warn('Fallback fetch for products failed', fallbackErr);
          }
        }

        setProductsByCategory(prev => ({
          ...prev,
          [categoryKey]:
            page === 1
              ? finalProducts
              : [...(prev[categoryKey] || []), ...finalProducts],
        }));

        setPageByCategory(prev => ({ ...prev, [categoryKey]: response.page }));
        setHasMoreByCategory(prev => ({
          ...prev,
          [categoryKey]: finalHasMore,
        }));
        setError(null);
        setLoadingByCategory(prev => ({ ...prev, [categoryKey]: false }));
      } catch (err) {
        if (retryCount < 2 && (err as Error).message.includes('401')) {
          setTimeout(
            () => fetchCategoryPage(categoryKey, page, retryCount + 1),
            1000 * (retryCount + 1)
          );
          return;
        }

        setError('Failed to fetch products');
        setLoadingByCategory(prev => ({ ...prev, [categoryKey]: false }));
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Initialize fetch for visible categories whenever the selected filter changes
  useEffect(() => {
    // Determine which categories to fetch
    const categoriesToFetch =
      selectedFilter === 'all'
        ? ['plc-scada', 'spare-parts', 'instrumentation']
        : [selectedFilter];

    // Reset state for these categories and fetch page 1
    (async () => {
      setError(null);
      setIsLoading(true);
      const resets: Record<string, Product[]> = {};
      const resetPages: Record<string, number> = {};
      const resetHasMore: Record<string, boolean> = {};
      for (const c of categoriesToFetch) {
        resets[c] = [];
        resetPages[c] = 1;
        resetHasMore[c] = false;
      }
      setProductsByCategory(prev => ({ ...prev, ...resets }));
      setPageByCategory(prev => ({ ...prev, ...resetPages }));
      setHasMoreByCategory(prev => ({ ...prev, ...resetHasMore }));

      for (const c of categoriesToFetch) {
        // fetch first page
        // fetchCategoryPage will set loading state
        await fetchCategoryPage(c, 1);
      }
      setIsLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFilter]);

  const handleFilterChange = (filterId: string) => {
    setIsFilterLoading(true);
    setSelectedFilter(filterId);

    setTimeout(() => {
      setIsFilterLoading(false);
    }, 300);
  };

  // Helper to access current products grouped by category (fallback empty array)
  const filteredProductsByCategory = ((): Record<string, Product[]> => {
    if (selectedFilter === 'all') {
      return {
        'plc-scada': productsByCategory['plc-scada'] ?? [],
        'spare-parts': productsByCategory['spare-parts'] ?? [],
        instrumentation: productsByCategory['instrumentation'] ?? [],
      };
    }

    return { [selectedFilter]: productsByCategory[selectedFilter] ?? [] };
  })();

  const renderProductSection = (
    categoryKey: string,
    products: Product[] = []
  ) => {
    const categoryInfo = categoryMapping[categoryKey];
    if (!categoryInfo) return null;
    // Prefer items passed in as argument (from filteredProductsByCategory),
    // but fall back to the state bucket when not provided.
    const fetchedProducts =
      products && products.length > 0
        ? products
        : (productsByCategory[categoryKey] ?? []);
    const isSectionLoading =
      isLoading && (!fetchedProducts || fetchedProducts.length === 0);

    return (
      <div key={categoryKey} className="mb-12">
        <h2 className="text-primary lg:text-[1.375rem] font-medium w-full mt-[2.4375rem] underline decoration-[var(--color-accent)] decoration-1.5 underline-offset-8">
          {categoryInfo.title}
        </h2>

        <div className="mt-5 lg:mt-8 w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isSectionLoading ? (
              // show skeleton placeholders while loading this section
              Array.from({ length: 6 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))
            ) : fetchedProducts.length > 0 ? (
              fetchedProducts.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  showPrice={true}
                  showStock={true}
                />
              ))
            ) : (
              // no results for this section
              <div className="col-span-full text-center py-8">
                <p className="text-gray-500 text-lg">
                  ไม่พบสินค้าในหมวดหมู่นี้
                </p>
              </div>
            )}
          </div>

          {/* Load more button (server paginated) */}
          {hasMoreByCategory[categoryKey] && (
            <div className="w-full flex justify-center mt-6">
              <CTAButton
                cta={{
                  label: 'โหลดเพิ่ม',
                  href: undefined,
                  variant: 'content-primary',
                  onClick: async () => {
                    const nextPage = (pageByCategory[categoryKey] || 1) + 1;
                    await fetchCategoryPage(categoryKey, nextPage);
                  },
                }}
                asMotion={false}
                loading={!!loadingByCategory[categoryKey]}
                loadingLabel={'กำลังโหลด...'}
              />
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="px-4 container-970">
        <div className="mt-32 lg:mt-61.5 w-full flex justify-between items-center">
          <h1 className="pl-5 text-primary font-medium lg:text-[1.375rem] flex items-baseline lg:items-center gap-4">
            <span className="w-2 h-2 lg:w-4 lg:h-4 bg-[var(--accent-red)] rounded-full"></span>
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
            {/* Render in specific order: PLC/SCADA/Automation, Spare Parts, Instrumentation */}
            {renderProductSection(
              'plc-scada',
              filteredProductsByCategory['plc-scada'] ?? []
            )}
            {renderProductSection(
              'spare-parts',
              filteredProductsByCategory['spare-parts'] ?? []
            )}
            {renderProductSection(
              'instrumentation',
              filteredProductsByCategory['instrumentation'] ?? []
            )}

            {Object.values(filteredProductsByCategory).every(
              products => products.length === 0
            ) && (
              <div className="text-center py-8">
                <p className="text-gray-500 text-lg">
                  ไม่พบสินค้าในหมวดหมู่นี้
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </>
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
