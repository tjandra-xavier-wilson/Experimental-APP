// src/components/FriendsWidget.jsx
import React, { useState } from 'react';
import { Users, Plus, Search, Sparkles, CheckCircle2, Clock, BookOpen, Heart, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import { triggerReminderAlert } from '../services/notificationService';

// Circular SVG Progress Ring Component
const AvatarProgressRing = ({ progress = 0, size = 52, stroke = 3.5, color = '#8E94F2', children }) => {
  const radius = (size - stroke * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(Math.max(progress, 0), 100) / 100) * circumference;

  return (
    <div style={{ position: 'relative', width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', position: 'absolute', inset: 0 }}>
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#E2E8F0"
          strokeWidth={stroke}
          fill="transparent"
        />
        {/* Fill */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={stroke}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
        />
      </svg>
      {children}
    </div>
  );
};

export const FriendsWidget = ({
  friends = [],
  onAddFriend,
  currentUserName = 'Tjandra',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredFriend, setHoveredFriend] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [cheeredMap, setCheeredMap] = useState({});

  // Form state for adding friend
  const [nameInput, setNameInput] = useState('');
  const [majorInput, setMajorInput] = useState('');
  const [taskInput, setTaskInput] = useState('');
  const [progressInput, setProgressInput] = useState(50);

  const filteredFriends = friends.filter(
    (f) =>
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.major.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCheer = (friend, e) => {
    e.stopPropagation();
    setCheeredMap((prev) => ({ ...prev, [friend.id]: true }));

    // Burst friendly confetti
    confetti({
      particleCount: 35,
      spread: 55,
      origin: { y: 0.7 },
      colors: ['#8E94F2', '#ED64A6', '#48BB78', '#FFD166'],
    });

    triggerReminderAlert(
      'Semangat Terkirim! 👏',
      `Kamu telah mengirimkan semangat belajar ke ${friend.name}!`
    );

    setTimeout(() => {
      setCheeredMap((prev) => ({ ...prev, [friend.id]: false }));
    }, 4000);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!nameInput.trim()) return;

    const colors = ['#8E94F2', '#ED64A6', '#48BB78', '#ED8936', '#4299E1'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    onAddFriend({
      name: nameInput.trim(),
      major: majorInput.trim() || 'Teknik Informatika',
      avatarBg: randomColor,
      progress: Number(progressInput),
      completedTasks: Math.round((Number(progressInput) / 100) * 4),
      totalTasks: 4,
      status: Number(progressInput) === 100 ? 'Santai Sejenak ☕' : 'Fokus Tugas 🔥',
      nearestTaskTitle: taskInput.trim() || 'Mengerjakan Modul Latihan',
      nearestTaskDue: 'Hari ini, 23:59 WIB',
      nearestTaskCourse: majorInput.trim() || 'Mata Kuliah Utama',
    });

    setNameInput('');
    setMajorInput('');
    setTaskInput('');
    setIsAddModalOpen(false);
  };

  return (
    <div
      className="study-card"
      style={{
        padding: '20px',
        position: 'relative',
      }}
    >
      {/* Widget Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '14px',
          flexWrap: 'wrap',
          gap: '8px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '10px',
              backgroundColor: 'var(--pastel-lavender-bg)',
              color: 'var(--pastel-lavender-text)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Users size={17} />
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>Teman & Progress</h3>
          </div>
          <span
            className="pastel-badge badge-lavender"
            style={{ fontSize: '0.7rem', padding: '2px 8px' }}
          >
            {friends.length} aktif
          </span>
        </div>

        {/* Add Friend Button */}
        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="btn-ghost"
          style={{
            fontSize: '0.78rem',
            padding: '5px 10px',
            backgroundColor: 'var(--bg-card-subtle)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-main)',
          }}
          title="Tambah Teman Baru"
        >
          <Plus size={14} />
          <span>Tambah Teman</span>
        </button>
      </div>

      {friends.length === 0 ? (
        <div
          style={{
            padding: '24px 16px',
            textAlign: 'center',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-card-subtle)',
            border: '1px dashed var(--border-subtle)',
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: 'var(--pastel-lavender-bg)',
              color: 'var(--pastel-lavender-text)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 10px',
            }}
          >
            <Users size={18} />
          </div>
          <p style={{ fontWeight: 600, fontSize: '0.88rem', margin: '0 0 4px', color: 'var(--text-main)' }}>
            Belum ada teman yang ditambahkan
          </p>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0 0 14px' }}>
            Tambahkan teman sekelas untuk melihat progres belajar dan saling memberi semangat!
          </p>
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="btn-primary"
            style={{ fontSize: '0.8rem', padding: '7px 16px' }}
          >
            <Plus size={14} /> Tambah Teman
          </button>
        </div>
      ) : (
        <>
          {/* Small Search Bar */}
          <div
            style={{
              position: 'relative',
              marginBottom: '16px',
            }}
          >
            <Search
              size={14}
              color="var(--text-muted)"
              style={{
                position: 'absolute',
                left: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
              }}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari teman atau jurusan..."
              style={{
                width: '100%',
                padding: '7px 12px 7px 32px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
                backgroundColor: 'var(--bg-card-subtle)',
                fontSize: '0.8rem',
                color: 'var(--text-main)',
                outline: 'none',
                transition: 'border-color var(--transition-fast)',
              }}
              onFocus={(e) => (e.target.style.borderColor = 'var(--pastel-lavender-text)')}
              onBlur={(e) => (e.target.style.borderColor = 'var(--border-subtle)')}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                  display: 'flex',
                }}
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Horizontal Avatar List */}
          <div
            style={{
              display: 'flex',
              gap: '14px',
              overflowX: 'auto',
              paddingBottom: '8px',
              paddingTop: '4px',
              scrollbarWidth: 'thin',
            }}
          >
            {filteredFriends.length === 0 ? (
              <div
                style={{
                  padding: '16px',
                  textAlign: 'center',
                  width: '100%',
                  color: 'var(--text-muted)',
                  fontSize: '0.82rem',
                }}
              >
                Teman "{searchQuery}" tidak ditemukan.
              </div>
            ) : (
              filteredFriends.map((friend) => {
                const isHovered = hoveredFriend?.id === friend.id;
                const ringColor =
                  friend.progress >= 80
                    ? '#48BB78'
                    : friend.progress >= 50
                    ? '#8E94F2'
                    : '#ED8936';

            return (
              <div
                key={friend.id}
                style={{
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  minWidth: '64px',
                  cursor: 'pointer',
                }}
                onMouseEnter={() => setHoveredFriend(friend)}
                onMouseLeave={() => setHoveredFriend(null)}
              >
                {/* Avatar with Circular Progress Ring */}
                <AvatarProgressRing
                  progress={friend.progress}
                  size={54}
                  stroke={3.5}
                  color={ringColor}
                >
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '50%',
                      backgroundColor: friend.avatarBg || '#8E94F2',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '0.88rem',
                      boxShadow: '0 2px 6px rgba(0, 0, 0, 0.08)',
                      transition: 'transform 180ms ease',
                      transform: isHovered ? 'scale(1.08)' : 'scale(1)',
                    }}
                  >
                    {friend.initials}
                  </div>
                </AvatarProgressRing>

                {/* Friend Name & Progress Label */}
                <span
                  style={{
                    fontSize: '0.74rem',
                    fontWeight: 600,
                    marginTop: '6px',
                    color: 'var(--text-main)',
                    textAlign: 'center',
                    whiteSpace: 'nowrap',
                    maxWidth: '68px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                  title={friend.name}
                >
                  {friend.name.split(' ')[0]}
                </span>

                <span
                  style={{
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    color: ringColor,
                  }}
                >
                  {friend.progress}%
                </span>

                {/* Interactive Hover Popup Card */}
                {isHovered && (
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 'calc(100% + 10px)',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '240px',
                      backgroundColor: '#FFFFFF',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-subtle)',
                      boxShadow: 'var(--shadow-lg)',
                      padding: '14px',
                      zIndex: 110,
                      animation: 'slideUp 180ms ease',
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Header in Popup */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                      <div
                        style={{
                          width: '38px',
                          height: '38px',
                          borderRadius: '50%',
                          backgroundColor: friend.avatarBg || '#8E94F2',
                          color: '#FFFFFF',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '0.85rem',
                          flexShrink: 0,
                        }}
                      >
                        {friend.initials}
                      </div>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <h4
                          style={{
                            fontSize: '0.88rem',
                            fontWeight: 700,
                            margin: 0,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {friend.name}
                        </h4>
                        <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: 0 }}>
                          {friend.major} • {friend.semester}
                        </p>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div style={{ marginBottom: '10px' }}>
                      <span
                        className="pastel-badge"
                        style={{
                          fontSize: '0.7rem',
                          padding: '2px 8px',
                          backgroundColor: 'var(--pastel-lavender-bg)',
                          color: 'var(--pastel-lavender-text)',
                          border: '1px solid var(--pastel-lavender-border)',
                        }}
                      >
                        {friend.status}
                      </span>
                    </div>

                    {/* Progress Bar in Popup */}
                    <div style={{ marginBottom: '10px' }}>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontSize: '0.72rem',
                          color: 'var(--text-muted)',
                          marginBottom: '4px',
                        }}
                      >
                        <span>Progres Target</span>
                        <strong style={{ color: ringColor }}>{friend.progress}%</strong>
                      </div>
                      <div
                        style={{
                          width: '100%',
                          height: '6px',
                          backgroundColor: 'var(--bg-card-subtle)',
                          borderRadius: '99px',
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            width: `${friend.progress}%`,
                            height: '100%',
                            backgroundColor: ringColor,
                            borderRadius: '99px',
                          }}
                        />
                      </div>
                    </div>

                    {/* 'Tugas Terdekat' Section */}
                    <div
                      style={{
                        backgroundColor: 'var(--bg-card-subtle)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '8px 10px',
                        marginBottom: '10px',
                        borderLeft: `3px solid ${ringColor}`,
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          color: 'var(--text-muted)',
                          marginBottom: '3px',
                          textTransform: 'uppercase',
                        }}
                      >
                        <Clock size={11} />
                        <span>Tugas Terdekat</span>
                      </div>
                      <p
                        style={{
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          margin: '0 0 2px 0',
                          color: 'var(--text-main)',
                          lineHeight: 1.25,
                        }}
                      >
                        {friend.nearestTask?.title || 'Tugas Kuliah'}
                      </p>
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                        ⏰ {friend.nearestTask?.due || 'Malam ini'}
                      </span>
                    </div>

                    {/* Cheer Button */}
                    <button
                      type="button"
                      onClick={(e) => handleCheer(friend, e)}
                      style={{
                        width: '100%',
                        padding: '6px 10px',
                        border: '1px solid var(--pastel-lavender-border)',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: cheeredMap[friend.id]
                          ? 'var(--pastel-mint-bg)'
                          : 'var(--pastel-lavender-bg)',
                        color: cheeredMap[friend.id]
                          ? 'var(--pastel-mint-text)'
                          : 'var(--pastel-lavender-text)',
                        fontSize: '0.74rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        transition: 'all var(--transition-fast)',
                      }}
                    >
                      {cheeredMap[friend.id] ? (
                        <>
                          <CheckCircle2 size={13} /> Semangat Terkirim!
                        </>
                      ) : (
                        <>
                          <span>👏</span> Kirim Semangat Belajar
                        </>
                      )}
                    </button>

                    {/* Popup Tail Triangle */}
                    <div
                      style={{
                        position: 'absolute',
                        top: '100%',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        borderWidth: '6px',
                        borderStyle: 'solid',
                        borderColor: '#FFFFFF transparent transparent transparent',
                      }}
                    />
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </>
  )}

      {/* Add Friend Modal */}
      {isAddModalOpen && (
        <div
          className="modal-overlay"
          onClick={() => setIsAddModalOpen(false)}
          style={{ zIndex: 1100 }}
        >
          <div
            className="modal-content"
            style={{ maxWidth: '420px', padding: '24px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={18} color="var(--pastel-lavender-text)" />
                <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Tambah Teman Belajar</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="btn-ghost"
                style={{ padding: '4px' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit}>
              <div style={{ marginBottom: '14px' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    marginBottom: '6px',
                  }}
                >
                  Nama Teman *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Farhan Pratama"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
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

              <div style={{ marginBottom: '14px' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    marginBottom: '6px',
                  }}
                >
                  Jurusan / Kelas
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Teknik Elektro / Smt 4"
                  value={majorInput}
                  onChange={(e) => setMajorInput(e.target.value)}
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

              <div style={{ marginBottom: '14px' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    marginBottom: '6px',
                  }}
                >
                  Tugas Terdekat Teman
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Laporan Analisis Rangkaian"
                  value={taskInput}
                  onChange={(e) => setTaskInput(e.target.value)}
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

              <div style={{ marginBottom: '20px' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    marginBottom: '6px',
                  }}
                >
                  <span>Perkiraan Progres Tugas</span>
                  <span style={{ color: 'var(--pastel-lavender-text)' }}>{progressInput}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={progressInput}
                  onChange={(e) => setProgressInput(e.target.value)}
                  style={{ width: '100%', accentColor: 'var(--pastel-lavender-text)' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
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
