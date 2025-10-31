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
  const { slug } = await (typeof params === 'object' && 'then' in params ? params : Promise.resolve(params));
  try {
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
    const serviceTitle = attrs && typeof attrs['title'] === 'string' ? attrs['title'] : undefined;
    const serviceSubtitle = attrs && typeof attrs['subtitle'] === 'string' ? attrs['subtitle'] : undefined;

    return buildMetadataFromSeo(seo, {
      defaultCanonical: `/services/${slug}`,
      fallbackTitle: serviceTitle,
      fallbackDescription: serviceSubtitle || `บริการ${serviceTitle || ''} จาก THAIPARTS INFINITY`,
    });
  } catch {
    return buildMetadataFromSeo(null, {
      defaultCanonical: `/services/${slug}`,
      fallbackTitle: 'Service | THAIPARTS INFINITY',
      fallbackDescription: 'บริการและโซลูชันวิศวกรรมจาก THAIPARTS INFINITY',
    });
  }
}
