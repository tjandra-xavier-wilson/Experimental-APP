// src/services/storage.js
import { isSupabaseConfigured } from './supabaseClient';
import {
  syncTaskToSupabase,
  deleteTaskFromSupabase,
  syncScheduleToSupabase,
  deleteScheduleFromSupabase,
  syncCourseToSupabase,
  syncFriendsToSupabase,
  syncNotesToSupabase,
  upsertSupabaseProfile,
  fetchAllUserDataFromSupabase,
} from './supabaseService';

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
  { id: 'cat-1', name: 'Kuliah & Sekolah', color: '#8E94F2', bg: '#F0F1FF', icon: 'BookOpen' },
  { id: 'cat-2', name: 'Tugas & PR', color: '#ED8936', bg: '#FFFAF0', icon: 'CheckSquare' },
  { id: 'cat-3', name: 'Ujian & Kuis', color: '#ED64A6', bg: '#FFF5F7', icon: 'AlertCircle' },
  { id: 'cat-4', name: 'Organisasi & Ekskul', color: '#4299E1', bg: '#EBF8FF', icon: 'Users' },
  { id: 'cat-5', name: 'Self-Care & Istirahat', color: '#48BB78', bg: '#EDFDF5', icon: 'Heart' },
];

// Helper for unique IDs
export const generateId = (prefix = 'id') => `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

const STORAGE_KEYS = {
  USERS: 'studycal_users_v1',
  SESSION: 'studycal_current_session_v1',
  REMEMBER: 'studycal_remember_token_v1',
  DATA_PREFIX: 'studycal_userdata_',
};

// User & Auth Management
export const getStoredUsers = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USERS);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Error reading users:', e);
    return [];
  }
};

export const saveUsers = (users) => {
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
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

  const defaultId = email.toLowerCase().includes('tjandrawilson')
    ? 'user-tjandra-wilson-live'
    : generateId('user');

  const newUser = {
    id: id || defaultId,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    passwordHash: password, // In client-side prototype we store securely formatted string
    educationLevel: isSMA ? 'Siswa SMA/SMK' : 'Mahasiswa',
    schoolName: schoolName?.trim() || defaultSchool,
    major: major?.trim() || defaultMajor,
    semester: semester?.trim() || defaultSemester,
    studyPreference: studyPreference || 'balanced', // 'morning', 'night', 'balanced'
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  saveUsers(users);

  // Initialize initial starter data tailored to their major (clean empty tasks & friends)
  initStarterData(newUser);

  // Set session
  setSession(newUser, rememberMe);

  // Sync profile to Supabase if configured
  if (isSupabaseConfigured()) {
    upsertSupabaseProfile(newUser).catch((e) =>
      console.warn('Supabase profile sync warning:', e)
    );
  }

  return newUser;
};

export const loginUser = (email, password, rememberMe = true) => {
  const users = getStoredUsers();
  const user = users.find(
    (u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.passwordHash === password
  );

  if (!user) {
    throw new Error('Email atau kata sandi tidak cocok. Periksa kembali akun Anda.');
  }

  setSession(user, rememberMe);
  return user;
};

export const ensureDefaultUser = () => {
  const users = getStoredUsers();
  if (users.length === 0) {
    const defaultUser = registerUser({
      id: 'user-tjandra-wilson-live',
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
  }
  return users[0];
};

export const setSession = (user, rememberMe = true) => {
  const sessionData = {
    userId: user.id,
    loggedAt: new Date().toISOString(),
  };

  if (rememberMe) {
    localStorage.setItem(STORAGE_KEYS.REMEMBER, JSON.stringify(sessionData));
    sessionStorage.removeItem(STORAGE_KEYS.SESSION);
  } else {
    sessionStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(sessionData));
    localStorage.removeItem(STORAGE_KEYS.REMEMBER);
  }
};

export const getCurrentSession = () => {
  try {
    // 1. Check persistent Remember Me first
    const remRaw = localStorage.getItem(STORAGE_KEYS.REMEMBER);
    if (remRaw) {
      const parsed = JSON.parse(remRaw);
      const users = getStoredUsers();
      const user = users.find((u) => u.id === parsed.userId);
      if (user) return { user, rememberMe: true };
    }

    // 2. Check transient sessionStorage
    const sessRaw = sessionStorage.getItem(STORAGE_KEYS.SESSION);
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
  localStorage.removeItem(STORAGE_KEYS.REMEMBER);
  sessionStorage.removeItem(STORAGE_KEYS.SESSION);
};

// Seed Starter Data customized by Education & Major
const initStarterData = (user) => {
  const isCollege = user.educationLevel === 'Kuliah';
  
  // Custom courses based on major
  let initialCourses = [];
  if (isCollege) {
    if (user.major.toLowerCase().includes('informatika') || user.major.toLowerCase().includes('komputer')) {
      initialCourses = [
        { id: generateId('crs'), name: 'Algoritma & Pemrograman', code: 'IF210', lecturer: 'Dr. Hendra, M.Kom', room: 'Lab Komputer 3', color: '#8E94F2' },
        { id: generateId('crs'), name: 'Struktur Data & Analisis', code: 'IF211', lecturer: 'Prof. Rina Wijaya', room: 'Gedung B 204', color: '#4299E1' },
        { id: generateId('crs'), name: 'Basis Data Terdistribusi', code: 'IF215', lecturer: 'Pak Budi Hartono', room: 'Zoom Virtual', color: '#ED8936' },
      ];
    } else if (user.major.toLowerCase().includes('kedokteran')) {
      initialCourses = [
        { id: generateId('crs'), name: 'Anatomi & Fisiologi Dasar', code: 'KD101', lecturer: 'dr. Sarah Sp.A', room: 'Lab Anatomi', color: '#ED64A6' },
        { id: generateId('crs'), name: 'Farmakologi Klinik', code: 'KD204', lecturer: 'Prof. Bambang', room: 'Ruang Kuliah Besar', color: '#8E94F2' },
      ];
    } else {
      initialCourses = [
        { id: generateId('crs'), name: `Pengantar ${user.major}`, code: 'MJ101', lecturer: 'Dosen Koordinator', room: 'R. Teater 1', color: '#8E94F2' },
        { id: generateId('crs'), name: 'Metodologi Penelitian', code: 'UNV201', lecturer: 'Dr. Wahyu', room: 'R. Seminar B', color: '#4299E1' },
        { id: generateId('crs'), name: 'Etika & Komunikasi', code: 'UNV102', lecturer: 'Ibu Ratna M.Si', room: 'Online Meet', color: '#48BB78' },
      ];
    }
  } else {
    // SMA
    initialCourses = [
      { id: generateId('crs'), name: 'Matematika Peminatan', code: 'MAT-11', lecturer: 'Pak Joko S.Pd', room: 'Kelas 11-A', color: '#8E94F2' },
      { id: generateId('crs'), name: 'Bahasa Inggris Lanjutan', code: 'ENG-11', lecturer: 'Ms. Clara', room: 'Lab Bahasa', color: '#4299E1' },
      { id: generateId('crs'), name: 'Fisika / Biologi', code: 'IPA-11', lecturer: 'Bu Dewi M.Pd', room: 'Lab Sains', color: '#ED8936' },
    ];
  }

  // Initial Recurring Weekly Schedule
  // Days: 1=Senin, 2=Selasa, 3=Rabu, 4=Kamis, 5=Jumat
  const initialSchedules = [
    {
      id: generateId('sch'),
      courseId: initialCourses[0]?.id || '',
      courseName: initialCourses[0]?.name || 'Mata Kuliah Utama',
      dayOfWeek: 1, // Senin
      startTime: '08:00',
      endTime: '10:30',
      room: initialCourses[0]?.room || 'R. 101',
      color: initialCourses[0]?.color || '#8E94F2',
      lecturer: initialCourses[0]?.lecturer || '',
    },
    {
      id: generateId('sch'),
      courseId: initialCourses[1]?.id || '',
      courseName: initialCourses[1]?.name || 'Mata Kuliah Teori',
      dayOfWeek: 2, // Selasa
      startTime: '10:00',
      endTime: '12:00',
      room: initialCourses[1]?.room || 'Gedung B',
      color: initialCourses[1]?.color || '#4299E1',
      lecturer: initialCourses[1]?.lecturer || '',
    },
    {
      id: generateId('sch'),
      courseId: initialCourses[2]?.id || initialCourses[0]?.id || '',
      courseName: initialCourses[2]?.name || 'Praktikum / Diskusi',
      dayOfWeek: 4, // Kamis
      startTime: '13:00',
      endTime: '15:30',
      room: initialCourses[2]?.room || 'Lab Terpadu',
      color: initialCourses[2]?.color || '#ED8936',
      lecturer: initialCourses[2]?.lecturer || '',
    },
  ];

  // Helper date for today & tomorrow
  const today = new Date();
  const formatDate = (d) => d.toISOString().split('T')[0];
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const in3Days = new Date(today);
  in3Days.setDate(in3Days.getDate() + 3);

  // Empty starter tasks as requested - only user-added tasks will appear
  const initialTasks = [];

  const userBundle = {
    categories: DEFAULT_CATEGORIES,
    courses: initialCourses,
    schedules: initialSchedules,
    tasks: [],
    friends: [],
    reminders: [],
  };

  saveUserData(user.id, userBundle);
};

// Generic User Data Get/Save
export const getUserData = (userId) => {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEYS.DATA_PREFIX}${userId}`);
    if (!raw) return null;
    const data = JSON.parse(raw);

    // Ensure legacy dummy tasks & dummy friends are stripped
    if (data.tasks) {
      data.tasks = data.tasks.filter(
        (t) =>
          !t.title?.includes('Review materi & kerjakan kuis') &&
          !t.title?.includes('Diskusi kelompok & penyusunan') &&
          !t.title?.includes('Latihan soal mandiri')
      );
    }
    if (data.friends) {
      data.friends = data.friends.filter(
        (f) => !['frd-1', 'frd-2', 'frd-3', 'frd-4'].includes(f.id)
      );
    }

    return data;
  } catch (e) {
    console.error('Error fetching user data:', e);
    return null;
  }
};

export const saveUserData = (userId, data) => {
  localStorage.setItem(`${STORAGE_KEYS.DATA_PREFIX}${userId}`, JSON.stringify(data));
};

// Task Operations
export const getTasks = (userId) => {
  const data = getUserData(userId);
  return data?.tasks || [];
};

export const saveTask = (userId, task) => {
  const data = getUserData(userId) || { tasks: [] };
  const taskToSave = { ...task, id: task.id || generateId('tsk') };
  const existingIndex = data.tasks.findIndex((t) => t.id === taskToSave.id);
  if (existingIndex >= 0) {
    data.tasks[existingIndex] = { ...data.tasks[existingIndex], ...taskToSave };
  } else {
    data.tasks.push(taskToSave);
  }
  saveUserData(userId, data);

  if (isSupabaseConfigured() && userId) {
    syncTaskToSupabase(userId, taskToSave).catch((e) =>
      console.warn('Supabase save task sync warning:', e)
    );
  }

  return data.tasks;
};

export const deleteTask = (userId, taskId) => {
  const data = getUserData(userId);
  if (!data) return [];
  data.tasks = data.tasks.filter((t) => t.id !== taskId);
  saveUserData(userId, data);

  if (isSupabaseConfigured() && taskId) {
    deleteTaskFromSupabase(taskId).catch((e) =>
      console.warn('Supabase delete task sync warning:', e)
    );
  }

  return data.tasks;
};

export const toggleTaskStatus = (userId, taskId) => {
  const data = getUserData(userId);
  if (!data) return [];
  let updatedTask = null;
  data.tasks = data.tasks.map((t) => {
    if (t.id === taskId) {
      const willBeCompleted = !t.isCompleted;
      updatedTask = {
        ...t,
        isCompleted: willBeCompleted,
        status: willBeCompleted ? 'completed' : 'in_progress',
        completedAt: willBeCompleted ? new Date().toISOString() : null,
      };
      return updatedTask;
    }
    return t;
  });
  saveUserData(userId, data);

  if (isSupabaseConfigured() && userId && updatedTask) {
    syncTaskToSupabase(userId, updatedTask).catch((e) =>
      console.warn('Supabase toggle task sync warning:', e)
    );
  }

  return data.tasks;
};

// Schedule Operations
export const getSchedules = (userId) => {
  const data = getUserData(userId);
  return data?.schedules || [];
};

export const saveSchedule = (userId, schedule) => {
  const data = getUserData(userId) || { schedules: [] };
  const scheduleToSave = { ...schedule, id: schedule.id || generateId('sch') };
  const existingIndex = data.schedules.findIndex((s) => s.id === scheduleToSave.id);
  if (existingIndex >= 0) {
    data.schedules[existingIndex] = { ...data.schedules[existingIndex], ...scheduleToSave };
  } else {
    data.schedules.push(scheduleToSave);
  }
  saveUserData(userId, data);

  if (isSupabaseConfigured() && userId) {
    syncScheduleToSupabase(userId, scheduleToSave).catch((e) =>
      console.warn('Supabase schedule sync warning:', e)
    );
  }

  return data.schedules;
};

export const deleteSchedule = (userId, scheduleId) => {
  const data = getUserData(userId);
  if (!data) return [];
  data.schedules = data.schedules.filter((s) => s.id !== scheduleId);
  saveUserData(userId, data);

  if (isSupabaseConfigured() && scheduleId) {
    deleteScheduleFromSupabase(scheduleId).catch((e) =>
      console.warn('Supabase delete schedule sync warning:', e)
    );
  }

  return data.schedules;
};

// Categories & Courses
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
  const courseToSave = { ...course, id: course.id || generateId('crs') };
  const existingIndex = data.courses.findIndex((c) => c.id === courseToSave.id);
  if (existingIndex >= 0) {
    data.courses[existingIndex] = { ...data.courses[existingIndex], ...courseToSave };
  } else {
    data.courses.push(courseToSave);
  }
  saveUserData(userId, data);

  if (isSupabaseConfigured() && userId) {
    syncCourseToSupabase(userId, courseToSave).catch((e) =>
      console.warn('Supabase course sync warning:', e)
    );
  }

  return data.courses;
};

// Friends Feature Storage - Empty by default, populated dynamically by user
export const DEFAULT_FRIENDS = [];

export const getFriends = (userId) => {
  if (!userId) return [];
  const data = getUserData(userId);
  return (data?.friends || []).filter(
    (f) => !['frd-1', 'frd-2', 'frd-3', 'frd-4'].includes(f.id)
  );
};

export const saveFriends = (userId, friends) => {
  const data = getUserData(userId) || {};
  data.friends = friends;
  saveUserData(userId, data);

  if (isSupabaseConfigured() && userId) {
    syncFriendsToSupabase(userId, friends).catch((e) =>
      console.warn('Supabase friends sync warning:', e)
    );
  }

  return data.friends;
};

export const addFriend = (userId, friendData) => {
  const current = getFriends(userId);
  const initials = friendData.name
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0].toUpperCase())
    .slice(0, 2)
    .join('') || 'FR';

  const newFriend = {
    id: generateId('frd'),
    name: friendData.name.trim(),
    initials,
    avatarBg: friendData.avatarBg || '#8E94F2',
    major: friendData.major?.trim() || 'Teknik Informatika',
    semester: friendData.semester?.trim() || 'Semester 4',
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

// Notes Storage
export const getNotes = (userId) => {
  if (!userId) return [];
  const data = getUserData(userId);
  return data?.notes || [
    {
      id: 'note-1',
      title: 'Ringkasan Rumus Big-O',
      content: 'O(1) < O(log n) < O(n) < O(n log n) < O(n^2). Selalu optimalkan loop bersarang!',
      date: new Date().toLocaleDateString('id-ID'),
    },
  ];
};

export const saveNotes = (userId, notes) => {
  const data = getUserData(userId) || {};
  data.notes = notes;
  saveUserData(userId, data);

  if (isSupabaseConfigured() && userId) {
    syncNotesToSupabase(userId, notes).catch((e) =>
      console.warn('Supabase notes sync warning:', e)
    );
  }

  return data.notes;
};

/**
 * Pull and merge latest cloud data from Supabase for cross-device sync.
 */
export const pullDataFromSupabase = async (userId) => {
  if (!isSupabaseConfigured() || !userId) return null;
  try {
    const cloud = await fetchAllUserDataFromSupabase(userId);
    if (!cloud) return null;

    const localData = getUserData(userId) || {};
    const merged = {
      ...localData,
      tasks: cloud.tasks?.length ? cloud.tasks : localData.tasks || [],
      schedules: cloud.schedules?.length ? cloud.schedules : localData.schedules || [],
      courses: cloud.courses?.length ? cloud.courses : localData.courses || [],
      friends: cloud.friends?.length ? cloud.friends : localData.friends || [],
      notes: cloud.notes?.length ? cloud.notes : localData.notes || [],
    };
    saveUserData(userId, merged);
    return merged;
  } catch (err) {
    console.error('Error pulling Supabase data:', err);
    return null;
  }
};


