import { fetchPageBySlug } from '@/lib/cms';
import { validateStructuredData } from '@/lib/seo';

export default async function Head() {
  const page = await fetchPageBySlug('services');
  const attrs = page as unknown as Record<string, unknown> | null;
  const seo = (attrs &&
    (attrs['SEO'] ??
      attrs['SharedSeoComponent'] ??
      attrs['seo'] ??
      attrs['sharedSeo'] ??
      null)) as Record<string, unknown> | null;
  const structuredJson = seo?.['structuredData'] as unknown;
  const safe = validateStructuredData(structuredJson);

  return (
    <>{safe ? <script type="application/ld+json">{safe}</script> : null}</>
  );
}
