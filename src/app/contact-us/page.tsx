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

/** NOTE: Use centralized fetcher from src/lib/cms.ts (returns merged attributes) */

// Use mediaUrl helper to resolve Strapi media objects to absolute URLs

/** NOTE: Use centralized fetcher from src/lib/cms.ts (returns merged attributes) */

/** ========== Page ========== */
export default async function ContactPage() {
  const contactPage = (await fetchPageBySlugFromCms('contact-us')) as Record<
    string,
    unknown
  > | null;

  /** ---------- Hero (เหมือน Home/About) ---------- */
  const heroQuoteFromCMS = (contactPage as any)?.quote ?? '';
  // Resolve hero image using centralized media helper. Prefer page.hero_image then fallback to page.image.
  const heroMedia =
    (contactPage as any)?.hero_image ?? (contactPage as any)?.image ?? null;
  const bgHeroSrc = mediaUrl(heroMedia);
  const hasHeroImageFromCMS = Boolean(bgHeroSrc);

  // Render Hero only when Strapi provides both a hero image and a quote
  const heroProps = {
    title: '',
    background: bgHeroSrc,
    subtitle: '',
    ctas: [],
    panel: { enabled: false as const, align: 'left' as const },
    hero_schema: heroQuoteFromCMS
      ? {
          quote: String(heroQuoteFromCMS),
          hero_image: (contactPage as any)?.hero_image,
        }
      : undefined,
  };

  // Dev-time debug: print the fetched contact page so you can inspect fields
  if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line no-console
    console.debug('[ContactPage] fetched contactPage:', contactPage);
    // eslint-disable-next-line no-console
    console.debug(
      '[ContactPage] resolved heroBgSrc:',
      bgHeroSrc,
      'quote:',
      heroQuoteFromCMS ? 'yes' : 'no'
    );
  }

  /** ---------- เนื้อหา Contact (คงเดิม) ---------- */
  // Pull contact info from the shared Layout single in Strapi if available
  const layout = (await fetchLayout()) as any;
  const addr = layout?.address ?? {};
  // Use neutral CMS fallback text when fields are missing instead of hard-coding company name
  const CMS_FALLBACK = 'ข้อมูลกำลังอยู่ระหว่างการอัปเดต';
  const companyName = addr?.company_name ?? addr?.company ?? CMS_FALLBACK;
  const addressText =
    addr?.address_text ?? addr?.address ?? addr?.adddress ?? CMS_FALLBACK;
  const phonesRaw =
    [addr?.phone_number_1, addr?.phone_number_2].filter(Boolean).join('\n') ||
    CMS_FALLBACK;
  const emailAddr = addr?.email ?? CMS_FALLBACK;

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

  return (
    <main className="min-h-screen bg-gray-50 overflow-x-hidden">
      {/* Hero Section: render only when Strapi provides both image + quote */}
      {hasHeroImageFromCMS && heroQuoteFromCMS ? (
        <Hero {...(heroProps as any)} panel="center" />
      ) : null}

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
