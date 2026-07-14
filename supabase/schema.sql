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
  changes text[] not null default '{}',
  created_at timestamptz not null default now()
);

-- Columna agregada después del lanzamiento inicial (changelog literal del
-- summarizer local); idempotente para proyectos que ya tenían la tabla creada.
alter table context_events add column if not exists changes text[] not null default '{}';

-- Sin esto, el dashboard no recibe INSERTs por websocket (Realtime es opt-in por tabla).
alter publication supabase_realtime add table context_events;

-- RLS activado. Sin políticas, RLS bloquea TODO por default (ese era el motivo
-- por el que antes se desactivaba). Aquí abrimos solo lo que la app necesita:
-- SELECT (dashboard) e INSERT (CLI, anónimo o autenticado). A propósito NO hay
-- políticas de UPDATE/DELETE, así esas operaciones quedan bloqueadas para anon
-- y authenticated — solo la Service Role (que bypassea RLS) puede modificarlas.
-- Esto cierra el hallazgo "RLS Disabled in Public" del Security Advisor sin
-- exigir login en el CLI. Idempotente para poder re-correr el schema.
alter table context_events enable row level security;

drop policy if exists "context_events_select" on context_events;
create policy "context_events_select"
  on context_events for select
  using (true);

drop policy if exists "context_events_insert" on context_events;
create policy "context_events_insert"
  on context_events for insert
  with check (true);

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
