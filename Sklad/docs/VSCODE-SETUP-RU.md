# VS Code для Sklad

Настройки уже в папке `.vscode/`. Откройте **только Sklad**, не весь репозиторий с MyFitClub.

---

## Шаг 1 — открыть проект

1. **VS Code** → **File** → **Open Folder** (Файл → Открыть папку)
2. Выберите:

```
C:\Users\Grimm\sklad
```

3. **Select Folder**

Или двойной щелчок по файлу **`sklad.code-workspace`** в этой папке.

---

## Шаг 2 — расширения (один раз)

VS Code спросит: **Install Recommended Extensions?** → **Install All**

Или вручную (**Ctrl+Shift+X**):

| Расширение | Зачем |
|------------|--------|
| **Russian Language Pack** | Меню на русском |
| **Python** | Сервер `python -m http.server` |
| **Live Server** | Альтернатива серверу (порт 4174) |

Перезапустите VS Code после русского языка.

---

## Шаг 3 — запустить Sklad (каждый день)

**Ctrl+Shift+P** → введите **`Tasks: Run Task`** → Enter

Выберите:

| Задача | Что делает |
|--------|------------|
| **Sklad: сервер + браузер** | Запуск и открытие http://localhost:4174 |
| **Sklad: запустить сервер (порт 4174)** | Только сервер |
| **Sklad: собрать APK** | `sobrat-apk.bat` без Android Studio |

Терминал внизу — **не закрывайте**, пока работаете.

---

## Шаг 4 — править код

Слева в проводнике:

| Файл | Что это |
|------|---------|
| `index.html` | Страницы |
| `app.js` | Логика |
| `styles.css` | Внешний вид |
| `data-store.js` | База данных |
| `docs/` | Инструкции |

Сохранить: **Ctrl+S**. Обновить браузер: **F5**.

---

## Горячие клавиши

| Действие | Клавиши |
|----------|---------|
| Командная палитра | **Ctrl+Shift+P** |
| Терминал | **Ctrl+`** |
| Задачи (Tasks) | **Ctrl+Shift+P** → Run Task |
| Поиск по файлам | **Ctrl+P** |

---

## APK из VS Code

**Ctrl+Shift+P** → **Tasks: Run Task** → **Sklad: собрать APK**

Нужны: **Node.js**, **Android SDK** (как для `sobrat-apk.bat`).

---

## MyFitClub

Не открывайте корень `desktop-tutorial` — только **`C:\Users\Grimm\sklad`**.

---

## Если меню на английском

**Ctrl+Shift+P** → **Configure Display Language** → **ru** → перезапуск VS Code.
