import { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getServiceBySlug } from '@/services/serviceService';
import FAQAccordion from '@/components/FAQAccordion';
import CaseStudySection from '@/components/CaseStudySection';
import TechnologySection from '@/components/TechnologySection';
import ArchitecturalExample from '@/components/ArchitecturalExample';
import FeaturesGrid from '@/components/FeaturesGrid';
import CustomerReceive from '@/components/CustomerReceive';
import SafetyAndStandards from '@/components/SafetyAndStandards';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const serviceRes = await getServiceBySlug(slug);

  if (!serviceRes) {
    return { title: 'Service Not Found' };
  }

  const service = serviceRes.attributes;
  return {
    title: `${service.title || service.name} | THAIPARTS INFINITY`,
    description: service.subtitle || 'Industrial automation service',
  };
}

export default async function ServiceDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const serviceRes = await getServiceBySlug(slug);

  if (!serviceRes) {
    notFound();
  }

  const s = serviceRes.attributes;

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
    <main className="w-full flex flex-col px-4 lg:px-[14.6875rem] pt-32 pb-20 lg:py-[15.375rem] container-970">
      <div className="flex flex-col">
        <h1 className="flex items-center gap-2 font-['Kanit'] font-medium text-base lg:text-[1.75rem] text-primary">
          <span className="w-2 lg:w-4 h-2 lg:h-4 rounded-full bg-[var(--accent-red)]"></span>
          {s.title || s.name}
        </h1>

        {s.subtitle && (
          <p className="ml-4 lg:ml-6 font-['Kanit'] font-medium text-base lg:text-[1.75rem] text-primary leading-relaxed">
            {s.subtitle}
          </p>
        )}
      </div>

      {s.cover_image?.data &&
        (() => {
          const coverImageData = Array.isArray(s.cover_image.data)
            ? s.cover_image.data[0]
            : s.cover_image.data;

          if (coverImageData?.attributes?.url) {
            const url = coverImageData.attributes.url;
            const coverImageUrl = url.startsWith('http')
              ? url
              : `${process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337'}${url}`;

            return (
              <div className="mt-8 w-full rounded-2xl overflow-hidden shadow-lg">
                <Image
                  src={coverImageUrl}
                  alt={s.title || s.name}
                  width={970}
                  height={546}
                  className="w-full aspect-square lg:aspect-auto lg:h-[31.25rem] object-cover rounded-2xl"
                  unoptimized
                />
              </div>
            );
          }
          return null;
        })()}

      {s.safety_and_standard && s.safety_and_standard.length > 0 && (
        <SafetyAndStandards
          sections={s.safety_and_standard}
          parseListItems={parseListItems}
          renderRichText={renderRichText}
        />
      )}

      {s.customer_receive && s.customer_receive.length > 0 && (
        <CustomerReceive
          sections={s.customer_receive}
          parseListItems={parseListItems}
        />
      )}

      {s.features && s.features.length > 0 && (
        <FeaturesGrid sections={s.features} />
      )}

      {s.architectural_example && s.architectural_example.length > 0 && (
        <ArchitecturalExample sections={s.architectural_example} />
      )}

      {s.technology && s.technology.length > 0 && (
        <TechnologySection
          sections={s.technology}
          parseListItems={parseListItems}
        />
      )}

      {s.case_study && s.case_study.length > 0 && (
        <CaseStudySection sections={s.case_study} />
      )}

      {s.faqs && s.faqs.length > 0 && <FAQAccordion sections={s.faqs} />}
    </main>
  );
}
