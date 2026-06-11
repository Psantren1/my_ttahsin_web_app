-- Migration 004: Add missing columns to users table
-- Menambahkan kolom yang ada di frontend form tapi belum ada di database

ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS no_wa VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS nisn VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS nama_ayah VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS nama_ibu VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS pekerjaan_ayah VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS pekerjaan_ibu VARCHAR(255);
