// src/components/AuthScreen.jsx
import React, { useState } from 'react';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  School,
  GraduationCap,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  BookOpen,
  TrendingUp,
  ArrowRight,
  Search,
  Check,
  Calendar,
} from 'lucide-react';
import { ICTLogo } from './ICTLogo';
import { registerUser, loginUser } from '../services/storage';

export const AuthScreen = ({ isOpen = true, onAuthSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    name: 'Tjandra Wilson',
    email: 'tjandrawilson@mutiarabangsa.sch.id',
    password: 'password123',
    educationLevel: 'Siswa SMA/SMK', // 'Siswa SMA/SMK' | 'Mahasiswa'
    schoolName: 'Mutiara Bangsa 2 School',
    classGrade: 'Kelas 11',
    majorSMA: 'IPA',
    collegeMajor: 'Informatika / Ilmu Komputer / Data Science',
    collegeSemester: 'Semester 4',
    studyPreference: 'balanced',
  });

  // Search filter for school dropdown
  const [schoolSearch, setSchoolSearch] = useState('');

  // Popular schools & universities lists
  const smaSchools = [
    'Mutiara Bangsa 2 School',
    'SMA Negeri 1 Jakarta',
    'SMA Negeri 8 Jakarta',
    'SMA Negeri 3 Bandung',
    'SMA Negeri 5 Surabaya',
    'SMA Katolik St. Louis 1',
    'SMA Labschool Jakarta',
    'SMK Telkom Jakarta',
    'SMK Negeri 2 Bandung',
    'SMA Taruna Nusantara',
    'SMA Bina Nusantara (BINUS School)',
    'SMA Kanisius Jakarta',
  ];

  const universityList = [
    'Universitas Indonesia (UI)',
    'Institut Teknologi Bandung (ITB)',
    'Universitas Gadjah Mada (UGM)',
    'Institut Teknologi Sepuluh Nopember (ITS)',
    'Universitas Bina Nusantara (BINUS)',
    'Universitas Airlangga (UNAIR)',
    'Universitas Diponegoro (UNDIP)',
    'Universitas Padjadjaran (UNPAD)',
    'Telkom University',
    'Universitas Brawijaya (UB)',
    'Universitas Sebelas Maret (UNS)',
    'Universitas Katolik Parahyangan (UNPAR)',
  ];

  const collegeMajors = [
    'Kedokteran & Kesehatan',
    'Informatika / Ilmu Komputer / Data Science',
    'Sistem Informasi / Bisnis Digital',
    'Teknik (Sipil, Elektro, Mesin, Industri)',
    'Manajemen & Akuntansi',
    'Ilmu Komunikasi & Desain Komunikasi Visual (DKV)',
    'Psikologi',
    'Hukum',
    'Hubungan Internasional',
  ];

  const currentSchools =
    formData.educationLevel === 'Siswa SMA/SMK' ? smaSchools : universityList;
  const filteredSchools = currentSchools.filter((s) =>
    s.toLowerCase().includes(schoolSearch.toLowerCase())
  );

  // Password Strength Calculation
  const calculatePasswordStrength = (pwd) => {
    if (!pwd) return { score: 0, text: 'Kosong', color: '#94A3B8' };
    let score = 0;
    if (pwd.length >= 6) score++;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    if (score <= 2) return { score: 25, text: 'Lemah', color: '#EF4444' };
    if (score === 3) return { score: 55, text: 'Cukup', color: '#F59E0B' };
    if (score === 4) return { score: 80, text: 'Kuat', color: '#3B82F6' };
    return { score: 100, text: 'Sangat Kuat', color: '#10B981' };
  };

  const pwdStrength = calculatePasswordStrength(formData.password);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    try {
      if (isSignUp) {
        if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim()) {
          setError('Harap lengkapi semua bidang yang wajib.');
          return;
        }

        const isSMA = formData.educationLevel === 'Siswa SMA/SMK';
        const finalMajor = isSMA ? formData.majorSMA : formData.collegeMajor;
        const finalSemester = isSMA ? formData.classGrade : formData.collegeSemester;

        const newUser = registerUser({
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password,
          educationLevel: formData.educationLevel,
          schoolName: formData.schoolName,
          major: finalMajor,
          semester: finalSemester,
          studyPreference: formData.studyPreference,
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

  // Quick Demo Logins
  const handleQuickLogin = (role) => {
    if (role === 'tjandra') {
      try {
        const user = loginUser('tjandrawilson@mutiarabangsa.sch.id', 'password123', true);
        onAuthSuccess(user);
      } catch {
        // Register if not found
        const user = registerUser({
          name: 'Tjandra Wilson',
          email: 'tjandrawilson@mutiarabangsa.sch.id',
          password: 'password123',
          educationLevel: 'Siswa SMA/SMK',
          schoolName: 'Mutiara Bangsa 2 School',
          major: 'IPA',
          semester: 'Kelas 11',
          rememberMe: true,
        });
        onAuthSuccess(user);
      }
    } else {
      try {
        const user = loginUser('mahasiswa@campus.ac.id', 'password123', true);
        onAuthSuccess(user);
      } catch {
        const user = registerUser({
          name: 'Adrian Pratama',
          email: 'mahasiswa@campus.ac.id',
          password: 'password123',
          educationLevel: 'Mahasiswa',
          schoolName: 'Universitas Indonesia (UI)',
          major: 'Informatika / Ilmu Komputer / Data Science',
          semester: 'Semester 4',
          rememberMe: true,
        });
        onAuthSuccess(user);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 9999,
        backgroundColor: '#040914',
        backgroundImage: `
          radial-gradient(circle at 15% 25%, rgba(29, 104, 254, 0.18) 0%, transparent 45%),
          radial-gradient(circle at 85% 75%, rgba(124, 58, 237, 0.15) 0%, transparent 40%),
          radial-gradient(circle at 50% 50%, rgba(15, 23, 42, 0.6) 0%, #040914 100%)
        `,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        overflowY: 'auto',
      }}
    >
      {/* Decorative Starry Particles */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundSize: '240px 240px',
          backgroundImage: `
            radial-gradient(1.5px 1.5px at 30px 40px, #FFFFFF 100%, transparent),
            radial-gradient(1px 1px at 120px 90px, rgba(255,255,255,0.7) 100%, transparent),
            radial-gradient(1.5px 1.5px at 190px 180px, #FBBF24 100%, transparent),
            radial-gradient(1px 1px at 80px 200px, rgba(255,255,255,0.5) 100%, transparent)
          `,
          opacity: 0.6,
          pointerEvents: 'none',
        }}
      />

      {/* Main Split-Screen Container (Inspired by Image 2) */}
      <div
        style={{
          width: '100%',
          maxWidth: '1020px',
          minHeight: '580px',
          maxHeight: '92vh',
          backgroundColor: '#FFFFFF',
          borderRadius: '24px',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.6), 0 0 40px rgba(29, 104, 254, 0.15)',
          display: 'flex',
          overflow: 'hidden',
          position: 'relative',
          zIndex: 10,
        }}
      >
        {/* ============================================================ */}
        {/* KOLOM KIRI (Brand & Visual Panel - Dark Mode)                */}
        {/* ============================================================ */}
        <div
          style={{
            flex: '1.05',
            background: 'linear-gradient(160deg, #091326 0%, #0D1E45 55%, #081120 100%)',
            padding: '36px 38px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'hidden',
            borderRight: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          {/* Subtle Orbit / Tech Lines SVG in Background */}
          <svg
            style={{
              position: 'absolute',
              right: '-80px',
              top: '-60px',
              width: '420px',
              height: '420px',
              opacity: 0.12,
              pointerEvents: 'none',
            }}
            viewBox="0 0 400 400"
          >
            <circle cx="200" cy="200" r="180" stroke="#60A5FA" strokeWidth="1.5" strokeDasharray="6 8" fill="none" />
            <circle cx="200" cy="200" r="130" stroke="#93C5FD" strokeWidth="1.2" fill="none" />
            <circle cx="200" cy="200" r="80" stroke="#3B82F6" strokeWidth="1" strokeDasharray="4 6" fill="none" />
            <line x1="20" y1="200" x2="380" y2="200" stroke="#60A5FA" strokeWidth="0.8" />
            <line x1="200" y1="20" x2="200" y2="380" stroke="#60A5FA" strokeWidth="0.8" />
          </svg>

          {/* Top Logo */}
          <div style={{ position: 'relative', zIndex: 2 }}>
            <ICTLogo variant="dark" size={40} />
          </div>

          {/* Central Hero Text & 4 Highlight Cards */}
          <div style={{ margin: '28px 0', position: 'relative', zIndex: 2 }}>
            <h1
              style={{
                fontSize: '2.1rem',
                fontWeight: 800,
                color: '#FFFFFF',
                lineHeight: 1.2,
                marginBottom: '10px',
                letterSpacing: '-0.025em',
                fontFamily: "'Outfit', 'Plus Jakarta Sans', sans-serif",
              }}
            >
              Your schedule & productivity, all in one place.
            </h1>
            <p
              style={{
                fontSize: '0.92rem',
                color: '#94A3B8',
                lineHeight: 1.55,
                marginBottom: '26px',
                maxWidth: '430px',
              }}
            >
              Organize your classes, track assignments, and stay focused with AI-powered study tools. Designed for students, unified.
            </p>

            {/* 4 Feature Cards in 2x2 Grid (Glassmorphism) */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '12px',
              }}
            >
              {[
                {
                  icon: Calendar,
                  title: 'Smart Timetable & Reminders',
                  desc: 'Atur jadwal pelajaran & pengingat otomatis',
                },
                {
                  icon: CheckCircle2,
                  title: 'Task & Deadline Tracker',
                  desc: 'Pantau tugas, kuis, dan tenggat waktu',
                },
                {
                  icon: Sparkles,
                  title: 'AI StudyMate Assistant',
                  desc: 'Asisten AI untuk rekomendasi waktu fokus belajar',
                },
                {
                  icon: TrendingUp,
                  title: 'Productivity Analytics',
                  desc: 'Grafik analitik durasi dan perkembangan belajar',
                },
              ].map((feat, i) => {
                const IconComponent = feat.icon;
                return (
                  <div
                    key={i}
                    style={{
                      padding: '12px 14px',
                      borderRadius: '12px',
                      backgroundColor: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      backdropFilter: 'blur(8px)',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '10px',
                      color: '#E2E8F0',
                      transition: 'all 200ms ease',
                      cursor: 'default',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.25)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <div
                      style={{
                        width: '30px',
                        height: '30px',
                        borderRadius: '8px',
                        backgroundColor: 'rgba(29, 104, 254, 0.2)',
                        color: '#60A5FA',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        marginTop: '2px',
                      }}
                    >
                      <IconComponent size={16} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#F8FAFC', lineHeight: 1.25 }}>
                        {feat.title}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#94A3B8', marginTop: '3px', lineHeight: 1.35, fontWeight: 450 }}>
                        {feat.desc}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Credits Footer (Made by Tjandra Xavier Wilson) */}
          <div style={{ position: 'relative', zIndex: 2, borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '16px' }}>
            <p style={{ fontSize: '0.78rem', color: '#CBD5E1', margin: '0 0 3px 0' }}>
              Made by <strong>Tjandra Xavier Wilson</strong>
            </p>
            <p style={{ fontSize: '0.7rem', color: '#64748B', margin: 0 }}>
              Powered by Google Antigravity & Firebase
            </p>
          </div>
        </div>

        {/* ============================================================ */}
        {/* KOLOM KANAN (Form Panel - Clean White)                       */}
        {/* ============================================================ */}
        <div
          style={{
            flex: '1',
            backgroundColor: '#FFFFFF',
            padding: '36px 40px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            overflowY: 'auto',
          }}
        >
          {/* Welcome Header */}
          <div style={{ textAlign: 'center', marginBottom: '22px' }}>
            <h2
              style={{
                fontFamily: "'Outfit', cursive, sans-serif",
                fontSize: '2rem',
                fontWeight: 800,
                color: '#0F172A',
                marginBottom: '4px',
                letterSpacing: '-0.02em',
              }}
            >
              {isSignUp ? 'Create Account' : 'Welcome'}
            </h2>
            <p style={{ fontSize: '0.86rem', color: '#64748B', margin: 0 }}>
              {isSignUp ? 'Mulai kelola jadwal & produktivitas belajarmu' : 'Sign in to continue'}
            </p>
          </div>

          {/* Tab Switcher (Masuk vs Daftar) */}
          <div
            style={{
              display: 'flex',
              backgroundColor: '#F1F5F9',
              borderRadius: '10px',
              padding: '3px',
              marginBottom: '18px',
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
                padding: '8px 0',
                border: 'none',
                borderRadius: '8px',
                backgroundColor: !isSignUp ? '#FFFFFF' : 'transparent',
                color: !isSignUp ? '#1E293B' : '#64748B',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer',
                boxShadow: !isSignUp ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                transition: 'all 180ms ease',
              }}
            >
              Masuk (Sign In)
            </button>
            <button
              type="button"
              onClick={() => {
                setIsSignUp(true);
                setError('');
              }}
              style={{
                flex: 1,
                padding: '8px 0',
                border: 'none',
                borderRadius: '8px',
                backgroundColor: isSignUp ? '#FFFFFF' : 'transparent',
                color: isSignUp ? '#1E293B' : '#64748B',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer',
                boxShadow: isSignUp ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                transition: 'all 180ms ease',
              }}
            >
              Daftar (Register)
            </button>
          </div>

          {/* Continue with Google */}
          <button
            type="button"
            onClick={() => handleQuickLogin('tjandra')}
            style={{
              width: '100%',
              padding: '9px 14px',
              border: '1px solid #E2E8F0',
              borderRadius: '10px',
              backgroundColor: '#FFFFFF',
              color: '#334155',
              fontSize: '0.84rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              cursor: 'pointer',
              marginBottom: '16px',
              transition: 'background-color 150ms ease, border-color 150ms ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F8FAFC')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#FFFFFF')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '16px',
              color: '#94A3B8',
              fontSize: '0.74rem',
            }}
          >
            <div style={{ flex: 1, height: '1px', backgroundColor: '#E2E8F0' }} />
            <span>or with email</span>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#E2E8F0' }} />
          </div>

          {error && (
            <div
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                backgroundColor: '#FEF2F2',
                border: '1px solid #FCA5A5',
                color: '#B91C1C',
                fontSize: '0.78rem',
                marginBottom: '14px',
              }}
            >
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Nama Lengkap (Only for SignUp) */}
            {isSignUp && (
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  Nama Lengkap *
                </label>
                <div style={{ position: 'relative' }}>
                  <User size={15} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Tjandra Wilson"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '9px 12px 9px 36px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '0.84rem',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                Email
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={15} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="email"
                  required
                  placeholder="tjandrawilson@mutiarabangsa.sch.id"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '9px 12px 9px 36px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.84rem',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#334155' }}>
                  Password
                </label>
                {!isSignUp && (
                  <a
                    href="#forgot"
                    onClick={(e) => {
                      e.preventDefault();
                      alert('Silakan gunakan akun demo atau hubungi administrator sekolah.');
                    }}
                    style={{ fontSize: '0.74rem', color: '#2563EB', textDecoration: 'none', fontWeight: 600 }}
                  >
                    Forgot password?
                  </a>
                )}
              </div>
              <div style={{ position: 'relative' }}>
                <Lock size={15} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '9px 38px 9px 36px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.84rem',
                    outline: 'none',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#94A3B8',
                    display: 'flex',
                  }}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>

              {/* Password Strength Indicator (Register only) */}
              {isSignUp && (
                <div style={{ marginTop: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', marginBottom: '2px' }}>
                    <span style={{ color: '#64748B' }}>Kekuatan Sandi:</span>
                    <strong style={{ color: pwdStrength.color }}>{pwdStrength.text}</strong>
                  </div>
                  <div style={{ width: '100%', height: '4px', backgroundColor: '#E2E8F0', borderRadius: '99px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${pwdStrength.score}%`,
                        height: '100%',
                        backgroundColor: pwdStrength.color,
                        transition: 'width 200ms ease',
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* ============================================================ */}
            {/* SECTION 5: DROPDOWN OTOMATIS DATA PENDIDIKAN (REGISTER ONLY) */}
            {/* ============================================================ */}
            {isSignUp && (
              <div
                style={{
                  backgroundColor: '#F8FAFC',
                  padding: '12px',
                  borderRadius: '10px',
                  border: '1px solid #E2E8F0',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}
              >
                {/* 1. Peran / Jenjang Pendidikan Dropdown */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#334155', marginBottom: '3px' }}>
                    1. Peran / Jenjang Pendidikan *
                  </label>
                  <select
                    value={formData.educationLevel}
                    onChange={(e) => {
                      const level = e.target.value;
                      setFormData({
                        ...formData,
                        educationLevel: level,
                        schoolName: level === 'Siswa SMA/SMK' ? smaSchools[0] : universityList[0],
                      });
                    }}
                    style={{
                      width: '100%',
                      padding: '7px 10px',
                      borderRadius: '6px',
                      border: '1px solid #CBD5E1',
                      fontSize: '0.8rem',
                      outline: 'none',
                      backgroundColor: '#FFFFFF',
                    }}
                  >
                    <option value="Siswa SMA/SMK">Siswa SMA/SMK</option>
                    <option value="Mahasiswa">Mahasiswa</option>
                  </select>
                </div>

                {/* 2. Pilihan Sekolah / Perguruan Tinggi (Dropdown Populer + Search) */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#334155', marginBottom: '3px' }}>
                    2. {formData.educationLevel === 'Siswa SMA/SMK' ? 'Sekolah (SMA/SMK)' : 'Perguruan Tinggi'} *
                  </label>
                  <select
                    value={formData.schoolName}
                    onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '7px 10px',
                      borderRadius: '6px',
                      border: '1px solid #CBD5E1',
                      fontSize: '0.8rem',
                      outline: 'none',
                      backgroundColor: '#FFFFFF',
                    }}
                  >
                    {currentSchools.map((sch, i) => (
                      <option key={i} value={sch}>
                        {sch}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 3. Khusus Siswa SMA/SMK: Kelas & Kelompok Jurusan (IPA, IPS, Bahasa, Kejuruan) */}
                {formData.educationLevel === 'Siswa SMA/SMK' ? (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#334155', marginBottom: '3px' }}>
                        Pilihan Kelas
                      </label>
                      <select
                        value={formData.classGrade}
                        onChange={(e) => setFormData({ ...formData, classGrade: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '7px 10px',
                          borderRadius: '6px',
                          border: '1px solid #CBD5E1',
                          fontSize: '0.8rem',
                          outline: 'none',
                          backgroundColor: '#FFFFFF',
                        }}
                      >
                        <option value="Kelas 10">Kelas 10</option>
                        <option value="Kelas 11">Kelas 11</option>
                        <option value="Kelas 12">Kelas 12</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#334155', marginBottom: '3px' }}>
                        Jurusan SMA
                      </label>
                      <select
                        value={formData.majorSMA}
                        onChange={(e) => setFormData({ ...formData, majorSMA: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '7px 10px',
                          borderRadius: '6px',
                          border: '1px solid #CBD5E1',
                          fontSize: '0.8rem',
                          outline: 'none',
                          backgroundColor: '#FFFFFF',
                        }}
                      >
                        <option value="IPA">IPA</option>
                        <option value="IPS">IPS</option>
                        <option value="Bahasa">Bahasa</option>
                        <option value="Kejuruan / SMK">Kejuruan / SMK</option>
                      </select>
                    </div>
                  </div>
                ) : (
                  /* 4. Khusus Mahasiswa: Jurusan Populer Era Saat Ini */
                  <div>
                    <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#334155', marginBottom: '3px' }}>
                      Program Studi / Jurusan Populer
                    </label>
                    <select
                      value={formData.collegeMajor}
                      onChange={(e) => setFormData({ ...formData, collegeMajor: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '7px 10px',
                        borderRadius: '6px',
                        border: '1px solid #CBD5E1',
                        fontSize: '0.8rem',
                        outline: 'none',
                        backgroundColor: '#FFFFFF',
                      }}
                    >
                      {collegeMajors.map((mjr, idx) => (
                        <option key={idx} value={mjr}>
                          {mjr}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}

            {/* Remember me Checkbox (Sign In) */}
            {!isSignUp && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  id="rememberMeCheckbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{ accentColor: '#2563EB', width: '15px', height: '15px', cursor: 'pointer' }}
                />
                <label
                  htmlFor="rememberMeCheckbox"
                  style={{ fontSize: '0.8rem', color: '#475569', cursor: 'pointer' }}
                >
                  Remember me
                </label>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              style={{
                width: '100%',
                padding: '11px',
                borderRadius: '8px',
                backgroundColor: '#1D68FE',
                color: '#FFFFFF',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.88rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(29, 104, 254, 0.35)',
                transition: 'all 180ms ease',
                marginTop: '4px',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#1856D1')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#1D68FE')}
            >
              <span>{isSignUp ? 'Daftar Akun Baru' : 'Sign in'}</span>
              <ArrowRight size={16} />
            </button>
          </form>

          {/* Toggle bottom link */}
          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <span style={{ fontSize: '0.8rem', color: '#64748B' }}>
              {isSignUp ? 'Sudah memiliki akun?' : "Don't have an account?"}{' '}
            </span>
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#2563EB',
                fontWeight: 700,
                fontSize: '0.8rem',
                cursor: 'pointer',
                padding: 0,
              }}
            >
              {isSignUp ? 'Sign in' : 'Create one'}
            </button>
          </div>

          {/* Quick Demo Fast Login Badges */}
          <div style={{ marginTop: '18px', paddingTop: '12px', borderTop: '1px solid #F1F5F9', textAlign: 'center' }}>
            <span style={{ fontSize: '0.7rem', color: '#94A3B8', display: 'block', marginBottom: '6px' }}>
              Akses Cepat Pengujian (1-Klik):
            </span>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => handleQuickLogin('tjandra')}
                className="btn-ghost"
                style={{
                  fontSize: '0.72rem',
                  padding: '4px 10px',
                  backgroundColor: '#EFF6FF',
                  color: '#2563EB',
                  border: '1px solid #BFDBFE',
                  borderRadius: '6px',
                }}
              >
                🏫 Tjandra (SMA IPA)
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('mahasiswa')}
                className="btn-ghost"
                style={{
                  fontSize: '0.72rem',
                  padding: '4px 10px',
                  backgroundColor: '#F0FDF4',
                  color: '#15803D',
                  border: '1px solid #BBF7D0',
                  borderRadius: '6px',
                }}
              >
                🎓 Mahasiswa (UI Informatika)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Outside Footer Copyright */}
      <div
        style={{
          marginTop: '16px',
          textAlign: 'center',
          color: '#64748B',
          fontSize: '0.72rem',
          position: 'relative',
          zIndex: 10,
        }}
      >
        © 2026 CodeStack Schedule · v1.3.57. All rights reserved.
      </div>
    </div>
  );
};
