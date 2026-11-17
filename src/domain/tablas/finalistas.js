/**
 * SIGEC-LP — Regla de Negocio RN-TAB-01: Determinación de Finalistas y Campeón
 * Cumplimiento de Artículos 11, 12 y 13 del Reglamento de Competiciones LigaPro
 */

/**
 * @typedef {Object} ClubPosicion
 * @property {string} clubId
 * @property {string} nombre
 * @property {number} posicion
 */

/**
 * Determina los finalistas o campeón directo según el Reglamento LigaPro
 * @param {string} g1 Club ganador de Fase Uno
 * @param {string} g2 Club ganador de Fase Dos
 * @param {Array<{clubId: string, nombre?: string, posicion?: number}>} tablaAcumulada
 * @returns {{
 *   campeonDirecto: string | null,
 *   subcampeonDirecto: string | null,
 *   finalistas: string[] | null,
 *   motivo: string,
 *   seJuegaFinal: boolean,
 *   casoOmiso: boolean
 * }}
 */
export function calcularFinalistasYCampeon(g1, g2, tablaAcumulada) {
  if (!g1 || !g2 || !tablaAcumulada || tablaAcumulada.length < 2) {
    return {
      campeonDirecto: null,
      subcampeonDirecto: null,
      finalistas: null,
      motivo: 'Datos de fases o tabla acumulada incompletos',
      seJuegaFinal: false,
      casoOmiso: false
    };
  }

  // 1. Si G1 == G2 (Art. 12): Campeón directo; Vicecampeón es el mejor de ACUM distinto de G1
  if (g1 === g2) {
    const vice = tablaAcumulada.find((c) => c.clubId !== g1);
    return {
      campeonDirecto: g1,
      subcampeonDirecto: vice ? vice.clubId : null,
      finalistas: null,
      motivo: 'Art. 12: El mismo club ganó la Fase Uno y la Fase Dos. Se proclama Campeón Directo sin disputa de final.',
      seJuegaFinal: false,
      casoOmiso: false
    };
  }

  // Determinar posiciones en la Tabla Acumulada
  const totalEquipos = tablaAcumulada.length;
  const posG1 = tablaAcumulada.findIndex((c) => c.clubId === g1) + 1;
  const posG2 = tablaAcumulada.findIndex((c) => c.clubId === g2) + 1;

  // 2. Marcar como inhabilitado a todo ganador en puestos de descenso (posiciones 15 o 16 en torneo de 16)
  const descensoCorte = Math.max(1, totalEquipos - 1); // p. ej. 15 y 16
  const g1Inhabilitado = posG1 >= descensoCorte;
  const g2Inhabilitado = posG2 >= descensoCorte;

  // 3. Si ningún ganador está inhabilitado: Disputan la final (Art. 11)
  if (!g1Inhabilitado && !g2Inhabilitado) {
    return {
      campeonDirecto: null,
      subcampeonDirecto: null,
      finalistas: [g1, g2],
      motivo: 'Art. 11: Finalistas oficiales clasificados. La localía del partido de vuelta corresponde al mejor ubicado en la Tabla Acumulada.',
      seJuegaFinal: true,
      casoOmiso: false
    };
  }

  // 4. Si exactamente un ganador está inhabilitado por descenso (Art. 13)
  if (g1Inhabilitado !== g2Inhabilitado) {
    const gx = g1Inhabilitado ? g1 : g2; // inhabilitado
    const gy = g1Inhabilitado ? g2 : g1; // habilitado
    const posGy = tablaAcumulada.findIndex((c) => c.clubId === gy) + 1;

    // 4.a) Si Gy es 1º de ACUM: Se proclama Campeón Directo (Art. 13, 2º inciso)
    if (posGy === 1) {
      const vice = tablaAcumulada.find((c) => c.clubId !== gx && c.clubId !== gy);
      return {
        campeonDirecto: gy,
        subcampeonDirecto: vice ? vice.clubId : null,
        finalistas: null,
        motivo: `Art. 13 (2º inciso): ${gx} descendió. Dado que el otro ganador (${gy}) ocupó el 1.º lugar de la Tabla Acumulada, es proclamado Campeón Directo.`,
        seJuegaFinal: false,
        casoOmiso: false
      };
    }

    // 4.b) Si no: El reemplazo es el mejor ubicado de ACUM que no sea Gx ni Gy
    const reemplazo = tablaAcumulada.find((c) => c.clubId !== gx && c.clubId !== gy);
    return {
      campeonDirecto: null,
      subcampeonDirecto: null,
      finalistas: [gy, reemplazo.clubId],
      motivo: `Art. 13: ${gx} inhabilitado por descenso. Clasifica a la final en su lugar el siguiente mejor ubicado de la Tabla Acumulada (${reemplazo?.nombre || reemplazo.clubId}).`,
      seJuegaFinal: true,
      casoOmiso: false
    };
  }

  // 5. Si ambos ganadores están inhabilitados (Caso no previsto / Disp. 1ª)
  return {
    campeonDirecto: null,
    subcampeonDirecto: null,
    finalistas: [tablaAcumulada[0].clubId, tablaAcumulada[1].clubId],
    motivo: 'Disposición General 1ª: Ambos ganadores de fase descienden. Caso omiso resuelto preliminarmente asignando la final a los 2 primeros de la Tabla Acumulada.',
    seJuegaFinal: true,
    casoOmiso: true
  };
}
