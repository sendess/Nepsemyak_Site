-- Email alerts to admins when someone sends the contact form.

-- Each admin chooses in "My account" whether they get an email for every new query. On by default.
alter table admin_users add column notify_requests boolean not null default true;

-- Whether the alert for a query went out. Kept apart from service_requests so that sending an alert
-- never shows up as an edit in the activity log.
create table request_alerts (
  request_id   bigint primary key references service_requests (id) on delete cascade,
  attempted_at timestamptz not null default now(),
  -- How many admins it was sent to (0 when nobody has alerts turned on).
  sent_to      integer not null default 0,
  -- The email service's answer when sending failed; null when it worked.
  error        text
);

create index request_alerts_failed_idx on request_alerts (attempted_at desc) where error is not null;
