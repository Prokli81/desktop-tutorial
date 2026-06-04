const MyFitClubStore = (() => {
  const DB_KEY = "myfitclub:db:v1";

  const seed = {
    users: [],
    invitationCodes: [
      {
        code: "CLIENT2026",
        role: "client",
        roleName: "Клиент",
        isActive: true,
        usageLimit: 200,
        usedCount: 0,
      },
      {
        code: "TRAINER2026",
        role: "trainer",
        roleName: "Тренер",
        isActive: true,
        usageLimit: 20,
        usedCount: 0,
      },
      {
        code: "ADMIN2026",
        role: "admin",
        roleName: "Администратор",
        isActive: true,
        usageLimit: 5,
        usedCount: 0,
      },
    ],
    chats: [
      {
        id: "club-main",
        title: "Клубная лента",
        type: "club",
        description: "Новости, объявления и общение всего фитнес-клуба.",
        participantIds: ["all"],
        createdAt: "2026-06-04T08:30:00.000Z",
      },
      {
        id: "group-nutrition",
        title: "Питание",
        type: "group",
        description: "Рационы, привычки, вода и вопросы тренерам.",
        participantIds: ["all"],
        createdAt: "2026-06-04T08:35:00.000Z",
      },
      {
        id: "group-weight-loss",
        title: "Похудение",
        type: "group",
        description: "Поддержка, замеры, мотивация и безопасный прогресс.",
        participantIds: ["all"],
        createdAt: "2026-06-04T08:36:00.000Z",
      },
      {
        id: "group-muscle-gain",
        title: "Набор массы",
        type: "group",
        description: "Силовые планы, восстановление и разбор техники.",
        participantIds: ["all"],
        createdAt: "2026-06-04T08:37:00.000Z",
      },
      {
        id: "group-yoga",
        title: "Йога",
        type: "group",
        description: "Растяжка, дыхание, спокойные практики и расписание.",
        participantIds: ["all"],
        createdAt: "2026-06-04T08:38:00.000Z",
      },
      {
        id: "group-beginners",
        title: "Новички",
        type: "group",
        description: "Первые шаги в клубе, правила и помощь админа.",
        participantIds: ["all"],
        createdAt: "2026-06-04T08:39:00.000Z",
      },
      {
        id: "direct-maria",
        title: "Мария Соколова",
        type: "direct",
        description: "Тренер по йоге",
        participantIds: ["demo-client", "trainer-maria"],
        createdAt: "2026-06-04T08:40:00.000Z",
      },
      {
        id: "direct-alexey",
        title: "Алексей Орлов",
        type: "direct",
        description: "Силовой тренер",
        participantIds: ["demo-client", "trainer-alexey"],
        createdAt: "2026-06-04T08:41:00.000Z",
      },
      {
        id: "direct-admin",
        title: "Елена",
        type: "direct",
        description: "Администратор",
        participantIds: ["demo-client", "admin-elena"],
        createdAt: "2026-06-04T08:42:00.000Z",
      },
    ],
    messages: [
      {
        id: "msg-welcome",
        chatId: "club-main",
        author: "Елена, админ",
        text: "Добро пожаловать в MyFitClub! Здесь будут новости клуба, объявления и важные изменения.",
        role: "admin",
        createdAt: "2026-06-04T09:00:00.000Z",
      },
      {
        id: "msg-yoga",
        chatId: "club-main",
        author: "Мария, тренер",
        text: "Сегодня в 18:00 йога в зале 2. Возьмите коврики и воду.",
        role: "trainer",
        createdAt: "2026-06-04T10:30:00.000Z",
      },
      {
        id: "msg-question",
        chatId: "club-main",
        author: "Игорь",
        text: "Кто идет на функциональную тренировку в субботу?",
        role: "client",
        createdAt: "2026-06-04T11:20:00.000Z",
      },
      {
        id: "msg-nutrition",
        chatId: "group-nutrition",
        author: "Мария, тренер",
        text: "Сегодня обсуждаем простой завтрак перед тренировкой.",
        role: "trainer",
        createdAt: "2026-06-04T12:00:00.000Z",
      },
      {
        id: "msg-yoga-group",
        chatId: "group-yoga",
        author: "Мария, тренер",
        text: "В группе Йога выложу дыхательную практику на вечер.",
        role: "trainer",
        createdAt: "2026-06-04T12:10:00.000Z",
      },
      {
        id: "msg-direct-maria",
        chatId: "direct-maria",
        author: "Мария Соколова",
        text: "Могу подобрать мягкую программу на эту неделю.",
        role: "trainer",
        createdAt: "2026-06-04T12:40:00.000Z",
      },
      {
        id: "msg-direct-alexey",
        chatId: "direct-alexey",
        author: "Алексей Орлов",
        text: "После тренировки пришлю технику приседа.",
        role: "trainer",
        createdAt: "2026-06-04T11:15:00.000Z",
      },
      {
        id: "msg-direct-admin",
        chatId: "direct-admin",
        author: "Елена",
        text: "Ваш абонемент активен до конца месяца.",
        role: "admin",
        createdAt: "2026-06-04T09:30:00.000Z",
      },
    ],
    clubMessages: [],
    bookings: [],
    notifications: [
      {
        id: "notification-yoga",
        time: "Сегодня, 17:00",
        title: "Напоминание о тренировке",
        text: "Йога и мобильность начнется через час. Возьмите воду и коврик.",
        isRead: false,
      },
      {
        id: "notification-functional",
        time: "Завтра, 09:00",
        title: "Новое объявление клуба",
        text: "Открыта запись на субботнюю функциональную тренировку.",
        isRead: false,
      },
      {
        id: "notification-challenge",
        time: "Пн, 08:30",
        title: "Челлендж недели",
        text: "Проверьте группу Питание и отметьте первый день дневника воды.",
        isRead: false,
      },
    ],
  };

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function generateId(prefix) {
    return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  function read() {
    const raw = localStorage.getItem(DB_KEY);

    if (!raw) {
      const initialDb = clone(seed);
      localStorage.setItem(DB_KEY, JSON.stringify(initialDb));
      return initialDb;
    }

    try {
      return {
        ...clone(seed),
        ...JSON.parse(raw),
      };
    } catch {
      const initialDb = clone(seed);
      localStorage.setItem(DB_KEY, JSON.stringify(initialDb));
      return initialDb;
    }
  }

  function write(db) {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
    return db;
  }

  function update(mutator) {
    const db = read();
    mutator(db);
    return write(db);
  }

  function list(collectionName) {
    return read()[collectionName] || [];
  }

  function replace(collectionName, items) {
    return update((db) => {
      db[collectionName] = items;
    });
  }

  function add(collectionName, item) {
    const record = {
      id: item.id || generateId(collectionName),
      ...item,
    };

    update((db) => {
      db[collectionName] = [...(db[collectionName] || []), record];
    });

    return record;
  }

  function count(collectionName) {
    return list(collectionName).length;
  }

  function reset() {
    localStorage.setItem(DB_KEY, JSON.stringify(clone(seed)));
    return read();
  }

  return {
    add,
    count,
    list,
    read,
    replace,
    reset,
    update,
  };
})();
