// Minimal HTML sanitizer used to safely render trusted-ish CMS HTML on server and client.
// This is intentionally small and conservative: it strips <script>, <iframe>, <object>, <embed>
// elements, removes inline event handlers (on* attributes), and neutralizes javascript: URIs.
// If you need a stronger sanitizer, consider replacing with a vetted library (e.g. DOMPurify)
// and adding it to package.json.

export function sanitizeHtml(input: string): string {
  if (!input) return '';
  let out = String(input);
  // If the input looks like plain text (no HTML tags), escape it and
  // convert newlines to paragraphs/line-breaks so editors' ENTERs are preserved.
  const hasHtmlTag = /<\s*\/?[a-zA-Z][^>]*>/.test(out);
  if (!hasHtmlTag) {
    const escapeHtml = (s: string) =>
      s
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');

    // normalize line endings
    const normalized = out.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    // Split by 2+ newlines -> paragraphs; single newline -> <br/>
    const paragraphs = normalized.split(/\n{2,}/g).map(p => {
      const withBreaks = p.replace(/\n/g, '<br/>');
      return `<p>${escapeHtml(withBreaks)}</p>`;
    });
    return paragraphs.join('');
  }

  // Remove dangerous elements and their contents
  out = out.replace(
    /<\s*(script|iframe|object|embed)[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi,
    ''
  );

  // Remove self-closing dangerous tags (just in case)
  out = out.replace(/<\s*(script|iframe|object|embed)([^>]*)\/\s*>/gi, '');

  // Remove inline event handlers (on*) attributes
  out = out.replace(/\s+on[a-zA-Z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '');

  // Neutralize javascript: URIs in href/src attributes
  out = out.replace(/(href|src)\s*=\s*"javascript:[^"]*"/gi, '$1="#"');
  out = out.replace(/(href|src)\s*=\s*'javascript:[^']*'/gi, "$1='#");

  // Optionally, remove <meta> or <link> tags that could affect the page
  out = out.replace(/<\s*(meta|link)[^>]*>/gi, '');

  return out;
}
