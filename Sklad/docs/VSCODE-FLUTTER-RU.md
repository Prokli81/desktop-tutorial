# Flutter + VS Code для Sklad

**Важно:** Sklad сейчас — **HTML + Capacitor** (APK уже собирается).  
**Flutter** — для **будущей** версии приложения. Сначала ставим инструменты.

---

## Шаг 1 — установить Flutter SDK (один раз)

`C:\Users\Grimm\sklad` → двойной щелчок **`ustanovit-flutter.bat`**

Скрипт:
- скачает Flutter (~1 ГБ)
- распакует в `C:\Users\Grimm\flutter`
- добавит в PATH
- запустит `flutter doctor`

**Закройте и откройте VS Code** после установки.

---

## Шаг 2 — расширения в VS Code

1. Откройте VS Code → папка `C:\Users\Grimm\sklad`
2. **Ctrl+Shift+X** (расширения)
3. Установите:

| Название | ID |
|----------|-----|
| **Flutter** | Dart-Code.flutter |
| **Dart** | Dart-Code.dart-code |

Или при запросе **Install Recommended Extensions** → **Install All**.

4. **Перезапустите VS Code**

---

## Шаг 3 — проверка

**Ctrl+Shift+P** → **Flutter: Run Flutter Doctor**

Должен показать статус (галочки / предупреждения).

Жёлтые предупреждения про Android Studio — **нормально**, Studio у вас уже есть.

---

## Шаг 4 — что дальше

| Сейчас | Flutter позже |
|--------|----------------|
| Sklad APK через `sobrat-apk.bat` | Переписать UI на Flutter |
| VS Code для `app.js`, `index.html` | `flutter create` новый проект |

Когда будете готовы переносить Sklad на Flutter — напишите, начнём новый проект в папке `sklad_flutter`.

---

## Если `ustanovit-flutter.bat` долго качает

Это нормально (~1 ГБ). Не закрывайте окно.

## Если антивирус удалил flutter.bat

Добавьте `C:\Users\Grimm\flutter` в исключения антивируса и запустите bat снова.
