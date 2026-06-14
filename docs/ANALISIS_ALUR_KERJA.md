# Analisis Alur Kerja Manajemen Al-Quran

## Ringkasan Relasi Antar Role

```
┌─────────────────────────────────────────────────────────────────┐
│                         ADMIN                                   │
│  (CRUD semua data, manajemen sistem, monitoring)               │
└──────────┬────────────────────┬────────────────────┬───────────┘
           │                    │                    │
           │ CRUD Kelas         │ CRUD Santri        │ CRUD Sertifikat
           │ CRUD Musyrif       │ CRUD Jadwal        │ CRUD Informasi
           │ Setup Akun         │                    │
           ▼                    ▼                    ▼
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│   GURU (Musyrif) │  │  SISWA (Santri)  │  │   Sertifikat &   │
│                   │  │                   │  │   Informasi      │
│  Input operasional│  │  View-only data   │  │   (dipublish)    │
└──────────────────┘  └──────────────────┘  └──────────────────┘
```

---

## 1. Alur Admin ↔ Guru ↔ Siswa (Tri-directional)

Alur ini menggambarkan siklus data lengkap yang melibatkan ketiga peran. Admin sebagai pengelola sistem, Guru sebagai pelaksana operasional, dan Siswa sebagai penerima layanan.

### Diagram Alir Data

```
                          ADMIN
                             │
              ┌──────────────┼──────────────────┐
              │              │                   │
              ▼              ▼                   ▼
          KELAS ──────► GURU ──────► SISWA
          (CRUD)     (ditugaskan)   (ditempatkan)
              │              │                   │
              │              │                   │
    ┌─────────┴─────────┐   │                   │
    │                   │   │                   │
    ▼                   ▼   ▼                   ▼
 JADWAL           SERTIFIKAT              INFORMASI
(Admin buat)     (Admin publish)        (Admin buat,
                   ↓                      target per role)
              Guru lihat ──────────► Siswa lihat
              Siswa lihat
```

### Alur Data Spesifik per Fitur

#### A. Manajemen Master Data

| Langkah | Aksi | Origin | Tujuan | API Endpoint | Tabel |
|---------|------|--------|--------|-------------|-------|
| 1 | Buat Kelas | Admin | Sistem | `POST /api/kelas` | `kelas` |
| 2 | Daftarkan Guru | Admin | Guru | `POST /api/musyrif` | `users` (role=MUSYRIF) |
| 3 | Tugaskan Guru ke Kelas | Admin | Guru ↔ Kelas | `POST /api/kelas/{id}/musyrif` | `kelas_musyrif` |
| 4 | Daftarkan Siswa | Admin | Siswa | `POST /api/santri` | `users` (role=SANTRI) |
| 5 | Tempatkan Siswa di Kelas | Admin | Siswa ↔ Kelas | `PUT /api/santri/{id}` | `users.kelas_id` |

**Keterangan:** Admin adalah satu-satunya role yang dapat melakukan CRUD master data. Guru dan Siswa menerima hasil assignment ini secara pasif.

#### B. Operasional Harian

| Langkah | Aksi | Origin | Tujuan | API Endpoint | Tabel |
|---------|------|--------|--------|-------------|-------|
| 1 | Buat Jadwal | Admin | Guru & Siswa | `POST /api/jadwal` | `jadwal` |
| 2 | Lihat Jadwal | Guru | - | `GET /api/jadwal?kelas_id=...` | `jadwal` |
| 3 | Lihat Jadwal | Siswa | - | `GET /api/jadwal?kelas_id=...` | `jadwal` |
| 4 | Input Setoran Tahsin | Guru | Database | `POST /api/setoran` | `setoran` |
| 5 | Monitor Setoran | Admin | - | `GET /api/setoran` | `setoran` |
| 6 | Lihat Nilai | Siswa | - | `GET /api/setoran?santuario_id=...` | `setoran` |
| 7 | Input Presensi | Guru | Database | `POST /api/absensi` | `absensi` |
| 8 | Monitor Presensi | Admin | - | `GET /api/absensi` | `absensi` |
| 9 | Lihat Presensi | Siswa | - | `GET /api/absensi?santri_id=...` | `absensi` |

### Flowchart Operasional Harian

```
ADMIN: ──── Buat Jadwal ─────────────────────────────────────────┐
                                                                  │
GURU:     Login ─── Dashboard ─── Filter by kelas_id             │
             │                        │                          │
             ├── Input Setoran ───────┤                          │
             │     ├── Tajwid (0-100)  │                          │
             │     ├── Makhraj (0-100) │                          │
             │     ├── Kelancaran (0-100)                        │
             │     └── Status (LANJUT/ULANGI)                    │
             │                        │                          │
             ├── Input Presensi ──────┤                          │
             ├── Input Evaluasi ──────┤                          │
             └── Update Target ───────┘                          │
                                                                  │
SISWA:    Login ─── Dashboard ─── Lihat data                     │
             │                        │                          │
             ├── Lihat Nilai ◄────────┘ ←────── Setoran Guru     │
             ├── Lihat Presensi ◄─────┘ ←────── Presensi Guru    │
             ├── Lihat Evaluasi ◄─────┘ ←────── Evaluasi Guru    │
             ├── Lihat Target ◄───────┘ ←────── Target Guru      │
             └── Lihat Jadwal ◄───────┘ ←────── Jadwal Admin     │
                                                                  │
ADMIN:    Dashboard ◄────── Monitor semua data ──────────────────┘
             ├── Statistik total santri, guru, kelas              │
             ├── Aktivitas terbaru (setoran)                      │
             └── Jadwal hari ini                                  │
```

### Bagan Alur Data Berdasarkan Arah

```
ADMIN ──(create)──► KELAS ──(assign)──► GURU
  │                                      │
  │  ┌───────────────────────────────────┘
  │  │
  │  ├──(create)──► JADWAL ──(read)────► GURU
  │  │                                  └──(read)──► SISWA
  │  │
  │  ├──(create)──► SERTIFIKAT ──(publish)──► GURU
  │  │                                          └──► SISWA
  │  │
  │  └──(create)──► INFORMASI ──(target role)──► GURU
  │                                                 └──► SISWA
  │
  │  ◄──(monitor)── GURU ──(create)──► SETORAN ──(read)──► SISWA
  │  ◄──(monitor)── GURU ──(create)──► ABSENSI ──(read)──► SISWA
  │  ◄──(monitor)── GURU ──(create)──► EVALUASI ──(read)──► SISWA
  │  ◄──(monitor)── GURU ──(update)──► TARGET ──(read)──► SISWA
```

---

## 2. Alur Guru ↔ Admin (Two-way)

Interaksi dua arah antara Guru dan Admin. Alur ini bersifat **manajerial-operasional**: Admin mengatur dari atas, Guru melaporkan dari bawah.

### Diagram Alir

```
                    ADMIN
                       │
       ┌───────────────┼───────────────────┐
       │  Top-down      │      Bottom-up    │
       │  (Manajemen)   │      (Pelaporan)  │
       ▼               ▼                   ▼
  ┌──────────┐   ┌──────────┐   ┌──────────────────┐
  │  Setup   │   │  Operasi │   │   Laporan &      │
  │  Awal    │   │  Harian  │   │   Monitoring      │
  └────┬─────┘   └────┬─────┘   └────────┬─────────┘
       │               │                  │
       ▼               ▼                  ▼
  ┌─────────────────────────────────────────────┐
  │              DATABASE (PostgreSQL)           │
  │   users │ kelas │ kelas_musyrif │ jadwal    │
  │   setoran │ absensi │ evaluasi │ target     │
  │   sertifikat │ informasi │ audit_log       │
  └─────────────────────────────────────────────┘
```

### A. Alur Top-Down (Admin → Guru)

| # | Aktivitas | Admin | Guru | Metode | Dampak |
|---|-----------|-------|------|--------|--------|
| 1 | Pembuatan Akun Guru | Create akun + profil | Menerima kredensial | `POST /api/musyrif` | Guru bisa login |
| 2 | Penugasan Kelas | Assign guru ke kelas | Mendapat kelas binaan | `kelas_musyrif` | Dashboard guru terfilter by kelas |
| 3 | Pembuatan Jadwal | Buat jadwal per kelas | Lihat jadwal mengajar | `POST /api/jadwal` | Guru tahu jadwal mengajar |
| 4 | Publikasi Sertifikat | Publish sertifikat | Lihat sertifikat santri | `PUT /api/sertifikat/{id}` | Guru bisa unduh/view |
| 5 | Pengumuman Informasi | Buat info target MUSYRIF | Lihat di dashboard | `POST /api/informasi` | Guru dapat pengumuman |
| 6 | Pengaturan Sistem | Ubah settings | Terpengaruh | `POST /api/settings` | Mengubah behaviour sistem |

### B. Alur Bottom-Up (Guru → Admin)

| # | Aktivitas | Guru | Admin | API Endpoint | Manfaat bagi Admin |
|---|-----------|------|-------|-------------|-------------------|
| 1 | Input Setoran | Menilai tajwid, makhraj, kelancaran | Monitor rata-rata nilai | `POST /api/setoran` | Evaluasi kualitas pembelajaran |
| 2 | Input Presensi | Catat kehadiran santri | Rekap kehadiran | `POST /api/absensi` | Pantau kedisiplinan |
| 3 | Input Evaluasi | Catat evaluasi adab & disiplin | Review catatan | `POST /api/evaluasi` | Pantau perkembangan karakter |
| 4 | Update Target | Perbarui target Tahsin | Lihat progres target | `PUT /api/target/{id}` | Evaluasi pencapaian |
| 5 | Data Status | Status Tahsin santri | Rekap kelulusan | `GET /api/setoran` | Analisis capaian akademik |

### Alur Khusus: Sertifikat (Approval Flow)

```
Guru input          Admin review         Admin publish       Guru & Siswa
setoran & target    & buat sertifikat    sertifikat          lihat sertifikat
     │                     │                   │                   │
     ▼                     ▼                   ▼                   ▼
┌─────────┐     ┌─────────────────┐     ┌──────────┐     ┌────────────────┐
│ SETORAN │────►│ SERTIFIKAT      │────►│PUBLISHED │────►│ VIEW (read)    │
│ Target  │     │ (Draft/Unpub)   │     │          │     │ Download PDF   │
└─────────┘     └─────────────────┘     └──────────┘     └────────────────┘
                     ▲
                     │
              Admin bisa edit
              sebelum publish
```

### C. Matriks Akses Data (Guru vs Admin)

| Entitas | Admin | Guru |
|---------|-------|------|
| Users (Guru) | Create, Read, Update, Delete | Read (diri sendiri) |
| Users (Siswa) | Create, Read, Update, Delete | Read (kelas binaan) |
| Kelas | Create, Read, Update, Delete | Read (kelas ditugaskan) |
| Jadwal | Create, Read, Update, Delete | Read |
| Setoran | Read (semua) | Create, Read (kelas sendiri) |
| Absensi | Read (semua) | Create, Read (kelas sendiri) |
| Evaluasi | Read (semua) | Create, Read, Update (kelas sendiri) |
| Target | Read (semua) | Read, Update (kelas sendiri) |
| Sertifikat | Create, Read, Update, Delete, Publish | Read (kelas sendiri, published) |
| Informasi | Create, Read, Update, Delete | Read (by target_role) |
| Settings | Read, Update | - |

---

## 3. Alur Guru ↔ Siswa (Two-way)

Interaksi inti yang mencerminkan proses belajar-mengajar. Guru sebagai fasilitator dan penilai, Siswa sebagai peserta pembelajaran.

### Diagram Alir

```
┌─────────────────────────────────────────────────────────────────┐
│                      INTERAKSI PEMBELAJARAN                     │
│                                                                 │
│   GURU (Musyrif)                              SISWA (Santri)   │
│        │                                           │            │
│        │  ┌─────────────────────────────────────┐  │            │
│        │  │         PROSES TAH SIN              │  │            │
│        │  │                                     │  │            │
│        │  │ 1. Siswa menyetorkan bacaan         │  │            │
│        │  │ 2. Guru mendengarkan & menilai      │  │            │
│        │  │ 3. Guru memberikan skor & status    │  │            │
│        │  │ 4. Data tersimpan ke database       │  │            │
│        │  │ 5. Siswa melihat hasil penilaian    │  │            │
│        │  └─────────────────────────────────────┘  │            │
│        │                                           │            │
│        ▼                                           ▼            │
│  ┌──────────────┐                         ┌──────────────┐     │
│  │  INPUT DATA  │                         │  VIEW DATA   │     │
│  │  • Setoran   │────────────────────────►│  • Nilai     │     │
│  │  • Presensi  │────────────────────────►│  • Presensi  │     │
│  │  • Evaluasi  │────────────────────────►│  • Evaluasi  │     │
│  │  • Target    │────────────────────────►│  • Target    │     │
│  └──────────────┘                         └──────────────┘     │
└─────────────────────────────────────────────────────────────────┘
```

### A. Alur Penilaian Setoran Tahsin (Core Flow)

```
┌──── GURU ────┐                              ┌──── SISWA ────┐
│               │                              │               │
│  Buka halaman │                              │  Buka halaman │
│  Setoran      │                              │  Nilai        │
│       │       │                              │       │       │
│       ▼       │                              │       ▼       │
│  Pilih Siswa  │                              │  Lihat tabel  │
│       │       │                              │  riwayat      │
│       ▼       │                              │  setoran      │
│  Input nilai: │                              │       │       │
│  • Tajwid     │                              │       ▼       │
│  • Makhraj    │                              │  Detail skor: │
│  • Kelancaran │                              │  • Tajwid     │
│       │       │                              │  • Makhraj    │
│       ▼       │                              │  • Kelancaran │
│  Tentukan     │                              │  • Rata-rata  │
│  Status:      │                              │  • Status     │
│  LANJUT/ULANG │                              │    (Lanjut/   │
│       │       │                              │     Ulang)    │
│       ▼       │                              │       │       │
│  Simpan       │                              │       ▼       │
│  (POST /api/  │                              │  Lihat raport │
│   setoran)    │                              │  PDF/sertifikat│
│       │       │                              │               │
└───────┼───────┘                              └───────────────┘
        │
        ▼
┌───────────────────────────────────────────────────────────────┐
│                   DATABASE (setoran table)                    │
│  id │ santuario_id │ musyrif_id │ surah │ ayat_start/end     │
│  tajwid_score │ makhraj_score │ kelancaran_score             │
│  rata_rata │ status (LANJUT/ULANGI) │ created_at             │
└───────────────────────────────────────────────────────────────┘
```

### B. Detail Input Penilaian Guru

Guru menginput **3 komponen nilai** masing-masing skala 0-100:

| Komponen | Rentang | Deskripsi |
|----------|---------|-----------|
| **Tajwid** | 0-100 | Ketepatan hukum bacaan Al-Qur'an (makharijul huruf, ghunnah, mad, dll) |
| **Makhraj** | 0-100 | Ketepatan tempat keluar huruf (makhraj) |
| **Kelancaran** | 0-100 | Kelancaran membaca tanpa tersendat |

**Perhitungan:** Rata-rata = (Tajwid + Makhraj + Kelancaran) ÷ 3

**Status:**
- **LANJUT** → Skor memenuhi standar, siswa lanjut ke materi/surah berikutnya
- **ULANGI** → Skor belum memenuhi standar, siswa mengulang murojaah

### C. Alur Presensi

```
GURU                                SISWA
  │                                   │
  ├─ Buka Presensi                    │
  ├─ Pilih tanggal                    │
  ├─ Pilih status per siswa:          │
  │   • HADIR                         │
  │   • IZIN                          │
  │   • SAKIT                         │
  │   • ALPA                          │
  ├─ Simpan (POST /api/absensi)       │
  │                                   ├─ Lihat riwayat presensi
  │                                   │  (GET /api/absensi?santri_id=...)
```

### D. Alur Evaluasi

```
GURU                                SISWA
  │                                   │
  ├─ Pilih siswa                      │
  ├─ Input catatan evaluasi:          │
  │   • Predikat Adab                 │
  │   • Predikat Disiplin             │
  │   • Catatan Khusus                │
  ├─ Simpan (POST /api/evaluasi)      │
  │                                   ├─ Lihat evaluasi
  │                                   │  (GET /api/evaluasi?santri_id=...)
```

### E. Alur Target

```
GURU                                SISWA
  │                                   │
  ├─ Pilih siswa                      │
  ├─ Set target:                      │
  │   • Target Juz                    │
  │   • Target Surah                  │
  │   • Target Waktu                  │
  ├─ Update progres (PUT /api/target) │
  │                                   ├─ Lihat target & progres
  │                                   │  (GET /api/target?santri_id=...)
```

### F. Siklus Operasional Harian Guru

```
                    ┌──────────────┐
                    │    LOGIN     │
                    └──────┬───────┘
                           │
                           ▼
                   ┌───────────────┐
            ┌─────│  DASHBOARD    │─────┐
            │     │ (Lihat kelas  │     │
            │     │  binaan)      │     │
            │     └───────────────┘     │
            ▼                           ▼
   ┌─────────────────┐       ┌─────────────────┐
   │  CEK JADWAL     │       │  LIHAT SISWA    │
   │  Hari ini apa?  │       │  Siapa hadir?   │
   └────────┬────────┘       └────────┬────────┘
            │                         │
            ▼                         ▼
   ┌─────────────────┐       ┌─────────────────┐
   │  PROSES TAH SIN │       │                 │
   │  1. Setoran     │──────►│  INPUT PRESENSI │
   │  2. Nilai       │       │                 │
   │  3. Status      │       └────────┬────────┘
   └────────┬────────┘                │
            │                         │
            ▼                         ▼
   ┌─────────────────┐       ┌─────────────────┐
   │  EVALUASI       │       │  UPDATE TARGET  │
   │  Catatan adab   │       │  Sesuai progres │
   └────────┬────────┘       └────────┬────────┘
            │                         │
            └──────────┬──────────────┘
                       ▼
              ┌────────────────┐
              │  SELESAI SESI  │
              └────────────────┘
```

### G. Matriks Aliran Data Guru → Siswa

| Data | Origin | Frekuensi | Konsumen Utama | Via API |
|------|--------|-----------|----------------|---------|
| Nilai Tajwid | Guru | Per pertemuan | Siswa | `GET /api/setoran` |
| Nilai Makhraj | Guru | Per pertemuan | Siswa | `GET /api/setoran` |
| Nilai Kelancaran | Guru | Per pertemuan | Siswa | `GET /api/setoran` |
| Status (Lanjut/Ulang) | Guru | Per pertemuan | Siswa | `GET /api/setoran` |
| Kehadiran | Guru | Per pertemuan | Siswa | `GET /api/absensi` |
| Catatan Evaluasi | Guru | Periodik | Siswa | `GET /api/evaluasi` |
| Target Tahsin | Guru | Periodik | Siswa | `GET /api/target` |

---

## 4. Ringkasan API Endpoints per Alur

### Admin → All (Manajemen)

| Method | Endpoint | Fungsi | Alur Terkait |
|--------|----------|--------|-------------|
| GET/POST | `/api/kelas` | CRUD Kelas | 1, 2 |
| GET/POST | `/api/santri` | CRUD Santri | 1 |
| GET/POST | `/api/musyrif` | CRUD Guru | 1, 2 |
| GET/POST | `/api/jadwal` | CRUD Jadwal | 1, 2 |
| GET/POST | `/api/sertifikat` | CRUD Sertifikat | 1, 2 |
| GET/POST | `/api/informasi` | CRUD Informasi | 1, 2 |
| GET/PUT | `/api/settings` | Setting Aplikasi | 2 |

### Guru → Database (Input Operasional)

| Method | Endpoint | Fungsi | Alur Terkait |
|--------|----------|--------|-------------|
| GET/POST | `/api/setoran` | Input nilai Tahsin | 1, 2, 3 |
| GET/POST | `/api/absensi` | Input presensi | 1, 2, 3 |
| GET/POST | `/api/evaluasi` | Input evaluasi | 1, 2, 3 |
| GET/PUT | `/api/target` | Update target | 1, 2, 3 |

### Siswa → Database (View-only)

| Method | Endpoint | Fungsi | Alur Terkait |
|--------|----------|--------|-------------|
| GET | `/api/setoran?santuario_id=...` | Lihat nilai | 1, 3 |
| GET | `/api/absensi?santri_id=...` | Lihat presensi | 1, 3 |
| GET | `/api/evaluasi?santri_id=...` | Lihat evaluasi | 1, 3 |
| GET | `/api/target?santri_id=...` | Lihat target | 1, 3 |
| GET | `/api/sertifikat?santri_id=...` | Lihat sertifikat | 1 |
| GET | `/api/jadwal?kelas_id=...` | Lihat jadwal | 1 |
| GET | `/api/informasi` | Lihat informasi | 1 |

---

## 5. Kesimpulan & Rekomendasi

### Karakteristik Alur

| Alur | Sifat | Arah Data | Kompleksitas |
|------|-------|-----------|-------------|
| Admin ↔ Guru ↔ Siswa | Manajerial-operasional | Tri-directional | Tinggi |
| Guru ↔ Admin | Manajerial-pelaporan | Bi-directional | Sedang |
| Guru ↔ Siswa | Pembelajaran | Uni-directional (G→S) & Feedback loop | Sedang |

### Observasi

1. **Admin sebagai single source of truth** untuk master data (kelas, guru, siswa, jadwal)
2. **Guru sebagai data producer** untuk data operasional (setoran, presensi, evaluasi, target)
3. **Siswa sebagai data consumer** (read-only untuk semua data akademik)
4. **Sertifikat memiliki approval flow** unik: Guru input → Admin review/publish → Semua view
5. **Tidak ada interaksi langsung Siswa → Guru** dalam sistem (hanya melalui data tersimpan)
6. **Audit log** mencatat semua perubahan oleh Admin untuk traceability

### Rekomendasi

- Implementasi **real-time notification** untuk Guru saat Admin publish sertifikat/informasi
- Notifikasi untuk Siswa saat Guru input nilai baru atau update status
- Dashboard perbandingkan input Guru vs target/SKK untuk monitoring kualitas
