/**
 * SIGEC-LP — MOD-DIS: Control Disciplinario y Acumulación de Tarjetas
 * Conforme a Artículos 90 y 91 del Reglamento de Competiciones LigaPro
 */

export const REGLAS_DISCIPLINA = {
  AMARILLAS_SUSPENSION: 5,
  AMARILLAS_ALERTA_PREVENTIVA: 4,
  SUSPENSION_ROJA_PROVISIONAL_PARTIDOS: 1,
  MULTA_AMARILLA_SERIE_A_USD: 20,
  MULTA_EXPULSION_SERIE_A_USD: 100,
  MULTA_AMARILLA_SERIE_B_USD: 10,
  MULTA_EXPULSION_SERIE_B_USD: 50
};

/**
 * Evalúa el estado de acumulación de amarillas de un jugador tras un partido
 * @param {number} totalAmarillas
 * @param {string} serie 'A' o 'B'
 * @returns {{
 *   suspendido: boolean,
 *   partidosSuspension: number,
 *   alertaPreventiva: boolean,
 *   mensaje: string,
 *   multaUsd: number
 * }}
 */
export function evaluarAcumulacionAmarillas(totalAmarillas, serie = 'A') {
  const multaBase = serie === 'A'
    ? REGLAS_DISCIPLINA.MULTA_AMARILLA_SERIE_A_USD
    : REGLAS_DISCIPLINA.MULTA_AMARILLA_SERIE_B_USD;

  if (totalAmarillas >= REGLAS_DISCIPLINA.AMARILLAS_SUSPENSION) {
    return {
      suspendido: true,
      partidosSuspension: 1,
      alertaPreventiva: false,
      mensaje: `Art. 91: El jugador ha acumulado 5 tarjetas amarillas. Queda suspendido automáticamente para el próximo partido oficial.`,
      multaUsd: multaBase
    };
  }

  if (totalAmarillas === REGLAS_DISCIPLINA.AMARILLAS_ALERTA_PREVENTIVA) {
    return {
      suspendido: false,
      partidosSuspension: 0,
      alertaPreventiva: true,
      mensaje: `Alerta Art. 91: El jugador acumula 4 tarjetas amarillas. Una amonestación adicional provocará su suspensión automática.`,
      multaUsd: multaBase
    };
  }

  return {
    suspendido: false,
    partidosSuspension: 0,
    alertaPreventiva: false,
    mensaje: `Amonestación registrada. Acumula ${totalAmarillas} tarjetas amarillas en la fase.`,
    multaUsd: multaBase
  };
}

/**
 * Procesa una expulsión directa o por doble amarilla
 * @param {'roja_directa' | 'segunda_amarilla'} tipo
 * @param {string} serie
 */
export function procesarExpulsion(tipo, serie = 'A') {
  const multa = serie === 'A'
    ? REGLAS_DISCIPLINA.MULTA_EXPULSION_SERIE_A_USD
    : REGLAS_DISCIPLINA.MULTA_EXPULSION_SERIE_B_USD;

  return {
    suspendido: true,
    partidosSuspensionProvisional: REGLAS_DISCIPLINA.SUSPENSION_ROJA_PROVISIONAL_PARTIDOS,
    multaUsd: multa,
    tipo,
    mensaje: `Art. 90/91: Expulsión registrada. Suspensión provisional de 1 fecha sujeta a sanción final del Comité Disciplinario.`
  };
}
