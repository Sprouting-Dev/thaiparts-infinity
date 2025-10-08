import { api } from '@/lib/api';
import { contactPopulate } from '@/lib/queries';
import { toAbsolute } from '@/lib/media';
import Hero from '@/components/Hero';
import ContactInfo from '@/components/ContactInfo';
import ContactForm from '@/components/ContactForm';
import ContactMap from '@/components/ContactMap';

export const revalidate = 300; // ISR

type ContactResponse = any;

export default async function ContactPage() {
  let attr: any = null;
  let fetchError: string | null = null;

  try {
    console.log(
      '🔍 Fetching contact page from Strapi with query:',
      `/api/contact?${contactPopulate}`
    );

    const json = await api<ContactResponse>(`/api/contact?${contactPopulate}`, {
      next: { revalidate },
    });
    
    console.log('📦 Raw Strapi contact response:', json);

    // Handle Strapi single-type response structure
    attr = json?.data?.attributes ?? json?.data ?? null;
    console.log('🎯 Processed contact attributes:', attr);

  } catch (err: any) {
    const msg = err?.message ?? String(err);
    console.warn('❌ Failed to fetch contact page from Strapi:', msg);
    console.warn('❌ Query that failed:', `/api/contact?${contactPopulate}`);
    fetchError = msg;
    attr = null;
  }

  // Fallback data for development/demo
  const fallbackData = {
    hero: {
      title: {
        desktop: {
          leftText: "Get in",
          leftColor: "brandBlue" as const,
          rightText: "Touch",
          rightColor: "accentRed" as const
        },
        mobile: {
          lines: [
            { text: "Get in", color: "brandBlue" as const },
            { text: "Touch", color: "accentRed" as const }
          ]
        }
      },
      subtitle: "We'd love to hear from you. Send us a message and we'll respond as soon as possible."
    },
    contactInfo: {
      title: "Contact Information",
      address: "123 Business Street\nBangkok 10100\nThailand",
      phone: "+66 2 123 4567",
      email: "info@thaiparts.com",
      businessHours: "Monday - Friday: 8:00 AM - 6:00 PM\nSaturday: 9:00 AM - 4:00 PM\nSunday: Closed"
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
      mapIframeUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3875.5394!2d100.5018!3d13.7563!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTPCsDQ1JzIyLjciTiAxMDDCsDMwJzA2LjUiRQ!5e0!3m2!1sen!2sth!4v1234567890",
      mapWidth: "100%",
      mapHeight: "400",
      allowFullscreen: true,
      locationName: "Thai Parts Infinity",
      locationDescription: "Our main office and showroom"
    }
  };

  const pageData = attr || fallbackData;

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      {pageData.hero && (
        <Hero
          title={pageData.hero.title}
          subtitle={pageData.hero.subtitle || "We'd love to hear from you. Send us a message and we'll respond as soon as possible."}
          background={pageData.hero.background ? toAbsolute(pageData.hero.background) : undefined}
          ctas={[]} // Contact page hero doesn't need CTA buttons
          panel={{ enabled: false, align: 'left' }}
        />
      )}

      {/* Contact Content */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          
          {/* Left Column - Contact Info & Map */}
          <div className="space-y-12">
            {pageData.contactInfo && (
              <ContactInfo data={pageData.contactInfo} />
            )}
            
            {pageData.map && (
              <ContactMap data={pageData.map} />
            )}
          </div>

          {/* Right Column - Contact Form */}
          <div>
            {pageData.contactForm && (
              <ContactForm data={pageData.contactForm} />
            )}
          </div>
        </div>
      </div>

      {/* Debug Info (Development Only) */}
      {process.env.NODE_ENV === 'development' && fetchError && (
        <div className="max-w-7xl mx-auto px-4 py-8">
          <details className="bg-red-50 border border-red-200 rounded p-4">
            <summary className="cursor-pointer font-medium text-red-800">
              ⚠️ Development Debug: API Error
            </summary>
            <pre className="mt-2 text-sm text-red-700 overflow-auto">
              {fetchError}
            </pre>
            <p className="mt-2 text-sm text-red-600">
              Using fallback data for development. Configure content in Strapi admin.
            </p>
          </details>
        </div>
      )}
    </main>
  );
}