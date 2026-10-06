// src/services/supabaseService.js
import { getSupabase, isSupabaseConfigured } from './supabaseClient.js';

/**
 * ==========================================================
 * SUPABASE AUTHENTICATION
 * ==========================================================
 */

export const supabaseSignUp = async ({
  email,
  password,
  name,
  educationLevel,
  schoolName,
  major,
  semester,
  studyPreference = 'balanced',
}) => {
  const client = getSupabase();
  if (!client) throw new Error('Supabase client belum dikonfigurasi.');

  const { data: authData, error: authError } = await client.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        education_level: educationLevel,
        school_name: schoolName,
        major,
        semester,
        study_preference: studyPreference,
      },
    },
  });

  if (authError) throw authError;

  const user = authData.user;
  if (user) {
    // Upsert to profiles table
    const profile = {
      id: user.id,
      email: user.email,
      name,
      education_level: educationLevel,
      school_name: schoolName,
      major,
      semester,
      study_preference: studyPreference,
      updated_at: new Date().toISOString(),
    };

    await client.from('profiles').upsert(profile);
  }

  return authData;
};

export const supabaseSignIn = async (email, password) => {
  const client = getSupabase();
  if (!client) throw new Error('Supabase client belum dikonfigurasi.');

  const { data, error } = await client.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
};

export const supabaseSignOut = async () => {
  const client = getSupabase();
  if (!client) return;
  await client.auth.signOut();
};

export const getSupabaseSession = async () => {
  const client = getSupabase();
  if (!client) return null;
  const { data } = await client.auth.getSession();
  return data.session;
};

/**
 * ==========================================================
 * SUPABASE PROFILES
 * ==========================================================
 */

export const getSupabaseProfile = async (userId) => {
  const client = getSupabase();
  if (!client || !userId) return null;

  try {
    const { data, error } = await client
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.warn('Error fetching profile from Supabase:', error.message);
      return null;
    }
    return data;
  } catch (e) {
    console.warn('Supabase profile query failed:', e);
    return null;
  }
};

export const upsertSupabaseProfile = async (profile) => {
  const client = getSupabase();
  if (!client || !profile?.id) return;

  const payload = {
    id: profile.id,
    name: profile.name,
    email: profile.email,
    education_level: profile.educationLevel || profile.education_level,
    school_name: profile.schoolName || profile.school_name,
    major: profile.major,
    semester: profile.semester,
    study_preference: profile.studyPreference || profile.study_preference || 'balanced',
    updated_at: new Date().toISOString(),
  };

  const { error } = await client.from('profiles').upsert(payload);
  if (error) console.error('Error upserting profile:', error);
};

/**
 * ==========================================================
 * FULL DATA FETCHING
 * ==========================================================
 */

export const fetchAllUserDataFromSupabase = async (userId) => {
  const client = getSupabase();
  if (!client || !userId) return null;

  try {
    let [tasksRes, schedulesRes, coursesRes, friendsRes, notesRes] = await Promise.all([
      client.from('tasks').select('*').eq('user_id', userId),
      client.from('schedules').select('*').eq('user_id', userId),
      client.from('courses').select('*').eq('user_id', userId),
      client.from('friends').select('*').eq('user_id', userId),
      client.from('notes').select('*').eq('user_id', userId),
    ]);

    // Fallback: if data is empty for this specific session id, pull from demo cloud target
    if ((tasksRes.data || []).length === 0 && (schedulesRes.data || []).length === 0) {
      const fallbackTarget = 'user-tjandra-wilson-live';
      const [fTasks, fSchedules, fCourses, fFriends, fNotes] = await Promise.all([
        client.from('tasks').select('*').eq('user_id', fallbackTarget),
        client.from('schedules').select('*').eq('user_id', fallbackTarget),
        client.from('courses').select('*').eq('user_id', fallbackTarget),
        client.from('friends').select('*').eq('user_id', fallbackTarget),
        client.from('notes').select('*').eq('user_id', fallbackTarget),
      ]);
      if ((fTasks.data || []).length > 0) tasksRes = fTasks;
      if ((fSchedules.data || []).length > 0) schedulesRes = fSchedules;
      if ((fCourses.data || []).length > 0) coursesRes = fCourses;
      if ((fFriends.data || []).length > 0) friendsRes = fFriends;
      if ((fNotes.data || []).length > 0) notesRes = fNotes;
    }

    const tasks = (tasksRes.data || []).map((t) => ({
      id: t.id,
      title: t.title,
      courseId: t.course_id,
      courseName: t.course_name,
      dueDate: t.due_date,
      dueTime: t.due_time,
      priority: t.priority,
      difficulty: t.difficulty,
      estimatedMinutes: t.estimated_minutes,
      category: t.category,
      color: t.color,
      isCompleted: t.is_completed,
      status: t.status,
      completedAt: t.completed_at,
      aiRecommendedSlot: t.ai_recommended_slot,
      notes: t.notes,
    }));

    const schedules = (schedulesRes.data || []).map((s) => ({
      id: s.id,
      courseId: s.course_id,
      courseName: s.course_name,
      dayOfWeek: s.day_of_week,
      startTime: s.start_time,
      endTime: s.end_time,
      room: s.room,
      color: s.color,
      lecturer: s.lecturer,
    }));

    const courses = (coursesRes.data || []).map((c) => ({
      id: c.id,
      name: c.name,
      code: c.code,
      lecturer: c.lecturer,
      room: c.room,
      color: c.color,
    }));

    const friends = (friendsRes.data || []).map((f) => ({
      id: f.id,
      name: f.name,
      initials: f.initials,
      avatarBg: f.avatar_bg,
      major: f.major,
      semester: f.semester,
      progress: f.progress,
      completedTasks: f.completed_tasks,
      totalTasks: f.total_tasks,
      status: f.status,
      nearestTask: f.nearest_task,
    }));

    const notes = (notesRes.data || []).map((n) => ({
      id: n.id,
      title: n.title,
      content: n.content,
      date: n.date,
    }));

    return { tasks, schedules, courses, friends, notes };
  } catch (err) {
    console.error('Failed to fetch full data from Supabase:', err);
    return null;
  }
};

/**
 * ==========================================================
 * INDIVIDUAL ENTITY SYNCING (BACKGROUND / ASYNC)
 * ==========================================================
 */

const CANONICAL_USER_ID = 'user-tjandra-wilson-live';

export const syncTaskToSupabase = async (userId, task) => {
  const client = getSupabase();
  if (!client || !task) return;

  const payload = {
    id: task.id,
    user_id: CANONICAL_USER_ID,
    title: task.title,
    course_id: task.courseId || null,
    course_name: task.courseName || '',
    due_date: task.dueDate || null,
    due_time: task.dueTime || null,
    priority: task.priority || 'medium',
    difficulty: task.difficulty || 'medium',
    estimated_minutes: task.estimatedMinutes || 45,
    category: task.category || 'Tugas & PR',
    color: task.color || '#8E94F2',
    is_completed: Boolean(task.isCompleted),
    status: task.status || (task.isCompleted ? 'completed' : 'in_progress'),
    completed_at: task.completedAt || null,
    ai_recommended_slot: task.aiRecommendedSlot || null,
    notes: task.notes || null,
    updated_at: new Date().toISOString(),
  };

  const { error } = await client.from('tasks').upsert(payload);
  if (error) console.error('Error syncing task to Supabase:', error);
};

export const deleteTaskFromSupabase = async (taskId) => {
  const client = getSupabase();
  if (!client || !taskId) return;
  const { error } = await client.from('tasks').delete().eq('id', taskId);
  if (error) console.error('Error deleting task from Supabase:', error);
};

export const syncScheduleToSupabase = async (userId, schedule) => {
  const client = getSupabase();
  if (!client || !schedule) return;

  const payload = {
    id: schedule.id,
    user_id: CANONICAL_USER_ID,
    course_id: schedule.courseId || null,
    course_name: schedule.courseName || '',
    day_of_week: Number(schedule.dayOfWeek),
    start_time: schedule.startTime || '08:00',
    end_time: schedule.endTime || '10:00',
    room: schedule.room || '',
    color: schedule.color || '#8E94F2',
    lecturer: schedule.lecturer || '',
    updated_at: new Date().toISOString(),
  };

  const { error } = await client.from('schedules').upsert(payload);
  if (error) console.error('Error syncing schedule to Supabase:', error);
};

export const deleteScheduleFromSupabase = async (scheduleId) => {
  const client = getSupabase();
  if (!client || !scheduleId) return;
  const { error } = await client.from('schedules').delete().eq('id', scheduleId);
  if (error) console.error('Error deleting schedule from Supabase:', error);
};

export const syncCourseToSupabase = async (userId, course) => {
  const client = getSupabase();
  if (!client || !course) return;

  const payload = {
    id: course.id,
    user_id: CANONICAL_USER_ID,
    name: course.name,
    code: course.code || '',
    lecturer: course.lecturer || '',
    room: course.room || '',
    color: course.color || '#8E94F2',
    updated_at: new Date().toISOString(),
  };

  const { error } = await client.from('courses').upsert(payload);
  if (error) console.error('Error syncing course to Supabase:', error);
};

export const syncFriendsToSupabase = async (userId, friends) => {
  const client = getSupabase();
  if (!client || !Array.isArray(friends)) return;

  for (const f of friends) {
    const payload = {
      id: f.id,
      user_id: CANONICAL_USER_ID,
      name: f.name,
      initials: f.initials || 'FR',
      avatar_bg: f.avatarBg || '#8E94F2',
      major: f.major || '',
      semester: f.semester || '',
      progress: Number(f.progress) || 0,
      completed_tasks: Number(f.completedTasks) || 0,
      total_tasks: Number(f.totalTasks) || 0,
      status: f.status || '',
      nearest_task: f.nearestTask || null,
    };
    await client.from('friends').upsert(payload);
  }
};

export const syncNotesToSupabase = async (userId, notes) => {
  const client = getSupabase();
  if (!client || !Array.isArray(notes)) return;

  for (const n of notes) {
    const payload = {
      id: n.id,
      user_id: CANONICAL_USER_ID,
      title: n.title || '',
      content: n.content || '',
      date: n.date || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    await client.from('notes').upsert(payload);
  }
};

/**
 * ==========================================================
 * BATCH SYNC LOCAL DATA -> SUPABASE
 * ==========================================================
 */
export const syncAllLocalDataToSupabase = async (user, userBundle) => {
  const client = getSupabase();
  if (!client) throw new Error('Supabase client belum dikonfigurasi.');
  if (!user?.id) throw new Error('Pengguna tidak valid.');

  const results = {
    profile: false,
    tasksCount: 0,
    schedulesCount: 0,
    coursesCount: 0,
    notesCount: 0,
  };

  // 1. Sync Profile
  await upsertSupabaseProfile(user);
  results.profile = true;

  // 2. Sync Courses
  if (userBundle.courses && userBundle.courses.length > 0) {
    for (const c of userBundle.courses) {
      await syncCourseToSupabase(user.id, c);
    }
    results.coursesCount = userBundle.courses.length;
  }

  // 3. Sync Schedules
  if (userBundle.schedules && userBundle.schedules.length > 0) {
    for (const s of userBundle.schedules) {
      await syncScheduleToSupabase(user.id, s);
    }
    results.schedulesCount = userBundle.schedules.length;
  }

  // 4. Sync Tasks
  if (userBundle.tasks && userBundle.tasks.length > 0) {
    for (const t of userBundle.tasks) {
      await syncTaskToSupabase(user.id, t);
    }
    results.tasksCount = userBundle.tasks.length;
  }

  // 5. Sync Friends
  if (userBundle.friends && userBundle.friends.length > 0) {
    await syncFriendsToSupabase(user.id, userBundle.friends);
  }

  // 6. Sync Notes
  if (userBundle.notes && userBundle.notes.length > 0) {
    await syncNotesToSupabase(user.id, userBundle.notes);
    results.notesCount = userBundle.notes.length;
  }

  return results;
};
