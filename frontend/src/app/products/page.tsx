'use client';

import { useState, useEffect } from 'react';
import { Product } from '@/types/product';
import { productAPI } from '@/services/productService';
import { ProductFilter, ProductCard } from '@/components';
import { categoryMapping, getProductsByCategory } from '@/lib/categoryMapping';

export default function ProductsPage() {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const response = await productAPI.getProducts();
      setProducts(response.products);
      setError(null);
    } catch (err) {
      setError('Failed to fetch products');
      console.error('Error fetching products:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (filterId: string) => {
    setSelectedFilter(filterId);
  };

  const handleProductClick = (product: Product) => {
    console.log('Product clicked:', product);
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

    // ใช้ getProductsByCategory ที่เรียงตาม tag แล้ว (ไม่แสดง subtitle tag)
    const sortedProducts = getProductsByCategory(products, categoryKey);

    return (
      <div key={categoryKey} className="mb-12">
        <h2 className="text-primary text-[1.375rem] font-medium w-full px-4 mt-[2.4375rem] underline decoration-[var(--color-accent)] underline-offset-8">
          {categoryInfo.title}
        </h2>
        
        <div className="px-4 mt-8 w-full">
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
        <div className="mt-49 lg:mt-61.5 w-full flex justify-between items-center">
          <h1 className="pl-5 text-primary font-medium lg:text-[1.375rem] flex items-center gap-4">
            <span className="w-4 h-4 bg-accent rounded-full"></span>
            อะไหล่และระบบที่เราเชี่ยวชาญ
          </h1>

          <ProductFilter
            selectedOption={selectedFilter}
            onOptionSelect={handleFilterChange}
            className="mr-5"
          />
        </div>

        {isLoading && (
          <div className="px-4 mt-8 w-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="bg-gray-200 animate-pulse rounded-lg h-64"></div>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="text-center py-8">
            <p className="text-red-500 text-lg">{error}</p>
          </div>
        )}

        {!isLoading && !error && (
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
