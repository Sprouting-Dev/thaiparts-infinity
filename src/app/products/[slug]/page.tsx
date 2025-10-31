'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Product } from '@/types/product';
import { productAPI } from '@/services/productService';
import { getButtonStyle, getButtonClassName } from '@/lib/button-styles';
import SafeHtml from '@/components/SafeHtml';
import DetailNotFound from '@/components/DetailNotFound';
import DetailSkeleton from '@/components/skeletons/DetailSkeleton';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (slug) {
      fetchProductBySlug(slug);
    }
  }, [slug]);

  const fetchProductBySlug = async (productSlug: string) => {
    try {
      setIsLoading(true);

      const response = await productAPI.getProductBySlug(productSlug);
      setProduct(response);
      setError(null);
    } catch {
      setError('Failed to fetch product details');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <DetailSkeleton />;
  }

  if (error || !product) {
    return (
      <DetailNotFound
        title="ไม่พบข้อมูลสินค้า"
        message="ขออภัย เราไม่พบสินค้าที่คุณกำลังค้นหา กรุณาตรวจสอบ URL หรือกลับไปยังหน้าสินค้า"
        primaryHref="/products"
        primaryLabel="กลับไปหน้าสินค้า"
      />
    );
  }

  const buttonStyle = getButtonStyle('primary');

  return (
    <div className="min-h-screen w-full flex flex-col items-center px-4">
      <div className="w-full lg:mx-auto mt-31.5 lg:mt-61.5 max-w-[938px]">
        <div className="mb-4 lg:mb-8">
          <div className="flex items-baseline gap-3 lg:mb-6">
            <span className="w-2 h-2 lg:w-4 lg:h-4 bg-[#E92928] rounded-full flex-shrink-0"></span>
            <h1 className="text-[1.375rem] lg:text-[1.75rem] font-medium text-primary leading-tight">
              {product.main_title || product.name}
            </h1>
          </div>
        </div>

        <div className="mb-4 lg:mb-8">
          {/* Make image container scale down from a max width of 938px -> full width on smaller screens */}
          <div className="w-full max-w-[938px] mx-auto relative h-[500px] overflow-hidden rounded-2xl">
            <Image
              src={product.image}
              alt={product.main_title || product.name}
              fill
              sizes="(min-width: 1024px) 938px, 100vw"
              className="object-cover object-center w-full h-full"
              priority
            />
          </div>
        </div>

        <div className="mb-8">
          <div
            className="product-description text-foreground leading-relaxed text-base lg:text-[1.375rem] [&_*]:!font-['Kanit']"
            style={{ fontFamily: 'Kanit, sans-serif' }}
          >
            <SafeHtml html={String(product.description || '')} />
          </div>
        </div>

        {product.specifications &&
          Object.keys(product.specifications).length > 0 && (
            <div className="mb-8">
              <table
                className="w-full"
                style={{ fontFamily: 'Kanit, sans-serif' }}
              >
                <tbody>
                  {Object.entries(product.specifications).map(
                    ([key, value]) => (
                      <tr key={key}>
                        <td className="py-[0.375rem] pr-6 font-semibold text-foreground w-1/3 text-base lg:text-[1.375rem]">
                          {key}
                        </td>
                        <td className="py-[0.375rem] pl-6 text-foreground text-base lg:text-[1.375rem]">
                          {String(value)}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}

        <div className="text-center flex justify-center">
          <button
            className={`${getButtonClassName('primary')} w-full lg:w-auto text-base lg:text-xl mt-16 cursor-pointer`}
            style={{
              backgroundColor: buttonStyle.bg,
              color: buttonStyle.color,
              boxShadow: buttonStyle.boxShadow,
              textShadow: buttonStyle.textShadow,
            }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = buttonStyle.hoverBg;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = buttonStyle.bg;
            }}
            onClick={() => router.push('/contact-us')}
          >
            <span className="relative z-[1]">
              ติดต่อเราเพื่อปรึกษาวิศวกรและขอใบเสนอราคา
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

// Using shared DetailSkeleton in src/components/skeletons
