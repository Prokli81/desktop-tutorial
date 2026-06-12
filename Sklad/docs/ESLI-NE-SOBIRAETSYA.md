# Не получается собрать APK — что делать

Я **не могу зайти в ваш Android Studio** с облака. Но сборка **без меню Studio** — одним файлом.

---

## Способ 1 — только этот (рекомендуется)

1. Закройте Android Studio (можно не трогать вообще)
2. Проводник → `C:\Users\Grimm\sklad`
3. Двойной щелчок **`sobrat-apk.bat`**
4. Ждите до 20 минут, не закрывайте чёрное окно
5. Если **APK ГОТОВО** — файл `app-debug.apk` откроется сам

---

## Если sobrat-apk.bat пишет ошибку

### «Node.js не установлен»
https://nodejs.org/ → LTS → Install → новый PowerShell → снова `sobrat-apk.bat`

### «Android SDK не найден»
1. Откройте Android Studio **один раз**
2. **File** → **Settings** (или **Ctrl+Alt+S**)
3. **Languages & Frameworks** → **Android SDK**
4. Вкладка **SDK Platforms** → галочка **Android 14.0 (API 34)**
5. Вкладка **SDK Tools** → **Android SDK Build-Tools**, **Platform-Tools**
6. **Apply** → дождитесь загрузки → **OK**
7. Закройте Studio → снова **`sobrat-apk.bat`**

### «Java не найдена»
Откройте Android Studio один раз (она ставит Java сама), потом снова bat-файл.

---

## Способ 2 — через Studio (если bat не помог)

1. **File** → **Settings** → **Build, Execution, Deployment** → **Build Tools** → **Gradle**
2. **Gradle JDK** → выберите **jbr-17** или **Embedded JDK**
3. **OK**
4. **File** → **Sync Project with Gradle Files** (иконка слона с синей стрелкой)
5. Дождитесь окончания
6. **Build** → **Build APK(s)**

---

## Частая причина «не собирается»

Не хватает **`node_modules`** — папка создаётся только после `npm install` в `C:\Users\Grimm\sklad`.  
Файл **`sobrat-apk.bat`** делает это сам.

---

## После APK

Скопируйте на телефон → установите → иконка **Sklad** → разрешите камеру.

На ПК: `python -m http.server 4174` → http://localhost:4174 → **ПК (офис)**
