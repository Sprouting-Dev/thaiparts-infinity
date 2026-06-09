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

/**
 * Read every `*.json` file in a `content/` subdirectory (one entry per file —
 * the shape Decap CMS folder collections produce).
 */
export function readContentDir<T = unknown>(dir: string): T[] {
  const key = `dir:${dir}`;
  if (cache.has(key)) return cache.get(key) as T[];
  try {
    const full = path.join(CONTENT_DIR, dir);
    const files = fs
      .readdirSync(full)
      .filter((f) => f.endsWith('.json'))
      .sort();
    const items = files.map(
      (f) => JSON.parse(fs.readFileSync(path.join(full, f), 'utf-8')) as T
    );
    cache.set(key, items);
    return items;
  } catch {
    return [];
  }
}
