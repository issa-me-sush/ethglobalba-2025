 "use client";
import { useEvmAddress } from "@coinbase/cdp-hooks";
import { AuthButton } from "@coinbase/cdp-react/components/AuthButton";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createPublicClient, http } from "viem";
import { baseSepolia } from "viem/chains";

import { IconCheck, IconCopy, IconUser } from "@/components/Icons";
import { ERC20_ABI } from "@/lib/erc20";
import { STAKE_TOKEN_ADDRESS } from "@/lib/contract/bangerArenas";

/**
 * Header component
 */
export default function Header() {
  const { evmAddress } = useEvmAddress();
  const [isCopied, setIsCopied] = useState(false);
  const [usdcBalance, setUsdcBalance] = useState<string | null>(null);

  const copyAddress = async () => {
    if (!evmAddress) return;
    try {
      await navigator.clipboard.writeText(evmAddress);
      setIsCopied(true);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (!isCopied) return;
    const timeout = setTimeout(() => {
      setIsCopied(false);
    }, 2000);
    return () => clearTimeout(timeout);
  }, [isCopied]);

  useEffect(() => {
    if (!evmAddress) {
      setUsdcBalance(null);
      return;
    }

    const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL_BASE_SEPOLIA;
    if (!rpcUrl) {
      // eslint-disable-next-line no-console
      console.error("[Header] NEXT_PUBLIC_RPC_URL_BASE_SEPOLIA is not set");
      setUsdcBalance(null);
      return;
    }

    const client = createPublicClient({
      chain: baseSepolia,
      transport: http(rpcUrl),
    });

    const load = async () => {
      try {
        const balance = (await client.readContract({
          address: STAKE_TOKEN_ADDRESS,
          abi: ERC20_ABI,
          functionName: "balanceOf",
          args: [evmAddress],
        })) as bigint;

        // Assume USDC-style 6 decimals
        const formatted = Number(balance) / 1e6;
        // eslint-disable-next-line no-console
        console.log(
          "[Header] USDC balance loaded",
          evmAddress,
          STAKE_TOKEN_ADDRESS,
          balance.toString(),
        );
        setUsdcBalance(formatted.toLocaleString(undefined, { maximumFractionDigits: 2 }));
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("[Header] failed to load USDC balance", error);
        setUsdcBalance(null);
      }
    };

    void load();
  }, [evmAddress]);

  return (
    <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-3 py-2">
        <Link href="/" className="flex flex-col gap-1 no-underline">
          <h1 className="text-lg font-semibold tracking-tight text-slate-50">
            Banger Arenas
          </h1>
          <p className="text-xs text-slate-400">Turn hot tweets into markets</p>
        </Link>
        <div className="flex items-center gap-3">
          {evmAddress && (
            <div className="flex items-center gap-2">
              <button
                aria-label="copy wallet address"
                className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs text-slate-200 shadow-sm shadow-emerald-500/20 transition hover:border-emerald-500"
                onClick={copyAddress}
              >
                {!isCopied && (
                  <>
                    <IconUser className="h-4 w-4 text-slate-400" />
                    <IconCopy className="h-3 w-3 text-slate-500" />
                  </>
                )}
                {isCopied && <IconCheck className="h-4 w-4 text-emerald-400" />}
                <span className="font-mono text-[11px] text-slate-200">
                  {evmAddress.slice(0, 6)}...{evmAddress.slice(-4)}
                </span>
              </button>
              {usdcBalance !== null && (
                <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-[11px] font-medium text-emerald-300">
                  USDC: {usdcBalance}
                </span>
              )}
            </div>
          )}
          <AuthButton />
        </div>
      </div>
    </header>
  );
}
