-- ==========================================================
-- CODESTACK SCHEDULE - SUPABASE DATABASE SCHEMA
-- ==========================================================
-- Jalankan script SQL ini di Supabase SQL Editor:
-- 1. Buka dashboard Supabase (https://supabase.com/dashboard)
-- 2. Pilih Project Anda -> Klik menu 'SQL Editor' (ikon terminal di kiri)
-- 3. Klik 'New Query' -> Paste seluruh isi script ini -> Klik 'Run'
-- ==========================================================

-- 1. Tabel Profil Pengguna (Profiles)
CREATE TABLE IF NOT EXISTS public.profiles (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE,
    name TEXT NOT NULL,
    education_level TEXT DEFAULT 'Siswa SMA/SMK',
    school_name TEXT DEFAULT 'Mutiara Bangsa 2 School',
    major TEXT DEFAULT 'IPA',
    semester TEXT DEFAULT 'Kelas 11',
    study_preference TEXT DEFAULT 'balanced',
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Tabel Mata Kuliah / Pelajaran (Courses)
CREATE TABLE IF NOT EXISTS public.courses (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    code TEXT,
    lecturer TEXT,
    room TEXT,
    color TEXT DEFAULT '#8E94F2',
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Tabel Jadwal Rutin Mingguan (Schedules)
CREATE TABLE IF NOT EXISTS public.schedules (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    course_id TEXT,
    course_name TEXT NOT NULL,
    day_of_week INTEGER NOT NULL, -- 1=Senin, 2=Selasa, dst.
    start_time TEXT NOT NULL,      -- '08:00'
    end_time TEXT NOT NULL,        -- '10:30'
    room TEXT,
    color TEXT DEFAULT '#8E94F2',
    lecturer TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. Tabel Tugas & Deadline (Tasks)
CREATE TABLE IF NOT EXISTS public.tasks (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    course_id TEXT,
    course_name TEXT,
    due_date TEXT,               -- 'YYYY-MM-DD'
    due_time TEXT,               -- 'HH:mm'
    priority TEXT DEFAULT 'medium', -- 'low', 'medium', 'high'
    difficulty TEXT DEFAULT 'medium',
    estimated_minutes INTEGER DEFAULT 45,
    category TEXT DEFAULT 'Tugas & PR',
    color TEXT DEFAULT '#8E94F2',
    is_completed BOOLEAN DEFAULT FALSE,
    status TEXT DEFAULT 'in_progress', -- 'in_progress', 'completed'
    completed_at TIMESTAMPTZ,
    ai_recommended_slot JSONB,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. Tabel Rekan Belajar (Friends)
CREATE TABLE IF NOT EXISTS public.friends (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    initials TEXT,
    avatar_bg TEXT DEFAULT '#8E94F2',
    major TEXT,
    semester TEXT,
    progress INTEGER DEFAULT 0,
    completed_tasks INTEGER DEFAULT 0,
    total_tasks INTEGER DEFAULT 0,
    status TEXT DEFAULT 'Sedang Belajar 📚',
    nearest_task JSONB,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 6. Tabel Catatan / Study Notes (Notes)
CREATE TABLE IF NOT EXISTS public.notes (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT,
    content TEXT,
    date TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Indexing untuk performa pencarian berdasarkan user_id
CREATE INDEX IF NOT EXISTS idx_courses_user_id ON public.courses(user_id);
CREATE INDEX IF NOT EXISTS idx_schedules_user_id ON public.schedules(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_friends_user_id ON public.friends(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON public.notes(user_id);

-- Aktifkan Row Level Security (RLS) di seluruh tabel
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friends ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

-- Policy Profiles
DROP POLICY IF EXISTS "Allow all profile operations" ON public.profiles;
CREATE POLICY "Allow all profile operations" ON public.profiles
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Policy Courses
DROP POLICY IF EXISTS "Allow all courses operations" ON public.courses;
CREATE POLICY "Allow all courses operations" ON public.courses
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Policy Schedules
DROP POLICY IF EXISTS "Allow all schedules operations" ON public.schedules;
CREATE POLICY "Allow all schedules operations" ON public.schedules
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Policy Tasks
DROP POLICY IF EXISTS "Allow all tasks operations" ON public.tasks;
CREATE POLICY "Allow all tasks operations" ON public.tasks
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Policy Friends
DROP POLICY IF EXISTS "Allow all friends operations" ON public.friends;
CREATE POLICY "Allow all friends operations" ON public.friends
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Policy Notes
DROP POLICY IF EXISTS "Allow all notes operations" ON public.notes;
CREATE POLICY "Allow all notes operations" ON public.notes
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Optional: Realtime publication enablement for instant sync
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'tasks'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'schedules'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.schedules;
  END IF;
END $$;
