import { fetchPageBySlug } from '@/lib/cms';
import { validateStructuredData } from '@/lib/seo';

export default async function Head() {
  const page = await fetchPageBySlug('articles');
  const attrs = page as unknown as Record<string, unknown> | null;
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
