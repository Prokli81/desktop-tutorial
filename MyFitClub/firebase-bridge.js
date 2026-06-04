(function initMyFitClubFirebase() {
  const config = window.MYFITCLUB_FIREBASE_CONFIG || { enabled: false };

  let readyPromise = null;

  function isEnabled() {
    return Boolean(
      config.enabled &&
        config.apiKey &&
        config.projectId &&
        config.authDomain &&
        typeof firebase !== "undefined",
    );
  }

  function ensureReady() {
    if (!isEnabled()) {
      return Promise.reject(new Error("Firebase is not configured"));
    }

    if (!readyPromise) {
      readyPromise = Promise.resolve().then(() => {
        const app =
          firebase.apps && firebase.apps.length
            ? firebase.app()
            : firebase.initializeApp(config);

        return {
          app,
          auth: firebase.auth(),
          db: firebase.firestore(),
        };
      });
    }

    return readyPromise;
  }

  async function signUp(email, password) {
    const { auth } = await ensureReady();
    const credential = await auth.createUserWithEmailAndPassword(email, password);
    return credential.user;
  }

  async function signIn(email, password) {
    const { auth } = await ensureReady();
    const credential = await auth.signInWithEmailAndPassword(email, password);
    return credential.user;
  }

  async function signOut() {
    if (!isEnabled()) {
      return;
    }

    const { auth } = await ensureReady();
    await auth.signOut();
  }

  async function saveUserProfile(uid, profile) {
    const { db } = await ensureReady();
    const payload = {
      ...profile,
      email: profile.email,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    };

    if (!profile.createdAt) {
      payload.createdAt = firebase.firestore.FieldValue.serverTimestamp();
    }

    await db.collection("users").doc(uid).set(payload, { merge: true });
  }

  async function getUserProfile(uid) {
    const { db } = await ensureReady();
    const snapshot = await db.collection("users").doc(uid).get();

    if (!snapshot.exists) {
      return null;
    }

    return {
      id: uid,
      ...snapshot.data(),
    };
  }

  function waitForAuthState() {
    if (!isEnabled()) {
      return Promise.resolve(null);
    }

    return ensureReady().then(
      ({ auth }) =>
        new Promise((resolve) => {
          const unsubscribe = auth.onAuthStateChanged((user) => {
            unsubscribe();
            resolve(user);
          });
        }),
    );
  }

  function mapAuthError(error) {
    const messages = {
      "auth/email-already-in-use":
        "Этот email уже зарегистрирован. Переключитесь на вкладку «Вход».",
      "auth/invalid-email": "Некорректный email.",
      "auth/weak-password": "Пароль слишком простой. Используйте минимум 6 символов.",
      "auth/user-not-found": "Аккаунт не найден. Сначала зарегистрируйтесь по коду.",
      "auth/wrong-password": "Неверный пароль.",
      "auth/invalid-credential": "Неверный email или пароль.",
      "auth/too-many-requests": "Слишком много попыток. Подождите и попробуйте снова.",
      "auth/network-request-failed": "Нет связи с интернетом. Проверьте подключение.",
    };

    return messages[error?.code] || error?.message || "Не удалось выполнить вход.";
  }

  window.MyFitClubFirebase = {
    isEnabled,
    init: ensureReady,
    signUp,
    signIn,
    signOut,
    saveUserProfile,
    getUserProfile,
    waitForAuthState,
    mapAuthError,
  };
})();
