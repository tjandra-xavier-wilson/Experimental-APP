// src/components/AIRecommenderModal.jsx
import React, { useState, useEffect } from 'react';
import { X, Sparkles, Clock, Calendar, CheckCircle2, ArrowRight, Lightbulb, Zap, ExternalLink } from 'lucide-react';
import { recommendBestStudySlot, generateDailyAISummary } from '../services/aiRecommender';
import { getGoogleCalendarUrl } from '../services/calendarSync';

export const AIRecommenderModal = ({
  isOpen,
  onClose,
  tasks = [],
  schedules = [],
  user,
  initialTask = null,
  onApplyRecommendation,
}) => {
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [recommendation, setRecommendation] = useState(null);

  const pendingTasks = tasks.filter((t) => !t.isCompleted);

  useEffect(() => {
    if (initialTask) {
      setSelectedTaskId(initialTask.id);
      const rec = recommendBestStudySlot(initialTask, schedules, user?.studyPreference || 'balanced');
      setRecommendation(rec);
    } else if (pendingTasks.length > 0) {
      setSelectedTaskId(pendingTasks[0].id);
      const rec = recommendBestStudySlot(pendingTasks[0], schedules, user?.studyPreference || 'balanced');
      setRecommendation(rec);
    }
  }, [initialTask, isOpen, tasks, schedules, user]);

  if (!isOpen) return null;

  const handleTaskChange = (taskId) => {
    setSelectedTaskId(taskId);
    const target = tasks.find((t) => t.id === taskId);
    if (target) {
      const rec = recommendBestStudySlot(target, schedules, user?.studyPreference || 'balanced');
      setRecommendation(rec);
    }
  };

  const handleApply = () => {
    if (!selectedTaskId || !recommendation) return;
    onApplyRecommendation(selectedTaskId, recommendation);
    onClose();
  };

  const currentTask = tasks.find((t) => t.id === selectedTaskId);
  const dailySummary = generateDailyAISummary(
    user,
    tasks.filter((t) => t.dueDate === new Date().toISOString().split('T')[0]),
    schedules.filter((s) => Number(s.dayOfWeek) === new Date().getDay())
  );

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '560px', padding: '24px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #8E94F2 0%, #B8BEFF 100%)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(142, 148, 242, 0.3)',
              }}
            >
              <Sparkles size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', margin: 0 }}>StudyMate AI Recommender</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Analisis waktu belajar terbaik berbasis jadwal & preferensi {user?.studyPreference || 'seimbang'}
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="btn-ghost" style={{ padding: '6px' }}>
            <X size={18} />
          </button>
        </div>

        {/* Daily Motivation & Advice Box */}
        <div
          style={{
            padding: '12px 14px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--pastel-mint-bg)',
            border: '1px solid var(--pastel-mint-border)',
            marginBottom: '18px',
            fontSize: '0.85rem',
            color: 'var(--pastel-mint-text)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px',
          }}
        >
          <Lightbulb size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <strong>Insight Hari Ini:</strong> {dailySummary.advice}
          </div>
        </div>

        {/* Task Selector */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
            Pilih Tugas yang Ingin Dijadwalkan Waktunya:
          </label>
          {pendingTasks.length === 0 ? (
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Tidak ada tugas tertunda saat ini. Semua tugas telah selesai! 🎉
            </p>
          ) : (
            <select
              value={selectedTaskId}
              onChange={(e) => handleTaskChange(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
                fontSize: '0.9rem',
                background: '#FFFFFF',
              }}
            >
              {pendingTasks.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title} (Deadline: {t.dueDate} {t.dueTime})
                </option>
              ))}
            </select>
          )}
        </div>

        {/* AI Recommendation Result Card */}
        {recommendation && currentTask && (
          <div
            style={{
              padding: '18px',
              borderRadius: 'var(--radius-lg)',
              background: 'linear-gradient(135deg, #F8F9FE 0%, #FFFFFF 100%)',
              border: '1.5px solid var(--pastel-lavender-border)',
              marginBottom: '20px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span className="pastel-badge badge-lavender" style={{ fontSize: '0.78rem' }}>
                <Zap size={13} /> Rekomendasi Waktu Emas
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                {recommendation.priorityContext}
              </span>
            </div>

            <h4 style={{ fontSize: '1.15rem', color: 'var(--pastel-lavender-text)', marginBottom: '8px' }}>
              📅 {recommendation.suggestedDate} • Pukul {recommendation.startTime} - {recommendation.endTime} WIB
            </h4>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-main)', marginBottom: '10px' }}>
              {recommendation.aiTip}
            </p>

            <div
              style={{
                padding: '10px 12px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--pastel-butter-bg)',
                border: '1px solid var(--pastel-butter-border)',
                fontSize: '0.8rem',
                color: 'var(--pastel-butter-text)',
                marginBottom: '10px',
              }}
            >
              <strong>⏱️ Metode Disarankan:</strong> {recommendation.technique}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <span>🎯 Alasan Algoritma: {recommendation.reason}</span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          {currentTask && recommendation && (
            <a
              href={getGoogleCalendarUrl({
                ...currentTask,
                dueDate: recommendation.suggestedDate,
                dueTime: recommendation.startTime,
              })}
              target="_blank"
              rel="noreferrer"
              className="btn-secondary"
              style={{ fontSize: '0.85rem', padding: '9px 14px' }}
            >
              <ExternalLink size={15} /> Buka Google Calendar
            </a>
          )}

          <div style={{ display: 'flex', gap: '10px', marginLeft: 'auto' }}>
            <button type="button" onClick={onClose} className="btn-secondary">
              Tutup
            </button>
            <button
              type="button"
              onClick={handleApply}
              disabled={!recommendation}
              className="btn-primary"
            >
              <CheckCircle2 size={16} /> Terapkan ke Jadwal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
