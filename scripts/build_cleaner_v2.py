import os
import re

DATA_PATH_TO_ACTION = {
    'tablero-general': "navigateView('tablero')",
    'competiciones-formatos': "mostrarModalCompeticionesFormatos()",
    'posiciones-fair-play': "navigateView('posiciones')",
    'portal-clubes': "navigateView('clubes')",
    'designacion-uniformes': "navigateView('uniformes')",
    'validador-uniformes': "navigateView('uniformes')",
    'calificacion-escenarios': "navigateView('estadios')",
    'inspeccion-terreno': "navigateView('estadios')",
    'consola-matchday': "navigateView('consola')",
    'consola-operativa': "navigateView('consola')",
    'cuenta-regresiva': "navigateView('consola')",
    'planilla-comet': "navigateView('consola')",
    'seguridad-criptografica': "mostrarModalSeguridadSHA256()",
    'informe-disciplinario': "navigateView('clubes')",
    'mi-perfil': "abrirModalPerfil()"
}

def clean_and_transform_screen(folder, screen_id):
    path = os.path.join('stitch_ligapro_competition_platform', folder, 'code.html')
    with open(path, 'r', encoding='utf-8') as f:
        html = f.read()

    b_idx = html.find('<body')
    b_end = html.find('>', b_idx)
    end_b = html.rfind('</body>')
    body_content = html[b_end+1:end_b].strip()

    # 1. Eliminar header duplicado interno si existe
    body_content = re.sub(r'<header class="fixed top-0 left-0 right-0 h-16[^>]*>.*?</header>', '', body_content, flags=re.DOTALL)

    # 2. Eliminar completamente el sidebar vertical (<aside>...</aside>) y el contenedor desplazado (pl-72)
    # para dejar una interfaz 100% limpia, minimalista y con navegación horizontal superior
    body_content = re.sub(r'<aside\b[^>]*>.*?</aside>', '', body_content, flags=re.DOTALL)
    body_content = re.sub(r'<div class="pl-72">\s*<main\b([^>]*)>', r'<main\1 class="max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-12 w-full">', body_content)
    body_content = body_content.replace('class="pl-72"', 'class="w-full"')

    # 3. Corregir padding superior en <main> para que ningún componente quede debajo del Header fijo (pt-16 -> pt-16)
    body_content = re.sub(r'(<main\b[^>]*\bclass=["\'][^"\']*\b)pt-20(\b[^"\']*["\'])', r'\1pt-16\2', body_content)

    # 3. Transformar los enlaces del sidebar según DATA_PATH_TO_ACTION
    for dpath, target_action in DATA_PATH_TO_ACTION.items():
        pattern = rf'(data-path=["\']{dpath}["\'][^>]*href=)["\']#["\']'
        replacement = rf'\1"javascript:void(0)" onclick="{target_action}"'
        body_content = re.sub(pattern, replacement, body_content)
        pattern2 = rf'(href=)["\']#["\']([^>]*data-path=["\']{dpath}["\'])'
        replacement2 = rf'href="javascript:void(0)" onclick="{target_action}"\2'
        body_content = re.sub(pattern2, replacement2, body_content)

    # Helper robusto para adjuntar onclick a botones por coincidencia de texto
    def add_onclick_to_btn(content, text_regex, onclick_code):
        pattern = rf'<button\b([^>]*?)>((?:(?!</?button).)*?{text_regex}.*?)</button>'
        def repl(match):
            attrs = match.group(1)
            inner = match.group(2)
            if 'onclick' in attrs:
                return match.group(0)
            return f'<button{attrs} onclick="{onclick_code}">{inner}</button>'
        return re.sub(pattern, repl, content, flags=re.DOTALL)

    # --- UNIFORMES 48H ---
    body_content = add_onclick_to_btn(body_content, r'Modo:\s*Luz\s*Natural', 'toggleLuzEstadio()')
    body_content = add_onclick_to_btn(body_content, r'Acta\s*Oficial\s*PDF', 'descargarActaUniformesPDF()')
    body_content = add_onclick_to_btn(body_content, r'Homologar\s*Combinación', 'sellarActaUniformes()')

    # --- CONSOLAS COMISARIO (STD Y ALTO CONTRASTE) ---
    body_content = add_onclick_to_btn(body_content, r'Forzar\s*Sincro', 'forzarSincroComet()')
    body_content = add_onclick_to_btn(body_content, r'Auditoría\s*de\s*Marcas', 'mostrarAuditoriaMarcas()')
    body_content = add_onclick_to_btn(body_content, r'Ver\s*Nómina\s*Completa', 'mostrarNominaCompleta()')

    # --- CONSOLA TABLET ---
    body_content = re.sub(
        r'<button\b([^>]*?id="btn-force-sync"[^>]*?)>',
        r'<button\1 onclick="forzarSincroComet()">',
        body_content
    )
    body_content = add_onclick_to_btn(body_content, r'Cuenta\s*Regresiva', "navigateView('consola')")
    body_content = add_onclick_to_btn(body_content, r'Planilla\s*&amp;\s*Médicos', 'mostrarNominaCompleta()')
    body_content = add_onclick_to_btn(body_content, r'Incidentes\s*Rápidos', 'registrarIncidenteEnVivo()')
    body_content = add_onclick_to_btn(body_content, r'Pasabolas\s*&amp;\s*Perímetro', 'mostrarModalPasabolas()')
    body_content = add_onclick_to_btn(body_content, r'Cierre\s*de\s*Acta', 'sellarPlanillaJuego()')
    body_content = add_onclick_to_btn(body_content, r'Marcar\s*OK', 'marcarHitoOk(this)')
    body_content = add_onclick_to_btn(body_content, r'Test\s*Alerta\s*Lumínica', 'testAlertaLuminica()')
    body_content = add_onclick_to_btn(body_content, r'Re-inspeccionar\s*Perímetro', 'evaluarEscenarioEnVivo()')
    body_content = re.sub(
        r'<button\b([^>]*?data-incident="([^"]+)"[^>]*?)>',
        r'<button\1 onclick="registrarIncidenteEnVivo(\'\2 (Art. 73)\')">',
        body_content
    )
    body_content = add_onclick_to_btn(body_content, r'Dictar\s*por\s*Voz', 'dictarPorVoz()')
    body_content = add_onclick_to_btn(body_content, r'Firmar\s*Acta\s*Previa', 'sellarPlanillaJuego()')
    body_content = add_onclick_to_btn(body_content, r'SOS\s*Alerta', "registrarIncidenteEnVivo('Alerta de seguridad SOS emitida a Policía Nacional')")
    
    # Para botones con solo iconos en tablet:
    body_content = re.sub(
        r'<button\b([^>]*?)>(\s*<span[^>]*?>contrast</span>\s*)</button>',
        r'<button\1 onclick="toggleGlobalHighContrast()">\2</button>',
        body_content
    )
    body_content = re.sub(
        r'<button\b([^>]*?)>(\s*<span[^>]*?>tune</span>\s*)</button>',
        r'<button\1 onclick="navigateView(\'consola\')">\2</button>',
        body_content
    )
    body_content = re.sub(
        r'<button\b([^>]*?)>(\s*<span[^>]*?>edit</span>\s*)</button>',
        r'<button\1 onclick="navigateView(\'consola\')">\2</button>',
        body_content
    )

    # --- ESCENARIOS & VAR ---
    body_content = add_onclick_to_btn(body_content, r'Sincronizar\s*COMET', 'forzarSincroComet()')
    body_content = add_onclick_to_btn(body_content, r'Nueva\s*Medición\s*In\s*Situ', 'evaluarEscenarioEnVivo()')
    body_content = add_onclick_to_btn(body_content, r'Informe\s*Pericial', 'generarInformePericialEstadio()')

    # --- PORTAL DE CLUBES ---
    body_content = add_onclick_to_btn(body_content, r'Certificado\s*Federativo', 'generarCertificadoFederativo()')
    body_content = add_onclick_to_btn(body_content, r'Radicar\s*a\s*Mesa\s*de\s*Partes', 'mostrarModalNuevoTramite()')
    body_content = add_onclick_to_btn(body_content, r'Pagar\s*vía\s*ACH', "showToast('Pago procesado vía débito automático conforme a Disposición 10ª.', 'success')")
    body_content = add_onclick_to_btn(body_content, r'Descargar\s*Detalle', 'descargarDetalleTramitePDF()')
    body_content = add_onclick_to_btn(body_content, r'Firmar\s*y\s*Enviar\s*Solicitud', 'mostrarModalNuevoTramite()')
    body_content = body_content.replace('onclick="toggleModal(true)"', 'onclick="mostrarModalNuevoTramite()"')
    body_content = re.sub(
        r'<a([^>]*href=["\']#["\'][^>]*)>(.*?Normativa de Cobro Coactivo.*?)</a>',
        r'<a\1 href="javascript:void(0)" onclick="mostrarNormativaCobro()">\2</a>',
        body_content,
        flags=re.DOTALL
    )

    # --- POSICIONES & RESULTADOS ---
    body_content = add_onclick_to_btn(body_content, r'Criterios\s*de\s*Desempate', 'mostrarModalCriteriosDesempate()')
    body_content = add_onclick_to_btn(body_content, r'Serie\s*A\s*2025', "cambiarDivision('A')")
    body_content = add_onclick_to_btn(body_content, r'Serie\s*B\s*2025', "cambiarDivision('B')")
    body_content = add_onclick_to_btn(body_content, r'Fase\s*Inicial', "cambiarFaseTorneo('inicial')")
    body_content = add_onclick_to_btn(body_content, r'1°\s*Hexagonal', "cambiarFaseTorneo('hex_titulo')")
    body_content = add_onclick_to_btn(body_content, r'2°\s*Hexagonal', "cambiarFaseTorneo('hex_sudamericana')")
    body_content = add_onclick_to_btn(body_content, r'Cuadrangular\s*Descenso', "cambiarFaseTorneo('cuad_descenso')")
    body_content = add_onclick_to_btn(body_content, r'Entendido\s*/\s*Cerrar', 'cerrarModalCriterios()')
    body_content = re.sub(
        r'<button([^>]*aria-label="Cerrar ventana de criterios"[^>]*)>(.*?)</button>',
        r'<button\1 onclick="cerrarModalCriterios()">\2</button>',
        body_content,
        flags=re.DOTALL
    )

    # --- TABLERO GENERAL ---
    body_content = add_onclick_to_btn(body_content, r'Sincronizar\s*Árbitros', "forzarSincroComet()")
    body_content = add_onclick_to_btn(body_content, r'F-14\s*/\s*30', "navigateView('posiciones')")
    body_content = add_onclick_to_btn(body_content, r'F-11', "navigateView('posiciones')")
    body_content = add_onclick_to_btn(body_content, r'calendar_month', "navigateView('posiciones')")
    body_content = add_onclick_to_btn(body_content, r'Filtrar\s*por\s*Estadio', "navigateView('estadios')")
    body_content = add_onclick_to_btn(body_content, r'Descargar\s*Planilla\s*Matchday', 'descargarPlanillaMatchday()')
    body_content = add_onclick_to_btn(body_content, r'Aprobar\s*Uniforme\s*Árbitro', 'sellarActaUniformes()')
    body_content = add_onclick_to_btn(body_content, r'Ver\s*Registro\s*Fotográfico', "navigateView('estadios')")
    body_content = add_onclick_to_btn(body_content, r'Revisar\s*Acta', "navigateView('uniformes')")

    # Simplificar diseño en tablero: ocultar banner gigante invasivo de Horario Unificado para un look minimalista y limpio
    body_content = re.sub(
        r'<!-- Operational Broadcast Notice / Unified Schedule Banner -->.*?<!-- Header Executive Bar',
        '<!-- Header Executive Bar',
        body_content,
        flags=re.DOTALL
    )

    # Reemplazo de los Match Cards estáticos por el contenedor reactivo en tiempo real con filtro
    partidos_realtime_html = '''<!-- Contenedor Reactivo de Partidos Oficiales LigaPro 2025 en Tiempo Real -->
<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface-card p-4 rounded-xl border border-border-subtle">
  <div class="flex items-center gap-3">
    <div class="w-9 h-9 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
      <span class="material-symbols-outlined text-xl">sports_soccer</span>
    </div>
    <div>
      <div class="flex items-center gap-2">
        <h3 class="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
          Partidos Oficiales
        </h3>
        <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> EN VIVO
        </span>
      </div>
      <p class="text-xs text-slate-500 dark:text-slate-400">
        Jornada 18 — LigaPro Serie A 2025
      </p>
    </div>
  </div>

  <!-- Filtros de Estado de Partidos -->
  <div class="inline-flex rounded-lg bg-slate-100 dark:bg-slate-800 p-1 text-xs font-medium" id="toolbar-filtro-partidos">
    <button type="button" onclick="filtrarPartidosTablero('todos')" id="btn-filtro-todos" class="px-3 py-1 rounded-md bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-semibold transition-all">Todos (8)</button>
    <button type="button" onclick="filtrarPartidosTablero('en_juego')" id="btn-filtro-en_juego" class="px-3 py-1 rounded-md text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all">En Vivo</button>
    <button type="button" onclick="filtrarPartidosTablero('finalizado')" id="btn-filtro-finalizado" class="px-3 py-1 rounded-md text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all">Finalizados</button>
    <button type="button" onclick="filtrarPartidosTablero('programado')" id="btn-filtro-programado" class="px-3 py-1 rounded-md text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all">Próximos</button>
  </div>
</div>

<!-- Contenedor dinámico de partidos inyectado por interactive.js -->
<div id="contenedor-partidos-realtime" class="flex flex-col gap-3 min-h-[300px]">
  <!-- Partido 1: LDU vs BSC (En Vivo) -->
  <div class="bg-surface-card rounded-xl p-4 sm:p-5 shadow-xs border border-indigo-600 ring-2 ring-indigo-500/20">
    <div class="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800 text-xs">
      <span class="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-medium">
        <span class="material-symbols-outlined text-sm">stadium</span> Estadio Rodrigo Paz Delgado (Quito)
      </span>
      <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase animate-pulse">
        <span class="w-2 h-2 rounded-full bg-emerald-500"></span> EN VIVO: 68' 2T
      </span>
    </div>
    <div class="grid grid-cols-12 gap-2 sm:gap-4 items-center py-2">
      <div class="col-span-5 flex items-center justify-end gap-3 text-right">
        <span class="font-bold text-sm sm:text-base text-slate-900 dark:text-white leading-tight">LDU Quito</span>
        <div class="w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center bg-indigo-50 dark:bg-slate-800 text-indigo-700 dark:text-indigo-400 font-black text-xs border border-slate-200 dark:border-slate-700 shrink-0">LDU</div>
      </div>
      <div class="col-span-2 flex flex-col items-center justify-center">
        <div class="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 font-mono text-lg sm:text-xl font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
          <span>1</span><span class="text-slate-400 text-sm">:</span><span>1</span>
        </div>
        <span class="text-[10px] text-slate-400 mt-1 uppercase font-medium">Fecha 18</span>
      </div>
      <div class="col-span-5 flex items-center justify-start gap-3 text-left">
        <div class="w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center bg-amber-50 dark:bg-slate-800 text-amber-700 dark:text-amber-400 font-black text-xs border border-slate-200 dark:border-slate-700 shrink-0">BSC</div>
        <span class="font-bold text-sm sm:text-base text-slate-900 dark:text-white leading-tight">Barcelona SC</span>
      </div>
    </div>
    <div class="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
      <span class="text-slate-400 text-[11px]">ZAPPING SPORTS / TELEAMAZONAS</span>
      <button type="button" onclick="navigateView('consola')" class="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs shadow-xs transition-colors flex items-center gap-1">
        <span class="material-symbols-outlined text-xs">terminal</span> Abrir Consola
      </button>
    </div>
  </div>

  <!-- Partido 2: IDV vs CS Emelec -->
  <div class="bg-surface-card rounded-xl p-4 sm:p-5 shadow-xs border border-slate-200 dark:border-slate-800">
    <div class="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800 text-xs">
      <span class="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-medium">
        <span class="material-symbols-outlined text-sm">stadium</span> Estadio Banco Guayaquil (Sangolquí)
      </span>
      <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-500/15 text-slate-600 dark:text-slate-400 text-xs font-bold uppercase">
        <span class="material-symbols-outlined text-xs">check_circle</span> FINALIZADO
      </span>
    </div>
    <div class="grid grid-cols-12 gap-2 sm:gap-4 items-center py-2">
      <div class="col-span-5 flex items-center justify-end gap-3 text-right">
        <span class="font-bold text-sm sm:text-base text-slate-900 dark:text-white leading-tight">Ind. del Valle</span>
        <div class="w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center bg-indigo-50 dark:bg-slate-800 text-indigo-700 dark:text-indigo-400 font-black text-xs border border-slate-200 dark:border-slate-700 shrink-0">IDV</div>
      </div>
      <div class="col-span-2 flex flex-col items-center justify-center">
        <div class="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 font-mono text-lg sm:text-xl font-black text-slate-900 dark:text-white flex items-center gap-1.5">
          <span>2</span><span class="text-slate-400 text-sm">:</span><span>1</span>
        </div>
        <span class="text-[10px] text-slate-400 mt-1 uppercase font-medium">Fecha 18</span>
      </div>
      <div class="col-span-5 flex items-center justify-start gap-3 text-left">
        <div class="w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center bg-blue-50 dark:bg-slate-800 text-blue-700 dark:text-blue-400 font-black text-xs border border-slate-200 dark:border-slate-700 shrink-0">EME</div>
        <span class="font-bold text-sm sm:text-base text-slate-900 dark:text-white leading-tight">CS Emelec</span>
      </div>
    </div>
    <div class="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
      <span class="text-slate-400 text-[11px]">ZAPPING SPORTS / STAR+</span>
      <button type="button" onclick="navigateView('consola')" class="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs shadow-xs transition-colors flex items-center gap-1">
        <span class="material-symbols-outlined text-xs">terminal</span> Abrir Consola
      </button>
    </div>
  </div>

  <!-- Partido 3: SD Aucas vs CD El Nacional -->
  <div class="bg-surface-card rounded-xl p-4 sm:p-5 shadow-xs border border-slate-200 dark:border-slate-800">
    <div class="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800 text-xs">
      <span class="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-medium">
        <span class="material-symbols-outlined text-sm">stadium</span> Estadio Gonzalo Pozo Ripalda (Quito)
      </span>
      <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/15 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase">
        <span class="material-symbols-outlined text-xs">schedule</span> HOY 13:00
      </span>
    </div>
    <div class="grid grid-cols-12 gap-2 sm:gap-4 items-center py-2">
      <div class="col-span-5 flex items-center justify-end gap-3 text-right">
        <span class="font-bold text-sm sm:text-base text-slate-900 dark:text-white leading-tight">SD Aucas</span>
        <div class="w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center bg-amber-50 dark:bg-slate-800 text-amber-700 dark:text-amber-400 font-black text-xs border border-slate-200 dark:border-slate-700 shrink-0">AUC</div>
      </div>
      <div class="col-span-2 flex flex-col items-center justify-center">
        <div class="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 font-mono text-lg sm:text-xl font-black text-slate-900 dark:text-white flex items-center gap-1.5">
          <span>0</span><span class="text-slate-400 text-sm">:</span><span>0</span>
        </div>
        <span class="text-[10px] text-slate-400 mt-1 uppercase font-medium">Fecha 18</span>
      </div>
      <div class="col-span-5 flex items-center justify-start gap-3 text-left">
        <div class="w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center bg-red-50 dark:bg-slate-800 text-red-700 dark:text-red-400 font-black text-xs border border-slate-200 dark:border-slate-700 shrink-0">NAC</div>
        <span class="font-bold text-sm sm:text-base text-slate-900 dark:text-white leading-tight">El Nacional</span>
      </div>
    </div>
    <div class="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
      <span class="text-slate-400 text-[11px]">TELEAMAZONAS / ZAPPING</span>
      <button type="button" onclick="navigateView('consola')" class="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs shadow-xs transition-colors flex items-center gap-1">
        <span class="material-symbols-outlined text-xs">terminal</span> Abrir Consola
      </button>
    </div>
  </div>
</div>'''

    # Sustituir la sección de programación estática y los match cards 1, 2 y 3
    body_content = re.sub(
        r'<div class="flex items-center justify-between bg-surface-card p-space-md rounded-xl shadow-sm">.*?<!-- Match Card 3: Aucas vs El Nacional -->.*?</div>\s*</div>\s*</div>\s*(?=<!-- Right Column)',
        partidos_realtime_html + '\n</div>\n',
        body_content,
        flags=re.DOTALL
    )

    body_content = re.sub(
        r'<a([^>]*href=["\']#["\'][^>]*)>(.*?Calificación Escenarios.*?</a>)',
        r'<a\1 href="javascript:void(0)" onclick="navigateView(\'estadios\')">\2',
        body_content,
        flags=re.DOTALL
    )
    body_content = re.sub(
        r'<a([^>]*href=["\']#["\'][^>]*)>(.*?Asistente de Uniformes.*?</a>)',
        r'<a\1 href="javascript:void(0)" onclick="navigateView(\'uniformes\')">\2',
        body_content,
        flags=re.DOTALL
    )
    body_content = re.sub(
        r'<a([^>]*href=["\']#["\'][^>]*)>(.*?Designación Pasabolas.*?</a>)',
        r'<a\1 href="javascript:void(0)" onclick="mostrarModalPasabolas()">\2',
        body_content,
        flags=re.DOTALL
    )
    body_content = re.sub(
        r'<a([^>]*href=["\']#["\'][^>]*)>(.*?Gestión Disciplinaria.*?</a>)',
        r'<a\1 href="javascript:void(0)" onclick="mostrarNormativaCobro()">\2',
        body_content,
        flags=re.DOTALL
    )

    # --- INICIO DE SESIÓN / ROLES (AUTENTICACIÓN REAL CON BASE DE DATOS) ---
    if screen_id == 'auth' or 'inicio_de_sesi_n' in folder:
        auth_card = '''
        <div class="min-h-[calc(100vh-4rem)] pt-20 pb-8 flex items-center justify-center w-full px-4">
          <div class="w-full max-w-lg bg-slate-900 text-white rounded-2xl shadow-2xl overflow-hidden border border-slate-800 p-6 sm:p-7">
            <!-- Cabecera -->
            <div class="flex flex-col items-center text-center mb-5">
              <div class="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg border border-slate-700 mb-2">
                <span class="material-symbols-outlined text-white text-2xl">shield</span>
              </div>
              <h1 class="text-xl font-extrabold tracking-tight text-white">SIGEC-LP</h1>
              <p class="text-xs text-amber-400 font-bold uppercase tracking-wider">Liga Profesional de Fútbol del Ecuador</p>
              <p class="text-xs text-slate-400 mt-1">Portal Oficial de Acceso y Gestión Federativa</p>
            </div>

            <!-- Pestañas de Autenticación -->
            <div class="flex border-b border-slate-800 mb-5">
              <button type="button" id="tab-btn-login" onclick="toggleAuthTab('login')" class="flex-1 py-2 text-center font-bold text-xs border-b-2 border-amber-400 text-amber-400 transition-colors">
                Iniciar Sesión
              </button>
              <button type="button" id="tab-btn-signup" onclick="toggleAuthTab('signup')" class="flex-1 py-2 text-center font-bold text-xs border-b-2 border-transparent text-slate-400 hover:text-white transition-colors">
                Crear Cuenta
              </button>
            </div>

            <!-- Sección Iniciar Sesión -->
            <div id="auth-section-login">
              <form id="login-form" onsubmit="loginFormSubmit(event)" class="space-y-4">
                <div>
                  <label class="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Correo Electrónico Registrado</label>
                  <div class="relative flex items-center">
                    <span class="material-symbols-outlined absolute left-3 text-slate-400 text-sm pointer-events-none">mail</span>
                    <input type="email" id="login-email" required placeholder="usuario@ejemplo.com o tu.correo@ligapro.ec" class="w-full h-10 pl-9 pr-3 rounded-lg bg-slate-800 text-white placeholder-slate-500 font-mono text-xs border border-slate-700 focus:outline-none focus:border-blue-500 transition"/>
                  </div>
                </div>

                <div>
                  <div class="flex justify-between items-center mb-1">
                    <label class="block text-xs font-bold text-slate-300 uppercase tracking-wider">Contraseña</label>
                    <a href="javascript:void(0)" onclick="showToast('Para restablecer sus credenciales contacte a soporte@ligapro.ec', 'info')" class="text-[11px] text-blue-400 hover:underline">¿Olvidó contraseña?</a>
                  </div>
                  <div class="relative flex items-center">
                    <span class="material-symbols-outlined absolute left-3 text-slate-400 text-sm pointer-events-none">lock</span>
                    <input type="password" id="login-password" required placeholder="••••••••" class="w-full h-10 pl-9 pr-3 rounded-lg bg-slate-800 text-white placeholder-slate-500 font-mono text-xs border border-slate-700 focus:outline-none focus:border-blue-500 transition"/>
                  </div>
                </div>

                <button type="submit" id="btn-login-submit" class="w-full h-10 mt-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all">
                  <span class="material-symbols-outlined text-sm">login</span> Iniciar Sesión
                </button>

                <div class="pt-2 text-center">
                  <p class="text-[11px] text-slate-400">¿No tienes cuenta oficial? <a href="javascript:void(0)" onclick="toggleAuthTab('signup')" class="text-blue-400 hover:underline font-bold">Regístrate aquí</a></p>
                </div>
              </form>
            </div>

            <!-- Sección Crear Cuenta -->
            <div id="auth-section-signup" class="hidden">
              <form id="signup-form" onsubmit="signupFormSubmit(event)" class="space-y-3">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label class="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Nombres y Apellidos *</label>
                    <div class="relative flex items-center">
                      <span class="material-symbols-outlined absolute left-3 text-slate-400 text-sm pointer-events-none">badge</span>
                      <input type="text" id="signup-nombre" required placeholder="Ej: Ing. Juan Pérez" class="w-full h-10 pl-9 pr-3 rounded-lg bg-slate-800 text-white placeholder-slate-500 text-xs border border-slate-700 focus:outline-none focus:border-blue-500 transition"/>
                    </div>
                  </div>

                  <div>
                    <label class="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Cédula de Identidad *</label>
                    <div class="relative flex items-center">
                      <span class="material-symbols-outlined absolute left-3 text-slate-400 text-sm pointer-events-none">fingerprint</span>
                      <input type="text" id="signup-cedula" required placeholder="Ej: 1712345678" class="w-full h-10 pl-9 pr-3 rounded-lg bg-slate-800 text-white placeholder-slate-500 font-mono text-xs border border-slate-700 focus:outline-none focus:border-blue-500 transition"/>
                    </div>
                  </div>
                </div>

                <div>
                  <label class="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Correo Electrónico *</label>
                  <div class="relative flex items-center">
                    <span class="material-symbols-outlined absolute left-3 text-slate-400 text-sm pointer-events-none">mail</span>
                    <input type="email" id="signup-email" required placeholder="tu.correo@ejemplo.com" class="w-full h-10 pl-9 pr-3 rounded-lg bg-slate-800 text-white placeholder-slate-500 font-mono text-xs border border-slate-700 focus:outline-none focus:border-blue-500 transition"/>
                  </div>
                </div>

                <div>
                  <label class="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Contraseña (Mínimo 6 caracteres) *</label>
                  <div class="relative flex items-center">
                    <span class="material-symbols-outlined absolute left-3 text-slate-400 text-sm pointer-events-none">key</span>
                    <input type="password" id="signup-password" minlength="6" required placeholder="••••••••" class="w-full h-10 pl-9 pr-3 rounded-lg bg-slate-800 text-white placeholder-slate-500 font-mono text-xs border border-slate-700 focus:outline-none focus:border-blue-500 transition"/>
                  </div>
                </div>

                <button type="submit" id="btn-signup-submit" class="w-full h-10 mt-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all hover:scale-[1.01]">
                  <span class="material-symbols-outlined text-sm">person_add</span> Crear Cuenta
                </button>

                <div class="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/80 text-[10px] text-slate-400 flex items-start gap-2 mt-2">
                  <span class="material-symbols-outlined text-sm text-emerald-400 shrink-0">verified_user</span>
                  <span>Tus credenciales se procesan de forma segura con cifrado oficial.</span>
                </div>
              </form>
            </div>
          </div>
        </div>
        '''
        body_content = auth_card

    # 3. Reemplazar cualquier href="#" remanente por javascript:void(0)
    body_content = body_content.replace('href="#"', 'href="javascript:void(0)"')
    body_content = body_content.replace("href='#'", 'href="javascript:void(0)"')

    # 4. Eliminar cualquier referencia residual hardcodeada a 'Ab. Comisario LigaPro'
    body_content = body_content.replace('Ab. Comisario LigaPro', 'Comisario Oficial LigaPro')

    # 5. Soporte de Paleta Oscura Moderna (Midnight Broadcast)
    # Contenedores bg-white y bg-surface
    body_content = re.sub(
        r'\bclass=(["\'])([^"\']*\bbg-white\b[^"\']*)\1',
        lambda m: 'class=' + m.group(1) + (m.group(2) if 'dark:bg-' in m.group(2) else m.group(2) + ' dark:bg-[#111827] dark:text-[#F8FAFC] dark:border-[#1E293B]') + m.group(1),
        body_content
    )
    body_content = re.sub(
        r'\bclass=(["\'])([^"\']*\bbg-surface\b[^"\']*)\1',
        lambda m: 'class=' + m.group(1) + (m.group(2) if 'dark:bg-' in m.group(2) else m.group(2) + ' dark:bg-[#0B0F19] dark:text-[#F8FAFC]') + m.group(1),
        body_content
    )

    # Reemplazo de bordes amarillos chillones por bordes sutiles slate-800
    body_content = re.sub(r'\b(border-yellow-400|border-amber-400)\b', r'border-slate-200 dark:border-slate-800', body_content)

    # Métricas y contadores grandes (16 / 16, 18 / 18, 8 Partidos)
    body_content = re.sub(
        r'\bclass=(["\'])([^"\']*\bfont-mono-metric\b[^"\']*)\1',
        lambda m: 'class=' + m.group(1) + (m.group(2) if 'dark:text-' in m.group(2) else m.group(2) + ' dark:text-white') + m.group(1),
        body_content
    )

    # Encabezados h1, h2, h3
    body_content = re.sub(
        r'<(h[1-3])\b([^>]*\bclass=["\'])([^"\']*)(["\'])',
        lambda m: f'<{m.group(1)}{m.group(2)}{m.group(3)}' + ('' if 'dark:text-' in m.group(3) else ' dark:text-white') + m.group(4),
        body_content
    )

    # Textos oscuros primarios (text-text-primary, text-slate-900, text-gray-900)
    body_content = re.sub(
        r'\bclass=(["\'])([^"\']*\b(?:text-text-primary|text-slate-900|text-gray-900|text-slate-800|text-gray-800)\b[^"\']*)\1',
        lambda m: 'class=' + m.group(1) + (m.group(2) if 'dark:text-' in m.group(2) else m.group(2) + ' dark:text-[#F8FAFC]') + m.group(1),
        body_content
    )

    # Textos secundarios (text-text-secondary, text-slate-600, text-slate-500, text-gray-600, text-gray-500)
    body_content = re.sub(
        r'\bclass=(["\'])([^"\']*\b(?:text-text-secondary|text-slate-600|text-slate-500|text-gray-600|text-gray-500)\b[^"\']*)\1',
        lambda m: 'class=' + m.group(1) + (m.group(2) if 'dark:text-' in m.group(2) else m.group(2) + ' dark:text-[#CBD5E1]') + m.group(1),
        body_content
    )

    return body_content
