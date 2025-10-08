type FetchOptions = { next?: { revalidate?: number; tags?: string[] } };

const BASE = process.env.NEXT_PUBLIC_STRAPI_URL ?? 'http://localhost:1337';
const TOKEN = process.env.STRAPI_API_TOKEN;

export async function api<T>(path: string, opt: FetchOptions = {}): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}),
    },
    next: opt.next,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Strapi ${res.status}: ${text}`);
  }
  return (await res.json()) as T;
}

export default api;
