// src/services/storage.js
import { supabase, isSupabaseConfigured } from './supabaseClient.js';
import {
  syncTaskToSupabase,
  deleteTaskFromSupabase,
  syncScheduleToSupabase,
  deleteScheduleFromSupabase,
  syncCourseToSupabase,
  deleteCourseFromSupabase,
  syncFriendsToSupabase,
  deleteFriendFromSupabase,
  syncNotesToSupabase,
  deleteNoteFromSupabase,
  upsertSupabaseProfile,
  getSupabaseProfile,
  fetchAllUserDataFromSupabase,
} from './supabaseService.js';

// Safe storage wrapper for Browser, Mobile WebViews, SSR, and Node environments
const safeLocalStorage = {
  getItem: (key) => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(key);
      }
    } catch (e) {
      console.warn('safeLocalStorage getItem error:', e);
    }
    return null;
  },
  setItem: (key, val) => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, val);
      }
    } catch (e) {
      console.warn('safeLocalStorage setItem error:', e);
    }
  },
  removeItem: (key) => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
      }
    } catch (e) {}
  },
};

const safeSessionStorage = {
  getItem: (key) => {
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        return window.sessionStorage.getItem(key);
      }
    } catch (e) {}
    return null;
  },
  setItem: (key, val) => {
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        window.sessionStorage.setItem(key, val);
      }
    } catch (e) {}
  },
  removeItem: (key) => {
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        window.sessionStorage.removeItem(key);
      }
    } catch (e) {}
  },
};

// Default pastel palette references
export const PASTEL_COLORS = [
  { name: 'Lavender Focus', hex: '#8E94F2', bg: '#F0F1FF', border: '#D0D4FC' },
  { name: 'Mint Sage', hex: '#48BB78', bg: '#EDFDF5', border: '#C6F6D5' },
  { name: 'Peach Sherbet', hex: '#ED8936', bg: '#FFFAF0', border: '#FEEBC8' },
  { name: 'Sky Breeze', hex: '#4299E1', bg: '#EBF8FF', border: '#BEE3F8' },
  { name: 'Rose Petal', hex: '#ED64A6', bg: '#FFF5F7', border: '#FED7E2' },
  { name: 'Soft Buttercup', hex: '#D69E2E', bg: '#FFFFF0', border: '#FEFCBF' },
  { name: 'Lilac Dream', hex: '#9F7AEA', bg: '#FAF5FF', border: '#E9D8FD' },
];

export const DEFAULT_CATEGORIES = [
  { id: 'cat-1', name: 'Tugas & PR', color: '#8E94F2', bg: '#F0F1FF', icon: 'BookOpen' },
  { id: 'cat-2', name: 'Ujian & Kuis', color: '#ED8936', bg: '#FFFAF0', icon: 'AlertCircle' },
  { id: 'cat-3', name: 'Kuliah & Sekolah', color: '#4299E1', bg: '#EBF8FF', icon: 'CheckSquare' },
  { id: 'cat-4', name: 'Organisasi & Ekskul', color: '#48BB78', bg: '#EDFDF5', icon: 'Users' },
  { id: 'cat-5', name: 'Self-Care & Istirahat', color: '#ED64A6', bg: '#FFF5F7', icon: 'Heart' },
];

// Helper for unique IDs
export const generateId = (prefix = 'id') =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

const STORAGE_KEYS = {
  USERS: 'studycal_users_v1',
  SESSION: 'studycal_current_session_v1',
  REMEMBER: 'studycal_remember_token_v1',
  DATA_PREFIX: 'studycal_userdata_',
  DELETED_IDS: 'studycal_deleted_ids_v1',
  RECYCLE_BIN: 'studycal_recycle_bin_v1',
};

export const CANONICAL_USER_ID = 'user-tjandra-wilson-live';

// ==========================================
// Deletion Tombstone Tracking & Recycle Bin
// ==========================================

export const getRecycleBin = () => {
  try {
    const raw = safeLocalStorage.getItem(STORAGE_KEYS.RECYCLE_BIN);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

export const addToRecycleBin = (item, type = 'item') => {
  if (!item || !item.id) return;
  try {
    const current = getRecycleBin();
    const entry = {
      ...item,
      itemType: type,
      deletedAt: new Date().toISOString(),
    };
    const updated = [entry, ...current.filter((x) => x.id !== item.id)].slice(0, 200);
    safeLocalStorage.setItem(STORAGE_KEYS.RECYCLE_BIN, JSON.stringify(updated));
  } catch (e) {}
};

export const DUMMY_IDS_TO_PURGE = [
  'tsk-organik-003',
  'tsk-organik-001',
  'tsk-pertama-1790737538001',
  'tsk-organik-002',
  'tsk-1791295419938-fpcol',
  'tsk-1791295302794-71bc4',
  'tsk-1791295492959-iulew',
  'tsk-1791295609919-8cypi',
  'tsk-1791295345376-wnbun',
  'tsk-1791296469326-ycpxw',
  'tsk-1791300954493-7ugtv',
  'tsk-1791294764200-c54mc',
  'sch-kamis-informatika',
  'sch-rabu-fisika',
  'sch-senin-matematika',
  'crs-fisika-modern',
  'crs-matematika-peminatan',
  'crs-informatika-dasar',
  'frd-kevin-sanusi',
  'frd-valerie-angela',
  'frd-1791297997789-hdpfm',
];

export const isDummyId = (id) => {
  if (!id) return false;
  return DUMMY_IDS_TO_PURGE.includes(id);
};

export const getDeletedIds = () => {
  try {
    const raw = safeLocalStorage.getItem(STORAGE_KEYS.DELETED_IDS);
    const list = raw ? JSON.parse(raw) : [];
    return Array.from(new Set([...list, ...DUMMY_IDS_TO_PURGE]));
  } catch (e) {
    return DUMMY_IDS_TO_PURGE;
  }
};

export const addDeletedId = (id) => {
  if (!id) return;
  try {
    const current = getDeletedIds();
    if (!current.includes(id)) {
      const updated = [id, ...current].slice(0, 500);
      safeLocalStorage.setItem(STORAGE_KEYS.DELETED_IDS, JSON.stringify(updated));
    }
  } catch (e) {}
};

export const isItemDeleted = (id) => {
  if (!id) return false;
  const deletedIds = getDeletedIds();
  const recycleIds = getRecycleBin().map((x) => x.id);
  return deletedIds.includes(id) || recycleIds.includes(id) || isDummyId(id);
};

// ==========================================
// Field Mappers: Frontend <-> Supabase
// ==========================================

export const taskToSupabase = (task, userId) => ({
  id: task.id || generateId('tsk'),
  user_id: CANONICAL_USER_ID,
  title: task.title || '',
  course_id: task.courseId || null,
  course_name: task.courseName || null,
  due_date: task.dueDate || null,
  due_time: task.dueTime || null,
  priority: task.priority || 'medium',
  difficulty: task.difficulty || 'medium',
  estimated_minutes: Number(task.estimatedMinutes) || 30,
  category: task.category || 'Tugas & PR',
  color: task.color || '#8E94F2',
  is_completed: Boolean(task.isCompleted),
  status: task.status || (task.isCompleted ? 'completed' : 'in_progress'),
  completed_at: task.completedAt || null,
  ai_recommended_slot: task.aiRecommendedSlot
    ? typeof task.aiRecommendedSlot === 'object'
      ? task.aiRecommendedSlot
      : JSON.parse(task.aiRecommendedSlot)
    : null,
  notes: task.notes || null,
  updated_at: new Date().toISOString(),
});

export const taskFromSupabase = (row) => ({
  id: row.id,
  userId: row.user_id,
  title: row.title || '',
  courseId: row.course_id || '',
  courseName: row.course_name || '',
  dueDate: row.due_date || '',
  dueTime: row.due_time || '',
  priority: row.priority || 'medium',
  difficulty: row.difficulty || 'medium',
  estimatedMinutes: Number(row.estimated_minutes) || 30,
  category: row.category || 'Tugas & PR',
  color: row.color || '#8E94F2',
  isCompleted: Boolean(row.is_completed),
  status: row.status || (row.is_completed ? 'completed' : 'in_progress'),
  completedAt: row.completed_at || null,
  aiRecommendedSlot: row.ai_recommended_slot
    ? typeof row.ai_recommended_slot === 'string'
      ? JSON.parse(row.ai_recommended_slot)
      : row.ai_recommended_slot
    : null,
  notes: row.notes || '',
  createdAt: row.created_at || new Date().toISOString(),
  updatedAt: row.updated_at || new Date().toISOString(),
});

export const scheduleToSupabase = (sch, userId) => ({
  id: sch.id || generateId('sch'),
  user_id: CANONICAL_USER_ID,
  course_id: sch.courseId || null,
  course_name: sch.courseName || sch.name || 'Jadwal Kuliah',
  day_of_week: Number(sch.dayOfWeek) || 1,
  start_time: sch.startTime || '08:00',
  end_time: sch.endTime || '10:00',
  room: sch.room || '',
  color: sch.color || '#8E94F2',
  lecturer: sch.lecturer || '',
  updated_at: new Date().toISOString(),
});

export const scheduleFromSupabase = (row) => ({
  id: row.id,
  userId: row.user_id,
  courseId: row.course_id || '',
  courseName: row.course_name || '',
  dayOfWeek: Number(row.day_of_week) || 1,
  startTime: row.start_time || '08:00',
  endTime: row.end_time || '10:00',
  room: row.room || '',
  color: row.color || '#8E94F2',
  lecturer: row.lecturer || '',
  createdAt: row.created_at || new Date().toISOString(),
  updatedAt: row.updated_at || new Date().toISOString(),
});

export const courseToSupabase = (crs, userId) => ({
  id: crs.id || generateId('crs'),
  user_id: CANONICAL_USER_ID,
  name: crs.name || '',
  code: crs.code || '',
  lecturer: crs.lecturer || '',
  room: crs.room || '',
  color: crs.color || '#8E94F2',
  updated_at: new Date().toISOString(),
});

export const courseFromSupabase = (row) => ({
  id: row.id,
  userId: row.user_id,
  name: row.name || '',
  code: row.code || '',
  lecturer: row.lecturer || '',
  room: row.room || '',
  color: row.color || '#8E94F2',
  createdAt: row.created_at || new Date().toISOString(),
  updatedAt: row.updated_at || new Date().toISOString(),
});

export const friendToSupabase = (frd, userId) => ({
  id: frd.id || generateId('frd'),
  user_id: CANONICAL_USER_ID,
  name: frd.name || '',
  initials: frd.initials || 'FR',
  avatar_bg: frd.avatarBg || '#8E94F2',
  major: frd.major || '',
  semester: frd.semester || '',
  progress: Number(frd.progress) || 0,
  completed_tasks: Number(frd.completedTasks) || 0,
  total_tasks: Number(frd.totalTasks) || 0,
  status: frd.status || '',
  nearest_task: frd.nearestTask || null,
});

export const friendFromSupabase = (row) => ({
  id: row.id,
  userId: row.user_id,
  name: row.name || '',
  initials: row.initials || 'FR',
  avatarBg: row.avatar_bg || '#8E94F2',
  major: row.major || '',
  semester: row.semester || '',
  progress: Number(row.progress) || 0,
  completedTasks: Number(row.completed_tasks) || 0,
  totalTasks: Number(row.total_tasks) || 0,
  status: row.status || '',
  nearestTask: row.nearest_task || null,
  createdAt: row.created_at || new Date().toISOString(),
});

export const noteToSupabase = (note, userId) => ({
  id: note.id || generateId('not'),
  user_id: CANONICAL_USER_ID,
  title: note.title || '',
  content: note.content || '',
  date: note.date || new Date().toLocaleDateString('id-ID'),
  updated_at: new Date().toISOString(),
});

export const noteFromSupabase = (row) => ({
  id: row.id,
  userId: row.user_id,
  title: row.title || '',
  content: row.content || '',
  date: row.date || '',
  createdAt: row.created_at || new Date().toISOString(),
  updatedAt: row.updated_at || new Date().toISOString(),
});

// ==========================================
// Cloud Sync Functions (Supabase)
// ==========================================

export const fetchCloudUserData = async (userId) => {
  const targetUserId = CANONICAL_USER_ID;
  try {
    const [
      { data: tasksData, error: tasksErr },
      { data: schedData, error: schedErr },
      { data: courseData, error: courseErr },
      { data: friendData, error: friendErr },
      { data: noteData, error: noteErr },
    ] = await Promise.all([
      supabase
        .from('tasks')
        .select('*')
        .eq('user_id', targetUserId)
        .order('created_at', { ascending: false }),
      supabase.from('schedules').select('*').eq('user_id', targetUserId),
      supabase.from('courses').select('*').eq('user_id', targetUserId),
      supabase.from('friends').select('*').eq('user_id', targetUserId),
      supabase
        .from('notes')
        .select('*')
        .eq('user_id', targetUserId)
        .order('created_at', { ascending: false }),
    ]);

    if (tasksErr) console.warn('Supabase fetch tasks error:', tasksErr);
    if (schedErr) console.warn('Supabase fetch schedules error:', schedErr);
    if (courseErr) console.warn('Supabase fetch courses error:', courseErr);
    if (friendErr) console.warn('Supabase fetch friends error:', friendErr);
    if (noteErr) console.warn('Supabase fetch notes error:', noteErr);

    const mappedTasks = (tasksData || []).map(taskFromSupabase);
    const mappedSchedules = (schedData || []).map(scheduleFromSupabase);
    const mappedCourses = (courseData || []).map(courseFromSupabase);
    const mappedFriends = (friendData || []).map(friendFromSupabase);
    const mappedNotes = (noteData || []).map(noteFromSupabase);

    // Fetch cloud profile
    const cloudProfile = await getSupabaseProfile(targetUserId);

    // Update local cache with Smart Pruning Sync:
    // Any item deleted in Supabase is removed from local cache. Local items will NOT resurrect deleted items.
    const currentLocal = getUserData(targetUserId) || (userId ? getUserData(userId) : {}) || {};
    const deletedIds = getDeletedIds();
    const recycleIds = getRecycleBin().map((x) => x.id);

    const isNotDeleted = (item) =>
      item &&
      item.id &&
      !deletedIds.includes(item.id) &&
      !recycleIds.includes(item.id) &&
      !isDummyId(item.id);

    // Auto-purge any deleted/dummy items that Supabase returned so they never resurrect on other devices
    if (isSupabaseConfigured()) {
      const dirtyTaskIds = (tasksData || [])
        .filter((t) => !isNotDeleted(t))
        .map((t) => t.id);
      if (dirtyTaskIds.length > 0) {
        supabase.from('tasks').delete().in('id', dirtyTaskIds).then(() => {}).catch(() => {});
      }

      const dirtySchedIds = (schedData || [])
        .filter((s) => !isNotDeleted(s))
        .map((s) => s.id);
      if (dirtySchedIds.length > 0) {
        supabase.from('schedules').delete().in('id', dirtySchedIds).then(() => {}).catch(() => {});
      }
    }

    const cleanCloudTasks = mappedTasks.filter(isNotDeleted);
    const cleanCloudSchedules = mappedSchedules.filter(isNotDeleted);
    const cleanCloudCourses = mappedCourses.filter(isNotDeleted);
    const cleanCloudFriends = mappedFriends.filter(isNotDeleted);
    const cleanCloudNotes = mappedNotes.filter(isNotDeleted);

    // Only keep local items if they are specifically marked as offline pending sync
    const syncPendingOffline = (cleanCloudList, localList, syncFn) => {
      const map = new Map();
      cleanCloudList.forEach((item) => map.set(item.id, item));
      (localList || []).forEach((item) => {
        if (isNotDeleted(item) && !map.has(item.id) && item._pendingCloudSync) {
          map.set(item.id, item);
          if (syncFn && isSupabaseConfigured()) {
            syncFn(targetUserId, item).catch(() => {});
          }
        }
      });
      return Array.from(map.values());
    };

    const finalTasks = syncPendingOffline(cleanCloudTasks, currentLocal.tasks, syncTaskToSupabase);
    const finalSchedules = syncPendingOffline(cleanCloudSchedules, currentLocal.schedules, syncScheduleToSupabase);
    const finalCourses = syncPendingOffline(cleanCloudCourses, currentLocal.courses, syncCourseToSupabase);
    const finalFriends = cleanCloudFriends;
    const finalNotes = cleanCloudNotes.map((n) => {
      const localMatch = (currentLocal.notes || []).find((ln) => ln.id === n.id);
      return {
        ...n,
        googleDocUrl: n.googleDocUrl || localMatch?.googleDocUrl || null,
      };
    });

    const updatedBundle = {
      ...currentLocal,
      tasks: finalTasks,
      schedules: finalSchedules,
      courses: finalCourses,
      friends: finalFriends,
      notes: finalNotes,
    };
    saveUserData(targetUserId, updatedBundle);
    if (userId && userId !== targetUserId) {
      saveUserData(userId, updatedBundle);
    }

    // Also sync cloudProfile into stored users if found
    if (cloudProfile && cloudProfile.name) {
      const users = getStoredUsers();
      const uIdx = users.findIndex((u) => u.id === targetUserId || (userId && u.id === userId));
      if (uIdx >= 0) {
        users[uIdx] = {
          ...users[uIdx],
          name: cloudProfile.name || users[uIdx].name,
          schoolName: cloudProfile.schoolName || users[uIdx].schoolName,
          major: cloudProfile.major || users[uIdx].major,
          semester: cloudProfile.semester || users[uIdx].semester,
          avatarBg: cloudProfile.avatarBg || users[uIdx].avatarBg || '#8E94F2',
          status: cloudProfile.status || users[uIdx].status || 'Sedang Belajar 📚',
          bio: cloudProfile.bio !== undefined ? cloudProfile.bio : (users[uIdx].bio || ''),
          target: cloudProfile.target !== undefined ? cloudProfile.target : (users[uIdx].target || ''),
          studyPreference: cloudProfile.studyPreference || users[uIdx].studyPreference,
        };
        saveUsers(users);
      }
    }

    return {
      tasks: finalTasks,
      schedules: finalSchedules,
      courses: finalCourses,
      friends: finalFriends,
      notes: finalNotes,
      profile: cloudProfile,
    };
  } catch (err) {
    console.error('Error in fetchCloudUserData:', err);
    return null;
  }
};

export const pullDataFromSupabase = async (userId) => {
  return await fetchCloudUserData(userId);
};

export const subscribeToCloudChanges = (userId, onTasksChange, onStatusChange) => {
  const targetUserId = CANONICAL_USER_ID;
  let isSubscribed = false;
  let pollingInterval = null;
  let channel = null;

  const triggerUpdate = async () => {
    try {
      const fresh = await fetchCloudUserData(targetUserId);
      if (fresh && fresh.tasks && onTasksChange) {
        onTasksChange(fresh.tasks, fresh);
      }
    } catch (e) {
      console.warn('Smart sync background fetch warning:', e);
    }
  };

  // 1. Fallback smart polling mechanism (runs when Realtime WebSocket is unhealthy/degraded or in background)
  const startSmartPolling = () => {
    if (pollingInterval) return;
    if (onStatusChange) onStatusChange('FALLBACK_POLLING');
    pollingInterval = setInterval(triggerUpdate, 15000);
  };

  const stopSmartPolling = () => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      pollingInterval = null;
    }
  };

  // Trigger sync on tab focus or visibility change (e.g. switching between apps or unlocking phone)
  const handleVisibilityChange = () => {
    if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
      triggerUpdate();
    }
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', triggerUpdate);
  }

  // 2. Realtime WebSocket subscription listening to tasks, schedules, courses, friends, profiles
  try {
    const channelId = `rt-sync-${targetUserId}-${Math.random().toString(36).substring(2, 7)}`;
    channel = supabase
      .channel(channelId)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks', filter: `user_id=eq.${targetUserId}` },
        () => {
          triggerUpdate();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'schedules', filter: `user_id=eq.${targetUserId}` },
        () => {
          triggerUpdate();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'courses', filter: `user_id=eq.${targetUserId}` },
        () => {
          triggerUpdate();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'friends', filter: `user_id=eq.${targetUserId}` },
        () => {
          triggerUpdate();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles', filter: `id=eq.${targetUserId}` },
        () => {
          triggerUpdate();
        }
      )
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          isSubscribed = true;
          stopSmartPolling();
          if (onStatusChange) onStatusChange('SUBSCRIBED');
        } else if (status === 'TIMED_OUT' || status === 'CHANNEL_ERROR' || status === 'CLOSED') {
          isSubscribed = false;
          console.warn(
            `Supabase Realtime status: ${status}. Mengaktifkan Smart Polling Fallback agar sinkronisasi lintas perangkat tetap 100% aktif.`
          );
          startSmartPolling();
          if (onStatusChange) onStatusChange(status);
        } else {
          if (onStatusChange) onStatusChange(status);
        }
      });
  } catch (e) {
    console.warn('Realtime subscription initialization error:', e);
    startSmartPolling();
  }

  // Safety timer: If after 5 seconds Realtime is not active, activate polling fallback
  const fallbackSafetyTimer = setTimeout(() => {
    if (!isSubscribed) {
      startSmartPolling();
    }
  }, 5000);

  return () => {
    clearTimeout(fallbackSafetyTimer);
    stopSmartPolling();
    if (typeof window !== 'undefined') {
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', triggerUpdate);
    }
    if (channel) {
      try {
        supabase.removeChannel(channel);
      } catch (e) {}
    }
  };
};

// ==========================================
// User & Auth Management
// ==========================================

export const getStoredUsers = () => {
  try {
    const raw = safeLocalStorage.getItem(STORAGE_KEYS.USERS);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Error reading users:', e);
    return [];
  }
};

export const saveUsers = (users) => {
  safeLocalStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
};

export const registerUser = ({
  id,
  name,
  email,
  password,
  educationLevel,
  schoolName,
  major,
  semester,
  studyPreference,
  rememberMe = true,
}) => {
  const users = getStoredUsers();
  const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    throw new Error('Email sudah terdaftar. Silakan login atau gunakan email lain.');
  }

  const isSMA = educationLevel === 'Siswa SMA/SMK' || educationLevel === 'SMA';
  const defaultMajor = isSMA ? 'IPA' : 'Informatika / Ilmu Komputer / Data Science';
  const defaultSemester = isSMA ? 'Kelas 11' : 'Semester 4';
  const defaultSchool = isSMA ? 'Mutiara Bangsa 2 School' : 'Universitas Indonesia';

  // Default user keeps CANONICAL_USER_ID; new accounts receive their own distinct ID
  const isDefaultAccount = email.trim().toLowerCase() === 'tjandrawilson@mutiarabangsa.sch.id';
  const userId = isDefaultAccount
    ? CANONICAL_USER_ID
    : id || `user-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  const newUser = {
    id: userId,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    passwordHash: password,
    educationLevel: isSMA ? 'Siswa SMA/SMK' : 'Mahasiswa',
    schoolName: schoolName?.trim() || defaultSchool,
    major: major?.trim() || defaultMajor,
    semester: semester?.trim() || defaultSemester,
    studyPreference: studyPreference || 'balanced',
    avatarBg: '#8E94F2',
    status: 'Sedang Belajar 📚',
    bio: 'Fokus target nilai 95+ dan konsisten belajar setiap hari!',
    target: 'UTBK & Nilai Rapor Unggul',
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  saveUsers(users);

  // Sync profile to Supabase in background
  if (isSupabaseConfigured()) {
    upsertSupabaseProfile(newUser).catch((e) =>
      console.warn('Supabase profile sync warning:', e)
    );
  }

  initStarterData(newUser);
  setSession(newUser, rememberMe);
  return newUser;
};

export const loginUser = (email, password, rememberMe = true) => {
  const users = getStoredUsers();
  let user = users.find(
    (u) =>
      u.email.toLowerCase() === email.trim().toLowerCase() && u.passwordHash === password
  );

  // If logging in as default user and not yet in localStorage, create it
  if (!user && (email.trim().toLowerCase() === 'tjandrawilson@mutiarabangsa.sch.id' || users.length === 0)) {
    user = ensureDefaultUser();
  }

  if (!user) {
    throw new Error('Email atau kata sandi tidak cocok. Periksa kembali akun Anda.');
  }

  setSession(user, rememberMe);
  return user;
};

export const ensureDefaultUser = () => {
  const users = getStoredUsers();
  let existing = users.find(
    (u) =>
      u.id === CANONICAL_USER_ID ||
      u.email?.toLowerCase() === 'tjandrawilson@mutiarabangsa.sch.id'
  );

  if (existing) {
    return existing;
  }

  const defaultUser = registerUser({
    id: CANONICAL_USER_ID,
    name: 'Tjandra Wilson',
    email: 'tjandrawilson@mutiarabangsa.sch.id',
    password: 'password123',
    educationLevel: 'Siswa SMA/SMK',
    schoolName: 'Mutiara Bangsa 2 School',
    major: 'IPA',
    semester: 'Kelas 11',
    studyPreference: 'balanced',
    rememberMe: true,
  });

  return defaultUser;
};

export const setSession = (user, rememberMe = true) => {
  if (!user) return;
  const sessionData = {
    userId: user.id,
    userEmail: user.email,
    loggedAt: new Date().toISOString(),
  };

  if (rememberMe) {
    safeLocalStorage.setItem(STORAGE_KEYS.REMEMBER, JSON.stringify(sessionData));
    safeSessionStorage.removeItem(STORAGE_KEYS.SESSION);
  } else {
    safeSessionStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(sessionData));
    safeLocalStorage.removeItem(STORAGE_KEYS.REMEMBER);
  }
};

export const getCurrentSession = () => {
  try {
    const remRaw = safeLocalStorage.getItem(STORAGE_KEYS.REMEMBER);
    const sessRaw = safeSessionStorage.getItem(STORAGE_KEYS.SESSION);
    const raw = remRaw || sessRaw;
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    const users = getStoredUsers();

    // Look up active account by userEmail first (most reliable), then by userId
    let user = null;
    if (parsed.userEmail) {
      user = users.find((u) => u.email?.toLowerCase() === parsed.userEmail.toLowerCase());
    }
    if (!user && parsed.userId) {
      user = users.find((u) => u.id === parsed.userId);
    }

    if (user) {
      return { user, rememberMe: Boolean(remRaw) };
    }

    return null;
  } catch (e) {
    console.error('Session check error:', e);
    return null;
  }
};

export const logoutUser = () => {
  safeLocalStorage.removeItem(STORAGE_KEYS.REMEMBER);
  safeSessionStorage.removeItem(STORAGE_KEYS.SESSION);
};

// Seed Starter Data
const initStarterData = (user) => {
  const userBundle = {
    categories: DEFAULT_CATEGORIES,
    courses: [],
    schedules: [],
    tasks: [],
    friends: [],
    reminders: [],
  };
  saveUserData(user.id, userBundle);
};

// ==========================================
// Generic User Data Storage
// ==========================================

export const getUserData = (userId) => {
  const targetId = CANONICAL_USER_ID;
  try {
    const raw =
      safeLocalStorage.getItem(`${STORAGE_KEYS.DATA_PREFIX}${userId}`) ||
      (targetId && targetId !== userId ? safeLocalStorage.getItem(`${STORAGE_KEYS.DATA_PREFIX}${targetId}`) : null);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const deletedIds = getDeletedIds();
    const recycleIds = getRecycleBin().map((x) => x.id);

    let modified = false;
    const sanitize = (list) => {
      if (!Array.isArray(list)) return [];
      const filtered = list.filter(
        (item) =>
          item &&
          item.id &&
          !deletedIds.includes(item.id) &&
          !recycleIds.includes(item.id) &&
          !isDummyId(item.id)
      );
      if (filtered.length !== list.length) modified = true;
      return filtered;
    };

    if (parsed.tasks) parsed.tasks = sanitize(parsed.tasks);
    if (parsed.schedules) parsed.schedules = sanitize(parsed.schedules);
    if (parsed.courses) parsed.courses = sanitize(parsed.courses);
    if (parsed.friends) parsed.friends = sanitize(parsed.friends);

    if (modified) {
      safeLocalStorage.setItem(`${STORAGE_KEYS.DATA_PREFIX}${userId}`, JSON.stringify(parsed));
      if (targetId && targetId !== userId) {
        safeLocalStorage.setItem(`${STORAGE_KEYS.DATA_PREFIX}${targetId}`, JSON.stringify(parsed));
      }
    }

    return parsed;
  } catch (e) {
    console.error('Error fetching user data:', e);
    return null;
  }
};

export const saveUserData = (userId, data) => {
  safeLocalStorage.setItem(`${STORAGE_KEYS.DATA_PREFIX}${userId}`, JSON.stringify(data));
};

// ==========================================
// Task Operations (Local + Supabase Cloud)
// ==========================================

export const getTasks = (userId) => {
  const data = getUserData(userId);
  return data?.tasks || [];
};

export const saveTask = (userId, task) => {
  const targetId = CANONICAL_USER_ID;
  const data = getUserData(targetId) || (userId ? getUserData(userId) : null) || { tasks: [] };
  if (!data.tasks) data.tasks = [];

  const taskId = task.id || generateId('tsk');
  const fullTask = {
    ...task,
    id: taskId,
    userId: targetId,
    createdAt: task.createdAt || new Date().toISOString(),
  };

  const existingIndex = data.tasks.findIndex((t) => t.id === taskId);
  if (existingIndex >= 0) {
    data.tasks[existingIndex] = { ...data.tasks[existingIndex], ...fullTask };
  } else {
    data.tasks.unshift(fullTask);
  }
  saveUserData(targetId, data);
  if (userId && userId !== targetId) {
    saveUserData(userId, data);
  }

  // Background sync to Supabase
  if (isSupabaseConfigured()) {
    syncTaskToSupabase(targetId, fullTask).catch((e) =>
      console.warn('Supabase save task sync warning:', e)
    );
  }

  return data.tasks;
};

export const deleteTask = async (userId, taskId) => {
  const targetId = CANONICAL_USER_ID;
  addDeletedId(taskId);
  const data = getUserData(targetId) || (userId ? getUserData(userId) : null);
  if (data && data.tasks) {
    const targetTask = data.tasks.find((t) => t.id === taskId);
    if (targetTask) {
      addToRecycleBin(targetTask, 'task');
    }
    data.tasks = data.tasks.filter((t) => t.id !== taskId);
    saveUserData(targetId, data);
    if (userId && userId !== targetId) {
      saveUserData(userId, data);
    }
  }

  // Background sync to Supabase with error catching
  if (isSupabaseConfigured() && taskId) {
    try {
      await deleteTaskFromSupabase(taskId);
    } catch (e) {
      console.warn('Supabase delete task sync warning:', e);
    }
  }

  return data?.tasks || [];
};

export const toggleTaskStatus = (userId, taskId) => {
  const targetId = CANONICAL_USER_ID;
  const data = getUserData(targetId) || (userId ? getUserData(userId) : null);
  if (!data || !data.tasks) return [];

  let targetTask = null;
  data.tasks = data.tasks.map((t) => {
    if (t.id === taskId) {
      const willBeCompleted = !t.isCompleted;
      targetTask = {
        ...t,
        isCompleted: willBeCompleted,
        status: willBeCompleted ? 'completed' : 'in_progress',
        completedAt: willBeCompleted ? new Date().toISOString() : null,
      };
      return targetTask;
    }
    return t;
  });
  saveUserData(targetId, data);
  if (userId && userId !== targetId) {
    saveUserData(userId, data);
  }

  // Background sync to Supabase
  if (isSupabaseConfigured() && targetTask) {
    syncTaskToSupabase(targetId, targetTask).catch((e) =>
      console.warn('Supabase toggle task sync warning:', e)
    );
  }

  return data.tasks;
};

// ==========================================
// Schedule Operations (Local + Supabase Cloud)
// ==========================================

export const getSchedules = (userId) => {
  const data = getUserData(userId);
  return data?.schedules || [];
};

export const saveSchedule = (userId, schedule) => {
  const targetId = CANONICAL_USER_ID;
  const data = getUserData(targetId) || (userId ? getUserData(userId) : null) || { schedules: [] };
  if (!data.schedules) data.schedules = [];

  const schId = schedule.id || generateId('sch');
  const fullSch = { ...schedule, id: schId, userId: targetId };

  const existingIndex = data.schedules.findIndex((s) => s.id === schId);
  if (existingIndex >= 0) {
    data.schedules[existingIndex] = { ...data.schedules[existingIndex], ...fullSch };
  } else {
    data.schedules.push(fullSch);
  }
  saveUserData(targetId, data);
  if (userId && userId !== targetId) {
    saveUserData(userId, data);
  }

  // Background sync to Supabase
  if (isSupabaseConfigured()) {
    syncScheduleToSupabase(targetId, fullSch).catch((e) =>
      console.warn('Supabase schedule sync warning:', e)
    );
  }

  return data.schedules;
};

export const deleteSchedule = async (userId, scheduleId) => {
  const targetId = CANONICAL_USER_ID;
  addDeletedId(scheduleId);
  const data = getUserData(targetId) || (userId ? getUserData(userId) : null);
  if (data && data.schedules) {
    const targetSchedule = data.schedules.find((s) => s.id === scheduleId);
    if (targetSchedule) {
      addToRecycleBin(targetSchedule, 'schedule');
    }
    data.schedules = data.schedules.filter((s) => s.id !== scheduleId);
    saveUserData(targetId, data);
    if (userId && userId !== targetId) {
      saveUserData(userId, data);
    }
  }

  if (isSupabaseConfigured() && scheduleId) {
    try {
      await deleteScheduleFromSupabase(scheduleId);
    } catch (e) {
      console.warn('Supabase delete schedule sync warning:', e);
    }
  }

  return data?.schedules || [];
};

// ==========================================
// Categories & Courses
// ==========================================

export const getCategories = (userId) => {
  const data = getUserData(userId);
  return data?.categories || DEFAULT_CATEGORIES;
};

export const getCourses = (userId) => {
  const data = getUserData(userId);
  return data?.courses || [];
};

export const saveCourse = (userId, course) => {
  const targetId = CANONICAL_USER_ID;
  const data = getUserData(targetId) || (userId ? getUserData(userId) : null) || { courses: [] };
  if (!data.courses) data.courses = [];

  const crsId = course.id || generateId('crs');
  const fullCrs = { ...course, id: crsId, userId: targetId };

  const existingIndex = data.courses.findIndex((c) => c.id === crsId);
  if (existingIndex >= 0) {
    data.courses[existingIndex] = { ...data.courses[existingIndex], ...fullCrs };
  } else {
    data.courses.push(fullCrs);
  }
  saveUserData(targetId, data);
  if (userId && userId !== targetId) {
    saveUserData(userId, data);
  }

  if (isSupabaseConfigured()) {
    syncCourseToSupabase(targetId, fullCrs).catch((e) =>
      console.warn('Supabase course sync warning:', e)
    );
  }

  return data.courses;
};

export const deleteCourse = (userId, courseId) => {
  const targetId = CANONICAL_USER_ID;
  addDeletedId(courseId);
  const data = getUserData(targetId) || (userId ? getUserData(userId) : null);
  if (data && data.courses) {
    data.courses = data.courses.filter((c) => c.id !== courseId);
    saveUserData(targetId, data);
    if (userId && userId !== targetId) {
      saveUserData(userId, data);
    }
  }

  if (isSupabaseConfigured() && courseId) {
    deleteCourseFromSupabase(courseId).catch((e) =>
      console.warn('Supabase delete course sync warning:', e)
    );
  }

  return data?.courses || [];
};

// ==========================================
// Friends Feature Storage
// ==========================================

export const DEFAULT_FRIENDS = [];

export const getFriends = (userId) => {
  const targetId = CANONICAL_USER_ID;
  const data = getUserData(targetId) || (userId ? getUserData(userId) : null);
  return data?.friends || [];
};

export const saveFriends = (userId, friends) => {
  const targetId = CANONICAL_USER_ID;
  const data = getUserData(targetId) || (userId ? getUserData(userId) : {}) || {};
  data.friends = friends;
  saveUserData(targetId, data);
  if (userId && userId !== targetId) {
    saveUserData(userId, data);
  }

  if (isSupabaseConfigured()) {
    syncFriendsToSupabase(targetId, friends).catch((e) =>
      console.warn('Supabase friends sync warning:', e)
    );
  }

  return data.friends;
};

export const deleteFriend = (userId, friendId) => {
  const targetId = CANONICAL_USER_ID;
  addDeletedId(friendId);
  const data = getUserData(targetId) || (userId ? getUserData(userId) : null);
  if (data && data.friends) {
    data.friends = data.friends.filter((f) => f.id !== friendId);
    saveUserData(targetId, data);
    if (userId && userId !== targetId) {
      saveUserData(userId, data);
    }
  }

  if (isSupabaseConfigured() && friendId) {
    deleteFriendFromSupabase(friendId).catch((e) =>
      console.warn('Supabase delete friend sync warning:', e)
    );
  }

  return data?.friends || [];
};

export const addFriend = (userId, friendData) => {
  const current = getFriends(userId);
  const initials =
    friendData.name
      .split(' ')
      .filter(Boolean)
      .map((w) => w[0].toUpperCase())
      .slice(0, 2)
      .join('') || 'FR';

  const newFriend = {
    id: generateId('frd'),
    userId: CANONICAL_USER_ID,
    name: friendData.name.trim(),
    initials,
    avatarBg: friendData.avatarBg || '#8B5CF6',
    major: friendData.major?.trim() || 'IPA',
    semester: friendData.semester?.trim() || 'Kelas 11',
    progress: Number(friendData.progress) || 40,
    completedTasks: Number(friendData.completedTasks) || 2,
    totalTasks: Number(friendData.totalTasks) || 5,
    status: friendData.status || 'Sedang Belajar 📚',
    nearestTask: {
      title: friendData.nearestTaskTitle || 'Tugas Studi Kasus',
      due: friendData.nearestTaskDue || 'Malam ini, 23:59 WIB',
      course: friendData.nearestTaskCourse || 'Kuliah Utama',
    },
  };

  const updated = [newFriend, ...current];
  saveFriends(userId, updated);
  return updated;
};

// ==========================================
// Notes Storage
// ==========================================

export const getNotes = (userId) => {
  if (!userId) return [];
  const data = getUserData(userId);
  if (data && Array.isArray(data.notes)) {
    return data.notes;
  }
  return [];
};

export const saveNotes = (userId, notes) => {
  if (!userId) return notes || [];
  const data = getUserData(userId) || {};
  const prevNotes = data.notes || [];
  data.notes = notes;
  saveUserData(userId, data);

  // Detect which notes were removed to delete them permanently from Supabase
  const newIds = new Set((notes || []).map((n) => n.id));
  const removedNotes = prevNotes.filter((n) => !newIds.has(n.id));

  if (isSupabaseConfigured()) {
    for (const r of removedNotes) {
      deleteNoteFromSupabase(r.id).catch((e) =>
        console.warn('Supabase delete note error:', e)
      );
    }
    syncNotesToSupabase(userId, notes).catch((e) =>
      console.warn('Supabase notes sync warning:', e)
    );
  }

  return data.notes;
};

export const deleteNote = (userId, noteId) => {
  if (!userId || !noteId) return [];
  const current = getNotes(userId);
  const updated = current.filter((n) => n.id !== noteId);
  saveNotes(userId, updated);
  if (isSupabaseConfigured()) {
    deleteNoteFromSupabase(noteId).catch((e) =>
      console.warn('Supabase delete note error:', e)
    );
  }
  return updated;
};
