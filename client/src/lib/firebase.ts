import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCPpLCOqHk1RYeP8ihWx-IBRigHaLAcfPQ",
  authDomain: "comperra-7201f.firebaseapp.com",
  projectId: "comperra-7201f",
  storageBucket: "comperra-7201f.firebasestorage.app",
  messagingSenderId: "183865914210",
  appId: "1:183865914210:web:859865a18cfe89ee76b23b",
  measurementId: "G-WN90R8THKT"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);