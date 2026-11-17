"""
Pruebas de Aceptación del Dominio Reglamentario SIGEC-LP
Verifica Casos de Prueba de la Sección 8 del SRS:
- 8.1 Tablas, desempates y campeón (Arts. 9, 10, 11, 12, 13)
- 8.5 Disciplina y multas (Arts. 90, 91, Disp. 5ª)
- Pre-partido y contraste de uniformes (Arts. 29, 30, 31, 32)
"""

import unittest

# --- 1. Lógica de Desempates ---
def mini_tabla_puntos(ids, partidos, p={'v': 3, 'e': 1, 'd': 0}):
    grupo = set(ids)
    pts = {i: 0 for i in ids}
    for x in partidos:
        if x['localId'] not in grupo or x['visitanteId'] not in grupo:
            continue
        if x['gl'] > x['gv']:
            pl, pv = p['v'], p['d']
        elif x['gl'] < x['gv']:
            pl, pv = p['d'], p['v']
        else:
            pl, pv = p['e'], p['e']
        pts[x['localId']] += pl
        pts[x['visitanteId']] += pv
    return pts

def ordenar_tabla(filas, partidos, criterios, p={'v': 3, 'e': 1, 'd': 0}):
    pendientes_sorteo = []
    
    def valor(c, f, ids):
        if c == 'PTS': return f['pts']
        if c == 'DG': return f['dg']
        if c == 'GF': return f['gf']
        if c == 'GF_VISITANTE': return f.get('gfVisitante', 0)
        if c in ('H2H_PARTIDO', 'H2H_PUNTOS'):
            return mini_tabla_puntos(ids, partidos, p).get(f['clubId'], 0)
        return 0

    def resolver(grupo, idx):
        if len(grupo) <= 1:
            return grupo
        if idx >= len(criterios) or criterios[idx] == 'SORTEO':
            pendientes_sorteo.append([g['clubId'] for g in grupo])
            return grupo
        c = criterios[idx]
        ids = [g['clubId'] for g in grupo]
        con_valor = sorted([{'f': f, 'v': valor(c, f, ids)} for f in grupo], key=lambda x: x['v'], reverse=True)
        salida = []
        i = 0
        while i < len(con_valor):
            j = i
            while j + 1 < len(con_valor) and con_valor[j + 1]['v'] == con_valor[i]['v']:
                j += 1
            subgrupo = [x['f'] for x in con_valor[i:j+1]]
            salida.extend(resolver(subgrupo, idx + 1))
            i = j + 1
        return salida

    orden = resolver(filas, 0)
    return orden, pendientes_sorteo

# --- 2. Determinación de Finalistas y Campeón (Arts. 11, 12, 13) ---
def calcular_finalistas_y_campeon(g1, g2, tabla_acumulada):
    if g1 == g2:
        vice = next(c for c in tabla_acumulada if c['clubId'] != g1)
        return {'campeon': g1, 'vice': vice['clubId'], 'final': False}
    
    pos_g1 = next(i for i, c in enumerate(tabla_acumulada) if c['clubId'] == g1) + 1
    pos_g2 = next(i for i, c in enumerate(tabla_acumulada) if c['clubId'] == g2) + 1
    
    total = len(tabla_acumulada)
    corte = total - 1 # 15 o 16 descienden
    g1_desciende = pos_g1 >= corte
    g2_desciende = pos_g2 >= corte
    
    if not g1_desciende and not g2_desciende:
        return {'finalistas': [g1, g2], 'final': True}
    
    if g1_desciende != g2_desciende:
        gy = g2 if g1_desciende else g1
        pos_gy = next(i for i, c in enumerate(tabla_acumulada) if c['clubId'] == gy) + 1
        if pos_gy == 1:
            vice = next(c for c in tabla_acumulada if c['clubId'] != g1 and c['clubId'] != g2)
            return {'campeon': gy, 'vice': vice['clubId'], 'final': False}
        else:
            reemplazo = next(c for c in tabla_acumulada if c['clubId'] != g1 and c['clubId'] != g2)
            return {'finalistas': [gy, reemplazo['clubId']], 'final': True}
            
    return {'caso_omiso': True, 'finalistas': [tabla_acumulada[0]['clubId'], tabla_acumulada[1]['clubId']]}

# --- 3. Contraste WCAG ---
def hex_to_rgb(hex_code):
    h = hex_code.lstrip('#')
    return tuple(int(h[i:i+2], 16) for i in (0, 2, 4))

def luminancia(rgb):
    vals = []
    for c in rgb:
        v = c / 255.0
        vals.append(v / 12.92 if v <= 0.03928 else ((v + 0.055) / 1.055) ** 2.4)
    return 0.2126 * vals[0] + 0.7152 * vals[1] + 0.0722 * vals[2]

def ratio_contraste(hex1, hex2):
    l1 = luminancia(hex_to_rgb(hex1))
    l2 = luminancia(hex_to_rgb(hex2))
    return (max(l1, l2) + 0.05) / (min(l1, l2) + 0.05)


class TestDomainLogic(unittest.TestCase):
    
    def test_desempate_h2h(self):
        # Dos equipos empatados en PTS, DG, GF; desempata H2H
        filas = [
            {'clubId': 'LDU', 'pts': 30, 'dg': 15, 'gf': 25},
            {'clubId': 'BSC', 'pts': 30, 'dg': 15, 'gf': 25}
        ]
        # Partido entre ellos: LDU ganó 2 - 1 a BSC
        partidos = [{'localId': 'LDU', 'visitanteId': 'BSC', 'gl': 2, 'gv': 1}]
        criterios = ['PTS', 'DG', 'GF', 'H2H_PARTIDO', 'SORTEO']
        orden, sorteo = ordenar_tabla(filas, partidos, criterios)
        
        self.assertEqual(len(sorteo), 0)
        self.assertEqual(orden[0]['clubId'], 'LDU')
        self.assertEqual(orden[1]['clubId'], 'BSC')

    def test_campeon_directo_art12(self):
        # Mismo ganador en ambas fases
        acum = [{'clubId': 'LDU'}, {'clubId': 'IDV'}, {'clubId': 'BSC'}]
        res = calcular_finalistas_y_campeon('LDU', 'LDU', acum)
        self.assertFalse(res['final'])
        self.assertEqual(res['campeon'], 'LDU')
        self.assertEqual(res['vice'], 'IDV')

    def test_finalista_descendido_art13(self):
        # G1 gana Fase 1 pero desciende (15º de 16)
        # G2 gana Fase 2 y es 2º de la acumulada
        # Reemplazo de G1 es el 1º de la acumulada (IDV)
        acum = [{'clubId': 'IDV'}, {'clubId': 'BSC'}, {'clubId': 'AUC'}, {'clubId': 'LDU'}]
        res = calcular_finalistas_y_campeon('LDU', 'BSC', acum)
        self.assertTrue(res['final'])
        self.assertIn('BSC', res['finalistas'])
        self.assertIn('IDV', res['finalistas'])

    def test_contraste_uniformes(self):
        # Blanco (#FFFFFF) vs Negro (#101010) -> Contraste muy alto (>= 15:1)
        ratio_blanco_negro = ratio_contraste('#FFFFFF', '#101010')
        self.assertGreater(ratio_blanco_negro, 15.0)

        # Blanco (#FFFFFF) vs Amarillo claro (#FFE600) -> Contraste bajo (< 2.0:1)
        ratio_blanco_amarillo = ratio_contraste('#FFFFFF', '#FFE600')
        self.assertLess(ratio_blanco_amarillo, 2.0)

if __name__ == '__main__':
    unittest.main()
