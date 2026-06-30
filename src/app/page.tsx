import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ accountDeleted?: string }>;
}) {
  const { accountDeleted } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-4 py-16 sm:px-6 sm:py-24">
      <h1 className="text-4xl font-semibold tracking-tight">Profiler</h1>
      <p className="mt-3 text-lg text-zinc-600">
        A one-page professional profile.
        <br />
        Minimal, secure, text-first, yours to edit.
      </p>

      {accountDeleted && (
        <div className="mt-6 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Your account has been deleted.
        </div>
      )}

      {!user && (
        <div className="mt-10 space-y-6 text-[15px] leading-relaxed text-zinc-700">
          <div>
            <p className="font-medium text-zinc-900">
              We don&rsquo;t tell you who looked.
            </p>
            <p className="text-zinc-500">
              We don&rsquo;t know either. There&rsquo;s no view counter to
              obsess over.
            </p>
          </div>
          <div>
            <p className="font-medium text-zinc-900">
              No feed. No reposts. No &ldquo;people you may know.&rdquo;
            </p>
            <p className="text-zinc-500">
              You came here for a profile. That&rsquo;s what you get.
            </p>
          </div>
          <div>
            <p className="font-medium text-zinc-900">
              Currently in beta — bear with us.
            </p>
            <p className="text-zinc-500">
              Things will keep getting better. The lines above won&rsquo;t
              change: your page is yours, and we will never sneak a feed into
              your life.
            </p>
          </div>
        </div>
      )}

      <div className="mt-10 flex flex-wrap gap-3 text-sm">
        {user ? (
          <Link
            href="/dashboard"
            className="rounded-md bg-zinc-900 px-4 py-2 text-white hover:bg-zinc-800"
          >
            Go to dashboard
          </Link>
        ) : (
          <>
            <Link
              href="/signup"
              className="rounded-md bg-zinc-900 px-4 py-2 text-white hover:bg-zinc-800"
            >
              Create a profile
            </Link>
            <Link
              href="/login"
              className="rounded-md border border-zinc-300 px-4 py-2 hover:bg-zinc-50"
            >
              Log in
            </Link>
          </>
        )}
      </div>
    </main>
  );
}
