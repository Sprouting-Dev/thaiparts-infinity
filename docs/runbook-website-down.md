# Runbook — "เว็บเข้าไม่ได้ / โหลดไม่ขึ้น" (Website down)

This runbook explains the most common reason the public site
(`https://thaipartsinfinity.com`) stops loading, how to recover quickly, and
how the project is protected against it recurring.

## TL;DR — most likely cause

The site renders content from a **Strapi CMS** whose database runs on a
**Supabase Free-tier** project. Supabase Free tier **auto-pauses a project after
~7 days of inactivity**. When the project is paused:

- Strapi can no longer reach its database → CMS API returns errors / is down.
- The site's data fetches return nothing, images (served from Supabase Storage)
  fail to load → the page looks broken or "won't load".

This is exactly what the keepalive system (PR #15) was added to prevent — so if
the site is down for this reason, it usually means the keepalive did not actually
run (missing config) or did not run often enough.

## 1) Immediate recovery (5–10 min)

1. Open the **Supabase Dashboard** → select the production project for this site.
   - Storage/DB host is `intakohtlmqmpjajyenj.supabase.co` (see `next.config.ts`).
2. If status is **Paused / Inactive**, click **Restore** (or **Resume**) and wait
   until the project is `ACTIVE_HEALTHY`.
3. Confirm the **Strapi backend** is running and reconnected to the database
   (restart it if it crashed while the DB was unreachable).
4. Reload the site. If pages were cached empty, trigger a redeploy on Vercel (or
   wait for ISR `revalidate` to refresh).

> If the site is unreachable but Supabase is **not** paused, check the
> alternatives in section 4.

## 2) Why it happens again — and the fixes applied

| Issue | Fix in this repo |
| --- | --- |
| `cron: "0 3 */5 * *"` is **not** "every 5 days" (fires on days 1,6,11,16,21,26,31 and resets monthly → can leave a >7-day gap) | Changed to **daily** `0 3 * * *` in `.github/workflows/supabase-keepalive.yml` |
| A single missed GitHub Actions run could exceed the 7-day pause window | Daily schedule + `curl --retry`, **plus a redundant Vercel Cron** in `vercel.json` |
| GitHub Actions disables scheduled workflows after ~60 days of repo inactivity | Vercel Cron is independent infra and is not auto-disabled |
| A slow/unreachable CMS could hang SSR and 500 the whole site | `strapiFetch` now has a **timeout + graceful fallback** (returns `null`, logs, does not throw) in `src/lib/strapi.ts` |

## 3) Required configuration checklist (verify these exist)

The keepalive only works if **all** of the following are set. Verify them:

**Production env vars (Vercel project → Settings → Environment Variables):**

- [ ] `CRON_SECRET` — shared secret; Vercel Cron sends it automatically as
      `Authorization: Bearer <CRON_SECRET>`.
- [ ] `SUPABASE_SERVICE_ROLE_KEY` — server-only, never exposed to the browser.
- [ ] `NEXT_PUBLIC_SUPABASE_URL` (or `SUPABASE_URL`).

**GitHub repo secrets (Settings → Secrets and variables → Actions):**

- [ ] `CRON_SECRET` — same value as production.
- [ ] `KEEPALIVE_URL` — `https://thaipartsinfinity.com/api/ops/keepalive`.

**Database migration applied to the production Supabase project:**

- [ ] Run `docs/sql/add_supabase_keepalive.sql` in the Supabase SQL Editor so
      `public.keepalive_tick()` exists. Verify:
      `select public.keepalive_tick();` (with a service_role connection).

**Verify the keepalive actually runs:**

- [ ] GitHub → Actions → "Supabase Keepalive" → **Run workflow** and confirm a
      green run returning HTTP 200.
- [ ] Or manually: `curl "https://thaipartsinfinity.com/api/ops/keepalive?secret=<CRON_SECRET>"`
      → expect `{ "ok": true, ... }`.

## 4) Permanent fix (recommended)

The keepalive is a Free-tier workaround and is inherently fragile. For a
production / customer-facing site, the **definitive fix is to upgrade the
production Supabase project to the Pro plan** — paid projects are **never
auto-paused**, which removes this entire class of outage.

Consider this if the customer-facing downtime cost outweighs the plan cost.

## 5) Alternative causes (if Supabase is NOT paused)

- **Strapi host down** — check the CMS server/hosting is up and reachable at
  `NEXT_PUBLIC_STRAPI_URL`.
- **Vercel deploy failed / build error** — check the latest deployment in Vercel.
- **Domain / DNS / SSL expiry** — verify the domain resolves and the certificate
  is valid.
- **Wrong / missing env vars** after a deploy — re-check section 3.
