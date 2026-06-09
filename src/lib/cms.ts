/* eslint-disable @typescript-eslint/no-explicit-any */
import { sanitizeHtml } from '@/lib/sanitize';
import { readContent, readContentDir } from '@/lib/content';
import type {
  ListParams as CmsListParams,
  PageAttributes,
  LayoutAttributes,
  HomeAttributes,
  ArticleAttributes,
  ProductAttributes,
} from '@/types/cms';

export type ListParams = CmsListParams;

/**
 * Static CMS layer.
 *
 * These functions used to fetch from Strapi at runtime. They now read the
 * pre-exported JSON in `content/` (Strapi REST shape) at build time, so the
 * existing renderers, `mediaUrl()` resolution and SEO helpers keep working
 * unchanged while the site is fully static.
 */

type StrapiItem<T> = { id?: number; attributes?: T };
type StrapiSingle<T> = { data?: StrapiItem<T> | null } | null;
type StrapiList<T> = {
  data?: Array<StrapiItem<T>>;
  meta?: unknown;
} | null;

function sortItems<T>(items: Array<StrapiItem<T>>, sort?: string) {
  if (!sort) return items;
  const [field, dir] = sort.split(':');
  const mult = (dir ?? 'desc').toLowerCase() === 'asc' ? 1 : -1;
  return [...items].sort((a, b) => {
    const av = (a.attributes as any)?.[field];
    const bv = (b.attributes as any)?.[field];
    if (av == null && bv == null) return 0;
    if (av == null) return 1;
    if (bv == null) return -1;
    if (av < bv) return -1 * mult;
    if (av > bv) return 1 * mult;
    return 0;
  });
}

function paginate<T>(items: Array<StrapiItem<T>>, params: ListParams) {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 12;
  const total = items.length;
  const start = (page - 1) * pageSize;
  const slice = items.slice(start, start + pageSize);
  return {
    items: slice,
    meta: {
      pagination: {
        page,
        pageSize,
        total,
        pageCount: Math.max(1, Math.ceil(total / pageSize)),
      },
    },
  };
}

export async function fetchLayout(): Promise<LayoutAttributes | null> {
  const json = readContent<StrapiSingle<LayoutAttributes>>('layout.json');
  const attrs = (json?.data?.attributes ?? null) as any;
  if (attrs) {
    // Normalize contact/address shape: Strapi schema contains a typo `adddress`.
    try {
      const addr = attrs.address || attrs.adddress || null;
      if (addr && typeof addr === 'object') {
        const normalized = { ...(addr as any) } as any;
        normalized.address =
          addr.adddress ?? addr.address ?? addr.address_text ?? '';
        attrs.address = normalized;
      }
    } catch {
      // non-fatal
    }
    try {
      if (typeof attrs.quote === 'string') attrs.quote = sanitizeHtml(attrs.quote);
    } catch {}
  }
  return attrs;
}

function sanitizeRec(o: any): any {
  if (!o || typeof o !== 'object') return o;
  if (Array.isArray(o)) return o.map(sanitizeRec);
  const out: any = {};
  for (const k of Object.keys(o)) {
    const v = o[k];
    if (v == null) {
      out[k] = v;
      continue;
    }
    if (
      typeof v === 'string' &&
      /(^|_)?(content|description|quote|body|html)$/i.test(k)
    ) {
      out[k] = sanitizeHtml(v);
    } else if (typeof v === 'object') {
      out[k] = sanitizeRec(v);
    } else out[k] = v;
  }
  return out;
}

export async function fetchHome(): Promise<HomeAttributes | null> {
  const json = readContent<StrapiSingle<HomeAttributes>>('home.json');
  let attrs: any = json?.data?.attributes ?? null;
  if (attrs) {
    try {
      attrs = sanitizeRec(attrs) as HomeAttributes;
    } catch {
      // ignore sanitize errors
    }
  }
  return attrs;
}

export async function fetchAbout(): Promise<unknown> {
  // Returns the raw `{ data: { attributes } }` shape the about page expects.
  return readContent<unknown>('about.json');
}

export async function fetchPageBySlug(
  slug: string
): Promise<(PageAttributes & { id?: number }) | null> {
  const json = readContent<StrapiList<PageAttributes>>('pages.json');
  const item = json?.data?.find(
    (p) => (p.attributes as any)?.slug === slug
  );
  if (!item) return null;
  const a: any = { id: item.id, ...(item.attributes as any) };
  try {
    if (typeof a.quote === 'string') a.quote = sanitizeHtml(a.quote);
  } catch {}
  try {
    if (typeof a.description === 'string')
      a.description = sanitizeHtml(a.description);
  } catch {}
  return a as PageAttributes & { id?: number };
}

export async function fetchArticles(params: ListParams = {}) {
  const json = readContent<StrapiList<ArticleAttributes>>('articles.json');
  const items = sortItems(
    json?.data ?? [],
    params.sort ?? 'publishedAt:desc'
  );
  return paginate(items, params);
}

export async function fetchArticleBySlug(slug: string) {
  const json = readContent<StrapiList<ArticleAttributes>>('articles.json');
  const item = json?.data?.find((a) => (a.attributes as any)?.slug === slug);
  if (!item) return null;
  return { id: item.id, attributes: item.attributes };
}

// Products are stored one-file-per-item under content/products/ (Decap folder
// collection). Each file is flat; we wrap it back into the { id, attributes }
// shape the existing product components/`mediaUrl` consume.
type ProductFile = {
  title?: string;
  main_title?: string;
  slug?: string;
  tag?: string;
  category?: string;
  description?: string;
  image?: string;
  order?: number;
};

function productItems(): Array<StrapiItem<ProductAttributes>> {
  return readContentDir<ProductFile>('products')
    .slice()
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map(
      (f) =>
        ({
          id: f.order,
          attributes: {
            title: f.title,
            main_title: f.main_title,
            slug: f.slug,
            tag: f.tag,
            category: f.category,
            description: f.description,
            image: f.image,
          },
        }) as StrapiItem<ProductAttributes>
    );
}

export async function fetchProducts(params: ListParams = {}) {
  const items = sortItems(productItems(), params.sort);
  return paginate(items, params);
}

export async function fetchProductBySlug(slug: string) {
  const item = productItems().find((p) => (p.attributes as any)?.slug === slug);
  if (!item) return null;
  const a: any = { ...(item.attributes as any) };
  try {
    if (typeof a.description === 'string')
      a.description = sanitizeHtml(a.description);
  } catch {}
  return { id: item.id, attributes: a };
}

export async function fetchServices(params: ListParams = {}) {
  const json = readContent<StrapiList<unknown>>('services.json');
  const items = sortItems(json?.data ?? [], params.sort);
  return paginate(items, params);
}

export async function fetchServiceBySlug(slug: string) {
  const json = readContent<StrapiList<any>>('services.json');
  const item = json?.data?.find((s) => (s.attributes as any)?.slug === slug);
  if (!item) return null;
  return { id: item.id, attributes: item.attributes };
}

/** Slug helpers for `generateStaticParams()` on dynamic routes. */
export function allProductSlugs(): string[] {
  return readContentDir<ProductFile>('products')
    .map((f) => f.slug as string)
    .filter(Boolean);
}

export function allArticleSlugs(): string[] {
  const json = readContent<StrapiList<ArticleAttributes>>('articles.json');
  return (json?.data ?? [])
    .map((a) => (a.attributes as any)?.slug as string)
    .filter(Boolean);
}

export function allServiceSlugs(): string[] {
  const json = readContent<StrapiList<unknown>>('services.json');
  return (json?.data ?? [])
    .map((s) => (s.attributes as any)?.slug as string)
    .filter(Boolean);
}
