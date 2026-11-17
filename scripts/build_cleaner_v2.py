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
    'informe-disciplinario': "navigateView('clubes')"
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

    # 2. Corregir padding superior en <main> para que ningún componente quede debajo del Header fijo (pt-16 -> pt-20)
    body_content = re.sub(r'(<main\b[^>]*\bclass=["\'][^"\']*\b)pt-16(\b[^"\']*["\'])', r'\1pt-20\2', body_content)

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

    # --- INICIO DE SESIÓN / ROLES (AUTENTICACIÓN REAL CON TABS) ---
    if screen_id == 'auth' or 'inicio_de_sesi_n' in folder:
        auth_card = '''
        <div class="min-h-[calc(100vh-4rem)] pt-20 pb-8 flex items-center justify-center w-full px-4">
          <div class="w-full max-w-lg bg-slate-900 text-white rounded-2xl shadow-2xl overflow-hidden border border-slate-800 p-6">
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
                <label class="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Cédula / Correo / ID COMET</label>
                <div class="relative flex items-center">
                  <span class="material-symbols-outlined absolute left-3 text-slate-400 text-sm pointer-events-none">fingerprint</span>
                  <input type="text" id="login-email" required placeholder="c.villacis@ligapro.ec" class="w-full h-10 pl-9 pr-3 rounded-lg bg-slate-800 text-white placeholder-slate-500 font-mono text-xs border border-slate-700 focus:outline-none focus:border-blue-500 transition"/>
                </div>
              </div>

              <div>
                <div class="flex justify-between items-center mb-1">
                  <label class="block text-xs font-bold text-slate-300 uppercase tracking-wider">Contraseña</label>
                  <a href="javascript:void(0)" onclick="showToast('Para restablecer credenciales COMET contacte a soporte@ligapro.ec', 'info')" class="text-[11px] text-blue-400 hover:underline">¿Olvidó contraseña?</a>
                </div>
                <div class="relative flex items-center">
                  <span class="material-symbols-outlined absolute left-3 text-slate-400 text-sm pointer-events-none">lock</span>
                  <input type="password" id="login-password" required placeholder="••••••••" class="w-full h-10 pl-9 pr-3 rounded-lg bg-slate-800 text-white placeholder-slate-500 font-mono text-xs border border-slate-700 focus:outline-none focus:border-blue-500 transition"/>
                </div>
              </div>

              <button type="submit" id="btn-login-submit" class="w-full h-10 mt-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all">
                <span class="material-symbols-outlined text-sm">login</span> Iniciar Sesión en SIGEC-LP
              </button>
            </form>
          </div>

          <!-- Sección Crear Cuenta -->
          <div id="auth-section-signup" class="hidden">
            <form id="signup-form" onsubmit="signupFormSubmit(event)" class="space-y-3">
              <div>
                <label class="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Nombres y Apellidos</label>
                <div class="relative flex items-center">
                  <span class="material-symbols-outlined absolute left-3 text-slate-400 text-sm pointer-events-none">badge</span>
                  <input type="text" id="signup-nombre" required placeholder="Ej: Dr. Fernando Gaibor" class="w-full h-10 pl-9 pr-3 rounded-lg bg-slate-800 text-white placeholder-slate-500 text-xs border border-slate-700 focus:outline-none focus:border-blue-500 transition"/>
                </div>
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Correo Electrónico Oficial</label>
                <div class="relative flex items-center">
                  <span class="material-symbols-outlined absolute left-3 text-slate-400 text-sm pointer-events-none">mail</span>
                  <input type="email" id="signup-email" required placeholder="f.gaibor@ligapro.ec" class="w-full h-10 pl-9 pr-3 rounded-lg bg-slate-800 text-white placeholder-slate-500 font-mono text-xs border border-slate-700 focus:outline-none focus:border-blue-500 transition"/>
                </div>
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Contraseña (Mínimo 6 caracteres)</label>
                <div class="relative flex items-center">
                  <span class="material-symbols-outlined absolute left-3 text-slate-400 text-sm pointer-events-none">key</span>
                  <input type="password" id="signup-password" minlength="6" required placeholder="••••••••" class="w-full h-10 pl-9 pr-3 rounded-lg bg-slate-800 text-white placeholder-slate-500 font-mono text-xs border border-slate-700 focus:outline-none focus:border-blue-500 transition"/>
                </div>
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Rol / Función Oficial</label>
                <select id="signup-rol" class="w-full h-10 px-3 rounded-lg bg-slate-800 text-white text-xs border border-slate-700 focus:outline-none focus:border-blue-500">
                  <option value="DIR_COMP">Dirección de Competiciones LigaPro</option>
                  <option value="COMISARIO">Comisario de Partido (Matchday)</option>
                  <option value="CLUB_ADMIN">Delegado Oficial de Club</option>
                </select>
              </div>

              <button type="submit" id="btn-signup-submit" class="w-full h-10 mt-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all">
                <span class="material-symbols-outlined text-sm">person_add</span> Registrar Cuenta Oficial
              </button>
            </form>
          </div>

          <!-- Botón Discreto de Acceso Demo Rápido -->
          <div class="mt-6 pt-4 border-t border-slate-800">
            <div class="flex items-center justify-between mb-2">
              <span class="text-[10px] text-slate-400 font-bold uppercase tracking-wider">⚡ Acceso Demo Rápido (1 Clic)</span>
              <span class="text-[9px] font-mono text-emerald-400">SUPABASE CONNECTED</span>
            </div>
            <div class="grid grid-cols-2 gap-1.5 text-[11px] font-semibold">
              <button type="button" onclick="cambiarRol('DIR_COMP')" class="p-1.5 rounded bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white transition-all text-left flex items-center gap-1 truncate">
                <span>🛡️</span> Dirección LigaPro
              </button>
              <button type="button" onclick="cambiarRol('COMISARIO')" class="p-1.5 rounded bg-slate-800 hover:bg-amber-600 text-slate-300 hover:text-white transition-all text-left flex items-center gap-1 truncate">
                <span>📋</span> Comisario Juego
              </button>
              <button type="button" onclick="cambiarRol('CLUB_ADMIN')" class="p-1.5 rounded bg-slate-800 hover:bg-emerald-600 text-slate-300 hover:text-white transition-all text-left flex items-center gap-1 truncate">
                <span>⚽</span> Delegado Club
              </button>
              <button type="button" onclick="cambiarRol('PUBLICO')" class="p-1.5 rounded bg-slate-800 hover:bg-purple-600 text-slate-300 hover:text-white transition-all text-left flex items-center gap-1 truncate">
                <span>👁️</span> Acceso Público
              </button>
            </div>
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
