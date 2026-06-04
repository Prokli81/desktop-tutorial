# MyFitClub: этап 2 — Firebase (облачный вход)

Пошаговая инструкция для настоящих аккаунтов: один email и пароль работают
на телефоне, компьютере и по ссылке GitHub Pages.

## Что даёт этап 2

| Локальный режим (сейчас) | Firebase (после настройки) |
|--------------------------|----------------------------|
| Пароль только в браузере | Пароль хранит Firebase |
| Другой браузер = новый аккаунт | Один аккаунт везде |
| Демо `anna@myfitclub.demo` | Свои email пользователей |

Чаты и расписание пока остаются в браузере (этап 3 — Firestore).

---

## Шаг 1. Создать проект Firebase

1. Откройте https://console.firebase.google.com/
2. **Add project** → имя, например `myfitclub`
3. Google Analytics можно отключить для прототипа
4. Дождитесь создания проекта

## Шаг 2. Включить вход по email

1. В проекте: **Build → Authentication**
2. **Get started**
3. Вкладка **Sign-in method**
4. **Email/Password** → включить → **Save**

## Шаг 3. Создать веб-приложение

1. Настройки проекта (шестерёнка) → **Project settings**
2. Прокрутите до **Your apps** → иконка **Web** `</>`
3. Имя приложения: `MyFitClub Web`
4. Скопируйте блок `firebaseConfig` (apiKey, projectId и т.д.)

## Шаг 4. Включить Firestore (для профилей)

1. **Build → Firestore Database**
2. **Create database**
3. Режим **Start in test mode** (для прототипа, на 30 дней)
4. Регион — ближайший к вам (например `europe-west`)

Позже замените правила на более строгие (шаг 6).

## Шаг 5. Вставить ключи в проект

На компьютере или в GitHub (редактирование файла):

1. Откройте `MyFitClub/firebase-config.example.js`
2. Скопируйте как `MyFitClub/firebase-config.js` (если ещё не создан)
3. Вставьте свои значения из Firebase Console
4. Установите `enabled: true`

Пример:

```javascript
window.MYFITCLUB_FIREBASE_CONFIG = {
  enabled: true,
  apiKey: "AIza...",
  authDomain: "myfitclub-xxxxx.firebaseapp.com",
  projectId: "myfitclub-xxxxx",
  storageBucket: "myfitclub-xxxxx.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef",
};
```

5. Закоммитьте и запушьте в `main` (или дождитесь деплоя GitHub Pages)

## Шаг 6. Правила Firestore (рекомендуется)

В **Firestore → Rules** вставьте:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null;
      allow create, update: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

Нажмите **Publish**.

## Шаг 7. Проверка

1. Откройте сайт: https://prokli81.github.io/desktop-tutorial/
2. В профиле бейдж должен стать **Firebase → включено**
3. **Регистрация** с кодом `CLIENT2026` и своим email
4. Выйдите и войдите с тем же email на другом устройстве

## Частые ошибки

| Проблема | Решение |
|----------|---------|
| «Firebase включён, но подключение не удалось» | Проверьте `apiKey` и `projectId`, `enabled: true` |
| Email уже занят | Используйте вкладку **Вход** |
| Профиль не найден | Зарегистрируйтесь заново с кодом на вкладке **Регистрация** |
| Демо anna@... не работает | В Firebase создайте свой аккаунт; демо только в локальном режиме |

## Следующий этап (3)

Перенести чаты, сообщения и расписание в Firestore, чтобы все участники
видели одну ленту в реальном времени.
