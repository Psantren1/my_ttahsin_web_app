14:02:08.733 Running build in Washington, D.C., USA (East) – iad1
14:02:08.733 Build machine configuration: 2 cores, 8 GB
14:02:08.747 Cloning github.com/sdtqimassyafiigarut-cloud/my_ttahsin_web_app (Branch: main, Commit: c39a0a5)
14:02:08.748 Skipping build cache, deployment was triggered without cache.
14:02:09.086 Cloning completed: 339.000ms
14:02:09.738 Running "vercel build"
14:02:09.761 Vercel CLI 54.12.2
14:02:10.128 Installing dependencies...
14:02:20.568 npm warn deprecated next@14.2.3: This version has a security vulnerability. Please upgrade to a patched version. See https://nextjs.org/blog/security-update-2025-12-11 for more details.
14:02:20.671 
14:02:20.671 added 188 packages in 10s
14:02:20.672 
14:02:20.672 31 packages are looking for funding
14:02:20.672   run `npm fund` for details
14:02:20.728 Detected Next.js version: 14.2.3
14:02:20.732 Running "npm run build"
14:02:20.853 
14:02:20.853 > my_ttahsin_web_app@0.1.0 build
14:02:20.854 > next build
14:02:20.854 
14:02:21.389 Attention: Next.js now collects completely anonymous telemetry regarding usage.
14:02:21.390 This information is used to shape Next.js' roadmap and prioritize features.
14:02:21.390 You can learn more, including how to opt-out if you'd not like to participate in this anonymous program, by visiting the following URL:
14:02:21.390 https://nextjs.org/telemetry
14:02:21.390 
14:02:21.443   ▲ Next.js 14.2.3
14:02:21.444   - Experiments (use with caution):
14:02:21.444     · missingSuspenseWithCSRBailout
14:02:21.444 
14:02:21.470    Creating an optimized production build ...
14:02:41.228  ✓ Compiled successfully
14:02:41.229    Linting and checking validity of types ...
14:02:49.831    Collecting page data ...
14:02:51.405    Generating static pages (0/76) ...
14:02:52.936 (node:285) Warning: SECURITY WARNING: The SSL modes 'prefer', 'require', and 'verify-ca' are treated as aliases for 'verify-full'.
14:02:52.938 In the next major version (pg-connection-string v3.0.0 and pg v9.0.0), these modes will adopt standard libpq semantics, which have weaker security guarantees.
14:02:52.938 
14:02:52.939 To prepare for this change:
14:02:52.939 - If you want the current behavior, explicitly use 'sslmode=verify-full'
14:02:52.939 - If you want libpq compatibility now, use 'uselibpqcompat=true&sslmode=require'
14:02:52.940 
14:02:52.941 See https://www.postgresql.org/docs/current/libpq-ssl.html for libpq SSL mode definitions.
14:02:52.941 (Use `node --trace-warnings ...` to show where the warning was created)
14:02:55.216    Generating static pages (19/76) 
14:02:57.394    Generating static pages (38/76) 
14:02:58.303    Generating static pages (57/76) 
14:03:00.027  ✓ Generating static pages (76/76)
14:03:00.073    Finalizing page optimization ...
14:03:00.074    Collecting build traces ...
14:03:00.836 
14:03:00.845 Route (app)                              Size     First Load JS
14:03:00.846 ┌ ○ /                                    184 B          87.5 kB
14:03:00.846 ├ ○ /_not-found                          876 B          88.2 kB
14:03:00.847 ├ ○ /absensi                             184 B          87.5 kB
14:03:00.851 ├ ƒ /api/absensi                         0 B                0 B
14:03:00.851 ├ ƒ /api/absensi/[id]                    0 B                0 B
14:03:00.852 ├ ƒ /api/auth/login                      0 B                0 B
14:03:00.852 ├ ƒ /api/auth/me                         0 B                0 B
14:03:00.852 ├ ƒ /api/auth/register                   0 B                0 B
14:03:00.852 ├ ƒ /api/btq-lanjutan                    0 B                0 B
14:03:00.852 ├ ƒ /api/btq-lanjutan/[id]               0 B                0 B
14:03:00.852 ├ ƒ /api/btq-pemula                      0 B                0 B
14:03:00.852 ├ ƒ /api/btq-pemula/[id]                 0 B                0 B
14:03:00.852 ├ ƒ /api/evaluasi                        0 B                0 B
14:03:00.853 ├ ƒ /api/evaluasi/[id]                   0 B                0 B
14:03:00.853 ├ ƒ /api/informasi                       0 B                0 B
14:03:00.853 ├ ƒ /api/informasi/[id]                  0 B                0 B
14:03:00.853 ├ ƒ /api/jadwal                          0 B                0 B
14:03:00.853 ├ ƒ /api/jadwal/[id]                     0 B                0 B
14:03:00.853 ├ ƒ /api/kelas                           0 B                0 B
14:03:00.853 ├ ƒ /api/kelas/[id]                      0 B                0 B
14:03:00.854 ├ ƒ /api/kelas/bulk-reassign             0 B                0 B
14:03:00.854 ├ ƒ /api/murojaah                        0 B                0 B
14:03:00.854 ├ ƒ /api/murojaah/[id]                   0 B                0 B
14:03:00.854 ├ ƒ /api/musyrif                         0 B                0 B
14:03:00.854 ├ ƒ /api/musyrif/[id]                    0 B                0 B
14:03:00.854 ├ ƒ /api/santri                          0 B                0 B
14:03:00.854 ├ ƒ /api/santri/[id]                     0 B                0 B
14:03:00.855 ├ ƒ /api/sertifikat                      0 B                0 B
14:03:00.855 ├ ƒ /api/sertifikat/[id]                 0 B                0 B
14:03:00.855 ├ ƒ /api/setoran                         0 B                0 B
14:03:00.855 ├ ƒ /api/setoran/[id]                    0 B                0 B
14:03:00.855 ├ ƒ /api/settings                        0 B                0 B
14:03:00.855 ├ ƒ /api/tahfidz                         0 B                0 B
14:03:00.856 ├ ƒ /api/tahfidz/[id]                    0 B                0 B
14:03:00.856 ├ ƒ /api/target                          0 B                0 B
14:03:00.856 ├ ƒ /api/target/[id]                     0 B                0 B
14:03:00.856 ├ ƒ /api/zoom-meetings                   0 B                0 B
14:03:00.856 ├ ƒ /api/zoom-meetings/[id]              0 B                0 B
14:03:00.856 ├ ○ /dashboard/admin                     6.09 kB         114 kB
14:03:00.856 ├ ○ /dashboard/admin/btq-lanjutan        5.12 kB         103 kB
14:03:00.857 ├ ○ /dashboard/admin/btq-pemula          4.92 kB         103 kB
14:03:00.857 ├ ○ /dashboard/admin/hafalan             5.15 kB         103 kB
14:03:00.857 ├ ○ /dashboard/admin/informasi           5.91 kB         104 kB
14:03:00.857 ├ ○ /dashboard/admin/jadwal              4.84 kB         103 kB
14:03:00.857 ├ ○ /dashboard/admin/kehadiran           3.76 kB        91.1 kB
14:03:00.857 ├ ○ /dashboard/admin/kelas               4.93 kB         103 kB
14:03:00.857 ├ ○ /dashboard/admin/murojaah            5.14 kB         103 kB
14:03:00.857 ├ ○ /dashboard/admin/musyrif             7.31 kB         105 kB
14:03:00.858 ├ ○ /dashboard/admin/naik-kelas          4.37 kB         102 kB
14:03:00.858 ├ ○ /dashboard/admin/nilai               2.52 kB        96.6 kB
14:03:00.858 ├ ○ /dashboard/admin/santri              6.71 kB          94 kB
14:03:00.858 ├ ○ /dashboard/admin/sertifikat          6.04 kB         107 kB
14:03:00.858 ├ ○ /dashboard/admin/settings            4.43 kB         103 kB
14:03:00.858 ├ ○ /dashboard/admin/tahfidz             5.17 kB         103 kB
14:03:00.858 ├ ○ /dashboard/musyrif                   3.72 kB         111 kB
14:03:00.858 ├ ○ /dashboard/musyrif/dashboard         2.43 kB        96.5 kB
14:03:00.859 ├ ○ /dashboard/musyrif/evaluasi          2.87 kB         104 kB
14:03:00.859 ├ ƒ /dashboard/musyrif/informasi         184 B          87.5 kB
14:03:00.859 ├ ƒ /dashboard/musyrif/jadwal            184 B          87.5 kB
14:03:00.859 ├ ○ /dashboard/musyrif/nilai             4.52 kB         103 kB
14:03:00.859 ├ ○ /dashboard/musyrif/presensi          6.24 kB         104 kB
14:03:00.859 ├ ƒ /dashboard/musyrif/profil            180 B          94.3 kB
14:03:00.859 ├ ○ /dashboard/musyrif/sertifikat        6.94 kB         105 kB
14:03:00.859 ├ ○ /dashboard/musyrif/setoran           7.2 kB          105 kB
14:03:00.859 ├ ○ /dashboard/musyrif/status            2.71 kB         101 kB
14:03:00.860 ├ ○ /dashboard/musyrif/target            6.44 kB         105 kB
14:03:00.860 ├ ○ /dashboard/musyrif/virtual-class     4.14 kB         105 kB
14:03:00.860 ├ ○ /dashboard/santri                    3.9 kB          111 kB
14:03:00.860 ├ ○ /dashboard/santri/evaluasi           1.14 kB         102 kB
14:03:00.860 ├ ƒ /dashboard/santri/informasi          184 B          87.5 kB
14:03:00.860 ├ ƒ /dashboard/santri/jadwal             184 B          87.5 kB
14:03:00.860 ├ ○ /dashboard/santri/nilai              3.76 kB        91.1 kB
14:03:00.861 ├ ○ /dashboard/santri/presensi           5.53 kB         104 kB
14:03:00.861 ├ ƒ /dashboard/santri/profil             180 B          94.3 kB
14:03:00.861 ├ ○ /dashboard/santri/sertifikat         6.31 kB         104 kB
14:03:00.861 ├ ○ /dashboard/santri/setoran            4.71 kB         103 kB
14:03:00.861 ├ ○ /dashboard/santri/target             2.84 kB        90.2 kB
14:03:00.861 ├ ○ /dashboard/santri/virtual-class      3.45 kB         104 kB
14:03:00.862 ├ ○ /dashboard/santri/zoom               517 B          87.8 kB
14:03:00.862 ├ ○ /evaluasi                            184 B          87.5 kB
14:03:00.862 ├ ○ /forgot-password                     184 B          87.5 kB
14:03:00.862 ├ ○ /hafalan                             184 B          87.5 kB
14:03:00.862 ├ ○ /jadwal                              184 B          87.5 kB
14:03:00.862 ├ ○ /login                               5.71 kB         104 kB
14:03:00.862 ├ ○ /raport                              184 B          87.5 kB
14:03:00.862 ├ ○ /register                            4.49 kB        98.6 kB
14:03:00.863 ├ ○ /sertifikat                          184 B          87.5 kB
14:03:00.863 ├ ○ /target                              184 B          87.5 kB
14:03:00.863 └ ○ /zoom                                184 B          87.5 kB
14:03:00.863 + First Load JS shared by all            87.3 kB
14:03:00.863   ├ chunks/7023-c87e2433b8a40f08.js      31.5 kB
14:03:00.863   ├ chunks/fd9d1056-b45be6a5ff4c1ab1.js  53.6 kB
14:03:00.863   └ other shared chunks (total)          2.23 kB
14:03:00.864 
14:03:00.864 
14:03:00.864 ƒ Middleware                             28.4 kB
14:03:00.875 
14:03:00.875 ○  (Static)   prerendered as static content
14:03:00.875 ƒ  (Dynamic)  server-rendered on demand
14:03:00.875 
14:03:01.169 Traced Next.js server files in: 54.783ms
14:03:01.541 Created all serverless functions in: 371.739ms
14:03:01.607 Collected static files (public/, static/, .next/static): 12ms
14:03:01.776 Build Completed in /vercel/output [52s]
14:03:02.048 Deploying outputs...
14:03:09.986 Deployment completed
14:03:10.104 Creating build cache...
14:03:21.065 Created build cache: 11s
14:03:21.065 Uploading build cache [140.54 MB]
14:03:22.974 Build cache uploaded: 1.909s