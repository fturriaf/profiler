import type {
  BulletContent,
  KeyValueContent,
  LinkContent,
  ParagraphContent,
  SectionWithItems,
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
                <span>{c.text}</span>
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
            return <p key={it.id}>{c.text}</p>;
          })}
        </div>
      );
    case "links":
      return (
        <ul className="space-y-0.5">
          {section.items.map((it) => {
            const c = it.content as LinkContent;
            return (
              <li key={it.id}>
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
      return (
        <dl className="grid grid-cols-[max-content_1fr] gap-x-6 gap-y-0.5">
          {section.items.map((it) => {
            const c = it.content as KeyValueContent;
            return (
              <div key={it.id} className="contents">
                <dt className="text-zinc-500">{c.key}</dt>
                <dd>{c.value}</dd>
              </div>
            );
          })}
        </dl>
      );
  }
}
