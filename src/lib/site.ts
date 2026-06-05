// Centralized site URL. Used for canonical links, OG metadata, robots, etc.
// Set NEXT_PUBLIC_SITE_URL in production to your live origin (e.g. https://profiler.example).
// Falls back to Vercel's auto-provided VERCEL_URL on preview deploys, then localhost.
export const SITE_URL = (() => {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");
  const vercel = process.env.VERCEL_URL;
  if (vercel) return `https://${vercel}`;
  return "http://localhost:3000";
})();

export const SITE_NAME = "Profiler";
