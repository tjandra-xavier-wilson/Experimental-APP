// src/components/TaskModal.jsx
import React, { useState, useEffect } from 'react';
import { X, Sparkles, Clock, Calendar, CheckSquare, BookOpen } from 'lucide-react';
import { DEFAULT_CATEGORIES } from '../services/storage';
import { recommendBestStudySlot } from '../services/aiRecommender';

export const TaskModal = ({
  isOpen,
  onClose,
  onSaveTask,
  courses = [],
  schedules = [],
  userPreference = 'balanced',
  initialTask = null,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [courseName, setCourseName] = useState('');
  const [categoryId, setCategoryId] = useState('cat-2');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('21:00');
  const [priority, setPriority] = useState('medium');
  const [estimatedMinutes, setEstimatedMinutes] = useState(60);
  const [aiSlot, setAiSlot] = useState(null);

  useEffect(() => {
    if (initialTask) {
      setTitle(initialTask.title || '');
      setDescription(initialTask.description || '');
      setCourseName(initialTask.courseName || '');
      setCategoryId(initialTask.categoryId || 'cat-2');
      setDueDate(initialTask.dueDate || '');
      setDueTime(initialTask.dueTime || '21:00');
      setPriority(initialTask.priority || 'medium');
      setEstimatedMinutes(initialTask.estimatedMinutes || 60);
      setAiSlot(initialTask.aiRecommendedSlot || null);
    } else {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setTitle('');
      setDescription('');
      setCourseName(courses[0]?.name || 'Umum');
      setCategoryId('cat-2');
      setDueDate(tomorrow.toISOString().split('T')[0]);
      setDueTime('21:00');
      setPriority('medium');
      setEstimatedMinutes(60);
      setAiSlot(null);
    }
  }, [initialTask, isOpen, courses]);

  if (!isOpen) return null;

  const handleAskAI = () => {
    if (!title) {
      alert('Harap masukkan judul tugas terlebih dahulu sebelum meminta rekomendasi AI.');
      return;
    }
    const tempTask = {
      title,
      dueDate,
      dueTime,
      priority,
      estimatedMinutes,
    };
    const rec = recommendBestStudySlot(tempTask, schedules, userPreference);
    setAiSlot(rec);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSaveTask({
      ...(initialTask || {}),
      title: title.trim(),
      description: description.trim(),
      courseName: courseName.trim() || 'Umum',
      categoryId,
      dueDate,
      dueTime,
      priority,
      estimatedMinutes: Number(estimatedMinutes) || 60,
      aiRecommendedSlot: aiSlot,
      isCompleted: initialTask?.isCompleted || false,
    });
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '520px', padding: '24px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'var(--pastel-lavender-bg)',
                color: 'var(--pastel-lavender-text)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CheckSquare size={18} />
            </div>
            <h3 style={{ fontSize: '1.2rem', margin: 0 }}>
              {initialTask ? 'Edit Tugas / Kegiatan' : 'Tambah Tugas Baru'}
            </h3>
          </div>
          <button type="button" onClick={onClose} className="btn-ghost" style={{ padding: '6px' }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Judul Tugas */}
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
              Nama Tugas / Kegiatan *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Cth: Laporan Praktikum Modul 2, Makalah Sejarah"
              required
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
                fontSize: '0.9rem',
                outline: 'none',
              }}
            />
          </div>

          {/* Mata Kuliah / Pelajaran & Kategori */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
                Mata Kuliah / Mapel
              </label>
              <input
                type="text"
                list="course-list"
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                placeholder="Pilih atau ketik mapel"
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '0.88rem',
                }}
              />
              <datalist id="course-list">
                {courses.map((c) => (
                  <option key={c.id} value={c.name} />
                ))}
              </datalist>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
                Kategori / Tag
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '0.88rem',
                  background: '#FFFFFF',
                }}
              >
                {DEFAULT_CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Deadline Tanggal & Jam */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '10px', marginBottom: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
                Tanggal Tenggat (Deadline) *
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '0.88rem',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
                Jam Tenggat
              </label>
              <input
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '0.88rem',
                }}
              />
            </div>
          </div>

          {/* Prioritas & Estimasi Waktu */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
                Tingkat Prioritas
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '0.88rem',
                  background: '#FFFFFF',
                }}
              >
                <option value="low">🟢 Rendah (Bisa santai)</option>
                <option value="medium">🟡 Sedang (Standar)</option>
                <option value="high">🔴 Tinggi (Mendesak / Ujian)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
                Estimasi Pengerjaan (Menit)
              </label>
              <input
                type="number"
                min="15"
                step="15"
                value={estimatedMinutes}
                onChange={(e) => setEstimatedMinutes(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '0.88rem',
                }}
              />
            </div>
          </div>

          {/* AI Recommendation Slot Banner */}
          <div
            style={{
              padding: '12px 14px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--pastel-lavender-bg)',
              border: '1px solid var(--pastel-lavender-border)',
              marginBottom: '16px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: aiSlot ? '6px' : 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={16} color="var(--pastel-lavender-text)" />
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--pastel-lavender-text)' }}>
                  Rekomendasi Waktu Belajar AI
                </span>
              </div>
              <button
                type="button"
                onClick={handleAskAI}
                className="btn-ghost"
                style={{
                  fontSize: '0.75rem',
                  padding: '4px 8px',
                  background: '#FFFFFF',
                  border: '1px solid var(--pastel-lavender-border)',
                }}
              >
                {aiSlot ? 'Hitung Ulang' : '⚡ Tanya AI'}
              </button>
            </div>

            {aiSlot && (
              <div style={{ fontSize: '0.8rem', color: 'var(--text-main)', marginTop: '4px' }}>
                <p>
                  📅 <strong>Waktu Ideal:</strong> {aiSlot.suggestedDate} ({aiSlot.startTime} - {aiSlot.endTime} WIB)
                </p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '2px' }}>
                  💡 {aiSlot.reason}
                </p>
              </div>
            )}
          </div>

          {/* Catatan Tambahan */}
          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
              Catatan & Detail Pengerjaan (Opsional)
            </label>
            <textarea
              rows="2"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Cth: Bab 3 soal 1-5, format PDF ukuran A4"
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
                fontSize: '0.88rem',
                outline: 'none',
              }}
            />
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button type="button" onClick={onClose} className="btn-secondary">
              Batal
            </button>
            <button type="submit" className="btn-primary">
              Simpan Tugas
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
