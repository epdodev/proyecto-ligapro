SCREENS = [
    {
        'id': 'tablero',
        'title': 'Tablero General — SIGEC-LP LigaPro',
        'nav_label': 'Tablero General',
        'icon': 'dashboard',
        'file': 'tablero.html'
    },
    {
        'id': 'posiciones',
        'title': 'Posiciones & Resultados — SIGEC-LP LigaPro',
        'nav_label': 'Posiciones & Fixture',
        'icon': 'leaderboard',
        'file': 'posiciones.html'
    },
    {
        'id': 'clubes',
        'title': 'Portal de Clubes (Trámites) — SIGEC-LP LigaPro',
        'nav_label': 'Portal Clubes',
        'icon': 'folder_shared',
        'file': 'clubes.html'
    },
    {
        'id': 'uniformes',
        'title': 'Asistente de Uniformes 48h — SIGEC-LP LigaPro',
        'nav_label': 'Uniformes 48h',
        'icon': 'checkroom',
        'file': 'uniformes.html'
    },
    {
        'id': 'estadios',
        'title': 'Inspección de Escenarios & VAR — SIGEC-LP LigaPro',
        'nav_label': 'Escenarios & VAR',
        'icon': 'stadium',
        'file': 'estadios.html'
    },
    {
        'id': 'consola',
        'title': 'Consola de Comisario (Matchday) — SIGEC-LP LigaPro',
        'nav_label': 'Consola Comisario',
        'icon': 'sports',
        'file': 'consola.html'
    },
    {
        'id': 'consola_alto_contraste',
        'title': 'Consola Alto Contraste (WCAG AAA) — SIGEC-LP LigaPro',
        'nav_label': 'Consola WCAG AAA',
        'icon': 'contrast',
        'file': 'consola-alto-contraste.html'
    },
    {
        'id': 'consola_tablet',
        'title': 'Consola Tablet de Campo — SIGEC-LP LigaPro',
        'nav_label': 'Consola Tablet',
        'icon': 'tablet_mac',
        'file': 'consola-tablet.html'
    },
    {
        'id': 'auth',
        'title': 'Inicio de Sesión & Roles — SIGEC-LP LigaPro',
        'nav_label': 'Acceso / Roles',
        'icon': 'lock',
        'file': 'login.html'
    }
]

def generate_header(active_id):
    links = []
    for s in SCREENS:
        is_active = (s['id'] == active_id)
        active_class = "bg-secondary text-white font-bold shadow-sm" if is_active else "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
        links.append(f'''
        <button onclick="navigateView('{s['id']}')" class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all {active_class}" title="{s['title']}">
          <span class="material-symbols-outlined text-sm">{s['icon']}</span>
          <span>{s['nav_label']}</span>
        </button>''')
    
    header_html = f'''
    <header class="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs px-4 py-2.5">
      <div class="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        <!-- Logo & Brand -->
        <div class="flex items-center gap-3">
          <div onclick="navigateView('tablero')" class="cursor-pointer w-9 h-9 rounded-lg bg-gradient-to-br from-blue-700 via-blue-900 to-black flex items-center justify-center text-white font-black shadow-md border border-amber-400">
            <span class="text-amber-400 text-lg">⚡</span>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span onclick="navigateView('tablero')" class="cursor-pointer font-extrabold text-sm tracking-tight text-slate-900 hover:text-blue-700 transition-colors">LIGAPRO ECUABET</span>
              <span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 uppercase">SIGEC-LP</span>
              <span class="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200" title="https://udykrprupwifmffhpvuz.supabase.co">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Supabase Conectado</span>
              </span>
            </div>
            <p class="text-[11px] text-slate-500 font-medium">Sistema Integral de Gestión de Competiciones — Rige Reglamento 2023</p>
          </div>
        </div>

        <!-- Controls: Scoreboard, Accessibility, Notifications & Real User Session -->
        <div class="flex items-center flex-wrap gap-2">
          <!-- Live Match Score Widget -->
          <div onclick="navigateView('consola')" class="cursor-pointer flex items-center gap-2 bg-slate-900 text-white px-3 py-1.5 rounded-lg border border-slate-800 text-xs shadow-sm hover:border-amber-400 transition-colors" title="Ver Consola de Comisario">
            <span class="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
            <span class="font-bold text-amber-400">EN VIVO:</span>
            <span class="font-bold" id="header-match-local">LDU Quito</span>
            <span class="font-mono bg-slate-800 px-1.5 py-0.5 rounded font-bold text-amber-300" id="header-score">1 - 1</span>
            <span class="font-bold" id="header-match-visitante">Barcelona SC</span>
            <span class="font-mono text-slate-400 text-[10px]" id="header-match-min">68' 2T</span>
          </div>

          <!-- Reloj UTC-5 -->
          <div class="hidden lg:flex items-center gap-1 bg-slate-100 px-2.5 py-1.5 rounded-lg text-slate-700 font-mono text-xs border border-slate-200">
            <span class="material-symbols-outlined text-sm text-slate-500">schedule</span>
            <span class="text-[10px] text-slate-400 font-sans font-bold">UTC-5:</span>
            <span id="header-utc-clock" class="font-bold">18:42:09</span>
          </div>

          <!-- Barra Accesibilidad (WCAG AAA, A-, A+, Audio) -->
          <div class="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button onclick="toggleGlobalHighContrast()" class="p-1.5 text-slate-700 hover:text-amber-500 hover:bg-white rounded transition-colors" title="Modo Alto Contraste WCAG AAA (Negro / Amarillo)">
              <span class="material-symbols-outlined text-base">contrast</span>
            </button>
            <button onclick="ajustarTexto(-10)" class="px-2 py-1 text-slate-700 hover:bg-white rounded font-bold text-[11px]" title="Reducir Texto A-">
              A-
            </button>
            <button onclick="ajustarTexto(10)" class="px-2 py-1 text-slate-700 hover:bg-white rounded font-bold text-[11px]" title="Aumentar Texto A+">
              A+
            </button>
            <button onclick="toggleAlertaAuditiva()" class="p-1.5 text-slate-700 hover:text-blue-600 hover:bg-white rounded transition-colors" title="Alertas Auditivas Accesibles">
              <span class="material-symbols-outlined text-base">hearing</span>
            </button>
          </div>

          <!-- Campana de Notificaciones Reglamentarias -->
          <div class="relative">
            <button id="btn-notificaciones" onclick="toggleNotificationsPanel()" class="relative p-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors" title="Centro de Notificaciones">
              <span class="material-symbols-outlined text-lg">notifications</span>
              <span id="notif-badge-indicator" class="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
            </button>

            <!-- Dropdown Panel de Notificaciones -->
            <div id="notifications-panel" class="hidden absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 p-3 text-xs">
              <div class="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
                <span class="font-bold text-slate-900 flex items-center gap-1">
                  <span class="material-symbols-outlined text-base text-blue-600">notifications_active</span> Notificaciones Oficiales
                </span>
                <button onclick="marcarNotificacionesLeidas()" class="text-[10px] text-blue-600 hover:underline font-semibold">Marcar leídas</button>
              </div>
              <div class="space-y-2 max-h-60 overflow-y-auto">
                <div class="p-2 bg-red-50 text-red-950 rounded-lg border border-red-100">
                  <div class="font-bold">🔴 Minuto 68' — Partido en Disputa</div>
                  <div class="text-[11px] text-red-800">LDU Quito 1 - 1 Barcelona SC en Estadio Rodrigo Paz Delgado.</div>
                </div>
                <div class="p-2 bg-amber-50 text-amber-950 rounded-lg border border-amber-100">
                  <div class="font-bold">⚠️ Alerta Art. 91 — Tarjeta Amarilla</div>
                  <div class="text-[11px] text-amber-800">Jesús Trindade (BSC) acumula 4 amarillas. Suspensión al recibir una más.</div>
                </div>
                <div class="p-2 bg-emerald-50 text-emerald-950 rounded-lg border border-emerald-100">
                  <div class="font-bold">✅ Trámite TRM-2025-089 Aprobado</div>
                  <div class="text-[11px] text-emerald-800">Uso de indumentaria alterna conmemorativa homologada para fecha 19.</div>
                </div>
                <div class="p-2 bg-blue-50 text-blue-950 rounded-lg border border-blue-100">
                  <div class="font-bold">📢 Protocolo Art. 49</div>
                  <div class="text-[11px] text-blue-800">Horario unificado confirmado a las 18h00 para encuentros con incidencia.</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Sesión de Usuario y Cambio de Rol Rápido -->
          <div class="relative">
            <div id="header-user-block" onclick="toggleUserDropdown()" class="cursor-pointer flex items-center gap-2 pl-2 border-l border-slate-200 py-1 hover:opacity-90 transition-opacity">
              <div class="flex flex-col text-right hidden sm:flex">
                <span id="header-user-name" class="font-bold text-xs text-slate-900 leading-tight">Lic. Carlos Villacís</span>
                <span id="header-user-role" class="text-[10px] text-blue-700 font-bold uppercase tracking-wider">Dirección de Competiciones</span>
              </div>
              <img id="header-user-avatar" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80" alt="Avatar Usuario" class="w-8 h-8 rounded-full object-cover border-2 border-blue-600 shadow-xs"/>
              <span class="material-symbols-outlined text-slate-400 text-sm">expand_more</span>
            </div>

            <!-- Menú Desplegable de Usuario y Cierre de Sesión -->
            <div id="user-dropdown-menu" class="hidden absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 p-3 text-xs">
              <div class="pb-3 border-b border-slate-100 mb-3">
                <div class="font-bold text-slate-900" id="dropdown-user-name">Lic. Carlos Villacís</div>
                <div class="text-[11px] text-slate-500 truncate" id="dropdown-user-email">c.villacis@ligapro.ec</div>
                <div class="mt-1 inline-block px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold text-[10px]" id="dropdown-user-role">Dirección de Competiciones</div>
              </div>

              <!-- Cambio de Rol Rápido -->
              <div class="font-bold text-slate-400 uppercase text-[10px] tracking-wider mb-1.5">Cambiar Rol Rápido</div>
              <div class="space-y-1 mb-3">
                <button onclick="cambiarRol('DIR_COMP')" class="w-full text-left px-2 py-1.5 rounded hover:bg-slate-100 flex items-center justify-between text-slate-700">
                  <span class="flex items-center gap-1.5"><span class="material-symbols-outlined text-sm text-blue-600">admin_panel_settings</span> Dirección LigaPro</span>
                </button>
                <button onclick="cambiarRol('COMISARIO')" class="w-full text-left px-2 py-1.5 rounded hover:bg-slate-100 flex items-center justify-between text-slate-700">
                  <span class="flex items-center gap-1.5"><span class="material-symbols-outlined text-sm text-amber-500">sports</span> Comisario de Juego</span>
                </button>
                <button onclick="cambiarRol('CLUB_ADMIN')" class="w-full text-left px-2 py-1.5 rounded hover:bg-slate-100 flex items-center justify-between text-slate-700">
                  <span class="flex items-center gap-1.5"><span class="material-symbols-outlined text-sm text-emerald-600">shield</span> Delegado de Club</span>
                </button>
                <button onclick="cambiarRol('PUBLICO')" class="w-full text-left px-2 py-1.5 rounded hover:bg-slate-100 flex items-center justify-between text-slate-700">
                  <span class="flex items-center gap-1.5"><span class="material-symbols-outlined text-sm text-purple-600">visibility</span> Acceso Público (Aficionado)</span>
                </button>
              </div>

              <!-- Cerrar Sesión -->
              <div class="pt-2 border-t border-slate-100">
                <button onclick="cerrarSesion()" class="w-full text-left px-2 py-2 rounded text-red-600 hover:bg-red-50 font-bold flex items-center gap-2">
                  <span class="material-symbols-outlined text-base">logout</span>
                  Cerrar Sesión
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Navigation Tabs Bar -->
      <div class="max-w-7xl mx-auto mt-2 pt-2 border-t border-slate-100 flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
        {''.join(links)}
      </div>
    </header>
    '''
    return header_html

print('Helper script ready.')
