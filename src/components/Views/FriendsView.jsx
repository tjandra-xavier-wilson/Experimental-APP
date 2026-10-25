// src/components/Views/FriendsView.jsx
import React, { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  Trash2,
  Edit3,
  Sparkles,
  BookOpen,
  Target,
  CheckCircle2,
  Clock,
  GraduationCap,
  Award,
  ShieldCheck,
  HeartHandshake,
  Search,
  AlertCircle,
  CheckCircle,
  RefreshCw,
} from 'lucide-react';
import { ConfirmDeleteModal } from '../ConfirmDeleteModal';
import { ProfileCustomizeModal } from '../ProfileCustomizeModal';
import { fetchRegisteredProfiles } from '../../services/supabaseService';
import { isSupabaseConfigured } from '../../services/supabaseClient';

export const FriendsView = ({
  friends = [],
  onAddFriend,
  onDeleteFriend,
  currentUser,
  onUpdateUser,
  tasks = [],
  userName = 'Tjandra Wilson',
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCustomizeModal, setShowCustomizeModal] = useState(false);
  const [friendToDelete, setFriendToDelete] = useState(null);

  // New friend form & server lookup states
  const [newFriendName, setNewFriendName] = useState('');
  const [serverProfiles, setServerProfiles] = useState([]);
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(false);

  const loadServerProfiles = async () => {
    setIsLoadingProfiles(true);
    try {
      if (isSupabaseConfigured()) {
        const profiles = await fetchRegisteredProfiles(currentUser?.id);
        setServerProfiles(profiles);
      }
    } catch (err) {
      console.warn('Failed to load registered profiles:', err);
    } finally {
      setIsLoadingProfiles(false);
    }
  };

  useEffect(() => {
    if (showAddModal) {
      loadServerProfiles();
    }
  }, [showAddModal]);

  // Compute live task progress for user's own card
  const totalMyTasks = tasks.length || 0;
  const completedMyTasks = tasks.filter((t) => t.isCompleted).length;
  const myProgressPercent =
    totalMyTasks > 0 ? Math.round((completedMyTasks / totalMyTasks) * 100) : 0;

  const nearestTask = tasks.find((t) => !t.isCompleted);

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

  // Filter server profiles based on input
  const queryTrimmed = newFriendName.trim().toLowerCase();
  const matchedProfiles = queryTrimmed
    ? serverProfiles.filter(
        (p) =>
          p.name?.toLowerCase().includes(queryTrimmed) ||
          p.email?.toLowerCase().includes(queryTrimmed) ||
          p.schoolName?.toLowerCase().includes(queryTrimmed)
      )
    : [];

  const isNotFound = queryTrimmed.length >= 2 && matchedProfiles.length === 0;

  const handleAddVerifiedFriend = (profile) => {
    if (!profile) return;
    if (onAddFriend) {
      onAddFriend({
        id: `frd-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name: profile.name,
        major: profile.major || 'IPA',
        schoolName: profile.schoolName || 'Mutiara Bangsa 2 School',
        semester: profile.semester || 'Kelas 11',
        avatarBg: profile.avatarBg || '#8B5CF6',
        progress: 0,
        completedTasks: 0,
        totalTasks: 0,
        status: profile.status || 'Sedang Belajar 📚',
        nearestTaskTitle: 'Tugas Belajar Mandiri',
        nearestTaskDue: 'Hari ini, 23:59 WIB',
        nearestTaskCourse: profile.major || 'Umum',
      });
    }
    setNewFriendName('');
    setShowAddModal(false);
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!queryTrimmed) return;
    if (matchedProfiles.length > 0) {
      handleAddVerifiedFriend(matchedProfiles[0]);
    }
  };

  const userAvatarBg = currentUser?.avatarBg || '#8E94F2';
  const userDisplayName = currentUser?.name || userName || 'Tjandra Wilson';
  const userStatus = currentUser?.status || 'Sedang Belajar 📚';
  const userBio =
    currentUser?.bio || 'Fokus target nilai 95+ dan konsisten belajar setiap hari!';
  const userTarget = currentUser?.target || 'UTBK & Nilai Rapor Unggul';
  const userMajor = currentUser?.major || 'IPA';
  const userSemester = currentUser?.semester || 'Kelas 11';
  const userSchool = currentUser?.schoolName || 'Mutiara Bangsa 2 School';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* 1. Header Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #6D28D9 0%, #7C3AED 50%, #8B5CF6 100%)',
          borderRadius: 'var(--radius-lg)',
          padding: '26px 32px',
          color: '#FFFFFF',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '18px',
          boxShadow: '0 10px 25px -5px rgba(109, 40, 217, 0.3)',
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
              <Users size={13} color="#EDE9FE" /> STUDY BUDDY & SYNC NETWORK
            </span>
            <span style={{ fontSize: '0.78rem', color: '#EDE9FE' }}>
              · {friends.length} Rekan Terhubung
            </span>
          </div>
          <h1
            style={{
              fontSize: '1.65rem',
              fontWeight: 800,
              margin: '0 0 6px 0',
              letterSpacing: '-0.5px',
            }}
          >
            Komunitas & Teman Belajar
          </h1>
          <p style={{ margin: 0, fontSize: '0.88rem', color: '#F5F3FF', maxWidth: '580px' }}>
            Saling pantau progres belajar, sesuaikan profil kartu publik Anda, dan capai target
            akademik bersama rekan sekelas.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setShowCustomizeModal(true)}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.18)',
              color: '#FFFFFF',
              border: '1.5px solid rgba(255, 255, 255, 0.4)',
              backdropFilter: 'blur(8px)',
              padding: '10px 18px',
              borderRadius: 'var(--radius-md)',
              fontWeight: 700,
              fontSize: '0.86rem',
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <Edit3 size={15} /> Sesuaikan Profil Saya
          </button>

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            style={{
              backgroundColor: '#FFFFFF',
              color: '#5B21B6',
              border: 'none',
              padding: '10px 20px',
              borderRadius: 'var(--radius-md)',
              fontWeight: 700,
              fontSize: '0.86rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(0,0,0,0.12)',
            }}
          >
            <Plus size={16} color="#6D28D9" /> + Tambah Rekan Belajar
          </button>
        </div>
      </div>

      {/* 2. My Public Profile Card (Featured at Top) */}
      <div
        className="card"
        style={{
          padding: '24px',
          borderRadius: '16px',
          border: '1.5px solid #DDD6FE',
          background: 'linear-gradient(180deg, #FAF5FF 0%, #FFFFFF 100%)',
          boxShadow: '0 4px 20px -2px rgba(124, 58, 237, 0.08)',
          borderTop: `5px solid ${userAvatarBg}`,
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: '16px',
            marginBottom: '18px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                backgroundColor: userAvatarBg,
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.35rem',
                fontWeight: 800,
                boxShadow: `0 6px 16px ${userAvatarBg}55`,
                flexShrink: 0,
              }}
            >
              {getInitials(userDisplayName)}
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span
                  style={{
                    backgroundColor: '#EDE9FE',
                    color: '#6D28D9',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    letterSpacing: '0.5px',
                  }}
                >
                  PROFIL PUBLIK SAYA (DILIHAT REKAN)
                </span>
              </div>
              <h2
                style={{
                  fontSize: '1.35rem',
                  fontWeight: 800,
                  margin: '4px 0 2px 0',
                  color: 'var(--text-main)',
                }}
              >
                {userDisplayName}
              </h2>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                {userMajor} · {userSemester} • {userSchool}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowCustomizeModal(true)}
            style={{
              border: '1px solid #C4B5FD',
              backgroundColor: '#FFFFFF',
              color: '#6D28D9',
              borderRadius: '8px',
              padding: '7px 14px',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 6px rgba(109, 40, 217, 0.08)',
            }}
          >
            <Edit3 size={14} /> Edit Tampilan Profil
          </button>
        </div>

        {/* Bio, Status, and Targets */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '16px',
            paddingTop: '12px',
            borderTop: '1px solid #EDE9FE',
          }}
        >
          <div>
            <div
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: 'var(--text-muted)',
                marginBottom: '6px',
              }}
            >
              STATUS AKTIVITAS BELAJAR
            </div>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: '#EDE9FE',
                color: '#5B21B6',
                padding: '5px 14px',
                borderRadius: '20px',
                fontSize: '0.82rem',
                fontWeight: 700,
                border: '1px solid #DDD6FE',
              }}
            >
              <Sparkles size={13} /> {userStatus}
            </span>

            {userBio && (
              <p
                style={{
                  margin: '10px 0 0 0',
                  fontSize: '0.82rem',
                  color: 'var(--text-main)',
                  fontStyle: 'italic',
                  lineHeight: '1.4',
                }}
              >
                "{userBio}"
              </p>
            )}
          </div>

          <div>
            <div
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: 'var(--text-muted)',
                marginBottom: '6px',
              }}
            >
              TARGET & PROGRES SINKRONISASI
            </div>
            {userTarget && (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#FEF3C7',
                  color: '#92400E',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '0.76rem',
                  fontWeight: 700,
                  marginBottom: '10px',
                }}
              >
                <Target size={12} /> {userTarget}
              </div>
            )}

            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.78rem',
                  marginBottom: '6px',
                }}
              >
                <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Tugas Saya Hari Ini</span>
                <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                  {completedMyTasks} / {totalMyTasks} ({myProgressPercent}%)
                </span>
              </div>
              <div
                style={{
                  width: '100%',
                  height: '8px',
                  backgroundColor: '#E2E8F0',
                  borderRadius: '4px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${myProgressPercent}%`,
                    height: '100%',
                    backgroundColor: userAvatarBg,
                    borderRadius: '4px',
                    transition: 'width 0.3s ease',
                  }}
                />
              </div>
            </div>

            {nearestTask && (
              <div
                style={{
                  marginTop: '10px',
                  fontSize: '0.76rem',
                  color: 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                }}
              >
                <Clock size={12} /> Fokus Terdekat: <strong>{nearestTask.title}</strong>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. Friends List Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '6px',
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
            Daftar Rekan Belajar ({friends.length})
          </h2>
          <p style={{ margin: '2px 0 0 0', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Semua rekan di bawah terhubung dan tersinkronisasi otomatis lintas perangkat.
          </p>
        </div>
      </div>

      {/* 4. Friends Grid */}
      {friends.length === 0 ? (
        <div
          className="card"
          style={{
            padding: '52px 24px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
            borderRadius: '16px',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: '#EDE9FE',
              color: '#7C3AED',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <HeartHandshake size={32} />
          </div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
            Belum Ada Rekan Belajar Ditambahkan
          </h3>
          <p
            style={{
              margin: 0,
              fontSize: '0.86rem',
              color: 'var(--text-muted)',
              maxWidth: '440px',
              lineHeight: '1.45',
            }}
          >
            Daftar teman kini bersih tanpa data dummy. Klik tombol di bawah untuk menambahkan teman
            sekelas atau rekan kelompok belajar Anda.
          </p>
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="btn-primary"
            style={{
              marginTop: '8px',
              fontSize: '0.86rem',
              padding: '9px 20px',
              backgroundColor: '#7C3AED',
              borderColor: '#7C3AED',
            }}
          >
            <Plus size={16} /> + Tambah Rekan Belajar Sekarang
          </button>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '18px',
          }}
        >
          {friends.map((friend) => (
            <div
              key={friend.id}
              className="card"
              style={{
                padding: '22px',
                borderRadius: '16px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '16px',
                borderTop: `4px solid ${friend.avatarBg || '#8B5CF6'}`,
                position: 'relative',
                boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease',
              }}
            >
              <div>
                {/* Header row with Avatar, Name, and Delete Button */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: '10px',
                    marginBottom: '12px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        width: '46px',
                        height: '46px',
                        borderRadius: '50%',
                        backgroundColor: friend.avatarBg || '#8B5CF6',
                        color: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1rem',
                        fontWeight: 800,
                        boxShadow: `0 3px 10px ${friend.avatarBg || '#8B5CF6'}44`,
                      }}
                    >
                      {friend.initials || 'FR'}
                    </div>
                    <div>
                      <h3
                        style={{
                          fontSize: '1.05rem',
                          fontWeight: 800,
                          margin: '0 0 2px 0',
                          color: 'var(--text-main)',
                        }}
                      >
                        {friend.name}
                      </h3>
                      <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                        {friend.major} · {friend.semester || 'Kelas 11'}
                      </div>
                    </div>
                  </div>

                  {/* Delete Friend Button */}
                  {onDeleteFriend && (
                    <button
                      type="button"
                      onClick={() => setFriendToDelete(friend)}
                      title="Hapus Rekan Belajar"
                      style={{
                        border: 'none',
                        background: '#FEE2E2',
                        color: '#DC2626',
                        borderRadius: '8px',
                        padding: '6px 8px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'background-color 0.15s ease',
                      }}
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>

                {/* Status pill */}
                <div style={{ marginBottom: '14px' }}>
                  <span
                    className="pastel-badge badge-lavender"
                    style={{ fontSize: '0.74rem', padding: '3px 10px', fontWeight: 600 }}
                  >
                    {friend.status || 'Sedang Belajar 📚'}
                  </span>
                </div>

                {/* Progress bar */}
                <div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '0.78rem',
                      marginBottom: '6px',
                    }}
                  >
                    <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>
                      Progres Tugas Hari Ini
                    </span>
                    <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                      {friend.completedTasks || 0} / {friend.totalTasks || 0} ({friend.progress || 0}%)
                    </span>
                  </div>
                  <div
                    style={{
                      width: '100%',
                      height: '8px',
                      backgroundColor: '#F1F5F9',
                      borderRadius: '4px',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: `${friend.progress || 0}%`,
                        height: '100%',
                        backgroundColor: friend.avatarBg || '#8B5CF6',
                        borderRadius: '4px',
                      }}
                    />
                  </div>
                </div>

                {/* Nearest Task preview */}
                {friend.nearestTask && (
                  <div
                    style={{
                      marginTop: '14px',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      backgroundColor: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      fontSize: '0.76rem',
                    }}
                  >
                    <span
                      style={{
                        color: 'var(--text-muted)',
                        display: 'block',
                        marginBottom: '2px',
                      }}
                    >
                      Sedang Mengerjakan:
                    </span>
                    <strong style={{ color: 'var(--text-main)' }}>
                      {friend.nearestTask.title || 'Tugas Studi Kasus'}
                    </strong>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Friend Modal (Server Verified Realtime) */}
      {showAddModal && (
        <div
          className="modal-overlay"
          style={{
            zIndex: 110,
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
              maxWidth: '480px',
              width: '100%',
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              padding: '24px',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div>
                <h3
                  style={{
                    margin: 0,
                    fontSize: '1.2rem',
                    fontWeight: 800,
                    color: '#1E293B',
                  }}
                >
                  Hubungkan Rekan Belajar
                </h3>
                <p style={{ margin: '3px 0 0 0', fontSize: '0.78rem', color: '#64748B' }}>
                  Realtime sync database Supabase · Hanya pengguna terdaftar
                </p>
              </div>
              <button
                type="button"
                onClick={loadServerProfiles}
                disabled={isLoadingProfiles}
                title="Muat Ulang Data Server"
                style={{
                  background: '#F1F5F9',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '6px 10px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.74rem',
                  color: '#475569',
                  fontWeight: 600,
                }}
              >
                <RefreshCw size={13} className={isLoadingProfiles ? 'animate-spin' : ''} />
                Refresh
              </button>
            </div>

            <form onSubmit={handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    marginBottom: '6px',
                    color: '#334155',
                  }}
                >
                  Cari Nama atau Email Rekan di Server
                </label>
                <div style={{ position: 'relative' }}>
                  <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    required
                    placeholder="Ketik nama atau email rekan (contoh: Kevin / adik)..."
                    value={newFriendName}
                    onChange={(e) => setNewFriendName(e.target.value)}
                    autoFocus
                    style={{
                      width: '100%',
                      padding: '10px 12px 10px 38px',
                      borderRadius: '10px',
                      border: isNotFound ? '2px solid #EF4444' : '1.5px solid #CBD5E1',
                      outline: 'none',
                      fontSize: '0.88rem',
                      transition: 'border-color 0.15s ease',
                    }}
                  />
                </div>
              </div>

              {/* RED ERROR MESSAGE IF NAME NOT REGISTERED ON SERVER */}
              {isNotFound && (
                <div
                  style={{
                    padding: '12px 14px',
                    backgroundColor: '#FEF2F2',
                    border: '1.5px solid #F87171',
                    borderRadius: '10px',
                    color: '#DC2626',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                    animation: 'fadeIn 0.2s ease',
                  }}
                >
                  <AlertCircle size={18} color="#DC2626" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#B91C1C' }}>
                      Nama &quot;{newFriendName}&quot; Tidak Ditemukan di Server!
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#EF4444', marginTop: '3px', lineHeight: 1.4, fontWeight: 500 }}>
                      Hanya pengguna yang sudah terdaftar (register) di server database yang dapat ditambahkan sebagai rekan belajar.
                      Pastikan rekan atau adik Anda sudah mendaftar akun di aplikasi ini terlebih dahulu.
                    </div>
                  </div>
                </div>
              )}

              {/* MATCHED PROFILES LIST */}
              {queryTrimmed && matchedProfiles.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
                  <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#15803D' }}>
                    Ditemukan {matchedProfiles.length} Rekan Terdaftar:
                  </span>
                  {matchedProfiles.map((p) => {
                    const alreadyFriend = friends.some((f) => f.name?.toLowerCase() === p.name?.toLowerCase());
                    return (
                      <div
                        key={p.id}
                        style={{
                          padding: '10px 12px',
                          backgroundColor: '#F0FDF4',
                          border: '1.5px solid #BBF7D0',
                          borderRadius: '10px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '10px',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                          <div
                            style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '50%',
                              backgroundColor: p.avatarBg || '#7C3AED',
                              color: '#FFFFFF',
                              fontWeight: 800,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.82rem',
                              flexShrink: 0,
                            }}
                          >
                            {getInitials(p.name)}
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontWeight: 700, fontSize: '0.86rem', color: '#166534', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {p.name}
                            </div>
                            <div style={{ fontSize: '0.74rem', color: '#15803D', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {p.schoolName} · {p.major} ({p.semester})
                            </div>
                          </div>
                        </div>

                        {alreadyFriend ? (
                          <span style={{ fontSize: '0.74rem', color: '#166534', fontWeight: 700, padding: '4px 8px', backgroundColor: '#DCFCE7', borderRadius: '6px', flexShrink: 0 }}>
                            ✓ Terhubung
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleAddVerifiedFriend(p)}
                            style={{
                              backgroundColor: '#16A34A',
                              color: '#FFFFFF',
                              border: 'none',
                              borderRadius: '8px',
                              padding: '6px 12px',
                              fontSize: '0.78rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              flexShrink: 0,
                            }}
                          >
                            + Hubungkan
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* BROWSE ALL REGISTERED PROFILES ON SERVER */}
              {!queryTrimmed && (
                <div style={{ marginTop: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.76rem', fontWeight: 700, color: '#475569' }}>
                      Pengguna Terdaftar di Server ({serverProfiles.length}):
                    </span>
                    <span style={{ fontSize: '0.7rem', color: '#94A3B8' }}>Klik untuk hubungkan</span>
                  </div>

                  {serverProfiles.length === 0 ? (
                    <div style={{ padding: '16px', textAlign: 'center', fontSize: '0.8rem', color: '#94A3B8', border: '1px dashed #CBD5E1', borderRadius: '10px' }}>
                      {isLoadingProfiles ? 'Memeriksa database server...' : 'Belum ada pengguna lain terdaftar di server.'}
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px', overflowY: 'auto' }}>
                      {serverProfiles.map((p) => {
                        const alreadyFriend = friends.some((f) => f.name?.toLowerCase() === p.name?.toLowerCase());
                        return (
                          <div
                            key={p.id}
                            style={{
                              padding: '8px 12px',
                              backgroundColor: '#F8FAFC',
                              border: '1px solid #E2E8F0',
                              borderRadius: '8px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: '10px',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                              <div
                                style={{
                                  width: '30px',
                                  height: '30px',
                                  borderRadius: '50%',
                                  backgroundColor: p.avatarBg || '#8E94F2',
                                  color: '#FFFFFF',
                                  fontWeight: 700,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '0.76rem',
                                  flexShrink: 0,
                                }}
                              >
                                {getInitials(p.name)}
                              </div>
                              <div style={{ minWidth: 0 }}>
                                <div style={{ fontWeight: 600, fontSize: '0.82rem', color: '#1E293B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {p.name}
                                </div>
                                <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
                                  {p.schoolName} · {p.major}
                                </div>
                              </div>
                            </div>

                            {alreadyFriend ? (
                              <span style={{ fontSize: '0.72rem', color: '#16A34A', fontWeight: 600 }}>
                                ✓ Berteman
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleAddVerifiedFriend(p)}
                                style={{
                                  backgroundColor: '#7C3AED',
                                  color: '#FFFFFF',
                                  border: 'none',
                                  borderRadius: '6px',
                                  padding: '5px 10px',
                                  fontSize: '0.74rem',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                }}
                              >
                                + Hubungkan
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '8px',
                  marginTop: '12px',
                  paddingTop: '10px',
                  borderTop: '1px solid #F1F5F9',
                }}
              >
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn-secondary"
                  style={{ padding: '8px 14px', fontSize: '0.84rem' }}
                >
                  Tutup
                </button>
                {matchedProfiles.length > 0 && (
                  <button
                    type="submit"
                    className="btn-primary"
                    style={{
                      padding: '8px 18px',
                      fontSize: '0.84rem',
                      backgroundColor: '#16A34A',
                      borderColor: '#16A34A',
                    }}
                  >
                    Hubungkan ({matchedProfiles[0].name})
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Friend Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={Boolean(friendToDelete)}
        onClose={() => setFriendToDelete(null)}
        onConfirm={() => {
          if (friendToDelete && onDeleteFriend) {
            onDeleteFriend(friendToDelete.id);
            setFriendToDelete(null);
          }
        }}
        title="Hapus Rekan Belajar?"
        itemName={friendToDelete ? friendToDelete.name : ''}
        itemType="rekan belajar"
        description={`Apakah Anda yakin ingin menghapus ${friendToDelete?.name || 'rekan'} dari daftar rekan belajar Anda? Data ini akan dihapus secara permanen dari perangkat dan cloud database.`}
      />

      {/* Profile Customization Modal */}
      <ProfileCustomizeModal
        isOpen={showCustomizeModal}
        onClose={() => setShowCustomizeModal(false)}
        currentUser={currentUser}
        tasks={tasks}
        onSaveProfile={onUpdateUser}
      />
    </div>
  );
};

export default FriendsView;
