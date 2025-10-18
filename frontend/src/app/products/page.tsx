'use client';

import { useState, useEffect } from 'react';
import { Product } from '@/types/product';
import { productAPI } from '@/services/productService';
import { ProductFilter, ProductCard, ProductsPageSkeleton, FilterLoadingSkeleton } from '@/components';
import { categoryMapping, getProductsByCategory } from '@/lib/categoryMapping';

export default function ProductsPage() {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFilterLoading, setIsFilterLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async (retryCount = 0) => {
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
  };

  const handleFilterChange = (filterId: string) => {
    setIsFilterLoading(true);
    setSelectedFilter(filterId);
    
    setTimeout(() => {
      setIsFilterLoading(false);
    }, 300);
  };

  const handleProductClick = (product: Product) => {
    // TODO: Implement product detail navigation
  };

  const getFilteredProducts = () => {
    if (selectedFilter === 'all') {
      return {
        'spare-parts': getProductsByCategory(products, 'spare-parts'),
        'plc-scada': getProductsByCategory(products, 'plc-scada'),
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

    const sortedProducts = getProductsByCategory(products, categoryKey);

    return (
      <div key={categoryKey} className="mb-12">
        <h2 className="text-primary lg:text-[1.375rem] font-medium w-full px-4 mt-[2.4375rem] underline decoration-[var(--color-accent)] decoration-1.5 underline-offset-8">
          {categoryInfo.title}
        </h2>
        
        <div className="px-4 mt-5 lg:mt-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {sortedProducts.map(product => (
              <ProductCard 
                key={product.id} 
                product={product}
                onClick={handleProductClick}
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

        {isLoading && <ProductsPageSkeleton />}

        {!isLoading && isFilterLoading && <FilterLoadingSkeleton />}

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
      </div>
    </>
  );
}
