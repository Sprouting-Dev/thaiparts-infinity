import type { Metadata } from 'next';
import { fetchArticleBySlug, fetchArticles } from '@/lib/cms';
import { sanitizeHtml } from '@/lib/sanitize';
import { notFound } from 'next/navigation';
import SafeHtml from '@/components/SafeHtml';
import { buildMetadataFromSeo, extractMediaMeta } from '@/lib/seo';
import Image from 'next/image';

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
    notFound();
  }

  const title = (attrs['title'] as string) || '';
  const subtitle = (attrs['subtitle'] as string) || '';
  // Content may be a rich HTML string OR a dynamic zone array of components
  const body =
    typeof attrs['content'] === 'string'
      ? (attrs['content'] as string)
      : typeof attrs['body'] === 'string'
        ? (attrs['body'] as string)
        : '';
  const contentBlocks: unknown[] = Array.isArray(attrs['content'])
    ? (attrs['content'] as unknown[])
    : [];
  const mediaMeta = extractMediaMeta(attrs['image']);
  const image = mediaMeta.url || '';
  const imageAlt = mediaMeta.alt || title;

  type RawBlock = Record<string, unknown>;
  type Unit =
    | {
        kind: 'paired';
        imageBlock: RawBlock;
        contentBlock: RawBlock;
        key: string;
      }
    | { kind: 'image'; block: RawBlock; key: string }
    | { kind: 'content'; block: RawBlock; key: string }
    | { kind: 'other'; block: RawBlock; key: string };

  function normalizeBlocks(blocks: RawBlock[]): Unit[] {
    const units: Unit[] = [];
    for (let i = 0; i < blocks.length; i++) {
      const block = blocks[i] as RawBlock;
      const next = blocks[i + 1] as RawBlock | undefined;
      const blockId = block['id'] ?? i;
      const nextId = next ? (next['id'] ?? i + 1) : i + 1;
      if (
        block['__component'] === 'shared.image-with-description' &&
        next &&
        next['__component'] === 'shared.content-default'
      ) {
        units.push({
          kind: 'paired',
          imageBlock: block,
          contentBlock: next,
          key: `${blockId}-${nextId}`,
        });
        i++; // consume next
        continue;
      }
      if (block['__component'] === 'shared.image-with-description') {
        units.push({ kind: 'image', block, key: String(blockId) });
        continue;
      }
      if (block['__component'] === 'shared.content-default') {
        units.push({ kind: 'content', block, key: String(blockId) });
        continue;
      }
      // fallback: any object with content or description
      units.push({ kind: 'other', block, key: String(blockId) });
    }
    return units;
  }

  // Fetch 3 latest articles for the "ข่าวสารและบทความล่าสุด" section
  const latestRes = await fetchArticles({ page: 1, pageSize: 3 });
  const latest = latestRes.items ?? [];

  // structuredData is injected into <head> via src/app/articles/[slug]/head.tsx
  return (
    <main className="min-h-screen w-full pt-[246px]">
      <div className="mx-auto container-970 w-full px-4 flex flex-col gap-8 lg:gap-24">
        <article className="flex flex-col gap-8">
          {/* Top section: hero block and intro */}
          <section className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <h2 className="text-[22px] leading-[33px] lg:text-[28px] lg:leading-[42px] font-medium text-[var(--brand-blue)]">
                {title}
              </h2>

              <div className="flex flex-col gap-6">
                {/* Image / hero rectangle */}
                {image ? (
                  <div className="relative rounded-[24px] overflow-hidden bg-[#D9D9D9] h-[400px]">
                    <Image
                      src={image}
                      alt={imageAlt}
                      fill
                      sizes="(min-width:1024px) 970px, 100vw"
                      style={{ objectFit: 'cover' }}
                      priority
                    />
                  </div>
                ) : null}
                <div className="flex gap-2 justify-between lg:justify-end items-center">
                  <p className="text-[16px] leading-6 text-[var(--brand-blue)]">
                    ประเภทบทความ
                  </p>
                  <div className="flex flex-row items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[var(--accent-red)]"></span>
                    {/* read_time placed under hero image, above description */}
                    {typeof attrs['read_time'] === 'number' ||
                    typeof attrs['read_time'] === 'string' ? (
                      <div className="text-[16px] leading-6 font-medium text-[var(--brand-blue)]">
                        อ่าน {String(attrs['read_time'])} นาที
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
            {/* Subtitle + meta row moved below the hero image (Thai: ประเภทบทความ) */}
            {subtitle ? (
              <p className="text-[22px] leading-[33px] text-[#333]">
                {subtitle}
              </p>
            ) : null}
          </section>
          {/* Description / body or dynamic blocks rendered directly as divs */}
          {contentBlocks.length > 0 ? (
            (() => {
              const units = normalizeBlocks(contentBlocks as RawBlock[]);
              return units.map(u => {
                const key = u.key;
                const renderCard = (children: React.ReactNode) => (
                  <div
                    key={key}
                    className="bg-[#1063A70A] flex flex-col gap-4 lg:gap-6 rounded-2xl lg:rounded-3xl p-4 lg:p-6"
                  >
                    {children}
                  </div>
                );

                if (u.kind === 'paired') {
                  const attrsRec = attrs as Record<string, unknown>;
                  const fallbackImg = attrsRec['image'] ?? null;
                  const imageMeta = extractMediaMeta(
                    u.imageBlock['image'] ?? fallbackImg
                  );
                  const description =
                    typeof u.imageBlock['description'] === 'string'
                      ? sanitizeHtml(String(u.imageBlock['description']))
                      : '';
                  const contentHtml =
                    typeof u.contentBlock['content'] === 'string'
                      ? sanitizeHtml(String(u.contentBlock['content']))
                      : '';

                  return renderCard(
                    <>
                      <div className="rounded-lg overflow-hidden bg-[#D9D9D9] h-[400px] relative">
                        {imageMeta.url ? (
                          <Image
                            src={imageMeta.url}
                            alt={(imageMeta.alt as string) || ''}
                            fill
                            sizes="(min-width:1024px) 922px, 100vw"
                            style={{ objectFit: 'cover' }}
                          />
                        ) : null}
                      </div>
                      <div className="flex flex-col gap-6">
                        {description ? (
                          <h3 className="text-[22px] leading-[33px] lg:text-[28px] lg:leading-[42px] font-medium text-[#1063A7]">
                            <SafeHtml html={String(description)} />
                          </h3>
                        ) : null}
                        {contentHtml ? (
                          <div className="text-[22px] leading-[33px] text-[#333] space-y-6">
                            <SafeHtml html={String(contentHtml)} />
                          </div>
                        ) : null}
                      </div>
                    </>
                  );
                }

                if (u.kind === 'image') {
                  const attrsRec = attrs as Record<string, unknown>;
                  const fallbackImg = attrsRec['image'] ?? null;
                  const imageMeta = extractMediaMeta(
                    u.block['image'] ?? fallbackImg
                  );
                  const description =
                    typeof u.block['description'] === 'string'
                      ? sanitizeHtml(String(u.block['description']))
                      : '';

                  return renderCard(
                    <>
                      <div className="rounded-lg overflow-hidden bg-[#D9D9D9] h-[400px] relative">
                        {imageMeta.url ? (
                          <Image
                            src={imageMeta.url}
                            alt={(imageMeta.alt as string) || ''}
                            fill
                            sizes="(min-width:1024px) 922px, 100vw"
                            style={{ objectFit: 'cover' }}
                          />
                        ) : null}
                      </div>
                      {description ? (
                        <h3 className="text-[22px] leading-[33px] lg:text-[28px] lg:leading-[42px] font-medium text-[#1063A7]">
                          <SafeHtml html={String(description)} />
                        </h3>
                      ) : null}
                    </>
                  );
                }

                if (u.kind === 'content') {
                  const contentHtml =
                    typeof u.block['content'] === 'string'
                      ? sanitizeHtml(String(u.block['content']))
                      : '';
                  return renderCard(
                    <div className="text-[22px] leading-[33px] text-[#333] space-y-6">
                      <SafeHtml html={String(contentHtml)} />
                    </div>
                  );
                }

                // other
                if (u.kind === 'other') {
                  if (u.block['content']) {
                    const contentHtml = sanitizeHtml(
                      String(u.block['content'])
                    );
                    return renderCard(
                      <div className="text-[22px] leading-8 text-[#333]">
                        <SafeHtml html={String(contentHtml)} />
                      </div>
                    );
                  }
                  if (u.block['description']) {
                    const descHtml = sanitizeHtml(
                      String(u.block['description'])
                    );
                    return renderCard(
                      <div className="text-[18px] text-[#333]">
                        <SafeHtml html={String(descHtml)} />
                      </div>
                    );
                  }
                }

                return null;
              });
            })()
          ) : (
            <div className="prose max-w-none text-[22px] leading-8 text-[#333]">
              <SafeHtml html={String(sanitizeHtml(String(body)))} />
            </div>
          )}

          {/* Repeated example blocks to mimic the provided layout (these are
              driven by article content in real data; keep them simple here).
              If the article uses dynamic zone components, the HTML above will
              render them. */}
        </article>
        {/* News list */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full bg-[#E92928]" />
            <h3 className="text-2xl font-medium text-[#1063A7]">
              ข่าวสารและบทความล่าสุด
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {latest.map(
              (it: { id?: number; attributes?: Record<string, unknown> }) => {
                const attrs = it?.attributes ?? {};
                const mm = extractMediaMeta(attrs['image']);
                const thumb = mm.url || '';
                const t = (attrs['title'] as string) || '';
                const desc =
                  (attrs['subtitle'] as string) ||
                  (attrs['description'] as string) ||
                  '';
                return (
                  <article
                    key={it.id}
                    className="bg-white rounded-lg overflow-hidden shadow-md"
                  >
                    <a href={`/articles/${attrs['slug']}`} className="block">
                      <div className="h-44 bg-[#D9D9D9] overflow-hidden">
                        {thumb ? (
                          <Image
                            src={thumb}
                            alt={t}
                            width={400}
                            height={176}
                            className="w-full h-full object-cover"
                          />
                        ) : null}
                      </div>
                      <div className="p-4">
                        <h4 className="text-lg font-medium text-[#333]">{t}</h4>
                        <p className="text-sm text-[#666]">{desc}</p>
                      </div>
                    </a>
                  </article>
                );
              }
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
