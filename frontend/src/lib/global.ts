import { cache } from 'react';
import { api } from './api';
import { globalPopulate } from './queries';
import { toAbsolute } from './media';

interface RawGlobalResponse {
  data?: { attributes?: any } | any;
}

export interface GlobalData {
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

async function fetchGlobalInternal(): Promise<GlobalData | null> {
  try {
    let json = await api<RawGlobalResponse>(`/api/global?${globalPopulate}`, {
      next: { revalidate: 300 },
    });
    let attr: any = json?.data?.attributes ?? json?.data;
    if (!attr) return null;
    let faviconData = attr.favicon; // may be undefined (removed from populate due to 400 bug)
    const missingFavicon = !faviconData;
    const missingBrand = !attr.brand;
    if (
      (missingFavicon || missingBrand) &&
      process.env.NODE_ENV === 'development'
    ) {
      // Attempt one deep populate fallback only in dev to diagnose missing relations.
      try {
        const deepUrl = `${process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337'}/api/global?populate=deep,3`;
        const deepRes = await fetch(deepUrl, { cache: 'no-store' });
        if (deepRes.ok) {
          const deepJson = await deepRes.json();
          const deepAttr = deepJson?.data?.attributes ?? deepJson?.data;
          if (deepAttr) {
            if (missingFavicon && deepAttr.favicon) {
              faviconData = deepAttr.favicon;
              console.log('[global] deep populate recovered favicon');
            }
            if (missingBrand && deepAttr.brand) {
              attr.brand = deepAttr.brand;
              console.log('[global] deep populate recovered brand');
            }
          }
        }
      } catch (deepErr) {
        console.log(
          '[global] deep populate fallback failed (ignored):',
          deepErr
        );
      }
    }
    if (process.env.NODE_ENV === 'development') {
      console.log('[global] attr keys:', Object.keys(attr));
      console.log(
        '[global] favicon present?',
        !!faviconData,
        'type:',
        typeof faviconData
      );
      console.log('[global] brand present?', !!attr.brand);
    }
    const seo = attr.defaultSeo || attr.seo || null;
    const brand = attr.brand || null;
    return {
      favicon: toAbsolute(faviconData),
      footer: attr.footer || null,
      footerCta: attr.footerCta || null,
      navbar: attr.navbar || null,
      seo: seo
        ? {
            metaTitle: seo.metaTitle,
            metaDescription: seo.metaDescription,
            ogImage: toAbsolute(seo.ogImage),
          }
        : undefined,
      brand: brand
        ? {
            segments:
              brand.segments?.length > 0
                ? brand.segments
                : [
                    {
                      text: brand.brandName_left || 'THAIPARTS',
                      color: 'primary' as const,
                    },
                    {
                      text: brand.brandName_right || 'INFINITY',
                      color: 'red' as const,
                    },
                  ],
            logo: toAbsolute(brand.logo),
          }
        : undefined,
    };
  } catch (e) {
    console.warn('getGlobal failed (non-blocking):', e);
    return null;
  }
}

export const getGlobal = cache(fetchGlobalInternal);

// Fresh (uncached) fetch – use for metadata so title updates immediately after CMS changes.
export async function getGlobalFresh(): Promise<GlobalData | null> {
  try {
    const base = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
    const res = await fetch(`${base}/api/global?${globalPopulate}`, {
      cache: 'no-store',
    });
    if (!res.ok) throw new Error(`Fresh global fetch failed: ${res.status}`);
    const json = await res.json();
    const attr: any = json?.data?.attributes ?? json?.data;
    if (!attr) return null;
    if (process.env.NODE_ENV === 'development') {
      console.log('[global:fresh] attr keys:', Object.keys(attr));
    }
    // Fetch favicon separately to bypass populate 400 issue.
    let faviconData: any = undefined;
    try {
      // Direct lean endpoint (no populate) first
      const leanRes = await fetch(`${base}/api/global`, { cache: 'no-store' });
      if (leanRes.ok) {
        const leanJson = await leanRes.json();
        const leanAttr = leanJson?.data?.attributes ?? leanJson?.data;
        if (leanAttr?.favicon) {
          faviconData = leanAttr.favicon;
          if (process.env.NODE_ENV === 'development')
            console.log('[global:fresh] lean global request returned favicon');
        }
      }
      if (!faviconData) {
        const favRes = await fetch(`${base}/api/global?populate=favicon`, {
          cache: 'no-store',
        });
        if (favRes.ok) {
          const favText = await favRes.text();
          let favJson: any = null;
          try {
            favJson = JSON.parse(favText);
          } catch {}
          const favAttrCandidate = favJson?.data?.attributes ?? favJson?.data;
          // Some Strapi setups put media directly under data.attributes.favicon, some directly under data.favicon
          faviconData =
            favAttrCandidate?.favicon || favJson?.data?.favicon || null;
          if (process.env.NODE_ENV === 'development') {
            console.log(
              '[global:fresh] raw favicon response text length:',
              favText.length
            );
            console.log(
              '[global:fresh] parsed favicon keys level1:',
              favJson ? Object.keys(favJson) : 'none'
            );
            console.log(
              '[global:fresh] favicon attr candidate keys:',
              favAttrCandidate ? Object.keys(favAttrCandidate) : 'none'
            );
            if (!faviconData) {
              console.log(
                '[global:fresh] favicon still missing after parse. Sample payload snippet:',
                favText.slice(0, 300)
              );
            } else {
              console.log(
                '[global:fresh] separate favicon fetch success? true'
              );
            }
          }
        }
      }
    } catch (favErr) {
      console.log(
        '[global:fresh] favicon separate fetch failed (ignored):',
        favErr
      );
    }
    // Fallback to brand.logo will be applied after brand derived below
    const seo = attr.defaultSeo || attr.seo || null;
    const brand = attr.brand || null;
    if (!faviconData && brand?.logo) {
      if (process.env.NODE_ENV === 'development') {
        console.log(
          '[global:fresh] favicon still missing, falling back to brand.logo'
        );
      }
      faviconData = brand.logo;
    }
    return {
      favicon: toAbsolute(faviconData),
      footer: attr.footer || null,
      footerCta: attr.footerCta || null,
      navbar: attr.navbar || null,
      seo: seo
        ? {
            metaTitle: seo.metaTitle,
            metaDescription: seo.metaDescription,
            ogImage: toAbsolute(seo.ogImage),
          }
        : undefined,
      brand: brand
        ? {
            segments:
              brand.segments?.length > 0
                ? brand.segments
                : [
                    {
                      text: brand.brandName_left || 'THAIPARTS',
                      color: 'primary' as const,
                    },
                    {
                      text: brand.brandName_right || 'INFINITY',
                      color: 'red' as const,
                    },
                  ],
            logo: toAbsolute(brand.logo),
          }
        : undefined,
    };
  } catch (e) {
    console.warn('getGlobalFresh failed (non-blocking):', e);
    return null;
  }
}
