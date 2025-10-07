#!/usr/bin/env node
/** Compare current schemas with a snapshot's schema hashes. */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const ROOT = path.resolve(__dirname, '..');
const SNAP_ROOT = path.join(ROOT, 'snapshots');
const SRC = path.join(ROOT, 'src');

function hash(c){ return crypto.createHash('sha256').update(c).digest('hex'); }
function latestSnapshot(){ const list = fs.existsSync(SNAP_ROOT)? fs.readdirSync(SNAP_ROOT).filter(f=>/\d{4}-\d{2}-\d{2}_?/.test(f)).sort() : []; return list[list.length-1]; }

const target = process.argv[2] || latestSnapshot();
if(!target){ console.error('No snapshot found.'); process.exit(1);} 
const snapDir = path.join(SNAP_ROOT, target);
const manifestFile = path.join(snapDir, 'MANIFEST.json');
if(!fs.existsSync(manifestFile)){ console.error('MANIFEST not found in snapshot'); process.exit(1);} 
const manifest = JSON.parse(fs.readFileSync(manifestFile,'utf8'));
let ok=0, changed=0, missing=0;
for(const s of manifest.schemas){
  const current = path.join(SRC, s.rel);
  if(!fs.existsSync(current)){ missing++; console.log('MISSING', s.rel); continue; }
  const h = hash(fs.readFileSync(current,'utf8'));
  if(h === s.hash){ ok++; } else { changed++; console.log('CHANGED', s.rel); }
}
console.log(`Summary: OK=${ok} CHANGED=${changed} MISSING=${missing}`);
process.exit(changed||missing?1:0);
