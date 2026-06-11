@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo === Sklad: podgotovka k sborke APK ===
echo.

where npm >nul 2>&1
if errorlevel 1 (
    echo Ustanovite Node.js: https://nodejs.org/
    pause
    exit /b 1
)

echo [1/3] npm install...
call npm install
if errorlevel 1 goto :err

if not exist "android" (
    echo [2/3] npx cap add android...
    call npx cap add android
    if errorlevel 1 goto :err
    echo.
    echo Dobavte v android\app\src\main\AndroidManifest.xml:
    echo   ^<uses-permission android:name="android.permission.CAMERA" /^>
    echo Sm. docs\SBORKA-APK.md
) else (
    echo [2/3] papka android uzhe est
)

echo [3/3] kopirovanie www + cap sync...
call npm run cap:sync
if errorlevel 1 goto :err

echo.
echo Gotovo. Dalnee:
echo   npx cap open android
echo   Build -^> Build APK
echo.
echo Instrukciya: docs\SBORKA-APK.md
pause
exit /b 0

:err
echo Oshibka. Sm. docs\SBORKA-APK.md
pause
exit /b 1
