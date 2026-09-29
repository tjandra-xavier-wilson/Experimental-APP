// src/components/GreetingCard.jsx
import React from 'react';
import { Clock, CheckCircle2, Calendar, Sparkles } from 'lucide-react';

export const GreetingCard = ({ user, schedules = [] }) => {
  const todayDayOfWeek = new Date().getDay();

  // Find classes today
  const todayClasses = schedules
    .filter((s) => Number(s.dayOfWeek) === todayDayOfWeek)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  // Determine next upcoming class today
  const nowTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false });
  const nextClass = todayClasses.find((c) => c.endTime >= nowTime);

  const firstName = user?.name ? user.name.split(' ')[0] : 'Tjandra';

  return (
    <div
      style={{
        background: 'linear-gradient(135deg, #FFFFFF 0%, #F6F7FF 40%, #FFF8F5 100%)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-subtle)',
        padding: '24px 28px',
        boxShadow: 'var(--shadow-sm)',
        marginBottom: '22px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ maxWidth: '780px' }}>
          {/* Header Badges */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
            <span className="pastel-badge badge-lavender">
              ✨ Halo, {user?.name || 'Tjandra'}!
            </span>
            <span className="pastel-badge badge-mint">
              {user?.educationLevel === 'Siswa SMA/SMK' || user?.educationLevel === 'SMA'
                ? `Siswa ${user?.major || 'IPA'}`
                : `Mahasiswa ${user?.major || 'Informatika'}`}
            </span>
            <span className="pastel-badge badge-butter">
              {user?.semester || 'Semester 4'}
            </span>
          </div>

          {/* Large Title */}
          <h1 style={{ fontSize: '1.85rem', marginBottom: '6px', color: 'var(--text-main)', lineHeight: 1.25 }}>
            Semangat Belajar, {firstName}! 🌱
          </h1>

          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginBottom: '16px', lineHeight: 1.5 }}>
            Jurusan <strong>{user?.major || 'Teknik Informatika'}</strong> • {user?.semester || 'Semester 4'}. Nikmati proses belajarmu tanpa terburu-buru, satu fokus dalam satu waktu.
          </p>

          {/* Next Class Alert Banner */}
          {nextClass ? (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                background: 'var(--pastel-sky-bg)',
                border: '1px solid var(--pastel-sky-border)',
                color: 'var(--pastel-sky-text)',
                padding: '8px 16px',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.85rem',
                fontWeight: 500,
              }}
            >
              <Clock size={16} />
              <span>
                <strong>Kelas Hari Ini:</strong> {nextClass.courseName} ({nextClass.startTime} - {nextClass.endTime} WIB) di ruangan <strong>{nextClass.room}</strong>
              </span>
            </div>
          ) : (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                background: 'var(--pastel-mint-bg)',
                border: '1px solid var(--pastel-mint-border)',
                color: 'var(--pastel-mint-text)',
                padding: '8px 16px',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.85rem',
                fontWeight: 500,
              }}
            >
              <CheckCircle2 size={16} />
              <span>
                {todayClasses.length > 0
                  ? 'Semua jadwal perkuliahan hari ini sudah selesai. Waktunya istirahat atau review santai!'
                  : 'Tidak ada jadwal kelas tersisa untuk hari ini. Waktu luang untuk belajar mandiri!'}
              </span>
            </div>
          )}
        </div>

        {/* Date Display Pill on Right */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: '#FFFFFF',
            padding: '8px 14px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.82rem',
            color: 'var(--text-muted)',
            fontWeight: 600,
          }}
        >
          <Calendar size={15} color="var(--pastel-lavender-text)" />
          <span>
            {new Date().toLocaleDateString('id-ID', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </span>
        </div>
      </div>
    </div>
  );
};
