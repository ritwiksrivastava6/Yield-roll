create table if not exists desk_state (
  user_id text primary key,
  screen text not null default '{}',
  symbols text not null default '[]',
  weights text not null default '{}',
  updated_at timestamptz not null default now()
);

create table if not exists desk_alert (
  id serial primary key,
  user_id text not null,
  kind text not null,
  symbol text not null default '',
  side text not null default 'above',
  level numeric,
  last_value numeric,
  last_key text not null default '',
  created_at timestamptz not null default now()
);

create unique index if not exists desk_alert_uniq on desk_alert (user_id, kind, symbol, side);

create table if not exists desk_ping (
  id serial primary key,
  user_id text not null,
  body text not null,
  seen boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists desk_ping_user_idx on desk_ping (user_id, id desc);
