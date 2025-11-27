import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBsdPghRmOsLX7JIj-T8IYF4bRp-KxQAPc",
  authDomain: "cybee-ca5a2.firebaseapp.com",
  projectId: "cybee-ca5a2",
  storageBucket: "cybee-ca5a2.firebasestorage.app",
  messagingSenderId: "215321650697",
  appId: "1:215321650697:web:d0bbf35f6861a891c9bad8",
  measurementId: "G-K624Y57R5Q"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);