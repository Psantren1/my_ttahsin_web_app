# my_ttahsin_web_app

Sistem Manajemen Lembaga Tahfizh Al-Qur'an

## Teknologi

- **Framework:** Next.js 14 (App Router)
- **Bahasa:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** PostgreSQL (Neon / Vercel Postgres)
- **Hosting:** Vercel
- **Storage:** Vercel Blob / Neon

## Fitur

### Dashboard Admin
- Manajemen data Santri
- Manajemen Musyrif/Ustadz
- Manajemen Kelas/Halaqah
- Manajemen Jadwal
- Input & Review Nilai Tahsin
- Generate Raport
- Generate Sertifikat

### Dashboard Musyrif
- Input Setoran Tahsin
- Input Penilaian (Tajwid, Makhraj, Kelancaran)
- Input Kehadiran
- Input Evaluasi Sikap
- Update Target Tahsin
- Download Sertifikat

### Dashboard Santri
- Lihat Nilai Tahsin
- Lihat Raport
- Lihat Progress Target
- Akses Zoom Link
- Download Sertifikat

## Instalasi

```bash
# Clone repository
git clone <repo-url>
cd my_ttahsin_web_app

# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local

# Edit .env.local dengan connection string Neon/Vercel Anda

# Run development server
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000)

## Setup Database (Neon)

1. Buat project baru di [Neon](https://neon.tech) atau gunakan Vercel Postgres
2. Dapatkan connection string dari dashboard
3. Set environment variable `DATABASE_URL` di `.env.local`
4. Jalankan SQL migrations di `database/migrations/001_schema.sql`

Atau di Vercel:
1. Buka project di Vercel Dashboard
2. Go to Storage > Create Database
3. Pilih Neon atau Vercel Postgres
4. Copy connection string ke Environment Variables

## Setup Database Schema

Jalankan SQL berikut di Neon SQL Editor atau psql:

```sql
-- Lihat file database/migrations/001_schema.sql untuk schema lengkap
-- Atau jalankan: cat database/migrations/001_schema.sql | psql $DATABASE_URL
```

## Deploy ke Vercel

1. Push kode ke GitHub repository
2. Buka [vercel.com](https://vercel.com)
3. Import repository GitHub
4. Setup Storage (Neon Postgres atau Vercel Postgres)
5. Set environment variable `DATABASE_URL`
6. Deploy!

### Environment Variables untuk Vercel

```env
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require
```

## Akun Demo

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@baitulhuffaz.sch.id | admin123 |
| Musyrif | musyrif@baitulhuffaz.sch.id | musyrif123 |
| Santri | santri@baitulhuffaz.sch.id | santri123 |

## Struktur Database

```
users          - Data user (admin, musyrif, santri)
kelas          - Data kelas/halaqah
setoran        - Record setoran Tahsin
jadwal         - Jadwal kegiatan
absensi        - Kehadiran harian
evaluasi       - Evaluasi sikap/adab
target_Tahsin - Target Tahsin per santri
sertifikat     - Data sertifikat
raport         - Raport Tahsin
zoom_meetings  - Data meeting zoom
```

## License

MIT License