-- Update timezone to UTC
set timezone to 'utc';

-- Create calendar_events table
create table public.calendar_events (
    id uuid default gen_random_uuid() primary key,
    residence_id uuid references public.residences(id) on delete cascade not null,
    title text not null,
    time text not null,
    period text not null check (period in ('AM', 'PM')),
    tag text not null default 'Geral',
    location text,
    team text,
    color text not null default 'border-primary',
    tag_color text not null default 'bg-slate-100 dark:bg-slate-800 text-slate-500',
    date date not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Turn on Row Level Security for calendar_events
alter table public.calendar_events enable row level security;

-- Policies for calendar_events
-- 1. Users can view events for their residences
create policy "Users can view calendar events for their residences"
on public.calendar_events for select
using (
  exists (
    select 1 from public.residences r
    where r.id = calendar_events.residence_id
    and r.owner_id = auth.uid()
  )
);

-- 2. Users can insert events for their residences
create policy "Users can insert calendar events for their residences"
on public.calendar_events for insert
with check (
  exists (
    select 1 from public.residences r
    where r.id = calendar_events.residence_id
    and r.owner_id = auth.uid()
  )
);

-- 3. Users can update events for their residences
create policy "Users can update calendar events for their residences"
on public.calendar_events for update
using (
  exists (
    select 1 from public.residences r
    where r.id = calendar_events.residence_id
    and r.owner_id = auth.uid()
  )
);

-- 4. Users can delete events for their residences
create policy "Users can delete calendar events for their residences"
on public.calendar_events for delete
using (
  exists (
    select 1 from public.residences r
    where r.id = calendar_events.residence_id
    and r.owner_id = auth.uid()
  )
);
