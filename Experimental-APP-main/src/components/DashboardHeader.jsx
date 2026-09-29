// src/components/DashboardHeader.jsx
import React from 'react';
import { Sparkles, CheckCircle2, Clock, Calendar, ArrowRight, BookOpen, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

export const DashboardHeader = ({
  user,
  tasks = [],
  schedules = [],
  onToggleTask,
  onOpenTaskModal,
  onOpenClassModal,
  onOpenAIRecommender,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const todayDayOfWeek = new Date().getDay();

  // Find classes today
  const todayClasses = schedules
    .filter((s) => Number(s.dayOfWeek) === todayDayOfWeek)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  // Determine next upcoming class today
  const nowTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false });
  const nextClass = todayClasses.find((c) => c.endTime >= nowTime);

  // Today tasks & The Rule of 3 Focus
  const todayTasks = tasks.filter((t) => t.dueDate === todayStr);
  const completedToday = todayTasks.filter((t) => t.isCompleted).length;
  const progressPercent = todayTasks.length > 0 ? Math.round((completedToday / todayTasks.length) * 100) : 100;

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
      // Fire pastel confetti
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#8E94F2', '#6BCB77', '#FFD166', '#FF9A76', '#ED64A6'],
      });
    }
  };

  return (
    <div style={{ marginBottom: '28px' }}>
      {/* Personalized Greeting Card with Soft Gradient */}
      <div
        style={{
          background: 'linear-gradient(135deg, #FFFFFF 0%, #F5F4FF 50%, #FFF5F2 100%)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-subtle)',
          padding: '28px',
          boxShadow: 'var(--shadow-sm)',
          position: 'relative',
          overflow: 'hidden',
          marginBottom: '20px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
          {/* Left Text */}
          <div style={{ maxWidth: '640px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span className="pastel-badge badge-lavender">
                ✨ Halo, {user?.name || 'Pelajar Hebat'}!
              </span>
              <span className="pastel-badge badge-mint">
                {user?.educationLevel === 'SMA' ? `Siswa ${user?.major}` : `Mahasiswa ${user?.major}`}
              </span>
            </div>

            <h1 style={{ fontSize: '1.85rem', marginBottom: '6px', color: 'var(--text-main)', lineHeight: 1.25 }}>
              Semangat Belajar, {user?.name?.split(' ')[0]}! 🌱
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '16px' }}>
              Jurusan <strong>{user?.major}</strong> • {user?.semester}. Nikmati proses belajarmu tanpa terburu-buru, satu fokus dalam satu waktu.
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
                  padding: '8px 14px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.85rem',
                }}
              >
                <Clock size={16} />
                <span>
                  <strong>Kelas Hari Ini:</strong> {nextClass.courseName} ({nextClass.startTime} - {nextClass.endTime} WIB) di {nextClass.room}
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
                  padding: '8px 14px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.85rem',
                }}
              >
                <CheckCircle2 size={16} />
                <span>Tidak ada jadwal kelas tersisa untuk hari ini. Waktu luang untuk belajar mandiri!</span>
              </div>
            )}
          </div>

          {/* Right Progress Card */}
          <div
            style={{
              background: '#FFFFFF',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '16px 20px',
              minWidth: '240px',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>Progres Tugas Hari Ini</span>
              <span style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--pastel-lavender-text)' }}>
                {progressPercent}%
              </span>
            </div>

            {/* Progress Bar */}
            <div
              style={{
                width: '100%',
                height: '8px',
                background: 'var(--bg-card-subtle)',
                borderRadius: 'var(--radius-full)',
                overflow: 'hidden',
                marginBottom: '10px',
              }}
            >
              <div
                style={{
                  width: `${progressPercent}%`,
                  height: '100%',
                  background: 'var(--primary-gradient)',
                  borderRadius: 'var(--radius-full)',
                  transition: 'width 400ms ease',
                }}
              />
            </div>

            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              {todayTasks.length === 0
                ? 'Belum ada tenggat hari ini'
                : `${completedToday} dari ${todayTasks.length} tugas hari ini telah tuntas`}
            </p>

            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
              <button
                type="button"
                onClick={onOpenClassModal}
                className="btn-ghost"
                style={{ fontSize: '0.75rem', padding: '6px 8px', border: '1px solid var(--border-subtle)', width: '100%' }}
              >
                <BookOpen size={13} /> + Kelas Rutin
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* The "Rule of 3" Focus Block (Anti-Overwhelm Principle) */}
      <div
        className="study-card"
        style={{
          padding: '20px',
          background: '#FFFFFF',
          borderLeft: '4px solid var(--pastel-lavender-text)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ fontSize: '1.1rem' }}>🎯 3 Fokus Utama Hari Ini (The Rule of 3)</h3>
              <span className="pastel-badge badge-butter" style={{ fontSize: '0.72rem' }}>
                Prinsip Anti-Stress
              </span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
              Fokus selesaikan maksimal 3 prioritas tertinggi ini untuk menjaga ketenangan pikiran.
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenAIRecommender}
            className="btn-ghost"
            style={{ fontSize: '0.82rem', color: 'var(--pastel-lavender-text)' }}
          >
            <Sparkles size={14} /> Atur Jam Fokus dengan AI <ArrowRight size={14} />
          </button>
        </div>

        {/* 3 Focus Items */}
        {topFocusTasks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '16px', background: 'var(--pastel-mint-bg)', borderRadius: 'var(--radius-sm)' }}>
            <p style={{ color: 'var(--pastel-mint-text)', fontWeight: 600, fontSize: '0.9rem' }}>
              🎉 Luar biasa! Seluruh tugas prioritasmu sudah selesai. Waktunya istirahat atau santai sejenak!
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
            {topFocusTasks.map((task) => (
              <div
                key={task.id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        color: task.priority === 'high' ? 'var(--pastel-peach-text)' : 'var(--text-muted)',
                      }}
                    >
                      {task.priority === 'high' ? '🔥 Mendesak' : '⚡ Penting'}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>• {task.courseName || 'Umum'}</span>
                  </div>
                  <h4 style={{ fontSize: '0.88rem', fontWeight: 600, marginBottom: '4px', textDecoration: task.isCompleted ? 'line-through' : 'none' }}>
                    {task.title}
                  </h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <span>📅 {task.dueDate} {task.dueTime}</span>
                    <span>⏱️ {task.estimatedMinutes} menit</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
