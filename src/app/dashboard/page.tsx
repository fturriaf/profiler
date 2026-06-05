import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { fetchOwnProfile } from "@/lib/profile/queries";
import { logoutAction } from "../login/actions";
import { togglePublishAction } from "./actions";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const profile = await fetchOwnProfile(supabase, user.id);
  if (!profile) redirect("/claim");

  const sectionCount = profile.sections.length;
  const itemCount = profile.sections.reduce((n, s) => n + s.items.length, 0);

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-6 py-16">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <form action={logoutAction}>
          <button
            type="submit"
            className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-50"
          >
            Log out
          </button>
        </form>
      </header>

      <p className="mt-6 text-sm text-zinc-600">
        Signed in as <span className="font-medium">{user.email}</span>.
      </p>

      <section className="mt-10 rounded-lg border border-zinc-200 p-5">
        <div className="flex items-baseline justify-between">
          <div>
            <h2 className="text-lg font-medium">{profile.display_name}</h2>
            <p className="text-sm text-zinc-500">@{profile.username}</p>
          </div>
          <span
            className={`rounded-full px-2 py-0.5 text-xs ${
              profile.published
                ? "bg-emerald-100 text-emerald-700"
                : "bg-zinc-100 text-zinc-600"
            }`}
          >
            {profile.published ? "Published" : "Draft"}
          </span>
        </div>

        <p className="mt-3 text-sm text-zinc-600">
          {sectionCount} section{sectionCount === 1 ? "" : "s"} · {itemCount}{" "}
          item{itemCount === 1 ? "" : "s"}
        </p>

        <div className="mt-4 flex flex-wrap gap-2 text-sm">
          <Link
            href="/edit"
            className="rounded-md bg-zinc-900 px-3 py-1.5 text-white hover:bg-zinc-800"
          >
            Edit profile
          </Link>
          <Link
            href={`/u/${profile.username}`}
            className="rounded-md border border-zinc-300 px-3 py-1.5 hover:bg-zinc-50"
          >
            View public page
          </Link>
          <form action={togglePublishAction}>
            <input
              type="hidden"
              name="publish"
              value={profile.published ? "false" : "true"}
            />
            <button
              type="submit"
              className="rounded-md border border-zinc-300 px-3 py-1.5 hover:bg-zinc-50"
            >
              {profile.published ? "Unpublish" : "Publish"}
            </button>
          </form>
        </div>

        {!profile.published && (
          <p className="mt-4 text-xs text-zinc-500">
            Your profile is a draft and only visible to you. Publish when ready.
          </p>
        )}
      </section>
    </main>
  );
}
