-- Four levels of access instead of two:
--   owner   = Master (exactly one, see admin_users_single_owner)
--   editor  = Editor: website content and queries
--   support = Customer care: queries only, optionally for one office
--   viewer  = Viewer: reads the dashboard and queries, changes nothing
alter table admin_users drop constraint admin_users_role_check;
alter table admin_users add constraint admin_users_role_check check (role in ('owner', 'editor', 'support', 'viewer'));

-- The office a Customer care person looks after (an id from src/data/site.ts); null = every office.
alter table admin_users add column office text check (office is null or office ~ '^[a-z-]+$');
alter table admin_users add constraint admin_users_office_role check (office is null or role = 'support');
