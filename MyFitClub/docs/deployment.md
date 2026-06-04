# MyFitClub: публикация онлайн и PWA

Этот документ объясняет, как сделать MyFitClub доступным по обычной ссылке.

## Почему GitHub сам не показывает приложение

GitHub хранит код. Чтобы приложение открывалось в браузере по ссылке, нужен
хостинг. Для статического прототипа подходит GitHub Pages.

## Что уже подготовлено

В проект добавлены:

- `manifest.webmanifest` - описание PWA-приложения;
- `service-worker.js` - кэширование основных файлов;
- `assets/icon.svg` - иконка приложения;
- `.github/workflows/pages.yml` - workflow для публикации папки `MyFitClub/`.

## Какой будет адрес

После включения GitHub Pages и деплоя адрес будет похож на:

```text
https://prokli81.github.io/desktop-tutorial/
```

Точная ссылка появится в GitHub после успешного workflow **Deploy MyFitClub to
GitHub Pages**.

## Что нужно сделать в GitHub

1. Открыть repository settings.
2. Перейти в **Pages**.
3. В разделе Source выбрать **GitHub Actions**.
4. После мержа в `main` дождаться workflow **Deploy MyFitClub to GitHub Pages**.
5. Открыть выданную ссылку.

## Как установить как приложение

После публикации:

### На Android / Chrome

1. Открыть ссылку MyFitClub.
2. Нажать меню браузера.
3. Выбрать **Add to Home screen** или **Install app**.

### На iPhone / Safari

1. Открыть ссылку MyFitClub.
2. Нажать **Share**.
3. Выбрать **Add to Home Screen**.

### На компьютере / Chrome или Edge

1. Открыть ссылку MyFitClub.
2. Нажать иконку установки в адресной строке, если она появилась.
3. Или открыть меню браузера и выбрать **Install app**.

## Ограничение текущей версии

Это всё ещё статический прототип. Данные сохраняются в браузере пользователя.
Настоящая общая база пользователей и сообщений появится после подключения
Firebase или backend.
