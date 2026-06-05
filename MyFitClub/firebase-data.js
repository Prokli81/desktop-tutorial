(function initMyFitClubFirestore() {
  const COLLECTIONS = [
    "chats",
    "messages",
    "scheduleEvents",
    "bookings",
    "notifications",
    "invitationCodes",
    "users",
  ];

  const cache = Object.fromEntries(COLLECTIONS.map((name) => [name, []]));
  let ready = false;
  let onRefresh = null;
  let unsubscribers = [];

  function generateId(prefix) {
    return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  function sortByCreatedAt(items) {
    return [...items].sort((left, right) => {
      const leftTime = new Date(left.createdAt || 0).getTime();
      const rightTime = new Date(right.createdAt || 0).getTime();
      return leftTime - rightTime;
    });
  }

  function setOnRefresh(callback) {
    onRefresh = callback;
  }

  function notifyRefresh() {
    if (typeof onRefresh === "function") {
      onRefresh();
    }
  }

  function isReady() {
    return ready;
  }

  function list(collectionName) {
    return cache[collectionName] || [];
  }

  function count(collectionName) {
    return list(collectionName).length;
  }

  async function getDb() {
    const services = await window.MyFitClubFirebase.init();
    return services.db;
  }

  async function seedIfNeeded(db) {
    const seedRef = db.collection("meta").doc("seed");
    const seedSnap = await seedRef.get();

    if (seedSnap.exists) {
      return;
    }

    const source = MyFitClubStore.read();
    const batch = db.batch();

    source.chats.forEach((chat) => {
      batch.set(db.collection("chats").doc(chat.id), chat);
    });

    source.messages.forEach((message) => {
      batch.set(db.collection("messages").doc(message.id), message);
    });

    source.scheduleEvents.forEach((event) => {
      batch.set(db.collection("scheduleEvents").doc(event.id), event);
    });

    source.notifications.forEach((notification) => {
      batch.set(db.collection("notifications").doc(notification.id), notification);
    });

    source.invitationCodes.forEach((inviteCode) => {
      batch.set(db.collection("invitationCodes").doc(inviteCode.code), inviteCode);
    });

    batch.set(seedRef, {
      version: 1,
      seededAt: new Date().toISOString(),
    });

    await batch.commit();
  }

  function watchCollection(db, collectionName, mapper) {
    const unsubscribe = db.collection(collectionName).onSnapshot(
      (snapshot) => {
        cache[collectionName] = snapshot.docs.map((doc) => mapper(doc));
        notifyRefresh();
      },
      (error) => {
        console.warn(`MyFitClub Firestore listener failed: ${collectionName}`, error);
      },
    );

    unsubscribers.push(unsubscribe);
  }

  async function init() {
    if (!window.MyFitClubFirebase.isEnabled()) {
      return false;
    }

    if (ready) {
      return true;
    }

    const db = await getDb();
    await seedIfNeeded(db);

    watchCollection(db, "chats", (doc) => ({ id: doc.id, ...doc.data() }));
    watchCollection(db, "messages", (doc) => ({ id: doc.id, ...doc.data() }));
    watchCollection(db, "scheduleEvents", (doc) => ({ id: doc.id, ...doc.data() }));
    watchCollection(db, "bookings", (doc) => ({ id: doc.id, ...doc.data() }));
    watchCollection(db, "notifications", (doc) => ({ id: doc.id, ...doc.data() }));
    watchCollection(db, "invitationCodes", (doc) => ({ id: doc.id, ...doc.data() }));
    watchCollection(db, "users", (doc) => ({ id: doc.id, ...doc.data() }));

    ready = true;
    notifyRefresh();
    return true;
  }

  function destroy() {
    unsubscribers.forEach((unsubscribe) => unsubscribe());
    unsubscribers = [];
    ready = false;
    COLLECTIONS.forEach((name) => {
      cache[name] = [];
    });
  }

  async function writeRecord(collectionName, record) {
    const db = await getDb();
    await db.collection(collectionName).doc(record.id).set(record, { merge: true });
  }

  function add(collectionName, item) {
    const record = {
      id:
        collectionName === "invitationCodes" && item.code
          ? item.code
          : item.id || generateId(collectionName),
      ...item,
    };

    cache[collectionName] = [...list(collectionName), record];
    notifyRefresh();
    writeRecord(collectionName, record).catch((error) => {
      console.warn(`MyFitClub Firestore add failed: ${collectionName}`, error);
    });
    return record;
  }

  async function replaceBookings(items) {
    const db = await getDb();
    const userId = items[0]?.userId;

    if (!userId) {
      return;
    }

    const existing = await db.collection("bookings").where("userId", "==", userId).get();
    const batch = db.batch();

    existing.docs.forEach((doc) => batch.delete(doc.ref));
    items.forEach((booking) => {
      batch.set(db.collection("bookings").doc(booking.id), booking);
    });

    await batch.commit();
  }

  function replace(collectionName, items) {
    if (collectionName === "bookings") {
      cache.bookings = [
        ...cache.bookings.filter((booking) => booking.userId !== items[0]?.userId),
        ...items,
      ];
      notifyRefresh();
      replaceBookings(items).catch((error) => {
        console.warn("MyFitClub Firestore bookings sync failed", error);
      });
      return items;
    }

    if (collectionName === "users") {
      cache.users = items;
      notifyRefresh();
      items.forEach((user) => {
        if (user.id) {
          writeRecord("users", user).catch((error) => {
            console.warn("MyFitClub Firestore users sync failed", error);
          });
        }
      });
      return items;
    }

    cache[collectionName] = items;
    notifyRefresh();
    items.forEach((item) => {
      writeRecord(collectionName, item).catch((error) => {
        console.warn(`MyFitClub Firestore replace failed: ${collectionName}`, error);
      });
    });
    return items;
  }

  async function incrementInviteCode(code) {
    const db = await getDb();
    const docRef = db.collection("invitationCodes").doc(code);
    const snapshot = await docRef.get();

    if (!snapshot.exists) {
      return;
    }

    const current = snapshot.data();
    await docRef.set(
      {
        ...current,
        usedCount: (current.usedCount || 0) + 1,
      },
      { merge: true },
    );
  }

  function update(mutator) {
    const draft = Object.fromEntries(COLLECTIONS.map((name) => [name, list(name)]));
    mutator(draft);

    if (draft.invitationCodes !== cache.invitationCodes) {
      draft.invitationCodes.forEach((inviteCode) => {
        if (inviteCode.code) {
          writeRecord("invitationCodes", inviteCode).catch((error) => {
            console.warn("MyFitClub Firestore invite update failed", error);
          });
        }
      });
    }
  }

  window.MyFitClubFirestore = {
    add,
    count,
    destroy,
    incrementInviteCode,
    init,
    isReady,
    list,
    replace,
    setOnRefresh,
    sortByCreatedAt,
    update,
  };
})();
