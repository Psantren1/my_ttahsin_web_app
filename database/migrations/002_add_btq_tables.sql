-- ============================================================
-- MIGRATION 002: Add btq_pemula and btq_lanjutan tables
-- ============================================================

CREATE TABLE IF NOT EXISTS btq_pemula (
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

CREATE TABLE IF NOT EXISTS btq_lanjutan (
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

CREATE INDEX IF NOT EXISTS idx_btq_pemula_santuario ON btq_pemula(santuario_id);
CREATE INDEX IF NOT EXISTS idx_btq_lanjutan_santuario ON btq_lanjutan(santuario_id);
