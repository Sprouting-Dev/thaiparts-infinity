import type { Metadata } from 'next';
import { ReactNode } from 'react';
import { fetchProductBySlug } from '@/lib/cms';
import { buildMetadataFromSeo } from '@/lib/seo';

export default async function ProductDetailLayout({
  children,
}: {
  children: ReactNode;
}) {
  // No data-fetching here; metadata and JSON-LD are generated in generateMetadata()/head.tsx.
  return <>{children}</>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }> | { slug: string };
}): Promise<Metadata> {
  const { slug } = await (typeof params === 'object' && 'then' in params ? params : Promise.resolve(params));
  try {
    const res = await fetchProductBySlug(slug);
    const attrs = (res as { attributes?: unknown } | null)
      ?.attributes as Record<string, unknown> | null;
    if (!attrs) {
      return buildMetadataFromSeo(null, {
        defaultCanonical: `/products/${slug}`,
        fallbackTitle: 'Product | THAIPARTS INFINITY',
        fallbackDescription: 'สินค้าคุณภาพจาก THAIPARTS INFINITY',
      });
    }

    const seo =
      (attrs['SEO'] as Record<string, unknown> | undefined) ??
      (attrs['SharedSeoComponent'] as Record<string, unknown> | undefined) ??
      (attrs['seo'] as Record<string, unknown> | undefined) ??
      null;

    // Delegate to centralized builder to ensure uniform behavior
    const fallbackTitle =
      (typeof attrs['main_title'] === 'string' && attrs['main_title']) ||
      (typeof attrs['name'] === 'string' && attrs['name']) ||
      undefined;
    const fallbackDescription =
      (typeof attrs['description'] === 'string' && attrs['description'].trim()) ||
      (typeof attrs['tag'] === 'string' && `สินค้า ${attrs['tag']} จาก THAIPARTS INFINITY`) ||
      'สินค้าคุณภาพจาก THAIPARTS INFINITY';

    return buildMetadataFromSeo(seo, {
      defaultCanonical: `/products/${slug}`,
      fallbackTitle,
      fallbackDescription,
    });
  } catch {
    return buildMetadataFromSeo(null, {
      defaultCanonical: `/products/${slug}`,
      fallbackTitle: 'Product | THAIPARTS INFINITY',
      fallbackDescription: 'สินค้าคุณภาพจาก THAIPARTS INFINITY',
    });
  }
}
