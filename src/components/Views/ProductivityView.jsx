// src/components/Views/ProductivityView.jsx
import React, { useState } from 'react';
import {
  TrendingUp,
  Clock,
  CheckCircle2,
  Zap,
  BarChart2,
  Activity,
  Flame,
  Award,
  Sparkles,
  Calendar,
  BookOpen,
  ArrowUpRight,
  Filter,
} from 'lucide-react';

export const ProductivityView = ({
  tasks = [],
  schedules = [],
  user,
  onOpenTaskModal,
  onOpenAIRecommender,
}) => {
  const [timeframe, setTimeframe] = useState('daily'); // 'daily' | 'weekly'
  const [chartType, setChartType] = useState('line'); // 'line' | 'bar'
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const completedTasks = tasks.filter((t) => t.isCompleted);
  const completedCount = completedTasks.length;
  const totalCount = tasks.length;
  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Data series for Harian & Mingguan
  const dailyData = [
    { label: '08:00', value: 1.2, tasks: 1, score: 85, focusDesc: 'Sesi Pagi (Matematika)' },
    { label: '10:00', value: 2.0, tasks: 2, score: 92, focusDesc: 'Fokus Kuliah / Kelas' },
    { label: '13:00', value: 0.8, tasks: 0, score: 78, focusDesc: 'Istirahat & Review Singkat' },
    { label: '15:00', value: 1.5, tasks: 1, score: 88, focusDesc: 'Pengerjaan Laporan' },
    { label: '19:00', value: 2.4, tasks: completedCount > 0 ? Math.min(completedCount, 3) : 1, score: 95, focusDesc: 'Puncak Produktivitas Malam 🔥' },
    { label: '21:00', value: 1.1, tasks: completedCount, score: 89, focusDesc: 'Review & Persiapan Esok' },
  ];

  const weeklyData = [
    { label: 'Senin', value: 3.5, tasks: 2, score: 88, focusDesc: 'Awal pekan produktif' },
    { label: 'Selasa', value: 4.8, tasks: 4, score: 92, focusDesc: 'Target terselesaikan maksimal' },
    { label: 'Rabu', value: 2.6, tasks: 1, score: 80, focusDesc: 'Fokus kelas teori' },
    { label: 'Kamis', value: 5.2, tasks: 5, score: 95, focusDesc: 'Performa puncak pekan ini 🔥' },
    { label: 'Jumat', value: 3.9, tasks: 3, score: 89, focusDesc: 'Finishing tugas mingguan' },
    { label: 'Sabtu', value: 4.1, tasks: 3, score: 91, focusDesc: 'Studi mandiri & proyek' },
    { label: 'Minggu', value: 2.0, tasks: 1, score: 85, focusDesc: 'Review santai & self-care' },
  ];

  const activeData = timeframe === 'daily' ? dailyData : weeklyData;
  const maxValue = Math.max(...activeData.map((d) => d.value), 6);

  // SVG Chart Geometry
  const svgWidth = 680;
  const svgHeight = 220;
  const paddingX = 36;
  const paddingY = 24;
  const chartW = svgWidth - paddingX * 2;
  const chartH = svgHeight - paddingY * 2;

  const points = activeData.map((d, i) => {
    const x = paddingX + (i / (activeData.length - 1)) * chartW;
    const y = paddingY + chartH - (d.value / maxValue) * chartH;
    return { x, y, ...d };
  });

  const pathD = points.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`, '');
  const areaD = `${pathD} L ${points[points.length - 1].x} ${svgHeight - paddingY} L ${points[0].x} ${svgHeight - paddingY} Z`;

  const totalDuration = activeData.reduce((acc, curr) => acc + curr.value, 0).toFixed(1);
  const avgFocusScore = Math.round(
    activeData.reduce((acc, curr) => acc + curr.score, 0) / activeData.length
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '26px' }}>
      {/* 1. Header Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1E1B4B 0%, #2E1065 50%, #4338CA 100%)',
          borderRadius: 'var(--radius-lg)',
          padding: '28px 32px',
          color: '#FFFFFF',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px',
          boxShadow: '0 10px 25px -5px rgba(67, 56, 202, 0.25)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <span
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.16)',
                backdropFilter: 'blur(8px)',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '0.78rem',
                fontWeight: 700,
                letterSpacing: '0.5px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Activity size={14} color="#A5B4FC" /> ANALISIS PRODUKTIVITAS
            </span>
            <span
              style={{
                backgroundColor: '#10B981',
                padding: '4px 10px',
                borderRadius: '20px',
                fontSize: '0.75rem',
                fontWeight: 700,
              }}
            >
              🔥 Status: Prima
            </span>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0 0 6px 0', letterSpacing: '-0.5px' }}>
            Grafik Fokus & Performa Belajar
          </h1>
          <p style={{ margin: 0, fontSize: '0.92rem', color: '#C7D2FE', maxWidth: '600px' }}>
            Semua aktivitas tugas, jadwal kelas, dan sesi belajar {user?.name || 'Anda'} tersinkronisasi otomatis untuk memastikan konsistensi belajar optimal.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            type="button"
            onClick={onOpenAIRecommender}
            style={{
              backgroundColor: '#FFFFFF',
              color: '#312E81',
              border: 'none',
              padding: '10px 18px',
              borderRadius: 'var(--radius-md)',
              fontWeight: 700,
              fontSize: '0.86rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              transition: 'transform 150ms ease',
            }}
          >
            <Sparkles size={16} color="#4F46E5" /> Rekomendasi Jam AI
          </button>
        </div>
      </div>

      {/* 2. Top Metric Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '18px',
        }}
      >
        {/* Card 1: Durasi Belajar */}
        <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              Total Durasi Belajar
            </span>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                backgroundColor: 'var(--pastel-lavender-bg)',
                color: 'var(--pastel-lavender-text)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Clock size={18} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '1.9rem', fontWeight: 800, color: 'var(--text-main)' }}>
              {totalDuration} <span style={{ fontSize: '1.1rem', fontWeight: 600 }}>Jam</span>
            </span>
            <span style={{ fontSize: '0.78rem', color: '#10B981', fontWeight: 700, display: 'inline-flex', alignItems: 'center' }}>
              <ArrowUpRight size={14} /> +18%
            </span>
          </div>
          <div style={{ width: '100%', height: '6px', backgroundColor: '#F1F5F9', borderRadius: '4px', overflow: 'hidden', marginTop: '4px' }}>
            <div style={{ width: '85%', height: '100%', backgroundColor: 'var(--pastel-lavender-text)', borderRadius: '4px' }} />
          </div>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
            Target mingguan: 25 Jam · Tercapai 85%
          </span>
        </div>

        {/* Card 2: Tugas Selesai */}
        <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              Penyelesaian Tugas
            </span>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                backgroundColor: 'var(--pastel-mint-bg)',
                color: 'var(--pastel-mint-text)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '1.9rem', fontWeight: 800, color: 'var(--text-main)' }}>
              {completedCount} <span style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-muted)' }}>/ {totalCount}</span>
            </span>
            <span className="pastel-badge badge-mint" style={{ fontSize: '0.75rem', padding: '2px 8px' }}>
              {completionRate}% Selesai
            </span>
          </div>
          <div style={{ width: '100%', height: '6px', backgroundColor: '#F1F5F9', borderRadius: '4px', overflow: 'hidden', marginTop: '4px' }}>
            <div style={{ width: `${completionRate}%`, height: '100%', backgroundColor: '#10B981', borderRadius: '4px' }} />
          </div>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
            {totalCount - completedCount} tugas aktif menunggu penyelesaian
          </span>
        </div>

        {/* Card 3: Skor Fokus */}
        <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              Rata-rata Skor Fokus
            </span>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                backgroundColor: 'var(--pastel-peach-bg)',
                color: 'var(--pastel-peach-text)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Zap size={18} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '1.9rem', fontWeight: 800, color: 'var(--text-main)' }}>
              {avgFocusScore}%
            </span>
            <span className="pastel-badge badge-peach" style={{ fontSize: '0.75rem', padding: '2px 8px' }}>
              Optimal
            </span>
          </div>
          <div style={{ width: '100%', height: '6px', backgroundColor: '#F1F5F9', borderRadius: '4px', overflow: 'hidden', marginTop: '4px' }}>
            <div style={{ width: `${avgFocusScore}%`, height: '100%', backgroundColor: '#F59E0B', borderRadius: '4px' }} />
          </div>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
            Dihitung dari konsistensi jeda & durasi sesi
          </span>
        </div>

        {/* Card 4: Study Streak */}
        <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              Study Streak 🔥
            </span>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                backgroundColor: 'var(--pastel-rose-bg)',
                color: 'var(--pastel-rose-text)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Flame size={18} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '1.9rem', fontWeight: 800, color: 'var(--text-main)' }}>
              5 <span style={{ fontSize: '1.1rem', fontWeight: 600 }}>Hari</span>
            </span>
            <span style={{ fontSize: '0.78rem', color: '#10B981', fontWeight: 700 }}>
              Rekor: 14 Hari
            </span>
          </div>
          <div style={{ width: '100%', height: '6px', backgroundColor: '#F1F5F9', borderRadius: '4px', overflow: 'hidden', marginTop: '4px' }}>
            <div style={{ width: '60%', height: '100%', backgroundColor: '#EC4899', borderRadius: '4px' }} />
          </div>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
            Tetap belajar hari ini untuk mempertahankan streak!
          </span>
        </div>
      </div>

      {/* 3. Main Interactive Chart Section */}
      <div className="card" style={{ padding: '26px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
            flexWrap: 'wrap',
            gap: '14px',
          }}
        >
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 4px 0', color: 'var(--text-main)' }}>
              Grafik Aktivitas Belajar
            </h2>
            <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Visualisasi durasi belajar dan penyelesaian tugas per interval waktu.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Timeframe switch */}
            <div
              style={{
                display: 'flex',
                backgroundColor: '#F1F5F9',
                padding: '3px',
                borderRadius: '8px',
              }}
            >
              <button
                type="button"
                onClick={() => setTimeframe('daily')}
                style={{
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  backgroundColor: timeframe === 'daily' ? '#FFFFFF' : 'transparent',
                  color: timeframe === 'daily' ? 'var(--text-main)' : 'var(--text-muted)',
                  boxShadow: timeframe === 'daily' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                }}
              >
                Harian
              </button>
              <button
                type="button"
                onClick={() => setTimeframe('weekly')}
                style={{
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  backgroundColor: timeframe === 'weekly' ? '#FFFFFF' : 'transparent',
                  color: timeframe === 'weekly' ? 'var(--text-main)' : 'var(--text-muted)',
                  boxShadow: timeframe === 'weekly' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                }}
              >
                Mingguan
              </button>
            </div>

            {/* Chart Type switch */}
            <div
              style={{
                display: 'flex',
                backgroundColor: '#F1F5F9',
                padding: '3px',
                borderRadius: '8px',
              }}
            >
              <button
                type="button"
                onClick={() => setChartType('line')}
                style={{
                  border: 'none',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  backgroundColor: chartType === 'line' ? '#FFFFFF' : 'transparent',
                  color: chartType === 'line' ? 'var(--pastel-lavender-text)' : 'var(--text-muted)',
                  boxShadow: chartType === 'line' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                }}
              >
                <Activity size={14} /> Garis
              </button>
              <button
                type="button"
                onClick={() => setChartType('bar')}
                style={{
                  border: 'none',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  backgroundColor: chartType === 'bar' ? '#FFFFFF' : 'transparent',
                  color: chartType === 'bar' ? 'var(--pastel-lavender-text)' : 'var(--text-muted)',
                  boxShadow: chartType === 'bar' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                }}
              >
                <BarChart2 size={14} /> Batang
              </button>
            </div>
          </div>
        </div>

        {/* SVG Render Container */}
        <div style={{ position: 'relative', width: '100%', overflowX: 'auto', paddingBottom: '10px' }}>
          <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} style={{ width: '100%', height: 'auto', maxHeight: '280px', display: 'block' }}>
            <defs>
              <linearGradient id="prodGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8E94F2" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#8E94F2" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Grid horizontal guidelines */}
            {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
              const yVal = paddingY + chartH * pct;
              const labelVal = (maxValue * (1 - pct)).toFixed(1);
              return (
                <g key={idx}>
                  <line
                    x1={paddingX}
                    y1={yVal}
                    x2={svgWidth - paddingX}
                    y2={yVal}
                    stroke="#E2E8F0"
                    strokeDasharray="4 4"
                    strokeWidth="1"
                  />
                  <text
                    x={paddingX - 8}
                    y={yVal + 4}
                    textAnchor="end"
                    fontSize="10"
                    fill="#94A3B8"
                    fontWeight="500"
                  >
                    {labelVal}j
                  </text>
                </g>
              );
            })}

            {/* Chart Type: Line */}
            {chartType === 'line' && (
              <>
                <path d={areaD} fill="url(#prodGradient)" />
                <path d={pathD} fill="none" stroke="#6366F1" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
                {points.map((p, i) => (
                  <g key={i}>
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={hoveredIndex === i ? 7 : 4.5}
                      fill="#FFFFFF"
                      stroke="#4F46E5"
                      strokeWidth="2.5"
                      style={{ cursor: 'pointer', transition: 'all 150ms ease' }}
                      onMouseEnter={() => setHoveredIndex(i)}
                      onMouseLeave={() => setHoveredIndex(null)}
                    />
                    <text
                      x={p.x}
                      y={svgHeight - 6}
                      textAnchor="middle"
                      fontSize="11"
                      fill={hoveredIndex === i ? '#4F46E5' : '#64748B'}
                      fontWeight={hoveredIndex === i ? '700' : '600'}
                    >
                      {p.label}
                    </text>
                  </g>
                ))}
              </>
            )}

            {/* Chart Type: Bar */}
            {chartType === 'bar' && (
              <>
                {points.map((p, i) => {
                  const barW = chartW / points.length * 0.48;
                  const barH = ((p.value / maxValue) * chartH);
                  const barX = p.x - barW / 2;
                  const barY = paddingY + chartH - barH;
                  const isHov = hoveredIndex === i;

                  return (
                    <g key={i} onMouseEnter={() => setHoveredIndex(i)} onMouseLeave={() => setHoveredIndex(null)} style={{ cursor: 'pointer' }}>
                      <rect
                        x={barX}
                        y={barY}
                        width={barW}
                        height={barH}
                        rx="5"
                        fill={isHov ? '#4F46E5' : '#818CF8'}
                        style={{ transition: 'all 150ms ease' }}
                      />
                      <text
                        x={p.x}
                        y={svgHeight - 6}
                        textAnchor="middle"
                        fontSize="11"
                        fill={isHov ? '#4F46E5' : '#64748B'}
                        fontWeight={isHov ? '700' : '600'}
                      >
                        {p.label}
                      </text>
                    </g>
                  );
                })}
              </>
            )}
          </svg>

          {/* Interactive Hover Tooltip */}
          {hoveredIndex !== null && points[hoveredIndex] && (
            <div
              style={{
                position: 'absolute',
                left: `${(points[hoveredIndex].x / svgWidth) * 100}%`,
                top: '10px',
                transform: 'translateX(-50%)',
                backgroundColor: '#1E293B',
                color: '#FFFFFF',
                padding: '8px 14px',
                borderRadius: '8px',
                fontSize: '0.78rem',
                boxShadow: '0 8px 20px rgba(0,0,0,0.18)',
                pointerEvents: 'none',
                zIndex: 20,
                display: 'flex',
                flexDirection: 'column',
                gap: '2px',
                whiteSpace: 'nowrap',
              }}
            >
              <div style={{ fontWeight: 700, color: '#A5B4FC' }}>
                {points[hoveredIndex].label} · {points[hoveredIndex].focusDesc}
              </div>
              <div>Durasi: <strong>{points[hoveredIndex].value} Jam</strong> · Skor: <strong>{points[hoveredIndex].score}%</strong></div>
              <div>Tugas Selesai: <strong>{points[hoveredIndex].tasks} tugas</strong></div>
            </div>
          )}
        </div>
      </div>

      {/* 4. Bottom Grid: Kategori Distribusi & AI Focus Insights */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '20px',
        }}
      >
        {/* Kategori Fokus Belajar */}
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: '0 0 14px 0', color: 'var(--text-main)' }}>
            Distribusi Kategori Belajar
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[
              { name: 'Tugas & PR', pct: 42, color: '#8E94F2', count: `${completedCount} tugas` },
              { name: 'Kuliah & Sekolah', pct: 28, color: '#4299E1', count: `${schedules.length} mata pelajaran` },
              { name: 'Ujian & Kuis', pct: 18, color: '#ED8936', count: '2 kuis pekan ini' },
              { name: 'Self-Care & Istirahat', pct: 12, color: '#48BB78', count: 'Optimal' },
            ].map((cat, idx) => (
              <div key={idx}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '6px' }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{cat.name}</span>
                  <span style={{ color: 'var(--text-muted)' }}>{cat.count} ({cat.pct}%)</span>
                </div>
                <div style={{ width: '100%', height: '8px', backgroundColor: '#F1F5F9', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${cat.pct}%`, height: '100%', backgroundColor: cat.color, borderRadius: '4px' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Rekomendasi Jam Emas AI */}
        <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--pastel-lavender-bg)',
                  color: 'var(--pastel-lavender-text)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Sparkles size={16} />
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                Rekomendasi Jam Fokus AI
              </h3>
            </div>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', margin: '0 0 16px 0', lineHeight: 1.5 }}>
              Berdasarkan analisis performa belajar Anda, otak Anda paling responsif untuk materi kompleks pada jam berikut:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ padding: '12px 14px', borderRadius: '10px', backgroundColor: 'var(--pastel-lavender-bg)', border: '1px solid var(--pastel-lavender-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.86rem', color: 'var(--pastel-lavender-text)' }}>Slot Emas 1: 09:00 - 11:30 WIB</div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Sangat cocok untuk logika matematika, coding, dan analisa data.</div>
                </div>
                <span className="pastel-badge badge-lavender" style={{ fontSize: '0.72rem' }}>Pagi</span>
              </div>

              <div style={{ padding: '12px 14px', borderRadius: '10px', backgroundColor: 'var(--pastel-mint-bg)', border: '1px solid var(--pastel-mint-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.86rem', color: 'var(--pastel-mint-text)' }}>Slot Emas 2: 19:30 - 21:30 WIB</div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Fokus tenang untuk penyelesaian laporan & PR deadline terdekat.</div>
                </div>
                <span className="pastel-badge badge-mint" style={{ fontSize: '0.72rem' }}>Malam</span>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onOpenTaskModal}
              className="btn-primary"
              style={{ fontSize: '0.84rem', padding: '9px 18px', width: '100%', justifyContent: 'center' }}
            >
              + Buat Tugas di Jam Fokus
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
