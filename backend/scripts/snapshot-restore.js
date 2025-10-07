#!/usr/bin/env node
/**
 * Restore from snapshot:
 * Modes:
 *   --mode=db (default if db/data.db exists) : copy DB + uploads
 *   --mode=json : rebuild by JSON (ignores raw DB)
 * Usage: node scripts/snapshot-restore.js [snapshotFolderName] [--mode=json]
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SNAP_ROOT = path.join(ROOT, 'snapshots');
const DB_TARGET = path.join(ROOT, '.tmp', 'data.db');
const UPLOADS_TARGET = path.join(ROOT, 'public', 'uploads');

function latestSnapshot(){ const list = fs.existsSync(SNAP_ROOT)? fs.readdirSync(SNAP_ROOT).filter(f=>fs.existsSync(path.join(SNAP_ROOT,f,'MANIFEST.json'))).sort():[]; return list[list.length-1]; }

const argSnapshot = process.argv.find(a=>!a.startsWith('--') && a.endsWith(':')===false && a.includes('-') && !a.endsWith('.js'));
const snapshotName = argSnapshot || latestSnapshot();
if(!snapshotName){ console.error('No snapshot specified/found.'); process.exit(1);} 
const snapshotDir = path.join(SNAP_ROOT, snapshotName);
if(!fs.existsSync(snapshotDir)){ console.error('Snapshot not found:', snapshotName); process.exit(1);} 
const modeArg = process.argv.find(a=>a.startsWith('--mode='));
const mode = modeArg? modeArg.split('=')[1] : undefined;

const hasDb = fs.existsSync(path.join(snapshotDir,'db','data.db'));
const effectiveMode = mode || (hasDb? 'db':'json');

console.log('Using snapshot:', snapshotName, 'mode:', effectiveMode);

function copyRecursive(src,dest){ if(!fs.existsSync(src)) return; if(!fs.existsSync(dest)) fs.mkdirSync(dest,{recursive:true}); for(const e of fs.readdirSync(src)){ const s=path.join(src,e); const d=path.join(dest,e); const stat=fs.statSync(s); if(stat.isDirectory()) copyRecursive(s,d); else fs.copyFileSync(s,d); } }

async function restoreDb(){
  if(!hasDb){ console.error('No db in snapshot'); process.exit(1);} 
  fs.mkdirSync(path.dirname(DB_TARGET), { recursive: true });
  fs.copyFileSync(path.join(snapshotDir,'db','data.db'), DB_TARGET);
  copyRecursive(path.join(snapshotDir,'uploads'), UPLOADS_TARGET);
  console.log('✔ DB + uploads restored. Start Strapi normally.');
}

async function restoreJson(){
  const jsonDir = path.join(snapshotDir,'content-json');
  if(!fs.existsSync(jsonDir)){ console.error('No content-json in snapshot'); process.exit(1);} 
  const { createStrapi } = require('@strapi/strapi');
  const strapi = await createStrapi();
  await strapi.load();
  // delete existing collection entries (safe dev reset)
  const files = fs.readdirSync(jsonDir).filter(f=>f.endsWith('.json') && !['media-manifest.json','MANIFEST.json'].includes(f));
  for(const file of files){
    const full = path.join(jsonDir,file);
    const payload = JSON.parse(fs.readFileSync(full,'utf8'));
    if(payload.error) continue;
    const uid = payload.uid;
    if(payload.kind === 'collectionType') {
      // remove all existing first
      const existing = await strapi.entityService.findMany(uid,{ fields: ['id'], limit: 5000 });
      for(const e of existing){ await strapi.entityService.delete(uid, e.id); }
      for(const entry of payload.data){ await strapi.entityService.create(uid,{ data: entry }); }
      console.log('Restored collection', uid, payload.count);
    } else if(payload.kind === 'singleType') {
      const data = payload.data; if(!data) continue;
      // singleType export saved as object or array; normalize
      const single = Array.isArray(data)? data[0] : data;
      // Try update existing (id=1 typical) else create
      const existing = await strapi.entityService.findMany(uid,{ limit:1 });
      if(existing && existing.length){ await strapi.entityService.update(uid, existing[0].id,{ data: single }); } else { await strapi.entityService.create(uid,{ data: single }); }
      console.log('Restored single', uid);
    }
  }
  await strapi.destroy();
  copyRecursive(path.join(snapshotDir,'uploads'), UPLOADS_TARGET);
  console.log('✔ JSON content + uploads restored.');
}

(async ()=>{ if(effectiveMode==='db') await restoreDb(); else await restoreJson(); })().catch(e=>{ console.error('Restore failed', e); process.exit(1); });
