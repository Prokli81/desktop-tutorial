# MyFitClub: push-уведомления (FCM)

Настоящие push на телефон, когда приложение закрыто.

## Что уже в коде

- регистрация FCM-токена при включении уведомлений;
- фоновые уведомления в `service-worker.js`;
- Cloud Function `pushOnNewMessage` — отправка при новом сообщении в Firestore.

## Шаг 1. VAPID-ключ в Firebase

1. https://console.firebase.google.com/ → проект **myfitclub**
2. **Настройки проекта** (шестерёнка) → вкладка **Cloud Messaging**
3. Блок **Web Push certificates** → **Generate key pair** (если ключа нет)
4. Скопируйте **Key pair**

## Шаг 2. Вставить ключ в проект

В GitHub отредактируйте `MyFitClub/firebase-config.js`:

```javascript
vapidKey: "ВАШ_КЛЮЧ_ИЗ_FIREBASE",
```

Сохраните в `main`. Подождите деплой GitHub Pages.

## Шаг 3. Включить Cloud Messaging API

В Google Cloud Console для проекта:

1. **APIs & Services → Library**
2. Найдите **Firebase Cloud Messaging API**
3. **Enable**

## Шаг 4. Cloud Function (отправка push)

Нужен план **Blaze** (оплата по факту, для прототипа обычно бесплатно).

На компьютере с Node.js и Firebase CLI:

```bash
npm install -g firebase-tools
firebase login
cd desktop-tutorial
cd functions && npm install && cd ..
firebase deploy --only functions --project myfitclub-4d1b8
```

После деплоя при каждом новом сообщении в Firestore участники получат push.

## Шаг 5. Проверка

1. Откройте сайт на **двух телефонах** (разные аккаунты)
2. На обоих: **Уведомления → Включить уведомления**
3. Сверните приложение на телефоне №2
4. С телефона №1 напишите в **общий чат**
5. На телефоне №2 должно прийти push

## Если push не приходит

| Проблема | Решение |
|----------|---------|
| Нет vapidKey | Заполните в firebase-config.js |
| Только браузерные уведомления | Function не задеплоена — см. шаг 4 |
| Блокировка | Проверьте разрешения сайта в настройках телефона |
| iOS | Push в PWA на iOS ограничены; Android работает лучше |

## Админка (этап 5)

В профиле администратора (`ADMIN2026`):

- **Объявление клуба** — публикация в общий чат;
- **Заблокировать / Разблокировать** пользователя.
