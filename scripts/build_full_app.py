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

def insert_into_screen_main(body_html, bar_html):
    pattern = r'(<main\b[^>]*>)'
    if re.search(pattern, body_html):
        return re.sub(pattern, rf'\1\n{bar_html}', body_html, count=1)
    return bar_html + body_html

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
        return insert_into_screen_main(body_html, control_bar)

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
        return insert_into_screen_main(body_html, control_bar)

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
        return insert_into_screen_main(body_html, control_bar)

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
        return insert_into_screen_main(body_html, action_bar)

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
        return insert_into_screen_main(body_html, btn_bar)

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
        return insert_into_screen_main(body_html, btn_bar)

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
        return insert_into_screen_main(body_html, btn_bar)

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
  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
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
          document.documentElement.classList.add('dark');
        }}
        var scale = localStorage.getItem('sigec_font_scale');
        if (scale) {{
          document.documentElement.style.fontSize = scale + '%';
        }}
      }} catch (e) {{}}
    }})();
  </script>
  <link rel="stylesheet" href="/src/index.css"/>
  <style>
    @layer base {{
      html, body {{ margin: 0; padding: 0; transition: background-color 0.15s ease, color 0.15s ease; }}
      body {{ overscroll-behavior: none; }}
    }}
    ::-webkit-scrollbar {{ display: none; }}

    /* PALETA OSCURA MODERNA (MIDNIGHT BROADCAST) */
    html.dark {{
      color-scheme: dark;
      background-color: #0B0F19;
    }}
    html.dark body {{
      background-color: #0B0F19 !important;
      color: #F8FAFC !important;
    }}
    #header-brand-title,
    html.dark #header-brand-title {{
      color: #F1F5F9 !important;
    }}
    html.dark header {{
      background-color: #111827 !important;
      border-color: #1E293B !important;
      color: #F8FAFC !important;
    }}
    html.dark aside {{
      background-color: #111827 !important;
      border-color: #1E293B !important;
      color: #CBD5E1 !important;
    }}
    html.dark main {{
      background-color: #0B0F19 !important;
    }}
    html.dark aside a, html.dark aside button {{
      color: #CBD5E1 !important;
    }}
    html.dark aside a:hover, html.dark aside button:hover {{
      background-color: #1E293B !important;
      color: #FFFFFF !important;
    }}
    html.dark .bg-white, html.dark .bg-surface-card, html.dark .bg-surface-container-lowest {{
      background-color: #111827 !important;
      color: #F8FAFC !important;
      border-color: #1E293B !important;
    }}
    html.dark .bg-surface, html.dark .bg-surface-base {{
      background-color: #0B0F19 !important;
      color: #F8FAFC !important;
    }}
    html.dark .bg-slate-50, html.dark .bg-slate-100, html.dark .bg-gray-50, html.dark .bg-gray-100,
    html.dark .bg-surface-container, html.dark .bg-surface-container-low, html.dark .bg-surface-container-high, html.dark .bg-surface-container-highest {{
      background-color: #1E293B !important;
      color: #E2E8F0 !important;
      border-color: #1E293B !important;
    }}

    /* REGLA GLOBAL DE LEGIBILIDAD EN .dark: TEXTOS OSCUROS A BLANCO SUAVE (#F8FAFC) */
    html.dark h1, html.dark h2, html.dark h3, html.dark h4, html.dark h5, html.dark h6,
    html.dark .text-slate-900, html.dark .text-slate-800,
    html.dark .text-gray-900, html.dark .text-gray-800,
    html.dark .text-black, html.dark .text-on-surface,
    html.dark .text-text-primary, html.dark .text-on-background {{
      color: #F8FAFC !important;
    }}

    /* CONTADORES Y MÉTRICAS GRANDES DE TARJETAS (16 / 16, 18 / 18, 8 Partidos, etc.) */
    html.dark .font-mono-metric,
    html.dark [class*="font-mono-metric"],
    html.dark [class*="text-mono-metric"] {{
      color: #FFFFFF !important;
    }}

    /* TEXTOS MEDIOS Y SECUNDARIOS A GRIS CLARO LEGIBLE (#CBD5E1 / #94A3B8) */
    html.dark .text-slate-600, html.dark .text-slate-500,
    html.dark .text-gray-600, html.dark .text-gray-500,
    html.dark .text-text-secondary, html.dark .text-on-surface-variant {{
      color: #CBD5E1 !important;
    }}
    html.dark .text-slate-400, html.dark .text-gray-400 {{
      color: #94A3B8 !important;
    }}

    /* BORDES SUTILES SLATE-800 (#1E293B) — Reemplazo de amarillos y bordes claros */
    html.dark .border-slate-100, html.dark .border-slate-200, html.dark .border-slate-300,
    html.dark .border-gray-100, html.dark .border-gray-200, html.dark .border-gray-300,
    html.dark .border-yellow-400, html.dark .border-amber-400,
    html.dark .border-border-subtle, html.dark .border-strong,
    html.dark .border-outline, html.dark .border-outline-variant {{
      border-color: #1E293B !important;
    }}

    /* TABLAS Y FORMULARIOS */
    html.dark table thead tr {{
      background-color: #1E293B !important;
      color: #F8FAFC !important;
    }}
    html.dark table tbody tr {{
      border-color: #1E293B !important;
      color: #CBD5E1 !important;
    }}
    html.dark table tbody tr:hover {{
      background-color: rgba(30, 41, 59, 0.7) !important;
    }}
    html.dark input, html.dark select, html.dark textarea {{
      background-color: #111827 !important;
      border-color: #1E293B !important;
      color: #F8FAFC !important;
    }}
    html.dark input::placeholder, html.dark textarea::placeholder {{
      color: #64748B !important;
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
  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
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
          document.documentElement.classList.add('dark');
        }}
        var scale = localStorage.getItem('sigec_font_scale');
        if (scale) {{
          document.documentElement.style.fontSize = scale + '%';
        }}
      }} catch (e) {{}}
    }})();
  </script>
  <link rel="stylesheet" href="/src/index.css"/>
  <style>
    @layer base {{
      html, body {{ margin: 0; padding: 0; transition: background-color 0.15s ease, color 0.15s ease; }}
      body {{ overscroll-behavior: none; }}
    }}
    ::-webkit-scrollbar {{ display: none; }}

    /* PALETA OSCURA MODERNA (MIDNIGHT BROADCAST) */
    html.dark {{
      color-scheme: dark;
      background-color: #0B0F19;
    }}
    html.dark body {{
      background-color: #0B0F19 !important;
      color: #F8FAFC !important;
    }}
    #header-brand-title,
    html.dark #header-brand-title {{
      color: #F1F5F9 !important;
    }}
    html.dark header {{
      background-color: #111827 !important;
      border-color: #1E293B !important;
      color: #F8FAFC !important;
    }}
    html.dark aside {{
      background-color: #111827 !important;
      border-color: #1E293B !important;
      color: #CBD5E1 !important;
    }}
    html.dark main {{
      background-color: #0B0F19 !important;
    }}
    html.dark aside a, html.dark aside button {{
      color: #CBD5E1 !important;
    }}
    html.dark aside a:hover, html.dark aside button:hover {{
      background-color: #1E293B !important;
      color: #FFFFFF !important;
    }}
    html.dark .bg-white, html.dark .bg-surface-card, html.dark .bg-surface-container-lowest {{
      background-color: #111827 !important;
      color: #F8FAFC !important;
      border-color: #1E293B !important;
    }}
    html.dark .bg-surface, html.dark .bg-surface-base {{
      background-color: #0B0F19 !important;
      color: #F8FAFC !important;
    }}
    html.dark .bg-slate-50, html.dark .bg-slate-100, html.dark .bg-gray-50, html.dark .bg-gray-100,
    html.dark .bg-surface-container, html.dark .bg-surface-container-low, html.dark .bg-surface-container-high, html.dark .bg-surface-container-highest {{
      background-color: #1E293B !important;
      color: #E2E8F0 !important;
      border-color: #1E293B !important;
    }}

    /* REGLA GLOBAL DE LEGIBILIDAD EN .dark: TEXTOS OSCUROS A BLANCO SUAVE (#F8FAFC) */
    html.dark h1, html.dark h2, html.dark h3, html.dark h4, html.dark h5, html.dark h6,
    html.dark .text-slate-900, html.dark .text-slate-800,
    html.dark .text-gray-900, html.dark .text-gray-800,
    html.dark .text-black, html.dark .text-on-surface,
    html.dark .text-text-primary, html.dark .text-on-background {{
      color: #F8FAFC !important;
    }}

    /* CONTADORES Y MÉTRICAS GRANDES DE TARJETAS (16 / 16, 18 / 18, 8 Partidos, etc.) */
    html.dark .font-mono-metric,
    html.dark [class*="font-mono-metric"],
    html.dark [class*="text-mono-metric"] {{
      color: #FFFFFF !important;
    }}

    /* TEXTOS MEDIOS Y SECUNDARIOS A GRIS CLARO LEGIBLE (#CBD5E1 / #94A3B8) */
    html.dark .text-slate-600, html.dark .text-slate-500,
    html.dark .text-gray-600, html.dark .text-gray-500,
    html.dark .text-text-secondary, html.dark .text-on-surface-variant {{
      color: #CBD5E1 !important;
    }}
    html.dark .text-slate-400, html.dark .text-gray-400 {{
      color: #94A3B8 !important;
    }}

    /* BORDES SUTILES SLATE-800 (#1E293B) — Reemplazo de amarillos y bordes claros */
    html.dark .border-slate-100, html.dark .border-slate-200, html.dark .border-slate-300,
    html.dark .border-gray-100, html.dark .border-gray-200, html.dark .border-gray-300,
    html.dark .border-yellow-400, html.dark .border-amber-400,
    html.dark .border-border-subtle, html.dark .border-strong,
    html.dark .border-outline, html.dark .border-outline-variant {{
      border-color: #1E293B !important;
    }}

    /* TABLAS Y FORMULARIOS */
    html.dark table thead tr {{
      background-color: #1E293B !important;
      color: #F8FAFC !important;
    }}
    html.dark table tbody tr {{
      border-color: #1E293B !important;
      color: #CBD5E1 !important;
    }}
    html.dark table tbody tr:hover {{
      background-color: rgba(30, 41, 59, 0.7) !important;
    }}
    html.dark input, html.dark select, html.dark textarea {{
      background-color: #111827 !important;
      border-color: #1E293B !important;
      color: #F8FAFC !important;
    }}
    html.dark input::placeholder, html.dark textarea::placeholder {{
      color: #64748B !important;
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
