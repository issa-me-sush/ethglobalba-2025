"use client";

import { useEvmAddress } from "@coinbase/cdp-hooks";
import { useEffect, useState } from "react";
import { createPublicClient, http } from "viem";
import { baseSepolia } from "viem/chains";

import type { Arena } from "@/lib/arenas/types";
import {
  BANGER_ARENAS_ABI,
  BANGER_ARENAS_ADDRESS,
  type UserStakeView,
} from "@/lib/contract/bangerArenas";

interface ArenasResponse {
  arenas: Arena[];
}

interface MyBet {
  arena: Arena;
  stake: UserStakeView;
}

export default function MyBets() {
  const { evmAddress } = useEvmAddress();
  const [isLoading, setIsLoading] = useState(true);
  const [bets, setBets] = useState<MyBet[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!evmAddress) {
      setBets([]);
      setIsLoading(false);
      return;
    }

    const load = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const res = await fetch("/api/arenas");
        if (!res.ok) {
          throw new Error(`Failed to load arenas: ${res.status}`);
        }
        const data = (await res.json()) as ArenasResponse;
        const arenas = data.arenas;

        const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL_BASE_SEPOLIA;
        if (!rpcUrl) {
          throw new Error("NEXT_PUBLIC_RPC_URL_BASE_SEPOLIA is not set");
        }

        const client = createPublicClient({
          chain: baseSepolia,
          transport: http(rpcUrl),
        });

        // To avoid RPC rate limits, only scan the most recent arenas and do it sequentially.
        const recentArenas = arenas.slice(0, 25);
        const stakes: (MyBet | null)[] = [];

        for (const arena of recentArenas) {
          try {
            const [yesStake, noStake, hasClaimed] = (await client.readContract({
              address: BANGER_ARENAS_ADDRESS,
              abi: BANGER_ARENAS_ABI,
              functionName: "getUserStake",
              args: [BigInt(arena.arenaIndex), evmAddress],
            })) as [bigint, bigint, boolean];

            stakes.push({
              arena,
              stake: { yesStake, noStake, hasClaimed },
            });
          } catch (err) {
            console.error("[MyBets] getUserStake error", err);
            stakes.push(null);
          }
        }

        const withStake = stakes.filter(
          (entry): entry is MyBet =>
            entry !== null && (entry.stake.yesStake > 0n || entry.stake.noStake > 0n),
        );

        console.log("[MyBets] found bets", withStake.length);
        setBets(withStake);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        console.error("[MyBets] failed to load bets", err);
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, [evmAddress]);

  if (!evmAddress) {
    return (
      <section className="flex flex-col gap-3">
        <p className="page-heading">My bets</p>
        <p className="text-sm text-slate-400">
          Sign in and connect your wallet to see arenas you have bet on.
        </p>
      </section>
    );
  }

  if (isLoading) {
    return (
      <section className="flex flex-col gap-3">
        <p className="page-heading">My bets</p>
        <p className="text-sm text-slate-300">Scanning arenas for your bets…</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="flex flex-col gap-3">
        <p className="page-heading">My bets</p>
        <p className="text-sm text-red-400">Failed to load bets: {error}</p>
      </section>
    );
  }

  if (!bets.length) {
    return (
      <section className="flex flex-col gap-3">
        <p className="page-heading">My bets</p>
        <p className="text-sm text-slate-400">
          You haven&apos;t placed any bets yet. Browse arenas and place your first wager.
        </p>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-4">
      <p className="page-heading">My bets</p>
      <div className="flex flex-col gap-3">
        {bets.map(({ arena, stake }) => {
          const yes = Number(stake.yesStake) / 1e6;
          const no = Number(stake.noStake) / 1e6;
          const side =
            yes > 0 && no === 0
              ? "YES"
              : no > 0 && yes === 0
                ? "NO"
                : yes > 0 && no > 0
                  ? "BOTH"
                  : "NONE";

          return (
            <div key={arena.id} className="card">
              <h2 className="card-title">
                @{arena.tweetAuthorHandle} &middot;{" "}
                <span className="text-xs uppercase tracking-[0.16em] text-slate-400">
                  {arena.status}
                </span>
              </h2>
              <p className="mb-1 text-sm text-slate-300">
                Banger line:{" "}
                <span className="font-semibold text-emerald-400">
                  {arena.bangerLine.toLocaleString()} likes
                </span>
              </p>
              <p className="mb-1 text-sm text-slate-300">
                Your stake — YES:{" "}
                <span className="font-mono">{yes.toFixed(2)}</span> | NO:{" "}
                <span className="font-mono">{no.toFixed(2)}</span> (side: {side})
              </p>
              {arena.status === "resolved" && arena.outcome && (
                <p className="mb-1 text-sm text-slate-300">
                  Outcome:{" "}
                  <span className="font-semibold text-emerald-400">
                    {arena.outcome.toUpperCase()}
                  </span>
                </p>
              )}
              <a href={`/arenas/${arena.id}`} className="tx-button">
                View arena
              </a>
            </div>
          );
        })}
      </div>
    </section>
  );
}


