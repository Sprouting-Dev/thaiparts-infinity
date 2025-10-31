import { logger } from './logger';
import { mediaUrl, STRAPI_URL } from '@/lib/strapi';
// Image optimization helper for Strapi media URLs
// Converts images to .webp format for better performance, except .svg files

/**
 * Convert Strapi media URL to optimized .webp format
 * @param url - Original media URL from Strapi
 * @param options - Optimization options
 * @returns Optimized URL or original if not convertible
 */
export interface ImageOptimizeOptions {
  width?: number;
  height?: number;
  quality?: number; // 1-100
  format?: 'webp' | 'avif' | 'jpeg' | 'png';
}

export function toOptimizedImage(
  url?: string | { url?: string } | null,
  options: ImageOptimizeOptions = {}
): string {
  if (!url) return '';

  // Extract URL string
  const urlString = typeof url === 'string' ? url : (url.url ?? '');
  if (!urlString) return '';

  // Resolve to an absolute URL using centralized mediaUrl helper. This
  // will prefix Strapi base when necessary and preserve absolute URLs.
  const absoluteUrl = mediaUrl(urlString);

  // Don't optimize SVG files
  if (absoluteUrl.toLowerCase().includes('.svg')) {
    return absoluteUrl;
  }

  // Don't optimize external URLs (not from Strapi)
  if (!absoluteUrl.includes(STRAPI_URL)) {
    return absoluteUrl;
  }

  // Extract file info
  const url_obj = new URL(absoluteUrl);
  const pathname = url_obj.pathname;

  // Check if it's already optimized
  if (pathname.includes('.webp')) {
    return absoluteUrl;
  }

  // Default optimization settings
  const { width, quality = 85 } = options;

  // Use Next.js Image API for optimization
  const params = new URLSearchParams();
  params.set('url', absoluteUrl);
  params.set('q', quality.toString());

  // Set width (required for Next.js Image API)
  if (width) {
    params.set('w', width.toString());
  } else {
    // Default width if not specified
    params.set('w', '800');
  }

  const optimizedUrl = `/_next/image?${params.toString()}`;

  return optimizedUrl;
}

/**
 * Common image size presets
 */
export const ImageSizes = {
  thumbnail: { width: 150, height: 150, quality: 80 },
  small: { width: 300, height: 300, quality: 85 },
  medium: { width: 600, height: 400, quality: 85 },
  large: { width: 1200, height: 800, quality: 90 },
  hero: { width: 1920, height: 1080, quality: 90 },
  avatar: { width: 64, height: 64, quality: 80 },
  logo: { width: 200, height: 200, quality: 90 },
} as const;

/**
 * Responsive image srcSet generator
 */
export function generateSrcSet(
  url?: string | { url?: string } | null,
  sizes: Array<{ width: number; quality?: number }> = [
    { width: 480, quality: 80 },
    { width: 768, quality: 85 },
    { width: 1024, quality: 85 },
    { width: 1920, quality: 90 },
  ]
): string {
  if (!url) return '';

  return sizes
    .map(
      ({ width, quality }) =>
        `${toOptimizedImage(url, { width, quality })} ${width}w`
    )
    .join(', ');
}

/**
 * Next.js Image component compatible props
 */
export function getImageProps(
  url?: string | { url?: string } | null,
  options: ImageOptimizeOptions & { alt?: string } = {}
) {
  const { alt = '', ...imageOptions } = options;

  return {
    src: toOptimizedImage(url, imageOptions),
    alt,
    ...(imageOptions.width && { width: imageOptions.width }),
    ...(imageOptions.height && { height: imageOptions.height }),
  };
}
