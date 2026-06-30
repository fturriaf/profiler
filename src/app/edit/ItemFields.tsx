"use client";

import type {
  BulletContent,
  ItemContent,
  KeyValueContent,
  LinkContent,
  ParagraphContent,
  SectionKind,
  WorkContent,
} from "@/lib/profile/types";

const inputCls =
  "w-full rounded-md border border-zinc-300 px-2 py-1 text-sm focus:border-zinc-500 focus:outline-none";

export function ItemFields({
  kind,
  content,
  onChange,
}: {
  kind: SectionKind;
  content: ItemContent;
  onChange: (next: ItemContent) => void;
}) {
  switch (kind) {
    case "bullets": {
      const c = content as BulletContent;
      return (
        <input
          className={inputCls}
          value={c.text}
          placeholder="Item text"
          onChange={(e) => onChange({ text: e.target.value })}
        />
      );
    }
    case "paragraphs": {
      const c = content as ParagraphContent;
      return (
        <textarea
          className={`${inputCls} min-h-16`}
          value={c.text}
          placeholder="Paragraph text"
          onChange={(e) => onChange({ text: e.target.value })}
        />
      );
    }
    case "links": {
      const c = content as LinkContent;
      return (
        <div className="grid grid-cols-2 gap-2">
          <input
            className={inputCls}
            value={c.label}
            placeholder="Label"
            onChange={(e) => onChange({ ...c, label: e.target.value })}
          />
          <input
            className={inputCls}
            value={c.url}
            placeholder="https://…"
            onChange={(e) => onChange({ ...c, url: e.target.value })}
          />
          <input
            className={`${inputCls} col-span-2`}
            value={c.note ?? ""}
            placeholder="Note (optional)"
            onChange={(e) => onChange({ ...c, note: e.target.value })}
          />
        </div>
      );
    }
    case "key_value": {
      const c = content as KeyValueContent;
      return (
        <div className="grid grid-cols-[max-content_1fr] gap-2">
          <input
            className={inputCls}
            value={c.key}
            placeholder="Key"
            onChange={(e) => onChange({ ...c, key: e.target.value })}
          />
          <input
            className={inputCls}
            value={c.value}
            placeholder="Value"
            onChange={(e) => onChange({ ...c, value: e.target.value })}
          />
        </div>
      );
    }
    case "work": {
      const c = content as WorkContent;
      return (
        <div className="grid grid-cols-2 gap-2">
          <input
            className={inputCls}
            value={c.employer}
            placeholder="Employer"
            onChange={(e) => onChange({ ...c, employer: e.target.value })}
          />
          <input
            className={inputCls}
            value={c.employer_url ?? ""}
            placeholder="Employer URL (optional)"
            onChange={(e) => onChange({ ...c, employer_url: e.target.value })}
          />
          <input
            className={inputCls}
            value={c.years}
            placeholder="Years (e.g. 2018–2022)"
            onChange={(e) => onChange({ ...c, years: e.target.value })}
          />
          <input
            className={inputCls}
            value={c.role}
            placeholder="Role / position"
            onChange={(e) => onChange({ ...c, role: e.target.value })}
          />
          <input
            className={`${inputCls} col-span-2`}
            value={c.note ?? ""}
            placeholder="Note (optional, shown under role in lighter font)"
            onChange={(e) => onChange({ ...c, note: e.target.value })}
          />
        </div>
      );
    }
  }
}

export function blankContent(kind: SectionKind): ItemContent {
  switch (kind) {
    case "bullets":
    case "paragraphs":
      return { text: "" };
    case "links":
      return { label: "", url: "" };
    case "key_value":
      return { key: "", value: "" };
    case "work":
      return { employer: "", years: "", role: "" };
  }
}
