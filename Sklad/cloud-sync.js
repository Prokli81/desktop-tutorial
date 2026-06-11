const SkladCloudSync = (() => {
  const DOC_PATH = "sklad/state";
  let enabled = false;
  let applyingRemote = false;
  let unsubscribe = null;
  let onRemoteChange = null;

  function getConfig() {
    return (
      window.SKLAD_FIREBASE_CONFIG ||
      (window.MYFITCLUB_FIREBASE_CONFIG?.enabled ? window.MYFITCLUB_FIREBASE_CONFIG : null) ||
      null
    );
  }

  function isEnabled() {
    const config = getConfig();
    return Boolean(
      config?.enabled &&
        config.apiKey &&
        config.projectId &&
        config.authDomain &&
        typeof firebase !== "undefined",
    );
  }

  async function getDb() {
    const config = getConfig();
    const app =
      firebase.apps && firebase.apps.length ? firebase.app() : firebase.initializeApp(config);
    return firebase.firestore(app);
  }

  function setOnRemoteChange(callback) {
    onRemoteChange = callback;
  }

  async function pushLocal() {
    if (!isEnabled() || applyingRemote) {
      return false;
    }

    const db = await getDb();
    await db.doc(DOC_PATH).set(
      {
        payload: SkladStore.read(),
        updatedAt: new Date().toISOString(),
      },
      { merge: true },
    );
    return true;
  }

  async function init() {
    if (!isEnabled()) {
      enabled = false;
      return false;
    }

    const db = await getDb();
    const docRef = db.doc(DOC_PATH);

    unsubscribe = docRef.onSnapshot(
      (snapshot) => {
        if (!snapshot.exists) {
          pushLocal();
          return;
        }

        const remote = snapshot.data();
        if (!remote?.payload) {
          return;
        }

        applyingRemote = true;
        SkladStore.replaceDb(remote.payload);
        applyingRemote = false;

        if (typeof onRemoteChange === "function") {
          onRemoteChange();
        }
      },
      (error) => {
        console.warn("Sklad cloud sync failed", error);
      },
    );

    enabled = true;
    return true;
  }

  function destroy() {
    if (unsubscribe) {
      unsubscribe();
      unsubscribe = null;
    }
    enabled = false;
  }

  function statusLabel() {
    if (!isEnabled()) {
      return "локально";
    }
    return enabled ? "облако" : "подключение…";
  }

  return {
    destroy,
    init,
    isEnabled,
    pushLocal,
    setOnRemoteChange,
    statusLabel,
  };
})();
