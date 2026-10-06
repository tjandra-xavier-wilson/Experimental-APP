// src/components/Views/SettingsView.jsx
import React, { useState, useEffect } from 'react';
import {
  Wrench,
  User,
  GraduationCap,
  School,
  BookOpen,
  Mail,
  ShieldCheck,
  Save,
  LogOut,
  Database,
  CheckCircle2,
} from 'lucide-react';

export const SettingsView = ({
  user,
  onUpdateUser,
  onLogout,
  onOpenSupabaseModal,
}) => {
  const [name, setName] = useState(user?.name || 'Tjandra Wilson');
  const [email, setEmail] = useState(user?.email || 'tjandrawilson@mutiarabangsa.sch.id');
  const [educationLevel, setEducationLevel] = useState(user?.educationLevel || 'Siswa SMA/SMK');
  const [schoolName, setSchoolName] = useState(user?.schoolName || 'Mutiara Bangsa 2 School');
  const [major, setMajor] = useState(user?.major || 'IPA');
  const [semester, setSemester] = useState(user?.semester || 'Kelas 11');
  const [studyPreference, setStudyPreference] = useState(user?.studyPreference || 'balanced');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setEducationLevel(user.educationLevel || 'Siswa SMA/SMK');
      setSchoolName(user.schoolName || '');
      setMajor(user.major || '');
      setSemester(user.semester || '');
      setStudyPreference(user.studyPreference || 'balanced');
    }
  }, [user]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onUpdateUser) {
      onUpdateUser({
        ...user,
        name: name.trim(),
        email: email.trim(),
        educationLevel,
        schoolName: schoolName.trim(),
        major: major.trim(),
        semester: semester.trim(),
        studyPreference,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* 1. Header Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #334155 0%, #1E293B 100%)',
          borderRadius: 'var(--radius-lg)',
          padding: '26px 32px',
          color: '#FFFFFF',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '18px',
          boxShadow: '0 8px 24px -4px rgba(30, 41, 59, 0.25)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                padding: '4px 10px',
                borderRadius: '20px',
                fontSize: '0.76rem',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              <Wrench size={13} color="#94A3B8" /> PENGATURAN AKUN
            </span>
            <span style={{ fontSize: '0.78rem', color: '#94A3B8' }}>
              · Profil & Preferensi Belajar
            </span>
          </div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, margin: '0 0 6px 0', letterSpacing: '-0.5px' }}>
            Pengaturan & Profil Pengguna
          </h1>
          <p style={{ margin: 0, fontSize: '0.88rem', color: '#CBD5E1', maxWidth: '580px' }}>
            Sesuaikan identitas akademik, tingkatan sekolah/kuliah, dan preferensi belajar AI Anda.
          </p>
        </div>

        <button
          type="button"
          onClick={onLogout}
          style={{
            backgroundColor: '#FEE2E2',
            color: '#DC2626',
            border: 'none',
            padding: '10px 18px',
            borderRadius: 'var(--radius-md)',
            fontWeight: 700,
            fontSize: '0.84rem',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
          }}
        >
          <LogOut size={16} /> Keluar Akun
        </button>
      </div>

      {/* 2. Profile Details & Edit Form */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '20px',
        }}
      >
        {/* Left Profile Overview Card */}
        <div className="card" style={{ padding: '26px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: 'var(--pastel-lavender-bg)',
                border: '3px solid var(--pastel-lavender-border)',
                color: 'var(--pastel-lavender-text)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.4rem',
                fontWeight: 800,
              }}
            >
              {name
                .split(' ')
                .map((n) => n[0])
                .slice(0, 2)
                .join('')
                .toUpperCase()}
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 4px 0', color: 'var(--text-main)' }}>
                {name}
              </h2>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{email}</div>
              <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                <span className="pastel-badge badge-lavender" style={{ fontSize: '0.72rem' }}>
                  {educationLevel}
                </span>
                <span className="pastel-badge badge-mint" style={{ fontSize: '0.72rem' }}>
                  {major}
                </span>
              </div>
            </div>
          </div>

          <div style={{ width: '100%', height: '1px', backgroundColor: 'var(--border-subtle)', margin: '4px 0' }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.84rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Institusi Pendidikan:</span>
              <strong>{schoolName}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Tingkat / Semester:</span>
              <strong>{semester}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Mode Belajar:</span>
              <strong>{studyPreference === 'balanced' ? 'Seimbang (Rekomendasi)' : studyPreference}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>ID Multi-Perangkat:</span>
              <strong style={{ fontFamily: 'monospace', fontSize: '0.76rem', color: '#10B981' }}>user-tjandra-wilson-live 🟢</strong>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenSupabaseModal}
            className="btn-secondary"
            style={{ marginTop: 'auto', padding: '9px 14px', fontSize: '0.82rem', justifyContent: 'center' }}
          >
            <Database size={15} /> Atur Kredensial Supabase Cloud
          </button>
        </div>

        {/* Right Form Editor */}
        <div className="card" style={{ padding: '26px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 16px 0', color: 'var(--text-main)' }}>
            Perbarui Informasi Profil
          </h3>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>Nama Lengkap</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--border-subtle)', outline: 'none' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--border-subtle)', outline: 'none' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>Tingkatan</label>
                <select
                  value={educationLevel}
                  onChange={(e) => setEducationLevel(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--border-subtle)', outline: 'none', backgroundColor: '#FFFFFF' }}
                >
                  <option value="Siswa SMA/SMK">Siswa SMA/SMK</option>
                  <option value="Mahasiswa">Mahasiswa</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>Kelas / Semester</label>
                <input
                  type="text"
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  placeholder="Kelas 11 atau Semester 4"
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--border-subtle)', outline: 'none' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>Sekolah / Kampus</label>
              <input
                type="text"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--border-subtle)', outline: 'none' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>Jurusan / Program Studi</label>
              <input
                type="text"
                value={major}
                onChange={(e) => setMajor(e.target.value)}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--border-subtle)', outline: 'none' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
              {savedSuccess ? (
                <span style={{ color: '#10B981', fontWeight: 700, fontSize: '0.84rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={16} /> Perubahan berhasil disimpan!
                </span>
              ) : <span />}

              <button
                type="submit"
                className="btn-primary"
                style={{ padding: '9px 20px', fontSize: '0.85rem' }}
              >
                <Save size={15} /> Simpan Perubahan
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
