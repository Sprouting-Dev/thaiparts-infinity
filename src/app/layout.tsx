import type { Metadata } from 'next';
import { Kanit } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import Footer, { FooterData } from '@/components/Footer';
import PreFooterCta from '@/components/PreFooterCta';
import { getStaticGlobal, getStaticGlobalFresh } from '@/lib/static-global';
import { logger } from '@/lib/logger';

const kanit = Kanit({
  variable: '--font-kanit',
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  subsets: ['latin', 'latin-ext', 'thai'],
});

// Static metadata from static global data
export async function generateMetadata(): Promise<Metadata> {
  // Use static data instead of Strapi
  const global = getStaticGlobalFresh();
  const rawTitle = global?.seo?.metaTitle?.trim();
  const brandLeft = global?.brand?.segments?.[0]?.text || 'THAIPARTS';
  const brandRight = global?.brand?.segments?.[1]?.text || 'INFINITY';
  const baseTitle = `${brandLeft} ${brandRight}`.trim();
  const defaultSuffix = 'Industrial Automation & Spare Parts';
  const title = rawTitle || `${baseTitle} - ${defaultSuffix}`;
  const description =
    global?.seo?.metaDescription ||
    'ผู้ให้บริการอะไหล่และระบบ Automation ครบวงจร (One Stop Service) สำหรับอุตสาหกรรมหนัก';
  const images = global?.seo?.ogImage
    ? [{ url: global.seo.ogImage, width: 1200, height: 630, alt: title }]
    : [];
  if (process.env.NODE_ENV === 'development') {
    logger.debug(
      '[metadata] rawTitle from static data:',
      rawTitle,
      'final title:',
      title
    );
  }
  return {
    title,
    description,
    // metadataBase is required for resolving absolute URLs for Open Graph/Twitter images
    metadataBase: new URL(
      process.env.NEXT_PUBLIC_METADATA_BASE || 'http://localhost:3000'
    ),
    openGraph: {
      title,
      description,
      images,
      siteName: baseTitle,
      type: 'website',
      locale: 'th_TH',
    },
    twitter: {
      card: images.length ? 'summary_large_image' : 'summary',
      title,
      description,
      images: images.map(i => i.url),
    },
    alternates: {
      canonical: '/',
    },
  };
}

// Force dynamic so metadata recalculates on each request
export const dynamic = 'force-dynamic';

// Separate viewport export per Next.js recommendation
export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Use static global data instead of Strapi
  const global = getStaticGlobal();
  const footerData: FooterData | undefined = global?.footer
    ? {
        companyName: global.footer.companyName,
        address: global.footer.address,
        phone: global.footer.phone,
        email: global.footer.email,
        facebook: global.footer.facebook,
        columns: global.footer.columns?.map(c => ({
          title: c?.title || '',
          links:
            c?.links?.map(l => ({ label: l?.label || '', href: l?.href })) ||
            [],
        })),
        copyright: global.footer.copyright,
      }
    : undefined;

  return (
    <html lang="th">
      <head>
        <meta name="theme-color" content="#1063A7" />
      </head>
      <body
        // Keep layout vertical but allow children to stretch horizontally so
        // full-bleed elements (Hero: w-full) and constrained containers
        // (container-970) align correctly with the viewport edges.
        // Also suppress horizontal overflow which can appear from 100vw usage.
        className={`${kanit.variable} antialiased flex flex-col min-h-screen overflow-x-hidden`}
      >
        <Header
          brand={global?.brand}
          footer={global?.footer}
          navbar={global?.navbar}
        />
        <main className="w-full flex flex-col flex-1">{children}</main>
        <div className="w-full flex flex-col p-4 lg:p-8">
          <div className="w-full flex flex-col">
            {global?.footerCta?.cta?.label && (
              <PreFooterCta
                embedded
                title={global.footerCta.title}
                subtitle={global.footerCta.subtitle}
                bg={global.footerCta.bg}
                cta={{
                  label: global.footerCta.cta?.label,
                  href: global.footerCta.cta?.href,
                  variant: global.footerCta.cta?.variant as
                    | 'primary'
                    | 'secondary'
                    | 'hero-secondary'
                    | 'content-primary',
                }}
              />
            )}
            <Footer embedded data={footerData} />
          </div>
        </div>
      </body>
    </html>
  );
}
