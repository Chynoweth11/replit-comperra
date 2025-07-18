// Firebase initialization for server-side logging
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBrZcDGKrGnIQ4SZpQFvgJcbKiJfmKTKJc",
  authDomain: "comperra-done.firebaseapp.com",
  projectId: "comperra-done",
  storageBucket: "comperra-done.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123def456ghi789"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);