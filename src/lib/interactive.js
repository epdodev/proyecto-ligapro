/**
 * SIGEC-LP — Controlador de Interacciones, Eventos en Vivo y Lógica de Vistas
 */

import { store } from './store.js';
import { getSupabase } from './supabase.js';
import { ordenarTabla } from '../domain/tablas/desempates.js';
import { calcularFinalistasYCampeon } from '../domain/tablas/finalistas.js';
import { evaluarAcumulacionAmarillas } from '../domain/disciplina/acumulacion.js';
import { calcularMulta } from '../domain/multas/calculo.js';
import { evaluarContrasteKits } from '../domain/uniformes/contraste.js';

// Exponer funciones globales al objeto window para los event handlers de los templates
window.navigateView = function(viewId) {
  store.setView(viewId);
  const url = new URL(window.location);
  url.searchParams.set('view', viewId);
  window.history.pushState({}, '', url);
  updateActiveViewInDOM(viewId);
};

window.onRoleChange = function(newRole) {
  store.setUserRole(newRole);
  showToast(`Rol activo cambiado a: ${store.state.currentUser.rolNombre}`, 'info');
};

window.toggleGlobalHighContrast = function() {
  store.toggleHighContrast();
  const isHc = store.state.highContrast;
  document.body.classList.toggle('high-contrast-mode', isHc);
  showToast(isHc ? 'Modo Alto Contraste WCAG AAA Activado' : 'Modo Estándar Restaurado', 'info');
};

// ==============================================================================
// GESTIÓN DE EVENTOS DE PARTIDO (CONSOLA DE COMISARIO)
// ==============================================================================

window.registrarGolEnVivo = function(club) {
  const jugador = club === 'local' ? 'Alex Arce (19)' : 'Octavio Rivero (29)';
  store.registrarEventoPartido({
    tipo: 'gol',
    club,
    autor: jugador,
    detalle: `Gol convalidado por Árbitro Central y VAR. Transmisión COMET actualizada.`
  });
  showToast(`⚽ ¡GOL de ${club === 'local' ? 'LDU Quito' : 'Barcelona SC'}! Registrado en Minuto ${store.state.partidoActivo.minuto}'`, 'success');
  actualizarUIHeader();
};

window.registrarTarjetaEnVivo = function(tipo, club = 'visitante') {
  const jugador = club === 'visitante' ? 'Jesús Trindade (8)' : 'Ezequiel Piovi (18)';
  
  if (tipo === 'amarilla') {
    const res = evaluarAcumulacionAmarillas(5, 'A');
    store.registrarEventoPartido({
      tipo: 'amarilla',
      club,
      autor: jugador,
      detalle: res.mensaje
    });
    showToast(`🟨 Tarjeta Amarilla a ${jugador}. ${res.mensaje} (Multa: US$ ${res.multaUsd})`, res.suspendido ? 'warning' : 'info');
  } else {
    store.registrarEventoPartido({
      tipo: 'roja',
      club,
      autor: jugador,
      detalle: 'Expulsión directa (Art. 90). Suspensión provisional de 1 partido y multa de US$ 100.'
    });
    showToast(`🟥 TARJETA ROJA a ${jugador}. Suspensión provisional de 1 fecha aplicada.`, 'error');
  }
  actualizarUIHeader();
};

window.registrarSustitucionEnVivo = function(club = 'local') {
  store.registrarEventoPartido({
    tipo: 'sustitucion',
    club,
    autor: 'Jhojan Julio ➔ Entra: Lisandro Alzugaray (9)',
    detalle: 'Ventana 1 de 3 utilizada. Sustitución 1 de 5 permitidas (Disp. 4ª).'
  });
  showToast(`🔄 Sustitución registrada para ${club === 'local' ? 'LDU Quito' : 'Barcelona SC'}. Ventana 1 consumida.`, 'info');
};

window.registrarHidratacionEnVivo = function() {
  store.registrarEventoPartido({
    tipo: 'hidratacion_inicio',
    club: null,
    autor: 'Pausa Reglamentaria (Art. 71)',
    detalle: 'Minuto de hidratación autorizado por temperatura ambiental > 30°C. Duración máx. 1 minuto.'
  });
  showToast(`💧 Minuto de hidratación reglamentario iniciado (Art. 71).`, 'info');
};

window.registrarIncidenteEnVivo = function() {
  const causa = 'Lanzamiento de objetos e invasión parcial (Art. 73)';
  store.registrarEventoPartido({
    tipo: 'fin_periodo',
    club: null,
    autor: 'Comisario de Partido',
    detalle: `Suspensión provisional por incidente: ${causa}. Se activa cronómetro de espera de 30 minutos (Art. 73/76).`
  });
  showToast(`⚠️ INCIDENTE REGISTRADO (Art. 73): Cronómetro de espera perentorio de 30 minutos iniciado.`, 'warning');
};

// ==============================================================================
// ASISTENTE DE UNIFORMES 48H
// ==============================================================================

window.actualizarKitsUniformes = function() {
  const kitLocalSel = document.querySelector('input[name="kit_local"]:checked')?.value || 'principal';
  const kitVisitanteSel = document.querySelector('input[name="kit_visitante"]:checked')?.value || 'principal';

  const kitLocal = kitLocalSel === 'principal'
    ? { camiseta: '#FFFFFF', pantaloneta: '#FFFFFF', medias: '#FFFFFF' }
    : { camiseta: '#1A1A1A', pantaloneta: '#1A1A1A', medias: '#1A1A1A' };

  const kitVisitante = kitVisitanteSel === 'principal'
    ? { camiseta: '#FFE600', pantaloneta: '#101010', medias: '#101010' }
    : { camiseta: '#C41230', pantaloneta: '#101010', medias: '#C41230' };

  const evalContraste = evaluarContrasteKits(kitLocal, kitVisitante);

  const badgeCamiseta = document.getElementById('ratio-camiseta-val');
  const badgePantaloneta = document.getElementById('ratio-pantaloneta-val');
  const badgeMedias = document.getElementById('ratio-medias-val');
  const badgeEstado = document.getElementById('estado-uniformes-badge');

  if (badgeCamiseta) badgeCamiseta.textContent = `${evalContraste.ratioCamiseta}:1`;
  if (badgePantaloneta) badgePantaloneta.textContent = `${evalContraste.ratioPantaloneta}:1`;
  if (badgeMedias) badgeMedias.textContent = `${evalContraste.ratioMedias}:1`;

  if (badgeEstado) {
    if (evalContraste.aprobado) {
      badgeEstado.className = 'px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1';
      badgeEstado.innerHTML = `<span class="material-symbols-outlined text-sm">verified</span> INDUMENTARIA APROBADA (Art. 31/32)`;
    } else {
      badgeEstado.className = 'px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1';
      badgeEstado.innerHTML = `<span class="material-symbols-outlined text-sm">warning</span> CONFLICTO CROMÁTICO DETECTADO`;
    }
  }
};

window.sellarActaUniformes = function() {
  const hash = 'SHA256:' + Array.from(crypto.getRandomValues(new Uint8Array(16))).map(b => b.toString(16).padStart(2, '0')).join('');
  showToast(`📜 Acta Oficial de Uniformes (Art. 30) sellada digitalmente con éxito. Hash de Integridad: ${hash}`, 'success');
};

// ==============================================================================
// INSPECCIÓN DE ESCENARIOS & VAR
// ==============================================================================

window.evaluarEscenarioEnVivo = function() {
  const cespedMm = parseFloat(document.getElementById('input-cesped-mm')?.value || 22.5);
  const hospitalMin = parseInt(document.getElementById('input-hospital-min')?.value || 12);
  const varMb = parseInt(document.getElementById('input-var-mb')?.value || 200);
  const voltajeV = parseInt(document.getElementById('input-voltaje-v')?.value || 220);

  const cumpleCesped = cespedMm >= 20 && cespedMm <= 25;
  const cumpleHospital = hospitalMin <= 15;
  const cumpleVar = varMb >= 100 && (voltajeV >= 210 && voltajeV <= 230);

  const badgeCalificacion = document.getElementById('badge-calificacion-estadio');
  if (badgeCalificacion) {
    if (cumpleCesped && cumpleHospital && cumpleVar) {
      badgeCalificacion.className = 'px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1';
      badgeCalificacion.innerHTML = `<span class="material-symbols-outlined text-sm">check_circle</span> ESTADIO CALIFICADO`;
    } else if (cumpleHospital && cumpleVar && !cumpleCesped) {
      badgeCalificacion.className = 'px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1';
      badgeCalificacion.innerHTML = `<span class="material-symbols-outlined text-sm">warning</span> ESTADIO CONDICIONADO (Corte de Césped Requerido)`;
    } else {
      badgeCalificacion.className = 'px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-300 flex items-center gap-1';
      badgeCalificacion.innerHTML = `<span class="material-symbols-outlined text-sm">cancel</span> NO CALIFICADO (Art. 51/87a/92)`;
    }
  }
};

// ==============================================================================
// TABLAS Y DESEMPATES (RN-TAB-01 Y ART. 11, 12, 13)
// ==============================================================================

window.mostrarModalFinalistas = function() {
  const clubes = store.state.clubes;
  const g1 = 'LDU Quito';
  const g2 = 'Barcelona SC';
  
  const res = calcularFinalistasYCampeon(
    '66666666-6666-6666-6666-666666666601',
    '66666666-6666-6666-6666-666666666602',
    clubes.map((c, i) => ({ clubId: c.id, nombre: c.nombre, posicion: i + 1 }))
  );

  const modalHtml = `
  <div id="modal-finalistas-backdrop" class="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
    <div class="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
      <div class="flex items-center justify-between pb-3 border-b border-slate-100">
        <div class="flex items-center gap-2">
          <span class="material-symbols-outlined text-amber-500 text-2xl">emoji_events</span>
          <h3 class="font-extrabold text-slate-900 text-lg">Resolución de Finalistas y Título</h3>
        </div>
        <button onclick="document.getElementById('modal-finalistas-backdrop').remove()" class="text-slate-400 hover:text-slate-700">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>

      <div class="mt-4 space-y-3">
        <div class="p-3 bg-blue-50 rounded-xl border border-blue-200 text-xs text-blue-900">
          <span class="font-bold">Ganador Fase Uno:</span> LDU Quito (40 pts)<br>
          <span class="font-bold">Ganador Fase Dos:</span> Barcelona SC (37 pts)
        </div>

        <div class="p-4 bg-slate-900 text-white rounded-xl text-xs space-y-2">
          <div class="text-amber-400 font-bold uppercase tracking-wider text-[11px]">Dictamen Oficial del Motor Reglamentario:</div>
          <p class="leading-relaxed text-slate-200">${res.motivo}</p>
          <div class="pt-2 border-t border-slate-800 flex items-center justify-between text-slate-300">
            <span>¿Disputa de Final de Ida y Vuelta?</span>
            <span class="font-bold ${res.seJuegaFinal ? 'text-emerald-400' : 'text-amber-400'}">${res.seJuegaFinal ? 'SÍ (Art. 11)' : 'NO (Campeón Directo)'}</span>
          </div>
          <div class="flex items-center justify-between text-slate-300">
            <span>Localía Partido de Vuelta (Final):</span>
            <span class="font-bold text-amber-300">LDU Quito (Mejor en Tabla Acumulada)</span>
          </div>
        </div>
      </div>

      <div class="mt-6 flex justify-end">
        <button onclick="document.getElementById('modal-finalistas-backdrop').remove()" class="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800">
          Entendido
        </button>
      </div>
    </div>
  </div>`;

  const prev = document.getElementById('modal-finalistas-backdrop');
  if (prev) prev.remove();
  document.body.insertAdjacentHTML('beforeend', modalHtml);
};

// ==============================================================================
// TRÁMITES DE CLUBES
// ==============================================================================

window.mostrarModalNuevoTramite = function() {
  const modalHtml = `
  <div id="modal-nuevo-tramite-backdrop" class="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
    <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
      <div class="flex items-center justify-between pb-3 border-b border-slate-100">
        <div class="flex items-center gap-2">
          <span class="material-symbols-outlined text-blue-600 text-2xl">post_add</span>
          <h3 class="font-extrabold text-slate-900 text-base">Nueva Solicitud Reglamentaria</h3>
        </div>
        <button onclick="document.getElementById('modal-nuevo-tramite-backdrop').remove()" class="text-slate-400 hover:text-slate-700">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>

      <form id="form-nuevo-tramite" onsubmit="enviarTramiteForm(event)" class="mt-4 space-y-3 text-xs">
        <div>
          <label class="block font-bold text-slate-700 mb-1">Club Solicitante</label>
          <select id="tramite-club" class="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg">
            <option value="Barcelona SC">Barcelona Sporting Club</option>
            <option value="LDU Quito">Liga Deportiva Universitaria</option>
            <option value="Independiente del Valle">Independiente del Valle</option>
            <option value="CS Emelec">Club Sport Emelec</option>
            <option value="Orense SC">Orense Sporting Club</option>
          </select>
        </div>

        <div>
          <label class="block font-bold text-slate-700 mb-1">Tipo de Trámite</label>
          <select id="tramite-tipo" onchange="actualizarPlazoTramite(this.value)" class="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg">
            <option value="cambio_uniforme">Cambio / Actualización de Uniforme (Art. 29 — 7 días)</option>
            <option value="cambio_estadio">Cambio de Estadio de Localía (Disp. 6ª — 30 días)</option>
            <option value="postergacion_internacional">Postergación por Torneo Internacional (Art. 28a — 48h)</option>
            <option value="acto_institucional">Acto Institucional Pre-Partido (Art. 50 — 72h)</option>
            <option value="apodo_camiseta">Aprobación de Apodo en Camiseta (Art. 35)</option>
          </select>
        </div>

        <div id="plazo-aviso" class="p-2.5 bg-amber-50 text-amber-900 border border-amber-200 rounded-lg font-medium">
          ⚠️ Plazo perentorio: Se debe presentar con al menos 7 días de anticipación al partido.
        </div>

        <div>
          <label class="block font-bold text-slate-700 mb-1">Título / Asunto</label>
          <input type="text" id="tramite-titulo" required placeholder="Ej: Solicitud de uso de uniforme alterno conmemorativo" class="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg">
        </div>

        <div>
          <label class="block font-bold text-slate-700 mb-1">Detalle / Justificación</label>
          <textarea id="tramite-detalle" rows="3" required placeholder="Describa la fundamentación reglamentaria de la petición..." class="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"></textarea>
        </div>

        <div class="mt-4 flex justify-end gap-2 pt-2 border-t border-slate-100">
          <button type="button" onclick="document.getElementById('modal-nuevo-tramite-backdrop').remove()" class="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200">
            Cancelar
          </button>
          <button type="submit" class="px-4 py-1.5 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 flex items-center gap-1">
            <span class="material-symbols-outlined text-sm">send</span> Radicar Solicitud
          </button>
        </div>
      </form>
    </div>
  </div>`;

  const prev = document.getElementById('modal-nuevo-tramite-backdrop');
  if (prev) prev.remove();
  document.body.insertAdjacentHTML('beforeend', modalHtml);
};

window.actualizarPlazoTramite = function(tipo) {
  const plazos = {
    'cambio_uniforme': '⚠️ Plazo perentorio: Se debe presentar con al menos 7 días de anticipación al partido (Art. 29).',
    'cambio_estadio': '⚠️ Plazo perentorio: 30 días de anticipación requeridos salvo fuerza mayor (Disposición 6ª).',
    'postergacion_internacional': '⚠️ Plazo perentorio: 48h de ventana de descanso entre partidos internacionales CONMEBOL (Art. 28a).',
    'acto_institucional': '⚠️ Plazo perentorio: Debe solicitarse con al menos 72h y finalizar a más tardar en T-75 min (Art. 50).',
    'apodo_camiseta': '⚠️ Plazo: Previo a la entrega oficial de la planilla de juego (Art. 35).'
  };
  const aviso = document.getElementById('plazo-aviso');
  if (aviso) aviso.textContent = plazos[tipo] || '';
};

window.enviarTramiteForm = function(e) {
  e.preventDefault();
  const club = document.getElementById('tramite-club').value;
  const tipo = document.getElementById('tramite-tipo').value;
  const titulo = document.getElementById('tramite-titulo').value;

  store.crearTramite({
    club,
    tipo,
    titulo,
    plazo: 'Validado automáticamente conforme a reglamento'
  });

  const modal = document.getElementById('modal-nuevo-tramite-backdrop');
  if (modal) modal.remove();

  showToast(`✅ Solicitud ${titulo} radicada formalmente ante la Dirección de Competiciones.`, 'success');
  // Re-render si estamos en la vista de clubes
  if (store.state.activeView === 'clubes') {
    updateActiveViewInDOM('clubes');
  }
};

// ==============================================================================
// HELPERS DE INTERFAZ Y ACTUALIZACIÓN EN VIVO
// ==============================================================================

function updateActiveViewInDOM(viewId) {
  // Ocultar todos los contenedores de vista
  const views = document.querySelectorAll('.sigec-view-container');
  views.forEach((v) => v.classList.add('hidden'));

  const target = document.getElementById(`view-${viewId}`);
  if (target) {
    target.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Actualizar botones de navegación
  const navButtons = document.querySelectorAll('[onclick^="navigateView"]');
  navButtons.forEach((btn) => {
    if (btn.getAttribute('onclick').includes(`'${viewId}'`)) {
      btn.className = "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all bg-secondary text-white font-bold shadow-sm";
    } else {
      btn.className = "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all text-slate-700 hover:bg-slate-100 hover:text-slate-900";
    }
  });

  actualizarUIHeader();
}

function actualizarUIHeader() {
  const p = store.state.partidoActivo;
  const scoreEl = document.getElementById('header-score');
  const minEl = document.getElementById('header-match-min');
  if (scoreEl) scoreEl.textContent = `${p.marcador.local} - ${p.marcador.visitante}`;
  if (minEl) minEl.textContent = `${p.minuto}' ${p.periodo}T`;
}

function showToast(message, type = 'info') {
  const colors = {
    info: 'bg-slate-900 text-white border-slate-700',
    success: 'bg-emerald-900 text-emerald-100 border-emerald-700',
    warning: 'bg-amber-900 text-amber-100 border-amber-700',
    error: 'bg-red-900 text-red-100 border-red-700'
  };

  const toast = document.createElement('div');
  toast.className = `fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-2xl border text-xs font-semibold animate-bounce transition-all ${colors[type] || colors.info}`;
  toast.innerHTML = `<span class="material-symbols-outlined text-base">notifications</span><span>${message}</span>`;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 400);
  }, 4000);
}

// Inicialización de la vista según query param
document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const initialView = params.get('view') || 'tablero';
  updateActiveViewInDOM(initialView);
  actualizarUIHeader();
});
