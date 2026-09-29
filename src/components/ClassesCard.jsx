// src/components/ClassesCard.jsx
import React from 'react';
import { BookOpen, Clock, ExternalLink, Plus, MapPin } from 'lucide-react';
import { getGoogleCalendarUrl } from '../services/calendarSync';

export const ClassesCard = ({
  schedules = [],
  currentDayOfWeek = new Date().getDay(),
  onOpenClassModal,
  selectedDateStr = new Date().toISOString().split('T')[0],
}) => {
  const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

  // Filter items for this day
  const dayClasses = schedules
    .filter((s) => Number(s.dayOfWeek) === currentDayOfWeek)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  return (
    <div
      className="study-card"
      style={{
        padding: '20px',
        backgroundColor: '#FFFFFF',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '10px',
              backgroundColor: 'var(--pastel-lavender-bg)',
              color: 'var(--pastel-lavender-text)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <BookOpen size={17} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.05rem', margin: 0, fontWeight: 700 }}>
              Jadwal Perkuliahan / Kelas
            </h3>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              Hari {dayNames[currentDayOfWeek]}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="pastel-badge badge-lavender" style={{ fontSize: '0.72rem' }}>
            {dayClasses.length} sesi
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
          >
            <Plus size={13} /> Kelas
          </button>
        </div>
      </div>

      {/* Class List */}
      {dayClasses.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '28px 12px',
            color: 'var(--text-muted)',
            backgroundColor: 'var(--bg-card-subtle)',
            borderRadius: 'var(--radius-md)',
          }}
        >
          <p style={{ fontSize: '0.88rem', marginBottom: '8px' }}>
            Tidak ada jadwal kelas di hari {dayNames[currentDayOfWeek]} 🏖️
          </p>
          <button
            type="button"
            onClick={onOpenClassModal}
            className="btn-ghost"
            style={{ fontSize: '0.8rem', border: '1px dashed var(--border-subtle)' }}
          >
            + Tambah Jadwal Kelas Rutin
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {dayClasses.map((cls) => (
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
              }}
            >
              <div>
                <h4 style={{ fontSize: '0.92rem', margin: '0 0 3px 0', fontWeight: 700 }}>
                  {cls.courseName}
                </h4>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0 0 4px 0' }}>
                  Ruang: <strong>{cls.room || 'R. Kelas'}</strong> • Dosen: {cls.lecturer || '-'}
                </p>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.78rem',
                    color: 'var(--pastel-lavender-text)',
                    fontWeight: 600,
                  }}
                >
                  <Clock size={13} />
                  <span>{cls.startTime} - {cls.endTime} WIB</span>
                </div>
              </div>

              <a
                href={getGoogleCalendarUrl({ ...cls, dueDate: selectedDateStr })}
                target="_blank"
                rel="noreferrer"
                className="btn-ghost"
                style={{ padding: '6px', color: 'var(--text-muted)' }}
                title="Buka & Simpan di Google Calendar"
              >
                <ExternalLink size={16} />
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
