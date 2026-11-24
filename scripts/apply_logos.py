import os
import re

# Helper mappings for club names to logos
CLUB_LOGOS = {
    'LDU Quito': 'assets/clubs/ldu-quito.png',
    'Liga Deportiva Universitaria': 'assets/clubs/ldu-quito.png',
    'Liga Deportiva Universitaria de Quito': 'assets/clubs/ldu-quito.png',
    'LDU': 'assets/clubs/ldu-quito.png',
    'Barcelona SC': 'assets/clubs/barcelona-sc.png',
    'Barcelona Sporting Club': 'assets/clubs/barcelona-sc.png',
    'BSC': 'assets/clubs/barcelona-sc.png',
    'Independiente del Valle': 'assets/clubs/independiente-del-valle.png',
    'Ind. del Valle': 'assets/clubs/independiente-del-valle.png',
    'IDV': 'assets/clubs/independiente-del-valle.png',
    'Universidad Católica': 'assets/clubs/universidad-catolica.png',
    'CD Universidad Católica': 'assets/clubs/universidad-catolica.png',
    'C.D. Universidad Católica': 'assets/clubs/universidad-catolica.png',
    'U. Católica': 'assets/clubs/universidad-catolica.png',
    'SD Aucas': 'assets/clubs/sd-aucas.png',
    'Sociedad Deportiva Aucas': 'assets/clubs/sd-aucas.png',
    'S.D. Aucas': 'assets/clubs/sd-aucas.png',
    'Aucas': 'assets/clubs/sd-aucas.png',
    'CS Emelec': 'assets/clubs/cs-emelec.png',
    'Club Sport Emelec': 'assets/clubs/cs-emelec.png',
    'C.S. Emelec': 'assets/clubs/cs-emelec.png',
    'Emelec': 'assets/clubs/cs-emelec.png',
    'Orense SC': 'assets/clubs/orense-sc.png',
    'Orense Sporting Club': 'assets/clubs/orense-sc.png',
    'Orense S.C.': 'assets/clubs/orense-sc.png',
    'Orense': 'assets/clubs/orense-sc.png',
    'El Nacional': 'assets/clubs/el-nacional.png',
    'Club Deportivo El Nacional': 'assets/clubs/el-nacional.png',
    'CD El Nacional': 'assets/clubs/el-nacional.png',
    'Macará': 'assets/clubs/macara.png',
    'Club Deportivo Macará': 'assets/clubs/macara.png',
    'CD Macará': 'assets/clubs/macara.png',
    'C.D. Macará': 'assets/clubs/macara.png',
    'Deportivo Cuenca': 'assets/clubs/deportivo-cuenca.png',
    'Club Deportivo Cuenca': 'assets/clubs/deportivo-cuenca.png',
    'Dep. Cuenca': 'assets/clubs/deportivo-cuenca.png',
    'Mushuc Runa': 'assets/clubs/mushuc-runa.png',
    'Mushuc Runa SC': 'assets/clubs/mushuc-runa.png',
    'Mushuc Runa S.C.': 'assets/clubs/mushuc-runa.png',
    'Mushuc Runa Sporting Club': 'assets/clubs/mushuc-runa.png',
    'Técnico Universitario': 'assets/clubs/tecnico-universitario.png',
    'CD Técnico Universitario': 'assets/clubs/tecnico-universitario.png',
    'Delfín SC': 'assets/clubs/delfin-sc.png',
    'Delfin SC': 'assets/clubs/delfin-sc.png',
    'Delfín S.C.': 'assets/clubs/delfin-sc.png',
    'Delfín Sporting Club': 'assets/clubs/delfin-sc.png',
    'Libertad FC': 'assets/clubs/libertad-fc.png',
    'Libertad F.C.': 'assets/clubs/libertad-fc.png',
    'Libertad Fútbol Club': 'assets/clubs/libertad-fc.png',
    'Imbabura SC': 'assets/clubs/imbabura-sc.png',
    'Imbabura S.C.': 'assets/clubs/imbabura-sc.png',
    'Imbabura Sporting Club': 'assets/clubs/imbabura-sc.png',
    'Cumbayá FC': 'assets/clubs/cumbaya-fc.png',
    'Cumbayá F.C.': 'assets/clubs/cumbaya-fc.png',
    'Cumbayá Fútbol Club': 'assets/clubs/cumbaya-fc.png',
    'Manta FC': 'assets/clubs/manta-fc.png',
    'Guayaquil City': 'assets/clubs/guayaquil-city.png',
    'Leones FC': 'assets/clubs/leones-fc.png'
}

def get_club_logo(club_name):
    if not club_name:
        return 'assets/ligapro-mini.svg'
    if club_name in CLUB_LOGOS:
        return CLUB_LOGOS[club_name]
    name_norm = club_name.lower().strip()
    for k, v in CLUB_LOGOS.items():
        if k.lower() in name_norm or name_norm in k.lower():
            return v
    return 'assets/ligapro-mini.svg'

def update_store():
    path = 'src/lib/store.js'
    with open(path, 'r', encoding='utf-8') as f:
        code = f.read()

    js_helper = '''export const CLUB_LOGOS = ''' + str(CLUB_LOGOS).replace("'", '"') + ''';

export function getClubLogo(clubName) {
  if (!clubName) return 'assets/ligapro-mini.svg';
  if (CLUB_LOGOS[clubName]) return CLUB_LOGOS[clubName];
  const nameNorm = clubName.toLowerCase().trim();
  for (const [key, path] of Object.entries(CLUB_LOGOS)) {
    if (nameNorm.includes(key.toLowerCase()) || key.toLowerCase().includes(nameNorm)) {
      return path;
    }
  }
  return 'assets/ligapro-mini.svg';
}
'''
    if 'export const CLUB_LOGOS' not in code:
        code = code.replace(
            "import { calcularMulta } from '../domain/multas/calculo.js';",
            "import { calcularMulta } from '../domain/multas/calculo.js';\n\n" + js_helper
        )

    # Replace circle emoji with real logos
    emojis = ['⚪', '🟡', '⚫', '🔵', '🔴', '🟢', '🟠']
    for em in emojis:
        code = code.replace(f"escudo: '{em}'", "escudo: 'assets/ligapro-mini.svg'")

    # Specific replacements for known teams in store.js
    for name, logo in CLUB_LOGOS.items():
        code = re.sub(
            rf"(nombre:\s*['\"]{re.escape(name)}['\"].*?escudo:\s*)['\"][^'\"]*['\"]",
            rf"\1'{logo}'",
            code,
            flags=re.DOTALL
        )

    with open(path, 'w', encoding='utf-8') as f:
        f.write(code)
    print("Updated src/lib/store.js")

def update_interactive():
    path = 'src/lib/interactive.js'
    with open(path, 'r', encoding='utf-8') as f:
        code = f.read()

    if 'getClubLogo' not in code:
        code = code.replace(
            "import { store } from './store.js';",
            "import { store, getClubLogo, CLUB_LOGOS } from './store.js';"
        )

    # In renderizarPartidosTablero: replace circle with getClubLogo
    old_local_circle = """<div class="w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center bg-indigo-50 dark:bg-slate-800 text-indigo-700 dark:text-indigo-400 font-black text-xs border border-slate-200 dark:border-slate-700 shrink-0">
            ${nombreLocal.substring(0, 3).toUpperCase()}
          </div>"""
    new_local_circle = """<img src="${getClubLogo(nombreLocal)}" alt="${nombreLocal}" class="w-10 h-10 sm:w-11 sm:h-11 object-contain shrink-0 drop-shadow-xs" onerror="this.src='assets/ligapro-mini.svg'" />"""

    old_vis_circle = """<div class="w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center bg-amber-50 dark:bg-slate-800 text-amber-700 dark:text-amber-400 font-black text-xs border border-slate-200 dark:border-slate-700 shrink-0">
            ${nombreVisitante.substring(0, 3).toUpperCase()}
          </div>"""
    new_vis_circle = """<img src="${getClubLogo(nombreVisitante)}" alt="${nombreVisitante}" class="w-10 h-10 sm:w-11 sm:h-11 object-contain shrink-0 drop-shadow-xs" onerror="this.src='assets/ligapro-mini.svg'" />"""

    code = code.replace(old_local_circle, new_local_circle)
    code = code.replace(old_vis_circle, new_vis_circle)

    with open(path, 'w', encoding='utf-8') as f:
        f.write(code)
    print("Updated src/lib/interactive.js")

def update_build_cleaner():
    path = 'scripts/build_cleaner_v2.py'
    with open(path, 'r', encoding='utf-8') as f:
        code = f.read()

    # 1. Update partidos_realtime_html inside build_cleaner_v2.py to show real logos in initial match cards
    code = re.sub(
        r'<div class="w-10 h-10[^>]*>LDU</div>',
        r'<img src="assets/clubs/ldu-quito.png" alt="LDU Quito" class="w-10 h-10 sm:w-11 sm:h-11 object-contain shrink-0 drop-shadow-xs" />',
        code
    )
    code = re.sub(
        r'<div class="w-10 h-10[^>]*>BSC</div>',
        r'<img src="assets/clubs/barcelona-sc.png" alt="Barcelona SC" class="w-10 h-10 sm:w-11 sm:h-11 object-contain shrink-0 drop-shadow-xs" />',
        code
    )
    code = re.sub(
        r'<div class="w-10 h-10[^>]*>IDV</div>',
        r'<img src="assets/clubs/independiente-del-valle.png" alt="Ind. del Valle" class="w-10 h-10 sm:w-11 sm:h-11 object-contain shrink-0 drop-shadow-xs" />',
        code
    )
    code = re.sub(
        r'<div class="w-10 h-10[^>]*>EME</div>',
        r'<img src="assets/clubs/cs-emelec.png" alt="CS Emelec" class="w-10 h-10 sm:w-11 sm:h-11 object-contain shrink-0 drop-shadow-xs" />',
        code
    )
    code = re.sub(
        r'<div class="w-10 h-10[^>]*>AUC</div>',
        r'<img src="assets/clubs/sd-aucas.png" alt="SD Aucas" class="w-10 h-10 sm:w-11 sm:h-11 object-contain shrink-0 drop-shadow-xs" />',
        code
    )
    code = re.sub(
        r'<div class="w-10 h-10[^>]*>NAC</div>',
        r'<img src="assets/clubs/el-nacional.png" alt="El Nacional" class="w-10 h-10 sm:w-11 sm:h-11 object-contain shrink-0 drop-shadow-xs" />',
        code
    )

    # 2. Add transformation in clean_and_transform_screen to replace circle initials in tabla de posiciones with club logo
    pos_replacement_logic = '''
    # Reemplazar círculos con iniciales por escudos oficiales en Tabla de Posiciones y Uniformes
    def replace_posiciones_crests(match):
        club_name = match.group(2).strip()
        logo_path = 'assets/ligapro-mini.svg'
        from apply_logos import get_club_logo
        logo_path = get_club_logo(club_name)
        return f'<img src="{logo_path}" alt="{club_name}" class="w-8 h-8 object-contain shrink-0 drop-shadow-xs" />\\n<div class="flex flex-col min-w-0">\\n<span {match.group(1)}>{match.group(2)}</span>'

    body_content = re.sub(
        r'<div class="w-8 h-8 rounded-full bg-surface-container[^>]*>\\s*[A-Za-z0-9\\.\\s]+?\\s*</div>\\s*<div class="flex flex-col min-w-0">\\s*<span\\b([^>]*)>(.*?)</span>',
        replace_posiciones_crests,
        body_content
    )

    # En Uniformes 48h: reemplazar círculos de LDU y BSC por escudos oficiales
    body_content = re.sub(
        r'<div class="w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center font-bold text-xs text-primary shadow-inner[^>]*>\\s*LDU\\s*</div>',
        r'<img src="assets/clubs/ldu-quito.png" alt="LDU Quito" class="w-10 h-10 object-contain shrink-0 drop-shadow-xs" />',
        body_content
    )
    body_content = re.sub(
        r'<div class="w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center font-bold text-xs text-primary shadow-inner[^>]*>\\s*BSC\\s*</div>',
        r'<img src="assets/clubs/barcelona-sc.png" alt="Barcelona SC" class="w-10 h-10 object-contain shrink-0 drop-shadow-xs" />',
        body_content
    )

    # En Portal Clubes: usar escudo oficial de LDU Quito
    body_content = re.sub(
        r'<img class="w-full h-full object-contain" [^>]*src="https://lh3.googleusercontent.com/[^"]*"',
        r'<img class="w-full h-full object-contain drop-shadow-sm" src="assets/clubs/ldu-quito.png"',
        body_content
    )
'''
    if 'replace_posiciones_crests' not in code:
        code = code.replace(
            "    # 3. Reemplazar cualquier href=\"#\" remanente por javascript:void(0)",
            pos_replacement_logic + "\n    # 3. Reemplazar cualquier href=\"#\" remanente por javascript:void(0)"
        )

    with open(path, 'w', encoding='utf-8') as f:
        f.write(code)
    print("Updated scripts/build_cleaner_v2.py")

if __name__ == '__main__':
    update_store()
    update_interactive()
    update_build_cleaner()
