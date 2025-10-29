export interface Product {
  id: number;
  name: string;
  tag: string;
  image: string;
  description?: string;
  category?: string;
  price?: number;
  inStock?: boolean;
  specifications?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
  slug?: string; // strapi slug for routing
  mainTitle?: string; // original main_title from Strapi (display on detail page)
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