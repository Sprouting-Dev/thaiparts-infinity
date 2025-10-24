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
  
  return {
    id: id,
    name: attributes.title || attributes.main_title || 'Unknown Product',
    tag: attributes.tag || 'General',
    image: imageUrl,
    description: attributes.description || '',
    category: attributes.category || 'spare-parts',
    price: 0, 
    inStock: true, 
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

export const fetchProducts = productAPI.getProducts;
export const fetchProductById = productAPI.getProductById;
export const searchProducts = productAPI.searchProducts;