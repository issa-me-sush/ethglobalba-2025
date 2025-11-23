"use client";

import { useEffect, useState } from "react";

import type { Arena } from "@/lib/arenas/types";

import TweetCard from "./TweetCard";

interface ArenasResponse {
  arenas: Arena[];
}

interface ArenasFeedProps {
  showHeading?: boolean;
}

export default function ArenasFeed({ showHeading = true }: ArenasFeedProps) {
  const [arenas, setArenas] = useState<Arena[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
      <div className="grid gap-4 md:grid-cols-2">
        {arenas.map(arena => (
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
            status={arena.status}
            href={`/arenas/${arena.id}`}
          />
        ))}
      </div>
    </section>
  );
}


