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
  params: { slug: string };
}): Promise<Metadata> {
  try {
    const { slug } = await params;
    const res = await fetchProductBySlug(slug);
    const attrs = (res as { attributes?: unknown } | null)
      ?.attributes as Record<string, unknown> | null;
    if (!attrs) return {} as Metadata;

    const seo =
      (attrs['SEO'] as Record<string, unknown> | undefined) ??
      (attrs['SharedSeoComponent'] as Record<string, unknown> | undefined) ??
      (attrs['seo'] as Record<string, unknown> | undefined) ??
      null;

    // Delegate to centralized builder to ensure uniform behavior
    return buildMetadataFromSeo(seo, {
      defaultCanonical: `/products/${slug}`,
      fallbackTitle:
        (typeof attrs['main_title'] === 'string' && attrs['main_title']) ||
        (typeof attrs['name'] === 'string' && attrs['name']) ||
        undefined,
    });
  } catch {
    return {} as Metadata;
  }
}
