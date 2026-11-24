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

SIGEC_LP_SVG_ISOTIPO = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none" aria-label="SIGEC-LP Isotipo" class="w-9 h-9 shrink-0 hover:scale-105 transition-transform cursor-pointer select-none drop-shadow-md" onclick="navigateView('tablero')" title="Ir al Tablero General SIGEC-LP">
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
      <feDropShadow dx="0" dy="1" stdDeviation="0.8" flood-opacity="0.35"/>
    </filter>
  </defs>
  <path d="M16 2.2 L27.5 5.8 C27.5 5.8 27.5 15.2 27.5 15.5 C27.5 22.8 22.2 28.5 16 30.5 C9.8 28.5 4.5 22.8 4.5 15.5 C4.5 15.2 4.5 5.8 4.5 5.8 L16 2.2 Z" fill="url(#hSG)" stroke="#818CF8" stroke-width="0.9" filter="url(#hSS)" />
  <path d="M16 4.2 L25.5 7.2 C25.5 7.2 25.5 15.2 25.5 15.5 C25.5 21.6 21 26.5 16 28.3 C11 26.5 6.5 21.6 6.5 15.5 C6.5 15.2 6.5 7.2 6.5 7.2 L16 4.2 Z" fill="none" stroke="url(#hGG)" stroke-width="0.8" stroke-opacity="0.95" />
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
    # Minimalist horizontal navigation items covering all main sections
    nav_links = [
        {'id': 'tablero', 'label': 'Partidos', 'icon': 'sports_soccer'},
        {'id': 'posiciones', 'label': 'Posiciones & Fixture', 'icon': 'leaderboard'},
        {'id': 'clubes', 'label': 'Clubes & Trámites', 'icon': 'shield'},
        {'id': 'uniformes', 'label': 'Uniformes 48h', 'icon': 'checkroom'},
        {'id': 'estadios', 'label': 'Escenarios & VAR', 'icon': 'stadium'},
        {'id': 'consola', 'label': 'Consola de Partido', 'icon': 'terminal'},
    ]

    nav_links_html = "".join([
        f'''<a href="javascript:void(0)" onclick="navigateView('{item['id']}')" class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap {'bg-indigo-600 text-white shadow-xs' if item['id'] == active_id else 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'}">
          <span class="material-symbols-outlined text-base">{item['icon']}</span>
          <span>{item['label']}</span>
        </a>'''
        for item in nav_links
    ])

    # Menú lateral colapsable (Drawer) para "Administración LigaPro"
    drawer_html = f'''
    <!-- Backdrop y Ventana Lateral Colapsable / Ocultable: Administración LigaPro -->
    <div id="admin-drawer-backdrop" class="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 hidden transition-opacity" onclick="toggleAdminDrawer(false)"></div>
    <aside id="admin-drawer" class="fixed top-0 left-0 bottom-0 w-72 bg-white dark:bg-[#111827] z-50 border-r border-slate-200 dark:border-slate-800 shadow-2xl transform -translate-x-full transition-transform duration-200 flex flex-col">
      <!-- Encabezado del menú ocultable -->
      <div class="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span class="font-extrabold text-xs uppercase tracking-wider text-slate-800 dark:text-slate-200">Administración LigaPro</span>
        </div>
        <button type="button" onclick="toggleAdminDrawer(false)" class="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" title="Cerrar panel">
          <span class="material-symbols-outlined text-lg">close</span>
        </button>
      </div>

      <!-- Enlaces del Menú -->
      <nav class="flex-1 overflow-y-auto p-3 space-y-1 text-xs">
        <a href="javascript:void(0)" onclick="toggleAdminDrawer(false); navigateView('tablero')" class="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold transition-colors">
          <span class="material-symbols-outlined text-lg text-indigo-600 dark:text-indigo-400">space_dashboard</span>
          <span>Tablero General</span>
        </a>
        <a href="javascript:void(0)" onclick="toggleAdminDrawer(false); mostrarModalCompeticionesFormatos()" class="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold transition-colors">
          <span class="material-symbols-outlined text-lg text-amber-500">emoji_events</span>
          <span>Competiciones & Formatos</span>
        </a>
        <a href="javascript:void(0)" onclick="toggleAdminDrawer(false); navigateView('estadios')" class="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold transition-colors">
          <span class="material-symbols-outlined text-lg text-emerald-500">stadium</span>
          <span>Escenarios & VAR (Z)</span>
        </a>
        <a href="javascript:void(0)" onclick="toggleAdminDrawer(false); navigateView('uniformes')" class="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold transition-colors">
          <span class="material-symbols-outlined text-lg text-blue-500">checkroom</span>
          <span>Designación de Uniformes</span>
        </a>
        <a href="javascript:void(0)" onclick="toggleAdminDrawer(false); navigateView('consola')" class="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold transition-colors">
          <span class="material-symbols-outlined text-lg text-red-500">sports_soccer</span>
          <span>Consola Comisario Matchday</span>
        </a>
        <a href="javascript:void(0)" onclick="toggleAdminDrawer(false); navigateView('clubes')" class="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold transition-colors">
          <span class="material-symbols-outlined text-lg text-purple-500">shield_person</span>
          <span>Portal Clubes & Trámites</span>
        </a>
        <a href="javascript:void(0)" onclick="toggleAdminDrawer(false); navigateView('posiciones')" class="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold transition-colors">
          <span class="material-symbols-outlined text-lg text-cyan-500">leaderboard</span>
          <span>Posiciones & Fair Play</span>
        </a>
        <a href="javascript:void(0)" onclick="toggleAdminDrawer(false); mostrarModalSeguridadSHA256()" class="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold transition-colors">
          <span class="material-symbols-outlined text-lg text-slate-400">verified_user</span>
          <span>Seguridad SHA-256</span>
        </a>
      </nav>

      <!-- Pie del menú -->
      <div class="p-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
        <span>SIGEC-LP v2025</span>
        <span class="font-mono">ID: LIGAPRO-EC</span>
      </div>
    </aside>
    '''

    header_html = f'''
    {drawer_html}
    <header class="fixed top-0 left-0 right-0 h-14 bg-white/95 dark:bg-[#0B0F19]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 z-40 px-3 sm:px-6 transition-colors">
      <div class="max-w-7xl mx-auto h-full flex items-center justify-between gap-3">
        <!-- Botón para Abrir/Ocultar Menú Lateral + Logo minimalista -->
        <div class="flex items-center gap-2 shrink-0">
          <button type="button" onclick="toggleAdminDrawer(true)" class="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5 font-bold text-xs" title="Abrir Menú de Administración">
            <span class="material-symbols-outlined text-xl">menu</span>
            <span class="hidden sm:inline">Menú</span>
          </button>
          
          <div class="flex items-center gap-2 cursor-pointer select-none" onclick="navigateView('tablero')">
            <span class="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-black text-sm shadow-xs">LP</span>
            <div class="flex flex-col hidden md:flex">
              <span class="font-extrabold text-sm tracking-tight text-slate-900 dark:text-white leading-tight">LigaPro</span>
              <span class="text-[10px] text-slate-400 font-medium">Serie A 2025</span>
            </div>
          </div>
        </div>

        <!-- Navegación HORIZONTAL limpia -->
        <nav class="flex items-center gap-1 overflow-x-auto no-scrollbar py-1">
          {nav_links_html}
        </nav>

        <!-- Derecha: Marcador En Vivo + Tema + Usuario -->
        <div class="flex items-center gap-2 shrink-0">
          <!-- Marcador En Vivo sutil y elegante -->
          <div onclick="navigateView('consola')" class="cursor-pointer hidden lg:flex items-center gap-2 bg-slate-100 dark:bg-slate-900/80 hover:bg-slate-200/80 dark:hover:bg-slate-800/80 px-2.5 py-1 rounded-full text-xs transition-colors border border-slate-200 dark:border-slate-800 select-none" title="Ver Consola de Partido">
            <span class="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            <span class="font-semibold text-slate-600 dark:text-slate-300">En Vivo</span>
            <span class="font-bold text-slate-900 dark:text-white font-mono px-0.5" id="header-score">1 - 1</span>
            <span class="text-[11px] text-slate-400 font-mono" id="header-match-min">68'</span>
          </div>

          <!-- Toggle Modo Oscuro Minimalista -->
          <button id="btn-theme-toggle" onclick="toggleGlobalHighContrast()" class="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" title="Cambiar tema">
            <span class="material-symbols-outlined text-lg">dark_mode</span>
          </button>

          <!-- Botón Iniciar Sesión (Sin sesión) -->
          <div id="header-auth-btn" class="hidden">
            <button onclick="navigateView('auth')" class="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs flex items-center gap-1.5 shadow-xs transition-colors">
              <span class="material-symbols-outlined text-sm">login</span>
              <span>Acceder</span>
            </button>
          </div>

          <!-- Bloque de Usuario (Con sesión) -->
          <div id="header-user-block" class="relative">
            <div onclick="toggleUserDropdown()" class="cursor-pointer flex items-center gap-2 py-1 px-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <img id="header-user-avatar" src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80" alt="Avatar Usuario" class="w-7 h-7 rounded-full object-cover border border-slate-300 dark:border-slate-700"/>
              <span id="header-user-name" class="font-semibold text-xs text-slate-800 dark:text-slate-200 hidden xl:inline max-w-[120px] truncate">Usuario</span>
              <span class="material-symbols-outlined text-slate-400 text-sm">expand_more</span>
            </div>

            <!-- Menú Desplegable Minimalista -->
            <div id="user-dropdown-menu" class="hidden absolute right-0 mt-2 w-52 bg-white dark:bg-[#111827] rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 z-50 p-2 text-xs text-slate-900 dark:text-slate-100">
              <div class="px-2 py-1.5 border-b border-slate-100 dark:border-slate-800 mb-1">
                <div class="font-bold truncate" id="dropdown-user-name">Usuario</div>
                <div class="text-[11px] text-slate-400 truncate" id="dropdown-user-email">usuario@correo.com</div>
              </div>
              <button onclick="abrirModalPerfil()" class="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 font-medium flex items-center gap-2 transition-colors">
                <span class="material-symbols-outlined text-base text-slate-500">person</span>
                <span>Mi Perfil</span>
              </button>
              <button onclick="cerrarSesion()" class="w-full text-left px-2.5 py-1.5 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 font-medium flex items-center gap-2 transition-colors">
                <span class="material-symbols-outlined text-base">logout</span>
                <span>Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
    '''
    return header_html

print('Helper script ready.')
