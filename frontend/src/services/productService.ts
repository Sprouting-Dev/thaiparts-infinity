import { Product, ProductsResponse, ProductFilters } from '@/types/product';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
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
  return text
    .toLowerCase()
    .trim()
    // เอา special characters ออก
    .replace(/[^\w\s-]/g, '')
    // เปลี่ยน spaces และ underscores เป็น dashes
    .replace(/[\s_]+/g, '-')
    // เอา multiple dashes ออก
    .replace(/-+/g, '-')
    // เอา leading/trailing dashes ออก
    .replace(/^-+|-+$/g, '');
};

// Validation function สำหรับ slug
const validateSlug = (slug: string): boolean => {
  // Slug ต้องเป็น lowercase, มีแค่ a-z, 0-9, และ dash
  const slugPattern = /^[a-z0-9]+(-[a-z0-9]+)*$/;
  return slugPattern.test(slug) && slug.length >= 3 && slug.length <= 100;
};

const mapStrapiProduct = (strapiProduct: any): Product => {
  const { id, attributes } = strapiProduct;
  
  let imageUrl = '/placeholder-image.jpg';
  
  if (attributes.image?.data?.attributes?.url) {
    const strapiImageUrl = attributes.image.data.attributes.url;
    if (strapiImageUrl.startsWith('http')) {
      imageUrl = strapiImageUrl;
    } else {
      imageUrl = `${STRAPI_URL}${strapiImageUrl}`;
    }
  }
  
  const mainTitle = attributes.main_title || attributes.title || 'Unknown Product';
  
  // ใช้ slug จาก Strapi ถ้ามีและ valid, ถ้าไม่ก็ generate ใหม่
  let slug = attributes.slug;
  if (!slug || !validateSlug(slug)) {
    slug = generateStandardSlug(mainTitle);
    console.warn(`Invalid or missing slug for product ${id}. Generated: ${slug}`);
  }
  
  return {
    id: id,
    name: attributes.title || attributes.main_title || 'Unknown Product',
    main_title: mainTitle,
    slug: slug,
    tag: attributes.tag || 'General',
    image: imageUrl,
    description: attributes.description || '',
    category: attributes.category || 'spare-parts',
    price: 0, 
    inStock: true,
    specifications: attributes.specifications || {}, 
  };
};

export const productAPI = {
  async getProducts(filters?: ProductFilters): Promise<ProductsResponse> {
    try {
      let url = `${STRAPI_URL}/api/products?populate=*`;
      
      if (filters?.category) {
        url += `&filters[category][$eq]=${filters.category}`;
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
      });
      
      if (!response.ok) {

        if (response.status === 401 && !API_TOKEN) {
          const retryResponse = await fetch(url, {
            headers: { 'Content-Type': 'application/json' },
          });
          
          if (retryResponse.ok) {
            const strapiResponse = await retryResponse.json();
            const products = strapiResponse.data?.map(mapStrapiProduct) || [];
            return {
              products,
              total: strapiResponse.meta?.pagination?.total || products.length,
              page: strapiResponse.meta?.pagination?.page || 1,
              limit: strapiResponse.meta?.pagination?.pageSize || products.length,
              hasMore: false,
            };
          }
        }

        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        try {
          const errorBody = await response.json();
          errorMessage = errorBody.error?.message || errorMessage;
        } catch (e) {
          // Error parsing response body
        }
        
        throw new Error(`Failed to fetch products: ${errorMessage}`);
      }

      const strapiResponse = await response.json();
      
      const products = strapiResponse.data?.map(mapStrapiProduct) || [];

      return {
        products,
        total: strapiResponse.meta?.pagination?.total || products.length,
        page: strapiResponse.meta?.pagination?.page || 1,
        limit: strapiResponse.meta?.pagination?.pageSize || products.length,
        hasMore: false,
      };
    } catch (error) {
      throw error;
    }
  },

  async getProductById(id: number): Promise<Product> {
    try {
      const response = await fetch(`${STRAPI_URL}/api/products/${id}?populate=*`, {
        headers: getStrapiHeaders(),
      });
      
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
        response = await fetch(url, { headers: { 'Content-Type': 'application/json' } });
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
  }
};

// Export utility functions สำหรับใช้ในที่อื่น
export { generateStandardSlug, validateSlug };

export const fetchProducts = productAPI.getProducts;
export const fetchProductById = productAPI.getProductById;
export const searchProducts = productAPI.searchProducts;

// Helper function สำหรับ suggest slug ให้ admin
export const suggestSlugForProduct = (title: string, existingSlugs: string[] = []): string => {
  let baseSlug = generateStandardSlug(title);
  let finalSlug = baseSlug;
  let counter = 1;
  
  // ถ้า slug ซ้ำกัน ให้เพิ่มตัวเลขต่อท้าย
  while (existingSlugs.includes(finalSlug)) {
    finalSlug = `${baseSlug}-${counter}`;
    counter++;
  }
  
  return finalSlug;
};