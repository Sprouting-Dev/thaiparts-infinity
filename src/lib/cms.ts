// /src/lib/cms.ts
import { strapiFetch } from '@/lib/strapi';

const PREVIEW = 'publicationState=preview';

export type ListParams = {
  page?: number;
  pageSize?: number;
  sort?: string;
  q?: string;
};

export async function fetchLayout() {
  const url =
    `/api/layout` +
    `?populate[image]=*&populate[prefooter_image]=*&populate[banner]=*` +
    `&populate[address]=*&populate[social_media]=*&${PREVIEW}`;
  const json = await strapiFetch<any>(url, {}, 300);
  return json?.data?.attributes ?? null;
}

export async function fetchHome() {
  // Request deep population for Home to ensure nested relations and
  // content blocks (title/description, products, services, articles)
  // are included. Some Strapi installations omit nested relations in
  // selective populate calls; using `populate=deep` here keeps the
  // frontend deterministic when rendering the homepage sections.
  // If key collections come back empty, do a supplemental fetch with
  // `populate=*` which returns all relations — this acts as a robust
  // fallback for installations where `deep` isn't returning everything.
  const url = `/api/home?populate=deep&${PREVIEW}`;
  const json = await strapiFetch<any>(url, {}, 300);
  let attrs = json?.data?.attributes ?? null;

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
      const altJson = await strapiFetch<any>(altUrl, {}, 300);
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
        !attrs.articles.data[0]?.attributes?.image?.data &&
        !attrs.articles.data[0]?.attributes?.image?.url;
      const needsProductImages =
        !!attrs?.products?.data &&
        attrs.products.data.length > 0 &&
        !attrs.products.data[0]?.attributes?.image?.data &&
        !attrs.products.data[0]?.attributes?.image?.url &&
        !attrs.products.data[0]?.attributes?.thumbnail?.data &&
        !attrs.products.data[0]?.attributes?.thumbnail?.url;
      const needsServiceImages =
        !!attrs?.services?.data &&
        attrs.services.data.length > 0 &&
        !attrs.services.data[0]?.attributes?.image?.data &&
        !attrs.services.data[0]?.attributes?.image?.url;

      if (needsArticleImages || needsProductImages || needsServiceImages) {
        const parts: string[] = [];
        if (needsArticleImages)
          parts.push('populate[articles][populate]=image');
        if (needsProductImages)
          parts.push('populate[products][populate]=image,thumbnail');
        if (needsServiceImages)
          parts.push('populate[services][populate]=image');

        if (parts.length > 0) {
          const targetedUrl = `/api/home?${parts.join('&')}&${PREVIEW}`;
          const targetedJson = await strapiFetch<any>(targetedUrl, {}, 300);
          const targetedAttrs = targetedJson?.data?.attributes ?? null;
          if (targetedAttrs) {
            // Merge only the collections we requested so we don't accidentally
            // overwrite other parts of the attrs object.
            if (targetedAttrs.articles) attrs.articles = targetedAttrs.articles;
            if (targetedAttrs.products) attrs.products = targetedAttrs.products;
            if (targetedAttrs.services) attrs.services = targetedAttrs.services;
          }
        }
      }
    } catch (e) {
      // ignore targeted population failures; keep original attrs
    }
  } catch (e) {
    // non-fatal: fall back to whatever we received originally
  }

  return attrs;
}

export async function fetchPageBySlug(slug: string) {
  // First, try the list-style query with deep populate (keeps control over
  // response shape). Some Strapi setups omit large media relations in list
  // endpoints, so we do a lightweight supplemental fetch by id when the
  // hero_image relation is missing.
  const url = `/api/pages?filters[slug][$eq]=${encodeURIComponent(
    slug
  )}&populate=deep&${PREVIEW}`;
  const json = await strapiFetch<any>(url, {}, 300);
  const item = json?.data?.[0];
  if (!item) return null;

  const attributes = item.attributes ?? {};
  // If hero_image wasn't returned in the list endpoint, fetch the single
  // item with the media relation populated to ensure callers receive it.
  if (!attributes.hero_image) {
    try {
      const singlePath = `/api/pages/${item.id}?populate=hero_image&${PREVIEW}`;
      const singleJson = await strapiFetch<any>(singlePath, {}, 300);
      const singleData = singleJson?.data;
      const singleAttrs = singleData?.attributes ?? null;
      if (singleAttrs && singleAttrs.hero_image) {
        return {
          id: item.id,
          ...attributes,
          hero_image: singleAttrs.hero_image,
        };
      }
    } catch (e) {
      // ignore supplemental fetch errors and fall back to list attributes
    }
  }

  return { id: item.id, ...attributes };
}

export async function fetchArticles(params: ListParams = {}) {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 12;
  const sort = params.sort ?? 'publishedAt:desc';
  const url =
    `/api/articles?populate[image]=*&pagination[page]=${page}` +
    `&pagination[pageSize]=${pageSize}&sort=${encodeURIComponent(sort)}&${PREVIEW}`;
  const json = await strapiFetch<any>(url, {}, 180);
  return { items: json?.data ?? [], meta: json?.meta ?? {} };
}

export async function fetchArticleBySlug(slug: string) {
  const url = `/api/articles?filters[slug][$eq]=${encodeURIComponent(
    slug
  )}&populate=deep&${PREVIEW}`;
  const json = await strapiFetch<any>(url, {}, 300);
  const item = json?.data?.[0];
  return item ? { id: item.id, ...item.attributes } : null;
}

export async function fetchProducts(params: ListParams = {}) {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 12;
  const sort = params.sort ?? 'publishedAt:desc';
  const url =
    `/api/products?populate[image]=*&pagination[page]=${page}` +
    `&pagination[pageSize]=${pageSize}&sort=${encodeURIComponent(sort)}&${PREVIEW}`;
  const json = await strapiFetch<any>(url, {}, 180);
  return { items: json?.data ?? [], meta: json?.meta ?? {} };
}

export async function fetchProductBySlug(slug: string) {
  const url = `/api/products?filters[slug][$eq]=${encodeURIComponent(
    slug
  )}&populate=deep&${PREVIEW}`;
  const json = await strapiFetch<any>(url, {}, 300);
  const item = json?.data?.[0];
  return item ? { id: item.id, ...item.attributes } : null;
}

export async function fetchServices(params: ListParams = {}) {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 12;
  const sort = params.sort ?? 'publishedAt:desc';
  const url =
    `/api/services?populate[image]=*&pagination[page]=${page}` +
    `&pagination[pageSize]=${pageSize}&sort=${encodeURIComponent(sort)}&${PREVIEW}`;
  const json = await strapiFetch<any>(url, {}, 180);
  return { items: json?.data ?? [], meta: json?.meta ?? {} };
}

export async function fetchServiceBySlug(slug: string) {
  const url = `/api/services?filters[slug][$eq]=${encodeURIComponent(
    slug
  )}&populate=deep&${PREVIEW}`;
  const json = await strapiFetch<any>(url, {}, 300);
  const item = json?.data?.[0];
  return item ? { id: item.id, ...item.attributes } : null;
}
