-- ==============================================================
-- Supabase Keepalive Heartbeat — Migration
-- ==============================================================
-- Purpose: Prevent Supabase Free tier from auto-pausing the project
--          due to inactivity. Triggered every 5 days via external cron.
--
-- Safety:
--   • Isolated in `ops` schema — does NOT touch any business tables
--     (products, services, articles, pages, uploads, users, orders, etc.)
--   • SECURITY DEFINER + revoked from public/anon/authenticated
--   • Only `service_role` can execute the function
--   • Idempotent — safe to run multiple times
--   • Auto-cleans heartbeat logs older than 365 days
--
-- Apply: Run this in Supabase SQL Editor (Dashboard → SQL Editor)
--        Or via psql with DATABASE_URL (service_role connection)
-- ==============================================================

-- 1) Isolated schema
create schema if not exists ops;

revoke all on schema ops from public;
revoke all on schema ops from anon;
revoke all on schema ops from authenticated;

-- 2) Heartbeat state (single row, id=1)
create table if not exists ops.system_heartbeat_state (
  id           int primary key default 1,
  source       text not null default 'external-cron',
  counter      bigint not null default 0,
  last_ping_at timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  constraint system_heartbeat_state_single_row check (id = 1)
);

-- 3) Heartbeat logs (rolling, retention 365 days)
create table if not exists ops.system_heartbeat_logs (
  id         bigserial primary key,
  source     text not null default 'external-cron',
  status     text not null default 'success',
  metadata   jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- Seed initial state row (idempotent)
insert into ops.system_heartbeat_state (id, source, counter, last_ping_at)
values (1, 'external-cron', 0, now())
on conflict (id) do nothing;

-- 4) Function: public.keepalive_tick()
create or replace function public.keepalive_tick()
returns jsonb
language plpgsql
security definer
set search_path = public, ops
as $$
declare
  new_counter      bigint;
  new_last_ping_at timestamptz;
  deleted_count    integer := 0;
begin
  -- Update existing row (id=1)
  update ops.system_heartbeat_state
  set
    source       = 'external-cron',
    counter      = counter + 1,
    last_ping_at = now(),
    updated_at   = now()
  where id = 1
  returning counter, last_ping_at
  into new_counter, new_last_ping_at;

  -- Fallback if row missing (race condition safety)
  if new_counter is null then
    insert into ops.system_heartbeat_state (
      id, source, counter, last_ping_at, created_at, updated_at
    )
    values (1, 'external-cron', 1, now(), now(), now())
    returning counter, last_ping_at
    into new_counter, new_last_ping_at;
  end if;

  -- Insert success log
  insert into ops.system_heartbeat_logs (source, status, metadata)
  values (
    'external-cron',
    'success',
    jsonb_build_object(
      'purpose',         'supabase-free-tier-keepalive',
      'retention_days',  365
    )
  );

  -- Cleanup old logs (>365 days)
  delete from ops.system_heartbeat_logs
  where created_at < now() - interval '365 days';
  get diagnostics deleted_count = row_count;

  return jsonb_build_object(
    'ok',               true,
    'message',          'Supabase keepalive heartbeat completed',
    'counter',          new_counter,
    'last_ping_at',     new_last_ping_at,
    'deleted_old_logs', deleted_count
  );
end;
$$;

-- 5) Permissions: ONLY service_role can execute
revoke all on function public.keepalive_tick() from public;
revoke execute on function public.keepalive_tick() from anon;
revoke execute on function public.keepalive_tick() from authenticated;
grant  execute on function public.keepalive_tick() to service_role;

-- ==============================================================
-- Verification queries (run after migration):
-- ==============================================================
-- select * from ops.system_heartbeat_state;
-- select count(*) from ops.system_heartbeat_logs;
-- select public.keepalive_tick();  -- requires service_role connection
-- ==============================================================
