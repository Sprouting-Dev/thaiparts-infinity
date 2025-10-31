import Link from 'next/link';
import Image from 'next/image';
import CTAButton from './CTAButton';
import { getTextClass } from '@/components/ColoredText';
import { logger } from '@/lib/logger';
import type { CTAVariant } from '@/lib/button-styles';
import { getCategoryBadgeStyle } from '@/lib/categoryBadge';
import type { CategoryBadgeColor } from '@/lib/categoryBadge';
import { mediaUrl, STRAPI_URL, strapiFetch } from '@/lib/strapi';
import type { PossibleMediaInput } from '@/types/strapi';

type Section = {
  kind: 'products' | 'services' | 'articles';
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
    articles: 'articles',
  } as const;
  // For products we need categoryBadge + thumbnail; avoid over-filtering with fields so component is included.
  let path: string;
  if (kind === 'products') {
    path = `/api/products?sort=publishedAt:desc&pagination[limit]=${limit}&populate[thumbnail]=1&populate[categoryBadge]=1`;
  } else {
    // For services/articles we need the media fields; avoid using `fields` which may strip media relations.
    // Ensure we populate `cover_image` for services which may have moved media there.
    path = `/api/${map[kind]}?sort=publishedAt:desc&pagination[limit]=${limit}&populate[thumbnail]=1&populate[image]=1${
      kind === 'services' ? '&populate[cover_image]=1' : ''
    }`;
  }
  try {
    const json = await strapiFetch<{ data?: unknown[] }>(path, {}, 300);
    if (!json) return [];
    const jsonObj = json as { data?: unknown[] } | null;
    return Array.isArray(jsonObj?.data) ? (jsonObj.data as unknown[]) : [];
  } catch (error) {
    logger.error(`Failed to fetch ${kind}:`, error);
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
    // Fallback to API fetch (we'll narrow items below)
    displayItems = (await fetchItems(
      section.kind,
      section.limit ?? 5
    )) as typeof displayItems;
  }

  return (
    <section className="w-full flex flex-col gap-4 lg:gap-8 smooth-transition">
      {/* Header, description and spacing rules
          - gap between title and description: gap-2 lg:gap-4
          - gap between description and images: gap-4 (implemented as mt-4 on the grid) */}
      <div className="w-full">
        <div className="flex flex-col gap-2 lg:gap-4">
          {/* Header with title and CTA */}
          <div className="w-full flex flex-col gap-4 lg:flex-row lg:justify-between lg:items-center lg:gap-4">
            {/* Title with red dot */}
            <div className="flex items-center gap-2 lg:gap-3 lg:flex-1">
              <div className="w-2 h-2 lg:w-4 lg:h-4 rounded-full bg-[#E92928] flex-shrink-0" />
              <h2
                className={`font-['Kanit'] font-medium text-[22px] lg:text-[28px] leading-[33px] lg:leading-[42px] ${getTextClass('brandBlue')}`}
              >
                {section.title}
              </h2>
            </div>
          </div>

          {/* Additional descriptive paragraph for services (only when this section is services) */}
          {section.kind === 'services' && (
            <div className="w-full">
              <p className="font-['Kanit'] font-normal text-[16px] lg:text-[22px] text-[#333333] leading-[24px] lg:leading-[33px]">
                เราออกแบบ ติดตั้ง และดูแลระบบ SCADA สำหรับโรงงาน น้ำบำบัด
                และโครงสร้างพื้นฐาน ด้วยโซลูชันที่ปรับแต่งได้ตามงานจริง
                พร้อมมาตรฐานความปลอดภัย OT และการสนับสนุนหลังการขาย
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Grid container (separated from description by gap-4) */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {displayItems.slice(0, 5).map((item, index: number) => {
          // Handle both API response format and direct items format
          const isDirectItem = 'title' in item && !item.attributes;

          const title = isDirectItem
            ? item.title
            : (item.attributes?.name ?? item.attributes?.title ?? '');
          const slug = isDirectItem ? item.href : (item.attributes?.slug ?? '');
          // Prepare the media input for resolution. Prefer thumbnail then image.
          const maybeMedia: PossibleMediaInput = isDirectItem
            ? (item.image as PossibleMediaInput)
            : (((item.attributes as Record<string, unknown>)[
                'thumbnail'
              ] as unknown) ??
              ((item.attributes as Record<string, unknown>)[
                'image'
              ] as unknown) ??
              undefined);

          const href = isDirectItem
            ? (item.href ?? '#')
            : section.kind === 'products'
              ? `/products/${slug}`
              : section.kind === 'services'
                ? `/services/${slug}`
                : `/articles/${slug}`;

          // Get category badge from Strapi component
          const categoryBadge = isDirectItem
            ? item.categoryBadge
            : item.attributes?.categoryBadge;

          const categoryStyle = getCategoryBadgeStyle(
            categoryBadge?.color as CategoryBadgeColor
          );

          // Inline STRAPI_URL lookup is available via imported STRAPI_URL when needed.

          const itemGap = section.kind === 'articles' ? 'gap-0' : 'gap-2';

          const imageRounded =
            section.kind === 'articles' ? 'rounded-t-lg' : 'rounded-lg';

          return (
            <Link
              key={isDirectItem ? index : item.id}
              href={href}
              className={`group flex flex-col ${itemGap} hover:transform hover:scale-[1.02] transition-all duration-200 ${
                section.kind === 'articles'
                  ? 'bg-white rounded-lg shadow-lg hover:shadow-xl overflow-hidden'
                  : ''
              }`}
            >
              {/* Image container */}
              <div
                className={`w-full aspect-[300/220] overflow-hidden ${imageRounded} relative`}
              >
                {(() => {
                  // Resolve media URL from Strapi media object or plain string
                  const src = mediaUrl(maybeMedia);
                  const isExternal = src
                    ? src.startsWith('http') && !src.startsWith(STRAPI_URL)
                    : false;
                  return src ? (
                    <Image
                      src={src}
                      alt={title || ''}
                      fill
                      sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      unoptimized={isExternal}
                    />
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
                  );
                })()}
              </div>

              {/* Content wrapper for articles */}
              {section.kind === 'articles' ? (
                <div className="p-4 flex flex-col gap-1 flex-grow">
                  {/* Title */}
                  <h3
                    className={`font-['Kanit'] font-medium text-[16px] leading-[24px] lg:text-[22px] lg:leading-[33px] text-[#333333] group-hover:${getTextClass('brandBlue')} transition-colors duration-200 line-clamp-3`}
                  >
                    {title}
                  </h3>

                  {/* Description */}
                  <p className="font-['Kanit'] font-normal text-[14px] leading-[21px] lg:text-[16px] lg:leading-[24px] text-[#333333] line-clamp-3 flex-grow">
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
                        className={`${categoryStyle.bg} rounded-full flex justify-center items-center px-2 py-1 lg:p-2 w-fit`}
                      >
                        <span
                          className={`font-['Kanit'] font-semibold text-[12px] leading-[18px] lg:text-[14px] lg:leading-[21px] ${categoryStyle.text}`}
                        >
                          {categoryBadge.label}
                        </span>
                      </div>
                    )}

                  {/* Title */}
                  <h3
                    className={`font-['Kanit'] font-medium text-[16px] leading-[24px] lg:text-[22px] lg:leading-[33px] text-[#333333] group-hover:${getTextClass('brandBlue')} transition-colors duration-200`}
                  >
                    {title}
                  </h3>
                </>
              )}
            </Link>
          );
        })}
      </div>

      {/* Mobile CTA Button - Bottom Center */}
      {section.cta && (
        <div className="w-full flex justify-center">
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
