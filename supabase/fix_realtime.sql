-- ==========================================================
-- SUPABASE REALTIME REPAIR & STABILIZATION SCRIPT
-- ==========================================================
-- Jalankan script ini di Supabase SQL Editor jika Realtime berstatus "Unhealthy":
-- 1. Buka https://supabase.com/dashboard -> Pilih Project Anda
-- 2. Buka menu 'SQL Editor' (ikon terminal di sidebar kiri)
-- 3. Klik 'New query', paste script ini, lalu klik 'Run' (Ctrl + Enter)
-- 4. Buka Project Settings -> General -> Klik 'Restart Project' (atau 'Restart Database')
-- ==========================================================

BEGIN;

-- 1. Set REPLICA IDENTITY FULL pada semua tabel
-- PENTING: PostgreSQL mewajibkan REPLICA IDENTITY FULL agar event UPDATE dan DELETE
-- pada logical replication realtime dapat dikirim tanpa error replikasi yang membuat Realtime Unhealthy.
ALTER TABLE public.profiles REPLICA IDENTITY FULL;
ALTER TABLE public.courses REPLICA IDENTITY FULL;
ALTER TABLE public.schedules REPLICA IDENTITY FULL;
ALTER TABLE public.tasks REPLICA IDENTITY FULL;
ALTER TABLE public.friends REPLICA IDENTITY FULL;
ALTER TABLE public.notes REPLICA IDENTITY FULL;

-- 2. Buat ulang publikasi supabase_realtime secara bersih
DROP PUBLICATION IF EXISTS supabase_realtime;
CREATE PUBLICATION supabase_realtime;

-- 3. Daftarkan seluruh tabel ke publikasi realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.courses;
ALTER PUBLICATION supabase_realtime ADD TABLE public.schedules;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.friends;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notes;

COMMIT;

-- 4. Verifikasi tabel yang telah berhasil terdaftar di publikasi
SELECT pubname, schemaname, tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime';
