import os
import re

SCREENS = {
    'auth': 'inicio_de_sesi_n_sigec_lp_ligapro',
    'tablero': 'tablero_general_de_competiciones_ligapro',
    'posiciones': 'tabla_de_posiciones_resultados_ligapro_ecuador',
    'clubes': 'portal_de_clubes_tr_mites_solicitudes_reglamentarias_ligapro',
    'uniformes': 'asistente_de_designaci_n_de_uniformes_48h_ligapro',
    'estadios': 'inspecci_n_t_cnica_de_escenarios_var_ligapro',
    'consola': 'consola_de_comisario_matchday_sigec_lp',
    'consola_alto_contraste': 'consola_de_comisario_matchday_alto_contraste_wcag_aaa',
    'consola_tablet': 'consola_t_ctil_de_campo_para_tablet_comisario_ligapro'
}

for key, folder in SCREENS.items():
    path = os.path.join('stitch_ligapro_competition_platform', folder, 'code.html')
    with open(path, 'r', encoding='utf-8') as f:
        html = f.read()
    scripts = re.findall(r'<script(?![^>]*src=)[^>]*>(.*?)</script>', html, re.DOTALL)
    print(f'=== {key} ({len(scripts)} inline scripts) ===')
    for s in scripts:
        s_clean = s.strip()
        if 'tailwind.config' in s_clean:
            continue
        print('  Script preview:', s_clean[:150].replace('\n', ' '))
