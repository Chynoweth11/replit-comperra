import * as geofire from 'geofire-common';
import { db } from './firebase-init.js';
import { doc, updateDoc, collection, getDocs, writeBatch } from 'firebase/firestore';

/**
 * Utility functions for geohash operations
 */

/**
 * Add geohash to a user based on their coordinates
 */
export async function addGeohashToUser(userId: string, latitude: number, longitude: number): Promise<void> {
  try {
    const geohash = geofire.geohashForLocation([latitude, longitude]);
    
    if (db) {
      await updateDoc(doc(db, 'users', userId), {
        geohash: geohash,
        latitude: latitude,
        longitude: longitude,
        lastUpdated: new Date().toISOString()
      });
      console.log(`✅ Added geohash ${geohash} to user ${userId}`);
    } else {
      console.log('⚠️ Firebase not available for geohash update');
    }
  } catch (error) {
    console.error(`❌ Error adding geohash to user ${userId}:`, error);
    throw error;
  }
}

/**
 * Batch add geohashes to all users missing them
 */
export async function batchAddGeohashesToUsers(): Promise<number> {
  if (!db) {
    console.log('⚠️ Firebase not available for batch geohash update');
    return 0;
  }

  try {
    const usersSnapshot = await getDocs(collection(db, 'users'));
    const batch = writeBatch(db);
    let updatedCount = 0;

    usersSnapshot.forEach((doc) => {
      const user = doc.data();
      
      if (user.latitude && user.longitude && !user.geohash) {
        const geohash = geofire.geohashForLocation([user.latitude, user.longitude]);
        batch.update(doc.ref, {
          geohash: geohash,
          lastUpdated: new Date().toISOString()
        });
        updatedCount++;
      }
    });

    if (updatedCount > 0) {
      await batch.commit();
      console.log(`✅ Added geohashes to ${updatedCount} users`);
    } else {
      console.log('✅ All users already have geohashes');
    }

    return updatedCount;
  } catch (error) {
    console.error('❌ Error in batch geohash update:', error);
    throw error;
  }
}

/**
 * Helper function to get coordinates from ZIP code
 */
export function getCoordinatesFromZip(zipCode: string): { latitude: number; longitude: number } | null {
  const ZIP_COORDS: Record<string, { latitude: number; longitude: number }> = {
    // Arizona
    "85001": { latitude: 33.4484, longitude: -112.0740 },
    "85281": { latitude: 33.42, longitude: -111.93 },
    "86001": { latitude: 35.2, longitude: -111.65 },
    "86004": { latitude: 35.21, longitude: -111.82 },
    "86301": { latitude: 34.54, longitude: -112.47 },
    
    // California
    "90210": { latitude: 34.0901, longitude: -118.4065 },
    "90024": { latitude: 34.0628, longitude: -118.4426 },
    "91101": { latitude: 34.1478, longitude: -118.1445 },
    "92101": { latitude: 32.7157, longitude: -117.1611 },
    "94102": { latitude: 37.7749, longitude: -122.4194 },
    
    // Colorado
    "80202": { latitude: 39.7547, longitude: -105.0178 },
    "80301": { latitude: 40.0150, longitude: -105.2705 },
    "80904": { latitude: 38.8339, longitude: -104.8214 },
    "81620": { latitude: 39.1911, longitude: -106.8175 }, // Avon, CO
    
    // Florida
    "33139": { latitude: 25.7907, longitude: -80.1300 },
    "33101": { latitude: 25.7617, longitude: -80.1918 },
    "33301": { latitude: 26.1224, longitude: -80.1373 },
    "32801": { latitude: 28.5383, longitude: -81.3792 },
    
    // Texas
    "75201": { latitude: 32.7811, longitude: -96.7972 },
    "77001": { latitude: 29.7604, longitude: -95.3698 },
    "78701": { latitude: 30.2672, longitude: -97.7431 },
    
    // New York
    "10001": { latitude: 40.7505, longitude: -73.9980 },
    "10002": { latitude: 40.7209, longitude: -73.9876 },
    "11201": { latitude: 40.6928, longitude: -73.9903 },
    
    // Illinois
    "60611": { latitude: 41.8918, longitude: -87.6224 },
    "60601": { latitude: 41.8781, longitude: -87.6298 },
    
    // Georgia
    "30309": { latitude: 33.7901, longitude: -84.3902 },
    "30303": { latitude: 33.7490, longitude: -84.3880 },
    
    // Washington
    "98101": { latitude: 47.6062, longitude: -122.3321 },
    "98102": { latitude: 47.6237, longitude: -122.3017 },
    
    // Massachusetts
    "02108": { latitude: 42.3751, longitude: -71.0603 },
    "02101": { latitude: 42.3584, longitude: -71.0598 },
  };

  return ZIP_COORDS[zipCode] || null;
}

/**
 * Create a properly formatted user document for Firebase with geohash
 */
export function createUserDocumentWithGeohash(userData: any): any {
  const coordinates = getCoordinatesFromZip(userData.zipCode);
  
  if (!coordinates) {
    throw new Error(`Invalid ZIP code: ${userData.zipCode}`);
  }

  const geohash = geofire.geohashForLocation([coordinates.latitude, coordinates.longitude]);

  return {
    ...userData,
    latitude: coordinates.latitude,
    longitude: coordinates.longitude,
    geohash: geohash,
    isActive: true,
    serviceRadius: userData.serviceRadius || 50,
    createdAt: new Date().toISOString(),
    lastUpdated: new Date().toISOString()
  };
}

export default {
  addGeohashToUser,
  batchAddGeohashesToUsers,
  getCoordinatesFromZip,
  createUserDocumentWithGeohash
};