import type { Metadata } from 'next';
import { ReactNode } from 'react';
import { getServiceBySlug } from '@/services/serviceService';
import { buildMetadataFromSeo } from '@/lib/seo';

export default async function ServiceSlugLayout({
  children,
}: {
  children: ReactNode;
}) {
  // Minimal wrapper for all pages under /services/[slug]
  return <div className="container-970 mx-auto px-4">{children}</div>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }> | { slug: string };
}): Promise<Metadata> {
  try {
    const { slug } = await params;
    const service = await getServiceBySlug(slug);
    const attrs = (service && service.attributes) as unknown as Record<
      string,
      unknown
    > | null;
    const seo =
      (attrs &&
        (attrs['SharedSeoComponent'] as Record<string, unknown> | undefined)) ??
      (attrs && (attrs['SEO'] as Record<string, unknown> | undefined)) ??
      (attrs && (attrs['seo'] as Record<string, unknown> | undefined)) ??
      null;
    return buildMetadataFromSeo(seo, { defaultCanonical: `/services/${slug}` });
  } catch {
    return {};
  }
}
