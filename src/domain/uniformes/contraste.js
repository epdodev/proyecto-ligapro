/**
 * SIGEC-LP — Asistente de Designación de Uniformes 48h
 * Cálculo de contraste WCAG y reglas de indumentaria (Artículos 29, 30, 31, 32)
 */

/**
 * Convierte un color HEX (#RRGGBB) a RGB
 */
export function hexToRgb(hex) {
  const cleanHex = hex.replace('#', '');
  const bigint = parseInt(cleanHex, 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255
  };
}

/**
 * Calcula la luminancia relativa según WCAG 2.1
 */
export function calcularLuminancia({ r, g, b }) {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const val = c / 255;
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calcula el ratio de contraste WCAG entre dos colores HEX
 * Retorna un valor entre 1 y 21
 */
export function calcularRatioContraste(hex1, hex2) {
  const lum1 = calcularLuminancia(hexToRgb(hex1));
  const lum2 = calcularLuminancia(hexToRgb(hex2));
  const masClaro = Math.max(lum1, lum2);
  const masOscuro = Math.min(lum1, lum2);
  return (masClaro + 0.05) / (masOscuro + 0.05);
}

/**
 * Evalúa el contraste completo entre dos kits (Camiseta, Pantaloneta, Medias)
 * @param {{ camiseta: string, pantaloneta: string, medias: string }} kitLocal
 * @param {{ camiseta: string, pantaloneta: string, medias: string }} kitVisitante
 * @returns {{
 *   aprobado: boolean,
 *   ratioCamiseta: number,
 *   ratioPantaloneta: number,
 *   ratioMedias: number,
 *   conflictos: string[],
 *   detalles: string
 * }}
 */
export function evaluarContrasteKits(kitLocal, kitVisitante) {
  const ratioCamiseta = parseFloat(calcularRatioContraste(kitLocal.camiseta, kitVisitante.camiseta).toFixed(2));
  const ratioPantaloneta = parseFloat(calcularRatioContraste(kitLocal.pantaloneta, kitVisitante.pantaloneta).toFixed(2));
  const ratioMedias = parseFloat(calcularRatioContraste(kitLocal.medias, kitVisitante.medias).toFixed(2));

  const conflictos = [];
  // Umbral reglamentario: ratio mínimo deseable 3.0:1 para televisión y visión en campo
  if (ratioCamiseta < 3.0) {
    conflictos.push(`Conflicto de camisetas: Ratio ${ratioCamiseta}:1 insuficiente (mínimo 3.0:1)`);
  }
  if (ratioPantaloneta < 2.5) {
    conflictos.push(`Conflicto de pantalonetas: Ratio ${ratioPantaloneta}:1 insuficiente`);
  }
  if (ratioMedias < 2.5) {
    conflictos.push(`Conflicto de medias: Ratio ${ratioMedias}:1 insuficiente`);
  }

  const aprobado = conflictos.length === 0;

  return {
    aprobado,
    ratioCamiseta,
    ratioPantaloneta,
    ratioMedias,
    conflictos,
    detalles: aprobado
      ? 'Contraste cromático óptimo y aprobado para transmisión HD y visibilidad en campo (Art. 31/32)'
      : `Rechazado: Se requiere kit alterno para el equipo visitante. ${conflictos.join(', ')}`
  };
}
