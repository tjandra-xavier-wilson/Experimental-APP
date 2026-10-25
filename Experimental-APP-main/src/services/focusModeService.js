// src/services/focusModeService.js
import confetti from 'canvas-confetti';
import { triggerReminderAlert } from './notificationService';

const FOCUS_STORAGE_KEY = 'studycal_focus_mode_v1';
const STREAK_KEY = 'studycal_study_streak_v1';
const STREAK_RECORD_KEY = 'studycal_streak_record_v1';

export const FOCUS_MODE_EVENT = 'studycal_focus_mode_update';

const getTodayDateString = () => new Date().toISOString().split('T')[0];

const getDefaultFocusState = () => ({
  isActive: false,
  startedAt: null,
  todayDate: getTodayDateString(),
  todaySeconds: 0,
  totalSeconds: 0,
  streakAwardedDate: null,
});

export const getFocusModeState = () => {
  try {
    const raw = localStorage.getItem(FOCUS_STORAGE_KEY);
    if (!raw) return getDefaultFocusState();
    const parsed = JSON.parse(raw);
    const todayStr = getTodayDateString();

    // If new day, roll over todaySeconds
    if (parsed.todayDate !== todayStr) {
      return {
        ...parsed,
        todayDate: todayStr,
        todaySeconds: 0,
        startedAt: parsed.isActive ? new Date().toISOString() : null,
      };
    }
    return parsed;
  } catch (e) {
    return getDefaultFocusState();
  }
};

export const saveFocusModeState = (state) => {
  try {
    localStorage.setItem(FOCUS_STORAGE_KEY, JSON.stringify(state));
    window.dispatchEvent(new CustomEvent(FOCUS_MODE_EVENT, { detail: state }));
  } catch (e) {
    console.warn('Error saving focus mode state:', e);
  }
};

/**
 * Check if todaySeconds >= 3600 (1 hour) and award +1 streak if not awarded yet today
 */
export const checkAndAwardStreak = (currentState) => {
  const todayStr = getTodayDateString();
  const MIN_SECONDS_FOR_STREAK = 3600; // 1 Jam minimal

  if (currentState.todaySeconds >= MIN_SECONDS_FOR_STREAK && currentState.streakAwardedDate !== todayStr) {
    let currentStreak = 0;
    let currentRecord = 0;

    try {
      const rawStreak = localStorage.getItem(STREAK_KEY);
      currentStreak = rawStreak ? Math.max(0, parseInt(rawStreak, 10)) : 0;
      const rawRecord = localStorage.getItem(STREAK_RECORD_KEY);
      currentRecord = rawRecord ? Math.max(0, parseInt(rawRecord, 10)) : 0;
    } catch {}

    const newStreak = currentStreak + 1;
    const newRecord = Math.max(currentRecord, newStreak);

    try {
      localStorage.setItem(STREAK_KEY, String(newStreak));
      localStorage.setItem(STREAK_RECORD_KEY, String(newRecord));
    } catch {}

    const updatedState = {
      ...currentState,
      streakAwardedDate: todayStr,
    };
    saveFocusModeState(updatedState);

    // Trigger celebration
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (e) {}

    triggerReminderAlert(
      '🎉 Target 1 Jam Terpenuhi!',
      `Selamat! Kamu telah fokus belajar minimal 1 jam hari ini. Study streak kamu bertambah menjadi ${newStreak} Hari!`
    );

    return updatedState;
  }

  return currentState;
};

/**
 * Start or resume focus mode
 */
export const startFocusMode = () => {
  const state = getFocusModeState();
  const todayStr = getTodayDateString();

  const nextState = {
    ...state,
    isActive: true,
    startedAt: new Date().toISOString(),
    todayDate: todayStr,
    todaySeconds: state.todayDate === todayStr ? state.todaySeconds : 0,
  };

  saveFocusModeState(nextState);
  return nextState;
};

/**
 * Pause / Stop focus mode and accumulate elapsed seconds
 */
export const stopFocusMode = () => {
  const state = getFocusModeState();
  if (!state.isActive) return state;

  let sessionElapsed = 0;
  if (state.startedAt) {
    const startMs = new Date(state.startedAt).getTime();
    sessionElapsed = Math.max(0, Math.floor((Date.now() - startMs) / 1000));
  }

  const todayStr = getTodayDateString();
  const baseTodaySec = state.todayDate === todayStr ? state.todaySeconds : 0;
  const newTodaySec = baseTodaySec + sessionElapsed;
  const newTotalSec = (state.totalSeconds || 0) + sessionElapsed;

  let nextState = {
    ...state,
    isActive: false,
    startedAt: null,
    todayDate: todayStr,
    todaySeconds: newTodaySec,
    totalSeconds: newTotalSec,
  };

  nextState = checkAndAwardStreak(nextState);
  saveFocusModeState(nextState);
  return nextState;
};

/**
 * Reset focus mode metrics back to 0
 */
export const resetFocusMode = () => {
  const resetState = getDefaultFocusState();
  saveFocusModeState(resetState);
  return resetState;
};

/**
 * Calculates current live metrics including active session elapsed seconds
 */
export const getLiveFocusMetrics = () => {
  const state = getFocusModeState();
  const todayStr = getTodayDateString();

  let liveSessionSec = 0;
  if (state.isActive && state.startedAt) {
    const startMs = new Date(state.startedAt).getTime();
    liveSessionSec = Math.max(0, Math.floor((Date.now() - startMs) / 1000));
  }

  const baseTodaySec = state.todayDate === todayStr ? state.todaySeconds : 0;
  const totalTodaySec = baseTodaySec + liveSessionSec;
  const totalAccumulatedSec = (state.totalSeconds || 0) + liveSessionSec;

  const totalFocusHours = Number((totalAccumulatedSec / 3600).toFixed(2));
  const todayFocusHours = Number((totalTodaySec / 3600).toFixed(2));
  const todayFocusMinutes = Math.floor(totalTodaySec / 60);

  // Target 1 hour = 3600 seconds
  const streakTargetSeconds = 3600;
  const streakProgressPercent = Math.min(100, Math.round((totalTodaySec / streakTargetSeconds) * 100));
  const isStreakAwarded = state.streakAwardedDate === todayStr;

  return {
    isActive: state.isActive,
    startedAt: state.startedAt,
    liveSessionSeconds: liveSessionSec,
    todaySeconds: totalTodaySec,
    totalSeconds: totalAccumulatedSec,
    todayFocusMinutes,
    todayFocusHours,
    totalFocusHours,
    streakProgressPercent,
    isStreakAwarded,
  };
};

/**
 * Format seconds to HH:MM:SS
 */
export const formatDurationHMS = (totalSeconds) => {
  const s = Math.max(0, Math.floor(totalSeconds));
  const hrs = Math.floor(s / 3600);
  const mins = Math.floor((s % 3600) / 60);
  const secs = s % 60;

  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
};
