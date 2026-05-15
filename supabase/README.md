# Supabase Database Setup

This folder contains the Supabase/Postgres schema for the Medical hospital delivery system.

## Create the database in Supabase

1. Open your Supabase project.
2. Go to `SQL Editor`.
3. Open `migrations/001_hospital_delivery_schema.sql`.
4. Copy the full SQL into Supabase and click `Run`.

The schema creates:

- `profiles`
- `appointments`
- `inventory`
- `pill_orders`
- `deliveries`
- `clinics`
- `redistribution_missions`
- `sms_logs`
- `clinic_stock_forecast` view

It also inserts starter demo data for admin, doctor, driver, patient, inventory, and clinics.

## Environment values

After creating your Supabase project, copy these values from Supabase:

- Project URL
- anon public key
- service role key
- database connection string

Add them to your environment when you are ready to connect the app.

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_DB_URL=postgresql://postgres:password@db.your-project.supabase.co:5432/postgres
```

Do not commit real Supabase keys to a public repository.
