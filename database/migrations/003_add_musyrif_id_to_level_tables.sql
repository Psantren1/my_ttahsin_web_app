ALTER TABLE btq_pemula
  ADD COLUMN musyrif_id UUID REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE btq_lanjutan
  ADD COLUMN musyrif_id UUID REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE tahfidz
  ADD COLUMN musyrif_id UUID REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE murojaah
  ADD COLUMN musyrif_id UUID REFERENCES users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_btq_pemula_musyrif ON btq_pemula(musyrif_id);
CREATE INDEX IF NOT EXISTS idx_btq_lanjutan_musyrif ON btq_lanjutan(musyrif_id);
CREATE INDEX IF NOT EXISTS idx_tahfidz_musyrif ON tahfidz(musyrif_id);
CREATE INDEX IF NOT EXISTS idx_murojaah_musyrif ON murojaah(musyrif_id);
