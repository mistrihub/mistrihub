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
create table if not exists public.work_posts (
  id uuid primary key default gen_random_uuid(),
  worker_id text not null references public.workers(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  media_url text not null,
  media_type text not null check (media_type in ('image', 'video')),
  caption text not null default '',
  like_count integer not null default 0,
  comment_count integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists work_posts_worker_id_idx on public.work_posts(worker_id);
create index if not exists work_posts_created_at_idx on public.work_posts(created_at desc);

alter table public.work_posts enable row level security;

drop policy if exists "Work posts are public" on public.work_posts;
create policy "Work posts are public"
on public.work_posts for select
using (true);

drop policy if exists "Workers create own work posts" on public.work_posts;
create policy "Workers create own work posts"
on public.work_posts for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Workers update own work posts" on public.work_posts;
create policy "Workers update own work posts"
on public.work_posts for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Workers delete own work posts" on public.work_posts;
create policy "Workers delete own work posts"
on public.work_posts for delete
to authenticated
using (auth.uid() = user_id);

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
  ('AC Repair', 'ac-repair', 'AC service, gas refill, installation, and breakdown fixes'),
  ('Helper / Labour', 'helper-labour', 'Daily helpers, loading, shifting, site support, and general labour'),
  ('Mason / Plaster', 'mason-plaster', 'Brick work, plaster repair, wall finishing, and small civil jobs')
on conflict (slug) do update
set name = excluded.name,
    description = excluded.description;

insert into public.workers (
  id,
  user_id,
  name,
  category,
  category_slug,
  experience_years,
  rating,
  review_count,
  location,
  city,
  phone,
  whatsapp,
  profile_photo,
  short_description,
  bio,
  service_details,
  gallery,
  available_today,
  starting_price
)
values
  ('rajesh-electrician-delhi', null, 'Rajesh Kumar', 'Electrician', 'electrician', 8, 4.8, 2, 'Lajpat Nagar, Delhi', 'Delhi', '+919810001001', '919810001001', 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=600&q=80', 'Fast home electrical repairs, new wiring, switchboards, and fan installation.', 'Rajesh handles residential electrical jobs across South Delhi with clear pricing and same-day visits whenever possible.', array['Fan and light installation', 'Switchboard repair', 'Home wiring checks', 'Inverter and MCB support'], array['https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=900&q=80', 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=900&q=80', 'https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=900&q=80'], true, 249),
  ('imran-plumber-mumbai', null, 'Imran Shaikh', 'Plumber', 'plumber', 6, 4.7, 2, 'Andheri West, Mumbai', 'Mumbai', '+919820002002', '919820002002', 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=600&q=80', 'Leak repair, tap replacement, bathroom fittings, and pipe blockage support.', 'Imran is trusted for neat plumbing work, practical diagnosis, and quick repairs for flats and shops.', array['Leak detection', 'Tap and shower fitting', 'Drain blockage repair', 'Kitchen and bathroom plumbing'], array['https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=900&q=80', 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=900&q=80', 'https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=900&q=80'], true, 199),
  ('sunita-driver-bengaluru', null, 'Sunita Reddy', 'Driver', 'driver', 10, 4.9, 2, 'Indiranagar, Bengaluru', 'Bengaluru', '+919830003003', '919830003003', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=600&q=80', 'Reliable personal driver for city rides, airport drops, and day bookings.', 'Sunita offers punctual driving services with local route knowledge and clean customer communication.', array['Hourly bookings', 'Airport transfer', 'Outstation trips', 'Family and office travel'], array['https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=900&q=80', 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=900&q=80', 'https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=900&q=80'], false, 499),
  ('vijay-carpenter-pune', null, 'Vijay Pawar', 'Carpenter', 'carpenter', 12, 4.8, 2, 'Kothrud, Pune', 'Pune', '+919840004004', '919840004004', 'https://images.unsplash.com/photo-1615109398623-88346a601842?auto=format&fit=crop&w=600&q=80', 'Furniture repairs, hinges, wardrobes, doors, and custom fittings.', 'Vijay works on home and office carpentry with sturdy finishing and careful measurements.', array['Door and lock fitting', 'Wardrobe repair', 'Furniture assembly', 'Custom shelves'], array['https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=900&q=80', 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=900&q=80', 'https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=900&q=80'], true, 299),
  ('mohit-mechanic-jaipur', null, 'Mohit Sharma', 'Mechanic', 'mechanic', 9, 4.6, 2, 'Malviya Nagar, Jaipur', 'Jaipur', '+919850005005', '919850005005', 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=600&q=80', 'Bike and car checks, battery issues, servicing, and minor repairs.', 'Mohit supports vehicle owners with practical troubleshooting and transparent repair suggestions.', array['Vehicle inspection', 'Battery and starting issue', 'Brake checks', 'Routine servicing'], array['https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=900&q=80', 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=900&q=80', 'https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=900&q=80'], true, 349),
  ('anil-painter-ahmedabad', null, 'Anil Patel', 'Painter', 'painter', 7, 4.5, 2, 'Satellite, Ahmedabad', 'Ahmedabad', '+919860006006', '919860006006', 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=600&q=80', 'Interior painting, rental touch-ups, wall putty, texture, and polishing.', 'Anil delivers clean painting work for apartments, shops, and quick pre-move touch-ups.', array['Interior wall painting', 'Texture paint', 'Putty and primer', 'Rental repaint'], array['https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=900&q=80', 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=900&q=80', 'https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=900&q=80'], false, 599),
  ('farhan-ac-hyderabad', null, 'Farhan Ali', 'AC Repair', 'ac-repair', 11, 4.9, 2, 'Gachibowli, Hyderabad', 'Hyderabad', '+919870007007', '919870007007', 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=600&q=80', 'Split and window AC service, installation, gas refill, and cooling issues.', 'Farhan specializes in AC servicing and repairs with quick diagnosis for homes and small offices.', array['AC wet service', 'Gas refill', 'Installation and uninstallation', 'Cooling issue repair'], array['https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=900&q=80', 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=900&q=80', 'https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=900&q=80'], true, 399)
on conflict (id) do update
set name = excluded.name,
    category = excluded.category,
    category_slug = excluded.category_slug,
    experience_years = excluded.experience_years,
    location = excluded.location,
    city = excluded.city,
    phone = excluded.phone,
    whatsapp = excluded.whatsapp,
    profile_photo = excluded.profile_photo,
    short_description = excluded.short_description,
    bio = excluded.bio,
    service_details = excluded.service_details,
    gallery = excluded.gallery,
    available_today = excluded.available_today,
    starting_price = excluded.starting_price;

insert into public.reviews (worker_id, customer_name, rating, review_text)
values
  ('rajesh-electrician-delhi', 'Amit', 5, 'Quick response and clean wiring work.'),
  ('rajesh-electrician-delhi', 'Priya', 4, 'Good service and fair pricing.'),
  ('imran-plumber-mumbai', 'Nisha', 5, 'Fixed the leak neatly.'),
  ('imran-plumber-mumbai', 'Rahul', 4, 'Reached on time and explained the issue.'),
  ('sunita-driver-bengaluru', 'Kavya', 5, 'Very punctual and safe driving.'),
  ('sunita-driver-bengaluru', 'Arjun', 5, 'Excellent airport drop service.'),
  ('vijay-carpenter-pune', 'Meera', 5, 'Solid furniture repair.'),
  ('vijay-carpenter-pune', 'Dev', 4, 'Good finishing work.'),
  ('mohit-mechanic-jaipur', 'Rohit', 5, 'Diagnosed the bike issue quickly.'),
  ('mohit-mechanic-jaipur', 'Ananya', 4, 'Helpful and transparent.'),
  ('anil-painter-ahmedabad', 'Jignesh', 5, 'Clean painting work.'),
  ('anil-painter-ahmedabad', 'Hetal', 4, 'Good touch-up service.'),
  ('farhan-ac-hyderabad', 'Sana', 5, 'AC cooling improved immediately.'),
  ('farhan-ac-hyderabad', 'Vikram', 5, 'Professional and quick.')
on conflict do nothing;

select public.refresh_worker_rating(id)
from public.workers;


