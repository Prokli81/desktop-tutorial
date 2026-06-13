# ▶ НАЧНИ ЗДЕСЬ — только VS Code

Всё делаем **в VS Code**. Другие программы — только то, что VS Code попросит установить.

---

## Один раз (настройка)

### 1. Открой проект

Двойной щелчок по файлу:

```
C:\Users\Grimm\sklad\sklad.code-workspace
```

Слева две папки:
- **Sklad — Flutter** → приложение на телефон (камера)
- **Sklad — веб** → подтверждение на ПК

### 2. Расширения

VS Code спросит **Install Recommended** → нажми **Install All**.

Нужны: **Flutter**, **Dart**, **Russian Language Pack**.

Перезапусти VS Code.

### 3. Flutter (один раз)

В VS Code: **Ctrl+`** (терминал внизу) → вставь:

```powershell
cd C:\Users\Grimm\sklad
.\ustanovit-flutter.bat
```

Жди до конца (~1 ГБ). Закрой терминал, открой VS Code заново.

### 4. Проверка

**Ctrl+Shift+P** → напиши `flutter doctor` → **Flutter: Run Flutter Doctor**

Жёлтые предупреждения — нормально. Красные — скрин сюда в чат.

---

## Каждый день — 2 кнопки

### Телефон (скан этикеток)

1. Подключи Android по USB (на телефоне разреши **отладку по USB**)
2. **F5** в VS Code  
   Или: **Ctrl+Shift+P** → **Tasks: Run Task** → **📱 Flutter: запустить на телефоне**

### ПК (подтверждение накладных)

1. **Ctrl+Shift+P** → **Tasks: Run Task** → **💻 Веб: сервер + браузер**
2. В браузере выбери **ПК (офис)** → **Накладные** → **Подтвердить**

---

## APK без USB (поставить на телефон файлом)

**Ctrl+Shift+P** → **Tasks: Run Task** → **📦 Flutter: собрать APK**

Файл: `sklad_flutter\build\app\outputs\flutter-apk\app-debug.apk`  
→ на телефон → установить.

---

## Где править код

| Что менять | Файл |
|------------|------|
| Экран телефона | `sklad_flutter/lib/screens/home_screen.dart` |
| Логика склада | `sklad_flutter/lib/store.dart` |
| Сайт на ПК | `app.js`, `index.html` |

**Ctrl+S** — сохранить.

---

## Забудь про это (пока)

- Android Studio меню Build — не нужно  
- cloudflared / HTTPS — не нужно (Flutter камера сама)  
- MyFitClub — не трогаем  

---

## Ошибка?

Скрин VS Code (терминал внизу) → пришли в чат.
