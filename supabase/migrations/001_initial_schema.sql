-- ============================================================
-- URPASS — Initial Schema
-- ============================================================

-- Extensions
create extension if not exists "pgcrypto";

-- ============================================================
-- profiles
-- ============================================================
create table if not exists profiles (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  full_name   text not null,
  email       text not null,
  avatar_url  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint profiles_user_id_key unique (user_id)
);

-- ============================================================
-- plans
-- ============================================================
create table if not exists plans (
  id             uuid primary key default gen_random_uuid(),
  name           text not null,
  slug           text not null,
  price_monthly  integer not null default 0,
  price_yearly   integer not null default 0,
  max_events     integer not null default 1,
  max_attendees  integer not null default 50,
  features       text[] not null default '{}',
  is_active      boolean not null default true,
  created_at     timestamptz not null default now(),
  constraint plans_slug_key unique (slug)
);

-- ============================================================
-- subscriptions
-- ============================================================
create table if not exists subscriptions (
  id                       uuid primary key default gen_random_uuid(),
  user_id                  uuid not null references auth.users(id) on delete cascade,
  plan_id                  uuid not null references plans(id),
  status                   text not null default 'active'
                             check (status in ('active','trialing','past_due','cancelled','expired')),
  provider                 text not null default 'free',
  provider_subscription_id text,
  current_period_start     timestamptz not null default now(),
  current_period_end       timestamptz not null default (now() + interval '100 years'),
  cancel_at_period_end     boolean not null default false,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now(),
  constraint subscriptions_user_id_key unique (user_id)
);

-- ============================================================
-- events
-- ============================================================
create table if not exists events (
  id                  uuid primary key default gen_random_uuid(),
  organizer_id        uuid not null references auth.users(id) on delete cascade,
  name                text not null,
  description         text,
  event_date          date not null,
  start_time          time not null,
  end_time            time not null,
  venue               text not null,
  logo_url            text,
  banner_url          text,
  attendee_limit      integer not null default 100,
  status              text not null default 'draft'
                        check (status in ('draft','active','completed','cancelled')),
  application_enabled boolean not null default true,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- ============================================================
-- attendees
-- ============================================================
create table if not exists attendees (
  id                 uuid primary key default gen_random_uuid(),
  event_id           uuid not null references events(id) on delete cascade,
  name               text not null,
  email              text not null,
  phone              text,
  pass_type          text not null default 'participant',
  application_status text not null default 'pending'
                       check (application_status in ('pending','approved','rejected')),
  pass_status        text not null default 'not_generated'
                       check (pass_status in ('not_generated','generated','checked_in')),
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  -- one active pass per attendee per event
  constraint attendees_event_email_key unique (event_id, email)
);

-- ============================================================
-- passes
-- ============================================================
create table if not exists passes (
  id           uuid primary key default gen_random_uuid(),
  event_id     uuid not null references events(id) on delete cascade,
  attendee_id  uuid not null references attendees(id) on delete cascade,
  pass_type    text not null default 'participant',
  pass_token   text not null default encode(gen_random_bytes(32), 'hex'),
  status       text not null default 'generated'
                 check (status in ('not_generated','generated','checked_in')),
  generated_at timestamptz not null default now(),
  expires_at   timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  constraint passes_token_key unique (pass_token),
  constraint passes_attendee_event_key unique (attendee_id, event_id)
);

-- ============================================================
-- check_ins
-- ============================================================
create table if not exists check_ins (
  id             uuid primary key default gen_random_uuid(),
  pass_id        uuid not null references passes(id) on delete cascade,
  event_id       uuid not null references events(id) on delete cascade,
  attendee_id    uuid not null references attendees(id) on delete cascade,
  checked_in_at  timestamptz not null default now(),
  checked_in_by  uuid not null references auth.users(id),
  created_at     timestamptz not null default now()
);

-- ============================================================
-- Indexes
-- ============================================================
create index if not exists idx_events_organizer on events(organizer_id);
create index if not exists idx_attendees_event on attendees(event_id);
create index if not exists idx_passes_event on passes(event_id);
create index if not exists idx_passes_token on passes(pass_token);
create index if not exists idx_check_ins_pass on check_ins(pass_id);
create index if not exists idx_check_ins_event on check_ins(event_id);

-- ============================================================
-- updated_at trigger
-- ============================================================
create or replace function handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_profiles_updated_at
  before update on profiles
  for each row execute function handle_updated_at();

create trigger trg_subscriptions_updated_at
  before update on subscriptions
  for each row execute function handle_updated_at();

create trigger trg_events_updated_at
  before update on events
  for each row execute function handle_updated_at();

create trigger trg_attendees_updated_at
  before update on attendees
  for each row execute function handle_updated_at();

create trigger trg_passes_updated_at
  before update on passes
  for each row execute function handle_updated_at();

-- ============================================================
-- Auto-create profile on signup
-- ============================================================
create or replace function handle_new_user()
returns trigger language plpgsql security definer
set search_path = public
as $$
declare
  free_plan_id uuid;
begin
  insert into public.profiles (user_id, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email
  );

  select id into free_plan_id from public.plans where slug = 'free' limit 1;

  if free_plan_id is not null then
    insert into public.subscriptions (user_id, plan_id, status, provider)
    values (new.id, free_plan_id, 'active', 'free');
  end if;

  return new;
end;
$$;

create trigger trg_new_user
  after insert on auth.users
  for each row execute function handle_new_user();

-- ============================================================
-- Seed plans
-- ============================================================
insert into plans (name, slug, price_monthly, price_yearly, max_events, max_attendees, features, is_active)
values
  (
    'Free', 'free', 0, 0, 1, 50,
    array['1 active event','50 attendees','Digital passes','QR check-in','Basic dashboard','URPASS branding'],
    true
  ),
  (
    'Starter', 'starter', 29900, 299000, 5, 500,
    array['5 active events','500 attendees/event','CSV upload','QR check-in','Remove branding'],
    true
  ),
  (
    'Pro', 'pro', 79900, 799000, 9999, 2000,
    array['Unlimited events','2000 attendees/event','CSV upload','Custom branding','Check-in dashboard','Export data'],
    true
  )
on conflict (slug) do nothing;

-- ============================================================
-- Row Level Security
-- ============================================================

alter table profiles enable row level security;
alter table subscriptions enable row level security;
alter table events enable row level security;
alter table attendees enable row level security;
alter table passes enable row level security;
alter table check_ins enable row level security;
alter table plans enable row level security;

-- plans: anyone can read (needed for pricing page)
create policy "plans_public_read" on plans
  for select using (true);

-- profiles: owner only
create policy "profiles_owner_select" on profiles
  for select using (auth.uid() = user_id);

create policy "profiles_owner_insert" on profiles
  for insert with check (auth.uid() = user_id);

create policy "profiles_owner_update" on profiles
  for update using (auth.uid() = user_id);

-- subscriptions: owner only
create policy "subscriptions_owner_select" on subscriptions
  for select using (auth.uid() = user_id);

create policy "subscriptions_owner_update" on subscriptions
  for update using (auth.uid() = user_id);

-- events: organizer owns their events
create policy "events_owner_select" on events
  for select using (auth.uid() = organizer_id);

create policy "events_owner_insert" on events
  for insert with check (auth.uid() = organizer_id);

create policy "events_owner_update" on events
  for update using (auth.uid() = organizer_id);

create policy "events_owner_delete" on events
  for delete using (auth.uid() = organizer_id);

-- events: public can read active events (for application page)
create policy "events_public_active_select" on events
  for select using (status = 'active' and application_enabled = true);

-- attendees: organizer reads/writes via event ownership
create policy "attendees_organizer_select" on attendees
  for select using (
    exists (
      select 1 from events
      where events.id = attendees.event_id
        and events.organizer_id = auth.uid()
    )
  );

create policy "attendees_organizer_insert" on attendees
  for insert with check (
    exists (
      select 1 from events
      where events.id = attendees.event_id
        and events.organizer_id = auth.uid()
    )
  );

create policy "attendees_organizer_update" on attendees
  for update using (
    exists (
      select 1 from events
      where events.id = attendees.event_id
        and events.organizer_id = auth.uid()
    )
  );

-- attendees: public can insert (submit application)
create policy "attendees_public_insert" on attendees
  for insert with check (
    exists (
      select 1 from events
      where events.id = attendees.event_id
        and events.status = 'active'
        and events.application_enabled = true
    )
  );

-- passes: organizer access via event ownership
create policy "passes_organizer_select" on passes
  for select using (
    exists (
      select 1 from events
      where events.id = passes.event_id
        and events.organizer_id = auth.uid()
    )
  );

create policy "passes_organizer_insert" on passes
  for insert with check (
    exists (
      select 1 from events
      where events.id = passes.event_id
        and events.organizer_id = auth.uid()
    )
  );

create policy "passes_organizer_update" on passes
  for update using (
    exists (
      select 1 from events
      where events.id = passes.event_id
        and events.organizer_id = auth.uid()
    )
  );

-- passes: public can read by token (for pass page)
create policy "passes_public_select_by_token" on passes
  for select using (true);

-- check_ins: organizer access
create policy "check_ins_organizer_select" on check_ins
  for select using (
    exists (
      select 1 from events
      where events.id = check_ins.event_id
        and events.organizer_id = auth.uid()
    )
  );

create policy "check_ins_organizer_insert" on check_ins
  for insert with check (
    exists (
      select 1 from events
      where events.id = check_ins.event_id
        and events.organizer_id = auth.uid()
    )
  );
