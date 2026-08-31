// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBntT312d0m0VFSPkqiDVUomflUWzcKVB4",
  authDomain: "ayobangun-contractor.firebaseapp.com",
  projectId: "ayobangun-contractor",
  storageBucket: "ayobangun-contractor.firebasestorage.app",
  messagingSenderId: "1099399042051",
  appId: "1:1099399042051:web:764118e26a6cc479956a36",
  measurementId: "G-01F0KBG41D"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
