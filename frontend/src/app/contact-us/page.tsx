import Hero from '@/components/Hero';
import ContactInfo from '@/components/ContactInfo';
import ContactForm from '@/components/ContactForm';
import ContactMap from '@/components/ContactMap';

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
      subtitle: "ติดต่อทีมงานขายส่งของเรา เพื่อสอบถามราคา เปิดบัญชี หรือติดตามสถานะคำสั่งซื้อ"
    },
    contactInfo: {
      title: "ข้อมูลบริษัท",
      address: "บริษัท: THAIPARTS INFINITY CO., LTD.\nที่อยู่: 5/17 M.2, Thap Ma, Mueang Rayong, Rayong, 21000",
      phone: "(+66) 092-424-2144\n(+66)097-128-2707",
      email: "info@thaipartsinfinity.com",
    },
    contactForm: {
      title: "Send us a Message",
      description: "Fill out the form below and we'll get back to you within 24 hours.",
      showNameField: true,
      showEmailField: true,
      showPhoneField: true,
      showSubjectField: true,
      showMessageField: true,
      submitButtonText: "Send Message",
      successMessage: "Thank you! Your message has been sent successfully."
    },
    map: {
      title: "Find Us",
      mapIframeUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15491.832!2d101.254!3d12.681!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2s5%2F17%20M.2%2C%20Thap%20Ma%2C%20Mueang%20Rayong%2C%20Rayong%2C%2021000!5e0!3m2!1sen!2sth!4v1728472800",
      mapWidth: "100%",
      mapHeight: "400",
      allowFullscreen: true,
      locationName: "Thai Parts Infinity",
      locationDescription: "Our main office and showroom"
    }
  };

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <Hero
        title={pageData.hero.title}
        subtitle={pageData.hero.subtitle}
        background={undefined}
        ctas={[]} // Contact page hero doesn't need CTA buttons
        panel={{ enabled: false, align: 'left' }}
      />

      {/* Contact Content */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          
          {/* Left Column - Contact Info & Map */}
          <div className="space-y-12">
            <ContactInfo data={pageData.contactInfo} />
            <ContactMap data={pageData.map} />
          </div>

          {/* Right Column - Contact Form */}
          <div>
            <ContactForm data={pageData.contactForm} />
          </div>
        </div>
      </div>
    </main>
  );
}