import type { Metadata } from 'next';
import { ReactNode } from 'react';
import { fetchPageBySlug } from '@/lib/cms';
import { buildMetadataFromSeo } from '@/lib/seo';

export default async function ServicesLayout({
  children,
}: {
  children: ReactNode;
}) {
  // JSON-LD for this layout is injected in src/app/services/head.tsx (head)
  return <>{children}</>;
}

export async function generateMetadata(): Promise<Metadata> {
  try {
    const page = await fetchPageBySlug('services');
    const attrs = page as unknown as Record<string, unknown> | null;
    const seo =
      (attrs &&
        (attrs['SharedSeoComponent'] as Record<string, unknown> | undefined)) ??
      (attrs && (attrs['SEO'] as Record<string, unknown> | undefined)) ??
      (attrs && (attrs['seo'] as Record<string, unknown> | undefined)) ??
      null;
    return buildMetadataFromSeo(seo, { defaultCanonical: '/services' });
  } catch {
    return {};
  }
}
