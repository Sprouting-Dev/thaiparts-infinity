import { Metadata } from 'next';
import GridPreview from '@/components/GridPreview';
import { MotionReveal } from '@/components/MotionReveal';
import { fetchArticles } from '@/lib/cms';
import { mediaUrl } from '@/lib/strapi';

export const metadata: Metadata = {
  title: 'Knowledge Center | THAIPARTS INFINITY',
  description: 'Articles and insights about industrial automation',
};

export default async function ArticlesPage() {
  // Fetch articles from Strapi and map to GridPreview items
  // Order articles from oldest → newest (หน้าไปหลัง)
  const { items: articles = [] } = await fetchArticles({
    pageSize: 12,
    sort: 'publishedAt:asc',
  });

  const items = (articles || []).map((p: any) => {
    const attrs = p?.attributes ?? {};
    const slug = attrs?.slug || '';

    // Resolve image via mediaUrl helper. Try common fields used in Strapi shapes.
    let image = mediaUrl(attrs?.image ?? attrs?.thumbnail ?? attrs?.cover);
    // Do not fall back to local assets here — leave empty so GridPreview
    // will render its neutral placeholder when no CMS image is provided.
    if (!image) image = '';

    const richBlocks = Array.isArray(attrs?.body) ? attrs.body : [];
    let bodyText = '';
    if (richBlocks.length) {
      bodyText = richBlocks
        .filter((b: any) => b && (b.type === 'paragraph' || b.type === 'text'))
        .map((b: any) =>
          Array.isArray(b.children)
            ? b.children
                .map((c: any) =>
                  c && typeof c.text === 'string' ? c.text : ''
                )
                .join('')
            : ''
        )
        .join(' ')
        .slice(0, 200);
    }

    return {
      title: attrs?.title || '',
      image,
      description: attrs?.subtitle || bodyText || '',
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
      <main className="w-full flex flex-col items-center pt-24">
        <div className="container-970 flex flex-col gap-8 py-8">
          <MotionReveal>
            <GridPreview section={section} />
          </MotionReveal>
        </div>
      </main>
    </div>
  );
}
