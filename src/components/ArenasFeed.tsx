"use client";

import { useEffect, useMemo, useState } from "react";

import type { Arena, ArenaCategory } from "@/lib/arenas/types";

import TweetCard from "./TweetCard";

interface ArenasResponse {
  arenas: Arena[];
}

interface ArenasFeedProps {
  showHeading?: boolean;
}

type Filter = "all" | "crypto" | "ai" | "politics" | "sports";

export default function ArenasFeed({ showHeading = true }: ArenasFeedProps) {
  const [arenas, setArenas] = useState<Arena[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/arenas");
        if (!res.ok) {
          throw new Error(`Failed to load arenas: ${res.status}`);
        }
        const data = (await res.json()) as ArenasResponse;
        setArenas(data.arenas);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("[ArenasFeed] failed to load arenas", error);
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, []);

  const filtered = useMemo(() => {
    if (filter === "all") return arenas;
    return arenas.filter(arena => arena.category === (filter as ArenaCategory));
  }, [arenas, filter]);

  if (isLoading) {
    return (
      <section className="flex flex-col gap-3">
        {showHeading && <p className="page-heading">Banger Arenas</p>}
        <p className="text-sm text-slate-300">Loading arenas...</p>
      </section>
    );
  }

  if (!arenas.length) {
    return (
      <section className="flex flex-col gap-3">
        {showHeading && <p className="page-heading">Banger Arenas</p>}
        <p className="text-sm text-slate-400">
          No arenas yet. The worker will start spinning up markets as new tweets qualify.
        </p>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-4">
      {showHeading && <p className="page-heading">Banger Arenas</p>}

      <div className="flex flex-wrap items-center gap-2 text-[11px]">
        <button
          type="button"
          className={`rounded-full border px-3 py-1 ${
            filter === "all"
              ? "border-emerald-500 bg-emerald-500/10 text-emerald-300"
              : "border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-600"
          }`}
          onClick={() => setFilter("all")}
        >
          All
        </button>
        <button
          type="button"
          className={`rounded-full border px-3 py-1 ${
            filter === "crypto"
              ? "border-emerald-500 bg-emerald-500/10 text-emerald-300"
              : "border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-600"
          }`}
          onClick={() => setFilter("crypto")}
        >
          CT
        </button>
        <button
          type="button"
          className={`rounded-full border px-3 py-1 ${
            filter === "ai"
              ? "border-sky-500 bg-sky-500/10 text-sky-300"
              : "border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-600"
          }`}
          onClick={() => setFilter("ai")}
        >
          AI / Tech
        </button>
        <button
          type="button"
          className={`rounded-full border px-3 py-1 ${
            filter === "politics"
              ? "border-rose-500 bg-rose-500/10 text-rose-300"
              : "border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-600"
          }`}
          onClick={() => setFilter("politics")}
        >
          Politics
        </button>
        <button
          type="button"
          className={`rounded-full border px-3 py-1 ${
            filter === "sports"
              ? "border-amber-500 bg-amber-500/10 text-amber-300"
              : "border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-600"
          }`}
          onClick={() => setFilter("sports")}
        >
          Sports
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {filtered.map(arena => (
          <TweetCard
            key={arena.id}
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
            status={arena.firstDemoBetAt ? arena.status : undefined}
            category={arena.category}
            href={`/arenas/${arena.id}`}
          />
        ))}
      </div>
    </section>
  );
}


