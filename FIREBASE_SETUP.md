# Firebase Integration Setup Guide

## ✅ Completed Steps

### 1. **Firebase SDK Installation**
```bash
npm install firebase
```
**Status**: ✅ Installed successfully

### 2. **Firebase Configuration**
Created `firebase.js` in project root with your configuration:
```javascript
// firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyC7zXxEiPi77xZt2bPY1jcxt9fJcYxKk94",
  authDomain: "comperra-done.firebaseapp.com",
  projectId: "comperra-done",
  storageBucket: "comperra-done.appspot.com",
  messagingSenderId: "636329572028",
  appId: "1:636329572028:web:0c8fd582b0372411c142b9",
  measurementId: "G-SBT7935DTH"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export default app;
```
**Status**: ✅ Configuration created

### 3. **Demo Components Created**
- `client/src/components/FirebaseExamples.tsx` - Authentication and Firestore examples
- `client/src/pages/FirebaseDemo.tsx` - Complete demo page
- Added route `/firebase-demo` to App.tsx
**Status**: ✅ Demo components ready

## 🎯 How to Use Firebase in Your Components

### Authentication Example
```javascript
import { db, auth } from '../../../firebase.js';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

// Create user
const handleSignUp = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    console.log("✅ User created:", userCredential.user);
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
};

// Sign in user
const handleSignIn = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log("✅ Signed in:", userCredential.user);
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
};
```

### Firestore Database Example
```javascript
import { collection, addDoc, getDocs } from 'firebase/firestore';

// Save lead to Firestore
const submitLead = async (leadData) => {
  try {
    const docRef = await addDoc(collection(db, "leads"), {
      ...leadData,
      timestamp: new Date(),
      status: 'new'
    });
    console.log("📄 Lead saved with ID:", docRef.id);
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
};

// Read leads from Firestore
const fetchLeads = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "leads"));
    const leads = [];
    querySnapshot.forEach((doc) => {
      leads.push({ id: doc.id, ...doc.data() });
    });
    return leads;
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
};
```

## 🔧 Test Your Setup

### Visit Firebase Demo Page
Navigate to: `http://localhost:5000/firebase-demo`

This page includes:
1. **User Authentication** - Sign up and sign in functionality
2. **Lead Submission** - Save data to Firestore
3. **View Leads** - Read data from Firestore
4. **Configuration Status** - Verify Firebase connection

### Test Firebase Authentication
1. Enter email and password
2. Click "Sign Up" to create a new user
3. Check browser console for success/error messages

### Test Firestore Database
1. Fill out the lead submission form
2. Click "Submit Lead"
3. Click "Fetch Leads" to view saved data
4. Check browser console for document IDs

## 🏗️ Integration with Existing Comperra Features

### Lead Capture System
Replace existing Airtable-only lead capture with Firebase:
```javascript
// Update existing lead capture components
import { db } from '../../../firebase.js';
import { collection, addDoc } from 'firebase/firestore';

const saveLead = async (leadData) => {
  await addDoc(collection(db, "comperra-leads"), leadData);
};
```

### User Authentication
Integrate with existing authentication system:
```javascript
// Replace existing auth context
import { auth } from '../../../firebase.js';
import { onAuthStateChanged } from 'firebase/auth';

useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    setUser(user);
  });
  return unsubscribe;
}, []);
```

### Product Data Storage
Store scraped products in Firestore:
```javascript
// Update scraping system
const saveProduct = async (productData) => {
  await addDoc(collection(db, "comperra-products"), productData);
};
```

## 🚀 Next Steps

1. **Test the demo page** at `/firebase-demo`
2. **Verify Firebase Console** - Check if data appears in your Firebase project
3. **Update existing components** to use Firebase instead of memory storage
4. **Configure Firebase Security Rules** for production deployment
5. **Set up environment variables** for production vs development

## 🔒 Security Notes

- **Current setup**: Using hardcoded config (acceptable for client-side Firebase)
- **Production**: Consider environment variables for different environments
- **Database rules**: Configure Firestore security rules before production deployment
- **Authentication**: Enable only required auth providers in Firebase Console

## 📊 Database Collections

Your Firebase project will have these collections:
- `leads` - Lead capture data
- `comperra-products` - Scraped product data  
- `comperra-articles` - Buying guides and articles
- `comperra-brands` - Manufacturer information
- `sample_requests` - Product sample requests
- `pricing_requests` - Pricing inquiry data

Firebase is now fully integrated and ready to use! 🎉