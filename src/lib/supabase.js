/**
 * SIGEC-LP — Cliente Supabase Oficial
 * Conexión al proyecto Supabase oficial de LigaPro Ecuador
 */

export const SUPABASE_URL = 'https://udykrprupwifmffhpvuz.supabase.co';
export const SUPABASE_ANON_KEY = 'sb_publishable_BWp4gPHD6qr2TeqUJfOh2Q_IVleiAeo';

let supabaseClient = null;

/**
 * Inicializa y retorna la instancia del cliente Supabase
 */
export function getSupabase() {
  if (supabaseClient) return supabaseClient;

  if (typeof window !== 'undefined' && window.supabase && typeof window.supabase.createClient === 'function') {
    try {
      supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
          persistSession: true,
          autoRefreshToken: true
        }
      });
      console.log('✅ Supabase Client conectado exitosamente a', SUPABASE_URL);
    } catch (err) {
      console.warn('⚠️ No se pudo inicializar Supabase client:', err);
    }
  }

  return supabaseClient;
}

/**
 * Helper para realizar consultas directas vía REST de Supabase con fallback
 */
export async function fetchSupabaseTable(tableName, select = '*', filters = {}) {
  const sb = getSupabase();
  if (sb) {
    try {
      let query = sb.from(tableName).select(select);
      for (const [col, val] of Object.entries(filters)) {
        query = query.eq(col, val);
      }
      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return { data, error: null, source: 'supabase_live' };
      }
    } catch (e) {
      console.warn(`[Supabase Live Error on ${tableName}]:`, e);
    }
  }

  return { data: null, error: 'Offline / Fallback to local store', source: 'local' };
}
