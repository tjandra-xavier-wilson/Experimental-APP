// src/components/Views/DailyView.jsx
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Clock, Plus, BookOpen, CheckSquare, Sparkles, ExternalLink, Calendar as CalIcon } from 'lucide-react';
import { getGoogleCalendarUrl } from '../../services/calendarSync';

export const DailyView = ({
  tasks = [],
  schedules = [],
  onToggleTask,
  onOpenTaskModal,
  onOpenClassModal,
  onSelectTaskForAI,
}) => {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const formatDateStr = (d) => d.toISOString().split('T')[0];
  const currentDateStr = formatDateStr(selectedDate);
  const currentDayOfWeek = selectedDate.getDay();

  // Navigation handlers
  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d);
  };

  const handleToday = () => {
    setSelectedDate(new Date());
  };

  // Day name in Indonesian
  const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const formattedDayTitle = `${dayNames[currentDayOfWeek]}, ${selectedDate.getDate()} ${monthNames[selectedDate.getMonth()]} ${selectedDate.getFullYear()}`;

  // Filter items for this day
  const dayClasses = schedules
    .filter((s) => Number(s.dayOfWeek) === currentDayOfWeek)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const dayTasks = tasks.filter((t) => t.dueDate === currentDateStr);

  return (
    <div>
      {/* Date Header Control */}
      <div
        className="study-card"
        style={{
          padding: '14px 20px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button type="button" onClick={handlePrevDay} className="btn-secondary" style={{ padding: '6px 10px' }}>
            <ChevronLeft size={16} />
          </button>
          <button type="button" onClick={handleToday} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.85rem' }}>
            Hari Ini
          </button>
          <button type="button" onClick={handleNextDay} className="btn-secondary" style={{ padding: '6px 10px' }}>
            <ChevronRight size={16} />
          </button>
          <h2 style={{ fontSize: '1.25rem', margin: 0 }}>{formattedDayTitle}</h2>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button type="button" onClick={onOpenTaskModal} className="btn-primary" style={{ fontSize: '0.82rem', padding: '7px 12px' }}>
            <Plus size={15} /> Tambah Agenda
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {/* Left Column: Scheduled Classes */}
        <div className="study-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BookOpen size={18} color="var(--pastel-lavender-text)" />
              <h3 style={{ fontSize: '1.05rem' }}>Jadwal Perkuliahan / Kelas</h3>
            </div>
            <span className="pastel-badge badge-lavender">{dayClasses.length} sesi</span>
          </div>

          {dayClasses.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--text-muted)' }}>
              <p style={{ fontSize: '0.9rem', marginBottom: '8px' }}>Tidak ada jadwal kelas di hari {dayNames[currentDayOfWeek]} 🏖️</p>
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {dayClasses.map((cls) => (
                <div
                  key={cls.id}
                  style={{
                    padding: '14px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--pastel-lavender-bg)',
                    border: '1px solid var(--pastel-lavender-border)',
                    borderLeft: `5px solid ${cls.color || 'var(--pastel-lavender-text)'}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                  }}
                >
                  <div>
                    <h4 style={{ fontSize: '0.95rem', marginBottom: '4px' }}>{cls.courseName}</h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                      Ruangan: <strong>{cls.room || 'R. Kelas'}</strong> • Dosen: {cls.lecturer || '-'}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--pastel-lavender-text)', fontWeight: 600 }}>
                      <Clock size={14} />
                      <span>{cls.startTime} - {cls.endTime} WIB</span>
                    </div>
                  </div>

                  <a
                    href={getGoogleCalendarUrl({ ...cls, dueDate: currentDateStr })}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-ghost"
                    style={{ padding: '6px', color: 'var(--text-muted)' }}
                    title="Buka di Google Calendar"
                  >
                    <ExternalLink size={15} />
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Deadlines & Study Tasks */}
        <div className="study-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckSquare size={18} color="var(--pastel-mint-text)" />
              <h3 style={{ fontSize: '1.05rem' }}>Tenggat & Agenda Tugas</h3>
            </div>
            <span className="pastel-badge badge-mint">{dayTasks.length} tugas</span>
          </div>

          {dayTasks.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--text-muted)' }}>
              <p style={{ fontSize: '0.9rem', marginBottom: '8px' }}>Bebas tugas untuk tanggal ini! ✨</p>
              <button
                type="button"
                onClick={onOpenTaskModal}
                className="btn-ghost"
                style={{ fontSize: '0.8rem', border: '1px dashed var(--border-subtle)' }}
              >
                + Tambah Tugas / Catatan
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {dayTasks.map((t) => (
                <div
                  key={t.id}
                  style={{
                    padding: '14px',
                    borderRadius: 'var(--radius-md)',
                    background: t.isCompleted ? 'var(--pastel-mint-bg)' : '#FFFFFF',
                    border: `1px solid ${t.isCompleted ? 'var(--pastel-mint-border)' : 'var(--border-subtle)'}`,
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  <div
                    className={`task-checkbox ${t.isCompleted ? 'checked' : ''}`}
                    onClick={() => onToggleTask(t.id)}
                    style={{ marginTop: '2px' }}
                  >
                    {t.isCompleted && '✓'}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                      <span
                        className={`pastel-badge ${
                          t.priority === 'high' ? 'badge-peach' : t.priority === 'medium' ? 'badge-butter' : 'badge-mint'
                        }`}
                        style={{ fontSize: '0.68rem', padding: '1px 6px' }}
                      >
                        {t.priority === 'high' ? 'High' : t.priority === 'medium' ? 'Medium' : 'Low'}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{t.courseName}</span>
                    </div>

                    <h4
                      style={{
                        fontSize: '0.9rem',
                        marginBottom: '4px',
                        textDecoration: t.isCompleted ? 'line-through' : 'none',
                        color: t.isCompleted ? 'var(--text-muted)' : 'var(--text-main)',
                      }}
                    >
                      {t.title}
                    </h4>

                    {t.description && (
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                        {t.description}
                      </p>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        ⏰ Tenggat: {t.dueTime || '23:59'} WIB • {t.estimatedMinutes} mnt
                      </span>

                      {/* AI Recommender button for this task */}
                      {!t.isCompleted && (
                        <button
                          type="button"
                          onClick={() => onSelectTaskForAI(t)}
                          className="btn-ghost"
                          style={{
                            fontSize: '0.72rem',
                            padding: '3px 8px',
                            background: 'var(--pastel-lavender-bg)',
                            color: 'var(--pastel-lavender-text)',
                            borderRadius: 'var(--radius-sm)',
                          }}
                        >
                          <Sparkles size={12} /> Rekomendasi Waktu AI
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
