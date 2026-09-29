// src/components/ProductivityPanel.jsx
import React, { useState } from 'react';
import {
  TrendingUp,
  Clock,
  CheckCircle2,
  Zap,
  ChevronLeft,
  ChevronRight,
  BarChart2,
  Activity,
  Flame,
} from 'lucide-react';

export const ProductivityPanel = ({
  completedTasksCount = 0,
  totalTasksCount = 0,
  user,
  isCollapsed: controlledCollapsed,
  onToggleCollapse,
}) => {
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const isCollapsed = controlledCollapsed !== undefined ? controlledCollapsed : internalCollapsed;
  const toggleCollapse = onToggleCollapse || (() => setInternalCollapsed(!internalCollapsed));

  const [timeframe, setTimeframe] = useState('daily'); // 'daily' | 'weekly'
  const [chartType, setChartType] = useState('line'); // 'line' | 'bar'
  const [hoveredIndex, setHoveredIndex] = useState(null);

  // Data series for Harian & Mingguan
  const dailyData = [
    { label: '08:00', value: 1.2, tasks: 1, score: 85 },
    { label: '11:00', value: 2.0, tasks: 1, score: 90 },
    { label: '14:00', value: 0.8, tasks: 0, score: 78 },
    { label: '16:00', value: 1.5, tasks: 2, score: 94 },
    { label: '19:00', value: 2.4, tasks: 1, score: 92 },
    { label: '21:00', value: 1.1, tasks: completedTasksCount, score: 88 },
  ];

  const weeklyData = [
    { label: 'Sen', value: 3.5, tasks: 2, score: 88 },
    { label: 'Sel', value: 4.8, tasks: 4, score: 92 },
    { label: 'Rab', value: 2.6, tasks: 1, score: 80 },
    { label: 'Kam', value: 5.2, tasks: 5, score: 95 },
    { label: 'Jum', value: 3.9, tasks: 3, score: 89 },
    { label: 'Sab', value: 4.1, tasks: 3, score: 91 },
    { label: 'Min', value: 2.0, tasks: 1, score: 85 },
  ];

  const activeData = timeframe === 'daily' ? dailyData : weeklyData;
  const maxValue = Math.max(...activeData.map((d) => d.value), 6);

  // SVG Chart Dimensions
  const svgWidth = 210;
  const svgHeight = 90;
  const paddingX = 14;
  const paddingY = 14;
  const chartW = svgWidth - paddingX * 2;
  const chartH = svgHeight - paddingY * 2;

  // Generate Points for SVG Line
  const points = activeData.map((d, i) => {
    const x = paddingX + (i / (activeData.length - 1)) * chartW;
    const y = paddingY + chartH - (d.value / maxValue) * chartH;
    return { x, y, ...d };
  });

  const pathD = points.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`, '');
  const areaD = `${pathD} L ${points[points.length - 1].x} ${svgHeight - paddingY} L ${points[0].x} ${svgHeight - paddingY} Z`;

  // Aggregate stats
  const totalDuration = activeData.reduce((acc, curr) => acc + curr.value, 0).toFixed(1);
  const avgFocusScore = Math.round(
    activeData.reduce((acc, curr) => acc + curr.score, 0) / activeData.length
  );

  if (isCollapsed) {
    return (
      <div
        style={{
          width: '24px',
          height: '100vh',
          position: 'fixed',
          left: '68px',
          top: 0,
          backgroundColor: '#FFFFFF',
          borderRight: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 80,
          cursor: 'pointer',
        }}
        onClick={toggleCollapse}
        title="Buka Panel Produktivitas"
      >
        <button
          type="button"
          style={{
            border: 'none',
            background: 'var(--pastel-lavender-bg)',
            color: 'var(--pastel-lavender-text)',
            borderRadius: '50%',
            width: '20px',
            height: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <ChevronRight size={14} />
        </button>
      </div>
    );
  }

  return (
    <aside
      style={{
        width: '240px',
        backgroundColor: '#FFFFFF',
        borderRight: '1px solid var(--border-subtle)',
        height: '100vh',
        position: 'fixed',
        left: '68px',
        top: 0,
        zIndex: 80,
        display: 'flex',
        flexDirection: 'column',
        padding: '18px 14px',
        boxShadow: '1px 0 8px rgba(0,0,0,0.02)',
        overflowY: 'auto',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '14px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '8px',
              backgroundColor: 'var(--pastel-sky-bg)',
              color: 'var(--pastel-sky-text)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Activity size={15} />
          </div>
          <div>
            <h4 style={{ fontSize: '0.86rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
              Produktivitas
            </h4>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Analisis Waktu</span>
          </div>
        </div>

        {/* Collapse button */}
        <button
          type="button"
          onClick={toggleCollapse}
          className="btn-ghost"
          style={{ padding: '3px', borderRadius: '4px' }}
          title="Sembunyikan Panel"
        >
          <ChevronLeft size={16} />
        </button>
      </div>

      {/* Timeframe Toggle Pills (Harian / Mingguan) */}
      <div
        style={{
          display: 'flex',
          backgroundColor: 'var(--bg-card-subtle)',
          padding: '3px',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border-subtle)',
          marginBottom: '16px',
        }}
      >
        <button
          type="button"
          onClick={() => setTimeframe('daily')}
          style={{
            flex: 1,
            padding: '5px 0',
            border: 'none',
            borderRadius: '6px',
            backgroundColor: timeframe === 'daily' ? '#FFFFFF' : 'transparent',
            color: timeframe === 'daily' ? '#2563EB' : 'var(--text-muted)',
            fontWeight: 700,
            fontSize: '0.75rem',
            cursor: 'pointer',
            boxShadow: timeframe === 'daily' ? '0 1px 4px rgba(0,0,0,0.06)' : 'none',
            transition: 'all var(--transition-fast)',
          }}
        >
          Harian
        </button>
        <button
          type="button"
          onClick={() => setTimeframe('weekly')}
          style={{
            flex: 1,
            padding: '5px 0',
            border: 'none',
            borderRadius: '6px',
            backgroundColor: timeframe === 'weekly' ? '#FFFFFF' : 'transparent',
            color: timeframe === 'weekly' ? '#2563EB' : 'var(--text-muted)',
            fontWeight: 700,
            fontSize: '0.75rem',
            cursor: 'pointer',
            boxShadow: timeframe === 'weekly' ? '0 1px 4px rgba(0,0,0,0.06)' : 'none',
            transition: 'all var(--transition-fast)',
          }}
        >
          Mingguan
        </button>
      </div>

      {/* 3 Core Metric Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
        {/* Metric 1: Durasi Belajar */}
        <div
          style={{
            padding: '10px 12px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--bg-card-subtle)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '26px',
                height: '26px',
                borderRadius: '6px',
                backgroundColor: 'rgba(37, 99, 235, 0.12)',
                color: '#2563EB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Clock size={14} />
            </div>
            <div>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block' }}>
                Durasi Belajar
              </span>
              <strong style={{ fontSize: '0.92rem', color: 'var(--text-main)' }}>
                {totalDuration} Jam
              </strong>
            </div>
          </div>
          <span style={{ fontSize: '0.68rem', color: '#10B981', fontWeight: 700 }}>
            {timeframe === 'daily' ? 'Target 5j' : 'Target 25j'}
          </span>
        </div>

        {/* Metric 2: Jumlah Tugas Selesai */}
        <div
          style={{
            padding: '10px 12px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--bg-card-subtle)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '26px',
                height: '26px',
                borderRadius: '6px',
                backgroundColor: 'rgba(16, 185, 129, 0.12)',
                color: '#10B981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CheckCircle2 size={14} />
            </div>
            <div>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block' }}>
                Tugas Selesai
              </span>
              <strong style={{ fontSize: '0.92rem', color: 'var(--text-main)' }}>
                {completedTasksCount} Tugas
              </strong>
            </div>
          </div>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
            {totalTasksCount > 0 ? `dari ${totalTasksCount}` : 'Tuntas'}
          </span>
        </div>

        {/* Metric 3: Skor Fokus Harian */}
        <div
          style={{
            padding: '10px 12px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--bg-card-subtle)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '26px',
                height: '26px',
                borderRadius: '6px',
                backgroundColor: 'rgba(245, 158, 11, 0.12)',
                color: '#D97706',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Zap size={14} />
            </div>
            <div>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block' }}>
                Skor Fokus
              </span>
              <strong style={{ fontSize: '0.92rem', color: '#D97706' }}>
                {avgFocusScore}%
              </strong>
            </div>
          </div>
          <span
            className="pastel-badge"
            style={{
              fontSize: '0.65rem',
              padding: '1px 6px',
              backgroundColor: 'var(--pastel-butter-bg)',
              color: 'var(--pastel-butter-text)',
            }}
          >
            Prima 🔥
          </span>
        </div>
      </div>

      {/* Chart Section Header with Chart Type Toggle */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '8px',
        }}
      >
        <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-main)' }}>
          Grafik Aktivitas
        </span>
        <div style={{ display: 'flex', gap: '4px' }}>
          <button
            type="button"
            onClick={() => setChartType('line')}
            style={{
              padding: '2px 6px',
              border: '1px solid var(--border-subtle)',
              borderRadius: '4px',
              backgroundColor: chartType === 'line' ? '#2563EB' : 'transparent',
              color: chartType === 'line' ? '#FFFFFF' : 'var(--text-muted)',
              fontSize: '0.68rem',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            Garis
          </button>
          <button
            type="button"
            onClick={() => setChartType('bar')}
            style={{
              padding: '2px 6px',
              border: '1px solid var(--border-subtle)',
              borderRadius: '4px',
              backgroundColor: chartType === 'bar' ? '#2563EB' : 'transparent',
              color: chartType === 'bar' ? '#FFFFFF' : 'var(--text-muted)',
              fontSize: '0.68rem',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            Batang
          </button>
        </div>
      </div>

      {/* Minimalist SVG Chart (Line / Bar) */}
      <div
        style={{
          backgroundColor: 'var(--bg-card-subtle)',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border-subtle)',
          padding: '10px 6px 6px',
          marginBottom: '16px',
          position: 'relative',
        }}
      >
        {chartType === 'line' ? (
          /* Line Chart with Blue/Indigo Gradient Accent */
          <svg width="100%" height={svgHeight} viewBox={`0 0 ${svgWidth} ${svgHeight}`}>
            <defs>
              <linearGradient id="indigoLineGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#2563EB" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#2563EB" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Grid Line */}
            <line
              x1={paddingX}
              y1={svgHeight - paddingY}
              x2={svgWidth - paddingX}
              y2={svgHeight - paddingY}
              stroke="#E2E8F0"
              strokeWidth="1"
            />

            {/* Area Fill */}
            <path d={areaD} fill="url(#indigoLineGrad)" />

            {/* Main Smooth Line */}
            <path
              d={pathD}
              fill="none"
              stroke="#2563EB"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Dots */}
            {points.map((p, idx) => (
              <circle
                key={idx}
                cx={p.x}
                cy={p.y}
                r={hoveredIndex === idx ? 4.5 : 3}
                fill={hoveredIndex === idx ? '#1D4ED8' : '#FFFFFF'}
                stroke="#2563EB"
                strokeWidth="2"
                style={{ cursor: 'pointer', transition: 'r 150ms ease' }}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
              />
            ))}
          </svg>
        ) : (
          /* Bar Chart with Indigo Accent */
          <div
            style={{
              height: `${svgHeight}px`,
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              padding: '0 8px 10px',
              gap: '6px',
            }}
          >
            {activeData.map((d, idx) => {
              const hPercent = (d.value / maxValue) * 100;
              const isHov = hoveredIndex === idx;

              return (
                <div
                  key={idx}
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    height: '100%',
                    justifyContent: 'flex-end',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  <div
                    style={{
                      width: '100%',
                      maxWidth: '18px',
                      height: `${Math.max(hPercent, 8)}%`,
                      backgroundColor: isHov ? '#1D4ED8' : '#3B82F6',
                      borderRadius: '4px 4px 1px 1px',
                      transition: 'height 300ms ease, background-color 150ms ease',
                    }}
                  />
                </div>
              );
            })}
          </div>
        )}

        {/* X-Axis Labels */}
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 4px', marginTop: '2px' }}>
          {activeData.map((d, idx) => (
            <span
              key={idx}
              style={{
                fontSize: '0.62rem',
                color: hoveredIndex === idx ? '#2563EB' : 'var(--text-muted)',
                fontWeight: hoveredIndex === idx ? 700 : 500,
              }}
            >
              {d.label}
            </span>
          ))}
        </div>

        {/* Hover Tooltip Info */}
        {hoveredIndex !== null && (
          <div
            style={{
              position: 'absolute',
              top: '6px',
              right: '8px',
              backgroundColor: '#1E293B',
              color: '#FFFFFF',
              padding: '3px 8px',
              borderRadius: '6px',
              fontSize: '0.68rem',
              fontWeight: 600,
              pointerEvents: 'none',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            }}
          >
            {activeData[hoveredIndex].label}: {activeData[hoveredIndex].value} jam ({activeData[hoveredIndex].score}% fokus)
          </div>
        )}
      </div>

      {/* Motivational Bottom Quote */}
      <div
        style={{
          marginTop: 'auto',
          padding: '10px 12px',
          borderRadius: 'var(--radius-sm)',
          background: 'linear-gradient(135deg, #EFF6FF 0%, #EEF2FF 100%)',
          border: '1px solid #DBEAFE',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
          <Flame size={14} color="#EA580C" />
          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#1E40AF' }}>
            Konsistensi Belajar
          </span>
        </div>
        <p style={{ fontSize: '0.68rem', color: '#3B82F6', margin: 0, lineHeight: 1.35 }}>
          Pertahankan ritme harianmu untuk mencapai pemahaman optimal tanpa kelelahan!
        </p>
      </div>
    </aside>
  );
};
