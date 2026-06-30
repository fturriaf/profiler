import type { SupabaseClient } from "@supabase/supabase-js";
import type { ItemContent, SectionKind } from "./types";

// Pre-populated starter template inserted on first claim. Mirrors a typical
// professional profile shape (Recently / Work history / Links / Background)
// with anonymized, obviously-editable example content so a brand-new user
// has something to react to instead of an empty page.
type StarterSection = {
  title: string;
  kind: SectionKind;
  items: { content: ItemContent }[];
};

const STARTER_SECTIONS: StarterSection[] = [
  {
    title: "Recently",
    kind: "bullets",
    items: [
      {
        content: {
          text: "Hello! This profile was set up with example content — edit, reorder, or delete any item to make it your own.",
        },
      },
      {
        content: { text: "Working on something I'll share here once it's ready." },
      },
      { content: { text: "Open to interesting conversations." } },
    ],
  },
  {
    title: "Work history",
    kind: "work",
    items: [
      {
        content: {
          employer: "Acme Inc.",
          employer_url: "https://example.com",
          years: "2022–present",
          role: "Senior Engineer",
          note: "Building the team's developer experience platform.",
        },
      },
      {
        content: {
          employer: "Globex Corp.",
          years: "2018–2022",
          role: "Engineer",
        },
      },
      {
        content: {
          employer: "Initech",
          years: "2015–2018",
          role: "Junior Engineer",
        },
      },
    ],
  },
  {
    title: "Links",
    kind: "links",
    items: [
      {
        content: {
          label: "Email",
          url: "mailto:you@example.com",
          note: "best way to reach me",
        },
      },
      {
        content: {
          label: "LinkedIn",
          url: "https://linkedin.com/in/jane-doe",
        },
      },
    ],
  },
  {
    title: "Background",
    kind: "key_value",
    items: [
      { content: { key: "Lives in", value: "San Francisco" } },
      {
        content: { key: "Studied", value: "Computer Science, State University" },
      },
    ],
  },
];

// Best-effort: writes the starter sections + items for `profileId`. If
// anything fails partway, the user is still left with a valid (possibly
// partial) profile — the editor handles either. We do not want a flaky seed
// to block account creation.
export async function seedStarterContent(
  supabase: SupabaseClient,
  profileId: string,
): Promise<void> {
  for (let i = 0; i < STARTER_SECTIONS.length; i++) {
    const s = STARTER_SECTIONS[i];
    const { data: section, error: secErr } = await supabase
      .from("sections")
      .insert({
        profile_id: profileId,
        title: s.title,
        kind: s.kind,
        position: i,
      })
      .select("id")
      .single();
    if (secErr || !section) continue;

    const itemRows = s.items.map((it, j) => ({
      section_id: section.id,
      position: j,
      content: it.content,
    }));
    await supabase.from("items").insert(itemRows);
  }
}
