-- ============================================================
-- Accounts table for storing OAuth tokens
-- ============================================================

create table accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  provider text not null,
  provider_account_id text not null,
  access_token text,
  refresh_token text,
  token_type text,
  scope text,
  id_token text,
  expires_at bigint,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(provider, provider_account_id)
);

create index idx_accounts_user_id on accounts(user_id);

alter table accounts enable row level security;

create policy "Users can view their own accounts"
  on accounts for select
  using (user_id in (select id from users where id = auth.uid()));