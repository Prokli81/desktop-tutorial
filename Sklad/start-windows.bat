@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo Sklad: http://localhost:4174
echo Ne zakryvayte eto okno poka rabotaete.
py -m http.server 4174 2>nul && goto :ok
python -m http.server 4174 2>nul && goto :ok
echo.
echo Python ne ustanovlen.
echo 1) https://www.python.org/downloads/
echo 2) Pri ustanovke: Add python.exe to PATH
echo 3) Perezapustite etot fayl
echo.
pause
exit /b 1
:ok
pause
