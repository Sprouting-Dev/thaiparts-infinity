import Image from 'next/image';
import CTAButton from '@/components/CTAButton';
import { productAPI } from '@/services/productService';
import { Product } from '@/types/product';

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getProduct(slugOrId: string): Promise<Product | null> {
  const trimmed = slugOrId.trim();
  const asNumber = Number(trimmed);
  const isNumeric = !Number.isNaN(asNumber) && /^\d+$/.test(trimmed);
  if (isNumeric) {
    try {
      return await productAPI.getProductById(asNumber);
    } catch {
    }
  }
  return await productAPI.getProductBySlug(trimmed);
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) {
    return (
      <div className="px-4 py-24 lg:py-32">
        <h1 className="text-primary text-[1.375rem] lg:text-[1.75rem] font-['kanit'] lg:font-medium">ไม่พบสินค้า</h1>
        <p className="mt-2 text-foreground">ไม่สามารถโหลดข้อมูลสินค้านี้ได้ (slug: {slug})</p>
      </div>
    );
  }
  const title = product.mainTitle || product.name;
  return (
    <div className="w-full">
      <div className="px-4 mt-[8rem] lg:mt-60 max-w-5xl mx-auto">
        <h1 className="flex items-baseline lg:items-center text-primary font-['kanit'] text-xl lg:text-[1.75rem] font-medium">
          <span className=" px-1 py-1 lg:w-4 lg:h-4 bg-accent rounded-full mr-3"></span>
          <span>{title}</span>
        </h1>
      </div>
      <div className="mt-4 lg:mt-6 px-4 max-w-5xl mx-auto">
        <Image
          src={product.image}
          alt={product.name}
          width={1600}
          height={900}
          sizes="(max-width: 1024px) 100vw, 1200px"
          priority
          className="rounded-2xl object-cover w-full h-auto"
        />
      </div>
      {product.description && (
        <div className="mt-6 lg:mt-8 px-4 max-w-5xl mx-auto">
          <div className="richtext-content font-['kanit'] text-base lg:text-[1.375rem] text-foreground">
            <div dangerouslySetInnerHTML={{ __html: product.description }} />
          </div>
        </div>
      )}
      <div className="mt-16 lg:mt-16 px-4 lg:px-0 max-w-5xl mx-auto pb-12">
        <CTAButton
          cta={{
            label: 'ติดต่อเราเพื่อปรึกษาวิศวกรและขอใบเสนอราคา',
            href: '/contact-us',
            variant: 'content-primary',
          }}
          textSize="large"
          className="inline-flex"
        />
      </div>
    </div>
  );
}
