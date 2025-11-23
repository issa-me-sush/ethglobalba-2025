import type { Config } from "../config";
import type { Db } from "../supabase";
import { getArenaView, resolveArenaOnChain } from "../contract/bangerArenas";
import { computeBangerScore } from "./discovery";

interface ArenaRow {
  id: string;
  arena_index: number;
  tweet_id: string;
  tweet_created_at: string;
  resolve_deadline: string;
  bet_cutoff_at: string;
  banger_line: number;
  score_line: number | null;
  status: "active" | "locked" | "resolved";
  outcome: "yes" | "no" | null;
}

interface TwitterMetrics {
  likes: number;
  retweets: number;
  replies: number;
  views: number;
  quotes: number;
}

async function fetchTweetMetrics(_config: Config, _tweetId: string): Promise<TwitterMetrics> {
  // TODO: implement using twitterapi.io metrics endpoint
  // For now this is a stub so the flow compiles.
  return { likes: 0, retweets: 0, replies: 0, views: 0, quotes: 0 };
}

export async function runResolutionTick(config: Config, db: Db) {
  const now = new Date();

  console.log("[resolution] tick start, mode:", config.appMode);

  const { data: arenas, error } = await db
    .from("arenas")
    .select(
      "id, arena_index, tweet_id, tweet_created_at, resolve_deadline, bet_cutoff_at, banger_line, score_line, status, outcome, first_demo_bet_at",
    )
    .in("status", ["active", "locked"])
    .not("first_demo_bet_at", "is", null);

  if (error) {
    console.error("[resolution] Supabase load arenas error", error);
    return;
  }

  if (!arenas || arenas.length === 0) return;

  console.log("[resolution] arenas to check:", arenas.length);

  for (const arena of arenas as ArenaRow[]) {
    const resolveDeadline = new Date(arena.resolve_deadline);
    const tweetCreatedAt = new Date(arena.tweet_created_at);
    const metrics = await fetchTweetMetrics(config, arena.tweet_id);
    let outcome: "yes" | "no" | null = null;

    if (config.appMode === "demo") {
      const likesNow = metrics.likes;

      console.log(
        "[resolution] arena",
        arena.arena_index,
        "tweet_id",
        arena.tweet_id,
        "likes_now",
        likesNow,
        "banger_line",
        arena.banger_line,
      );

      if (likesNow >= arena.banger_line) {
        outcome = "yes";
      } else if (now >= resolveDeadline) {
        outcome = "no";
      }
    } else {
      // prod: engagement-score based resolution when score_line is present; fallback to likes
      const ageMinutes = (now.getTime() - tweetCreatedAt.getTime()) / (60 * 1000);
      const scoreNow = computeBangerScore({
        likes: metrics.likes,
        retweets: metrics.retweets,
        replies: metrics.replies,
        views: metrics.views,
        quotes: metrics.quotes,
        ageMinutes,
      });

      console.log(
        "[resolution] arena",
        arena.arena_index,
        "tweet_id",
        arena.tweet_id,
        "score_now",
        scoreNow,
        "score_line",
        arena.score_line,
        "likes_now",
        metrics.likes,
        "banger_line",
        arena.banger_line,
      );

      if (Number.isFinite(arena.score_line) && arena.score_line !== null) {
        if (scoreNow >= Number(arena.score_line)) {
          outcome = "yes";
        } else if (now >= resolveDeadline) {
          outcome = "no";
        }
      } else {
        // Safety fallback: use likes-based rule if score_line is missing.
        if (metrics.likes >= arena.banger_line) {
          outcome = "yes";
        } else if (now >= resolveDeadline) {
          outcome = "no";
        }
      }
    }

    if (!outcome) {
      // No resolution yet
      continue;
    }

    // Only try to resolve arenas that actually exist on-chain and have stake.
    try {
      const view = await getArenaView(config, arena.arena_index);
      const onChainPot = view.totalYesStake + view.totalNoStake;

      if (!view.exists || onChainPot === 0n) {
        console.log(
          "[resolution] skipping on-chain resolution for arena with no stakes or not created",
          arena.arena_index,
        );
        continue;
      }
    } catch (chainViewError) {
      console.error("[resolution] getArenaView failed, skipping arena", {
        arenaId: arena.arena_index,
        error: chainViewError,
      });
      continue;
    }

    const outcomeYes = outcome === "yes";

    try {
      console.log(
        "[resolution] resolving arena on-chain",
        arena.arena_index,
        "outcomeYes",
        outcomeYes,
      );
      await resolveArenaOnChain(config, arena.arena_index, outcomeYes);
    } catch (e) {
      console.error("[resolution] resolveArenaOnChain failed", {
        arenaId: arena.arena_index,
        error: e,
      });
      continue;
    }

    const { error: updateError } = await db
      .from("arenas")
      .update({
        status: "resolved",
        outcome,
      })
      .eq("id", arena.id);

    if (updateError) {
      console.error("[resolution] Supabase update arena resolution error", updateError);
    } else {
      console.log(
        "[resolution] arena resolved in DB",
        arena.arena_index,
        "outcome",
        outcome,
      );
    }
  }
}

