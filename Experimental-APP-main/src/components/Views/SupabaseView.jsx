import React, { useState } from 'react';
import {
  Database,
  CheckCircle2,
  RefreshCw,
  UploadCloud,
  DownloadCloud,
  ShieldCheck,
  Server,
  Smartphone,
  Laptop,
  Check,
  ExternalLink,
  Radio,
  AlertTriangle,
  Copy,
  Wrench,
} from 'lucide-react';
import {
  getSupabaseConfig,
  testSupabaseConnection,
  testRealtimeHealth,
} from '../../services/supabaseClient';
import { syncAllLocalDataToSupabase } from '../../services/supabaseService';
import { getUserData } from '../../services/storage';

export const SupabaseView = ({
  user,
  tasks = [],
  schedules = [],
  courses = [],
  friends = [],
  notes = [],
  realtimeStatus = 'CONNECTING',
  onRefreshData,
  onOpenSupabaseModal,
  onOpenConfigModal,
}) => {
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [testingRealtime, setTestingRealtime] = useState(false);
  const [realtimeTestResult, setRealtimeTestResult] = useState(null);
  const [copiedFixSql, setCopiedFixSql] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState(null);

  const config = getSupabaseConfig();
  const openModalHandler = onOpenConfigModal || onOpenSupabaseModal;

  const handleTestRealtime = async () => {
    setTestingRealtime(true);
    setRealtimeTestResult(null);
    try {
      const res = await testRealtimeHealth();
      setRealtimeTestResult(res);
    } catch (e) {
      setRealtimeTestResult({ healthy: false, message: e.message });
    } finally {
      setTestingRealtime(false);
    }
  };

  const handleCopyFixSql = () => {
    const fixSql = `-- ==========================================================
-- SUPABASE REALTIME REPAIR & STABILIZATION SCRIPT
-- ==========================================================
BEGIN;

-- 1. Set REPLICA IDENTITY FULL pada seluruh tabel agar UPDATE/DELETE dapat direplikasi tanpa error
ALTER TABLE public.profiles REPLICA IDENTITY FULL;
ALTER TABLE public.courses REPLICA IDENTITY FULL;
ALTER TABLE public.schedules REPLICA IDENTITY FULL;
ALTER TABLE public.tasks REPLICA IDENTITY FULL;
ALTER TABLE public.friends REPLICA IDENTITY FULL;
ALTER TABLE public.notes REPLICA IDENTITY FULL;

-- 2. Buat ulang publikasi supabase_realtime
DROP PUBLICATION IF EXISTS supabase_realtime;
CREATE PUBLICATION supabase_realtime;

-- 3. Tambahkan tabel ke publikasi realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.courses;
ALTER PUBLICATION supabase_realtime ADD TABLE public.schedules;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.friends;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notes;

COMMIT;`;
    navigator.clipboard.writeText(fixSql);
    setCopiedFixSql(true);
    setTimeout(() => setCopiedFixSql(false), 2500);
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await testSupabaseConnection();
      setTestResult(res);
    } catch (e) {
      setTestResult({ success: false, message: e.message });
    } finally {
      setTesting(false);
    }
  };

  const handleUploadAll = async () => {
    if (!user) return;
    setUploading(true);
    setUploadMsg(null);
    try {
      const localData = getUserData(user.id) || {};
      const res = await syncAllLocalDataToSupabase(user, localData);
      setUploadMsg({
        success: true,
        message: `Berhasil mengunggah ${res.tasksCount} tugas, ${res.schedulesCount} jadwal, dan ${res.coursesCount} mata kuliah ke Supabase Cloud!`,
      });
      if (onRefreshData) onRefreshData();
    } catch (e) {
      setUploadMsg({ success: false, message: `Upload gagal: ${e.message}` });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* 1. Header Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #047857 100%)',
          borderRadius: 'var(--radius-lg)',
          padding: '26px 32px',
          color: '#FFFFFF',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '18px',
          boxShadow: '0 8px 24px -4px rgba(15, 23, 42, 0.25)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span
              style={{
                backgroundColor: 'rgba(16, 185, 129, 0.25)',
                color: '#34D399',
                border: '1px solid #059669',
                padding: '4px 10px',
                borderRadius: '20px',
                fontSize: '0.76rem',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              <CheckCircle2 size={13} /> SUPABASE CLOUD SYNC AKTIF
            </span>
            <span style={{ fontSize: '0.78rem', color: '#94A3B8' }}>
              · PostgreSQL Cloud Database
            </span>
          </div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, margin: '0 0 6px 0', letterSpacing: '-0.5px' }}>
            Database Cloud & Multi-Perangkat
          </h1>
          <p style={{ margin: 0, fontSize: '0.88rem', color: '#CBD5E1', maxWidth: '580px' }}>
            Seluruh data tugas, kelas, dan profil tersimpan aman dan tersinkronisasi secara real-time antara Laptop, HP, dan tablet.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            onClick={handleUploadAll}
            disabled={uploading}
            style={{
              backgroundColor: '#10B981',
              color: '#FFFFFF',
              border: 'none',
              padding: '10px 18px',
              borderRadius: 'var(--radius-md)',
              fontWeight: 700,
              fontSize: '0.84rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
            }}
          >
            <UploadCloud size={16} className={uploading ? 'animate-spin' : ''} />
            {uploading ? 'Mengunggah...' : 'Upload Data Lokal'}
          </button>
          <button
            type="button"
            onClick={onOpenSupabaseModal}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              color: '#FFFFFF',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              padding: '10px 18px',
              borderRadius: 'var(--radius-md)',
              fontWeight: 700,
              fontSize: '0.84rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
            }}
          >
            <Database size={16} /> Pengaturan API
          </button>
        </div>
      </div>

      {/* 2. Status & Overview Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '18px',
        }}
      >
        {/* Status Koneksi */}
        <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>Status Koneksi</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: config.isConfigured ? '#10B981' : '#EF4444',
                boxShadow: '0 0 10px rgba(16, 185, 129, 0.6)',
              }}
            />
            <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)' }}>
              {config.isConfigured ? 'Terhubung (Online)' : 'Belum Terhubung'}
            </span>
          </div>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
            {config.url ? config.url.replace('https://', '') : 'Belum diatur'}
          </span>
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={testing}
            className="btn-secondary"
            style={{ marginTop: 'auto', padding: '6px 12px', fontSize: '0.78rem', justifyContent: 'center' }}
          >
            <RefreshCw size={13} className={testing ? 'animate-spin' : ''} />
            {testing ? 'Menguji Koneksi...' : 'Uji Koneksi Server'}
          </button>
        </div>

        {/* Multi-Device Sync Card */}
        <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>Sinkronisasi Lintas Perangkat</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10B981', fontWeight: 700, fontSize: '0.86rem' }}>
              <Laptop size={18} /> Laptop Aktif
            </div>
            <span style={{ color: 'var(--text-muted)' }}>↔</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10B981', fontWeight: 700, fontSize: '0.86rem' }}>
              <Smartphone size={18} /> HP Terhubung
            </div>
          </div>

          <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
            {realtimeStatus === 'SUBSCRIBED'
              ? 'Realtime WebSocket PostgreSQL aktif untuk pembaruan instan otomatis.'
              : realtimeStatus === 'FALLBACK_POLLING'
              ? 'Realtime Supabase degraded/unhealthy. Smart Polling Fallback aktif otomatis menjaga sinkronisasi.'
              : 'Sinkronisasi dual-mode (WebSocket + Smart Fallback Polling).'}
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {realtimeStatus === 'SUBSCRIBED' && (
              <div className="pastel-badge badge-mint" style={{ fontSize: '0.72rem' }}>
                🟢 Realtime WebSocket Aktif
              </div>
            )}
            {realtimeStatus === 'FALLBACK_POLLING' && (
              <div className="pastel-badge badge-peach" style={{ fontSize: '0.72rem', backgroundColor: '#FEF3C7', color: '#D97706', border: '1px solid #FCD34D' }}>
                🟡 Smart Polling Fallback Aktif
              </div>
            )}
            {(realtimeStatus === 'TIMED_OUT' || realtimeStatus === 'CHANNEL_ERROR') && (
              <div className="pastel-badge badge-peach" style={{ fontSize: '0.72rem' }}>
                🟠 Realtime Supabase Unhealthy
              </div>
            )}
            {realtimeStatus === 'CONNECTING' && (
              <div className="pastel-badge badge-lavender" style={{ fontSize: '0.72rem' }}>
                🔵 Menghubungkan Realtime...
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleTestRealtime}
            disabled={testingRealtime}
            className="btn-secondary"
            style={{ marginTop: 'auto', padding: '6px 12px', fontSize: '0.78rem', justifyContent: 'center' }}
          >
            <Radio size={13} className={testingRealtime ? 'animate-spin' : ''} />
            {testingRealtime ? 'Menguji Realtime...' : 'Diagnosa Realtime'}
          </button>
        </div>

        {/* Cloud Records Count */}
        <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>Total Data Cloud</span>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)' }}>
            {tasks.length + schedules.length + notes.length} <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-muted)' }}>Item Tersimpan</span>
          </div>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
            {tasks.length} Tugas · {schedules.length} Jadwal · {notes.length} Catatan
          </span>
          <button
            type="button"
            onClick={onRefreshData}
            className="btn-secondary"
            style={{ marginTop: 'auto', padding: '6px 12px', fontSize: '0.78rem', justifyContent: 'center' }}
          >
            <DownloadCloud size={13} /> Tarik Pembaruan dari Cloud
          </button>
        </div>
      </div>

      {/* Realtime Unhealthy Repair Banner */}
      {(realtimeStatus === 'FALLBACK_POLLING' ||
        realtimeStatus === 'TIMED_OUT' ||
        realtimeStatus === 'CHANNEL_ERROR' ||
        realtimeTestResult?.healthy === false) && (
        <div
          style={{
            padding: '16px 20px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: '#FFFBEB',
            border: '1px solid #FDE68A',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            boxShadow: '0 4px 12px rgba(245, 158, 11, 0.08)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: '#FEF3C7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#D97706',
                flexShrink: 0,
              }}
            >
              <AlertTriangle size={18} />
            </div>
            <div style={{ flex: 1 }}>
              <h4 style={{ margin: '0 0 4px 0', fontSize: '0.95rem', fontWeight: 700, color: '#92400E' }}>
                Layanan Realtime Supabase Berstatus Unhealthy
              </h4>
              <p style={{ margin: 0, fontSize: '0.82rem', color: '#B45309', lineHeight: 1.5 }}>
                Status <strong>Unhealthy</strong> pada Realtime Supabase terjadi karena logical replication PostgreSQL memerlukan konfigurasi <code>REPLICA IDENTITY FULL</code> dan refresh publikasi <code>supabase_realtime</code>.
                <br />
                ✅ <strong>Kabar Baik:</strong> Aplikasi ini telah dibekali <strong>Smart Polling Fallback</strong> sehingga tugas dan jadwal tetap tersinkronisasi otomatis antara Laptop dan HP!
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '4px' }}>
            <button
              type="button"
              onClick={handleCopyFixSql}
              className="btn-primary"
              style={{
                padding: '6px 14px',
                fontSize: '0.8rem',
                backgroundColor: '#D97706',
                borderColor: '#B45309',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              {copiedFixSql ? <Check size={14} /> : <Copy size={14} />}
              {copiedFixSql ? 'SQL Perbaikan Tersalin!' : 'Salin SQL Perbaikan Realtime'}
            </button>

            <button
              type="button"
              onClick={handleTestRealtime}
              disabled={testingRealtime}
              className="btn-secondary"
              style={{ padding: '6px 12px', fontSize: '0.8rem' }}
            >
              <RefreshCw size={13} className={testingRealtime ? 'animate-spin' : ''} />
              Uji Ulang Realtime
            </button>

            {openModalHandler && (
              <button
                type="button"
                onClick={openModalHandler}
                className="btn-ghost"
                style={{ padding: '6px 12px', fontSize: '0.8rem', color: '#92400E' }}
              >
                <Wrench size={13} style={{ marginRight: '4px' }} /> Panduan Langkah Lengkap
              </button>
            )}
          </div>
        </div>
      )}

      {/* Notifications from Realtime Test */}
      {realtimeTestResult && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: '8px',
            backgroundColor: realtimeTestResult.healthy ? '#F0FDF4' : '#FEF2F2',
            border: realtimeTestResult.healthy ? '1px solid #BBF7D0' : '1px solid #FECACA',
            color: realtimeTestResult.healthy ? '#15803D' : '#B91C1C',
            fontSize: '0.84rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          {realtimeTestResult.healthy ? <CheckCircle2 size={16} /> : <Radio size={16} />}
          <span>{realtimeTestResult.message}</span>
        </div>
      )}

      {/* Notifications from test / upload */}
      {testResult && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: '8px',
            backgroundColor: testResult.success ? '#F0FDF4' : '#FEF2F2',
            border: testResult.success ? '1px solid #BBF7D0' : '1px solid #FECACA',
            color: testResult.success ? '#15803D' : '#B91C1C',
            fontSize: '0.84rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          {testResult.success ? <CheckCircle2 size={16} /> : <Server size={16} />}
          <span>{testResult.message}</span>
        </div>
      )}

      {uploadMsg && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: '8px',
            backgroundColor: uploadMsg.success ? '#F0FDF4' : '#FEF2F2',
            border: uploadMsg.success ? '1px solid #BBF7D0' : '1px solid #FECACA',
            color: uploadMsg.success ? '#15803D' : '#B91C1C',
            fontSize: '0.84rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          {uploadMsg.success ? <CheckCircle2 size={16} /> : <Server size={16} />}
          <span>{uploadMsg.message}</span>
        </div>
      )}
    </div>
  );
};
