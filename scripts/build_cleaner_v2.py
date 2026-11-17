import os
import re

DATA_PATH_TO_VIEW = {
    'tablero-general': 'tablero',
    'competiciones-formatos': 'tablero',
    'posiciones-fair-play': 'posiciones',
    'portal-clubes': 'clubes',
    'designacion-uniformes': 'uniformes',
    'validador-uniformes': 'uniformes',
    'calificacion-escenarios': 'estadios',
    'inspeccion-terreno': 'estadios',
    'consola-matchday': 'consola',
    'consola-operativa': 'consola',
    'cuenta-regresiva': 'consola',
    'planilla-comet': 'consola',
    'seguridad-criptografica': 'consola_alto_contraste',
    'informe-disciplinario': 'clubes'
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
    
    # 2. Corregir cualquier pt-16 o top-16 sobrante derivado del header interno fijo
    body_content = body_content.replace('top-16', 'top-[112px]').replace('pt-16', 'pt-4')

    # 3. Transformar los enlaces del sidebar según data-path
    for dpath, target_view in DATA_PATH_TO_VIEW.items():
        pattern = rf'(data-path=["\']{dpath}["\'][^>]*href=)["\']#["\']'
        replacement = rf'\1"javascript:void(0)" onclick="navigateView(\'{target_view}\')"'
        body_content = re.sub(pattern, replacement, body_content)
        pattern2 = rf'(href=)["\']#["\']([^>]*data-path=["\']{dpath}["\'])'
        replacement2 = rf'href="javascript:void(0)" onclick="navigateView(\'{target_view}\')"\2'
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
    body_content = add_onclick_to_btn(body_content, r'Cuenta\s*Regresiva', "showToast('Cuenta regresiva T-90 a T-0 sincronizada', 'info')")
    body_content = add_onclick_to_btn(body_content, r'Planilla\s*&amp;\s*Médicos', 'mostrarNominaCompleta()')
    body_content = add_onclick_to_btn(body_content, r'Incidentes\s*Rápidos', 'registrarIncidenteEnVivo()')
    body_content = add_onclick_to_btn(body_content, r'Pasabolas\s*&amp;\s*Perímetro', 'mostrarModalPasabolas()')
    body_content = add_onclick_to_btn(body_content, r'Cierre\s*de\s*Acta', 'sellarPlanillaJuego()')
    body_content = add_onclick_to_btn(body_content, r'Marcar\s*OK', 'marcarHitoOk(this)')
    body_content = add_onclick_to_btn(body_content, r'Test\s*Alerta\s*Lumínica', 'testAlertaLuminica()')
    body_content = add_onclick_to_btn(body_content, r'Re-inspeccionar\s*Perímetro', 'evaluarEscenarioEnVivo()')
    # Incident buttons en tablet por data-incident
    body_content = re.sub(
        r'<button\b([^>]*?data-incident="([^"]+)"[^>]*?)>',
        r'<button\1 onclick="registrarIncidenteEnVivo(\'\2 (Art. 73)\')">',
        body_content
    )
    body_content = add_onclick_to_btn(body_content, r'Dictar\s*por\s*Voz', 'dictarPorVoz()')
    body_content = add_onclick_to_btn(body_content, r'Firmar\s*Acta\s*Previa', 'sellarPlanillaJuego()')
    body_content = add_onclick_to_btn(body_content, r'SOS\s*Alerta', "showToast('Alerta de seguridad SOS emitida a Policía Nacional', 'warning')")
    
    # Para botones con solo iconos en tablet:
    body_content = re.sub(
        r'<button\b([^>]*?)>(\s*<span[^>]*?>contrast</span>\s*)</button>',
        r'<button\1 onclick="toggleGlobalHighContrast()">\2</button>',
        body_content
    )
    body_content = re.sub(
        r'<button\b([^>]*?)>(\s*<span[^>]*?>tune</span>\s*)</button>',
        r'<button\1 onclick="showToast(\'Panel de calibración táctil\', \'info\')">\2</button>',
        body_content
    )
    body_content = re.sub(
        r'<button\b([^>]*?)>(\s*<span[^>]*?>edit</span>\s*)</button>',
        r'<button\1 onclick="showToast(\'Modo edición Comisario activado\', \'info\')">\2</button>',
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
    body_content = add_onclick_to_btn(body_content, r'Sincronizar\s*Árbitros', "showToast('Cronómetros arbitrales sincronizados con reloj central FIFA/COMET.', 'success')")
    body_content = add_onclick_to_btn(body_content, r'F-14\s*/\s*30', "navigateView('posiciones')")
    body_content = add_onclick_to_btn(body_content, r'F-11', "navigateView('posiciones')")
    body_content = add_onclick_to_btn(body_content, r'calendar_month', "showToast('Calendario oficial LigaPro 2025 sincronizado', 'info')")
    body_content = add_onclick_to_btn(body_content, r'Filtrar\s*por\s*Estadio', "showToast('Filtro por estadio activado', 'info')")
    body_content = add_onclick_to_btn(body_content, r'Descargar\s*Planilla\s*Matchday', 'descargarPlanillaMatchday()')
    body_content = add_onclick_to_btn(body_content, r'Aprobar\s*Uniforme\s*Árbitro', 'sellarActaUniformes()')
    body_content = add_onclick_to_btn(body_content, r'Ver\s*Registro\s*Fotográfico', "showToast('Registro fotográfico de inspección técnica cargado.', 'info')")
    body_content = add_onclick_to_btn(body_content, r'Revisar\s*Acta', "navigateView('uniformes')")

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

    # --- INICIO DE SESIÓN / ROLES ---
    if screen_id == 'auth' or 'inicio_de_sesi_n' in folder:
        body_content = re.sub(
            r'<form([^>]*onsubmit=["\'][^"\']*["\'][^>]*)>',
            r'<form\1 id="login-form" onsubmit="loginFormSubmit(event)">',
            body_content
        )
        body_content = body_content.replace('simulateAuth()', 'loginFormSubmit(event)')
        body_content = body_content.replace('href="#recuperar"', 'href="javascript:void(0)" onclick="showToast(\'Para restablecer credenciales COMET contacte a soporte@ligapro.ec\', \'info\')"')
        body_content = body_content.replace('onclick="toggleContrast()"', 'onclick="toggleGlobalHighContrast()"')
        body_content = body_content.replace('onclick="speakScreenSummary()"', 'onclick="toggleAlertaAuditiva()"')

        # Fast role access block
        fast_roles_card = '''
        <!-- Barra de Acceso Rápido por Rol para Demostración Oficial -->
        <div class="mb-4 p-3.5 bg-slate-900/90 rounded-xl border border-secondary-container/40 text-on-secondary shadow-lg">
          <div class="text-[11px] font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center justify-between">
            <span class="flex items-center gap-1.5"><span class="material-symbols-outlined text-sm">bolt</span> Acceso Rápido por Rol (Evaluación en 1-Clic):</span>
            <span class="text-[10px] text-emerald-400 font-mono">SUPABASE OK</span>
          </div>
          <div class="grid grid-cols-2 gap-2 text-xs font-bold">
            <button type="button" onclick="cambiarRol('DIR_COMP')" class="p-2.5 bg-blue-700 hover:bg-blue-600 text-white rounded-lg flex items-center justify-center gap-1.5 shadow-sm transition-all hover:scale-[1.02]">
              <span class="material-symbols-outlined text-sm">admin_panel_settings</span> Dirección LigaPro
            </button>
            <button type="button" onclick="cambiarRol('COMISARIO')" class="p-2.5 bg-amber-500 hover:bg-amber-400 text-black rounded-lg flex items-center justify-center gap-1.5 shadow-sm transition-all hover:scale-[1.02]">
              <span class="material-symbols-outlined text-sm">sports</span> Comisario de Juego
            </button>
            <button type="button" onclick="cambiarRol('CLUB_ADMIN')" class="p-2.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg flex items-center justify-center gap-1.5 shadow-sm transition-all hover:scale-[1.02]">
              <span class="material-symbols-outlined text-sm">shield</span> Delegado de Club
            </button>
            <button type="button" onclick="cambiarRol('PUBLICO')" class="p-2.5 bg-purple-700 hover:bg-purple-600 text-white rounded-lg flex items-center justify-center gap-1.5 shadow-sm transition-all hover:scale-[1.02]">
              <span class="material-symbols-outlined text-sm">visibility</span> Acceso Público
            </button>
          </div>
        </div>
        '''
        body_content = re.sub(
            r'(<header class="flex flex-col items-center text-center gap-space-xs">.*?</header>)',
            r'\1\n' + fast_roles_card,
            body_content,
            flags=re.DOTALL
        )

    # 5. Reemplazar cualquier href="#" remanente por javascript:void(0)
    body_content = body_content.replace('href="#"', 'href="javascript:void(0)"')
    body_content = body_content.replace("href='#'", 'href="javascript:void(0)"')

    # 6. Eliminar cualquier referencia residual hardcodeada a 'Ab. Comisario LigaPro'
    body_content = body_content.replace('Ab. Comisario LigaPro', 'Comisario Oficial LigaPro')

    return body_content
