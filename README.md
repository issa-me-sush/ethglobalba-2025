# Banger Arenas – CDP + Base Sepolia Demo

This repo started from the [`@coinbase/create-cdp-app`](https://coinbase.github.io/cdp-web/modules/_coinbase_create-cdp-app.html) Next.js template and has been extended into **Banger Arenas**:

> Turn hot tweets into YES/NO markets backed by a pari‑mutuel pool on Base Sepolia, with CDP Embedded Wallets for sign‑in and on‑chain flows.

There are two main pieces:

- A **Next.js app** in `src/` – UI, CDP wallet, arenas feed, bet/claim, “My bets” view.
- A **Node worker** in `worker/` – tweet discovery (twitterapi.io), arena creation + resolution, and DB maintenance.

---

## 1. Project Structure

Top‑level:

```text
/                 # Next.js app + CDP integration
  src/
    app/
      api/
        arenas/              # Arena list + detail (Supabase-backed)
        onramp/buy-*/        # CDP Onramp helpers
      globals.css            # Tailwind + neo‑brutalist theme
      layout.tsx             # Root layout (fonts, body)
      page.tsx               # Home → wrapped ClientApp
    components/
      ClientApp.tsx          # CDP init + signed-in vs signed-out
      Header.tsx             # Navbar (title → home, address, USDC balance)
      SignedInScreen.tsx     # Main signed-in layout (Arenas / My bets tabs)
      SignInScreen.tsx       # CDP Auth screen
      ArenasFeed.tsx         # Tweet-style arena cards
      MyBets.tsx             # On-chain scan of arenas you’ve bet on
      ArenaDetail.tsx        # Single arena view + bet panel
      ArenaBetPanel.tsx      # Approve / Bet YES / Bet NO / Claim
      FundWallet.tsx         # CDP Onramp example
      UserBalance.tsx        # Base + Base Sepolia balances
      TweetCard.tsx          # X-style tweet UI
      ...
    lib/
      contract/bangerArenas.ts  # Frontend ABI + addresses + types
      cdp-auth.ts               # CDP server auth helpers
      erc20.ts                  # Minimal ERC20 ABI (approve + balanceOf)
      arenas/*                  # Types + mock data (legacy)

  worker/                    # Node worker for discovery + resolution
    src/
      index.ts               # Entrypoint, schedules discovery + resolution
      config.ts              # Loads env (Supabase, APP_MODE, RPC, keys)
      supabase.ts            # Supabase client
      twitter.ts             # twitterapi.io advanced_search
      jobs/
        discovery.ts         # Find tweets → insert arenas
        resolution.ts        # Resolve arenas via likes vs BangerLine
      contract/bangerArenas.ts # Worker ABI + viem clients (public + oracle)
      initSupabaseSchema.ts  # One-time Postgres schema init
      tools/
        clearArenasAll.ts    # Danger: wipe arenas + bets + metrics
        clearArenasLowLikes.ts # Delete low-like arenas for cleanup
```

---

## 2. Environment Setup

### 2.1 Root `.env.local` (Next.js app)

Create `.env.local` in the project root (same directory as `package.json`):

```env
# === CDP / Embedded Wallets ===
NEXT_PUBLIC_CDP_PROJECT_ID=your-cdp-project-id
NEXT_PUBLIC_CDP_CREATE_ETHEREUM_ACCOUNT_TYPE=eoa
NEXT_PUBLIC_CDP_CREATE_SOLANA_ACCOUNT=false

# === CDP Onramp server-side credentials (for /api/onramp/*) ===
CDP_API_KEY_ID=your-cdp-api-key-id
CDP_API_KEY_SECRET=your-cdp-api-key-secret

# === Banger Arenas contract (frontend) ===
NEXT_PUBLIC_BANGER_ARENAS_ADDRESS=0xYourBangerArenasOnBaseSepolia
NEXT_PUBLIC_STAKE_TOKEN_ADDRESS=0xYourErc20StakeTokenOnBaseSepolia  # USDC-style 6 decimals
NEXT_PUBLIC_RPC_URL_BASE_SEPOLIA=https://base-sepolia.your-node-provider.io

# === Supabase (used in Next.js API routes) ===
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

> `SUPABASE_SERVICE_ROLE_KEY` is server-only; it is only used in API route handlers (never shipped to the browser).

### 2.2 Worker `.env` (Node worker in `worker/`)

Create `worker/.env`:

```env
# === Supabase ===
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
# Session pooler connection string (Node.js) from Supabase dashboard
SUPABASE_DB_URL=postgresql://postgres.<pooler-user>:password@aws-0-<project-ref>.pooler.supabase.com:6543/postgres

# === twitterapi.io ===
TWITTER_API_IO_KEY=your-twitterapi-io-key
TWITTER_API_IO_BASE_URL=https://api.twitterapi.io

# === Chain / contract for worker oracle ===
RPC_URL_BASE_SEPOLIA=https://base-sepolia.your-node-provider.io
BANGER_ARENAS_ADDRESS=0xYourBangerArenasOnBaseSepolia
ORACLE_PRIVATE_KEY=0xYourOraclePrivateKey   # same address set as oracle in the contract

# === Mode: demo vs prod ===
APP_MODE=demo   # or "prod"

# === Optional: override tick intervals (applies in both modes when set) ===
# DISCOVERY_INTERVAL_MS=180000    # default 3 minutes when unset
# RESOLUTION_INTERVAL_MS=60000    # default: 1min in demo, 20min in prod when unset

# === Optional: LLM labeling ===
# OPENAI_API_KEY=sk-...
```

---

## 3. Database Schema & Init

The worker manages the Supabase schema via `initSupabaseSchema.ts`. It creates:

- `users` – wallet addresses (future use).
- `arenas` – one row per tweet/arena:
  - `arena_index` (bigserial) – numeric ID used as `arenaId` on-chain.
  - `tweet_id`, `tweet_url`, `tweet_author_handle`
  - `tweet_created_at`, `arena_created_at`
  - `resolve_deadline`, `bet_cutoff_at`
  - `likes_0` (likes at discovery)
  - `banger_line`
  - `status` (`active | locked | resolved`)
  - `outcome` (`yes | no | null`)
  - `category` etc.
- `bets` – mirror of on-chain events (future use for analytics).
- `tweet_metrics_log` – optional metrics time series (not used yet).

To initialize the DB:

```bash
cd worker
npm install
npm run init-db
```

This uses `SUPABASE_DB_URL` to run DDL against Supabase Postgres.

---

## 4. Running the App

### 4.1 Start the worker (discovery + resolution)

```bash
cd worker
npm install         # first time

# Start the periodic worker
npm run dev
```

This will:

- Run **discovery** (`runDiscoveryTick`) every `DISCOVERY_INTERVAL_MS` (or 3 min by default).
- Run **resolution** (`runResolutionTick`) every `RESOLUTION_INTERVAL_MS` (or:
  - 1 min in `APP_MODE=demo`
  - 20 min in `APP_MODE=prod`)

Logs are namespaced like `[discovery]`, `[resolution]`, `[worker]`, `[MyBets]`, `[ArenaBetPanel]`, etc.

### 4.2 Start the Next.js app

From the project root:

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`:

- Sign in via CDP (email/OTP, SMS, or OAuth).
- Home page shows:
  - Left: **Arenas** feed or **My bets** tab.
  - Right: wallet panel (X link, Base / Base Sepolia balances, onramp, test transaction).

---

## 5. Demo vs Prod Behavior (`APP_MODE`)

### 5.1 Discovery (same in both modes)

The worker uses **twitterapi.io** advanced search:

- Query: `lang:en -is:retweet min_faves:200`
- Age window: `2 ≤ age_minutes ≤ 240` (2 minutes to 4 hours).
It scores candidates with a **multi-metric engagement score**:

```ts
// worker/src/jobs/discovery.ts
// Simplified: likes / retweets / replies per minute + engagement per view + quotes.
const score = computeBangerScore({
  likes,
  retweets,
  replies,
  views,
  quotes,
  ageMinutes,
});
```

The top N (20) tweets by this score become arenas if they don’t already exist in DB.

### 5.2 Banger line & score line (different thresholds per mode)

At discovery time we store both:

- `likes_0`: likes at discovery.
- `score_0`: engagement score at discovery.

#### Demo (`APP_MODE=demo`)

- **Banger line (likes only, demo‑friendly):**

```ts
// Demo: tweet only needs 3 extra likes from discovery to count as a YES
BangerLine_demo = likes_0 + 3;
```

This is what you show in the demo: “Will this tweet get **3 more likes** from when we created the arena before the short demo window ends?”

#### Prod (`APP_MODE=prod`)

- **Engagement‑based Banger line (prod):**

```ts
// Likes barrier for UX (still stored as banger_line)
BangerLine_prod = Math.max(2 * likes_0, 500);

// Engagement score barrier (used for resolution in prod)
// Require ~50%+ increase over the initial engagement score, with a minimum floor:
ScoreLine_prod = max(1.5 * score_0, 10);
```

So the “banger” condition in prod is:

- Tweet must roughly **double likes** and be at least **500 likes** *and*
- Its **engagement score** must meaningfully increase vs. where it was when the arena was created.

### 5.3 Time windows per arena

Per arena we store:

- `resolve_deadline`
- `bet_cutoff_at`

**Prod (`APP_MODE=prod`)**

- Resolve deadline: `tweet_created_at + 12h`.
- Bet window: bets allowed for first 2 hours.
- Lock buffer: last 1 hour locked (no new bets).

**Demo (`APP_MODE=demo`)**

- Resolve deadline: `tweet_created_at + 5 minutes`.
- Bet window: bets allowed for first 3 minutes.
- Lock buffer: last 1 minute locked.

### 5.4 Resolution logic (demo vs prod)

Every resolution tick, the worker loads all arenas that:

- Are `status in ('active','locked')`, and
- Have `first_demo_bet_at` set (i.e., someone has actually bet on them).

Then:

```ts
// worker/src/jobs/resolution.ts
const metrics = await fetchTweetMetrics(config, arena.tweet_id); // TODO: real twitterapi.io metrics
const now = new Date();

if (config.appMode === "demo") {
  // Simple demo rule: likes-only bump from discovery
  const likesNow = metrics.likes;
  if (likesNow >= arena.banger_line) outcome = "yes";
  else if (now >= resolveDeadline) outcome = "no";
} else {
  // Prod: engagement-score-based resolution when we have a score_line
  const ageMinutes = (now.getTime() - new Date(arena.tweet_created_at).getTime()) / (60 * 1000);

  const scoreNow = computeBangerScore({
    likes: metrics.likes,
    retweets: metrics.retweets,
    replies: metrics.replies,
    views: metrics.views,
    quotes: metrics.quotes,
    ageMinutes,
  });

  if (arena.score_line != null) {
    if (scoreNow >= arena.score_line) outcome = "yes";
    else if (now >= resolveDeadline) outcome = "no";
  } else {
    // Safety fallback: likes-based check if score_line wasn't stored
    if (metrics.likes >= arena.banger_line) outcome = "yes";
    else if (now >= resolveDeadline) outcome = "no";
  }
}

if (outcome != null) {
  await resolveArenaOnChain(config, arena.arena_index, outcome === "yes");
  await db.from("arenas").update({ status: "resolved", outcome }).eq("id", arena.id);
}
```

In practice:

- **Demo**: outcome is **likes bump only** (very easy to explain on stage).
- **Prod**: outcome is **engagement score vs `score_0`** with a clear formula, but still has a likes‑based fallback so nothing breaks if metrics aren’t wired yet.

---

## 6. Frontend UX Overview

- **Header (`Header.tsx`)**
  - Clickable app name → `/`.
  - Shows shortened CDP wallet address with copy button.
  - Shows USDC balance (stake token) on Base Sepolia using:
    - `NEXT_PUBLIC_STAKE_TOKEN_ADDRESS`
    - `NEXT_PUBLIC_RPC_URL_BASE_SEPOLIA`

- **Home (signed-in) (`SignedInScreen.tsx`)**
  - Tabs:
    - **Arenas**: `ArenasFeed` – tweet-style cards linking to `/arenas/[id]`.
    - **My bets**: `MyBets` – scans recent arenas on-chain (`getUserStake`) for the signed-in address.
  - Sidebar:
    - “Link your X account” (OAuth).
    - “Base mainnet balance”.
    - “Fund your wallet on Base” (Onramp).
    - “Base Sepolia testnet” balance.
    - “Send a test transaction” (EOA transfer on Base Sepolia).

- **Arena detail (`/arenas/[id]`)**
  - Same header as home.
  - Tweet card for that arena.
  - Arena details (deadlines, outcome).
  - `ArenaBetPanel`:
    - Shows your wallet address.
    - Shows your YES/NO stake & claimed status (via `getUserStake`).
    - Approve stake token, Bet YES/NO, Claim payout.

---

## 7. Maintenance Scripts (Reset / Prune Arenas)

From `worker/`:

```bash
# Wipe ALL arenas + bets + metrics (danger)
npm run clear-arenas-all

# Delete only low-like arenas (likes_0 < threshold)
npm run clear-arenas-low              # default threshold = 100
ARENA_CLEAR_LIKES_THRESHOLD=500 npm run clear-arenas-low  # custom threshold
```

These scripts operate directly on Postgres via `SUPABASE_DB_URL`. They’re handy for:

- Resetting the demo environment.
- Pruning noisy arenas while keeping “real” ones.

---

## 8. Original CDP Template Links

For more details on the underlying CDP stack:

- [CDP Documentation](https://docs.cloud.coinbase.com/cdp/docs)
- [CDP React Documentation](https://docs.cloud.coinbase.com/cdp/docs/react-components)
- [CDP Portal](https://portal.cdp.coinbase.com)


