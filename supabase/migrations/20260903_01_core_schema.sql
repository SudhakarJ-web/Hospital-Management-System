-- 1. Doctors Table
create table if not exists public.doctors (
  id uuid default gen_random_uuid() primary key,
  reference_id text unique not null,
  name text not null,
  slug text unique not null,
  degree text not null,
  department text not null,
  email text unique not null,
  password text not null default 'Doctor@2026',
  fee text default '₹500',
  image text default 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=600&q=80',
  status text check (status in ('Active', 'Pending', 'Suspended')) default 'Active',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Automatic Doctor Slug Trigger
create or replace function public.set_doctor_slug()
returns trigger as $$
begin
  if new.slug is null or new.slug = '' then
    new.slug := 'doctor-' || lower(regexp_replace(trim(regexp_replace(new.name, '^Dr\.?\s*', '', 'i')), '[^a-zA-Z0-9]+', '-', 'g'));
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists tr_set_doctor_slug on public.doctors;
create trigger tr_set_doctor_slug
before insert or update on public.doctors
for each row execute function public.set_doctor_slug();

-- 3. Doctor Policies
alter table public.doctors enable row level security;
drop policy if exists "Allow all updates to doctors" on public.doctors;
create policy "Allow all updates to doctors" on public.doctors for all using (true);