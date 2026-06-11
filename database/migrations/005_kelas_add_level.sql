-- Migration 005: Add level column to kelas table if missing
ALTER TABLE kelas ADD COLUMN IF NOT EXISTS level INT NOT NULL DEFAULT 7 CHECK (level >= 7 AND level <= 12);
