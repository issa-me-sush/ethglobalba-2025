import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { Config } from "./config";

export type Db = SupabaseClient;

export function createDbClient(config: Config): Db {
  return createClient(config.supabaseUrl, config.supabaseServiceKey);
}


