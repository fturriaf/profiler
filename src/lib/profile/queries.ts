import type { SupabaseClient } from "@supabase/supabase-js";
import type { ProfileFull } from "./types";

// Fetch a full profile (profile + sections + items) by username.
// Relies on RLS to hide unpublished profiles from non-owners.
export async function fetchProfileByUsername(
  supabase: SupabaseClient,
  username: string,
): Promise<ProfileFull | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select(
      `
      id, username, display_name, tagline, published, updated_at,
      sections (
        id, profile_id, title, kind, position,
        items ( id, section_id, position, content )
      )
    `,
    )
    .eq("username", username)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  // Sort sections + items by position (Supabase doesn't guarantee order on nested selects)
  const sections = (data.sections ?? [])
    .slice()
    .sort((a, b) => a.position - b.position)
    .map((s) => ({
      ...s,
      items: (s.items ?? []).slice().sort((a, b) => a.position - b.position),
    }));

  return { ...data, sections };
}

export async function fetchOwnProfile(
  supabase: SupabaseClient,
  userId: string,
): Promise<ProfileFull | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select(
      `
      id, username, display_name, tagline, published, updated_at,
      sections (
        id, profile_id, title, kind, position,
        items ( id, section_id, position, content )
      )
    `,
    )
    .eq("id", userId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const sections = (data.sections ?? [])
    .slice()
    .sort((a, b) => a.position - b.position)
    .map((s) => ({
      ...s,
      items: (s.items ?? []).slice().sort((a, b) => a.position - b.position),
    }));

  return { ...data, sections };
}
