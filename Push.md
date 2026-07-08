# Push Log

**Remote:** https://github.com/Psantren1/my_ttahsin_web_app.git

## Last Commit (826df33)
```
fix: Tambah role-based access control di semua GET endpoints & setting/debug critical fix
```

**Files changed (21):**
- `app/api/settings/route.ts` — PUT + GET ADMIN only (critical)
- `app/api/debug/route.ts` — GET ADMIN only (critical)
- `app/api/absensi/route.ts` — SANTRI: own data only
- `app/api/setoran/route.ts` — SANTRI: own data only
- `app/api/evaluasi/route.ts` — SANTRI: own data only
- `app/api/target/route.ts` — SANTRI: own data only
- `app/api/sertifikat/route.ts` — SANTRI: own data only
- `app/api/murojaah/route.ts` — SANTRI: own data only
- `app/api/tahfidz/route.ts` — SANTRI: own data only
- `app/api/btq-pemula/route.ts` — SANTRI: own data only
- `app/api/btq-lanjutan/route.ts` — SANTRI: own data only
- `app/api/jadwal/route.ts` — auth check added
- `app/api/informasi/route.ts` — auth check added
- `app/api/zoom-meetings/route.ts` — auth check added
- `app/api/kelas/route.ts` — auth check added
- `app/api/kelas/[id]/route.ts` — auth check added
- `app/api/santri/route.ts` — ADMIN + MUSYRIF only
- `app/api/santri/[id]/route.ts` — SANTRI: own profile only
- `app/api/musyrif/route.ts` — ADMIN only
- `app/api/musyrif/[id]/route.ts` — ADMIN only
- `Push.md` — this file

## Push Command
```bash
git push origin main
```

> **Note:** Push gagal dengan error 403 (permission denied). Gunakan git credentials yang memiliki akses ke repo `Psantren1/my_ttahsin_web_app`.