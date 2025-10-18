'use client';

import { useState, useEffect } from 'react';
import { Product, ProductFilters } from '@/types/product';
import { productAPI } from '@/services/productService';

export const useProducts = (filters?: ProductFilters) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await productAPI.getProducts(filters);
      setProducts(response.products);
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

export const useProduct = (id: number) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProduct = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const product = await productAPI.getProductById(id);
      setProduct(product);
      
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