import Hero from '@/components/Hero';
import Features from '@/components/Features';
import Image from 'next/image';
import LogoCarousel from '@/components/LogoCarousel';
import CTAButton from '@/components/CTAButton';
import { MotionReveal } from '@/components/MotionReveal';

export default function AboutUsPage() {
  const pageData = {
    hero: {
      title: {
        desktop: {
          inline: true,
          segments: [
            [
              { text: 'THAIPARTS', color: 'brandBlue' as const },
              { text: 'INFINITY', color: 'accentRed' as const },
            ],
            [
              {
                text: 'พาร์ทเนอร์ผู้เชี่ยวชาญด้านระบบ',
                color: 'brandBlue' as const,
              },
              { text: 'อุตสาหกรรมครบวงจร', color: 'accentRed' as const },
            ],
          ],
        },
        mobile: {
          inline: true,
          // group the mobile lines so THAIPARTS + INFINITY can be inline together
          lines: [
            [
              { text: 'THAIPARTS', color: 'brandBlue' as const },
              { text: 'INFINITY', color: 'accentRed' as const },
            ],
            [
              {
                text: 'พาร์ทเนอร์ผู้เชี่ยวชาญด้านระบบ',
                color: 'brandBlue' as const,
              },
              { text: 'อุตสาหกรรมครบวงจร', color: 'accentRed' as const },
            ],
          ],
        },
      },
      subtitle:
        'เราช่วยลดความเสี่ยงการหยุดทำงาน และเพิ่มประสิทธิภาพการผลิตให้กับโรงงานอุตสาหกรรมชั้นนำ',
      background: '/contact/contact-hero.png',
    },
  };

  const features = {
    // Grouped title: small section heading + descriptive tagline on next line
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
      {/* Main page layout */}
      <main className="w-full flex flex-col gap-16 justify-center">
        <Hero
          title={pageData.hero.title}
          subtitle={pageData.hero.subtitle}
          background="/about-us/about-us-hero.png"
          ctas={[]} // Contact page hero doesn't need CTA buttons
          panel={{ enabled: false, align: 'left' }}
        />
        <MotionReveal>
          <div className="w-full container-970 flex flex-col gap-24 lg:gap-16">
            <Features {...features} />

            {/* Additional sections below the features grid - updated layout to match design */}
            {/* 1) Story / History two-card section (responsive, Tailwind-only) */}
            <div className="w-full flex flex-col items-start gap-6">
              {/* Title row */}
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 lg:w-4 lg:h-4 rounded-full bg-[#E92928] inline-block flex-shrink-0" />
                <h3 className="font-['Kanit'] font-medium text-[22px] lg:text-[28px] leading-[33px] lg:leading-[42px] text-[#1063A7]">
                  เรื่องราวและประวัติความเป็นมา
                </h3>
              </div>

              {/* Cards: stacked on mobile, side-by-side on md+ */}
              <div className="flex flex-col md:flex-row items-center justify-center gap-3 w-full">
                {/* Service Card 1 */}
                <div className="w-full bg-[#1063A70A] rounded-[24px] p-6 flex flex-col items-center gap-6">
                  <div className="w-full flex items-center justify-center">
                    <div className="text-center font-['Kanit'] font-medium text-[22px] leading-[33px] text-[#1063A7] underline decoration-[#E92928] underline-offset-8">
                      วิสัยทัศน์
                    </div>
                  </div>

                  <div className="w-full flex items-center justify-center text-center">
                    <p className="font-['Kanit'] font-normal text-[16px] lg:text-[22px] leading-[24px] lg:leading-[33px] text-[#333333]">
                      มุ่งสู่การเป็นผู้ให้บริการโซลูชันอุตสาหกรรมครบวงจร
                      ที่ช่วยลด Downtime และเพิ่มประสิทธิภาพการผลิต
                    </p>
                  </div>
                </div>

                {/* Service Card 2 */}
                <div className="w-full bg-[#1063A70A] rounded-[24px] p-6 flex flex-col items-center gap-6">
                  <div className="w-full flex items-center justify-center">
                    <div className="text-center font-['Kanit'] font-medium text-[22px] leading-[33px] text-[#1063A7] underline decoration-[#E92928] underline-offset-8">
                      พันธกิจ
                    </div>
                  </div>

                  <div className="w-full flex items-center justify-center text-center">
                    <p className="font-['Kanit'] font-normal text-[16px] lg:text-[22px] leading-[24px] lg:leading-[33px] text-[#333333]">
                      ให้บริการแบบ One Stop Service พร้อมออกแบบ ติดตั้ง
                      และรับประกันผลงานอย่างครบวงจร
                    </p>
                  </div>
                </div>
              </div>
            </div>
            {/* 2) Team & Warehouse images (stacked) - responsive mobile-first */}
            <div className="w-full flex flex-col items-start gap-6 lg:gap-8">
              {/* Title row */}
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 lg:w-4 lg:h-4 rounded-full bg-[#E92928] inline-block flex-shrink-0" />
                <h3 className="font-['Kanit'] font-medium text-[22px] lg:text-[28px] leading-[33px] lg:leading-[42px] text-[#1063A7]">
                  ทีมงานและคลังสินค้า
                </h3>
              </div>

              {/* Stacked cards */}
              <div className="flex flex-col items-start gap-3 lg:gap-4 w-full">
                {/* Top service card: Team */}
                <div className="w-full bg-[#1063A70A] rounded-3xl lg:rounded-2xl p-6 lg:p-4 gap-6 lg:gap-4 flex flex-col items-center">
                  <div className="rounded-xl lg:rounded-2xl overflow-hidden">
                    <Image
                      src="/about-us/team.png"
                      alt="team"
                      width={906}
                      height={400}
                      // Make responsive: fill container width and preserve aspect ratio
                      className="w-226.5 h-100 object-cover"
                    />
                  </div>
                  <h4 className="font-['Kanit'] font-medium text-[16px] lg:text-[22px] leading-[24px] lg:leading-[33px] text-[#1063A7]">
                    ทีมงานที่เชี่ยวชาญในการจัดหา คัดเลือก
                    และให้คำปรึกษาด้านอะไหล่โดยเฉพาะ
                  </h4>
                </div>

                {/* Bottom service card: Warehouse */}
                <div className="w-full bg-[#1063A70A] rounded-3xl lg:rounded-2xl p-6 lg:p-4 gap-6 lg:gap-4 flex flex-col items-center">
                  <div className="rounded-xl lg:rounded-2xl overflow-hidden">
                    <Image
                      src="/about-us/warehouse.png"
                      alt="warehouse"
                      width={906}
                      height={400}
                      // Make responsive: fill container width and preserve aspect ratio
                      className="w-226.5 h-100 object-cover"
                    />
                  </div>
                  <h4 className="font-['Kanit'] font-medium text-[16px] lg:text-[22px] leading-[24px] lg:leading-[33px] text-[#1063A7] text-center">
                    คลังสินค้าและ ระบบการจัดการสต็อกที่ทันสมัย
                  </h4>
                </div>
              </div>
            </div>

            {/* 3) Standards + CTA - responsive mobile-first */}
            <div className="w-full flex flex-col items-center gap-8">
              {/* Header */}
              <div className="flex items-center gap-2 w-full">
                <div className="py-3.5 justify-center flex">
                  <span className="w-2 h-2 lg:w-4 lg:h-4 rounded-full bg-[#E92928] inline-block" />
                </div>
                <h3 className="font-['Kanit'] font-medium text-[22px] lg:text-[28px] leading-[33px] lg:leading-[42px] text-[#1063A7]">
                  มาตรฐานสากลที่รับประกันคุณภาพสินค้าและการบริการ
                </h3>
              </div>

              {/* Logos bar (background layer + centered icons) */}
              <div className="w-full rounded-lg">
                <LogoCarousel
                  icons={[
                    '/about-us/icons/iso-icon.svg',
                    '/about-us/icons/ce-icon.svg',
                    '/about-us/icons/atex-icon.svg',
                    '/about-us/icons/iec-icon.svg',
                  ]}
                />
              </div>
            </div>

            <div className="w-full flex flex-col items-center">
              {/* CTA area - matches design spec (mobile-first) */}
              <div className="w-full flex flex-col items-center gap-3 py-2">
                <div className="w-full flex flex-col items-center gap-6">
                  <div className="w-full flex flex-col items-center gap-3">
                    <h4 className="font-['Kanit'] font-medium text-[22px] lg:text-[28px] leading-[33px] lg:leading-[42px] text-[#1063A7] text-center underline decoration-[#E92928] underline-offset-8">
                      พร้อมที่จะเริ่มต้นแล้วใช่ไหม?
                    </h4>

                    <p className="font-['Kanit'] text-[16px] lg:text-[22px] leading-[24px] lg:leading-[33px] text-[#333333] text-center px-2 lg:px-0">
                      พร้อมร่วมมือกับพาร์ทเนอร์ผู้เชี่ยวชาญที่เชื่อถือได้แล้วหรือยัง?
                    </p>
                  </div>
                  <CTAButton
                    cta={{
                      label: 'ติดต่อเราเพื่อปรึกษาวิศวกรและขอใบเสนอราคา',
                      href: '/contact-us',
                      variant: 'content-primary',
                    }}
                    className="text-[16px] leading-[24px] lg:text-[20px] lg:leading-[30px] px-5 py-3 shadow-[0px_2px_8px_rgba(0,0,0,0.12)]"
                    asMotion={true}
                  />
                </div>
              </div>
            </div>
          </div>
        </MotionReveal>
      </main>
    </div>
  );
}
