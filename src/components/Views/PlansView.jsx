// src/components/Views/PlansView.jsx
import React, { useState } from 'react';
import {
  CalendarDays,
  Calendar,
  Plus,
  Sparkles,
} from 'lucide-react';
import { WeeklyView } from './WeeklyView';
import { MonthlyView } from './MonthlyView';

export const PlansView = ({
  tasks = [],
  schedules = [],
  onToggleTask,
  onOpenTaskModal,
  onOpenClassModal,
  onSelectTaskForAI,
  mode = 'weekly',
  onModeChange,
}) => {
  const [internalSubView, setInternalSubView] = useState('weekly');
  const subView = onModeChange ? mode : internalSubView;
  const setSubView = onModeChange ? onModeChange : setInternalSubView;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* 1. Header Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)',
          borderRadius: 'var(--radius-lg)',
          padding: '26px 32px',
          color: '#FFFFFF',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '18px',
          boxShadow: '0 8px 24px -4px rgba(2, 132, 199, 0.25)',
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
              <CalendarDays size={13} color="#BAE6FD" /> STUDIO KALENDER & RENCANA
            </span>
          </div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, margin: '0 0 6px 0', letterSpacing: '-0.5px' }}>
            Rencana Belajar & Timeline
          </h1>
          <p style={{ margin: 0, fontSize: '0.88rem', color: '#E0F2FE', maxWidth: '580px' }}>
            Pantau agenda belajar mingguan dan bulanan dalam tampilan kalender komprehensif.
          </p>
        </div>

        {/* View Switcher & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              display: 'flex',
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              padding: '3px',
              borderRadius: '8px',
            }}
          >
            <button
              type="button"
              onClick={() => setSubView('weekly')}
              style={{
                border: 'none',
                padding: '7px 16px',
                borderRadius: '6px',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                backgroundColor: subView === 'weekly' ? '#FFFFFF' : 'transparent',
                color: subView === 'weekly' ? '#0369A1' : '#FFFFFF',
                boxShadow: subView === 'weekly' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              Mingguan
            </button>
            <button
              type="button"
              onClick={() => setSubView('monthly')}
              style={{
                border: 'none',
                padding: '7px 16px',
                borderRadius: '6px',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                backgroundColor: subView === 'monthly' ? '#FFFFFF' : 'transparent',
                color: subView === 'monthly' ? '#0369A1' : '#FFFFFF',
                boxShadow: subView === 'monthly' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              Bulanan
            </button>
          </div>

          <button
            type="button"
            onClick={onOpenTaskModal}
            style={{
              backgroundColor: '#FFFFFF',
              color: '#0369A1',
              border: 'none',
              padding: '9px 18px',
              borderRadius: 'var(--radius-md)',
              fontWeight: 700,
              fontSize: '0.84rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
            }}
          >
            <Plus size={16} /> + Tugas
          </button>
        </div>
      </div>

      {/* 2. Calendar Views Output */}
      {subView === 'weekly' ? (
        <WeeklyView
          tasks={tasks}
          schedules={schedules}
          onToggleTask={onToggleTask}
          onOpenTaskModal={onOpenTaskModal}
          onSelectTaskForAI={onSelectTaskForAI}
        />
      ) : (
        <MonthlyView
          tasks={tasks}
          schedules={schedules}
          onToggleTask={onToggleTask}
          onOpenTaskModal={onOpenTaskModal}
        />
      )}
    </div>
  );
};
