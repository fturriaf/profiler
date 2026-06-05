import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Server-only client that uses the service-role key.
// NEVER import this from a client component or expose it in the browser bundle.
// Required for privileged operations like `auth.admin.deleteUser`.
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error(
      "Missing SUPABASE_SERVICE_ROLE_KEY (or NEXT_PUBLIC_SUPABASE_URL). " +
        "Set it in .env.local locally and in your Vercel project env vars.",
    );
  }
  return createSupabaseClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
