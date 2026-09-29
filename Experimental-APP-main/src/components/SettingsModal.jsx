// src/components/SettingsModal.jsx
import React, { useState } from 'react';
import { X, Wrench, User, Moon, Sun, Check, Sparkles } from 'lucide-react';
import { triggerReminderAlert } from '../services/notificationService';

export const SettingsModal = ({ isOpen, onClose, user, onUpdateUser }) => {
  const [name, setName] = useState(user?.name || 'Tjandra Wilson');
  const [schoolName, setSchoolName] = useState(user?.schoolName || 'Mutiara Bangsa 2 School');
  const [major, setMajor] = useState(user?.major || 'IPA');
  const [semester, setSemester] = useState(user?.semester || 'Kelas 11');
  const [studyPref, setStudyPref] = useState(user?.studyPreference || 'balanced');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const updated = {
      ...user,
      name: name.trim(),
      schoolName: schoolName.trim(),
      major: major.trim(),
      semester: semester.trim(),
      studyPreference: studyPref,
    };

    onUpdateUser(updated);
    triggerReminderAlert('Pengaturan Disimpan', 'Profil dan preferensi belajarmu telah diperbarui.');
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1050 }}>
      <div
        className="modal-content"
        style={{ maxWidth: '460px', padding: '24px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Wrench size={20} color="var(--pastel-lavender-text)" />
            <h3 style={{ fontSize: '1.15rem', margin: 0 }}>Pengaturan Akun & Jadwal</h3>
          </div>
          <button type="button" onClick={onClose} className="btn-ghost" style={{ padding: '4px' }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
              Nama Lengkap
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
                fontSize: '0.9rem',
                outline: 'none',
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
                Jurusan / Program Studi
              </label>
              <input
                type="text"
                value={major}
                onChange={(e) => setMajor(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '0.9rem',
                  outline: 'none',
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
                Tingkat / Semester
              </label>
              <input
                type="text"
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '0.9rem',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '8px' }}>
              Preferensi Jam Belajar AI (AI Study Preference)
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              {[
                { id: 'morning', label: 'Pagi Hari', desc: '06:00 - 12:00' },
                { id: 'balanced', label: 'Seimbang', desc: 'Fleksibel' },
                { id: 'night', label: 'Malam Hari', desc: '19:00 - 23:00' },
              ].map((opt) => (
                <div
                  key={opt.id}
                  onClick={() => setStudyPref(opt.id)}
                  style={{
                    padding: '10px 8px',
                    borderRadius: 'var(--radius-sm)',
                    border: studyPref === opt.id ? '2px solid var(--pastel-lavender-text)' : '1px solid var(--border-subtle)',
                    backgroundColor: studyPref === opt.id ? 'var(--pastel-lavender-bg)' : 'transparent',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  <p style={{ fontSize: '0.82rem', fontWeight: 700, margin: '0 0 2px 0' }}>{opt.label}</p>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{opt.desc}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              style={{ padding: '8px 16px', fontSize: '0.88rem' }}
            >
              Batal
            </button>
            <button
              type="submit"
              className="btn-primary"
              style={{ padding: '8px 20px', fontSize: '0.88rem' }}
            >
              Simpan Perubahan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
