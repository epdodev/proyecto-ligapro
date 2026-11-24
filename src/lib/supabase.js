/**
 * SIGEC-LP — Cliente Supabase Oficial con Fallback Seguro
 * Extrae credenciales de variables de entorno (VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY)
 * y provee resiliencia para que la interfaz nunca se rompa ante tablas vacías o desconexión.
 */

// 1. Extracción de variables de entorno con fallback seguro
const envUrl = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SUPABASE_URL)
  || (typeof process !== 'undefined' && process.env && process.env.VITE_SUPABASE_URL)
  || 'https://udykrprupwifmffhpvuz.supabase.co';

const envKey = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SUPABASE_ANON_KEY)
  || (typeof process !== 'undefined' && process.env && process.env.VITE_SUPABASE_ANON_KEY)
  || 'sb_publishable_BWp4gPHD6qr2TeqUJfOh2Q_IVleiAeo';

export const SUPABASE_URL = envUrl;
export const SUPABASE_ANON_KEY = envKey;

let supabaseClient = null;
let isConnected = false;

/**
 * Inicializa y retorna la instancia del cliente Supabase
 */
export function getSupabase() {
  if (supabaseClient) return supabaseClient;

  try {
    // Soporte para importación de módulo o CDN global window.supabase
    const createClientFn = (typeof window !== 'undefined' && window.supabase && window.supabase.createClient)
      ? window.supabase.createClient
      : null;

    if (createClientFn) {
      supabaseClient = createClientFn(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
          persistSession: true,
          autoRefreshToken: true
        }
      });
      isConnected = true;
    }
  } catch (err) {
    isConnected = false;
  }

  return supabaseClient;
}

/**
 * Consulta segura a Supabase con fallback integrado.
 * Si la tabla aún no existe o Supabase no responde, retorna los datos de fallback
 * sin romper la interfaz de usuario.
 *
 * @param {string} tableName
 * @param {any[]} fallbackData
 * @param {string} select
 * @returns {Promise<{ data: any[], source: 'supabase' | 'fallback', error: any }>}
 */
export async function safeQuery(tableName, fallbackData = [], select = '*') {
  const client = getSupabase();
  if (!client) {
    return { data: fallbackData, source: 'fallback', error: 'Cliente Supabase no inicializado' };
  }

  try {
    const { data, error } = await client.from(tableName).select(select);
    if (error) {
      return { data: fallbackData, source: 'fallback', error };
    }

    if (!data || data.length === 0) {
      return { data: fallbackData, source: 'fallback', error: null };
    }

    return { data, source: 'supabase', error: null };
  } catch (ex) {
    return { data: fallbackData, source: 'fallback', error: ex };
  }
}

/**
 * Inserción segura en Supabase con captura de errores
 */
export async function safeInsert(tableName, record) {
  const client = getSupabase();
  if (!client) return { success: false, error: 'Sin cliente Supabase' };

  try {
    const { data, error } = await client.from(tableName).insert(record).select();
    if (error) {
      return { success: false, error };
    }
    return { success: true, data };
  } catch (ex) {
    return { success: false, error: ex };
  }
}

export function isSupabaseConnected() {
  return isConnected;
}
