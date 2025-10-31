import { Metadata } from 'next';
import GridPreview from '@/components/features/GridPreview';
import { MotionReveal } from '@/components/motion/MotionReveal';
import { fetchArticles } from '@/lib/cms';
import { mediaUrl } from '@/lib/strapi';
import type { ArticleAttributes } from '@/types/cms';
import type { StrapiData, PossibleMediaInput } from '@/types/strapi';
import { buildMetadataFromSeo } from '@/lib/seo';
import { fetchPageBySlug } from '@/lib/cms';

export async function generateMetadata(): Promise<Metadata> {
  try {
    const page = await fetchPageBySlug('articles');
    const attrs = page as unknown as Record<string, unknown> | null;
    const seo =
      (attrs &&
        (attrs['SharedSeoComponent'] as Record<string, unknown> | undefined)) ??
      (attrs && (attrs['SEO'] as Record<string, unknown> | undefined)) ??
      (attrs && (attrs['seo'] as Record<string, unknown> | undefined)) ??
      null;
    return buildMetadataFromSeo(seo, {
      defaultCanonical: '/articles',
      fallbackTitle: 'Knowledge Center | THAIPARTS INFINITY',
      fallbackDescription:
        'ศูนย์รวมความเชี่ยวชาญและบทความเกี่ยวกับระบบ Automation, Electrical และ Instrument จาก THAIPARTS INFINITY',
    });
  } catch {
    // If fetching the page fails, fall back to a null SEO object so
    // buildMetadataFromSeo can generate safe defaults.
    return buildMetadataFromSeo(null, {
      defaultCanonical: '/articles',
      fallbackTitle: 'Knowledge Center | THAIPARTS INFINITY',
      fallbackDescription:
        'ศูนย์รวมความเชี่ยวชาญและบทความเกี่ยวกับระบบ Automation, Electrical และ Instrument จาก THAIPARTS INFINITY',
    });
  }
}

export default async function ArticlesPage() {
  // Fetch articles from Strapi and map to GridPreview items
  // Order articles from oldest → newest (หน้าไปหลัง)
  const { items: articles = [] } = await fetchArticles({
    pageSize: 12,
    sort: 'publishedAt:asc',
  });
  const items = (articles || [])
    .map(
      (p): { id?: number; attributes?: ArticleAttributes } =>
        p as StrapiData<ArticleAttributes>
    )
    .map(p => {
      const attrs = p?.attributes ?? ({} as ArticleAttributes);
      const slug = attrs.slug ?? '';

      // Resolve image via mediaUrl helper. Try common fields used in Strapi shapes.
      const attrsRecord = attrs as Record<string, unknown>;
      const maybeImage: PossibleMediaInput = (attrs.image ??
        (attrsRecord['thumbnail'] as PossibleMediaInput) ??
        (attrsRecord['cover'] as PossibleMediaInput)) as PossibleMediaInput;
      let image = mediaUrl(maybeImage);
      // Do not fall back to local assets here — leave empty so GridPreview
      // will render its neutral placeholder when no CMS image is provided.
      if (!image) image = '';

      // Parse simple rich text blocks for a short excerpt safely
      const richBlocks = Array.isArray(attrsRecord['body'])
        ? (attrsRecord['body'] as unknown[])
        : [];
      let bodyText = '';
      if (richBlocks.length) {
        const parts: string[] = [];
        for (const b of richBlocks) {
          if (!b || typeof b !== 'object') continue;
          const maybeType = (b as Record<string, unknown>)['type'];
          if (maybeType !== 'paragraph' && maybeType !== 'text') continue;
          const children = Array.isArray(
            (b as Record<string, unknown>)['children']
          )
            ? ((b as Record<string, unknown>)['children'] as unknown[])
            : [];
          const childText = children
            .map(c => {
              if (!c || typeof c !== 'object') return '';
              const text = (c as Record<string, unknown>)['text'];
              return typeof text === 'string' ? text : '';
            })
            .join('');
          if (childText) parts.push(childText);
        }
        bodyText = parts.join(' ').slice(0, 200);
      }

      const subtitle =
        typeof attrsRecord['subtitle'] === 'string'
          ? (attrsRecord['subtitle'] as string)
          : undefined;

      return {
        title: attrs.title ?? '',
        image,
        description: subtitle ?? bodyText ?? '',
        href: `/articles/${slug}`,
      };
    });

  const section = {
    kind: 'articles' as const,
    title: 'ศูนย์รวมความเชี่ยวชาญ',
    items,
  };

  return (
    <div className="bg-[#F5F5F5] min-h-screen">
      <main className="w-full flex flex-col items-center pt-[246px]">
        <div className="container-970 flex flex-col gap-8 py-8">
          <MotionReveal>
            <GridPreview section={section} />
          </MotionReveal>
        </div>
      </main>
    </div>
  );
}
