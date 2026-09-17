-- Admin sign-in hardening (password + authenticator app) and an append-only activity log.

-- Exactly one master admin ("owner"); everyone else is a sub-admin ("editor").
create unique index admin_users_single_owner on admin_users ((true)) where role = 'owner';

alter table admin_users
  -- Authenticator (TOTP) secret, encrypted by the app. Pending until the first code is confirmed.
  add column totp_secret         text,
  add column totp_pending_secret text,
  add column totp_enabled_at     timestamptz,
  -- Last 30-second step accepted, so a code can't be used twice.
  add column totp_last_step      bigint;

-- Sign-in sessions that have passed the authenticator check. Keyed by the Neon Auth session id.
create table admin_mfa_sessions (
  session_id  text primary key,
  email       text not null references admin_users (email) on delete cascade on update cascade,
  verified_at timestamptz not null default now(),
  expires_at  timestamptz not null
);

create index admin_mfa_sessions_email_idx on admin_mfa_sessions (email);

-- One-time recovery codes (SHA-256 hashes) for when the phone is lost.
create table admin_recovery_codes (
  email     text not null references admin_users (email) on delete cascade on update cascade,
  code_hash text not null,
  used_at   timestamptz,
  primary key (email, code_hash)
);

-- Who did what, when. Content changes are written by triggers; sign-in events by the app.
create table audit_log (
  id          bigint generated always as identity primary key,
  at          timestamptz not null default now(),
  actor_email text,
  action      text not null,
  entity      text,
  entity_id   text,
  label       text,
  changes     jsonb,
  ip          text,
  user_agent  text
);

create index audit_log_at_idx on audit_log (at desc, id desc);
create index audit_log_actor_idx on audit_log (actor_email, at desc);
create index audit_log_ip_idx on audit_log (ip, at desc) where ip is not null;

-- The log can only grow: no edits, deletes or truncation.
create function audit_log_append_only() returns trigger
language plpgsql as $$
begin
  raise exception 'audit_log is append-only';
end $$;

create trigger audit_log_no_update_delete before update or delete on audit_log
  for each row execute function audit_log_append_only();
create trigger audit_log_no_truncate before truncate on audit_log
  for each statement execute function audit_log_append_only();

-- Long text (news bodies) is shortened in the log.
create function audit_trim(v jsonb) returns jsonb
language sql immutable as $$
  select case when jsonb_typeof(v) = 'string' and length(v #>> '{}') > 600
    then to_jsonb(left(v #>> '{}', 600) || '…') else v end
$$;

-- Records a row change. The app sets app.actor / app.ip / app.user_agent in the same transaction.
create function audit_row_change() returns trigger
language plpgsql as $$
declare
  -- Bookkeeping and secret columns are never logged.
  hidden constant text[] := array['updated_at', 'updated_by', 'created_at', 'created_by', 'last_seen_at', 'sort_order',
    'totp_secret', 'totp_pending_secret', 'totp_enabled_at', 'totp_last_step'];
  old_j jsonb;
  new_j jsonb;
  row_j jsonb;
  diff  jsonb;
begin
  if tg_op in ('UPDATE', 'DELETE') then old_j := to_jsonb(old) - hidden; end if;
  if tg_op in ('INSERT', 'UPDATE') then new_j := to_jsonb(new) - hidden; end if;
  row_j := coalesce(new_j, old_j);

  if tg_op = 'UPDATE' then
    select jsonb_object_agg(key, jsonb_build_object('from', audit_trim(old_j -> key), 'to', audit_trim(value)))
      into diff
      from jsonb_each(new_j)
      where value is distinct from old_j -> key;
    if diff is null then
      return new;
    end if;
  else
    select jsonb_object_agg(key, jsonb_build_object(case tg_op when 'INSERT' then 'to' else 'from' end, audit_trim(value)))
      into diff
      from jsonb_each(row_j)
      where value not in ('null'::jsonb, '""'::jsonb);
  end if;

  insert into audit_log (actor_email, action, entity, entity_id, label, changes, ip, user_agent)
  values (
    nullif(current_setting('app.actor', true), ''),
    case tg_op when 'INSERT' then 'create' when 'UPDATE' then 'update' else 'delete' end,
    tg_table_name,
    coalesce(row_j ->> 'id', row_j ->> 'email'),
    coalesce(nullif(row_j ->> 'title_en', ''), nullif(row_j ->> 'title_ne', ''), nullif(row_j ->> 'message_en', ''),
      nullif(row_j ->> 'message_ne', ''), nullif(row_j ->> 'label_en', ''), nullif(row_j ->> 'label_ne', ''),
      nullif(row_j ->> 'name', ''), row_j ->> 'email', row_j ->> 'id'),
    diff,
    nullif(current_setting('app.ip', true), ''),
    nullif(current_setting('app.user_agent', true), '')
  );
  return coalesce(new, old);
end $$;

create trigger notices_audit after insert or update or delete on notices
  for each row execute function audit_row_change();
create trigger news_posts_audit after insert or update or delete on news_posts
  for each row execute function audit_row_change();
create trigger jobs_audit after insert or update or delete on jobs
  for each row execute function audit_row_change();
create trigger stat_groups_audit after insert or update or delete on stat_groups
  for each row execute function audit_row_change();
create trigger stat_items_audit after insert or update or delete on stat_items
  for each row execute function audit_row_change();
create trigger admin_users_audit after insert or update or delete on admin_users
  for each row execute function audit_row_change();
