import { Metadata } from 'next';
import { api } from '@/lib/api';
import { getCategoryBadgeStyle } from '@/lib/categoryBadge';

export const metadata: Metadata = {
  title: 'Products | THAIPARTS INFINITY',
  description: 'Industrial automation products and spare parts',
};

type Product = {
  id: number;
  attributes: {
    name: string;
    slug: string;
    subtitle?: string;
    thumbnail?: {
      data?: { attributes?: { url?: string } };
      url?: string; // flattened fallback
    };
    categoryBadge?: { label?: string; color?: string } | null;
  };
};

async function getProducts() {
  try {
    const response = await api<{ data?: any[] }>(
      '/api/products?populate[thumbnail]=1&populate[categoryBadge]=1&sort=publishedAt:asc',
      { next: { revalidate: 300 } }
    );
    const raw = Array.isArray(response?.data) ? response!.data : [];
    if (raw.length)
      console.log('[products] raw entries sample (first 3):', raw.slice(0, 3));
    const normalized: Product[] = raw
      .map(entry => {
        if (!entry || typeof entry !== 'object') return null as any;
        if (entry.attributes && typeof entry.attributes === 'object')
          return entry as Product;
        const { id, ...rest } = entry;
        return { id, attributes: rest } as Product;
      })
      .filter(Boolean);
    if (normalized.length !== raw.length) {
      console.warn('[products] wrapped flattened entries', {
        received: raw.length,
        normalized: normalized.length,
      });
    }
    return normalized;
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return [];
  }
}

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <div className="bg-[#F5F5F5] min-h-screen">
      <main className="w-full flex flex-col items-center pt-24">
        <div className="container-970 flex flex-col gap-8 py-8">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full bg-[#E92928] flex-shrink-0" />
            <h1 className="font-['Kanit'] font-medium text-[22px] leading-[33px] md:text-[28px] md:leading-[42px] text-[#1063A7]">
              อะไหล่และระบบที่เราเชี่ยวชาญ
            </h1>
          </div>

          {/* Products Grid */}
          {products.length > 0 ? (
            <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-7 lg:gap-8">
              {products.map(product => {
                if (!product || !product.attributes) return null;
                const { attributes } = product as any;
                const imageUrl =
                  attributes.thumbnail?.data?.attributes?.url ||
                  attributes.thumbnail?.url ||
                  '';
                const categoryBadge = attributes.categoryBadge || null;

                const categoryStyle = getCategoryBadgeStyle(
                  categoryBadge?.color
                );

                return (
                  <div
                    key={product.id}
                    className="group flex flex-col gap-3 hover:transform hover:scale-[1.02] transition-all duration-200"
                  >
                    {/* Image */}
                    <div className="w-full aspect-[300/220] overflow-hidden rounded-lg">
                      {imageUrl ? (
                        <img
                          src={
                            imageUrl.startsWith('http')
                              ? imageUrl
                              : `${process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337'}${imageUrl}`
                          }
                          alt={attributes.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-neutral-200 to-neutral-300 flex items-center justify-center">
                          <div className="text-neutral-400 text-4xl">📦</div>
                        </div>
                      )}
                    </div>

                    {/* Badge */}
                    {categoryBadge?.label && categoryStyle && (
                      <div
                        className={`${categoryStyle.bg} rounded-full flex justify-center items-center px-3 py-1 w-fit`}
                      >
                        <span
                          className={`font-['Kanit'] font-semibold text-sm ${categoryStyle.text}`}
                        >
                          {categoryBadge.label}
                        </span>
                      </div>
                    )}

                    {/* Title */}
                    <h3 className="font-['Kanit'] font-medium text-[20px] leading-tight text-[#333333] group-hover:text-[#1063A7] transition-colors duration-200">
                      {attributes.name}
                    </h3>

                    {/* Subtitle */}
                    {attributes.subtitle && (
                      <p className="font-['Kanit'] font-normal text-[14px] leading-relaxed text-[#666666]">
                        {attributes.subtitle}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="w-full text-center py-16">
              <p className="font-['Kanit'] text-[18px] text-[#666666]">
                ไม่พบข้อมูลสินค้าในขณะนี้
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
