// /src/app/layout.tsx
import type { Metadata } from 'next';
import { Kanit } from 'next/font/google';
import './globals.css';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getStaticGlobal } from '@/lib/static-global';
import { fetchLayout, fetchPageBySlug } from '@/lib/cms';
import { buildMetadataFromSeo } from '@/lib/seo';
import type { LayoutAttributes } from '@/types/cms';
import { mediaUrl } from '@/lib/strapi';

// ---------- Fonts ----------
const kanit = Kanit({
  variable: '--font-kanit',
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  subsets: ['latin', 'latin-ext', 'thai'],
});

// ---------- Metadata (base static; ย้ายไป Strapi ได้ภายหลัง) ----------
export async function generateMetadata(): Promise<Metadata> {
  // Start with env/static defaults
  const defaultTitle =
    process.env.NEXT_PUBLIC_DEFAULT_TITLE ||
    'THAIPARTS INFINITY - Industrial Automation & Spare Parts';

  const defaultDescription =
    process.env.NEXT_PUBLIC_DEFAULT_DESC ||
    'ผู้ให้บริการอะไหล่และระบบ Automation ครบวงจร (One Stop Service) สำหรับอุตสาหกรรมหนัก';

  const metadataBase = new URL(
    process.env.NEXT_PUBLIC_METADATA_BASE || 'http://localhost:3000'
  );

  // Try to fetch the 'home' page where SEO fields live alongside the hero
  try {
    const page = await fetchPageBySlug('home');
    const attrs = page as unknown as Record<string, unknown> | null;

    // Prefer a nested SEO component (common Strapi pattern). If the page
    // exposes `seo` or `sharedSeo`, prefer building the Metadata from that
    // component so `metaDescription` and other SEO fields are honored.
    const seoObj = (attrs &&
      (attrs['seo'] ?? attrs['sharedSeo'] ?? null)) as Record<
      string,
      unknown
    > | null;

    if (seoObj) {
      const md = buildMetadataFromSeo(seoObj, {
        fallbackTitle: defaultTitle,
        defaultCanonical: '/',
      });
      // Ensure metadataBase and a sane openGraph baseline are present
      md.metadataBase = metadataBase;
      md.openGraph = {
        ...(md.openGraph ?? {}),
        siteName: 'THAIPARTS INFINITY',
        type: 'website',
        locale: 'th_TH',
      } as Metadata['openGraph'];
      md.alternates = md.alternates ?? { canonical: '/' };
      return md;
    }

    // Title extraction: check common patterns used by Strapi SEO plugin or page fields
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

    // OG image: try multiple common keys, resolve with mediaUrl when found
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
      typeof descriptionFromPage === 'string' && descriptionFromPage
        ? descriptionFromPage
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
    // On any fetch error, fall back to defaults for robust behavior
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
    return {
      title: defaultTitle,
      description: defaultDescription,
      metadataBase,
      openGraph: {
        title: defaultTitle,
        description: defaultDescription,
        images,
        siteName: 'THAIPARTS INFINITY',
        type: 'website',
        locale: 'th_TH',
      },
      twitter: {
        card: images.length ? 'summary_large_image' : 'summary',
        title: defaultTitle,
        description: defaultDescription,
        images: images.map(i => i.url),
      },
      alternates: { canonical: '/' },
    } as Metadata;
  }
}

export const dynamic = 'force-dynamic';

// ---------- Types ----------
// Use the shared LayoutAttributes from types/cms for the layout shape
// (keeps a single source of truth for the CMS shape)

// ---------- Fetchers ----------
// We use the centralized fetcher in `src/lib/cms.ts` which already returns
// the normalized LayoutAttributes shape.

// Development overlay removed for production cleanliness

// ---------- Root Layout ----------
export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const layout = (await fetchLayout()) as LayoutAttributes | null;

  // ----- Fallback ชื่อฟิลด์ -----
  // layout.address is available for Footer and other consumers if needed
  // Layout computes minimal values; Footer consumes the layout directly.
  // Avoid computing unused derived values here to keep lint clean.
  // If callers need prefooter fields, they can read them from `layout`.

  // Dev overlay and missing-field checks removed

  // Build navbar: prefer Strapi navbar, but if Strapi provides an address phone
  // use it to inject/replace the "ติดต่อด่วน" CTA so the number is consistent site-wide.
  const baseNavbar = layout?.navbar ?? getStaticGlobal().navbar;

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

    // Clone to avoid mutating static fallback
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

    // If the first CTA looks like the old 'ติดต่อด่วน' entry, replace it
    if (
      existing.length > 0 &&
      typeof existing[0].label === 'string' &&
      existing[0].label.includes('ติดต่อด่วน')
    ) {
      existing[0] = phoneCta;
    } else {
      // otherwise prepend to ensure visibility
      existing.unshift(phoneCta);
    }
    // Ensure there is always a primary 'ติดต่อเรา' CTA pointing to /contact-us
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

  // Safely extract phone_number_1 from layout.address which may use different shapes
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
        {/* Header: pass navbar data (with Strapi phone injected) so the "ติดต่อด่วน" CTA uses the CMS phone */}
        <Header navbar={navbarForHeader} />

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
