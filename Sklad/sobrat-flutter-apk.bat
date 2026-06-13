@echo off
chcp 65001 >nul
cd /d "%~dp0sklad_flutter"
title Sklad Flutter APK

if not exist "pubspec.yaml" (
    echo Net papki sklad_flutter
    pause
    exit /b 1
)

set "FLUTTER_BIN=C:\Users\Grimm\flutter\bin"
if exist "%FLUTTER_BIN%\flutter.bat" (
    set "PATH=%FLUTTER_BIN%;%PATH%"
) else (
    echo Flutter ne nayden. Zapustite ustanovit-flutter.bat
    pause
    exit /b 1
)

echo Sborka Flutter APK...
call flutter pub get
call flutter build apk --debug
if errorlevel 1 goto :err

set "APK=%~dp0sklad_flutter\build\app\outputs\flutter-apk\app-debug.apk"
echo.
echo APK: %APK%
if exist "%APK%" explorer.exe "/select,%APK%"
pause
exit /b 0

:err
echo Oshibka sborki. Sm. VSCODE-FLUTTER-RU.md
pause
exit /b 1
