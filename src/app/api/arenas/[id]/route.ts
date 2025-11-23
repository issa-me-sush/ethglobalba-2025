import { NextResponse } from "next/server";

import type { Arena } from "@/lib/arenas/types";
import { supabaseServer } from "@/lib/supabase-server";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;

    const { data, error } = await supabaseServer
      .from("arenas")
      .select(
        "id, arena_index, tweet_id, tweet_url, tweet_author_handle, tweet_text, author_display_name, tweet_created_at, arena_created_at, resolve_deadline, bet_cutoff_at, likes_0, retweets_0, replies_0, views_0, quotes_0, score_0, score_line, banger_line, status, outcome, category, first_demo_bet_at",
      )
      .eq("id", id)
      .maybeSingle();

    if (error) {
      // eslint-disable-next-line no-console
      console.error("[api/arenas/:id] Supabase error", error);
      return NextResponse.json({ error: "Failed to load arena" }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: "Arena not found" }, { status: 404 });
    }

    const arena: Arena = {
      id: data.id,
      arenaIndex: data.arena_index,
      tweetId: data.tweet_id,
      tweetUrl: data.tweet_url,
      tweetAuthorHandle: data.tweet_author_handle,
      tweetText: data.tweet_text ?? undefined,
      authorDisplayName: data.author_display_name ?? undefined,
      tweetCreatedAt: data.tweet_created_at,
      arenaCreatedAt: data.arena_created_at,
      resolveDeadline: data.resolve_deadline,
      betCutoffAt: data.bet_cutoff_at,
      likes0: data.likes_0,
      retweets0: data.retweets_0 ?? undefined,
      replies0: data.replies_0 ?? undefined,
      views0: data.views_0 ?? undefined,
      quotes0: data.quotes_0 ?? undefined,
      score0: data.score_0 ?? undefined,
      scoreLine: data.score_line ?? null,
      bangerLine: data.banger_line,
      status: data.status,
      outcome: data.outcome,
      category: data.category,
      firstDemoBetAt: data.first_demo_bet_at ?? null,
    };

    // eslint-disable-next-line no-console
    console.log("[api/arenas/:id] returning arena", arena.id, "index", arena.arenaIndex);

    return NextResponse.json({ arena });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error("[api/arenas/:id] Unexpected error", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}



