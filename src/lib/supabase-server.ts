import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL) {
  // eslint-disable-next-line no-console
  console.error("SUPABASE_URL is not set in env");
}

if (!SUPABASE_SERVICE_ROLE_KEY) {
  // eslint-disable-next-line no-console
  console.error("SUPABASE_SERVICE_ROLE_KEY is not set in env");
}

export const supabaseServer = createClient(SUPABASE_URL ?? "", SUPABASE_SERVICE_ROLE_KEY ?? "");


