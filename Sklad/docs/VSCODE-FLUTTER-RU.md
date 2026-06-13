# Sklad на Flutter + VS Code

Приложение **Sklad** в папке `sklad_flutter/` — камера работает **нативно**, без HTTPS-туннеля.

---

## Установка (один раз на ПК)

### 1. Flutter SDK

`C:\Users\Grimm\sklad` → **`ustanovit-flutter.bat`**

### 2. VS Code

1. Откройте **`sklad.code-workspace`** (двойной щелчок)
2. Установите расширения **Flutter** и **Dart**
3. Перезапустите VS Code

### 3. Android SDK

У вас уже есть Android Studio — достаточно.

**Ctrl+Shift+P** → **Flutter: Run Flutter Doctor**

---

## Работа каждый день в VS Code

| Действие | Как |
|----------|-----|
| Открыть проект | `sklad.code-workspace` |
| Запустить на телефоне | Подключите Android USB → **F5** или `flutter run` |
| Собрать APK | **`sobrat-flutter-apk.bat`** |
| Править код | `sklad_flutter/lib/` |

### Терминал VS Code (**Ctrl+`**)

```powershell
cd sklad_flutter
flutter pub get
flutter run
```

---

## Структура Flutter

```
sklad_flutter/
  lib/
    main.dart          — запуск
    screens/           — экраны
    store.dart         — данные на телефоне
    label_parser.dart  — KOM-204-DUB
  android/             — сборка APK
```

---

## Веб + Flutter вместе

| Версия | Где | Зачем |
|--------|-----|-------|
| **sklad_flutter** | Телефон (APK) | Скан камерой |
| **веб Sklad** | ПК localhost:4174 | Подтверждение накладных |

Синхронизация между ними — следующий этап (Firebase).

---

## Сборка APK без VS Code

`sobrat-flutter-apk.bat` → `app-debug.apk` на телефон.
