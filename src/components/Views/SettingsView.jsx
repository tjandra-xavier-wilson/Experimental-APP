// src/components/Views/SettingsView.jsx
import React, { useState, useEffect } from 'react';
import {
  Wrench,
  User,
  GraduationCap,
  School,
  BookOpen,
  Mail,
  ShieldCheck,
  Save,
  LogOut,
  Database,
  CheckCircle2,
  Play,
  Pause,
  Flame,
  RotateCcw,
  Sparkles,
  Clock,
  Zap,
  Check,
} from 'lucide-react';
import {
  startFocusMode,
  stopFocusMode,
  resetFocusMode,
  getLiveFocusMetrics,
  formatDurationHMS,
  FOCUS_MODE_EVENT,
  checkAndAwardStreak,
  getFocusModeState,
} from '../../services/focusModeService';

export const SettingsView = ({
  user,
  onUpdateUser,
  onLogout,
  onOpenSupabaseModal,
}) => {
  const [name, setName] = useState(user?.name || 'Tjandra Wilson');
  const [email, setEmail] = useState(user?.email || 'tjandrawilson@mutiarabangsa.sch.id');
  const [educationLevel, setEducationLevel] = useState(user?.educationLevel || 'Siswa SMA/SMK');
  const [schoolName, setSchoolName] = useState(user?.schoolName || 'Mutiara Bangsa 2 School');
  const [major, setMajor] = useState(user?.major || 'IPA');
  const [semester, setSemester] = useState(user?.semester || 'Kelas 11');
  const [studyPreference, setStudyPreference] = useState(user?.studyPreference || 'balanced');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Live Focus Mode Metrics
  const [focusMetrics, setFocusMetrics] = useState(getLiveFocusMetrics());

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setEducationLevel(user.educationLevel || 'Siswa SMA/SMK');
      setSchoolName(user.schoolName || '');
      setMajor(user.major || '');
      setSemester(user.semester || '');
      setStudyPreference(user.studyPreference || 'balanced');
    }
  }, [user]);

  // Live timer tick & cross-component sync
  useEffect(() => {
    const handleUpdate = () => {
      setFocusMetrics(getLiveFocusMetrics());
    };

    window.addEventListener(FOCUS_MODE_EVENT, handleUpdate);
    const interval = setInterval(() => {
      const live = getLiveFocusMetrics();
      setFocusMetrics(live);
      if (live.isActive && live.todaySeconds >= 3600 && !live.isStreakAwarded) {
        checkAndAwardStreak(getFocusModeState());
      }
    }, 1000);

    return () => {
      window.removeEventListener(FOCUS_MODE_EVENT, handleUpdate);
      clearInterval(interval);
    };
  }, []);

  const handleToggleFocus = () => {
    if (focusMetrics.isActive) {
      stopFocusMode();
    } else {
      startFocusMode();
    }
  };

  const handleResetFocus = () => {
    if (window.confirm('Reset waktu fokus hari ini kembali ke 0?')) {
      resetFocusMode();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onUpdateUser) {
      onUpdateUser({
        ...user,
        name: name.trim(),
        email: email.trim(),
        educationLevel,
        schoolName: schoolName.trim(),
        major: major.trim(),
        semester: semester.trim(),
        studyPreference,
        avatarBg: user?.avatarBg || '#8E94F2',
        status: user?.status || 'Sedang Belajar 📚',
        bio: user?.bio || '',
        target: user?.target || '',
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* 1. Header Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #334155 0%, #1E293B 100%)',
          borderRadius: 'var(--radius-lg)',
          padding: '26px 32px',
          color: '#FFFFFF',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '18px',
          boxShadow: '0 8px 24px -4px rgba(30, 41, 59, 0.25)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                padding: '4px 10px',
                borderRadius: '20px',
                fontSize: '0.76rem',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              <Wrench size={13} color="#94A3B8" /> PENGATURAN AKUN & FOKUS
            </span>
            <span style={{ fontSize: '0.78rem', color: '#94A3B8' }}>
              · Profil & Mode Belajar
            </span>
          </div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, margin: '0 0 6px 0', letterSpacing: '-0.5px' }}>
            Pengaturan & Mode Belajar
          </h1>
          <p style={{ margin: 0, fontSize: '0.88rem', color: '#CBD5E1', maxWidth: '580px' }}>
            Sesuaikan identitas profil dan aktifkan Mode Fokus untuk mendongkrak durasi belajar, skor fokus, dan study streak harian.
          </p>
        </div>

        <button
          type="button"
          onClick={onLogout}
          style={{
            backgroundColor: '#FEE2E2',
            color: '#DC2626',
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
          <LogOut size={16} /> Keluar Akun
        </button>
      </div>

      {/* 2. Main Grid: Kolom Kiri (Profil & Mode Fokus) & Kolom Kanan (Form Edit Profil) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '22px',
          alignItems: 'start',
        }}
      >
        {/* Kolom Kiri: Profil Overview & Mode Fokus Belajar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
          {/* Card Profil Overview */}
          <div className="study-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', backgroundColor: '#FFFFFF' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--pastel-lavender-bg)',
                  border: '3px solid var(--pastel-lavender-border)',
                  color: 'var(--pastel-lavender-text)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.4rem',
                  fontWeight: 800,
                  flexShrink: 0,
                }}
              >
                {name
                  .split(' ')
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join('')
                  .toUpperCase()}
              </div>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 4px 0', color: 'var(--text-main)' }}>
                  {name}
                </h2>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{email}</div>
                <div style={{ display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
                  <span className="pastel-badge badge-lavender" style={{ fontSize: '0.72rem' }}>
                    {educationLevel}
                  </span>
                  <span className="pastel-badge badge-mint" style={{ fontSize: '0.72rem' }}>
                    {major}
                  </span>
                </div>
              </div>
            </div>

            <div style={{ width: '100%', height: '1px', backgroundColor: 'var(--border-subtle)', margin: '4px 0' }} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.84rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Institusi Pendidikan:</span>
                <strong>{schoolName}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Tingkat / Semester:</span>
                <strong>{semester}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Mode Belajar:</span>
                <strong>{studyPreference === 'balanced' ? 'Seimbang (Rekomendasi)' : studyPreference}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Sinkronisasi Cloud:</span>
                <strong style={{ fontFamily: 'monospace', fontSize: '0.76rem', color: '#10B981' }}>Aktif 🟢</strong>
              </div>
            </div>

            <button
              type="button"
              onClick={onOpenSupabaseModal}
              className="btn-secondary"
              style={{ marginTop: 'auto', padding: '9px 14px', fontSize: '0.82rem', justifyContent: 'center' }}
            >
              <Database size={15} /> Atur Kredensial Supabase Cloud
            </button>
          </div>

          {/* Card Mode Fokus / Mode Belajar Dekat Profile */}
          <div
            className="study-card"
            style={{
              padding: '24px',
              backgroundColor: '#FFFFFF',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              border: focusMetrics.isActive ? '2px solid #818CF8' : '1px solid var(--border-subtle)',
              boxShadow: focusMetrics.isActive ? '0 10px 25px -5px rgba(99, 102, 241, 0.2)' : 'var(--shadow-sm)',
              transition: 'all 200ms ease',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    backgroundColor: focusMetrics.isActive ? '#EEF2FF' : 'var(--pastel-lavender-bg)',
                    color: focusMetrics.isActive ? '#4F46E5' : 'var(--pastel-lavender-text)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 200ms ease',
                  }}
                >
                  <Flame size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                    Mode Fokus / Mode Belajar
                  </h3>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                    Live Stopwatch & Tracker Streak
                  </span>
                </div>
              </div>

              {/* Status Pill */}
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 10px',
                  borderRadius: '20px',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  backgroundColor: focusMetrics.isActive ? '#DCFCE7' : '#F1F5F9',
                  color: focusMetrics.isActive ? '#15803D' : '#64748B',
                }}
              >
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: focusMetrics.isActive ? '#22C55E' : '#94A3B8',
                    boxShadow: focusMetrics.isActive ? '0 0 8px #22C55E' : 'none',
                  }}
                />
                {focusMetrics.isActive ? 'Sesi Berjalan' : 'Standby'}
              </span>
            </div>

            {/* Big Timer Display */}
            <div
              style={{
                backgroundColor: focusMetrics.isActive ? '#F5F3FF' : '#F8FAFC',
                border: '1px solid',
                borderColor: focusMetrics.isActive ? '#DDD6FE' : '#E2E8F0',
                borderRadius: '16px',
                padding: '18px 20px',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase', color: focusMetrics.isActive ? '#6D28D9' : '#64748B' }}>
                {focusMetrics.isActive ? 'Waktu Sesi Berjalan' : 'Waktu Fokus Hari Ini'}
              </span>
              <div
                style={{
                  fontSize: '2.5rem',
                  fontWeight: 900,
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                  color: focusMetrics.isActive ? '#4338CA' : '#1E293B',
                  letterSpacing: '2px',
                  lineHeight: 1,
                }}
              >
                {formatDurationHMS(focusMetrics.todaySeconds)}
              </div>
              <span style={{ fontSize: '0.78rem', color: '#64748B' }}>
                Total Fokus Hari Ini: <strong>{focusMetrics.todayFocusMinutes} Menit</strong> ({focusMetrics.todayFocusHours} Jam)
              </span>
            </div>

            {/* Streak Target Progress towards 1 hour */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
                <span style={{ fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Flame size={14} color="#EF4444" /> Syarat Streak +1 Hari (Min. 1 Jam):
                </span>
                <span style={{ fontWeight: 800, color: focusMetrics.todaySeconds >= 3600 ? '#15803D' : '#4F46E5' }}>
                  {Math.min(60, focusMetrics.todayFocusMinutes)} / 60 Menit ({focusMetrics.streakProgressPercent}%)
                </span>
              </div>

              {/* Progress Bar */}
              <div style={{ width: '100%', height: '8px', backgroundColor: '#F1F5F9', borderRadius: '4px', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${focusMetrics.streakProgressPercent}%`,
                    height: '100%',
                    background: focusMetrics.todaySeconds >= 3600 ? 'linear-gradient(90deg, #10B981 0%, #059669 100%)' : 'linear-gradient(90deg, #818CF8 0%, #6366F1 100%)',
                    borderRadius: '4px',
                    transition: 'width 0.4s ease',
                  }}
                />
              </div>

              <p style={{ margin: 0, fontSize: '0.74rem', color: 'var(--text-muted)', lineHeight: 1.45 }}>
                {focusMetrics.todaySeconds >= 3600
                  ? '🎉 Target 1 jam terpenuhi! Streak Anda telah berhasil bertambah +1 hari untuk hari ini.'
                  : `Kurang ${Math.max(0, 60 - focusMetrics.todayFocusMinutes)} menit lagi dalam mode fokus untuk mengklaim +1 hari study streak hari ini.`}
              </p>
            </div>

            {/* Dampak Langsung ke Produktivitas Chips */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '8px',
                backgroundColor: '#F8FAFC',
                padding: '10px 12px',
                borderRadius: '12px',
                border: '1px solid #E2E8F0',
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: 600 }}>Durasi Belajar</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#4F46E5' }}>+{focusMetrics.todayFocusHours}j</div>
              </div>
              <div style={{ textAlign: 'center', borderLeft: '1px solid #E2E8F0', borderRight: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: 600 }}>Skor Fokus</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#D97706' }}>
                  +{Math.min(30, Math.round(focusMetrics.todayFocusHours * 10))}%
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: 600 }}>Study Streak</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: focusMetrics.todaySeconds >= 3600 ? '#15803D' : '#64748B' }}>
                  {focusMetrics.todaySeconds >= 3600 ? '+1 Hari 🎉' : 'Menunggu 1j'}
                </div>
              </div>
            </div>

            {/* Action Control Buttons */}
            <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
              {focusMetrics.isActive ? (
                <button
                  type="button"
                  onClick={handleToggleFocus}
                  style={{
                    flex: 1,
                    padding: '11px 16px',
                    borderRadius: '12px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
                    color: '#FFFFFF',
                    fontSize: '0.86rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 12px rgba(220, 38, 38, 0.25)',
                    transition: 'transform 150ms ease',
                  }}
                >
                  <Pause size={16} /> Jeda / Selesaikan Sesi
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleToggleFocus}
                  style={{
                    flex: 1,
                    padding: '11px 16px',
                    borderRadius: '12px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
                    color: '#FFFFFF',
                    fontSize: '0.86rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 14px rgba(79, 70, 229, 0.3)',
                    transition: 'transform 150ms ease',
                  }}
                >
                  <Play size={16} fill="#FFFFFF" /> Mulai Mode Fokus
                </button>
              )}

              {focusMetrics.todaySeconds > 0 && !focusMetrics.isActive && (
                <button
                  type="button"
                  onClick={handleResetFocus}
                  style={{
                    padding: '11px 14px',
                    borderRadius: '12px',
                    border: '1px solid #CBD5E1',
                    backgroundColor: '#FFFFFF',
                    color: '#64748B',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                  title="Reset sesi fokus hari ini"
                >
                  <RotateCcw size={15} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Right Form Editor */}
        <div className="study-card" style={{ padding: '26px', backgroundColor: '#FFFFFF' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 16px 0', color: 'var(--text-main)' }}>
            Perbarui Informasi Profil
          </h3>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>Nama Lengkap</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--border-subtle)', outline: 'none' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--border-subtle)', outline: 'none' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>Tingkatan</label>
                <select
                  value={educationLevel}
                  onChange={(e) => setEducationLevel(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--border-subtle)', outline: 'none', backgroundColor: '#FFFFFF' }}
                >
                  <option value="Siswa SMA/SMK">Siswa SMA/SMK</option>
                  <option value="Mahasiswa">Mahasiswa</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>Kelas / Semester</label>
                <input
                  type="text"
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  placeholder="Kelas 11 atau Semester 4"
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--border-subtle)', outline: 'none' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>Sekolah / Kampus</label>
              <input
                type="text"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--border-subtle)', outline: 'none' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>Jurusan / Program Studi</label>
              <input
                type="text"
                value={major}
                onChange={(e) => setMajor(e.target.value)}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--border-subtle)', outline: 'none' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
              {savedSuccess ? (
                <span style={{ color: '#10B981', fontWeight: 700, fontSize: '0.84rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={16} /> Perubahan berhasil disimpan!
                </span>
              ) : <span />}

              <button
                type="submit"
                className="btn-primary"
                style={{ padding: '9px 20px', fontSize: '0.85rem' }}
              >
                <Save size={15} /> Simpan Perubahan
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
