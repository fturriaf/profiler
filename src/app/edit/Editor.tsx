"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { ProfileView } from "@/components/profile/ProfileView";
import {
  SECTION_KIND_LABELS,
  type ProfileFull,
  type SectionKind,
} from "@/lib/profile/types";
import { saveProfileAction, type EditorSection, type EditorState } from "./actions";
import { ItemFields, blankContent } from "./ItemFields";

// Local-only section/item shape: like EditorSection but with a stable clientId
// so React keys stay consistent before the server assigns a UUID.
type LocalItem = {
  clientId: string;
  id?: string;
  content: ReturnType<typeof blankContent>;
};
type LocalSection = {
  clientId: string;
  id?: string;
  title: string;
  kind: SectionKind;
  items: LocalItem[];
};
type LocalState = {
  display_name: string;
  tagline: string;
  sections: LocalSection[];
};

let cid = 0;
const nextCid = () => `c${++cid}`;

function fromProfile(profile: ProfileFull): LocalState {
  return {
    display_name: profile.display_name,
    tagline: profile.tagline,
    sections: profile.sections.map((s) => ({
      clientId: nextCid(),
      id: s.id,
      title: s.title,
      kind: s.kind,
      items: s.items.map((it) => ({
        clientId: nextCid(),
        id: it.id,
        content: it.content,
      })),
    })),
  };
}

function toEditorState(state: LocalState): EditorState {
  return {
    display_name: state.display_name,
    tagline: state.tagline,
    sections: state.sections.map<EditorSection>((s) => ({
      id: s.id,
      title: s.title,
      kind: s.kind,
      items: s.items.map((it) => ({ id: it.id, content: it.content })),
    })),
  };
}

// Build a ProfileFull from local state for the preview pane.
function toPreviewProfile(
  base: ProfileFull,
  state: LocalState,
): ProfileFull {
  return {
    ...base,
    display_name: state.display_name,
    tagline: state.tagline,
    sections: state.sections.map((s, i) => ({
      id: s.id ?? s.clientId,
      profile_id: base.id,
      title: s.title,
      kind: s.kind,
      position: i,
      items: s.items.map((it, j) => ({
        id: it.id ?? it.clientId,
        section_id: s.id ?? s.clientId,
        position: j,
        content: it.content,
      })),
    })),
  };
}

export default function Editor({ profile }: { profile: ProfileFull }) {
  const initial = useMemo(() => fromProfile(profile), [profile]);
  const [state, setState] = useState<LocalState>(initial);
  const [savedSnapshot, setSavedSnapshot] = useState(
    JSON.stringify(toEditorState(initial)),
  );
  const [error, setError] = useState<string | null>(null);
  const [isSaving, startSave] = useTransition();

  const dirty =
    JSON.stringify(toEditorState(state)) !== savedSnapshot;

  function patchSection(idx: number, patch: Partial<LocalSection>) {
    setState((s) => ({
      ...s,
      sections: s.sections.map((sec, i) =>
        i === idx ? { ...sec, ...patch } : sec,
      ),
    }));
  }

  function addSection() {
    setState((s) => ({
      ...s,
      sections: [
        ...s.sections,
        {
          clientId: nextCid(),
          title: "New section",
          kind: "bullets",
          items: [],
        },
      ],
    }));
  }

  function removeSection(idx: number) {
    if (!confirm("Delete this section and its items?")) return;
    setState((s) => ({
      ...s,
      sections: s.sections.filter((_, i) => i !== idx),
    }));
  }

  function moveSection(idx: number, dir: -1 | 1) {
    setState((s) => {
      const next = s.sections.slice();
      const j = idx + dir;
      if (j < 0 || j >= next.length) return s;
      [next[idx], next[j]] = [next[j], next[idx]];
      return { ...s, sections: next };
    });
  }

  function changeKind(idx: number, kind: SectionKind) {
    const sec = state.sections[idx];
    if (
      sec.kind !== kind &&
      sec.items.length > 0 &&
      !confirm(
        "Changing the section style will clear its current items. Continue?",
      )
    ) {
      return;
    }
    patchSection(idx, { kind, items: [] });
  }

  function addItem(secIdx: number) {
    const sec = state.sections[secIdx];
    patchSection(secIdx, {
      items: [
        ...sec.items,
        { clientId: nextCid(), content: blankContent(sec.kind) },
      ],
    });
  }

  function patchItem(
    secIdx: number,
    itemIdx: number,
    content: LocalItem["content"],
  ) {
    const sec = state.sections[secIdx];
    patchSection(secIdx, {
      items: sec.items.map((it, i) =>
        i === itemIdx ? { ...it, content } : it,
      ),
    });
  }

  function removeItem(secIdx: number, itemIdx: number) {
    const sec = state.sections[secIdx];
    patchSection(secIdx, {
      items: sec.items.filter((_, i) => i !== itemIdx),
    });
  }

  function moveItem(secIdx: number, itemIdx: number, dir: -1 | 1) {
    const sec = state.sections[secIdx];
    const next = sec.items.slice();
    const j = itemIdx + dir;
    if (j < 0 || j >= next.length) return;
    [next[itemIdx], next[j]] = [next[j], next[itemIdx]];
    patchSection(secIdx, { items: next });
  }

  function save() {
    setError(null);
    const payload = toEditorState(state);
    startSave(async () => {
      const result = await saveProfileAction(payload);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSavedSnapshot(JSON.stringify(payload));
    });
  }

  const previewProfile = toPreviewProfile(profile, state);

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-8 px-6 py-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      {/* Editor pane */}
      <div className="flex flex-col gap-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Edit profile
            </h1>
            <p className="text-sm text-zinc-500">
              <Link href="/dashboard" className="underline">
                ← back to dashboard
              </Link>
              {" · "}
              <Link href={`/u/${profile.username}`} className="underline">
                view public page
              </Link>
            </p>
          </div>
          <div className="flex items-center gap-3">
            {dirty && (
              <span className="text-xs text-amber-600">unsaved changes</span>
            )}
            <button
              type="button"
              onClick={save}
              disabled={!dirty || isSaving}
              className="rounded-md bg-zinc-900 px-4 py-2 text-sm text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSaving ? "Saving…" : "Save"}
            </button>
          </div>
        </header>

        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Profile basics */}
        <fieldset className="rounded-lg border border-zinc-200 p-4">
          <legend className="px-1 text-xs uppercase tracking-widest text-zinc-500">
            Profile
          </legend>
          <label className="flex flex-col gap-1 text-sm">
            Display name
            <input
              className="rounded-md border border-zinc-300 px-2 py-1"
              value={state.display_name}
              onChange={(e) =>
                setState({ ...state, display_name: e.target.value })
              }
            />
          </label>
          <label className="mt-3 flex flex-col gap-1 text-sm">
            Tagline
            <input
              className="rounded-md border border-zinc-300 px-2 py-1"
              value={state.tagline}
              onChange={(e) =>
                setState({ ...state, tagline: e.target.value })
              }
            />
          </label>
        </fieldset>

        {/* Sections */}
        <div className="flex flex-col gap-4">
          {state.sections.map((sec, i) => (
            <fieldset
              key={sec.clientId}
              className="rounded-lg border border-zinc-200 p-4"
            >
              <legend className="px-1 text-xs uppercase tracking-widest text-zinc-500">
                Section {i + 1}
              </legend>
              <div className="flex flex-wrap items-end gap-3">
                <label className="flex flex-1 flex-col gap-1 text-sm">
                  Title
                  <input
                    className="rounded-md border border-zinc-300 px-2 py-1"
                    value={sec.title}
                    onChange={(e) =>
                      patchSection(i, { title: e.target.value })
                    }
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm">
                  Style
                  <select
                    className="rounded-md border border-zinc-300 bg-white px-2 py-1"
                    value={sec.kind}
                    onChange={(e) =>
                      changeKind(i, e.target.value as SectionKind)
                    }
                  >
                    {(Object.keys(SECTION_KIND_LABELS) as SectionKind[]).map(
                      (k) => (
                        <option key={k} value={k}>
                          {SECTION_KIND_LABELS[k]}
                        </option>
                      ),
                    )}
                  </select>
                </label>
              </div>

              <ul className="mt-4 flex flex-col gap-2">
                {sec.items.map((it, j) => (
                  <li
                    key={it.clientId}
                    className="flex items-start gap-2 rounded-md border border-zinc-100 bg-zinc-50/50 p-2"
                  >
                    <div className="flex-1">
                      <ItemFields
                        kind={sec.kind}
                        content={it.content}
                        onChange={(c) => patchItem(i, j, c)}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <button
                        type="button"
                        onClick={() => moveItem(i, j, -1)}
                        disabled={j === 0}
                        className="rounded border border-zinc-200 px-1.5 text-xs text-zinc-600 hover:bg-zinc-100 disabled:opacity-30"
                        title="Move up"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        onClick={() => moveItem(i, j, 1)}
                        disabled={j === sec.items.length - 1}
                        className="rounded border border-zinc-200 px-1.5 text-xs text-zinc-600 hover:bg-zinc-100 disabled:opacity-30"
                        title="Move down"
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        onClick={() => removeItem(i, j)}
                        className="rounded border border-zinc-200 px-1.5 text-xs text-red-600 hover:bg-red-50"
                        title="Delete item"
                      >
                        ×
                      </button>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => addItem(i)}
                  className="rounded border border-zinc-300 px-2 py-1 hover:bg-zinc-50"
                >
                  + Add item
                </button>
                <button
                  type="button"
                  onClick={() => moveSection(i, -1)}
                  disabled={i === 0}
                  className="rounded border border-zinc-300 px-2 py-1 hover:bg-zinc-50 disabled:opacity-30"
                >
                  ↑ Move up
                </button>
                <button
                  type="button"
                  onClick={() => moveSection(i, 1)}
                  disabled={i === state.sections.length - 1}
                  className="rounded border border-zinc-300 px-2 py-1 hover:bg-zinc-50 disabled:opacity-30"
                >
                  ↓ Move down
                </button>
                <button
                  type="button"
                  onClick={() => removeSection(i)}
                  className="ml-auto rounded border border-red-200 px-2 py-1 text-red-600 hover:bg-red-50"
                >
                  Delete section
                </button>
              </div>
            </fieldset>
          ))}

          <button
            type="button"
            onClick={addSection}
            className="self-start rounded-md border border-dashed border-zinc-300 px-3 py-2 text-sm text-zinc-600 hover:bg-zinc-50"
          >
            + Add section
          </button>
        </div>
      </div>

      {/* Preview pane */}
      <aside className="lg:sticky lg:top-6 lg:self-start">
        <div className="rounded-lg border border-zinc-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-2">
            <span className="text-xs uppercase tracking-widest text-zinc-500">
              Preview
            </span>
            <span className="text-xs text-zinc-400">
              {profile.published ? "live" : "draft"}
            </span>
          </div>
          <div className="max-h-[calc(100vh-8rem)] overflow-auto">
            <ProfileView profile={previewProfile} />
          </div>
        </div>
      </aside>
    </div>
  );
}
