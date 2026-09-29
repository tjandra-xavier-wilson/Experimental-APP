// src/components/TaskProgressCard.jsx
import React from 'react';
import { CheckCircle2, TrendingUp, Sparkles, BookOpen } from 'lucide-react';

export const TaskProgressCard = ({
  tasks = [],
  onOpenTaskModal,
  onOpenClassModal,
  userName = 'Tjandra',
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const todayTasks = tasks.filter((t) => t.dueDate === todayStr);
  const completedToday = todayTasks.filter((t) => t.isCompleted).length;
  const progressPercent =
    todayTasks.length > 0 ? Math.round((completedToday / todayTasks.length) * 100) : 100;

  // Circular Donut Dimensions
  const size = 108;
  const stroke = 9;
  const radius = (size - stroke * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  const getStatusText = () => {
    if (todayTasks.length === 0) return 'Bebas target tugas hari ini ✨';
    if (progressPercent === 100) return 'Luar biasa, semua tugas tuntas! 🎉';
    if (progressPercent >= 50) return 'Lebih dari separuh selesai, teruskan! 💪';
    return 'Ayo mulai selesaikan satu per satu! 🎯';
  };

  return (
    <div
      className="study-card"
      style={{
        padding: '20px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
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
            <TrendingUp size={17} />
          </div>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>Progres Tugas Hari Ini</h3>
        </div>
        <span
          className={`pastel-badge ${
            progressPercent === 100
              ? 'badge-mint'
              : progressPercent >= 50
              ? 'badge-lavender'
              : 'badge-peach'
          }`}
          style={{ fontSize: '0.72rem', padding: '2px 8px' }}
        >
          {progressPercent === 100 ? 'Selesai' : 'Aktif'}
        </span>
      </div>

      {/* Donut Chart and Stats in Clean Row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        {/* SVG Circular Donut Chart */}
        <div
          style={{
            position: 'relative',
            width: size,
            height: size,
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', position: 'absolute' }}>
            {/* Background Track */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="#EDEBE3"
              strokeWidth={stroke}
              fill="transparent"
            />
            {/* Animated Progress Arc */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="url(#taskDonutGradient)"
              strokeWidth={stroke}
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 0.6s cubic-bezier(0.16, 1, 0.3, 1)' }}
            />
            <defs>
              <linearGradient id="taskDonutGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#7C83FD" />
                <stop offset="100%" stopColor="#6BCB77" />
              </linearGradient>
            </defs>
          </svg>

          {/* Center Percentage Display */}
          <div style={{ textAlign: 'center', zIndex: 1 }}>
            <span
              style={{
                fontSize: '1.45rem',
                fontWeight: 800,
                color: 'var(--text-main)',
                lineHeight: 1,
                display: 'block',
              }}
            >
              {progressPercent}%
            </span>
            <span
              style={{
                fontSize: '0.66rem',
                fontWeight: 600,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              Tuntas
            </span>
          </div>
        </div>

        {/* Text Breakdown */}
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
            {getStatusText()}
          </p>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
            {todayTasks.length === 0
              ? 'Tidak ada tenggat yang dijadwalkan untuk hari ini.'
              : `Tuntas ${completedToday} dari total ${todayTasks.length} target tugas.`}
          </p>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={onOpenTaskModal}
              className="btn-ghost"
              style={{
                fontSize: '0.75rem',
                padding: '5px 10px',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
              }}
            >
              + Tugas Baru
            </button>
            <button
              type="button"
              onClick={onOpenClassModal}
              className="btn-ghost"
              style={{
                fontSize: '0.75rem',
                padding: '5px 10px',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
              }}
            >
              <BookOpen size={12} /> + Kelas
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
