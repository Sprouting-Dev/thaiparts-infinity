import type { Metadata } from 'next';
import { ReactNode } from 'react';
import { fetchPageBySlug } from '@/lib/cms';
import { buildMetadataFromSeo } from '@/lib/seo';

export default async function ArticlesLayout({
  children,
}: {
  children: ReactNode;
}) {
  // JSON-LD for this layout is injected in src/app/articles/head.tsx (head)
  return <>{children}</>;
}

export async function generateMetadata(): Promise<Metadata> {
  try {
    const page = await fetchPageBySlug('articles');
    const attrs = page as unknown as Record<string, unknown> | null;
    const seo =
      (attrs &&
        (attrs['SharedSeoComponent'] as Record<string, unknown> | undefined)) ??
      (attrs && (attrs['SEO'] as Record<string, unknown> | undefined)) ??
      (attrs && (attrs['seo'] as Record<string, unknown> | undefined)) ??
      null;
    return buildMetadataFromSeo(seo, {
      defaultCanonical: '/articles',
      fallbackTitle: 'Knowledge Center | THAIPARTS INFINITY',
      fallbackDescription: 'ศูนย์รวมความเชี่ยวชาญและบทความเกี่ยวกับระบบ Automation, Electrical และ Instrument จาก THAIPARTS INFINITY',
    });
  } catch {
    return buildMetadataFromSeo(null, {
      defaultCanonical: '/articles',
      fallbackTitle: 'Knowledge Center | THAIPARTS INFINITY',
      fallbackDescription: 'ศูนย์รวมความเชี่ยวชาญและบทความเกี่ยวกับระบบ Automation, Electrical และ Instrument จาก THAIPARTS INFINITY',
    });
  }
}
