# MyFitClub: полная настройка (чтобы всё работало)

Если что-то не открывается — идите по шагам **сверху вниз**.

## 0. Сайт уже работает локально

Даже без Firebase можно войти:

- email: `anna@myfitclub.demo`
- пароль: `fitclub`

Ссылка: https://prokli81.github.io/desktop-tutorial/

---

## 1. Проверить ключ Firebase (важно!)

Сейчас в репозитории может быть **неверный apiKey**. Тогда облако
отключится автоматически, но локальный режим останется.

### Как исправить

1. https://console.firebase.google.com/ → проект **myfitclub**
2. **Настройки проекта** (шестерёнка) → **Ваши приложения** → Web
3. Скопируйте блок `firebaseConfig` **целиком**
4. GitHub → `MyFitClub/firebase-config.js` → вставьте значения:

```javascript
window.MYFITCLUB_FIREBASE_CONFIG = {
  enabled: true,
  apiKey: "СКОПИРОВАТЬ",
  authDomain: "СКОПИРОВАТЬ",
  projectId: "СКОПИРОВАТЬ",
  storageBucket: "СКОПИРОВАТЬ",
  messagingSenderId: "СКОПИРОВАТЬ",
  vapidKey: "",
  appId: "СКОПИРОВАТЬ",
};
```

5. То же значение `apiKey` вставьте в `MyFitClub/firebase-config-sw.js`
6. **Commit** → подождите 2 минуты → обновите сайт

На экране входа должно исчезнуть предупреждение о неверном ключе.

---

## 2. Authentication

1. Firebase → **Authentication** → **Начать**
2. **Email/Password** → **Включить**

---

## 3. Firestore

1. Firebase → **Firestore Database** → **Создать**
2. **Тестовый режим** → регион Europe
3. **Rules** → вставьте содержимое файла `firestore.rules` из репозитория
4. **Опубликовать**

---

## 4. Регистрация на сайте

1. Откройте сайт → **Регистрация**
2. Свой email, пароль (6+ символов), код `CLIENT2026`
3. **Профиль** → бейджи **Firebase** и **Firestore**

---

## 5. Push-уведомления (по желанию)

1. Firebase → **Cloud Messaging** → **Web Push** → скопировать ключ
2. Вставить в `vapidKey` в `firebase-config.js`
3. Деплой Cloud Function — см. `docs/fcm-setup.md`

---

## 6. GitHub Secrets (удобный способ)

В репозитории: **Settings → Secrets → Actions** → добавить:

| Secret | Значение |
|--------|----------|
| `FIREBASE_API_KEY` | из firebaseConfig |
| `FIREBASE_PROJECT_ID` | myfitclub-4d1b8 |
| `FIREBASE_APP_ID` | из firebaseConfig |
| `FIREBASE_AUTH_DOMAIN` | опционально |
| `FIREBASE_VAPID_KEY` | опционально |

При следующем деплое `firebase-config.js` обновится автоматически.

---

## Быстрая проверка

| Проверка | Ожидание |
|----------|----------|
| Локальный вход anna@... | Главная открывается |
| Регистрация с кодом | Профиль: Firebase |
| Сообщение в чат с 2 телефонов | Видно обоим |
| Профиль → Firestore | Бейдж Firestore |
