// src/components/Sidebar.jsx
import React, { useState } from 'react';
import {
  LayoutGrid,
  BookOpen,
  ClipboardList,
  FileText,
  ListTodo,
  Wrench,
} from 'lucide-react';

import { ICTLogo } from './ICTLogo';

// Custom Thick Yellow Pointer / Cursor Icon for 'Utama / Navigasi Aktif' (Image 1 style)
const YellowPointerIcon = ({ size = 22, isActive = true }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{
      filter: isActive ? 'drop-shadow(0 2px 6px rgba(245, 158, 11, 0.55))' : 'none',
      transition: 'transform 180ms ease',
    }}
  >
    <path
      d="M4.5 3.5L11.8 20.8L14.6 13.9L21.5 11.1L4.5 3.5Z"
      fill="#FBBF24"
      stroke="#D97706"
      strokeWidth="2.4"
      strokeLinejoin="round"
      strokeLinecap="round"
    />
  </svg>
);

export const Sidebar = ({
  activeTab = 'dashboard',
  onSelectTab,
  onOpenClassModal,
  onOpenTaskModal,
  onOpenNotesModal,
  onOpenSettingsModal,
  user,
}) => {
  const [hoveredTab, setHoveredTab] = useState(null);

  const menuItems = [
    {
      id: 'main',
      label: 'Menu Utama',
      sublabel: 'Kembali ke Dashboard Utama',
      isCustomYellow: true,
      onClick: () => onSelectTab && onSelectTab('dashboard'),
    },
    {
      id: 'dashboard',
      label: 'Dashboard',
      sublabel: 'Ringkasan Harian & Progres',
      icon: LayoutGrid,
      onClick: () => onSelectTab && onSelectTab('dashboard'),
    },
    {
      id: 'classes',
      label: 'Jadwal Kelas',
      sublabel: 'Jadwal Kuliah / Sekolah Rutin',
      icon: BookOpen,
      onClick: () => onOpenClassModal && onOpenClassModal(),
    },
    {
      id: 'tasks',
      label: 'Tugas',
      sublabel: 'Kelola & Tambah Agenda Tugas',
      icon: ClipboardList,
      onClick: () => onOpenTaskModal && onOpenTaskModal(),
    },
    {
      id: 'notes',
      label: 'Catatan',
      sublabel: 'Catatan Belajar & Rumus Penting',
      icon: FileText,
      onClick: () => onOpenNotesModal && onOpenNotesModal(),
    },
    {
      id: 'plans',
      label: 'Rencana',
      sublabel: 'Tampilan Mingguan & Bulanan',
      icon: ListTodo,
      onClick: () => onSelectTab && onSelectTab('plans'),
    },
    {
      id: 'settings',
      label: 'Pengaturan',
      sublabel: 'Preferensi Belajar & Akun',
      icon: Wrench,
      onClick: () => onOpenSettingsModal && onOpenSettingsModal(),
    },
  ];

  return (
    <aside
      className="study-sidebar"
      style={{
        width: '68px',
        backgroundColor: '#FFFFFF',
        borderRight: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '16px 0',
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        zIndex: 90,
        boxShadow: '1px 0 10px rgba(0, 0, 0, 0.02)',
      }}
    >
      {/* CodeStack Schedule Brand Logo */}
      <div style={{ marginBottom: '18px' }} title="CodeStack Schedule - Smart Schedule & Productivity">
        <ICTLogo iconOnly size={42} onClick={() => onSelectTab && onSelectTab('dashboard')} />
      </div>

      <div
        style={{
          width: '36px',
          height: '1px',
          background: 'var(--border-subtle)',
          marginBottom: '16px',
        }}
      />

      {/* Vertical Monochrome Menu Items */}
      <nav
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '10px',
          width: '100%',
          flex: 1,
        }}
      >
        {menuItems.map((item) => {
          const isActive = activeTab === item.id;
          const isHovered = hoveredTab === item.id;
          const IconComponent = item.icon;

          return (
            <div
              key={item.id}
              style={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center' }}
              onMouseEnter={() => setHoveredTab(item.id)}
              onMouseLeave={() => setHoveredTab(null)}
            >
              <button
                type="button"
                onClick={item.onClick}
                aria-label={item.label}
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  border: item.isCustomYellow
                    ? '1.5px solid #FDE68A'
                    : isActive
                    ? '1px solid #1E293B'
                    : '1px solid transparent',
                  backgroundColor: item.isCustomYellow
                    ? isHovered
                      ? '#FEF3C7'
                      : '#FFFBEB'
                    : isActive
                    ? '#1E293B'
                    : isHovered
                    ? '#F1F5F9'
                    : 'transparent',
                  color: isActive ? '#FFFFFF' : '#475569',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'all 180ms ease',
                  transform: isHovered ? 'scale(1.08)' : 'scale(1)',
                }}
              >
                {/* Active Indicator Bar on left */}
                {isActive && !item.isCustomYellow && (
                  <span
                    style={{
                      position: 'absolute',
                      left: '-12px',
                      top: '10px',
                      bottom: '10px',
                      width: '4px',
                      borderRadius: '0 4px 4px 0',
                      backgroundColor: 'var(--pastel-lavender-text)',
                    }}
                  />
                )}

                {item.isCustomYellow ? (
                  <YellowPointerIcon size={22} isActive={isHovered || isActive} />
                ) : (
                  <IconComponent size={20} strokeWidth={isActive ? 2.2 : 1.8} />
                )}
              </button>

              {/* Floating Tooltip to the Right */}
              {isHovered && (
                <div
                  style={{
                    position: 'absolute',
                    left: '60px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    backgroundColor: '#1E293B',
                    color: '#F8FAFC',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                    boxShadow: '0 6px 18px rgba(0, 0, 0, 0.16)',
                    zIndex: 120,
                    pointerEvents: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>{item.label}</span>
                    {item.isCustomYellow && <span style={{ color: '#FBBF24' }}>★</span>}
                  </div>
                  <span style={{ fontSize: '0.68rem', color: '#94A3B8', fontWeight: 400 }}>
                    {item.sublabel}
                  </span>
                  {/* Arrow pointer */}
                  <div
                    style={{
                      position: 'absolute',
                      right: '100%',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      borderWidth: '5px',
                      borderStyle: 'solid',
                      borderColor: 'transparent #1E293B transparent transparent',
                    }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Bottom User Avatar Status Pill */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <div
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            backgroundColor: 'var(--pastel-lavender-bg)',
            border: '2px solid var(--pastel-lavender-border)',
            color: 'var(--pastel-lavender-text)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.82rem',
            fontWeight: 800,
            cursor: 'pointer',
          }}
          title={user?.name ? `${user.name} (${user.major})` : 'Profil Akun'}
          onClick={() => onOpenSettingsModal && onOpenSettingsModal()}
        >
          {user?.name
            ? user.name
                .split(' ')
                .map((n) => n[0])
                .slice(0, 2)
                .join('')
                .toUpperCase()
            : 'TJ'}
        </div>
      </div>
    </aside>
  );
};
