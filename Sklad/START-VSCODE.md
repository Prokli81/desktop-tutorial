# Sklad — только VS Code

**Открой этот файл в VS Code** (двойной щелчок):

```
C:\Users\Grimm\sklad\sklad.code-workspace
```

Дальше — **только кнопки в VS Code**. Android Studio, bat-файлы и терминал вручную не нужны.

---

## Шаг 1 — один раз

1. VS Code спросит **Install Recommended** → **Install All** (Flutter, Dart, русский язык).
2. Перезапусти VS Code.
3. **Ctrl+Shift+P** → `Tasks: Run Task` → **⚙️ Один раз: установить Flutter**  
   Подожди до конца (~1 ГБ). Перезапусти VS Code.
4. **Ctrl+Shift+P** → `Flutter: Run Flutter Doctor`  
   Красные строки — скрин в чат. Жёлтые — нормально.

---

## Шаг 2 — телефон (скан этикеток)

1. Подключи Android по USB → на телефоне **Разрешить отладку по USB**.
2. Нажми **F5** (или **Ctrl+Shift+P** → `Tasks: Run Task` → **📱 Flutter: запустить на телефоне**).

**Без USB:** `Tasks: Run Task` → **📦 Flutter: собрать APK**  
Файл: `sklad_flutter\build\app\outputs\flutter-apk\app-debug.apk` → скопируй на телефон → установи.

---

## Шаг 3 — ПК (подтверждение накладных)

**Ctrl+Shift+P** → `Tasks: Run Task` → **💻 Веб: сервер + браузер**

В браузере: **ПК (офис)** → **Накладные** → **Подтвердить**.

---

## Ошибка?

Скриншот **нижней панели VS Code** (терминал с текстом ошибки) → в чат.
