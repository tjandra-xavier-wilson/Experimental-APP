// src/services/calendarSync.js
// Google Calendar Sync & iCalendar (.ics) Export Service for Students

/**
 * Format date-time for Google Calendar URL (YYYYMMDDTHHmmssZ)
 */
export const formatGoogleDate = (dateStr, timeStr = '09:00') => {
  const [hours, minutes] = timeStr.split(':');
  const d = new Date(dateStr);
  d.setHours(Number(hours) || 9, Number(minutes) || 0, 0, 0);

  const pad = (n) => String(n).padStart(2, '0');
  const year = d.getUTCFullYear();
  const month = pad(d.getUTCMonth() + 1);
  const day = pad(d.getUTCDate());
  const hh = pad(d.getUTCHours());
  const mm = pad(d.getUTCMinutes());
  const ss = pad(d.getUTCSeconds());

  return `${year}${month}${day}T${hh}${mm}${ss}Z`;
};

/**
 * Generate a Google Calendar "Add Event" web URL
 */
export const getGoogleCalendarUrl = (item) => {
  const title = encodeURIComponent(item.title || item.name || 'Jadwal Belajar');
  const details = encodeURIComponent(
    `${item.description || item.notes || 'Dibuat dari StudyCal'}\n\nKategori: ${item.categoryName || 'Akademik'}\nEstimasi Waktu: ${item.estimatedMinutes || 60} menit`
  );
  const location = encodeURIComponent(item.room || item.location || 'Kampus / Meja Belajar');

  const startDateStr = item.dueDate || item.suggestedDate || new Date().toISOString().split('T')[0];
  const startTimeStr = item.dueTime || item.startTime || '09:00';
  
  // End time calculation (default +1 hour or task estimated minutes)
  const durationMin = Number(item.estimatedMinutes) || 60;
  const [sH, sM] = startTimeStr.split(':').map(Number);
  const endMinutesTotal = sH * 60 + sM + durationMin;
  const endH = String(Math.floor(endMinutesTotal / 60)).padStart(2, '0');
  const endM = String(endMinutesTotal % 60).padStart(2, '0');
  const endTimeStr = `${endH}:${endM}`;

  const startUtc = formatGoogleDate(startDateStr, startTimeStr);
  const endUtc = formatGoogleDate(startDateStr, endTimeStr);

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startUtc}/${endUtc}&details=${details}&location=${location}`;
};

/**
 * Generate an .ics calendar file content for all student tasks and classes
 */
export const exportToICalendar = (tasks = [], schedules = [], userName = 'Pelajar') => {
  const pad = (n) => String(n).padStart(2, '0');
  const now = new Date();
  const stamp = `${now.getUTCFullYear()}${pad(now.getUTCMonth() + 1)}${pad(now.getUTCDate())}T${pad(now.getUTCHours())}${pad(now.getUTCMinutes())}00Z`;

  let icsEvents = [];

  // 1. Export active tasks
  tasks.forEach((t) => {
    if (!t.dueDate) return;
    const startUtc = formatGoogleDate(t.dueDate, t.dueTime || '09:00');
    const endUtc = formatGoogleDate(t.dueDate, t.dueTime || '10:00');
    const uid = `task-${t.id || Math.random()}@studycal.app`;

    icsEvents.push([
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${stamp}`,
      `DTSTART:${startUtc}`,
      `DTEND:${endUtc}`,
      `SUMMARY:[Tugas] ${t.title}`,
      `DESCRIPTION:${(t.description || '').replace(/\n/g, '\\n')}`,
      `PRIORITY:${t.priority === 'high' ? '1' : t.priority === 'medium' ? '5' : '9'}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
    ].join('\r\n'));
  });

  // 2. Export recurring classes (sample for current month)
  schedules.forEach((s) => {
    const today = new Date();
    // generate events for next 4 weeks
    for (let w = 0; w < 4; w++) {
      const classDate = new Date(today);
      const currentDay = classDate.getDay();
      const targetDay = Number(s.dayOfWeek);
      const diff = (targetDay - currentDay + 7) % 7 + w * 7;
      classDate.setDate(classDate.getDate() + diff);

      const dateStr = classDate.toISOString().split('T')[0];
      const startUtc = formatGoogleDate(dateStr, s.startTime || '08:00');
      const endUtc = formatGoogleDate(dateStr, s.endTime || '10:00');
      const uid = `class-${s.id}-${w}@studycal.app`;

      icsEvents.push([
        'BEGIN:VEVENT',
        `UID:${uid}`,
        `DTSTAMP:${stamp}`,
        `DTSTART:${startUtc}`,
        `DTEND:${endUtc}`,
        `SUMMARY:[Kuliah/Kelas] ${s.courseName || 'Mata Pelajaran'}`,
        `LOCATION:${s.room || 'Ruang Kuliah'}`,
        `DESCRIPTION:Dosen/Guru: ${s.lecturer || '-'}\\nCatatan: ${s.notes || '-'}`,
        'STATUS:CONFIRMED',
        'END:VEVENT',
      ].join('\r\n'));
    }
  });

  const icsBody = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//StudyCal//Jadwal Mahasiswa dan Pelajar//ID',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:Jadwal Belajar ${userName}`,
    'X-WR-TIMEZONE:Asia/Jakarta',
    ...icsEvents,
    'END:VCALENDAR',
  ].join('\r\n');

  // Trigger file download in browser
  const blob = new Blob([icsBody], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `Jadwal_${userName.replace(/\s+/g, '_')}_StudyCal.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return true;
};
