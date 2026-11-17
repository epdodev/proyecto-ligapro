/**
 * SIGEC-LP — Store Global Reactivo y Repositorio de Datos
 * Conecta Supabase + Cache Local Offline + Lógica de Dominio y Gestión de Sesión
 */

import { getSupabase } from './supabase.js';
import { ordenarTabla } from '../domain/tablas/desempates.js';
import { calcularFinalistasYCampeon } from '../domain/tablas/finalistas.js';
import { evaluarAcumulacionAmarillas } from '../domain/disciplina/acumulacion.js';
import { calcularMulta } from '../domain/multas/calculo.js';

export const INITIAL_STATE = {
  activeView: 'posiciones',
  highContrast: false,
  fontScale: 100, // porcentaje
  audioAlerts: true,
  currentUser: {
    isAuthenticated: false,
    id: null,
    nombre: 'Invitado General',
    email: 'publico@ligapro.ec',
    rol: 'PUBLICO',
    rolNombre: 'Acceso Público (Aficionado)',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    cargo: 'Espectador Público',
    club: 'Ninguno',
    cedula: 'Consumidor Final',
    clubId: null,
    partidoId: null
  },
  temporada: {
    anio: 2025,
    nombre: 'LigaPro Ecuabet Serie A 2025',
    reglamento: 'LIGAPRO-2023-07'
  },
  notificaciones: [
    {
      id: 1,
      titulo: 'Jornada 18 en Vivo',
      detalle: 'LDU Quito vs Barcelona SC disputándose en Casa Blanca (68\')',
      hora: 'Hace 5 min',
      tipo: 'match',
      leida: false
    },
    {
      id: 2,
      titulo: 'Alerta Art. 91 — 4ª Amarilla',
      detalle: 'Jesús Trindade (Barcelona SC) acumuló su 4ª tarjeta amarilla en el torneo.',
      hora: 'Hace 27 min',
      tipo: 'warning',
      leida: false
    },
    {
      id: 3,
      titulo: 'Trámite TRM-2025-089 Aprobado',
      detalle: 'Uso de camiseta conmemorativa autorizado para Barcelona SC (Jornada 19 en adelante).',
      hora: 'Hace 2 horas',
      tipo: 'success',
      leida: false
    },
    {
      id: 4,
      titulo: 'Horario Unificado (Art. 49)',
      detalle: 'Sincronización vinculante a las 18:00 UTC-5 para encuentros decisivos de Fecha 14 y 15.',
      hora: 'Hace 4 horas',
      tipo: 'info',
      leida: true
    }
  ],
  partidoActivo: {
    id: '88888888-8888-8888-8888-888888888888',
    jornada: 18,
    fase: 'Fase Uno',
    local: {
      id: '66666666-6666-6666-6666-666666666601',
      nombre: 'LDU Quito',
      nombreCorto: 'LDU',
      escudo: '⚪',
      color: '#FFFFFF'
    },
    visitante: {
      id: '66666666-6666-6666-6666-666666666602',
      nombre: 'Barcelona SC',
      nombreCorto: 'BSC',
      escudo: '🟡',
      color: '#FFE600'
    },
    estadio: 'Estadio Rodrigo Paz Delgado (Casa Blanca)',
    ciudad: 'Quito',
    horaProgramada: '19:00',
    estado: 'en_juego', // 'programado', 'en_juego', 'descanso', 'suspendido_provisional', 'finalizado'
    marcador: { local: 1, visitante: 1 },
    minuto: 68,
    periodo: 2, // 1 = 1T, 2 = 2T
    tiempoDescuento: 0,
    cuentaRegresivaOficial: 'T-00:22:00',
    audioVisualCancionOficialOk: true,
    comisario: 'Ing. Marcelo Valencia (Acreditado SIGEC-SEC://PKI-COM-883)',
    arbitroCentral: 'Augusto Aragón (FIFA)',
    varOficial: 'Bryan Loayza (FIFA)',
    medicoCampo: 'Dra. Elena Santillán',
    eventos: [
      { id: 1, minuto: 23, tipo: 'gol', club: 'local', autor: 'Alex Arce (19)', detalle: 'Jugada colectiva, asistencia E. Piovi' },
      { id: 2, minuto: 41, tipo: 'amarilla', club: 'visitante', autor: 'Jesús Trindade (8)', detalle: 'Falta táctica en mediocampo (4ª amarilla acumulada)' },
      { id: 3, minuto: 58, tipo: 'gol', club: 'visitante', autor: 'Octavio Rivero (29)', detalle: 'Remate de cabeza tras tiro de esquina' }
    ],
    checklist: {
      balones: { cumple: true, valor: '14 balones oficiales', ref: 'Art. 53 (mín. 12)' },
      pasabolas: { cumple: true, valor: '10 pasabolas (15-16 años)', ref: 'Art. 54 (8-12 pasabolas)' },
      cesped: { cumple: true, valor: '22.5 mm', ref: 'Art. 51 (20-25 mm)' },
      riego: { cumple: true, valor: 'T-20m ejecutado', ref: 'Art. 52' },
      ambulancia: { cumple: true, valor: 'Operativa en túnel norte', ref: 'Art. 87a' },
      vor: { cumple: true, valor: 'Conexión 220V + 200Mbps', ref: 'Art. 92' }
    },
    plantillaLocal: [
      { id: 101, dorsal: 22, nombre: 'Alexander Domínguez', puesto: 'ARQ', condicion: 'titular', capitan: false },
      { id: 102, dorsal: 14, nombre: 'José Quintero', puesto: 'DEF', condicion: 'titular', capitan: false },
      { id: 103, dorsal: 3, nombre: 'Ricardo Adé', puesto: 'DEF', condicion: 'titular', capitan: false },
      { id: 104, dorsal: 30, nombre: 'Gian Franco Allala', puesto: 'DEF', condicion: 'titular', capitan: false },
      { id: 105, dorsal: 6, nombre: 'Leonel Quiñónez', puesto: 'DEF', condicion: 'titular', capitan: false },
      { id: 106, dorsal: 18, nombre: 'Ezequiel Piovi', puesto: 'MED', condicion: 'titular', capitan: true },
      { id: 107, dorsal: 5, nombre: 'Marco Angulo', puesto: 'MED', condicion: 'titular', capitan: false },
      { id: 108, dorsal: 26, nombre: 'Jhojan Julio', puesto: 'MED', condicion: 'titular', capitan: false },
      { id: 109, dorsal: 8, nombre: 'Gabriel Villamil', puesto: 'MED', condicion: 'titular', capitan: false },
      { id: 110, dorsal: 11, nombre: 'Michael Estrada', puesto: 'DEL', condicion: 'titular', capitan: false },
      { id: 111, dorsal: 19, nombre: 'Alex Arce', puesto: 'DEL', condicion: 'titular', capitan: false }
    ],
    plantillaVisitante: [
      { id: 201, dorsal: 1, nombre: 'Javier Burrai', puesto: 'ARQ', condicion: 'titular', capitan: true },
      { id: 202, dorsal: 4, nombre: 'Bryan Carabalí', puesto: 'DEF', condicion: 'titular', capitan: false },
      { id: 203, dorsal: 2, nombre: 'Nicolás Ramírez', puesto: 'DEF', condicion: 'titular', capitan: false },
      { id: 204, dorsal: 6, nombre: 'Luca Sosa', puesto: 'DEF', condicion: 'titular', capitan: false },
      { id: 205, dorsal: 15, nombre: 'Aníbal Chalá', puesto: 'DEF', condicion: 'titular', capitan: false },
      { id: 206, dorsal: 8, nombre: 'Jesús Trindade', puesto: 'MED', condicion: 'titular', capitan: false },
      { id: 207, dorsal: 22, nombre: 'Leonai Souza', puesto: 'MED', condicion: 'titular', capitan: false },
      { id: 208, dorsal: 10, nombre: 'Damián Díaz', puesto: 'MED', condicion: 'titular', capitan: false },
      { id: 209, dorsal: 11, nombre: 'Adonis Preciado', puesto: 'DEL', condicion: 'titular', capitan: false },
      { id: 210, dorsal: 7, nombre: 'Janner Corozo', puesto: 'DEL', condicion: 'titular', capitan: false },
      { id: 211, dorsal: 29, nombre: 'Octavio Rivero', puesto: 'DEL', condicion: 'titular', capitan: false }
    ]
  },
  clubes: [
    { id: '66666666-6666-6666-6666-666666666601', nombre: 'LDU Quito', pj: 18, pg: 12, pe: 4, pp: 2, gf: 34, gc: 14, dg: 20, pts: 40, gfVisitante: 15, tendencia: 'W-W-D-W-W', estadoMatematico: 'Clasificado Final', cupo: 'Copa Libertadores (ECU 1)' },
    { id: '66666666-6666-6666-6666-666666666603', nombre: 'Independiente del Valle', pj: 18, pg: 11, pe: 5, pp: 2, gf: 31, gc: 12, dg: 19, pts: 38, gfVisitante: 14, tendencia: 'W-D-W-W-D', estadoMatematico: 'Fase de Grupos', cupo: 'Copa Libertadores (ECU 2)' },
    { id: '66666666-6666-6666-6666-666666666602', nombre: 'Barcelona SC', pj: 18, pg: 11, pe: 4, pp: 3, gf: 33, gc: 16, dg: 17, pts: 37, gfVisitante: 13, tendencia: 'W-W-W-L-D', estadoMatematico: 'Fase Previa', cupo: 'Copa Libertadores (ECU 3)' },
    { id: '66666666-6666-6666-6666-666666666605', nombre: 'Universidad Católica', pj: 18, pg: 9, pe: 5, pp: 4, gf: 28, gc: 18, dg: 10, pts: 32, gfVisitante: 11, tendencia: 'D-W-L-W-W', estadoMatematico: 'En Zona', cupo: 'Copa Libertadores (ECU 4)' },
    { id: '66666666-6666-6666-6666-666666666606', nombre: 'SD Aucas', pj: 18, pg: 8, pe: 6, pp: 4, gf: 29, gc: 21, dg: 8, pts: 30, gfVisitante: 12, tendencia: 'L-W-D-D-W', estadoMatematico: 'En Zona', cupo: 'Copa Sudamericana (ECU 1)' },
    { id: '66666666-6666-6666-6666-666666666604', nombre: 'CS Emelec', pj: 18, pg: 8, pe: 5, pp: 5, gf: 24, gc: 18, dg: 6, pts: 29, gfVisitante: 9, tendencia: 'W-L-D-W-L', estadoMatematico: 'En Zona', cupo: 'Copa Sudamericana (ECU 2)' },
    { id: '66666666-6666-6666-6666-666666666607', nombre: 'Orense SC', pj: 18, pg: 7, pe: 6, pp: 5, gf: 22, gc: 20, dg: 2, pts: 27, gfVisitante: 8, tendencia: 'D-D-W-W-L', estadoMatematico: 'En Zona', cupo: 'Copa Sudamericana (ECU 3)' },
    { id: '66666666-6666-6666-6666-666666666609', nombre: 'El Nacional', pj: 18, pg: 7, pe: 4, pp: 7, gf: 23, gc: 24, dg: -1, pts: 25, gfVisitante: 10, tendencia: 'W-L-W-L-D', estadoMatematico: 'En Zona', cupo: 'Copa Sudamericana (ECU 4)' },
    { id: '66666666-6666-6666-6666-666666666612', nombre: 'Macará', pj: 18, pg: 6, pe: 6, pp: 6, gf: 19, gc: 20, dg: -1, pts: 24, gfVisitante: 7, tendencia: 'D-L-W-D-W', estadoMatematico: 'Zona Media', cupo: 'Sin clasificación' },
    { id: '66666666-6666-6666-6666-666666666610', nombre: 'Deportivo Cuenca', pj: 18, pg: 5, pe: 7, pp: 6, gf: 21, gc: 23, dg: -2, pts: 22, gfVisitante: 8, tendencia: 'L-D-D-W-D', estadoMatematico: 'Zona Media', cupo: 'Sin clasificación' },
    { id: '66666666-6666-6666-6666-666666666613', nombre: 'Mushuc Runa', pj: 18, pg: 5, pe: 6, pp: 7, gf: 20, gc: 26, dg: -6, pts: 21, gfVisitante: 6, tendencia: 'W-L-L-D-W', estadoMatematico: 'Zona Media', cupo: 'Sin clasificación' },
    { id: '66666666-6666-6666-6666-666666666611', nombre: 'Técnico Universitario', pj: 18, pg: 5, pe: 5, pp: 8, gf: 18, gc: 25, dg: -7, pts: 20, gfVisitante: 5, tendencia: 'L-W-L-L-D', estadoMatematico: 'Alerta Descenso', cupo: 'Sin clasificación' },
    { id: '66666666-6666-6666-6666-666666666608', nombre: 'Delfín SC', pj: 18, pg: 4, pe: 6, pp: 8, gf: 16, gc: 24, dg: -8, pts: 18, gfVisitante: 4, tendencia: 'D-L-L-W-L', estadoMatematico: 'Alerta Descenso', cupo: 'Sin clasificación' },
    { id: '66666666-6666-6666-6666-666666666614', nombre: 'Libertad FC', pj: 18, pg: 3, pe: 6, pp: 9, gf: 14, gc: 26, dg: -12, pts: 15, gfVisitante: 4, tendencia: 'L-D-L-D-L', estadoMatematico: 'Alerta Descenso', cupo: 'Sin clasificación' },
    { id: '66666666-6666-6666-6666-666666666616', nombre: 'Imbabura SC', pj: 18, pg: 3, pe: 4, pp: 11, gf: 15, gc: 34, dg: -19, pts: 13, gfVisitante: 3, tendencia: 'L-L-L-D-L', estadoMatematico: 'Zona Descenso (15º)', cupo: 'Descenso a Serie B' },
    { id: '66666666-6666-6666-6666-666666666615', nombre: 'Cumbayá FC', pj: 18, pg: 2, pe: 4, pp: 12, gf: 11, gc: 35, dg: -24, pts: 10, gfVisitante: 2, tendencia: 'L-L-L-L-D', estadoMatematico: 'Zona Descenso (16º)', cupo: 'Descenso a Serie B' }
  ],
  tramites: [
    {
      id: 'TRM-2025-089',
      club: 'Barcelona SC',
      tipo: 'cambio_uniforme',
      titulo: 'Registro de Camiseta Conmemorativa Aniversario (Alterno 2)',
      fecha: '2025-05-10',
      plazo: '7 días antes del uso (Art. 29)',
      estado: 'aprobado',
      resolucion: 'Aprobado mediante oficio No. LIGAPRO-COMP-2025-312. Habilitado para Jornada 19 en adelante.'
    },
    {
      id: 'TRM-2025-092',
      club: 'LDU Quito',
      tipo: 'postergacion_internacional',
      titulo: 'Postergación Fecha 20 por Semifinal Conmebol Sudamericana',
      fecha: '2025-05-14',
      plazo: 'Ventana descanso 48h (Art. 28a)',
      estado: 'en_revision',
      resolucion: 'Bajo análisis de fixture central. Propuesta de reprogramación para miércoles 4 de junio.'
    },
    {
      id: 'TRM-2025-095',
      club: 'Orense SC',
      tipo: 'cambio_estadio',
      titulo: 'Cambio de localía temporal a Estadio Modelo por mantenimiento',
      fecha: '2025-05-02',
      plazo: '30 días de anticipación (Disp. 6ª)',
      estado: 'aprobado',
      resolucion: 'Autorizado con informe favorable de la Dirección de Escenarios Deportivos.'
    },
    {
      id: 'TRM-2025-098',
      club: 'Independiente del Valle',
      tipo: 'apodo_camiseta',
      titulo: 'Aprobación de Nombre / Apodo en dorsal de jugador juvenil',
      fecha: '2025-05-15',
      plazo: 'Pre-entrega planilla (Art. 35)',
      estado: 'aprobado',
      resolucion: 'Aprobado para uso en dorsal oficial.'
    }
  ],
  estadiosInspeccion: [
    {
      id: 1,
      nombre: 'Estadio Rodrigo Paz Delgado',
      ciudad: 'Quito',
      club: 'LDU Quito',
      capacidad: 41575,
      cespedTipo: 'natural',
      cespedMm: 22.5,
      hospitalMin: 12,
      varMb: 200,
      varVoltaje: 220,
      camarasAlturaM: 8.5,
      calificacion: 'calificado'
    },
    {
      id: 2,
      nombre: 'Estadio Monumental Banco Pichincha',
      ciudad: 'Guayaquil',
      club: 'Barcelona SC',
      capacidad: 59283,
      cespedTipo: 'natural',
      cespedMm: 23.0,
      hospitalMin: 14,
      varMb: 250,
      varVoltaje: 220,
      camarasAlturaM: 9.0,
      calificacion: 'calificado'
    },
    {
      id: 3,
      nombre: 'Estadio Alejandro Serrano Aguilar',
      ciudad: 'Cuenca',
      club: 'Deportivo Cuenca',
      capacidad: 16500,
      cespedTipo: 'natural',
      cespedMm: 27.0,
      hospitalMin: 10,
      varMb: 120,
      varVoltaje: 218,
      camarasAlturaM: 7.2,
      calificacion: 'condicionado'
    }
  ]
};

const ROLES_MAP = {
  'DIR_COMP': { 
    nombre: 'Dirección de Competiciones', 
    email: 'c.villacis@ligapro.ec', 
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80', 
    usuario: 'Lic. Carlos Villacís',
    cargo: 'Director de Competiciones LigaPro',
    club: 'Liga Profesional de Fútbol del Ecuador (LigaPro)',
    cedula: '1708923411'
  },
  'COMISARIO': { 
    nombre: 'Comisario de Juego', 
    email: 'm.valencia@ligapro.ec', 
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80', 
    usuario: 'Ing. Marcelo Valencia',
    cargo: 'Comisario Nacional Acreditado (COMET-883)',
    club: 'Comisión de Seguridad y Escenarios LigaPro',
    cedula: '1714209552'
  },
  'CLUB_ADMIN': { 
    nombre: 'Delegado de Club (LDU Quito)', 
    email: 'delegado@ldu.com.ec', 
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80', 
    usuario: 'Dr. Diego Castro',
    cargo: 'Gerente Deportivo / Delegado Oficial',
    club: 'Liga Deportiva Universitaria de Quito',
    cedula: '1705648190'
  },
  'PUBLICO': { 
    nombre: 'Aficionado / Acceso Público', 
    email: 'publico@ligapro.ec', 
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80', 
    usuario: 'Invitado General',
    cargo: 'Espectador Público',
    club: 'Ninguno',
    cedula: 'Consumidor Final'
  }
};

class Store {
  constructor() {
    this.state = { ...INITIAL_STATE };
    this.listeners = new Set();
    this.loadFromLocalStorage();
  }

  getState() {
    return this.state;
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    this.saveToLocalStorage();
    for (const listener of this.listeners) {
      try {
        listener(this.state);
      } catch (e) {
        console.error('Error in store listener:', e);
      }
    }
  }

  saveToLocalStorage() {
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem('sigec_lp_state', JSON.stringify({
          activeView: this.state.activeView,
          highContrast: this.state.highContrast,
          fontScale: this.state.fontScale,
          audioAlerts: this.state.audioAlerts,
          currentUser: this.state.currentUser,
          partidoActivo: this.state.partidoActivo,
          tramites: this.state.tramites,
          clubes: this.state.clubes,
          notificaciones: this.state.notificaciones
        }));
      } catch (err) {
        // quota
      }
    }
  }

  loadFromLocalStorage() {
    if (typeof localStorage !== 'undefined') {
      try {
        const saved = localStorage.getItem('sigec_lp_state');
        if (saved) {
          const parsed = JSON.parse(saved);
          this.state = {
            ...this.state,
            ...parsed,
            currentUser: { ...this.state.currentUser, ...(parsed.currentUser || {}) },
            partidoActivo: { ...this.state.partidoActivo, ...(parsed.partidoActivo || {}) }
          };
        }
      } catch (e) {
        console.warn('Could not parse saved local storage state:', e);
      }
    }
  }

  canAccessView(viewId) {
    // Las vistas públicas son siempre accesibles
    if (viewId === 'posiciones' || viewId === 'auth') {
      return true;
    }
    // Si no está autenticado o su rol es público, denegar acceso a áreas administrativas
    if (!this.state.currentUser.isAuthenticated || this.state.currentUser.rol === 'PUBLICO') {
      return false;
    }
    return true;
  }

  setView(viewName) {
    if (!this.canAccessView(viewName)) {
      this.state.activeView = 'auth';
      this.notify();
      return false;
    }
    this.state.activeView = viewName;
    this.notify();
    return true;
  }

  toggleHighContrast() {
    this.state.highContrast = !this.state.highContrast;
    this.notify();
    this.saveToLocalStorage();
    return this.state.highContrast;
  }

  setFontScale(scale) {
    const valid = [100, 112.5, 125, 137.5, 150];
    const num = Number(scale);
    this.state.fontScale = valid.includes(num) ? num : 100;
    this.notify();
    this.saveToLocalStorage();
  }

  toggleAudioAlerts() {
    this.state.audioAlerts = !this.state.audioAlerts;
    this.notify();
    return this.state.audioAlerts;
  }

  setUserRole(rolCode, nombreUsuario = null, emailUsuario = null, extraData = {}) {
    const roleConfig = ROLES_MAP[rolCode] || {
      nombre: rolCode,
      email: `${rolCode.toLowerCase()}@ligapro.ec`,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      usuario: nombreUsuario || 'Oficial LigaPro',
      cargo: 'Oficial de Partido',
      club: 'LigaPro Ecuador',
      cedula: '1700000000'
    };

    const finalAvatar = extraData.avatar_url || extraData.avatar || roleConfig.avatar;
    this.state.currentUser = {
      ...this.state.currentUser,
      isAuthenticated: rolCode !== 'PUBLICO',
      rol: rolCode,
      rolNombre: roleConfig.nombre,
      nombre: nombreUsuario || roleConfig.usuario,
      email: emailUsuario || roleConfig.email,
      avatar: finalAvatar,
      avatar_url: finalAvatar,
      cargo: extraData.cargo || roleConfig.cargo || 'Oficial de Partido',
      club: extraData.club || roleConfig.club || 'LigaPro Ecuador',
      cedula: extraData.cedula || roleConfig.cedula || '1700000000'
    };

    // Si cambió a público y estaba en vista restringida, redirigir a posiciones
    if (rolCode === 'PUBLICO' && !this.canAccessView(this.state.activeView)) {
      this.state.activeView = 'posiciones';
    }

    this.notify();
  }

  updateUserProfile(datos) {
    if (!this.state.currentUser) return;
    const nuevoRol = datos.rol || this.state.currentUser.rol;
    const roleConfig = ROLES_MAP[nuevoRol] || {};
    const nuevoAvatar = datos.avatar_url || datos.avatar || this.state.currentUser.avatar_url || this.state.currentUser.avatar || roleConfig.avatar;

    this.state.currentUser = {
      ...this.state.currentUser,
      ...datos,
      rol: nuevoRol,
      rolNombre: datos.rolNombre || roleConfig.nombre || this.state.currentUser.rolNombre,
      avatar: nuevoAvatar,
      avatar_url: nuevoAvatar
    };

    this.notify();
    this.saveToLocalStorage();
  }

  async logout() {
    const sb = getSupabase();
    if (sb && sb.auth) {
      try {
        await sb.auth.signOut();
      } catch (err) {
        console.warn('Supabase signOut error:', err);
      }
    }

    this.setUserRole('PUBLICO', 'Invitado General');
    this.state.currentUser.isAuthenticated = false;
    this.state.activeView = 'auth';
    this.notify();
  }

  registrarEventoPartido(evento) {
    const nuevoEvento = {
      id: Date.now(),
      minuto: this.state.partidoActivo.minuto,
      ...evento
    };

    const nuevosEventos = [nuevoEvento, ...this.state.partidoActivo.eventos];
    const marcador = { ...this.state.partidoActivo.marcador };

    if (evento.tipo === 'gol') {
      if (evento.club === 'local') marcador.local += 1;
      else marcador.visitante += 1;
    }

    this.state.partidoActivo = {
      ...this.state.partidoActivo,
      marcador,
      eventos: nuevosEventos
    };

    if (evento.tipo === 'gol') {
      this.recalcularPuntosPartidoEnVivo();
    }

    this.notify();
  }

  recalcularPuntosPartidoEnVivo() {
    const localId = this.state.partidoActivo.local.id;
    const visitanteId = this.state.partidoActivo.visitante.id;
    const gl = this.state.partidoActivo.marcador.local;
    const gv = this.state.partidoActivo.marcador.visitante;

    this.state.clubes = this.state.clubes.map((c) => {
      if (c.id === localId) {
        return {
          ...c,
          gf: 33 + gl,
          gc: 13 + gv,
          dg: (33 + gl) - (13 + gv),
          pts: gl > gv ? 41 : gl === gv ? 39 : 38
        };
      }
      if (c.id === visitanteId) {
        return {
          ...c,
          gf: 32 + gv,
          gc: 15 + gl,
          dg: (32 + gv) - (15 + gl),
          pts: gv > gl ? 39 : gv === gl ? 37 : 36
        };
      }
      return c;
    });

    const resultado = ordenarTabla(
      this.state.clubes.map((c) => ({
        clubId: c.id,
        pts: c.pts,
        dg: c.dg,
        gf: c.gf,
        gfVisitante: c.gfVisitante || 0
      }))
    );

    const mapOrden = new Map(resultado.orden.map((item, idx) => [item.clubId, idx]));
    this.state.clubes.sort((a, b) => (mapOrden.get(a.id) ?? 99) - (mapOrden.get(b.id) ?? 99));
  }

  crearTramite(tramite) {
    const nuevo = {
      id: `TRM-2025-${Math.floor(100 + Math.random() * 900)}`,
      fecha: new Date().toISOString().split('T')[0],
      estado: 'en_revision',
      resolucion: 'Ingresado formalmente. Notificado a Dirección de Competiciones.',
      ...tramite
    };
    this.state.tramites = [nuevo, ...this.state.tramites];
    this.notify();
    return nuevo;
  }
}

export const store = new Store();
