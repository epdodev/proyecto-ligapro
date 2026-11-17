import os
import re

SCREENS = {
    'tablero': {
        'folder': 'tablero_general_de_competiciones_ligapro',
        'title': 'Tablero General — SIGEC-LP LigaPro',
        'nav_label': 'Tablero General',
        'icon': 'dashboard',
        'file': 'tablero.html'
    },
    'posiciones': {
        'folder': 'tabla_de_posiciones_resultados_ligapro_ecuador',
        'title': 'Posiciones & Resultados — SIGEC-LP LigaPro',
        'nav_label': 'Posiciones & Fixture',
        'icon': 'leaderboard',
        'file': 'posiciones.html'
    },
    'clubes': {
        'folder': 'portal_de_clubes_tr_mites_solicitudes_reglamentarias_ligapro',
        'title': 'Portal de Clubes (Trámites) — SIGEC-LP LigaPro',
        'nav_label': 'Portal Clubes',
        'icon': 'folder_shared',
        'file': 'clubes.html'
    },
    'uniformes': {
        'folder': 'asistente_de_designaci_n_de_uniformes_48h_ligapro',
        'title': 'Asistente de Uniformes 48h — SIGEC-LP LigaPro',
        'nav_label': 'Uniformes 48h',
        'icon': 'checkroom',
        'file': 'uniformes.html'
    },
    'estadios': {
        'folder': 'inspecci_n_t_cnica_de_escenarios_var_ligapro',
        'title': 'Inspección de Escenarios & VAR — SIGEC-LP LigaPro',
        'nav_label': 'Escenarios & VAR',
        'icon': 'stadium',
        'file': 'estadios.html'
    },
    'consola': {
        'folder': 'consola_de_comisario_matchday_sigec_lp',
        'title': 'Consola de Comisario (Matchday) — SIGEC-LP LigaPro',
        'nav_label': 'Consola Comisario',
        'icon': 'sports',
        'file': 'consola.html'
    },
    'consola_alto_contraste': {
        'folder': 'consola_de_comisario_matchday_alto_contraste_wcag_aaa',
        'title': 'Consola Alto Contraste (WCAG AAA) — SIGEC-LP LigaPro',
        'nav_label': 'Consola WCAG AAA',
        'icon': 'contrast',
        'file': 'consola-alto-contraste.html'
    },
    'consola_tablet': {
        'folder': 'consola_t_ctil_de_campo_para_tablet_comisario_ligapro',
        'title': 'Consola Tablet de Campo — SIGEC-LP LigaPro',
        'nav_label': 'Consola Tablet',
        'icon': 'tablet_mac',
        'file': 'consola-tablet.html'
    },
    'auth': {
        'folder': 'inicio_de_sesi_n_sigec_lp_ligapro',
        'title': 'Inicio de Sesión & Roles — SIGEC-LP LigaPro',
        'nav_label': 'Acceso / Roles',
        'icon': 'lock',
        'file': 'login.html'
    }
}

def extract_body(folder):
    path = os.path.join('stitch_ligapro_competition_platform', folder, 'code.html')
    with open(path, 'r', encoding='utf-8') as f:
        html = f.read()
    b_idx = html.find('<body')
    b_end = html.find('>', b_idx)
    end_b = html.rfind('</body>')
    body_tag = html[b_idx:b_end+1]
    content = html[b_end+1:end_b].strip()
    return body_tag, content

def get_tailwind_config():
    path = os.path.join('stitch_ligapro_competition_platform', 'tablero_general_de_competiciones_ligapro', 'code.html')
    with open(path, 'r', encoding='utf-8') as f:
        html = f.read()
    start = html.find('tailwind.config=')
    end = html.find('</script>', start)
    return html[start:end]

def build():
    tw_config = get_tailwind_config()
    print('Tailwind config extracted, len:', len(tw_config))
    
    # Check that all folders exist
    for key, info in SCREENS.items():
        body_tag, content = extract_body(info['folder'])
        print(f"Extracted {key}: {len(content)} characters.")

if __name__ == '__main__':
    build()
