// src/components/Views/MonthlyView.jsx
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Calendar, Clock, CheckSquare } from 'lucide-react';

export const MonthlyView = ({
  tasks = [],
  schedules = [],
  onToggleTask,
  onOpenTaskModal,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activeDateStr, setActiveDateStr] = useState(new Date().toISOString().split('T')[0]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleThisMonth = () => {
    setCurrentDate(new Date());
    setActiveDateStr(new Date().toISOString().split('T')[0]);
  };

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  const dayHeaders = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

  // Days in current month
  const firstDayIndex = new Date(year, month, 1).getDay();
  const totalDaysInMonth = new Date(year, month + 1, 0).getDate();

  // Generate grid cells
  const calendarCells = [];
  for (let i = 0; i < firstDayIndex; i++) {
    calendarCells.push(null);
  }
  for (let d = 1; d <= totalDaysInMonth; d++) {
    const padD = String(d).padStart(2, '0');
    const padM = String(month + 1).padStart(2, '0');
    calendarCells.push(`${year}-${padM}-${padD}`);
  }

  // Active day details
  const activeDayDate = new Date(activeDateStr);
  const activeDayOfWeek = activeDayDate.getDay();
  const activeDayTasks = tasks.filter((t) => t.dueDate === activeDateStr);
  const activeDayClasses = schedules.filter((s) => Number(s.dayOfWeek) === activeDayOfWeek);

  return (
    <div>
      {/* Month Header Navigation */}
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
          <button type="button" onClick={handlePrevMonth} className="btn-secondary" style={{ padding: '6px 10px' }}>
            <ChevronLeft size={16} />
          </button>
          <button type="button" onClick={handleThisMonth} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.85rem' }}>
            Bulan Ini
          </button>
          <button type="button" onClick={handleNextMonth} className="btn-secondary" style={{ padding: '6px 10px' }}>
            <ChevronRight size={16} />
          </button>
          <h2 style={{ fontSize: '1.25rem', margin: 0 }}>
            {monthNames[month]} {year}
          </h2>
        </div>

        <button type="button" onClick={onOpenTaskModal} className="btn-primary" style={{ fontSize: '0.82rem', padding: '7px 12px' }}>
          <Plus size={15} /> Tambah Agenda
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.8fr) minmax(280px, 1fr)', gap: '20px', alignItems: 'start' }}>
        {/* Calendar Grid */}
        <div className="study-card" style={{ padding: '16px' }}>
          {/* Day Headers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', fontWeight: 700, fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
            {dayHeaders.map((dh) => (
              <div key={dh} style={{ padding: '6px' }}>{dh}</div>
            ))}
          </div>

          {/* Date Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' }}>
            {calendarCells.map((dateStr, idx) => {
              if (!dateStr) {
                return <div key={`empty-${idx}`} style={{ minHeight: '68px', background: 'transparent' }} />;
              }

              const dayNum = parseInt(dateStr.split('-')[2], 10);
              const isSelected = dateStr === activeDateStr;
              const isToday = dateStr === new Date().toISOString().split('T')[0];

              const cellTasks = tasks.filter((t) => t.dueDate === dateStr);
              const cellDayOfWeek = new Date(dateStr).getDay();
              const hasClasses = schedules.some((s) => Number(s.dayOfWeek) === cellDayOfWeek);

              return (
                <div
                  key={dateStr}
                  onClick={() => setActiveDateStr(dateStr)}
                  style={{
                    minHeight: '68px',
                    padding: '6px',
                    borderRadius: 'var(--radius-sm)',
                    border: isSelected
                      ? '2px solid var(--pastel-lavender-text)'
                      : isToday
                      ? '2px solid var(--pastel-lavender-border)'
                      : '1px solid var(--border-subtle)',
                    background: isSelected
                      ? 'var(--pastel-lavender-bg)'
                      : isToday
                      ? 'var(--bg-card-subtle)'
                      : '#FFFFFF',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span
                      style={{
                        fontSize: '0.85rem',
                        fontWeight: isToday || isSelected ? 800 : 500,
                        color: isSelected ? 'var(--pastel-lavender-text)' : 'var(--text-main)',
                      }}
                    >
                      {dayNum}
                    </span>
                    {hasClasses && (
                      <span
                        style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          background: 'var(--pastel-lavender-text)',
                        }}
                        title="Ada kelas rutin"
                      />
                    )}
                  </div>

                  {/* Task Badges in Cell */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '4px' }}>
                    {cellTasks.slice(0, 2).map((t) => (
                      <div
                        key={t.id}
                        style={{
                          fontSize: '0.62rem',
                          padding: '1px 4px',
                          borderRadius: '4px',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          background: t.isCompleted ? 'var(--pastel-mint-border)' : 'var(--pastel-peach-bg)',
                          color: t.isCompleted ? 'var(--pastel-mint-text)' : 'var(--pastel-peach-text)',
                          fontWeight: 600,
                        }}
                      >
                        {t.title}
                      </div>
                    ))}
                    {cellTasks.length > 2 && (
                      <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                        +{cellTasks.length - 2} lagi
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Date Drawer/Details */}
        <div className="study-card" style={{ padding: '20px' }}>
          <div style={{ marginBottom: '14px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--pastel-lavender-text)', textTransform: 'uppercase' }}>
              Detail Tanggal
            </span>
            <h3 style={{ fontSize: '1.1rem', marginTop: '2px' }}>{activeDateStr}</h3>
          </div>

          {/* Classes on active date */}
          <div style={{ marginBottom: '16px' }}>
            <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
              Perkuliahan / Kelas ({activeDayClasses.length})
            </h4>
            {activeDayClasses.length === 0 ? (
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Tidak ada kelas di hari ini.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {activeDayClasses.map((cls) => (
                  <div
                    key={cls.id}
                    style={{
                      padding: '8px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--pastel-lavender-bg)',
                      fontSize: '0.8rem',
                    }}
                  >
                    <p style={{ fontWeight: 600 }}>{cls.courseName}</p>
                    <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      ⏰ {cls.startTime} - {cls.endTime} • {cls.room}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tasks on active date */}
          <div>
            <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
              Tugas & Deadline ({activeDayTasks.length})
            </h4>
            {activeDayTasks.length === 0 ? (
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Tidak ada deadline di tanggal ini.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {activeDayTasks.map((t) => (
                  <div
                    key={t.id}
                    style={{
                      padding: '8px',
                      borderRadius: 'var(--radius-sm)',
                      background: t.isCompleted ? 'var(--pastel-mint-bg)' : 'var(--bg-card-subtle)',
                      border: `1px solid ${t.isCompleted ? 'var(--pastel-mint-border)' : 'var(--border-subtle)'}`,
                      fontSize: '0.8rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <input
                        type="checkbox"
                        checked={t.isCompleted}
                        onChange={() => onToggleTask(t.id)}
                        style={{ accentColor: 'var(--pastel-mint-text)' }}
                      />
                      <span style={{ fontWeight: 600, textDecoration: t.isCompleted ? 'line-through' : 'none' }}>
                        {t.title}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px', marginLeft: '22px' }}>
                      ⏰ {t.dueTime || '23:59'} WIB
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
