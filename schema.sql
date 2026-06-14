-- ============================================================
-- BAITULHUFFAZ TAHSIN MANAGEMENT SYSTEM - Neon PostgreSQL Schema
-- ============================================================
-- Generated from full codebase analysis (service files, API routes, types)
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE user_role AS ENUM ('ADMIN', 'MUSYRIF', 'SANTRI');
CREATE TYPE status_setoran AS ENUM ('LANJUT', 'ULANGI');
CREATE TYPE jenis_setoran AS ENUM ('SABAQ', 'SABQI', 'MANZIL');
CREATE TYPE status_absensi AS ENUM ('HADIR', 'IZIN', 'SAKIT', 'ALPA');
CREATE TYPE status_sertifikat AS ENUM ('TERBIT', 'DALAM_PROSES', 'DIBATALKAN');
CREATE TYPE status_target AS ENUM ('BELUM', 'SELESAI', 'TERLAMBAT');
CREATE TYPE target_role AS ENUM ('MUSYRIF', 'SANTRI', 'ALL');
CREATE TYPE hari AS ENUM ('SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT', 'SABTU', 'MINGGU');

-- ============================================================
-- TABLE: kelas
-- ============================================================

CREATE TABLE kelas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama VARCHAR(255) NOT NULL,
  level INTEGER NOT NULL CHECK (level BETWEEN 7 AND 12),
  deskripsi TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: users
-- ============================================================

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role user_role NOT NULL,
  nis VARCHAR(50) UNIQUE,
  nip VARCHAR(50) UNIQUE,
  nisn VARCHAR(20),
  username VARCHAR(100) UNIQUE,
  no_wa VARCHAR(20),
  kelas_id UUID REFERENCES kelas(id) ON DELETE SET NULL,
  target_Tahsin INTEGER NOT NULL DEFAULT 30,
  avatar_url TEXT,
  nama_ayah VARCHAR(255),
  nama_ibu VARCHAR(255),
  pekerjaan_ayah VARCHAR(255),
  pekerjaan_ibu VARCHAR(255),
  level_program VARCHAR(20) DEFAULT 'TAHSIN' CHECK (level_program IN ('BTQ_PEMULA', 'BTQ_LANJUTAN', 'TAHSIN', 'TAHFIDZ', 'MUROJAAH')),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: setoran (Tahsin assessment records)
-- ============================================================

CREATE TABLE setoran (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  santuario_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  musyrif_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  surah VARCHAR(255) NOT NULL,
  ayat_start INTEGER,
  ayat_end INTEGER,
  juz INTEGER,
  halaman_start INTEGER,
  halaman_end INTEGER,
  tajwid_score INTEGER NOT NULL CHECK (tajwid_score BETWEEN 0 AND 100),
  makhraj_score INTEGER NOT NULL CHECK (makhraj_score BETWEEN 0 AND 100),
  kelancaran_score INTEGER NOT NULL CHECK (kelancaran_score BETWEEN 0 AND 100),
  rata_rata NUMERIC(5,2) NOT NULL,
  status status_setoran NOT NULL,
  jenis jenis_setoran NOT NULL DEFAULT 'SABAQ',
  catatan TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: absensi (Attendance)
-- ============================================================

CREATE TABLE absensi (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  santuario_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  jadwal_id UUID,
  tanggal DATE NOT NULL,
  status status_absensi NOT NULL,
  jam_hadir TIME,
  jam_pulang TIME,
  keterangan TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (santuario_id, tanggal)
);

-- ============================================================
-- TABLE: jadwal (Schedule)
-- ============================================================

CREATE TABLE jadwal (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sesi VARCHAR(255) NOT NULL,
  jam_mulai TIME NOT NULL,
  jam_selesai TIME NOT NULL,
  lokasi VARCHAR(255),
  hari hari NOT NULL,
  tanggal DATE,
  kelas_id UUID REFERENCES kelas(id) ON DELETE SET NULL,
  musyrif_id UUID REFERENCES users(id) ON DELETE SET NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: kelas_musyrif (Many-to-many: kelas ↔ musyrif)
-- ============================================================

CREATE TABLE kelas_musyrif (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kelas_id UUID NOT NULL REFERENCES kelas(id) ON DELETE CASCADE,
  musyrif_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(kelas_id, musyrif_id)
);

CREATE INDEX idx_kelas_musyrif_kelas ON kelas_musyrif(kelas_id);
CREATE INDEX idx_kelas_musyrif_musyrif ON kelas_musyrif(musyrif_id);

-- Migration: copy existing musyrif assignments from users.kelas_id to kelas_musyrif
-- Run once after deploying this schema:
-- INSERT INTO kelas_musyrif (kelas_id, musyrif_id)
-- SELECT u.kelas_id, u.id FROM users u
-- WHERE u.role = 'MUSYRIF' AND u.kelas_id IS NOT NULL
-- ON CONFLICT (kelas_id, musyrif_id) DO NOTHING;

-- ============================================================
-- TABLE: audit_log (Account change history)
-- ============================================================

CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(50) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id VARCHAR(255),
  old_values JSONB,
  new_values JSONB,
  ip_address VARCHAR(45),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_log_user ON audit_log(user_id);
CREATE INDEX idx_audit_log_entity ON audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_log_created ON audit_log(created_at DESC);

-- Add FK for absensi.jadwal_id now that jadwal exists
ALTER TABLE absensi ADD CONSTRAINT fk_absensi_jadwal
  FOREIGN KEY (jadwal_id) REFERENCES jadwal(id) ON DELETE SET NULL;

-- ============================================================
-- TABLE: sertifikat (Certificates)
-- ============================================================

CREATE TABLE sertifikat (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  santuario_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  juz INTEGER NOT NULL,
  no_sertifikat VARCHAR(50),
  tgl_cetak DATE,
  file_url TEXT,
  status status_sertifikat NOT NULL DEFAULT 'DALAM_PROSES',
  nomor_sertifikat VARCHAR(50),
  nama_surat VARCHAR(255),
  status_kelulusan VARCHAR(50),
  paragraf_teks TEXT,
  nama_sekolah VARCHAR(255),
  alamat_sekolah TEXT,
  akreditasi VARCHAR(10),
  nilai_tajwid INTEGER,
  nilai_makhraj INTEGER,
  nilai_kelancaran INTEGER,
  nilai_rata INTEGER,
  kota_penandatangan VARCHAR(255),
  nama_penanggung_jawab VARCHAR(255),
  jabatan VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: target_Tahsin (Tahsin targets/goals)
-- ============================================================

CREATE TABLE target_Tahsin (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  santuario_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  surah VARCHAR(255) NOT NULL,
  ayat_start INTEGER,
  ayat_end INTEGER,
  juz INTEGER,
  progres INTEGER NOT NULL DEFAULT 0 CHECK (progres BETWEEN 0 AND 100),
  target_date DATE,
  status status_target NOT NULL DEFAULT 'BELUM',
  catatan TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: evaluasi (Student evaluations)
-- ============================================================

CREATE TABLE evaluasi (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  santuario_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  musyrif_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  predikat_adab VARCHAR(50),
  predikat_kedisiplinan VARCHAR(50),
  catatan TEXT,
  periode VARCHAR(50),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: informasi (Announcements)
-- ============================================================

CREATE TABLE informasi (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  judul VARCHAR(255) NOT NULL,
  isi TEXT NOT NULL,
  target_role target_role NOT NULL,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: zoom_meetings (Virtual class meetings)
-- ============================================================

CREATE TABLE zoom_meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  musyrif_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  topic VARCHAR(255) NOT NULL,
  description TEXT,
  meeting_date DATE NOT NULL,
  meeting_time TIME NOT NULL,
  duration INTEGER NOT NULL,
  link TEXT NOT NULL,
  password VARCHAR(100),
  host_name VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: app_settings (Application settings KV store)
-- ============================================================

CREATE TABLE app_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(255) UNIQUE NOT NULL,
  value TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: btq_pemula (BTQ Pemula assessment records)
-- ============================================================

CREATE TABLE btq_pemula (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  santuario_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  jilid VARCHAR(50) NOT NULL,
  halaman INTEGER NOT NULL,
  nilai INTEGER NOT NULL CHECK (nilai BETWEEN 0 AND 100),
  predikat VARCHAR(50) NOT NULL,
  catatan TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (santuario_id)
);

-- ============================================================
-- TABLE: btq_lanjutan (BTQ Lanjutan assessment records)
-- ============================================================

CREATE TABLE btq_lanjutan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  santuario_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  level VARCHAR(50) NOT NULL,
  juz_surah VARCHAR(255) NOT NULL,
  nilai INTEGER NOT NULL CHECK (nilai BETWEEN 0 AND 100),
  status_bacaan VARCHAR(50) NOT NULL,
  predikat VARCHAR(50) NOT NULL,
  status_penilaian VARCHAR(50) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (santuario_id)
);

-- ============================================================
-- TABLE: tahfidz (Tahfidz assessment records)
-- ============================================================

CREATE TABLE tahfidz (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  santuario_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  juz INTEGER,
  surat VARCHAR(255),
  ayat VARCHAR(255),
  hafalan_baru VARCHAR(255),
  nilai INTEGER CHECK (nilai BETWEEN 0 AND 100),
  status_setoran VARCHAR(50),
  predikat VARCHAR(50),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (santuario_id)
);

-- ============================================================
-- TABLE: murojaah (Murojaah assessment records)
-- ============================================================

CREATE TABLE murojaah (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  santuario_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  juz INTEGER,
  surah VARCHAR(255),
  ayat VARCHAR(255),
  nilai INTEGER CHECK (nilai BETWEEN 0 AND 100),
  status_murojaah VARCHAR(50),
  predikat VARCHAR(50),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (santuario_id)
);

-- ============================================================
-- INDEXES
-- ============================================================

-- Users
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_kelas_id ON users(kelas_id);
CREATE INDEX idx_users_is_active ON users(is_active);
CREATE INDEX idx_users_email ON users(email);

-- BTQ Pemula
CREATE INDEX idx_btq_pemula_santuario ON btq_pemula(santuario_id);

-- BTQ Lanjutan
CREATE INDEX idx_btq_lanjutan_santuario ON btq_lanjutan(santuario_id);

-- Setoran
CREATE INDEX idx_setoran_santuario ON setoran(santuario_id);
CREATE INDEX idx_setoran_musyrif ON setoran(musyrif_id);
CREATE INDEX idx_setoran_created ON setoran(created_at DESC);

-- Absensi
CREATE INDEX idx_absensi_santuario ON absensi(santuario_id);
CREATE INDEX idx_absensi_tanggal ON absensi(tanggal);
CREATE INDEX idx_absensi_status ON absensi(status);

-- Jadwal
CREATE INDEX idx_jadwal_hari ON jadwal(hari);
CREATE INDEX idx_jadwal_kelas ON jadwal(kelas_id);
CREATE INDEX idx_jadwal_musyrif ON jadwal(musyrif_id);

-- Sertifikat
CREATE INDEX idx_sertifikat_santuario ON sertifikat(santuario_id);

-- Target Tahsin
CREATE INDEX idx_target_santuario ON target_Tahsin(santuario_id);
CREATE INDEX idx_target_status ON target_Tahsin(status);

-- Evaluasi
CREATE INDEX idx_evaluasi_santuario ON evaluasi(santuario_id);
CREATE INDEX idx_evaluasi_musyrif ON evaluasi(musyrif_id);

-- Informasi
CREATE INDEX idx_informasi_target_role ON informasi(target_role);
CREATE INDEX idx_informasi_is_active ON informasi(is_active);

-- Zoom meetings
CREATE INDEX idx_zoom_musyrif ON zoom_meetings(musyrif_id);
CREATE INDEX idx_zoom_meeting_date ON zoom_meetings(meeting_date);

-- ============================================================
-- SEED DATA
-- ============================================================

-- Default Admin
INSERT INTO users (id, email, password_hash, full_name, role)
VALUES (
  'admin-default-001',
  'admin@baitulhuffaz.sch.id',
  '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918', -- sha256('admin')
  'Admin Utama',
  'ADMIN'
) ON CONFLICT (id) DO NOTHING;

-- Default Settings
INSERT INTO app_settings (key, value) VALUES
  ('appName', '"Sistem Manajemen Tahsin"'),
  ('tahunAjaran', '"2024/2025"')
ON CONFLICT (key) DO NOTHING;
