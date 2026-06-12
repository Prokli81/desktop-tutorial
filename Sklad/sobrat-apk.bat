@echo off
chcp 65001 >nul
cd /d "%~dp0"
title Sklad - sobrat APK bez menyu Studio
echo.
echo ==========================================
echo   SKLAD - avtomaticheskaya sborka APK
echo   (Android Studio menu ne nuzhen)
echo ==========================================
echo.

:: Java iz Android Studio
if exist "%ProgramFiles%\Android\Android Studio\jbr" (
    set "JAVA_HOME=%ProgramFiles%\Android\Android Studio\jbr"
) else if exist "%LOCALAPPDATA%\Programs\Android\Android Studio\jbr" (
    set "JAVA_HOME=%LOCALAPPDATA%\Programs\Android\Android Studio\jbr"
) else (
    echo [!!] Java ne naydena. Otkroyte Android Studio odin raz.
    echo     Ili ustanovite JDK 17
    pause
    exit /b 1
)
echo [OK] Java: %JAVA_HOME%

:: Android SDK
set "SDK=%LOCALAPPDATA%\Android\Sdk"
if not exist "%SDK%" (
    echo [!!] Android SDK ne nayden: %SDK%
    echo.
    echo Otkroyte Android Studio:
    echo   File -^> Settings -^> Android SDK -^> Apply
    echo Dozhdites zagruzki i zapustite etot fayl snova.
    pause
    exit /b 1
)
echo [OK] SDK: %SDK%
echo sdk.dir=%SDK:\=\\%> android\local.properties

:: Node.js
where node >nul 2>&1
if errorlevel 1 (
    echo [!!] Node.js ne ustanovlen: https://nodejs.org/
    pause
    exit /b 1
)
echo [OK] Node: 
node --version

if not exist "package.json" (
    echo [!!] Net package.json - obnovite papku Sklad
    pause
    exit /b 1
)

if not exist "android\gradlew.bat" (
    echo [!!] Net papki android - zapustite sozdat-papku-android.bat
    pause
    exit /b 1
)

echo.
echo [1/3] npm install (esli nuzhno)...
if not exist "node_modules\@capacitor\android" (
    call npm install
    if errorlevel 1 goto :err
)

echo [2/3] Sinhronizaciya proekta...
call npm run cap:sync
if errorlevel 1 goto :err

echo [3/3] Sborka APK (5-20 min pervyy raz)...
cd android
call gradlew.bat assembleDebug --no-daemon
if errorlevel 1 goto :err

set "APK=%~dp0android\app\build\outputs\apk\debug\app-debug.apk"
echo.
echo ==========================================
echo   APK GOTOVO!
echo   %APK%
echo ==========================================
echo.
echo Skopiruyte app-debug.apk na telefon.
if exist "%APK%" explorer.exe "/select,%APK%"
cd ..
pause
exit /b 0

:err
echo.
echo ==========================================
echo   Oshibka sborki
echo ==========================================
echo.
echo Prishlite skrin etogo okna v chat.
echo.
echo Proverte v Android Studio:
echo   File -^> Settings -^> Android SDK
echo   Ustanovlen: Android 14 (API 34)
echo.
cd /d "%~dp0"
pause
exit /b 1
