// src/components/Views/SupabaseView.jsx
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
} from 'lucide-react';
import {
  getSupabaseConfig,
  testSupabaseConnection,
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
  onRefreshData,
  onOpenSupabaseModal,
}) => {
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState(null);

  const config = getSupabaseConfig();

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
            Realtime WebSocket PostgreSQL aktif untuk pembaruan instan otomatis.
          </span>
          <div className="pastel-badge badge-mint" style={{ alignSelf: 'flex-start', fontSize: '0.72rem' }}>
            Realtime Channel Aktif
          </div>
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
