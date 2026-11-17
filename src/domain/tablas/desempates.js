/**
 * SIGEC-LP — Motor de Tablas y Desempates Reglamentarios
 * Conforme a Artículos 9, 10, 16, 17 del Reglamento de Competiciones LigaPro
 */

/**
 * Puntos obtenidos solo en los partidos disputados entre los clubes del grupo (mini-tabla)
 * @param {string[]} ids
 * @param {Array<{localId: string, visitanteId: string, gl: number, gv: number}>} partidos
 * @param {{v: number, e: number, d: number}} p
 * @returns {Map<string, number>}
 */
export function miniTablaPuntos(ids, partidos, p = { v: 3, e: 1, d: 0 }) {
  const grupo = new Set(ids);
  const pts = new Map(ids.map((id) => [id, 0]));
  for (const x of partidos) {
    if (!grupo.has(x.localId) || !grupo.has(x.visitanteId)) continue;
    const [pl, pv] = x.gl > x.gv ? [p.v, p.d] : x.gl < x.gv ? [p.d, p.v] : [p.e, p.e];
    pts.set(x.localId, (pts.get(x.localId) || 0) + pl);
    pts.set(x.visitanteId, (pts.get(x.visitanteId) || 0) + pv);
  }
  return pts;
}

/**
 * Calcula el valor comparativo según el criterio reglamentario
 */
export function valorCriterio(criterio, fila, ids, partidos, p) {
  switch (criterio) {
    case 'PTS':
      return fila.pts;
    case 'DG':
      return fila.dg;
    case 'GF':
      return fila.gf;
    case 'GF_VISITANTE':
      return fila.gfVisitante || 0;
    case 'H2H_PARTIDO':
    case 'H2H_PUNTOS':
      return miniTablaPuntos(ids, partidos, p).get(fila.clubId) ?? 0;
    default:
      return 0;
  }
}

/**
 * Ordena la tabla aplicando la cascada de criterios de desempate
 * Si se agotan los criterios y persiste el empate, registra para Sorteo Público (sin decidir al azar)
 *
 * @param {Array<{clubId: string, pts: number, dg: number, gf: number, gfVisitante?: number}>} filas
 * @param {Array<{localId: string, visitanteId: string, gl: number, gv: number}>} partidos
 * @param {string[]} criterios Por ejemplo: ['PTS', 'DG', 'GF', 'H2H_PARTIDO', 'SORTEO']
 * @param {{v: number, e: number, d: number}} p
 * @returns {{ orden: any[], pendientesSorteo: string[][] }}
 */
export function ordenarTabla(filas, partidos = [], criterios = ['PTS', 'DG', 'GF', 'H2H_PARTIDO', 'SORTEO'], p = { v: 3, e: 1, d: 0 }) {
  const pendientesSorteo = [];

  const resolver = (grupo, idx) => {
    if (grupo.length <= 1) return grupo;
    const c = criterios[idx];

    // Si no hay más criterios o el criterio es SORTEO, se suspende la decisión y se notifica para sorteo público
    if (!c || c === 'SORTEO') {
      pendientesSorteo.push(grupo.map((g) => g.clubId));
      return grupo;
    }

    const ids = grupo.map((g) => g.clubId);
    const conValor = grupo
      .map((f) => ({ f, v: valorCriterio(c, f, ids, partidos, p) }))
      .sort((a, b) => b.v - a.v);

    const salida = [];
    for (let i = 0; i < conValor.length; ) {
      let j = i;
      while (j + 1 < conValor.length && conValor[j + 1].v === conValor[i].v) {
        j++;
      }
      salida.push(...resolver(conValor.slice(i, j + 1).map((x) => x.f), idx + 1));
      i = j + 1;
    }
    return salida;
  };

  return { orden: resolver(filas, 0), pendientesSorteo };
}
