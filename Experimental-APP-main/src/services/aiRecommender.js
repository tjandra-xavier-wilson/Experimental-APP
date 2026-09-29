// src/services/aiRecommender.js
// StudyMate AI: Intelligent Study Slot Analyzer & Recommender for Students

/**
 * Recommends optimal study times for a given task based on:
 * - Deadline urgency & priority
 * - Class schedule collisions (free gap detection)
 * - User chronotype preference (morning lark, night owl, or balanced)
 * - Cognitive load & Pomodoro technique intervals
 */
export const recommendBestStudySlot = (task, schedules = [], userPreference = 'balanced') => {
  const taskMinutes = Number(task.estimatedMinutes) || 60;
  const priority = task.priority || 'medium';
  const dueDateStr = task.dueDate || new Date().toISOString().split('T')[0];

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const targetDueDate = new Date(dueDateStr);
  const diffDays = Math.ceil((targetDueDate - now) / (1000 * 60 * 60 * 24));

  // Determine ideal study date: preferably today or tomorrow, at least 1 day before deadline
  let suggestedDateStr = todayStr;
  if (diffDays > 2) {
    // Spread the learning: recommend study 1-2 days before deadline
    const suggestedDate = new Date(now);
    suggestedDate.setDate(now.getDate() + 1);
    suggestedDateStr = suggestedDate.toISOString().split('T')[0];
  } else if (diffDays <= 0) {
    // Urgent: today!
    suggestedDateStr = todayStr;
  }

  // Get day of week for the suggested date (0=Sun, 1=Mon, ..., 6=Sat)
  const targetDayOfWeek = new Date(suggestedDateStr).getDay();
  const dayClasses = schedules.filter((s) => Number(s.dayOfWeek) === targetDayOfWeek);

  // Time candidate windows based on user preference
  const candidateWindows = [];
  if (userPreference === 'morning') {
    candidateWindows.push(
      { start: '07:30', end: '09:00', label: 'Pagi Hari (Fresh Mind Focus)', perk: 'Daya konsentrasi dan retensi memori tertinggi sebelum aktivitas kampus' },
      { start: '16:00', end: '17:30', label: 'Sore Hari (Post-Lecture Gap)', perk: 'Memanfaatkan jeda setelah kelas selesai' }
    );
  } else if (userPreference === 'night') {
    candidateWindows.push(
      { start: '19:30', end: '21:00', label: 'Malam Hari (Quiet Night Flow)', perk: 'Suasana tenang tanpa distraksi pesan instan dan notifikasi' },
      { start: '21:15', end: '22:30', label: 'Larut Malam (Deep Focus Session)', perk: 'Cocok untuk pengerjaan mendalam tugas analisa dan koding' }
    );
  } else {
    // Balanced
    candidateWindows.push(
      { start: '15:30', end: '17:00', label: 'Sore Hari (Productive Gap)', perk: 'Jeda ideal antara waktu kuliah dan santai petang' },
      { start: '19:45', end: '21:15', label: 'Malam Hari (Prime Study Hour)', perk: 'Energi kembali pulih setelah istirahat sore' },
      { start: '09:00', end: '10:30', label: 'Pagi Menjelang Siang', perk: 'Pikiran masih segar untuk memecahkan logika rumit' }
    );
  }

  // Helper to convert "HH:MM" to total minutes from midnight
  const timeToMinutes = (timeStr) => {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  };

  const minutesToTime = (mins) => {
    const h = Math.floor(mins / 60).toString().padStart(2, '0');
    const m = (mins % 60).toString().padStart(2, '0');
    return `${h}:${m}`;
  };

  // Find non-conflicting slot
  let bestSlot = null;
  for (const candidate of candidateWindows) {
    const candStart = timeToMinutes(candidate.start);
    const candEnd = candStart + taskMinutes;

    // Check collision with classes
    const hasCollision = dayClasses.some((cls) => {
      const clsStart = timeToMinutes(cls.startTime);
      const clsEnd = timeToMinutes(cls.endTime);
      return Math.max(candStart, clsStart) < Math.min(candEnd, clsEnd);
    });

    if (!hasCollision) {
      bestSlot = {
        suggestedDate: suggestedDateStr,
        startTime: candidate.start,
        endTime: minutesToTime(candEnd),
        windowLabel: candidate.label,
        reason: candidate.perk,
      };
      break;
    }
  }

  // Fallback slot if all candidates have class collision
  if (!bestSlot) {
    const fallbackStart = '20:00';
    const fallbackStartMin = timeToMinutes(fallbackStart);
    bestSlot = {
      suggestedDate: suggestedDateStr,
      startTime: fallbackStart,
      endTime: minutesToTime(fallbackStartMin + taskMinutes),
      windowLabel: 'Malam Hari (Free Study Block)',
      reason: 'Waktu bebas setelah seluruh jadwal perkuliahan hari tersebut tuntas.',
    };
  }

  // Build Study Technique recommendation
  let technique = 'Teknik Pomodoro (25 menit fokus penuh, 5 menit rehat sejenak)';
  if (taskMinutes >= 90) {
    technique = 'Teknik 50/10 (50 menit kerja mendalam, 10 menit stretching & hidrasi)';
  } else if (taskMinutes <= 30) {
    technique = 'Sesi Quick Sprint (25 menit langsung tuntas tanpa membuka medsos)';
  }

  return {
    ...bestSlot,
    technique,
    priorityContext: priority === 'high' ? 'Prioritas Tinggi: Direkomendasikan segera kunci slot ini!' : 'Prioritas Terukur: Beban belajar seimbang.',
    aiTip: `Berdasarkan analisis jadwal dan preferensi "${userPreference}", pengerjaan tugas "${task.title}" selama ${taskMinutes} menit paling efisien pada ${bestSlot.windowLabel}.`,
  };
};

/**
 * Generate a smart daily study plan summary
 */
export const generateDailyAISummary = (user, todayTasks = [], todaySchedules = []) => {
  const pendingTasks = todayTasks.filter((t) => !t.isCompleted);
  const completedCount = todayTasks.filter((t) => t.isCompleted).length;
  const classCount = todaySchedules.length;

  let advice = '';
  if (pendingTasks.length === 0 && classCount === 0) {
    advice = 'Jadwal hari ini sangat lengang! Waktu yang tepat untuk self-care, membaca buku santai, atau mencicil materi minggu depan 🌿';
  } else if (pendingTasks.length > 3) {
    advice = `Ada ${pendingTasks.length} tugas menanti hari ini. Terapkan 'The Rule of 3': selesaikan 1 tugas terberat terlebih dahulu sebelum jam makan siang! 🚀`;
  } else if (classCount >= 3) {
    advice = `Hari ini cukup padat dengan ${classCount} kelas kuliah/sekolah. Jangan lupa minum air putih dan manfaatkan jeda istirahat antar jam pelajaran 💧`;
  } else {
    advice = `Kombinasi yang seimbang: ${classCount} sesi kelas dan ${pendingTasks.length} tugas aktif. Konsistensi kecil setiap hari akan membuahkan hasil besar ✨`;
  }

  return {
    pendingCount: pendingTasks.length,
    completedCount,
    classCount,
    advice,
  };
};
