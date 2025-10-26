// Type definitions for Strapi Page hero schema used by the Hero component.
// Keep this file minimal and defensive since Strapi shapes may vary.

export type StrapiMediaData = {
  id?: number | string;
  attributes?: {
    url?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
};

export type StrapiMedia =
  | string
  | { url?: string }
  | { attributes?: { url?: string } }
  | { data?: StrapiMediaData | StrapiMediaData[] }
  | null
  | undefined;

export type StrapiEntity<T = Record<string, unknown>> = {
  id?: number | string;
  attributes?: T;
};

export type StrapiCollection<T = Record<string, unknown>> = {
  data: Array<StrapiEntity<T>>;
  meta?: Record<string, unknown>;
};

export type StrapiSingle<T = Record<string, unknown>> = {
  data: StrapiEntity<T> | null;
  meta?: Record<string, unknown>;
};

// Default export is the PageHeroSchema interface so callers can import the
// type as the module default (import type PageHeroSchema from '@/types/page').
export default interface PageHeroSchema {
  hero_image?: StrapiMedia;
  quote?: string | null; // rich text / HTML from CKEditor
  button_1?: string | null;
  button_2?: string | null;
  isShowButton?: boolean | null;
  slug?: string | null;
  seo?: Record<string, unknown> | null;
  [key: string]: unknown;
}
