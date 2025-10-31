const STRAPI_URL =
  process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
const API_TOKEN = process.env.NEXT_PUBLIC_STRAPI_API_TOKEN;

const getStrapiHeaders = () => ({
  'Content-Type': 'application/json',
  ...(API_TOKEN ? { Authorization: `Bearer ${API_TOKEN}` } : {}),
});

/**
 * @deprecated Consider migrating to fetchServiceBySlug from @/lib/cms for consistency.
 * This function is kept for backward compatibility but fetchServiceBySlug uses populate=deep
 * which should include all necessary fields. If specific fields are missing, add them to fetchServiceBySlug.
 */
export async function getServiceBySlug(slug: string) {
  try {
    const url = `${STRAPI_URL}/api/services?filters[slug][$eq]=${encodeURIComponent(slug)}&populate[image]=*&populate[cover_image]=*&populate[case_study][populate][0]=cover_image&populate[faqs][populate][0]=acordian&populate[highlights]=*&populate[features][populate][0]=features_item&populate[features][populate][1]=features_item.icon&populate[process_steps]=*&populate[details]=*&populate[technology]=*&populate[architectural_example]=*&populate[customer_receive]=*&populate[safety_and_standard]=*&populate[SEO][populate][metaImage]=*&populate[SEO][populate][metaSocial][populate][image]=*`;

    const res = await fetch(url, {
      headers: getStrapiHeaders(),
      cache: 'no-store',
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Failed to fetch service: ${res.status} ${errorText}`);
    }

    const data = await res.json();
    return data.data?.[0] || null;
  } catch (error) {
    throw error;
  }
}

/**
 * @deprecated Not used in codebase. Use fetchServices from @/lib/cms instead.
 * Consider removing if not needed.
 */
export async function getAllServices() {
  try {
    const url = `${STRAPI_URL}/api/services?populate[cover_image]=*`;

    const res = await fetch(url, {
      headers: getStrapiHeaders(),
      cache: 'no-store',
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch services: ${res.status}`);
    }

    const data = await res.json();
    return data.data || [];
  } catch {
    return [];
  }
}
