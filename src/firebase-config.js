// 1. Pehle zaroori functions import karein
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; // Ye add kiya
import { getAuth } from "firebase/auth";           // Ye add kiya

// 2. Aapka apna config
const firebaseConfig = {
  apiKey: "AIzaSyCOtl9oIpJIplh1d6vslj2iH7oxxU6luHw",
  authDomain: "mynotesapp-19acf.firebaseapp.com",
  projectId: "mynotesapp-19acf",
  storageBucket: "mynotesapp-19acf.firebasestorage.app",
  messagingSenderId: "581884398135",
  appId: "1:581884398135:web:f3509f4199ad7a322a0db2"
};

// 3. Firebase ko initialize karein
const app = initializeApp(firebaseConfig);

// 4. Database (db) aur Auth ko export karein taakay App.js mein use ho saken
export const db = getFirestore(app);
export const auth = getAuth(app);