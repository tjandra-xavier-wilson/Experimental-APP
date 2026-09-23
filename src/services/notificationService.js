// src/services/notificationService.js
// Notification & Alert Service for Student Schedules and Reminders

/**
 * Play a calm, soothing audio chime using Web Audio API (no external file needed)
 */
export const playNotificationChime = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    const now = ctx.currentTime;
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();

    // Gentle pastel-like chord (F5 and A5)
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(698.46, now); // F5
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880.0, now + 0.08); // A5

    gainNode.gain.setValueAtTime(0.001, now);
    gainNode.gain.exponentialRampToValueAtTime(0.2, now + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now + 0.08);
    osc1.stop(now + 0.8);
    osc2.stop(now + 0.8);
  } catch (e) {
    console.warn('Audio chime could not be played:', e);
  }
};

/**
 * Request browser permission for system notifications
 */
export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    return 'unsupported';
  }
  if (Notification.permission === 'granted') {
    return 'granted';
  }
  try {
    const perm = await Notification.requestPermission();
    return perm;
  } catch (e) {
    console.error('Notification permission error:', e);
    return 'denied';
  }
};

/**
 * Send an immediate notification (both browser and sound)
 */
export const triggerReminderAlert = (title, body, icon = '🌱') => {
  playNotificationChime();

  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(`${icon} StudyCal: ${title}`, {
        body,
        icon: '/vite.svg',
      });
    } catch (e) {
      console.warn('Browser notification error:', e);
    }
  }
};
