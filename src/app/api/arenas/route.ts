import { NextResponse } from "next/server";

import type { Arena } from "@/lib/arenas/types";
import { supabaseServer } from "@/lib/supabase-server";

export async function GET() {
  try {
    const { data, error } = await supabaseServer
      .from("arenas")
      .select(
        "id, arena_index, tweet_id, tweet_url, tweet_author_handle, tweet_text, author_display_name, tweet_created_at, arena_created_at, resolve_deadline, bet_cutoff_at, likes_0, retweets_0, replies_0, views_0, quotes_0, score_0, score_line, banger_line, status, outcome, category",
      )
      .order("arena_created_at", { ascending: false })
      .limit(50);

    if (error) {
      // eslint-disable-next-line no-console
      console.error("[api/arenas] Supabase error", error);
      return NextResponse.json({ error: "Failed to load arenas" }, { status: 500 });
    }

    const arenas: Arena[] =
      data?.map(row => ({
        id: row.id,
        arenaIndex: row.arena_index,
        tweetId: row.tweet_id,
        tweetUrl: row.tweet_url,
        tweetAuthorHandle: row.tweet_author_handle,
        tweetText: row.tweet_text ?? undefined,
        authorDisplayName: row.author_display_name ?? undefined,
        tweetCreatedAt: row.tweet_created_at,
        arenaCreatedAt: row.arena_created_at,
        resolveDeadline: row.resolve_deadline,
        betCutoffAt: row.bet_cutoff_at,
        likes0: row.likes_0,
        retweets0: row.retweets_0 ?? undefined,
        replies0: row.replies_0 ?? undefined,
        views0: row.views_0 ?? undefined,
        quotes0: row.quotes_0 ?? undefined,
        score0: row.score_0 ?? undefined,
        scoreLine: row.score_line ?? null,
        bangerLine: row.banger_line,
        status: row.status,
        outcome: row.outcome,
        category: row.category,
      })) ?? [];

    // eslint-disable-next-line no-console
    console.log("[api/arenas] returning arenas count:", arenas.length);

    return NextResponse.json({ arenas });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error("[api/arenas] Unexpected error", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}



