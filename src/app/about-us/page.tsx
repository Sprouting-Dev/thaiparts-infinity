// src/app/about-us/page.tsx
import Hero from '@/components/Hero';
import type { Metadata } from 'next';
import Features from '@/components/Features';
import Image from 'next/image';
import LogoCarousel from '@/components/LogoCarousel';
import CTAButton from '@/components/CTAButton';
import { MotionReveal } from '@/components/MotionReveal';
import { fetchPageBySlug } from '@/lib/cms';
import { logger } from '@/lib/logger';
import { mediaUrl, STRAPI_URL } from '@/lib/strapi';
import type { AboutAttributes, PageAttributes } from '@/types/cms';
import type { PossibleMediaInput } from '@/types/strapi';
import type { CTAVariant } from '@/lib/button-styles';

import { buildMetadataFromSeo } from '@/lib/seo';

// Local helpers/constants used by this page
const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN;

type CTA = {
  label: string;
  href?: string;
  variant?: CTAVariant;
  newTab?: boolean;
};
/** 2) เนื้อหาอื่น ๆ จาก Single Type: about-us */
async function fetchAboutSingle(): Promise<unknown> {
  const headers: Record<string, string> = {};
  if (STRAPI_TOKEN) headers['Authorization'] = `Bearer ${STRAPI_TOKEN}`;

  const q = new URLSearchParams();
  // ไม่ต้อง populate hero ใน single type แล้ว เพราะเราใช้ hero จาก pages
  q.set('populate[Team][populate]', 'image');
  q.set('populate[Warehouse][populate]', 'image');
  q.set('populate[Standards]', '*');
  q.set('populate[vision]', '*');
  q.set('populate[mission]', '*');
  q.set('populate[About]', '*');

  const url = `${STRAPI_URL}/api/about-us?${q.toString()}`;
  try {
    const res = await fetch(url, { headers, cache: 'no-store' });
    if (!res.ok) {
      logger.error('[ABOUT][fetchAboutSingle] HTTP', res.status);
      return null;
    }
    return (await res.json()) as unknown;
  } catch (errUnknown) {
    const err =
      errUnknown instanceof Error ? errUnknown : new Error(String(errUnknown));
    logger.error('[ABOUT][fetchAboutSingle]', err.message);
    return null;
  }
}

/** ========== Helpers ========== */

const pickTitleDesc = (v: unknown): { title: string; description: string } => {
  if (!v) return { title: '', description: '' };
  // If v is a plain object with title/description
  if (typeof v === 'object' && v !== null) {
    const o = v as Record<string, unknown>;
    const t = o['title'];
    const d = o['description'];
    if (typeof t === 'string' || typeof d === 'string') {
      return { title: (t as string) ?? '', description: (d as string) ?? '' };
    }
    // Check for Strapi single shape: { data: { attributes: { title, description } } }
    if ('data' in o) {
      const maybeData = o['data'];
      if (typeof maybeData === 'object' && maybeData !== null) {
        const attrs = (maybeData as Record<string, unknown>)['attributes'];
        if (attrs && typeof attrs === 'object') {
          const tt = (attrs as Record<string, unknown>)['title'];
          const dd = (attrs as Record<string, unknown>)['description'];
          return {
            title: typeof tt === 'string' ? tt : '',
            description: typeof dd === 'string' ? dd : '',
          };
        }
      }
    }
  }
  return { title: '', description: '' };
};

// Removed development-only DebugOverlay to clean production output.

/** ========== Page ========== */
export default async function AboutUsPage() {
  // ดึง Hero จาก pages (slug=about-us) และเนื้อหาอื่นจาก about-us single type
  const [pageHero, aboutJson] = await Promise.all([
    fetchPageBySlug('about-us'),
    fetchAboutSingle(),
  ]);

  let aboutAttrs: AboutAttributes | null = null;
  if (
    typeof aboutJson === 'object' &&
    aboutJson !== null &&
    'data' in aboutJson
  ) {
    const aj = aboutJson as { data?: { attributes?: unknown } };
    aboutAttrs = (aj.data?.attributes ?? null) as AboutAttributes | null;
  }

  // Dev missing-field tracking removed; keep debug logging only
  /** ---------- Hero จาก Pages (re-use) ---------- */
  const heroQuote = (pageHero as PageAttributes | null)?.quote ?? '';
  if (!heroQuote) {
    logger.warn('[ABOUT][Hero] missing quote from pages');
  } else {
    logger.info('[ABOUT][Hero] quote OK from pages');
  }

  const heroBg = mediaUrl(
    (pageHero as PageAttributes | null)?.hero_image as PossibleMediaInput
  );
  if (!heroBg) {
    logger.warn('[ABOUT][Hero] missing hero_image from pages');
  } else {
    logger.info('[ABOUT][Hero] background OK from pages');
  }

  const heroProps: {
    title: string;
    background?: string | undefined;
    subtitle: string;
    ctas: CTA[];
    panel: { enabled: false; align: 'left' };
    hero_schema?: { quote: string } | undefined;
  } = {
    title: '', // no fallback text
    background: heroBg,
    subtitle: '',
    ctas: [] as CTA[],
    panel: { enabled: false as const, align: 'left' as const },
    hero_schema: heroQuote ? { quote: String(heroQuote) } : undefined,
  };

  /** ---------- เนื้อหาอื่นจาก Single Type: about-us ---------- */
  // About block
  const aboutBlock = pickTitleDesc(
    (aboutAttrs as AboutAttributes | null)?.About
  );
  if (!aboutBlock.title && !aboutBlock.description) {
    logger.warn('[ABOUT][About] About: title/description missing');
  }

  // Vision & Mission
  const vision = pickTitleDesc((aboutAttrs as AboutAttributes | null)?.vision);
  if (!vision.title) logger.warn('[ABOUT][Vision] Vision: title missing');
  if (!vision.description)
    logger.warn('[ABOUT][Vision] Vision: description missing');

  const mission = pickTitleDesc(
    (aboutAttrs as AboutAttributes | null)?.mission
  );
  if (!mission.title) logger.warn('[ABOUT][Mission] Mission: title missing');
  if (!mission.description)
    logger.warn('[ABOUT][Mission] Mission: description missing');

  // Team
  const teamComp = (aboutAttrs as AboutAttributes | null)?.Team;
  const teamImage = mediaUrl(
    (teamComp?.image as PossibleMediaInput) ?? undefined
  );
  const teamCaption = (teamComp?.description as string) ?? '';
  if (!teamComp) logger.warn('[ABOUT][Team] Team: component missing');
  else {
    if (!teamImage) logger.warn('[ABOUT][Team] Team: image missing');
    if (!teamCaption) logger.warn('[ABOUT][Team] Team: description missing');
  }

  // Warehouse
  const warehouseComp = (aboutAttrs as AboutAttributes | null)?.Warehouse;
  const warehouseImage = mediaUrl(
    (warehouseComp?.image as PossibleMediaInput) ?? undefined
  );
  const warehouseCaption = (warehouseComp?.description as string) ?? '';
  if (!warehouseComp)
    logger.warn('[ABOUT][Warehouse] Warehouse: component missing');
  else {
    if (!warehouseImage)
      logger.warn('[ABOUT][Warehouse] Warehouse: image missing');
    if (!warehouseCaption)
      logger.warn('[ABOUT][Warehouse] Warehouse: description missing');
  }

  // Standards
  const standardsArr: string[] = [];
  const standards = (aboutAttrs as AboutAttributes | null)?.Standards?.data;
  if (Array.isArray(standards)) {
    for (const d of standards) {
      // Use centralized mediaUrl to resolve icon URLs or media objects
      const resolved = mediaUrl(d?.attributes?.url);
      if (resolved) standardsArr.push(resolved);
    }
  }
  if (standardsArr.length === 0) {
    logger.warn('[ABOUT][Standards] Standards: icons missing');
  }

  /** ---------- Static Features (เดิม) ---------- */
  const features = {
    titleSegments: [
      [
        {
          text: 'มากกว่าแค่ผู้จัดจำหน่าย เราคือผู้สร้างความมั่นคงในสายการผลิต',
          color: 'blue' as const,
        },
      ],
      [{ text: 'เหตุผลที่ต้องเลือกเรา', color: 'blue' as const }],
    ],
    description:
      "เราก่อตั้ง THAIPARTS INFINITY ขึ้นจากความเข้าใจปัญหา Downtime ที่ 'ทุกนาทีคือเงิน' และความยุ่งยากในการหาผู้ให้บริการอะไหล่และระบบ Automation ที่ เชื่อถือได้ ในที่เดียว เราจึงเป็นมากกว่าผู้จัดจำหน่าย โดยเป็น One Stop Service ที่พร้อมให้คำปรึกษา ออกแบบ ติดตั้ง และรับประกันผลงานอย่างครบวงจร",
    showCta: false,
    items: [
      {
        icon: '/homepage/icons/one-stop-service-icon.svg',
        title: 'One Stop Service',
        description: 'ครบวงจรในที่เดียว\n(จัดหา, ออกแบบ, ติดตั้ง, ซ่อมบำรุง)',
      },
      {
        icon: '/homepage/icons/fast-delivery-icon.svg',
        title: 'Fast Delivery',
        description:
          'จัดส่งไว แก้ปัญหาฉุกเฉิน\n(พร้อม On-site Support 24-48 ชม.)',
      },
      {
        icon: '/homepage/icons/engineering-expertise-icon.svg',
        title: 'Engineering Expertise',
        description: 'ทีมวิศวกรผู้เชี่ยวชาญ\n(ให้คำปรึกษาเชิงเทคนิคทันที)',
      },
      {
        icon: '/homepage/icons/Industrial-standard-icon.svg',
        title: 'Industrial Standard',
        description: 'สินค้ามาตรฐานสากล\n(รับประกันอะไหล่แท้ 100%)',
      },
      {
        icon: '/homepage/icons/customized-solution-icon.svg',
        title: 'Customized Solution',
        description: 'ออกแบบระบบตาม Requirement\nโรงงานของคุณ 100%',
      },
      {
        icon: '/homepage/icons/on-site-support-and-warranty.svg',
        title: 'On-site Support & Warranty',
        description:
          'การรับประกันยืดหยุ่น\nพร้อม On-site Support ด่วน 24-48 ชม.',
      },
    ],
  };

  return (
    <div className="bg-[#F5F5F5]">
      {/* JSON-LD is injected via src/app/about-us/head.tsx (in document head) */}
      <main className="w-full flex flex-col gap-16 justify-center">
        {/* ✅ Hero จาก Pages เท่านั้น (ไม่มี fallback) */}
        {heroBg && heroQuote && (
          <Hero {...heroProps} panel={{ enabled: true, align: 'center' }} />
        )}

        <MotionReveal>
          <div className="w-full container-970 flex flex-col gap-24 lg:gap-16">
            {/* ===== About Head (ใช้ style เดียวกับ Features) ===== */}
            {(aboutBlock.title || aboutBlock.description) && (
              <section className="w-full flex flex-col items-start gap-4">
                <div className="flex items-start lg:items-center justify-start gap-2">
                  <div className="py-3 flex">
                    <span
                      className="w-2 h-2 lg:w-4 lg:h-4 rounded-full inline-block"
                      style={{ background: '#E92928' }}
                    />
                  </div>
                  {aboutBlock.title && (
                    <h3 className="font-['Kanit'] font-medium text-[22px] lg:text-[28px] leading-[33px] lg:leading-[42px] text-[#1063A7]">
                      {aboutBlock.title}
                    </h3>
                  )}
                </div>

                {aboutBlock.description && (
                  <p className="w-full max-w-none lg:max-w-4xl font-['Kanit'] font-normal text-[16px] leading-[24px] lg:text-[22px] lg:leading-[33px] text-[#333333] text-left">
                    {aboutBlock.description}
                  </p>
                )}
              </section>
            )}

            {/* ===== Features Grid (ไม่ซ้ำ title/desc แล้ว) ===== */}
            <Features items={features.items} />

            {(vision.description || mission.description) && (
              <div className="w-full flex flex-col items-start gap-6">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 lg:w-4 lg:h-4 rounded-full bg-[#E92928] inline-block flex-shrink-0" />
                  <h3 className="font-['Kanit'] font-medium text-[22px] lg:text-[28px] leading-[33px] lg:leading-[42px] text-[#1063A7]">
                    วิสัยทัศน์และพันธกิจ
                  </h3>
                </div>

                <div className="flex flex-col md:flex-row items-center justify-center gap-3 w-full">
                  {vision.description && (
                    <div className="w-full bg-[#1063A70A] rounded-[24px] p-6 flex flex-col items-center gap-6">
                      <div className="w-full flex items-center justify-center">
                        <div className="text-center font-['Kanit'] font-medium text-[22px] leading-[33px] text-[#1063A7] underline decoration-[#E92928] underline-offset-8">
                          {vision.title}
                        </div>
                      </div>
                      <div className="w-full flex items-center justify-center text-center">
                        <p className="font-['Kanit'] text-[#333333] text-[16px] lg:text-[22px] leading-[24px] lg:leading-[33px]">
                          {vision.description}
                        </p>
                      </div>
                    </div>
                  )}

                  {mission.description && (
                    <div className="w-full bg-[#1063A70A] rounded-[24px] p-6 flex flex-col items-center gap-6">
                      <div className="w-full flex items-center justify-center">
                        <div className="text-center font-['Kanit'] font-medium text-[22px] leading-[33px] text-[#1063A7] underline decoration-[#E92928] underline-offset-8">
                          {mission.title}
                        </div>
                      </div>
                      <div className="w-full flex items-center justify-center text-center">
                        <p className="font-['Kanit'] text-[#333333] text-[16px] lg:text-[22px] leading-[24px] lg:leading-[33px]">
                          {mission.description}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {(teamImage || warehouseImage) && (
              <div className="w-full flex flex-col items-start gap-6 lg:gap-8">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 lg:w-4 lg:h-4 rounded-full bg-[#E92928]" />
                  <h3 className="font-['Kanit'] font-medium text-[22px] lg:text-[28px] leading-[33px] lg:leading-[42px] text-[#1063A7]">
                    ทีมงานและคลังสินค้า
                  </h3>
                </div>

                <div className="flex flex-col items-start gap-3 lg:gap-4 w-full">
                  {teamImage && (
                    <div className="w-full bg-[#1063A70A] rounded-3xl p-6 flex flex-col items-center gap-6">
                      <div className="rounded-xl overflow-hidden">
                        <Image
                          src={teamImage}
                          alt="team"
                          width={906}
                          height={400}
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                      {teamCaption && (
                        <h4 className="font-['Kanit'] font-medium text-[16px] lg:text-[22px] leading-[24px] lg:leading-[33px] text-[#1063A7] text-center">
                          {teamCaption}
                        </h4>
                      )}
                    </div>
                  )}

                  {warehouseImage && (
                    <div className="w-full bg-[#1063A70A] rounded-3xl p-6 flex flex-col items-center gap-6">
                      <div className="rounded-xl overflow-hidden">
                        <Image
                          src={warehouseImage}
                          alt="warehouse"
                          width={906}
                          height={400}
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                      {warehouseCaption && (
                        <h4 className="font-['Kanit'] font-medium text-[16px] lg:text-[22px] leading-[24px] lg:leading-[33px] text-[#1063A7] text-center">
                          {warehouseCaption}
                        </h4>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {standardsArr.length > 0 && (
              <div className="w-full flex flex-col items-center gap-8">
                <div className="flex items-center gap-2 w-full">
                  <div className="py-3.5 justify-center flex">
                    <span className="w-2 h-2 lg:w-4 lg:h-4 rounded-full bg-[#E92928]" />
                  </div>
                  <h3 className="font-['Kanit'] font-medium text-[22px] lg:text-[28px] leading-[33px] lg:leading-[42px] text-[#1063A7]">
                    มาตรฐานสากลที่รับประกันคุณภาพสินค้าและการบริการ
                  </h3>
                </div>

                {/* กันเลยขอบ: จำกัดความกว้าง + overflow-hidden */}
                <div className="w-full rounded-lg relative overflow-hidden">
                  <div className="mx-auto w-full max-w-[970px] px-2 sm:px-4">
                    <LogoCarousel icons={standardsArr} />
                  </div>
                </div>
              </div>
            )}

            {/* CTA Tail */}
            <div className="w-full flex flex-col items-center">
              <div className="w-full flex flex-col items-center gap-3 py-2">
                <div className="w-full flex flex-col items-center gap-6">
                  <div className="w-full flex flex-col items-center gap-3">
                    <h4 className="font-['Kanit'] font-medium text-[22px] lg:text-[28px] leading-[33px] lg:leading-[42px] text-[#1063A7] text-center underline decoration-[#E92928] underline-offset-8">
                      พร้อมที่จะเริ่มต้นแล้วใช่ไหม?
                    </h4>
                    <p className="font-['Kanit'] text-[16px] lg:text-[22px] leading-[24px] lg:leading-[33px] text-[#333333] text-center">
                      พร้อมร่วมมือกับพาร์ทเนอร์ผู้เชี่ยวชาญที่เชื่อถือได้แล้วหรือยัง?
                    </p>
                  </div>
                  <CTAButton
                    cta={{
                      label: 'ติดต่อเราเพื่อปรึกษาวิศวกรและขอใบเสนอราคา',
                      href: '/contact-us',
                      variant: 'content-primary',
                    }}
                    className="text-[16px] lg:text-[20px] px-5 py-3 shadow-[0px_2px_8px_rgba(0,0,0,0.12)]"
                    asMotion={true}
                  />
                </div>
              </div>
            </div>
          </div>
        </MotionReveal>
      </main>

      {/* Dev overlay removed */}
    </div>
  );
}

export async function generateMetadata(): Promise<Metadata> {
  try {
    const page = await fetchPageBySlug('about-us');
    const attrs = page as unknown as Record<string, unknown> | null;
    const seo = (attrs && (attrs['SEO'] as Record<string, unknown>)) || null;
    return buildMetadataFromSeo(seo, { defaultCanonical: '/about-us' });
  } catch {
    return {} as Metadata;
  }
}
