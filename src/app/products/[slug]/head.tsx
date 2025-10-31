import { fetchProductBySlug } from '@/lib/cms';
import { validateStructuredData } from '@/lib/seo';

export default async function Head({
  params,
}: {
  params: Promise<{ slug: string }> | { slug: string };
}) {
  const { slug } = await params;
  const res = await fetchProductBySlug(slug);
  const attrs = (res as { attributes?: unknown } | null)?.attributes as Record<
    string,
    unknown
  > | null;
  const seo =
    (attrs &&
      (attrs['SEO'] ?? attrs['SharedSeoComponent'] ?? attrs['seo'] ?? attrs['sharedSeo'] ?? null)) as
    Record<string, unknown> | null;
  const structuredJson = seo?.['structuredData'] as unknown;
  const safe = validateStructuredData(structuredJson);

  return <>{safe ? <script type="application/ld+json">{safe}</script> : null}</>;
}
