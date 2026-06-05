import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { fetchOwnProfile } from "@/lib/profile/queries";
import { logoutAction } from "../login/actions";
import {
  deleteAccountAction,
  togglePublishAction,
  updatePasswordAction,
  updateUsernameAction,
} from "./actions";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{
    usernameError?: string;
    usernameOk?: string;
    passwordError?: string;
    passwordOk?: string;
    deleteError?: string;
  }>;
}) {
  const {
    usernameError,
    usernameOk,
    passwordError,
    passwordOk,
    deleteError,
  } = await searchParams;

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
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-6 py-16">
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

      <p className="text-sm text-zinc-600">
        Signed in as <span className="font-medium">{user.email}</span>.
      </p>

      {/* Profile card */}
      <section className="rounded-lg border border-zinc-200 p-5">
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

      {/* Account management — collapsed by default; auto-opens if any of the
          nested actions left a flash message in the URL. */}
      <details
        className="group rounded-lg border border-zinc-200 [&_summary::-webkit-details-marker]:hidden"
        open={Boolean(
          usernameError ||
            usernameOk ||
            passwordError ||
            passwordOk ||
            deleteError,
        )}
      >
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-3 text-sm font-medium text-zinc-700 hover:bg-zinc-50">
          <span>Account management</span>
          <span
            aria-hidden
            className="text-zinc-400 transition-transform group-open:rotate-180"
          >
            ▾
          </span>
        </summary>

        <div className="flex flex-col gap-6 border-t border-zinc-100 px-5 pb-5 pt-5">
          {/* Change username */}
          <div>
            <h3 className="text-sm font-medium">Change username</h3>
            <p className="mt-1 text-xs text-zinc-500">
              Your public profile lives at{" "}
              <code className="rounded bg-zinc-100 px-1">
                /u/{profile.username}
              </code>
              . Changing your username changes that URL — any links to the old
              one will 404.
            </p>

            <form
              action={updateUsernameAction}
              className="mt-3 flex flex-wrap items-end gap-2"
            >
              <label className="flex flex-1 flex-col gap-1 text-sm">
                Username
                <input
                  name="username"
                  defaultValue={profile.username}
                  required
                  pattern="[a-z0-9_\-]{2,32}"
                  className="rounded-md border border-zinc-300 px-3 py-2 lowercase"
                />
              </label>
              <button
                type="submit"
                className="rounded-md bg-zinc-900 px-3 py-2 text-sm text-white hover:bg-zinc-800"
              >
                Change username
              </button>
            </form>

            {usernameError && (
              <p className="mt-2 text-sm text-red-600">{usernameError}</p>
            )}
            {usernameOk && (
              <p className="mt-2 text-sm text-emerald-700">Username updated.</p>
            )}
          </div>

          {/* Change password */}
          <div>
            <h3 className="text-sm font-medium">Change password</h3>
            <p className="mt-1 text-xs text-zinc-500">
              You&rsquo;ll be asked for your current password to confirm.
            </p>

            <form
              action={updatePasswordAction}
              className="mt-3 flex flex-col gap-2"
            >
              <label className="flex flex-col gap-1 text-sm">
                Current password
                <input
                  name="current"
                  type="password"
                  required
                  autoComplete="current-password"
                  className="rounded-md border border-zinc-300 px-3 py-2"
                />
              </label>
              <div className="flex flex-wrap gap-2">
                <label className="flex flex-1 flex-col gap-1 text-sm">
                  New password
                  <input
                    name="next"
                    type="password"
                    required
                    autoComplete="new-password"
                    minLength={6}
                    className="rounded-md border border-zinc-300 px-3 py-2"
                  />
                </label>
                <label className="flex flex-1 flex-col gap-1 text-sm">
                  Confirm new password
                  <input
                    name="confirm"
                    type="password"
                    required
                    autoComplete="new-password"
                    minLength={6}
                    className="rounded-md border border-zinc-300 px-3 py-2"
                  />
                </label>
              </div>
              <button
                type="submit"
                className="mt-1 self-start rounded-md bg-zinc-900 px-3 py-2 text-sm text-white hover:bg-zinc-800"
              >
                Change password
              </button>
            </form>

            {passwordError && (
              <p className="mt-2 text-sm text-red-600">{passwordError}</p>
            )}
            {passwordOk && (
              <p className="mt-2 text-sm text-emerald-700">
                Password updated.
              </p>
            )}
          </div>

          {/* Danger zone — delete account */}
          <div className="rounded-md border border-red-200 bg-red-50/40 p-4">
            <h3 className="text-sm font-medium text-red-900">Danger zone</h3>
            <p className="mt-1 text-sm text-red-800">
              Deleting your account is permanent. Your profile, sections, and
              items will all be removed and your public page will 404.
            </p>

            <form
              action={deleteAccountAction}
              className="mt-3 flex flex-wrap items-end gap-2"
            >
              <label className="flex flex-1 flex-col gap-1 text-sm text-red-900">
                Type your username{" "}
                <code className="font-mono">{profile.username}</code> to confirm
                <input
                  name="confirm"
                  required
                  placeholder={profile.username}
                  className="rounded-md border border-red-300 bg-white px-3 py-2 lowercase"
                />
              </label>
              <button
                type="submit"
                className="rounded-md bg-red-600 px-3 py-2 text-sm text-white hover:bg-red-700"
              >
                Delete account
              </button>
            </form>

            {deleteError && (
              <p className="mt-2 text-sm text-red-700">{deleteError}</p>
            )}
          </div>
        </div>
      </details>
    </main>
  );
}
