13:13:21.688 Running build in Washington, D.C., USA (East) – iad1
13:13:21.689 Build machine configuration: 2 cores, 8 GB
13:13:21.814 Cloning github.com/sdtqimassyafiigarut-cloud/my_ttahsin_web_app (Branch: main, Commit: 209e833)
13:13:21.815 Previous build caches not available.
13:13:22.037 Cloning completed: 222.000ms
13:13:22.313 Running "vercel build"
13:13:22.332 Vercel CLI 54.12.2
13:13:22.643 Installing dependencies...
13:13:31.761 npm warn deprecated next@14.2.3: This version has a security vulnerability. Please upgrade to a patched version. See https://nextjs.org/blog/security-update-2025-12-11 for more details.
13:13:31.840 
13:13:31.841 added 188 packages in 9s
13:13:31.841 
13:13:31.841 31 packages are looking for funding
13:13:31.842   run `npm fund` for details
13:13:31.901 Detected Next.js version: 14.2.3
13:13:31.905 Running "npm run build"
13:13:32.010 
13:13:32.011 > my_ttahsin_web_app@0.1.0 build
13:13:32.012 > next build
13:13:32.012 
13:13:32.590 Attention: Next.js now collects completely anonymous telemetry regarding usage.
13:13:32.591 This information is used to shape Next.js' roadmap and prioritize features.
13:13:32.591 You can learn more, including how to opt-out if you'd not like to participate in this anonymous program, by visiting the following URL:
13:13:32.591 https://nextjs.org/telemetry
13:13:32.591 
13:13:32.645   ▲ Next.js 14.2.3
13:13:32.647   - Experiments (use with caution):
13:13:32.647     · missingSuspenseWithCSRBailout
13:13:32.647 
13:13:32.670    Creating an optimized production build ...
13:13:53.340  ✓ Compiled successfully
13:13:53.342    Linting and checking validity of types ...
13:14:01.664    Collecting page data ...
13:14:03.290    Generating static pages (0/76) ...
13:14:04.652 (node:277) Warning: SECURITY WARNING: The SSL modes 'prefer', 'require', and 'verify-ca' are treated as aliases for 'verify-full'.
13:14:04.652 In the next major version (pg-connection-string v3.0.0 and pg v9.0.0), these modes will adopt standard libpq semantics, which have weaker security guarantees.
13:14:04.653 
13:14:04.653 To prepare for this change:
13:14:04.653 - If you want the current behavior, explicitly use 'sslmode=verify-full'
13:14:04.653 - If you want libpq compatibility now, use 'uselibpqcompat=true&sslmode=require'
13:14:04.654 
13:14:04.654 See https://www.postgresql.org/docs/current/libpq-ssl.html for libpq SSL mode definitions.
13:14:04.655 (Use `node --trace-warnings ...` to show where the warning was created)
13:14:04.656    Generating static pages (19/76) 
13:14:05.932    Generating static pages (38/76) 
13:14:06.126 Error: getaddrinfo ENOTFOUND host
13:14:06.126     at /vercel/path0/node_modules/pg-pool/index.js:45:11
13:14:06.126     at process.processTicksAndRejections (node:internal/process/task_queues:104:5)
13:14:06.126     at async u (/vercel/path0/.next/server/app/api/absensi/[id]/route.js:1:1815)
13:14:06.127     at async l (/vercel/path0/.next/server/app/dashboard/musyrif/informasi/page.js:76:256) {
13:14:06.127   errno: -3008,
13:14:06.127   code: 'ENOTFOUND',
13:14:06.128   syscall: 'getaddrinfo',
13:14:06.128   hostname: 'host',
13:14:06.128   digest: '1694328314'
13:14:06.129 }
13:14:06.129 Error: getaddrinfo ENOTFOUND host
13:14:06.129     at /vercel/path0/node_modules/pg-pool/index.js:45:11
13:14:06.129     at process.processTicksAndRejections (node:internal/process/task_queues:104:5)
13:14:06.130     at async u (/vercel/path0/.next/server/app/api/absensi/[id]/route.js:1:1815)
13:14:06.130     at async l (/vercel/path0/.next/server/app/dashboard/musyrif/informasi/page.js:76:256) {
13:14:06.130   errno: -3008,
13:14:06.131   code: 'ENOTFOUND',
13:14:06.131   syscall: 'getaddrinfo',
13:14:06.131   hostname: 'host',
13:14:06.131   digest: '1694328314'
13:14:06.132 }
13:14:06.132 Error: getaddrinfo ENOTFOUND host
13:14:06.132     at /vercel/path0/node_modules/pg-pool/index.js:45:11
13:14:06.132     at process.processTicksAndRejections (node:internal/process/task_queues:104:5)
13:14:06.133     at async u (/vercel/path0/.next/server/app/api/absensi/[id]/route.js:1:1815)
13:14:06.133     at async l (/vercel/path0/.next/server/app/dashboard/musyrif/informasi/page.js:76:256) {
13:14:06.133   errno: -3008,
13:14:06.134   code: 'ENOTFOUND',
13:14:06.134   syscall: 'getaddrinfo',
13:14:06.134   hostname: 'host',
13:14:06.134   digest: '1694328314'
13:14:06.135 }
13:14:06.156 
13:14:06.157 Error occurred prerendering page "/dashboard/musyrif/informasi". Read more: https://nextjs.org/docs/messages/prerender-error
13:14:06.157 
13:14:06.157 Error: getaddrinfo ENOTFOUND host
13:14:06.157     at /vercel/path0/node_modules/pg-pool/index.js:45:11
13:14:06.158     at process.processTicksAndRejections (node:internal/process/task_queues:104:5)
13:14:06.158     at async u (/vercel/path0/.next/server/app/api/absensi/[id]/route.js:1:1815)
13:14:06.163     at async l (/vercel/path0/.next/server/app/dashboard/musyrif/informasi/page.js:76:256)
13:14:07.270 Error: getaddrinfo ENOTFOUND host
13:14:07.270     at /vercel/path0/node_modules/pg-pool/index.js:45:11
13:14:07.271     at process.processTicksAndRejections (node:internal/process/task_queues:104:5)
13:14:07.271     at async u (/vercel/path0/.next/server/app/api/absensi/[id]/route.js:1:1815)
13:14:07.271     at async l (/vercel/path0/.next/server/app/dashboard/santri/informasi/page.js:76:256) {
13:14:07.271   errno: -3008,
13:14:07.271   code: 'ENOTFOUND',
13:14:07.272   syscall: 'getaddrinfo',
13:14:07.272   hostname: 'host',
13:14:07.272   digest: '32849318'
13:14:07.272 }
13:14:07.272 Error: getaddrinfo ENOTFOUND host
13:14:07.273     at /vercel/path0/node_modules/pg-pool/index.js:45:11
13:14:07.274     at process.processTicksAndRejections (node:internal/process/task_queues:104:5)
13:14:07.274     at async u (/vercel/path0/.next/server/app/api/absensi/[id]/route.js:1:1815)
13:14:07.275     at async l (/vercel/path0/.next/server/app/dashboard/santri/informasi/page.js:76:256) {
13:14:07.275   errno: -3008,
13:14:07.275   code: 'ENOTFOUND',
13:14:07.275   syscall: 'getaddrinfo',
13:14:07.276   hostname: 'host',
13:14:07.276   digest: '32849318'
13:14:07.276 }
13:14:07.276 Error: getaddrinfo ENOTFOUND host
13:14:07.276     at /vercel/path0/node_modules/pg-pool/index.js:45:11
13:14:07.276     at process.processTicksAndRejections (node:internal/process/task_queues:104:5)
13:14:07.277     at async u (/vercel/path0/.next/server/app/api/absensi/[id]/route.js:1:1815)
13:14:07.277     at async l (/vercel/path0/.next/server/app/dashboard/santri/informasi/page.js:76:256) {
13:14:07.277   errno: -3008,
13:14:07.277   code: 'ENOTFOUND',
13:14:07.277   syscall: 'getaddrinfo',
13:14:07.277   hostname: 'host',
13:14:07.278   digest: '32849318'
13:14:07.278 }
13:14:07.282 
13:14:07.282 Error occurred prerendering page "/dashboard/santri/informasi". Read more: https://nextjs.org/docs/messages/prerender-error
13:14:07.282 
13:14:07.283 Error: getaddrinfo ENOTFOUND host
13:14:07.283     at /vercel/path0/node_modules/pg-pool/index.js:45:11
13:14:07.283     at process.processTicksAndRejections (node:internal/process/task_queues:104:5)
13:14:07.283     at async u (/vercel/path0/.next/server/app/api/absensi/[id]/route.js:1:1815)
13:14:07.284     at async l (/vercel/path0/.next/server/app/dashboard/santri/informasi/page.js:76:256)
13:14:07.675    Generating static pages (57/76) 
13:14:09.369  ✓ Generating static pages (76/76)
13:14:09.408 
13:14:09.408 > Export encountered errors on following paths:
13:14:09.415 	/dashboard/musyrif/informasi/page: /dashboard/musyrif/informasi
13:14:09.415 	/dashboard/santri/informasi/page: /dashboard/santri/informasi
13:14:09.479 Error: Command "npm run build" exited with 1

