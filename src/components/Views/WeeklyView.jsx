// src/components/Views/WeeklyView.jsx
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Clock, Plus, BookOpen, CheckSquare, Sparkles } from 'lucide-react';

export const WeeklyView = ({
  tasks = [],
  schedules = [],
  onToggleTask,
  onOpenTaskModal,
  onSelectTaskForAI,
}) => {
  // Start date of current week (Monday)
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    return new Date(d.setDate(diff));
  });

  const handlePrevWeek = () => {
    const d = new Date(currentWeekStart);
    d.setDate(d.getDate() - 7);
    setCurrentWeekStart(d);
  };

  const handleNextWeek = () => {
    const d = new Date(currentWeekStart);
    d.setDate(d.getDate() + 7);
    setCurrentWeekStart(d);
  };

  const handleCurrentWeek = () => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    setCurrentWeekStart(new Date(d.setDate(diff)));
  };

  // Generate 7 days of this week
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(currentWeekStart);
    d.setDate(d.getDate() + i);
    return d;
  });

  const dayNames = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
  ];

  const formatDateStr = (d) => d.toISOString().split('T')[0];
  const todayStr = formatDateStr(new Date());

  const weekTitle = `${weekDays[0].getDate()} ${monthNames[weekDays[0].getMonth()]} - ${weekDays[6].getDate()} ${monthNames[weekDays[6].getMonth()]} ${weekDays[6].getFullYear()}`;

  return (
    <div>
      {/* Week Header Navigation */}
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
          <button type="button" onClick={handlePrevWeek} className="btn-secondary" style={{ padding: '6px 10px' }}>
            <ChevronLeft size={16} />
          </button>
          <button type="button" onClick={handleCurrentWeek} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.85rem' }}>
            Minggu Ini
          </button>
          <button type="button" onClick={handleNextWeek} className="btn-secondary" style={{ padding: '6px 10px' }}>
            <ChevronRight size={16} />
          </button>
          <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Jadwal Mingguan ({weekTitle})</h2>
        </div>

        <button type="button" onClick={onOpenTaskModal} className="btn-primary" style={{ fontSize: '0.82rem', padding: '7px 12px' }}>
          <Plus size={15} /> Tambah Tugas
        </button>
      </div>

      {/* 7 Columns Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '12px',
          alignItems: 'start',
        }}
      >
        {weekDays.map((dayDate, idx) => {
          const dateStr = formatDateStr(dayDate);
          const isToday = dateStr === todayStr;
          // Note: dayDate.getDay() returns 0 for Sunday, 1 for Mon, etc.
          const dayOfWeekNum = dayDate.getDay();

          // Routine classes on this day of week
          const dayClasses = schedules
            .filter((s) => Number(s.dayOfWeek) === dayOfWeekNum)
            .sort((a, b) => a.startTime.localeCompare(b.startTime));

          // Tasks due on this specific calendar date
          const dayTasks = tasks.filter((t) => t.dueDate === dateStr);

          return (
            <div
              key={dateStr}
              className="study-card"
              style={{
                padding: '12px',
                background: isToday ? 'linear-gradient(180deg, #F3F4FE 0%, #FFFFFF 100%)' : '#FFFFFF',
                border: isToday ? '2px solid var(--pastel-lavender-border)' : '1px solid var(--border-subtle)',
                minHeight: '400px',
              }}
            >
              {/* Day Column Header */}
              <div
                style={{
                  textAlign: 'center',
                  paddingBottom: '10px',
                  marginBottom: '10px',
                  borderBottom: '1px solid var(--border-subtle)',
                }}
              >
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: isToday ? 'var(--pastel-lavender-text)' : 'var(--text-muted)' }}>
                  {dayNames[idx]}
                </span>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: isToday ? 'var(--pastel-lavender-text)' : 'transparent',
                    color: isToday ? '#FFFFFF' : 'var(--text-main)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    margin: '4px auto 0',
                  }}
                >
                  {dayDate.getDate()}
                </div>
              </div>

              {/* Day Classes */}
              <div style={{ marginBottom: '12px' }}>
                <p style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase' }}>
                  Kelas / Kuliah ({dayClasses.length})
                </p>
                {dayClasses.map((cls) => (
                  <div
                    key={cls.id}
                    style={{
                      background: 'var(--pastel-lavender-bg)',
                      borderLeft: `3px solid ${cls.color || 'var(--pastel-lavender-text)'}`,
                      padding: '8px',
                      borderRadius: 'var(--radius-sm)',
                      marginBottom: '6px',
                      fontSize: '0.75rem',
                    }}
                  >
                    <p style={{ fontWeight: 600, marginBottom: '2px', color: 'var(--text-main)' }}>{cls.courseName}</p>
                    <p style={{ color: 'var(--pastel-lavender-text)', fontWeight: 600, fontSize: '0.7rem' }}>
                      {cls.startTime} - {cls.endTime}
                    </p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.68rem' }}>{cls.room}</p>
                  </div>
                ))}
              </div>

              {/* Day Tasks */}
              <div>
                <p style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase' }}>
                  Tugas ({dayTasks.length})
                </p>
                {dayTasks.map((t) => (
                  <div
                    key={t.id}
                    style={{
                      background: t.isCompleted ? 'var(--pastel-mint-bg)' : '#FFFFFF',
                      border: `1px solid ${t.isCompleted ? 'var(--pastel-mint-border)' : 'var(--border-subtle)'}`,
                      padding: '8px',
                      borderRadius: 'var(--radius-sm)',
                      marginBottom: '6px',
                      fontSize: '0.75rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                      <input
                        type="checkbox"
                        checked={t.isCompleted}
                        onChange={() => onToggleTask(t.id)}
                        style={{ accentColor: 'var(--pastel-mint-text)', cursor: 'pointer' }}
                      />
                      <span
                        style={{
                          fontWeight: 600,
                          textDecoration: t.isCompleted ? 'line-through' : 'none',
                          color: t.isCompleted ? 'var(--text-muted)' : 'var(--text-main)',
                        }}
                      >
                        {t.title}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                      ⏰ {t.dueTime || '23:59'} • {t.estimatedMinutes}m
                    </p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
