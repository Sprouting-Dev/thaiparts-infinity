#!/usr/bin/env node
// Attempt to register ts-node so Strapi can read TypeScript config files when
// this script is invoked directly via `node` instead of the Strapi CLI.
try { require('ts-node/register'); } catch (_) { /* ts-node not installed yet */ }
/**
 * Enhanced full snapshot backup (best practice):
 *  - Schemas (with SHA256 hashes)
 *  - Raw DB (if exists)
 *  - Uploads (all files with size + hash manifest)
 *  - JSON export (entityService) with configurable limit & depth (future-proof)
 *  - Optional zip archive (--zip)
 *  - Flags: --limit=2000 --zip --tag=mylabel
 */
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const { timestamp, sha256, ensureDir, copyRecursive, walkFiles, parseFlag } = require('./backup-utils');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'src');
const UPLOADS = path.join(ROOT, 'public', 'uploads');
const DB_FILE = path.join(ROOT, '.tmp', 'data.db');
const SNAP_ROOT = path.join(ROOT, 'snapshots');

const LIMIT = parseFlag('limit', process.env.SNAPSHOT_MAX_LIMIT ? Number(process.env.SNAPSHOT_MAX_LIMIT) : 1000);
const TAG = parseFlag('tag', null);
const ZIP = !!process.argv.find(a => a === '--zip');

function snapshotName() {
  return TAG ? `${timestamp()}_${TAG}` : timestamp();
}

function collectSchemaFiles() {
  const out = [];
  const apiDir = path.join(SRC, 'api');
  if (fs.existsSync(apiDir)) {
    for (const api of fs.readdirSync(apiDir)) {
      if (api.startsWith('.')) continue;
      const ctRoot = path.join(apiDir, api, 'content-types');
      if (!fs.existsSync(ctRoot)) continue;
      for (const ct of fs.readdirSync(ctRoot)) {
        const schemaFile = path.join(ctRoot, ct, 'schema.json');
        if (fs.existsSync(schemaFile)) out.push(schemaFile);
      }
    }
  }
  const compDir = path.join(SRC, 'components');
  out.push(...walkFiles(compDir, f => f.endsWith('.json')));
  return out;
}

async function exportJsonContent(outDir) {
  const { createStrapi } = require('@strapi/strapi');
  const strapi = await createStrapi();
  await strapi.load();
  const all = Object.values(strapi.contentTypes).filter(ct => ct.uid.startsWith('api::'));
  const mediaMap = new Map();
  function collectMedia(v) { if (!v) return; if (Array.isArray(v)) return v.forEach(collectMedia); if (typeof v === 'object') { if (v.url && v.mime) mediaMap.set(v.url, { id: v.id, url: v.url, name: v.name, mime: v.mime, size: v.size, width: v.width, height: v.height }); Object.values(v).forEach(collectMedia);} }
  const summary = [];
  for (const ct of all) {
    try {
      const data = await strapi.entityService.findMany(ct.uid, { populate: { '*': true }, limit: LIMIT });
      const file = `${ct.info.singularName || ct.uid.replace(/[:.]/g, '_')}.json`;
      const payload = { uid: ct.uid, kind: ct.kind, info: ct.info, count: Array.isArray(data) ? data.length : (data ? 1 : 0), data };
      collectMedia(data);
      fs.writeFileSync(path.join(outDir, file), JSON.stringify(payload, null, 2));
      summary.push({ uid: ct.uid, kind: ct.kind, file, count: payload.count });
    } catch (e) {
      summary.push({ uid: ct.uid, error: e.message });
    }
  }
  const media = Array.from(mediaMap.values());
  fs.writeFileSync(path.join(outDir, 'media-manifest.json'), JSON.stringify({ count: media.length, items: media }, null, 2));
  await strapi.destroy();
  return { types: summary, mediaCount: media.length };
}

function buildUploadsManifest(dir) {
  if (!fs.existsSync(dir)) return [];
  const files = walkFiles(dir);
  return files.map(f => {
    const rel = path.relative(dir, f).replace(/\\/g, '/');
    const buf = fs.readFileSync(f);
    return { file: rel, bytes: buf.length, hash: sha256(buf) };
  });
}

async function main() {
  const name = snapshotName();
  const snapshotDir = path.join(SNAP_ROOT, name);
  const schemaDir = path.join(snapshotDir, 'schemas');
  const dbDir = path.join(snapshotDir, 'db');
  const uploadsDir = path.join(snapshotDir, 'uploads');
  const jsonDir = path.join(snapshotDir, 'content-json');
  ensureDir(schemaDir); ensureDir(dbDir); ensureDir(jsonDir);

  const schemaFiles = collectSchemaFiles();
  const schemaManifest = schemaFiles.map(f => {
    const rel = path.relative(SRC, f).replace(/\\/g, '/');
    const dest = path.join(schemaDir, rel);
    ensureDir(path.dirname(dest));
    const content = fs.readFileSync(f, 'utf8');
    fs.writeFileSync(dest, content);
    return { rel, hash: sha256(content) };
  });

  if (fs.existsSync(DB_FILE)) fs.copyFileSync(DB_FILE, path.join(dbDir, 'data.db'));
  if (fs.existsSync(UPLOADS)) copyRecursive(UPLOADS, uploadsDir);

  const uploadsManifest = buildUploadsManifest(uploadsDir);
  const jsonSummary = { types: [], mediaCount: 0 };
  console.log('[snapshot] JSON export disabled for lean mode');

  const manifest = {
    createdAt: new Date().toISOString(),
    version: 2,
    tag: TAG,
    limit: LIMIT,
    schemaCount: schemaManifest.length,
    schemas: schemaManifest,
    db: fs.existsSync(path.join(dbDir, 'data.db')),
    uploadsFiles: uploadsManifest.length,
    uploads: uploadsManifest,
    content: jsonSummary.types,
    mediaCount: jsonSummary.mediaCount,
  };
  fs.writeFileSync(path.join(snapshotDir, 'MANIFEST.json'), JSON.stringify(manifest, null, 2));
  console.log('✔ Snapshot created:', path.relative(ROOT, snapshotDir));
  console.log(`  Schemas=${manifest.schemaCount} ContentTypes=${jsonSummary.types.length} MediaRefs=${manifest.mediaCount} UploadFiles=${manifest.uploadsFiles}`);

  if (ZIP) {
    const zipPath = snapshotDir + '.tgz';
    const out = fs.createWriteStream(zipPath);
    const { spawnSync } = require('child_process');
    // Use tar if available (Git Bash / Windows with tar). If not, fallback to naive gzip of JSON manifest only.
    const tar = spawnSync('tar', ['-czf', zipPath, path.basename(snapshotDir)], { cwd: path.dirname(snapshotDir) });
    if (tar.status !== 0) {
      console.warn('tar not available, creating minimal gzip of MANIFEST.json');
      const gz = zlib.gzipSync(fs.readFileSync(path.join(snapshotDir, 'MANIFEST.json')));
      fs.writeFileSync(zipPath, gz);
    } else {
      console.log('  Compressed ->', path.relative(ROOT, zipPath));
    }
  }
}

main().catch(e => { console.error('Snapshot failed', e); process.exit(1); });

