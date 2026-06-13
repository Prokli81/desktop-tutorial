@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo ==========================================
echo   SKLAD - kamera telefona (HTTPS)
echo ==========================================
echo.

if not exist "index.html" (
    echo Oshibka: net index.html v etoj papke.
    pause
    exit /b 1
)

if not exist "cloudflared.exe" (
    echo cloudflared.exe ne nayden v etoj papke.
    echo.
    echo Skachayte:
    echo https://github.com/cloudflare/cloudflared/releases
    echo Fayl: cloudflared-windows-amd64.exe
    echo Perezuite v cloudflared.exe i polozhite syuda:
    echo %~dp0
    echo.
    echo Potom zapustite etot fayl snova.
    pause
    exit /b 1
)

echo [1/2] Zapusk servera Sklad na portu 4174...
start "Sklad Server 4174" cmd /k "cd /d %~dp0 && python -m http.server 4174"

timeout /t 3 /nobreak >nul

echo [2/2] Zapusk HTTPS tunelya dlya kamery telefona...
echo.
echo Skopiruyte ssylku https://....trycloudflare.com nizhe
echo i otkroyte ee v Chrome NA TELEFONE.
echo.
echo PK: http://localhost:4174 - rezhim PK (ofis)
echo.
echo NE ZAKRYVAYTE eto okno!
echo.

cloudflared.exe tunnel --url http://127.0.0.1:4174

pause
