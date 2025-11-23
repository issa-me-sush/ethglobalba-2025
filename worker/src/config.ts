export interface Config {
  supabaseUrl: string;
  supabaseServiceKey: string;
  twitterApiKey: string;
  twitterBaseUrl: string;
  openAiApiKey?: string;
  rpcUrlBaseSepolia: string;
  oraclePrivateKey: string;
  bangerArenasAddress: `0x${string}`;
  appMode: "demo" | "prod";
}

export function loadConfig(): Config {
  const {
    SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY,
    TWITTER_API_IO_KEY,
    TWITTER_API_IO_BASE_URL,
    OPENAI_API_KEY,
    RPC_URL_BASE_SEPOLIA,
    ORACLE_PRIVATE_KEY,
    BANGER_ARENAS_ADDRESS,
    APP_MODE,
  } = process.env;

  if (!SUPABASE_URL) throw new Error("SUPABASE_URL is not set");
  if (!SUPABASE_SERVICE_ROLE_KEY) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
  if (!TWITTER_API_IO_KEY) throw new Error("TWITTER_API_IO_KEY is not set");
  if (!RPC_URL_BASE_SEPOLIA) throw new Error("RPC_URL_BASE_SEPOLIA is not set");
  if (!ORACLE_PRIVATE_KEY) throw new Error("ORACLE_PRIVATE_KEY is not set");
  if (!BANGER_ARENAS_ADDRESS) throw new Error("BANGER_ARENAS_ADDRESS is not set");

  const mode = (APP_MODE ?? "prod").toLowerCase();
  const appMode: "demo" | "prod" = mode === "demo" ? "demo" : "prod";

  return {
    supabaseUrl: SUPABASE_URL,
    supabaseServiceKey: SUPABASE_SERVICE_ROLE_KEY,
    twitterApiKey: TWITTER_API_IO_KEY,
    twitterBaseUrl: TWITTER_API_IO_BASE_URL ?? "https://api.twitterapi.io",
    openAiApiKey: OPENAI_API_KEY,
    rpcUrlBaseSepolia: RPC_URL_BASE_SEPOLIA,
    oraclePrivateKey: ORACLE_PRIVATE_KEY,
    bangerArenasAddress: BANGER_ARENAS_ADDRESS as `0x${string}`,
    appMode,
  };
}

