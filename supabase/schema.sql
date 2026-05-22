create extension if not exists "pgcrypto";

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.workers (
  id text primary key default gen_random_uuid()::text,
  user_id uuid unique references auth.users(id) on delete cascade,
  name text not null,
  category text not null,
  category_slug text not null references public.categories(slug),
  experience_years integer not null default 0,
  rating numeric(2, 1) not null default 0,
  review_count integer not null default 0,
  location text not null,
  city text not null,
  phone text not null,
  whatsapp text not null,
  profile_photo text not null,
  short_description text not null,
  bio text not null,
  service_details text[] not null default '{}',
  gallery text[] not null default '{}',
  available_today boolean not null default true,
  starting_price integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  worker_id text not null references public.workers(id) on delete cascade,
  customer_name text not null default 'LocalPro customer',
  rating integer not null check (rating between 1 and 5),
  review_text text,
  created_at timestamptz not null default now()
);

create index if not exists workers_category_slug_idx on public.workers(category_slug);
create index if not exists workers_city_idx on public.workers(city);
create index if not exists workers_rating_idx on public.workers(rating desc);
create index if not exists reviews_worker_id_idx on public.reviews(worker_id);

create or replace function public.touch_worker_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists touch_workers_updated_at on public.workers;
create trigger touch_workers_updated_at
before update on public.workers
for each row
execute function public.touch_worker_updated_at();

create or replace function public.refresh_worker_rating(target_worker_id text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.workers
  set rating = coalesce((
        select round(avg(rating)::numeric, 1)
        from public.reviews
        where worker_id = target_worker_id
      ), 0),
      review_count = (
        select count(*)
        from public.reviews
        where worker_id = target_worker_id
      )
  where id = target_worker_id;
end;
$$;

create or replace function public.sync_worker_rating()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'DELETE' then
    perform public.refresh_worker_rating(old.worker_id);
    return old;
  end if;

  perform public.refresh_worker_rating(new.worker_id);
  return new;
end;
$$;

drop trigger if exists sync_reviews_worker_rating on public.reviews;
create trigger sync_reviews_worker_rating
after insert or update or delete on public.reviews
for each row
execute function public.sync_worker_rating();

alter table public.categories enable row level security;
alter table public.workers enable row level security;
alter table public.reviews enable row level security;

drop policy if exists "Categories are public" on public.categories;
create policy "Categories are public"
on public.categories for select
using (true);

drop policy if exists "Workers are public" on public.workers;
create policy "Workers are public"
on public.workers for select
using (true);

drop policy if exists "Workers can create own profile" on public.workers;
create policy "Workers can create own profile"
on public.workers for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Workers can update own profile" on public.workers;
create policy "Workers can update own profile"
on public.workers for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Reviews are public" on public.reviews;
create policy "Reviews are public"
on public.reviews for select
using (true);

drop policy if exists "Anyone can add reviews" on public.reviews;
create policy "Anyone can add reviews"
on public.reviews for insert
with check (true);

insert into storage.buckets (id, name, public)
values ('worker-images', 'worker-images', true)
on conflict (id) do update
set public = true;

drop policy if exists "Worker images are public" on storage.objects;
create policy "Worker images are public"
on storage.objects for select
using (bucket_id = 'worker-images');

drop policy if exists "Workers upload own images" on storage.objects;
create policy "Workers upload own images"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'worker-images'
  and auth.uid()::text = (storage.foldername(name))[1]
);

drop policy if exists "Workers update own images" on storage.objects;
create policy "Workers update own images"
on storage.objects for update
to authenticated
using (
  bucket_id = 'worker-images'
  and auth.uid()::text = (storage.foldername(name))[1]
)
with check (
  bucket_id = 'worker-images'
  and auth.uid()::text = (storage.foldername(name))[1]
);

insert into public.categories (name, slug, description)
values
  ('Electrician', 'electrician', 'Wiring, fans, switches, meters, and appliance checks'),
  ('Plumber', 'plumber', 'Leaks, taps, fittings, pipelines, and bathroom repairs'),
  ('Driver', 'driver', 'Hourly, daily, intercity, and personal driver services'),
  ('Carpenter', 'carpenter', 'Furniture repair, fittings, doors, and custom work'),
  ('Mechanic', 'mechanic', 'Two-wheeler and car inspection, repair, and servicing'),
  ('Painter', 'painter', 'Interior, exterior, touch-ups, texture, and polish'),
  ('AC Repair', 'ac-repair', 'AC service, gas refill, installation, and breakdown fixes')
on conflict (slug) do update
set name = excluded.name,
    description = excluded.description;

select public.refresh_worker_rating(id)
from public.workers;
