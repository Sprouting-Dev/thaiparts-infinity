import { getServiceBySlug } from '@/services/serviceService';
import { validateStructuredData } from '@/lib/seo';

export default async function Head({
  params,
}: {
  params: Promise<{ slug: string }> | { slug: string };
}) {
  const { slug } = await params;
  const svc = await getServiceBySlug(slug);
  const attrs = (svc && (svc.attributes as Record<string, unknown>)) || null;
  const seo =
    (attrs &&
      (attrs['SEO'] ?? attrs['SharedSeoComponent'] ?? attrs['seo'] ?? attrs['sharedSeo'] ?? null)) as
    Record<string, unknown> | null;
  const structuredJson = seo?.['structuredData'] as unknown;
  const safe = validateStructuredData(structuredJson);

  return <>{safe ? <script type="application/ld+json">{safe}</script> : null}</>;
}
