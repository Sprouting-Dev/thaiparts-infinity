import { Metadata } from 'next';
import GridPreview from '@/components/GridPreview';
import { MotionReveal } from '@/components/MotionReveal';

export const metadata: Metadata = {
  title: 'Knowledge Center | THAIPARTS INFINITY',
  description: 'Articles and insights about industrial automation',
};

type Article = {
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
      url?: string;
    };
  };
};

function getArticles(): Article[] {
  // Static articles data (kept as original sources; images will be mapped to homepage assets)
  return [
    {
      id: 1,
      attributes: {
        title: '5 สัญญาณเตือน! ถึงเวลาต้องอัปเกรด PLC/SCADA ในโรงงานคุณ',
        slug: 'scada-plc-system',
        subtitle:
          'บทวิเคราะห์เชิงเทคนิคที่ช่วยให้ผู้บริหารและวิศวกรประเมินความเสี่ยงจากระบบควบคุมที่ล้าสมัย ก่อนเกิด Downtime ครั้งใหญ่',
        body: [
          {
            type: 'paragraph',
            children: [
              {
                text: 'บทวิเคราะห์เชิงเทคนิคที่ช่วยให้ผู้บริหารและวิศวกรประเมินความเสี่ยงจากระบบควบคุมที่ล้าสมัย ก่อนเกิด Downtime ครั้งใหญ่',
              },
            ],
          },
        ],
        thumbnail: undefined,
      },
    },
    {
      id: 2,
      attributes: {
        title:
          'Case Study: โรงงานอาหาร A ลด Downtime จาก 80 เหลือ 10 ชม./ปี ได้อย่างไร',
        slug: 'downtime-reduction',
        subtitle:
          'เจาะลึกโซลูชัน Hydraulic & Pneumatic Systems ที่เราออกแบบและติดตั้ง พร้อมตัวเลขผลลัพธ์ที่วัดผลได้จริง',
        body: [
          {
            type: 'paragraph',
            children: [
              {
                text: 'เจาะลึกโซลูชัน Hydraulic & Pneumatic Systems ที่เราออกแบบและติดตั้ง พร้อมตัวเลขผลลัพธ์ที่วัดผลได้จริง',
              },
            ],
          },
        ],
        thumbnail: undefined,
      },
    },
    {
      id: 3,
      attributes: {
        title:
          'เช็กด่วน! มอเตอร์ VFD: ทำไมการจัดส่งด่วนจึงช่วยประหยัดเงินได้มากกว่า',
        slug: 'vfd-electrical-system',
        subtitle:
          'บทความที่เชื่อมโยงความสำคัญของ Fast Delivery เข้ากับผลกระทบทางเศรษฐกิจเมื่อเครื่องจักรหยุดเดิน',
        body: [
          {
            type: 'paragraph',
            children: [
              {
                text: 'บทความที่เชื่อมโยงความสำคัญของ Fast Delivery เข้ากับผลกระทบทางเศรษฐกิจเมื่อเครื่องจักรหยุดเดิน',
              },
            ],
          },
        ],
        thumbnail: undefined,
      },
    },
  ];
}

export default function ArticlesPage() {
  const articles = getArticles();

  // Map static articles to the same card data used on the homepage GridPreview
  const items = articles.map(p => {
    const attrs = p.attributes || {};
    const slug = attrs.slug || '';
    // Map known slugs to homepage article images
    const imageMap: Record<string, string> = {
      'scada-plc-system': '/homepage/articles/article-01.webp',
      'downtime-reduction': '/homepage/articles/article-02.webp',
      'vfd-electrical-system': '/homepage/articles/article-03.webp',
    };

    const image =
      attrs.thumbnail?.data?.attributes?.url ||
      attrs.thumbnail?.url ||
      imageMap[slug] ||
      '/homepage/articles/article-01.webp';

    const richBlocks = Array.isArray(attrs.body) ? attrs.body : [];

    let bodyText = '';
    if (richBlocks.length) {
      bodyText = richBlocks
        .filter(b => b && (b.type === 'paragraph' || b.type === 'text'))
        .map(b =>
          Array.isArray(b.children)
            ? b.children
                .map(c => (c && typeof c.text === 'string' ? c.text : ''))
                .join('')
            : ''
        )
        .join(' ')
        .slice(0, 200);
    }

    return {
      title: attrs.title || '',
      image,
      description: attrs.subtitle || bodyText || '',
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
