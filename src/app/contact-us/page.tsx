// src/app/contact-us/page.tsx  (ปรับให้ Hero มาจาก Strapi: pages[slug=contact-us])
import Hero from '@/components/Hero';
import ContactInfo from '@/components/ContactInfo';
import ContactForm from '@/components/ContactForm';
import { MotionReveal } from '@/components/MotionReveal';
import {
  fetchPageBySlug as fetchPageBySlugFromCms,
  fetchLayout,
} from '@/lib/cms';
import { mediaUrl } from '@/lib/strapi';
import type { PossibleMediaInput } from '@/types/strapi';
import type { PageAttributes, LayoutAttributes } from '@/types/cms';
// PageHeroSchema imported previously for richer typing; not used currently
// import type PageHeroSchema from '@/types/page';
import type { CTAVariant } from '@/lib/button-styles';
type CTA = {
  label: string;
  href?: string;
  variant?: CTAVariant;
  newTab?: boolean;
};


/** ========== Page ========== */
export default async function ContactPage() {
  const contactPage = (await fetchPageBySlugFromCms('contact-us')) as
    | (PageAttributes & { id?: number })
    | null;

  /** ---------- Hero (เหมือน Home/About) ---------- */
  const heroQuoteFromCMS = contactPage?.quote ?? '';
  // Resolve hero image using centralized media helper. Prefer page.hero_image then fallback to page.image.
  const contactRec = contactPage as (PageAttributes & { id?: number }) | null;
  const heroMedia = (contactRec?.hero_image ??
    (contactRec && (contactRec as Record<string, unknown>)['image'])) as
    | PossibleMediaInput
    | undefined;
  const bgHeroSrc = mediaUrl(heroMedia);
  const hasHeroImageFromCMS = Boolean(bgHeroSrc);

  // Render Hero only when Strapi provides both a hero image and a quote
  const heroProps: {
    title: string;
    background?: string | undefined;
    subtitle: string;
    ctas: Array<unknown>;
    panel: { enabled: false; align: 'left' };
    hero_schema?: { quote: string; hero_image?: unknown } | undefined;
  } = {
    title: '',
    background: bgHeroSrc,
    subtitle: '',
    ctas: [],
    panel: { enabled: false as const, align: 'left' as const },
    hero_schema: heroQuoteFromCMS
      ? {
          quote: String(heroQuoteFromCMS),
          hero_image: contactPage?.hero_image,
        }
      : undefined,
  };


  /** ---------- เนื้อหา Contact (คงเดิม) ---------- */
  // Pull contact info from the shared Layout single in Strapi if available
  const layout = (await fetchLayout()) as LayoutAttributes | null;
  const addr = (layout?.address ?? {}) as Record<string, unknown>;
  // Use neutral CMS fallback text when fields are missing instead of hard-coding company name
  const CMS_FALLBACK = 'ข้อมูลกำลังอยู่ระหว่างการอัปเดต';
  const companyName =
    (typeof addr['company_name'] === 'string' && addr['company_name']) ||
    (typeof addr['company'] === 'string' && addr['company']) ||
    CMS_FALLBACK;
  const addressText =
    (typeof addr['address_text'] === 'string' && addr['address_text']) ||
    (typeof addr['address'] === 'string' && addr['address']) ||
    (typeof addr['adddress'] === 'string' && addr['adddress']) ||
    CMS_FALLBACK;
  const phonesRaw =
    [addr['phone_number_1'], addr['phone_number_2']]
      .filter(v => typeof v === 'string' && v)
      .join('\n') || CMS_FALLBACK;
  const emailAddr =
    typeof addr['email'] === 'string' ? addr['email'] : CMS_FALLBACK;

  const pageData = {
    contactInfo: {
      title: 'ข้อมูลบริษัท',
      companyName,
      address: addressText,
      phone: phonesRaw,
      email: emailAddr,
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

  // Map data: read from layout.address.map_url (Strapi schema: shared.contact.map_url)
  const rawMapUrl =
    typeof addr['map_url'] === 'string' && addr['map_url']
      ? (addr['map_url'] as string)
      : undefined;

  // Basic validation: only allow http(s) iframe sources
  const allowedMapUrl =
    rawMapUrl && /^https?:\/\//i.test(rawMapUrl) ? rawMapUrl : undefined;

  // Only pass the CMS-provided map URL as the single source of truth.
  const mapUrl = allowedMapUrl ?? undefined;

  return (
    <main className="min-h-screen bg-gray-50 overflow-x-hidden">
      {/* Hero Section: render only when Strapi provides both image + quote */}
      {hasHeroImageFromCMS && heroQuoteFromCMS ? (
        <Hero
          title={heroProps.title}
          subtitle={heroProps.subtitle}
          background={heroProps.background}
          ctas={heroProps.ctas as CTA[]}
          panel={{ enabled: true, align: 'center' }}
          hero_schema={
            heroProps.hero_schema as unknown as Parameters<
              typeof Hero
            >[0]['hero_schema']
          }
        />
      ) : null}

      {/* Contact Content */}
      <div className="container-970 px-4 py-12 lg:py-16">
        <MotionReveal>
          <div className="grid grid-cols-1 gap-8 lg:gap-12">
            <ContactInfo data={pageData.contactInfo} mapUrl={mapUrl} />
            <ContactForm data={pageData.contactForm} />
          </div>
        </MotionReveal>
      </div>
    </main>
  );
}
