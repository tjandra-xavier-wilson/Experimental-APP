// src/services/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const CONFIG_STORAGE_KEY_URL = 'studycal_supabase_url';
const CONFIG_STORAGE_KEY_KEY = 'studycal_supabase_anon_key';

/**
 * Normalizes Supabase URL by stripping trailing slashes or subpaths like /rest/v1
 */
export const cleanSupabaseUrl = (rawUrl) => {
  if (!rawUrl) return '';
  let url = rawUrl.trim();
  url = url.replace(/\/rest\/v1\/?$/i, '');
  url = url.replace(/\/+$/, '');
  return url;
};

/**
 * Returns currently active Supabase credentials from .env or localStorage override.
 */
export const getSupabaseConfig = () => {
  const localUrl = localStorage.getItem(CONFIG_STORAGE_KEY_URL);
  const localKey = localStorage.getItem(CONFIG_STORAGE_KEY_KEY);

  const envUrl = import.meta.env.VITE_SUPABASE_URL;
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  const url = cleanSupabaseUrl(localUrl || envUrl || '');
  const anonKey = (localKey || envKey || '').trim();

  const isConfigured = Boolean(
    url &&
    anonKey &&
    !url.includes('your-project-id') &&
    !anonKey.includes('your-anon-key') &&
    (url.startsWith('https://') || url.startsWith('http://'))
  );

  return {
    url,
    anonKey,
    isConfigured,
    source: localUrl ? 'localStorage' : envUrl ? 'env' : 'none',
  };
};

/**
 * Determines whether Supabase is properly configured.
 */
export const isSupabaseConfigured = () => {
  return getSupabaseConfig().isConfigured;
};

// Singleton instance
let cachedClient = null;
let lastClientKey = '';

/**
 * Returns the Supabase client instance or null if not configured.
 */
export const getSupabase = () => {
  const { url, anonKey, isConfigured } = getSupabaseConfig();
  if (!isConfigured) return null;

  const currentKey = `${url}:${anonKey}`;
  if (cachedClient && lastClientKey === currentKey) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
    lastClientKey = currentKey;
    return cachedClient;
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
    return null;
  }
};

export const supabase = getSupabase();

/**
 * Save custom credentials to localStorage for live interactive switching.
 */
export const saveSupabaseConfig = (url, anonKey) => {
  if (url) localStorage.setItem(CONFIG_STORAGE_KEY_URL, cleanSupabaseUrl(url));
  if (anonKey) localStorage.setItem(CONFIG_STORAGE_KEY_KEY, anonKey.trim());
  cachedClient = null;
  lastClientKey = '';
  return getSupabase();
};

/**
 * Clear custom credentials from localStorage (revert to .env or none).
 */
export const clearSupabaseConfig = () => {
  localStorage.removeItem(CONFIG_STORAGE_KEY_URL);
  localStorage.removeItem(CONFIG_STORAGE_KEY_KEY);
  cachedClient = null;
  lastClientKey = '';
};

/**
 * Tests connection with the active Supabase instance.
 */
export const testSupabaseConnection = async (overrideUrl, overrideKey) => {
  let client;
  if (overrideUrl && overrideKey) {
    try {
      const sanitizedUrl = cleanSupabaseUrl(overrideUrl);
      client = createClient(sanitizedUrl, overrideKey.trim());
    } catch (e) {
      return { success: false, message: `URL atau Key tidak valid: ${e.message}` };
    }
  } else {
    client = getSupabase();
  }

  if (!client) {
    return {
      success: false,
      message: 'Supabase belum dikonfigurasi. Masukkan Project URL dan Anon Key.',
    };
  }

  try {
    // Try to query the profiles table
    const { data, error } = await client.from('profiles').select('id').limit(1);

    if (error) {
      // Check if it's a table not found error (meaning connection is good, but schema hasn't run)
      if (error.code === '42P01' || error.message?.includes('does not exist')) {
        return {
          success: true,
          schemaNeeded: true,
          message:
            'Koneksi ke Supabase berhasil! Namun tabel belum dibuat. Jalankan script SQL schema di Supabase SQL Editor.',
        };
      }
      return {
        success: false,
        message: `Koneksi gagal: ${error.message} (Code: ${error.code || 'unknown'})`,
      };
    }

    return {
      success: true,
      schemaNeeded: false,
      message: 'Koneksi ke Supabase Cloud berhasil & database siap digunakan!',
      dataCount: data?.length || 0,
    };
  } catch (err) {
    return {
      success: false,
      message: `Gagal menghubungi server Supabase: ${err.message}`,
    };
  }
};
