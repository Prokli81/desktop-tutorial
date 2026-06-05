const SESSION_STORAGE_KEY = "myfitclub:user";
const ONBOARDING_STORAGE_KEY = "myfitclub:onboarding-complete";
const LAST_READ_STORAGE_KEY = "myfitclub:last-read";
const PRESENCE_INTERVAL_MS = 60_000;

const inviteCodes = {
  CLIENT2026: {
    label: "клиент клуба",
    role: "client",
    roleName: "Клиент",
    defaultName: "Анна",
  },
  TRAINER2026: {
    label: "тренер клуба",
    role: "trainer",
    roleName: "Тренер",
    defaultName: "Мария",
  },
  ADMIN2026: {
    label: "администратор",
    role: "admin",
    roleName: "Администратор",
    defaultName: "Елена",
  },
};

const state = {
  authMode: "signup",
  currentUser: null,
  onboardingSlide: 0,
  bookedScheduleIds: new Set(),
  activeChatId: "club-main",
  previousView: "club-chat",
  activeView: "dashboard",
  lastMessageSnapshot: {},
  presenceTimer: null,
};

const elements = {
  onboardingScreen: document.querySelector("#onboarding-screen"),
  onboardingSlides: document.querySelector("#onboarding-slides"),
  onboardingDots: document.querySelector("#onboarding-dots"),
  onboardingNext: document.querySelector("#onboarding-next"),
  onboardingSkip: document.querySelector("#onboarding-skip"),
  inviteScreen: document.querySelector("#invite-screen"),
  appScreen: document.querySelector("#app-screen"),
  authForm: document.querySelector("#auth-form"),
  authError: document.querySelector("#auth-error"),
  authSuccess: document.querySelector("#auth-success"),
  authSubmit: document.querySelector("#auth-submit"),
  inviteCode: document.querySelector("#invite-code"),
  memberName: document.querySelector("#member-name"),
  memberEmail: document.querySelector("#member-email"),
  memberPassword: document.querySelector("#member-password"),
  syncStatus: document.querySelector("#sync-status"),
  unreadCount: document.querySelector("#unread-count"),
  groupCount: document.querySelector("#group-count"),
  onlineCount: document.querySelector("#online-count"),
  enableNotifications: document.querySelector("#enable-notifications"),
  notificationPermissionBadge: document.querySelector("#notification-permission-badge"),
  notificationPermissionText: document.querySelector("#notification-permission-text"),
  resetDemo: document.querySelector("#reset-demo"),
  roleLabel: document.querySelector("#role-label"),
  welcomeTitle: document.querySelector("#welcome-title"),
  profileRole: document.querySelector("#profile-role"),
  profileName: document.querySelector("#profile-name"),
  profileAvatar: document.querySelector("#profile-avatar"),
  adminPanel: document.querySelector("#admin-panel"),
  clubChatList: document.querySelector("#club-chat-list"),
  clubMessageForm: document.querySelector("#club-message-form"),
  clubMessageInput: document.querySelector("#club-message-input"),
  chatDetailType: document.querySelector("#chat-detail-type"),
  chatDetailTitle: document.querySelector("#chat-detail-title"),
  chatDetailDescription: document.querySelector("#chat-detail-description"),
  chatDetailList: document.querySelector("#chat-detail-list"),
  chatDetailForm: document.querySelector("#chat-detail-form"),
  chatDetailInput: document.querySelector("#chat-detail-input"),
  chatBackButton: document.querySelector("#chat-back-button"),
  directList: document.querySelector("#direct-list"),
  groupList: document.querySelector("#group-list"),
  scheduleList: document.querySelector("#schedule-list"),
  bookingCount: document.querySelector("#booking-count"),
  notificationList: document.querySelector("#notification-list"),
  dbUsersCount: document.querySelector("#db-users-count"),
  dbChatsCount: document.querySelector("#db-chats-count"),
  dbMessagesCount: document.querySelector("#db-messages-count"),
  dbBookingsCount: document.querySelector("#db-bookings-count"),
  dbNotificationsCount: document.querySelector("#db-notifications-count"),
  authBackendBadge: document.querySelector("#auth-backend-badge"),
  authBackendText: document.querySelector("#auth-backend-text"),
  firebaseStageBadge: document.querySelector("#firebase-stage-badge"),
  firebaseStageText: document.querySelector("#firebase-stage-text"),
  dbCodesCount: document.querySelector("#db-codes-count"),
  adminCodesCount: document.querySelector("#admin-codes-count"),
  adminUsersCount: document.querySelector("#admin-users-count"),
  adminScheduleCount: document.querySelector("#admin-schedule-count"),
  adminCodeForm: document.querySelector("#admin-code-form"),
  adminCodeInput: document.querySelector("#admin-code-input"),
  adminCodeRole: document.querySelector("#admin-code-role"),
  adminCodeLimit: document.querySelector("#admin-code-limit"),
  adminCodeList: document.querySelector("#admin-code-list"),
  adminUserList: document.querySelector("#admin-user-list"),
  adminGroupForm: document.querySelector("#admin-group-form"),
  adminGroupTitle: document.querySelector("#admin-group-title"),
  adminGroupDescription: document.querySelector("#admin-group-description"),
  adminScheduleForm: document.querySelector("#admin-schedule-form"),
  adminEventTitle: document.querySelector("#admin-event-title"),
  adminEventTrainer: document.querySelector("#admin-event-trainer"),
  adminEventPlace: document.querySelector("#admin-event-place"),
  adminEventDate: document.querySelector("#admin-event-date"),
  authTabs: document.querySelectorAll("[data-auth-mode]"),
  signupOnlyFields: document.querySelectorAll(".signup-only"),
  loginOnlyFields: document.querySelectorAll(".login-only"),
  tabs: document.querySelectorAll(".tab"),
  views: document.querySelectorAll("[data-view-panel]"),
};


function getLastReadMap() {
  return loadJson(LAST_READ_STORAGE_KEY, {});
}

function markChatRead(chatId) {
  const map = getLastReadMap();
  map[chatId] = new Date().toISOString();
  localStorage.setItem(LAST_READ_STORAGE_KEY, JSON.stringify(map));
  renderUnreadIndicators();
}

function getUnreadCountForChat(chatId) {
  if (!state.currentUser) {
    return 0;
  }

  const lastReadAt = getLastReadMap()[chatId] || "1970-01-01T00:00:00.000Z";
  return getMessagesByChat(chatId).filter(
    (message) =>
      message.userId !== state.currentUser.id &&
      new Date(message.createdAt || 0) > new Date(lastReadAt),
  ).length;
}

function getTotalUnreadCount() {
  return MyFitClubData.list("chats").reduce(
    (total, chat) => total + getUnreadCountForChat(chat.id),
    0,
  );
}

function getActiveViewName() {
  const activeView = [...elements.views].find((view) => view.classList.contains("active"));
  return activeView?.id || state.activeView || "dashboard";
}

function renderUnreadIndicators() {
  const totalUnread = getTotalUnreadCount();

  if (elements.unreadCount) {
    elements.unreadCount.textContent = String(totalUnread);
  }

  elements.tabs.forEach((tab) => {
    const existing = tab.querySelector(".tab-unread");
    if (existing) {
      existing.remove();
    }

    if (tab.dataset.view !== "club-chat" || totalUnread <= 0) {
      return;
    }

    const badge = document.createElement("span");
    badge.className = "tab-unread";
    badge.textContent = String(totalUnread);
    tab.append(badge);
  });
}

function renderOnlineCount() {
  if (!elements.onlineCount) {
    return;
  }

  if (!MyFitClubData.isCloudData()) {
    elements.onlineCount.textContent = state.currentUser ? "1 онлайн" : "онлайн";
    return;
  }

  const cutoff = Date.now() - 5 * 60 * 1000;
  const onlineUsers = MyFitClubData.list("users").filter((user) => {
    const lastSeen = new Date(user.lastSeenAt || 0).getTime();
    return lastSeen >= cutoff;
  }).length;

  elements.onlineCount.textContent = onlineUsers > 0 ? `${onlineUsers} онлайн` : "онлайн";
}

function renderSyncStatus() {
  if (!elements.syncStatus) {
    return;
  }

  if (MyFitClubData.isCloudData()) {
    elements.syncStatus.textContent = "облако";
    elements.syncStatus.classList.remove("hidden", "local");
    return;
  }

  if (isFirebaseAuth()) {
    elements.syncStatus.textContent = "вход облако";
    elements.syncStatus.classList.remove("hidden");
    elements.syncStatus.classList.add("local");
    return;
  }

  elements.syncStatus.textContent = "локально";
  elements.syncStatus.classList.remove("hidden");
  elements.syncStatus.classList.add("local");
}

function renderNotificationPermission() {
  if (!elements.notificationPermissionBadge) {
    return;
  }

  if (!("Notification" in window)) {
    elements.notificationPermissionBadge.textContent = "нет";
    elements.notificationPermissionText.textContent =
      "Этот браузер не поддерживает push-уведомления.";
    elements.enableNotifications.disabled = true;
    return;
  }

  if (Notification.permission === "granted") {
    elements.notificationPermissionBadge.textContent = "вкл";
    elements.notificationPermissionText.textContent =
      "Уведомления включены. Новые сообщения в чатах будут приходить, когда приложение свёрнуто.";
    elements.enableNotifications.textContent = "Уведомления включены";
    elements.enableNotifications.disabled = true;
    return;
  }

  if (Notification.permission === "denied") {
    elements.notificationPermissionBadge.textContent = "блок";
    elements.notificationPermissionText.textContent =
      "Браузер заблокировал уведомления. Разрешите их в настройках сайта.";
    elements.enableNotifications.disabled = true;
    return;
  }

  elements.notificationPermissionBadge.textContent = "выкл";
  elements.notificationPermissionText.textContent =
    "Включите уведомления, чтобы не пропускать новые сообщения в чатах клуба.";
  elements.enableNotifications.disabled = false;
  elements.enableNotifications.textContent = "Включить уведомления";
}

function shouldNotifyForChat(chatId) {
  const activeView = getActiveViewName();
  if (activeView === "chat-detail" && state.activeChatId === chatId) {
    return false;
  }
  if (activeView === "club-chat" && chatId === "club-main") {
    return false;
  }
  return true;
}

function notifyIncomingMessage(message, chat) {
  if (!("Notification" in window) || Notification.permission !== "granted") {
    return;
  }

  const title = chat?.title || "MyFitClub";
  const body = `${message.author}: ${message.text}`;
  const notification = new Notification(title, {
    body,
    icon: "assets/icon.svg",
    tag: `chat-${message.chatId}`,
  });

  notification.onclick = () => {
    window.focus();
    if (!chat) {
      return;
    }
    if (chat.id === "club-main") {
      activateView("club-chat");
      renderClubMessages();
      return;
    }
    openChat(chat.id, chat.type === "direct" ? "direct" : "groups");
  };
}

function detectIncomingMessages() {
  if (!state.currentUser) {
    return;
  }

  MyFitClubData.list("chats").forEach((chat) => {
    const messages = getMessagesByChat(chat.id);
    const latestMessage = messages.at(-1);
    const previousId = state.lastMessageSnapshot[chat.id];

    if (!latestMessage || latestMessage.id === previousId) {
      state.lastMessageSnapshot[chat.id] = latestMessage?.id;
      return;
    }

    if (
      latestMessage.userId !== state.currentUser.id &&
      shouldNotifyForChat(chat.id)
    ) {
      notifyIncomingMessage(latestMessage, chat);
    }

    state.lastMessageSnapshot[chat.id] = latestMessage.id;
  });

  renderUnreadIndicators();
}

async function touchPresence() {
  if (!state.currentUser?.id || !isFirebaseAuth()) {
    return;
  }

  try {
    await window.MyFitClubFirebase.updateLastSeen(state.currentUser.id);
    const users = loadUsers().map((user) =>
      user.id === state.currentUser.id
        ? { ...user, lastSeenAt: new Date().toISOString() }
        : user,
    );
    saveUsers(users);
    renderOnlineCount();
  } catch (error) {
    console.warn("Presence update failed", error);
  }
}

function startPresenceHeartbeat() {
  stopPresenceHeartbeat();
  touchPresence();
  state.presenceTimer = window.setInterval(touchPresence, PRESENCE_INTERVAL_MS);
}

function stopPresenceHeartbeat() {
  if (state.presenceTimer) {
    window.clearInterval(state.presenceTimer);
    state.presenceTimer = null;
  }
}


function normalizeCode(code) {
  return code.trim().toUpperCase();
}

function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

function getInitials(name) {
  const trimmed = name.trim();
  return trimmed ? trimmed[0].toUpperCase() : "M";
}

function loadJson(key, fallback) {
  const raw = localStorage.getItem(key);

  if (!raw) {
    return fallback;
  }

  try {
    return JSON.parse(raw);
  } catch {
    localStorage.removeItem(key);
    return fallback;
  }
}

function saveUsers(users) {
  MyFitClubData.replace("users", users);
}

function loadUsers() {
  return MyFitClubData.list("users");
}

function toPublicUser(user) {
  const { password, ...publicUser } = user;
  return publicUser;
}


function isFirebaseAuth() {
  return Boolean(window.MyFitClubFirebase?.isEnabled?.());
}

function syncUserToLocalStore(publicUser) {
  const users = loadUsers();
  const existingIndex = users.findIndex(
    (candidate) => candidate.id === publicUser.id || candidate.email === publicUser.email,
  );
  const record = {
    ...publicUser,
    password: "",
  };

  if (existingIndex >= 0) {
    users[existingIndex] = { ...users[existingIndex], ...record };
  } else {
    users.push(record);
  }

  saveUsers(users);
}

function renderAuthBackendInfo() {
  if (!elements.authBackendBadge) {
    return;
  }

  if (isFirebaseAuth()) {
    elements.authBackendBadge.textContent = "Firebase";
    elements.authBackendText.textContent =
      "Вход и регистрация работают через Firebase. Один аккаунт открывается на телефоне и компьютере.";
    if (window.MyFitClubData?.isCloudData?.()) {
      elements.firebaseStageBadge.textContent = "Firestore";
      elements.firebaseStageText.textContent =
        "Чаты, расписание и записи синхронизируются в облаке. Сообщения видят все участники клуба.";
    } else {
      elements.firebaseStageBadge.textContent = "включено";
      elements.firebaseStageText.textContent =
        "Облачный вход активен. Войдите в аккаунт, чтобы подключить общую базу Firestore.";
    }
    if (document.querySelector("#data-backend-badge")) {
      document.querySelector("#data-backend-badge").textContent =
        window.MyFitClubData?.isCloudData?.() ? "Firestore" : "localStorage";
    }
    return;
  }

  elements.authBackendBadge.textContent = "локально";
  elements.authBackendText.textContent =
    "Роль назначается пригласительным кодом. Аккаунты и пароли хранятся только в этом браузере.";
  elements.firebaseStageBadge.textContent = "этап 2";
  elements.firebaseStageText.textContent =
    "Firebase подготовлен в коде. Чтобы включить общий вход, настройте firebase-config.js (см. docs/firebase-setup.md).";
}

function validateSignupInvite(code) {
  const storedInvite = getInviteByCode(code);

  if (!storedInvite) {
    return {
      ok: false,
      message:
        "Неверный пригласительный код. Попробуйте CLIENT2026, TRAINER2026 или ADMIN2026.",
    };
  }

  if (storedInvite.usedCount >= storedInvite.usageLimit) {
    return {
      ok: false,
      message:
        "Лимит этого пригласительного кода исчерпан. Нужен новый код от администратора.",
    };
  }

  return { ok: true, storedInvite };
}



async function loginWithFirebase(email, password) {
  const authUser = await window.MyFitClubFirebase.signIn(email, password);
  const profile = await window.MyFitClubFirebase.getUserProfile(authUser.uid);

  if (!profile) {
    await window.MyFitClubFirebase.signOut();
    return {
      ok: false,
      message:
        "Профиль не найден. Зарегистрируйтесь по пригласительному коду на вкладке «Регистрация».",
    };
  }

  const publicUser = toPublicUser(profile);
  syncUserToLocalStore(publicUser);
  saveSession(publicUser);
  await enterApp(publicUser);
  return { ok: true };
}

async function signupWithFirebase({ name, email, password, code }) {
  const inviteCheck = validateSignupInvite(code);

  if (!inviteCheck.ok) {
    return inviteCheck;
  }

  const invitePreset = inviteCodes[code];
  const authUser = await window.MyFitClubFirebase.signUp(email, password);
  const profile = createUser({ name, email, password: "", code });
  profile.id = authUser.uid;
  profile.name = name || invitePreset?.defaultName || profile.name;

  await window.MyFitClubFirebase.saveUserProfile(authUser.uid, {
    name: profile.name,
    email: profile.email,
    code: profile.code,
    role: profile.role,
    roleName: profile.roleName,
    label: profile.label,
    createdAt: profile.createdAt,
  });

  await MyFitClubData.consumeInviteCode(code);
  const publicUser = toPublicUser(profile);
  syncUserToLocalStore(publicUser);
  elements.authSuccess.textContent = "Аккаунт создан в Firebase. Входим в MyFitClub...";
  saveSession(publicUser);
  await enterApp(publicUser);
  return { ok: true };
}

function getRoleName(role) {
  return {
    client: "Клиент",
    trainer: "Тренер",
    admin: "Администратор",
  }[role] || "Клиент";
}

function getRoleLabel(role) {
  return {
    client: "клиент клуба",
    trainer: "тренер клуба",
    admin: "администратор",
  }[role] || "клиент клуба";
}

function getInviteByCode(code) {
  return MyFitClubData.list("invitationCodes").find(
    (candidate) => candidate.code === code && candidate.isActive,
  );
}

function createUser({ name, email, password, code }) {
  const invite = getInviteByCode(code) || inviteCodes[code];
  const role = invite.role;

  return {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    name,
    email,
    password,
    code,
    label: getRoleLabel(role),
    role,
    roleName: invite.roleName || getRoleName(role),
    createdAt: new Date().toISOString(),
  };
}

function seedDemoUsers() {
  const users = loadUsers();
  const demoEmail = "anna@myfitclub.demo";

  if (users.some((user) => user.email === demoEmail)) {
    return;
  }

  users.push(
    createUser({
      name: "Анна",
      email: demoEmail,
      password: "fitclub",
      code: "CLIENT2026",
    }),
  );
  saveUsers(users);
}

function saveSession(user) {
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
}

function loadBookings() {
  return MyFitClubData.list("bookings").map((booking) => booking.scheduleId || booking);
}

function saveBookings() {
  const bookings = [...state.bookedScheduleIds].map((scheduleId) => ({
    id: `${state.currentUser?.id || "guest"}-${scheduleId}`,
    userId: state.currentUser?.id || "guest",
    scheduleId,
    createdAt: new Date().toISOString(),
  }));
  MyFitClubData.replace("bookings", bookings);
}

function loadSession() {
  return loadJson(SESSION_STORAGE_KEY, null);
}

function onCloudDataRefresh() {
  if (!state.currentUser) {
    return;
  }

  state.bookedScheduleIds = new Set(loadBookings());
  refreshAppData();
  renderClubMessages();

  if (state.activeChatId) {
    renderMessageList(elements.chatDetailList, state.activeChatId);
  }

  detectIncomingMessages();
  renderOnlineCount();
  renderSyncStatus();
}

async function enterApp(user) {
  state.currentUser = user;
  elements.onboardingScreen.classList.add("hidden");
  elements.inviteScreen.classList.add("hidden");
  elements.appScreen.classList.remove("hidden");
  elements.resetDemo.classList.remove("hidden");

  elements.roleLabel.textContent = user.label;
  elements.welcomeTitle.textContent = `Привет, ${user.name}!`;
  elements.profileRole.textContent = user.roleName;
  elements.profileName.textContent = user.name;
  elements.profileAvatar.textContent = getInitials(user.name);
  elements.adminPanel.classList.toggle("hidden", user.role !== "admin");

  if (isFirebaseAuth()) {
    try {
      await window.MyFitClubData.init(onCloudDataRefresh);
    } catch (error) {
      console.warn("MyFitClub Firestore init failed", error);
    }
  }

  renderAuthBackendInfo();
  renderSyncStatus();
  startPresenceHeartbeat();
  renderClubMessages();
  refreshAppData();
  detectIncomingMessages();
  renderNotificationPermission();
}

async function resetDemo() {
  stopPresenceHeartbeat();
  window.MyFitClubData.destroy();

  if (isFirebaseAuth()) {
    try {
      await window.MyFitClubFirebase.signOut();
    } catch (error) {
      console.warn("Firebase signOut failed", error);
    }
  }

  localStorage.removeItem(SESSION_STORAGE_KEY);
  state.currentUser = null;
  elements.appScreen.classList.add("hidden");
  elements.onboardingScreen.classList.add("hidden");
  elements.inviteScreen.classList.remove("hidden");
  elements.resetDemo.classList.add("hidden");
  elements.authError.textContent = "";
  elements.authSuccess.textContent = "";
}

function isOnboardingComplete() {
  return localStorage.getItem(ONBOARDING_STORAGE_KEY) === "1";
}

function completeOnboarding() {
  localStorage.setItem(ONBOARDING_STORAGE_KEY, "1");
  elements.onboardingScreen.classList.add("hidden");
  elements.inviteScreen.classList.remove("hidden");
}

function goToOnboardingSlide(index) {
  const slides = elements.onboardingSlides.querySelectorAll(".onboarding-slide");
  const dots = elements.onboardingDots.querySelectorAll(".dot");
  const safeIndex = Math.max(0, Math.min(index, slides.length - 1));

  state.onboardingSlide = safeIndex;
  slides.forEach((slide, slideIndex) => {
    slide.classList.toggle("active", slideIndex === safeIndex);
  });
  dots.forEach((dot, dotIndex) => {
    dot.classList.toggle("active", dotIndex === safeIndex);
  });
  elements.onboardingNext.textContent =
    safeIndex === slides.length - 1 ? "Войти по коду" : "Далее";
}

function initOnboarding() {
  if (isOnboardingComplete()) {
    elements.onboardingScreen.classList.add("hidden");
    elements.inviteScreen.classList.remove("hidden");
    return;
  }

  elements.onboardingScreen.classList.remove("hidden");
  elements.inviteScreen.classList.add("hidden");
  goToOnboardingSlide(0);
}

function setAuthMode(mode) {
  state.authMode = mode;
  const isSignup = mode === "signup";

  elements.authTabs.forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.authMode === mode);
  });
  elements.signupOnlyFields.forEach((field) => field.classList.toggle("hidden", !isSignup));
  elements.loginOnlyFields.forEach((field) => field.classList.toggle("hidden", isSignup));
  elements.authSubmit.textContent = isSignup ? "Создать аккаунт" : "Войти";
  elements.memberPassword.autocomplete = isSignup ? "new-password" : "current-password";

  if (!isSignup && normalizeEmail(elements.memberEmail.value) === "new-client@myfitclub.demo") {
    elements.memberEmail.value = "anna@myfitclub.demo";
  }

  if (isSignup && normalizeEmail(elements.memberEmail.value) === "anna@myfitclub.demo") {
    elements.memberEmail.value = "new-client@myfitclub.demo";
  }

  elements.authError.textContent = "";
  elements.authSuccess.textContent = "";
}

function getChatsByType(type) {
  return MyFitClubData.list("chats").filter((chat) => chat.type === type);
}

function getChat(chatId) {
  return MyFitClubData.list("chats").find((chat) => chat.id === chatId);
}

function getMessagesByChat(chatId) {
  return MyFitClubData.list("messages")
    .filter((message) => message.chatId === chatId)
    .sort((left, right) => new Date(left.createdAt || 0) - new Date(right.createdAt || 0));
}

function getLastMessage(chatId) {
  return getMessagesByChat(chatId).at(-1);
}

function createMessage(chatId, text) {
  const message = MyFitClubData.add("messages", {
    chatId,
    author: state.currentUser.name,
    text,
    role: state.currentUser.role,
    userId: state.currentUser.id,
    createdAt: new Date().toISOString(),
  });
  renderDatabaseStats();
  return message;
}

function renderMessageList(container, chatId) {
  container.innerHTML = "";

  getMessagesByChat(chatId).forEach((message) => {
    const article = document.createElement("article");
    const author = document.createElement("strong");
    const body = document.createElement("p");

    article.className = `message ${message.userId === state.currentUser?.id ? "mine" : ""}`;
    author.textContent = message.author;
    body.textContent = message.text;

    article.append(author, body);
    container.append(article);
  });
}

function renderClubMessages() {
  renderMessageList(elements.clubChatList, "club-main");
  if (getActiveViewName() === "club-chat") {
    markChatRead("club-main");
  }
}

function openChat(chatId, previousView = "groups") {
  const chat = getChat(chatId);

  if (!chat) {
    return;
  }

  state.activeChatId = chatId;
  state.previousView = previousView;
  elements.chatDetailType.textContent = chat.type === "direct" ? "личный диалог" : "групповой чат";
  elements.chatDetailTitle.textContent = chat.title;
  elements.chatDetailDescription.textContent = chat.description;
  renderMessageList(elements.chatDetailList, chatId);
  markChatRead(chatId);
  activateView("chat-detail");
}

function renderDirectDialogs() {
  elements.directList.innerHTML = getChatsByType("direct")
    .map((chat) => {
      const lastMessage = getLastMessage(chat.id);
      const time = lastMessage
        ? new Date(lastMessage.createdAt).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })
        : "--:--";

      return `
        <article class="dialog-row chat-open-row" data-chat-id="${chat.id}" data-source-view="direct">
          <div>
            <h3>${chat.title}</h3>
            <span>${chat.description}</span>
            <p>${lastMessage?.text || "Сообщений пока нет."}</p>
          </div>
          <div class="dialog-meta">${time}</div>
        </article>
      `;
    })
    .join("");
}

function renderGroups() {
  elements.groupList.innerHTML = getChatsByType("group")
    .map((chat, index) => {
      const lastMessage = getLastMessage(chat.id);
      const accent = index % 2 === 0 ? "badge" : "badge-blue";
      const messageCount = getMessagesByChat(chat.id).length;

      return `
        <article class="group-card chat-open-row" data-chat-id="${chat.id}" data-source-view="groups">
          <div>
            <div class="panel-heading">
              <h3>${chat.title}</h3>
              <span class="badge ${accent}">${messageCount} сообщ.</span>
            </div>
            <p>${chat.description}</p>
          </div>
          <span>${lastMessage?.text || "Открыть чат"}</span>
        </article>
      `;
    })
    .join("");
}

function renderSchedule() {
  elements.scheduleList.innerHTML = MyFitClubData.list("scheduleEvents")
    .map((event) => {
      const isBooked = state.bookedScheduleIds.has(event.id);

      return `
        <article class="schedule-row">
          <div>
            <h3>${event.title}</h3>
            <span>${event.trainer} · ${event.place}</span>
            <p>${event.description || ""}</p>
          </div>
          <div class="schedule-actions">
            <div class="schedule-meta">${event.date}</div>
            <button
              class="secondary-button ${isBooked ? "active" : ""}"
              type="button"
              data-schedule-id="${event.id}"
            >
              ${isBooked ? "Вы записаны" : "Записаться"}
            </button>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderNotifications() {
  elements.notificationList.innerHTML = MyFitClubData.list("notifications")
    .map(
      (notification) => `
        <article class="notification-card">
          <time>${notification.time}</time>
          <strong>${notification.title}</strong>
          <p>${notification.text}</p>
        </article>
      `,
    )
    .join("");
}

function updateBookingCount() {
  elements.bookingCount.textContent = state.bookedScheduleIds.size;
}

function renderDatabaseStats() {
  elements.dbUsersCount.textContent = MyFitClubData.count("users");
  elements.dbChatsCount.textContent = MyFitClubData.count("chats");
  elements.dbMessagesCount.textContent = MyFitClubData.count("messages");
  elements.dbBookingsCount.textContent = MyFitClubData.count("bookings");
  elements.dbNotificationsCount.textContent = MyFitClubData.count("notifications");
  elements.dbCodesCount.textContent = MyFitClubData.count("invitationCodes");
}

function renderAdminPanel() {
  const codes = MyFitClubData.list("invitationCodes");
  const users = MyFitClubData.list("users");
  const scheduleEvents = MyFitClubData.list("scheduleEvents");

  elements.adminCodesCount.textContent = codes.filter((code) => code.isActive).length;
  elements.adminUsersCount.textContent = users.length;
  elements.adminScheduleCount.textContent = scheduleEvents.length;
  elements.adminCodeList.innerHTML = codes
    .map(
      (code) => `<span>${code.code} -> ${getRoleName(code.role)} (${code.usedCount}/${code.usageLimit})</span>`,
    )
    .join("");
  elements.adminUserList.innerHTML = users.length
    ? users
        .map(
          (user) => `
            <article>
              <strong>${user.name}</strong>
              <span>${user.email} · ${user.roleName}</span>
            </article>
          `,
        )
        .join("")
    : "<p>Пока есть только демо-пользователь после инициализации.</p>";
}

function refreshAppData() {
  if (elements.groupCount) {
    const groupTotal = getChatsByType("group").length;
    elements.groupCount.textContent = `${groupTotal} тем`;
  }
  renderDirectDialogs();
  renderGroups();
  renderSchedule();
  renderNotifications();
  updateBookingCount();
  renderDatabaseStats();
  renderAdminPanel();
  renderUnreadIndicators();
  renderOnlineCount();
  renderSyncStatus();
}

function activateView(viewName) {
  state.activeView = viewName;
  elements.tabs.forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.view === viewName);
  });

  elements.views.forEach((view) => {
    view.classList.toggle("active", view.id === viewName);
  });

  if (viewName === "club-chat") {
    markChatRead("club-main");
  }
}

elements.authForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  elements.authError.textContent = "";
  elements.authSuccess.textContent = "";

  const email = normalizeEmail(elements.memberEmail.value);
  const password = elements.memberPassword.value.trim();
  const users = loadUsers();

  if (!email || !password) {
    elements.authError.textContent = "Введите email и пароль.";
    return;
  }

  if (isFirebaseAuth()) {
    elements.authSubmit.disabled = true;

    try {
      if (state.authMode === "login") {
        const result = await loginWithFirebase(email, password);
        if (!result.ok) {
          elements.authError.textContent = result.message;
        }
        return;
      }

      const code = normalizeCode(elements.inviteCode.value);
      const inviteCheck = validateSignupInvite(code);

      if (!inviteCheck.ok) {
        elements.authError.textContent = inviteCheck.message;
        return;
      }

      const name =
        elements.memberName.value.trim() ||
        inviteCodes[code]?.defaultName ||
        "Участник";

      const signupResult = await signupWithFirebase({ name, email, password, code });
      if (!signupResult.ok) {
        elements.authError.textContent = signupResult.message;
      }
    } catch (error) {
      elements.authError.textContent = window.MyFitClubFirebase.mapAuthError(error);
    } finally {
      elements.authSubmit.disabled = false;
    }

    return;
  }

  if (state.authMode === "login") {
    const user = users.find(
      (candidate) => candidate.email === email && candidate.password === password,
    );

    if (!user) {
      elements.authError.textContent =
        "Аккаунт не найден или пароль неверный. Для демо используйте anna@myfitclub.demo / fitclub.";
      return;
    }

    const publicUser = toPublicUser(user);
    saveSession(publicUser);
    await enterApp(publicUser);
    return;
  }

  const code = normalizeCode(elements.inviteCode.value);
  const inviteCheck = validateSignupInvite(code);

  if (!inviteCheck.ok) {
    elements.authError.textContent = inviteCheck.message;
    return;
  }

  if (users.some((user) => user.email === email)) {
    elements.authError.textContent =
      "Такой email уже зарегистрирован. Переключитесь на вкладку Вход.";
    return;
  }

  const name =
    elements.memberName.value.trim() || inviteCodes[code]?.defaultName || "Участник";
  const user = createUser({ name, email, password, code });
  users.push(user);
  saveUsers(users);
  await MyFitClubData.consumeInviteCode(code);

  const publicUser = toPublicUser(user);
  elements.authSuccess.textContent = "Аккаунт создан. Входим в MyFitClub...";
  saveSession(publicUser);
  await enterApp(publicUser);
});

elements.clubMessageForm.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!state.currentUser) {
    return;
  }

  const text = elements.clubMessageInput.value.trim();

  if (!text) {
    return;
  }

  createMessage("club-main", text);
  elements.clubMessageInput.value = "";
  renderClubMessages();
});

elements.chatDetailForm.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!state.currentUser) {
    return;
  }

  const text = elements.chatDetailInput.value.trim();

  if (!text) {
    return;
  }

  createMessage(state.activeChatId, text);
  elements.chatDetailInput.value = "";
  renderMessageList(elements.chatDetailList, state.activeChatId);
  renderDirectDialogs();
  renderGroups();
  renderClubMessages();
});

elements.directList.addEventListener("click", (event) => {
  const row = event.target.closest("[data-chat-id]");

  if (row) {
    openChat(row.dataset.chatId, row.dataset.sourceView);
  }
});

elements.groupList.addEventListener("click", (event) => {
  const row = event.target.closest("[data-chat-id]");

  if (row) {
    openChat(row.dataset.chatId, row.dataset.sourceView);
  }
});

elements.chatBackButton.addEventListener("click", () => activateView(state.previousView));

elements.authTabs.forEach((tab) => {
  tab.addEventListener("click", () => setAuthMode(tab.dataset.authMode));
});

elements.tabs.forEach((tab) => {
  tab.addEventListener("click", () => activateView(tab.dataset.view));
});

document.querySelectorAll("[data-quick-view]").forEach((button) => {
  button.addEventListener("click", () => activateView(button.dataset.quickView));
});

elements.scheduleList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-schedule-id]");

  if (!button) {
    return;
  }

  const scheduleId = button.dataset.scheduleId;

  if (state.bookedScheduleIds.has(scheduleId)) {
    state.bookedScheduleIds.delete(scheduleId);
  } else {
    state.bookedScheduleIds.add(scheduleId);
  }

  saveBookings();
  renderSchedule();
  updateBookingCount();
  renderDatabaseStats();
});

elements.adminCodeForm.addEventListener("submit", (event) => {
  event.preventDefault();

  if (state.currentUser?.role !== "admin") {
    return;
  }

  const code = normalizeCode(elements.adminCodeInput.value);
  const role = elements.adminCodeRole.value;
  const usageLimit = Number(elements.adminCodeLimit.value) || 1;

  if (!code || getInviteByCode(code)) {
    return;
  }

  MyFitClubData.add("invitationCodes", {
    code,
    role,
    roleName: getRoleName(role),
    isActive: true,
    usageLimit,
    usedCount: 0,
  });
  elements.adminCodeInput.value = "";
  renderAdminPanel();
  renderDatabaseStats();
});

elements.adminGroupForm.addEventListener("submit", (event) => {
  event.preventDefault();

  if (state.currentUser?.role !== "admin") {
    return;
  }

  const title = elements.adminGroupTitle.value.trim();
  const description = elements.adminGroupDescription.value.trim();

  if (!title || !description) {
    return;
  }

  const chat = MyFitClubData.add("chats", {
    title,
    type: "group",
    description,
    participantIds: ["all"],
    createdAt: new Date().toISOString(),
  });
  MyFitClubData.add("messages", {
    chatId: chat.id,
    author: state.currentUser.name,
    text: `Группа "${title}" создана администратором.`,
    role: state.currentUser.role,
    userId: state.currentUser.id,
    createdAt: new Date().toISOString(),
  });
  elements.adminGroupTitle.value = "";
  elements.adminGroupDescription.value = "";
  renderGroups();
  renderAdminPanel();
  renderDatabaseStats();
});

elements.adminScheduleForm.addEventListener("submit", (event) => {
  event.preventDefault();

  if (state.currentUser?.role !== "admin") {
    return;
  }

  const title = elements.adminEventTitle.value.trim();
  const trainer = elements.adminEventTrainer.value.trim();
  const place = elements.adminEventPlace.value.trim();
  const date = elements.adminEventDate.value.trim();

  if (!title || !trainer || !place || !date) {
    return;
  }

  MyFitClubData.add("scheduleEvents", {
    title,
    trainer,
    place,
    date,
    description: "Занятие добавлено через админ-панель.",
    capacity: 12,
  });
  elements.adminEventTitle.value = "";
  elements.adminEventTrainer.value = "";
  elements.adminEventPlace.value = "";
  elements.adminEventDate.value = "";
  renderSchedule();
  renderAdminPanel();
  renderUnreadIndicators();
  renderOnlineCount();
  renderSyncStatus();
});


elements.onboardingNext.addEventListener("click", () => {
  const slides = elements.onboardingSlides.querySelectorAll(".onboarding-slide");
  if (state.onboardingSlide < slides.length - 1) {
    goToOnboardingSlide(state.onboardingSlide + 1);
    return;
  }
  completeOnboarding();
});

elements.onboardingSkip.addEventListener("click", completeOnboarding);

elements.onboardingDots.querySelectorAll(".dot").forEach((dot) => {
  dot.addEventListener("click", () => goToOnboardingSlide(Number(dot.dataset.slideTo)));
});

elements.enableNotifications?.addEventListener("click", async () => {
  if (!("Notification" in window)) {
    return;
  }

  const permission = await Notification.requestPermission();
  renderNotificationPermission();

  if (permission === "granted") {
    new Notification("MyFitClub", {
      body: "Уведомления включены. Новые сообщения в чатах будут приходить сюда.",
      icon: "assets/icon.svg",
    });
  }
});

elements.resetDemo.addEventListener("click", resetDemo);

async function bootstrap() {
  initOnboarding();
  renderAuthBackendInfo();
  renderSyncStatus();
  state.bookedScheduleIds = new Set(loadBookings());
  setAuthMode("signup");
  refreshAppData();
  elements.resetDemo.classList.add("hidden");

  if (isFirebaseAuth()) {
    try {
      await window.MyFitClubFirebase.init();
      const authUser = await window.MyFitClubFirebase.waitForAuthState();

      if (authUser) {
        const profile = await window.MyFitClubFirebase.getUserProfile(authUser.uid);

        if (profile) {
          const publicUser = toPublicUser(profile);
          syncUserToLocalStore(publicUser);
          completeOnboarding();
          await enterApp(publicUser);
          return;
        }
      }
    } catch (error) {
      console.warn("Firebase bootstrap failed", error);
      elements.authError.textContent =
        "Firebase включён, но подключение не удалось. Проверьте firebase-config.js.";
    }
  } else {
    seedDemoUsers();
    const savedUser = loadSession();

    if (savedUser) {
      completeOnboarding();
      await enterApp(savedUser);
    }
  }
}

bootstrap();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js").catch((error) => {
      console.warn("MyFitClub service worker registration failed", error);
    });
  });
}
