// src/components/AuthModal.jsx
import React, { useState } from 'react';
import { LogIn, UserPlus, Sparkles, Check, School, BookOpen, Clock, ShieldCheck } from 'lucide-react';
import { registerUser, loginUser } from '../services/storage';

export const AuthModal = ({ isOpen, onClose, onAuthSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    educationLevel: 'Kuliah', // 'SMA' or 'Kuliah'
    major: 'Teknik Informatika',
    semester: 'Semester 4',
    studyPreference: 'balanced', // 'morning', 'night', 'balanced'
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    try {
      if (isSignUp) {
        if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim()) {
          setError('Harap lengkapi semua data wajib (Nama, Email, Password).');
          return;
        }
        if (formData.password.length < 4) {
          setError('Kata sandi minimal 4 karakter.');
          return;
        }

        const newUser = registerUser({
          ...formData,
          rememberMe,
        });
        onAuthSuccess(newUser);
      } else {
        if (!formData.email.trim() || !formData.password.trim()) {
          setError('Harap masukkan email dan kata sandi.');
          return;
        }

        const user = loginUser(formData.email, formData.password, rememberMe);
        onAuthSuccess(user);
      }
    } catch (err) {
      setError(err.message || 'Terjadi kesalahan autentikasi.');
    }
  };

  // Demo auto-fill helper for fast testing
  const handleQuickDemo = (role) => {
    if (role === 'kuliah') {
      setFormData({
        name: 'Aulia Rahma Putri',
        email: 'aulia.rahma@student.ac.id',
        password: 'password123',
        educationLevel: 'Kuliah',
        major: 'Teknik Informatika',
        semester: 'Semester 4',
        studyPreference: 'night',
      });
      setIsSignUp(true);
    } else {
      setFormData({
        name: 'Dimas Pratama',
        email: 'dimas.sma@pelajar.sch.id',
        password: 'password123',
        educationLevel: 'SMA',
        major: 'MIPA (Ilmu Alam)',
        semester: 'Kelas 11',
        studyPreference: 'morning',
      });
      setIsSignUp(true);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '480px', padding: '28px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div
            style={{
              width: '54px',
              height: '54px',
              borderRadius: '16px',
              background: 'var(--pastel-lavender-bg)',
              color: 'var(--pastel-lavender-text)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px',
              border: '1px solid var(--pastel-lavender-border)',
            }}
          >
            <Sparkles size={28} />
          </div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '4px' }}>
            {isSignUp ? 'Daftar Akun Baru' : 'Selamat Datang Kembali!'}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            {isSignUp
              ? 'Atur jadwal kuliah & sekolahmu dengan rapi dan tenang 🌱'
              : 'Masuk untuk mengakses jadwal, tugas, dan rekomendasi AI'}
          </p>
        </div>

        {/* Tab switch Login / Sign Up */}
        <div
          style={{
            display: 'flex',
            background: 'var(--bg-card-subtle)',
            padding: '4px',
            borderRadius: 'var(--radius-md)',
            marginBottom: '20px',
          }}
        >
          <button
            type="button"
            onClick={() => {
              setIsSignUp(false);
              setError('');
            }}
            style={{
              flex: 1,
              padding: '8px',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              background: !isSignUp ? '#FFFFFF' : 'transparent',
              fontWeight: 600,
              fontSize: '0.9rem',
              color: !isSignUp ? 'var(--text-main)' : 'var(--text-muted)',
              boxShadow: !isSignUp ? 'var(--shadow-sm)' : 'none',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
            }}
          >
            Masuk
          </button>
          <button
            type="button"
            onClick={() => {
              setIsSignUp(true);
              setError('');
            }}
            style={{
              flex: 1,
              padding: '8px',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              background: isSignUp ? '#FFFFFF' : 'transparent',
              fontWeight: 600,
              fontSize: '0.9rem',
              color: isSignUp ? 'var(--text-main)' : 'var(--text-muted)',
              boxShadow: isSignUp ? 'var(--shadow-sm)' : 'none',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
            }}
          >
            Daftar Baru
          </button>
        </div>

        {error && (
          <div
            style={{
              background: 'var(--pastel-peach-bg)',
              border: '1px solid var(--pastel-peach-border)',
              color: 'var(--pastel-peach-text)',
              padding: '10px 14px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.85rem',
              marginBottom: '16px',
            }}
          >
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Sign Up Fields */}
          {isSignUp && (
            <>
              {/* Nama Lengkap */}
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                  Nama Lengkap Panggilan
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Cth: Aulia Rahma"
                  required
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '0.95rem',
                    outline: 'none',
                  }}
                />
              </div>

              {/* Jenjang: SMA vs Kuliah */}
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                  Jenjang Pendidikan
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((p) => ({
                        ...p,
                        educationLevel: 'SMA',
                        major: 'MIPA (Ilmu Alam)',
                        semester: 'Kelas 11',
                      }))
                    }
                    style={{
                      padding: '8px',
                      borderRadius: 'var(--radius-sm)',
                      border: `1.5px solid ${formData.educationLevel === 'SMA' ? 'var(--pastel-lavender-text)' : 'var(--border-subtle)'}`,
                      background: formData.educationLevel === 'SMA' ? 'var(--pastel-lavender-bg)' : '#FFFFFF',
                      color: formData.educationLevel === 'SMA' ? 'var(--pastel-lavender-text)' : 'var(--text-muted)',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                    }}
                  >
                    <School size={16} /> SMA / SMK
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((p) => ({
                        ...p,
                        educationLevel: 'Kuliah',
                        major: 'Teknik Informatika',
                        semester: 'Semester 4',
                      }))
                    }
                    style={{
                      padding: '8px',
                      borderRadius: 'var(--radius-sm)',
                      border: `1.5px solid ${formData.educationLevel === 'Kuliah' ? 'var(--pastel-lavender-text)' : 'var(--border-subtle)'}`,
                      background: formData.educationLevel === 'Kuliah' ? 'var(--pastel-lavender-bg)' : '#FFFFFF',
                      color: formData.educationLevel === 'Kuliah' ? 'var(--pastel-lavender-text)' : 'var(--text-muted)',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                    }}
                  >
                    <BookOpen size={16} /> Mahasiswa / Kuliah
                  </button>
                </div>
              </div>

              {/* Jurusan / Peminatan & Semester */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '10px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                    Jurusan / Peminatan
                  </label>
                  <input
                    type="text"
                    name="major"
                    value={formData.major}
                    onChange={handleChange}
                    placeholder={formData.educationLevel === 'SMA' ? 'Cth: MIPA / IPS' : 'Cth: Teknik Informatika'}
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
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                    Tingkat / Semester
                  </label>
                  <input
                    type="text"
                    name="semester"
                    value={formData.semester}
                    onChange={handleChange}
                    placeholder={formData.educationLevel === 'SMA' ? 'Cth: Kelas 11' : 'Cth: Semester 4'}
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
              </div>

              {/* Preferensi Belajar (AI Recommender Base) */}
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                  Preferensi Waktu Fokus (Untuk Rekomendasi AI)
                </label>
                <select
                  name="studyPreference"
                  value={formData.studyPreference}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '0.9rem',
                    background: '#FFFFFF',
                  }}
                >
                  <option value="balanced">⚖️ Seimbang (Fleksibel Siang & Malam)</option>
                  <option value="morning">🌅 Morning Lark (Fokus Paling Tinggi di Pagi Hari)</option>
                  <option value="night">🌙 Night Owl (Lebih Konsentrasi di Malam Hari)</option>
                </select>
              </div>
            </>
          )}

          {/* Email */}
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
              Alamat Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="nama@student.ac.id"
              required
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
                fontSize: '0.95rem',
                outline: 'none',
              }}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
              Kata Sandi
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Minimal 4 karakter"
              required
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
                fontSize: '0.95rem',
                outline: 'none',
              }}
            />
          </div>

          {/* Remember Me Checkbox */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px',
              padding: '10px 12px',
              background: 'var(--bg-card-subtle)',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.88rem',
                cursor: 'pointer',
                fontWeight: 500,
                color: 'var(--text-main)',
              }}
            >
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{
                  width: '16px',
                  height: '16px',
                  accentColor: 'var(--pastel-lavender-text)',
                  cursor: 'pointer',
                }}
              />
              <span>Ingat Saya di Perangkat Ini (Remember Me)</span>
            </label>
            <ShieldCheck size={16} color="var(--pastel-mint-text)" />
          </div>

          {/* Submit Button */}
          <button type="submit" className="btn-primary" style={{ width: '100%', padding: '12px' }}>
            {isSignUp ? <UserPlus size={18} /> : <LogIn size={18} />}
            {isSignUp ? 'Daftar & Buat Jadwal Otomatis' : 'Masuk ke Dashboard'}
          </button>
        </form>

        {/* Demo Quick Fill for Review/Testing */}
        <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px dashed var(--border-subtle)' }}>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '8px', textAlign: 'center' }}>
            ⚡ Demo Cepat (Klik untuk mengisi data otomatis):
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <button
              type="button"
              className="btn-ghost"
              onClick={() => handleQuickDemo('kuliah')}
              style={{ fontSize: '0.78rem', border: '1px solid var(--border-subtle)', background: '#FFFFFF' }}
            >
              🎓 Akun Mahasiswa IT
            </button>
            <button
              type="button"
              className="btn-ghost"
              onClick={() => handleQuickDemo('sma')}
              style={{ fontSize: '0.78rem', border: '1px solid var(--border-subtle)', background: '#FFFFFF' }}
            >
              🏫 Akun Siswa SMA MIPA
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
