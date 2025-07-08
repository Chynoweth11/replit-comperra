import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, addDoc, connectFirestoreEmulator } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || "AIzaSyDGOOGLE_API_KEYFREBASE",
  authDomain: "comperra-done.firebaseapp.com",
  projectId: "comperra-done",
  storageBucket: "comperra-done.firebasestorage.app",
  messagingSenderId: "636329572028",
  appId: "1:636329572028:web:aa3a66f248e5b320c142b9",
  measurementId: "G-QMBYGHYWRW"
};

export async function initializeFirebaseCollections() {
  try {
    // Skip Firebase initialization if not properly configured
    if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
      console.log('⚠️  Firebase configuration missing, skipping initialization');
      return false;
    }

    // Initialize Firebase app if not already initialized
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    const db = getFirestore(app);
    
    console.log('🔄 Initializing Firebase collections...');
    
    // Simple approach: just try to create one document in each collection
    // This will automatically create the collections if they don't exist
    const collectionsToCreate = [
      {
        name: 'comperra-products',
        data: {
          name: 'System Init Product',
          category: 'tiles',
          brand: 'System',
          price: '0.00',
          specifications: {},
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      },
      {
        name: 'leads',
        data: {
          email: 'system@comperra.com',
          interest: 'System initialization',
          customerType: 'system',
          createdAt: new Date().toISOString()
        }
      },
      {
        name: 'vendors',
        data: {
          companyName: 'System Vendor',
          email: 'system@comperra.com',
          active: true,
          createdAt: new Date().toISOString()
        }
      },
      {
        name: 'trades',
        data: {
          name: 'System Trade',
          trade: 'System',
          email: 'system@comperra.com',
          createdAt: new Date().toISOString()
        }
      },
      {
        name: 'customers',
        data: {
          name: 'System Customer',
          email: 'system@comperra.com',
          customerType: 'system',
          createdAt: new Date().toISOString()
        }
      }
    ];

    // Try to create each collection with a timeout - silently fail on permission errors
    for (const col of collectionsToCreate) {
      try {
        await Promise.race([
          addDoc(collection(db, col.name), col.data),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 2000))
        ]);
        console.log(`✅ Collection ${col.name} initialized`);
      } catch (error) {
        // Silently skip permission errors and other Firebase issues
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        if (errorMessage.includes('PERMISSION_DENIED') || errorMessage.includes('Timeout')) {
          console.log(`⚠️  Collection ${col.name} initialization skipped: Firebase permissions`);
        } else {
          console.log(`⚠️  Collection ${col.name} initialization skipped: ${errorMessage}`);
        }
      }
    }
    
    console.log('✅ Firebase collections initialization completed');
    return true;
  } catch (error) {
    console.log('⚠️  Firebase initialization failed:', error instanceof Error ? error.message : 'Unknown error');
    return false;
  }
}

export { firebaseConfig };