@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo Zapusk: ubrat poddelku Python i poisk nastoyaschego...
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0ubrat-poddelku-python.ps1"
