import { Metadata } from 'next';
import { api } from '@/lib/api';

export const metadata: Metadata = {
  title: 'Knowledge Center | THAIPARTS INFINITY',
  description: 'Articles and insights about industrial automation',
};

type Post = {
  id: number;
  attributes: {
    title: string;
    slug: string;
    subtitle?: string;
    body?: Array<{
      type: string;
      children?: Array<{ text: string }>;
    }>;
    thumbnail?: {
      data?: {
        attributes?: {
          url: string;
        };
      };
    };
  };
};

async function getPosts() {
  try {
    const response = await api<{ data?: any[] }>(
      '/api/posts?populate[thumbnail]=1&sort=publishedAt:asc',
      { next: { revalidate: 300 } }
    );
    const raw = Array.isArray(response?.data) ? response!.data : [];
    if (raw.length)
      console.log('[posts] raw entries sample (first 3):', raw.slice(0, 3));
    // Normalize each entry so we always have { id, attributes: {...} }
    const normalized: Post[] = raw
      .map(entry => {
        if (!entry || typeof entry !== 'object') return null as any;
        if (entry.attributes && typeof entry.attributes === 'object')
          return entry as Post; // already standard
        const { id, ...rest } = entry;
        return { id, attributes: rest } as Post;
      })
      .filter(Boolean);
    if (normalized.length !== raw.length) {
      console.warn('[posts] wrapped flattened entries', {
        received: raw.length,
        normalized: normalized.length,
      });
    }
    return normalized;
  } catch (error) {
    console.error('Failed to fetch posts:', error);
    return [];
  }
}

export default async function PostsPage() {
  const posts = await getPosts();

  return (
    <div className="bg-[#F5F5F5] min-h-screen">
      <main className="w-full flex flex-col items-center pt-24">
        <div className="container-970 flex flex-col gap-8 py-8">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full bg-[#E92928] flex-shrink-0" />
            <h1 className="font-['Kanit'] font-medium text-[22px] leading-[33px] md:text-[28px] md:leading-[42px] text-[#1063A7]">
              ศูนย์รวมความเชี่ยวชาญ
            </h1>
          </div>

          {/* Posts Grid */}
          {posts.length > 0 ? (
            <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-7 lg:gap-8">
              {posts.map(post => {
                if (!post || !post.attributes) return null;
                const { attributes } = post as any;
                // Support both media shapes: 1) { thumbnail: { data: { attributes: { url }}} } 2) { thumbnail: { url } }
                const imageUrl =
                  attributes.thumbnail?.data?.attributes?.url ||
                  attributes.thumbnail?.url ||
                  '';
                // Body / content fallback
                const richBlocks = Array.isArray(attributes.body)
                  ? attributes.body
                  : Array.isArray(attributes.content)
                    ? attributes.content
                    : [];
                let bodyText = '';
                if (richBlocks.length) {
                  bodyText = richBlocks
                    .filter(
                      (b: any) =>
                        b && (b.type === 'paragraph' || b.type === 'text')
                    )
                    .map((b: any) =>
                      Array.isArray(b.children)
                        ? b.children
                            .map((c: any) =>
                              c && typeof c.text === 'string' ? c.text : ''
                            )
                            .join('')
                        : b.text || ''
                    )
                    .join(' ')
                    .slice(0, 150);
                }
                const description = attributes.subtitle || bodyText || '';
                return (
                  <div
                    key={post.id}
                    className="group flex flex-col gap-3 hover:transform hover:scale-[1.02] transition-all duration-200 bg-white rounded-lg shadow-lg hover:shadow-xl overflow-hidden"
                  >
                    <div className="w-full aspect-[300/220] overflow-hidden">
                      {imageUrl ? (
                        <img
                          src={
                            imageUrl.startsWith('http')
                              ? imageUrl
                              : `${process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337'}${imageUrl}`
                          }
                          alt={attributes.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-neutral-200 to-neutral-300 flex items-center justify-center">
                          <div className="text-neutral-400 text-4xl">📄</div>
                        </div>
                      )}
                    </div>
                    <div className="p-6 flex flex-col gap-3 flex-grow">
                      <h3 className="font-['Kanit'] font-medium text-[20px] leading-tight text-[#333333] group-hover:text-[#1063A7] transition-colors duration-200 line-clamp-3">
                        {attributes.title}
                      </h3>
                      {description && (
                        <p className="font-['Kanit'] font-normal text-[14px] leading-relaxed text-[#666666] line-clamp-3 flex-grow">
                          {description}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="w-full text-center py-16">
              <p className="font-['Kanit'] text-[18px] text-[#666666]">
                ไม่พบบทความในขณะนี้
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
