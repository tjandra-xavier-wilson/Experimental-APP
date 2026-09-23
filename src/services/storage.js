// src/services/storage.js

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

export const registerUser = ({ name, email, password, educationLevel, major, semester, studyPreference, rememberMe = true }) => {
  const users = getStoredUsers();
  const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    throw new Error('Email sudah terdaftar. Silakan login atau gunakan email lain.');
  }

  const newUser = {
    id: generateId('user'),
    name: name.trim(),
    email: email.trim().toLowerCase(),
    passwordHash: password, // In client-side prototype we store securely formatted string
    educationLevel: educationLevel || 'Kuliah',
    major: major.trim() || (educationLevel === 'SMA' ? 'MIPA' : 'Teknik Informatika'),
    semester: semester || (educationLevel === 'SMA' ? 'Kelas 11' : 'Semester 4'),
    studyPreference: studyPreference || 'balanced', // 'morning', 'night', 'balanced'
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  saveUsers(users);

  // Initialize initial starter data tailored to their major
  initStarterData(newUser);

  // Set session
  setSession(newUser, rememberMe);
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

  const initialTasks = [
    {
      id: generateId('tsk'),
      title: 'Review materi & kerjakan kuis bab 3',
      description: 'Baca rangkuman materi slide 1-30, jawab 5 soal studi kasus.',
      courseId: initialCourses[0]?.id || '',
      courseName: initialCourses[0]?.name || 'Mata Kuliah Utama',
      categoryId: 'cat-2',
      dueDate: formatDate(tomorrow),
      dueTime: '21:00',
      priority: 'high',
      status: 'in_progress',
      estimatedMinutes: 60,
      isCompleted: false,
      aiRecommendedSlot: {
        suggestedDate: formatDate(today),
        startTime: '16:00',
        endTime: '17:00',
        reason: 'Ada jeda kosong 2 jam setelah kelas selesai. Waktu ideal untuk daya ingat prima.',
      },
    },
    {
      id: generateId('tsk'),
      title: 'Diskusi kelompok & penyusunan proposal proyek',
      description: 'Bahas pembagian bab latar belakang dan perancangan diagram alir.',
      courseId: initialCourses[1]?.id || '',
      courseName: initialCourses[1]?.name || 'Mata Kuliah Teori',
      categoryId: 'cat-2',
      dueDate: formatDate(in3Days),
      dueTime: '18:00',
      priority: 'medium',
      status: 'todo',
      estimatedMinutes: 90,
      isCompleted: false,
      aiRecommendedSlot: null,
    },
    {
      id: generateId('tsk'),
      title: 'Latihan soal mandiri & persiapan kuis mingguan',
      description: 'Latihan 10 soal essay pemahaman konsep dasar.',
      courseId: initialCourses[0]?.id || '',
      courseName: initialCourses[0]?.name || 'Mata Kuliah Utama',
      categoryId: 'cat-3',
      dueDate: formatDate(today),
      dueTime: '23:59',
      priority: 'low',
      status: 'completed',
      estimatedMinutes: 45,
      isCompleted: true,
      completedAt: new Date().toISOString(),
      aiRecommendedSlot: null,
    },
  ];

  const userBundle = {
    categories: DEFAULT_CATEGORIES,
    courses: initialCourses,
    schedules: initialSchedules,
    tasks: initialTasks,
    reminders: [
      {
        id: generateId('rem'),
        title: 'Pengingat: Kuis bab 3 besok malam',
        targetDate: formatDate(tomorrow),
        targetTime: '21:00',
        isRead: false,
        type: 'task',
      },
    ],
  };

  saveUserData(user.id, userBundle);
};

// Generic User Data Get/Save
export const getUserData = (userId) => {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEYS.DATA_PREFIX}${userId}`);
    if (!raw) return null;
    return JSON.parse(raw);
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
  const existingIndex = data.tasks.findIndex((t) => t.id === task.id);
  if (existingIndex >= 0) {
    data.tasks[existingIndex] = { ...data.tasks[existingIndex], ...task };
  } else {
    data.tasks.push({ ...task, id: task.id || generateId('tsk') });
  }
  saveUserData(userId, data);
  return data.tasks;
};

export const deleteTask = (userId, taskId) => {
  const data = getUserData(userId);
  if (!data) return [];
  data.tasks = data.tasks.filter((t) => t.id !== taskId);
  saveUserData(userId, data);
  return data.tasks;
};

export const toggleTaskStatus = (userId, taskId) => {
  const data = getUserData(userId);
  if (!data) return [];
  data.tasks = data.tasks.map((t) => {
    if (t.id === taskId) {
      const willBeCompleted = !t.isCompleted;
      return {
        ...t,
        isCompleted: willBeCompleted,
        status: willBeCompleted ? 'completed' : 'in_progress',
        completedAt: willBeCompleted ? new Date().toISOString() : null,
      };
    }
    return t;
  });
  saveUserData(userId, data);
  return data.tasks;
};

// Schedule Operations
export const getSchedules = (userId) => {
  const data = getUserData(userId);
  return data?.schedules || [];
};

export const saveSchedule = (userId, schedule) => {
  const data = getUserData(userId) || { schedules: [] };
  const existingIndex = data.schedules.findIndex((s) => s.id === schedule.id);
  if (existingIndex >= 0) {
    data.schedules[existingIndex] = { ...data.schedules[existingIndex], ...schedule };
  } else {
    data.schedules.push({ ...schedule, id: schedule.id || generateId('sch') });
  }
  saveUserData(userId, data);
  return data.schedules;
};

export const deleteSchedule = (userId, scheduleId) => {
  const data = getUserData(userId);
  if (!data) return [];
  data.schedules = data.schedules.filter((s) => s.id !== scheduleId);
  saveUserData(userId, data);
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
  const existingIndex = data.courses.findIndex((c) => c.id === course.id);
  if (existingIndex >= 0) {
    data.courses[existingIndex] = { ...data.courses[existingIndex], ...course };
  } else {
    data.courses.push({ ...course, id: course.id || generateId('crs') });
  }
  saveUserData(userId, data);
  return data.courses;
};
