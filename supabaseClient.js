import WebSocket from 'ws';
import { createClient } from '@supabase/supabase-js';
import { CONFIG } from './config.js';

const isConfigured = Boolean(
  CONFIG.SUPABASE_URL &&
  CONFIG.SUPABASE_URL.startsWith('https://') &&
  (CONFIG.SUPABASE_SERVICE_ROLE_KEY || CONFIG.SUPABASE_ANON_KEY)
);

export const supabase = isConfigured
  ? createClient(
      CONFIG.SUPABASE_URL,
      CONFIG.SUPABASE_SERVICE_ROLE_KEY || CONFIG.SUPABASE_ANON_KEY,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false
        },
        realtime: {
          transport: WebSocket
        }
      }
    )
  : null;

export function isSupabaseConfigured() {
  return isConfigured;
}

export async function testSupabaseConnection() {
  if (!isConfigured || !supabase) {
    return false;
  }

  try {
    const { data, error } = await supabase.from('users').select('id').limit(1);
    if (error) {
      console.warn('Supabase test connection error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Supabase connection exception:', err.message);
    return false;
  }
}
