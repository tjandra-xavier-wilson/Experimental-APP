// src/components/ProfileCustomizeModal.jsx
import React, { useState } from 'react';
import {
  X,
  User,
  Sparkles,
  Palette,
  Smile,
  BookOpen,
  Target,
  GraduationCap,
  School,
  Check,
  Eye,
} from 'lucide-react';

const AVATAR_PALETTE = [
  { name: 'Lavender Focus', hex: '#8E94F2' },
  { name: 'Royal Violet', hex: '#8B5CF6' },
  { name: 'Sky Breeze', hex: '#3B82F6' },
  { name: 'Ocean Cyan', hex: '#06B6D4' },
  { name: 'Mint Sage', hex: '#10B981' },
  { name: 'Emerald', hex: '#059669' },
  { name: 'Peach Amber', hex: '#F59E0B' },
  { name: 'Coral Rose', hex: '#F43F5E' },
  { name: 'Lilac Dream', hex: '#9F7AEA' },
  { name: 'Midnight Slate', hex: '#334155' },
];

const STATUS_PRESETS = [
  'Sedang Belajar 📚',
  'Fokus Modul UTBK 🔥',
  'Mengerjakan Tugas 📑',
  'Santai Sejenak ☕',
  'Diskusi Kelompok 💡',
  'Menjelang Ujian 🎯',
  'Mode Deep Work 🎧',
  'Review Catatan 📝',
];

export const ProfileCustomizeModal = ({
  isOpen,
  onClose,
  currentUser,
  tasks = [],
  onSaveProfile,
}) => {
  if (!isOpen || !currentUser) return null;

  const [name, setName] = useState(currentUser.name || 'Tjandra Wilson');
  const [avatarBg, setAvatarBg] = useState(currentUser.avatarBg || '#8E94F2');
  const [status, setStatus] = useState(currentUser.status || 'Sedang Belajar 📚');
  const [customStatus, setCustomStatus] = useState('');
  const [bio, setBio] = useState(
    currentUser.bio || 'Fokus target nilai 95+ dan konsisten belajar setiap hari!'
  );
  const [target, setTarget] = useState(currentUser.target || 'UTBK & Nilai Rapor Unggul');
  const [major, setMajor] = useState(currentUser.major || 'IPA');
  const [semester, setSemester] = useState(currentUser.semester || 'Kelas 11');
  const [schoolName, setSchoolName] = useState(
    currentUser.schoolName || 'Mutiara Bangsa 2 School'
  );
  const [isSaving, setIsSaving] = useState(false);

  // Compute live task stats for preview
  const totalTasks = tasks.length || 1;
  const completedTasks = tasks.filter((t) => t.isCompleted).length;
  const progressPercent = Math.round((completedTasks / totalTasks) * 100);

  const getInitials = (text) => {
    return (
      (text || '')
        .split(' ')
        .filter(Boolean)
        .map((w) => w[0].toUpperCase())
        .slice(0, 2)
        .join('') || 'TW'
    );
  };

  const handleApplyPreset = (preset) => {
    setStatus(preset);
    setCustomStatus('');
  };

  const handleCustomStatusChange = (val) => {
    setCustomStatus(val);
    if (val.trim()) {
      setStatus(val);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const updatedUser = {
        ...currentUser,
        name: name.trim() || currentUser.name,
        avatarBg,
        status: (customStatus.trim() || status).trim(),
        bio: bio.trim(),
        target: target.trim(),
        major: major.trim(),
        semester: semester.trim(),
        schoolName: schoolName.trim(),
      };
      if (onSaveProfile) {
        await onSaveProfile(updatedUser);
      }
      onClose();
    } catch (err) {
      console.error('Error saving profile:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="modal-overlay"
      style={{
        zIndex: 120,
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(5px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
    >
      <div
        className="modal-content"
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '680px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          animation: 'fadeIn 0.2s ease-out',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(135deg, #F8FAFC 0%, #EEF2F6 100%)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                backgroundColor: '#EDE9FE',
                color: '#7C3AED',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Sparkles size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: '#1E293B' }}>
                Kustomisasi Profil Publik Akun
              </h2>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748B' }}>
                Atur tampilan kartu akun Anda yang dapat dilihat oleh rekan belajar di perangkat lain.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              color: '#64748B',
              padding: '6px',
              borderRadius: '8px',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Body (Scrollable) */}
        <form
          onSubmit={handleSubmit}
          style={{
            padding: '22px 24px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '22px',
          }}
        >
          {/* 1. Live Preview Section */}
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.82rem',
                fontWeight: 700,
                color: '#475569',
                marginBottom: '10px',
              }}
            >
              <Eye size={15} color="#7C3AED" /> Pratinjau Kartu Rekan Belajar (Live Preview)
            </div>

            <div
              style={{
                borderRadius: '14px',
                border: '1.5px solid #E2E8F0',
                background: '#FFFFFF',
                padding: '20px',
                boxShadow: '0 4px 16px -2px rgba(124, 58, 237, 0.08)',
                borderTop: `4px solid ${avatarBg}`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
                <div
                  style={{
                    width: '54px',
                    height: '54px',
                    borderRadius: '50%',
                    backgroundColor: avatarBg,
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.2rem',
                    fontWeight: 800,
                    boxShadow: `0 4px 12px ${avatarBg}55`,
                    transition: 'background-color 0.25s ease',
                  }}
                >
                  {getInitials(name)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <h3
                      style={{
                        fontSize: '1.12rem',
                        fontWeight: 800,
                        margin: 0,
                        color: '#0F172A',
                      }}
                    >
                      {name || 'Nama Anda'}
                    </h3>
                    <span
                      style={{
                        backgroundColor: '#EDE9FE',
                        color: '#6D28D9',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                      }}
                    >
                      Anda (Pemilik Akun)
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '2px' }}>
                    {major} · {semester} • {schoolName}
                  </div>
                </div>
              </div>

              {/* Status Pill */}
              <div style={{ marginBottom: '12px' }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    backgroundColor: '#F1F5F9',
                    color: '#334155',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    border: '1px solid #E2E8F0',
                  }}
                >
                  {status}
                </span>
              </div>

              {/* Bio & Target */}
              {bio && (
                <p
                  style={{
                    margin: '0 0 12px 0',
                    fontSize: '0.82rem',
                    color: '#475569',
                    lineHeight: '1.45',
                    fontStyle: 'italic',
                  }}
                >
                  "{bio}"
                </p>
              )}

              {/* Target pill */}
              {target && (
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.75rem',
                    color: '#B45309',
                    backgroundColor: '#FEF3C7',
                    padding: '3px 10px',
                    borderRadius: '6px',
                    fontWeight: 600,
                    marginBottom: '14px',
                  }}
                >
                  <Target size={12} /> Target: {target}
                </div>
              )}

              {/* Live Task Progress */}
              <div style={{ marginTop: '4px' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '0.76rem',
                    marginBottom: '5px',
                  }}
                >
                  <span style={{ fontWeight: 600, color: '#64748B' }}>Progres Belajar Terhubung</span>
                  <span style={{ fontWeight: 700, color: '#0F172A' }}>
                    {completedTasks} / {totalTasks} Tugas ({progressPercent}%)
                  </span>
                </div>
                <div
                  style={{
                    width: '100%',
                    height: '7px',
                    backgroundColor: '#E2E8F0',
                    borderRadius: '4px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${progressPercent}%`,
                      height: '100%',
                      backgroundColor: avatarBg,
                      borderRadius: '4px',
                      transition: 'width 0.3s ease, background-color 0.3s ease',
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 2. Avatar Color Picker */}
          <div>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.82rem',
                fontWeight: 700,
                color: '#334155',
                marginBottom: '8px',
              }}
            >
              <Palette size={15} color="#7C3AED" /> Warna Tema & Background Avatar
            </label>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(44px, 1fr))',
                gap: '10px',
              }}
            >
              {AVATAR_PALETTE.map((c) => {
                const isSelected = avatarBg.toLowerCase() === c.hex.toLowerCase();
                return (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => setAvatarBg(c.hex)}
                    title={c.name}
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '12px',
                      backgroundColor: c.hex,
                      border: isSelected ? '3px solid #0F172A' : '2px solid transparent',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#FFFFFF',
                      transform: isSelected ? 'scale(1.08)' : 'scale(1)',
                      transition: 'all 0.15s ease',
                      boxShadow: isSelected ? '0 4px 10px rgba(0,0,0,0.2)' : 'none',
                    }}
                  >
                    {isSelected && <Check size={18} strokeWidth={3} />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Status Presets & Custom Status */}
          <div>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.82rem',
                fontWeight: 700,
                color: '#334155',
                marginBottom: '8px',
              }}
            >
              <Smile size={15} color="#7C3AED" /> Status Aktivitas Belajar
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
              {STATUS_PRESETS.map((preset) => {
                const isActive = status === preset && !customStatus;
                return (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handleApplyPreset(preset)}
                    style={{
                      border: isActive ? '1.5px solid #7C3AED' : '1px solid #CBD5E1',
                      backgroundColor: isActive ? '#EDE9FE' : '#F8FAFC',
                      color: isActive ? '#6D28D9' : '#334155',
                      padding: '5px 12px',
                      borderRadius: '20px',
                      fontSize: '0.78rem',
                      fontWeight: isActive ? 700 : 500,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {preset}
                  </button>
                );
              })}
            </div>

            <input
              type="text"
              placeholder="Atau ketik status kustom sendiri (contoh: Membaca Bab 4 Fisika 📖)..."
              value={customStatus}
              onChange={(e) => handleCustomStatusChange(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                fontSize: '0.84rem',
                outline: 'none',
              }}
            />
          </div>

          {/* 4. Bio / Motto Belajar & Target */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  color: '#334155',
                  marginBottom: '6px',
                }}
              >
                Motto Belajar / Bio Singkat
              </label>
              <input
                type="text"
                placeholder="Contoh: Belajar cerdas, bukan hanya keras ✨"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  fontSize: '0.84rem',
                  outline: 'none',
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  color: '#334155',
                  marginBottom: '6px',
                }}
              >
                Target Akademik Utama
              </label>
              <input
                type="text"
                placeholder="Contoh: UTBK PTN Impian / Rapor 90+"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  fontSize: '0.84rem',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          {/* 5. Nama Lengkap, Jurusan, Semester, Sekolah */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  color: '#334155',
                  marginBottom: '6px',
                }}
              >
                Nama Lengkap Akun
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  fontSize: '0.84rem',
                  outline: 'none',
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  color: '#334155',
                  marginBottom: '6px',
                }}
              >
                Sekolah / Universitas
              </label>
              <input
                type="text"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  fontSize: '0.84rem',
                  outline: 'none',
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  color: '#334155',
                  marginBottom: '6px',
                }}
              >
                Jurusan / Bidang Minat
              </label>
              <input
                type="text"
                value={major}
                onChange={(e) => setMajor(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  fontSize: '0.84rem',
                  outline: 'none',
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  color: '#334155',
                  marginBottom: '6px',
                }}
              >
                Kelas / Semester
              </label>
              <input
                type="text"
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  fontSize: '0.84rem',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          {/* Footer buttons */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px',
              paddingTop: '16px',
              borderTop: '1px solid #E2E8F0',
            }}
          >
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="btn-secondary"
              style={{ padding: '9px 18px', fontSize: '0.85rem' }}
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="btn-primary"
              style={{
                padding: '9px 24px',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: '#7C3AED',
                borderColor: '#7C3AED',
              }}
            >
              {isSaving ? (
                'Menyimpan...'
              ) : (
                <>
                  <Check size={16} /> Simpan & Publikasikan ke Teman
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileCustomizeModal;
