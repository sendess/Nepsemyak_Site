-- Admin allowlist, site notices, uploaded images, news and jobs.
-- Sign-in identities live in the neon_auth schema (managed by Neon Auth);
-- this allowlist decides who may use the admin panel.

create table admin_users (
  email       text primary key check (email = lower(email) and position('@' in email) > 1),
  name        text not null default '',
  role        text not null default 'editor' check (role in ('owner', 'editor')),
  created_by  text,
  created_at  timestamptz not null default now(),
  last_seen_at timestamptz
);

create table notices (
  id          bigint generated always as identity primary key,
  message_en  text not null default '',
  message_ne  text not null default '',
  link_url    text check (link_url is null or link_url ~ '^(https?://|/)'),
  tone        text not null default 'info' check (tone in ('info', 'warning', 'urgent')),
  is_active   boolean not null default true,
  starts_at   timestamptz not null default now(),
  ends_at     timestamptz,
  updated_by  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  check (message_en <> '' or message_ne <> ''),
  check (ends_at is null or ends_at > starts_at)
);

create table media (
  id           uuid primary key default gen_random_uuid(),
  content_type text not null check (content_type in ('image/webp', 'image/jpeg', 'image/png')),
  bytes        bytea not null,
  width        integer check (width > 0),
  height       integer check (height > 0),
  size_bytes   integer generated always as (octet_length(bytes)) stored,
  created_by   text,
  created_at   timestamptz not null default now(),
  check (octet_length(bytes) <= 2000000)
);

create table news_posts (
  id              bigint generated always as identity primary key,
  slug            text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  status          text not null default 'draft' check (status in ('draft', 'published')),
  published_on    date not null default current_date,
  branch          text,
  title_en        text not null default '',
  title_ne        text not null default '',
  summary_en      text not null default '',
  summary_ne      text not null default '',
  body_en         text not null default '',
  body_ne         text not null default '',
  cover_media_id  uuid references media (id) on delete set null,
  updated_by      text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  check (title_en <> '' or title_ne <> '')
);

create index news_posts_published_idx on news_posts (published_on desc, id desc) where status = 'published';

create table jobs (
  id              bigint generated always as identity primary key,
  status          text not null default 'draft' check (status in ('draft', 'open', 'closed')),
  title_en        text not null default '',
  title_ne        text not null default '',
  location_en     text not null default '',
  location_ne     text not null default '',
  description_en  text not null default '',
  description_ne  text not null default '',
  how_to_apply_en text not null default '',
  how_to_apply_ne text not null default '',
  openings        integer check (openings is null or openings > 0),
  deadline        date,
  updated_by      text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  check (title_en <> '' or title_ne <> '')
);

create index jobs_open_idx on jobs (deadline nulls last, id desc) where status = 'open';
