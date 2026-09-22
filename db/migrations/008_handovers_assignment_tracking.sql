-- Who is dealing with a query, hand-overs between offices, and the public "Track your query" page.

-- The staff member dealing with a query. Cleared automatically if they are removed from the panel.
alter table service_requests
  add column assigned_to text references admin_users (email) on update cascade on delete set null;
create index service_requests_assigned_idx on service_requests (assigned_to) where assigned_to is not null;

-- Each time a query is passed to another office, and whether that office's staff were emailed.
create table request_handovers (
  id          bigint generated always as identity primary key,
  request_id  bigint not null references service_requests (id) on delete cascade,
  at          timestamptz not null default now(),
  from_branch text,
  to_branch   text,
  by_email    text,
  note        text,
  sent_to     integer not null default 0,
  error       text
);
create index request_handovers_request_idx on request_handovers (request_id, at desc);

-- Lookups on the public tracking page, kept for a month so nobody can guess phone digits by trying many times.
create table track_lookups (
  id    bigint generated always as identity primary key,
  at    timestamptz not null default now(),
  ip    text,
  ref   text not null,
  found boolean not null
);
create index track_lookups_ip_idx on track_lookups (ip, at desc);
create index track_lookups_ref_idx on track_lookups (ref, at desc);
