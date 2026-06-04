const SESSION_STORAGE_KEY = "myfitclub:user";
const ONBOARDING_STORAGE_KEY = "myfitclub:onboarding-complete";

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
  MyFitClubStore.replace("users", users);
}

function loadUsers() {
  return MyFitClubStore.list("users");
}

function toPublicUser(user) {
  const { password, ...publicUser } = user;
  return publicUser;
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
  return MyFitClubStore.list("invitationCodes").find(
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
  return MyFitClubStore.list("bookings").map((booking) => booking.scheduleId || booking);
}

function saveBookings() {
  const bookings = [...state.bookedScheduleIds].map((scheduleId) => ({
    id: `${state.currentUser?.id || "guest"}-${scheduleId}`,
    userId: state.currentUser?.id || "guest",
    scheduleId,
    createdAt: new Date().toISOString(),
  }));
  MyFitClubStore.replace("bookings", bookings);
}

function loadSession() {
  return loadJson(SESSION_STORAGE_KEY, null);
}

function enterApp(user) {
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

  renderClubMessages();
  refreshAppData();
}

function resetDemo() {
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
  return MyFitClubStore.list("chats").filter((chat) => chat.type === type);
}

function getChat(chatId) {
  return MyFitClubStore.list("chats").find((chat) => chat.id === chatId);
}

function getMessagesByChat(chatId) {
  return MyFitClubStore.list("messages").filter((message) => message.chatId === chatId);
}

function getLastMessage(chatId) {
  return getMessagesByChat(chatId).at(-1);
}

function createMessage(chatId, text) {
  const message = MyFitClubStore.add("messages", {
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
  elements.scheduleList.innerHTML = MyFitClubStore.list("scheduleEvents")
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
  elements.notificationList.innerHTML = MyFitClubStore.list("notifications")
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
  elements.dbUsersCount.textContent = MyFitClubStore.count("users");
  elements.dbChatsCount.textContent = MyFitClubStore.count("chats");
  elements.dbMessagesCount.textContent = MyFitClubStore.count("messages");
  elements.dbBookingsCount.textContent = MyFitClubStore.count("bookings");
  elements.dbNotificationsCount.textContent = MyFitClubStore.count("notifications");
  elements.dbCodesCount.textContent = MyFitClubStore.count("invitationCodes");
}

function renderAdminPanel() {
  const codes = MyFitClubStore.list("invitationCodes");
  const users = MyFitClubStore.list("users");
  const scheduleEvents = MyFitClubStore.list("scheduleEvents");

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
  renderDirectDialogs();
  renderGroups();
  renderSchedule();
  renderNotifications();
  updateBookingCount();
  renderDatabaseStats();
  renderAdminPanel();
}

function activateView(viewName) {
  elements.tabs.forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.view === viewName);
  });

  elements.views.forEach((view) => {
    view.classList.toggle("active", view.id === viewName);
  });
}

elements.authForm.addEventListener("submit", (event) => {
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
    enterApp(publicUser);
    return;
  }

  const code = normalizeCode(elements.inviteCode.value);
  const storedInvite = getInviteByCode(code);

  if (!storedInvite) {
    elements.authError.textContent =
      "Неверный пригласительный код. Попробуйте CLIENT2026, TRAINER2026 или ADMIN2026.";
    return;
  }

  if (storedInvite.usedCount >= storedInvite.usageLimit) {
    elements.authError.textContent =
      "Лимит этого пригласительного кода исчерпан. Нужен новый код от администратора.";
    return;
  }

  if (users.some((user) => user.email === email)) {
    elements.authError.textContent =
      "Такой email уже зарегистрирован. Переключитесь на вкладку Вход.";
    return;
  }

  const name = elements.memberName.value.trim() || invite.defaultName;
  const user = createUser({ name, email, password, code });
  users.push(user);
  saveUsers(users);
  MyFitClubStore.update((db) => {
    db.invitationCodes = db.invitationCodes.map((inviteCode) =>
      inviteCode.code === code
        ? { ...inviteCode, usedCount: inviteCode.usedCount + 1 }
        : inviteCode,
    );
  });

  const publicUser = toPublicUser(user);
  elements.authSuccess.textContent = "Аккаунт создан. Входим в MyFitClub...";
  saveSession(publicUser);
  enterApp(publicUser);
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

  MyFitClubStore.add("invitationCodes", {
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

  const chat = MyFitClubStore.add("chats", {
    title,
    type: "group",
    description,
    participantIds: ["all"],
    createdAt: new Date().toISOString(),
  });
  MyFitClubStore.add("messages", {
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

  MyFitClubStore.add("scheduleEvents", {
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

elements.resetDemo.addEventListener("click", resetDemo);

initOnboarding();
seedDemoUsers();
state.bookedScheduleIds = new Set(loadBookings());
setAuthMode("signup");
refreshAppData();
elements.resetDemo.classList.add("hidden");

const savedUser = loadSession();

if (savedUser) {
  completeOnboarding();
  enterApp(savedUser);
}

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js").catch((error) => {
      console.warn("MyFitClub service worker registration failed", error);
    });
  });
}
