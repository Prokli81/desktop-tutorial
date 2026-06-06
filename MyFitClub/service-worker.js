const CACHE_NAME = "myfitclub-v17";
const APP_ASSETS = [
  "./",
  "./index.html",
  "./styles.css",
  "./data-store.js",
  "./firebase-config.js",
  "./firebase-health.js",
  "./firebase-config-sw.js",
  "./firebase-bridge.js",
  "./firebase-data.js",
  "./firebase-messaging.js",
  "./data-layer.js",
  "./pwa-install.js",
  "./app-lock.js",
  "./app.js",
  "./manifest.webmanifest",
  "./assets/icon.svg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_ASSETS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request).then((response) => {
        const responseCopy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseCopy));
        return response;
      });
    }),
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type !== "show-chat-notification") {
    return;
  }

  const { title, body, chatId, notificationId } = event.data;

  event.waitUntil(
    self.registration.showNotification(title || "MyFitClub", {
      body: body || "Новое сообщение",
      icon: "./assets/icon.svg",
      badge: "./assets/icon.svg",
      data: { chatId: chatId || "club-main" },
      tag: notificationId || `chat-${chatId || "club-main"}-${Date.now()}`,
      silent: false,
      vibrate: [180, 80, 180],
      renotify: true,
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const chatId = event.notification.data?.chatId;

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      const targetUrl = chatId
        ? `${self.registration.scope}index.html#chat-${chatId}`
        : `${self.registration.scope}index.html`;

      for (const client of windowClients) {
        if ("focus" in client) {
          client.postMessage({ type: "open-chat", chatId: chatId || "club-main" });
          return client.focus();
        }
      }

      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }

      return undefined;
    }),
  );
});

try {
  importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js");
  importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js");
  importScripts("./firebase-config-sw.js");

  if (self.FIREBASE_CONFIG?.projectId) {
    firebase.initializeApp(self.FIREBASE_CONFIG);
    const messaging = firebase.messaging();

    messaging.onBackgroundMessage((payload) => {
      const title = payload.notification?.title || "MyFitClub";
      const body = payload.notification?.body || "Новое сообщение в клубе";
      const chatId = payload.data?.chatId || "club-main";

      self.registration.showNotification(title, {
        body,
        icon: "./assets/icon.svg",
        badge: "./assets/icon.svg",
        data: { chatId },
        tag: `chat-fcm-${chatId}-${Date.now()}`,
        silent: false,
        vibrate: [180, 80, 180],
        renotify: true,
      });
    });
  }
} catch (error) {
  console.warn("MyFitClub FCM service worker setup failed", error);
}
