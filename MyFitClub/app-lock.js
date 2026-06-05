(function initMyFitClubAppLock() {
  const STORAGE_KEY = "myfitclub:app-lock";
  const INACTIVITY_MS = 5 * 60 * 1000;

  let locked = false;
  let inactivityTimer = null;

  function loadConfig() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      console.warn("App lock config parse failed", error);
      return null;
    }
  }

  function saveConfig(config) {
    if (config) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
      return;
    }

    localStorage.removeItem(STORAGE_KEY);
  }

  async function hashPin(pin, salt) {
    const data = new TextEncoder().encode(`${salt}:${pin}`);
    const digest = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(digest))
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");
  }

  function randomSalt() {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    return Array.from(bytes)
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");
  }

  function validatePinFormat(pin) {
    return /^\d{4,6}$/.test(pin);
  }

  function isEnabled() {
    return Boolean(loadConfig()?.enabled);
  }

  function isLocked() {
    return locked && isEnabled();
  }

  function lock() {
    if (!isEnabled()) {
      return false;
    }

    locked = true;
    document.dispatchEvent(new CustomEvent("myfitclub:lock"));
    return true;
  }

  function unlockSuccess() {
    locked = false;
    document.dispatchEvent(new CustomEvent("myfitclub:unlock"));
  }

  async function unlock(pin) {
    const config = loadConfig();

    if (!config?.enabled) {
      locked = false;
      return { ok: true };
    }

    if (!validatePinFormat(pin)) {
      return { ok: false, message: "PIN должен содержать 4–6 цифр." };
    }

    const digest = await hashPin(pin, config.salt);

    if (digest !== config.hash) {
      return { ok: false, message: "Неверный PIN. Попробуйте снова." };
    }

    unlockSuccess();
    return { ok: true };
  }

  async function setupPin(pin, confirmPin) {
    if (!validatePinFormat(pin)) {
      return { ok: false, message: "PIN: от 4 до 6 цифр, только цифры." };
    }

    if (pin !== confirmPin) {
      return { ok: false, message: "PIN и подтверждение не совпадают." };
    }

    const salt = randomSalt();
    const hash = await hashPin(pin, salt);

    saveConfig({
      enabled: true,
      salt,
      hash,
      updatedAt: new Date().toISOString(),
    });
    locked = false;

    return { ok: true };
  }

  async function disablePin(pin) {
    const result = await unlock(pin);

    if (!result.ok) {
      return result;
    }

    saveConfig(null);
    locked = false;
    return { ok: true };
  }

  async function changePin(currentPin, newPin, confirmPin) {
    const config = loadConfig();

    if (!config?.enabled) {
      return { ok: false, message: "Сначала включите защиту PIN-кодом." };
    }

    const digest = await hashPin(currentPin, config.salt);

    if (digest !== config.hash) {
      return { ok: false, message: "Неверный текущий PIN." };
    }

    return setupPin(newPin, confirmPin);
  }

  function clearInactivityTimer() {
    if (inactivityTimer) {
      clearTimeout(inactivityTimer);
      inactivityTimer = null;
    }
  }

  function scheduleInactivityLock() {
    clearInactivityTimer();

    if (!isEnabled()) {
      return;
    }

    inactivityTimer = setTimeout(() => {
      lock();
    }, INACTIVITY_MS);
  }

  function bindInactivityTracking() {
    const reset = () => scheduleInactivityLock();
    ["click", "keydown", "touchstart", "scroll"].forEach((eventName) => {
      document.addEventListener(eventName, reset, { passive: true });
    });
    reset();
  }

  function isStandalone() {
    return (
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true
    );
  }

  window.MyFitClubAppLock = {
    isEnabled,
    isLocked,
    isStandalone,
    lock,
    unlock,
    setupPin,
    disablePin,
    changePin,
    bindInactivityTracking,
    scheduleInactivityLock,
    clearInactivityTimer,
  };
})();
