import Link from 'next/link';
import Image from 'next/image';
import CTAButton from './CTAButton';
import type { CTAVariant } from '@/lib/button-styles';
import { getCategoryBadgeStyle } from '@/lib/categoryBadge';

type Section = {
  kind: 'products' | 'services' | 'posts';
  title: string;
  limit?: number;
  cta?: { label: string; href?: string; variant: CTAVariant };
  mode?: 'auto' | 'manual';
  items?: Array<{
    image?: string;
    title: string;
    subtitle?: string;
    description?: string;
    href?: string;
  }>;
};

async function fetchItems(kind: Section['kind'], limit = 5) {
  const map = {
    products: 'products',
    services: 'services',
    posts: 'posts',
  } as const;
  // For products we need categoryBadge + thumbnail; avoid over-filtering with fields so component is included.
  let path: string;
  if (kind === 'products') {
    path = `/api/products?sort=publishedAt:desc&pagination[limit]=${limit}&populate[thumbnail]=1&populate[categoryBadge]=1`;
  } else {
    path = `/api/${map[kind]}?sort=publishedAt:desc&pagination[limit]=${limit}&fields[0]=name&fields[1]=title&fields[2]=slug&fields[3]=subtitle&populate[thumbnail]=1`;
  }
  const base = process.env.NEXT_PUBLIC_STRAPI_URL ?? 'http://localhost:1337';
  try {
    const res = await fetch(`${base}${path}`, { next: { revalidate: 300 } });
    const json = await res.json();
    if (kind === 'products' && Array.isArray(json?.data)) {
      console.log('[GridPreview products] sample', json.data.slice(0, 2));
    }
    return json?.data ?? [];
  } catch (error) {
    console.error(`Failed to fetch ${kind}:`, error);
    return [];
  }
}

export default async function GridPreview({ section }: { section: Section }) {
  // Use provided items or fetch from API
  let displayItems: Array<{
    id?: number;
    attributes?: {
      name?: string;
      title?: string;
      slug?: string;
      thumbnail?: { data?: { attributes?: { url?: string } }; url?: string };
      categoryBadge?: { label?: string; color?: string };
      description?: string;
      subtitle?: string;
    };
    title?: string;
    image?: string;
    description?: string;
    subtitle?: string;
    href?: string;
    categoryBadge?: { label?: string; color?: string };
  }> = [];

  if (section.items && section.items.length > 0) {
    // Use items from backend
    displayItems = section.items.slice(0, section.limit ?? 5);
  } else {
    // Fallback to API fetch
    displayItems = await fetchItems(section.kind, section.limit ?? 5);
  }

  return (
    <section className="w-full flex flex-col gap-6 md:gap-7 lg:gap-8 smooth-transition">
      {/* Header with title and CTA */}
      <div className="w-full flex flex-col gap-4 md:flex-row md:justify-between md:items-center lg:flex-row lg:justify-between lg:items-center md:gap-4">
        {/* Title with red dot */}
        <div className="flex items-center gap-3 md:flex-1 lg:flex-1">
          <div className="w-4 h-4 rounded-full bg-[#E92928] flex-shrink-0" />
          <h2 className="font-['Kanit'] font-medium fluid-section-heading text-[#1063A7]">
            {section.title}
          </h2>
        </div>

        {/* Desktop CTA Button */}
        {section.cta && (
          <div className="hidden md:block">
            <CTAButton
              cta={{
                ...section.cta,
                variant: section.cta.variant || 'content-primary',
                className: 'flex-shrink-0',
              }}
              textSize="small"
            />
          </div>
        )}
      </div>

      {/* Grid container */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-7 lg:gap-8">
  {displayItems.slice(0, 5).map((item, index: number) => {
          // Handle both API response format and direct items format
          const isDirectItem = 'title' in item && !item.attributes;

          const title = isDirectItem
            ? item.title
            : (item.attributes?.name ?? item.attributes?.title ?? '');
          const slug = isDirectItem ? item.href : (item.attributes?.slug ?? '');
          const image = isDirectItem
            ? item.image
            : (item.attributes?.thumbnail?.data?.attributes?.url ?? '');

          const href = isDirectItem
            ? (item.href ?? '#')
            : section.kind === 'products'
              ? `/products/${slug}`
              : section.kind === 'services'
                ? `/services/${slug}`
                : `/posts/${slug}`;

          // Get category badge from Strapi component
          const categoryBadge = isDirectItem
            ? item.categoryBadge
            : item.attributes?.categoryBadge;

          const categoryStyle = getCategoryBadgeStyle(categoryBadge?.color);

          // Determine base for prefixed Strapi media URLs
          const base = process.env.NEXT_PUBLIC_STRAPI_URL ?? 'http://localhost:1337';

          return (
            <Link
              key={isDirectItem ? index : item.id}
              href={href}
              className={`group flex flex-col gap-3 hover:transform hover:scale-[1.02] transition-all duration-200 ${
                section.kind === 'posts'
                  ? 'bg-white rounded-lg shadow-lg hover:shadow-xl overflow-hidden'
                  : ''
              }`}
            >
              {/* Image container */}
              <div className="w-full aspect-[300/220] overflow-hidden rounded-lg relative">
                {image ? (
                  (() => {
                    const isExternal = image.startsWith('http');
                    const src = isExternal ? image : image.startsWith('/') ? image : `${base}${image}`;
                    return (
                      <Image
                        src={src}
                        alt={title || ''}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        unoptimized={isExternal}
                      />
                    );
                  })()
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-neutral-200 to-neutral-300 flex items-center justify-center">
                    <div className="text-neutral-400 text-4xl">
                      {section.kind === 'products'
                        ? '📦'
                        : section.kind === 'services'
                          ? '🔧'
                          : '📄'}
                    </div>
                  </div>
                )}
              </div>

              {/* Content wrapper for posts */}
              {section.kind === 'posts' ? (
                <div className="p-6 flex flex-col gap-3 flex-grow">
                  {/* Title */}
                  <h3 className="font-['Kanit'] font-medium fluid-card-title leading-tight text-[#333333] group-hover:text-[#1063A7] transition-colors duration-200 line-clamp-3">
                    {title}
                  </h3>

                  {/* Description */}
                  <p className="font-['Kanit'] font-normal fluid-small leading-relaxed text-[#666666] line-clamp-3 flex-grow">
                    {(isDirectItem
                      ? item.description || item.subtitle
                      : item.attributes?.description ||
                        item.attributes?.subtitle) || ''}
                  </p>
                </div>
              ) : (
                <>
                  {/* Category badge - only for products */}
                  {section.kind === 'products' &&
                    categoryBadge?.label &&
                    categoryStyle && (
                      <div
                        className={`${categoryStyle.bg} rounded-full flex justify-center items-center px-3 py-1 w-fit`}
                      >
                        <span
                          className={`font-['Kanit'] font-semibold text-sm ${categoryStyle.text}`}
                        >
                          {categoryBadge.label}
                        </span>
                      </div>
                    )}

                  {/* Title */}
                  <h3 className="font-['Kanit'] font-medium fluid-card-title leading-tight text-[#333333] group-hover:text-[#1063A7] transition-colors duration-200">
                    {title}
                  </h3>
                </>
              )}
            </Link>
          );
        })}
      </div>

      {/* Mobile CTA Button - Bottom Right */}
      {section.cta && (
        <div className="w-full flex justify-end md:hidden">
          <CTAButton
            cta={{
              ...section.cta,
              variant: section.cta.variant || 'content-primary',
              className: 'flex-shrink-0',
            }}
            textSize="small"
          />
        </div>
      )}
    </section>
  );
}
