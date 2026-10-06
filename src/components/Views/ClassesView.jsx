// src/components/Views/ClassesView.jsx
import React, { useState } from 'react';
import {
  BookOpen,
  Plus,
  Clock,
  MapPin,
  User,
  Calendar,
  Trash2,
  Edit2,
  CheckCircle,
  GraduationCap,
} from 'lucide-react';

export const ClassesView = ({
  schedules = [],
  courses = [],
  onOpenClassModal,
  onDeleteSchedule,
}) => {
  const [selectedDay, setSelectedDay] = useState(0); // 0 = Semua, 1=Senin, 2=Selasa, etc.
  const [searchQuery, setSearchQuery] = useState('');

  const daysList = [
    { id: 0, name: 'Semua Hari' },
    { id: 1, name: 'Senin' },
    { id: 2, name: 'Selasa' },
    { id: 3, name: 'Rabu' },
    { id: 4, name: 'Kamis' },
    { id: 5, name: 'Jumat' },
    { id: 6, name: 'Sabtu' },
    { id: 7, name: 'Minggu' },
  ];

  const filteredSchedules = schedules.filter((s) => {
    const matchesDay = selectedDay === 0 || Number(s.dayOfWeek) === selectedDay;
    const matchesSearch =
      !searchQuery.trim() ||
      (s.courseName && s.courseName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.lecturer && s.lecturer.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.room && s.room.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesDay && matchesSearch;
  });

  const getDayName = (dayNum) => {
    const day = daysList.find((d) => d.id === Number(dayNum));
    return day ? day.name : 'Senin';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* 1. Header Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1E293B 0%, #334155 100%)',
          borderRadius: 'var(--radius-lg)',
          padding: '26px 32px',
          color: '#FFFFFF',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '18px',
          boxShadow: '0 8px 24px -4px rgba(30, 41, 59, 0.2)',
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
              <BookOpen size={13} color="#93C5FD" /> MANAJEMEN JADWAL
            </span>
            <span style={{ fontSize: '0.78rem', color: '#CBD5E1' }}>
              · {schedules.length} Kelas Terdaftar
            </span>
          </div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, margin: '0 0 6px 0', letterSpacing: '-0.5px' }}>
            Jadwal Kuliah & Pelajaran Rutin
          </h1>
          <p style={{ margin: 0, fontSize: '0.88rem', color: '#94A3B8', maxWidth: '580px' }}>
            Kelola seluruh jadwal sesi tatap muka mingguan, informasi dosen/guru pengajar, dan ruangan kelas.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenClassModal}
          className="btn-primary"
          style={{
            padding: '10px 20px',
            fontSize: '0.88rem',
            backgroundColor: '#3B82F6',
            borderColor: '#2563EB',
          }}
        >
          <Plus size={16} /> + Tambah Jadwal Kelas
        </button>
      </div>

      {/* 2. Filter Bar */}
      <div
        className="card"
        style={{
          padding: '14px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '14px',
        }}
      >
        {/* Day Pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {daysList.map((d) => (
            <button
              key={d.id}
              type="button"
              onClick={() => setSelectedDay(d.id)}
              style={{
                padding: '6px 14px',
                borderRadius: '20px',
                fontSize: '0.8rem',
                fontWeight: 600,
                border: selectedDay === d.id ? '1px solid #3B82F6' : '1px solid var(--border-subtle)',
                backgroundColor: selectedDay === d.id ? '#EFF6FF' : '#FFFFFF',
                color: selectedDay === d.id ? '#1D4ED8' : 'var(--text-muted)',
                cursor: 'pointer',
                transition: 'all 150ms ease',
              }}
            >
              {d.name}
            </button>
          ))}
        </div>

        {/* Search */}
        <div style={{ minWidth: '220px' }}>
          <input
            type="text"
            placeholder="Cari mata pelajaran, ruangan, dosen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.82rem',
              outline: 'none',
            }}
          />
        </div>
      </div>

      {/* 3. Schedules Grid */}
      {filteredSchedules.length === 0 ? (
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
            <BookOpen size={26} />
          </div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>
            {selectedDay === 0 ? 'Belum Ada Jadwal Kelas' : `Tidak ada jadwal untuk hari ${getDayName(selectedDay)}`}
          </h3>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '420px' }}>
            Tambahkan mata pelajaran atau jadwal kuliah rutin Anda agar tertata rapi dan tersinkronisasi otomatis.
          </p>
          <button
            type="button"
            onClick={onOpenClassModal}
            className="btn-primary"
            style={{ marginTop: '8px', fontSize: '0.84rem', padding: '8px 18px' }}
          >
            <Plus size={15} /> + Tambah Kelas Baru Sekarang
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
          {filteredSchedules.map((sch) => (
            <div
              key={sch.id}
              className="card"
              style={{
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                borderLeft: `5px solid ${sch.color || 'var(--pastel-lavender-text)'}`,
                transition: 'transform 150ms ease, box-shadow 150ms ease',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <span
                    className="pastel-badge badge-lavender"
                    style={{ fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase' }}
                  >
                    {getDayName(sch.dayOfWeek)}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)', fontSize: '0.78rem', fontWeight: 600 }}>
                    <Clock size={13} />
                    <span>{sch.startTime} - {sch.endTime} WIB</span>
                  </div>
                </div>

                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 10px 0', color: 'var(--text-main)' }}>
                  {sch.courseName || sch.name || 'Jadwal Kelas'}
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  {sch.room && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                      <MapPin size={14} color="#64748B" />
                      <span>Ruangan: <strong>{sch.room}</strong></span>
                    </div>
                  )}
                  {sch.lecturer && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                      <User size={14} color="#64748B" />
                      <span>Pengajar: <strong>{sch.lecturer}</strong></span>
                    </div>
                  )}
                </div>
              </div>

              <div
                style={{
                  marginTop: '16px',
                  paddingTop: '12px',
                  borderTop: '1px solid #F1F5F9',
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '8px',
                }}
              >
                {onDeleteSchedule && (
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Hapus jadwal "${sch.courseName || sch.name}"?`)) {
                        onDeleteSchedule(sch.id);
                      }
                    }}
                    style={{
                      border: 'none',
                      background: '#FEE2E2',
                      color: '#DC2626',
                      borderRadius: '6px',
                      padding: '5px 10px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <Trash2 size={13} /> Hapus
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
