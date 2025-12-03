// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBubvv0lIF-Oei4MN-7idhvGXkCr9pBNbw",
  authDomain: "studio-5-project.firebaseapp.com",
  projectId: "studio-5-project",
  storageBucket: "studio-5-project.firebasestorage.app",
  messagingSenderId: "517347769469",
  appId: "1:517347769469:web:6d6866f31802e6d5ae0514",
  measurementId: "G-LL7YGLQ2KQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
