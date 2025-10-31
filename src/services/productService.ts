import { Product, ProductsResponse, ProductFilters } from '@/types/product';
import { categoryMapping } from '@/lib/categoryMapping';
import { mediaUrl, STRAPI_URL } from '@/lib/strapi';
import { PossibleMediaInput } from '@/types/strapi';

const API_TOKEN = process.env.NEXT_PUBLIC_STRAPI_API_TOKEN;

const getStrapiHeaders = () => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (API_TOKEN) {
    headers['Authorization'] = `Bearer ${API_TOKEN}`;
  }

  return headers;
};

// Utility function สำหรับสร้าง slug ที่ standardized
const generateStandardSlug = (text: string): string => {
  return (
    text
      .toLowerCase()
      .trim()
      // เอา special characters ออก
      .replace(/[^\w\s-]/g, '')
      // เปลี่ยน spaces และ underscores เป็น dashes
      .replace(/[\s_]+/g, '-')
      // เอา multiple dashes ออก
      .replace(/-+/g, '-')
      // เอา leading/trailing dashes ออก
      .replace(/^-+|-+$/g, '')
  );
};

// Validation function สำหรับ slug
const validateSlug = (slug: string): boolean => {
  // Slug ต้องเป็น lowercase, มีแค่ a-z, 0-9, และ dash
  const slugPattern = /^[a-z0-9]+(-[a-z0-9]+)*$/;
  return slugPattern.test(slug) && slug.length >= 3 && slug.length <= 100;
};

interface StrapiProductAttributes {
  title?: string;
  main_title?: string;
  slug?: string;
  tag?: string;
  image?: {
    data?: {
      attributes?: {
        url: string;
      };
    };
  };
  description?: string;
  category?: string;
  specifications?: Record<string, string | number | boolean>;
  createdAt?: string;
  updatedAt?: string;
}

interface StrapiProduct {
  id: number;
  attributes: StrapiProductAttributes;
}

const mapStrapiProduct = (strapiProduct: StrapiProduct): Product => {
  const { id, attributes } = strapiProduct;

  // Prefer centralized resolver which handles Strapi media objects and plain URLs.
  // When CMS image is missing, return an empty string so UI components can
  // render a neutral placeholder instead of pointing to a local file which
  // might mask missing CMS content.
  let imageUrl = '';
  try {
    const maybeImage: PossibleMediaInput =
      attributes.image as unknown as PossibleMediaInput;
    const resolved = mediaUrl(maybeImage);
    if (resolved) imageUrl = resolved;
  } catch {
    // keep imageUrl as empty string on error
  }

  const mainTitle = attributes.main_title || attributes.title || '';

  let slug = attributes.slug;
  if (!slug || !validateSlug(slug)) {
    slug = generateStandardSlug(mainTitle);
  }

  // Normalize tag: Strapi sometimes stores tags as string, sometimes as array or object
  let normalizedTag = '';
  try {
    const attrsRecord = attributes as unknown as Record<string, unknown>;
    const rawTag = attrsRecord['tag'];
    if (typeof rawTag === 'string') normalizedTag = rawTag;
    else if (Array.isArray(rawTag))
      normalizedTag = ((rawTag as unknown[])[0] as string) || '';
    else if (rawTag && typeof rawTag === 'object') {
      const tagObj = rawTag as Record<string, unknown>;
      normalizedTag =
        (tagObj['name'] as string) || (tagObj['title'] as string) || '';
    }
  } catch {
    normalizedTag = '';
  }

  return {
    id: id,
    name: attributes.title || attributes.main_title || '',
    main_title: mainTitle,
    slug: slug,
    tag: normalizedTag || (attributes.tag as string) || '',
    image: imageUrl,
    description: attributes.description || '',
    category: attributes.category || '',
    price: 0,
    inStock: true,
    specifications: attributes.specifications || {},
  };
};

export const productAPI = {
  async getProducts(
    filters?: ProductFilters,
    opts?: { signal?: AbortSignal }
  ): Promise<ProductsResponse> {
    try {
      // Allow caller to request pagination parameters. Default to page=1 pageSize=100
      // to be backward-compatible with previous behavior. The Products page will
      // call this with smaller pageSize (e.g. 6) for per-section incremental fetch.
      const page = filters?.page ?? 1;
      const pageSize = filters?.pageSize ?? 100;

      let url = `${STRAPI_URL}/api/products?populate=*&pagination[page]=${page}&pagination[pageSize]=${pageSize}`;

      if (filters?.category) {
        // Strapi products may use a free-form 'tag' field to classify items.
        // Our frontend uses logical category keys (e.g. 'plc-scada') which map
        // to a set of tags in categoryMapping. Translate category -> tags
        // and use a $in filter on tag to return items for that category.
        const catInfo = categoryMapping[filters.category];
        if (catInfo && Array.isArray(catInfo.tags) && catInfo.tags.length > 0) {
          // Strapi expects repeated array params for $in: filters[tag][$in][]=a&filters[tag][$in][]=b
          const parts = catInfo.tags
            .map(t => `filters[tag][$in][]=${encodeURIComponent(t)}`)
            .join('&');
          url += `&${parts}`;
        } else {
          // fallback: attempt to filter by category field directly
          url += `&filters[category][$eq]=${encodeURIComponent(filters.category)}`;
        }
      }
      if (filters?.tag) {
        url += `&filters[tag][$eq]=${filters.tag}`;
      }
      if (filters?.search) {
        url += `&filters[$or][0][title][$containsi]=${filters.search}&filters[$or][1][description][$containsi]=${filters.search}`;
      }

      const headers = getStrapiHeaders();

      const response = await fetch(url, {
        headers: headers,
        signal: opts?.signal,
      });

      if (!response.ok) {
        if (response.status === 401 && !API_TOKEN) {
          const retryResponse = await fetch(url, {
            headers: { 'Content-Type': 'application/json' },
            signal: opts?.signal,
          });

          if (retryResponse.ok) {
            const strapiResponse = await retryResponse.json();
            const products = strapiResponse.data?.map(mapStrapiProduct) || [];
            return {
              products,
              total: strapiResponse.meta?.pagination?.total || products.length,
              page: strapiResponse.meta?.pagination?.page || 1,
              limit:
                strapiResponse.meta?.pagination?.pageSize || products.length,
              hasMore: false,
            };
          }
        }

        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        try {
          const errorBody = await response.json();
          errorMessage = errorBody.error?.message || errorMessage;
        } catch {
          // Error parsing response body
        }

        throw new Error(`Failed to fetch products: ${errorMessage}`);
      }

      const strapiResponse = await response.json();

      let products = strapiResponse.data?.map(mapStrapiProduct) || [];

      // Fallback: if caller requested a category and we got no results, try a
      // containsi OR query across the tags to catch mismatched tag shapes.
      if (filters?.category && products.length === 0) {
        const catInfo = categoryMapping[filters.category];
        if (catInfo && Array.isArray(catInfo.tags) && catInfo.tags.length > 0) {
          // build OR filters for tag containsi
          const orParts = catInfo.tags
            .map(
              (t, i) =>
                `filters[$or][${i}][tag][$containsi]=${encodeURIComponent(t)}`
            )
            .join('&');

          const fallbackUrl = `${STRAPI_URL}/api/products?populate=*&pagination[page]=${page}&pagination[pageSize]=${pageSize}&${orParts}`;
          const fallbackResp = await fetch(fallbackUrl, {
            headers: getStrapiHeaders(),
            signal: opts?.signal,
          });
          if (fallbackResp.ok) {
            const fallbackJson = await fallbackResp.json();
            products = fallbackJson.data?.map(mapStrapiProduct) || products;
            // update pagination meta if available
            if (fallbackJson.meta?.pagination) {
              // override strapiResponse meta to the fallback one for downstream values
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (strapiResponse as any).meta = fallbackJson.meta;
            }
          }
        }
      }

      const total = strapiResponse.meta?.pagination?.total ?? products.length;
      const currentPage = strapiResponse.meta?.pagination?.page ?? page;
      const limit = strapiResponse.meta?.pagination?.pageSize ?? pageSize;
      const pageCount =
        strapiResponse.meta?.pagination?.pageCount ?? Math.ceil(total / limit);

      return {
        products,
        total,
        page: currentPage,
        limit,
        hasMore: currentPage < pageCount,
      };
    } catch (error) {
      throw error;
    }
  },

  async getProductById(id: number): Promise<Product> {
    try {
      const response = await fetch(
        `${STRAPI_URL}/api/products/${id}?populate=*`,
        {
          headers: getStrapiHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch product: ${response.statusText}`);
      }

      const strapiResponse = await response.json();
      return mapStrapiProduct(strapiResponse.data);
    } catch (error) {
      throw error;
    }
  },

  async getProductBySlug(slug: string): Promise<Product> {
    try {
      // Normalize และ validate slug ก่อนค้นหา
      const normalizedSlug = generateStandardSlug(slug);

      if (!validateSlug(normalizedSlug)) {
        throw new Error(`Invalid slug format: ${slug}`);
      }

      // ลองค้นหาด้วย slug ที่ส่งมาก่อน
      let url = `${STRAPI_URL}/api/products?filters[slug][$eq]=${encodeURIComponent(slug)}&populate=*`;
      let response = await fetch(url, { headers: getStrapiHeaders() });

      if (!response.ok && response.status === 401 && !API_TOKEN) {
        // Retry without auth token
        response = await fetch(url, {
          headers: { 'Content-Type': 'application/json' },
        });
      }

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      let strapiResponse = await response.json();

      // ถ้าไม่เจอ ลองค้นหาด้วย normalized slug
      if (!strapiResponse.data || strapiResponse.data.length === 0) {
        if (normalizedSlug !== slug) {
          url = `${STRAPI_URL}/api/products?filters[slug][$eq]=${encodeURIComponent(normalizedSlug)}&populate=*`;
          response = await fetch(url, { headers: getStrapiHeaders() });

          if (response.ok) {
            strapiResponse = await response.json();
          }
        }
      }

      // ถ้ายังไม่เจอ ลองค้นหาด้วย title (fallback)
      if (!strapiResponse.data || strapiResponse.data.length === 0) {
        // แปลง slug กลับเป็น title เพื่อค้นหา
        const titleFromSlug = slug.replace(/-/g, ' ');
        url = `${STRAPI_URL}/api/products?filters[$or][0][title][$containsi]=${encodeURIComponent(titleFromSlug)}&filters[$or][1][main_title][$containsi]=${encodeURIComponent(titleFromSlug)}&populate=*`;
        response = await fetch(url, { headers: getStrapiHeaders() });

        if (response.ok) {
          strapiResponse = await response.json();
        }
      }

      if (strapiResponse.data && strapiResponse.data.length > 0) {
        return mapStrapiProduct(strapiResponse.data[0]);
      } else {
        throw new Error(`Product not found with slug: ${slug}`);
      }
    } catch (error) {
      throw error;
    }
  },

  async searchProducts(query: string): Promise<Product[]> {
    try {
      const filters = { search: query };
      const response = await this.getProducts(filters);
      return response.products;
    } catch (error) {
      throw error;
    }
  },
};

// Export utility functions สำหรับใช้ในที่อื่น
export { generateStandardSlug, validateSlug };

export const fetchProducts = productAPI.getProducts;
export const fetchProductById = productAPI.getProductById;
export const searchProducts = productAPI.searchProducts;

// Helper function สำหรับ suggest slug ให้ admin
export const suggestSlugForProduct = (
  title: string,
  existingSlugs: string[] = []
): string => {
  const baseSlug = generateStandardSlug(title);
  let finalSlug = baseSlug;
  let counter = 1;

  // ถ้า slug ซ้ำกัน ให้เพิ่มตัวเลขต่อท้าย
  while (existingSlugs.includes(finalSlug)) {
    finalSlug = `${baseSlug}-${counter}`;
    counter++;
  }

  return finalSlug;
};
