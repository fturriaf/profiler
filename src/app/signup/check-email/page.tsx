import Link from "next/link";

export default async function CheckEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-24">
      <p className="text-xs uppercase tracking-widest text-zinc-500">
        Almost there
      </p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight">
        Check your email
      </h1>
      <p className="mt-3 text-sm text-zinc-600">
        We sent a confirmation link
        {email ? (
          <>
            {" "}
            to <span className="font-medium text-zinc-900">{email}</span>
          </>
        ) : null}
        . Click it to activate your account and finish signing up.
      </p>
      <p className="mt-3 text-xs text-zinc-500">
        Didn&rsquo;t get it? Check your spam folder, or{" "}
        <Link href="/signup" className="underline">
          try signing up again
        </Link>
        .
      </p>
      <div className="mt-6 flex gap-3 text-sm">
        <Link
          href="/login"
          className="rounded-md border border-zinc-300 px-3 py-1.5 hover:bg-zinc-50"
        >
          Go to log in
        </Link>
      </div>
    </main>
  );
}
