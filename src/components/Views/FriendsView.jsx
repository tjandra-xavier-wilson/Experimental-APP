// src/components/Views/FriendsView.jsx
import React, { useState } from 'react';
import {
  Users,
  Plus,
  BookOpen,
  CheckCircle2,
  Clock,
  Sparkles,
  Flame,
  Award,
} from 'lucide-react';

export const FriendsView = ({
  friends = [],
  onAddFriend,
  userName = 'Tjandra Wilson',
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newFriendName, setNewFriendName] = useState('');
  const [newFriendMajor, setNewFriendMajor] = useState('IPA');
  const [newFriendSchool, setNewFriendSchool] = useState('Mutiara Bangsa 2 School');

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newFriendName.trim()) return;

    if (onAddFriend) {
      onAddFriend({
        name: newFriendName.trim(),
        major: newFriendMajor,
        schoolName: newFriendSchool,
        progress: 35,
        completedTasks: 1,
        totalTasks: 4,
        status: 'Sedang Belajar 📚',
        nearestTaskTitle: 'Tugas Pendalaman Materi',
      });
    }

    setNewFriendName('');
    setShowAddModal(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* 1. Header Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #7C3AED 0%, #8B5CF6 50%, #A78BFA 100%)',
          borderRadius: 'var(--radius-lg)',
          padding: '26px 32px',
          color: '#FFFFFF',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '18px',
          boxShadow: '0 8px 24px -4px rgba(124, 58, 237, 0.25)',
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
              <Users size={13} color="#EDE9FE" /> STUDY BUDDY NETWORK
            </span>
            <span style={{ fontSize: '0.78rem', color: '#EDE9FE' }}>
              · {friends.length} Rekan Belajar Terhubung
            </span>
          </div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, margin: '0 0 6px 0', letterSpacing: '-0.5px' }}>
            Komunitas & Teman Belajar
          </h1>
          <p style={{ margin: 0, fontSize: '0.88rem', color: '#F5F3FF', maxWidth: '580px' }}>
            Saling pantau progres belajar, berbagi motivasi, dan capai target akademik bersama rekan sekelas.
          </p>
        </div>

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
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          }}
        >
          <Plus size={16} color="#7C3AED" /> + Tambah Teman Belajar
        </button>
      </div>

      {/* 2. Friends Grid */}
      {friends.length === 0 ? (
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
            <Users size={26} />
          </div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>
            Belum Ada Teman Belajar
          </h3>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '420px' }}>
            Ajak teman sekelas atau kelompok belajar Anda untuk saling memantau progres tugas.
          </p>
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="btn-primary"
            style={{ marginTop: '8px', fontSize: '0.84rem', padding: '8px 18px' }}
          >
            <Plus size={15} /> + Tambah Teman Sekarang
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
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '16px',
                borderTop: '4px solid #8B5CF6',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
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
                    }}
                  >
                    {friend.initials || 'FR'}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: '0 0 2px 0', color: 'var(--text-main)' }}>
                      {friend.name}
                    </h3>
                    <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                      {friend.major} · {friend.semester || 'Kelas 11'}
                    </div>
                  </div>
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '6px' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Progres Tugas Hari Ini</span>
                    <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                      {friend.completedTasks || 0} / {friend.totalTasks || 0} ({friend.progress || 0}%)
                    </span>
                  </div>
                  <div style={{ width: '100%', height: '8px', backgroundColor: '#F1F5F9', borderRadius: '4px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${friend.progress || 0}%`,
                        height: '100%',
                        backgroundColor: '#8B5CF6',
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
                    <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>Sedang Mengerjakan:</span>
                    <strong style={{ color: 'var(--text-main)' }}>{friend.nearestTask.title || 'Tugas Studi Kasus'}</strong>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Add Friend */}
      {showAddModal && (
        <div className="modal-overlay" style={{ zIndex: 110 }}>
          <div className="modal-content" style={{ maxWidth: '420px', padding: '24px' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', fontWeight: 800 }}>Tambah Rekan Belajar</h3>
            <form onSubmit={handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>Nama Rekan</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Jessica Aurelia"
                  value={newFriendName}
                  onChange={(e) => setNewFriendName(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--border-subtle)', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>Jurusan / Minat</label>
                <input
                  type="text"
                  placeholder="Contoh: IPA / Informatika"
                  value={newFriendMajor}
                  onChange={(e) => setNewFriendMajor(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--border-subtle)', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn-secondary"
                  style={{ padding: '8px 14px' }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ padding: '8px 18px' }}
                >
                  Simpan Teman
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
