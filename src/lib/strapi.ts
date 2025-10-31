import { PossibleMediaInput, StrapiFileAttributes } from '@/types/strapi';
import { logger } from '@/lib/logger';

export const STRAPI_URL =
  process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN;

export async function strapiFetch<T = unknown>(
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
      logger.warn('[strapiFetch] non-OK:', res.status, url);
    }
    return null;
  }
  return (await res.json()) as T;
}

/**
 * รับวัตถุ media จาก Strapi แล้วคืน URL ที่พร้อมใช้งานกับ <Image/>
 */
export function mediaUrl(input?: PossibleMediaInput): string {
  // Accept either a Strapi media object, an array-wrapped media, or a plain string
  if (input === null || input === undefined) return '';

  // If caller passed a plain string, resolve it as a URL or Strapi-relative path
  if (typeof input === 'string') {
    const url = input.trim();
    if (!url) return '';
    if (url.startsWith('http')) return url;
    if (url.startsWith('/')) return `${STRAPI_URL}${url}`;
    // non-leading slash (e.g. 'uploads/image.png') — assume Strapi-relative
    return `${STRAPI_URL}/${url}`;
  }

  // If it's an array of data entries
  if (Array.isArray(input)) {
    // Accept array of strings or array of media objects
    if (input.length === 0) return '';
    // If array of strings
    if (typeof input[0] === 'string') return mediaUrl(input[0] as string);
    for (const entry of input) {
      const first = entry as { attributes?: StrapiFileAttributes } | undefined;
      const attrs = first?.attributes as StrapiFileAttributes | undefined;
      const chosen = attrs ? chooseUrlFromAttributes(attrs) : undefined;
      if (chosen) return resolveUrl(chosen);
    }
    return '';
  }

  // Otherwise, narrow possible object shapes
  // Shape A: { data: { attributes: StrapiFileAttributes } }
  if (typeof input === 'object') {
    const maybe = input as Record<string, unknown>;
    const data = maybe['data'];
    // data may be a single object ({ data: { attributes: {...} } }) or
    // an array ({ data: [ { attributes: {...} }, ... ] }). Handle both.
    if (data !== undefined && data !== null) {
      if (Array.isArray(data)) {
        for (const d of data) {
          const attrs = (d as Record<string, unknown>)['attributes'] as
            | StrapiFileAttributes
            | undefined;
          const chosen = attrs ? chooseUrlFromAttributes(attrs) : undefined;
          if (chosen) return resolveUrl(chosen);
        }
      } else if (typeof data === 'object') {
        const attrs = (data as Record<string, unknown>)['attributes'] as
          | StrapiFileAttributes
          | undefined;
        const chosen = attrs ? chooseUrlFromAttributes(attrs) : undefined;
        if (chosen) return resolveUrl(chosen);
      }
    }

    // Shape B: slim object with attributes or url directly
    const attrsDirect = maybe['attributes'] as StrapiFileAttributes | undefined;
    if (attrsDirect) {
      const chosen = chooseUrlFromAttributes(attrsDirect);
      if (chosen) return resolveUrl(chosen);
    }
    const urlDirect = (maybe['url'] as string | undefined) ?? undefined;
    if (urlDirect) return resolveUrl(urlDirect);
  }
  return '';
}

// Heuristic fallback: scan an object for any URL-like string (jpg/png/webp/svg or starting with /uploads)
function findUrlLike(obj: unknown): string | undefined {
  if (!obj) return undefined;
  if (typeof obj === 'string') {
    const s = obj.trim();
    if (!s) return undefined;
    // quick test for common image extensions or Strapi uploads path
    if (s.match(/\.(jpe?g|png|webp|gif|svg)(\?|$)/i)) return s;
    if (s.startsWith('/uploads/') || s.startsWith('uploads/')) return s;
    if (s.startsWith('http')) return s;
    return undefined;
  }
  if (Array.isArray(obj)) {
    for (const v of obj) {
      const found = findUrlLike(v);
      if (found) return found;
    }
    return undefined;
  }
  if (typeof obj === 'object') {
    const rec = obj as Record<string, unknown>;
    for (const k of Object.keys(rec)) {
      const v = rec[k];
      const found = findUrlLike(v);
      if (found) return found;
    }
  }
  return undefined;
}

function resolveUrl(url: string) {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  if (url.startsWith('/')) return `${STRAPI_URL}${url}`;
  return `${STRAPI_URL}/${url}`;
}

function chooseUrlFromAttributes(
  attrs: StrapiFileAttributes | Record<string, unknown>
): string | undefined {
  // attrs may be a full StrapiFileAttributes or a loose record
  const a = attrs as StrapiFileAttributes & Record<string, unknown>;
  // Prefer format variants if available
  const formats = a.formats as
    | Record<string, { url?: string } | undefined>
    | undefined;
  if (formats && typeof formats === 'object') {
    // Prefer large, medium, small, thumbnail (common keys), else first available
    const prefer = [
      'large',
      'medium',
      'small',
      'thumbnail',
      'small_thumb',
      'thumbnail_small',
    ];
    const fm = formats as Record<string, unknown>;
    for (const k of prefer) {
      const f = fm[k] as Record<string, unknown> | undefined;
      if (
        f &&
        typeof f === 'object' &&
        typeof (f['url'] as string) === 'string' &&
        (f['url'] as string)
      )
        return f['url'] as string;
    }
    // fallback: first format entry with url
    for (const key of Object.keys(fm)) {
      const f = fm[key] as Record<string, unknown> | undefined;
      if (
        f &&
        typeof f === 'object' &&
        typeof (f['url'] as string) === 'string' &&
        (f['url'] as string)
      )
        return f['url'] as string;
    }
  }

  // Fallback to direct url on attributes
  if (typeof a.url === 'string' && a.url) return a.url;

  // Try heuristic fallback scanning for URL-like strings in case Strapi shape is unexpected
  const looked = findUrlLike(a);
  if (looked) return looked;

  return undefined;
}
