// public/firebase-messaging-sw.js

importScripts("https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyDXKPMBq0cqOwufdpywQVW4H8VLIQ7xyJw",
  authDomain: "bandhan-co-wedding.firebaseapp.com",
  projectId: "bandhan-co-wedding",
  messagingSenderId: "858943900961",
  appId: "1:858943900961:web:cd64aaaf344670b88e8260",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
    icon: "/icon.png",
  });
});