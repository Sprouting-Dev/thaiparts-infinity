import type { Metadata } from 'next';
import { ReactNode } from 'react';
import { fetchPageBySlug } from '@/lib/cms';
import { buildMetadataFromSeo } from '@/lib/seo';

export default async function ProductsLayout({
  children,
}: {
  children: ReactNode;
}) {
  // JSON-LD for this layout is injected in src/app/products/head.tsx (head)
  return <>{children}</>;
}

export async function generateMetadata(): Promise<Metadata> {
  // Try to fetch a Page entry for 'products' which may contain SEO fields
  try {
    const page = await fetchPageBySlug('products');
    const attrs = page as unknown as Record<string, unknown> | null;
    const seo =
      (attrs &&
        (attrs['SharedSeoComponent'] as Record<string, unknown> | undefined)) ??
      (attrs && (attrs['SEO'] as Record<string, unknown> | undefined)) ??
      (attrs && (attrs['seo'] as Record<string, unknown> | undefined)) ??
      null;
    // Delegate to centralized builder which handles canonical/openGraph/twitter
    return buildMetadataFromSeo(seo, {
      defaultCanonical: '/products',
      fallbackTitle: 'Products | THAIPARTS INFINITY',
      fallbackDescription:
        'สินค้าและอะไหล่สำหรับระบบ Automation, Electrical และ Instrument ครบวงจร จาก THAIPARTS INFINITY',
    });
  } catch {
    return buildMetadataFromSeo(null, {
      defaultCanonical: '/products',
      fallbackTitle: 'Products | THAIPARTS INFINITY',
      fallbackDescription:
        'สินค้าและอะไหล่สำหรับระบบ Automation, Electrical และ Instrument ครบวงจร จาก THAIPARTS INFINITY',
    });
  }
}
