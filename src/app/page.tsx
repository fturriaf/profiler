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
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-6 py-24">
      <h1 className="text-4xl font-semibold tracking-tight">Profiler</h1>
      <p className="mt-3 text-lg text-zinc-600">
        A one-page professional profile. Minimal, text-first, yours to edit.
      </p>

      {accountDeleted && (
        <div className="mt-6 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Your account has been deleted.
        </div>
      )}

      <div className="mt-8 flex gap-4 text-sm">
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
