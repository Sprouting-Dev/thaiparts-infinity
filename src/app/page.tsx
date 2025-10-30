// src/app/page.tsx
import Hero from '@/components/Hero';
import type { Metadata } from 'next';
import Features from '@/components/Features';
import GridPreview from '@/components/GridPreview';
import CTAButton from '@/components/CTAButton';
import { MotionReveal } from '@/components/MotionReveal';
import {
  fetchHome as fetchHomeFromCms,
  fetchPageBySlug,
  fetchServices,
  fetchArticles,
} from '@/lib/cms';
import { mediaUrl } from '@/lib/strapi';
import { buildMetadataFromSeo } from '@/lib/seo';
import type { PossibleMediaInput } from '@/types/strapi';
import type { PageAttributes } from '@/types/cms';
import { getColorByTagName } from '@/lib/categoryBadge';
import { logger } from '@/lib/logger';

/** ========== ENV / Debug ========== */
// Dev-only guards removed for production readiness.

// Removed development-only DebugOverlay to clean production output.

/** ========== Helpers ========== */

/** ========== Fetch Strapi ========== */
// Use centralized CMS fetchers
async function fetchHomeData() {
  try {
    const [page, home] = await Promise.all([
      fetchPageBySlug('home'),
      fetchHomeFromCms(),
    ]);
    return { page, home };
  } catch (err) {
    const e = err as Error | undefined;
    logger.error('[HOME][fetchHomeData]', e?.message || String(e));
    return { page: null, home: null };
  }
}

/** ========== Page ========== */
export default async function HomePage() {
  const { page, home } = await fetchHomeData();
  // structuredData is injected into <head> via src/app/head.tsx

  /** ---------- Hero จาก Pages (ไม่มี fallback) ---------- */
  const heroQuote = (page as PageAttributes | null)?.quote ?? '';
  if (!heroQuote) {
    logger.warn('[HOME][Hero] missing quote');
  }

  // Resolve hero background via centralized mediaUrl helper
  const heroBg = mediaUrl(
    (page as PageAttributes | null)?.hero_image as PossibleMediaInput
  );
  if (!heroBg) {
    logger.warn('[HOME][Hero] missing hero_image');
  }

  const heroProps = {
    title: '',
    background: heroBg,
    subtitle: '',
    ctas: [], // ถ้าต้องการ map button_1/button_2 เป็น CTA button ให้ต่อยอดตรงนี้ได้
    panel: { enabled: true as const, align: 'center' as const },
    hero_schema: (() => {
      if (!heroQuote) return undefined;
      const b1 =
        typeof (page as Record<string, unknown> | undefined)?.['button_1'] ===
        'string'
          ? ((page as Record<string, unknown>)['button_1'] as string)
          : undefined;
      const b2 =
        typeof (page as Record<string, unknown> | undefined)?.['button_2'] ===
        'string'
          ? ((page as Record<string, unknown>)['button_2'] as string)
          : undefined;
      const isShow =
        typeof (page as Record<string, unknown> | undefined)?.[
          'isShowButton'
        ] === 'boolean'
          ? ((page as Record<string, unknown>)['isShowButton'] as boolean)
          : undefined;
      return {
        quote: String(heroQuote),
        button_1: b1,
        button_2: b2,
        isShowButton: isShow,
      } as const;
    })(),
  };

  /** ---------- About (SharedTitleWithDescriptionComponent) ---------- */
  // Safely extract title/description from various possible shapes returned by Strapi
  const homeRec = home as Record<string, unknown> | undefined;
  const extractTitle = (): string => {
    if (!homeRec) return '';
    const keys = [
      'Home',
      'home',
      'SharedTitleWithDescriptionComponent',
      'sharedTitleWithDescriptionComponent',
      'shared_title_with_description_component',
    ];
    for (const k of keys) {
      const v = homeRec[k];
      if (!v) continue;
      if (typeof v === 'string') return v;
      if (typeof v === 'object' && v !== null) {
        const inner = v as Record<string, unknown>;
        if (typeof inner['title'] === 'string') return inner['title'] as string;
      }
    }
    return '';
  };
  const extractDescription = (): string => {
    if (!homeRec) return '';
    const keys = [
      'Home',
      'home',
      'SharedTitleWithDescriptionComponent',
      'sharedTitleWithDescriptionComponent',
      'shared_title_with_description_component',
    ];
    for (const k of keys) {
      const v = homeRec[k];
      if (!v) continue;
      if (typeof v === 'object' && v !== null) {
        const inner = v as Record<string, unknown>;
        if (typeof inner['description'] === 'string')
          return inner['description'] as string;
      }
    }
    return '';
  };

  const aboutTitle = extractTitle();
  const aboutDesc = extractDescription();
  if (!aboutTitle && !aboutDesc)
    logger.warn('[HOME][Home] Home(About): title/description missing');

  /** ---------- Normalizers ---------- */
  const normalizeRel = (rel: unknown) => {
    if (!rel || typeof rel !== 'object')
      return [] as Array<{ id?: number } & Record<string, unknown>>;
    const asObj = rel as { data?: unknown };
    if (!asObj.data)
      return [] as Array<{ id?: number } & Record<string, unknown>>;
    if (!Array.isArray(asObj.data))
      return [] as Array<{ id?: number } & Record<string, unknown>>;
    return (asObj.data as unknown[]).map(e => {
      const record = e as { id?: number; attributes?: unknown };
      return {
        id: record.id,
        ...((record.attributes as Record<string, unknown>) ?? {}),
      } as { id?: number } & Record<string, unknown>;
    });
  };

  /** ---------- Products ---------- */
  const productsList = normalizeRel(home?.products);
  if (productsList.length === 0)
    logger.warn('[HOME][Home] Home(products): empty');

  const products = {
    kind: 'products' as const,
    title: 'อะไหล่และระบบที่เราเชี่ยวชาญ',
    cta: {
      label: 'สินค้าทั้งหมด',
      href: '/products',
      variant: 'primary' as const,
    },
    items: productsList.map(p => {
      const rec = p as { id?: number } & Record<string, unknown>;
      const maybeImage: PossibleMediaInput = rec['image'] as PossibleMediaInput;
      return {
        id: rec.id,
        title: (rec['title'] as string) ?? '',
        slug: (rec['slug'] as string) ?? '',
        tag: (rec['tag'] as string) ?? '',
        categoryBadge: {
          label: (rec['tag'] as string) ?? '',
          color: getColorByTagName((rec['tag'] as string) ?? ''),
        },
        description: (rec['description'] as string) ?? '',
        mainTitle: (rec['main_title'] as string) ?? '',
        image: mediaUrl(maybeImage),
        seo: rec['SEO'],
        href: `/products/${(rec['slug'] as string) ?? ''}`,
      };
    }),
  };

  /** ---------- Services ---------- */
  let servicesList = normalizeRel(home?.services);
  // If home payload didn't include services, fetch them directly as a robust fallback
  if (servicesList.length === 0) {
    try {
      const svc = await fetchServices({ page: 1, pageSize: 3 });
      // svc.items are in Strapi list shape: { id, attributes }. Flatten to { id, ...attributes }
      servicesList = (svc.items ?? []).map((it: unknown) => {
        const rec = it as { id?: number; attributes?: unknown };
        return {
          id: rec.id,
          ...((rec.attributes as Record<string, unknown>) ?? {}),
        } as { id?: number } & Record<string, unknown>;
      });
    } catch {
      // keep servicesList empty and report missing
    }
  }
  if (servicesList.length === 0)
    logger.warn('[HOME][Home] Home(services): empty');

  const services = {
    kind: 'services' as const,
    title: 'บริการและโซลูชันวิศวกรรม',
    cta: {
      label: 'บริการทั้งหมด',
      href: '/services',
      variant: 'primary' as const,
    },
    items: servicesList.map(s => {
      const rec = s as { id?: number } & Record<string, unknown>;
      // Prefer `cover_image` (newer Strapi field) and fall back to legacy `image`
      const maybeServiceImage =
        (rec['cover_image'] as PossibleMediaInput) ??
        (rec['image'] as PossibleMediaInput);
      return {
        id: rec.id,
        title: (rec['title'] as string) ?? '',
        slug: (rec['slug'] as string) ?? '',
        subtitle: (rec['subtitle'] as string) ?? '',
        content: rec['content'],
        image: mediaUrl(maybeServiceImage),
        seo: rec['SEO'],
        href: `/services/${(rec['slug'] as string) ?? ''}`,
      };
    }),
  };

  /** ---------- Articles ---------- */
  let articlesList = normalizeRel(home?.articles);
  if (articlesList.length === 0) {
    try {
      const art = await fetchArticles({ page: 1, pageSize: 3 });
      articlesList = (art.items ?? []).map((it: unknown) => {
        const rec = it as { id?: number; attributes?: unknown };
        return {
          id: rec.id,
          ...((rec.attributes as Record<string, unknown>) ?? {}),
        } as { id?: number } & Record<string, unknown>;
      });
    } catch {
      // keep empty
    }
  }
  if (articlesList.length === 0)
    logger.warn('[HOME][Home] Home(articles): empty');

  const articles = {
    kind: 'articles' as const,
    title: 'ศูนย์รวมความเชี่ยวชาญ',
    cta: {
      label: 'บทความทั้งหมด',
      href: '/articles',
      variant: 'primary' as const,
    },
    items: articlesList.map(a => {
      const rec = a as { id?: number } & Record<string, unknown>;
      return {
        id: rec.id,
        title: (rec['title'] as string) ?? '',
        slug: (rec['slug'] as string) ?? '',
        subtitle: (rec['subtitle'] as string) ?? '',
        readTime: rec['read_time'],
        content: rec['content'],
        image: mediaUrl(rec['image'] as PossibleMediaInput),
        seo: rec['SEO'],
        href: `/articles/${(rec['slug'] as string) ?? ''}`,
      };
    }),
  };

  return (
    <div className="bg-[#F5F5F5]">
      {/* JSON-LD is injected via src/app/head.tsx (in document head) */}
      <main className="w-full flex flex-col gap-16 justify-center items-center">
        {/* ✅ แสดง Hero เฉพาะเมื่อข้อมูลมาจริงจาก Strapi */}
        {heroBg && heroQuote && (
          <Hero
            title={heroProps.title}
            subtitle={heroProps.subtitle}
            background={heroProps.background}
            ctas={heroProps.ctas}
            panel={heroProps.panel}
            hero_schema={heroProps.hero_schema}
          />
        )}

        <MotionReveal>
          <div className="container-970 flex flex-col gap-16">
            {/* About: ใช้สไตล์หัวข้อเดียวกับ Features (จุดแดง + ระยะห่าง) */}
            {(aboutTitle || aboutDesc) && (
              <section className="w-full flex flex-col items-start gap-4">
                <div className="flex items-start lg:items-center gap-2">
                  <div className="py-3 flex">
                    <span className="w-2 h-2 lg:w-4 lg:h-4 rounded-full inline-block bg-[#E92928]" />
                  </div>
                  {aboutTitle && (
                    <h3 className="font-['Kanit'] font-medium text-[22px] lg:text-[28px] text-[#1063A7] leading-[33px] lg:leading-[42px]">
                      {aboutTitle}
                    </h3>
                  )}
                </div>
                {aboutDesc && (
                  <>
                    <p className="font-['Kanit'] text-[16px] lg:text-[22px] text-[#333333] leading-[24px] lg:leading-[33px]">
                      {aboutDesc}
                    </p>

                    {/* CTA under About description */}
                    <div>
                      <CTAButton
                        cta={{
                          label: 'เรียนรู้เรื่องราวของเรา',
                          href: '/about-us',
                          variant: 'content-primary',
                        }}
                        className="px-4 py-2 text-[16px] lg:text-[18px]"
                        asMotion={true}
                      />
                    </div>
                  </>
                )}
              </section>
            )}

            {/* Features: ใช้เฉพาะ items (ไม่ซ้ำกับ About) */}
            <Features
              items={[
                {
                  icon: '/homepage/icons/one-stop-service-icon.svg',
                  title: 'One Stop Service',
                  description:
                    'ครบวงจรในที่เดียว \n(จัดหา, ออกแบบ, ติดตั้ง, ซ่อมบำรุง)',
                },
                {
                  icon: '/homepage/icons/fast-delivery-icon.svg',
                  title: 'Fast Delivery',
                  description:
                    'จัดส่งไว แก้ปัญหาฉุกเฉิน \n(พร้อม On-site Support 24-48 ชม.)',
                },
                {
                  icon: '/homepage/icons/engineering-expertise-icon.svg',
                  title: 'Engineering Expertise',
                  description:
                    'ทีมวิศวกรผู้เชี่ยวชาญ \n(ให้คำปรึกษาเชิงเทคนิคทันที)',
                },
                {
                  icon: '/homepage/icons/Industrial-standard-icon.svg',
                  title: 'Industrial Standard',
                  description: 'สินค้ามาตรฐานสากล \n(รับประกันอะไหล่แท้ 100%)',
                },
                {
                  icon: '/homepage/icons/customized-solution-icon.svg',
                  title: 'Customized Solution',
                  description: 'ออกแบบระบบตาม Requirement โรงงานของคุณ 100%',
                },
                {
                  icon: '/homepage/icons/on-site-support-and-warranty.svg',
                  title: 'On-site Support & Warranty',
                  description:
                    'การรับประกันยืดหยุ่น พร้อม On-site Support ด่วน 24-48 ชม.',
                },
              ]}
            />

            {products.items.length > 0 && <GridPreview section={products} />}
            {services.items.length > 0 && <GridPreview section={services} />}
            {articles.items.length > 0 && <GridPreview section={articles} />}
          </div>
        </MotionReveal>
      </main>

      {/* Dev overlay removed */}
    </div>
  );
}

// Per-page SEO: map Page.SEO to Next Metadata
export async function generateMetadata(): Promise<Metadata> {
  try {
    const page = await fetchPageBySlug('home');
    const attrs = page as unknown as Record<string, unknown> | null;
    const seo = (attrs && (attrs['SEO'] as Record<string, unknown>)) || null;
    return buildMetadataFromSeo(seo, { defaultCanonical: '/' });
  } catch {
    return {} as Metadata;
  }
}
