# Rencana Perbaikan — Publikasi Sistem Manajemen Tahsin

## Ringkasan
Prioritas: **Keamanan → Stabilitas → Infrastruktur → SEO/PWA**

---

## 🔴 Fase 1 — Keamanan Dasar (Estimasi: 60 menit)

### 1.1 Auth API — Middleware Wajib Login
Semua route `app/api/*/route.ts` perlu dicek session sebelum proses request.

**Langkah:**
1. Buat `lib/auth/api-auth.ts` — helper `requireAuth()` yang baca cookie `baitul_session`, validasi, return user atau 401
2. Tambahkan di awal setiap handler API route: `const user = requireAuth();`
3. Untuk route yang perlu role spesifik, tambahkan `requireRole(user, ['ADMIN'])`

**File affected:** ~25 file `app/api/**/route.ts`

### 1.2 Session Token — Dari Base64 ke JWT
**Langkah:**
1. Install `jsonwebtoken` dan `@types/jsonwebtoken`
2. Di `app/api/auth/login/route.ts`: generate JWT dengan `jwt.sign({ id, role }, SECRET, { expiresIn: '7d' })`
3. Di `lib/auth/api-auth.ts`: verify dengan `jwt.verify(token, SECRET)`
4. Simpan `JWT_SECRET` di `.env`

### 1.3 Middleware — Proteksi Route Dashboard
**Langkah:**
1. Edit `middleware.ts` — jangan bypass `/api/` lagi
2. Untuk `/dashboard/*`: cek cookie `baitul_session`, redirect ke `/login` jika tidak valid
3. Tambahkan `matcher` di konfigurasi middleware

### 1.4 Password Hashing — SHA-256 ke bcrypt
**Langkah:**
1. Install `bcryptjs` (native JS, tidak perlu build tools)
2. Di `lib/services/user.service.ts`: ganti `hashPassword` pakai `bcryptjs.hashSync(password, 10)`
3. Di `app/api/auth/login/route.ts`: ganti perbandingan hash pakai `bcryptjs.compareSync`

### 1.5 Hapus Demo Users & Hardcoded Credentials
**Langkah:**
1. Hapus file `lib/auth/auth.ts` (atau comment-out semua demo user)
2. Hapus default password hardcoded di `app/api/santri/route.ts:21` dan `app/api/musyrif/route.ts:21`

### 1.6 Input Validation Dasar
**Langkah:**
1. Tambahkan validasi panjang karakter di tiap POST/PUT (misal: `full_name` max 255)
2. Validasi email format di register dan create user

---

## 🔴 Fase 2 — Stabilitas UI (Estimasi: 30 menit)

### 2.1 Error Boundary Global
Buat `app/error.tsx`:
```tsx
'use client'
export default function GlobalError({ error, reset }) {
  return <div>...UI error dengan tombol reload...</div>
}
```

### 2.2 Not Found Page
Buat `app/not-found.tsx` — halaman 404 dengan navigasi kembali ke dashboard.

### 2.3 Loading State
Buat `app/loading.tsx` — skeleton screen global untuk page transitions.

---

## 🟡 Fase 3 — Hardening Lanjutan (Estimasi: 45 menit)

### 3.1 Security Headers
Di `next.config.js`, tambahkan:
- `Content-Security-Policy`
- `X-Frame-Options: DENY`
- `Strict-Transport-Security: max-age=31536000`
- `X-Content-Type-Options: nosniff`
- Hapus `X-Powered-By`

### 3.2 Rate Limiting Login
Buat `lib/auth/rate-limit.ts` — inline rate limiter pakai Map (sederhana):
- Max 5 percobaan per IP per 15 menit
- Terapkan di `app/api/auth/login/route.ts`

### 3.3 Database Connection Fallback
Di `lib/db/client.ts`: ganti fallback connection string dengan throw error jika `DATABASE_URL` tidak diset, agar tidak bocor credential palsu.

### 3.4 Health Check Endpoint
Buat `app/api/health/route.ts` — return `{ status: 'ok', timestamp: new Date().toISOString() }`

---

## 🟡 Fase 4 — Infrastruktur (Estimasi: 30 menit)

### 4.1 Fix npm Scripts
Buat `scripts/migrate.js` dan `scripts/seed.js` yang jalanin `schema.sql` via `psql` atau `pg` client.

### 4.2 Environment Variable
Update `.env.example` dengan semua variabel yang dibutuhkan:
```
DATABASE_URL=
JWT_SECRET=
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_APP_NAME=Sistem Manajemen Tahsin
NODE_ENV=production
```

### 4.3 Public Directory
- Buat `public/` folder
- Tambahkan `favicon.ico`
- Tambahkan `robots.txt`

---

## 🟢 Fase 5 — Non-Kritis (Estimasi: 45 menit)

### 5.1 SEO
- Tambahkan `metadata` export ke setiap page
- Open Graph tags di root layout
- Generate `sitemap.xml`

### 5.2 CORS
Untuk API routes: tambahkan CORS headers jika diperlukan akses dari origin lain.

### 5.3 Logging Minimal
Ganti `console.error` di API routes dengan fungsi logger sederhana yang prepend timestamp.

### 5.4 PWA Minimal
- `manifest.json` sederhana
- Service worker untuk cache asset statis

---

## 🟢 Fase 6 — CI/CD & Docker (Estimasi: 60 menit)

### 6.1 GitHub Actions
- Lint + Type Check + Build otomatis tiap push
- Deploy ke Vercel otomatis

### 6.2 Dockerfile
- Multi-stage build (dependencies → build → production)
- Gunakan `output: 'standalone'` di next.config.js

---

## Timeline Total

| Fase | Durasi | Prioritas |
|------|--------|-----------|
| Fase 1 — Keamanan Dasar | 60 menit | 🔴 Wajib sebelum publikasi |
| Fase 2 — Stabilitas UI | 30 menit | 🔴 Wajib sebelum publikasi |
| Fase 3 — Hardening | 45 menit | 🟡 Secepatnya |
| Fase 4 — Infrastruktur | 30 menit | 🟡 Menyusul |
| Fase 5 — Non-Kritis | 45 menit | 🟢 Setelah live |
| Fase 6 — CI/CD & Docker | 60 menit | 🟢 Setelah live |
| **Total** | **~4.5 jam** | |

> **Catatan:** Fase 1 + 2 (1.5 jam) sudah cukup untuk publikasi aman. Sisanya bisa incremental setelah live.
