import { Product, ProductsResponse, ProductFilters } from '@/types/product';
import { getProductsByCategory } from '@/lib/categoryMapping';
import { mediaUrl } from '@/lib/strapi';
import { PossibleMediaInput } from '@/types/strapi';

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

// The full product catalogue is shipped as a static asset (exported from the
// CMS at build time). We load it once on the client and filter/paginate in
// memory — no runtime backend is required for the static site.
let _allProducts: Product[] | null = null;

async function loadAllProducts(signal?: AbortSignal): Promise<Product[]> {
  if (_allProducts) return _allProducts;
  const res = await fetch('/data/products.json', { signal });
  if (!res.ok) {
    throw new Error(`Failed to fetch products: HTTP ${res.status}`);
  }
  const json = await res.json();
  const data = (json?.data ?? []) as StrapiProduct[];
  _allProducts = data.map(mapStrapiProduct);
  return _allProducts;
}

export const productAPI = {
  async getProducts(
    filters?: ProductFilters,
    opts?: { signal?: AbortSignal }
  ): Promise<ProductsResponse> {
    const all = await loadAllProducts(opts?.signal);

    let products = all;
    if (filters?.category) {
      products = getProductsByCategory(all, filters.category);
    } else if (filters?.tag) {
      products = all.filter((p) => p.tag === filters.tag);
    }

    if (filters?.search) {
      const q = filters.search.toLowerCase();
      products = products.filter(
        (p) =>
          (p.name ?? '').toLowerCase().includes(q) ||
          (p.description ?? '').toLowerCase().includes(q)
      );
    }

    const page = filters?.page ?? 1;
    const pageSize = filters?.pageSize ?? 100;
    const total = products.length;
    const start = (page - 1) * pageSize;
    const slice = products.slice(start, start + pageSize);

    return {
      products: slice,
      total,
      page,
      limit: pageSize,
      hasMore: start + pageSize < total,
    };
  },
};

/**
 * @deprecated Use productAPI.getProducts directly. This alias is not used.
 */
export const fetchProducts = productAPI.getProducts;
