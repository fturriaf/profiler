import type { ProfileFull } from "@/lib/profile/types";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import { SectionRenderer } from "./SectionRenderer";

export function ProfileView({ profile }: { profile: ProfileFull }) {
  return (
    <article className="mx-auto w-full max-w-2xl px-6 py-16 text-[15px] leading-relaxed text-zinc-800">
      <header className="border-b border-zinc-200 pb-6">
        <h1 className="text-[2rem] font-semibold tracking-tight text-zinc-900">
          {profile.display_name || profile.username}
        </h1>
        {profile.tagline && (
          <p className="mt-1.5 text-zinc-500">{profile.tagline}</p>
        )}
      </header>

      {profile.sections.length === 0 ? (
        <p className="mt-8 text-sm text-zinc-500">
          This profile is empty so far.
        </p>
      ) : (
        profile.sections.map((s) => <SectionRenderer key={s.id} section={s} />)
      )}

      <footer className="mt-16 border-t border-zinc-100 pt-4 text-xs text-zinc-400">
        Made with{" "}
        <a
          href={SITE_URL}
          className="underline decoration-zinc-300 underline-offset-2 hover:text-zinc-600"
        >
          {SITE_NAME}
        </a>
        {" · "}
        <a
          href={`${SITE_URL}/signup`}
          className="underline decoration-zinc-300 underline-offset-2 hover:text-zinc-600"
        >
          make your own
        </a>
      </footer>
    </article>
  );
}
