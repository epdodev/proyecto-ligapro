import os
import re

SCREENS = [
    {
        'id': 'tablero',
        'folder': 'tablero_general_de_competiciones_ligapro',
        'title': 'Tablero General — SIGEC-LP LigaPro',
        'nav_label': 'Tablero General',
        'icon': 'dashboard',
        'file': 'tablero.html'
    },
    {
        'id': 'posiciones',
        'folder': 'tabla_de_posiciones_resultados_ligapro_ecuador',
        'title': 'Posiciones & Resultados — SIGEC-LP LigaPro',
        'nav_label': 'Posiciones & Fixture',
        'icon': 'leaderboard',
        'file': 'posiciones.html'
    },
    {
        'id': 'clubes',
        'folder': 'portal_de_clubes_tr_mites_solicitudes_reglamentarias_ligapro',
        'title': 'Portal de Clubes (Trámites) — SIGEC-LP LigaPro',
        'nav_label': 'Portal Clubes',
        'icon': 'folder_shared',
        'file': 'clubes.html'
    },
    {
        'id': 'uniformes',
        'folder': 'asistente_de_designaci_n_de_uniformes_48h_ligapro',
        'title': 'Asistente de Uniformes 48h — SIGEC-LP LigaPro',
        'nav_label': 'Uniformes 48h',
        'icon': 'checkroom',
        'file': 'uniformes.html'
    },
    {
        'id': 'estadios',
        'folder': 'inspecci_n_t_cnica_de_escenarios_var_ligapro',
        'title': 'Inspección de Escenarios & VAR — SIGEC-LP LigaPro',
        'nav_label': 'Escenarios & VAR',
        'icon': 'stadium',
        'file': 'estadios.html'
    },
    {
        'id': 'consola',
        'folder': 'consola_de_comisario_matchday_sigec_lp',
        'title': 'Consola de Comisario (Matchday) — SIGEC-LP LigaPro',
        'nav_label': 'Consola Comisario',
        'icon': 'sports',
        'file': 'consola.html'
    },
    {
        'id': 'consola_alto_contraste',
        'folder': 'consola_de_comisario_matchday_alto_contraste_wcag_aaa',
        'title': 'Consola Alto Contraste (WCAG AAA) — SIGEC-LP LigaPro',
        'nav_label': 'Consola WCAG AAA',
        'icon': 'contrast',
        'file': 'consola-alto-contraste.html'
    },
    {
        'id': 'consola_tablet',
        'folder': 'consola_t_ctil_de_campo_para_tablet_comisario_ligapro',
        'title': 'Consola Tablet de Campo — SIGEC-LP LigaPro',
        'nav_label': 'Consola Tablet',
        'icon': 'tablet_mac',
        'file': 'consola-tablet.html'
    },
    {
        'id': 'auth',
        'folder': 'inicio_de_sesi_n_sigec_lp_ligapro',
        'title': 'Inicio de Sesión & Roles — SIGEC-LP LigaPro',
        'nav_label': 'Acceso / Roles',
        'icon': 'lock',
        'file': 'login.html'
    }
]

def get_screen_body(folder):
    path = os.path.join('stitch_ligapro_competition_platform', folder, 'code.html')
    with open(path, 'r', encoding='utf-8') as f:
        html = f.read()
    b_idx = html.find('<body')
    b_end = html.find('>', b_idx)
    end_b = html.rfind('</body>')
    body_content = html[b_end+1:end_b].strip()
    return body_content

def get_tailwind_config():
    path = os.path.join('stitch_ligapro_competition_platform', 'tablero_general_de_competiciones_ligapro', 'code.html')
    with open(path, 'r', encoding='utf-8') as f:
        html = f.read()
    start = html.find('tailwind.config=')
    end = html.find('</script>', start)
    return html[start:end]

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
          <div class="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-700 via-blue-900 to-black flex items-center justify-center text-white font-black shadow-md border border-amber-400">
            <span class="text-amber-400 text-lg">⚡</span>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="font-extrabold text-sm tracking-tight text-slate-900">LIGAPRO ECUABET</span>
              <span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 uppercase">SIGEC-LP</span>
              <span class="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Supabase Conectado</span>
              </span>
            </div>
            <p class="text-[11px] text-slate-500 font-medium">Sistema Integral de Gestión de Competiciones — Rige Reglamento 2023</p>
          </div>
        </div>

        <!-- Live Match Banner & Controls -->
        <div class="flex items-center flex-wrap gap-2">
          <!-- Live Match Score Widget -->
          <div onclick="navigateView('consola')" class="cursor-pointer flex items-center gap-2 bg-slate-900 text-white px-3 py-1.5 rounded-lg border border-slate-800 text-xs shadow-sm hover:border-amber-400 transition-colors">
            <span class="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
            <span class="font-bold text-amber-400">EN VIVO:</span>
            <span class="font-bold" id="header-match-local">LDU Quito</span>
            <span class="font-mono bg-slate-800 px-1.5 py-0.5 rounded font-bold text-amber-300" id="header-score">1 - 1</span>
            <span class="font-bold" id="header-match-visitante">Barcelona SC</span>
            <span class="font-mono text-slate-400 text-[10px]" id="header-match-min">68' 2T</span>
          </div>

          <!-- Role Selector -->
          <div class="relative inline-block text-left">
            <select id="global-role-select" onchange="onRoleChange(this.value)" class="text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 font-semibold focus:ring-2 focus:ring-blue-600 focus:outline-none cursor-pointer">
              <option value="DIR_COMP">Dirección de Competiciones</option>
              <option value="COMISARIO">Comisario de Partido (Matchday)</option>
              <option value="CLUB_ADMIN_LDU">Club Admin: LDU Quito</option>
              <option value="CLUB_ADMIN_BSC">Club Admin: Barcelona SC</option>
              <option value="OF_VAR">Oficial Técnico VAR</option>
              <option value="DEL_SEG">Delegado de Seguridad</option>
              <option value="MED_CAMPO">Médico de Campo</option>
              <option value="ADM_SIS">Administrador del Sistema</option>
            </select>
          </div>

          <!-- WCAG AAA High Contrast Toggle -->
          <button onclick="toggleGlobalHighContrast()" id="btn-toggle-contrast" class="p-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 transition-colors" title="Modo Alto Contraste WCAG AAA (Negro / Amarillo)">
            <span class="material-symbols-outlined text-lg">contrast</span>
          </button>
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
