-- ==============================================================================
-- SIGEC-LP — Anulación trazable de eventos de partido
-- Los eventos NO se borran: se marcan como anulados con motivo, autor y hora,
-- y el marcador del partido se recalcula a partir de los goles vigentes.
-- La anulación solo es posible mediante la función anular_evento_partido()
-- (no existe política UPDATE directa sobre eventos_partido).
-- ==============================================================================

alter table public.eventos_partido
  add column if not exists anulado boolean not null default false,
  add column if not exists anulado_en timestamptz,
  add column if not exists anulado_por uuid references auth.users(id),
  add column if not exists motivo_anulacion text;

create index if not exists eventos_partido_partido_vigentes_idx
  on public.eventos_partido (partido_id) where not anulado;

-- Recalcula goles_local / goles_visitante desde los goles vigentes.
-- gol y gol_penal suman al club del evento; autogol suma al rival.
create or replace function public.recalcular_marcador_partido(p_partido uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare
  v_local uuid;
  v_visitante uuid;
begin
  select local_id, visitante_id into v_local, v_visitante
  from public.partidos where id = p_partido;

  if v_local is null then
    return;
  end if;

  update public.partidos p set
    goles_local = (
      select count(*) from public.eventos_partido e
      where e.partido_id = p_partido and not e.anulado
        and ((e.tipo in ('gol', 'gol_penal') and e.club_id = v_local)
          or (e.tipo = 'autogol' and e.club_id = v_visitante))
    ),
    goles_visitante = (
      select count(*) from public.eventos_partido e
      where e.partido_id = p_partido and not e.anulado
        and ((e.tipo in ('gol', 'gol_penal') and e.club_id = v_visitante)
          or (e.tipo = 'autogol' and e.club_id = v_local))
    )
  where p.id = p_partido;
end;
$$;

-- Anula un evento identificado por su client_uuid (el uid generado en la consola).
create or replace function public.anular_evento_partido(p_client_uuid uuid, p_motivo text)
returns public.eventos_partido
language plpgsql security definer set search_path = '' as $$
declare
  v_evento public.eventos_partido;
  v_estado public.partido_estado;
  v_resultado public.eventos_partido;
begin
  if coalesce(trim(p_motivo), '') = '' then
    raise exception 'El motivo de anulación es obligatorio';
  end if;

  select * into v_evento from public.eventos_partido where client_uuid = p_client_uuid for update;
  if not found then
    raise exception 'Evento no encontrado';
  end if;

  if not (public.tiene_rol('DIR_COMP') or public.es_oficial_partido(v_evento.partido_id)) then
    raise exception 'No autorizado para anular eventos de este partido';
  end if;

  select estado into v_estado from public.partidos where id = v_evento.partido_id;
  if v_estado in ('oficializado', 'anulado') then
    raise exception 'El acta del partido está cerrada; no se pueden anular eventos';
  end if;

  if v_evento.anulado then
    return v_evento;
  end if;

  update public.eventos_partido set
    anulado = true,
    anulado_en = now(),
    anulado_por = auth.uid(),
    motivo_anulacion = trim(p_motivo)
  where id = v_evento.id
  returning * into v_resultado;

  insert into public.audit_log (tabla, registro_id, accion, antes, despues, usuario)
  values ('eventos_partido', v_evento.id, 'anular', to_jsonb(v_evento), to_jsonb(v_resultado), auth.uid());

  perform public.recalcular_marcador_partido(v_evento.partido_id);

  return v_resultado;
end;
$$;

revoke all on function public.anular_evento_partido(uuid, text) from public, anon;
grant execute on function public.anular_evento_partido(uuid, text) to authenticated;
revoke all on function public.recalcular_marcador_partido(uuid) from public, anon, authenticated;
