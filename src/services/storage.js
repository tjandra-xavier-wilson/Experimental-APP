// src/services/storage.js
import { supabase } from './supabaseClient.js';

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
};

export const CANONICAL_USER_ID = 'user-tjandra-wilson-live';

// ==========================================
// Field Mappers: Frontend <-> Supabase
// ==========================================

export const taskToSupabase = (task, userId) => ({
  id: task.id || generateId('tsk'),
  user_id: userId || task.userId || CANONICAL_USER_ID,
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
  user_id: userId || sch.userId || CANONICAL_USER_ID,
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
  user_id: userId || crs.userId || CANONICAL_USER_ID,
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
  user_id: userId || frd.userId || CANONICAL_USER_ID,
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
  user_id: userId || note.userId || CANONICAL_USER_ID,
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
  if (!userId) return null;
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
        .eq('user_id', userId)
        .order('created_at', { ascending: false }),
      supabase.from('schedules').select('*').eq('user_id', userId),
      supabase.from('courses').select('*').eq('user_id', userId),
      supabase.from('friends').select('*').eq('user_id', userId),
      supabase
        .from('notes')
        .select('*')
        .eq('user_id', userId)
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

    // Update local cache for instant offline responsiveness
    const currentLocal = getUserData(userId) || {};
    const updatedBundle = {
      ...currentLocal,
      tasks: mappedTasks,
      schedules: mappedSchedules.length > 0 ? mappedSchedules : currentLocal.schedules || [],
      courses: mappedCourses.length > 0 ? mappedCourses : currentLocal.courses || [],
      friends: mappedFriends.length > 0 ? mappedFriends : currentLocal.friends || [],
      notes: mappedNotes.length > 0 ? mappedNotes : currentLocal.notes || [],
    };
    saveUserData(userId, updatedBundle);

    return {
      tasks: mappedTasks,
      schedules: mappedSchedules,
      courses: mappedCourses,
      friends: mappedFriends,
      notes: mappedNotes,
    };
  } catch (err) {
    console.error('Error in fetchCloudUserData:', err);
    return null;
  }
};

export const subscribeToCloudChanges = (userId, onTasksChange) => {
  if (!userId) return () => {};
  try {
    const channel = supabase
      .channel(`rt-tasks-${userId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks', filter: `user_id=eq.${userId}` },
        async () => {
          const fresh = await fetchCloudUserData(userId);
          if (fresh && fresh.tasks && onTasksChange) {
            onTasksChange(fresh.tasks);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  } catch (e) {
    console.warn('Realtime subscription warning:', e);
    return () => {};
  }
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

  // Use CANONICAL_USER_ID if it matches Tjandra Wilson, otherwise generate unique
  const isDefaultProfile =
    email.trim().toLowerCase() === 'tjandrawilson@mutiarabangsa.sch.id';
  const userId = isDefaultProfile ? CANONICAL_USER_ID : generateId('user');

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
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  saveUsers(users);

  // Sync profile to Supabase in background
  supabase
    .from('profiles')
    .upsert({
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      education_level: newUser.educationLevel,
      school_name: newUser.schoolName,
      major: newUser.major,
      semester: newUser.semester,
      study_preference: newUser.studyPreference,
      updated_at: new Date().toISOString(),
    })
    .then(({ error }) => {
      if (error) console.warn('Supabase profile upsert error:', error);
    })
    .catch((err) => console.warn('Supabase profile upsert exception:', err));

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
  if (!user && email.trim().toLowerCase() === 'tjandrawilson@mutiarabangsa.sch.id') {
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
  const existing = users.find(
    (u) =>
      u.id === CANONICAL_USER_ID ||
      u.email?.toLowerCase() === 'tjandrawilson@mutiarabangsa.sch.id'
  );

  if (existing) {
    if (existing.id !== CANONICAL_USER_ID) {
      existing.id = CANONICAL_USER_ID;
      saveUsers(users);
    }
    setSession(existing, true);
    return existing;
  }

  const defaultUser = {
    id: CANONICAL_USER_ID,
    name: 'Tjandra Wilson',
    email: 'tjandrawilson@mutiarabangsa.sch.id',
    passwordHash: 'password123',
    educationLevel: 'Siswa SMA/SMK',
    schoolName: 'Mutiara Bangsa 2 School',
    major: 'IPA',
    semester: 'Kelas 11',
    studyPreference: 'balanced',
    createdAt: '2026-09-30T03:03:45.724102+00:00',
  };

  users.push(defaultUser);
  saveUsers(users);
  setSession(defaultUser, true);
  return defaultUser;
};

export const setSession = (user, rememberMe = true) => {
  const sessionData = {
    userId: user.id,
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
    if (remRaw) {
      const parsed = JSON.parse(remRaw);
      const users = getStoredUsers();
      const user = users.find((u) => u.id === parsed.userId);
      if (user) return { user, rememberMe: true };
    }

    const sessRaw = safeSessionStorage.getItem(STORAGE_KEYS.SESSION);
    if (sessRaw) {
      const parsed = JSON.parse(sessRaw);
      const users = getStoredUsers();
      const user = users.find((u) => u.id === parsed.userId);
      if (user) return { user, rememberMe: false };
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
  try {
    const raw = safeLocalStorage.getItem(`${STORAGE_KEYS.DATA_PREFIX}${userId}`);
    if (!raw) return null;
    return JSON.parse(raw);
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
  const data = getUserData(userId) || { tasks: [] };
  if (!data.tasks) data.tasks = [];

  const taskId = task.id || generateId('tsk');
  const fullTask = {
    ...task,
    id: taskId,
    userId: userId || CANONICAL_USER_ID,
    createdAt: task.createdAt || new Date().toISOString(),
  };

  const existingIndex = data.tasks.findIndex((t) => t.id === taskId);
  if (existingIndex >= 0) {
    data.tasks[existingIndex] = { ...data.tasks[existingIndex], ...fullTask };
  } else {
    data.tasks.unshift(fullTask);
  }
  saveUserData(userId, data);

  // Background sync to Supabase
  const row = taskToSupabase(fullTask, userId);
  supabase
    .from('tasks')
    .upsert(row)
    .then(({ error }) => {
      if (error) console.error('Supabase saveTask error:', error);
    })
    .catch((err) => console.error('Supabase saveTask exception:', err));

  return data.tasks;
};

export const deleteTask = (userId, taskId) => {
  const data = getUserData(userId);
  if (data && data.tasks) {
    data.tasks = data.tasks.filter((t) => t.id !== taskId);
    saveUserData(userId, data);
  }

  // Background sync to Supabase
  supabase
    .from('tasks')
    .delete()
    .eq('id', taskId)
    .then(({ error }) => {
      if (error) console.error('Supabase deleteTask error:', error);
    })
    .catch((err) => console.error('Supabase deleteTask exception:', err));

  return data?.tasks || [];
};

export const toggleTaskStatus = (userId, taskId) => {
  const data = getUserData(userId);
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
  saveUserData(userId, data);

  // Background sync to Supabase
  if (targetTask) {
    supabase
      .from('tasks')
      .update({
        is_completed: targetTask.isCompleted,
        status: targetTask.status,
        completed_at: targetTask.completedAt,
        updated_at: new Date().toISOString(),
      })
      .eq('id', taskId)
      .then(({ error }) => {
        if (error) console.error('Supabase toggleTaskStatus error:', error);
      })
      .catch((err) => console.error('Supabase toggleTaskStatus exception:', err));
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
  const data = getUserData(userId) || { schedules: [] };
  if (!data.schedules) data.schedules = [];

  const schId = schedule.id || generateId('sch');
  const fullSch = { ...schedule, id: schId, userId: userId || CANONICAL_USER_ID };

  const existingIndex = data.schedules.findIndex((s) => s.id === schId);
  if (existingIndex >= 0) {
    data.schedules[existingIndex] = { ...data.schedules[existingIndex], ...fullSch };
  } else {
    data.schedules.push(fullSch);
  }
  saveUserData(userId, data);

  // Background sync to Supabase
  const row = scheduleToSupabase(fullSch, userId);
  supabase
    .from('schedules')
    .upsert(row)
    .then(({ error }) => {
      if (error) console.error('Supabase saveSchedule error:', error);
    })
    .catch((err) => console.error('Supabase saveSchedule exception:', err));

  return data.schedules;
};

export const deleteSchedule = (userId, scheduleId) => {
  const data = getUserData(userId);
  if (data && data.schedules) {
    data.schedules = data.schedules.filter((s) => s.id !== scheduleId);
    saveUserData(userId, data);
  }

  supabase
    .from('schedules')
    .delete()
    .eq('id', scheduleId)
    .then(({ error }) => {
      if (error) console.error('Supabase deleteSchedule error:', error);
    })
    .catch((err) => console.error('Supabase deleteSchedule exception:', err));

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
  const data = getUserData(userId) || { courses: [] };
  if (!data.courses) data.courses = [];

  const crsId = course.id || generateId('crs');
  const fullCrs = { ...course, id: crsId, userId: userId || CANONICAL_USER_ID };

  const existingIndex = data.courses.findIndex((c) => c.id === crsId);
  if (existingIndex >= 0) {
    data.courses[existingIndex] = { ...data.courses[existingIndex], ...fullCrs };
  } else {
    data.courses.push(fullCrs);
  }
  saveUserData(userId, data);

  const row = courseToSupabase(fullCrs, userId);
  supabase
    .from('courses')
    .upsert(row)
    .then(({ error }) => {
      if (error) console.error('Supabase saveCourse error:', error);
    })
    .catch((err) => console.error('Supabase saveCourse exception:', err));

  return data.courses;
};

// ==========================================
// Friends Feature Storage
// ==========================================

export const DEFAULT_FRIENDS = [];

export const getFriends = (userId) => {
  if (!userId) return [];
  const data = getUserData(userId);
  return data?.friends || [];
};

export const saveFriends = (userId, friends) => {
  const data = getUserData(userId) || {};
  data.friends = friends;
  saveUserData(userId, data);
  return data.friends;
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
    userId: userId || CANONICAL_USER_ID,
    name: friendData.name.trim(),
    initials,
    avatarBg: friendData.avatarBg || '#8E94F2',
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

  const row = friendToSupabase(newFriend, userId);
  supabase
    .from('friends')
    .upsert(row)
    .then(({ error }) => {
      if (error) console.error('Supabase addFriend error:', error);
    })
    .catch((err) => console.error('Supabase addFriend exception:', err));

  return updated;
};

// ==========================================
// Notes Storage
// ==========================================

export const getNotes = (userId) => {
  if (!userId) return [];
  const data = getUserData(userId);
  return (
    data?.notes || [
      {
        id: 'note-1',
        title: 'Ringkasan Rumus Big-O',
        content:
          'O(1) < O(log n) < O(n) < O(n log n) < O(n^2). Selalu optimalkan loop bersarang!',
        date: new Date().toLocaleDateString('id-ID'),
      },
    ]
  );
};

export const saveNotes = (userId, notes) => {
  const data = getUserData(userId) || {};
  data.notes = notes;
  saveUserData(userId, data);

  // Sync to Supabase
  if (Array.isArray(notes)) {
    notes.forEach((note) => {
      const row = noteToSupabase(note, userId);
      supabase
        .from('notes')
        .upsert(row)
        .catch((err) => console.error('Supabase saveNotes error:', err));
    });
  }

  return data.notes;
};
