// firebase.js
import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC7zXxEiPi77xZt2bPY1jcxt9fJcYxKk94",
  authDomain: "comperra-done.firebaseapp.com",
  projectId: "comperra-done",
  storageBucket: "comperra-done.appspot.com",
  messagingSenderId: "636329572028",
  appId: "1:636329572028:web:0c8fd582b0372411c142b9",
  measurementId: "G-SBT7935DTH"
};

// Initialize Firebase (only if no app exists)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Export Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);
export default app;