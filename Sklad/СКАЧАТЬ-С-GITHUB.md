# Как получить файлы Sklad с GitHub

## Почему в большом ZIP есть MyFitClub?

На GitHub лежит **один репозиторий** с несколькими проектами:
- **MyFitClub** — другое приложение, **к складу не относится**
- **Sklad** — твой склад, **нужна только эта папка**

Если качаешь **Code → Download ZIP** всего репозитория — в архиве будет и MyFitClub.  
**Его можно удалить / не трогать.** Копируй на ПК **только папку `Sklad`**.

---

## Способ 1 — ZIP только Sklad (рекомендую)

Готовый архив **без MyFitClub** собирается на GitHub:

1. Открой: https://github.com/Prokli81/desktop-tutorial/actions/workflows/sklad-zip.yml
2. Выбери сборку с **зелёной галочкой** (самая верхняя).
3. Внизу **Artifacts** → скачай **sklad-project**.
4. Распакуй ZIP.
5. Содержимое скопируй в `C:\Users\Grimm\sklad`  
   (если папка `sklad` уже есть — сначала переименуй её в `sklad_старый`).

Внутри сразу будут `sklad.code-workspace`, `НАЧНИ-ЗДЕСЬ.md` и т.д. — **без MyFitClub**.

---

## Способ 2 — большой ZIP всего репозитория

1. https://github.com/Prokli81/desktop-tutorial/tree/cursor/sklad-warehouse-app-9401
2. **Code** → **Download ZIP**
3. Распакуй
4. **Возьми только папку `Sklad`** — MyFitClub не копируй
5. Переименуй `Sklad` → `sklad` и положи в `C:\Users\Grimm\sklad`

---

## Способ 3 — через VS Code (если git уже настроен)

1. **Ctrl+Shift+P** → **Задачи: выполнить задачу** → **🔄 Обновить с GitHub**

Работает только если папка была клонирована через git, а не просто скопирована из ZIP.

---

## Открыть проект

Двойной щелчок:

```
C:\Users\Grimm\sklad\sklad.code-workspace
```

---

## Проверка

В `C:\Users\Grimm\sklad` должны быть:

| Файл / папка | Нужно |
|--------------|-------|
| `sklad.code-workspace` | ✓ |
| `НАЧНИ-ЗДЕСЬ.md` | ✓ |
| `sklad_flutter\` | ✓ |
| `MyFitClub` | **НЕ должно быть** |

---

## Приложение на телефон (APK)

https://github.com/Prokli81/desktop-tutorial/actions/runs/27464650237  
→ **Artifacts** → **sklad-app-debug** → `app-debug.apk`
