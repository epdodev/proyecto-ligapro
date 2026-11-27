-- ==============================================================================
-- SIGEC-LP — Tabla de perfiles de usuario (profiles)
-- Usada por el editor "Mi Perfil" (src/lib/interactive.js → guardarCambiosPerfil).
-- Cada usuario solo puede leer y modificar su propio perfil.
-- ==============================================================================

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text,
  club text,
  cargo text,
  cedula text,
  avatar_url text,
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "Usuario lee su propio perfil" on public.profiles;
create policy "Usuario lee su propio perfil" on public.profiles
  for select to authenticated
  using ((select auth.uid()) = id);

drop policy if exists "Usuario crea su propio perfil" on public.profiles;
create policy "Usuario crea su propio perfil" on public.profiles
  for insert to authenticated
  with check ((select auth.uid()) = id);

drop policy if exists "Usuario actualiza su propio perfil" on public.profiles;
create policy "Usuario actualiza su propio perfil" on public.profiles
  for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);
