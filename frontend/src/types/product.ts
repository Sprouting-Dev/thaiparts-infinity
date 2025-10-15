// Types สำหรับ Product data
export interface Product {
  id: number;
  name: string;
  tag: string;
  image: string;
  description?: string;
  category?: string;
  price?: number;
  inStock?: boolean;
  specifications?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

// Types สำหรับ Product Category
export interface ProductCategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
  color?: string;
}

// API Response types (เตรียมไว้สำหรับต่อ database)
export interface ProductsResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Filter types
export interface ProductFilters {
  category?: string;
  tag?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
}