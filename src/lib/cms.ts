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

// Site settings (footer contact, logo, quote) — flat file edited via Decap.
type LayoutFlat = {
  logo?: string;
  prefooter_image?: string;
  quote?: string;
  button?: string;
  company_name?: string;
  address?: string;
  phone_number_1?: string;
  phone_number_2?: string;
  email?: string;
  map_url?: string;
  social_media?: Array<{ type?: string; url?: string }>;
};

export async function fetchLayout(): Promise<LayoutAttributes | null> {
  const f = readContent<LayoutFlat>('settings/layout.json');
  if (!f) return null;
  let quote = f.quote ?? '';
  try {
    quote = sanitizeHtml(quote);
  } catch {}
  return {
    image: f.logo,
    prefooter_image: f.prefooter_image,
    quote,
    button: f.button,
    address: {
      company_name: f.company_name,
      // keep both keys: Footer reads `adddress` (Strapi typo) then `address`
      adddress: f.address,
      address: f.address,
      phone_number_1: f.phone_number_1,
      phone_number_2: f.phone_number_2,
      email: f.email,
      map_url: f.map_url,
    },
    social_media: f.social_media,
  } as unknown as LayoutAttributes;
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

type AboutFlat = {
  about?: { title?: string; description?: string };
  vision?: { title?: string; description?: string };
  mission?: { title?: string; description?: string };
  team?: { image?: string; description?: string };
  warehouse?: { image?: string; description?: string };
  standards?: string[];
};

export async function fetchAbout(): Promise<unknown> {
  // Map the flat (Decap-edited) about file back to the `{ data: { attributes } }`
  // shape the about page expects.
  const f = readContent<AboutFlat>('settings/about.json');
  if (!f) return null;
  return {
    data: {
      attributes: {
        About: f.about ?? { title: '', description: '' },
        vision: f.vision ?? { title: '', description: '' },
        mission: f.mission ?? { title: '', description: '' },
        Team: { image: f.team?.image, description: f.team?.description },
        Warehouse: {
          image: f.warehouse?.image,
          description: f.warehouse?.description,
        },
        Standards: {
          data: (f.standards ?? []).map((url) => ({ attributes: { url } })),
        },
      },
    },
  };
}

type PageFile = {
  slug?: string;
  quote?: string;
  button_1?: string;
  button_2?: string;
  is_show_button?: boolean;
  hero_image?: string;
  SEO?: unknown;
};

export async function fetchPageBySlug(
  slug: string
): Promise<(PageAttributes & { id?: number }) | null> {
  const f = readContentDir<PageFile>('pages').find((p) => p.slug === slug);
  if (!f) return null;
  const a: any = { id: f.slug, ...f };
  try {
    if (typeof a.quote === 'string') a.quote = sanitizeHtml(a.quote);
  } catch {}
  return a as PageAttributes & { id?: number };
}

// Articles: one file per article under content/articles/ (Decap folder
// collection). `content` is a list of typed blocks ({type:'content'|'image'})
// which we map back to the `__component` shape the article renderer expects.
type ArticleBlock = {
  type?: string;
  content?: string;
  description?: string;
  image?: string;
};
type ArticleFile = {
  title?: string;
  slug?: string;
  subtitle?: string;
  read_time?: number | string | null;
  publishedAt?: string | null;
  image?: string;
  content?: ArticleBlock[];
};

function articleItems(): Array<StrapiItem<ArticleAttributes>> {
  return readContentDir<ArticleFile>('articles').map(
    (f) =>
      ({
        id: f.slug,
        attributes: {
          title: f.title,
          slug: f.slug,
          subtitle: f.subtitle,
          read_time: f.read_time,
          publishedAt: f.publishedAt,
          image: f.image,
        },
      }) as unknown as StrapiItem<ArticleAttributes>
  );
}

function mapArticleBlocks(blocks: ArticleBlock[] = []) {
  return blocks.map((b) =>
    b.type === 'image'
      ? {
          __component: 'shared.image-with-description',
          description: b.description ?? '',
          image: b.image ?? '',
        }
      : { __component: 'shared.content-default', content: b.content ?? '' }
  );
}

export async function fetchArticles(params: ListParams = {}) {
  const items = sortItems(articleItems(), params.sort ?? 'publishedAt:desc');
  return paginate(items, params);
}

export async function fetchArticleBySlug(slug: string) {
  const f = readContentDir<ArticleFile>('articles').find((x) => x.slug === slug);
  if (!f) return null;
  return {
    id: f.slug,
    attributes: {
      title: f.title,
      slug: f.slug,
      subtitle: f.subtitle,
      read_time: f.read_time,
      publishedAt: f.publishedAt,
      image: f.image,
      content: mapArticleBlocks(f.content),
    },
  };
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
  return readContentDir<ArticleFile>('articles')
    .map((f) => f.slug as string)
    .filter(Boolean);
}

export function allServiceSlugs(): string[] {
  const json = readContent<StrapiList<unknown>>('services.json');
  return (json?.data ?? [])
    .map((s) => (s.attributes as any)?.slug as string)
    .filter(Boolean);
}
