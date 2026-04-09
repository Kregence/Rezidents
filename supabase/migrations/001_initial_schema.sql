-- =========================
-- EXTENSIONS
-- =========================
create extension if not exists "pgcrypto";

-- =========================
-- ENUMS
-- =========================
create type app_role as enum ('super_admin','street_admin','resident');
create type resident_type as enum ('tenant','landlord');
create type unit_type as enum ('flat','duplex','shop','self_contain','bungalow','other');
create type payment_method as enum ('paystack','manual','bank_transfer','cash');
create type payment_status as enum ('pending','success','failed','reversed');

-- =========================
-- TABLES
-- =========================

-- streets
create table streets (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  logo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- profiles
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text,
  phone text,
  role app_role not null,
  street_id uuid references streets(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- properties
create table properties (
  id uuid primary key default gen_random_uuid(),
  street_id uuid not null references streets(id) on delete cascade,
  name text not null,
  address_line text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (street_id, name)
);

-- units
create table units (
  id uuid primary key default gen_random_uuid(),
  street_id uuid not null references streets(id) on delete cascade,
  property_id uuid not null references properties(id) on delete cascade,
  unit_number text not null,
  type unit_type not null default 'flat',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (property_id, unit_number)
);

-- residents
create table residents (
  id uuid primary key default gen_random_uuid(),
  street_id uuid not null references streets(id) on delete cascade,
  unit_id uuid not null references units(id) on delete restrict,
  profile_id uuid references profiles(id) on delete set null,
  full_name text not null,
  phone text,
  email text,
  resident_type resident_type not null,
  move_in_date date,
  move_out_date date,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- levies
create table levies (
  id uuid primary key default gen_random_uuid(),
  street_id uuid not null references streets(id) on delete cascade,
  title text not null,
  description text,
  amount numeric(12,2) not null check (amount >= 0),
  due_date date,
  is_etag_eligible boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- payments
create table payments (
  id uuid primary key default gen_random_uuid(),
  street_id uuid not null references streets(id) on delete cascade,
  resident_id uuid not null references residents(id) on delete restrict,
  levy_id uuid not null references levies(id) on delete restrict,
  amount numeric(12,2) not null check (amount > 0),
  payment_method payment_method not null,
  reference text not null unique,
  status payment_status not null default 'pending',
  paystack_reference text,
  paid_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- etag eligibility
create table etag_eligibility (
  id uuid primary key default gen_random_uuid(),
  street_id uuid not null references streets(id) on delete cascade,
  resident_id uuid not null references residents(id) on delete cascade,
  levy_id uuid not null references levies(id) on delete cascade,
  is_eligible boolean not null default false,
  evaluated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (resident_id, levy_id)
);

-- =========================
-- INDEXES
-- =========================
create index idx_profiles_street on profiles(street_id);
create index idx_properties_street on properties(street_id);
create index idx_units_street on units(street_id);
create index idx_residents_street on residents(street_id);
create index idx_residents_profile on residents(profile_id);
create index idx_levies_street on levies(street_id);
create index idx_payments_street on payments(street_id);
create index idx_payments_resident on payments(resident_id);
create index idx_payments_levy on payments(levy_id);
create index idx_payments_reference on payments(reference);
create index idx_payments_status on payments(status);
create index idx_etag_street on etag_eligibility(street_id);
create index idx_etag_resident on etag_eligibility(resident_id);

-- =========================
-- ENABLE RLS
-- =========================
alter table streets enable row level security;
alter table profiles enable row level security;
alter table properties enable row level security;
alter table units enable row level security;
alter table residents enable row level security;
alter table levies enable row level security;
alter table payments enable row level security;
alter table etag_eligibility enable row level security;

-- =========================
-- HELPER ACCESS FUNCTIONS
-- =========================

-- get current user's role
create function get_user_role()
returns app_role
language sql stable
as $$
  select role from profiles where id = auth.uid()
$$;

-- get current user's street
create function get_user_street()
returns uuid
language sql stable
as $$
  select street_id from profiles where id = auth.uid()
$$;

-- =========================
-- RLS POLICIES
-- =========================

-- STREETS
create policy "super admin full streets"
on streets for all
using (get_user_role() = 'super_admin');

create policy "street admin read own street"
on streets for select
using (id = get_user_street());

-- PROFILES
create policy "super admin full profiles"
on profiles for all
using (get_user_role() = 'super_admin');

create policy "street admin manage profiles"
on profiles for all
using (street_id = get_user_street());

create policy "user read own profile"
on profiles for select
using (id = auth.uid());

create policy "user update own profile"
on profiles for update
using (id = auth.uid());

-- PROPERTIES
create policy "super admin full properties"
on properties for all
using (get_user_role() = 'super_admin');

create policy "street admin properties"
on properties for all
using (street_id = get_user_street());

-- UNITS
create policy "super admin full units"
on units for all
using (get_user_role() = 'super_admin');

create policy "street admin units"
on units for all
using (street_id = get_user_street());

-- RESIDENTS
create policy "super admin full residents"
on residents for all
using (get_user_role() = 'super_admin');

create policy "street admin residents"
on residents for all
using (street_id = get_user_street());

create policy "resident view own record"
on residents for select
using (profile_id = auth.uid());

-- LEVIES
create policy "super admin full levies"
on levies for all
using (get_user_role() = 'super_admin');

create policy "street admin levies"
on levies for all
using (street_id = get_user_street());

create policy "resident read levies"
on levies for select
using (street_id = get_user_street());

-- PAYMENTS
create policy "super admin full payments"
on payments for all
using (get_user_role() = 'super_admin');

create policy "street admin payments"
on payments for all
using (street_id = get_user_street());

create policy "resident read own payments"
on payments for select
using (
  resident_id in (
    select id from residents where profile_id = auth.uid()
  )
);

-- ETAG
create policy "super admin full etag"
on etag_eligibility for all
using (get_user_role() = 'super_admin');

create policy "street admin etag"
on etag_eligibility for all
using (street_id = get_user_street());

create policy "resident read own etag"
on etag_eligibility for select
using (
  resident_id in (
    select id from residents where profile_id = auth.uid()
  )
);
