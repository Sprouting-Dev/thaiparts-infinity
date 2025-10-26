// src/services/serviceService.ts
const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
const API_TOKEN = process.env.NEXT_PUBLIC_STRAPI_API_TOKEN;

const getStrapiHeaders = () => ({
  'Content-Type': 'application/json',
  ...(API_TOKEN ? { Authorization: `Bearer ${API_TOKEN}` } : {}),
});

export async function getServiceBySlug(slug: string) {
  const url = `${STRAPI_URL}/api/services?filters[slug][$eq]=${encodeURIComponent(slug)}&populate=deep`;
  const res = await fetch(url, { headers: getStrapiHeaders() });
  if (!res.ok) throw new Error('Failed to fetch service');
  const data = await res.json();
  return data.data?.[0] || null;
}