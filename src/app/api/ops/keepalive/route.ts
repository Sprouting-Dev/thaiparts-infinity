/**
 * Supabase Keepalive Endpoint
 * ----------------------------------------------------------------
 * Purpose : Prevent Supabase Free tier from auto-pausing the project
 *           by calling `public.keepalive_tick()` every 5 days.
 *
 * Trigger : GitHub Actions cron (see .github/workflows/supabase-keepalive.yml)
 *           or manual call with ?secret=<CRON_SECRET>
 *
 * Auth    : Bearer token via CRON_SECRET env var (header or query)
 *
 * Safety  : SUPABASE_SERVICE_ROLE_KEY is server-only — never exposed to browser.
 *           Function does NOT touch business tables — only ops.system_heartbeat_*
 * ----------------------------------------------------------------
 */
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  // -----------------------------------------------------------
  // 1) Authenticate
  // -----------------------------------------------------------
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return Response.json(
      { ok: false, error: 'CRON_SECRET is not configured' },
      { status: 500 }
    );
  }

  const authHeader = request.headers.get('authorization');
  const url = new URL(request.url);
  const manualSecret = url.searchParams.get('secret');

  const isAuthorizedByHeader = authHeader === `Bearer ${cronSecret}`;
  const isAuthorizedByQuery = manualSecret === cronSecret;

  if (!isAuthorizedByHeader && !isAuthorizedByQuery) {
    return Response.json(
      { ok: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  // -----------------------------------------------------------
  // 2) Build Supabase client (service_role, server-only)
  // -----------------------------------------------------------
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    process.env.SUPABASE_API_URL; // backend env naming used in this project

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return Response.json(
      {
        ok: false,
        error: 'Supabase server env vars are not configured',
        missing: {
          url: !supabaseUrl,
          key: !serviceRoleKey,
        },
      },
      { status: 500 }
    );
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  // -----------------------------------------------------------
  // 3) Call the SECURITY DEFINER function
  // -----------------------------------------------------------
  const { data, error } = await supabase.rpc('keepalive_tick');

  if (error) {
    return Response.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }

  return Response.json({
    ok: true,
    source: 'supabase-keepalive',
    data,
    checked_at: new Date().toISOString(),
  });
}
