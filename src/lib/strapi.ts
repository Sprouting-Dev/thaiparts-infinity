// /src/lib/strapi.ts
export const STRAPI_URL =
  process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN;

export async function strapiFetch<T = any>(
  path: string,
  opts: RequestInit = {},
  revalidate: number = 300
): Promise<T | null> {
  const headers: Record<string, string> = {
    ...(opts.headers as Record<string, string>),
  };
  if (STRAPI_TOKEN) headers.Authorization = `Bearer ${STRAPI_TOKEN}`;

  const url =
    path.startsWith('http') || path.startsWith('https')
      ? path
      : `${STRAPI_URL}${path}`;

  const res = await fetch(url, {
    ...opts,
    headers,
    next: { revalidate },
  });
  if (!res.ok) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[strapiFetch] non-OK:', res.status, url);
    }
    return null;
  }
  return (await res.json()) as T;
}

/**
 * รับวัตถุ media จาก Strapi แล้วคืน URL ที่พร้อมใช้งานกับ <Image/>
 */
export function mediaUrl(input?: any): string {
  // Accept either a Strapi media object, an array-wrapped media, or a plain string
  if (!input && input !== '') return '';

  // If caller passed a plain string, resolve it as a URL or Strapi-relative path
  if (typeof input === 'string') {
    const url = input.trim();
    if (!url) return '';
    if (url.startsWith('http')) return url;
    if (url.startsWith('/')) return `${STRAPI_URL}${url}`;
    // non-leading slash (e.g. 'uploads/image.png') — assume Strapi-relative
    return `${STRAPI_URL}/${url}`;
  }

  // Otherwise, assume Strapi media object shape: { data: { attributes: { url } } }
  const data = input?.data;
  const attrs = Array.isArray(data) ? data?.[0]?.attributes : data?.attributes;
  const url: string | undefined =
    attrs?.url ?? input?.attributes?.url ?? input?.url;

  if (!url) return '';
  if (url.startsWith('http')) return url;
  if (url.startsWith('/')) return `${STRAPI_URL}${url}`;
  return `${STRAPI_URL}/${url}`;
}
