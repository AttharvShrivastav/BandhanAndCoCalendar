// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getMessaging } from "firebase/messaging";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDXKPMBq0cqOwufdpywQVW4H8VLIQ7xyJw",
  authDomain: "bandhan-co-wedding.firebaseapp.com",
  projectId: "bandhan-co-wedding",
  storageBucket: "bandhan-co-wedding.firebasestorage.app",
  messagingSenderId: "858943900961",
  appId: "1:858943900961:web:cd64aaaf344670b88e8260",
  measurementId: "G-1SXNCTE27P"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

const messaging = getMessaging(app);

export { app, analytics, messaging };