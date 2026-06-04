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
  currentUser: null,
  bookedScheduleIds: new Set(),
  clubMessages: [
    {
      author: "Елена, админ",
      text: "Добро пожаловать в MyFitClub! Здесь будут новости клуба, объявления и важные изменения.",
      role: "admin",
    },
    {
      author: "Мария, тренер",
      text: "Сегодня в 18:00 йога в зале 2. Возьмите коврики и воду.",
      role: "trainer",
    },
    {
      author: "Игорь",
      text: "Кто идет на функциональную тренировку в субботу?",
      role: "client",
    },
  ],
};

const directDialogs = [
  {
    name: "Мария Соколова",
    role: "Тренер по йоге",
    lastMessage: "Могу подобрать мягкую программу на эту неделю.",
    time: "12:40",
  },
  {
    name: "Алексей Орлов",
    role: "Силовой тренер",
    lastMessage: "После тренировки пришлю технику приседа.",
    time: "11:15",
  },
  {
    name: "Елена",
    role: "Администратор",
    lastMessage: "Ваш абонемент активен до конца месяца.",
    time: "09:30",
  },
];

const groups = [
  {
    title: "Питание",
    description: "Рационы, привычки, вода и вопросы тренерам.",
    members: "86 участников",
    accent: "badge",
  },
  {
    title: "Похудение",
    description: "Поддержка, замеры, мотивация и безопасный прогресс.",
    members: "54 участника",
    accent: "badge-blue",
  },
  {
    title: "Набор массы",
    description: "Силовые планы, восстановление и разбор техники.",
    members: "38 участников",
    accent: "badge",
  },
  {
    title: "Йога",
    description: "Растяжка, дыхание, спокойные практики и расписание.",
    members: "42 участника",
    accent: "badge-blue",
  },
  {
    title: "Новички",
    description: "Первые шаги в клубе, правила и помощь админа.",
    members: "23 участника",
    accent: "badge",
  },
];

const schedule = [
  {
    id: "functional-morning",
    title: "Утренняя функциональная",
    trainer: "Алексей Орлов",
    place: "Зал 1",
    date: "Пт, 08:00",
  },
  {
    id: "yoga-mobility",
    title: "Йога и мобильность",
    trainer: "Мария Соколова",
    place: "Зал 2",
    date: "Пт, 18:00",
  },
  {
    id: "strength-technique",
    title: "Силовая техника",
    trainer: "Алексей Орлов",
    place: "Зал 1",
    date: "Сб, 12:00",
  },
  {
    id: "club-challenge",
    title: "Клубный челлендж",
    trainer: "Команда тренеров",
    place: "Главный зал",
    date: "Вс, 11:00",
  },
];

const notifications = [
  {
    time: "Сегодня, 17:00",
    title: "Напоминание о тренировке",
    text: "Йога и мобильность начнется через час. Возьмите воду и коврик.",
  },
  {
    time: "Завтра, 09:00",
    title: "Новое объявление клуба",
    text: "Открыта запись на субботнюю функциональную тренировку.",
  },
  {
    time: "Пн, 08:30",
    title: "Челлендж недели",
    text: "Проверьте группу Питание и отметьте первый день дневника воды.",
  },
];

const elements = {
  inviteScreen: document.querySelector("#invite-screen"),
  appScreen: document.querySelector("#app-screen"),
  inviteForm: document.querySelector("#invite-form"),
  inviteError: document.querySelector("#invite-error"),
  inviteCode: document.querySelector("#invite-code"),
  memberName: document.querySelector("#member-name"),
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
  directList: document.querySelector("#direct-list"),
  groupList: document.querySelector("#group-list"),
  scheduleList: document.querySelector("#schedule-list"),
  bookingCount: document.querySelector("#booking-count"),
  notificationList: document.querySelector("#notification-list"),
  tabs: document.querySelectorAll(".tab"),
  views: document.querySelectorAll("[data-view-panel]"),
};

function normalizeCode(code) {
  return code.trim().toUpperCase();
}

function getInitials(name) {
  const trimmed = name.trim();
  return trimmed ? trimmed[0].toUpperCase() : "M";
}

function saveSession(user) {
  localStorage.setItem("myfitclub:user", JSON.stringify(user));
}

function loadBookings() {
  const raw = localStorage.getItem("myfitclub:bookings");

  if (!raw) {
    return [];
  }

  try {
    return JSON.parse(raw);
  } catch {
    localStorage.removeItem("myfitclub:bookings");
    return [];
  }
}

function saveBookings() {
  localStorage.setItem(
    "myfitclub:bookings",
    JSON.stringify([...state.bookedScheduleIds]),
  );
}

function loadSession() {
  const raw = localStorage.getItem("myfitclub:user");

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch {
    localStorage.removeItem("myfitclub:user");
    return null;
  }
}

function enterApp(user) {
  state.currentUser = user;
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
  renderSchedule();
  renderNotifications();
  updateBookingCount();
}

function resetDemo() {
  localStorage.removeItem("myfitclub:user");
  state.currentUser = null;
  elements.appScreen.classList.add("hidden");
  elements.inviteScreen.classList.remove("hidden");
  elements.resetDemo.classList.add("hidden");
  elements.inviteError.textContent = "";
}

function renderClubMessages() {
  elements.clubChatList.innerHTML = "";

  state.clubMessages.forEach((message) => {
    const article = document.createElement("article");
    const author = document.createElement("strong");
    const body = document.createElement("p");

    article.className = `message ${message.mine ? "mine" : ""}`;
    author.textContent = message.author;
    body.textContent = message.text;

    article.append(author, body);
    elements.clubChatList.append(article);
  });
}

function renderDirectDialogs() {
  elements.directList.innerHTML = directDialogs
    .map(
      (dialog) => `
        <article class="dialog-row">
          <div>
            <h3>${dialog.name}</h3>
            <span>${dialog.role}</span>
            <p>${dialog.lastMessage}</p>
          </div>
          <div class="dialog-meta">${dialog.time}</div>
        </article>
      `,
    )
    .join("");
}

function renderGroups() {
  elements.groupList.innerHTML = groups
    .map(
      (group) => `
        <article class="group-card">
          <div>
            <div class="panel-heading">
              <h3>${group.title}</h3>
              <span class="badge ${group.accent}">чат</span>
            </div>
            <p>${group.description}</p>
          </div>
          <span>${group.members}</span>
        </article>
      `,
    )
    .join("");
}

function renderSchedule() {
  elements.scheduleList.innerHTML = schedule
    .map((event) => {
      const isBooked = state.bookedScheduleIds.has(event.id);

      return `
        <article class="schedule-row">
          <div>
            <h3>${event.title}</h3>
            <span>${event.trainer} · ${event.place}</span>
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
  elements.notificationList.innerHTML = notifications
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

function activateView(viewName) {
  elements.tabs.forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.view === viewName);
  });

  elements.views.forEach((view) => {
    view.classList.toggle("active", view.id === viewName);
  });
}

elements.inviteForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const code = normalizeCode(elements.inviteCode.value);
  const invite = inviteCodes[code];

  if (!invite) {
    elements.inviteError.textContent =
      "Неверный пригласительный код. Попробуйте CLIENT2026, TRAINER2026 или ADMIN2026.";
    return;
  }

  const name = elements.memberName.value.trim() || invite.defaultName;
  const user = {
    ...invite,
    name,
    code,
  };

  saveSession(user);
  enterApp(user);
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

  state.clubMessages.push({
    author: state.currentUser.name,
    text,
    role: state.currentUser.role,
    mine: true,
  });
  elements.clubMessageInput.value = "";
  renderClubMessages();
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
});

elements.resetDemo.addEventListener("click", resetDemo);

state.bookedScheduleIds = new Set(loadBookings());
renderDirectDialogs();
renderGroups();
renderSchedule();
renderNotifications();
updateBookingCount();
elements.resetDemo.classList.add("hidden");

const savedUser = loadSession();

if (savedUser) {
  enterApp(savedUser);
}
