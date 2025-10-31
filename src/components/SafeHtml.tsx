'use client';
import React, { useEffect, useState } from 'react';

type Props = {
  html?: string | null;
  className?: string;
  // tag name to render as (div, p, h1, etc.)
  wrapper?: string;
};

export default function SafeHtml({
  html = '',
  className,
  wrapper = 'div',
}: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const stripped = String(html || '').replace(/<[^>]*>/g, '');

  const Tag = wrapper as React.ElementType;

  // Before client mount we render a plain text fallback (stripped) to avoid
  // hydration mismatches. After mount we render the sanitized HTML via
  // dangerouslySetInnerHTML. This component assumes the incoming `html`
  // has already been sanitized by the fetch layer (e.g. src/lib/cms.ts).
  return (
    <Tag
      className={className}
      suppressHydrationWarning
      {...(mounted
        ? { dangerouslySetInnerHTML: { __html: String(html || '') } }
        : { children: stripped })}
    />
  );
}
