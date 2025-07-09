// Core Firebase SDKs
import { initializeApp, getApps } from "firebase/app";

// Add-on SDKs for the services you're using
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your Firebase config
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyC7zXxEiPi77xZt2bPY1jcxt9fJcYxKk94",
  authDomain: "comperra-done.firebaseapp.com",
  projectId: "comperra-done",
  storageBucket: "comperra-done.appspot.com",
  messagingSenderId: "636329572028",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:636329572028:web:aa3a66f248e5b320c142b9",
  measurementId: "G-QMBYGHYWRW"
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