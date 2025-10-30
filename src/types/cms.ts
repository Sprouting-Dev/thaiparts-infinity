import {
  StrapiFileAttributes,
  StrapiMediaObject,
  StrapiPaginated,
} from './strapi';

// Generic list params used by frontend fetchers
export type ListParams = {
  page?: number;
  pageSize?: number;
  sort?: string;
  q?: string;
};

export interface PageAttributes {
  quote?: string | null;
  hero_image?: StrapiMediaObject | null;
  [key: string]: unknown;
}

export interface AboutTeamWarehouse {
  image?: StrapiMediaObject | null;
  description?: string | null;
}

export interface AboutAttributes {
  // These fields can be a plain object or a Strapi single/collection shape.
  // Use `unknown` so callers must narrow the shape safely.
  About?: unknown;
  vision?: unknown;
  mission?: unknown;
  Team?: AboutTeamWarehouse | null;
  Warehouse?: AboutTeamWarehouse | null;
  Standards?: {
    data?: Array<{ id?: number; attributes?: StrapiFileAttributes }>;
  } | null;
}

export interface LayoutAttributes {
  image?: StrapiMediaObject | null;
  prefooter_image?: StrapiMediaObject | null;
  banner?: unknown;
  address?: unknown;
  social_media?: unknown;
  navbar?: unknown;
  [key: string]: unknown;
}

export interface HomeAttributes {
  articles?: StrapiPaginated<unknown>;
  products?: StrapiPaginated<unknown>;
  services?: StrapiPaginated<unknown>;
  SharedTitleWithDescriptionComponent?: unknown;
  [key: string]: unknown;
}

export interface ArticleAttributes {
  title?: string;
  slug?: string;
  publishedAt?: string;
  image?: StrapiMediaObject | null;
  [key: string]: unknown;
}

export interface ProductAttributes {
  name?: string;
  slug?: string;
  image?: StrapiMediaObject | null;
  thumbnail?: StrapiMediaObject | null;
  [key: string]: unknown;
}
