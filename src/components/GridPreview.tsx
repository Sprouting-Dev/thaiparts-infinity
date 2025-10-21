import Link from 'next/link';
import Image from 'next/image';
import CTAButton from './CTAButton';
import MotionGridItem from './MotionGridItem';
import { logger } from '@/lib/logger';
import type { CTAVariant } from '@/lib/button-styles';
import { getCategoryBadgeStyle } from '@/lib/categoryBadge';

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
    path = `/api/${map[kind]}?sort=publishedAt:desc&pagination[limit]=${limit}&fields[0]=name&fields[1]=title&fields[2]=slug&fields[3]=subtitle&populate[thumbnail]=1`;
  }
  const base = process.env.NEXT_PUBLIC_STRAPI_URL ?? 'http://localhost:1337';
  try {
    const res = await fetch(`${base}${path}`, { next: { revalidate: 300 } });
    const json = await res.json();
    if (kind === 'products' && Array.isArray(json?.data)) {
      logger.debug('[GridPreview products] sample', json.data.slice(0, 2));
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
    <section className="w-full flex flex-col gap-4 lg:gap-8 smooth-transition">
      {/* Header with title and CTA. Stack description under the title using flex-col; on lg keep left alignment but still stacked vertically. */}
      <div className="w-full flex flex-col gap-4">
        {/* Title row: red dot and title always in a row, description stacked below */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 lg:gap-3">
            <div className="w-2 h-2 lg:w-4 lg:h-4 rounded-full bg-[#E92928] flex-shrink-0" />
            <h2 className="font-['Kanit'] font-medium text-[22px] lg:text-[28px] leading-[33px] lg:leading-[42px] text-[#1063A7]">
              {section.title}
            </h2>
          </div>
          {/* Services-specific description shown under the section title */}
          {section.kind === 'services' && (
            <p className="text-[16px] lg:text-[22px] leading-[24px] lg:leading-[33px] text-[#333333] max-w-3xl">
              เราออกแบบ ติดตั้ง และดูแลระบบ SCADA สำหรับโรงงาน น้ำบำบัด
              และโครงสร้างพื้นฐาน ด้วยโซลูชันที่ปรับแต่งได้ตามงานจริง
              พร้อมมาตรฐานความปลอดภัย OT และการสนับสนุนหลังการขาย
            </p>
          )}
        </div>
      </div>

      {/* Grid container */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                : `/articles/${slug}`;

          // Get category badge from Strapi component
          const categoryBadge = isDirectItem
            ? item.categoryBadge
            : item.attributes?.categoryBadge;

          const categoryStyle = getCategoryBadgeStyle(categoryBadge?.color);

          // Determine base for prefixed Strapi media URLs
          const base =
            process.env.NEXT_PUBLIC_STRAPI_URL ?? 'http://localhost:1337';

          const itemGap = section.kind === 'articles' ? 'gap-0' : 'gap-2';

          const imageRounded =
            section.kind === 'articles' ? 'rounded-t-lg' : 'rounded-lg';

          return (
            <MotionGridItem key={isDirectItem ? index : item.id} index={index}>
              <Link
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
                  {image ? (
                    (() => {
                      const isExternal = image.startsWith('http');
                      const src = isExternal
                        ? image
                        : image.startsWith('/')
                          ? image
                          : `${base}${image}`;
                      return (
                        <Image
                          src={src}
                          alt={title || ''}
                          fill
                          sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 33vw"
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

                {/* Content wrapper for articles */}
                {section.kind === 'articles' ? (
                  <div className="p-4 flex flex-col gap-1 flex-grow">
                    {/* Title */}
                    <h3 className="font-['Kanit'] font-medium text-[16px] leading-[24px] lg:text-[22px] lg:leading-[33px] text-[#333333] group-hover:text-[#1063A7] transition-colors duration-200 line-clamp-3">
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
                    <h3 className="font-['Kanit'] font-medium text-[16px] leading-[24px] lg:text-[22px] lg:leading-[33px] text-[#333333] group-hover:text-[#1063A7] transition-colors duration-200">
                      {title}
                    </h3>
                  </>
                )}
              </Link>
            </MotionGridItem>
          );
        })}
      </div>

      {/* Unified CTA Button - Bottom Center (desktop + mobile) */}
      {section.cta && (
        <div className="w-full flex justify-center">
          <CTAButton
            cta={{
              ...section.cta,
              variant: section.cta.variant || 'content-primary',
              className: 'flex-shrink-0',
            }}
            asMotion={true}
            textSize="small"
          />
        </div>
      )}
    </section>
  );
}
