import { Metadata } from 'next';
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

function getProducts(): Product[] {
  // Static product data
  return [
    {
      id: 1,
      attributes: {
        name: "อสื่อสัญญา ลูกปืน",
        slug: "bearings-rollers", 
        subtitle: "Bearings & Rollers",
        thumbnail: undefined,
        categoryBadge: { label: "Mechanical", color: "blue" }
      }
    },
    {
      id: 2,
      attributes: {
        name: "Hydraulic System",
        slug: "hydraulic-system",
        subtitle: "Hydraulic Components & Systems", 
        thumbnail: undefined,
        categoryBadge: { label: "Hydraulic", color: "teal" }
      }
    },
    {
      id: 3,
      attributes: {
        name: "Motor & Drive",
        slug: "motor-drive",
        subtitle: "Motors & Drive Systems",
        thumbnail: undefined,
        categoryBadge: { label: "Electrical", color: "red" }
      }
    },
    {
      id: 4,
      attributes: {
        name: "PLC Module", 
        slug: "plc-module",
        subtitle: "Programmable Logic Controllers",
        thumbnail: undefined,
        categoryBadge: { label: "Automation", color: "navy" }
      }
    },
    {
      id: 5,
      attributes: {
        name: "Pressure & Flow",
        slug: "pressure-flow",
        subtitle: "Pressure & Flow Control Systems",
        thumbnail: undefined,
        categoryBadge: { label: "Control", color: "green" }
      }
    }
  ];
}

export default function ProductsPage() {
  const products = getProducts();

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
