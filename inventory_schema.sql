-- Update timezone to UTC
set timezone to 'utc';

-- Create inventory_categories table
create table public.inventory_categories (
    id uuid default gen_random_uuid() primary key,
    residence_id uuid references public.residences(id) on delete cascade not null,
    name text not null,
    icon text not null default 'inventory_2',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Turn on Row Level Security for inventory_categories
alter table public.inventory_categories enable row level security;

-- Policies for inventory_categories
-- 1. Users can view categories for their residences
create policy "Users can view inventory categories for their residences"
on public.inventory_categories for select
using (
  exists (
    select 1 from public.residences r
    where r.id = inventory_categories.residence_id
    and r.owner_id = auth.uid()
  )
);

-- 2. Users can insert categories for their residences
create policy "Users can insert inventory categories for their residences"
on public.inventory_categories for insert
with check (
  exists (
    select 1 from public.residences r
    where r.id = inventory_categories.residence_id
    and r.owner_id = auth.uid()
  )
);

-- 3. Users can update categories for their residences
create policy "Users can update inventory categories for their residences"
on public.inventory_categories for update
using (
  exists (
    select 1 from public.residences r
    where r.id = inventory_categories.residence_id
    and r.owner_id = auth.uid()
  )
);

-- 4. Users can delete categories for their residences
create policy "Users can delete inventory categories for their residences"
on public.inventory_categories for delete
using (
  exists (
    select 1 from public.residences r
    where r.id = inventory_categories.residence_id
    and r.owner_id = auth.uid()
  )
);


-- Create inventory_items table
create table public.inventory_items (
    id uuid default gen_random_uuid() primary key,
    category_id uuid references public.inventory_categories(id) on delete cascade not null,
    name text not null,
    unit text not null default 'Unidade',
    min_stock numeric(12, 2) not null default 0,
    current_stock numeric(12, 2) not null default 0,
    expiry text,
    responsible text not null,
    obs text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Turn on Row Level Security for inventory_items
alter table public.inventory_items enable row level security;

-- Policies for inventory_items
-- Since items belong to a category, we check access through the category's residence
-- 1. Users can view items for their residences
create policy "Users can view inventory items for their residences"
on public.inventory_items for select
using (
  exists (
    select 1 from public.inventory_categories c
    join public.residences r on r.id = c.residence_id
    where c.id = inventory_items.category_id
    and r.owner_id = auth.uid()
  )
);

-- 2. Users can insert items for their residences
create policy "Users can insert inventory items for their residences"
on public.inventory_items for insert
with check (
  exists (
    select 1 from public.inventory_categories c
    join public.residences r on r.id = c.residence_id
    where c.id = inventory_items.category_id
    and r.owner_id = auth.uid()
  )
);

-- 3. Users can update items for their residences
create policy "Users can update inventory items for their residences"
on public.inventory_items for update
using (
  exists (
    select 1 from public.inventory_categories c
    join public.residences r on r.id = c.residence_id
    where c.id = inventory_items.category_id
    and r.owner_id = auth.uid()
  )
);

-- 4. Users can delete items for their residences
create policy "Users can delete inventory items for their residences"
on public.inventory_items for delete
using (
  exists (
    select 1 from public.inventory_categories c
    join public.residences r on r.id = c.residence_id
    where c.id = inventory_items.category_id
    and r.owner_id = auth.uid()
  )
);
