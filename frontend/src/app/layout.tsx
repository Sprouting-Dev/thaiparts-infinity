import type { Metadata } from 'next';
import { Kanit } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import Footer, { FooterData } from '@/components/Footer';
import PreFooterCta from '@/components/PreFooterCta';
import { getGlobal, getGlobalFresh } from '@/lib/global';
import { ChatProvider } from "@/components/chat/ChatProvider";
import { ChatWidget } from "@/components/chat/ChatWidget";

const kanit = Kanit({
  variable: '--font-kanit',
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  subsets: ['latin', 'latin-ext', 'thai'],
});

// Dynamic metadata from Strapi Global.defaultSeo (with safe fallbacks)
export async function generateMetadata(): Promise<Metadata> {
  // Use fresh fetch so tab title reflects latest without waiting for ISR cache
  const global = (await getGlobalFresh()) || (await getGlobal());
  const rawTitle = global?.seo?.metaTitle?.trim();
  const brandLeft = (global as any)?.brand?.left || 'THAIPARTS';
  const brandRight = (global as any)?.brand?.right || 'INFINITY';
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
    console.log(
      '[metadata] rawTitle from Strapi:',
      rawTitle,
      'final title:',
      title
    );
  }
  return {
    title,
    description,
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Fetch fresh first so newly uploaded favicon / footer changes appear immediately; fallback to cached if fails.
  const global = (await getGlobalFresh()) || (await getGlobal());
  const footerData: FooterData | undefined = global?.footer
    ? {
        companyName: global.footer.companyName,
        address: global.footer.address,
        phone: global.footer.phone,
        email: global.footer.email,
        facebook: global.footer.facebook,
        columns: global.footer.columns?.map((c: any) => ({
          title: c?.heading,
          links:
            c?.links?.map((l: any) => ({ label: l?.label, href: l?.href })) ||
            [],
        })),
        copyright: global.footer.copyright,
      }
    : undefined;
  const fallbackFavicon = '/favicon.svg';
  let faviconHref = global?.favicon || fallbackFavicon;
  if (process.env.NODE_ENV === 'development') {
    if (faviconHref === fallbackFavicon) {
      console.log(
        '[favicon] Using fallback favicon.svg (upload favicon in Strapi Global to override)'
      );
    } else {
      console.log('[favicon] Using Strapi favicon:', faviconHref);
    }
  }

  return (
    <html lang="th">
      <head>
        <link
          rel="icon"
          href={faviconHref}
          type={faviconHref.endsWith('.svg') ? 'image/svg+xml' : undefined}
        />
        <link rel="shortcut icon" href={faviconHref} />
        <link rel="apple-touch-icon" href={faviconHref} />
        <meta name="theme-color" content="#1063A7" />
      </head>
      <body
        className={`${kanit.variable} antialiased flex flex-col items-center min-h-screen gap-24`}
      >
        <Header
          brand={global?.brand}
          footer={global?.footer}
          navbar={global?.navbar}
        />
        <main className="w-full flex flex-col items-center flex-1">
          {children}
        </main>
        <div className="w-full flex flex-col p-8">
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
                  variant:
                    (global.footerCta.cta?.variant as
                      | 'primary'
                      | 'secondaryLight'
                      | 'secondaryDark'
                      | 'outline') || 'primary',
                }}
              />
            )}
            <Footer embedded data={footerData} />
          </div>
        </div>
        <ChatProvider>
          {children}
          <ChatWidget />
        </ChatProvider>
      </body>
    </html>
  );
}
