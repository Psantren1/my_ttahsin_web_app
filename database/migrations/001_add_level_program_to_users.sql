-- ============================================================
-- Migration 001: Add level_program column to users table
-- ============================================================
-- Menambahkan kolom level_program untuk menentukan modul
-- transaksi yang diikuti user (BTQ_PEMULA, BTQ_LANJUTAN,
-- TAHSIN, TAHFIDZ, MUROJAAH).
--
-- Default: 'TAHSIN' untuk user lama agar tidak mengubah
-- behavior yang sudah berjalan.
-- ============================================================

ALTER TABLE users
  ADD COLUMN level_program VARCHAR(20)
  DEFAULT 'TAHSIN'
  CHECK (level_program IN ('BTQ_PEMULA', 'BTQ_LANJUTAN', 'TAHSIN', 'TAHFIDZ', 'MUROJAAH'));

-- Update existing users to have TAHSIN as default
UPDATE users SET level_program = 'TAHSIN' WHERE level_program IS NULL;
