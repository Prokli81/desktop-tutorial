@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo === Установка Flutter для Sklad ===
echo Подождите, качается ~1 ГБ...
echo.
call "%~dp0ustanovit-flutter.bat"
