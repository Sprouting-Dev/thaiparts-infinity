import fs from 'node:fs';
import path from 'node:path';

/**
 * Build-time content loader.
 *
 * After the static migration the site no longer talks to Strapi at runtime.
 * Content lives as JSON files under `content/` (exported from the CMS in the
 * same shape the Strapi REST API used to return) and is read at build time by
 * the server components / `generateStaticParams`.
 */
const CONTENT_DIR = path.join(process.cwd(), 'content');

const cache = new Map<string, unknown>();

export function readContent<T = unknown>(file: string): T | null {
  if (cache.has(file)) return cache.get(file) as T;
  try {
    const raw = fs.readFileSync(path.join(CONTENT_DIR, file), 'utf-8');
    const parsed = JSON.parse(raw) as T;
    cache.set(file, parsed);
    return parsed;
  } catch {
    return null;
  }
}
