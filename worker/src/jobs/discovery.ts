import type { Config } from "../config";
import type { Db } from "../supabase";
import { searchCandidateTweets } from "../twitter";

const MIN_AGE_MINUTES = 2;
const MAX_AGE_MINUTES = 240; // 4h

interface ArenaRowInsert {
  tweet_id: string;
  tweet_url: string;
  tweet_author_handle: string;
  tweet_text?: string;
  author_display_name?: string;
  tweet_created_at: string;
  arena_created_at: string;
  resolve_deadline: string;
  bet_cutoff_at: string;
  likes_0: number;
  banger_line: number;
  retweets_0?: number;
  replies_0?: number;
  views_0?: number;
  quotes_0?: number;
  score_0?: number;
  score_line?: number;
  status: "active" | "locked" | "resolved";
}

export function computeBangerScore(params: {
  likes: number;
  retweets: number;
  replies: number;
  views?: number;
  quotes?: number;
  ageMinutes: number;
}) {
  const age = Math.max(params.ageMinutes, 1);
  const likesPerMin = params.likes / age;
  const retweetsPerMin = params.retweets / age;
  const repliesPerMin = params.replies / age;

  // Base virality: fast likes + some weight for RTs/replies
  const a = 1;
  const b = 0.5;
  const c = 0.3;
  let score = a * likesPerMin + b * retweetsPerMin + c * repliesPerMin;

  // Optional views: reward high engagement *relative* to views to reduce botted-like spam.
  const views = params.views ?? 0;
  if (views > 0) {
    const engagement = (params.likes + params.retweets + params.replies) / views;
    const engagementClamped = Math.min(engagement, 0.2); // cap extreme outliers
    const d = 50; // weight for view-based engagement
    score += d * engagementClamped;
  }

  // Quotes often signal organic discussion
  const quotes = params.quotes ?? 0;
  const e = 0.2;
  score += e * quotes;

  return score;
}

function computeBangerLine(likes0: number, mode: "demo" | "prod"): number {
  if (mode === "demo") {
    // Demo: just needs a few extra likes to count as a YES
    return likes0 + 3;
  }
  // Prod: must roughly double and be at least 500
  return Math.max(likes0 * 2, 500);
}

function computeScoreLine(score0: number): number | null {
  if (!Number.isFinite(score0) || score0 <= 0) return null;
  // Require a meaningful increase over initial engagement score.
  const minLine = 10;
  return Math.max(score0 * 1.5, minLine);
}

export async function runDiscoveryTick(config: Config, db: Db) {
  console.log("[discovery] tick start");
  const tweets = await searchCandidateTweets(config);
  const now = new Date();

  // use twitterapi.io fields: createdAt, likeCount, retweetCount, replyCount
  const withAge = tweets.map(tweet => {
    const createdAt = new Date(tweet.createdAt);
    const ageMinutes = (now.getTime() - createdAt.getTime()) / (60 * 1000);
    return { tweet, ageMinutes };
  });

  const tooYoung = withAge.filter(({ ageMinutes }) => ageMinutes < MIN_AGE_MINUTES).length;
  const tooOld = withAge.filter(({ ageMinutes }) => ageMinutes > MAX_AGE_MINUTES).length;

  const scored = withAge
    .filter(
      ({ ageMinutes }) => ageMinutes >= MIN_AGE_MINUTES && ageMinutes <= MAX_AGE_MINUTES,
    )
    .map(({ tweet, ageMinutes }) => {
      const score = computeBangerScore({
        likes: tweet.likeCount,
        retweets: tweet.retweetCount,
        replies: tweet.replyCount,
        views: tweet.viewCount,
        quotes: tweet.quoteCount,
        ageMinutes,
      });
      return {
        tweet,
        ageMinutes,
        score,
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 20);

  console.log(
    "[discovery] fetched",
    tweets.length,
    "tweets, candidates after filters:",
    scored.length,
    "| too young:",
    tooYoung,
    "| too old:",
    tooOld,
  );

  if (scored.length === 0 && tweets.length > 0) {
    const sample = withAge.slice(0, 5).map(({ tweet, ageMinutes }) => ({
      id: tweet.id,
      handle: tweet.author?.username, // twitterapi.io author username
      likes: tweet.likeCount,
      retweets: tweet.retweetCount,
      replies: tweet.replyCount,
      ageMinutes: Math.round(ageMinutes),
    }));
    console.log("[discovery] sample tweets after search (first 5):", sample);
  }

  if (scored.length === 0) return;

  for (const { tweet, score } of scored) {
    const tweetId = tweet.id;

    // Skip if arena already exists for this tweet_id
    const { data: existing, error: existingError } = await db
      .from("arenas")
      .select("id")
      .eq("tweet_id", tweetId)
      .maybeSingle();

    if (existingError) {
      console.error("[discovery] Supabase check existing arena error", existingError);
      continue;
    }

    if (existing) {
      // Already have an arena for this tweet_id
      console.log("[discovery] arena already exists for tweet_id", tweetId);
      continue;
    }

    const likes0 = tweet.likeCount;
    const bangerLine = computeBangerLine(likes0, config.appMode);
    const scoreLine = computeScoreLine(score);

    const tweetCreatedAt = new Date(tweet.createdAt);

    let resolveDeadline: Date;
    let betCutoffAt: Date;

    if (config.appMode === "demo") {
      // Demo window: ~5m total, bets for first 3m, last 1m locked
      const resolveDeadlineMs = tweetCreatedAt.getTime() + 5 * 60 * 1000;
      const betCutoffCandidate = new Date(tweetCreatedAt.getTime() + 3 * 60 * 1000);
      const resolveMinusOneMinute = new Date(resolveDeadlineMs - 60 * 1000);
      resolveDeadline = new Date(resolveDeadlineMs);
      betCutoffAt =
        betCutoffCandidate < resolveMinusOneMinute ? betCutoffCandidate : resolveMinusOneMinute;
    } else {
      // Prod window: 12h total, bets for first 2h, last 1h locked
      resolveDeadline = new Date(tweetCreatedAt.getTime() + 12 * 60 * 60 * 1000);
      const betCutoffCandidate = new Date(tweetCreatedAt.getTime() + 2 * 60 * 60 * 1000);
      const resolveMinusOneHour = new Date(resolveDeadline.getTime() - 60 * 60 * 1000);
      betCutoffAt =
        betCutoffCandidate < resolveMinusOneHour ? betCutoffCandidate : resolveMinusOneHour;
    }

    const row: ArenaRowInsert = {
      tweet_id: tweetId,
      tweet_url: tweet.url ?? `https://x.com/${tweet.author?.username}/status/${tweet.id}`,
      tweet_author_handle: tweet.author?.username ?? "unknown",
      tweet_text: tweet.text ?? "",
      author_display_name: tweet.author?.displayName,
      tweet_created_at: tweet.createdAt,
      arena_created_at: now.toISOString(),
      resolve_deadline: resolveDeadline.toISOString(),
      bet_cutoff_at: betCutoffAt.toISOString(),
      likes_0: likes0,
      banger_line: bangerLine,
      retweets_0: tweet.retweetCount ?? 0,
      replies_0: tweet.replyCount ?? 0,
      views_0: tweet.viewCount ?? 0,
      quotes_0: tweet.quoteCount ?? 0,
      score_0: score,
      score_line: scoreLine ?? undefined,
      status: "active",
    };

    const { error: insertError } = await db.from("arenas").insert(row);
    if (insertError) {
      console.error("[discovery] Supabase insert arena error", insertError);
    } else {
      console.log(
        "[discovery] inserted arena for tweet_id",
        tweetId,
        "handle",
        tweet.author?.username,
        "likes_0",
        likes0,
        "banger_line",
        bangerLine,
      );
    }
  }
}


