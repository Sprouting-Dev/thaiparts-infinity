import { fetchProductBySlug } from '@/lib/cms';
import { validateStructuredData } from '@/lib/seo';

export default async function Head({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const res = await fetchProductBySlug(slug);
  const attrs = (res as { attributes?: unknown } | null)?.attributes as Record<
    string,
    unknown
  > | null;
  const seo =
    (attrs &&
      ((attrs['sharedSeo'] ?? attrs['seo']) as Record<
        string,
        unknown
      > | null)) ??
    null;
  const structuredJson =
    seo && seo['structuredData'] ? seo['structuredData'] : undefined;
  const safe = validateStructuredData(structuredJson);
  return (
    <>{safe ? <script type="application/ld+json">{safe}</script> : null}</>
  );
}
