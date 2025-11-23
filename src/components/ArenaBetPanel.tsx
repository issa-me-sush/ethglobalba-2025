"use client";

import { useEvmAddress, useIsSignedIn, useSendEvmTransaction } from "@coinbase/cdp-hooks";
import { useCallback, useEffect, useMemo, useState } from "react";
import { createPublicClient, encodeFunctionData, http } from "viem";
import { baseSepolia } from "viem/chains";

import type { UserStakeView } from "@/lib/contract/bangerArenas";
import {
  BANGER_ARENAS_ABI,
  BANGER_ARENAS_ADDRESS,
  STAKE_TOKEN_ADDRESS,
} from "@/lib/contract/bangerArenas";
import { ERC20_ABI } from "@/lib/erc20";

interface ArenaBetPanelProps {
  arenaId: string;
  arenaIndex: number;
  likes0?: number;
  bangerLine?: number;
}

const BASE_SEPOLIA_CHAIN_ID = 84532;

export default function ArenaBetPanel({
  arenaId,
  arenaIndex,
  likes0,
  bangerLine,
}: ArenaBetPanelProps) {
  const { isSignedIn } = useIsSignedIn();
  const { evmAddress } = useEvmAddress();
  const { sendEvmTransaction } = useSendEvmTransaction();

  const [amount, setAmount] = useState("1"); // human tokens
  const [isBettingYes, setIsBettingYes] = useState(false);
  const [isBettingNo, setIsBettingNo] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [userStake, setUserStake] = useState<UserStakeView | null>(null);

  const parsedAmount = useMemo(() => {
    const n = Number(amount);
    if (!Number.isFinite(n) || n <= 0) return null;
    // Assume USDC-style 6 decimals on the stake token
    const units = BigInt(Math.round(n * 1e6));
    return units;
  }, [amount]);

  useEffect(() => {
    if (!evmAddress) {
      setUserStake(null);
      return;
    }

    const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL_BASE_SEPOLIA;
    if (!rpcUrl) {
      // eslint-disable-next-line no-console
      console.error("[ArenaBetPanel] NEXT_PUBLIC_RPC_URL_BASE_SEPOLIA is not set");
      setUserStake(null);
      return;
    }

    const client = createPublicClient({
      chain: baseSepolia,
      transport: http(rpcUrl),
    });

    const loadStake = async () => {
      try {
        const [yesStake, noStake, hasClaimed] = (await client.readContract({
          address: BANGER_ARENAS_ADDRESS,
          abi: BANGER_ARENAS_ABI,
          functionName: "getUserStake",
          args: [BigInt(arenaIndex), evmAddress],
        })) as [bigint, bigint, boolean];

        setUserStake({ yesStake, noStake, hasClaimed });

        // eslint-disable-next-line no-console
        console.log("[ArenaBetPanel] user stake", {
          arenaIndex,
          evmAddress,
          yesStake: yesStake.toString(),
          noStake: noStake.toString(),
          hasClaimed,
        });
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("[ArenaBetPanel] failed to load user stake", error);
        setUserStake(null);
      }
    };

    void loadStake();
  }, [arenaIndex, evmAddress]);

  const requireAccount = useCallback(() => {
    if (!isSignedIn || !evmAddress) {
      setMessage("Connect your embedded wallet to place a bet.");
      return false;
    }
    return true;
  }, [evmAddress, isSignedIn]);

  const placeBet = useCallback(
    async (yesSide: boolean) => {
      if (!requireAccount()) return;
      if (!parsedAmount) {
        setMessage("Enter a valid stake amount.");
        return;
      }

      const setFlag = yesSide ? setIsBettingYes : setIsBettingNo;
      const label = yesSide ? "YES" : "NO";

      try {
        setFlag(true);
        setMessage(`Sending approval and ${label} bet transaction…`);

        // 1) Approve stake token for the arena contract
        const approveData = encodeFunctionData({
          abi: ERC20_ABI,
          functionName: "approve",
          args: [BANGER_ARENAS_ADDRESS, parsedAmount],
        });

        const approveResult = await sendEvmTransaction({
          transaction: {
            to: STAKE_TOKEN_ADDRESS,
            value: 0n,
            data: approveData,
            chainId: BASE_SEPOLIA_CHAIN_ID,
            type: "eip1559",
          },
          evmAccount: evmAddress!,
          network: "base-sepolia",
        });

        // eslint-disable-next-line no-console
        console.log("[ArenaBetPanel] approve+bet approve tx result", approveResult);

        // 2) Place the bet
        const betData = encodeFunctionData({
          abi: BANGER_ARENAS_ABI,
          functionName: "placeBet",
          args: [BigInt(arenaIndex), yesSide, parsedAmount],
        });

        const result = await sendEvmTransaction({
          transaction: {
            to: BANGER_ARENAS_ADDRESS,
            value: 0n,
            data: betData,
            chainId: BASE_SEPOLIA_CHAIN_ID,
            type: "eip1559",
          },
          evmAccount: evmAddress!,
          network: "base-sepolia",
        });

        // eslint-disable-next-line no-console
        console.log("[ArenaBetPanel] placeBet tx result", result);
        setMessage(`Bet placed on ${label}.`);

        // Inform backend that this arena now has at least one on-chain bet.
        try {
          await fetch(`/api/arenas/${arenaId}/first-bet`, { method: "POST" });
        } catch (apiError) {
          // eslint-disable-next-line no-console
          console.error("[ArenaBetPanel] failed to mark first bet in Supabase", apiError);
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("[ArenaBetPanel] placeBet error", error);
        setMessage(`Failed to place ${label} bet.`);
      } finally {
        setFlag(false);
      }
    },
    [arenaId, arenaIndex, parsedAmount, requireAccount, sendEvmTransaction, evmAddress],
  );

  const handleClaim = useCallback(async () => {
    if (!requireAccount()) return;

    try {
      setIsClaiming(true);
      setMessage("Sending claim transaction…");

      const data = encodeFunctionData({
        abi: BANGER_ARENAS_ABI,
        functionName: "claim",
        args: [BigInt(arenaIndex)],
      });

      const result = await sendEvmTransaction({
        transaction: {
          to: BANGER_ARENAS_ADDRESS,
          value: 0n,
          data,
          chainId: BASE_SEPOLIA_CHAIN_ID,
          type: "eip1559",
        },
        evmAccount: evmAddress!,
        network: "base-sepolia",
      });

      // eslint-disable-next-line no-console
      console.log("[ArenaBetPanel] claim tx result", result);
      setMessage("Claim transaction sent. If you had a winning stake, funds will arrive once confirmed.");
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("[ArenaBetPanel] claim error", error);
      setMessage("Failed to send claim transaction.");
    } finally {
      setIsClaiming(false);
    }
  }, [arenaIndex, requireAccount, sendEvmTransaction, evmAddress]);

  const hasStake =
    userStake && (userStake.yesStake > 0n || userStake.noStake > 0n || userStake.hasClaimed);

  return (
    <section className="card">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex-1">
          <h2 className="card-title mb-1">Place your bet</h2>
          <p className="mb-3 text-sm text-slate-300">
            Choose a side and an amount. We’ll automatically handle approvals with your embedded
            wallet and place the bet on-chain.
          </p>
          {evmAddress && (
            <p className="mb-2 text-[11px] font-mono text-slate-500">
              Connected:{" "}
              <span className="rounded-full bg-slate-900 px-2 py-0.5">
                {evmAddress.slice(0, 6)}...{evmAddress.slice(-4)}
              </span>
            </p>
          )}
          <div className="mb-3 flex items-center gap-2">
            <label className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
              Stake amount
              <input
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="mt-1 w-28 rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-sm text-slate-100 focus:border-emerald-500 focus:outline-none"
              />
            </label>
          </div>
          {!isSignedIn || !evmAddress ? (
            <p className="text-sm text-slate-400">
              Sign in with your embedded wallet to enter this arena.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="tx-button bg-emerald-500 hover:bg-emerald-400"
                disabled={isBettingYes}
                onClick={() => void placeBet(true)}
              >
                {isBettingYes ? "Betting YES…" : "Bet YES"}
              </button>
              <button
                type="button"
                className="tx-button bg-rose-500 hover:bg-rose-400"
                disabled={isBettingNo}
                onClick={() => void placeBet(false)}
              >
                {isBettingNo ? "Betting NO…" : "Bet NO"}
              </button>
              <button
                type="button"
                className="tx-button bg-slate-800 text-slate-100 hover:bg-slate-700"
                disabled={isClaiming}
                onClick={handleClaim}
              >
                {isClaiming ? "Claiming…" : "Claim payout"}
              </button>
            </div>
          )}
          {message && <p className="mt-3 text-sm text-slate-300">{message}</p>}
        </div>

        <div className="mt-4 w-full border-t border-slate-800 pt-4 text-sm text-slate-300 sm:mt-0 sm:w-64 sm:border-t-0 sm:border-l sm:pl-4">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            Your position
          </p>
          {likes0 !== undefined && bangerLine !== undefined && bangerLine > 0 && (
            <div className="mb-3">
              <p className="mb-1 text-[11px] uppercase tracking-[0.16em] text-slate-500">
                Line to beat
              </p>
              <div className="relative h-1.5 overflow-hidden rounded-full bg-slate-900">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-sky-500 to-emerald-500 transition-all"
                  style={{
                    width: `${Math.min((likes0 / bangerLine) * 100, 100)}%`,
                  }}
                />
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_0_0,rgba(34,197,94,0.35),transparent_55%),radial-gradient(circle_at_100%_0,rgba(56,189,248,0.35),transparent_55%)] opacity-60 mix-blend-screen" />
              </div>
              <p className="mt-1 text-[11px] text-slate-400">
                {likes0.toLocaleString()} likes now · target{" "}
                <span className="font-semibold text-emerald-400">
                  {bangerLine.toLocaleString()}
                </span>
              </p>
            </div>
          )}
          {!hasStake && (
            <p className="text-xs text-slate-400">No bets placed yet on this arena.</p>
          )}
          {userStake && hasStake && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">YES</span>
                <span className="font-mono text-sm">
                  {(Number(userStake.yesStake) / 1e6).toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">NO</span>
                <span className="font-mono text-sm">
                  {(Number(userStake.noStake) / 1e6).toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Payout claimed</span>
                <span className="text-xs font-medium">
                  {userStake.hasClaimed ? "Yes" : "Not yet"}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}


