import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDYour_Actual_API_Key_Here",
  authDomain: "comperra-done.firebaseapp.com",
  projectId: "comperra-done",
  storageBucket: "comperra-done.firebasestorage.app",
  messagingSenderId: "636329572028",
  appId: "1:636329572028:web:3958a4aeaf00c5efc142b9",
  measurementId: "G-DE1XJ5GGJ8"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);