'use client';

import { useState, useEffect } from 'react';
import { Product, ProductFilters } from '@/types/product';
import { productAPI, mockProducts } from '@/services/productService';

export const useProducts = (filters?: ProductFilters) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ใช้ mock data ก่อน (เมื่อต่อ database จริงแล้ว จะเปลี่ยนเป็นการเรียก API)
  const fetchProducts = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // ใช้ mock data ก่อน
      let filteredProducts = [...mockProducts];
      
      // Apply filters (จำลองการ filter)
      if (filters) {
        if (filters.category) {
          filteredProducts = filteredProducts.filter(p => p.category === filters.category);
        }
        if (filters.tag) {
          filteredProducts = filteredProducts.filter(p => p.tag === filters.tag);
        }
        if (filters.search) {
          filteredProducts = filteredProducts.filter(p => 
            p.name.toLowerCase().includes(filters.search!.toLowerCase()) ||
            p.description?.toLowerCase().includes(filters.search!.toLowerCase())
          );
        }
        if (filters.inStock !== undefined) {
          filteredProducts = filteredProducts.filter(p => p.inStock === filters.inStock);
        }
      }

      setProducts(filteredProducts);

      // เมื่อต่อ database จริงแล้ว จะใช้โค้ดด้านล่างแทน
      // const response = await productAPI.getProducts(filters);
      // setProducts(response.products);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch products');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [filters?.category, filters?.tag, filters?.search, filters?.inStock]);

  return {
    products,
    isLoading,
    error,
    refetch: fetchProducts
  };
};

// Hook สำหรับ single product
export const useProduct = (id: number) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProduct = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // ใช้ mock data ก่อน
      await new Promise(resolve => setTimeout(resolve, 300));
      const foundProduct = mockProducts.find(p => p.id === id);
      
      if (!foundProduct) {
        throw new Error('Product not found');
      }
      
      setProduct(foundProduct);

      // เมื่อต่อ database จริงแล้ว จะใช้โค้ดด้านล่างแทน
      // const product = await productAPI.getProductById(id);
      // setProduct(product);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch product');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  return {
    product,
    isLoading,
    error,
    refetch: fetchProduct
  };
};