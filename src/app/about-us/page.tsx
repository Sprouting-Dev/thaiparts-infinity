// src/app/about-us/page.tsx
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import Image from 'next/image';
import LogoCarousel from '@/components/LogoCarousel';
import CTAButton from '@/components/CTAButton';
import { MotionReveal } from '@/components/MotionReveal';
import { fetchPageBySlug } from '@/lib/cms';
import { mediaUrl, STRAPI_URL } from '@/lib/strapi';

/** ========== ENV / Debug ========== */
const isDev = process.env.NODE_ENV !== 'production';
const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN;
function dbg(where: string, level: 'info' | 'warn' | 'error', msg: string) {
  if (!isDev) return;
  const tag = `[ABOUT-US][${where}]`;
  (console as any)[level](`${tag} ${msg}`);
}

/** ========== Fetchers ========== */
/** 1) Hero จาก Collection Type: pages (re-use ได้หลายหน้า) */
// Use centralized page fetcher for hero (ensures hero_image handling is consistent)
async function fetchPageHeroBySlug(slug: string) {
  try {
    const entry = await fetchPageBySlug(slug);
    return entry as Record<string, unknown> | null;
  } catch (e: any) {
    dbg('fetchPageHero', 'error', e?.message || String(e));
    return null;
  }
}

/** 2) เนื้อหาอื่น ๆ จาก Single Type: about-us */
async function fetchAboutSingle() {
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
      dbg('fetchAboutSingle', 'error', `HTTP ${res.status}`);
      return null;
    }
    return (await res.json()) as any;
  } catch (e: any) {
    dbg('fetchAboutSingle', 'error', e?.message || String(e));
    return null;
  }
}

/** ========== Helpers ========== */

const pickTitleDesc = (v: any): { title: string; description: string } => {
  if (!v) return { title: '', description: '' };
  if (v?.title || v?.description) {
    return { title: v.title ?? '', description: v.description ?? '' };
  }
  const att = v?.data?.attributes;
  if (att) {
    return { title: att.title ?? '', description: att.description ?? '' };
  }
  return { title: '', description: '' };
};

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

/** ========== Page ========== */
export default async function AboutUsPage() {
  // ดึง Hero จาก pages (slug=about-us) และเนื้อหาอื่นจาก about-us single type
  const [pageHero, aboutJson] = await Promise.all([
    fetchPageHeroBySlug('about-us'),
    fetchAboutSingle(),
  ]);

  const aboutAttrs = (aboutJson?.data?.attributes ?? null) as Record<
    string,
    unknown
  > | null;

  const missing: string[] = [];

  /** ---------- Hero จาก Pages (re-use) ---------- */
  const heroQuote = (pageHero as any)?.quote ?? '';
  if (!heroQuote) {
    missing.push('Page(Hero): quote');
    dbg('Hero', 'warn', 'missing quote from pages');
  } else {
    dbg('Hero', 'info', 'quote OK from pages');
  }

  const heroBg = mediaUrl((pageHero as any)?.hero_image);
  if (!heroBg) {
    missing.push('Page(Hero): hero_image');
    dbg('Hero', 'warn', 'missing hero_image from pages');
  } else {
    dbg('Hero', 'info', 'background OK from pages');
  }

  const heroProps = {
    title: '', // no fallback text
    background: heroBg,
    subtitle: '',
    ctas: [],
    panel: { enabled: false as const, align: 'left' as const },
    hero_schema: heroQuote ? { quote: String(heroQuote) } : undefined,
  };

  /** ---------- เนื้อหาอื่นจาก Single Type: about-us ---------- */
  // About block
  const aboutBlock = pickTitleDesc((aboutAttrs as any)?.About);
  if (!aboutBlock.title && !aboutBlock.description) {
    missing.push('About: title/description');
  }

  // Vision & Mission
  const vision = pickTitleDesc((aboutAttrs as any)?.vision);
  if (!vision.title) missing.push('Vision: title');
  if (!vision.description) missing.push('Vision: description');

  const mission = pickTitleDesc((aboutAttrs as any)?.mission);
  if (!mission.title) missing.push('Mission: title');
  if (!mission.description) missing.push('Mission: description');

  // Team
  const teamComp = (aboutAttrs as any)?.Team as
    | { image?: unknown; description?: string }
    | undefined;
  const teamImage = mediaUrl(teamComp?.image);
  const teamCaption = teamComp?.description ?? '';
  if (!teamComp) missing.push('Team: component');
  else {
    if (!teamImage) missing.push('Team: image');
    if (!teamCaption) missing.push('Team: description');
  }

  // Warehouse
  const warehouseComp = (aboutAttrs as any)?.Warehouse as
    | { image?: unknown; description?: string }
    | undefined;
  const warehouseImage = mediaUrl(warehouseComp?.image);
  const warehouseCaption = warehouseComp?.description ?? '';
  if (!warehouseComp) missing.push('Warehouse: component');
  else {
    if (!warehouseImage) missing.push('Warehouse: image');
    if (!warehouseCaption) missing.push('Warehouse: description');
  }

  // Standards
  const standardsArr: string[] = [];
  const standards = (aboutAttrs as any)?.Standards?.data;
  if (Array.isArray(standards)) {
    for (const d of standards) {
      // Use centralized mediaUrl to resolve icon URLs or media objects
      const resolved = mediaUrl(d?.attributes?.url);
      if (resolved) standardsArr.push(resolved);
    }
  }
  if (standardsArr.length === 0) {
    missing.push('Standards: icons');
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
      <main className="w-full flex flex-col gap-16 justify-center">
        {/* ✅ Hero จาก Pages เท่านั้น (ไม่มี fallback) */}
        {heroBg && heroQuote && <Hero {...(heroProps as any)} panel="center" />}

        <MotionReveal>
          <div className="w-full container-970 flex flex-col gap-24 lg:gap-16">
            {/* ===== About Head (ใช้ style เดียวกับ Features) ===== */}
            {(aboutBlock.title || aboutBlock.description) && (
              <section className="w-full flex flex-col items-start gap-4">
                <div className="flex items-start lg:items-center justify-start gap-2">
                  <div className="py-3">
                    <span
                      className="w-[8px] h-[8px] lg:w-4 lg:h-4 rounded-full inline-block"
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

      {/* Dev-only overlay */}
      <DebugOverlay missing={missing} />
    </div>
  );
}
