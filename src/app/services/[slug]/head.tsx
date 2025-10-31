import { getServiceBySlug } from '@/services/serviceService';
import { validateStructuredData } from '@/lib/seo';

export default async function Head({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const svc = await getServiceBySlug(slug);
  const attrs = (svc && (svc.attributes as Record<string, unknown>)) || null;
  const seo =
    (attrs &&
      (attrs['SharedSeoComponent'] as Record<string, unknown> | undefined)) ??
    (attrs && (attrs['SEO'] as Record<string, unknown> | undefined)) ??
    (attrs && (attrs['seo'] as Record<string, unknown> | undefined)) ??
    null;

  const structuredJson =
    seo && seo['structuredData'] ? seo['structuredData'] : undefined;
  const safe = validateStructuredData(structuredJson);
  return (
    <>{safe ? <script type="application/ld+json">{safe}</script> : null}</>
  );
}
