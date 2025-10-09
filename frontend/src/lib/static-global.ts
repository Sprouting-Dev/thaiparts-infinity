// Static global data to replace Strapi API calls
export interface StaticGlobalData {
  favicon?: string;
  footer?: any;
  footerCta?: {
    title?: string;
    subtitle?: string;
    bg?: any;
    cta?: { label?: string; href?: string; variant?: string };
  } | null;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    ogImage?: string;
  };
  brand?: {
    segments?: Array<{
      text: string;
      color: 'primary' | 'secondary' | 'red' | 'blue';
    }>;
    logo?: string;
  };
  navbar?: {
    ctas?: Array<{
      label: string;
      href: string;
      variant: 'hero-secondary' | 'secondary' | 'primary' | 'content-primary';
      newTab?: boolean;
      enabled?: boolean;
    }>;
  };
}

export const staticGlobalData: StaticGlobalData = {
  favicon: "/favicon.svg",
  seo: {
    metaTitle: "THAIPARTS INFINITY - Industrial Automation & Spare Parts",
    metaDescription: "ผู้ให้บริการอะไหล่และระบบ Automation ครบวงจร (One Stop Service) สำหรับอุตสาหกรรมหนัก ด้วยพันธกิจหลักในการช่วยโรงงานของคุณ ลดความเสี่ยง (Reduce Risk) และ ลดการหยุดทำงาน (Minimize Downtime)",
    ogImage: "/homepage/homepage-hero.png"
  },
  brand: {
    segments: [
      {
        text: "THAIPARTS",
        color: "primary"
      },
      {
        text: "INFINITY", 
        color: "red"
      }
    ],
  logo: "/thaiparts-infinity-logo.svg"
  },
  navbar: {
    ctas: [
      {
        label: "ติดต่อด่วน 092-424-2144",
        href: "tel:0924242144",
        variant: "primary",
        newTab: false,
        enabled: true
      },
      {
        label: "ติดต่อเรา",
        href: "/contact-us",
        variant: "secondary", 
        newTab: false,
        enabled: true
      }
    ]
  },
  footer: {
    columns: [
      {
        title: "บริษัท",
        links: [
          { label: "เกี่ยวกับเรา", href: "/about" },
          { label: "ผลงาน", href: "/products" },
          { label: "บริการ", href: "/services" },
          { label: "บทความ", href: "/posts" }
        ]
      },
      {
        title: "ติดต่อ",
        links: [
          { label: "ติดต่อเรา", href: "/contact-us" },
          { label: "02-123-4567", href: "tel:021234567" },
          { label: "info@thaiparts-infinity.com", href: "mailto:info@thaiparts-infinity.com" }
        ]
      },
      {
        title: "ที่อยู่",
        links: [
          { label: "123 ถนนอุตสาหกรรม", href: "#" },
          { label: "กรุงเทพมหานคร 10400", href: "#" }
        ]
      }
    ]
  },
  footerCta: {
    title: "เครื่องจักรหยุดเดิน? อย่าให้ Downtime ทำลายกำไรของคุณ",
    subtitle: "ติดต่อสายด่วนวิศวกรของเราทันที บริการ On-site Support ภายใน 24-48 ชม.",
    cta: {
      label: "แจ้งปัญหาด่วน/ติดต่อเรา",
      href: "/contact-us",
      variant: "content-primary"
    }
  }
};

// Static helper functions to replace dynamic ones
export function getStaticGlobal(): StaticGlobalData {
  return staticGlobalData;
}

export function getStaticGlobalFresh(): StaticGlobalData {
  return staticGlobalData;
}