// src/services/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const CONFIG_STORAGE_KEY_URL = 'studycal_supabase_url';
const CONFIG_STORAGE_KEY_KEY = 'studycal_supabase_anon_key';

export const DEFAULT_SUPABASE_URL = 'https://dpxdmmbopgzobtxydvny.supabase.co';
export const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRweGRtbWJvcGd6b2J0eHlkdm55Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA2ODk5NTAsImV4cCI6MjEwNjI2NTk1MH0.EMu_jojd3jLRlQ5kbVqdzJvfvLrBd1Sb_QNTtHzxowE';

/**
 * Normalizes Supabase URL by stripping quotes, whitespace, and trailing slashes
 */
export const cleanSupabaseUrl = (rawUrl) => {
  if (!rawUrl) return '';
  let url = rawUrl.trim();
  if ((url.startsWith('"') && url.endsWith('"')) || (url.startsWith("'") && url.endsWith("'"))) {
    url = url.slice(1, -1).trim();
  }
  url = url.replace(/\/rest\/v1\/?$/i, '');
  url = url.replace(/\/+$/, '');
  return url;
};

const sanitizeKey = (rawKey) => {
  if (!rawKey) return '';
  let key = rawKey.trim();
  if ((key.startsWith('"') && key.endsWith('"')) || (key.startsWith("'") && key.endsWith("'"))) {
    key = key.slice(1, -1).trim();
  }
  return key;
};

/**
 * Returns currently active Supabase credentials with robust fallback.
 */
export const getSupabaseConfig = () => {
  let localUrl = null;
  let localKey = null;

  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localUrl = window.localStorage.getItem(CONFIG_STORAGE_KEY_URL);
      localKey = window.localStorage.getItem(CONFIG_STORAGE_KEY_KEY);
    }
  } catch (e) {
    console.warn('localStorage read error:', e);
  }

  const envUrl =
    typeof import.meta !== 'undefined' ? import.meta.env?.VITE_SUPABASE_URL : null;
  const envKey =
    typeof import.meta !== 'undefined' ? import.meta.env?.VITE_SUPABASE_ANON_KEY : null;

  const chosenUrl =
    cleanSupabaseUrl(localUrl) ||
    cleanSupabaseUrl(envUrl) ||
    DEFAULT_SUPABASE_URL;

  const chosenKey =
    sanitizeKey(localKey) ||
    sanitizeKey(envKey) ||
    DEFAULT_SUPABASE_ANON_KEY;

  const isConfigured = Boolean(
    chosenUrl &&
      chosenKey &&
      !chosenUrl.includes('your-project-id') &&
      !chosenKey.includes('your-anon-key') &&
      (chosenUrl.startsWith('https://') || chosenUrl.startsWith('http://'))
  );

  return {
    url: chosenUrl,
    anonKey: chosenKey,
    isConfigured,
    source: localUrl ? 'localStorage' : envUrl ? 'env' : 'default',
  };
};

/**
 * Determines whether Supabase is properly configured.
 */
export const isSupabaseConfigured = () => {
  return getSupabaseConfig().isConfigured;
};

// Singleton client cache
let cachedClient = null;
let lastClientKey = '';

/**
 * Returns the Supabase client instance.
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

export const supabase = getSupabase() || createClient(DEFAULT_SUPABASE_URL, DEFAULT_SUPABASE_ANON_KEY);

/**
 * Save custom credentials to localStorage for live interactive switching.
 */
export const saveSupabaseConfig = (url, anonKey) => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      if (url) window.localStorage.setItem(CONFIG_STORAGE_KEY_URL, cleanSupabaseUrl(url));
      if (anonKey) window.localStorage.setItem(CONFIG_STORAGE_KEY_KEY, sanitizeKey(anonKey));
    }
  } catch (e) {
    console.warn('localStorage save error:', e);
  }
  cachedClient = null;
  lastClientKey = '';
  return getSupabase();
};

/**
 * Clear custom credentials from localStorage (revert to .env or default).
 */
export const clearSupabaseConfig = () => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(CONFIG_STORAGE_KEY_URL);
      window.localStorage.removeItem(CONFIG_STORAGE_KEY_KEY);
    }
  } catch (e) {}
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
      const sanitizedKey = sanitizeKey(overrideKey);
      client = createClient(sanitizedUrl, sanitizedKey);
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
    const { data, error } = await client.from('profiles').select('id').limit(1);

    if (error) {
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
