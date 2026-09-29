-- SIGLA foundation schema for Supabase.
-- This file is intentionally prepared locally and is not applied until a target project
-- is selected, restored, and verified. It never contains service credentials or fake users.

create extension if not exists pgcrypto;

do $$ begin create type public.user_role as enum ('USER', 'ADMIN'); exception when duplicate_object then null; end $$;
do $$ begin create type public.user_status as enum ('REGISTERED', 'PAYMENT_PENDING', 'UNDER_REVIEW', 'ACTIVE', 'SUSPENDED', 'REJECTED'); exception when duplicate_object then null; end $$;
do $$ begin create type public.post_type as enum ('HAVE', 'NEED'); exception when duplicate_object then null; end $$;
do $$ begin create type public.post_status as enum ('DRAFT', 'PAYMENT_PENDING', 'PENDING_REVIEW', 'APPROVED', 'REJECTED', 'EXPIRED', 'SUSPENDED'); exception when duplicate_object then null; end $$;
do $$ begin create type public.payment_type as enum ('REGISTRATION', 'POST'); exception when duplicate_object then null; end $$;
do $$ begin create type public.payment_status as enum ('PENDING', 'VERIFIED', 'REJECTED'); exception when duplicate_object then null; end $$;
do $$ begin create type public.price_type as enum ('FIXED', 'NEGOTIABLE', 'CONTACT'); exception when duplicate_object then null; end $$;
do $$ begin create type public.report_reason as enum ('SPAM', 'FRAUD', 'INCORRECT_INFORMATION', 'PROHIBITED_PRODUCT', 'MISLEADING_CONTENT', 'DUPLICATE', 'OTHER'); exception when duplicate_object then null; end $$;
do $$ begin create type public.report_status as enum ('OPEN', 'DISMISSED', 'ACTIONED'); exception when duplicate_object then null; end $$;
do $$ begin create type public.notification_type as enum ('PAYMENT', 'POST', 'ANNOUNCEMENT', 'SYSTEM'); exception when duplicate_object then null; end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default '',
  phone text not null default '',
  role public.user_role not null default 'USER',
  status public.user_status not null default 'REGISTERED',
  location_label text,
  avatar_url text,
  contact_methods jsonb not null default '[]'::jsonb,
  language text not null default 'en' check (language in ('en', 'am')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_login_at timestamptz
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name_en text not null,
  name_am text not null,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.locations (
  id uuid primary key default gen_random_uuid(),
  region text not null,
  city text,
  zone text,
  area text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.platform_settings (
  id text primary key default 'platform',
  app_name_en text not null default 'SIGLA',
  app_name_am text not null default 'ሲግላ',
  registration_fee numeric(12,2) not null default 0 check (registration_fee >= 0),
  post_fee numeric(12,2) not null default 0 check (post_fee >= 0),
  telebirr_number text not null default '',
  max_posts_per_day integer not null default 5 check (max_posts_per_day > 0),
  max_active_posts integer not null default 20 check (max_active_posts > 0),
  max_images_per_post integer not null default 5 check (max_images_per_post between 0 and 10),
  max_image_size_bytes bigint not null default 5242880 check (max_image_size_bytes > 0),
  post_expiration_days integer not null default 30 check (post_expiration_days > 0),
  allow_new_registrations boolean not null default true,
  require_post_approval boolean not null default true,
  require_user_approval boolean not null default true,
  support_phone text,
  support_telegram text,
  about_content text not null default '',
  terms_content text not null default '',
  privacy_content text not null default '',
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles(id)
);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete restrict,
  type public.post_type not null,
  category_id uuid references public.categories(id) on delete set null,
  category_label text not null default '',
  product_name text not null,
  description text not null,
  quantity numeric(14,3) not null check (quantity > 0),
  unit text not null,
  price numeric(12,2) check (price is null or price >= 0),
  price_type public.price_type not null default 'CONTACT',
  location_id uuid references public.locations(id) on delete set null,
  location_label text not null default '',
  image_urls text[] not null default '{}',
  status public.post_status not null default 'DRAFT',
  payment_id uuid,
  rejection_reason text,
  approved_by uuid references public.profiles(id),
  approved_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete restrict,
  post_id uuid references public.posts(id) on delete set null,
  type public.payment_type not null,
  amount numeric(12,2) not null check (amount > 0),
  transaction_reference text not null,
  sender_phone text not null,
  screenshot_path text,
  status public.payment_status not null default 'PENDING',
  verified_by uuid references public.profiles(id),
  verified_at timestamptz,
  rejection_reason text,
  submitted_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.posts drop constraint if exists posts_payment_id_fkey;
alter table public.posts add constraint posts_payment_id_fkey foreign key (payment_id) references public.payments(id) on delete set null;

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type public.notification_type not null,
  title text not null,
  body text not null,
  data jsonb not null default '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  title_en text not null,
  title_am text not null,
  body_en text not null,
  body_am text not null,
  is_published boolean not null default false,
  published_at timestamptz,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  post_id uuid not null references public.posts(id) on delete cascade,
  reason public.report_reason not null,
  details text,
  status public.report_status not null default 'OPEN',
  reviewed_by uuid references public.profiles(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null references public.profiles(id) on delete restrict,
  action text not null,
  target_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists posts_public_feed_idx on public.posts (status, created_at desc);
create index if not exists posts_type_feed_idx on public.posts (type, status, created_at desc);
create index if not exists posts_category_feed_idx on public.posts (category_id, status, created_at desc);
create index if not exists posts_location_feed_idx on public.posts (location_id, status, created_at desc);
create index if not exists posts_user_status_idx on public.posts (user_id, status, created_at desc);
create index if not exists payments_user_idx on public.payments (user_id, submitted_at desc);
create index if not exists payments_status_idx on public.payments (status, submitted_at desc);
create index if not exists notifications_user_idx on public.notifications (user_id, created_at desc);
create index if not exists reports_status_idx on public.reports (status, created_at desc);

create or replace function public.set_updated_at() returns trigger language plpgsql as $$ begin new.updated_at = now(); return new; end; $$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at before update on public.profiles for each row execute function public.set_updated_at();
drop trigger if exists categories_set_updated_at on public.categories;
create trigger categories_set_updated_at before update on public.categories for each row execute function public.set_updated_at();
drop trigger if exists locations_set_updated_at on public.locations;
create trigger locations_set_updated_at before update on public.locations for each row execute function public.set_updated_at();
drop trigger if exists settings_set_updated_at on public.platform_settings;
create trigger settings_set_updated_at before update on public.platform_settings for each row execute function public.set_updated_at();
drop trigger if exists posts_set_updated_at on public.posts;
create trigger posts_set_updated_at before update on public.posts for each row execute function public.set_updated_at();
drop trigger if exists payments_set_updated_at on public.payments;
create trigger payments_set_updated_at before update on public.payments for each row execute function public.set_updated_at();
drop trigger if exists announcements_set_updated_at on public.announcements;
create trigger announcements_set_updated_at before update on public.announcements for each row execute function public.set_updated_at();

create or replace function public.is_admin() returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.profiles where id = auth.uid() and role = 'ADMIN' and status = 'ACTIVE');
$$;

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, name, phone, status)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', ''), coalesce(new.phone, ''), 'REGISTERED')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.locations enable row level security;
alter table public.platform_settings enable row level security;
alter table public.posts enable row level security;
alter table public.payments enable row level security;
alter table public.notifications enable row level security;
alter table public.announcements enable row level security;
alter table public.reports enable row level security;
alter table public.audit_logs enable row level security;

-- Profiles are private by default. Profile creation and sensitive transitions happen through trusted paths.
drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles for select to authenticated using (id = auth.uid() or public.is_admin());

-- Public configuration is readable; writes are admin-only.
drop policy if exists settings_select_public on public.platform_settings;
create policy settings_select_public on public.platform_settings for select to anon, authenticated using (true);
drop policy if exists settings_admin_write on public.platform_settings;
create policy settings_admin_write on public.platform_settings for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Active taxonomy is public; management is admin-only.
drop policy if exists categories_select_active on public.categories;
create policy categories_select_active on public.categories for select to anon, authenticated using (is_active or public.is_admin());
drop policy if exists categories_admin_write on public.categories;
create policy categories_admin_write on public.categories for all to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists locations_select_active on public.locations;
create policy locations_select_active on public.locations for select to anon, authenticated using (is_active or public.is_admin());
drop policy if exists locations_admin_write on public.locations;
create policy locations_admin_write on public.locations for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Only approved and unexpired listings are public. Owners can work on their own drafts/rejections.
drop policy if exists posts_select_public on public.posts;
create policy posts_select_public on public.posts for select to anon, authenticated using ((status = 'APPROVED' and (expires_at is null or expires_at > now())) or user_id = auth.uid() or public.is_admin());
drop policy if exists posts_insert_own_draft on public.posts;
create policy posts_insert_own_draft on public.posts for insert to authenticated with check (user_id = auth.uid() and status = 'DRAFT');
drop policy if exists posts_update_own_eligible on public.posts;
create policy posts_update_own_eligible on public.posts for update to authenticated using (user_id = auth.uid() and status in ('DRAFT', 'REJECTED')) with check (user_id = auth.uid() and status in ('DRAFT', 'PAYMENT_PENDING', 'REJECTED'));
drop policy if exists posts_admin_write on public.posts;
create policy posts_admin_write on public.posts for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Payments are private and client submissions can only be pending.
drop policy if exists payments_select_own on public.payments;
create policy payments_select_own on public.payments for select to authenticated using (user_id = auth.uid() or public.is_admin());
drop policy if exists payments_insert_pending on public.payments;
create policy payments_insert_pending on public.payments for insert to authenticated with check (user_id = auth.uid() and status = 'PENDING');
drop policy if exists payments_admin_write on public.payments;
create policy payments_admin_write on public.payments for update to authenticated using (public.is_admin()) with check (public.is_admin());

-- Notifications are private to their recipient; only admins/trusted jobs create them.
drop policy if exists notifications_select_own on public.notifications;
create policy notifications_select_own on public.notifications for select to authenticated using (user_id = auth.uid() or public.is_admin());
drop policy if exists notifications_mark_read on public.notifications;
create policy notifications_mark_read on public.notifications for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists notifications_admin_insert on public.notifications;
create policy notifications_admin_insert on public.notifications for insert to authenticated with check (public.is_admin());

-- Published announcements are public; management is admin-only.
drop policy if exists announcements_select_published on public.announcements;
create policy announcements_select_published on public.announcements for select to anon, authenticated using (is_published or public.is_admin());
drop policy if exists announcements_admin_write on public.announcements;
create policy announcements_admin_write on public.announcements for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Users can submit and inspect only their own reports; moderation is admin-only.
drop policy if exists reports_select_own on public.reports;
create policy reports_select_own on public.reports for select to authenticated using (reporter_id = auth.uid() or public.is_admin());
drop policy if exists reports_insert_own on public.reports;
create policy reports_insert_own on public.reports for insert to authenticated with check (reporter_id = auth.uid());
drop policy if exists reports_admin_write on public.reports;
create policy reports_admin_write on public.reports for update to authenticated using (public.is_admin()) with check (public.is_admin());

-- Audit logs are append/read-only to admins; ordinary users have no access.
drop policy if exists audit_logs_admin_read on public.audit_logs;
create policy audit_logs_admin_read on public.audit_logs for select to authenticated using (public.is_admin());
drop policy if exists audit_logs_admin_insert on public.audit_logs;
create policy audit_logs_admin_insert on public.audit_logs for insert to authenticated with check (public.is_admin());

insert into public.platform_settings (id) values ('platform') on conflict (id) do nothing;

insert into storage.buckets (id, name, public) values ('post-images', 'post-images', false) on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('payment-evidence', 'payment-evidence', false) on conflict (id) do nothing;

drop policy if exists post_images_insert_own on storage.objects;
create policy post_images_insert_own on storage.objects for insert to authenticated with check (bucket_id = 'post-images' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists post_images_read_auth on storage.objects;
create policy post_images_read_auth on storage.objects for select to authenticated using (bucket_id = 'post-images' and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin()));
drop policy if exists payment_evidence_insert_own on storage.objects;
create policy payment_evidence_insert_own on storage.objects for insert to authenticated with check (bucket_id = 'payment-evidence' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists payment_evidence_read_own on storage.objects;
create policy payment_evidence_read_own on storage.objects for select to authenticated using (bucket_id = 'payment-evidence' and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin()));

-- Listing images are public-read after moderation, but uploads remain user-scoped.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('listing-images', 'listing-images', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;
drop policy if exists listing_images_insert_own on storage.objects;
create policy listing_images_insert_own on storage.objects for insert to authenticated with check (bucket_id = 'listing-images' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists listing_images_update_own on storage.objects;
create policy listing_images_update_own on storage.objects for update to authenticated using (bucket_id = 'listing-images' and owner_id = auth.uid()::text) with check (bucket_id = 'listing-images' and owner_id = auth.uid()::text);
drop policy if exists listing_images_delete_own on storage.objects;
create policy listing_images_delete_own on storage.objects for delete to authenticated using (bucket_id = 'listing-images' and owner_id = auth.uid()::text);
