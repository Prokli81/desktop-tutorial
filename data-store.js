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
    clubMessages: [
      {
        id: "msg-welcome",
        author: "Елена, админ",
        text: "Добро пожаловать в MyFitClub! Здесь будут новости клуба, объявления и важные изменения.",
        role: "admin",
        createdAt: "2026-06-04T09:00:00.000Z",
      },
      {
        id: "msg-yoga",
        author: "Мария, тренер",
        text: "Сегодня в 18:00 йога в зале 2. Возьмите коврики и воду.",
        role: "trainer",
        createdAt: "2026-06-04T10:30:00.000Z",
      },
      {
        id: "msg-question",
        author: "Игорь",
        text: "Кто идет на функциональную тренировку в субботу?",
        role: "client",
        createdAt: "2026-06-04T11:20:00.000Z",
      },
    ],
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
