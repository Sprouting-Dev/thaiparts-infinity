import Hero from '@/components/Hero';
import Features from '@/components/Features';
import GridPreview from '@/components/GridPreview';
import { MotionReveal } from '@/components/MotionReveal';

export default function Page() {
  // Static content for delivery - no Strapi dependency
  const hero = {
    title: {
      desktop: {
        segments: [
          [
            { text: 'พาร์ทเนอร์ผู้เชี่ยวชาญระบบ', color: 'brandBlue' as const },
            {
              text: 'Automation, Electrical และ Instrument ครบวงจร',
              color: 'accentRed' as const,
            },
          ],
        ],
      },
      mobile: {
        lines: [
          { text: 'พาร์ทเนอร์ผู้เชี่ยวชาญระบบ', color: 'brandBlue' as const },
          {
            text: 'Automation, Electrical และ Instrument ครบวงจร',
            color: 'accentRed' as const,
          },
        ],
      },
    },
    background: '/homepage/homepage-hero.png',
    subtitle:
      'เราดูแลระบบและจัดหาอะไหล่ ตั้งแต่ต้นจนจบ\nมั่นใจได้ว่าเครื่องจักรของคุณจะเดินหน้าอย่างราบรื่น ไม่มีสะดุด',
    ctas: [
      {
        label: 'ปรึกษาวิศวกร',
        href: '/contact-us',
        variant: 'primary',
        newTab: false,
      },
      {
        label: 'ดูสินค้าและอะไหล่ทั้งหมด',
        href: '/products',
        variant: 'secondary',
        newTab: false,
      },
    ],
    panel: {
      enabled: true,
      align: 'center' as const,
    },
  };

  const features = {
    titleSegments: [
      { text: 'THAIPARTS', color: 'blue' as const },
      { text: 'INFINITY', color: 'red' as const },
      {
        text: 'พาร์ทเนอร์ผู้เชี่ยวชาญที่คุณวางใจได้',
        color: 'blue' as const,
        mobileBreak: true,
      },
    ],
    description:
      'เราคือผู้ให้บริการ อะไหล่และระบบ Automation ครบวงจร (One Stop Service) สำหรับอุตสาหกรรมทุกประเภท ด้วยพันธกิจหลักในการช่วยโรงงานของคุณ ลดความเสี่ยง (Reduce Risk) และ ลดการหยุดทำงาน (Minimize Downtime) อย่างแท้จริง',
    cta: {
      label: 'เรียนรู้เรื่องราวของเรา',
      href: '/about-us',
      variant: 'secondary',
      newTab: false,
    },
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

  const gridPreview = {
    kind: 'products' as const,
    title: 'อะไหล่และระบบที่เราเชี่ยวชาญ',
    cta: {
      label: 'สินค้าทั้งหมด',
      href: '/products',
      variant: 'primary' as const,
    },
    items: [
      {
        title: 'ตลับลูกปืน, ลูกกลิ้ง',
        image: '/homepage/products/bearings-and-rollers.webp',
        categoryBadge: { label: 'Mechanical Parts', color: 'blue' },
        href: '/products/bearings-rollers',
      },
      {
        title: 'Hydraulic System',
        image: '/homepage/products/hydraulic-system.webp',
        categoryBadge: { label: 'Fluid Systems', color: 'teal' },
        href: '/products/hydraulic-system',
      },
      {
        title: 'Motor & Drive',
        image: '/homepage/products/motor-and-drive.webp',
        categoryBadge: { label: 'Electrical Hardware', color: 'red' },
        href: '/products/motor-drive',
      },
      {
        title: 'PLC Module',
        image: '/homepage/products/plc-module.webp',
        categoryBadge: { label: 'PLC/SCADA/Automation', color: 'navy' },
        href: '/products/plc-module',
      },
      {
        title: 'Pressure & Flow',
        image: '/homepage/products/pressure-and-flow.webp',
        categoryBadge: { label: 'Measurement Systems', color: 'green' },
        href: '/products/pressure-flow',
      },
    ],
  };

  const services = {
    kind: 'services' as const,
    title: 'บริการและโซลูชันวิศวกรรม',
    cta: {
      label: 'บริการทั้งหมด',
      href: '/services',
      variant: 'primary' as const,
    },
    items: [
      {
        title: 'System Design & Upgrade',
        image: '/homepage/services/system-design-and-upgrade.webp',
        href: '/services/system-design',
      },
      {
        title: 'Preventive Maintenance',
        image: '/homepage/services/preventive-maintenance.webp',
        href: '/services/preventive-maintenance',
      },
      {
        title: 'Rapid Response & On-site Support',
        image: '/homepage/services/rapid-response-and-on-site-support.webp',
        href: '/services/rapid-response',
      },
    ],
  };

  const articles = {
    kind: 'articles' as const,
    title: 'ศูนย์รวมความเชี่ยวชาญ',
    cta: {
      label: 'บทความทั้งหมด',
      href: '/articles',
      variant: 'primary' as const,
    },
    items: [
      {
        title: '5 สัญญาณเตือน! ถึงเวลาต้องอัปเกรด PLC/SCADA ในโรงงานคุณ',
        image: '/homepage/articles/article-01.webp',
        description:
          'บทวิเคราะห์เชิงเทคนิคที่ช่วยให้ผู้บริหารและวิศวกรประเมินความเสี่ยงจากระบบควบคุมที่ล้าสมัย ก่อนเกิด Downtime ครั้งใหญ่',
        href: '/articles/scada-plc-system',
      },
      {
        title:
          'Case Study: โรงงานอาหาร A ลด Downtime จาก 80 เหลือ 10 ชม./ปี ได้อย่างไร',
        image: '/homepage/articles/article-02.webp',
        description:
          'เจาะลึกโซลูชัน Hydraulic & Pneumatic Systems ที่เราออกแบบและติดตั้ง พร้อมตัวเลขผลลัพธ์ที่วัดผลได้จริง',
        href: '/articles/downtime-reduction',
      },
      {
        title:
          'เช็กด่วน! มอเตอร์ VFD: ทำไมการจัดส่งด่วนจึงช่วยประหยัดเงินได้มากกว่า',
        image: '/homepage/articles/article-03.webp',
        description:
          'บทความที่เชื่อมโยงความสำคัญของ Fast Delivery เข้ากับผลกระทบทางเศรษฐกิจเมื่อเครื่องจักรหยุดเดิน',
        href: '/articles/vfd-electrical-system',
      },
    ],
  };

  return (
    <div className="bg-[#F5F5F5]">
      {/* Main page layout */}
      <main className="w-full flex flex-col gap-16 justify-center items-center">
        {/* Full-bleed Hero (no max-width wrapper here) */}
        <Hero {...hero} preserveSubtitleNewlines={true} />

        {/* Constrained content wrapper (970px spec) */}
        <MotionReveal>
          <div className="container-970 flex flex-col gap-16">
            {/* Features Section */}
            <Features {...features} />

            {/* Products Section */}
            <GridPreview section={gridPreview} />

            {/* Services Section */}
            <GridPreview section={services} />

            {/* Articles Section */}
            <GridPreview section={articles} />
          </div>
        </MotionReveal>
      </main>
    </div>
  );
}
