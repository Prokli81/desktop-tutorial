(function initMyFitClubFirebaseHealth() {
  function getSiteHost() {
    return window.location.hostname;
  }

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

      if (!response.ok || payload.error) {
        return { ok: false, reason: "config-error", details: payload.error?.message };
      }

      const host = getSiteHost();
      const allowed = payload.authorizedDomains || [];

      if (
        host &&
        host !== "localhost" &&
        host !== "127.0.0.1" &&
        !allowed.includes(host)
      ) {
        return {
          ok: false,
          reason: "domain-missing",
          host,
          allowed,
        };
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
