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

-- Sin políticas propias: con RLS activado (a veces Supabase lo prende solo al
-- crear una tabla desde el editor) tanto el insert del CLI como el select del
-- dashboard quedan bloqueados por default. Es un equipo interno sin auth por
-- usuario en este MVP, así que se deja explícitamente desactivado.
alter table context_events disable row level security;

-- ── Login del CLI (device-code flow, estilo `gh auth login` / Claude Code) ──
-- Fila efímera que sirve de "buzón" entre `contextcore login` (que hace polling)
-- y la pestaña del navegador donde el usuario autoriza con GitHub. Nunca se
-- expone al cliente anon: solo la Service Role (rutas /api/cli/*) la toca.
create table if not exists cli_auth_sessions (
  id uuid primary key default gen_random_uuid(),
  device_secret text not null,
  status text not null default 'pending' check (status in ('pending', 'complete')),
  user_id uuid references auth.users (id) on delete cascade,
  access_token text,
  refresh_token text,
  github_login text,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '10 minutes'
);

-- RLS activado sin políticas: solo la Service Role (que lo bypassea) puede
-- leer/escribir esta tabla desde las API routes del dashboard.
alter table cli_auth_sessions enable row level security;
