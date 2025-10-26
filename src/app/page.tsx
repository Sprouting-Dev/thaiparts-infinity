// src/app/page.tsx
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import GridPreview from '@/components/GridPreview';
import CTAButton from '@/components/CTAButton';
import { MotionReveal } from '@/components/MotionReveal';
import { fetchHome as fetchHomeFromCms, fetchPageBySlug } from '@/lib/cms';
import { mediaUrl } from '@/lib/strapi';
import { getColorByTagName } from '@/lib/categoryBadge';

/** ========== ENV / Debug ========== */
const isDev = process.env.NODE_ENV !== 'production';

function dbg(where: string, level: 'info' | 'warn' | 'error', msg: string) {
  if (!isDev) return;
  const tag = `[HOME][${where}]`;
  (console as any)[level](`${tag} ${msg}`);
}

/** Dev-only overlay แจ้งฟิลด์ที่ยังขาด */
function DebugOverlay({ missing }: { missing: string[] }) {
  if (!isDev || missing.length === 0) return null;
  return (
    <div
      style={{
        position: 'fixed',
        left: 12,
        bottom: 12,
        zIndex: 9999,
        background: 'rgba(233,41,40,0.92)',
        color: '#fff',
        padding: '10px 12px',
        borderRadius: 8,
        maxWidth: 360,
        boxShadow: '0 6px 24px rgba(0,0,0,0.25)',
        fontFamily:
          'ui-sans-serif, system-ui, -apple-system, "Kanit", "Segoe UI"',
        fontSize: 12,
        lineHeight: '18px',
      }}
    >
      <div style={{ fontWeight: 700, marginBottom: 6 }}>
        Missing from Strapi
      </div>
      <ul style={{ paddingLeft: 16, margin: 0 }}>
        {missing.map((m, i) => (
          <li key={i} style={{ marginBottom: 2 }}>
            {m}
          </li>
        ))}
      </ul>
    </div>
  );
}

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
  } catch (e: any) {
    dbg('fetchHomeData', 'error', e?.message || String(e));
    return { page: null, home: null };
  }
}

/** ========== Page ========== */
export default async function HomePage() {
  const { page, home } = await fetchHomeData();
  const missing: string[] = [];

  /** ---------- Hero จาก Pages (ไม่มี fallback) ---------- */
  const heroQuote = page?.quote ?? '';
  if (!heroQuote) {
    missing.push('Page(Hero): quote');
    dbg('Hero', 'warn', 'missing quote');
  }

  // Resolve hero background via centralized mediaUrl helper
  const heroBg = mediaUrl((page as any)?.hero_image);
  if (!heroBg) {
    missing.push('Page(Hero): hero_image');
    dbg('Hero', 'warn', 'missing hero_image');
  }

  const heroProps = {
    title: '',
    background: heroBg,
    subtitle: '',
    ctas: [], // ถ้าต้องการ map button_1/button_2 เป็น CTA button ให้ต่อยอดตรงนี้ได้
    panel: { enabled: true as const, align: 'center' as const },
    hero_schema: heroQuote
      ? {
          quote: String(heroQuote),
          button_1: page?.button_1,
          button_2: page?.button_2,
          isShowButton:
            typeof page?.isShowButton === 'boolean'
              ? page?.isShowButton
              : undefined,
        }
      : undefined,
  };

  /** ---------- About (SharedTitleWithDescriptionComponent) ---------- */
  const aboutTitle = home?.Home?.title ?? '';
  const aboutDesc = home?.Home?.description ?? '';
  if (!aboutTitle && !aboutDesc) missing.push('Home(About): title/description');

  /** ---------- Normalizers ---------- */
  const normalizeRel = (rel: any) => {
    if (!rel?.data) return [];
    return Array.isArray(rel.data)
      ? rel.data.map((e: any) => ({ id: e.id, ...e.attributes }))
      : [];
  };

  /** ---------- Products ---------- */
  const productsList = normalizeRel(home?.products);
  if (productsList.length === 0) missing.push('Home(products): empty');

  const products = {
    kind: 'products' as const,
    title: 'อะไหล่และระบบที่เราเชี่ยวชาญ',
    cta: {
      label: 'สินค้าทั้งหมด',
      href: '/products',
      variant: 'primary' as const,
    },
    items: productsList.map((p: any) => ({
      id: p.id,
      title: p.title, // required
      slug: p.slug, // required
      tag: p.tag, // required
      categoryBadge: { label: p.tag, color: getColorByTagName(p.tag) },
      description: p.description,
      mainTitle: p.main_title, // required by schema
      image: mediaUrl(p.image),
      seo: p.SEO,
      href: `/products/${p.slug}`,
    })),
  };

  /** ---------- Services ---------- */
  const servicesList = normalizeRel(home?.services);
  if (servicesList.length === 0) missing.push('Home(services): empty');

  const services = {
    kind: 'services' as const,
    title: 'บริการและโซลูชันวิศวกรรม',
    cta: {
      label: 'บริการทั้งหมด',
      href: '/services',
      variant: 'primary' as const,
    },
    items: servicesList.map((s: any) => ({
      id: s.id,
      title: s.title, // required
      slug: s.slug, // required
      subtitle: s.subtitle,
      content: s.content,
      image: mediaUrl(s.image),
      seo: s.SEO,
      href: `/services/${s.slug}`,
    })),
  };

  /** ---------- Articles ---------- */
  const articlesList = normalizeRel(home?.articles);
  if (articlesList.length === 0) missing.push('Home(articles): empty');

  const articles = {
    kind: 'articles' as const,
    title: 'ศูนย์รวมความเชี่ยวชาญ',
    cta: {
      label: 'บทความทั้งหมด',
      href: '/articles',
      variant: 'primary' as const,
    },
    items: articlesList.map((a: any) => ({
      id: a.id,
      title: a.title, // required
      slug: a.slug, // required
      subtitle: a.subtitle,
      readTime: a.read_time,
      content: a.content,
      image: mediaUrl(a.image),
      seo: a.SEO,
      href: `/articles/${a.slug}`,
    })),
  };

  return (
    <div className="bg-[#F5F5F5]">
      <main className="w-full flex flex-col gap-16 justify-center items-center">
        {/* ✅ แสดง Hero เฉพาะเมื่อข้อมูลมาจริงจาก Strapi */}
        {heroBg && heroQuote && <Hero {...(heroProps as any)} />}

        <MotionReveal>
          <div className="container-970 flex flex-col gap-16">
            {/* About: ใช้สไตล์หัวข้อเดียวกับ Features (จุดแดง + ระยะห่าง) */}
            {(aboutTitle || aboutDesc) && (
              <section className="w-full flex flex-col items-start gap-4">
                <div className="flex items-start lg:items-center gap-2">
                  <div className="py-3">
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

      {/* Dev-only overlay */}
      <DebugOverlay missing={missing} />
    </div>
  );
}
