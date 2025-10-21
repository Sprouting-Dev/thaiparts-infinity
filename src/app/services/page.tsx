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
    name: string;
    slug: string;
    subtitle?: string;
    thumbnail?: {
      data?: { attributes?: { url?: string } };
      url?: string; // flattened fallback
    };
  };
};

function getServices(): Service[] {
  // Static services data (mirror homepage services)
  return [
    {
      id: 1,
      attributes: {
        name: 'System Design & Upgrade',
        slug: 'system-design',
        subtitle: 'ออกแบบและยกระดับระบบ',
        thumbnail: { url: '/homepage/services/system-design-and-upgrade.webp' },
      },
    },
    {
      id: 2,
      attributes: {
        name: 'Preventive Maintenance',
        slug: 'preventive-maintenance',
        subtitle: 'บำรุงรักษาเชิงป้องกัน',
        thumbnail: { url: '/homepage/services/preventive-maintenance.webp' },
      },
    },
    {
      id: 3,
      attributes: {
        name: 'Rapid Response & On-site Support',
        slug: 'rapid-response',
        subtitle: 'บริการฉุกเฉิน และการสนับสนุนในพื้นที่',
        thumbnail: {
          url: '/homepage/services/rapid-response-and-on-site-support.webp',
        },
      },
    },
  ];
}

export default function ServicesPage() {
  const services = getServices();

  return (
    <div className="bg-[#F5F5F5] min-h-screen">
      <main className="w-full flex flex-col items-center pt-24">
        <div className="container-970 flex flex-col gap-8 py-8">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full bg-[#E92928] flex-shrink-0" />
            <h1 className="font-['Kanit'] font-medium text-[22px] leading-[33px] md:text-[28px] md:leading-[42px] text-[#1063A7]">
              บริการและโซลูชันวิศวกรรม
            </h1>
          </div>

          {/* Services Grid */}
          {services.length > 0 ? (
            <MotionReveal>
              <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-7 lg:gap-8">
                {services.map((service, i) => {
                  if (!service || !service.attributes) return null;
                  const { attributes } = service;
                  const imageUrl =
                    attributes.thumbnail?.data?.attributes?.url ||
                    attributes.thumbnail?.url ||
                    '';

                  return (
                    <MotionGridItem key={service.id} index={i}>
                      <div className="group flex flex-col gap-3 hover:transform hover:scale-[1.02] transition-all duration-200">
                        {/* Image */}
                        <div className="w-full aspect-[300/220] overflow-hidden rounded-lg relative">
                          {imageUrl ? (
                            (() => {
                              const isExternal = imageUrl.startsWith('http');
                              const src = isExternal
                                ? imageUrl
                                : imageUrl.startsWith('/')
                                  ? imageUrl
                                  : `${process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337'}${imageUrl}`;
                              return (
                                <Image
                                  src={src}
                                  alt={attributes.name}
                                  fill
                                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                                  unoptimized={isExternal}
                                />
                              );
                            })()
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-neutral-200 to-neutral-300 flex items-center justify-center">
                              <div className="text-neutral-400 text-4xl">
                                🔧
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Title */}
                        <h3 className="font-['Kanit'] font-medium text-[20px] leading-tight text-[#333333] group-hover:text-[#1063A7] transition-colors duration-200">
                          {attributes.name}
                        </h3>

                        {/* Subtitle intentionally omitted on services page */}
                      </div>
                    </MotionGridItem>
                  );
                })}
              </div>
            </MotionReveal>
          ) : (
            <div className="w-full text-center py-16">
              <p className="font-['Kanit'] text-[18px] text-[#666666]">
                ไม่พบข้อมูลบริการในขณะนี้
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
