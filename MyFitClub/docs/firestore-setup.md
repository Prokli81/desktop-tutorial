# MyFitClub: этап 3 — Firestore (общие чаты)

После настройки Firebase Auth чаты, расписание и записи синхронизируются
в облаке. Сообщения видят **все** участники клуба.

## Что нужно в Firebase

### 1. База Firestore

Если ещё не создана:

1. **Build → Firestore Database → Create database**
2. **Test mode** (для прототипа)
3. Регион → **europe-west** (или ближайший)

### 2. Правила безопасности

**Firestore → Rules → Publish:**

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null;
      allow create, update: if request.auth != null && request.auth.uid == userId;
    }
    match /meta/{doc} {
      allow read, write: if request.auth != null;
    }
    match /chats/{chatId} {
      allow read, create, update: if request.auth != null;
    }
    match /messages/{messageId} {
      allow read, create: if request.auth != null;
    }
    match /scheduleEvents/{eventId} {
      allow read, create, update: if request.auth != null;
    }
    match /bookings/{bookingId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null
        && request.resource.data.userId == request.auth.uid;
      allow delete: if request.auth != null
        && resource.data.userId == request.auth.uid;
    }
    match /notifications/{notificationId} {
      allow read, create, update: if request.auth != null;
    }
    match /invitationCodes/{codeId} {
      allow read, create, update: if request.auth != null;
    }
  }
}
```

### 3. Индекс для сообщений (если попросит)

При первом открытии чата Firebase может показать ссылку на создание индекса.
Нажмите ссылку и подтвердите — это нормально.

## Как проверить

1. Войдите на https://prokli81.github.io/desktop-tutorial/ с **своим** email
2. **Профиль** → бейджи **Firebase** и **Firestore**
3. Откройте **Чат** → напишите сообщение
4. Откройте сайт на **другом телефоне** под тем же email → сообщение видно

## Первый запуск

При первом входе приложение само заполняет Firestore демо-данными
(чаты, расписание, уведомления, коды приглашения).

## Что осталось на будущее

- Push-уведомления (Firebase Cloud Messaging)
- Упаковка PWA в магазины приложений
- Строгие правила Firestore для production
