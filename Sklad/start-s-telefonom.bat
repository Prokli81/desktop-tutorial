@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo ========================================
echo   SKLAD - zapusk + ssylka dlya telefona
echo ========================================
echo.

for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do (
    set "IP=%%a"
    goto :found
)
:found
set IP=%IP: =%

if "%IP%"=="" (
    echo Ne nayden IPv4. Vypolnite: ipconfig
) else (
    echo Na telefone v Chrome otkroyte:
    echo.
    echo    http://%IP%:4174
    echo.
    echo Vyberite: Telefon ^(sklad^)
    echo Telefon i PK dolzhny byt v odnoj Wi-Fi.
    echo.
)

echo PK v brauzere: http://localhost:4174
echo Vyberite: PK ^(ofis^)
echo.
echo Ne zakryvayte eto okno!
echo.

py -m http.server 4174 2>nul || python -m http.server 4174
