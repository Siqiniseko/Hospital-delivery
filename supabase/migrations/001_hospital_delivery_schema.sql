-- Medical hospital delivery database schema for Supabase/Postgres.
-- Run this in Supabase SQL Editor or with: supabase db push

create extension if not exists "pgcrypto";

create type user_role as enum ('patient', 'doctor', 'driver', 'admin');
create type appointment_status as enum ('pending', 'approved', 'completed', 'cancelled');
create type delivery_type as enum ('collection', 'delivery');
create type pill_order_status as enum ('requested', 'approved', 'preparing', 'ready', 'out_for_delivery', 'collected', 'delivered', 'cancelled');
create type delivery_status as enum ('assigned', 'picked_up', 'on_the_way', 'arrived', 'delivered', 'failed');
create type mission_status as enum ('planned', 'sms_sent', 'completed', 'cancelled');

create table profiles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  phone text,
  address text,
  role user_role not null default 'patient',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table appointments (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references profiles(id) on delete cascade,
  doctor_name text,
  reason text,
  appointment_at timestamptz not null,
  status appointment_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table inventory (
  id uuid primary key default gen_random_uuid(),
  pill_name text not null unique,
  stock integer not null default 0 check (stock >= 0),
  low_stock_threshold integer not null default 10 check (low_stock_threshold >= 0),
  supplier text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table pill_orders (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references profiles(id) on delete cascade,
  pill_name text not null,
  dosage text,
  quantity integer not null default 1 check (quantity > 0),
  collection_at timestamptz,
  delivery_type delivery_type not null default 'collection',
  status pill_order_status not null default 'requested',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table deliveries (
  id uuid primary key default gen_random_uuid(),
  pill_order_id uuid not null references pill_orders(id) on delete cascade,
  patient_id uuid not null references profiles(id) on delete cascade,
  driver_id uuid references profiles(id) on delete set null,
  pickup_address text,
  dropoff_address text,
  status delivery_status not null default 'assigned',
  current_lat numeric(10, 7),
  current_lng numeric(10, 7),
  location_updated_at timestamptz,
  eta_minutes integer,
  otp_code text,
  delivered_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table clinics (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  stock integer not null default 0 check (stock >= 0),
  avg_daily_usage integer not null default 1 check (avg_daily_usage > 0),
  map_lat numeric(5, 2) not null default 50,
  map_lng numeric(5, 2) not null default 50,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table redistribution_missions (
  id uuid primary key default gen_random_uuid(),
  from_clinic_slug text not null references clinics(slug),
  to_clinic_slug text not null references clinics(slug),
  quantity integer not null check (quantity > 0),
  eta_minutes integer,
  qr_code text not null unique,
  status mission_status not null default 'planned',
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table sms_logs (
  id uuid primary key default gen_random_uuid(),
  mission_id uuid references redistribution_missions(id) on delete cascade,
  recipient_type text not null,
  message text not null,
  sent_at timestamptz not null default now()
);

create index idx_profiles_role on profiles(role);
create index idx_appointments_patient on appointments(patient_id);
create index idx_appointments_status on appointments(status);
create index idx_pill_orders_patient on pill_orders(patient_id);
create index idx_pill_orders_status on pill_orders(status);
create index idx_deliveries_driver on deliveries(driver_id);
create index idx_deliveries_status on deliveries(status);
create index idx_clinics_slug on clinics(slug);
create index idx_redistribution_status on redistribution_missions(status);

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_profiles_updated_at before update on profiles for each row execute function set_updated_at();
create trigger set_appointments_updated_at before update on appointments for each row execute function set_updated_at();
create trigger set_inventory_updated_at before update on inventory for each row execute function set_updated_at();
create trigger set_pill_orders_updated_at before update on pill_orders for each row execute function set_updated_at();
create trigger set_deliveries_updated_at before update on deliveries for each row execute function set_updated_at();
create trigger set_clinics_updated_at before update on clinics for each row execute function set_updated_at();
create trigger set_redistribution_missions_updated_at before update on redistribution_missions for each row execute function set_updated_at();

create or replace view clinic_stock_forecast as
select
  id,
  slug,
  name,
  stock,
  avg_daily_usage,
  floor(stock / greatest(avg_daily_usage, 1))::integer as days_left,
  case
    when stock < avg_daily_usage * 3 then 'Crisis'
    when stock < avg_daily_usage * 7 then 'At Risk'
    else 'Healthy'
  end as status,
  least(100, round((floor(stock / greatest(avg_daily_usage, 1)) / 14.0) * 100))::integer as score,
  map_lat,
  map_lng
from clinics;

insert into profiles (name, email, phone, address, role) values
  ('Admin User', 'admin@hospital.com', null, null, 'admin'),
  ('Dr Mkhize', 'doctor@hospital.com', '0730000000', null, 'doctor'),
  ('Driver One', 'driver@hospital.com', '0710000000', null, 'driver'),
  ('Patient One', 'patient@hospital.com', '0720000000', 'Durban, South Africa', 'patient');

insert into inventory (pill_name, stock, low_stock_threshold, supplier) values
  ('Paracetamol', 120, 20, 'MedSupply'),
  ('Amoxicillin', 30, 15, 'CarePharma'),
  ('Insulin', 8, 10, 'ColdChain Pharma');

insert into clinics (slug, name, stock, avg_daily_usage, map_lat, map_lng) values
  ('durban-central', 'Durban Central Clinic', 420, 42, 42, 58),
  ('umlazi', 'Umlazi Clinic', 96, 28, 68, 34),
  ('phoenix', 'Phoenix Clinic', 55, 18, 28, 72),
  ('pinetown', 'Pinetown Clinic', 240, 22, 50, 20);

insert into appointments (patient_id, doctor_name, reason, appointment_at, status)
select id, 'Dr Mkhize', 'Follow-up consultation', now() + interval '2 days', 'approved'
from profiles
where email = 'patient@hospital.com';

insert into pill_orders (patient_id, pill_name, dosage, quantity, collection_at, delivery_type, status)
select id, 'Paracetamol', '500mg', 20, now() + interval '1 day', 'collection', 'ready'
from profiles
where email = 'patient@hospital.com';
