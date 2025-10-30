import type { Metadata } from 'next';
import { fetchServiceBySlug } from '@/lib/cms';
import { sanitizeHtml } from '@/lib/sanitize';
import { buildMetadataFromSeo, extractMediaMeta } from '@/lib/seo';
import Features from '@/components/Features';

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  try {
    const { slug } = await params;
    const res = await fetchServiceBySlug(slug);
    const attrs = (res as { attributes?: unknown } | null)
      ?.attributes as Record<string, unknown> | null;
    if (!attrs) return {} as Metadata;

    const seo = (attrs['sharedSeo'] ?? attrs['seo'] ?? null) as Record<
      string,
      unknown
    > | null;

    return buildMetadataFromSeo(seo, {
      defaultCanonical: `/services/${slug}`,
      fallbackTitle:
        typeof attrs['title'] === 'string' ? attrs['title'] : undefined,
    });
  } catch {
    return {} as Metadata;
  }
}

export default async function ServiceDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = await params;
  const res = await fetchServiceBySlug(slug);
  const attrs = (res as { attributes?: unknown } | null)?.attributes as Record<
    string,
    unknown
  > | null;
  if (!attrs)
    return (
      <div className="min-h-screen flex items-center justify-center">
        บริการไม่พบ
      </div>
    );

  const title = (attrs['title'] as string) || '';
  const body = (attrs['content'] as string) || '';
  // Local typed shapes for service sub-sections
  interface SafetyStandardItem {
    title?: string;
    description?: string;
  }
  interface CaseStudyItem {
    title?: string;
    case_study_detail?: string;
    cover_image?: Array<{ url: string; alt?: string }>;
  }
  interface FeatureItemLocal {
    icon?: string;
    title?: string;
    description?: string;
  }
  interface SimpleTitle {
    title?: string;
  }
  interface CustomerReceiveItem {
    title?: string;
    description?: string;
  }
  interface ArchitecturalExampleItem {
    title?: string;
    article?: string;
  }
  // cover_image normalized in cms layer -> array of {url, alt}
  const coverImages =
    (attrs['cover_image'] as
      | Array<{ url: string; alt?: string }>
      | undefined) || [];
  const mediaMeta = extractMediaMeta(attrs['image']);
  const image = mediaMeta.url || '';
  const imageAlt = mediaMeta.alt || title;
  // other sections
  const safetyAndStandard =
    (attrs['safety_and_standard'] as SafetyStandardItem[] | undefined) || [];
  const caseStudy = (attrs['case_study'] as CaseStudyItem[]) || [];
  const features = (attrs['features'] as FeatureItemLocal[]) || [];
  const technology = (attrs['technology'] as Array<SimpleTitle | string>) || [];
  const customerReceive =
    (attrs['customer_receive'] as CustomerReceiveItem[]) || [];
  const architecturalExample =
    (attrs['architectural_example'] as ArchitecturalExampleItem[]) || [];
  // structuredData is injected into <head> via src/app/services/[slug]/head.tsx
  return (
    <main className="min-h-screen container-970 px-4 py-12">
      <article>
        <h1 className="text-2xl font-bold mb-4">{title}</h1>
        {coverImages && coverImages.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {coverImages.map((ci, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={i}
                src={ci.url}
                alt={ci.alt || title}
                className="w-full max-h-[420px] object-cover rounded"
              />
            ))}
          </div>
        ) : image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt={imageAlt}
            className="w-full max-h-[420px] object-cover mb-6"
          />
        ) : null}

        <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(String(body)) }} />

        {/* Safety and standard section */}
        {Array.isArray(safetyAndStandard) && safetyAndStandard.length > 0 ? (
          <section className="mt-10">
            <h2 className="text-xl font-semibold mb-4">มาตรฐานความปลอดภัย</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {safetyAndStandard.map((s: SafetyStandardItem, idx: number) => (
                <div key={idx} className="p-4 border rounded">
                  {s.title ? (
                    <h3 className="font-medium mb-2">{s.title}</h3>
                  ) : null}
                  {s.description ? (
                    <div
                      dangerouslySetInnerHTML={{
                        __html: String(s.description),
                      }}
                    />
                  ) : null}
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {/* Case studies */}
        {Array.isArray(caseStudy) && caseStudy.length > 0 ? (
          <section className="mt-10">
            <h2 className="text-xl font-semibold mb-4">กรณีศึกษา</h2>
            <div className="flex flex-col gap-6">
              {caseStudy.map((c: CaseStudyItem, idx: number) => (
                <div key={idx} className="p-4 border rounded">
                  {c.title ? (
                    <h3 className="font-medium mb-2">{c.title}</h3>
                  ) : null}
                  {c.cover_image &&
                  Array.isArray(c.cover_image) &&
                  c.cover_image.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-3">
                      {c.cover_image.map(
                        (ci: { url: string; alt?: string }, j: number) => (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            key={j}
                            src={ci.url}
                            alt={ci.alt || c.title || ''}
                            className="w-full h-32 object-cover rounded"
                          />
                        )
                      )}
                    </div>
                  ) : null}
                  {c.case_study_detail ? (
                    <div
                      dangerouslySetInnerHTML={{
                        __html: String(c.case_study_detail),
                      }}
                    />
                  ) : null}
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {/* Features */}
        {Array.isArray(features) && features.length > 0 ? (
          <section className="mt-10">
            <h2 className="text-xl font-semibold mb-4">คุณสมบัติ</h2>
            <Features
              items={features.map((f: FeatureItemLocal) => ({
                icon:
                  f.icon ??
                  ((f as Record<string, unknown>)['image'] as string) ??
                  '',
                title: f.title ?? '',
                description: f.description ?? '',
              }))}
            />
          </section>
        ) : null}

        {/* Technology */}
        {Array.isArray(technology) && technology.length > 0 ? (
          <section className="mt-10">
            <h2 className="text-xl font-semibold mb-4">เทคโนโลยี</h2>
            <ul className="list-disc pl-6">
              {technology.map((t: SimpleTitle | string, i: number) => (
                <li key={i}>{typeof t === 'string' ? t : (t.title ?? '')}</li>
              ))}
            </ul>
          </section>
        ) : null}

        {/* Customer receive */}
        {Array.isArray(customerReceive) && customerReceive.length > 0 ? (
          <section className="mt-10">
            <h2 className="text-xl font-semibold mb-4">
              สิ่งที่ลูกค้าจะได้รับ
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {customerReceive.map((cr: CustomerReceiveItem, i: number) => (
                <div key={i} className="p-3 border rounded">
                  {cr.title ? (
                    <h3 className="font-medium">{cr.title}</h3>
                  ) : null}
                  {cr.description ? <p>{cr.description}</p> : null}
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {/* Architectural examples */}
        {Array.isArray(architecturalExample) &&
        architecturalExample.length > 0 ? (
          <section className="mt-10">
            <h2 className="text-xl font-semibold mb-4">ตัวอย่างการใช้งาน</h2>
            <div className="flex flex-col gap-6">
              {architecturalExample.map(
                (ae: ArchitecturalExampleItem, i: number) => (
                  <div key={i} className="p-4 border rounded">
                    {ae.title ? (
                      <h3 className="font-medium mb-2">{ae.title}</h3>
                    ) : null}
                    {ae.article ? (
                      <div
                        dangerouslySetInnerHTML={{ __html: String(ae.article) }}
                      />
                    ) : null}
                  </div>
                )
              )}
            </div>
          </section>
        ) : null}
      </article>
    </main>
  );
}
