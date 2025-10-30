// Shared Strapi types used across the frontend
export interface StrapiFileAttributes {
  url: string;
  alternativeText?: string | null;
  caption?: string | null;
  width?: number | null;
  height?: number | null;
  mime?: string | null;
}

export type StrapiData<T> = { id: number; attributes: T };

export interface StrapiSingle<T> {
  data: StrapiData<T> | null;
}

export interface StrapiCollection<T> {
  data: Array<StrapiData<T>>;
}

export type StrapiMediaObject = {
  data: StrapiData<StrapiFileAttributes>;
} | null;

export type PossibleMediaInput =
  | string
  | { url?: string } // slim object
  | StrapiMediaObject
  | Array<StrapiData<StrapiFileAttributes>>
  | null
  | undefined;

export interface StrapiPaginated<T> {
  data?: Array<StrapiData<T>>;
  meta?: unknown;
}
