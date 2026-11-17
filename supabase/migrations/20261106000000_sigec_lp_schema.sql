-- ==============================================================================
-- SIGEC-LP — Sistema Integral de Gestión de Competiciones de LigaPro Ecuador
-- Migración Inicial: Esquema de Base de Datos, Funciones RLS, Triggers y Vistas
-- Cumplimiento: IEEE Std 830-1998 / Reglamento de Competiciones LigaPro (Julio 2023)
-- ==============================================================================

create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ==============================================================================
-- 1. TIPOS ENUMERADOS (Sección 4.2 SRS)
-- ==============================================================================

do $$ begin
  if not exists (select 1 from pg_type where typname = 'temporada_estado') then
    create type public.temporada_estado as enum ('borrador', 'activa', 'cerrada');
  end if;
  if not exists (select 1 from pg_type where typname = 'serie_tipo') then
    create type public.serie_tipo as enum ('A', 'B', 'COPA');
  end if;
  if not exists (select 1 from pg_type where typname = 'fase_tipo') then
    create type public.fase_tipo as enum ('liga', 'grupos', 'eliminatoria', 'final');
  end if;
  if not exists (select 1 from pg_type where typname = 'partido_estado') then
    create type public.partido_estado as enum (
      'programado', 'en_juego', 'suspendido_provisional',
      'suspendido_definitivo', 'finalizado', 'oficializado',
      'resultado_administrativo', 'reprogramado', 'anulado'
    );
  end if;
  if not exists (select 1 from pg_type where typname = 'evento_tipo') then
    create type public.evento_tipo as enum (
      'saque_inicial', 'gol', 'gol_penal', 'autogol', 'amarilla',
      'segunda_amarilla', 'roja', 'sustitucion',
      'hidratacion_inicio', 'hidratacion_fin', 'fin_periodo', 'tanda_penal'
    );
  end if;
  if not exists (select 1 from pg_type where typname = 'cesped_tipo') then
    create type public.cesped_tipo as enum ('natural', 'artificial');
  end if;
  if not exists (select 1 from pg_type where typname = 'calificacion_estado') then
    create type public.calificacion_estado as enum ('calificado', 'condicionado', 'no_calificado');
  end if;
  if not exists (select 1 from pg_type where typname = 'infraccion_estado') then
    create type public.infraccion_estado as enum ('propuesta', 'en_revision', 'confirmada', 'anulada', 'notificada', 'cobrada');
  end if;
  if not exists (select 1 from pg_type where typname = 'unidad_multa') then
    create type public.unidad_multa as enum ('USD', 'SBU', 'UDM', 'DEPORTIVA');
  end if;
  if not exists (select 1 from pg_type where typname = 'app_rol') then
    create type public.app_rol as enum (
      'ADM_SIS', 'DIR_COMP', 'DIR_ARB', 'DIR_ESC', 'DIR_ECO',
      'COM_DISC', 'COM_DIRECT', 'COMISARIO', 'DEL_SEG', 'OF_PATR',
      'COORD', 'OF_VAR', 'MED_CAMPO', 'ARBITRO', 'CNA_FEF', 'CM_FEF',
      'CLUB_ADMIN', 'CLUB_DT'
    );
  end if;
end $$;

-- ==============================================================================
-- 2. TABLAS PRINCIPALES (Sección 4.3 SRS)
-- ==============================================================================

-- Versiones de Reglamento y Parámetros
create table if not exists public.reglamento_versiones (
  id uuid primary key default gen_random_uuid(),
  codigo text not null unique,
  resolucion text,
  vigente_desde date not null,
  parametros jsonb not null default '{}'::jsonb,
  creado_en timestamptz not null default now(),
  creado_por uuid references auth.users(id)
);

-- Temporadas
create table if not exists public.temporadas (
  id uuid primary key default gen_random_uuid(),
  anio smallint not null unique,
  nombre text not null,
  fecha_inicio date,
  fecha_fin date,
  estado public.temporada_estado not null default 'borrador',
  reglamento_version_id uuid not null references public.reglamento_versiones(id)
);

-- Competiciones (LigaPro Serie A, Serie B, etc.)
create table if not exists public.competiciones (
  id uuid primary key default gen_random_uuid(),
  temporada_id uuid not null references public.temporadas(id) on delete cascade,
  serie public.serie_tipo not null,
  nombre text not null,
  perfil_formato text not null,
  reglas jsonb not null default '{}'::jsonb,
  unique (temporada_id, nombre)
);

-- Fases del Torneo (Fase 1, Fase 2, Finales)
create table if not exists public.fases (
  id uuid primary key default gen_random_uuid(),
  competicion_id uuid not null references public.competiciones(id) on delete cascade,
  orden smallint not null,
  nombre text not null,
  tipo public.fase_tipo not null,
  ruedas smallint not null default 1,
  ida_vuelta boolean not null default false,
  reinicia_puntos boolean not null default true,
  alimenta_acumulada boolean not null default false,
  reinicia_amarillas boolean not null default true,
  criterios_desempate text[] not null default '{"PTS","DG","GF","H2H_PARTIDO","SORTEO"}',
  reglas jsonb not null default '{}'::jsonb,
  unique (competicion_id, orden)
);

-- Clubes
create table if not exists public.clubes (
  id uuid primary key default gen_random_uuid(),
  nombre text not null unique,
  nombre_corto text not null,
  ciudad text,
  provincia text,
  es_filial boolean not null default false,
  club_matriz_id uuid references public.clubes(id),
  escudo_path text,
  correos_oficiales text[] not null default '{}',
  activo boolean not null default true,
  check (not es_filial or club_matriz_id is not null)
);

-- Escenarios Deportivos (Estadios)
create table if not exists public.estadios (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  ciudad text not null,
  capacidad integer check (capacidad > 0),
  tipo_cesped public.cesped_tipo not null,
  lat numeric(9,6),
  lng numeric(9,6),
  hospital_referencia text,
  minutos_hospital smallint check (minutos_hospital >= 0)
);

-- Calificaciones Técnicas y VAR de Escenarios
create table if not exists public.calificaciones_estadio (
  id uuid primary key default gen_random_uuid(),
  estadio_id uuid not null references public.estadios(id) on delete cascade,
  temporada_id uuid not null references public.temporadas(id) on delete cascade,
  estado public.calificacion_estado not null default 'no_calificado',
  checklist jsonb not null default '{}'::jsonb,
  quality_pro_vence date,
  var_certificado_en date,
  var_certificado_por text[],
  observaciones text,
  unique (estadio_id, temporada_id)
);

-- Inscripciones de Clubes a Competiciones
create table if not exists public.inscripciones (
  id uuid primary key default gen_random_uuid(),
  competicion_id uuid not null references public.competiciones(id) on delete cascade,
  club_id uuid not null references public.clubes(id),
  estadio_localia_id uuid references public.estadios(id),
  habilitado boolean not null default false,
  checklist_habilitacion jsonb not null default '{}'::jsonb,
  unique (competicion_id, club_id)
);

-- Personas (Jugadores, DTs, Oficiales, Árbitros)
create table if not exists public.personas (
  id uuid primary key default gen_random_uuid(),
  nombres text not null,
  apellidos text not null,
  fecha_nacimiento date,
  nacionalidad text,
  doc_tipo text check (doc_tipo in ('cedula', 'pasaporte', 'licencia')),
  doc_numero text,
  foto_path text,
  comet_id text unique,
  user_id uuid unique references auth.users(id)
);

-- Plantillas de Clubes (Inscripción de personas por competición)
create table if not exists public.plantillas (
  id uuid primary key default gen_random_uuid(),
  inscripcion_id uuid not null references public.inscripciones(id) on delete cascade,
  persona_id uuid not null references public.personas(id) on delete cascade,
  funcion text not null check (funcion in ('jugador','dt','asistente','preparador_fisico','medico','kinesiologo','auxiliar','otro')),
  dorsal smallint check (dorsal between 1 and 99),
  nombre_camiseta text,
  apodo_aprobado boolean not null default false,
  habilitado boolean not null default false,
  unique (inscripcion_id, persona_id)
);
create unique index if not exists plantillas_dorsal_unico on public.plantillas (inscripcion_id, dorsal) where dorsal is not null;

-- Uniformes Oficiales Registrados
create table if not exists public.uniformes (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubes(id) on delete cascade,
  temporada_id uuid not null references public.temporadas(id) on delete cascade,
  categoria text not null check (categoria in ('jugador', 'arquero')),
  tipo text not null check (tipo in ('principal', 'alterno_1', 'alterno_2', 'alterno_3')),
  color_camiseta char(7) not null,
  color_pantaloneta char(7) not null,
  color_medias char(7) not null,
  foto_path text,
  aprobado_en timestamptz,
  utilizable_desde date,
  unique (club_id, temporada_id, categoria, tipo)
);

-- Jornadas
create table if not exists public.jornadas (
  id uuid primary key default gen_random_uuid(),
  fase_id uuid not null references public.fases(id) on delete cascade,
  numero smallint not null,
  horario_unificado boolean not null default false,
  unique (fase_id, numero)
);

-- Partidos
create table if not exists public.partidos (
  id uuid primary key default gen_random_uuid(),
  fase_id uuid not null references public.fases(id),
  jornada_id uuid references public.jornadas(id),
  grupo text,
  llave text,
  pierna smallint check (pierna in (1, 2)),
  local_id uuid not null references public.clubes(id),
  visitante_id uuid not null references public.clubes(id),
  estadio_id uuid references public.estadios(id),
  inicio_programado timestamptz,
  notificado_en timestamptz,
  estado public.partido_estado not null default 'programado',
  goles_local smallint default 0,
  goles_visitante smallint default 0,
  penales_local smallint,
  penales_visitante smallint,
  es_administrativo boolean not null default false,
  sin_publico boolean not null default false,
  partido_origen_id uuid references public.partidos(id),
  oficializado_en timestamptz,
  oficializado_por uuid references auth.users(id),
  check (local_id <> visitante_id)
);
create index if not exists partidos_fase_estado_idx on public.partidos (fase_id, estado);
create index if not exists partidos_inicio_idx on public.partidos (inicio_programado);

-- Designaciones Oficiales (Árbitros, Comisarios, Médicos, VOR)
create table if not exists public.designaciones (
  id uuid primary key default gen_random_uuid(),
  partido_id uuid not null references public.partidos(id) on delete cascade,
  persona_id uuid not null references public.personas(id),
  rol text not null check (rol in (
    'arbitro_central','asistente_1','asistente_2','cuarto_arbitro',
    'var','avar','asesor','oficial_dopaje','comisario',
    'delegado_seguridad','oficial_patrocinio','coordinador',
    'medico_campo','oficial_var'
  )),
  designado_por text not null check (designado_por in ('CNA_FEF','CM_FEF','LIGAPRO')),
  credencial_revocada boolean not null default false,
  unique (partido_id, rol, persona_id)
);

-- Planillas Oficiales de Juego
create table if not exists public.planillas (
  id uuid primary key default gen_random_uuid(),
  partido_id uuid not null references public.partidos(id) on delete cascade,
  club_id uuid not null references public.clubes(id),
  estado text not null default 'borrador' check (estado in ('borrador','entregada','rechazada')),
  entregada_en timestamptz,
  firmada_por uuid references public.personas(id),
  firma_path text,
  sha256 text,
  unique (partido_id, club_id)
);

-- Items de Planilla (Jugadores y Cuerpo Técnico Presentados)
create table if not exists public.planilla_items (
  id uuid primary key default gen_random_uuid(),
  planilla_id uuid not null references public.planillas(id) on delete cascade,
  plantilla_id uuid not null references public.plantillas(id),
  condicion text not null check (condicion in ('titular','suplente','staff')),
  identificado boolean default false,
  identificado_en timestamptz,
  reemplaza_a uuid references public.planilla_items(id),
  inhabilitado_para_partido boolean not null default false,
  unique (planilla_id, plantilla_id)
);

-- Eventos del Partido (Timeline en vivo)
create table if not exists public.eventos_partido (
  id uuid primary key default gen_random_uuid(),
  partido_id uuid not null references public.partidos(id) on delete cascade,
  tipo public.evento_tipo not null,
  periodo smallint not null check (periodo between 1 and 5),
  minuto smallint,
  minuto_adicional smallint not null default 0,
  club_id uuid references public.clubes(id),
  persona_id uuid references public.personas(id),
  persona_sale_id uuid references public.personas(id),
  detalle jsonb not null default '{}'::jsonb,
  registrado_por uuid references auth.users(id),
  ts_dispositivo timestamptz not null default now(),
  ts_servidor timestamptz not null default now(),
  client_uuid uuid unique
);

-- Checklist Pre-Partido del Comisario
create table if not exists public.checklist_partido (
  id uuid primary key default gen_random_uuid(),
  partido_id uuid not null references public.partidos(id) on delete cascade,
  item_codigo text not null,
  cumple boolean,
  valor text,
  hora_registro timestamptz not null default now(),
  evidencia_path text,
  observacion text,
  registrado_por uuid references auth.users(id),
  unique (partido_id, item_codigo)
);

-- Incidentes durante el Partido
create table if not exists public.incidentes (
  id uuid primary key default gen_random_uuid(),
  partido_id uuid not null references public.partidos(id) on delete cascade,
  tipo text not null,
  minuto smallint,
  hora timestamptz not null default now(),
  sector text not null,
  descripcion text not null,
  club_responsable_id uuid references public.clubes(id),
  nivel_advertencia smallint check (nivel_advertencia between 1 and 3),
  evidencias text[] not null default '{}',
  reportado_por uuid references auth.users(id)
);

-- Instantáneas de Suspensión (Art. 73, 74, 79a)
create table if not exists public.instantaneas_suspension (
  id uuid primary key default gen_random_uuid(),
  partido_id uuid not null unique references public.partidos(id),
  causa text not null,
  articulo text not null,
  estado jsonb not null,
  responsable_club_id uuid references public.clubes(id),
  fuerza_mayor boolean not null default false,
  creado_en timestamptz not null default now()
);

-- Expedientes Disciplinarios
create table if not exists public.expedientes (
  id uuid primary key default gen_random_uuid(),
  numero text not null unique,
  estado text not null default 'abierto' check (estado in ('abierto','en_tramite','resuelto','archivado')),
  resolucion text,
  resolucion_path text,
  fecha_resolucion date
);

-- Suspensiones de Personas (Jugadores / Staff)
create table if not exists public.suspensiones (
  id uuid primary key default gen_random_uuid(),
  persona_id uuid not null references public.personas(id),
  competicion_id uuid not null references public.competiciones(id),
  origen text not null check (origen in ('acumulacion_amarillas','expulsion','resolucion','heredada')),
  partidos_total smallint not null check (partidos_total > 0),
  partidos_cumplidos smallint not null default 0,
  partido_origen_id uuid references public.partidos(id),
  expediente_id uuid references public.expedientes(id),
  estado text not null default 'vigente' check (estado in ('vigente','cumplida','anulada'))
);

-- Catálogo Oficial de Infracciones
create table if not exists public.infracciones_catalogo (
  codigo text primary key,
  articulo text not null,
  descripcion text not null,
  monto numeric(12,2) not null,
  unidad public.unidad_multa not null,
  modo text not null check (modo in ('por_evento','por_unidad')),
  tope numeric(12,2),
  aplica_reincidencia_disp5 boolean not null default false,
  regla_reincidencia jsonb
);

-- Infracciones Registradas
create table if not exists public.infracciones (
  id uuid primary key default gen_random_uuid(),
  codigo text not null references public.infracciones_catalogo(codigo),
  partido_id uuid references public.partidos(id),
  club_id uuid references public.clubes(id),
  persona_id uuid references public.personas(id),
  cantidad smallint not null default 1,
  es_reincidencia boolean not null default false,
  monto_usd numeric(12,2),
  estado public.infraccion_estado not null default 'propuesta',
  origen_tipo text,
  origen_id uuid,
  expediente_id uuid references public.expedientes(id),
  creado_en timestamptz not null default now()
);

-- Movimientos de Cuenta Corriente de Clubes
create table if not exists public.movimientos_cuenta (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubes(id),
  fecha date not null default current_date,
  concepto text not null,
  monto_usd numeric(12,2) not null,
  referencia_tipo text not null,
  referencia_id uuid not null
);

-- Roles de Usuarios (Control de Acceso)
create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  rol public.app_rol not null,
  temporada_id uuid references public.temporadas(id),
  club_id uuid references public.clubes(id),
  partido_id uuid references public.partidos(id),
  vigente_desde date not null default current_date,
  vigente_hasta date
);

-- ==============================================================================
-- 3. TABLAS COMPLEMENTARIAS (Sección 4.3 SRS)
-- ==============================================================================

create table if not exists public.informes (
  id uuid primary key default gen_random_uuid(),
  partido_id uuid not null references public.partidos(id) on delete cascade,
  rol text not null,
  contenido jsonb not null default '{}'::jsonb,
  pdf_path text,
  sha256 text,
  enviado_en timestamptz default now(),
  adenda_de uuid references public.informes(id)
);

create table if not exists public.tramites (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubes(id),
  tipo text not null,
  payload jsonb not null default '{}'::jsonb,
  estado text not null default 'pendiente' check (estado in ('pendiente','en_revision','aprobado','rechazado')),
  fecha_solicitud timestamptz not null default now(),
  plazo_vencimiento timestamptz,
  resolucion text,
  resuelto_por uuid references auth.users(id),
  resuelto_en timestamptz
);

create table if not exists public.notificaciones (
  id uuid primary key default gen_random_uuid(),
  destinatarios text[] not null default '{}',
  asunto text not null,
  cuerpo text not null,
  hash_contenido text,
  estado_entrega text not null default 'enviado',
  creado_en timestamptz not null default now()
);

create table if not exists public.ventanas_fifa (
  id uuid primary key default gen_random_uuid(),
  temporada_id uuid not null references public.temporadas(id) on delete cascade,
  desde date not null,
  hasta date not null,
  descripcion text
);

create table if not exists public.sorteos (
  id uuid primary key default gen_random_uuid(),
  fase_id uuid references public.fases(id),
  clubes_ids uuid[] not null default '{}',
  resultado jsonb not null default '{}'::jsonb,
  acta_path text,
  realizado_en timestamptz not null default now()
);

create table if not exists public.ajustes_puntos (
  id uuid primary key default gen_random_uuid(),
  fase_id uuid not null references public.fases(id),
  club_id uuid not null references public.clubes(id),
  puntos_ajuste integer not null default 0,
  goles_ajuste integer not null default 0,
  motivo text not null,
  expediente_id uuid references public.expedientes(id),
  fecha_ajuste date not null default current_date
);

create table if not exists public.tablas_snapshot (
  id uuid primary key default gen_random_uuid(),
  fase_id uuid not null references public.fases(id),
  tipo text not null check (tipo in ('fase', 'acumulada')),
  filas jsonb not null default '[]'::jsonb,
  calculado_en timestamptz not null default now()
);

create table if not exists public.pasabolas (
  id uuid primary key default gen_random_uuid(),
  partido_id uuid not null references public.partidos(id) on delete cascade,
  nombre text not null,
  anio_nacimiento smallint not null,
  posicion text
);

create table if not exists public.actas_camerino (
  id uuid primary key default gen_random_uuid(),
  partido_id uuid not null references public.partidos(id) on delete cascade,
  club_id uuid not null references public.clubes(id),
  tipo text not null check (tipo in ('entrega', 'recepcion')),
  estado_instalaciones text not null,
  danos_detectados text,
  firmado_por text,
  fecha_hora timestamptz not null default now()
);

create table if not exists public.accesos_vor (
  id uuid primary key default gen_random_uuid(),
  partido_id uuid not null references public.partidos(id) on delete cascade,
  persona_id uuid not null references public.personas(id),
  hora_ingreso timestamptz not null default now(),
  hora_salida timestamptz,
  autorizado_por text
);

create table if not exists public.reuniones (
  id uuid primary key default gen_random_uuid(),
  partido_id uuid not null references public.partidos(id) on delete cascade,
  tipo text not null check (tipo in ('uniformes', 'coordinacion', 'seguridad')),
  asistentes jsonb not null default '[]'::jsonb,
  acta_path text,
  hora_inicio timestamptz not null default now(),
  hora_fin timestamptz
);

create table if not exists public.audit_log (
  id uuid primary key default gen_random_uuid(),
  tabla text not null,
  registro_id uuid,
  accion text not null,
  antes jsonb,
  despues jsonb,
  usuario uuid references auth.users(id),
  ts timestamptz not null default now()
);

-- ==============================================================================
-- 4. FUNCIONES AUXILIARES DE RLS (Sección 4.4 SRS)
-- ==============================================================================

create or replace function public.tiene_rol(p_rol public.app_rol)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.user_roles ur
    where ur.user_id = auth.uid()
      and ur.rol = p_rol
      and current_date between ur.vigente_desde and coalesce(ur.vigente_hasta, 'infinity'::date)
  );
$$;

create or replace function public.es_admin_club(p_club uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.user_roles ur
    where ur.user_id = auth.uid() and ur.rol = 'CLUB_ADMIN' and ur.club_id = p_club
  );
$$;

create or replace function public.es_oficial_partido(p_partido uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.designaciones d
    join public.personas p on p.id = d.persona_id
    where d.partido_id = p_partido and p.user_id = auth.uid() and not d.credencial_revocada
  );
$$;

-- ==============================================================================
-- 5. POLÍTICAS RLS (Row Level Security)
-- ==============================================================================

alter table public.reglamento_versiones enable row level security;
alter table public.temporadas enable row level security;
alter table public.competiciones enable row level security;
alter table public.fases enable row level security;
alter table public.clubes enable row level security;
alter table public.estadios enable row level security;
alter table public.calificaciones_estadio enable row level security;
alter table public.inscripciones enable row level security;
alter table public.personas enable row level security;
alter table public.plantillas enable row level security;
alter table public.uniformes enable row level security;
alter table public.jornadas enable row level security;
alter table public.partidos enable row level security;
alter table public.designaciones enable row level security;
alter table public.planillas enable row level security;
alter table public.planilla_items enable row level security;
alter table public.eventos_partido enable row level security;
alter table public.checklist_partido enable row level security;
alter table public.incidentes enable row level security;
alter table public.infracciones_catalogo enable row level security;
alter table public.infracciones enable row level security;
alter table public.tramites enable row level security;
alter table public.tablas_snapshot enable row level security;

-- Políticas de lectura pública para datos del torneo
create policy "Lectura pública de versiones de reglamento" on public.reglamento_versiones for select to anon, authenticated using (true);
create policy "Lectura pública de temporadas" on public.temporadas for select to anon, authenticated using (true);
create policy "Lectura pública de competiciones" on public.competiciones for select to anon, authenticated using (true);
create policy "Lectura pública de fases" on public.fases for select to anon, authenticated using (true);
create policy "Lectura pública de clubes" on public.clubes for select to anon, authenticated using (true);
create policy "Lectura pública de estadios" on public.estadios for select to anon, authenticated using (true);
create policy "Lectura pública de calificaciones de estadio" on public.calificaciones_estadio for select to anon, authenticated using (true);
create policy "Lectura pública de uniformes" on public.uniformes for select to anon, authenticated using (true);
create policy "Lectura pública de jornadas" on public.jornadas for select to anon, authenticated using (true);
create policy "Lectura pública de catálogo de infracciones" on public.infracciones_catalogo for select to anon, authenticated using (true);
create policy "Lectura pública de snapshots de tablas" on public.tablas_snapshot for select to anon, authenticated using (true);

-- Partidos: lectura pública si no está anulado; escritura DIR_COMP
create policy "Lectura pública de partidos" on public.partidos for select to anon, authenticated using (estado <> 'anulado');
create policy "Escritura de partidos por dirección" on public.partidos for all to authenticated using (public.tiene_rol('DIR_COMP')) with check (public.tiene_rol('DIR_COMP'));

-- Planillas: RLS estricta (Art. 45)
create policy "Lectura de planillas por rol" on public.planillas for select to authenticated using (
  public.tiene_rol('DIR_COMP')
  or public.es_oficial_partido(partido_id)
  or public.es_admin_club(club_id)
  or (estado = 'entregada' and exists (
    select 1 from public.partidos pa
    where pa.id = partido_id and (public.es_admin_club(pa.local_id) or public.es_admin_club(pa.visitante_id))
  ))
);

create policy "Creación de planilla por club en borrador" on public.planillas for insert to authenticated
  with check (public.es_admin_club(club_id) and estado = 'borrador');

create policy "Modificación de planilla en borrador" on public.planillas for update to authenticated
  using (estado = 'borrador' and (public.es_admin_club(club_id) or public.es_oficial_partido(partido_id)))
  with check (public.es_admin_club(club_id) or public.es_oficial_partido(partido_id));

-- Eventos de partido: lectura pública en vivo; escritura comisario u oficial designado
create policy "Lectura pública de eventos" on public.eventos_partido for select to anon, authenticated using (true);
create policy "Registro de eventos por oficiales o directores" on public.eventos_partido for insert to authenticated
  with check (public.tiene_rol('DIR_COMP') or public.es_oficial_partido(partido_id));

-- Trámites de clubes
create policy "Lectura de trámites por club o dirección" on public.tramites for select to authenticated
  using (public.tiene_rol('DIR_COMP') or public.es_admin_club(club_id));
create policy "Inserción de trámites por club" on public.tramites for insert to authenticated
  with check (public.es_admin_club(club_id));

-- ==============================================================================
-- 6. TRIGGERS DE INTEGRIDAD (Sección 4.5 SRS)
-- ==============================================================================

-- Planilla entregada es inmutable (Art. 45)
create or replace function public.bloquear_planilla_entregada()
returns trigger language plpgsql as $$
begin
  if old.estado = 'entregada' then
    raise exception 'La planilla ya fue entregada y no puede modificarse (Art. 45)';
  end if;
  return new;
end $$;

drop trigger if exists trg_planilla_inmutable on public.planillas;
create trigger trg_planilla_inmutable
  before update on public.planillas
  for each row execute function public.bloquear_planilla_entregada();

-- Proteger items de planilla tras la entrega
create or replace function public.proteger_items_planilla()
returns trigger language plpgsql as $$
declare
  v_estado text;
begin
  select estado into v_estado from public.planillas
  where id = coalesce(new.planilla_id, old.planilla_id);

  if v_estado = 'entregada' then
    if tg_op in ('INSERT', 'DELETE') then
      raise exception 'Composición de planilla inmutable tras la entrega (Art. 45)';
    elsif new.plantilla_id is distinct from old.plantilla_id
       or new.condicion is distinct from old.condicion then
      raise exception 'Composición de planilla inmutable tras la entrega (Art. 45)';
    end if;
  end if;

  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end $$;

drop trigger if exists trg_items_planilla on public.planilla_items;
create trigger trg_items_planilla
  before insert or update or delete on public.planilla_items
  for each row execute function public.proteger_items_planilla();

-- ==============================================================================
-- 7. VISTA BASE DE ESTADÍSTICAS (Sección 4.6 SRS)
-- ==============================================================================

create or replace view public.v_estadisticas_fase as
with r as (
  select p.fase_id, p.local_id as club_id,
         coalesce(p.goles_local, 0) as gf,
         coalesce(p.goles_visitante, 0) as gc,
         0 as gf_visitante
  from public.partidos p
  where p.estado in ('oficializado', 'resultado_administrativo')
  union all
  select p.fase_id, p.visitante_id,
         coalesce(p.goles_visitante, 0),
         coalesce(p.goles_local, 0),
         coalesce(p.goles_visitante, 0)
  from public.partidos p
  where p.estado in ('oficializado', 'resultado_administrativo')
)
select fase_id, club_id,
       count(*) as pj,
       count(*) filter (where gf > gc) as pg,
       count(*) filter (where gf = gc) as pe,
       count(*) filter (where gf < gc) as pp,
       coalesce(sum(gf), 0) as gf,
       coalesce(sum(gc), 0) as gc,
       coalesce(sum(gf - gc), 0) as dg,
       coalesce(sum(gf_visitante), 0) as gf_visitante
from r
group by fase_id, club_id;
