// Core Firebase SDKs
import { initializeApp, getApps } from "firebase/app";

// Add-on SDKs for the services you're using
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your Firebase config
// Project: Comperra (comperra-done)
// Public name: Comperra
// Support email: ochynoweth@luxsurfacesgroup.com
// Auth handler: https://comperra-done.firebaseapp.com/__/auth/handler
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyC7zXxEiPi77xZt2bPY1jcxt9fJcYxKk94",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "comperra-done.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "comperra-done",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "comperra-done.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "636329572028",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:636329572028:web:aa3a66f248e5b320c142b9",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-QMBYGHYWRW"
};

// Initialize Firebase app (singleton pattern)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Init services
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);
const storage = getStorage(app);

// Export for use throughout your app
export { auth, provider, db, storage };