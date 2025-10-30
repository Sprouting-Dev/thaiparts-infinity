import { fetchPageBySlug } from '@/lib/cms';
import { validateStructuredData } from '@/lib/seo';

export default async function Head() {
  const page = await fetchPageBySlug('about-us');
  const attrs = page as unknown as Record<string, unknown> | null;
  const seo = (attrs && (attrs['SEO'] as Record<string, unknown>)) || null;
  const structuredJson =
    seo && seo['structuredData'] ? seo['structuredData'] : undefined;
  const safe = validateStructuredData(structuredJson);
  return (
    <>
      {safe ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safe }}
        />
      ) : null}
    </>
  );
}
