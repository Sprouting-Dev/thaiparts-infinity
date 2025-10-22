export interface Product {
  id: number;
  name: string;
  main_title?: string;
  slug?: string;
  tag: string;
  image: string;
  description?: string;
  category?: string;
  price?: number;
  inStock?: boolean;
  specifications?: Record<string, string | number | boolean>;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductCategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
  color?: string;
}

export interface ProductsResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface ProductFilters {
  category?: string;
  tag?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
}