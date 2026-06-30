-- Add "work" section kind for work history / positions.
-- Run in Supabase SQL Editor.
--
-- Notes:
--   - ALTER TYPE ADD VALUE cannot run inside a transaction block. Supabase's
--     SQL editor runs statements outside an explicit transaction, so this
--     works as-is.
--   - IF NOT EXISTS makes this idempotent (safe to re-run).
--   - Item content shape for the "work" kind:
--       {
--         "employer":     "Macromedia",
--         "employer_url": "https://example.com",   -- optional
--         "years":        "2001–2005",
--         "role":         "VP Engineering",
--         "note":         "Sold to Adobe for $3.4B" -- optional
--       }
--     Validation lives in the app layer; the DB stores it as opaque jsonb.

alter type public.section_kind add value if not exists 'work';
