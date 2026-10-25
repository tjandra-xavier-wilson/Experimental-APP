# 🚀 Panduan Setup & Integrasi Supabase Cloud Database

Project ini telah berhasil dihubungkan ke **Supabase** dengan arsitektur **Hybrid Cloud & Offline-First**:
- **Offline / Local Mode**: Jika Supabase belum dikonfigurasi, aplikasi tetap berjalan 100% normal menggunakan browser storage.
- **Supabase Cloud Mode**: Saat kredensial dimasukkan, semua jadwal, tugas, profil, teman belajar, dan catatan akan otomatis tersinkronisasi ke PostgreSQL cloud Supabase secara real-time!

---

## 📋 Langkah 1: Buat Project Baru di Supabase (Gratis)
1. Buka [https://supabase.com](https://supabase.com) dan login menggunakan akun GitHub Anda.
2. Klik tombol **"New Project"**.
3. Isi informasi project:
   - **Name**: `CodeStack-Schedule` (atau nama pilihan Anda)
   - **Database Password**: Buat password yang kuat dan simpan baik-baik
   - **Region**: Pilih yang terdekat, misal: `Singapore (ap-southeast-1)`
4. Klik **"Create new project"** dan tunggu sekitar 1-2 menit hingga proses inisialisasi selesai.

---

## 🗄️ Langkah 2: Jalankan Script SQL Database Schema
Script schema database sudah disiapkan di dalam project pada file [`supabase/schema.sql`](./supabase/schema.sql).

1. Di dashboard Supabase Anda, klik menu **SQL Editor** (ikon terminal `>_` di sidebar kiri).
2. Klik **"New Query"**.
3. Salin seluruh isi dari file [`supabase/schema.sql`](./supabase/schema.sql).
4. Tempel (paste) ke editor SQL, lalu klik tombol **"Run"** (atau tekan `Ctrl + Enter`).
5. Muncul pesan `Success. No rows returned` yang menandakan tabel berikut telah berhasil dibuat:
   - `profiles` (Data profil siswa/mahasiswa)
   - `courses` (Daftar mata kuliah / mata pelajaran)
   - `schedules` (Jadwal kelas rutin mingguan)
   - `tasks` (Daftar tugas, deadline, dan status)
   - `friends` (Rekan belajar & progres bersama)
   - `notes` (Catatan belajar & rumus)
   - Row Level Security (RLS) policies dan index untuk query kilat.

---

## 🔑 Langkah 3: Ambil Kredensial API Supabase
1. Di dashboard Supabase, buka menu **Project Settings** (ikon gerigi di sidebar kiri bawah).
2. Pilih tab **API**.
3. Temukan 2 nilai berikut:
   - **Project URL**: Format `https://xxxxxxxxxxxxxxxxxxxx.supabase.co`
   - **Project API Keys**: Salin key dengan label **`anon` `public`** (bukan `service_role`).

---

## ⚙️ Langkah 4: Hubungkan ke Aplikasi (Pilih Salah Satu Metode)

### Metode A: Melalui UI Aplikasi Langsung (Paling Praktis)
1. Jalankan aplikasi (`npm run dev`).
2. Di navbar atas atau sidebar, klik tombol **"Supabase Setup ⚡"** atau **"Supabase Cloud"**.
3. Masukkan **Project URL** dan **Anon Key** yang sudah Anda salin.
4. Klik tombol **"Uji Koneksi"** untuk memastikan koneksi berhasil.
5. Klik **"Simpan & Hubungkan"**.
6. Status akan langsung berubah menjadi **"Supabase Sync 🟢"**!
7. Klik tombol **"Upload Data Lokal ke Cloud"** untuk mengirimkan data yang ada saat ini ke database Supabase Anda.

### Metode B: Melalui File `.env`
Buka file `.env` di root project dan masukkan kredensial:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-actual-anon-key-here
```
Simpan file dan restart dev server (`npm run dev`).

---

## ⚡ Langkah 5: Mengatasi Status "Realtime Unhealthy" di Supabase

Jika di dashboard Supabase (pada **Project Health** atau **Database > Replication**) bagian **Realtime** berstatus **"Unhealthy"**:

### Penyebab:
1. PostgreSQL logical replication membutuhkan konfigurasi `REPLICA IDENTITY FULL` pada tabel agar perubahan data (`UPDATE` dan `DELETE`) dapat di-streaming tanpa error replikasi.
2. Publikasi `supabase_realtime` atau slot replikasi internal Supabase tertahan/stuck dan membutuhkan refresh bersih.

### Cara Memperbaiki (Hanya 2 Langkah Cepat):
1. **Jalankan Script Perbaikan di SQL Editor Supabase**:
   Salin dan jalankan file [`supabase/fix_realtime.sql`](./supabase/fix_realtime.sql) di Supabase SQL Editor:
   ```sql
   BEGIN;
   -- 1. Set REPLICA IDENTITY FULL
   ALTER TABLE public.profiles REPLICA IDENTITY FULL;
   ALTER TABLE public.courses REPLICA IDENTITY FULL;
   ALTER TABLE public.schedules REPLICA IDENTITY FULL;
   ALTER TABLE public.tasks REPLICA IDENTITY FULL;
   ALTER TABLE public.friends REPLICA IDENTITY FULL;
   ALTER TABLE public.notes REPLICA IDENTITY FULL;

   -- 2. Buat ulang publikasi supabase_realtime
   DROP PUBLICATION IF EXISTS supabase_realtime;
   CREATE PUBLICATION supabase_realtime FOR TABLE public.profiles, public.courses, public.schedules, public.tasks, public.friends, public.notes;
   COMMIT;
   ```
2. **Restart Project di Supabase Dashboard**:
   - Buka **Project Settings** (ikon gerigi di kiri bawah dashboard Supabase).
   - Klik menu **General**.
   - Klik tombol **"Restart project"** (atau *"Restart database"*).
   - Tunggu 1–2 menit, status Realtime akan kembali **Healthy 🟢**!

> [!NOTE]
> **Dual-Mode Resilient Sync:** Aplikasi telah dibekali Smart Polling Fallback otomatis. Walaupun Realtime Supabase sedang degraded atau Unhealthy, data tetap tersinkronisasi otomatis setiap 25 detik dan saat berpindah tab.

---

## 🌐 Langkah 6: Panduan Deployment ke Vercel

1. **File `vercel.json` telah disiapkan:**
   File `vercel.json` sudah dibuat di root project untuk menangani SPA rewrites sehingga tidak akan terjadi error `404 Not Found` saat me-refresh halaman.
2. **Environment Variables di Vercel Dashboard:**
   - Buka project Anda di [Vercel Dashboard](https://vercel.com).
   - Masuk ke tab **Settings** -> **Environment Variables**.
   - Tambahkan 2 variabel berikut:
     - `VITE_SUPABASE_URL` = URL Project Supabase Anda
     - `VITE_SUPABASE_ANON_KEY` = Anon Public Key Supabase Anda
   - Klik **Save** dan lakukan **Redeploy**.

---

## 🛠️ File-File Integrasi yang Telah Dibuat:
- [`vercel.json`](./vercel.json): Konfigurasi SPA rewrite dan HTTP security headers untuk deployment Vercel.
- [`supabase/fix_realtime.sql`](./supabase/fix_realtime.sql): Script SQL perbaikan instant untuk Realtime Unhealthy.
- [`src/services/supabaseClient.js`](./src/services/supabaseClient.js): Inisialisasi client Supabase, diagnostic Realtime health check, dan manajemen kredensial dinamis.
- [`src/services/supabaseService.js`](./src/services/supabaseService.js): Service CRUD lengkap (Auth, Profil, Tugas, Jadwal, Catatan, dan Sinkronisasi Batch).
- [`src/services/storage.js`](./src/services/storage.js): Lapisan hybrid penyimpanan dengan Dual-Mode Resilient Sync (Realtime WebSocket + Smart Polling Fallback).
- [`src/components/Views/SupabaseView.jsx`](./src/components/Views/SupabaseView.jsx): Tampilan status koneksi live, diagnosa Realtime, dan tombol salin SQL perbaikan.
- [`src/components/SupabaseModal.jsx`](./src/components/SupabaseModal.jsx): Modal interaktif untuk konfigurasi, diagnosa, dan tab khusus perbaikan Realtime.
- [`supabase/schema.sql`](./supabase/schema.sql): Script DDL SQL lengkap beserta REPLICA IDENTITY FULL dan Row Level Security (RLS).
- [`.env.example`](./.env.example) & [`.env`](./.env): Template konfigurasi environment variable.

Selamat! Project Anda sekarang telah siap digunakan secara tangguh di Vercel dan Supabase! 🎉

