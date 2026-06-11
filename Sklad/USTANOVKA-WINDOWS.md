# Sklad на Windows — папка `C:\Users\Grimm\sklad`

## 1. Скопировать файлы (один раз)

Откройте **PowerShell** и выполните по очереди:

```powershell
New-Item -ItemType Directory -Force -Path C:\Users\Grimm\sklad
cd $HOME
git clone https://github.com/Prokli81/desktop-tutorial.git sklad-temp
Copy-Item -Path "$HOME\sklad-temp\Sklad\*" -Destination C:\Users\Grimm\sklad -Recurse -Force
```

Если `git` не установлен: скачайте ZIP с https://github.com/Prokli81/desktop-tutorial , распакуйте и скопируйте **содержимое** папки `Sklad` в `C:\Users\Grimm\sklad`.

В `C:\Users\Grimm\sklad` должны быть файлы: `index.html`, `app.js`, `start-windows.bat`.

## 2. Установить Python (если пишет «Python was not found»)

**Способ А — сайт (проще всего)**

1. Откройте https://www.python.org/downloads/
2. **Download Python 3.12** (или новее)
3. При установке **обязательно** включите галочку **«Add python.exe to PATH»**
4. **Install Now**
5. **Закройте PowerShell и откройте заново**

Проверка:

```powershell
python --version
```

**Способ Б — одна команда (Windows 10/11)**

```powershell
winget install Python.Python.3.12
```

После установки закройте и снова откройте PowerShell.

**Быстрая проверка перед установкой:**

```powershell
py -m http.server 4174
```

Если `py` сработал — Python уже есть, просто команда `python` не в PATH.

## 3. Запуск каждый раз

**Способ А — двойной щелчок**

Откройте в проводнике `C:\Users\Grimm\sklad` → запустите **`start-windows.bat`**.

**Способ Б — PowerShell**

```powershell
cd C:\Users\Grimm\sklad
python -m http.server 4174
```

Окно **не закрывайте**.

## 4. Открыть в браузере

```
http://localhost:4174
```

- **ПК (офис)** — накладные, подтверждение  
- **Телефон (склад)** — на телефоне в той же Wi‑Fi: `http://IP-ВАШЕГО-ПК:4174`

## MyFitClub

Отдельное приложение. Для Sklad нужна только папка `C:\Users\Grimm\sklad`.
