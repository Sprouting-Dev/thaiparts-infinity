'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Product } from '@/types/product';
import { productAPI } from '@/services/productService';
import { getButtonStyle, getButtonClassName } from '@/lib/button-styles';
import { Skeleton } from '@/components/ui/skeleton';


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
    } catch (err) {
      setError('Failed to fetch product details');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <ProductDetailSkeleton />;
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-600 mb-4">
            ไม่พบข้อมูลสินค้า
          </h2>
          <button 
            onClick={() => router.push('/products')}
            className="cursor-pointer bg-primary text-white px-6 py-2 rounded-lg hover:bg-opacity-90"
          >
            กลับไปหน้าสินค้า
          </button>
        </div>
      </div>
    );
  }

  const buttonStyle = getButtonStyle('primary');

  return (
    <div className="min-h-screen w-full">
      <div className="mx-4 lg:mx-62.5 mt-31.5 lg:mt-61.5">
        
        <div className="mb-4 lg:mb-8">
          <div className="flex items-baseline gap-3 lg:mb-6">
            <span className="w-2 h-2 lg:w-4 lg:h-4 bg-accent rounded-full flex-shrink-0"></span>
            <h1 className="text-[1.375rem] lg:text-[1.75rem] font-medium text-primary leading-tight">
              {product.main_title || product.name}
            </h1>
          </div>
        </div>

        <div className="mb-4 lg:mb-8">
          <div className="w-full">
            <img
              src={product.image}
              alt={product.main_title || product.name}
              className="w-full h-[21.4375rem] lg:w-full lg:h-[31.25rem] object-cover rounded-2xl lg:rounded-2xl"
            />
          </div>
        </div>

        <div className="mb-8">
          <div 
            className="text-foreground leading-relaxed text-base font-kanit"
            dangerouslySetInnerHTML={{ __html: product.description || '' }}
          />
        </div>

        {product.specifications && Object.keys(product.specifications).length > 0 && (
          <div className="mb-8">
            <table className="w-full border-collapse">
              <tbody>
                {Object.entries(product.specifications).map(([key, value]) => (
                  <tr key={key} className="border-b border-gray-200">
                    <td className="py-3 pr-6 font-medium text-gray-800 bg-gray-50 w-1/3">
                      {key}
                    </td>
                    <td className="py-3 pl-6 text-gray-700">
                      {String(value)}
                    </td>
                  </tr>
                ))}
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
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = buttonStyle.hoverBg;
            }}
            onMouseLeave={(e) => { 
              e.currentTarget.style.backgroundColor = buttonStyle.bg;
            }}
            onClick={() => router.push('/contact-us')}
          >
            <span className="relative z-[1]">ติดต่อเราเพื่อปรึกษาวิศวกรและขอใบเสนอราคา</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function ProductDetailSkeleton() {
  return (
    <div className="min-h-screen w-full">
      <div className="mx-4 lg:mx-62.5 mt-31.5 lg:mt-61.5">
        {/* Title row (dot + heading) */}
        <div className="mb-4 lg:mb-8">
          <div className="flex items-baseline gap-3 lg:mb-6">
            <Skeleton className="w-2 h-2 lg:w-4 lg:h-4 rounded-full" />
            <Skeleton className="h-[1.375rem] lg:h-[1.75rem] w-3/4" />
          </div>
        </div>

        {/* Main image */}
        <div className="mb-4 lg:mb-8">
          <div className="w-full">
            <Skeleton className="w-full h-[21.4375rem] lg:h-[31.25rem] rounded-2xl lg:rounded-2xl" />
          </div>
        </div>

        {/* Description paragraphs */}
        <div className="mb-8 space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-[95%]" />
          <Skeleton className="h-4 w-[90%]" />
          <Skeleton className="h-4 w-[85%]" />
          <Skeleton className="h-4 w-[70%]" />
        </div>

        {/* Specifications table */}
        <div className="mb-8">
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className={`grid grid-cols-3 ${i < 5 ? 'border-b border-gray-200' : ''}`}>
                <div className="bg-gray-50 py-3 pr-6">
                  <Skeleton className="h-4 w-2/3" />
                </div>
                <div className="col-span-2 py-3 pl-6">
                  <Skeleton className="h-4 w-5/6" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA button */}
        <div className="text-center flex justify-center">
          <Skeleton className="h-12 w-full lg:w-[30rem] rounded-full mt-16" />
        </div>
      </div>
    </div>
  );
}

