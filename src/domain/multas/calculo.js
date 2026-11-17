/**
 * SIGEC-LP — MOD-MUL: Cálculo de Multas e Infracciones Reglamentarias
 * Conforme a Disposiciones Generales 5ª, 10ª y Artículos 33, 35, 51, 53, 54, 91, 95-97
 */

export const CONFIG_ECONOMICA = {
  SBU_USD_2025: 460.00, // Salario Básico Unificado Ecuador
  TOPE_ARTS_33_35_USD: 1500.00,
  REINCIDENCIA_DISP5_SERIE_A_USD: 2000.00,
  REINCIDENCIA_DISP5_SERIE_B_USD: 1000.00
};

/**
 * Calcula el monto final en USD de una infracción
 * @param {Object} infraccionCatalogo
 * @param {number} cantidad
 * @param {boolean} esReincidencia
 * @param {string} serie 'A' o 'B'
 * @returns {{
 *   montoUsd: number,
 *   unidad: string,
 *   esReincidencia: boolean,
 *   sancionDeportiva?: string,
 *   desglose: string
 * }}
 */
export function calcularMulta(infraccionCatalogo, cantidad = 1, esReincidencia = false, serie = 'A') {
  let montoBase = 0;

  if (infraccionCatalogo.unidad === 'USD') {
    montoBase = infraccionCatalogo.monto;
  } else if (infraccionCatalogo.unidad === 'SBU') {
    montoBase = infraccionCatalogo.monto * CONFIG_ECONOMICA.SBU_USD_2025;
  }

  let total = infraccionCatalogo.modo === 'por_unidad'
    ? montoBase * cantidad
    : montoBase;

  let sancionDeportiva = null;

  // Aplicación de reincidencia según Disposición 5ª
  if (esReincidencia && infraccionCatalogo.aplica_reincidencia_disp5) {
    const recargoReincidencia = serie === 'A'
      ? CONFIG_ECONOMICA.REINCIDENCIA_DISP5_SERIE_A_USD
      : CONFIG_ECONOMICA.REINCIDENCIA_DISP5_SERIE_B_USD;
    total += recargoReincidencia;
    sancionDeportiva = 'Disposición 5ª: Prohibición de jugar en su estadio por 1 fecha.';
  }

  // Respetar topes máximos por artículo si existen
  if (infraccionCatalogo.tope && total > infraccionCatalogo.tope) {
    total = infraccionCatalogo.tope;
  }

  return {
    montoUsd: total,
    unidad: 'USD',
    esReincidencia,
    sancionDeportiva,
    desglose: `${infraccionCatalogo.articulo} (${infraccionCatalogo.codigo}): US$ ${total.toFixed(2)}${sancionDeportiva ? ' + Sanción Deportiva' : ''}`
  };
}
