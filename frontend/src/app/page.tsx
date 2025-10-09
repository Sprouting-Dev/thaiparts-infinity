import Hero from '@/components/Hero';
import Features from '@/components/Features';
import GridPreview from '@/components/GridPreview';

export default function Page() {
  // Static content for delivery - no Strapi dependency
  const hero = {
    title: {
      desktop: {
        leftText: "ผู้ให้บริการด้านระบบครบวงจร",
        leftColor: "brandBlue" as const,
        rightText: "Automation, Electrical และ Instrument ครบวงจร",
        rightColor: "accentRed" as const
      },
      mobile: {
        lines: [
          { text: "ผู้ให้บริการด้านระบบครบวงจร", color: "brandBlue" as const },
          { text: "Automation, Electrical และ Instrument ครบวงจร", color: "accentRed" as const }
        ]
      }
    },
    background: undefined,
    subtitle: "บริการงานประเมินโครงการด้าม สำหรับลูกค้าของ บริษัท ไทยพาร์ท อินฟินิตี้ จำกัด ให้บริการครอบคลุมงานทั้งระบบ",
    ctas: [
      {
        label: "ปรึกษาปัญหา",
        href: "/contact-us",
        variant: "primary",
        newTab: false
      },
      {
        label: "ดูผลงานของเราทั้งหมด",
        href: "/products",
        variant: "secondary", 
        newTab: false
      }
    ],
    panel: {
      enabled: true,
      align: 'center' as const
    }
  };

  const features = {
    titleSegments: [
      { text: "THAIPARTS INFINITY", color: "red" as const },
      { text: " พร้อมยกระดับผลิตภัณฑ์ของคุณให้ดี", color: "blue" as const }
    ],
    description: "เราช่วยให้คุณยกระดับระบบการผลิตให้ดีขึ้นเพื่อ Automation ครบวงจร (One Stop Service) สำหรับลูกค้าองค์กรทั้งใหญ่และเล็ก (Reduce Risk) รวม สิ่งจำเป็นให้ครบครัน การให้คำปรึกษาจากทีมงานเทคนิคและใส่ใจในราคายุติธรรมสำหรับลูกค้าทุกเเรา (Minimize Downtime) ดูแลรับรองทุกน",
    cta: {
      label: "ดูการทำงานของเรา",
      href: "/services",
      variant: "secondary",
      newTab: false
    },
    items: [
      {
        icon: undefined,
        title: "One Stop Service",
        description: "ครบครันงานติดตั้ง, ดูแลรักษา, ซ่อมแซม"
      },
      {
        icon: undefined, 
        title: "Fast Delivery",
        description: "รองรับ งานฉุกเฉิน On-site Support 24-48 ชม"
      },
      {
        icon: undefined,
        title: "Engineering Expertise", 
        description: "คำปรึกษาปัญหา และการออกแบบระบบงาน"
      },
      {
        icon: undefined,
        title: "Industrial Standard",
        description: "ผลิตภัณฑ์มาตรฐาน (ISO) คุณภาพเยี่ยม"
      }
    ]
  };

  const gridPreview = {
    kind: "products" as const,
    title: "อะไหล่และระบบที่เราดูแล",
    cta: {
      label: "ดูทั้งหมด",
      href: "/products",
      variant: "primary" as const
    },
    items: [
      {
        title: "อสื่อสัญญา ลูกปืน",
        image: undefined,
        href: "/products/bearings-rollers"
      },
      {
        title: "Hydraulic System",
        image: undefined,
        href: "/products/hydraulic-system"
      },
      {
        title: "Motor & Drive", 
        image: undefined,
        href: "/products/motor-drive"
      },
      {
        title: "PLC Module",
        image: undefined,
        href: "/products/plc-module"
      },
      {
        title: "Pressure & Flow",
        image: undefined, 
        href: "/products/pressure-flow"
      }
    ]
  };

  const services = {
    kind: "services" as const,
    title: "บริการและโซลูชันครบวงจร",
    cta: {
      label: "ดูบริการทั้งหมด",
      href: "/services",
      variant: "primary" as const
    },
    items: [
      {
        title: "System Design & Upgrade",
        image: undefined,
        description: "ออกแบบและยกระดับระบบ",
        href: "/services/system-design"
      },
      {
        title: "Preventive Maintenance", 
        image: undefined,
        description: "บำรุงรักษาเชิงป้องกัน",
        href: "/services/preventive-maintenance"
      },
      {
        title: "Rapid Response & On-site Support",
        image: undefined,
        description: "บริการฉุกเฉิน และการสนับสนุนในพื้นที่",
        href: "/services/rapid-response"
      }
    ]
  };

  const projects = {
    kind: "posts" as const,
    title: "ผลงานที่น่าภาคภูมิใจ",
    cta: {
      label: "ดูผลงานทั้งหมด", 
      href: "/products",
      variant: "primary" as const
    },
    items: [
      {
        title: "5 สถานีผลิตผล ครัวช่องภาค PLC / SCADA รวมโปรแกรม",
        image: undefined,
        description: "ระบบควบคุมการผลิตแบบครบวงจร ด้วยเทคโนโลยี SCADA และ PLC ที่ทันสมัยสำหรับอุตสาหกรรมอาหาร",
        href: "/posts/scada-plc-system"
      },
      {
        title: "Case Study: โรงงานมัด A ระบบ Downtime จาก 80 เรื้อไร 10 นาทีต่อล่วล",
        image: undefined, 
        description: "การปรับปรุงระบบที่ช่วยลด Downtime ให้กับโรงงานผลิต ทำให้สามารถเพิ่มประสิทธิภาพการผลิตได้อย่างมาก",
        href: "/posts/downtime-reduction"
      },
      {
        title: "เครื่องปัด เครื่อง VFD การแก้ปัญหาระบบไฟฟ้าให้ทำงานล่วแอดจัสเตอร์",
        image: undefined,
        description: "การแก้ไขปัญหาระบบไฟฟ้าและควบคุมให้ทำงานได้อย่างมีประสิทธิภาพและปลอดภัย",
        href: "/posts/vfd-electrical-system"
      }
    ]
  };

  return (
    <div className="bg-[#F5F5F5]">
      {/* Main page layout */}
      <main className="w-full flex flex-col gap-16 justify-center items-center">
        {/* Full-bleed Hero (no max-width wrapper here) */}
        <Hero {...hero} />

        {/* Constrained content wrapper (970px spec) */}
        <div className="container-970 flex flex-col gap-16">
          {/* Features Section */}
          <Features {...features} />

          {/* Products Section */}
          <GridPreview section={gridPreview} />

          {/* Services Section */}
          <GridPreview section={services} />

          {/* Projects Section */}
          <GridPreview section={projects} />
        </div>
      </main>
    </div>
  );
}
