import { Metadata } from 'next';
import Image from 'next/image';
import { mediaUrl, STRAPI_URL } from '@/lib/strapi';

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
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-b from-white to-[var(--color-background)]">
      <div className="px-4 lg:px-0 max-w-[970px] w-full pt-[128px] lg:pt-[246px]">
        <div className="w-full">
          <div className="flex flex-col gap-8 items-center">
            <div>
              <div className="flex flex-col items-start gap-4">
                <div className="flex items-center gap-3 lg:gap-4">
                  <span className="w-2 h-2 lg:w-4 lg:h-4 rounded-full bg-[var(--accent-red)] flex-shrink-0"></span>
                  <h1 className="font-['Kanit'] font-medium text-[22px] lg:text-[28px] leading-[33px] lg:leading-[42px] text-[var(--color-primary)]">
                    บริการและโซลูชันวิศวกรรม
                  </h1>
                </div>
                <div className="flex flex-col gap-2">
                  <p className="font-['Kanit'] font-normal text-[16px] lg:text-[22px] leading-[24px] lg:leading-[33px] text-[var(--color-foreground)]">
                    บริการของเราครอบคลุมตั้งแต่ การวิเคราะห์ความต้องการ
                    การออกแบบสถาปัตยกรรม การติดตั้งฮาร์ดแวร์และซอฟต์แวร์
                    การเชื่อมต่อกับ PLC/RTU ถึงการทำงานร่วมกับ ระบบ ERP/CMMS
                    สำหรับการรายงานเชิงธุรกิจ
                  </p>

                  <p className="font-['Kanit'] font-normal text-[16px] lg:text-[22px] leading-[24px] lg:leading-[33px] text-[var(--color-foreground)]">
                    เราเน้นการออกแบบที่ แยกเครือข่าย OT/IT, ใช้มาตรการ
                    defense-in-depth ตามแนวทาง NIST และ IEC62443,
                    และใช้เทคโนโลยีมาตรฐานเช่น OPC UA เพื่อความ
                    มั่นคงและความยืดหยุ่นของระบบ
                  </p>
                </div>
              </div>
            </div>

            <div>
              {services.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-[2.1875rem]">
                  {services.map(service => {
                    if (!service?.attributes) return null;

                    const { attributes } = service;
                    // Resolve image via centralized helper (handles Strapi media objects)
                    const imageUrl = mediaUrl((attributes as any)?.image) || '';

                    return (
                      <div key={service.id} className="flex flex-col gap-2">
                        <div className="w-full h-[13.75rem] relative rounded-lg overflow-hidden">
                          {imageUrl ? (
                            <Image
                              src={imageUrl}
                              alt={attributes.title}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-neutral-200 to-neutral-300 flex items-center justify-center">
                              {/* Neutral placeholder when no CMS image is provided */}
                            </div>
                          )}
                        </div>

                        <h2 className="font-['Kanit'] font-medium text-base lg:text-[1.375rem] text-[var(--color-foreground)]">
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
        </div>
      </div>
    </div>
  );
}
