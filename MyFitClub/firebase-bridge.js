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

  async function sendPasswordReset(email) {
    const { auth } = await ensureReady();
    const continueUrl = `${window.location.origin}${window.location.pathname}`;

    await auth.sendPasswordResetEmail(email, {
      url: continueUrl,
      handleCodeInApp: false,
    });
  }

  async function changePassword(currentPassword, newPassword) {
    const { auth } = await ensureReady();
    const user = auth.currentUser;

    if (!user?.email) {
      const error = new Error("Сначала войдите через Firebase.");
      error.code = "auth/no-current-user";
      throw error;
    }

    const credential = firebase.auth.EmailAuthProvider.credential(
      user.email,
      currentPassword,
    );
    await user.reauthenticateWithCredential(credential);
    await user.updatePassword(newPassword);
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
      "auth/requires-recent-login":
        "Нужно подтвердить пароль ещё раз. Выйдите и войдите снова, затем повторите смену.",
      "auth/no-current-user": "Сначала войдите через Firebase.",
    };

    return messages[error?.code] || error?.message || "Не удалось выполнить вход.";
  }

  async function saveFcmToken(uid, token) {
    const { db } = await ensureReady();
    await db.collection("users").doc(uid).set(
      {
        fcmToken: token,
        fcmUpdatedAt: new Date().toISOString(),
      },
      { merge: true },
    );
  }

  async function updateUserAccess(uid, fields) {
    const { db } = await ensureReady();
    await db.collection("users").doc(uid).set(fields, { merge: true });
  }

  async function updateLastSeen(uid) {
    const { db } = await ensureReady();
    await db.collection("users").doc(uid).set(
      {
        lastSeenAt: new Date().toISOString(),
      },
      { merge: true },
    );
  }

  window.MyFitClubFirebase = {
    isEnabled,
    init: ensureReady,
    signUp,
    signIn,
    sendPasswordReset,
    changePassword,
    signOut,
    saveUserProfile,
    getUserProfile,
    saveFcmToken,
    updateLastSeen,
    updateUserAccess,
    waitForAuthState,
    mapAuthError,
  };
})();
