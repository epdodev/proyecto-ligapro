-- ==============================================================================
-- SIGEC-LP — Datos Semilla (Seed Data)
-- Temporada Oficial LigaPro Ecuabet 2025 / Perfil Reglamentario 2023
-- ==============================================================================

-- 1. Versión de Reglamento y Parámetros
insert into public.reglamento_versiones (id, codigo, resolucion, vigente_desde, parametros)
values (
  '11111111-1111-1111-1111-111111111111',
  'LIGAPRO-2023-07',
  'Resolución Consejo de Presidentes Acta No. 2023-04',
  '2023-07-01',
  '{
    "puntos": { "victoria": 3, "empate": 1, "derrota": 0 },
    "prog": { "notificacion_min_dias": 15, "cambio_estadio_min_dias": 30, "postergacion_ventana_h": 48 },
    "pre": { "reunion_uniformes_min_h": 48, "uniforme_nuevo_espera_dias": 7, "pasabolas_cantidades": [8, 12] },
    "ops": { "llegada_estadio_min": 90, "balones_min": 12, "sustituciones_max": 5, "ventanas_max": 3 },
    "est": { "cesped_altura_mm": [20, 25], "hospital_max_min": 15 },
    "var": { "internet_min_mbps": 100, "voltaje": 220, "altura_camaras_min_m": 7 },
    "dis": { "amarillas_suspension": 5, "suspension_roja_provisional": 1, "multa_amarilla_usd": 20, "multa_expulsion_usd": 100 }
  }'::jsonb
) on conflict (codigo) do nothing;

-- 2. Temporada Activa
insert into public.temporadas (id, anio, nombre, fecha_inicio, fecha_fin, estado, reglamento_version_id)
values (
  '22222222-2222-2222-2222-222222222222',
  2025,
  'Temporada LigaPro Ecuabet 2025',
  '2025-02-15',
  '2025-12-15',
  'activa',
  '11111111-1111-1111-1111-111111111111'
) on conflict (anio) do nothing;

-- 3. Competiciones
insert into public.competiciones (id, temporada_id, serie, nombre, perfil_formato, reglas)
values
(
  '33333333-3333-3333-3333-333333333331',
  '22222222-2222-2222-2222-222222222222',
  'A',
  'LigaPro Ecuabet Serie A',
  'REGLAMENTO_2023_A',
  '{"cupos_libertadores": 4, "cupos_sudamericana": 4, "descensos": 2}'::jsonb
),
(
  '33333333-3333-3333-3333-333333333332',
  '22222222-2222-2222-2222-222222222222',
  'B',
  'LigaPro Ecuabet Serie B',
  'REGLAMENTO_2023_B',
  '{"ascensos": 2, "descensos": 2}'::jsonb
) on conflict (temporada_id, nombre) do nothing;

-- 4. Fases Serie A
insert into public.fases (id, competicion_id, orden, nombre, tipo, ruedas, criterios_desempate, reglas)
values
(
  '44444444-4444-4444-4444-444444444441',
  '33333333-3333-3333-3333-333333333331',
  1,
  'Fase Uno',
  'liga',
  1,
  '{"PTS","DG","GF","H2H_PARTIDO","SORTEO"}',
  '{"clasifica_final": true, "cupo_libertadores": true}'::jsonb
),
(
  '44444444-4444-4444-4444-444444444442',
  '33333333-3333-3333-3333-333333333331',
  2,
  'Fase Dos',
  'liga',
  1,
  '{"PTS","DG","GF","H2H_PARTIDO","SORTEO"}',
  '{"clasifica_final": true, "cupo_libertadores": true}'::jsonb
),
(
  '44444444-4444-4444-4444-444444444443',
  '33333333-3333-3333-3333-333333333331',
  3,
  'Fase Final',
  'final',
  1,
  '{"PTS","DG","PENALES"}',
  '{"ida_vuelta": true}'::jsonb
) on conflict (competicion_id, orden) do nothing;

-- 5. Estadios Oficiales
insert into public.estadios (id, nombre, ciudad, capacidad, tipo_cesped, lat, lng, hospital_referencia, minutos_hospital)
values
('55555555-5555-5555-5555-555555555501', 'Estadio Rodrigo Paz Delgado', 'Quito', 41575, 'natural', -0.107567, -78.489111, 'Hospital Metropolitano', 12),
('55555555-5555-5555-5555-555555555502', 'Estadio Monumental Banco Pichincha', 'Guayaquil', 59283, 'natural', -2.185264, -79.924844, 'Hospital Luis Vernaza', 14),
('55555555-5555-5555-5555-555555555503', 'Estadio Banco Guayaquil', 'Sangolquí', 12000, 'natural', -0.301389, -78.435833, 'Hospital San Rafael', 8),
('55555555-5555-5555-5555-555555555504', 'Estadio George Capwell', 'Guayaquil', 40000, 'natural', -2.207222, -79.892778, 'Hospital Teodoro Maldonado', 10),
('55555555-5555-5555-5555-555555555505', 'Estadio Olímpico Atahualpa', 'Quito', 35258, 'natural', -0.177222, -78.477778, 'Hospital Eugenio Espejo', 9),
('55555555-5555-5555-5555-555555555506', 'Estadio Gonzalo Pozo Ripalda', 'Quito', 18799, 'natural', -0.279722, -78.544722, 'Hospital del Sur', 11),
('55555555-5555-5555-5555-555555555507', 'Estadio 9 de Mayo', 'Machala', 16500, 'natural', -3.256111, -79.957500, 'Hospital Teófilo Dávila', 7),
('55555555-5555-5555-5555-555555555508', 'Estadio Jocay', 'Manta', 22000, 'natural', -0.957222, -80.706389, 'Hospital Rodríguez Zambrano', 6)
on conflict (id) do nothing;

-- 6. Calificaciones de Estadio
insert into public.calificaciones_estadio (estadio_id, temporada_id, estado, checklist, var_certificado_en, var_certificado_por, observaciones)
values
('55555555-5555-5555-5555-555555555501', '22222222-2222-2222-2222-222222222222', 'calificado', '{"cesped_mm": 23, "iluminacion_lux": 1800, "vor_aprobado": true, "hospital_min": 12, "sala_dopaje": true}'::jsonb, '2025-01-20', '{"FIFA","CONMEBOL","LIGAPRO"}', 'Cancha en óptimo estado. Sistema VAR 100% operativo.'),
('55555555-5555-5555-5555-555555555502', '22222222-2222-2222-2222-222222222222', 'calificado', '{"cesped_mm": 22, "iluminacion_lux": 1950, "vor_aprobado": true, "hospital_min": 14, "sala_dopaje": true}'::jsonb, '2025-01-18', '{"FIFA","CONMEBOL","LIGAPRO"}', 'Certificación VAR Clase A.'),
('55555555-5555-5555-5555-555555555503', '22222222-2222-2222-2222-222222222222', 'calificado', '{"cesped_mm": 24, "iluminacion_lux": 1700, "vor_aprobado": true, "hospital_min": 8, "sala_dopaje": true}'::jsonb, '2025-01-15', '{"FIFA","LIGAPRO"}', 'Cumplimiento normativo completo.')
on conflict (estadio_id, temporada_id) do nothing;

-- 7. Clubes Serie A LigaPro
insert into public.clubes (id, nombre, nombre_corto, ciudad, provincia, escudo_path, correos_oficiales)
values
('66666666-6666-6666-6666-666666666601', 'Liga Deportiva Universitaria de Quito', 'LDU Quito', 'Quito', 'Pichincha', '/escudos/ldu.png', '{"competiciones@ldu.com.ec","secretaria@ldu.com.ec"}'),
('66666666-6666-6666-6666-666666666602', 'Barcelona Sporting Club', 'Barcelona SC', 'Guayaquil', 'Guayas', '/escudos/barcelona.png', '{"operaciones@barcelonasc.com.ec"}'),
('66666666-6666-6666-6666-666666666603', 'Independiente del Valle', 'IDV', 'Sangolquí', 'Pichincha', '/escudos/idv.png', '{"deportiva@idv.ec"}'),
('66666666-6666-6666-6666-666666666604', 'Club Sport Emelec', 'Emelec', 'Guayaquil', 'Guayas', '/escudos/emelec.png', '{"futbol@emelec.com.ec"}'),
('66666666-6666-6666-6666-666666666605', 'Universidad Católica del Ecuador', 'U. Católica', 'Quito', 'Pichincha', '/escudos/catolica.png', '{"administracion@chatolei.ec"}'),
('66666666-6666-6666-6666-666666666606', 'Sociedad Deportiva Aucas', 'Aucas', 'Quito', 'Pichincha', '/escudos/aucas.png', '{"aucas@aucas.ec"}'),
('66666666-6666-6666-6666-666666666607', 'Orense Sporting Club', 'Orense SC', 'Machala', 'El Oro', '/escudos/orense.png', '{"club@orensesc.com"}'),
('66666666-6666-6666-6666-666666666608', 'Delfín Sporting Club', 'Delfín SC', 'Manta', 'Manabí', '/escudos/delfin.png', '{"delfin@delfin.ec"}'),
('66666666-6666-6666-6666-666666666609', 'Club Deportivo El Nacional', 'El Nacional', 'Quito', 'Pichincha', '/escudos/elnacional.png', '{"elnacional@elnacional.ec"}'),
('66666666-6666-6666-6666-666666666610', 'Club Deportivo Cuenca', 'Dep. Cuenca', 'Cuenca', 'Azuay', '/escudos/cuenca.png', '{"info@deportivocuenca.com"}'),
('66666666-6666-6666-6666-666666666611', 'Club Deportivo Técnico Universitario', 'Técnico Univ.', 'Ambato', 'Tungurahua', '/escudos/tecnico.png', '{"tecnico@rojoblanco.ec"}'),
('66666666-6666-6666-6666-666666666612', 'Club Deportivo Macará', 'Macará', 'Ambato', 'Tungurahua', '/escudos/macara.png', '{"macara@macara.ec"}'),
('66666666-6666-6666-6666-666666666613', 'Mushuc Runa Sporting Club', 'Mushuc Runa', 'Ambato', 'Tungurahua', '/escudos/mushucruna.png', '{"mushuc@ponchito.ec"}'),
('66666666-6666-6666-6666-666666666614', 'Libertad Fútbol Club', 'Libertad FC', 'Loja', 'Loja', '/escudos/libertad.png', '{"libertad@libertadfc.ec"}'),
('66666666-6666-6666-6666-666666666615', 'Cumbayá Fútbol Club', 'Cumbayá FC', 'Quito', 'Pichincha', '/escudos/cumbaya.png', '{"cumbaya@cumbaya.ec"}'),
('66666666-6666-6666-6666-666666666616', 'Imbabura Sporting Club', 'Imbabura SC', 'Ibarra', 'Imbabura', '/escudos/imbabura.png', '{"imbabura@gardenios.ec"}')
on conflict (nombre) do nothing;

-- 8. Uniformes de Clubes
insert into public.uniformes (club_id, temporada_id, categoria, tipo, color_camiseta, color_pantaloneta, color_medias, utilizable_desde)
values
('66666666-6666-6666-6666-666666666601', '22222222-2222-2222-2222-222222222222', 'jugador', 'principal', '#FFFFFF', '#FFFFFF', '#FFFFFF', '2025-01-01'),
('66666666-6666-6666-6666-666666666601', '22222222-2222-2222-2222-222222222222', 'jugador', 'alterno_1', '#1A1A1A', '#1A1A1A', '#1A1A1A', '2025-01-01'),
('66666666-6666-6666-6666-666666666601', '22222222-2222-2222-2222-222222222222', 'arquero', 'principal', '#00E5FF', '#00E5FF', '#00E5FF', '2025-01-01'),
('66666666-6666-6666-6666-666666666602', '22222222-2222-2222-2222-222222222222', 'jugador', 'principal', '#FFE600', '#101010', '#101010', '2025-01-01'),
('66666666-6666-6666-6666-666666666602', '22222222-2222-2222-2222-222222222222', 'jugador', 'alterno_1', '#C41230', '#101010', '#C41230', '2025-01-01'),
('66666666-6666-6666-6666-666666666602', '22222222-2222-2222-2222-222222222222', 'arquero', 'principal', '#FF5500', '#FF5500', '#FF5500', '2025-01-01')
on conflict (club_id, temporada_id, categoria, tipo) do nothing;

-- 9. Catálogo de Infracciones Oficiales LigaPro
insert into public.infracciones_catalogo (codigo, articulo, descripcion, monto, unidad, modo, tope, aplica_reincidencia_disp5)
values
('ART53_BALONES', 'Art. 53', 'Falta de balones oficiales reglamentarios (mínimo 12 balones)', 500.00, 'USD', 'por_evento', 1500.00, false),
('ART54_PASABOLAS', 'Art. 54', 'Incumplimiento de cantidad o edades reglamentarias de pasabolas (8 a 12, 14 a 17 años)', 500.00, 'USD', 'por_evento', 1500.00, false),
('ART51_CESPED', 'Art. 51', 'Altura del césped fuera de los límites reglamentarios (20 mm a 25 mm)', 1000.00, 'USD', 'por_evento', 3000.00, false),
('ART30_SIN_UNIFORMES', 'Art. 30', 'No presentación de los 2 kits completos en la reunión técnica 48h antes', 500.00, 'USD', 'por_evento', 1500.00, false),
('ART33_NUMERACION', 'Art. 33', 'Dorsal o numeración antirreglamentaria en indumentaria', 200.00, 'USD', 'por_evento', 1500.00, false),
('ART35_NOMBRE', 'Art. 35', 'Nombre o apodo no aprobado en la espalda de la camiseta', 300.00, 'USD', 'por_evento', 1500.00, false),
('ART45_SIN_FIRMA_DT', 'Art. 45', 'Demora o falta de firma de la planilla de juego por el Director Técnico', 500.00, 'USD', 'por_evento', 1500.00, false),
('ART50_ACTO', 'Art. 50', 'Acto institucional no solicitado con 72h de anticipación o extendido después de T-75', 1000.00, 'USD', 'por_evento', 3000.00, false),
('ART55_CALENTAMIENTO', 'Art. 55', 'Incumplimiento de horarios de calentamiento oficial o retiro a vestuarios', 500.00, 'USD', 'por_evento', 1500.00, false),
('ART73_INVASION', 'Art. 73', 'Invasión al terreno de juego o lanzamiento de objetos al campo', 2000.00, 'USD', 'por_evento', null, true),
('ART91_AMARILLA_A', 'Art. 91', 'Tarjeta amarilla recibida en partido oficial Serie A', 20.00, 'USD', 'por_unidad', null, false),
('ART91_EXPULSION_A', 'Art. 91', 'Tarjeta roja / expulsión recibida en partido oficial Serie A', 100.00, 'USD', 'por_unidad', null, false),
('ART95_VAR_ADICIONAL', 'Art. 95', 'Incumplimiento de infraestructura o cableado de fibra para cabina VAR', 2.00, 'SBU', 'por_evento', null, false),
('ART96_VOR', 'Art. 96', 'Ingreso no autorizado o violación de seguridad a la Sala VOR', 3.00, 'SBU', 'por_evento', null, false),
('ART97_VAR_FALTA', 'Art. 97', 'Falta de oficial VAR o incomparecencia técnica certificada', 3.00, 'SBU', 'por_evento', null, false)
on conflict (codigo) do nothing;

-- 10. Jornada 18 y Partido en Vivo (LDU Quito vs Barcelona SC)
insert into public.jornadas (id, fase_id, numero, horario_unificado)
values ('77777777-7777-7777-7777-777777777718', '44444444-4444-4444-4444-444444444441', 18, false)
on conflict (fase_id, numero) do nothing;

insert into public.partidos (
  id, fase_id, jornada_id, local_id, visitante_id, estadio_id,
  inicio_programado, estado, goles_local, goles_visitante,
  es_administrativo, sin_publico
)
values (
  '88888888-8888-8888-8888-888888888888',
  '44444444-4444-4444-4444-444444444441',
  '77777777-7777-7777-7777-777777777718',
  '66666666-6666-6666-6666-666666666601',
  '66666666-6666-6666-6666-666666666602',
  '55555555-5555-5555-5555-555555555501',
  now() - interval '65 minutes',
  'en_juego',
  1,
  1,
  false,
  false
) on conflict (id) do nothing;

-- 11. Eventos en Vivo del Partido (Minuto 23 Gol LDU, Minuto 41 Amarilla BSC, Minuto 58 Gol BSC)
insert into public.eventos_partido (id, partido_id, tipo, periodo, minuto, minuto_adicional, club_id, detalle)
values
(
  '99999999-9999-9999-9999-999999999901',
  '88888888-8888-8888-8888-888888888888',
  'gol',
  1,
  23,
  0,
  '66666666-6666-6666-6666-666666666601',
  '{"jugador": "Alex Arce", "dorsal": 19, "asistencia": "Ezequiel Piovi", "tipo_gol": "jugada"}'::jsonb
),
(
  '99999999-9999-9999-9999-999999999902',
  '88888888-8888-8888-8888-888888888888',
  'amarilla',
  1,
  41,
  0,
  '66666666-6666-6666-6666-666666666602',
  '{"jugador": "Jesús Trindade", "dorsal": 8, "motivo": "Falta táctica reiterada", "acumuladas_temporada": 4}'::jsonb
),
(
  '99999999-9999-9999-9999-999999999903',
  '88888888-8888-8888-8888-888888888888',
  'gol',
  2,
  58,
  0,
  '66666666-6666-6666-6666-666666666602',
  '{"jugador": "Octavio Rivero", "dorsal": 29, "asistencia": "Damián Díaz", "tipo_gol": "cabeza"}'::jsonb
) on conflict (id) do nothing;

-- 12. Trámites de Clubes Activos
insert into public.tramites (id, club_id, tipo, payload, estado, fecha_solicitud, plazo_vencimiento, resolucion)
values
(
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  '66666666-6666-6666-6666-666666666602',
  'cambio_uniforme',
  '{"motivo": "Presentación Camiseta Conmemorativa Aniversario", "categoria": "jugador", "tipo": "alterno_2", "color_camiseta": "#C41230", "color_pantaloneta": "#101010", "color_medias": "#C41230"}'::jsonb,
  'aprobado',
  now() - interval '9 days',
  now() - interval '2 days',
  'Aprobado según Art. 29. Habilitado para uso tras 7 días de notificación.'
),
(
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  '66666666-6666-6666-6666-666666666601',
  'postergacion_internacional',
  '{"partido_id": "88888888-8888-8888-8888-888888888888", "torneo_conmebol": "Copa Libertadores", "fecha_conmebol": "2025-06-18", "horas_descanso": 42}'::jsonb,
  'en_revision',
  now() - interval '3 days',
  now() + interval '1 days',
  'En análisis por Dirección de Competiciones conforme al Art. 28a.'
) on conflict (id) do nothing;
