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

## 🛠️ File-File Integrasi yang Telah Dibuat:
- [`src/services/supabaseClient.js`](./src/services/supabaseClient.js): Inisialisasi client Supabase, manajemen kredensial dinamis, dan pengujian koneksi.
- [`src/services/supabaseService.js`](./src/services/supabaseService.js): Service CRUD lengkap (Auth, Profil, Tugas, Jadwal, Catatan, dan Sinkronisasi Batch).
- [`src/services/storage.js`](./src/services/storage.js): Lapisan hybrid penyimpanan (LocalStorage + auto-sync ke Supabase).
- [`src/components/SupabaseModal.jsx`](./src/components/SupabaseModal.jsx): Modal interaktif untuk konfigurasi, test koneksi, panduan, copy SQL schema, dan sinkronisasi manual.
- [`supabase/schema.sql`](./supabase/schema.sql): Script DDL SQL lengkap beserta Row Level Security (RLS).
- [`.env.example`](./.env.example) & [`.env`](./.env): Template konfigurasi environment variable.

Selamat! Project Anda sekarang telah terhubung penuh ke Supabase Cloud Database! 🎉
