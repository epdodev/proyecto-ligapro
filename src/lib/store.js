/**
 * SIGEC-LP — Store Global Reactivo y Repositorio de Datos
 * Conecta Supabase + Cache Local Offline + Lógica de Dominio y Gestión de Sesión
 */

import { getSupabase } from './supabase.js';
import { ordenarTabla } from '../domain/tablas/desempates.js';
import { calcularFinalistasYCampeon } from '../domain/tablas/finalistas.js';
import { evaluarAcumulacionAmarillas } from '../domain/disciplina/acumulacion.js';
import { calcularMulta } from '../domain/multas/calculo.js';

export const CLUB_LOGOS = {
  "LDU Quito": "assets/clubs/ldu-quito.png",
  "Liga Deportiva Universitaria": "assets/clubs/ldu-quito.png",
  "Liga Deportiva Universitaria de Quito": "assets/clubs/ldu-quito.png",
  "LDU": "assets/clubs/ldu-quito.png",
  "Barcelona SC": "assets/clubs/barcelona-sc.png",
  "Barcelona Sporting Club": "assets/clubs/barcelona-sc.png",
  "BSC": "assets/clubs/barcelona-sc.png",
  "Independiente del Valle": "assets/clubs/independiente-del-valle.png",
  "Ind. del Valle": "assets/clubs/independiente-del-valle.png",
  "IDV": "assets/clubs/independiente-del-valle.png",
  "Universidad Católica": "assets/clubs/universidad-catolica.png",
  "CD Universidad Católica": "assets/clubs/universidad-catolica.png",
  "C.D. Universidad Católica": "assets/clubs/universidad-catolica.png",
  "U. Católica": "assets/clubs/universidad-catolica.png",
  "SD Aucas": "assets/clubs/sd-aucas.png",
  "Sociedad Deportiva Aucas": "assets/clubs/sd-aucas.png",
  "S.D. Aucas": "assets/clubs/sd-aucas.png",
  "Aucas": "assets/clubs/sd-aucas.png",
  "CS Emelec": "assets/clubs/cs-emelec.png",
  "Club Sport Emelec": "assets/clubs/cs-emelec.png",
  "C.S. Emelec": "assets/clubs/cs-emelec.png",
  "Emelec": "assets/clubs/cs-emelec.png",
  "Orense SC": "assets/clubs/orense-sc.png",
  "Orense Sporting Club": "assets/clubs/orense-sc.png",
  "Orense S.C.": "assets/clubs/orense-sc.png",
  "Orense": "assets/clubs/orense-sc.png",
  "El Nacional": "assets/clubs/el-nacional.png",
  "Club Deportivo El Nacional": "assets/clubs/el-nacional.png",
  "CD El Nacional": "assets/clubs/el-nacional.png",
  "Macará": "assets/clubs/macara.png",
  "Club Deportivo Macará": "assets/clubs/macara.png",
  "CD Macará": "assets/clubs/macara.png",
  "C.D. Macará": "assets/clubs/macara.png",
  "Deportivo Cuenca": "assets/clubs/deportivo-cuenca.png",
  "Club Deportivo Cuenca": "assets/clubs/deportivo-cuenca.png",
  "Dep. Cuenca": "assets/clubs/deportivo-cuenca.png",
  "Mushuc Runa": "assets/clubs/mushuc-runa.png",
  "Mushuc Runa SC": "assets/clubs/mushuc-runa.png",
  "Mushuc Runa S.C.": "assets/clubs/mushuc-runa.png",
  "Mushuc Runa Sporting Club": "assets/clubs/mushuc-runa.png",
  "Técnico Universitario": "assets/clubs/tecnico-universitario.png",
  "CD Técnico Universitario": "assets/clubs/tecnico-universitario.png",
  "Delfín SC": "assets/clubs/delfin-sc.png",
  "Delfin SC": "assets/clubs/delfin-sc.png",
  "Delfín S.C.": "assets/clubs/delfin-sc.png",
  "Delfín Sporting Club": "assets/clubs/delfin-sc.png",
  "Libertad FC": "assets/clubs/libertad-fc.png",
  "Libertad F.C.": "assets/clubs/libertad-fc.png",
  "Libertad Fútbol Club": "assets/clubs/libertad-fc.png",
  "Imbabura SC": "assets/clubs/imbabura-sc.png",
  "Imbabura S.C.": "assets/clubs/imbabura-sc.png",
  "Imbabura Sporting Club": "assets/clubs/imbabura-sc.png",
  "Cumbayá FC": "assets/clubs/cumbaya-fc.png",
  "Cumbayá F.C.": "assets/clubs/cumbaya-fc.png",
  "Cumbayá Fútbol Club": "assets/clubs/cumbaya-fc.png",
  "Manta FC": "assets/clubs/manta-fc.png",
  "Manta F.C.": "assets/clubs/manta-fc.png",
  "Guayaquil City": "assets/clubs/guayaquil-city.png",
  "Guayaquil City FC": "assets/clubs/guayaquil-city.png",
  "Leones FC": "assets/clubs/leones-fc.png",
  "Gualaceo SC": "assets/clubs/gualaceo.png",
  "Gualaceo S.C.": "assets/clubs/gualaceo.png",
  "Gualaceo": "assets/clubs/gualaceo.png",
  "9 de Octubre": "assets/clubs/9-de-octubre.png",
  "9 de Octubre FC": "assets/clubs/9-de-octubre.png",
  "Nueve de Octubre": "assets/clubs/9-de-octubre.png",
  "Independiente Juniors": "assets/clubs/independiente-juniors.png",
  "Ind. Juniors": "assets/clubs/independiente-juniors.png",
  "San Antonio FC": "assets/clubs/san-antonio.png",
  "San Antonio": "assets/clubs/san-antonio.png",
  "Liga de Portoviejo": "assets/clubs/liga-de-portoviejo.png",
  "LDUP": "assets/clubs/liga-de-portoviejo.png",
  "22 de Julio": "assets/clubs/22-de-julio.png",
  "Cuenca Juniors": "assets/clubs/cuenca-juniors.png",
  "Deportivo Santo Domingo": "assets/clubs/deportivo-santo-domingo.png",
  "Atlético Rojiblanco": "assets/clubs/atletico-rojiblanco.png",
  "Vinotinto del Ecuador": "assets/clubs/vinotinto-del-ecuador.png"
};

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


export const INITIAL_STATE = {
  activeView: 'posiciones',
  divisionActiva: 'A',
  highContrast: false,
  fontScale: 100, // porcentaje
  audioAlerts: true,
  currentUser: {
    isAuthenticated: false,
    id: null,
    nombre: 'Invitado',
    email: '',
    rol: 'PUBLICO',
    rolNombre: 'Acceso Público (Invitado)',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    cargo: 'Espectador',
    club: 'Ninguno',
    cedula: '',
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
  partidos: [
    {
      id: '88888888-8888-8888-8888-888888888888',
      jornada: 18,
      fase: 'Fase Uno',
      categoria: 'PARTIDO CLASE A - ALTO RIESGO',
      tv: 'ZAPPING SPORTS / TELEAMAZONAS',
      horaProgramada: 'HOY 18:00',
      estado: 'en_juego',
      marcador: { local: 1, visitante: 1 },
      minuto: 68,
      periodo: 2,
      estadio: 'Estadio Rodrigo Paz Delgado',
      ciudad: 'Quito',
      altitud: '2,850m',
      cesped: '22.5 mm',
      local: {
        id: '66666666-6666-6666-6666-666666666601',
        nombre: 'Liga Deportiva Universitaria',
        nombreCorto: 'LDU Quito',
        escudo: 'assets/clubs/ldu-quito.png',
        color: '#FFFFFF',
        camisetaColor: '#FFFFFF',
        pantalonetaColor: '#FFFFFF',
        polainasColor: '#FFFFFF',
        wcag: 'WCAG 12.8:1'
      },
      visitante: {
        id: '66666666-6666-6666-6666-666666666602',
        nombre: 'Barcelona Sporting Club',
        nombreCorto: 'Barcelona SC',
        escudo: 'assets/clubs/barcelona-sc.png',
        color: '#FFE600',
        camisetaColor: '#FF7900',
        pantalonetaColor: '#1A1A1A',
        polainasColor: '#FF7900',
        wcag: 'WCAG 8.4:1'
      },
      comisario: 'Ing. Marcelo Valencia (Acreditado COMET-883)',
      arbitroCentral: 'Augusto Aragón (FIFA)',
      varOficial: 'Bryan Loayza (FIFA)',
      medicoCampo: 'Dra. Elena Santillán'
    },
    {
      id: '88888888-8888-8888-8888-888888888802',
      jornada: 18,
      fase: 'Fase Uno',
      categoria: 'PARTIDO CLASE A',
      tv: 'ZAPPING SPORTS / STAR+',
      horaProgramada: 'HOY 15:30',
      estado: 'finalizado',
      marcador: { local: 2, visitante: 1 },
      minuto: 90,
      periodo: 2,
      estadio: 'Estadio Banco Guayaquil',
      ciudad: 'Sangolquí',
      altitud: '2,500m',
      cesped: '21.0 mm',
      local: {
        id: '66666666-6666-6666-6666-666666666603',
        nombre: 'Independiente del Valle',
        nombreCorto: 'IDV',
        escudo: 'assets/clubs/independiente-del-valle.png',
        color: '#000000',
        camisetaColor: '#000000',
        pantalonetaColor: '#000000',
        polainasColor: '#000000',
        wcag: 'WCAG 14.2:1'
      },
      visitante: {
        id: '66666666-6666-6666-6666-666666666604',
        nombre: 'Club Sport Emelec',
        nombreCorto: 'CS Emelec',
        escudo: 'assets/clubs/cs-emelec.png',
        color: '#003399',
        camisetaColor: '#003399',
        pantalonetaColor: '#999999',
        polainasColor: '#003399',
        wcag: 'WCAG 9.1:1'
      },
      comisario: 'Lcdo. Ramiro Salazar',
      arbitroCentral: 'Guillermo Guerrero (FIFA)',
      varOficial: 'Carlos Orbe (FIFA)'
    },
    {
      id: '88888888-8888-8888-8888-888888888803',
      jornada: 18,
      fase: 'Fase Uno',
      categoria: 'SUPERCLÁSICO QUITEÑO',
      tv: 'TELEAMAZONAS / ZAPPING',
      horaProgramada: 'HOY 13:00',
      estado: 'finalizado',
      marcador: { local: 3, visitante: 2 },
      minuto: 90,
      periodo: 2,
      estadio: 'Estadio Gonzalo Pozo Ripalda',
      ciudad: 'Quito',
      altitud: '2,880m',
      cesped: '23.0 mm',
      local: {
        id: '66666666-6666-6666-6666-666666666606',
        nombre: 'Sociedad Deportiva Aucas',
        nombreCorto: 'SD Aucas',
        escudo: 'assets/clubs/sd-aucas.png',
        color: '#FFCC00',
        camisetaColor: '#FFCC00',
        pantalonetaColor: '#CC0000',
        polainasColor: '#FFCC00',
        wcag: 'WCAG 10.5:1'
      },
      visitante: {
        id: '66666666-6666-6666-6666-666666666609',
        nombre: 'Club Deportivo El Nacional',
        nombreCorto: 'CD El Nacional',
        escudo: 'assets/clubs/el-nacional.png',
        color: '#CC0000',
        camisetaColor: '#8B0000',
        pantalonetaColor: '#8B0000',
        polainasColor: '#001F3F',
        wcag: 'WCAG 7.1:1'
      },
      comisario: 'Lcdo. Patricio Sánchez',
      arbitroCentral: 'Franklin Congo',
      varOficial: 'Gabriel González'
    },
    {
      id: '88888888-8888-8888-8888-888888888804',
      jornada: 18,
      fase: 'Fase Uno',
      categoria: 'PARTIDO CLASE B',
      tv: 'ZAPPING SPORTS',
      horaProgramada: 'AYER 19:00',
      estado: 'finalizado',
      marcador: { local: 2, visitante: 0 },
      minuto: 90,
      periodo: 2,
      estadio: 'Estadio Olímpico Atahualpa',
      ciudad: 'Quito',
      altitud: '2,780m',
      cesped: '22.0 mm',
      local: {
        id: '66666666-6666-6666-6666-666666666605',
        nombre: 'Universidad Católica',
        nombreCorto: 'U. Católica',
        escudo: 'assets/clubs/universidad-catolica.png',
        color: '#0080FF',
        camisetaColor: '#0080FF',
        pantalonetaColor: '#FFFFFF',
        polainasColor: '#0080FF',
        wcag: 'WCAG 11.2:1'
      },
      visitante: {
        id: '66666666-6666-6666-6666-666666666607',
        nombre: 'Orense Sporting Club',
        nombreCorto: 'Orense SC',
        escudo: 'assets/clubs/orense-sc.png',
        color: '#009933',
        camisetaColor: '#009933',
        pantalonetaColor: '#009933',
        polainasColor: '#FFFFFF',
        wcag: 'WCAG 8.9:1'
      },
      comisario: 'Ing. Carlos Echeverría',
      arbitroCentral: 'Roberto Sánchez',
      varOficial: 'Jaime Sánchez'
    },
    {
      id: '88888888-8888-8888-8888-888888888805',
      jornada: 18,
      fase: 'Fase Uno',
      categoria: 'PARTIDO CLASE B',
      tv: 'ZAPPING SPORTS',
      horaProgramada: 'AYER 16:30',
      estado: 'finalizado',
      marcador: { local: 1, visitante: 1 },
      minuto: 90,
      periodo: 2,
      estadio: 'Estadio Alejandro Serrano Aguilar',
      ciudad: 'Cuenca',
      altitud: '2,550m',
      cesped: '23.5 mm',
      local: {
        id: '66666666-6666-6666-6666-666666666610',
        nombre: 'Club Deportivo Cuenca',
        nombreCorto: 'Dep. Cuenca',
        escudo: 'assets/clubs/deportivo-cuenca.png',
        color: '#CC0000',
        camisetaColor: '#CC0000',
        pantalonetaColor: '#000000',
        polainasColor: '#CC0000',
        wcag: 'WCAG 9.4:1'
      },
      visitante: {
        id: '66666666-6666-6666-6666-666666666612',
        nombre: 'Club Deportivo Macará',
        nombreCorto: 'Macará',
        escudo: 'assets/clubs/macara.png',
        color: '#00BFFF',
        camisetaColor: '#00BFFF',
        pantalonetaColor: '#00BFFF',
        polainasColor: '#00BFFF',
        wcag: 'WCAG 8.2:1'
      },
      comisario: 'Ab. Mario Romero',
      arbitroCentral: 'Anthony Díaz',
      varOficial: 'Luis Quiroz'
    },
    {
      id: '88888888-8888-8888-8888-888888888806',
      jornada: 18,
      fase: 'Fase Uno',
      categoria: 'CLÁSICO AMBATEÑO',
      tv: 'ZAPPING SPORTS',
      horaProgramada: 'HOY 20:30',
      estado: 'programado',
      marcador: { local: 0, visitante: 0 },
      minuto: 0,
      periodo: 1,
      estadio: 'Estadio Bellavista',
      ciudad: 'Ambato',
      altitud: '2,570m',
      cesped: '22.0 mm',
      local: {
        id: '66666666-6666-6666-6666-666666666611',
        nombre: 'Técnico Universitario',
        nombreCorto: 'Técnico Univ.',
        escudo: 'assets/clubs/tecnico-universitario.png',
        color: '#FF0000',
        camisetaColor: '#FF0000',
        pantalonetaColor: '#FFFFFF',
        polainasColor: '#FF0000',
        wcag: 'WCAG 10.1:1'
      },
      visitante: {
        id: '66666666-6666-6666-6666-666666666613',
        nombre: 'Mushuc Runa Sporting Club',
        nombreCorto: 'Mushuc Runa',
        escudo: 'assets/clubs/mushuc-runa.png',
        color: '#009900',
        camisetaColor: '#009900',
        pantalonetaColor: '#FFFFFF',
        polainasColor: '#009900',
        wcag: 'WCAG 9.0:1'
      },
      comisario: 'Ing. Washington Alarcón',
      arbitroCentral: 'Oswaldo Contreras',
      varOficial: 'Marlon Vera'
    },
    {
      id: '88888888-8888-8888-8888-888888888807',
      jornada: 18,
      fase: 'Fase Uno',
      categoria: 'PARTIDO CLASE C',
      tv: 'ZAPPING SPORTS',
      horaProgramada: 'MAÑANA 16:30',
      estado: 'programado',
      marcador: { local: 0, visitante: 0 },
      minuto: 0,
      periodo: 1,
      estadio: 'Estadio Jocay',
      ciudad: 'Manta',
      altitud: '6m',
      cesped: '22.0 mm',
      local: {
        id: '66666666-6666-6666-6666-666666666608',
        nombre: 'Delfín Sporting Club',
        nombreCorto: 'Delfín SC',
        escudo: 'assets/clubs/delfin-sc.png',
        color: '#FFD700',
        camisetaColor: '#FFD700',
        pantalonetaColor: '#000080',
        polainasColor: '#FFD700',
        wcag: 'WCAG 11.5:1'
      },
      visitante: {
        id: '66666666-6666-6666-6666-666666666614',
        nombre: 'Libertad Fútbol Club',
        nombreCorto: 'Libertad FC',
        escudo: 'assets/clubs/libertad-fc.png',
        color: '#FF6600',
        camisetaColor: '#FF6600',
        pantalonetaColor: '#FFFFFF',
        polainasColor: '#FF6600',
        wcag: 'WCAG 8.6:1'
      },
      comisario: 'Lcdo. Jorge Bravo',
      arbitroCentral: 'Gorky Araujo',
      varOficial: 'Jefferson Macías'
    },
    {
      id: '88888888-8888-8888-8888-888888888808',
      jornada: 18,
      fase: 'Fase Uno',
      categoria: 'DUELO DIRECTO PERMANENCIA',
      tv: 'ZAPPING SPORTS',
      horaProgramada: 'MAÑANA 19:00',
      estado: 'programado',
      marcador: { local: 0, visitante: 0 },
      minuto: 0,
      periodo: 1,
      estadio: 'Estadio Olímpico de Ibarra',
      ciudad: 'Ibarra',
      altitud: '2,225m',
      cesped: '23.0 mm',
      local: {
        id: '66666666-6666-6666-6666-666666666616',
        nombre: 'Imbabura Sporting Club',
        nombreCorto: 'Imbabura SC',
        escudo: 'assets/clubs/imbabura-sc.png',
        color: '#0033CC',
        camisetaColor: '#0033CC',
        pantalonetaColor: '#0033CC',
        polainasColor: '#0033CC',
        wcag: 'WCAG 12.0:1'
      },
      visitante: {
        id: '66666666-6666-6666-6666-666666666615',
        nombre: 'Cumbayá Fútbol Club',
        nombreCorto: 'Cumbayá FC',
        escudo: 'assets/clubs/cumbaya-fc.png',
        color: '#0099FF',
        camisetaColor: '#0099FF',
        pantalonetaColor: '#FFFFFF',
        polainasColor: '#0099FF',
        wcag: 'WCAG 9.8:1'
      },
      comisario: 'Ing. Byron Moreno',
      arbitroCentral: 'Álex Cajas',
      varOficial: 'Christian Lescano'
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
      escudo: 'assets/clubs/ldu-quito.png',
      color: '#FFFFFF'
    },
    visitante: {
      id: '66666666-6666-6666-6666-666666666602',
      nombre: 'Barcelona SC',
      nombreCorto: 'BSC',
      escudo: 'assets/clubs/barcelona-sc.png',
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
  clubesSerieB: [
    { id: 'sb-01', posicion: 1, nombre: 'Guayaquil City', nombreCorto: 'Guayaquil City', ciudadEstadio: 'Guayaquil • Estadio Christian Benítez', escudo: 'assets/clubs/guayaquil-city.png', pj: 11, pg: 7, pe: 3, pp: 1, gf: 18, gc: 6, dg: '+12', pts: 24, tendencia: 'W-W-D-W-W', zona: 'ascenso', zonaTexto: 'Zona Ascenso Directo (1º)' },
    { id: 'sb-02', posicion: 2, nombre: 'Manta FC', nombreCorto: 'Manta FC', ciudadEstadio: 'Manta • Estadio Jocay', escudo: 'assets/clubs/manta-fc.png', pj: 11, pg: 6, pe: 4, pp: 1, gf: 15, gc: 7, dg: '+8', pts: 22, tendencia: 'W-D-W-W-D', zona: 'ascenso', zonaTexto: 'Zona Ascenso Directo (2º)' },
    { id: 'sb-03', posicion: 3, nombre: 'Gualaceo SC', nombreCorto: 'Gualaceo SC', ciudadEstadio: 'Gualaceo • Estadio Gerardo León Pozo', escudo: 'assets/clubs/gualaceo.png', pj: 11, pg: 5, pe: 4, pp: 2, gf: 14, gc: 9, dg: '+5', pts: 19, tendencia: 'D-W-L-W-W', zona: 'permanencia', zonaTexto: 'Permanencia Serie B' },
    { id: 'sb-04', posicion: 4, nombre: 'Independiente Juniors', nombreCorto: 'Independiente Jrs', ciudadEstadio: 'Sangolquí • Banco Guayaquil', escudo: 'assets/clubs/independiente-juniors.png', pj: 11, pg: 5, pe: 3, pp: 3, gf: 16, gc: 11, dg: '+5', pts: 18, tendencia: 'W-L-W-D-L', zona: 'filial', zonaTexto: 'Filial IDV (Sin ascenso Art. 13)' },
    { id: 'sb-05', posicion: 5, nombre: '9 de Octubre', nombreCorto: '9 de Octubre', ciudadEstadio: 'Guayaquil • Estadio Los Chirijos', escudo: 'assets/clubs/9-de-octubre.png', pj: 11, pg: 4, pe: 4, pp: 3, gf: 13, gc: 12, dg: '+1', pts: 16, tendencia: 'D-W-D-L-W', zona: 'permanencia', zonaTexto: 'Permanencia Serie B' },
    { id: 'sb-06', posicion: 6, nombre: 'San Antonio FC', nombreCorto: 'San Antonio FC', ciudadEstadio: 'Ibarra • Estadio Olímpico de Ibarra', escudo: 'assets/clubs/san-antonio.png', pj: 11, pg: 3, pe: 5, pp: 3, gf: 10, gc: 11, dg: '-1', pts: 14, tendencia: 'D-L-D-W-D', zona: 'permanencia', zonaTexto: 'Permanencia Serie B' },
    { id: 'sb-07', posicion: 7, nombre: 'Leones FC', nombreCorto: 'Leones FC', ciudadEstadio: 'Ibarra • Estadio Olímpico de Ibarra', escudo: 'assets/clubs/leones-fc.png', pj: 11, pg: 3, pe: 4, pp: 4, gf: 11, gc: 13, dg: '-2', pts: 13, tendencia: 'L-D-W-L-D', zona: 'permanencia', zonaTexto: 'Permanencia Serie B' },
    { id: 'sb-08', posicion: 8, nombre: 'Liga de Portoviejo', nombreCorto: 'Liga de Portoviejo', ciudadEstadio: 'Portoviejo • Reales Tamarindos', escudo: 'assets/clubs/liga-de-portoviejo.png', pj: 11, pg: 2, pe: 5, pp: 4, gf: 9, gc: 14, dg: '-5', pts: 11, tendencia: 'D-L-L-D-W', zona: 'permanencia', zonaTexto: 'Permanencia Serie B' },
    { id: 'sb-09', posicion: 9, nombre: '22 de Julio', nombreCorto: '22 de Julio', ciudadEstadio: 'Pelileo • Ciudad de Pelileo', escudo: 'assets/clubs/22-de-julio.png', pj: 11, pg: 1, pe: 4, pp: 6, gf: 8, gc: 18, dg: '-10', pts: 7, tendencia: 'L-D-L-L-D', zona: 'descenso', zonaTexto: 'Zona de Descenso a 2ª Cat.' },
    { id: 'sb-10', posicion: 10, nombre: 'Cuenca Juniors', nombreCorto: 'Cuenca Juniors', ciudadEstadio: 'Cuenca • Alejandro Serrano Aguilar', escudo: 'assets/clubs/cuenca-juniors.png', pj: 11, pg: 1, pe: 2, pp: 8, gf: 6, gc: 19, dg: '-13', pts: 5, tendencia: 'L-L-D-L-L', zona: 'descenso', zonaTexto: 'Zona de Descenso a 2ª Cat.' }
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

export const ROLES_MAP = {
  'DIR_COMP': { 
    nombre: 'Dirección de Competiciones', 
    cargo: 'Director de Competiciones LigaPro',
    club: 'Liga Profesional de Fútbol del Ecuador (LigaPro)',
    badgeColor: 'blue'
  },
  'COMISARIO': { 
    nombre: 'Comisario de Juego', 
    cargo: 'Comisario Oficial de Partido',
    club: 'Comisión de Seguridad y Escenarios LigaPro',
    badgeColor: 'amber'
  },
  'CLUB_ADMIN': { 
    nombre: 'Delegado Oficial de Club', 
    cargo: 'Delegado Oficial de Club',
    club: 'Club Afiliado LigaPro',
    badgeColor: 'emerald'
  },
  'PUBLICO': { 
    nombre: 'Acceso Público / Aficionado', 
    cargo: 'Espectador',
    club: 'Ninguno',
    badgeColor: 'purple'
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
          partidos: this.state.partidos,
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
          let loadedUser = parsed.currentUser || {};
          // Limpiar datos demo persistidos previamente
          if (!loadedUser.email || loadedUser.email === 'publico@ligapro.ec' || loadedUser.email.includes('c.villacis')) {
            loadedUser = { ...INITIAL_STATE.currentUser };
          }
          this.state = {
            ...this.state,
            ...parsed,
            currentUser: { ...INITIAL_STATE.currentUser, ...loadedUser },
            partidoActivo: { ...this.state.partidoActivo, ...(parsed.partidoActivo || {}) },
            partidos: parsed.partidos && parsed.partidos.length > 0 ? parsed.partidos : INITIAL_STATE.partidos
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
      cargo: 'Oficial de Partido',
      club: 'LigaPro Ecuador'
    };

    const initialSeed = encodeURIComponent(nombreUsuario || emailUsuario || 'LigaPro');
    const defaultAvatar = `https://api.dicebear.com/7.x/initials/svg?seed=${initialSeed}&backgroundColor=0284c7`;
    const finalAvatar = extraData.avatar_url || extraData.avatar || defaultAvatar;

    const isAuth = rolCode !== 'PUBLICO' && Boolean(emailUsuario);

    this.state.currentUser = {
      ...this.state.currentUser,
      isAuthenticated: isAuth,
      id: extraData.id || this.state.currentUser.id || null,
      rol: rolCode,
      rolNombre: roleConfig.nombre,
      nombre: nombreUsuario || (isAuth ? 'Usuario Oficial' : 'Invitado'),
      email: emailUsuario || '',
      avatar: finalAvatar,
      avatar_url: finalAvatar,
      cargo: extraData.cargo || roleConfig.cargo || 'Oficial',
      club: extraData.club || roleConfig.club || 'LigaPro Ecuador',
      cedula: extraData.cedula || ''
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

  setPartidos(partidosList) {
    if (!Array.isArray(partidosList) || partidosList.length === 0) return;
    this.state.partidos = partidosList;
    // Si el partido activo está en la lista actualizada, actualizarlo
    const matchActivo = partidosList.find(p => p.id === this.state.partidoActivo?.id);
    if (matchActivo) {
      this.state.partidoActivo = {
        ...this.state.partidoActivo,
        ...matchActivo
      };
      this.recalcularPuntosPartidoEnVivo();
    }
    this.notify();
  }

  seleccionarPartido(partidoId) {
    const encontrado = this.state.partidos?.find(p => p.id === partidoId);
    if (encontrado) {
      this.state.partidoActivo = {
        ...this.state.partidoActivo,
        ...encontrado
      };
      this.recalcularPuntosPartidoEnVivo();
      this.notify();
    }
  }

  actualizarMarcadorPartido(partidoId, gl, gv, estado = null) {
    if (this.state.partidos) {
      const idx = this.state.partidos.findIndex(p => p.id === partidoId);
      if (idx !== -1) {
        this.state.partidos[idx].goles_local = gl;
        this.state.partidos[idx].goles_visitante = gv;
        if (estado) this.state.partidos[idx].estado = estado;
      }
    }
    if (this.state.partidoActivo?.id === partidoId) {
      this.state.partidoActivo.goles_local = gl;
      this.state.partidoActivo.goles_visitante = gv;
      if (estado) this.state.partidoActivo.estado = estado;
      this.recalcularPuntosPartidoEnVivo();
    }
    this.notify();
  }

  setDivision(div) {
    this.state.divisionActiva = (div === 'B' || div === 'serie-b' || div === 'b') ? 'B' : 'A';
    this.notify();
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
