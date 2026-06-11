@echo off
cd /d "%~dp0"
echo Sklad: http://localhost:4174
echo Ne zakryvayte eto okno poka rabotaete.
py -m http.server 4174 2>nul || python -m http.server 4174
pause
