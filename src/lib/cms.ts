// /src/lib/cms.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import { strapiFetch } from '@/lib/strapi';
import { sanitizeHtml } from '@/lib/sanitize';
import type {
  ListParams as CmsListParams,
  PageAttributes,
  LayoutAttributes,
  HomeAttributes,
  ArticleAttributes,
  ProductAttributes,
} from '@/types/cms';

const PREVIEW = 'publicationState=preview';

export type ListParams = CmsListParams;

export async function fetchLayout(): Promise<LayoutAttributes | null> {
  const url =
    `/api/layout` +
    `?populate[image]=*&populate[prefooter_image]=*&populate[banner]=*` +
    `&populate[address]=*&populate[social_media]=*&${PREVIEW}`;
  const json = await strapiFetch<{ data?: { attributes?: LayoutAttributes } }>(
    url,
    {},
    300
  );
  const attrs = json?.data?.attributes ?? null;
  if (attrs) {
    // Normalize contact/address shape: Strapi schema contains a typo `adddress`.
    try {
      const addr = (attrs as any).address || (attrs as any).adddress || null;
      if (addr && typeof addr === 'object') {
        const normalized = { ...(addr as any) } as any;
        normalized.address =
          (addr as any).adddress ??
          (addr as any).address ??
          (addr as any).address_text ??
          '';
        // replace address component with normalized shape
        (attrs as any).address = normalized;
      }
    } catch {
      // non-fatal
    }

    // Sanitize rich HTML fields in layout (quote, etc.)
    try {
      const a = attrs as any;
      if (typeof a.quote === 'string') a.quote = sanitizeHtml(a.quote);
    } catch {}
  }

  return attrs;
}

export async function fetchHome(): Promise<HomeAttributes | null> {
  // Request deep population for Home to ensure nested relations and
  // content blocks (title/description, products, services, articles)
  // are included. Some Strapi installations omit nested relations in
  // selective populate calls; using `populate=deep` here keeps the
  // frontend deterministic when rendering the homepage sections.
  // If key collections come back empty, do a supplemental fetch with
  // `populate=*` which returns all relations — this acts as a robust
  // fallback for installations where `deep` isn't returning everything.
  const url = `/api/home?populate=deep&${PREVIEW}`;
  const json = await strapiFetch<{ data?: { attributes?: HomeAttributes } }>(
    url,
    {},
    300
  );
  let attrs: HomeAttributes | null = json?.data?.attributes ?? null;

  // If core lists are missing or empty, attempt a more aggressive
  // population using `populate=*` and merge that result.
  try {
    const emptyArticles =
      !attrs?.articles?.data || attrs.articles.data.length === 0;
    const emptyProducts =
      !attrs?.products?.data || attrs.products.data.length === 0;
    const emptyServices =
      !attrs?.services?.data || attrs.services.data.length === 0;
    const missingShared =
      !attrs?.SharedTitleWithDescriptionComponent &&
      !attrs?.sharedTitleWithDescriptionComponent &&
      !attrs?.shared_title_with_description_component;

    if (
      attrs &&
      (emptyArticles || emptyProducts || emptyServices || missingShared)
    ) {
      const altUrl = `/api/home?populate=*&${PREVIEW}`;
      const altJson = await strapiFetch<{
        data?: { attributes?: HomeAttributes };
      }>(altUrl, {}, 300);
      const altAttrs = altJson?.data?.attributes ?? null;
      if (altAttrs) attrs = altAttrs;
    }
    // If images are present in the lists but the media relation itself is missing
    // (common when list endpoints return only IDs), perform a targeted populate
    // for the nested media fields to avoid missing thumbnails on the homepage.
    // We'll only request the specific nested media fields we need to keep the
    // response small compared to `populate=*`.
    try {
      const needsArticleImages =
        !!attrs?.articles?.data &&
        attrs.articles.data.length > 0 &&
        (() => {
          const first = attrs.articles.data[0];
          const attr = (first?.attributes ?? {}) as Record<string, unknown>;
          const img = attr['image'] as Record<string, unknown> | undefined;
          return !(
            img &&
            (img['data'] !== undefined || typeof img['url'] === 'string')
          );
        })();

      const needsProductImages =
        !!attrs?.products?.data &&
        attrs.products.data.length > 0 &&
        (() => {
          const first = attrs.products.data[0];
          const attr = (first?.attributes ?? {}) as Record<string, unknown>;
          const img = attr['image'] as Record<string, unknown> | undefined;
          const thumb = attr['thumbnail'] as
            | Record<string, unknown>
            | undefined;
          const hasImg =
            img &&
            (img['data'] !== undefined || typeof img['url'] === 'string');
          const hasThumb =
            thumb &&
            (thumb['data'] !== undefined || typeof thumb['url'] === 'string');
          return !(hasImg || hasThumb);
        })();

      const needsServiceImages =
        !!attrs?.services?.data &&
        attrs.services.data.length > 0 &&
        (() => {
          const first = attrs.services.data[0];
          const attr = (first?.attributes ?? {}) as Record<string, unknown>;
          const img = attr['image'] as Record<string, unknown> | undefined;
          const cov = attr['cover_image'] as
            | Record<string, unknown>
            | undefined;
          // consider service images present if either image or cover_image provide media
          const hasImg =
            img &&
            (img['data'] !== undefined || typeof img['url'] === 'string');
          const hasCov =
            cov &&
            (cov['data'] !== undefined || typeof cov['url'] === 'string');
          return !(hasImg || hasCov);
        })();

      if (needsArticleImages || needsProductImages || needsServiceImages) {
        const parts: string[] = [];
        if (needsArticleImages)
          parts.push('populate[articles][populate]=image');
        if (needsProductImages)
          parts.push('populate[products][populate]=image,thumbnail');
        if (needsServiceImages)
          parts.push('populate[services][populate]=cover_image');

        if (parts.length > 0) {
          const targetedUrl = `/api/home?${parts.join('&')}&${PREVIEW}`;
          const targetedJson = await strapiFetch<{
            data?: { attributes?: HomeAttributes };
          }>(targetedUrl, {}, 300);
          const targetedAttrs = targetedJson?.data?.attributes ?? null;
          if (targetedAttrs) {
            // Merge only the collections we requested so we don't accidentally
            // overwrite other parts of the attrs object.
            if (attrs) {
              if (targetedAttrs.articles)
                attrs.articles = targetedAttrs.articles;
              if (targetedAttrs.products)
                attrs.products = targetedAttrs.products;
              if (targetedAttrs.services)
                attrs.services = targetedAttrs.services;
            }
          }
        }
      }
    } catch {
      // ignore targeted population failures; keep original attrs
    }
  } catch {
    // non-fatal: fall back to whatever we received originally
  }

  // Sanitize content-rich fields in home attributes
  if (attrs) {
    try {
      const sanitizeRec = (o: any): any => {
        if (!o || typeof o !== 'object') return o;
        if (Array.isArray(o)) return o.map(sanitizeRec);
        const out: any = {};
        for (const k of Object.keys(o)) {
          const v = (o as any)[k];
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
      };
      attrs = sanitizeRec(attrs) as HomeAttributes;
    } catch {
      // ignore sanitize errors
    }
  }

  return attrs;
}

export async function fetchPageBySlug(
  slug: string
): Promise<(PageAttributes & { id?: number }) | null> {
  // First, try the list-style query with deep populate (keeps control over
  // response shape). Some Strapi setups omit large media relations in list
  // endpoints, so we do a lightweight supplemental fetch by id when the
  // hero_image relation is missing.
  const url = `/api/pages?filters[slug][$eq]=${encodeURIComponent(
    slug
  )}&populate=deep&${PREVIEW}`;
  const json = await strapiFetch<{
    data?: Array<{ id?: number; attributes?: PageAttributes }>;
  }>(url, {}, 300);
  const item = json?.data?.[0];
  if (!item) return null;

  const attributes = item.attributes ?? {};
  // If hero_image wasn't returned in the list endpoint, fetch the single
  // item with the media relation populated to ensure callers receive it.
  if (!attributes.hero_image) {
    try {
      const singlePath = `/api/pages/${item.id}?populate=hero_image&${PREVIEW}`;
      const singleJson = await strapiFetch<{
        data?: { attributes?: PageAttributes };
      }>(singlePath, {}, 300);
      const singleData = singleJson?.data;
      const singleAttrs = singleData?.attributes ?? null;
      if (singleAttrs && singleAttrs.hero_image) {
        const merged = {
          id: item.id,
          ...attributes,
          hero_image: singleAttrs.hero_image,
        } as any;
        // sanitize known rich fields
        try {
          if (typeof merged.quote === 'string')
            merged.quote = sanitizeHtml(merged.quote);
          if (typeof merged.description === 'string')
            merged.description = sanitizeHtml(merged.description);
        } catch {}
        return merged as PageAttributes & { id?: number };
      }
    } catch {
      // ignore supplemental fetch errors and fall back to list attributes
    }
  }

  // sanitize attributes before returning
  try {
    const a: any = { id: item.id, ...attributes };
    if (typeof a.quote === 'string') a.quote = sanitizeHtml(a.quote);
    if (typeof a.description === 'string')
      a.description = sanitizeHtml(a.description);
    return a as PageAttributes & { id?: number };
  } catch {
    return { id: item.id, ...attributes } as PageAttributes & { id?: number };
  }
}

export async function fetchArticles(params: ListParams = {}) {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 12;
  const sort = params.sort ?? 'publishedAt:desc';
  const url =
    `/api/articles?populate[image]=*&pagination[page]=${page}` +
    `&pagination[pageSize]=${pageSize}&sort=${encodeURIComponent(sort)}&${PREVIEW}`;
  const json = await strapiFetch<{
    data?: Array<{ id?: number; attributes?: ArticleAttributes }>;
    meta?: unknown;
  }>(url, {}, 180);
  return { items: json?.data ?? [], meta: json?.meta ?? {} };
}

export async function fetchArticleBySlug(slug: string) {
  const url = `/api/articles?filters[slug][$eq]=${encodeURIComponent(
    slug
  )}&populate=deep&${PREVIEW}`;
  const json = await strapiFetch<{
    data?: Array<{ id?: number; attributes?: ArticleAttributes }>;
  }>(url, {}, 300);
  const item = json?.data?.[0];
  if (!item) return null;
  // attributes is unknown - sanitize known rich fields before returning
  // Use a mutable `let` so we can merge supplemental single-item fetch
  // results into the same variable when list endpoints omit dynamic zones.
  let attrs: any = item.attributes ?? null;
  // If the list-style deep populate didn't include the dynamic zone `content`,
  // request only the `content` dynamic zone for the single item. This keeps the
  // fallback minimal and avoids fetching unrelated fields.
  try {
    // If the list response omitted the dynamic zone or the article image,
    // request only the article image and the content block images. This
    // keeps the request small but ensures the <Image/> components have
    // the media objects they need.
    const needContent = !attrs || attrs['content'] == null;
    const needArticleImage =
      !attrs ||
      !attrs['image'] ||
      (typeof attrs['image'] === 'object' &&
        attrs['image'] != null &&
        (attrs['image'] as any)['data'] === undefined &&
        typeof (attrs['image'] as any)['url'] !== 'string');

    if (needContent || needArticleImage) {
      try {
        const targeted = `/api/articles/${item.id}?populate[image]=*&populate[content][populate]=image&${PREVIEW}`;
        const targJson = await strapiFetch<{ data?: { attributes?: unknown } }>(
          targeted,
          {},
          300
        );
        const targAttrs = (targJson?.data?.attributes ?? null) as any;
        if (targAttrs) {
          // Merge only keys we requested to avoid overwriting unrelated fields
          const merged = { ...(attrs ?? {}) } as any;
          if (targAttrs['image'] != null) merged['image'] = targAttrs['image'];
          if (targAttrs['content'] != null)
            merged['content'] = targAttrs['content'];
          attrs = merged;
        }
      } catch {
        // ignore targeted fetch failures
      }
    }
  } catch {
    // ignore
  }
  try {
    if (attrs && typeof attrs === 'object') {
      const a: any = { ...attrs };
      if (typeof a.title === 'string') a.title = a.title;
      if (typeof a.subtitle === 'string') a.subtitle = a.subtitle;
      // If content is a string (simple rich text) sanitize it. If it's
      // a dynamic zone array, normalize each block: unwrap `data` wrappers,
      // sanitize nested rich fields and normalize image shapes.
      if (typeof a.content === 'string') {
        a.content = sanitizeHtml(a.content);
      } else if (Array.isArray(a.content)) {
        try {
          a.content = a.content.map((blk: any) => {
            const block = (blk && (blk['data'] ?? blk)) || blk;
            if (!block || typeof block !== 'object') return block;
            // sanitize common rich fields
            try {
              if (typeof block.content === 'string')
                block.content = sanitizeHtml(block.content);
            } catch {}
            try {
              if (typeof block.description === 'string')
                block.description = sanitizeHtml(block.description);
            } catch {}
            // normalize image wrapper if present (leave as-is if absent)
            try {
              if (block.image) {
                const raw = block.image;
                // if wrapped as { data: {...} } unwrap to the inner object
                block.image = (raw['data'] ?? raw) || raw;
              }
            } catch {}
            return block;
          });
        } catch {
          // fallback: leave content as-is
        }
      }
      if (typeof a.description === 'string')
        a.description = sanitizeHtml(a.description);
      return { id: item.id, attributes: a } as {
        id?: number;
        attributes?: unknown;
      };
    }
  } catch {
    // ignore
  }
  return { id: item.id, attributes: attrs } as {
    id?: number;
    attributes?: unknown;
  };
}

export async function fetchProducts(params: ListParams = {}) {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 12;
  const sort = params.sort ?? 'publishedAt:desc';
  const url =
    `/api/products?populate[image]=*&pagination[page]=${page}` +
    `&pagination[pageSize]=${pageSize}&sort=${encodeURIComponent(sort)}&${PREVIEW}`;
  const json = await strapiFetch<{
    data?: Array<{ id?: number; attributes?: ProductAttributes }>;
    meta?: unknown;
  }>(url, {}, 180);
  return { items: json?.data ?? [], meta: json?.meta ?? {} };
}

export async function fetchProductBySlug(slug: string) {
  const url = `/api/products?filters[slug][$eq]=${encodeURIComponent(
    slug
  )}&populate=deep&${PREVIEW}`;
  const json = await strapiFetch<{
    data?: Array<{ id?: number; attributes?: ProductAttributes }>;
  }>(url, {}, 300);
  const item = json?.data?.[0];
  if (!item) return null;
  const attrs = item.attributes ?? null;
  try {
    if (attrs && typeof attrs === 'object') {
      const a: any = { ...attrs };
      if (typeof a.description === 'string')
        a.description = sanitizeHtml(a.description);
      return { id: item.id, attributes: a } as {
        id?: number;
        attributes?: ProductAttributes | null;
      };
    }
  } catch {}
  return { id: item.id, attributes: attrs } as {
    id?: number;
    attributes?: ProductAttributes | null;
  };
}

export async function fetchServices(params: ListParams = {}) {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 12;
  const sort = params.sort ?? 'publishedAt:desc';
  // Request cover_image population (new field) and legacy image for backward compatibility
  const url =
    `/api/services?populate[cover_image]=*&populate[image]=*&pagination[page]=${page}` +
    `&pagination[pageSize]=${pageSize}&sort=${encodeURIComponent(sort)}&${PREVIEW}`;
  const json = await strapiFetch<{
    data?: Array<{ id?: number; attributes?: unknown }>;
    meta?: unknown;
  }>(url, {}, 180);
  return { items: json?.data ?? [], meta: json?.meta ?? {} };
}

export async function fetchServiceBySlug(slug: string) {
  const url = `/api/services?filters[slug][$eq]=${encodeURIComponent(
    slug
  )}&populate=deep&${PREVIEW}`;
  const json = await strapiFetch<{
    data?: Array<{ id?: number; attributes?: unknown }>;
  }>(url, {}, 300);
  const item = json?.data?.[0];
  if (!item) return null;
  const attrs = item.attributes ?? null;
  try {
    if (attrs && typeof attrs === 'object') {
      const a: any = { ...attrs };

      // sanitize simple rich fields
      if (typeof a.content === 'string') a.content = sanitizeHtml(a.content);
      if (typeof a.description === 'string')
        a.description = sanitizeHtml(a.description);

      // Normalize cover_image (multiple media) into an array of media meta
      try {
        const rawCover = a.cover_image ?? null;
        if (rawCover) {
          const arr: Array<any> = [];
          if (Array.isArray(rawCover)) {
            for (const r of rawCover) {
              const mm = (r && (r['data'] ?? r)) || r;
              // use existing helpers in other layers to extract media; here keep minimal shape
              const url = mm?.attributes?.url ?? mm?.url ?? null;
              if (url)
                arr.push({
                  url,
                  alt:
                    mm?.attributes?.alternativeText ??
                    mm?.alternativeText ??
                    '',
                });
            }
          } else {
            const mm = (rawCover['data'] ?? rawCover) || rawCover;
            const url = mm?.attributes?.url ?? mm?.url ?? null;
            if (url)
              arr.push({
                url,
                alt:
                  mm?.attributes?.alternativeText ?? mm?.alternativeText ?? '',
              });
          }
          a.cover_image = arr;
        }
      } catch {
        // non-fatal
      }

      // Sanitize components that may include rich HTML
      try {
        if (Array.isArray(a.safety_and_standard)) {
          a.safety_and_standard = a.safety_and_standard.map((s: any) => {
            try {
              if (s && typeof s === 'object') {
                if (typeof s.title === 'string') s.title = s.title;
                if (typeof s.description === 'string')
                  s.description = sanitizeHtml(s.description);
              }
            } catch {}
            return s;
          });
        }
      } catch {}

      try {
        if (Array.isArray(a.case_study)) {
          a.case_study = a.case_study.map((c: any) => {
            try {
              const copy = { ...c };
              if (
                copy &&
                copy.case_study_detail &&
                typeof copy.case_study_detail === 'string'
              ) {
                copy.case_study_detail = sanitizeHtml(copy.case_study_detail);
              }
              // normalize cover_image inside case study if present
              if (copy.cover_image) {
                const ci = [];
                const raw = copy.cover_image;
                if (Array.isArray(raw)) {
                  for (const r of raw) {
                    const mm = (r['data'] ?? r) || r;
                    const url = mm?.attributes?.url ?? mm?.url ?? null;
                    if (url)
                      ci.push({
                        url,
                        alt: mm?.attributes?.alternativeText ?? '',
                      });
                  }
                }
                copy.cover_image = ci;
              }
              return copy;
            } catch {
              return c;
            }
          });
        }
      } catch {}

      try {
        if (Array.isArray(a.customer_receive)) {
          a.customer_receive = a.customer_receive.map((cr: any) => {
            try {
              if (cr && typeof cr === 'object' && typeof cr.title === 'string')
                cr.title = cr.title;
            } catch {}
            return cr;
          });
        }
      } catch {}

      try {
        if (Array.isArray(a.architectural_example)) {
          a.architectural_example = a.architectural_example.map((ae: any) => {
            try {
              if (
                ae &&
                typeof ae === 'object' &&
                typeof ae.article === 'string'
              )
                ae.article = sanitizeHtml(ae.article);
            } catch {}
            return ae;
          });
        }
      } catch {}

      try {
        if (Array.isArray(a.technology)) {
          a.technology = a.technology.map((t: any) => t);
        }
      } catch {}

      try {
        if (Array.isArray(a.features)) {
          a.features = a.features.map((f: any) => f);
        }
      } catch {}

      // Normalize SEO key casing: support SEO, sharedSeo, seo
      try {
        if (!a.seo && !a.sharedSeo && a.SEO) {
          a.seo = a.SEO;
        }
        if (!a.seo && a.sharedSeo) a.seo = a.sharedSeo;
      } catch {}

      return { id: item.id, attributes: a } as {
        id?: number;
        attributes?: unknown;
      };
    }
  } catch {}
  return { id: item.id, attributes: attrs } as {
    id?: number;
    attributes?: unknown;
  };
}
