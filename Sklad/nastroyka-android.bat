@echo off
chcp 65001 >nul
cd /d "%~dp0"
title Sklad - nastroyka Android
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0nastroyka-android.ps1"
pause
