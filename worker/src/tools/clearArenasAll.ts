import "dotenv/config";
import { Client } from "pg";

/**
 * DANGER: Deletes all arenas, bets, and tweet metrics.
 * Use only for local/demo resets.
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
    console.log("[clearArenasAll] Deleting all bets, tweet_metrics_log, and arenas…");
    await client.query("delete from public.tweet_metrics_log;");
    await client.query("delete from public.bets;");
    await client.query("delete from public.arenas;");
    console.log("[clearArenasAll] Done.");
  } finally {
    await client.end();
  }
}

void main();


