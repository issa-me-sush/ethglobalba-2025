import "dotenv/config";
import { Client } from "pg";

/**
 * Deletes arenas (and related bets/metrics) whose likes_0 is below a threshold.
 * Default threshold is 100; override via ARENA_CLEAR_LIKES_THRESHOLD.
 */
async function main() {
  const connectionString = process.env.SUPABASE_DB_URL;

  if (!connectionString) {
    console.error("SUPABASE_DB_URL is not set. Get it from Supabase → Settings → Database.");
    process.exit(1);
  }

  const threshold = Number(process.env.ARENA_CLEAR_LIKES_THRESHOLD ?? 100);

  const client = new Client({ connectionString });
  await client.connect();

  try {
    console.log("[clearArenasLowLikes] Deleting arenas with likes_0 <", threshold);
    await client.query(
      `
      delete from public.tweet_metrics_log
      where arena_id in (select id from public.arenas where likes_0 < $1);
    `,
      [threshold],
    );
    await client.query(
      `
      delete from public.bets
      where arena_id in (select id from public.arenas where likes_0 < $1);
    `,
      [threshold],
    );
    await client.query("delete from public.arenas where likes_0 < $1;", [threshold]);
    console.log("[clearArenasLowLikes] Done.");
  } finally {
    await client.end();
  }
}

void main();


