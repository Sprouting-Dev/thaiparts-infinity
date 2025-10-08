import type { NextConfig } from 'next';

// Parse NEXT_PUBLIC_STRAPI_URL (fall back to localhost) so we can allow that host
const STRAPI_URL =
  process.env.NEXT_PUBLIC_STRAPI_URL ?? 'http://localhost:1337';
// default pattern for local dev
let remotePatterns: Array<Record<string, string | undefined>> = [
  { protocol: 'http', hostname: 'localhost', port: '1337', pathname: '/**' },
];

try {
  const parsed = new URL(STRAPI_URL);
  remotePatterns = [
    {
      protocol: parsed.protocol.replace(':', ''),
      hostname: parsed.hostname,
      port: parsed.port || undefined,
      pathname: '/**',
    },
  ];
} catch (e) {
  // leave default
}

const nextConfig: NextConfig = {
  images: {
    // TypeScript expects RemotePattern[]; cast here because we built the shape dynamically.
    // It's safe because entries follow the RemotePattern fields: protocol, hostname, port?, pathname
    remotePatterns: remotePatterns as any,
  },
};

export default nextConfig;
