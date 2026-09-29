// src/components/Navbar.jsx
import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Sparkles,
  Wifi,
  WifiOff,
  Bell,
  LogOut,
  CalendarDays,
  User,
  ExternalLink,
  Plus,
} from 'lucide-react';

import { ICTLogo } from './ICTLogo';

export const Navbar = ({
  user,
  currentView,
  onViewChange,
  onOpenTaskModal,
  onOpenClassModal,
  onOpenCalendarSync,
  onOpenAIRecommender,
  onLogout,
  reminders = [],
}) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(reminders.filter((r) => !r.isRead).length);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    setUnreadCount(reminders.filter((r) => !r.isRead).length);
  }, [reminders]);

  const isSMA = user?.educationLevel === 'Siswa SMA/SMK' || user?.educationLevel === 'SMA';

  return (
    <header
      style={{
        background: '#FFFFFF',
        borderBottom: '1px solid var(--border-subtle)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '12px 28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          flexWrap: 'wrap',
        }}
      >
        {/* CodeStack Schedule Brand & Personal Student Info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <ICTLogo size={38} showSubtext={false} />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="pastel-badge badge-lavender" style={{ fontSize: '0.72rem', padding: '2px 8px' }}>
                {isSMA ? 'Siswa SMA/SMK' : 'Mahasiswa'}
              </span>
              <span className="pastel-badge badge-mint" style={{ fontSize: '0.72rem', padding: '2px 8px' }}>
                {user?.major || 'IPA'}
              </span>
              {user?.schoolName && (
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                  • {user.schoolName}
                </span>
              )}
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
              {user ? `${user.semester || 'Kelas 11'} · Integrated Learning Space` : 'Platform Belajar & Manajemen Jadwal'}
            </p>
          </div>
        </div>

        {/* View Switcher: Harian / Mingguan / Bulanan */}
        <div
          style={{
            display: 'flex',
            background: 'var(--bg-card-subtle)',
            padding: '3px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <button
            type="button"
            onClick={() => onViewChange('daily')}
            style={{
              padding: '6px 14px',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              background: currentView === 'daily' ? '#FFFFFF' : 'transparent',
              color: currentView === 'daily' ? 'var(--pastel-lavender-text)' : 'var(--text-muted)',
              fontWeight: 600,
              fontSize: '0.85rem',
              boxShadow: currentView === 'daily' ? 'var(--shadow-sm)' : 'none',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
            }}
          >
            Harian
          </button>
          <button
            type="button"
            onClick={() => onViewChange('weekly')}
            style={{
              padding: '6px 14px',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              background: currentView === 'weekly' ? '#FFFFFF' : 'transparent',
              color: currentView === 'weekly' ? 'var(--pastel-lavender-text)' : 'var(--text-muted)',
              fontWeight: 600,
              fontSize: '0.85rem',
              boxShadow: currentView === 'weekly' ? 'var(--shadow-sm)' : 'none',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
            }}
          >
            Mingguan
          </button>
          <button
            type="button"
            onClick={() => onViewChange('monthly')}
            style={{
              padding: '6px 14px',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              background: currentView === 'monthly' ? '#FFFFFF' : 'transparent',
              color: currentView === 'monthly' ? 'var(--pastel-lavender-text)' : 'var(--text-muted)',
              fontWeight: 600,
              fontSize: '0.85rem',
              boxShadow: currentView === 'monthly' ? 'var(--shadow-sm)' : 'none',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
            }}
          >
            Bulanan
          </button>
        </div>

        {/* Right Action Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Offline Mode Status Pill */}
          <div
            className={`pastel-badge ${isOnline ? 'badge-mint' : 'badge-peach'}`}
            title={isOnline ? 'Terhubung dengan jaringan (Data tersimpan lokal & online)' : 'Bekerja dalam Mode Offline (Data tersimpan di perangkat)'}
            style={{ cursor: 'help', fontSize: '0.75rem' }}
          >
            {isOnline ? <Wifi size={13} /> : <WifiOff size={13} />}
            <span>{isOnline ? 'Online Ready' : 'Mode Offline'}</span>
          </div>

          {/* AI Study Recommendation Trigger */}
          <button
            type="button"
            onClick={onOpenAIRecommender}
            className="btn-secondary"
            style={{
              padding: '7px 12px',
              fontSize: '0.85rem',
              background: 'var(--pastel-lavender-bg)',
              color: 'var(--pastel-lavender-text)',
              borderColor: 'var(--pastel-lavender-border)',
            }}
            title="Dapatkan rekomendasi waktu belajar terbaik dari AI"
          >
            <Sparkles size={15} />
            <span style={{ display: 'inline' }}>AI StudyMate</span>
          </button>

          {/* Google Calendar Sync Modal Trigger */}
          <button
            type="button"
            onClick={onOpenCalendarSync}
            className="btn-secondary"
            style={{ padding: '7px 12px', fontSize: '0.85rem' }}
            title="Sinkronisasi & Ekspor ke Google Calendar"
          >
            <Calendar size={15} />
            <span style={{ display: 'inline' }}>Google Sync</span>
          </button>

          {/* Quick Add Dropdown / Buttons */}
          <button
            type="button"
            onClick={onOpenTaskModal}
            className="btn-primary"
            style={{ padding: '7px 14px', fontSize: '0.85rem' }}
          >
            <Plus size={16} />
            <span>Tambah Tugas</span>
          </button>

          {/* Notification Bell Dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => setShowNotifications(!showNotifications)}
              className="btn-ghost"
              style={{ padding: '8px', borderRadius: '50%', position: 'relative' }}
              title="Notifikasi Pengingat"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '4px',
                    right: '4px',
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: 'var(--pastel-peach-text)',
                  }}
                />
              )}
            </button>

            {/* Notification Drawer */}
            {showNotifications && (
              <div
                className="study-card"
                style={{
                  position: 'absolute',
                  right: 0,
                  top: '110%',
                  width: '300px',
                  padding: '14px',
                  zIndex: 60,
                  boxShadow: 'var(--shadow-lg)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>Pengingat & Notifikasi</span>
                  <span className="pastel-badge badge-lavender" style={{ fontSize: '0.7rem' }}>
                    {reminders.length} catatan
                  </span>
                </div>
                {reminders.length === 0 ? (
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', padding: '12px 0' }}>
                    Belum ada pengingat baru 🎉
                  </p>
                ) : (
                  <div style={{ maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {reminders.map((r) => (
                      <div
                        key={r.id}
                        style={{
                          padding: '8px 10px',
                          borderRadius: 'var(--radius-sm)',
                          background: 'var(--bg-card-subtle)',
                          fontSize: '0.8rem',
                          borderLeft: '3px solid var(--pastel-lavender-text)',
                        }}
                      >
                        <p style={{ fontWeight: 600 }}>{r.title}</p>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>
                          ⏰ {r.targetDate} {r.targetTime}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* User Profile & Logout */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: '4px' }}>
            <button
              type="button"
              onClick={onLogout}
              className="btn-ghost"
              style={{ padding: '7px 10px', fontSize: '0.82rem', color: 'var(--text-muted)' }}
              title="Keluar dari akun"
            >
              <LogOut size={15} />
              <span>Keluar</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
