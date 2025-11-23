export type ArenaStatus = "active" | "locked" | "resolved";

export type ArenaOutcome = "yes" | "no" | null;

export type ArenaCategory = "ai" | "crypto" | "politics" | "meme" | "sports" | "other" | null;

/**
 * Arena domain model (mirrors the DB schema at a high level).
 *
 * In V1 this is backed by Supabase, but for now we will use mock data.
 */
export interface Arena {
  id: string; // UUID in DB
  arenaIndex: number; // numeric ID used on-chain
  tweetId: string;
  tweetUrl: string;
  tweetAuthorHandle: string;
  tweetText?: string;
  authorDisplayName?: string;
  tweetCreatedAt: string; // ISO timestamp
  arenaCreatedAt: string; // ISO timestamp
  resolveDeadline: string; // ISO timestamp
  betCutoffAt: string; // ISO timestamp
  likes0: number;
  retweets0?: number;
  replies0?: number;
  views0?: number;
  quotes0?: number;
  score0?: number;
  scoreLine?: number | null;
  bangerLine: number;
  status: ArenaStatus;
  outcome: ArenaOutcome;
  category: ArenaCategory;
  firstDemoBetAt?: string | null;
}


