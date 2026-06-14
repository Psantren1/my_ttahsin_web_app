@echo off
echo ===================================================
echo   MANAJEMEN AL-QURAN - RESET NEXT.JS CACHE & SERVER
echo ===================================================
echo.
echo 1. Mematikan semua proses Node.js / Next.js...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul

echo 2. Menghapus folder cache .next...
if exist .next (
    rmdir /s /q .next
    echo Cache .next berhasil dibersihkan!
) else (
    echo Cache .next sudah bersih.
)
timeout /t 1 /nobreak >nul

echo 3. Menjalankan kembali server Next.js...
echo.
npm run dev
