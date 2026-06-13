(function initSkladInstall() {
  const STORAGE_KEY = "sklad:install-dismissed";

  const banner = document.querySelector("#install-banner");
  const installButton = document.querySelector("#install-app");
  const dismissButton = document.querySelector("#dismiss-install");
  let deferredPrompt = null;

  function isStandalone() {
    return (
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true
    );
  }

  function hideBanner() {
    banner?.classList.add("hidden");
  }

  function showBanner() {
    if (!banner || isStandalone() || localStorage.getItem(STORAGE_KEY) === "1") {
      return;
    }
    banner.classList.remove("hidden");
  }

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredPrompt = event;
    showBanner();
  });

  installButton?.addEventListener("click", async () => {
    if (!deferredPrompt) {
      return;
    }
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
    hideBanner();
  });

  dismissButton?.addEventListener("click", () => {
    localStorage.setItem(STORAGE_KEY, "1");
    hideBanner();
  });

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./service-worker.js").catch((error) => {
      console.warn("Sklad service worker failed", error);
    });
  }

  if (!isStandalone() && /Android/i.test(navigator.userAgent)) {
    setTimeout(showBanner, 1500);
  }
})();
