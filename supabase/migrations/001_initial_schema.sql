-- ============================================================
-- Invoice-AI: Initial Schema
-- Organizations, Users, and Invites
-- ============================================================

-- Organizations
create table organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz default now()
);

-- Users
create table users (
  id uuid primary key default gen_random_uuid(),
  email text,
  phone text,
  name text,
  avatar_url text,
  provider text not null,
  provider_account_id text not null,
  organization_id uuid references organizations(id),
  role text not null default 'viewer' check (role in ('finance_manager', 'approver', 'viewer')),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(provider, provider_account_id)
);

-- Invites
create table invites (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id),
  role text not null check (role in ('finance_manager', 'approver')),
  email text,
  token text unique not null,
  invited_by uuid not null references users(id),
  used_by uuid references users(id),
  expires_at timestamptz not null,
  created_at timestamptz default now()
);

-- ============================================================
-- Indexes
-- ============================================================

create index idx_users_email on users(email);
create index idx_users_provider_account on users(provider, provider_account_id);
create index idx_invites_token on invites(token);
create index idx_invites_organization on invites(organization_id);

-- ============================================================
-- Enable Row Level Security
-- ============================================================

alter table organizations enable row level security;
alter table users enable row level security;
alter table invites enable row level security;

-- ============================================================
-- RLS Policies
-- ============================================================

-- Note: These policies use Supabase auth.uid() for browser-side queries.
-- Server-side calls using the service role key bypass RLS entirely.

-- Organizations: users can read their own org
create policy "Users can view their own organization"
  on organizations for select
  using (
    id in (
      select organization_id from users where id = auth.uid()
    )
  );

-- Users: can read own row and other users in their org
create policy "Users can view themselves and org members"
  on users for select
  using (
    id = auth.uid()
    or organization_id in (
      select organization_id from users where id = auth.uid()
    )
  );

-- Users: can update their own row
create policy "Users can update their own profile"
  on users for update
  using (id = auth.uid())
  with check (id = auth.uid());

-- Invites: finance_managers can insert invites for their org
create policy "Finance managers can create invites"
  on invites for insert
  with check (
    organization_id in (
      select organization_id from users
      where id = auth.uid() and role = 'finance_manager'
    )
  );

-- Invites: finance_managers can read invites for their org
create policy "Finance managers can view org invites"
  on invites for select
  using (
    organization_id in (
      select organization_id from users
      where id = auth.uid() and role = 'finance_manager'
    )
  );

-- Invites: finance_managers can update (revoke) invites for their org
create policy "Finance managers can update org invites"
  on invites for update
  using (
    organization_id in (
      select organization_id from users
      where id = auth.uid() and role = 'finance_manager'
    )
  );

-- Users: finance_managers can update roles within their org
create policy "Finance managers can update org member roles"
  on users for update
  using (
    organization_id in (
      select organization_id from users
      where id = auth.uid() and role = 'finance_manager'
    )
  );
