-- Create locations table
create table if not exists locations (
  id uuid default gen_random_uuid() primary key,
  state text not null,
  city text not null,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Add state and city columns to properties
alter table properties add column if not exists state text;
alter table properties add column if not exists city text;

-- Enable RLS
alter table locations enable row level security;

-- Policies for locations
-- Start transaction
begin;

-- Admin full access
create policy "Admins can do everything on locations"
on locations for all
to authenticated
using (
  exists (
    select 1 from admins where id = auth.uid()
  )
)
with check (
  exists (
    select 1 from admins where id = auth.uid()
  )
);

-- Public read access for active locations
create policy "Everyone can read active locations"
on locations for select
to anon, authenticated
using (is_active = true);

commit;
