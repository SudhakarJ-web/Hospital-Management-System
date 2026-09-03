-- 1. Patients Table
create table if not exists public.patients (
  id uuid default gen_random_uuid() primary key,
  reference_id text unique,
  full_name text not null,
  age int4,
  phone text not null,
  department text default 'General Medicine',
  assigned_doctor text default 'Consultant Physician',
  doctor_id uuid references public.doctors(id) on delete set null,
  notes text default 'Routine consultation',
  status text default 'Active',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Prescriptions Table
create table if not exists public.prescriptions (
  id uuid default gen_random_uuid() primary key,
  reference_id text unique not null,
  patient_name text not null,
  patient_phone text,
  prescribing_doctor text not null,
  doctor_id uuid references public.doctors(id) on delete set null,
  department text not null,
  clinical_notes text,
  investigations text,
  medications text not null,
  diet_instructions text,
  status text check (status in ('Pending Dispensation', 'Dispensed & Verified', 'Cancelled')) default 'Pending Dispensation',
  dispensed_by text,
  dispensed_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Appointments Table
create table if not exists public.appointments (
  id uuid default gen_random_uuid() primary key,
  reference_id text unique not null,
  patient_name text not null,
  phone text not null,
  department text not null,
  assigned_doctor text not null,
  doctor_id uuid references public.doctors(id) on delete set null,
  appointment_date text not null,
  time_slot text not null,
  reason text,
  status text check (status in ('Confirmed', 'Completed', 'Cancelled')) default 'Confirmed',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Medical Certificates Table
create table if not exists public.medical_certificates (
  id uuid default gen_random_uuid() primary key,
  certificate_id text unique not null,
  patient_name text not null,
  patient_age text not null,
  patient_gender text not null,
  doctor_name text not null,
  doctor_id uuid references public.doctors(id) on delete set null,
  diagnosis text not null,
  recommended_leave text not null,
  issue_date text not null,
  remarks text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Clinical Ledgers Table
create table if not exists public.clinical_ledgers (
  id uuid default gen_random_uuid() primary key,
  module text not null check (module in ('IPD', 'OT', 'RADIOLOGY', 'PATHOLOGY', 'STOCK', 'BILLING', 'ANALYSIS', 'UTILITY')),
  reference_id text not null,
  col1 text not null,
  col2 text,
  col3 text,
  col4 text,
  col5 text,
  status text default 'Active',
  doctor_id uuid references public.doctors(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. RLS Permissions
alter table public.patients enable row level security;
alter table public.prescriptions enable row level security;
alter table public.appointments enable row level security;
alter table public.medical_certificates enable row level security;
alter table public.clinical_ledgers enable row level security;

drop policy if exists "Allow all operations on patients" on public.patients;
create policy "Allow all operations on patients" on public.patients for all using (true);

drop policy if exists "Allow all operations on prescriptions" on public.prescriptions;
create policy "Allow all operations on prescriptions" on public.prescriptions for all using (true);

drop policy if exists "Allow all operations on appointments" on public.appointments;
create policy "Allow all operations on appointments" on public.appointments for all using (true);

drop policy if exists "Allow all operations on medical_certificates" on public.medical_certificates;
create policy "Allow all operations on medical_certificates" on public.medical_certificates for all using (true);

drop policy if exists "Allow all operations on clinical_ledgers" on public.clinical_ledgers;
create policy "Allow all operations on clinical_ledgers" on public.clinical_ledgers for all using (true);