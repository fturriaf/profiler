-- Profiles, sections, items + RLS
-- Run via Supabase SQL editor or `supabase db push` (requires CLI + linked project)

create extension if not exists "pgcrypto";

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null check (username ~ '^[a-z0-9_-]{2,32}$'),
  display_name text not null default '',
  tagline text not null default '',
  published boolean not null default false,
  updated_at timestamptz not null default now()
);

create type public.section_kind as enum ('bullets', 'paragraphs', 'links', 'key_value');

create table public.sections (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  kind public.section_kind not null default 'bullets',
  position integer not null default 0
);

create index sections_profile_idx on public.sections(profile_id, position);

create table public.items (
  id uuid primary key default gen_random_uuid(),
  section_id uuid not null references public.sections(id) on delete cascade,
  position integer not null default 0,
  content jsonb not null default '{}'::jsonb
);

create index items_section_idx on public.items(section_id, position);

-- RLS
alter table public.profiles enable row level security;
alter table public.sections enable row level security;
alter table public.items enable row level security;

-- profiles: anyone reads published; owner reads own always
create policy "profiles_select_public" on public.profiles
  for select using (published or auth.uid() = id);

create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

create policy "profiles_delete_own" on public.profiles
  for delete using (auth.uid() = id);

-- sections: visible if parent profile visible; mutated by owner only
create policy "sections_select" on public.sections
  for select using (
    exists (
      select 1 from public.profiles p
      where p.id = sections.profile_id
        and (p.published or p.id = auth.uid())
    )
  );

create policy "sections_modify_own" on public.sections
  for all using (
    exists (select 1 from public.profiles p where p.id = sections.profile_id and p.id = auth.uid())
  ) with check (
    exists (select 1 from public.profiles p where p.id = sections.profile_id and p.id = auth.uid())
  );

-- items: same rule via parent section → profile
create policy "items_select" on public.items
  for select using (
    exists (
      select 1
      from public.sections s
      join public.profiles p on p.id = s.profile_id
      where s.id = items.section_id
        and (p.published or p.id = auth.uid())
    )
  );

create policy "items_modify_own" on public.items
  for all using (
    exists (
      select 1
      from public.sections s
      join public.profiles p on p.id = s.profile_id
      where s.id = items.section_id and p.id = auth.uid()
    )
  ) with check (
    exists (
      select 1
      from public.sections s
      join public.profiles p on p.id = s.profile_id
      where s.id = items.section_id and p.id = auth.uid()
    )
  );

-- keep updated_at fresh on profiles
create or replace function public.touch_updated_at() returns trigger as $$
begin
  new.updated_at := now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_touch_updated_at
  before update on public.profiles
  for each row execute function public.touch_updated_at();
