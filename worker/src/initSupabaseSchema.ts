import "dotenv/config";
import { Client } from "pg";

/**
 * One-time Supabase schema initializer.
 *
 * Usage:
 *   - Set SUPABASE_DB_URL in worker/.env to your Postgres connection string
 *   - Run: npm run init-db
 */
async function main() {
  const connectionString = process.env.SUPABASE_DB_URL;

  if (!connectionString) {
    console.error("SUPABASE_DB_URL is not set. Get it from Supabase → Settings → Database.");
    process.exit(1);
  }

  const client = new Client({ connectionString });
  await client.connect();

  try {
    const sql = `
      -- users
      create table if not exists public.users (
        id uuid primary key default gen_random_uuid(),
        wallet_address text unique not null,
        created_at timestamptz not null default now()
      );

      -- arenas
      create table if not exists public.arenas (
        id uuid primary key default gen_random_uuid(),
        arena_index bigserial unique not null,
        tweet_id text not null,
        tweet_url text not null,
        tweet_author_handle text not null,
        tweet_created_at timestamptz not null,
        arena_created_at timestamptz not null,
        resolve_deadline timestamptz not null,
        bet_cutoff_at timestamptz not null,
        likes_0 integer not null,
        banger_line integer not null,
        status text not null default 'active',
        outcome text,
        category text,
        author_followers integer,
        created_by_agent boolean not null default true
      );

      create index if not exists arenas_tweet_id_idx on public.arenas (tweet_id);
      create index if not exists arenas_status_idx on public.arenas (status);

      -- bets (mirror of on-chain events)
      create table if not exists public.bets (
        id uuid primary key default gen_random_uuid(),
        tx_hash text not null,
        arena_id uuid not null references public.arenas(id) on delete cascade,
        user_id uuid not null references public.users(id) on delete cascade,
        side text not null,
        amount numeric not null,
        created_at timestamptz not null default now()
      );

      create index if not exists bets_arena_id_idx on public.bets (arena_id);
      create index if not exists bets_user_id_idx on public.bets (user_id);

      -- optional metrics log
      create table if not exists public.tweet_metrics_log (
        id uuid primary key default gen_random_uuid(),
        arena_id uuid not null references public.arenas(id) on delete cascade,
        timestamp timestamptz not null default now(),
        likes integer not null,
        retweets integer not null,
        replies integer not null,
        quotes integer not null
      );

      create index if not exists tweet_metrics_log_arena_id_idx on public.tweet_metrics_log (arena_id);

      -- demo / maintenance helpers + progressive columns
      alter table if exists public.arenas
        add column if not exists first_demo_bet_at timestamptz,
        add column if not exists tweet_text text,
        add column if not exists author_display_name text,
        add column if not exists retweets_0 integer,
        add column if not exists replies_0 integer,
        add column if not exists views_0 bigint,
        add column if not exists quotes_0 integer,
        add column if not exists score_0 numeric,
        add column if not exists score_line numeric;
    `;

    await client.query(sql);
    console.log("Supabase schema initialized successfully.");
  } finally {
    await client.end();
  }
}

void main();


