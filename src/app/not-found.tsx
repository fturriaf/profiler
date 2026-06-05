import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-24 text-center">
      <p className="text-xs uppercase tracking-widest text-zinc-500">404</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">
        Not found
      </h1>
      <p className="mt-3 text-sm text-zinc-600">
        That profile doesn&rsquo;t exist, or its owner hasn&rsquo;t published it
        yet.
      </p>
      <Link
        href="/"
        className="mx-auto mt-6 rounded-md border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-50"
      >
        Back home
      </Link>
    </main>
  );
}
