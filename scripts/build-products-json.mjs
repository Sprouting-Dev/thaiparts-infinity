// Generate public/data/products.json (consumed client-side by the /products
// page) from the per-item Decap files in content/products/*.json.
import fs from 'node:fs';
import path from 'node:path';

const dir = 'content/products';
const out = 'public/data/products.json';
const files = fs.existsSync(dir)
  ? fs.readdirSync(dir).filter((f) => f.endsWith('.json')).sort()
  : [];

const data = files
  .map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf-8')))
  .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  .map((p) => ({
    id: p.order,
    attributes: {
      title: p.title,
      main_title: p.main_title,
      slug: p.slug,
      tag: p.tag,
      category: p.category,
      description: p.description,
      image: p.image,
    },
  }));

fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, JSON.stringify({ data }, null, 2) + '\n');
console.log(`build-products-json: wrote ${data.length} products -> ${out}`);
