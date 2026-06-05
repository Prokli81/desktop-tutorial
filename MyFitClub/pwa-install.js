(function initMyFitClubInstall() {
  const STORAGE_KEY = "myfitclub:install-dismissed";
  let deferredPrompt = null;

  const banner = document.querySelector("#install-banner");
  const installButton = document.querySelector("#install-app");
  const dismissButton = document.querySelector("#dismiss-install");
  const closeButton = document.querySelector("#close-install");
  const installHint = document.querySelector("#install-hint");

  function isStandalone() {
    return (
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true
    );
  }

  function isDismissed() {
    return localStorage.getItem(STORAGE_KEY) === "1";
  }

  function hideBanner() {
    banner?.classList.add("hidden");
    document.body.classList.remove("install-banner-visible");
  }

  function showBanner(message) {
    if (!banner || isStandalone() || isDismissed()) {
      return;
    }

    if (installHint && message) {
      installHint.textContent = message;
    }

    banner.classList.remove("hidden");
    document.body.classList.add("install-banner-visible");
  }

  function dismissBanner() {
    localStorage.setItem(STORAGE_KEY, "1");
    hideBanner();
  }

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredPrompt = event;
    showBanner("Браузер предлагает установить MyFitClub на главный экран.");
  });

  installButton?.addEventListener("click", async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      deferredPrompt = null;
      hideBanner();
      return;
    }

    dismissBanner();
  });

  dismissButton?.addEventListener("click", dismissBanner);
  closeButton?.addEventListener("click", dismissBanner);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && banner && !banner.classList.contains("hidden")) {
      dismissBanner();
    }
  });

  if (banner && isDismissed()) {
    hideBanner();
  }
})();
