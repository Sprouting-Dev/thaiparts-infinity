# Strapi Backup & Restore (Best Practice)

This project includes a hardened snapshot system to guarantee a 100% recoverable state (schemas + data + media) before risky operations (e.g. RBAC resets, upgrades).

## Quick Commands

| Action | Command |
|--------|---------|
| Full snapshot | `npm run snapshot:backup` |
| Full snapshot + tag + zip | `npm run snapshot:backup -- --tag=pre-rbac --zip` |
| Verify current schemas vs latest snapshot | `npm run snapshot:verify` |
| Restore (raw DB preferred) | `npm run snapshot:restore` |
| Force JSON rebuild restore | `node scripts/snapshot-restore.js <snapshotFolder> --mode=json` |

> Add extra flags after `--` when using npm scripts.

## What a Snapshot Contains
Location: `backend/snapshots/<timestamp>[_tag]/`

```
schemas/          # All schema.json (content-types + components) with hash
db/data.db        # Raw SQLite (if exists)
uploads/...       # All uploaded media files
MANIFEST.json     # Integrity + metadata (hashes, counts)
```

## Restore Mode (Lean)

| Mode | Use Case | What you get |
|------|----------|--------------|
| db (only mode) | Fast full rollback | Everything exactly (RBAC/users/settings/content) |

Note: JSON export mode disabled in lean configuration for simplicity.

## Best Practice Workflow (Example: Fix RBAC corruption)
1. `npm run snapshot:backup -- --tag=before-rbac-fix`
2. Verify integrity: `npm run snapshot:verify`
3. Stop Strapi.
4. Delete `.tmp` / `.cache` (optionally `node_modules`).
5. Restore snapshot: `npm run snapshot:restore`
6. Start Strapi: `npm run develop`

## Flags
| Flag | Description | Default |
|------|-------------|---------|
| `--limit=NUMBER` | Max records per collection in JSON export | 1000 |
| `--tag=NAME` | Append label to snapshot folder | none |
| `--zip` | Create `.tgz` archive (best effort) | off |

Environment variables:
`SNAPSHOT_MAX_LIMIT` overrides default limit if `--limit` not provided.

## Integrity
`MANIFEST.json` includes SHA256 for each schema file and every upload file (size + hash) enabling detection of drift.

## Extending
Add deeper populate or relation walking by replacing `populate: { '*': true }` with a recursive utility if your structures nest several levels.

## Caution
- Always stop Strapi before relying on raw DB copy for production-like integrity.
- JSON restore recreates entries; relational integrity is preserved only if exported IDs remain resolvable. (Current export keeps full objects, so safe for dev.)

## Future Ideas
- Auto prune old snapshots (e.g., keep last 5)
- Git hook to snapshot before schema commits
- CI job to verify schema hash vs main branch snapshot
