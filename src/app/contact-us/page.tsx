import Hero from '@/components/Hero';
import ContactInfo from '@/components/ContactInfo';
import ContactForm from '@/components/ContactForm';
import { MotionReveal } from '@/components/MotionReveal';

export default function ContactPage() {
  // Static content for delivery - no Strapi dependency
  const pageData = {
    hero: {
      title: {
        desktop: {
          segments: [
            [
              { text: 'เราพร้อมให้', color: 'brandBlue' as const },
              { text: 'การสนับสนุนและบริการคุณ', color: 'accentRed' as const },
            ],
          ],
        },
        mobile: {
          lines: [
            { text: 'เราพร้อมให้', color: 'brandBlue' as const },
            { text: 'การสนับสนุนและบริการคุณ', color: 'accentRed' as const },
          ],
        },
      },
      subtitle:
        'ติดต่อทีมงานขายส่งของเรา เพื่อสอบถามราคา เปิดบัญชี หรือติดตามสถานะคำสั่งซื้อ',
      background: '/contact-us/contact-hero.png',
    },
    contactInfo: {
      title: 'ข้อมูลบริษัท',
      companyName: 'บริษัท: THAIPARTS INFINITY CO., LTD.',
      address: 'ที่อยู่: 5/17 M.2, Thap Ma, Mueang Rayong, Rayong, 21000',
      phone: '(+66) 092-424-2144\n(+66)097-128-2707',
      email: 'info@thaipartsinfinity.com',
    },
    contactForm: {
      title: 'ติดต่อเรา',
      showNameField: true,
      showEmailField: true,
      showPhoneField: true,
      showSubjectField: true,
      showMessageField: true,
      submitButtonText: 'ส่งข้อความ',
      successMessage: 'ขอบคุณสำหรับข้อความของคุณ เราจะติดต่อกลับเร็วๆ นี้',
    },
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <Hero
        title={pageData.hero.title}
        subtitle={pageData.hero.subtitle}
        background="/contact-us/contact-hero.png"
        ctas={[]} // Contact page hero doesn't need CTA buttons
        panel={{ enabled: false, align: 'left' }}
      />

      {/* Contact Content */}
      <div className="container-970 px-4 py-12 lg:py-16">
        <MotionReveal>
          <div className="grid grid-cols-1 gap-8 lg:gap-12">
            <ContactInfo data={pageData.contactInfo} />
            <ContactForm data={pageData.contactForm} />
          </div>
        </MotionReveal>
      </div>
    </main>
  );
}
