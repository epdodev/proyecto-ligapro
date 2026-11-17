import os
import re
from build_cleaner_v2 import clean_and_transform_screen

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

def enrich_screen_html(screen_id, body_html):
    # Añadimos hooks interactivos según la vista
    if screen_id == 'consola':
        # Agregar botones de control en vivo de comisario si no están
        control_bar = '''
        <!-- Barra de Control Rápido de Matchday (SIGEC-LP) -->
        <div class="mb-4 bg-slate-900 border border-slate-800 text-white p-3 rounded-xl flex flex-wrap items-center justify-between gap-3 shadow-lg">
          <div class="flex items-center gap-2">
            <span class="w-3 h-3 rounded-full bg-red-500 animate-ping"></span>
            <span class="font-bold text-xs text-amber-400">OPERACIÓN EN VIVO (Min 68')</span>
            <span class="text-xs text-slate-400">| Árbitro: Augusto Aragón (FIFA) | VAR: Bryan Loayza</span>
          </div>
          <div class="flex items-center flex-wrap gap-2">
            <button onclick="registrarGolEnVivo('local')" class="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold flex items-center gap-1">
              ⚽ +Gol LDU
            </button>
            <button onclick="registrarGolEnVivo('visitante')" class="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold flex items-center gap-1">
              ⚽ +Gol BSC
            </button>
            <button onclick="registrarTarjetaEnVivo('amarilla', 'visitante')" class="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-black rounded text-xs font-bold flex items-center gap-1">
              🟨 Amarilla (Art. 91)
            </button>
            <button onclick="registrarTarjetaEnVivo('roja', 'visitante')" class="px-2.5 py-1 bg-red-600 hover:bg-red-500 text-white rounded text-xs font-bold flex items-center gap-1">
              🟥 Roja (Art. 90)
            </button>
            <button onclick="registrarSustitucionEnVivo('local')" class="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-bold flex items-center gap-1">
              🔄 Sustitución (Disp. 4ª)
            </button>
            <button onclick="registrarHidratacionEnVivo()" class="px-2.5 py-1 bg-cyan-700 hover:bg-cyan-600 text-white rounded text-xs font-bold flex items-center gap-1">
              💧 Hidratación (Art. 71)
            </button>
            <button onclick="registrarIncidenteEnVivo()" class="px-2.5 py-1 bg-rose-700 hover:bg-rose-600 text-white rounded text-xs font-bold flex items-center gap-1">
              ⚠️ Susp. 30m (Art. 73)
            </button>
          </div>
        </div>
        '''
        return control_bar + body_html

    elif screen_id == 'consola_tablet':
        control_bar = '''
        <!-- Touch Tablet Fast Action Bar -->
        <div class="mb-3 bg-black text-white p-2.5 rounded-lg border border-amber-400 flex items-center justify-between text-xs font-bold">
          <div class="flex items-center gap-2">
            <span class="text-amber-400">📱 MODO TABLET DE CAMPO (Art. 45/60)</span>
            <span class="text-emerald-400 font-mono">ONLINE / SYNC OK</span>
          </div>
          <div class="flex items-center gap-1.5">
            <button onclick="registrarGolEnVivo('local')" class="px-2 py-1 bg-emerald-700 rounded text-white text-[11px]">+Gol LDU</button>
            <button onclick="registrarGolEnVivo('visitante')" class="px-2 py-1 bg-emerald-700 rounded text-white text-[11px]">+Gol BSC</button>
            <button onclick="registrarTarjetaEnVivo('amarilla', 'visitante')" class="px-2 py-1 bg-amber-600 rounded text-black text-[11px]">Amarilla</button>
            <button onclick="registrarTarjetaEnVivo('roja', 'visitante')" class="px-2 py-1 bg-red-700 rounded text-white text-[11px]">Roja</button>
          </div>
        </div>
        '''
        return control_bar + body_html

    elif screen_id == 'consola_alto_contraste':
        control_bar = '''
        <!-- WCAG AAA Action Bar -->
        <div class="mb-4 bg-black border-2 border-[#FFE600] text-white p-3 rounded-lg flex items-center justify-between text-sm font-bold">
          <div class="flex items-center gap-2">
            <span class="text-[#FFE600] font-mono tracking-wider">CONSOLA WCAG AAA ALTO CONTRASTE (21:1)</span>
          </div>
          <div class="flex items-center gap-2">
            <button onclick="registrarGolEnVivo('local')" class="px-3 py-1.5 bg-[#FFE600] text-black font-extrabold rounded border-2 border-white">+GOL LDU</button>
            <button onclick="registrarGolEnVivo('visitante')" class="px-3 py-1.5 bg-[#FFE600] text-black font-extrabold rounded border-2 border-white">+GOL BSC</button>
            <button onclick="registrarTarjetaEnVivo('amarilla', 'visitante')" class="px-3 py-1.5 bg-black text-[#FFE600] font-extrabold rounded border-2 border-[#FFE600]">AMARILLA</button>
            <button onclick="registrarTarjetaEnVivo('roja', 'visitante')" class="px-3 py-1.5 bg-[#FF3333] text-white font-extrabold rounded border-2 border-white">ROJA</button>
          </div>
        </div>
        '''
        return control_bar + body_html

    elif screen_id == 'posiciones':
        action_bar = '''
        <!-- Motor de Clasificación y Desempates (Art. 11, 12, 13) -->
        <div class="mb-4 bg-gradient-to-r from-blue-900 to-slate-900 text-white p-3 rounded-xl flex flex-wrap items-center justify-between gap-3 shadow-md border border-blue-700">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-amber-400">gavel</span>
            <span class="font-bold text-xs">MOTOR REGLAMENTARIO LIGAPRO: Desempates & Definición de Título</span>
          </div>
          <div class="flex items-center gap-2">
            <button onclick="mostrarModalFinalistas()" class="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold rounded-lg text-xs shadow-sm flex items-center gap-1">
              <span class="material-symbols-outlined text-sm">emoji_events</span>
              Calcular Finalistas y Campeón (Art. 12/13)
            </button>
          </div>
        </div>
        '''
        return action_bar + body_html

    elif screen_id == 'clubes':
        btn_bar = '''
        <div class="mb-4 bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between gap-2 shadow-xs">
          <div>
            <h3 class="font-bold text-slate-900 text-xs">Ventanilla Única Digital de Clubes (Art. 6, 28, 29, 35, 50)</h3>
            <p class="text-[11px] text-slate-500">Radicación de trámites oficiales y monitoreo automático de plazos de caducidad</p>
          </div>
          <button onclick="mostrarModalNuevoTramite()" class="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm">
            <span class="material-symbols-outlined text-sm">add_circle</span>
            Nueva Solicitud Reglamentaria
          </button>
        </div>
        '''
        return btn_bar + body_html

    elif screen_id == 'uniformes':
        btn_bar = '''
        <div class="mb-4 bg-white p-3 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-2 shadow-xs">
          <div>
            <h3 class="font-bold text-slate-900 text-xs">Asistente Técnico 48h de Indumentaria (Art. 29, 30, 31, 32)</h3>
            <p class="text-[11px] text-slate-500">Cálculo de luminancia WCAG y diferenciación con cuaterna arbitral y guardametas</p>
          </div>
          <div class="flex items-center gap-2">
            <button onclick="actualizarKitsUniformes()" class="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold flex items-center gap-1">
              <span class="material-symbols-outlined text-sm">refresh</span> Reevaluar Contraste
            </button>
            <button onclick="sellarActaUniformes()" class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm">
              <span class="material-symbols-outlined text-sm">verified</span> Sellar Acta Oficial (Art. 30)
            </button>
          </div>
        </div>
        '''
        return btn_bar + body_html

    elif screen_id == 'estadios':
        btn_bar = '''
        <div class="mb-4 bg-white p-3 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-2 shadow-xs">
          <div>
            <h3 class="font-bold text-slate-900 text-xs">Inspección de Infraestructura y Cabina VOR (Art. 51, 87a, 92)</h3>
            <p class="text-[11px] text-slate-500">Evaluación en tiempo real de altura de césped, hospital de referencia y energía 220V</p>
          </div>
          <div class="flex items-center gap-2">
            <button onclick="evaluarEscenarioEnVivo()" class="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1">
              <span class="material-symbols-outlined text-sm">rule</span> Evaluar Calificación
            </button>
          </div>
        </div>
        '''
        return btn_bar + body_html

    return body_html

def build():
    tw_config = get_tailwind_config()
    
    # 1. Generar standalone HTML para cada pantalla
    for s in SCREENS:
        body_content = clean_and_transform_screen(s['folder'], s['id'])
        enriched_content = enrich_screen_html(s['id'], body_content)
        
        # Navigation header for standalone
        from build_helpers import generate_header
        header = generate_header(s['id'])
        
        standalone_html = f'''<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>{s['title']}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com"/>
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin=""/>
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>
  <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
  <script id="tailwind-config">{tw_config}</script>
  <script>
    (function() {{
      try {{
        var theme = localStorage.getItem('sigec_theme') || (localStorage.getItem('sigec_high_contrast') === 'true' ? 'dark' : null);
        if (theme === 'dark') {{
          document.documentElement.classList.add('dark', 'high-contrast');
        }}
        var scale = localStorage.getItem('sigec_font_scale');
        if (scale) {{
          document.documentElement.style.fontSize = scale + '%';
        }}
      }} catch (e) {{}}
    }})();
  </script>
  <style>
    @layer base {{
      html, body {{ margin: 0; padding: 0; transition: background-color 0.15s ease, color 0.15s ease; }}
      body {{ overscroll-behavior: none; }}
    }}
    ::-webkit-scrollbar {{ display: none; }}

    /* MODO OSCURO (Tailwind dark: y soporte directo) */
    html.dark {{
      color-scheme: dark;
    }}
    html.dark body {{
      background-color: #0b1329 !important;
      color: #f1f5f9 !important;
    }}
    html.dark header {{
      background-color: rgba(15, 23, 42, 0.95) !important;
      border-color: #1e293b !important;
      color: #f1f5f9 !important;
    }}
    html.dark aside {{
      background-color: #0f172a !important;
      border-color: #1e293b !important;
      color: #f1f5f9 !important;
    }}
    html.dark aside a, html.dark aside button {{
      color: #cbd5e1 !important;
    }}
    html.dark aside a:hover, html.dark aside button:hover {{
      background-color: #1e293b !important;
      color: #ffffff !important;
    }}
    html.dark .bg-white {{
      background-color: #0f172a !important;
      color: #f1f5f9 !important;
      border-color: #1e293b !important;
    }}
    html.dark .bg-surface, html.dark .bg-surface-container-low, html.dark .bg-surface-container {{
      background-color: #0b1329 !important;
      color: #f1f5f9 !important;
    }}
    html.dark .bg-slate-50, html.dark .bg-slate-100 {{
      background-color: #1e293b !important;
      color: #e2e8f0 !important;
      border-color: #334155 !important;
    }}
    html.dark .text-slate-900, html.dark .text-slate-800, html.dark .text-slate-700 {{
      color: #f8fafc !important;
    }}
    html.dark .text-slate-600, html.dark .text-slate-500 {{
      color: #94a3b8 !important;
    }}
    html.dark .border-slate-100, html.dark .border-slate-200, html.dark .border-slate-300 {{
      border-color: #334155 !important;
    }}
    html.dark input, html.dark select, html.dark textarea {{
      background-color: #1e293b !important;
      border-color: #475569 !important;
      color: #f8fafc !important;
    }}

    /* MODO ALTO CONTRASTE WCAG AAA (Negro / Amarillo #FFE600 / 21:1) */
    html.high-contrast {{
      color-scheme: dark;
    }}
    html.high-contrast body {{
      background-color: #000000 !important;
      color: #FFFFFF !important;
    }}
    html.high-contrast header, html.high-contrast aside, html.high-contrast .bg-white, html.high-contrast .bg-surface, html.high-contrast .bg-slate-50, html.high-contrast .bg-slate-100 {{
      background-color: #000000 !important;
      border-color: #FFE600 !important;
      color: #FFFFFF !important;
    }}
    html.high-contrast button {{
      border-color: #FFE600 !important;
    }}
    html.high-contrast a, html.high-contrast .text-amber-400, html.high-contrast .text-amber-500 {{
      color: #FFE600 !important;
    }}
    html.high-contrast .text-slate-900, html.high-contrast .text-slate-800, html.high-contrast .text-slate-700, html.high-contrast .text-slate-600, html.high-contrast .text-slate-500 {{
      color: #FFFFFF !important;
    }}
    html.high-contrast .border-slate-100, html.high-contrast .border-slate-200, html.high-contrast .border-slate-300 {{
      border-color: #FFE600 !important;
    }}
    .high-contrast-mode {{
      background-color: #000000 !important;
      color: #FFFFFF !important;
    }}
  </style>
</head>
<body class="bg-surface font-body-md text-on-surface antialiased min-h-screen">
  {header}
  <main class="w-full">
    {enriched_content}
  </main>
  <script type="module" src="src/lib/interactive.js"></script>
</body>
</html>'''

        with open(s['file'], 'w', encoding='utf-8') as f_out:
            f_out.write(standalone_html)
        print(f"Generated standalone page: {s['file']}")

    # 2. Generar master index.html unificado (SPA con tabs)
    from build_helpers import generate_header
    master_header = generate_header('tablero')
    
    views_containers = []
    for s in SCREENS:
        body_content = clean_and_transform_screen(s['folder'], s['id'])
        enriched_content = enrich_screen_html(s['id'], body_content)
        hidden_class = "" if s['id'] == 'tablero' else "hidden"
        views_containers.append(f'''
        <div id="view-{s['id']}" class="sigec-view-container {hidden_class} w-full transition-opacity duration-200">
          {enriched_content}
        </div>''')

    index_html = f'''<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>SIGEC-LP — Sistema Integral de Gestión de Competiciones LigaPro Ecuador</title>
  <meta name="description" content="Plataforma tecnológica oficial para la administración de competiciones, fixture, comisarías de partido, actas de uniformes, estadios e inspección VAR de LigaPro Ecuador."/>
  <link rel="preconnect" href="https://fonts.googleapis.com"/>
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin=""/>
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>
  <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
  <script id="tailwind-config">{tw_config}</script>
  <script>
    (function() {{
      try {{
        var theme = localStorage.getItem('sigec_theme') || (localStorage.getItem('sigec_high_contrast') === 'true' ? 'dark' : null);
        if (theme === 'dark') {{
          document.documentElement.classList.add('dark', 'high-contrast');
        }}
        var scale = localStorage.getItem('sigec_font_scale');
        if (scale) {{
          document.documentElement.style.fontSize = scale + '%';
        }}
      }} catch (e) {{}}
    }})();
  </script>
  <style>
    @layer base {{
      html, body {{ margin: 0; padding: 0; transition: background-color 0.15s ease, color 0.15s ease; }}
      body {{ overscroll-behavior: none; }}
    }}
    ::-webkit-scrollbar {{ display: none; }}

    /* MODO OSCURO (Tailwind dark: y soporte directo) */
    html.dark {{
      color-scheme: dark;
    }}
    html.dark body {{
      background-color: #0b1329 !important;
      color: #f1f5f9 !important;
    }}
    html.dark header {{
      background-color: rgba(15, 23, 42, 0.95) !important;
      border-color: #1e293b !important;
      color: #f1f5f9 !important;
    }}
    html.dark aside {{
      background-color: #0f172a !important;
      border-color: #1e293b !important;
      color: #f1f5f9 !important;
    }}
    html.dark aside a, html.dark aside button {{
      color: #cbd5e1 !important;
    }}
    html.dark aside a:hover, html.dark aside button:hover {{
      background-color: #1e293b !important;
      color: #ffffff !important;
    }}
    html.dark .bg-white {{
      background-color: #0f172a !important;
      color: #f1f5f9 !important;
      border-color: #1e293b !important;
    }}
    html.dark .bg-surface, html.dark .bg-surface-container-low, html.dark .bg-surface-container {{
      background-color: #0b1329 !important;
      color: #f1f5f9 !important;
    }}
    html.dark .bg-slate-50, html.dark .bg-slate-100 {{
      background-color: #1e293b !important;
      color: #e2e8f0 !important;
      border-color: #334155 !important;
    }}
    html.dark .text-slate-900, html.dark .text-slate-800, html.dark .text-slate-700 {{
      color: #f8fafc !important;
    }}
    html.dark .text-slate-600, html.dark .text-slate-500 {{
      color: #94a3b8 !important;
    }}
    html.dark .border-slate-100, html.dark .border-slate-200, html.dark .border-slate-300 {{
      border-color: #334155 !important;
    }}
    html.dark input, html.dark select, html.dark textarea {{
      background-color: #1e293b !important;
      border-color: #475569 !important;
      color: #f8fafc !important;
    }}

    /* MODO ALTO CONTRASTE WCAG AAA (Negro / Amarillo #FFE600 / 21:1) */
    html.high-contrast {{
      color-scheme: dark;
    }}
    html.high-contrast body {{
      background-color: #000000 !important;
      color: #FFFFFF !important;
    }}
    html.high-contrast header, html.high-contrast aside, html.high-contrast .bg-white, html.high-contrast .bg-surface, html.high-contrast .bg-slate-50, html.high-contrast .bg-slate-100 {{
      background-color: #000000 !important;
      border-color: #FFE600 !important;
      color: #FFFFFF !important;
    }}
    html.high-contrast button {{
      border-color: #FFE600 !important;
    }}
    html.high-contrast a, html.high-contrast .text-amber-400, html.high-contrast .text-amber-500 {{
      color: #FFE600 !important;
    }}
    html.high-contrast .text-slate-900, html.high-contrast .text-slate-800, html.high-contrast .text-slate-700, html.high-contrast .text-slate-600, html.high-contrast .text-slate-500 {{
      color: #FFFFFF !important;
    }}
    html.high-contrast .border-slate-100, html.high-contrast .border-slate-200, html.high-contrast .border-slate-300 {{
      border-color: #FFE600 !important;
    }}
    .high-contrast-mode {{
      background-color: #000000 !important;
      color: #FFFFFF !important;
    }}
  </style>
</head>
<body class="bg-surface font-body-md text-on-surface antialiased min-h-screen flex flex-col">
  {master_header}
  <main class="w-full flex-1">
    {''.join(views_containers)}
  </main>
  
  <footer class="bg-slate-900 text-slate-400 border-t border-slate-800 py-4 px-6 text-xs text-center">
    <div class="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
      <div class="flex items-center gap-2">
        <span class="font-extrabold text-white">SIGEC-LP</span>
        <span>•</span>
        <span>Liga Profesional de Fútbol del Ecuador</span>
        <span>•</span>
        <span class="text-amber-400">Reglamento Oficial 2023</span>
      </div>
      <div class="flex items-center gap-3">
        <a href="docs/SRS.md" class="hover:text-amber-400 transition-colors">Especificación SRS</a>
        <span>•</span>
        <span class="font-mono text-emerald-400">Supabase: udykrprupwifmffhpvuz</span>
        <span>•</span>
        <span>WCAG 2.1 AAA Compliant</span>
      </div>
    </div>
  </footer>

  <script type="module" src="src/lib/interactive.js"></script>
</body>
</html>'''

    with open('index.html', 'w', encoding='utf-8') as f_idx:
        f_idx.write(index_html)
    print("Generated master application: index.html")

if __name__ == '__main__':
    build()
