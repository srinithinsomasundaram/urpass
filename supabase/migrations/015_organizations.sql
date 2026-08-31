-- ============================================================
-- URPASS — Organizations & Team Management
-- ============================================================

-- ============================================================
-- organizations
-- ============================================================
create table if not exists organizations (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  slug          text not null,
  logo_url      text,
  website       text,
  contact_email text,
  contact_phone text,
  brand_color   text not null default '#6D28D9',
  created_by    uuid not null references auth.users(id),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  constraint organizations_slug_key unique (slug)
);

-- ============================================================
-- organization_members
-- ============================================================
create table if not exists organization_members (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  user_id         uuid references auth.users(id) on delete cascade,
  invited_email   text not null,
  role            text not null check (role in ('owner','admin','event_manager','checkin_staff','viewer')),
  status          text not null default 'pending' check (status in ('active','pending')),
  invite_token    text unique,
  invited_by      uuid references auth.users(id),
  joined_at       timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ============================================================
-- event_assignments  (for event_manager per-event access)
-- ============================================================
create table if not exists event_assignments (
  id         uuid primary key default gen_random_uuid(),
  event_id   uuid not null references events(id) on delete cascade,
  member_id  uuid not null references organization_members(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint event_assignments_event_member_key unique (event_id, member_id)
);

-- ============================================================
-- Add organization_id to events (nullable — personal events = NULL)
-- ============================================================
alter table events add column if not exists organization_id uuid references organizations(id) on delete set null;
create index if not exists idx_events_organization on events(organization_id);
create index if not exists idx_org_members_org on organization_members(organization_id);
create index if not exists idx_org_members_user on organization_members(user_id);
create index if not exists idx_org_members_token on organization_members(invite_token);

-- ============================================================
-- updated_at triggers
-- ============================================================
create trigger trg_organizations_updated_at
  before update on organizations
  for each row execute function handle_updated_at();

create trigger trg_org_members_updated_at
  before update on organization_members
  for each row execute function handle_updated_at();

-- ============================================================
-- Helper: get current user's role in an org (null if not member)
-- ============================================================
create or replace function get_user_org_role(p_org_id uuid)
returns text language sql security definer stable
set search_path = public
as $$
  select role from organization_members
  where organization_id = p_org_id
    and user_id = auth.uid()
    and status = 'active'
  limit 1;
$$;

-- ============================================================
-- Helper: is current user an active member of an org?
-- ============================================================
create or replace function is_org_member(p_org_id uuid)
returns boolean language sql security definer stable
set search_path = public
as $$
  select exists (
    select 1 from organization_members
    where organization_id = p_org_id
      and user_id = auth.uid()
      and status = 'active'
  );
$$;

-- ============================================================
-- RLS — organizations
-- ============================================================
alter table organizations enable row level security;

create policy "organizations_member_select" on organizations
  for select using (
    created_by = auth.uid()
    or is_org_member(id)
  );

create policy "organizations_authenticated_insert" on organizations
  for insert with check (auth.uid() = created_by);

create policy "organizations_admin_update" on organizations
  for update using (
    get_user_org_role(id) in ('owner','admin')
  );

create policy "organizations_owner_delete" on organizations
  for delete using (
    get_user_org_role(id) = 'owner'
  );

-- ============================================================
-- RLS — organization_members
-- ============================================================
alter table organization_members enable row level security;

-- Active members can view their org's member list
-- Pending invitees can view their own invite row
create policy "org_members_member_select" on organization_members
  for select using (
    user_id = auth.uid()
    or is_org_member(organization_id)
    or (
      status = 'pending'
      and invited_email = (select email from auth.users where id = auth.uid())
    )
  );

-- Only org owner/admin can invite (insert) members
create policy "org_members_admin_insert" on organization_members
  for insert with check (
    get_user_org_role(organization_id) in ('owner','admin')
  );

-- Owner/admin can change roles; users can update their own invite (accept)
create policy "org_members_admin_update" on organization_members
  for update using (
    user_id = auth.uid()
    or get_user_org_role(organization_id) in ('owner','admin')
  );

-- Owner/admin can remove members; users can remove themselves
create policy "org_members_admin_delete" on organization_members
  for delete using (
    user_id = auth.uid()
    or get_user_org_role(organization_id) in ('owner','admin')
  );

-- ============================================================
-- RLS — event_assignments
-- ============================================================
alter table event_assignments enable row level security;

create policy "event_assignments_org_member_select" on event_assignments
  for select using (
    exists (
      select 1 from events e
      join organization_members om on om.organization_id = e.organization_id
      where e.id = event_assignments.event_id
        and om.user_id = auth.uid()
        and om.status = 'active'
    )
  );

create policy "event_assignments_admin_insert" on event_assignments
  for insert with check (
    exists (
      select 1 from events e
      where e.id = event_assignments.event_id
        and get_user_org_role(e.organization_id) in ('owner','admin')
    )
  );

create policy "event_assignments_admin_delete" on event_assignments
  for delete using (
    exists (
      select 1 from events e
      where e.id = event_assignments.event_id
        and get_user_org_role(e.organization_id) in ('owner','admin')
    )
  );

-- ============================================================
-- RLS — events (additional policies for org context)
-- Existing personal-event policies remain unchanged.
-- ============================================================

-- Any active org member can view org events
create policy "events_org_member_select" on events
  for select using (
    organization_id is not null
    and is_org_member(organization_id)
  );

-- Org owner/admin can insert events into the org
create policy "events_org_admin_insert" on events
  for insert with check (
    organization_id is not null
    and get_user_org_role(organization_id) in ('owner','admin')
  );

-- Org owner/admin can update any org event
create policy "events_org_admin_update" on events
  for update using (
    organization_id is not null
    and get_user_org_role(organization_id) in ('owner','admin')
  );

-- Event manager can update their assigned org events
create policy "events_org_event_manager_update" on events
  for update using (
    organization_id is not null
    and get_user_org_role(organization_id) = 'event_manager'
    and exists (
      select 1 from event_assignments ea
      join organization_members om on ea.member_id = om.id
      where ea.event_id = events.id
        and om.user_id = auth.uid()
        and om.status = 'active'
    )
  );

-- Org owner/admin can delete org events
create policy "events_org_admin_delete" on events
  for delete using (
    organization_id is not null
    and get_user_org_role(organization_id) in ('owner','admin')
  );

-- ============================================================
-- RLS — attendees (additional policies for org context)
-- ============================================================

-- Org members with role owner/admin/event_manager/checkin_staff can read attendees
create policy "attendees_org_member_select" on attendees
  for select using (
    exists (
      select 1 from events e
      where e.id = attendees.event_id
        and e.organization_id is not null
        and get_user_org_role(e.organization_id) in ('owner','admin','event_manager','checkin_staff')
    )
  );

-- Org owner/admin/event_manager can insert attendees
create policy "attendees_org_manager_insert" on attendees
  for insert with check (
    exists (
      select 1 from events e
      where e.id = attendees.event_id
        and e.organization_id is not null
        and (
          get_user_org_role(e.organization_id) in ('owner','admin')
          or (
            get_user_org_role(e.organization_id) = 'event_manager'
            and exists (
              select 1 from event_assignments ea
              join organization_members om on ea.member_id = om.id
              where ea.event_id = e.id and om.user_id = auth.uid() and om.status = 'active'
            )
          )
        )
    )
  );

-- Org owner/admin/event_manager can update attendees
create policy "attendees_org_manager_update" on attendees
  for update using (
    exists (
      select 1 from events e
      where e.id = attendees.event_id
        and e.organization_id is not null
        and (
          get_user_org_role(e.organization_id) in ('owner','admin')
          or (
            get_user_org_role(e.organization_id) = 'event_manager'
            and exists (
              select 1 from event_assignments ea
              join organization_members om on ea.member_id = om.id
              where ea.event_id = e.id and om.user_id = auth.uid() and om.status = 'active'
            )
          )
        )
    )
  );

-- ============================================================
-- RLS — passes (additional policies for org context)
-- ============================================================

create policy "passes_org_member_select" on passes
  for select using (
    exists (
      select 1 from events e
      where e.id = passes.event_id
        and e.organization_id is not null
        and get_user_org_role(e.organization_id) in ('owner','admin','event_manager','checkin_staff')
    )
  );

create policy "passes_org_manager_insert" on passes
  for insert with check (
    exists (
      select 1 from events e
      where e.id = passes.event_id
        and e.organization_id is not null
        and get_user_org_role(e.organization_id) in ('owner','admin','event_manager')
    )
  );

create policy "passes_org_manager_update" on passes
  for update using (
    exists (
      select 1 from events e
      where e.id = passes.event_id
        and e.organization_id is not null
        and get_user_org_role(e.organization_id) in ('owner','admin','event_manager','checkin_staff')
    )
  );

-- ============================================================
-- RLS — check_ins (additional policies for org context)
-- ============================================================

create policy "check_ins_org_staff_select" on check_ins
  for select using (
    exists (
      select 1 from events e
      where e.id = check_ins.event_id
        and e.organization_id is not null
        and get_user_org_role(e.organization_id) in ('owner','admin','event_manager','checkin_staff')
    )
  );

create policy "check_ins_org_staff_insert" on check_ins
  for insert with check (
    exists (
      select 1 from events e
      where e.id = check_ins.event_id
        and e.organization_id is not null
        and get_user_org_role(e.organization_id) in ('owner','admin','event_manager','checkin_staff')
    )
  );
