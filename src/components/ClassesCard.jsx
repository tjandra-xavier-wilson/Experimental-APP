// src/components/ClassesCard.jsx
import React, { useState } from 'react';
import {
  BookOpen,
  Clock,
  ExternalLink,
  Plus,
  MapPin,
  Calendar,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { getGoogleCalendarUrl } from '../services/calendarSync';

export const ClassesCard = ({
  schedules = [],
  currentDayOfWeek = new Date().getDay(),
  onOpenClassModal,
  onNavigateToClasses,
  selectedDateStr = new Date().toISOString().split('T')[0],
}) => {
  const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const dayShortNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

  // View filter mode: 'today' | 'all' | 0..6 (specific day number)
  const [activeFilter, setActiveFilter] = useState('today');

  const todayNum = Number(currentDayOfWeek);

  // Active day index to display
  const targetDayNum =
    activeFilter === 'today'
      ? todayNum
      : activeFilter === 'all'
      ? null
      : Number(activeFilter);

  // Filter schedules
  const displayedClasses = schedules
    .filter((s) => targetDayNum === null || Number(s.dayOfWeek) === targetDayNum)
    .sort((a, b) => {
      if (Number(a.dayOfWeek) !== Number(b.dayOfWeek)) {
        return Number(a.dayOfWeek) - Number(b.dayOfWeek);
      }
      return (a.startTime || '').localeCompare(b.startTime || '');
    });

  const todayClasses = schedules.filter((s) => Number(s.dayOfWeek) === todayNum);

  // Find next upcoming routine class across the week
  const findNextUpcomingClass = () => {
    if (schedules.length === 0) return null;
    for (let offset = 1; offset <= 7; offset++) {
      const checkDay = (todayNum + offset) % 7;
      const match = schedules
        .filter((s) => Number(s.dayOfWeek) === checkDay)
        .sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''))[0];
      if (match) {
        return { ...match, dayName: dayNames[checkDay], dayOffset: offset };
      }
    }
    return null;
  };

  const nextUpcomingClass = findNextUpcomingClass();

  // Helper to check if a specific day has classes (for dot indicator)
  const dayHasClasses = (dayIdx) => schedules.some((s) => Number(s.dayOfWeek) === dayIdx);

  return (
    <div
      className="study-card"
      style={{
        padding: '20px',
        backgroundColor: '#FFFFFF',
      }}
    >
      {/* 1. Header with Title and Global Action */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '14px',
          flexWrap: 'wrap',
          gap: '10px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '10px',
              backgroundColor: 'var(--pastel-lavender-bg)',
              color: 'var(--pastel-lavender-text)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <BookOpen size={18} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.05rem', margin: 0, fontWeight: 700 }}>
              Jadwal Perkuliahan / Kelas
            </h3>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              {activeFilter === 'today'
                ? `Hari Ini (${dayNames[todayNum]})`
                : activeFilter === 'all'
                ? `Semua Jadwal (${schedules.length} Sesi Terdaftar)`
                : `Hari ${dayNames[targetDayNum]}`}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="pastel-badge badge-lavender" style={{ fontSize: '0.72rem' }}>
            {displayedClasses.length} sesi
          </span>
          <button
            type="button"
            onClick={onOpenClassModal}
            className="btn-ghost"
            style={{
              fontSize: '0.78rem',
              padding: '5px 10px',
              backgroundColor: 'var(--bg-card-subtle)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
            }}
            title="Tambah Jadwal Kelas Rutin"
          >
            <Plus size={13} /> Kelas
          </button>
        </div>
      </div>

      {/* 2. Interactive Day Filter Pills */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          overflowX: 'auto',
          paddingBottom: '10px',
          marginBottom: '12px',
          scrollbarWidth: 'none',
        }}
      >
        <button
          type="button"
          onClick={() => setActiveFilter('today')}
          style={{
            padding: '5px 11px',
            borderRadius: '16px',
            fontSize: '0.75rem',
            fontWeight: 700,
            border: activeFilter === 'today' ? '1.5px solid var(--pastel-lavender-text)' : '1px solid var(--border-subtle)',
            backgroundColor: activeFilter === 'today' ? 'var(--pastel-lavender-bg)' : '#FFFFFF',
            color: activeFilter === 'today' ? 'var(--pastel-lavender-text)' : 'var(--text-muted)',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            transition: 'all 120ms ease',
          }}
        >
          Hari Ini ({todayClasses.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter('all')}
          style={{
            padding: '5px 11px',
            borderRadius: '16px',
            fontSize: '0.75rem',
            fontWeight: 700,
            border: activeFilter === 'all' ? '1.5px solid #2563EB' : '1px solid var(--border-subtle)',
            backgroundColor: activeFilter === 'all' ? '#EFF6FF' : '#FFFFFF',
            color: activeFilter === 'all' ? '#1D4ED8' : 'var(--text-muted)',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            transition: 'all 120ms ease',
          }}
        >
          Semua Hari ({schedules.length})
        </button>

        {/* Days from Senin (1) to Minggu (0) */}
        {[1, 2, 3, 4, 5, 6, 0].map((dIdx) => {
          const hasCls = dayHasClasses(dIdx);
          const isSelected = activeFilter === String(dIdx);
          return (
            <button
              key={dIdx}
              type="button"
              onClick={() => setActiveFilter(String(dIdx))}
              style={{
                padding: '4px 9px',
                borderRadius: '14px',
                fontSize: '0.74rem',
                fontWeight: 600,
                border: isSelected ? '1.5px solid #4F46E5' : '1px solid var(--border-subtle)',
                backgroundColor: isSelected ? '#EEF2FF' : '#FFFFFF',
                color: isSelected ? '#4338CA' : hasCls ? 'var(--text-main)' : 'var(--text-light)',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                whiteSpace: 'nowrap',
                transition: 'all 120ms ease',
              }}
              title={`Jadwal Hari ${dayNames[dIdx]}`}
            >
              <span>{dayShortNames[dIdx]}</span>
              {hasCls && (
                <span
                  style={{
                    width: '5px',
                    height: '5px',
                    borderRadius: '50%',
                    backgroundColor: isSelected ? '#4338CA' : '#8E94F2',
                  }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* 3. Empty State with Smart Upcoming Class Notice */}
      {displayedClasses.length === 0 ? (
        <div
          style={{
            padding: '20px 16px',
            color: 'var(--text-muted)',
            backgroundColor: 'var(--bg-card-subtle)',
            borderRadius: 'var(--radius-md)',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          <div>
            <p style={{ fontSize: '0.88rem', margin: '0 0 4px 0', fontWeight: 600, color: 'var(--text-main)' }}>
              Tidak ada jadwal kelas di hari {dayNames[targetDayNum !== null ? targetDayNum : todayNum]} 🏖️
            </p>
            <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', margin: 0 }}>
              {schedules.length > 0
                ? `Kamu memiliki ${schedules.length} jadwal sesi kelas pada hari lainnya.`
                : 'Belum ada jadwal kelas yang ditambahkan.'}
            </p>
          </div>

          {/* Next upcoming class banner if schedules exist */}
          {nextUpcomingClass && (
            <div
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid var(--pastel-lavender-border)',
                borderLeft: `4px solid ${nextUpcomingClass.color || 'var(--pastel-lavender-text)'}`,
                borderRadius: 'var(--radius-sm)',
                padding: '10px 14px',
                textAlign: 'left',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '10px',
                boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                  <span
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      backgroundColor: 'var(--pastel-lavender-bg)',
                      color: 'var(--pastel-lavender-text)',
                      padding: '2px 6px',
                      borderRadius: '4px',
                    }}
                  >
                    KULIAH TERDEKAT · {nextUpcomingClass.dayName.toUpperCase()}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    {nextUpcomingClass.startTime} - {nextUpcomingClass.endTime} WIB
                  </span>
                </div>
                <div style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  {nextUpcomingClass.courseName || nextUpcomingClass.name}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  Ruang: {nextUpcomingClass.room || 'Kelas'} • Dosen: {nextUpcomingClass.lecturer || '-'}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveFilter(String(nextUpcomingClass.dayOfWeek))}
                style={{
                  border: 'none',
                  backgroundColor: 'var(--pastel-lavender-bg)',
                  color: 'var(--pastel-lavender-text)',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  whiteSpace: 'nowrap',
                }}
              >
                Lihat <ArrowRight size={12} />
              </button>
            </div>
          )}

          {/* Quick buttons */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {schedules.length > 0 && activeFilter !== 'all' && (
              <button
                type="button"
                onClick={() => setActiveFilter('all')}
                className="btn-secondary"
                style={{ fontSize: '0.78rem', padding: '6px 12px' }}
              >
                Lihat Seluruh {schedules.length} Kelas
              </button>
            )}
            <button
              type="button"
              onClick={onOpenClassModal}
              className="btn-ghost"
              style={{ fontSize: '0.78rem', border: '1px dashed var(--border-subtle)', padding: '6px 12px' }}
            >
              + Tambah Jadwal Kelas
            </button>
          </div>
        </div>
      ) : (
        /* 4. Class List */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {displayedClasses.map((cls) => (
            <div
              key={cls.id}
              style={{
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--pastel-lavender-bg)',
                border: '1px solid var(--pastel-lavender-border)',
                borderLeft: `5px solid ${cls.color || 'var(--pastel-lavender-text)'}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                  <span
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      backgroundColor: 'rgba(255, 255, 255, 0.7)',
                      color: 'var(--pastel-lavender-text)',
                      padding: '1px 6px',
                      borderRadius: '4px',
                    }}
                  >
                    {dayNames[Number(cls.dayOfWeek)]}
                  </span>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '0.74rem',
                      color: 'var(--pastel-lavender-text)',
                      fontWeight: 600,
                    }}
                  >
                    <Clock size={12} />
                    <span>{cls.startTime} - {cls.endTime} WIB</span>
                  </div>
                </div>

                <h4 style={{ fontSize: '0.92rem', margin: '0 0 3px 0', fontWeight: 700, color: 'var(--text-main)' }}>
                  {cls.courseName || cls.name}
                </h4>
                <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', margin: 0 }}>
                  Ruang: <strong>{cls.room || 'R. Kelas'}</strong> • Dosen: {cls.lecturer || '-'}
                </p>
              </div>

              <a
                href={getGoogleCalendarUrl({ ...cls, dueDate: selectedDateStr })}
                target="_blank"
                rel="noreferrer"
                className="btn-ghost"
                style={{ padding: '6px', color: 'var(--text-muted)', flexShrink: 0 }}
                title="Buka & Simpan di Google Calendar"
              >
                <ExternalLink size={16} />
              </a>
            </div>
          ))}

          {/* Quick link to full classes page */}
          {onNavigateToClasses && (
            <button
              type="button"
              onClick={onNavigateToClasses}
              style={{
                border: 'none',
                background: 'transparent',
                color: 'var(--pastel-lavender-text)',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
                padding: '4px 0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                marginTop: '4px',
              }}
            >
              Kelola & Lihat Jadwal Kelas Lengkap di Menu Sidebar <ArrowRight size={13} />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ClassesCard;
