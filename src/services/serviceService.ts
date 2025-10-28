const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
const API_TOKEN = process.env.NEXT_PUBLIC_STRAPI_API_TOKEN;

const getStrapiHeaders = () => ({
  'Content-Type': 'application/json',
  ...(API_TOKEN ? { Authorization: `Bearer ${API_TOKEN}` } : {}),
});

export async function getServiceBySlug(slug: string) {
  try {
    const url = `${STRAPI_URL}/api/services?filters[slug][$eq]=${encodeURIComponent(slug)}&populate[image]=*&populate[cover_image]=*&populate[case_study][populate][0]=cover_image&populate[faqs]=*&populate[highlights]=*&populate[features][populate][0]=features_item&populate[features][populate][1]=features_item.icon&populate[process_steps]=*&populate[details]=*&populate[technology]=*&populate[architectural_example]=*&populate[customer_receive]=*&populate[safety_and_standard]=*`;
    
    const res = await fetch(url, { 
      headers: getStrapiHeaders(),
      cache: 'no-store'
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error('API Error:', res.status, errorText);
      throw new Error(`Failed to fetch service: ${res.status} ${errorText}`);
    }
    
    const data = await res.json();
    return data.data?.[0] || null;
  } catch (error) {
    console.error('Error fetching service:', error);
    throw error;
  }
}