import { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { fetchServiceBySlug } from '@/lib/cms';
import { buildMetadataFromSeo } from '@/lib/seo';
import { mediaUrl } from '@/lib/strapi';
import type { PossibleMediaInput } from '@/types/strapi';
import FAQAccordion from '@/components/sections/FAQAccordion';
import CaseStudySection from '@/components/sections/CaseStudySection';
import TechnologySection from '@/components/sections/TechnologySection';
import ArchitecturalExample from '@/components/sections/ArchitecturalExample';
import FeaturesGrid from '@/components/sections/FeaturesGrid';
import CustomerReceive from '@/components/sections/CustomerReceive';
import SafetyAndStandards from '@/components/sections/SafetyAndStandards';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const serviceRes = await fetchServiceBySlug(slug);

  if (!serviceRes) {
    return { title: 'Service Not Found' };
  }

  const service = serviceRes.attributes as
    | Record<string, unknown>
    | null
    | undefined;
  // Prefer a per-service SEO component if present
  const seoObj =
    (service &&
      ((service['SEO'] as Record<string, unknown> | undefined) ||
        (service['seo'] as Record<string, unknown> | undefined) ||
        (service['SharedSeoComponent'] as
          | Record<string, unknown>
          | undefined))) ||
    null;

  const serviceTitle =
    service && typeof service['title'] === 'string'
      ? service['title']
      : undefined;
  const serviceName =
    service && typeof service['name'] === 'string'
      ? service['name']
      : undefined;
  const serviceSubtitle =
    service && typeof service['subtitle'] === 'string'
      ? service['subtitle']
      : undefined;

  const fallbackTitle = `${serviceTitle || serviceName || 'Service'} | THAIPARTS INFINITY`;
  const fallbackDescription =
    serviceSubtitle ||
    `บริการ${serviceTitle || serviceName || 'Service'} จาก THAIPARTS INFINITY - ผู้เชี่ยวชาญระบบ Automation ครบวงจร`;

  if (seoObj) {
    return buildMetadataFromSeo(seoObj, {
      fallbackTitle: serviceTitle || serviceName,
      fallbackDescription,
      defaultCanonical: `/services/${slug}`,
    });
  }

  // Fallback to previous pattern when no SEO component is present
  return {
    title: fallbackTitle,
    description: fallbackDescription,
  };
}

export default async function ServiceDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const serviceRes = await fetchServiceBySlug(slug);

  if (!serviceRes) {
    notFound();
  }

  const s = serviceRes.attributes as Record<string, unknown> | null | undefined;

  type RichTextChild = {
    text?: string;
    bold?: boolean;
    italic?: boolean;
  };

  type RichTextListItem = {
    type: string;
    children?: RichTextChild[];
  };

  type RichTextBlock = {
    type: string;
    level?: number;
    format?: string;
    children?: (RichTextChild | RichTextListItem)[];
  };

  const parseListItems = (data: unknown): string[] => {
    if (Array.isArray(data) && typeof data[0] === 'string') {
      return data;
    }

    if (Array.isArray(data)) {
      const items: string[] = [];
      data.forEach((block: RichTextBlock) => {
        if (block.type === 'list') {
          block.children?.forEach(listItem => {
            if ('type' in listItem && listItem.type === 'list-item') {
              const text = listItem.children
                ?.map((child: RichTextChild) => child.text || '')
                .join(' ')
                .trim();
              if (text) items.push(text);
            }
          });
        } else if (block.type === 'paragraph') {
          const text = block.children
            ?.map(child => ('text' in child ? child.text || '' : ''))
            .join(' ')
            .trim();
          if (text) items.push(text);
        }
      });
      return items;
    }

    if (typeof data === 'string') {
      const liMatches = data.match(/<li[^>]*>(.*?)<\/li>/g);
      if (liMatches) {
        return liMatches.map(li => li.replace(/<[^>]+>/g, '').trim());
      }
      return data.split('\n').filter(item => item.trim());
    }

    return [];
  };

  const renderRichText = (data: unknown): string => {
    if (typeof data === 'string') {
      return data;
    }

    if (Array.isArray(data)) {
      let html = '';
      data.forEach((block: RichTextBlock) => {
        if (block.type === 'paragraph') {
          const text = block.children
            ?.map(child => {
              if (!('text' in child)) return '';
              let t = child.text || '';
              if (child.bold) t = `<strong>${t}</strong>`;
              if (child.italic) t = `<em>${t}</em>`;
              return t;
            })
            .join('');
          html += `<p>${text}</p>`;
        } else if (block.type === 'heading') {
          const level = block.level || 2;
          const text = block.children
            ?.map(child => ('text' in child ? child.text || '' : ''))
            .join('');
          html += `<h${level}>${text}</h${level}>`;
        } else if (block.type === 'list') {
          const tag = block.format === 'ordered' ? 'ol' : 'ul';
          const items = block.children
            ?.map(item => {
              if (!('type' in item)) return '';
              const text = item.children
                ?.map((child: RichTextChild) => child.text || '')
                .join('');
              return `<li>${text}</li>`;
            })
            .join('');
          html += `<${tag}>${items}</${tag}>`;
        }
      });
      return html;
    }

    return '';
  };

  return (
    <main className="w-full flex flex-col pt-32 lg:pt-[15.375rem] container-970">
      <div className="flex flex-col">
        <h1 className="flex items-center gap-2 font-['Kanit'] font-medium text-base lg:text-[1.75rem] text-primary">
          <span className="w-2 lg:w-4 h-2 lg:h-4 rounded-full bg-[var(--accent-red)]"></span>
          {(s && typeof s['title'] === 'string' ? s['title'] : null) ||
            (s && typeof s['name'] === 'string' ? s['name'] : null) ||
            'Service'}
        </h1>

        {s && typeof s['subtitle'] === 'string' && (
          <p className="ml-4 lg:ml-6 font-['Kanit'] font-medium text-base lg:text-[1.75rem] text-primary leading-relaxed">
            {s['subtitle']}
          </p>
        )}
      </div>

      {(() => {
        const coverImage = s?.['cover_image'] as PossibleMediaInput;
        if (!coverImage) return null;

        const imageUrl = mediaUrl(coverImage);
        if (!imageUrl) return null;

        return (
          <div className="mt-8 w-full rounded-2xl overflow-hidden shadow-lg">
            <Image
              src={imageUrl}
              alt={
                (s && typeof s['title'] === 'string' ? s['title'] : null) ||
                (s && typeof s['name'] === 'string' ? s['name'] : null) ||
                'Service'
              }
              width={970}
              height={546}
              className="w-full aspect-square lg:aspect-auto lg:h-[31.25rem] object-cover rounded-2xl"
              unoptimized
            />
          </div>
        );
      })()}

      {s &&
      Array.isArray(s['safety_and_standard']) &&
      s['safety_and_standard'].length > 0 ? (
        <SafetyAndStandards
          sections={
            s['safety_and_standard'] as unknown as Parameters<
              typeof SafetyAndStandards
            >[0]['sections']
          }
          parseListItems={parseListItems}
          renderRichText={renderRichText}
        />
      ) : null}

      {s &&
      Array.isArray(s['customer_receive']) &&
      s['customer_receive'].length > 0 ? (
        <CustomerReceive
          sections={
            s['customer_receive'] as unknown as Parameters<
              typeof CustomerReceive
            >[0]['sections']
          }
          parseListItems={parseListItems}
        />
      ) : null}

      {s && Array.isArray(s['features']) && s['features'].length > 0 ? (
        <FeaturesGrid
          sections={
            s['features'] as unknown as Parameters<
              typeof FeaturesGrid
            >[0]['sections']
          }
        />
      ) : null}

      {s &&
      Array.isArray(s['architectural_example']) &&
      s['architectural_example'].length > 0 ? (
        <ArchitecturalExample
          sections={
            s['architectural_example'] as unknown as Parameters<
              typeof ArchitecturalExample
            >[0]['sections']
          }
        />
      ) : null}

      {s && Array.isArray(s['technology']) && s['technology'].length > 0 ? (
        <TechnologySection
          sections={
            s['technology'] as unknown as Parameters<
              typeof TechnologySection
            >[0]['sections']
          }
          parseListItems={parseListItems}
        />
      ) : null}

      {s && Array.isArray(s['case_study']) && s['case_study'].length > 0 ? (
        <CaseStudySection
          sections={
            s['case_study'] as unknown as Parameters<
              typeof CaseStudySection
            >[0]['sections']
          }
        />
      ) : null}

      {s && Array.isArray(s['faqs']) && s['faqs'].length > 0 ? (
        <FAQAccordion
          sections={
            s['faqs'] as unknown as Parameters<
              typeof FAQAccordion
            >[0]['sections']
          }
        />
      ) : null}
    </main>
  );
}
