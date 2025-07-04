import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, addDoc, connectFirestoreEmulator } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyC7zXxEiPi77xZt2bPY1jcxt9fJcYxKk94",
  authDomain: "comperra-done.firebaseapp.com",
  projectId: "comperra-done",
  storageBucket: "comperra-done.firebasestorage.app",
  messagingSenderId: "636329572028",
  appId: "1:636329572028:web:0c8fd582b0372411c142b9",
  measurementId: "G-SBT7935DTH"
};

export async function initializeFirebaseCollections() {
  try {
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

    // Try to create each collection with a timeout
    for (const col of collectionsToCreate) {
      try {
        await Promise.race([
          addDoc(collection(db, col.name), col.data),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
        ]);
        console.log(`✅ Collection ${col.name} initialized`);
      } catch (error) {
        console.log(`⚠️  Collection ${col.name} initialization skipped: ${error instanceof Error ? error.message : 'Unknown error'}`);
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