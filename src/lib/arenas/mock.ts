import type { Arena } from "./types";

/**
 * Temporary in-memory mock arenas.
 *
 * These let us build the `/arenas` UI and API before wiring Supabase + worker.
 */
export const mockArenas: Arena[] = [
  {
    id: "arena-1",
    arenaIndex: 1,
    tweetId: "1870000000000000000",
    tweetUrl: "https://x.com/someuser/status/1870000000000000000",
    tweetAuthorHandle: "someuser",
    authorDisplayName: "Some User",
    tweetText: "This ETH Global weekend is about to go absolutely nuclear. Who's shipping the wildest onchain experiment?",
    tweetCreatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30m ago
    arenaCreatedAt: new Date().toISOString(),
    resolveDeadline: new Date(Date.now() + 11.5 * 60 * 60 * 1000).toISOString(),
    betCutoffAt: new Date(Date.now() + 90 * 60 * 1000).toISOString(),
    likes0: 120,
    bangerLine: Math.max(120 * 2, 200),
    status: "active",
    outcome: null,
    category: "meme",
  },
  {
    id: "arena-2",
    arenaIndex: 2,
    tweetId: "1870000000000000001",
    tweetUrl: "https://x.com/ai_builder/status/1870000000000000001",
    tweetAuthorHandle: "ai_builder",
    authorDisplayName: "AI Builder",
    tweetText: "Just wired an LLM directly into an onchain market. The model doesn't just predict vibes – it prices them.",
    tweetCreatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2h ago
    arenaCreatedAt: new Date().toISOString(),
    resolveDeadline: new Date(Date.now() + 10 * 60 * 60 * 1000).toISOString(),
    betCutoffAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    likes0: 300,
    bangerLine: Math.max(300 * 2, 200),
    status: "locked",
    outcome: null,
    category: "ai",
  },
  {
    id: "arena-3",
    arenaIndex: 3,
    tweetId: "1869000000000000000",
    tweetUrl: "https://x.com/crypto_degen/status/1869000000000000000",
    tweetAuthorHandle: "crypto_degen",
    authorDisplayName: "Crypto Degen",
    tweetText: "If your bags aren't on Base by now, are you even trying to make it?",
    tweetCreatedAt: new Date(Date.now() - 13 * 60 * 60 * 1000).toISOString(), // 13h ago
    arenaCreatedAt: new Date(Date.now() - 12.5 * 60 * 60 * 1000).toISOString(),
    resolveDeadline: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    betCutoffAt: new Date(Date.now() - 11.5 * 60 * 60 * 1000).toISOString(),
    likes0: 600,
    bangerLine: Math.max(600 * 2, 200),
    status: "resolved",
    outcome: "yes",
    category: "crypto",
  },
];

export function getMockArenaById(id: string): Arena | undefined {
  return mockArenas.find(arena => arena.id === id);
}


