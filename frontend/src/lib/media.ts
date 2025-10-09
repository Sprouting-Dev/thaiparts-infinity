import { toOptimizedImage, type ImageOptimizeOptions } from './image-optimize';

// Utility to normalize Strapi media shapes to absolute URLs
export function toAbsolute(raw?: any): string {
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
  const data = raw?.data ?? raw;
  const attrs = data?.attributes ?? data;
  const urlPath =
    attrs?.url ||
    attrs?.formats?.large?.url ||
    attrs?.formats?.medium?.url ||
    attrs?.formats?.small?.url ||
    attrs?.formats?.thumbnail?.url ||
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
  raw?: any,
  options: ImageOptimizeOptions = {}
): string {
  const absoluteUrl = toAbsolute(raw);
  return toOptimizedImage(absoluteUrl, options);
}

export default toAbsolute;
