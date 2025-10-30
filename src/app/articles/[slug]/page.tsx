import type { Metadata } from 'next';
import { fetchArticleBySlug } from '@/lib/cms';
import { sanitizeHtml } from '@/lib/sanitize';
import { buildMetadataFromSeo, extractMediaMeta } from '@/lib/seo';

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  try {
    const { slug } = await params;
    const res = await fetchArticleBySlug(slug);
    const attrs = (res as { attributes?: unknown } | null)
      ?.attributes as Record<string, unknown> | null;
    if (!attrs) return {} as Metadata;

    const seo = (attrs['sharedSeo'] ?? attrs['seo'] ?? null) as Record<
      string,
      unknown
    > | null;

    return buildMetadataFromSeo(seo, {
      defaultCanonical: `/articles/${slug}`,
      fallbackTitle:
        typeof attrs['title'] === 'string' ? attrs['title'] : undefined,
    });
  } catch {
    return {} as Metadata;
  }
}

export default async function ArticleDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = await params;
  const res = await fetchArticleBySlug(slug);
  const attrs = (res as { attributes?: unknown } | null)?.attributes as Record<
    string,
    unknown
  > | null;
  if (!attrs) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        บทความไม่พบ
      </div>
    );
  }

  const title = (attrs['title'] as string) || '';
  const body = (attrs['content'] as string) || (attrs['body'] as string) || '';
  const mediaMeta = extractMediaMeta(attrs['image']);
  const image = mediaMeta.url || '';
  const imageAlt = mediaMeta.alt || title;

  // structuredData is injected into <head> via src/app/articles/[slug]/head.tsx
  return (
    <main className="min-h-screen container-970 px-4 py-12">
      <article>
        <h1 className="text-2xl font-bold mb-4">{title}</h1>
        {image ? (
          // next/image omitted for simplicity in server render; allow unoptimized
          // consumers to add optimization later
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt={imageAlt}
            className="w-full max-h-[420px] object-cover mb-6"
          />
        ) : null}
        <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(String(body)) }} />
      </article>
    </main>
  );
}
