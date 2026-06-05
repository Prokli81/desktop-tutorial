(function initMyFitClubFirebaseHealth() {
  async function validateConfig(config) {
    if (!config?.enabled || !config.apiKey || !config.projectId) {
      return { ok: false, reason: "disabled" };
    }

    try {
      const response = await fetch(
        `https://www.googleapis.com/identitytoolkit/v3/relyingparty/getProjectConfig?key=${encodeURIComponent(config.apiKey)}`,
      );
      const payload = await response.json();

      if (payload.error?.message?.includes("API key not valid")) {
        return { ok: false, reason: "invalid-key" };
      }

      if (!response.ok) {
        return { ok: false, reason: "config-error", details: payload.error?.message };
      }

      return { ok: true };
    } catch (error) {
      return { ok: false, reason: "network", details: error?.message };
    }
  }

  window.MyFitClubFirebaseHealth = {
    validateConfig,
  };
})();
