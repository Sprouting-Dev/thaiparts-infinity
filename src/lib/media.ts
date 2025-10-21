import { toOptimizedImage, type ImageOptimizeOptions } from './image-optimize';

// Utility to normalize Strapi media shapes to absolute URLs
export function toAbsolute(raw?: unknown): string {
  if (!raw) return '';

  // already a string url
  if (typeof raw === 'string') {
    if (/^https?:\/\//.test(raw)) return raw;
    const base = process.env.NEXT_PUBLIC_STRAPI_URL ?? 'http://localhost:1337';
    try {
      return new URL(raw, base).href;
    } catch {
      return `${base}${raw}`;
    }
  }

  // Common Strapi media shapes:
  // - { data: { attributes: { url, formats } } }
  // - { attributes: { url, formats } }
  // - direct media object with url or formats
  const data = (raw as { data?: unknown })?.data ?? raw;
  const attrs = (data as { attributes?: unknown })?.attributes ?? data;
  const urlPath =
    (attrs as { url?: string })?.url ||
    (
      attrs as {
        formats?: {
          large?: { url?: string };
          medium?: { url?: string };
          small?: { url?: string };
          thumbnail?: { url?: string };
        };
      }
    )?.formats?.large?.url ||
    (
      attrs as {
        formats?: {
          large?: { url?: string };
          medium?: { url?: string };
          small?: { url?: string };
          thumbnail?: { url?: string };
        };
      }
    )?.formats?.medium?.url ||
    (
      attrs as {
        formats?: {
          large?: { url?: string };
          medium?: { url?: string };
          small?: { url?: string };
          thumbnail?: { url?: string };
        };
      }
    )?.formats?.small?.url ||
    (
      attrs as {
        formats?: {
          large?: { url?: string };
          medium?: { url?: string };
          small?: { url?: string };
          thumbnail?: { url?: string };
        };
      }
    )?.formats?.thumbnail?.url ||
    '';

  if (!urlPath) return '';
  if (/^https?:\/\//.test(urlPath)) return urlPath;

  const base = process.env.NEXT_PUBLIC_STRAPI_URL ?? 'http://localhost:1337';
  try {
    return new URL(urlPath, base).href;
  } catch {
    return `${base}${urlPath}`;
  }
}

/**
 * Enhanced media helper with WebP optimization
 * @param raw - Strapi media object
 * @param options - Image optimization options
 * @returns Optimized image URL (.webp) or original URL for SVG
 */
export function toOptimizedMedia(
  raw?: unknown,
  options: ImageOptimizeOptions = {}
): string {
  const absoluteUrl = toAbsolute(raw);
  return toOptimizedImage(absoluteUrl, options);
}

export default toAbsolute;
