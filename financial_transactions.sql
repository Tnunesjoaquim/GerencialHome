-- Update timezone to UTC
set timezone to 'utc';

-- Create financial_transactions table
create table public.financial_transactions (
    id uuid default gen_random_uuid() primary key,
    residence_id uuid references public.residences(id) on delete cascade not null,
    category text not null,
    description text not null,
    amount numeric(12, 2) not null default 0.00,
    due_date date not null,
    status text not null check (status in ('Pendente', 'Pago', 'Atrasado')),
    icon text not null default 'payments',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Turn on Row Level Security
alter table public.financial_transactions enable row level security;

-- Create policies

-- 1. Users can view transactions for residences they own
create policy "Users can view transactions for their residences"
on public.financial_transactions for select
using (
  exists (
    select 1 from public.residences r
    where r.id = financial_transactions.residence_id
    and r.owner_id = auth.uid()
  )
);

-- 2. Users can insert transactions for residences they own
create policy "Users can insert transactions for their residences"
on public.financial_transactions for insert
with check (
  exists (
    select 1 from public.residences r
    where r.id = financial_transactions.residence_id
    and r.owner_id = auth.uid()
  )
);

-- 3. Users can update transactions for residences they own
create policy "Users can update transactions for their residences"
on public.financial_transactions for update
using (
  exists (
    select 1 from public.residences r
    where r.id = financial_transactions.residence_id
    and r.owner_id = auth.uid()
  )
);

-- 4. Users can delete transactions for residences they own
create policy "Users can delete transactions for their residences"
on public.financial_transactions for delete
using (
  exists (
    select 1 from public.residences r
    where r.id = financial_transactions.residence_id
    and r.owner_id = auth.uid()
  )
);
