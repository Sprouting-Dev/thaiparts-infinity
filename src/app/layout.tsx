// /src/app/layout.tsx
import type { Metadata } from 'next';
import { Kanit } from 'next/font/google';
import './globals.css';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { strapiFetch, mediaUrl } from '@/lib/strapi';
import { getStaticGlobal } from '@/lib/static-global';

// ---------- Fonts ----------
const kanit = Kanit({
  variable: '--font-kanit',
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  subsets: ['latin', 'latin-ext', 'thai'],
});

// ---------- Metadata (base static; ย้ายไป Strapi ได้ภายหลัง) ----------
export async function generateMetadata(): Promise<Metadata> {
  const title =
    process.env.NEXT_PUBLIC_DEFAULT_TITLE ||
    'THAIPARTS INFINITY - Industrial Automation & Spare Parts';

  const description =
    process.env.NEXT_PUBLIC_DEFAULT_DESC ||
    'ผู้ให้บริการอะไหล่และระบบ Automation ครบวงจร (One Stop Service) สำหรับอุตสาหกรรมหนัก';

  const images = process.env.NEXT_PUBLIC_OG_IMAGE_URL
    ? [
        {
          url: process.env.NEXT_PUBLIC_OG_IMAGE_URL,
          width: 1200,
          height: 630,
          alt: title,
        },
      ]
    : [];

  return {
    title,
    description,
    metadataBase: new URL(
      process.env.NEXT_PUBLIC_METADATA_BASE || 'http://localhost:3000'
    ),
    openGraph: {
      title,
      description,
      images,
      siteName: 'THAIPARTS INFINITY',
      type: 'website',
      locale: 'th_TH',
    },
    twitter: {
      card: images.length ? 'summary_large_image' : 'summary',
      title,
      description,
      images: images.map(i => i.url),
    },
    alternates: { canonical: '/' },
  };
}

export const dynamic = 'force-dynamic';

// ---------- Types ----------
type SocialKind = 'facebook' | 'line' | 'email' | 'youtube' | 'tiktok' | 'x';
interface SharedContactComponent {
  company_name?: string;
  adddress?: string; // บางโปรเจกต์สะกดแบบนี้
  address?: string; // เผื่อสะกดปกติ
  address_text?: string; // เผื่ออีกชื่อ
  phone_number_1?: string;
  phone_number_2?: string;
  email?: string;
  map_url?: string;
}
interface SharedSocialMediaComponent {
  id?: number;
  type?: SocialKind | string;
  url?: string;
}
interface LayoutCMS {
  address?: SharedContactComponent;
  social_media?: SharedSocialMediaComponent[];
  image?: any; // Strapi media (หลัก)
  prefooter_image?: any; // ชื่อสำรอง
  banner?: any; // ชื่อสำรอง
  quote?: string;
  button?: string;
  copyright?: string;
}

// ---------- Fetchers ----------
async function fetchLayoutFromStrapi(): Promise<LayoutCMS | null> {
  // ดึง draft ได้ด้วย publicationState=preview + populate เฉพาะที่ใช้
  const res = await strapiFetch<any>(
    '/api/layout?populate[image]=*&populate[prefooter_image]=*&populate[banner]=*&populate[address]=*&populate[social_media]=*&publicationState=preview',
    {},
    300
  );
  return res?.data?.attributes ?? null;
}

// Development overlay removed for production cleanliness

// ---------- Root Layout ----------
export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const layout = await fetchLayoutFromStrapi();

  // ----- Fallback ชื่อฟิลด์ -----
  const contact = (layout?.address ?? {}) as SharedContactComponent;
  const companyAddress =
    contact.adddress ?? contact.address ?? contact.address_text ?? '';

  const preImage =
    layout?.image ??
    (layout as any)?.prefooter_image ??
    (layout as any)?.banner;
  const preBg = mediaUrl(preImage);

  // ----- PreFooter CTA props -----
  const CMS_FALLBACK = 'ข้อมูลกำลังอยู่ระหว่างการอัปเดต';
  const preTitle = layout?.quote || CMS_FALLBACK;
  const preButton = layout?.button || CMS_FALLBACK;

  // Dev overlay and missing-field checks removed

  return (
    <html lang="th">
      <head>
        <meta name="theme-color" content="var(--brand-blue)" />
      </head>
      <body
        className={`${kanit.variable} antialiased flex flex-col min-h-screen overflow-x-hidden gap-24`}
        suppressHydrationWarning
      >
        {/* Header: pass navbar data from Layout single so Header can render CTAs configured in Strapi */}
        <Header navbar={(layout as any)?.navbar ?? getStaticGlobal().navbar} />

        {/* Page content */}
        <main className="w-full flex flex-col flex-1">{children}</main>

        {/* Footer (includes pre-footer CTA) */}
        <div className="w-full flex flex-col p-4 lg:p-8">
          <div className="w-full flex flex-col">
            <Footer layout={layout ?? undefined} />
          </div>
        </div>

        {/* dev overlay removed */}
      </body>
    </html>
  );
}
