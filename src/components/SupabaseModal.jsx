// src/components/SupabaseModal.jsx
import React, { useState, useEffect } from 'react';
import {
  X,
  Database,
  Cloud,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Copy,
  Check,
  RefreshCw,
  UploadCloud,
  Key,
  Globe,
  FileCode,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import {
  getSupabaseConfig,
  saveSupabaseConfig,
  clearSupabaseConfig,
  testSupabaseConnection,
} from '../services/supabaseClient';
import { syncAllLocalDataToSupabase } from '../services/supabaseService';
import { getUserData } from '../services/storage';

export const SupabaseModal = ({ isOpen, onClose, user, onDataSynced }) => {
  const [url, setUrl] = useState('');
  const [anonKey, setAnonKey] = useState('');
  const [isConfigured, setIsConfigured] = useState(false);
  const [configSource, setConfigSource] = useState('none');

  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState(null);

  const [copiedSql, setCopiedSql] = useState(false);
  const [activeTab, setActiveTab] = useState('config'); // 'config' | 'guide' | 'schema'

  // Load active config on modal open
  useEffect(() => {
    if (isOpen) {
      const cfg = getSupabaseConfig();
      setUrl(cfg.url);
      setAnonKey(cfg.anonKey);
      setIsConfigured(cfg.isConfigured);
      setConfigSource(cfg.source);
      setTestResult(null);
      setSyncResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Handle test connection
  const handleTestConnection = async () => {
    if (!url.trim() || !anonKey.trim()) {
      setTestResult({
        success: false,
        message: 'Harap isi Supabase Project URL dan Anon Key terlebih dahulu.',
      });
      return;
    }

    setTesting(true);
    setTestResult(null);
    try {
      const res = await testSupabaseConnection(url, anonKey);
      setTestResult(res);
    } catch (err) {
      setTestResult({
        success: false,
        message: `Terjadi galat pengujian: ${err.message}`,
      });
    } finally {
      setTesting(false);
    }
  };

  // Handle save & connect
  const handleSaveAndConnect = async () => {
    if (!url.trim() || !anonKey.trim()) {
      setTestResult({
        success: false,
        message: 'URL dan Key tidak boleh kosong.',
      });
      return;
    }

    setTesting(true);
    const test = await testSupabaseConnection(url, anonKey);
    setTesting(false);

    if (!test.success && !test.schemaNeeded) {
      setTestResult(test);
      return;
    }

    saveSupabaseConfig(url, anonKey);
    const cfg = getSupabaseConfig();
    setIsConfigured(cfg.isConfigured);
    setConfigSource(cfg.source);
    setTestResult({
      success: true,
      message: test.schemaNeeded
        ? 'Kredensial disimpan! Jangan lupa jalankan SQL Schema di tab "SQL Schema".'
        : 'Kredensial disimpan & berhasil terhubung ke Supabase Cloud!',
    });
  };

  // Handle disconnect
  const handleDisconnect = () => {
    clearSupabaseConfig();
    setUrl('');
    setAnonKey('');
    setIsConfigured(false);
    setConfigSource('none');
    setTestResult({
      success: true,
      message: 'Koneksi Supabase diputuskan. Aplikasi sekarang berjalan dalam Mode Offline (Local Storage).',
    });
  };

  // Sync local data to Supabase
  const handleSyncLocalData = async () => {
    if (!user) {
      setSyncResult({ success: false, message: 'Tidak ada sesi pengguna aktif.' });
      return;
    }

    setSyncing(true);
    setSyncResult(null);

    try {
      const localData = getUserData(user.id) || {};
      const res = await syncAllLocalDataToSupabase(user, localData);
      setSyncResult({
        success: true,
        message: `Sinkronisasi berhasil! ${res.tasksCount} tugas, ${res.schedulesCount} jadwal, dan ${res.coursesCount} mata kuliah berhasil diunggah ke Supabase Cloud.`,
      });
      if (onDataSynced) onDataSynced();
    } catch (err) {
      setSyncResult({
        success: false,
        message: `Sinkronisasi gagal: ${err.message}`,
      });
    } finally {
      setSyncing(false);
    }
  };

  // Copy Schema SQL
  const handleCopySql = () => {
    const sqlScript = `-- CODESTACK SCHEDULE SUPABASE SCHEMA
CREATE TABLE IF NOT EXISTS public.profiles (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE,
    name TEXT NOT NULL,
    education_level TEXT DEFAULT 'Siswa SMA/SMK',
    school_name TEXT DEFAULT 'Mutiara Bangsa 2 School',
    major TEXT DEFAULT 'IPA',
    semester TEXT DEFAULT 'Kelas 11',
    study_preference TEXT DEFAULT 'balanced',
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.courses (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    code TEXT,
    lecturer TEXT,
    room TEXT,
    color TEXT DEFAULT '#8E94F2',
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.schedules (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    course_id TEXT,
    course_name TEXT NOT NULL,
    day_of_week INTEGER NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    room TEXT,
    color TEXT DEFAULT '#8E94F2',
    lecturer TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.tasks (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    course_id TEXT,
    course_name TEXT,
    due_date TEXT,
    due_time TEXT,
    priority TEXT DEFAULT 'medium',
    difficulty TEXT DEFAULT 'medium',
    estimated_minutes INTEGER DEFAULT 45,
    category TEXT DEFAULT 'Tugas & PR',
    color TEXT DEFAULT '#8E94F2',
    is_completed BOOLEAN DEFAULT FALSE,
    status TEXT DEFAULT 'in_progress',
    completed_at TIMESTAMPTZ,
    ai_recommended_slot JSONB,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.friends (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    initials TEXT,
    avatar_bg TEXT DEFAULT '#8E94F2',
    major TEXT,
    semester TEXT,
    progress INTEGER DEFAULT 0,
    completed_tasks INTEGER DEFAULT 0,
    total_tasks INTEGER DEFAULT 0,
    status TEXT DEFAULT 'Sedang Belajar 📚',
    nearest_task JSONB,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.notes (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT,
    content TEXT,
    date TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friends ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

-- Allow Operations
DROP POLICY IF EXISTS "Allow all profile operations" ON public.profiles;
CREATE POLICY "Allow all profile operations" ON public.profiles FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Allow all courses operations" ON public.courses;
CREATE POLICY "Allow all courses operations" ON public.courses FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Allow all schedules operations" ON public.schedules;
CREATE POLICY "Allow all schedules operations" ON public.schedules FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Allow all tasks operations" ON public.tasks;
CREATE POLICY "Allow all tasks operations" ON public.tasks FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Allow all friends operations" ON public.friends;
CREATE POLICY "Allow all friends operations" ON public.friends FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Allow all notes operations" ON public.notes;
CREATE POLICY "Allow all notes operations" ON public.notes FOR ALL USING (true) WITH CHECK (true);
`;

    navigator.clipboard.writeText(sqlScript);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1100 }}>
      <div
        className="modal-content"
        style={{
          maxWidth: '620px',
          width: '95%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          padding: '24px',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-xl)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                backgroundColor: isConfigured ? '#ECFDF5' : '#F5F3FF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: isConfigured ? '1px solid #A7F3D0' : '1px solid #DDD6FE',
              }}
            >
              <Database size={20} color={isConfigured ? '#10B981' : '#8E94F2'} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ margin: 0, fontSize: '1.18rem', fontWeight: 700 }}>Supabase Cloud Database</h3>
                <span
                  className={`pastel-badge ${isConfigured ? 'badge-mint' : 'badge-peach'}`}
                  style={{ fontSize: '0.72rem', padding: '2px 8px' }}
                >
                  {isConfigured ? '🟢 Terhubung' : '🟡 Belum Terhubung'}
                </span>
              </div>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Sinkronisasi data real-time, backup cloud, dan multi-device support
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="btn-ghost" style={{ padding: '6px' }}>
            <X size={20} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div
          style={{
            display: 'flex',
            gap: '6px',
            background: 'var(--bg-card-subtle)',
            padding: '4px',
            borderRadius: 'var(--radius-md)',
            marginBottom: '18px',
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab('config')}
            style={{
              flex: 1,
              padding: '7px 12px',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              background: activeTab === 'config' ? '#FFFFFF' : 'transparent',
              color: activeTab === 'config' ? 'var(--pastel-lavender-text)' : 'var(--text-muted)',
              fontWeight: 600,
              fontSize: '0.84rem',
              cursor: 'pointer',
              boxShadow: activeTab === 'config' ? 'var(--shadow-sm)' : 'none',
              transition: 'all var(--transition-fast)',
            }}
          >
            ⚙️ Konfigurasi
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('guide')}
            style={{
              flex: 1,
              padding: '7px 12px',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              background: activeTab === 'guide' ? '#FFFFFF' : 'transparent',
              color: activeTab === 'guide' ? 'var(--pastel-lavender-text)' : 'var(--text-muted)',
              fontWeight: 600,
              fontSize: '0.84rem',
              cursor: 'pointer',
              boxShadow: activeTab === 'guide' ? 'var(--shadow-sm)' : 'none',
              transition: 'all var(--transition-fast)',
            }}
          >
            📖 Panduan Setup (3 Langkah)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('schema')}
            style={{
              flex: 1,
              padding: '7px 12px',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              background: activeTab === 'schema' ? '#FFFFFF' : 'transparent',
              color: activeTab === 'schema' ? 'var(--pastel-lavender-text)' : 'var(--text-muted)',
              fontWeight: 600,
              fontSize: '0.84rem',
              cursor: 'pointer',
              boxShadow: activeTab === 'schema' ? 'var(--shadow-sm)' : 'none',
              transition: 'all var(--transition-fast)',
            }}
          >
            💻 SQL Schema
          </button>
        </div>

        {/* Tab 1: Configuration Form */}
        {activeTab === 'config' && (
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Status card */}
            <div
              style={{
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: isConfigured ? '#F0FDF4' : '#FFFBEB',
                border: isConfigured ? '1px solid #BBF7D0' : '1px solid #FDE68A',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {isConfigured ? (
                  <CheckCircle2 size={20} color="#16A34A" />
                ) : (
                  <AlertCircle size={20} color="#D97706" />
                )}
                <div>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: '0.88rem', color: isConfigured ? '#15803D' : '#B45309' }}>
                    {isConfigured ? 'Supabase Siap & Terhubung' : 'Aplikasi Menggunakan Local Storage'}
                  </p>
                  <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: isConfigured ? '#166534' : '#92400E' }}>
                    {isConfigured
                      ? `Sumber kredensial: ${configSource === 'env' ? 'File .env' : 'Live Setting'}`
                      : 'Data tersimpan di browser. Masukkan kredensial Supabase untuk mengaktifkan cloud database.'}
                  </p>
                </div>
              </div>

              {isConfigured && (
                <button
                  type="button"
                  onClick={handleDisconnect}
                  className="btn-ghost"
                  style={{ fontSize: '0.76rem', color: '#DC2626', padding: '4px 8px' }}
                >
                  Putuskan
                </button>
              )}
            </div>

            {/* Form Fields */}
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
                <Globe size={14} color="var(--pastel-lavender-text)" />
                Supabase Project URL
              </label>
              <input
                type="text"
                placeholder="https://xyzabcdefghijklmnop.supabase.co"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '0.86rem',
                  fontFamily: 'monospace',
                  outline: 'none',
                }}
              />
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                Dapat ditemukan di Supabase Dashboard → Settings → API → Project URL
              </span>
            </div>

            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
                <Key size={14} color="var(--pastel-peach-text)" />
                Supabase Anon (Public) Key
              </label>
              <textarea
                rows={2}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                value={anonKey}
                onChange={(e) => setAnonKey(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '0.82rem',
                  fontFamily: 'monospace',
                  outline: 'none',
                  resize: 'vertical',
                }}
              />
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                Kunci publik aman untuk frontend browser (anon public)
              </span>
            </div>

            {/* Test result alert */}
            {testResult && (
              <div
                style={{
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: testResult.success ? '#F0FDF4' : '#FEF2F2',
                  border: testResult.success ? '1px solid #BBF7D0' : '1px solid #FECACA',
                  fontSize: '0.82rem',
                  color: testResult.success ? '#15803D' : '#991B1B',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                {testResult.success ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                <span>{testResult.message}</span>
              </div>
            )}

            {/* Sync result alert */}
            {syncResult && (
              <div
                style={{
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: syncResult.success ? '#EFF6FF' : '#FEF2F2',
                  border: syncResult.success ? '1px solid #BFDBFE' : '1px solid #FECACA',
                  fontSize: '0.82rem',
                  color: syncResult.success ? '#1D4ED8' : '#991B1B',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                {syncResult.success ? <Cloud size={16} /> : <AlertCircle size={16} />}
                <span>{syncResult.message}</span>
              </div>
            )}

            {/* Action buttons */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: 'auto', paddingTop: '10px' }}>
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={testing}
                className="btn-secondary"
                style={{ padding: '8px 14px', fontSize: '0.84rem' }}
              >
                <RefreshCw size={14} className={testing ? 'animate-spin' : ''} />
                {testing ? 'Menguji...' : 'Uji Koneksi'}
              </button>

              {isConfigured && (
                <button
                  type="button"
                  onClick={handleSyncLocalData}
                  disabled={syncing}
                  className="btn-secondary"
                  style={{
                    padding: '8px 14px',
                    fontSize: '0.84rem',
                    background: 'var(--pastel-mint-bg)',
                    borderColor: 'var(--pastel-mint-border)',
                    color: 'var(--pastel-mint-text)',
                  }}
                >
                  <UploadCloud size={14} className={syncing ? 'animate-spin' : ''} />
                  {syncing ? 'Mengunggah...' : 'Upload Data Lokal ke Cloud'}
                </button>
              )}

              <button
                type="button"
                onClick={handleSaveAndConnect}
                disabled={testing}
                className="btn-primary"
                style={{ padding: '8px 18px', fontSize: '0.84rem', marginLeft: 'auto' }}
              >
                <Cloud size={15} />
                Simpan & Hubungkan
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Step-by-Step Guide */}
        {activeTab === 'guide' && (
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div
              style={{
                background: 'var(--bg-card-subtle)',
                padding: '14px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <span className="pastel-badge badge-lavender" style={{ width: '22px', height: '22px', borderRadius: '50%', padding: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>1</span>
                <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem' }}>Buat Project di Supabase (Gratis)</p>
              </div>
              <p style={{ margin: '4px 0 8px 30px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Buka <a href="https://supabase.com" target="_blank" rel="noreferrer" style={{ color: 'var(--pastel-lavender-text)', textDecoration: 'underline' }}>supabase.com</a>, daftar/masuk akun GitHub, lalu klik <strong>"New Project"</strong>. Pilih region terdekat (misal: <em>Singapore</em>).
              </p>
            </div>

            <div
              style={{
                background: 'var(--bg-card-subtle)',
                padding: '14px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <span className="pastel-badge badge-lavender" style={{ width: '22px', height: '22px', borderRadius: '50%', padding: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>2</span>
                <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem' }}>Jalankan Script SQL Database Schema</p>
              </div>
              <p style={{ margin: '4px 0 8px 30px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Di dashboard Supabase, buka menu <strong>SQL Editor</strong> (ikon terminal di sidebar kiri). Klik <strong>"New query"</strong>, lalu paste script SQL dari tab <em>"SQL Schema"</em> di atas dan klik <strong>Run</strong>. Semua tabel (profiles, tasks, schedules, dll) akan dibuat otomatis!
              </p>
            </div>

            <div
              style={{
                background: 'var(--bg-card-subtle)',
                padding: '14px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <span className="pastel-badge badge-lavender" style={{ width: '22px', height: '22px', borderRadius: '50%', padding: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>3</span>
                <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem' }}>Salin Project URL & Anon Key</p>
              </div>
              <p style={{ margin: '4px 0 8px 30px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Buka menu <strong>Project Settings → API</strong>. Salin <strong>Project URL</strong> dan <strong>anon public</strong> key ke tab <em>"Konfigurasi"</em> modal ini atau simpan di file <code>.env</code> project.
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'auto' }}>
              <button
                type="button"
                onClick={() => setActiveTab('config')}
                className="btn-primary"
                style={{ padding: '8px 16px', fontSize: '0.84rem' }}
              >
                Mulai Hubungkan Sekarang →
              </button>
            </div>
          </div>
        )}

        {/* Tab 3: SQL Schema Copy */}
        {activeTab === 'schema' && (
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                File ini juga tersimpan di <code>supabase/schema.sql</code> di dalam project Anda.
              </p>
              <button
                type="button"
                onClick={handleCopySql}
                className="btn-secondary"
                style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                {copiedSql ? <Check size={14} color="#10B981" /> : <Copy size={14} />}
                {copiedSql ? 'Tersalin ke Clipboard!' : 'Salin Seluruh Script SQL'}
              </button>
            </div>

            <pre
              style={{
                flex: 1,
                maxHeight: '340px',
                overflowY: 'auto',
                backgroundColor: '#1E1E2E',
                color: '#CDD6F4',
                padding: '14px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.78rem',
                fontFamily: 'monospace',
                lineHeight: '1.45',
              }}
            >
{`-- CODESTACK SCHEDULE SUPABASE SCHEMA
-- Jalankan di: Supabase Dashboard -> SQL Editor -> New Query -> Run

CREATE TABLE IF NOT EXISTS public.profiles (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE,
    name TEXT NOT NULL,
    education_level TEXT DEFAULT 'Siswa SMA/SMK',
    school_name TEXT DEFAULT 'Mutiara Bangsa 2 School',
    major TEXT DEFAULT 'IPA',
    semester TEXT DEFAULT 'Kelas 11',
    study_preference TEXT DEFAULT 'balanced',
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.courses (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    code TEXT,
    lecturer TEXT,
    room TEXT,
    color TEXT DEFAULT '#8E94F2',
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.schedules (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    course_id TEXT,
    course_name TEXT NOT NULL,
    day_of_week INTEGER NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    room TEXT,
    color TEXT DEFAULT '#8E94F2',
    lecturer TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.tasks (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    course_id TEXT,
    course_name TEXT,
    due_date TEXT,
    due_time TEXT,
    priority TEXT DEFAULT 'medium',
    difficulty TEXT DEFAULT 'medium',
    estimated_minutes INTEGER DEFAULT 45,
    category TEXT DEFAULT 'Tugas & PR',
    color TEXT DEFAULT '#8E94F2',
    is_completed BOOLEAN DEFAULT FALSE,
    status TEXT DEFAULT 'in_progress',
    completed_at TIMESTAMPTZ,
    ai_recommended_slot JSONB,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.friends (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    initials TEXT,
    avatar_bg TEXT DEFAULT '#8E94F2',
    major TEXT,
    semester TEXT,
    progress INTEGER DEFAULT 0,
    completed_tasks INTEGER DEFAULT 0,
    total_tasks INTEGER DEFAULT 0,
    status TEXT DEFAULT 'Sedang Belajar 📚',
    nearest_task JSONB,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.notes (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT,
    content TEXT,
    date TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friends ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

-- Allow Operations
DROP POLICY IF EXISTS "Allow all profile operations" ON public.profiles;
CREATE POLICY "Allow all profile operations" ON public.profiles FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Allow all courses operations" ON public.courses;
CREATE POLICY "Allow all courses operations" ON public.courses FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Allow all schedules operations" ON public.schedules;
CREATE POLICY "Allow all schedules operations" ON public.schedules FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Allow all tasks operations" ON public.tasks;
CREATE POLICY "Allow all tasks operations" ON public.tasks FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Allow all friends operations" ON public.friends;
CREATE POLICY "Allow all friends operations" ON public.friends FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Allow all notes operations" ON public.notes;
CREATE POLICY "Allow all notes operations" ON public.notes FOR ALL USING (true) WITH CHECK (true);`}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
