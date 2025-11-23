"use client";

import { useEvmAddress, useIsSignedIn } from "@coinbase/cdp-hooks";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  createPublicClient,
  http,
  formatEther,
  type PublicClient,
  type Transport,
  type Address,
} from "viem";
import { baseSepolia, base } from "viem/chains";

import EOATransaction from "./EOATransaction";
import Header from "./Header";
import UserBalance from "./UserBalance";
import LinkXAccountButton from "./LinkXAccountButton";
import ArenasFeed from "./ArenasFeed";
import MyBets from "./MyBets";

import FundWallet from "@/components/FundWallet";

/**
 * Create a viem client to access user's balance on the Base network
 */
const client = createPublicClient({
  chain: base,
  transport: http(),
});

/**
 * Create a viem client to access user's balance on the Base Sepolia network
 */
const sepoliaClient = createPublicClient({
  chain: baseSepolia,
  transport: http(),
});

const useEvmBalance = (
  address: Address | null,
  client: PublicClient<Transport, typeof base | typeof baseSepolia, undefined, undefined>,
  poll = false,
) => {
  const [balance, setBalance] = useState<bigint | undefined>(undefined);

  const formattedBalance = useMemo(() => {
    if (balance === undefined) return undefined;
    return formatEther(balance);
  }, [balance]);

  const getBalance = useCallback(async () => {
    if (!address) return;
    const balance = await client.getBalance({ address });
    setBalance(balance);
  }, [address, client]);

  useEffect(() => {
    if (!poll) {
      getBalance();
      return;
    }
    const interval = setInterval(getBalance, 500);
    return () => clearInterval(interval);
  }, [getBalance, poll]);

  return { balance, formattedBalance, getBalance };
};

/**
 * The Signed In screen with onramp support
 */
export default function SignedInScreen() {
  const { isSignedIn } = useIsSignedIn();
  const { evmAddress } = useEvmAddress();
  const [activeTab, setActiveTab] = useState<"arenas" | "my-bets">("arenas");

  const { formattedBalance, getBalance } = useEvmBalance(evmAddress, client, true);
  const { formattedBalance: formattedBalanceSepolia, getBalance: getBalanceSepolia } =
    useEvmBalance(evmAddress, sepoliaClient, true);

  return (
    <>
      <Header />
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-3 py-6 lg:flex-row">
        <div className="flex min-w-0 flex-1 flex-col gap-6">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
            <button
              type="button"
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                activeTab === "arenas"
                  ? "bg-slate-100 text-slate-900"
                  : "bg-slate-900 text-slate-300 hover:bg-slate-800"
              }`}
              onClick={() => setActiveTab("arenas")}
            >
              Arenas
            </button>
            <button
              type="button"
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                activeTab === "my-bets"
                  ? "bg-slate-100 text-slate-900"
                  : "bg-slate-900 text-slate-300 hover:bg-slate-800"
              }`}
              onClick={() => setActiveTab("my-bets")}
            >
              My bets
            </button>
          </div>
          {activeTab === "arenas" && <ArenasFeed showHeading />}
          {activeTab === "my-bets" && <MyBets />}
        </div>
        <aside className="mt-4 flex w-full max-w-sm flex-col gap-4 lg:mt-0 lg:w-80">
          <div className="card">
            <h2 className="card-title">Optional: link your X account</h2>
            <p className="mb-4 text-sm text-slate-300">
              Use your X login as an additional way to access this wallet.
            </p>
            <LinkXAccountButton />
          </div>
          <div className="card">
            <h2 className="card-title">Base mainnet balance</h2>
            <UserBalance balance={formattedBalance} />
          </div>
          <div className="card">
            <h2 className="card-title">Fund your wallet on Base</h2>
            <p className="mb-4 text-sm text-slate-300">
              Use onramp to top up your EVM wallet with real or mock funds.
            </p>
            {isSignedIn && evmAddress && (
              <FundWallet
                onSuccess={getBalance}
                network="base"
                cryptoCurrency="eth"
                destinationAddress={evmAddress}
              />
            )}
          </div>
          <div className="card">
            <h2 className="card-title">Base Sepolia testnet</h2>
            <UserBalance
              balance={formattedBalanceSepolia}
              faucetName="Base Sepolia Faucet"
              faucetUrl="https://portal.cdp.coinbase.com/products/faucet"
            />
          </div>
          <div className="card">
            <h2 className="card-title">Send a test transaction</h2>
            <p className="mb-4 text-sm text-slate-300">
              Try a small self-transfer on Base Sepolia to verify everything is wired correctly.
            </p>
            {isSignedIn && (
              <EOATransaction balance={formattedBalanceSepolia} onSuccess={getBalanceSepolia} />
            )}
          </div>
        </aside>
      </main>
    </>
  );
}
