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

SIGEC_LP_SVG_ISOTIPO = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none" aria-label="SIGEC-LP Isotipo">
  <defs>
    <linearGradient id="hSG" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#4F46E5" />
      <stop offset="100%" stop-color="#312E81" />
    </linearGradient>
    <linearGradient id="hGG" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FBBF24" />
      <stop offset="100%" stop-color="#F59E0B" />
    </linearGradient>
    <filter id="hSS" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="1" stdDeviation="0.8" flood-opacity="0.3"/>
    </filter>
  </defs>
  <path d="M16 2.2 L27.5 5.8 C27.5 5.8 27.5 15.2 27.5 15.5 C27.5 22.8 22.2 28.5 16 30.5 C9.8 28.5 4.5 22.8 4.5 15.5 C4.5 15.2 4.5 5.8 4.5 5.8 L16 2.2 Z" fill="url(#hSG)" stroke="#6366F1" stroke-width="0.8" filter="url(#hSS)" />
  <path d="M16 4.2 L25.5 7.2 C25.5 7.2 25.5 15.2 25.5 15.5 C25.5 21.6 21 26.5 16 28.3 C11 26.5 6.5 21.6 6.5 15.5 C6.5 15.2 6.5 7.2 6.5 7.2 L16 4.2 Z" fill="none" stroke="url(#hGG)" stroke-width="0.75" stroke-opacity="0.9" />
  <g stroke="#FFFFFF" stroke-opacity="0.5" stroke-width="0.9" stroke-linecap="round">
    <line x1="16" y1="9.2" x2="16" y2="5.5" />
    <line x1="20.8" y1="12" x2="24.5" y2="9.8" />
    <line x1="20.8" y1="17.6" x2="24.8" y2="19.8" />
    <line x1="16" y1="20.4" x2="16" y2="24.2" />
    <line x1="11.2" y1="17.6" x2="7.2" y2="19.8" />
    <line x1="11.2" y1="12" x2="7.5" y2="9.8" />
  </g>
  <polygon points="16,9.2 20.8,12 20.8,17.6 16,20.4 11.2,17.6 11.2,12" fill="url(#hGG)" stroke="#FFFFFF" stroke-width="0.9" stroke-linejoin="round" />
  <circle cx="16" cy="14.8" r="1.6" fill="#1E1B4B" />
  <path d="M13.2 24.2 L16 26.2 L18.8 24.2" fill="none" stroke="url(#hGG)" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" />
</svg>"""

def generate_header(active_id):
    header_html = f'''
    <header class="fixed top-0 left-0 right-0 h-16 bg-white/95 dark:bg-[#111827]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 z-50 shadow-xs px-4 sm:px-6 transition-colors">
      <div class="w-full h-full flex items-center justify-between gap-2 sm:gap-4">
        <!-- Isotipo SIGEC-LP & Brand -->
        <div class="flex items-center gap-2.5 shrink-0">
          <div onclick="navigateView(\'tablero\')" class="cursor-pointer w-9 h-9 rounded-xl flex items-center justify-center shadow-md hover:scale-105 transition-transform select-none" title="Ir al Tablero General">
            {SIGEC_LP_SVG_ISOTIPO}
          </div>
          <div class="flex items-center gap-2">
            <span id="header-brand-title" onclick="navigateView(\'tablero\')" class="cursor-pointer font-extrabold text-sm tracking-tight text-slate-900 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">LIGAPRO ECUABET</span>
            <span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-300 uppercase font-mono tracking-widest">SIGEC-LP</span>
          </div>
        </div>

        <!-- Centro: Marcador En Vivo + Reloj UTC-5 -->
        <div class="flex items-center gap-2 sm:gap-3 shrink-0">
          <div onclick="navigateView('consola')" class="cursor-pointer flex items-center gap-1.5 sm:gap-2 bg-slate-900 text-white px-2.5 py-1.5 rounded-lg border border-slate-800 text-[11px] sm:text-xs shadow-sm hover:border-slate-600 transition-colors" title="Ver Consola de Comisario">
            <span class="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
            <span class="font-bold text-amber-400 hidden sm:inline">EN VIVO:</span>
            <span class="font-bold">LDU</span>
            <span class="font-mono bg-slate-800 px-1 py-0.5 rounded font-bold text-amber-300" id="header-score">1 - 1</span>
            <span class="font-bold">BSC</span>
            <span class="font-mono text-slate-400 text-[10px]" id="header-match-min">68' 2T</span>
          </div>

          <div class="hidden md:flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md text-slate-700 dark:text-slate-200 font-mono text-[11px] border border-slate-200 dark:border-slate-700">
            <span class="text-[10px] text-slate-400 font-sans font-bold">UTC-5:</span>
            <span id="header-utc-clock" class="font-bold">18:42:09</span>
          </div>
        </div>

        <!-- Derecha: Accesibilidad + Notificaciones + Perfil / Iniciar Sesión -->
        <div class="flex items-center gap-2 shrink-0">
          <!-- Controles Compactos de Accesibilidad (Modo Oscuro / Alto Contraste, A-, A+) -->
          <div class="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
            <button id="btn-theme-toggle" onclick="toggleGlobalHighContrast()" class="p-1.5 text-slate-700 dark:text-slate-200 hover:text-amber-500 hover:bg-white dark:hover:bg-slate-700 rounded transition-colors" title="Modo Oscuro / Alto Contraste (WCAG AAA)">
              <span class="material-symbols-outlined text-base">contrast</span>
            </button>
            <button onclick="ajustarTexto('dec')" class="px-2 py-1 text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 rounded font-bold text-[11px] transition-colors" title="Reducir Texto A-">
              A-
            </button>
            <button onclick="ajustarTexto('inc')" class="px-2 py-1 text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 rounded font-bold text-[11px] transition-colors" title="Aumentar Texto A+">
              A+
            </button>
          </div>

          <!-- Campana de Notificaciones Reglamentarias -->
          <div class="relative">
            <button id="btn-notificaciones" onclick="toggleNotificationsPanel()" class="relative p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors" title="Centro de Notificaciones">
              <span class="material-symbols-outlined text-lg">notifications</span>
              <span id="notif-badge-indicator" class="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
            </button>

            <!-- Dropdown Panel de Notificaciones -->
            <div id="notifications-panel" class="hidden absolute right-0 mt-2 w-80 bg-white dark:bg-[#111827] rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 z-50 p-3 text-xs text-slate-900 dark:text-slate-100">
              <div class="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 mb-2">
                <span class="font-bold text-slate-900 dark:text-white flex items-center gap-1">
                  <span class="material-symbols-outlined text-base text-blue-600 dark:text-blue-400">notifications_active</span> Notificaciones Oficiales
                </span>
                <button onclick="marcarNotificacionesLeidas()" class="text-[10px] text-blue-600 dark:text-blue-400 hover:underline font-semibold">Marcar leídas</button>
              </div>
              <div class="space-y-2 max-h-60 overflow-y-auto">
                <div class="p-2 bg-red-50 dark:bg-red-950/40 text-red-950 dark:text-red-200 rounded-lg border border-red-100 dark:border-red-900/50">
                  <div class="font-bold">🔴 Minuto 68' — Partido en Disputa</div>
                  <div class="text-[11px] text-red-800 dark:text-red-300">LDU Quito 1 - 1 Barcelona SC en Estadio Rodrigo Paz Delgado.</div>
                </div>
                <div class="p-2 bg-amber-50 dark:bg-amber-950/40 text-amber-950 dark:text-amber-200 rounded-lg border border-amber-100 dark:border-amber-900/50">
                  <div class="font-bold">⚠️ Alerta Art. 91 — Tarjeta Amarilla</div>
                  <div class="text-[11px] text-amber-800 dark:text-amber-300">Jesús Trindade (BSC) acumula 4 amarillas. Suspensión al recibir una más.</div>
                </div>
                <div class="p-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-200 rounded-lg border border-emerald-100 dark:border-emerald-900/50">
                  <div class="font-bold">✅ Trámite TRM-2025-089 Aprobado</div>
                  <div class="text-[11px] text-emerald-800 dark:text-emerald-300">Uso de indumentaria alterna conmemorativa homologada para fecha 19.</div>
                </div>
                <div class="p-2 bg-blue-50 dark:bg-blue-950/40 text-blue-950 dark:text-blue-200 rounded-lg border border-blue-100 dark:border-blue-900/50">
                  <div class="font-bold">📢 Protocolo Art. 49</div>
                  <div class="text-[11px] text-blue-800 dark:text-blue-300">Horario unificado confirmado a las 18h00 para encuentros con incidencia.</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Botón Iniciar Sesión / Crear Cuenta (Visible cuando NO hay sesión) -->
          <div id="header-auth-btn" class="hidden">
            <button onclick="navigateView('auth')" class="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all hover:scale-[1.02]">
              <span class="material-symbols-outlined text-sm">login</span>
              <span class="hidden sm:inline">Iniciar Sesión / Crear Cuenta</span>
              <span class="sm:hidden">Acceso</span>
            </button>
          </div>

          <!-- Sesión de Usuario y Cambio de Rol Rápido (Visible cuando SÍ hay sesión activa) -->
          <div id="header-user-block" class="relative">
            <div onclick="toggleUserDropdown()" class="cursor-pointer flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-700 py-1 hover:opacity-90 transition-opacity">
              <div class="flex flex-col text-right hidden sm:flex">
                <span id="header-user-name" class="font-bold text-xs text-slate-900 dark:text-white leading-tight">Invitado General</span>
                <span id="header-user-role" class="text-[10px] text-blue-700 dark:text-blue-400 font-bold uppercase tracking-wider">Acceso Público</span>
              </div>
              <img id="header-user-avatar" src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80" alt="Avatar Usuario" class="w-8 h-8 rounded-full object-cover border-2 border-blue-600 shadow-xs"/>
              <span class="material-symbols-outlined text-slate-400 text-sm">expand_more</span>
            </div>

            <!-- Menú Desplegable de Usuario y Cierre de Sesión -->
            <div id="user-dropdown-menu" class="hidden absolute right-0 mt-2 w-64 bg-white dark:bg-[#111827] rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 z-50 p-3 text-xs text-slate-900 dark:text-slate-100">
              <div class="pb-3 border-b border-slate-100 dark:border-slate-800 mb-3">
                <div class="font-bold text-slate-900 dark:text-white" id="dropdown-user-name">Invitado General</div>
                <div class="text-[11px] text-slate-500 dark:text-slate-400 truncate" id="dropdown-user-email">publico@ligapro.ec</div>
                <div class="mt-1 inline-block px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-bold text-[10px]" id="dropdown-user-role">Acceso Público</div>
              </div>

              <!-- Cambio de Rol Rápido -->
              <div class="font-bold text-slate-400 uppercase text-[10px] tracking-wider mb-1.5">Cambiar Rol Rápido</div>
              <div class="space-y-1 mb-3">
                <button onclick="cambiarRol('DIR_COMP')" class="w-full text-left px-2 py-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between text-slate-700 dark:text-slate-200">
                  <span class="flex items-center gap-1.5"><span class="material-symbols-outlined text-sm text-blue-600 dark:text-blue-400">admin_panel_settings</span> Dirección LigaPro</span>
                </button>
                <button onclick="cambiarRol('COMISARIO')" class="w-full text-left px-2 py-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between text-slate-700 dark:text-slate-200">
                  <span class="flex items-center gap-1.5"><span class="material-symbols-outlined text-sm text-amber-500">sports</span> Comisario de Juego</span>
                </button>
                <button onclick="cambiarRol('CLUB_ADMIN')" class="w-full text-left px-2 py-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between text-slate-700 dark:text-slate-200">
                  <span class="flex items-center gap-1.5"><span class="material-symbols-outlined text-sm text-emerald-600 dark:text-emerald-400">shield</span> Delegado de Club</span>
                </button>
                <button onclick="cambiarRol('PUBLICO')" class="w-full text-left px-2 py-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between text-slate-700 dark:text-slate-200">
                  <span class="flex items-center gap-1.5"><span class="material-symbols-outlined text-sm text-purple-600 dark:text-purple-400">visibility</span> Acceso Público (Aficionado)</span>
                </button>
              </div>

              <!-- Acciones de Cuenta: Mi Perfil & Cerrar Sesión -->
              <div class="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1">
                <button onclick="abrirModalPerfil()" class="w-full text-left px-2 py-2 rounded text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold flex items-center justify-between transition-colors">
                  <span class="flex items-center gap-2">
                    <span class="material-symbols-outlined text-base text-blue-600 dark:text-blue-400">badge</span>
                    Mi Perfil Oficial
                  </span>
                  <span class="material-symbols-outlined text-xs text-slate-400">chevron_right</span>
                </button>
                <button onclick="cerrarSesion()" class="w-full text-left px-2 py-2 rounded text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 font-bold flex items-center gap-2 transition-colors">
                  <span class="material-symbols-outlined text-base">logout</span>
                  Cerrar Sesión
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
    '''
    return header_html

print('Helper script ready.')
