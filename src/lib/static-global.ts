// Static global data to replace Strapi API calls
export interface StaticGlobalData {
  favicon?: string;
  footer?: {
    companyName?: string;
    address?: string;
    phone?: string;
    email?: string;
    facebook?: string;
    columns?: Array<{
      title?: string;
      links?: Array<{ label?: string; href?: string }>;
    }>;
    copyright?: string;
  };
  footerCta?: {
    title?: string;
    subtitle?: string;
    bg?: string;
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
  favicon: '/favicon.ico',
  seo: {
    metaTitle: 'THAIPARTS INFINITY - Industrial Automation & Spare Parts',
    metaDescription:
      'ผู้ให้บริการอะไหล่และระบบ Automation ครบวงจร (One Stop Service) สำหรับอุตสาหกรรมหนัก ด้วยพันธกิจหลักในการช่วยโรงงานของคุณ ลดความเสี่ยง (Reduce Risk) และ ลดการหยุดทำงาน (Minimize Downtime)',
    ogImage: '/homepage/homepage-hero.png',
  },
  brand: {
    segments: [
      {
        text: 'THAIPARTS',
        color: 'primary',
      },
      {
        text: 'INFINITY',
        color: 'red',
      },
    ],
    logo: '/thaiparts-infinity-logo.svg',
  },
  // Navbar CTAs are intentionally omitted so the site uses the CMS-provided
  // navbar. This prevents hard-coded CTAs from masking Strapi edits.
  footer: {
    columns: [
      {
        title: 'บริษัท',
        links: [],
      },
      {
        title: 'ติดต่อ',
        links: [],
      },
      {
        title: 'ที่อยู่',
        links: [],
      },
    ],
  },
  footerCta: {
    // Intentionally include newline markers so PreFooterCta can render
    // Placeholder fallback shown when Strapi doesn't provide prefooter CTA
    title: 'ข้อมูลกำลังอยู่ระหว่างการอัปเดต',
    subtitle: 'ข้อมูลกำลังอยู่ระหว่างการอัปเดต',
    cta: {
      label: 'ข้อมูลกำลังอยู่ระหว่างการอัปเดต',
      href: '/contact-us',
      variant: 'content-primary',
    },
  },
};

// Static helper functions to replace dynamic ones
export function getStaticGlobal(): StaticGlobalData {
  return staticGlobalData;
}

export function getStaticGlobalFresh(): StaticGlobalData {
  return staticGlobalData;
}
