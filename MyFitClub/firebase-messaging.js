(function initMyFitClubMessaging() {
  let messaging = null;

  function getConfig() {
    return window.MYFITCLUB_FIREBASE_CONFIG || {};
  }

  function canUseMessaging() {
    const config = getConfig();
    return Boolean(
      window.MyFitClubFirebase?.isEnabled?.() &&
        config.vapidKey &&
        typeof firebase !== "undefined" &&
        firebase.messaging,
    );
  }

  async function getMessagingInstance() {
    if (!canUseMessaging()) {
      return null;
    }

    if (!messaging) {
      await window.MyFitClubFirebase.init();
      messaging = firebase.messaging();
    }

    return messaging;
  }

  async function registerToken(uid) {
    const config = getConfig();
    const messagingInstance = await getMessagingInstance();

    if (!messagingInstance || !uid) {
      return { ok: false, reason: "missing-config" };
    }

    const registration = await navigator.serviceWorker.ready;
    const token = await messagingInstance.getToken({
      vapidKey: config.vapidKey,
      serviceWorkerRegistration: registration,
    });

    if (!token) {
      return { ok: false, reason: "no-token" };
    }

    await window.MyFitClubFirebase.saveFcmToken(uid, token);
    return { ok: true, token };
  }

  async function setupForegroundMessages(handler) {
    const messagingInstance = await getMessagingInstance();

    if (!messagingInstance || typeof handler !== "function") {
      return;
    }

    messagingInstance.onMessage(handler);
  }

  window.MyFitClubMessaging = {
    canUseMessaging,
    registerToken,
    setupForegroundMessages,
  };
})();
