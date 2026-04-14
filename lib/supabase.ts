import { createBrowserClient } from "@supabase/ssr";

/**
 * Default Supabase browser client.
 * Used by dashboard, log, and other client pages that import from "../../lib/supabase".
 */
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
