import Image from 'next/image';
import { notFound } from 'next/navigation';
import { fetchProductBySlug } from '@/lib/cms';
import { mediaUrl } from '@/lib/strapi';
import type { PossibleMediaInput } from '@/types/strapi';
import SafeHtml from '@/components/ui/SafeHtml';
import CTAButton from '@/components/ui/CTAButton';

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }> | { slug: string };
}) {
  const { slug } = await (typeof params === 'object' && 'then' in params
    ? params
    : Promise.resolve(params));

  const res = await fetchProductBySlug(slug);
  const attrs = (res as { attributes?: unknown } | null)?.attributes as Record<
    string,
    unknown
  > | null;

  if (!attrs) {
    notFound();
  }

  // Transform to match Product type structure
  // Prefer centralized resolver which handles Strapi media objects and plain URLs
  let imageUrl = '';
  try {
    const maybeImage: PossibleMediaInput =
      attrs.image as unknown as PossibleMediaInput;
    if (maybeImage !== null && maybeImage !== undefined) {
      const resolved = mediaUrl(maybeImage);
      if (resolved && resolved.trim()) {
        imageUrl = resolved;
      }
    }
  } catch {
    // keep imageUrl as empty string on error
  }

  const mainTitle =
    (typeof attrs['main_title'] === 'string' && attrs['main_title']) ||
    (typeof attrs['title'] === 'string' && attrs['title']) ||
    '';
  const name =
    mainTitle || (typeof attrs['name'] === 'string' ? attrs['name'] : '');
  const description =
    typeof attrs['description'] === 'string' ? attrs['description'] : '';

  // Handle specifications - ensure it's a Record<string, string | number | boolean>
  let specifications: Record<string, string | number | boolean> | undefined =
    undefined;
  if (attrs['specifications']) {
    if (
      typeof attrs['specifications'] === 'object' &&
      !Array.isArray(attrs['specifications'])
    ) {
      const specs = attrs['specifications'] as Record<string, unknown>;
      const normalized: Record<string, string | number | boolean> = {};
      for (const [key, value] of Object.entries(specs)) {
        if (
          typeof value === 'string' ||
          typeof value === 'number' ||
          typeof value === 'boolean'
        ) {
          normalized[key] = value;
        } else {
          normalized[key] = String(value);
        }
      }
      if (Object.keys(normalized).length > 0) {
        specifications = normalized;
      }
    }
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center px-4">
      <div className="w-full lg:mx-auto mt-31.5 lg:mt-61.5 max-w-[938px]">
        <div className="mb-4 lg:mb-8">
          <div className="flex items-baseline gap-3 lg:mb-6">
            <span className="w-2 h-2 lg:w-4 lg:h-4 bg-[#E92928] rounded-full flex-shrink-0"></span>
            <h1 className="text-[1.375rem] lg:text-[1.75rem] font-medium text-primary leading-tight">
              {mainTitle || name}
            </h1>
          </div>
        </div>

        {imageUrl && (
          <div className="mb-4 lg:mb-8">
            <div className="w-full max-w-[938px] mx-auto relative h-[500px] overflow-hidden rounded-2xl">
              <Image
                src={imageUrl}
                alt={mainTitle || name}
                fill
                sizes="(min-width: 1024px) 938px, 100vw"
                className="object-cover object-center w-full h-full"
                priority
              />
            </div>
          </div>
        )}

        {description && (
          <div className="mb-8">
            <div
              className="product-description text-foreground leading-relaxed text-base lg:text-[1.375rem] [&_*]:!font-['Kanit']"
              style={{ fontFamily: 'Kanit, sans-serif' }}
            >
              <SafeHtml html={description} />
            </div>
          </div>
        )}

        {specifications && Object.keys(specifications).length > 0 && (
          <div className="mb-8">
            <table
              className="w-full"
              style={{ fontFamily: 'Kanit, sans-serif' }}
            >
              <tbody>
                {Object.entries(specifications).map(([key, value]) => (
                  <tr key={key}>
                    <td className="py-[0.375rem] pr-6 font-semibold text-foreground w-1/3 text-base lg:text-[1.375rem]">
                      {key}
                    </td>
                    <td className="py-[0.375rem] pl-6 text-foreground text-base lg:text-[1.375rem]">
                      {String(value)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="text-center flex justify-center">
          <CTAButton
            cta={{
              label: 'ติดต่อเราเพื่อปรึกษาวิศวกรและขอใบเสนอราคา',
              href: '/contact-us',
              variant: 'primary',
            }}
            className="w-full lg:w-auto text-base lg:text-xl mt-16"
            asMotion={true}
          />
        </div>
      </div>
    </div>
  );
}
