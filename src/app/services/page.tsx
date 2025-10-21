import { Metadata } from 'next';
import Image from 'next/image';
import { MotionReveal } from '@/components/MotionReveal';
import MotionGridItem from '@/components/MotionGridItem';

export const metadata: Metadata = {
  title: 'Services | THAIPARTS INFINITY',
  description: 'Industrial automation services and maintenance',
};

type Service = {
  id: number;
  attributes: {
    title: string;
    slug: string;
    subtitle?: string;
    image?: {
      data?: Array<{
        attributes?: {
          url?: string;
          formats?: Record<string, unknown>;
        };
      }>;
    };
  };
};

async function fetchServices(): Promise<Service[]> {
  const STRAPI_URL =
    process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
  const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN;

  try {
    const headers: HeadersInit = {};
    if (STRAPI_TOKEN) {
      headers.Authorization = `Bearer ${STRAPI_TOKEN}`;
    }

    const res = await fetch(`${STRAPI_URL}/api/services?populate=*`, {
      headers,
      next: { revalidate: 300 },
      cache: 'no-store',
    });

    if (!res.ok) {
      return [];
    }

    const json = await res.json();
    return json?.data ?? [];
  } catch {
    return [];
  }
}

export default async function ServicesPage() {
  const services = await fetchServices();

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-white to-[#F5F5F5]">
      <div className="px-4 lg:px-[14.6875rem] mt-32 lg:mt-[15.375rem]">
        <div className="flex items-center gap-3 lg:gap-4 mb-6 lg:mb-8">
          <span className="w-2 h-2 lg:w-4 lg:h-4 rounded-full bg-accent flex-shrink-0"></span>
          <h1 className="font-['Kanit'] font-medium text-[1.375rem] lg:text-[1.75rem] text-primary">
            บริการของเรา
            <span className="hidden lg:inline">และโซลูชันวิศวกรรม</span>
          </h1>
        </div>

        <p className="font-['Kanit'] font-normal text-base lg:text-[1.375rem] text-foreground mb-8 lg:mb-12 leading-relaxed">
          บริการของเราครอบคลุมตั้งแต่ การวิเคราะห์ความต้องการ
          การออกแบบสถาปัตยกรรม การติดตั้งฮาร์ดแวร์ และซอฟต์แวร์ การเชื่อมต่อกับ
          PLC/RTU ถึงการทำงานร่วมกับระบบ ERP/CMMS สำหรับการรายงานเชิงธุรกิจ
          เราเน้นการออกแบบที่แยกเครือข่าย OT/IT, ใช้มาตรการ defense-in-depth
          ตามแนวทาง NIST และ IEC62443, และใช้เทคโนโลยีมาตรฐานเช่น OPC UA
          เพื่อความมั่นคงและความยืดหยุ่นของระบบ
        </p>

        {services.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-[2.1875rem] pb-16">
            {services.map(service => {
              if (!service?.attributes) return null;

              const { attributes } = service;
              const imageArray = attributes.image?.data;
              const firstImage =
                Array.isArray(imageArray) && imageArray.length > 0
                  ? imageArray[0]
                  : null;
              const imageUrl = firstImage?.attributes?.url || '';

              return (
                <div key={service.id} className="flex flex-col">
                  <div className="w-full h-[13.75rem] relative rounded-lg overflow-hidden mb-4">
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt={attributes.title}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <span className="text-4xl">🔧</span>
                      </div>
                    )}
                  </div>

                  <h2 className="font-['Kanit'] font-medium text-base lg:text-[1.375rem] text-foreground">
                    {attributes.title}
                  </h2>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="font-['Kanit'] text-base lg:text-[1.125rem] text-gray-500">
              ไม่พบข้อมูลบริการในขณะนี้
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
