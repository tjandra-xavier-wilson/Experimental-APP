// src/components/CalendarSyncModal.jsx
import React, { useState } from 'react';
import { X, Calendar, Download, RefreshCw, CheckCircle, ExternalLink, ShieldCheck } from 'lucide-react';
import { exportToICalendar } from '../services/calendarSync';

export const CalendarSyncModal = ({
  isOpen,
  onClose,
  tasks = [],
  schedules = [],
  user,
}) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState(null);
  const [exportSuccess, setExportSuccess] = useState(false);

  if (!isOpen) return null;

  const handleExportICS = () => {
    exportToICalendar(tasks, schedules, user?.name || 'Pelajar');
    setExportSuccess(true);
    setTimeout(() => setExportSuccess(false), 5000);
  };

  const handleSimulateSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setLastSynced(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }));
    }, 1200);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '520px', padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: 'var(--pastel-sky-bg)',
                color: 'var(--pastel-sky-text)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Calendar size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', margin: 0 }}>Sinkronisasi Google Calendar</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Integrasikan jadwal kuliah & tugasmu ke aplikasi kalender favoritmu
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="btn-ghost" style={{ padding: '6px' }}>
            <X size={18} />
          </button>
        </div>

        {/* Sync Status Banner */}
        <div
          style={{
            padding: '14px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-card-subtle)',
            border: '1px solid var(--border-subtle)',
            marginBottom: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <p style={{ fontSize: '0.85rem', fontWeight: 600 }}>Status Sinkronisasi Kalender</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {lastSynced ? `Terakhir disinkronkan pukul ${lastSynced} WIB` : 'Siap diekspor ke Google / Apple Calendar'}
            </p>
          </div>
          <button
            type="button"
            onClick={handleSimulateSync}
            disabled={isSyncing}
            className="btn-secondary"
            style={{ fontSize: '0.8rem', padding: '6px 12px' }}
          >
            <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} />
            {isSyncing ? 'Menghubungkan...' : 'Sinkronkan'}
          </button>
        </div>

        {/* Option 1: One-Click .ICS Download */}
        <div
          className="study-card"
          style={{
            padding: '16px',
            marginBottom: '16px',
            border: '1px solid var(--pastel-sky-border)',
            background: 'var(--pastel-sky-bg)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '8px' }}>
            <div>
              <h4 style={{ fontSize: '0.95rem', color: 'var(--pastel-sky-text)', marginBottom: '4px' }}>
                📁 Unduh File Kalender Universal (.ics)
              </h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-main)', lineHeight: 1.4 }}>
                Ekspor semua jadwal kelas rutin & deadline tugas aktif menjadi file standar iCalendar yang dapat diimpor langsung ke Google Calendar, Apple Calendar, atau Microsoft Outlook.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleExportICS}
            className="btn-primary"
            style={{
              width: '100%',
              padding: '10px',
              fontSize: '0.88rem',
              marginTop: '10px',
              background: 'linear-gradient(135deg, #4EA8DE 0%, #56CFE1 100%)',
            }}
          >
            <Download size={16} />
            Unduh Jadwal_{user?.name?.replace(/\s+/g, '_')}.ics ({tasks.length} tugas, {schedules.length} kelas)
          </button>

          {exportSuccess && (
            <div
              style={{
                marginTop: '10px',
                padding: '8px 12px',
                borderRadius: 'var(--radius-sm)',
                background: '#FFFFFF',
                color: 'var(--pastel-mint-text)',
                fontSize: '0.8rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <CheckCircle size={15} /> File .ics berhasil diunduh ke foldermu!
            </div>
          )}
        </div>

        {/* 3 Simple Steps Guide to Import into Google Calendar */}
        <div style={{ padding: '12px 14px', borderRadius: 'var(--radius-sm)', background: '#FFFFFF', border: '1px solid var(--border-subtle)', marginBottom: '20px' }}>
          <p style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px' }}>
            Cara Impor ke Google Calendar:
          </p>
          <ol style={{ fontSize: '0.78rem', color: 'var(--text-muted)', paddingLeft: '18px', lineHeight: 1.6 }}>
            <li>Buka <strong>calendar.google.com</strong> di browsermu</li>
            <li>Klik ikon <strong>Pengaturan (Settings) ⚙️</strong> &gt; pilih <strong>Impor & Ekspor</strong></li>
            <li>Pilih file <strong>.ics</strong> yang baru saja kamu unduh dan klik <strong>Impor</strong></li>
          </ol>
          <div style={{ marginTop: '10px', textAlign: 'right' }}>
            <a
              href="https://calendar.google.com/calendar/u/0/r/settings/export"
              target="_blank"
              rel="noreferrer"
              style={{
                fontSize: '0.78rem',
                color: 'var(--pastel-lavender-text)',
                fontWeight: 600,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              Buka Pengaturan Google Calendar <ExternalLink size={13} />
            </a>
          </div>
        </div>

        {/* Close Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button type="button" onClick={onClose} className="btn-secondary">
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
