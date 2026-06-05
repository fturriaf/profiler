import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { fetchOwnProfile } from "@/lib/profile/queries";
import { claimUsernameAction } from "./actions";

export default async function ClaimPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const existing = await fetchOwnProfile(supabase, user.id);
  if (existing) redirect("/dashboard");

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-24">
      <h1 className="text-2xl font-semibold tracking-tight">
        Claim your profile
      </h1>
      <p className="mt-2 text-sm text-zinc-600">
        Your public page will live at{" "}
        <code className="rounded bg-zinc-100 px-1 py-0.5">/u/your-username</code>
        .
      </p>

      <form action={claimUsernameAction} className="mt-6 flex flex-col gap-3">
        <label className="flex flex-col gap-1 text-sm">
          Username
          <input
            name="username"
            required
            pattern="[a-z0-9_\-]{2,32}"
            placeholder="freddy"
            className="rounded-md border border-zinc-300 px-3 py-2 lowercase"
          />
          <span className="text-xs text-zinc-500">
            Lowercase letters, numbers, _ or -. 2–32 characters.
          </span>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Display name
          <input
            name="display_name"
            required
            placeholder="Freddy Turriaf"
            className="rounded-md border border-zinc-300 px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Tagline <span className="text-zinc-400">(optional)</span>
          <input
            name="tagline"
            placeholder="Engineer. Builder. Coffee enthusiast."
            className="rounded-md border border-zinc-300 px-3 py-2"
          />
        </label>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          className="mt-2 rounded-md bg-zinc-900 px-4 py-2 text-sm text-white hover:bg-zinc-800"
        >
          Create profile
        </button>
      </form>
    </main>
  );
}
