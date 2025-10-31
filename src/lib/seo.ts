import { mediaUrl } from './strapi';
import { logger } from './logger';

export type MediaMeta = {
  url?: string;
  width?: number;
  height?: number;
  alt?: string;
};

/**
 * Extract common media attributes (url, width, height, alt) from a Strapi media shape
 */
export function extractMediaMeta(input: unknown): MediaMeta {
  if (!input) return {};

  // Resolve URL via central helper. mediaUrl accepts many shapes.
  const url = mediaUrl(input as Parameters<typeof mediaUrl>[0]);
  const meta: MediaMeta = { url: url || undefined };

  // Narrow to object shapes to extract width/height/alt
  if (typeof input === 'object' && input !== null) {
    const maybe = input as Record<string, unknown>;
    // Handle Strapi "data" wrapper
    const data = maybe['data'];
    const candidate = (data && typeof data === 'object' ? data : maybe) as
      | Record<string, unknown>
      | undefined;
    const attrs = candidate?.['attributes'] as
      | Record<string, unknown>
      | undefined;
    const source = attrs ?? candidate;
    if (source) {
      if (typeof source['width'] === 'number')
        meta.width = source['width'] as number;
      if (typeof source['height'] === 'number')
        meta.height = source['height'] as number;
      meta.alt =
        (source['alternativeText'] as string | undefined) ||
        (source['alternative_text'] as string | undefined) ||
        (source['alt'] as string | undefined) ||
        (source['name'] as string | undefined) ||
        meta.alt;
    }
  }

  return meta;
}

/**
 * Parse metaSocial array (if present) into a mapping of network -> social data
 */
export function parseMetaSocial(
  seo: Record<string, unknown> | null | undefined
): Record<string, { title?: string; description?: string; image?: MediaMeta }> {
  const out: Record<
    string,
    { title?: string; description?: string; image?: MediaMeta }
  > = {};
  if (!seo) return out;
  // Defensive normalization: if a Strapi SEO component contains boolean
  // `false` values (sometimes present when editors clear fields), remove
  // them so they don't surface as the string "false" in meta tags.
  const normalizedSeo = normalizeSeo(seo);
  const raw = normalizedSeo['metaSocial'] as unknown;
  if (!raw || !Array.isArray(raw)) return out;
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue;
    const rec = item as Record<string, unknown>;
    const network =
      (rec['socialNetwork'] as string | undefined) ||
      (rec['social_network'] as string | undefined);
    if (!network) continue;
    const title = typeof rec['title'] === 'string' ? rec['title'] : undefined;
    const description =
      typeof rec['description'] === 'string' ? rec['description'] : undefined;
    const image = extractMediaMeta(rec['image']);
    out[network.toLowerCase()] = { title, description, image };
  }
  return out;
}

/**
 * Normalize a raw Strapi SEO component into a safer shape.
 * - Remove boolean false values for text fields (prevents "false" strings)
 * - Ensure metaSocial is an array when present
 */
function normalizeSeo(seo: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const k of Object.keys(seo)) {
    const v = seo[k];
    // drop explicit boolean false which may be used by some editors to
    // indicate an intentionally-empty field — we prefer `undefined` so
    // consumers (Next Metadata) don't render the literal "false".
    if (v === false) continue;
    // Drop empty strings for text fields (metaTitle, metaDescription, etc.)
    // Empty strings will cause Lighthouse to fail, so treat them as undefined
    if (typeof v === 'string' && !v.trim()) {
      // Keep empty strings only if they're not SEO-critical fields
      if (k !== 'metaTitle' && k !== 'metaDescription') {
        out[k] = v; // Allow empty for other fields
      }
      continue; // Drop empty metaTitle and metaDescription
    }
    // Normalize metaSocial: if it's present but not an array, drop it
    if (k === 'metaSocial' && v != null && !Array.isArray(v)) continue;
    out[k] = v;
  }
  return out;
}

/**
 * Validate structuredData coming from Strapi and return a safe JSON string for injection.
 * Returns null when invalid.
 */
export function validateStructuredData(input: unknown): string | null {
  if (!input) return null;
  const isDev = process.env.NODE_ENV !== 'production';
  let obj: unknown = input;
  if (typeof input === 'string') {
    try {
      obj = JSON.parse(input);
    } catch {
      if (isDev)
        logger.warn('[SEO] structuredData is a string but not valid JSON');
      return null;
    }
  }

  if (typeof obj !== 'object' || obj === null) {
    logger.warn('[SEO] structuredData must be an object or array');
    return null;
  }

  // Basic heuristic checks: must contain @context or @type somewhere at top-level
  const top = obj as Record<string, unknown>;
  const appearsValid =
    '@context' in top || '@type' in top || Array.isArray(obj);
  if (!appearsValid) {
    if (isDev)
      logger.warn(
        '[SEO] structuredData appears to lack @context/@type — still serializing'
      );
    // allow serialization but signal caution (we still serialize)
  }

  try {
    return JSON.stringify(obj);
  } catch {
    logger.warn('[SEO] structuredData could not be stringified');
    return null;
  }
}

import type { Metadata } from 'next';

/**
 * Build a Next.js Metadata object from a Strapi SEO component object.
 * - ensures openGraph.images are objects with url/width/height/alt
 * - ensures twitter.images is an array of image URLs
 * - builds an absolute canonical using NEXT_PUBLIC_SITE_URL or NEXT_PUBLIC_STRAPI_URL
 */
export function buildMetadataFromSeo(
  seo: Record<string, unknown> | null | undefined,
  options?: {
    defaultCanonical?: string;
    fallbackTitle?: string;
    fallbackDescription?: string;
  }
): Metadata {
  const siteUrlRaw =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_STRAPI_URL ||
    '';
  const siteUrl =
    typeof siteUrlRaw === 'string' ? siteUrlRaw.replace(/\/+$/, '') : '';

  // If seo is null/undefined, build minimal metadata with fallbacks
  // This ensures description is always present for Lighthouse compliance
  if (!seo) {
    const siteUrlRaw =
      process.env.NEXT_PUBLIC_SITE_URL ||
      process.env.NEXT_PUBLIC_STRAPI_URL ||
      '';
    const siteUrl =
      typeof siteUrlRaw === 'string' ? siteUrlRaw.replace(/\/+$/, '') : '';
    const canonicalPath = options?.defaultCanonical || '/';
    const canonical = siteUrl
      ? canonicalPath.startsWith('/')
        ? `${siteUrl}${canonicalPath}`
        : `${siteUrl}/${canonicalPath}`
      : canonicalPath;

    // Ensure description meets Lighthouse minimum (50+ chars)
    let fallbackDesc =
      options?.fallbackDescription ||
      'THAIPARTS INFINITY - ผู้เชี่ยวชาญระบบ Automation, Electrical และ Instrument ครบวงจร สำหรับอุตสาหกรรมทุกประเภท';
    if (fallbackDesc.length < 50) {
      fallbackDesc =
        'THAIPARTS INFINITY - ผู้เชี่ยวชาญระบบ Automation, Electrical และ Instrument ครบวงจร สำหรับอุตสาหกรรมทุกประเภท ครอบคลุมตั้งแต่การวิเคราะห์ การออกแบบ ติดตั้ง และซ่อมบำรุง';
    }
    // Ensure it's a valid string
    const validFallbackDesc =
      typeof fallbackDesc === 'string' && fallbackDesc.trim().length >= 50
        ? fallbackDesc.trim()
        : 'THAIPARTS INFINITY - ผู้เชี่ยวชาญระบบ Automation, Electrical และ Instrument ครบวงจร สำหรับอุตสาหกรรมทุกประเภท ครอบคลุมตั้งแต่การวิเคราะห์ การออกแบบ ติดตั้ง และซ่อมบำรุง';

    return {
      title: options?.fallbackTitle,
      description: validFallbackDesc,
      alternates: { canonical },
      openGraph: {
        title: options?.fallbackTitle,
        description: validFallbackDesc,
        siteName: 'THAIPARTS INFINITY',
        type: 'website',
        locale: 'th_TH',
      },
      twitter: {
        title: options?.fallbackTitle,
        description: validFallbackDesc,
      },
    } as Metadata;
  }

  // Defensive normalize the incoming SEO object so downstream logic
  // doesn't accidentally map boolean `false` or malformed fields into
  // page metadata (we prefer absence over the literal "false").
  const safeSeo = normalizeSeo(seo as Record<string, unknown>);

  const title =
    typeof safeSeo['metaTitle'] === 'string'
      ? safeSeo['metaTitle']
      : (options?.fallbackTitle ?? undefined);
  const rawDescription = safeSeo['metaDescription'];
  let description: string | undefined;
  if (typeof rawDescription === 'string' && rawDescription.trim()) {
    description = rawDescription.trim();
  } else {
    description = options?.fallbackDescription;
  }

  const mediaMeta = extractMediaMeta(
    (safeSeo && safeSeo['metaImage']) ?? (safeSeo && safeSeo['image'])
  );
  const ogImages = mediaMeta.url
    ? [
        {
          url: mediaMeta.url,
          width: mediaMeta.width,
          height: mediaMeta.height,
          alt: mediaMeta.alt,
        },
      ]
    : [];

  const metaSocial = parseMetaSocial(safeSeo);

  const keywordsRaw =
    safeSeo && typeof safeSeo['keywords'] === 'string'
      ? (safeSeo['keywords'] as string).trim()
      : undefined;
  const keywords = keywordsRaw
    ? keywordsRaw.includes(',')
      ? keywordsRaw
          .split(',')
          .map(s => s.trim())
          .filter(Boolean)
      : [keywordsRaw]
    : undefined;

  const robotsRaw =
    safeSeo && typeof safeSeo['metaRobots'] === 'string'
      ? (safeSeo['metaRobots'] as string).trim()
      : undefined;
  const viewport =
    safeSeo && typeof safeSeo['metaViewport'] === 'string'
      ? (safeSeo['metaViewport'] as string)
      : undefined;

  const canonicalPath =
    (safeSeo && (safeSeo['canonicalURL'] as string)) ||
    options?.defaultCanonical ||
    '/';
  const canonical = siteUrl
    ? canonicalPath.startsWith('/')
      ? `${siteUrl}${canonicalPath}`
      : `${siteUrl}/${canonicalPath}`
    : canonicalPath;

  let finalDescription =
    description && typeof description === 'string' && description.trim()
      ? description.trim()
      : options?.fallbackDescription &&
          typeof options.fallbackDescription === 'string' &&
          options.fallbackDescription.trim()
        ? options.fallbackDescription.trim()
        : 'THAIPARTS INFINITY - ผู้เชี่ยวชาญระบบ Automation, Electrical และ Instrument ครบวงจร';

  if (
    finalDescription.length < 50 &&
    options?.fallbackDescription &&
    options.fallbackDescription.length >= 50
  ) {
    finalDescription = options.fallbackDescription.trim();
  }

  if (finalDescription.length < 50) {
    finalDescription =
      'THAIPARTS INFINITY - ผู้เชี่ยวชาญระบบ Automation, Electrical และ Instrument ครบวงจร สำหรับอุตสาหกรรมทุกประเภท';
  }

  const finalTitle =
    title && typeof title === 'string' && title.trim()
      ? title.trim()
      : options?.fallbackTitle &&
          typeof options.fallbackTitle === 'string' &&
          options.fallbackTitle.trim()
        ? options.fallbackTitle.trim()
        : undefined;

  const validDescription =
    typeof finalDescription === 'string' && finalDescription.trim().length >= 50
      ? finalDescription.trim()
      : 'THAIPARTS INFINITY - ผู้เชี่ยวชาญระบบ Automation, Electrical และ Instrument ครบวงจร สำหรับอุตสาหกรรมทุกประเภท ครอบคลุมตั้งแต่การวิเคราะห์ การออกแบบ ติดตั้ง และซ่อมบำรุง';

  const metadata: Metadata = {
    title: finalTitle,
    description: validDescription,
    keywords,
    openGraph: ogImages.length
      ? {
          images: ogImages,
          title: finalTitle,
          description: validDescription,
          siteName: 'THAIPARTS INFINITY',
          type: 'website',
          locale: 'th_TH',
        }
      : {
          title: finalTitle,
          description: validDescription,
          siteName: 'THAIPARTS INFINITY',
          type: 'website',
          locale: 'th_TH',
        },
    alternates: { canonical },
  };

  // Twitter
  const twitterSocial = metaSocial['twitter'];
  if (twitterSocial) {
    const twitterImages = twitterSocial.image?.url
      ? [twitterSocial.image.url]
      : ogImages.map(i => i.url as string);
    metadata.twitter = {
      title: twitterSocial.title ?? finalTitle,
      description:
        twitterSocial.description &&
        typeof twitterSocial.description === 'string' &&
        twitterSocial.description.trim()
          ? twitterSocial.description.trim()
          : validDescription,
      images: twitterImages,
    };
  }

  const facebookSocial = metaSocial['facebook'];
  if (facebookSocial) {
    const og = (metadata.openGraph as Record<string, unknown>) ?? {};
    og.title = facebookSocial.title ?? og.title ?? finalTitle;
    og.description =
      facebookSocial.description &&
      typeof facebookSocial.description === 'string' &&
      facebookSocial.description.trim()
        ? facebookSocial.description.trim()
        : og.description || validDescription;
    if (facebookSocial.image?.url)
      og.images = [{ url: facebookSocial.image.url }];
    metadata.openGraph = og as Metadata['openGraph'];
  }

  if (!metadata.twitter) {
    metadata.twitter = {
      title: finalTitle,
      description: validDescription,
      images: ogImages.map(i => i.url as string),
    };
  }

  if (viewport) metadata.viewport = viewport;

  const parsedRobots = parseMetaRobots(robotsRaw);
  if (parsedRobots)
    (metadata as unknown as Record<string, unknown>)['robots'] = parsedRobots;

  return metadata;
}

/**
 * Parse a comma-separated robots string (e.g. "noindex,follow") into a
 * typed Next Metadata robots object. Returns undefined when input is empty.
 */
export function parseMetaRobots(
  raw?: string | null
): Metadata['robots'] | undefined {
  if (!raw || typeof raw !== 'string') return undefined;
  const parts = raw
    .split(',')
    .map(p => p.trim().toLowerCase())
    .filter(Boolean);
  if (parts.length === 0) return undefined;

  // quick helper to mark presence
  const has = (token: string) => parts.includes(token);

  // 'none' typically means noindex,nofollow
  const out: Record<string, unknown> = {};
  if (has('none')) {
    out.index = false;
    out.follow = false;
  } else {
    if (has('noindex')) out.index = false;
    else if (has('index')) out.index = true;

    if (has('nofollow')) out.follow = false;
    else if (has('follow')) out.follow = true;
  }

  if (has('noarchive')) out.noarchive = true;
  if (has('nosnippet')) out.nosnippet = true;
  if (has('noimageindex')) out.noimageindex = true;
  if (has('nocache') || has('no-cache')) out.nocache = true;

  // If no explicit index/follow were set, avoid returning an object with
  // only secondary flags unless at least one flag is present.
  if (Object.keys(out).length === 0) return undefined;
  return out as Metadata['robots'];
}
