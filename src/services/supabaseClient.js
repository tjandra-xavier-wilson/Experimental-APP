// src/services/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) ||
  'https://dpxdmmbopgzobtxydvny.supabase.co';

const SUPABASE_ANON_KEY =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRweGRtbWJvcGd6b2J0eHlkdm55Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA2ODk5NTAsImV4cCI6MjEwNjI2NTk1MH0.EMu_jojd3jLRlQ5kbVqdzJvfvLrBd1Sb_QNTtHzxowE';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
