// src/components/DeadlinesCard.jsx
import React, { useState } from 'react';
import { CheckSquare, Plus, Sparkles, ChevronLeft, ChevronRight, Clock } from 'lucide-react';

export const DeadlinesCard = ({
  tasks = [],
  onToggleTask,
  onOpenTaskModal,
  onSelectTaskForAI,
}) => {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const formatDateStr = (d) => d.toISOString().split('T')[0];
  const currentDateStr = formatDateStr(selectedDate);

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

  const dayTasks = tasks.filter((t) => t.dueDate === currentDateStr);

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
          marginBottom: '14px',
          flexWrap: 'wrap',
          gap: '8px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '10px',
              backgroundColor: 'var(--pastel-mint-bg)',
              color: 'var(--pastel-mint-text)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CheckSquare size={17} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.05rem', margin: 0, fontWeight: 700 }}>
              Tenggat & Agenda Tugas
            </h3>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              {selectedDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {/* Day Navigation Controls */}
          <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-card-subtle)', borderRadius: 'var(--radius-sm)', padding: '2px' }}>
            <button
              type="button"
              onClick={handlePrevDay}
              className="btn-ghost"
              style={{ padding: '4px 6px', fontSize: '0.75rem' }}
              title="Hari Sebelumnya"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              type="button"
              onClick={handleToday}
              className="btn-ghost"
              style={{ padding: '4px 8px', fontSize: '0.75rem', fontWeight: 600 }}
            >
              Hari Ini
            </button>
            <button
              type="button"
              onClick={handleNextDay}
              className="btn-ghost"
              style={{ padding: '4px 6px', fontSize: '0.75rem' }}
              title="Hari Berikutnya"
            >
              <ChevronRight size={14} />
            </button>
          </div>

          <button
            type="button"
            onClick={onOpenTaskModal}
            className="btn-primary"
            style={{ fontSize: '0.78rem', padding: '6px 12px' }}
          >
            <Plus size={13} /> Agenda
          </button>
        </div>
      </div>

      {/* Task List */}
      {dayTasks.length === 0 ? (
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
            Bebas tugas untuk tanggal ini! ✨
          </p>
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {dayTasks.map((t) => (
            <div
              key={t.id}
              style={{
                padding: '12px 14px',
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

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                  <span
                    className={`pastel-badge ${
                      t.priority === 'high'
                        ? 'badge-peach'
                        : t.priority === 'medium'
                        ? 'badge-butter'
                        : 'badge-mint'
                    }`}
                    style={{ fontSize: '0.66rem', padding: '1px 6px' }}
                  >
                    {t.priority === 'high' ? 'High' : t.priority === 'medium' ? 'Medium' : 'Low'}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    {t.courseName}
                  </span>
                </div>

                <h4
                  style={{
                    fontSize: '0.88rem',
                    marginBottom: '3px',
                    textDecoration: t.isCompleted ? 'line-through' : 'none',
                    color: t.isCompleted ? 'var(--text-muted)' : 'var(--text-main)',
                    fontWeight: 600,
                  }}
                >
                  {t.title}
                </h4>

                {t.description && (
                  <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                    {t.description}
                  </p>
                )}

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '6px',
                  }}
                >
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    ⏰ {t.dueTime || '23:59'} WIB • {t.estimatedMinutes} mnt
                  </span>

                  {!t.isCompleted && (
                    <button
                      type="button"
                      onClick={() => onSelectTaskForAI(t)}
                      className="btn-ghost"
                      style={{
                        fontSize: '0.7rem',
                        padding: '2px 7px',
                        background: 'var(--pastel-lavender-bg)',
                        color: 'var(--pastel-lavender-text)',
                        borderRadius: 'var(--radius-sm)',
                      }}
                    >
                      <Sparkles size={11} /> Waktu AI
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
