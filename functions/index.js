const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const { getMessaging } = require("firebase-admin/messaging");

initializeApp();

exports.pushOnNewMessage = onDocumentCreated("messages/{messageId}", async (event) => {
  const message = event.data?.data();

  if (!message?.chatId || !message?.text) {
    return;
  }

  const db = getFirestore();
  const chatSnap = await db.collection("chats").doc(message.chatId).get();
  const chatTitle = chatSnap.exists ? chatSnap.data().title : "MyFitClub";
  const usersSnap = await db.collection("users").get();
  const tokens = [];

  usersSnap.forEach((doc) => {
    const user = doc.data();

    if (doc.id === message.userId || user.isBlocked) {
      return;
    }

    if (user.fcmToken) {
      tokens.push(user.fcmToken);
    }
  });

  if (!tokens.length) {
    return;
  }

  await getMessaging().sendEachForMulticast({
    tokens,
    notification: {
      title: chatTitle,
      body: `${message.author}: ${message.text}`,
    },
    data: {
      chatId: message.chatId,
    },
  });
});
