import type { Metadata } from 'next';
import { Kanit } from 'next/font/google';
import './globals.css';

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { fetchLayout, fetchPageBySlug } from '@/lib/cms';
import { buildMetadataFromSeo } from '@/lib/seo';
import type { LayoutAttributes } from '@/types/cms';
import { mediaUrl } from '@/lib/strapi';

const kanit = Kanit({
  variable: '--font-kanit',
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  subsets: ['latin', 'latin-ext', 'thai'],
});

export async function generateMetadata(): Promise<Metadata> {
  const defaultTitle =
    process.env.NEXT_PUBLIC_DEFAULT_TITLE ||
    'THAIPARTS INFINITY - Industrial Automation & Spare Parts';

  const defaultDescription =
    process.env.NEXT_PUBLIC_DEFAULT_DESC ||
    'ผู้ให้บริการอะไหล่และระบบ Automation ครบวงจร (One Stop Service) สำหรับอุตสาหกรรมทุกประเภท - THAIPARTS INFINITY ครอบคลุมตั้งแต่การวิเคราะห์ความต้องการ การออกแบบ ติดตั้ง และซ่อมบำรุง';

  const metadataBase = new URL(
    process.env.NEXT_PUBLIC_METADATA_BASE || 'http://localhost:3000'
  );

  try {
    const page = await fetchPageBySlug('home');
    const attrs = page as unknown as Record<string, unknown> | null;

    const seoObj = (attrs &&
      (attrs['SEO'] ??
        attrs['seo'] ??
        attrs['sharedSeo'] ??
        attrs['SharedSeoComponent'] ??
        null)) as Record<string, unknown> | null;

    if (seoObj) {
      const md = buildMetadataFromSeo(seoObj, {
        fallbackTitle: defaultTitle,
        fallbackDescription: defaultDescription,
        defaultCanonical: '/',
      });
      md.metadataBase = metadataBase;

      let safeDescription =
        md.description &&
        typeof md.description === 'string' &&
        md.description.trim()
          ? md.description.trim()
          : defaultDescription;

      if (safeDescription.length < 50) {
        safeDescription =
          defaultDescription.length >= 50
            ? defaultDescription
            : 'THAIPARTS INFINITY - ผู้เชี่ยวชาญระบบ Automation, Electrical และ Instrument ครบวงจร สำหรับอุตสาหกรรมทุกประเภท ครอบคลุมตั้งแต่การวิเคราะห์ การออกแบบ ติดตั้ง และซ่อมบำรุง';
      }

      md.openGraph = {
        ...(md.openGraph ?? {}),
        description:
          md.openGraph?.description &&
          typeof md.openGraph.description === 'string' &&
          md.openGraph.description.trim()
            ? md.openGraph.description.trim()
            : safeDescription,
        siteName: 'THAIPARTS INFINITY',
        type: 'website',
        locale: 'th_TH',
      } as Metadata['openGraph'];

      md.alternates = md.alternates ?? { canonical: '/' };
      md.description = safeDescription;

      if (md.twitter) {
        md.twitter = {
          ...md.twitter,
          description:
            md.twitter.description &&
            typeof md.twitter.description === 'string' &&
            md.twitter.description.trim()
              ? md.twitter.description.trim()
              : safeDescription,
        };
      }

      return md;
    }

    const titleFromPage =
      (attrs && typeof attrs['metaTitle'] === 'string' && attrs['metaTitle']) ||
      (attrs &&
        typeof attrs['meta_title'] === 'string' &&
        attrs['meta_title']) ||
      (attrs && typeof attrs['title'] === 'string' && attrs['title']);

    const descriptionFromPage =
      (attrs &&
        typeof attrs['metaDescription'] === 'string' &&
        attrs['metaDescription']) ||
      (attrs &&
        typeof attrs['meta_description'] === 'string' &&
        attrs['meta_description']) ||
      (attrs &&
        typeof attrs['description'] === 'string' &&
        attrs['description']);

    let ogUrl: string | undefined;
    const ogCandidates = [
      'ogImage',
      'og_image',
      'shareImage',
      'share_image',
      'image',
      'hero_image',
    ];
    if (attrs) {
      for (const k of ogCandidates) {
        const v = attrs[k];
        if (!v) continue;
        try {
          const resolved = mediaUrl(v as Parameters<typeof mediaUrl>[0]);
          if (resolved) {
            ogUrl = resolved;
            break;
          }
        } catch {}
      }
    }

    const finalTitle =
      typeof titleFromPage === 'string' && titleFromPage
        ? titleFromPage
        : defaultTitle;
    const finalDescription =
      typeof descriptionFromPage === 'string' && descriptionFromPage.trim()
        ? descriptionFromPage.trim()
        : defaultDescription;

    const images = ogUrl
      ? [
          {
            url: ogUrl,
            width: 1200,
            height: 630,
            alt: finalTitle,
          },
        ]
      : [];

    return {
      title: finalTitle,
      description: finalDescription,
      metadataBase,
      openGraph: {
        title: finalTitle,
        description: finalDescription,
        images,
        siteName: 'THAIPARTS INFINITY',
        type: 'website',
        locale: 'th_TH',
      },
      twitter: {
        card: images.length ? 'summary_large_image' : 'summary',
        title: finalTitle,
        description: finalDescription,
        images: images.map(i => i.url),
      },
      alternates: { canonical: '/' },
    } as Metadata;
  } catch {
    const images = process.env.NEXT_PUBLIC_OG_IMAGE_URL
      ? [
          {
            url: process.env.NEXT_PUBLIC_OG_IMAGE_URL,
            width: 1200,
            height: 630,
            alt: defaultTitle,
          },
        ]
      : [];
    const safeDescription =
      defaultDescription ||
      'THAIPARTS INFINITY - ผู้เชี่ยวชาญระบบ Automation, Electrical และ Instrument ครบวงจร';

    return {
      title: defaultTitle,
      description: safeDescription,
      metadataBase,
      openGraph: {
        title: defaultTitle,
        description: safeDescription,
        images,
        siteName: 'THAIPARTS INFINITY',
        type: 'website',
        locale: 'th_TH',
      },
      twitter: {
        card: images.length ? 'summary_large_image' : 'summary',
        title: defaultTitle,
        description: safeDescription,
        images: images.map(i => i.url),
      },
      alternates: { canonical: '/' },
    } as Metadata;
  }
}

export const dynamic = 'force-dynamic';

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const layout = (await fetchLayout()) as LayoutAttributes | null;

  const baseNavbar = layout?.navbar ?? undefined;

  const makeNavbarWithPhone = (raw?: string) => {
    if (!raw) return baseNavbar;
    const digits = String(raw).replace(/\D/g, '');
    let normalized = digits;
    if (normalized.startsWith('66')) normalized = normalized.slice(2);
    if (normalized.length === 9) normalized = `0${normalized}`;
    if (normalized.length !== 10) return baseNavbar;

    const displayNational = normalized.replace(
      /(\d{3})(\d{3})(\d{4})/,
      '$1-$2-$3'
    );
    const href = `tel:+66${normalized.slice(1)}`; // international href

    const phoneCta = {
      label: `ติดต่อด่วน ${displayNational}`,
      href,
      variant: 'secondary' as const,
      enabled: true,
    };

    type NavbarShape = {
      ctas?: Array<{
        label?: string;
        href?: string;
        variant?: string;
        newTab?: boolean;
        enabled?: boolean;
      }>;
    };
    const cloned = { ...(baseNavbar ?? {}) } as NavbarShape;
    const existing = Array.isArray(cloned.ctas) ? [...cloned.ctas] : [];

    if (
      existing.length > 0 &&
      typeof existing[0].label === 'string' &&
      existing[0].label.includes('ติดต่อด่วน')
    ) {
      existing[0] = phoneCta;
    } else {
      existing.unshift(phoneCta);
    }
    const hasContactUs = existing.some(
      c =>
        typeof c.label === 'string' &&
        c.label.includes('ติดต่อเรา') &&
        String(c.href).includes('/contact-us')
    );
    if (!hasContactUs) {
      existing.push({
        label: 'ติดต่อเรา',
        href: '/contact-us',
        variant: 'primary',
        enabled: true,
      });
    }
    cloned.ctas = existing;
    return cloned as typeof baseNavbar;
  };

  const getPhoneFromLayout = (
    l?: LayoutAttributes | null
  ): string | undefined => {
    const a = l?.address as unknown;
    if (!a || typeof a !== 'object') return undefined;
    const addrRec = a as Record<string, unknown>;
    if (
      'SharedContactComponent' in addrRec &&
      typeof addrRec['SharedContactComponent'] === 'object' &&
      addrRec['SharedContactComponent'] !== null
    ) {
      const sc = addrRec['SharedContactComponent'] as Record<string, unknown>;
      if (typeof sc['phone_number_1'] === 'string')
        return String(sc['phone_number_1']);
    }
    if (typeof addrRec['phone_number_1'] === 'string')
      return String(addrRec['phone_number_1']);
    return undefined;
  };

  const navbarForHeader = makeNavbarWithPhone(getPhoneFromLayout(layout));

  return (
    <html lang="th">
      <head>
        <meta name="theme-color" content="var(--brand-blue)" />
      </head>
      <body
        className={`${kanit.variable} antialiased flex flex-col min-h-screen overflow-x-hidden gap-16 lg:gap-24`}
        suppressHydrationWarning
      >
        <Header navbar={navbarForHeader} />
        <main className="w-full flex flex-col flex-1">{children}</main>
        <div className="w-full flex flex-col p-4 lg:p-8">
          <div className="w-full flex flex-col">
            <Footer layout={layout ?? undefined} />
          </div>
        </div>
      </body>
    </html>
  );
}
