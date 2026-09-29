// src/components/ThreeFocusCard.jsx
import React from 'react';
import { Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';

export const ThreeFocusCard = ({
  tasks = [],
  onToggleTask,
  onOpenAIRecommender,
  onOpenTaskModal,
}) => {
  // Rule of 3: Get 3 most urgent tasks (high priority first, then non-completed)
  const topFocusTasks = [...tasks]
    .filter((t) => !t.isCompleted)
    .sort((a, b) => {
      const pMap = { high: 3, medium: 2, low: 1 };
      return (pMap[b.priority] || 1) - (pMap[a.priority] || 1);
    })
    .slice(0, 3);

  const handleCheckboxClick = (taskId, currentlyCompleted) => {
    onToggleTask(taskId);
    if (!currentlyCompleted) {
      // Fire confetti
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#8E94F2', '#6BCB77', '#FFD166', '#FF9A76', '#ED64A6'],
      });
    }
  };

  return (
    <div
      className="study-card"
      style={{
        padding: '20px',
        backgroundColor: '#FFFFFF',
        borderLeft: '4px solid var(--pastel-lavender-text)',
      }}
    >
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
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h3 style={{ fontSize: '1.05rem', margin: 0, fontWeight: 700 }}>
              🎯 3 Fokus Utama Hari Ini
            </h3>
            <span className="pastel-badge badge-butter" style={{ fontSize: '0.7rem', padding: '2px 8px' }}>
              The Rule of 3
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: '4px 0 0 0' }}>
            Fokus selesaikan 3 prioritas ini untuk menjaga produktivitas tanpa stress.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenAIRecommender}
          className="btn-ghost"
          style={{
            fontSize: '0.8rem',
            color: 'var(--pastel-lavender-text)',
            padding: '5px 10px',
            backgroundColor: 'var(--pastel-lavender-bg)',
            borderRadius: 'var(--radius-sm)',
          }}
        >
          <Sparkles size={13} /> Atur Jam Fokus AI <ArrowRight size={13} />
        </button>
      </div>

      {/* 3 Focus Items List */}
      {tasks.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '24px 16px',
            backgroundColor: 'var(--bg-card-subtle)',
            borderRadius: 'var(--radius-md)',
            border: '1px dashed var(--border-subtle)',
          }}
        >
          <p style={{ color: 'var(--text-main)', fontWeight: 600, fontSize: '0.88rem', margin: '0 0 4px 0' }}>
            Belum ada tugas prioritas
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', margin: '0 0 12px 0' }}>
            Tambahkan tugas atau agenda belajarmu untuk mulai menentukan 3 fokus hari ini.
          </p>
          {onOpenTaskModal && (
            <button
              type="button"
              onClick={onOpenTaskModal}
              className="btn-primary"
              style={{ fontSize: '0.78rem', padding: '6px 14px' }}
            >
              + Tambah Tugas Pertama
            </button>
          )}
        </div>
      ) : topFocusTasks.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '20px 16px',
            background: 'var(--pastel-mint-bg)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--pastel-mint-border)',
          }}
        >
          <p style={{ color: 'var(--pastel-mint-text)', fontWeight: 600, fontSize: '0.88rem', margin: 0 }}>
            🎉 Luar biasa! Seluruh tugas prioritas utama sudah tuntas. Waktunya istirahat santai!
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {topFocusTasks.map((task) => (
            <div
              key={task.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                background: task.priority === 'high' ? 'var(--pastel-peach-bg)' : 'var(--bg-card-subtle)',
                border: `1px solid ${task.priority === 'high' ? 'var(--pastel-peach-border)' : 'var(--border-subtle)'}`,
                transition: 'all var(--transition-fast)',
              }}
            >
              <div
                className={`task-checkbox ${task.isCompleted ? 'checked' : ''}`}
                onClick={() => handleCheckboxClick(task.id, task.isCompleted)}
              >
                {task.isCompleted && <CheckCircle2 size={16} />}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                  <span
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      color: task.priority === 'high' ? 'var(--pastel-peach-text)' : 'var(--text-muted)',
                    }}
                  >
                    {task.priority === 'high' ? '🔥 Mendesak' : '⚡ Penting'}
                  </span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    • {task.courseName || 'Umum'}
                  </span>
                </div>
                <h4
                  style={{
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    margin: '0 0 2px 0',
                    textDecoration: task.isCompleted ? 'line-through' : 'none',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {task.title}
                </h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  <span>📅 {task.dueDate} {task.dueTime}</span>
                  <span>⏱️ {task.estimatedMinutes} menit</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
