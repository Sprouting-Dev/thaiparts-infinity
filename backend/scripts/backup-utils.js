// Shared helpers for backup/snapshot scripts (keep scripts DRY)
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function timestamp() {
  return new Date().toISOString().replace(/[:]/g, '-').replace(/\..+/, '');
}

function sha256(content) {
  return crypto.createHash('sha256').update(content).digest('hex');
}

function ensureDir(p) { fs.mkdirSync(p, { recursive: true }); }

function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  ensureDir(dest);
  for (const entry of fs.readdirSync(src)) {
    const s = path.join(src, entry);
    const d = path.join(dest, entry);
    const stat = fs.statSync(s);
    stat.isDirectory() ? copyRecursive(s, d) : fs.copyFileSync(s, d);
  }
}

function walkFiles(root, filterFn) {
  const out = [];
  (function rec(dir) {
    if (!fs.existsSync(dir)) return;
    for (const e of fs.readdirSync(dir)) {
      const full = path.join(dir, e);
      const stat = fs.statSync(full);
      if (stat.isDirectory()) rec(full); else if (!filterFn || filterFn(full)) out.push(full);
    }
  })(root);
  return out;
}

function parseFlag(name, defaultValue) {
  const raw = process.argv.find(a => a.startsWith(`--${name}=`));
  if (!raw) return defaultValue;
  const v = raw.split('=')[1];
  if (v === 'true') return true;
  if (v === 'false') return false;
  const num = Number(v);
  return Number.isNaN(num) ? v : num;
}

module.exports = {
  timestamp,
  sha256,
  ensureDir,
  copyRecursive,
  walkFiles,
  parseFlag,
};
