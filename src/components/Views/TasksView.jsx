// src/components/Views/TasksView.jsx
import React, { useState } from 'react';
import {
  ClipboardList,
  Plus,
  CheckCircle2,
  Circle,
  Clock,
  Sparkles,
  Calendar,
  AlertCircle,
  Trash2,
  Search,
  Filter,
  Check,
} from 'lucide-react';

export const TasksView = ({
  tasks = [],
  onToggleTask,
  onOpenTaskModal,
  onDeleteTask,
  onSelectTaskForAI,
  onOpenAIRecommender,
}) => {
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'pending' | 'completed'
  const [priorityFilter, setPriorityFilter] = useState('all'); // 'all' | 'high' | 'medium' | 'low'
  const [searchQuery, setSearchQuery] = useState('');

  const completedCount = tasks.filter((t) => t.isCompleted).length;
  const pendingCount = tasks.length - completedCount;

  const filteredTasks = tasks.filter((task) => {
    // Status filter
    if (statusFilter === 'pending' && task.isCompleted) return false;
    if (statusFilter === 'completed' && !task.isCompleted) return false;

    // Priority filter
    if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = task.title && task.title.toLowerCase().includes(q);
      const matchCourse = task.courseName && task.courseName.toLowerCase().includes(q);
      if (!matchTitle && !matchCourse) return false;
    }

    return true;
  });

  const getPriorityBadge = (p) => {
    switch (p) {
      case 'high':
        return <span className="pastel-badge badge-rose" style={{ fontSize: '0.74rem' }}>Tinggi</span>;
      case 'medium':
        return <span className="pastel-badge badge-peach" style={{ fontSize: '0.74rem' }}>Sedang</span>;
      default:
        return <span className="pastel-badge badge-mint" style={{ fontSize: '0.74rem' }}>Rendah</span>;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* 1. Header Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #4338CA 0%, #6366F1 50%, #818CF8 100%)',
          borderRadius: 'var(--radius-lg)',
          padding: '26px 32px',
          color: '#FFFFFF',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '18px',
          boxShadow: '0 8px 24px -4px rgba(79, 70, 229, 0.25)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                padding: '4px 10px',
                borderRadius: '20px',
                fontSize: '0.76rem',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              <ClipboardList size={13} color="#E0E7FF" /> DAFTAR TUGAS
            </span>
            <span style={{ fontSize: '0.78rem', color: '#E0E7FF' }}>
              · {completedCount} Selesai / {tasks.length} Total
            </span>
          </div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, margin: '0 0 6px 0', letterSpacing: '-0.5px' }}>
            Manajemen Tugas & Deadline
          </h1>
          <p style={{ margin: 0, fontSize: '0.88rem', color: '#EEF2FF', maxWidth: '580px' }}>
            Atur target belajar, deadline tugas, dan optimalkan slot jam fokus dengan asisten pintar AI.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            onClick={onOpenAIRecommender}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              color: '#FFFFFF',
              padding: '10px 16px',
              borderRadius: 'var(--radius-md)',
              fontWeight: 700,
              fontSize: '0.84rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
            }}
          >
            <Sparkles size={15} /> Saran AI
          </button>
          <button
            type="button"
            onClick={onOpenTaskModal}
            style={{
              backgroundColor: '#FFFFFF',
              color: '#312E81',
              border: 'none',
              padding: '10px 20px',
              borderRadius: 'var(--radius-md)',
              fontWeight: 700,
              fontSize: '0.86rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            }}
          >
            <Plus size={16} color="#4F46E5" /> + Tugas Baru
          </button>
        </div>
      </div>

      {/* 2. Filter & Search Controls */}
      <div
        className="card"
        style={{
          padding: '14px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '14px',
        }}
      >
        {/* Status Tabs */}
        <div style={{ display: 'flex', backgroundColor: '#F1F5F9', padding: '3px', borderRadius: '8px' }}>
          {[
            { id: 'all', label: `Semua (${tasks.length})` },
            { id: 'pending', label: `Menunggu (${pendingCount})` },
            { id: 'completed', label: `Selesai (${completedCount})` },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              style={{
                border: 'none',
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                backgroundColor: statusFilter === tab.id ? '#FFFFFF' : 'transparent',
                color: statusFilter === tab.id ? 'var(--text-main)' : 'var(--text-muted)',
                boxShadow: statusFilter === tab.id ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Priority & Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.82rem',
              outline: 'none',
              backgroundColor: '#FFFFFF',
            }}
          >
            <option value="all">Semua Prioritas</option>
            <option value="high">Prioritas Tinggi</option>
            <option value="medium">Prioritas Sedang</option>
            <option value="low">Prioritas Rendah</option>
          </select>

          <div style={{ minWidth: '200px' }}>
            <input
              type="text"
              placeholder="Cari tugas atau mata pelajaran..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
                fontSize: '0.82rem',
                outline: 'none',
              }}
            />
          </div>
        </div>
      </div>

      {/* 3. Tasks List Grid */}
      {filteredTasks.length === 0 ? (
        <div
          className="card"
          style={{
            padding: '48px 24px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: '#F1F5F9',
              color: '#94A3B8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ClipboardList size={26} />
          </div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>
            Tidak Ada Tugas Ditemukan
          </h3>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '420px' }}>
            Semua tugas sesuai kriteria filter telah diselesaikan atau belum ditambahkan.
          </p>
          <button
            type="button"
            onClick={onOpenTaskModal}
            className="btn-primary"
            style={{ marginTop: '8px', fontSize: '0.84rem', padding: '8px 18px' }}
          >
            <Plus size={15} /> + Tambah Tugas Baru Sekarang
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              className="card"
              style={{
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px',
                flexWrap: 'wrap',
                opacity: task.isCompleted ? 0.75 : 1,
                borderLeft: `4px solid ${task.isCompleted ? '#10B981' : task.color || 'var(--pastel-lavender-text)'}`,
                transition: 'all 150ms ease',
              }}
            >
              {/* Left Checkbox & Details */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: '260px' }}>
                <button
                  type="button"
                  onClick={() => onToggleTask(task.id)}
                  aria-label={task.isCompleted ? 'Tandai belum selesai' : 'Tandai selesai'}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center',
                    color: task.isCompleted ? '#10B981' : '#94A3B8',
                  }}
                >
                  {task.isCompleted ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                </button>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                    <span
                      style={{
                        fontSize: '0.96rem',
                        fontWeight: 700,
                        color: task.isCompleted ? 'var(--text-muted)' : 'var(--text-main)',
                        textDecoration: task.isCompleted ? 'line-through' : 'none',
                      }}
                    >
                      {task.title}
                    </span>
                    {getPriorityBadge(task.priority)}
                    {task.courseName && (
                      <span className="pastel-badge badge-lavender" style={{ fontSize: '0.72rem' }}>
                        {task.courseName}
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.78rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                    {task.dueDate && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={13} />
                        Deadline: {task.dueDate} {task.dueTime ? `· ${task.dueTime}` : ''}
                      </span>
                    )}
                    {task.estimatedMinutes && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={13} />
                        Estimasi: {task.estimatedMinutes} Menit
                      </span>
                    )}
                    {task.aiRecommendedSlot && (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          color: '#4F46E5',
                          fontWeight: 600,
                        }}
                      >
                        <Sparkles size={13} />
                        Slot Rekomendasi: {task.aiRecommendedSlot.suggestedDate} {task.aiRecommendedSlot.startTime} WIB
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Action buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {!task.isCompleted && onSelectTaskForAI && (
                  <button
                    type="button"
                    onClick={() => onSelectTaskForAI(task)}
                    style={{
                      border: '1px solid var(--pastel-lavender-border)',
                      backgroundColor: 'var(--pastel-lavender-bg)',
                      color: 'var(--pastel-lavender-text)',
                      borderRadius: '8px',
                      padding: '6px 12px',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <Sparkles size={13} /> Cari Jam Belajar AI
                  </button>
                )}

                {onDeleteTask && (
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Hapus tugas "${task.title}"?`)) {
                        onDeleteTask(task.id);
                      }
                    }}
                    style={{
                      border: 'none',
                      backgroundColor: '#FEE2E2',
                      color: '#DC2626',
                      borderRadius: '8px',
                      padding: '6px 10px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                    title="Hapus Tugas"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
