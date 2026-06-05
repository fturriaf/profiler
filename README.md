# Profiler

Minimalist, professional one-page profiles. Inspired by sites like
[fredkrueger.org](https://fredkrueger.org/) — text-first, no social-network
clutter, one URL you can put on a business card.

Built on **Next.js 15** (App Router), **Supabase** (Postgres + Auth + RLS),
and **Tailwind CSS**.

## Local development

### 1. Install

```bash
npm install
```

### 2. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) → new project.
2. **Project Settings → API**: copy the **Project URL** and the **`anon` public** key.
3. In **SQL Editor → New query**: paste the contents of
   [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql) and
   run it. This creates the `profiles`, `sections`, and `items` tables along
   with row-level security.
4. (Dev only) **Authentication → Providers → Email**: turn off
   *Confirm email* so you don't need to click a link before logging in.
   Re-enable for production.

### 3. Wire env vars

```bash
cp .env.local.example .env.local
```

Fill in `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
Leave `NEXT_PUBLIC_SITE_URL` blank for local dev.

### 4. Run

```bash
npm run dev
```

Visit http://localhost:3000.

## How it works

| Route             | Purpose                                                              |
| ----------------- | -------------------------------------------------------------------- |
| `/`               | Landing page                                                         |
| `/signup`, `/login` | Email + password auth via Supabase                                 |
| `/claim`          | First-run: pick username + display name (one profile per user)       |
| `/dashboard`      | Profile status, publish toggle, link to editor                       |
| `/edit`           | Two-pane editor with live preview                                    |
| `/u/[username]`   | Public, server-rendered profile (only visible when published)        |
| `/robots.txt`     | Generated from [`src/app/robots.ts`](src/app/robots.ts)              |

**Data model**: `profiles` (1 per user) → `sections` (freeform title +
render `kind`) → `items` (content shape varies by kind). RLS makes every
non-owner read/write attempt fail at the database, not just in app code.

**Render kinds**: `bullets`, `paragraphs`, `links`, `key_value`.

## Deploying to Vercel

### 1. Push to GitHub

```bash
gh repo create profiler --public --source=. --push
# or any other "push to a remote" flow
```

### 2. Import on Vercel

1. [vercel.com/new](https://vercel.com/new) → pick the repo → **Import**.
2. Framework preset is auto-detected (Next.js). No build settings to change.

### 3. Environment variables

Add three project env vars in **Vercel → Project → Settings → Environment Variables**:

| Name                            | Value                                      |
| ------------------------------- | ------------------------------------------ |
| `NEXT_PUBLIC_SUPABASE_URL`      | Your Supabase project URL                  |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase `anon` public key            |
| `NEXT_PUBLIC_SITE_URL`          | `https://your-domain.vercel.app` (or custom) |

Apply to **Production**, **Preview**, and **Development** as you like.

### 4. Supabase redirect URLs

In Supabase **Authentication → URL Configuration**, add your Vercel domain to:

- **Site URL**: `https://your-domain.vercel.app`
- **Redirect URLs**: `https://your-domain.vercel.app/auth/callback`

Otherwise magic-link / OAuth callbacks will be rejected.

### 5. Deploy

Push to `main` (or click **Deploy** in Vercel). Subsequent commits auto-deploy.

## Production checklist

- [ ] Re-enable Supabase **Confirm email** under Authentication → Providers
- [ ] Set `NEXT_PUBLIC_SITE_URL` to your live origin
- [ ] Add your custom domain in Vercel and update Supabase Site URL to match
- [ ] (Optional) Add Google / GitHub OAuth in Supabase Authentication →
      Providers — the `/auth/callback` route already handles the code exchange

## Repo layout

```
src/
  app/
    page.tsx               landing
    login/, signup/        auth pages + server actions
    auth/callback/         OAuth / magic link code exchange
    claim/                 first-run username flow
    dashboard/             profile status + publish toggle
    edit/                  editor (client) + save server action
    u/[username]/          public profile (SSR)
    not-found.tsx          404
    robots.ts              robots.txt
  components/profile/      ProfileView + SectionRenderer (reused in editor preview)
  lib/
    supabase/              browser + server + middleware clients
    profile/               types + queries
    site.ts                canonical SITE_URL
  middleware.ts            refreshes session, gates /dashboard + /edit
supabase/migrations/       SQL schema + RLS
```

## License

MIT.
