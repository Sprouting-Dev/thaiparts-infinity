import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { mediaUrl, STRAPI_URL } from '@/lib/strapi';
import type { PossibleMediaInput } from '@/types/strapi';
import { buildMetadataFromSeo } from '@/lib/seo';
import { fetchPageBySlug, fetchServices as fetchServicesFromCms } from '@/lib/cms';

export async function generateMetadata(): Promise<Metadata> {
  try {
    const page = await fetchPageBySlug('services');
    const attrs = page as unknown as Record<string, unknown> | null;
    const seo =
      (attrs &&
        (attrs['SharedSeoComponent'] as Record<string, unknown> | undefined)) ??
      (attrs && (attrs['SEO'] as Record<string, unknown> | undefined)) ??
      (attrs && (attrs['seo'] as Record<string, unknown> | undefined)) ??
      null;

    return buildMetadataFromSeo(seo, {
      defaultCanonical: '/services',
      fallbackTitle: 'Services | THAIPARTS INFINITY',
      fallbackDescription: 'บริการและโซลูชันวิศวกรรมครบวงจร ตั้งแต่การวิเคราะห์ความต้องการ การออกแบบสถาปัตยกรรม ติดตั้งฮาร์ดแวร์และซอฟต์แวร์ จาก THAIPARTS INFINITY',
    });
  } catch {
    return buildMetadataFromSeo(null, {
      defaultCanonical: '/services',
      fallbackTitle: 'Services | THAIPARTS INFINITY',
      fallbackDescription: 'บริการและโซลูชันวิศวกรรมครบวงจร ตั้งแต่การวิเคราะห์ความต้องการ การออกแบบสถาปัตยกรรม ติดตั้งฮาร์ดแวร์และซอฟต์แวร์ จาก THAIPARTS INFINITY',
    });
  }
}

type Service = {
  id?: number;
  attributes?: {
    title?: string;
    slug?: string;
    subtitle?: string;
    image?: unknown;
    cover_image?: unknown;
  };
};

export default async function ServicesPage() {
  const servicesResponse = await fetchServicesFromCms({ pageSize: 100 });
  const services = (servicesResponse.items ?? []) as Service[];

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
                    const attrsRec = attributes as Record<string, unknown>;
                    // Prefer new `cover_image` field (may be present after schema change),
                    // fall back to legacy `image` for backward compatibility.
                    const maybeImage = (attrsRec['cover_image'] ??
                      attrsRec['image'] ??
                      undefined) as PossibleMediaInput | undefined;
                    const imageUrl = mediaUrl(maybeImage) || '';

                    const slug = (attributes?.slug as string) ?? '';
                    // Match GridPreview card behavior (aspect ratio, hover scale, sizes, unoptimized conditional)
                    return (
                      <Link
                        key={service.id}
                        href={`/services/${slug}`}
                        className={`group flex flex-col gap-2 hover:transform hover:scale-[1.02] transition-all duration-200`}
                      >
                        <div
                          className={`w-full aspect-[300/220] overflow-hidden rounded-lg relative`}
                        >
                          {(() => {
                            const src = imageUrl;
                            const isExternal = src
                              ? src.startsWith('http') &&
                                !src.startsWith(STRAPI_URL)
                              : false;
                            return src ? (
                              <Image
                                src={src}
                                alt={attributes?.title ?? 'Service'}
                                fill
                                sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 33vw"
                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                                unoptimized={isExternal}
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-neutral-200 to-neutral-300 flex items-center justify-center">
                                {/* Neutral placeholder when no CMS image is provided */}
                              </div>
                            );
                          })()}
                        </div>

                        <h2 className="font-['Kanit'] font-medium text-base lg:text-[1.375rem] text-[var(--color-foreground)]">
                          {attributes?.title ?? ''}
                        </h2>
                      </Link>
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
