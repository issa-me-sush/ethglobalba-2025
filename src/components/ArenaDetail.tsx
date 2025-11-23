"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import type { Arena } from "@/lib/arenas/types";

import TweetCard from "./TweetCard";
import ArenaBetPanel from "./ArenaBetPanel";

interface ArenaDetailProps {
  arenaId: string;
}

interface ArenaResponse {
  arena: Arena;
}

export default function ArenaDetail({ arenaId }: ArenaDetailProps) {
  const [arena, setArena] = useState<Arena | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/arenas/${arenaId}`);
        if (!res.ok) {
          throw new Error(`Failed to load arena: ${res.status}`);
        }
        const data = (await res.json()) as ArenaResponse;
        setArena(data.arena);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, [arenaId]);

  if (isLoading) {
    return (
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-3 py-6">
        <p className="page-heading">Arena</p>
        <p className="text-sm text-slate-300">Loading arena…</p>
      </main>
    );
  }

  if (error || !arena) {
    return (
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-4 px-3 py-6">
        <p className="page-heading">Arena</p>
        <p className="text-sm text-red-400">Failed to load arena.</p>
        <Link href="/" className="tx-button">
          Back home
        </Link>
      </main>
    );
  }

  const tweetCreatedAt = new Date(arena.tweetCreatedAt);
  const resolveDeadline = new Date(arena.resolveDeadline);
  const betCutoffAt = new Date(arena.betCutoffAt);
  const hasFirstBet = Boolean(arena.firstDemoBetAt);
  const displayStatusLabel = hasFirstBet ? arena.status.toUpperCase() : "NO BETS YET";

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-3 py-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Arena
          </p>
          <p className="text-xl font-semibold tracking-tight text-slate-50">
            Tweet #{arena.arenaIndex}
          </p>
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-1 rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs font-medium text-slate-200 shadow-sm shadow-slate-900/40 transition hover:border-emerald-500 hover:text-emerald-300"
        >
          <span>←</span>
          <span>Back home</span>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Tile 1: Tweet / market card */}
        <div className="flex flex-col gap-4">
          <TweetCard
            authorHandle={arena.tweetAuthorHandle}
            authorDisplayName={arena.authorDisplayName}
            createdAt={arena.tweetCreatedAt}
            text={arena.tweetText}
            tweetUrl={arena.tweetUrl}
            likes0={arena.likes0}
            retweets0={arena.retweets0}
            replies0={arena.replies0}
            views0={arena.views0}
            bangerLine={arena.bangerLine}
            scoreLine={arena.scoreLine}
            status={hasFirstBet ? arena.status : undefined}
          />
        </div>

        {/* Tile 2: Arena summary */}
        <div className="card">
          <h2 className="card-title">Arena summary</h2>
          <div className="grid gap-3 text-sm text-slate-300 sm:grid-cols-2">
            <div>
              <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Status</p>
              <p className="mt-1 text-sm font-medium text-slate-100">{displayStatusLabel}</p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Banger line</p>
              <p className="mt-1 text-sm font-medium text-emerald-400">
                {arena.bangerLine.toLocaleString()} likes
              </p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">
                Likes at discovery
              </p>
              <p className="mt-1 text-sm font-medium">
                {arena.likes0.toLocaleString()} likes
              </p>
            </div>
            {arena.score0 !== undefined && (
              <div>
                <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">
                  Engagement score (discovery)
                </p>
                <p className="mt-1 text-sm font-medium">{arena.score0.toFixed(1)}</p>
              </div>
            )}
            {arena.scoreLine != null && (
              <div>
                <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">
                  Score line (prod rule)
                </p>
                <p className="mt-1 text-sm font-medium text-sky-400">
                  {arena.scoreLine.toFixed(1)}
                </p>
              </div>
            )}
            {arena.status === "resolved" && arena.outcome && (
              <div>
                <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Outcome</p>
                <p className="mt-1 text-sm font-semibold text-emerald-400">
                  {arena.outcome.toUpperCase()}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Tile 3: Timeline */}
        <div className="card">
          <h2 className="card-title">Arena timeline</h2>
          <div className="grid gap-3 text-sm text-slate-300 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
              <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Tweeted at</p>
              <p className="mt-1 text-xs sm:text-[13px]">
                <time dateTime={arena.tweetCreatedAt}>{tweetCreatedAt.toLocaleString()}</time>
              </p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
              <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Bet cutoff</p>
              <p className="mt-1 text-xs sm:text-[13px]">
                <time dateTime={arena.betCutoffAt}>{betCutoffAt.toLocaleString()}</time>
              </p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
              <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">
                Resolve deadline
              </p>
              <p className="mt-1 text-xs sm:text-[13px]">
                <time dateTime={arena.resolveDeadline}>{resolveDeadline.toLocaleString()}</time>
              </p>
            </div>
          </div>
        </div>

        {/* Tile 4: Bet / position */}
        <ArenaBetPanel
          arenaId={arena.id}
          arenaIndex={arena.arenaIndex}
          likes0={arena.likes0}
          bangerLine={arena.bangerLine}
        />
      </div>
    </main>
  );
}


