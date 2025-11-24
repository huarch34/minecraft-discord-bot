@echo off
echo ================================
echo    Discord Bot Launcher
echo ================================
echo.

echo [1/2] Minecraft Bot baslatiliyor...
start "Minecraft Bot" cmd /k node index.js

timeout /t 2 /nobreak >nul

echo [2/2] Ticket Bot baslatiliyor...
start "Ticket Bot" cmd /k node ticketbot.js

timeout /t 3 /nobreak >nul

echo [3/3] Basvuru Bot baslatiliyor...
start "Basvuru Bot" cmd /k node basvuru.js

timeout /t 4 /nobreak >nul

echo [4/4] Basvuru Bot baslatiliyor...
start "Cekilis Bot" cmd /k node cekilisbot.js


echo.
echo ================================
echo   Tum botlar baslatildi!
echo ================================
echo.
echo Her bot ayri bir pencerede calisacak.
echo Kapatmak icin pencereleri kapatabilirsiniz.
echo.
pause