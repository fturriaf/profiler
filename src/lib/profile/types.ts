export type SectionKind =
  | "bullets"
  | "paragraphs"
  | "links"
  | "key_value"
  | "work";

export type Profile = {
  id: string;
  username: string;
  display_name: string;
  tagline: string;
  published: boolean;
  updated_at: string;
};

export type Section = {
  id: string;
  profile_id: string;
  title: string;
  kind: SectionKind;
  position: number;
};

// Content shape per kind. All items carry an `id` + `position`; `content` JSON
// varies by section kind.
export type BulletContent = { text: string };
export type ParagraphContent = { text: string };
export type LinkContent = { label: string; url: string; note?: string };
export type KeyValueContent = { key: string; value: string };
export type WorkContent = {
  employer: string;
  employer_url?: string;
  years: string;
  role: string;
  note?: string;
};

export type ItemContent =
  | BulletContent
  | ParagraphContent
  | LinkContent
  | KeyValueContent
  | WorkContent;

export type Item = {
  id: string;
  section_id: string;
  position: number;
  content: ItemContent;
};

export type SectionWithItems = Section & { items: Item[] };

export type ProfileFull = Profile & { sections: SectionWithItems[] };

export const SECTION_KIND_LABELS: Record<SectionKind, string> = {
  bullets: "Bulleted list",
  paragraphs: "Paragraphs",
  links: "Links",
  key_value: "Key / value",
  work: "Work history",
};
