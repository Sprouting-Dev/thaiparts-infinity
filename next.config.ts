import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Fully static site (Next.js export) — no server runtime.
  // Deployed to Cloudflare Pages; the contact form is handled by a
  // Cloudflare Pages Function (functions/api/send-email.ts).
  output: 'export',
  images: {
    // No image optimization server in a static export. Images reference
    // remote (Supabase storage) URLs and are emitted as-is; <Image> already
    // passes `unoptimized` where needed.
    unoptimized: true,
  },
};

export default nextConfig;
