"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { ItemContent, SectionKind } from "@/lib/profile/types";

export type EditorItem = {
  // Server-assigned UUID, undefined for items created in the editor
  id?: string;
  content: ItemContent;
};

export type EditorSection = {
  id?: string;
  title: string;
  kind: SectionKind;
  items: EditorItem[];
};

export type EditorState = {
  display_name: string;
  tagline: string;
  sections: EditorSection[];
};

export type SaveResult =
  | { ok: true }
  | { ok: false; error: string };

// Persist the editor's working copy.
// Strategy: diff by id — delete what's no longer present, update existing,
// insert new. Position is taken from array index. RLS guarantees we can only
// touch rows tied to the caller's profile.
export async function saveProfileAction(
  state: EditorState,
): Promise<SaveResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // 1. Profile fields
  {
    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: state.display_name.trim().slice(0, 100),
        tagline: state.tagline.trim().slice(0, 200),
      })
      .eq("id", user.id);
    if (error) return { ok: false, error: error.message };
  }

  // 2. Section diff
  const { data: existingSections, error: secErr } = await supabase
    .from("sections")
    .select("id")
    .eq("profile_id", user.id);
  if (secErr) return { ok: false, error: secErr.message };

  const existingSectionIds = new Set(
    (existingSections ?? []).map((s) => s.id as string),
  );
  const keptSectionIds = new Set(
    state.sections.map((s) => s.id).filter(Boolean) as string[],
  );

  const toDelete = [...existingSectionIds].filter(
    (id) => !keptSectionIds.has(id),
  );
  if (toDelete.length > 0) {
    const { error } = await supabase
      .from("sections")
      .delete()
      .in("id", toDelete);
    if (error) return { ok: false, error: error.message };
  }

  // 3. Walk sections in order; update or insert; then diff items per section
  for (let i = 0; i < state.sections.length; i++) {
    const s = state.sections[i];
    const sectionPayload = {
      title: s.title.trim().slice(0, 100) || "Untitled",
      kind: s.kind,
      position: i,
    };

    let sectionId: string;
    if (s.id) {
      const { error } = await supabase
        .from("sections")
        .update(sectionPayload)
        .eq("id", s.id);
      if (error) return { ok: false, error: error.message };
      sectionId = s.id;
    } else {
      const { data, error } = await supabase
        .from("sections")
        .insert({ ...sectionPayload, profile_id: user.id })
        .select("id")
        .single();
      if (error || !data) {
        return { ok: false, error: error?.message ?? "insert failed" };
      }
      sectionId = data.id as string;
    }

    // Items diff (scoped to this section)
    const { data: existingItems, error: itErr } = await supabase
      .from("items")
      .select("id")
      .eq("section_id", sectionId);
    if (itErr) return { ok: false, error: itErr.message };

    const existingItemIds = new Set(
      (existingItems ?? []).map((it) => it.id as string),
    );
    const keptItemIds = new Set(
      s.items.map((it) => it.id).filter(Boolean) as string[],
    );
    const itemsToDelete = [...existingItemIds].filter(
      (id) => !keptItemIds.has(id),
    );
    if (itemsToDelete.length > 0) {
      const { error } = await supabase
        .from("items")
        .delete()
        .in("id", itemsToDelete);
      if (error) return { ok: false, error: error.message };
    }

    for (let j = 0; j < s.items.length; j++) {
      const it = s.items[j];
      const itemPayload = { position: j, content: it.content };
      if (it.id) {
        const { error } = await supabase
          .from("items")
          .update(itemPayload)
          .eq("id", it.id);
        if (error) return { ok: false, error: error.message };
      } else {
        const { error } = await supabase
          .from("items")
          .insert({ ...itemPayload, section_id: sectionId });
        if (error) return { ok: false, error: error.message };
      }
    }
  }

  revalidatePath("/dashboard");
  revalidatePath("/edit");
  return { ok: true };
}
