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

## Deploy to Firebase

### Prasyarat
- Firebase console: sudah punya project di https://console.firebase.google.com
- Firebase CLI: sudah terinstall (`firebase --version`)

### Langkah Deploy

**1. Login Firebase CLI**
```bash
firebase login
```

**2. Set Project ID**
Edit `.firebaserc` — ganti `GANTI_DENGAN_PROJECT_ID_ANDA` dengan ID project Firebase kamu.

Atau:
```bash
firebase use --add
```

**3. Install dependencies functions**
```bash
cd functions
npm install
cd ..
```

**4. Build Next.js**
```bash
npm run build
```

**5. Set Environment Variables di Firebase**
```bash
firebase functions:config:set app.database_url="postgresql://..." app.jwt_secret="your-secret"
```

Atau set via **Firebase Console > Functions > Environment Variables**.

**6. Deploy**
```bash
firebase deploy --only functions,hosting
```

### File Konfigurasi
| File | Fungsi |
|------|--------|
| `firebase.json` | Config hosting + cloud functions |
| `.firebaserc` | Project ID Firebase |
| `functions/index.js` | Next.js server handler |
| `functions/package.json` | Dependencies functions |