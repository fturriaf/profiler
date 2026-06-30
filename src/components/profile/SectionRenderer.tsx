import type {
  BulletContent,
  KeyValueContent,
  LinkContent,
  ParagraphContent,
  SectionWithItems,
  WorkContent,
} from "@/lib/profile/types";

export function SectionRenderer({ section }: { section: SectionWithItems }) {
  if (section.items.length === 0) return null;

  return (
    <section className="mt-8">
      <h2 className="text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-500">
        {section.title}
      </h2>
      <div className="mt-2">{renderBody(section)}</div>
    </section>
  );
}

function renderBody(section: SectionWithItems) {
  switch (section.kind) {
    case "bullets":
      return (
        <ul className="space-y-0.5">
          {section.items.map((it) => {
            const c = it.content as BulletContent;
            return (
              <li key={it.id} className="flex gap-2">
                <span aria-hidden className="text-zinc-400">·</span>
                <span className="break-words">{c.text}</span>
              </li>
            );
          })}
        </ul>
      );
    case "paragraphs":
      return (
        <div className="space-y-3">
          {section.items.map((it) => {
            const c = it.content as ParagraphContent;
            return (
              <p key={it.id} className="break-words">
                {c.text}
              </p>
            );
          })}
        </div>
      );
    case "links":
      return (
        <ul className="space-y-0.5">
          {section.items.map((it) => {
            const c = it.content as LinkContent;
            return (
              <li key={it.id} className="break-words">
                <a
                  href={c.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline decoration-zinc-300 underline-offset-2 hover:decoration-zinc-900"
                >
                  {c.label || c.url}
                </a>
                {c.note ? (
                  <span className="text-zinc-500"> — {c.note}</span>
                ) : null}
              </li>
            );
          })}
        </ul>
      );
    case "key_value":
      // Mobile: each item is a stacked block (key above value).
      // ≥ sm: switch to a 2-column grid using `display: contents` on the
      // per-item wrapper so children flow into the parent grid.
      return (
        <div className="flex flex-col gap-2 sm:grid sm:grid-cols-[max-content_1fr] sm:gap-x-6 sm:gap-y-0.5">
          {section.items.map((it) => {
            const c = it.content as KeyValueContent;
            return (
              <div key={it.id} className="sm:contents">
                <div className="text-zinc-500">{c.key}</div>
                <div className="break-words">{c.value}</div>
              </div>
            );
          })}
        </div>
      );
    case "work":
      // Mobile: each position is a stacked card (employer / years / role / note).
      // ≥ sm: 3-column grid for desktop hierarchy.
      return (
        <div className="flex flex-col gap-4 sm:grid sm:grid-cols-[max-content_max-content_1fr] sm:gap-x-6 sm:gap-y-3">
          {section.items.map((it) => {
            const c = it.content as WorkContent;
            return (
              <div key={it.id} className="sm:contents">
                <div className="font-medium text-zinc-900 break-words sm:font-normal">
                  {c.employer_url ? (
                    <a
                      href={c.employer_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline decoration-zinc-300 underline-offset-2 hover:decoration-zinc-900"
                    >
                      {c.employer}
                    </a>
                  ) : (
                    c.employer
                  )}
                </div>
                <div className="text-sm text-zinc-500 sm:text-[15px]">
                  {c.years}
                </div>
                <div className="break-words">
                  <div>{c.role}</div>
                  {c.note ? (
                    <div className="mt-0.5 text-sm italic text-zinc-500">
                      {c.note}
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      );
  }
}
