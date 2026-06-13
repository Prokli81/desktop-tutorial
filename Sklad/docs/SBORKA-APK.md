# Sklad — сборка APK на Windows

APK = обычное приложение Android. Ставится файлом, **без Chrome и без cloudflared**.  
Камера в приложении работает (внутри — защищённый контекст `https://localhost`).

---

## Что установить на ПК (один раз)

| Программа | Зачем | Ссылка |
|-----------|--------|--------|
| **Node.js** LTS | Сборка | https://nodejs.org/ |
| **Android Studio** | Компиляция APK | https://developer.android.com/studio |

При установке Android Studio включите **Android SDK** (по умолчанию).

---

## Шаг 1 — подготовка проекта

PowerShell:

```powershell
cd C:\Users\Grimm\sklad
npm install
npx cap add android
npx cap sync android
```

Первый раз создастся папка `android\`.

---

## Шаг 2 — разрешение камеры

Откройте файл (Блокнот или Android Studio):

`android\app\src\main\AndroidManifest.xml`

Перед тегом `<application` добавьте (если нет):

```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-feature android:name="android.hardware.camera" android:required="false" />
```

Сохраните.

Снова:

```powershell
npx cap sync android
```

---

## Шаг 3 — собрать APK

**Способ А — Android Studio (проще)**

```powershell
npx cap open android
```

В Android Studio:

1. Дождитесь **Gradle Sync** (внизу)
2. Меню **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**
3. Когда готово — **locate** → файл **`app-debug.apk`**

**Способ Б — командная строка**

```powershell
cd C:\Users\Grimm\sklad\android
.\gradlew.bat assembleDebug
```

APK: `android\app\build\outputs\apk\debug\app-debug.apk`

---

## Шаг 4 — установить на телефон

1. Скопируйте `app-debug.apk` на телефон (USB, Telegram, почта)
2. На Android разрешите **установку из неизвестных источников** для этого файла
3. Откройте APK → **Установить**
4. Запустите **Sklad** с иконки

При первом запуске разрешите **камеру**.

---

## ПК и телефон вместе

| Устройство | Как открывать |
|------------|----------------|
| **Телефон** | Приложение Sklad (APK) |
| **ПК** | `http://localhost:4174` → ПК (офис) |

Чтобы данные совпадали на телефоне и ПК — включите **облако** в `firebase-config.js` (отдельный проект Firebase для Sklad). Иначе у APK и браузера на ПК **разные** локальные базы.

---

## Обновление приложения

После изменений в коде:

```powershell
cd C:\Users\Grimm\sklad
npx cap sync android
```

Снова **Build APK** в Android Studio → установите новый APK на телефон.

---

## Автозапуск подготовки

Двойной щелчок **`podgotovka-apk.bat`** — `npm install` и `cap sync` (если android уже есть).
