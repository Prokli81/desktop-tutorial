(function initMyFitClubInstall() {
  const STORAGE_KEY = "myfitclub:install-dismissed";
  let deferredPrompt = null;

  const banner = document.querySelector("#install-banner");
  const installButton = document.querySelector("#install-app");
  const dismissButton = document.querySelector("#dismiss-install");
  const installHint = document.querySelector("#install-hint");

  function isStandalone() {
    return (
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true
    );
  }

  function isIos() {
    return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
  }

  function showBanner(message) {
    if (!banner || isStandalone() || localStorage.getItem(STORAGE_KEY) === "1") {
      return;
    }

    if (installHint && message) {
      installHint.textContent = message;
    }

    banner.classList.remove("hidden");
  }

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredPrompt = event;
    showBanner("Установите MyFitClub как приложение на главный экран.");
  });

  installButton?.addEventListener("click", async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      deferredPrompt = null;
      banner?.classList.add("hidden");
      return;
    }

    if (isIos()) {
      showBanner(
        "На iPhone: кнопка «Поделиться» → «На экран Домой». На Android: меню браузера → «Установить приложение».",
      );
    }
  });

  dismissButton?.addEventListener("click", () => {
    localStorage.setItem(STORAGE_KEY, "1");
    banner?.classList.add("hidden");
  });

  window.addEventListener("load", () => {
    if (isStandalone()) {
      return;
    }

    if (isIos()) {
      showBanner(
        "На iPhone: Safari → «Поделиться» → «На экран Домой», чтобы открывать MyFitClub как приложение.",
      );
      return;
    }

    if (window.MyFitClubFirebase?.isEnabled?.()) {
      showBanner("Можно установить MyFitClub на главный экран телефона.");
    }
  });
})();
