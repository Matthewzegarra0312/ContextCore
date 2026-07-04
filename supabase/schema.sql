-- Fuente compartida para el dashboard (Bloque 1b/6) y el CLI (insertEventBestEffort).
-- Correr una vez en el SQL editor del proyecto de Supabase.

create table if not exists context_events (
  id bigint generated always as identity primary key,
  author text not null,
  timestamp timestamptz not null,
  module text not null,
  intent text not null,
  decisions text[] not null default '{}',
  gotchas text[] not null default '{}',
  created_at timestamptz not null default now()
);

-- Sin esto, el dashboard no recibe INSERTs por websocket (Realtime es opt-in por tabla).
alter publication supabase_realtime add table context_events;
