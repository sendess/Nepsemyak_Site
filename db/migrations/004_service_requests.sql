-- Queries and complaints sent from the website's contact form, worked on in the admin panel.

create table service_requests (
  id          bigint generated always as identity primary key,
  -- Short code shown to the person who wrote in, e.g. "NS-7K4P2Q".
  ref         text not null unique,
  created_at  timestamptz not null default now(),
  topic       text not null check (topic in ('missed-collection', 'new-connection', 'fees', 'staff-feedback', 'suggestion', 'other')),
  -- Branch the visitor picked, or null for "not sure".
  branch      text,
  name        text not null,
  phone       text not null,
  email       text not null default '',
  address     text not null default '',
  message     text not null,
  language    text not null default 'en' check (language in ('en', 'ne')),
  status      text not null default 'new' check (status in ('new', 'in_progress', 'resolved', 'spam')),
  handled_by  text,
  handled_at  timestamptz,
  ip          text,
  user_agent  text
);

create index service_requests_status_idx on service_requests (status, created_at desc);
create index service_requests_created_idx on service_requests (created_at desc);
-- Used to slow down anyone flooding the form.
create index service_requests_ip_idx on service_requests (ip, created_at desc) where ip is not null;

-- What staff did about a request, oldest first.
create table request_notes (
  id           bigint generated always as identity primary key,
  request_id   bigint not null references service_requests (id) on delete cascade,
  at           timestamptz not null default now(),
  author_email text,
  note         text not null
);

create index request_notes_request_idx on request_notes (request_id, at);

-- "Who touched it last" is bookkeeping, like updated_at: keep it out of the activity log's field list.
create or replace function audit_row_change() returns trigger
language plpgsql as $$
declare
  hidden constant text[] := array['updated_at', 'updated_by', 'created_at', 'created_by', 'last_seen_at', 'sort_order',
    'handled_at', 'handled_by',
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
      nullif(row_j ->> 'ref', ''), nullif(row_j ->> 'name', ''), row_j ->> 'email', row_j ->> 'id'),
    diff,
    nullif(current_setting('app.ip', true), ''),
    nullif(current_setting('app.user_agent', true), '')
  );
  return coalesce(new, old);
end $$;

-- Only staff changes are logged; visitors' own submissions would just repeat the request itself.
create trigger service_requests_audit after update or delete on service_requests
  for each row execute function audit_row_change();
