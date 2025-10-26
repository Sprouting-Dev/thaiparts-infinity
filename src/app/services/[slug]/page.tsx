import Image from 'next/image';
import { getServiceBySlug } from '@/services/serviceService';

interface PageProps {
  params: { slug: string };
}

export default async function ServiceDetailPage({ params }: PageProps) {
  const { slug } = params;
  const serviceRes = await getServiceBySlug(slug);
  if (!serviceRes) {
    return (
      <div className="px-4 py-24">
        <h1 className="text-primary text-2xl font-medium">ไม่พบข้อมูลบริการนี้</h1>
      </div>
    );
  }
  const s = serviceRes.attributes;

  return (
    <div className="w-full max-w-6xl mx-auto px-4">
      {/* Hero Section */}
      <div className="mt-12 flex flex-col lg:flex-row gap-8 items-start">
        <div className="flex-1">
          <h1 className="text-primary text-2xl lg:text-3xl font-bold">{s.title}</h1>
          <p className="mt-2 text-lg text-foreground">{s.subtitle}</p>
        </div>
        {s.image?.data?.attributes?.url && (
          <div className="flex-1">
            <Image
              src={s.image.data.attributes.url.startsWith('http') ? s.image.data.attributes.url : process.env.NEXT_PUBLIC_STRAPI_URL + s.image.data.attributes.url}
              alt={s.title}
              width={600}
              height={340}
              className="rounded-xl object-cover w-full h-auto"
            />
          </div>
        )}
      </div>

      {/* Highlights */}
      {s.highlights && (
        <div className="mt-10">
          <h2 className="text-primary text-xl font-semibold mb-4">จุดเด่น/สิ่งที่ลูกค้าได้รับ</h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {s.highlights.map((item: string, idx: number) => (
              <li key={idx} className="bg-secondary rounded-lg p-4">{item}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Features */}
      {s.features && (
        <div className="mt-10">
          <h2 className="text-primary text-xl font-semibold mb-4">สิ่งที่ให้บริการ</h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {s.features.map((item: string, idx: number) => (
              <li key={idx} className="bg-secondary rounded-lg p-4">{item}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Process Steps */}
      {s.process_steps && (
        <div className="mt-10">
          <h2 className="text-primary text-xl font-semibold mb-4">กระบวนการให้บริการ</h2>
          <ol className="flex flex-col md:flex-row gap-4">
            {s.process_steps.map((step: string, idx: number) => (
              <li key={idx} className="flex-1 bg-white border rounded-lg p-4">{step}</li>
            ))}
          </ol>
        </div>
      )}

      {/* Details */}
      {s.details && (
        <div className="mt-10">
          <h2 className="text-primary text-xl font-semibold mb-4">รายละเอียดบริการ</h2>
          <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: s.details }} />
        </div>
      )}

      {/* Case Studies */}
      {s.case_studies && (
        <div className="mt-10">
          <h2 className="text-primary text-xl font-semibold mb-4">ตัวอย่างผลงาน/เคสจริง</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {s.case_studies.map((cs: any, idx: number) => (
              <div key={idx} className="bg-secondary rounded-lg p-4">
                <h3 className="font-bold">{cs.title}</h3>
                {cs.image?.data?.attributes?.url && (
                  <Image
                    src={cs.image.data.attributes.url.startsWith('http') ? cs.image.data.attributes.url : process.env.NEXT_PUBLIC_STRAPI_URL + cs.image.data.attributes.url}
                    alt={cs.title}
                    width={400}
                    height={220}
                    className="rounded-lg my-2"
                  />
                )}
                <div className="text-sm" dangerouslySetInnerHTML={{ __html: cs.description }} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FAQ */}
      {s.faqs && (
        <div className="mt-10">
          <h2 className="text-primary text-xl font-semibold mb-4">คำถามที่พบบ่อย</h2>
          <ul>
            {s.faqs.map((faq: any, idx: number) => (
              <li key={idx} className="mb-4">
                <strong>Q: {faq.question}</strong>
                <div className="ml-2">{faq.answer}</div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}