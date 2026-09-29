// src/components/ClassModal.jsx
import React, { useState } from 'react';
import { X, BookOpen, Clock, MapPin, User, Palette } from 'lucide-react';
import { PASTEL_COLORS } from '../services/storage';

export const ClassModal = ({ isOpen, onClose, onSaveSchedule }) => {
  const [courseName, setCourseName] = useState('');
  const [lecturer, setLecturer] = useState('');
  const [room, setRoom] = useState('');
  const [dayOfWeek, setDayOfWeek] = useState(1); // 1 = Senin
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('10:00');
  const [selectedColor, setSelectedColor] = useState(PASTEL_COLORS[0].hex);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!courseName.trim()) return;

    onSaveSchedule({
      courseName: courseName.trim(),
      lecturer: lecturer.trim(),
      room: room.trim() || 'Ruang Kelas',
      dayOfWeek: Number(dayOfWeek),
      startTime,
      endTime,
      color: selectedColor,
    });
    onClose();
  };

  const days = [
    { num: 1, label: 'Senin' },
    { num: 2, label: 'Selasa' },
    { num: 3, label: 'Rabu' },
    { num: 4, label: 'Kamis' },
    { num: 5, label: 'Jumat' },
    { num: 6, label: 'Sabtu' },
    { num: 0, label: 'Minggu' },
  ];

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '480px', padding: '24px' }}>
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
              <BookOpen size={18} />
            </div>
            <h3 style={{ fontSize: '1.2rem', margin: 0 }}>Tambah Jadwal Kelas Rutin</h3>
          </div>
          <button type="button" onClick={onClose} className="btn-ghost" style={{ padding: '6px' }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Nama Mata Kuliah */}
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
              Nama Mata Kuliah / Pelajaran *
            </label>
            <input
              type="text"
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
              placeholder="Cth: Algoritma Pemrograman, Matematika Wajib"
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

          {/* Dosen & Ruangan */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '10px', marginBottom: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
                Dosen / Guru Pengampu
              </label>
              <input
                type="text"
                value={lecturer}
                onChange={(e) => setLecturer(e.target.value)}
                placeholder="Cth: Dr. Wahyu, Pak Joko"
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
                Ruangan / Link Meet
              </label>
              <input
                type="text"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                placeholder="Cth: Lab 3, R. 204"
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

          {/* Hari dalam seminggu */}
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
              Hari Kelas Rutin
            </label>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {days.map((d) => (
                <button
                  key={d.num}
                  type="button"
                  onClick={() => setDayOfWeek(d.num)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-sm)',
                    border: `1.5px solid ${dayOfWeek === d.num ? 'var(--pastel-lavender-text)' : 'var(--border-subtle)'}`,
                    background: dayOfWeek === d.num ? 'var(--pastel-lavender-bg)' : '#FFFFFF',
                    color: dayOfWeek === d.num ? 'var(--pastel-lavender-text)' : 'var(--text-main)',
                    fontWeight: 600,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                  }}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Jam Mulai & Jam Selesai */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
                Jam Mulai
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
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
                Jam Selesai
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
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
          </div>

          {/* Pilihan Warna Pastel */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
              Warna Pastel Label
            </label>
            <div style={{ display: 'flex', gap: '10px' }}>
              {PASTEL_COLORS.map((col) => (
                <div
                  key={col.hex}
                  onClick={() => setSelectedColor(col.hex)}
                  title={col.name}
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundColor: col.hex,
                    cursor: 'pointer',
                    border: selectedColor === col.hex ? '3px solid #272B33' : '2px solid transparent',
                    boxShadow: selectedColor === col.hex ? '0 0 0 2px rgba(0,0,0,0.1)' : 'none',
                    transition: 'all var(--transition-fast)',
                  }}
                />
              ))}
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button type="button" onClick={onClose} className="btn-secondary">
              Batal
            </button>
            <button type="submit" className="btn-primary">
              Simpan Jadwal Kelas
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
