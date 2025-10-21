import Hero from '@/components/Hero';
import ContactInfo from '@/components/ContactInfo';
import ContactForm from '@/components/ContactForm';

export default function ContactPage() {
  // Static content for delivery - no Strapi dependency
  const pageData = {
    hero: {
      title: {
        desktop: {
          leftText: "เราพร้อมให้",
          leftColor: "brandBlue" as const,
          rightText: "การสนับสนุนและบริการคุณ",
          rightColor: "accentRed" as const
        },
        mobile: {
          lines: [
            { text: "เราพร้อมให้", color: "brandBlue" as const },
            { text: "การสนับสนุนและบริการคุณ", color: "accentRed" as const }
          ]
        }
      },
      subtitle: "ติดต่อทีมงานขายส่งของเรา เพื่อสอบถามราคา เปิดบัญชี หรือติดตามสถานะคำสั่งซื้อ",
      background: "/contact/contact-hero.png"
    },
    contactInfo: {
      title: "ข้อมูลบริษัท",
      address: "บริษัท: THAIPARTS INFINITY CO., LTD.\nที่อยู่: 5/17 M.2, Thap Ma, Mueang Rayong, Rayong, 21000",
      phone: "(+66) 092-424-2144\n(+66)097-128-2707",
      email: "info@thaipartsinfinity.com",
    },
    contactForm: {
      title: "ส่งข้อความหาเรา",
      description: "กรอกแบบฟอร์มด้านล่าง แล้วทีมงานของเราจะติดต่อกลับภายใน 24 ชั่วโมง",
      showNameField: true,
      showEmailField: true,
      showPhoneField: true,
      showSubjectField: true,
      showMessageField: true,
      submitButtonText: "ส่งข้อความ",
      successMessage: "ขอบคุณสำหรับข้อความของคุณ เราจะติดต่อกลับเร็วๆ นี้"
    },
    map: {
      title: "แผนที่",
      mapIframeUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15491.832!2d101.254!3d12.681!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2s5%2F17%20M.2%2C%20Thap%20Ma%2C%20Mueang%20Rayong%2C%20Rayong%2C%2021000!5e0!3m2!1sen!2sth!4v1728472800",
      mapWidth: "100%",
      mapHeight: "300",
      allowFullscreen: true,
      locationName: "Thai Parts Infinity",
      locationDescription: "สำนักงานใหญ่และโชว์รูม"
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <Hero
        title={pageData.hero.title}
        subtitle={pageData.hero.subtitle}
        background="/contact/contact-hero.png"
        ctas={[]} // Contact page hero doesn't need CTA buttons
        panel={{ enabled: false, align: 'left' }}
      />

      {/* Contact Content */}
      <div className="max-w-7xl mx-auto px-4 py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          
          {/* Left Column - Contact Info & Map */}
          <div className="space-y-8">
            <ContactInfo data={pageData.contactInfo} />
          </div>

          {/* Right Column - Contact Form */}
          <div className="lg:pl-4">
            <ContactForm data={pageData.contactForm} />
          </div>
        </div>
      </div>
    </main>
  );
}