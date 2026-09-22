-- Corrections the master makes to the wording of help pages. The original text lives in the website's
-- code (src/data/help); a row here replaces one line in one language. "Restore original" deletes the row.
create table help_texts (
  id         bigint generated always as identity primary key,
  lang       text not null check (lang in ('en', 'ne')),
  key        text not null check (key ~ '^[A-Za-z0-9._-]+$'),
  text       text not null check (length(text) between 1 and 3000),
  -- How the line is labelled in the activity log, e.g. "ne · queries.answer.1".
  name       text generated always as (lang || ' · ' || key) stored,
  updated_by text,
  updated_at timestamptz not null default now(),
  unique (lang, key)
);

-- Every correction and restore shows in the activity log with the old and new wording.
create trigger help_texts_audit after insert or update or delete on help_texts
  for each row execute function audit_row_change();
