-- Editable page content, and activity logging for uploaded files.

-- One row per section that has been edited in the admin panel. Sections nobody has edited use the
-- original text built into the website, so the site looks the same until someone changes something.
create table page_sections (
  id         bigint generated always as identity primary key,
  page       text not null check (page ~ '^[a-z-]+$'),
  -- Built-in sections have a fixed key ("chairman"); sections added by staff are "custom-…".
  key        text not null check (key ~ '^[a-z0-9-]+$'),
  kind       text not null,
  position   integer not null default 0,
  visible    boolean not null default true,
  content    jsonb not null default '{}'::jsonb check (jsonb_typeof(content) = 'object'),
  updated_by text,
  updated_at timestamptz not null default now(),
  unique (page, key)
);

-- Long values (news bodies, long lists) are shortened in the log.
create or replace function audit_trim(v jsonb) returns jsonb
language sql immutable as $$
  select case
    when jsonb_typeof(v) = 'string' and length(v #>> '{}') > 600 then to_jsonb(left(v #>> '{}', 600) || '…')
    when jsonb_typeof(v) in ('array', 'object') and length(v::text) > 1500 then to_jsonb(left(v::text, 1500) || '…')
    else v
  end
$$;

-- Same as before, plus: image bytes are never copied into the log, a page section's content is
-- compared field by field, and page sections are labelled "page / section".
create or replace function audit_row_change() returns trigger
language plpgsql as $$
declare
  hidden constant text[] := array['updated_at', 'updated_by', 'created_at', 'created_by', 'last_seen_at', 'sort_order',
    'handled_at', 'handled_by', 'bytes',
    'totp_secret', 'totp_pending_secret', 'totp_enabled_at', 'totp_last_step'];
  old_j jsonb;
  new_j jsonb;
  row_j jsonb;
  diff  jsonb;
begin
  if tg_op in ('UPDATE', 'DELETE') then old_j := to_jsonb(old) - hidden; end if;
  if tg_op in ('INSERT', 'UPDATE') then new_j := to_jsonb(new) - hidden; end if;

  -- Spread a section's content into its own fields, so the log shows e.g. "content.message_en".
  if jsonb_typeof(old_j -> 'content') = 'object' then
    old_j := (old_j - 'content') || coalesce((select jsonb_object_agg('content.' || key, value) from jsonb_each(old_j -> 'content')), '{}'::jsonb);
  end if;
  if jsonb_typeof(new_j -> 'content') = 'object' then
    new_j := (new_j - 'content') || coalesce((select jsonb_object_agg('content.' || key, value) from jsonb_each(new_j -> 'content')), '{}'::jsonb);
  end if;
  row_j := coalesce(new_j, old_j);

  if tg_op = 'UPDATE' then
    select jsonb_object_agg(key, jsonb_build_object('from', audit_trim(old_j -> key), 'to', audit_trim(new_j -> key)))
      into diff
      from (select jsonb_object_keys(new_j) as key union select jsonb_object_keys(old_j)) keys
      where new_j -> key is distinct from old_j -> key;
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
      nullif(row_j ->> 'ref', ''),
      case when row_j ? 'page' and row_j ? 'key' then concat(row_j ->> 'page', ' / ', row_j ->> 'key') end,
      nullif(row_j ->> 'name', ''), row_j ->> 'email', row_j ->> 'id'),
    diff,
    nullif(current_setting('app.ip', true), ''),
    nullif(current_setting('app.user_agent', true), '')
  );
  return coalesce(new, old);
end $$;

create trigger page_sections_audit after insert or update or delete on page_sections
  for each row execute function audit_row_change();

-- Uploads and deletions of images show in the activity log (without the image data).
create trigger media_audit after insert or delete on media
  for each row execute function audit_row_change();
