// src/components/Views/ProductivityView.jsx
import React, { useState, useEffect, useRef } from 'react';
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
  RotateCcw,
  AlertTriangle,
  X,
  Check,
} from 'lucide-react';
import {
  getLiveFocusMetrics,
  FOCUS_MODE_EVENT,
  resetFocusMode,
  checkAndAwardStreak,
  getFocusModeState,
} from '../../services/focusModeService';

export const ProductivityView = ({
  tasks = [],
  schedules = [],
  user,
  onOpenTaskModal,
  onOpenAIRecommender,
  onResetTasksStatus,
}) => {
  const [timeframe, setTimeframe] = useState('weekly'); // 'weekly' | 'daily'
  const [chartType, setChartType] = useState('line'); // 'line' | 'bar'
  const [hoveredIndex, setHoveredIndex] = useState(null);

  // Live Focus Mode Metrics
  const [focusMetrics, setFocusMetrics] = useState(getLiveFocusMetrics());

  // Streak state stored in localStorage (defaults to 0 on initial/reset)
  const [streak, setStreak] = useState(() => {
    try {
      const val = localStorage.getItem('studycal_study_streak_v1');
      return val !== null ? Math.max(0, parseInt(val, 10)) : 0;
    } catch {
      return 0;
    }
  });

  const [streakRecord, setStreakRecord] = useState(() => {
    try {
      const val = localStorage.getItem('studycal_streak_record_v1');
      return val !== null ? Math.max(0, parseInt(val, 10)) : 0;
    } catch {
      return 0;
    }
  });

  // Modal and toast states for Reset dari Awal
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetTasksCheck, setResetTasksCheck] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const confirmBtnRef = useRef(null);

  // Sync focus mode live timer and streak updates
  useEffect(() => {
    const handleUpdate = () => {
      setFocusMetrics(getLiveFocusMetrics());
      try {
        const val = localStorage.getItem('studycal_study_streak_v1');
        if (val !== null) setStreak(Math.max(0, parseInt(val, 10)));
        const rec = localStorage.getItem('studycal_streak_record_v1');
        if (rec !== null) setStreakRecord(Math.max(0, parseInt(rec, 10)));
      } catch {}
    };

    window.addEventListener(FOCUS_MODE_EVENT, handleUpdate);
    const interval = setInterval(() => {
      const live = getLiveFocusMetrics();
      setFocusMetrics(live);
      if (live.isActive && live.todaySeconds >= 3600 && !live.isStreakAwarded) {
        checkAndAwardStreak(getFocusModeState());
      }
    }, 1000);

    return () => {
      window.removeEventListener(FOCUS_MODE_EVENT, handleUpdate);
      clearInterval(interval);
    };
  }, []);

  // Handle keyboard Enter & Escape for Reset Modal
  useEffect(() => {
    if (!isResetModalOpen) return;

    const timer = setTimeout(() => {
      confirmBtnRef.current?.focus();
    }, 50);

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setIsResetModalOpen(false);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        executeReset();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isResetModalOpen, resetTasksCheck]);

  // Real calculations derived from actual task data + Mode Fokus
  const completedTasks = tasks.filter((t) => t.isCompleted);
  const completedCount = completedTasks.length;
  const totalCount = tasks.length;
  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Real duration in hours computed from completed tasks + Mode Fokus
  const taskDurationHours = completedTasks.reduce((acc, t) => {
    const mins = Number(t.estimatedMinutes) || 45;
    return acc + mins / 60;
  }, 0);
  const totalDurationHours = Number((taskDurationHours + focusMetrics.totalFocusHours).toFixed(1));
  const totalDurationStr = totalDurationHours.toFixed(1);
  const weeklyTargetHours = 20;
  const targetProgressPct = Math.min(100, Math.round((totalDurationHours / weeklyTargetHours) * 100));

  // Focus score starts from 0 if no tasks are completed & no focus mode
  const focusModeBonus = Math.min(35, Math.round(focusMetrics.totalFocusHours * 12));
  const avgFocusScore =
    completedCount > 0 || focusMetrics.totalSeconds > 0
      ? Math.min(100, Math.max(50, Math.round(completionRate * 0.65 + focusModeBonus + (totalDurationHours > 0 ? 25 : 10))))
      : 0;

  // Real Weekly Data series (Senin s/d Minggu) + Mode Fokus
  const todayDayId = new Date().getDay();
  const weeklyData = [
    { label: 'Senin', short: 'Sen', dayId: 1 },
    { label: 'Selasa', short: 'Sel', dayId: 2 },
    { label: 'Rabu', short: 'Rab', dayId: 3 },
    { label: 'Kamis', short: 'Kam', dayId: 4 },
    { label: 'Jumat', short: 'Jum', dayId: 5 },
    { label: 'Sabtu', short: 'Sab', dayId: 6 },
    { label: 'Minggu', short: 'Min', dayId: 0 },
  ].map((day) => {
    const matchingTasks = completedTasks.filter((t) => {
      if (t.completedAt) {
        return new Date(t.completedAt).getDay() === day.dayId;
      }
      if (t.dueDate) {
        return new Date(t.dueDate + 'T00:00:00').getDay() === day.dayId;
      }
      return false;
    });

    const taskHours = matchingTasks.reduce((sum, t) => sum + (Number(t.estimatedMinutes) || 45) / 60, 0);
    const focusHoursForDay = day.dayId === todayDayId ? focusMetrics.todayFocusHours : 0;
    const totalDayHours = Number((taskHours + focusHoursForDay).toFixed(1));

    const totalActions = matchingTasks.length + (focusHoursForDay > 0 ? 1 : 0);
    return {
      label: day.label,
      short: day.short,
      value: totalDayHours,
      tasks: matchingTasks.length,
      score: totalActions > 0 ? Math.min(100, 75 + totalActions * 8) : 0,
      focusDesc:
        focusHoursForDay > 0
          ? `${matchingTasks.length} tugas + ${focusHoursForDay}j fokus`
          : matchingTasks.length > 0
          ? `${matchingTasks.length} tugas tuntas`
          : 'Belum ada aktivitas',
    };
  });

  // Real Daily Data series (Intervals today)
  const todayStr = new Date().toISOString().split('T')[0];
  const todayCompletedTasks = completedTasks.filter((t) => {
    if (t.completedAt) return t.completedAt.startsWith(todayStr);
    return t.dueDate === todayStr;
  });

  const dailyData = [
    { label: '08:00', startH: 6, endH: 9, slotName: 'Pagi Awal' },
    { label: '10:00', startH: 9, endH: 12, slotName: 'Sesi Kuliah Pagi' },
    { label: '13:00', startH: 12, endH: 15, slotName: 'Sesi Siang' },
    { label: '16:00', startH: 15, endH: 18, slotName: 'Sore Mandiri' },
    { label: '19:00', startH: 18, endH: 21, slotName: 'Fokus Malam' },
    { label: '21:00', startH: 21, endH: 24, slotName: 'Review Santai' },
  ].map((slot) => {
    const matching = todayCompletedTasks.filter((t) => {
      if (t.completedAt) {
        const h = new Date(t.completedAt).getHours();
        return h >= slot.startH && h < slot.endH;
      }
      return false;
    });
    const hours = matching.reduce((sum, t) => sum + (Number(t.estimatedMinutes) || 45) / 60, 0);
    return {
      label: slot.label,
      value: Number(hours.toFixed(1)),
      tasks: matching.length,
      score: matching.length > 0 ? Math.min(100, 80 + matching.length * 7) : 0,
      focusDesc: matching.length > 0 ? `${matching.length} tugas tuntas` : slot.slotName,
    };
  });

  const activeData = timeframe === 'daily' ? dailyData : weeklyData;
  const maxActualValue = Math.max(...activeData.map((d) => d.value), 0);
  // Ensure maximum scale is at least 2 when starting from 0
  const maxValue = maxActualValue > 0 ? Math.max(maxActualValue * 1.25, 2) : 2;

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

  // Real Category Distribution
  const CATEGORY_DEFINITIONS = [
    { name: 'Tugas & PR', color: '#8E94F2' },
    { name: 'Kuliah & Sekolah', color: '#4299E1' },
    { name: 'Ujian & Kuis', color: '#ED8936' },
    { name: 'Organisasi & Ekskul', color: '#48BB78' },
    { name: 'Self-Care & Istirahat', color: '#ED64A6' },
  ];

  const categoryStats = CATEGORY_DEFINITIONS.map((cat) => {
    const count = tasks.filter(
      (t) => (t.category || '').toLowerCase() === cat.name.toLowerCase()
    ).length;
    const pct = totalCount > 0 ? Math.round((count / totalCount) * 100) : 0;
    return {
      ...cat,
      count: `${count} tugas`,
      pct,
    };
  });

  // Action: Execute Reset dari Awal
  const executeReset = () => {
    try {
      localStorage.setItem('studycal_study_streak_v1', '0');
      localStorage.setItem('studycal_streak_record_v1', '0');
      localStorage.removeItem('studycal_productivity_history_v1');
      localStorage.setItem('studycal_productivity_reset_timestamp', new Date().toISOString());
    } catch (e) {}

    setStreak(0);
    setStreakRecord(0);
    resetFocusMode();

    if (resetTasksCheck && onResetTasksStatus) {
      onResetTasksStatus();
    }

    setIsResetModalOpen(false);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3800);
  };

  const isFreshZeroState = totalDurationHours === 0 && completedCount === 0;

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
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
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

            {isFreshZeroState ? (
              <span
                style={{
                  backgroundColor: 'rgba(147, 197, 253, 0.22)',
                  border: '1px solid rgba(147, 197, 253, 0.4)',
                  color: '#BAE6FD',
                  padding: '4px 11px',
                  borderRadius: '20px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                }}
              >
                🌱 Status: Mulai dari Awal (0 Jam)
              </span>
            ) : (
              <span
                style={{
                  backgroundColor: '#10B981',
                  padding: '4px 10px',
                  borderRadius: '20px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                }}
              >
                🔥 Status: Aktif & Berjalan
              </span>
            )}
          </div>

          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0 0 6px 0', letterSpacing: '-0.5px' }}>
            Grafik Fokus & Performa Belajar
          </h1>
          <p style={{ margin: 0, fontSize: '0.92rem', color: '#C7D2FE', maxWidth: '620px' }}>
            {isFreshZeroState
              ? `Selamat datang ${user?.name || 'Tjandra'}! Metrik produktivitas Anda berada di titik awal (0). Selesaikan tugas harian untuk memicu grafik performa otomatis.`
              : `Metrik waktu belajar, streak fokus, dan progres tugas ${user?.name || 'Anda'} dihitung secara nyata untuk mendampingi target semester.`}
          </p>
        </div>

        {/* Header Action Buttons */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {/* Tombol Reset dari Awal */}
          <button
            type="button"
            onClick={() => {
              setResetTasksCheck(false);
              setIsResetModalOpen(true);
            }}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.12)',
              color: '#FFFFFF',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              padding: '10px 16px',
              borderRadius: 'var(--radius-md)',
              fontWeight: 700,
              fontSize: '0.84rem',
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
              cursor: 'pointer',
              transition: 'background 150ms ease',
            }}
            title="Reset seluruh catatan metrik dan streak kembali ke nol"
          >
            <RotateCcw size={15} /> Reset ke Awal (0)
          </button>

          {onOpenAIRecommender && (
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
                fontSize: '0.84rem',
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
          )}
        </div>
      </div>

      {/* Toast Notification upon Reset */}
      {showToast && (
        <div
          style={{
            backgroundColor: '#065F46',
            color: '#ECFDF5',
            padding: '12px 18px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            boxShadow: '0 8px 20px rgba(6, 95, 70, 0.25)',
            fontSize: '0.86rem',
            fontWeight: 600,
            animation: 'fadeIn 200ms ease-out',
          }}
        >
          <Check size={18} />
          <span>Seluruh metrik produktivitas dan riwayat sesi belajar berhasil direset ke titik awal (0)!</span>
        </div>
      )}

      {/* 2. Top Metric Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '18px',
        }}
      >
        {/* Card 1: Durasi Belajar Nyata */}
        <div className="study-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px', backgroundColor: '#FFFFFF' }}>
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
              {totalDurationStr} <span style={{ fontSize: '1.1rem', fontWeight: 600 }}>Jam</span>
            </span>
            {totalDurationHours > 0 && (
              <span style={{ fontSize: '0.78rem', color: '#10B981', fontWeight: 700, display: 'inline-flex', alignItems: 'center' }}>
                <ArrowUpRight size={14} /> Aktif
              </span>
            )}
          </div>
          <div style={{ width: '100%', height: '6px', backgroundColor: '#F1F5F9', borderRadius: '4px', overflow: 'hidden', marginTop: '4px' }}>
            <div style={{ width: `${targetProgressPct}%`, height: '100%', backgroundColor: 'var(--pastel-lavender-text)', borderRadius: '4px', transition: 'width 0.4s ease' }} />
          </div>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
            Target mingguan: {weeklyTargetHours} Jam · Tercapai {targetProgressPct}%
          </span>
        </div>

        {/* Card 2: Penyelesaian Tugas Nyata */}
        <div className="study-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px', backgroundColor: '#FFFFFF' }}>
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
            <span className={`pastel-badge ${completedCount > 0 ? 'badge-mint' : 'badge-lavender'}`} style={{ fontSize: '0.75rem', padding: '2px 8px' }}>
              {completionRate}% Selesai
            </span>
          </div>
          <div style={{ width: '100%', height: '6px', backgroundColor: '#F1F5F9', borderRadius: '4px', overflow: 'hidden', marginTop: '4px' }}>
            <div style={{ width: `${completionRate}%`, height: '100%', backgroundColor: '#10B981', borderRadius: '4px', transition: 'width 0.4s ease' }} />
          </div>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
            {totalCount - completedCount} tugas aktif menunggu penyelesaian
          </span>
        </div>

        {/* Card 3: Skor Fokus Nyata */}
        <div className="study-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px', backgroundColor: '#FFFFFF' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              Skor Fokus Belajar
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
              {avgFocusScore >= 80 ? 'Optimal' : avgFocusScore > 0 ? 'Meningkat' : 'Mulai (0)'}
            </span>
          </div>
          <div style={{ width: '100%', height: '6px', backgroundColor: '#F1F5F9', borderRadius: '4px', overflow: 'hidden', marginTop: '4px' }}>
            <div style={{ width: `${avgFocusScore}%`, height: '100%', backgroundColor: '#F59E0B', borderRadius: '4px', transition: 'width 0.4s ease' }} />
          </div>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
            {completedCount > 0 ? 'Dihitung dari ketuntasan tugas nyata' : 'Mulai selesaikan tugas untuk menaikkan skor'}
          </span>
        </div>

        {/* Card 4: Study Streak (Mulai dari 0) */}
        <div className="study-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px', backgroundColor: '#FFFFFF' }}>
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
              {streak} <span style={{ fontSize: '1.1rem', fontWeight: 600 }}>Hari</span>
            </span>
            <span style={{ fontSize: '0.78rem', color: streak > 0 ? '#10B981' : '#94A3B8', fontWeight: 700 }}>
              Rekor: {streakRecord} Hari
            </span>
          </div>
          <div style={{ width: '100%', height: '6px', backgroundColor: '#F1F5F9', borderRadius: '4px', overflow: 'hidden', marginTop: '4px' }}>
            <div style={{ width: `${Math.min(100, streak * 15)}%`, height: '100%', backgroundColor: '#EC4899', borderRadius: '4px', transition: 'width 0.4s ease' }} />
          </div>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
            {streak === 0 ? 'Belajar hari ini untuk mencatat streak pertama Anda!' : 'Pertahankan konsistensi belajar harian!'}
          </span>
        </div>
      </div>

      {/* 3. Main Interactive Chart Section */}
      <div className="study-card" style={{ padding: '26px', backgroundColor: '#FFFFFF' }}>
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
              Visualisasi durasi belajar nyata dan penyelesaian tugas per interval waktu.
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
                  const barW = (chartW / points.length) * 0.48;
                  const barH = (p.value / maxValue) * chartH;
                  const barX = p.x - barW / 2;
                  const barY = paddingY + chartH - barH;
                  const isHov = hoveredIndex === i;

                  return (
                    <g key={i} onMouseEnter={() => setHoveredIndex(i)} onMouseLeave={() => setHoveredIndex(null)} style={{ cursor: 'pointer' }}>
                      <rect
                        x={barX}
                        y={barY}
                        width={barW}
                        height={Math.max(barH, 3)}
                        rx="5"
                        fill={isHov ? '#4F46E5' : p.value > 0 ? '#818CF8' : '#E2E8F0'}
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

        {/* Empty state notice if all chart values are 0 */}
        {maxActualValue === 0 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              padding: '14px 20px',
              backgroundColor: '#F8FAFC',
              borderRadius: '12px',
              border: '1px dashed #CBD5E1',
              marginTop: '12px',
              color: '#64748B',
              fontSize: '0.84rem',
              textAlign: 'center',
            }}
          >
            <Sparkles size={16} color="#6366F1" />
            <span>
              Grafik produktivitas bersih (0 Jam). Selesaikan tugas belajarmu untuk melihat lonjakan grafik secara real-time!
            </span>
          </div>
        )}
      </div>

      {/* 4. Bottom Grid: Kategori Distribusi & AI Focus Insights */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '20px',
        }}
      >
        {/* Kategori Fokus Belajar Nyata */}
        <div className="study-card" style={{ padding: '24px', backgroundColor: '#FFFFFF' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: '0 0 14px 0', color: 'var(--text-main)' }}>
            Distribusi Kategori Belajar ({totalCount} Tugas)
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {categoryStats.map((cat, idx) => (
              <div key={idx}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '6px' }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{cat.name}</span>
                  <span style={{ color: 'var(--text-muted)' }}>{cat.count} ({cat.pct}%)</span>
                </div>
                <div style={{ width: '100%', height: '8px', backgroundColor: '#F1F5F9', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${cat.pct}%`, height: '100%', backgroundColor: cat.color, borderRadius: '4px', transition: 'width 0.4s ease' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Rekomendasi Jam Emas AI */}
        <div className="study-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', backgroundColor: '#FFFFFF' }}>
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
              Berdasarkan analisis ritme belajar, otak Anda paling responsif untuk materi kompleks pada jam berikut:
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

      {/* 5. Interactive Reset Modal with Enter confirmation */}
      {isResetModalOpen && (
        <div
          className="modal-overlay"
          onClick={() => setIsResetModalOpen(false)}
          style={{
            zIndex: 1100,
            backgroundColor: 'rgba(15, 23, 42, 0.55)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            animation: 'fadeIn 180ms ease-out',
          }}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '450px',
              width: '100%',
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              padding: '28px 24px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              position: 'relative',
              animation: 'scaleUp 200ms cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            {/* Close Button top-right */}
            <button
              type="button"
              onClick={() => setIsResetModalOpen(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'none',
                border: 'none',
                color: '#94A3B8',
                cursor: 'pointer',
                padding: '6px',
                borderRadius: '50%',
              }}
              title="Batal / Tutup (Esc)"
            >
              <X size={18} />
            </button>

            {/* Warning Icon Badge */}
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                backgroundColor: '#FEF3C7',
                color: '#D97706',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
                boxShadow: '0 0 0 8px #FFFBEB',
              }}
            >
              <RotateCcw size={28} strokeWidth={2.2} />
            </div>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1E293B', margin: '0 0 8px 0' }}>
              Reset Metrik Produktivitas ke Awal?
            </h3>

            <p style={{ fontSize: '0.86rem', color: '#64748B', lineHeight: 1.55, margin: '0 0 18px 0' }}>
              Tindakan ini akan mereset hitungan durasi belajar, skor fokus, riwayat sesi, dan study streak Anda kembali ke <strong>0 Hari (Mulai dari Awal)</strong>.
            </p>

            {/* Checkbox option to also uncomplete tasks */}
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                padding: '10px 14px',
                borderRadius: '10px',
                width: '100%',
                cursor: 'pointer',
                textAlign: 'left',
                fontSize: '0.82rem',
                color: '#334155',
                marginBottom: '22px',
              }}
            >
              <input
                type="checkbox"
                checked={resetTasksCheck}
                onChange={(e) => setResetTasksCheck(e.target.checked)}
                style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#4F46E5' }}
              />
              <span>Reset juga status tugas selesai menjadi belum selesai (0% tuntas)</span>
            </label>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
              <button
                type="button"
                onClick={() => setIsResetModalOpen(false)}
                style={{
                  flex: 1,
                  padding: '11px 16px',
                  borderRadius: '12px',
                  border: '1px solid #CBD5E1',
                  backgroundColor: '#FFFFFF',
                  color: '#475569',
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Batal (Esc)
              </button>

              <button
                ref={confirmBtnRef}
                type="button"
                onClick={executeReset}
                style={{
                  flex: 1,
                  padding: '11px 16px',
                  borderRadius: '12px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #4F46E5 0%, #3730A3 100%)',
                  color: '#FFFFFF',
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px rgba(79, 70, 229, 0.35)',
                  outline: 'none',
                }}
              >
                <RotateCcw size={15} /> Ya, Reset (Enter ↵)
              </button>
            </div>

            {/* Keyboard hint */}
            <div style={{ marginTop: '14px', fontSize: '0.74rem', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>Tekan</span>
              <kbd style={{ padding: '2px 6px', background: '#F1F5F9', border: '1px solid #CBD5E1', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700, color: '#475569' }}>Enter ↵</kbd>
              <span>untuk reset instan</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductivityView;
