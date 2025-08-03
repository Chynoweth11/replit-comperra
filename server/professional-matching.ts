import { collection, query, where, getDocs, doc, setDoc, getDoc, updateDoc, serverTimestamp, addDoc, getFirestore } from 'firebase/firestore';
import { initializeApp, getApps } from 'firebase/app';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
  measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase if not already initialized
let db: any = null;
let isFirebaseAvailable = false;

try {
  if (firebaseConfig.apiKey && firebaseConfig.projectId) {
    if (!getApps().length) {
      initializeApp(firebaseConfig);
    }
    db = getFirestore();
    isFirebaseAvailable = true;
    console.log('✅ Professional matching Firebase initialized successfully');
  } else {
    console.log('⚠️ Professional matching Firebase configuration missing');
  }
} catch (error) {
  console.log('⚠️ Professional matching Firebase initialization failed:', error.message);
}
import * as geolib from 'geolib';
import * as geofire from 'geofire-common';

/**
 * Enhanced professional matching system with Firebase integration
 */

// Comprehensive ZIP code database for matching
const ZIP_COORDS: Record<string, { lat: number; lng: number }> = {
  // Colorado (User's area)
  "80202": { lat: 39.7547, lng: -105.0178 }, // Denver
  "80301": { lat: 40.0150, lng: -105.2705 }, // Boulder
  "80904": { lat: 38.8339, lng: -104.8214 }, // Colorado Springs
  "81620": { lat: 39.1911, lng: -106.8175 }, // Avon
  "81615": { lat: 39.6403, lng: -106.3781 }, // Vail
  "81435": { lat: 37.9358, lng: -107.8123 }, // Telluride
  "81301": { lat: 37.2753, lng: -107.8801 }, // Durango
  "80424": { lat: 39.6403, lng: -106.0556 }, // Breckenridge
  "80424": { lat: 39.4797, lng: -106.0444 }, // Keystone
  "81224": { lat: 38.8675, lng: -106.0884 }, // Buena Vista
  
  // Major US markets
  "90210": { lat: 34.0901, lng: -118.4065 }, // Beverly Hills, CA
  "10001": { lat: 40.7505, lng: -73.9934 }, // New York, NY
  "60601": { lat: 41.8781, lng: -87.6298 }, // Chicago, IL
  "77001": { lat: 29.7604, lng: -95.3698 }, // Houston, TX
  "85001": { lat: 33.4484, lng: -112.0740 }, // Phoenix, AZ
  "33101": { lat: 25.7617, lng: -80.1918 }, // Miami, FL
  "98101": { lat: 47.6062, lng: -122.3321 }, // Seattle, WA
  "30301": { lat: 33.7490, lng: -84.3880 }, // Atlanta, GA
  "02101": { lat: 42.3601, lng: -71.0589 }, // Boston, MA
  "94102": { lat: 37.7749, lng: -122.4194 }, // San Francisco, CA
};

export interface ProfessionalProfile {
  uid: string;
  role: 'vendor' | 'trade';
  email: string;
  name: string;
  businessName?: string;
  phone?: string;
  zipCode: string;
  latitude: number;
  longitude: number;
  geohash: string;
  serviceRadius: number;
  productCategories?: string[];
  tradeCategories?: string[];
  specialty?: string;
  licenseNumber?: string;
  yearsExperience?: number;
  certifications?: string[];
  serviceAreas?: string[];
  availability?: string;
  minimumProject?: number;
  createdAt: any;
  lastActive: any;
  verified: boolean;
  rating?: number;
  reviewCount?: number;
}

export interface LeadRequest {
  customerUid: string;
  customerEmail: string;
  customerName?: string;
  customerPhone?: string;
  zipCode: string;
  materialCategory: string;
  projectType: string;
  projectDetails: string;
  budget?: number;
  timeline?: string;
  urgency: 'low' | 'medium' | 'high';
  isLookingForPro: boolean;
  createdAt: any;
}

export interface MatchResult {
  leadId: string;
  matchedVendors: ProfessionalProfile[];
  matchedTrades: ProfessionalProfile[];
  totalMatches: number;
  averageDistance: number;
  status: 'matched' | 'partial' | 'no_match';
}

// In-memory fallback professional database
const fallbackProfessionals: ProfessionalProfile[] = [
  {
    uid: 'prof_001',
    role: 'vendor',
    email: 'rockymountaintile@gmail.com',
    name: 'Rocky Mountain Tile Supply',
    businessName: 'Rocky Mountain Tile Supply',
    phone: '(303) 555-0123',
    zipCode: '80301',
    latitude: 40.0150,
    longitude: -105.2705,
    geohash: createGeohash(40.0150, -105.2705),
    serviceRadius: 75,
    productCategories: ['tiles', 'stone', 'slabs'],
    specialty: 'Natural stone and ceramic tiles',
    yearsExperience: 12,
    createdAt: new Date(),
    lastActive: new Date(),
    verified: true,
    rating: 4.8,
    reviewCount: 156
  },
  {
    uid: 'prof_002',
    role: 'trade',
    email: 'denverflooringpro@gmail.com',
    name: 'Denver Flooring Professionals',
    businessName: 'Denver Flooring Professionals',
    phone: '(303) 555-0124',
    zipCode: '80202',
    latitude: 39.7547,
    longitude: -105.0178,
    geohash: createGeohash(39.7547, -105.0178),
    serviceRadius: 50,
    tradeCategories: ['tiles', 'hardwood', 'vinyl', 'carpet'],
    specialty: 'Residential and commercial flooring installation',
    licenseNumber: 'FL-2024-789',
    yearsExperience: 8,
    createdAt: new Date(),
    lastActive: new Date(),
    verified: true,
    rating: 4.9,
    reviewCount: 98
  },
  {
    uid: 'prof_003',
    role: 'vendor',
    email: 'avonflooring@gmail.com',
    name: 'Avon Flooring Center',
    businessName: 'Avon Flooring Center',
    phone: '(970) 555-0125',
    zipCode: '81620',
    latitude: 39.1911,
    longitude: -106.8175,
    geohash: createGeohash(39.1911, -106.8175),
    serviceRadius: 60,
    productCategories: ['hardwood', 'vinyl', 'carpet'],
    specialty: 'Mountain luxury flooring',
    yearsExperience: 15,
    createdAt: new Date(),
    lastActive: new Date(),
    verified: true,
    rating: 4.7,
    reviewCount: 73
  },
  {
    uid: 'prof_004',
    role: 'trade',
    email: 'vailheating@gmail.com',
    name: 'Vail Heating Solutions',
    businessName: 'Vail Heating Solutions',
    phone: '(970) 555-0126',
    zipCode: '81615',
    latitude: 39.6403,
    longitude: -106.3781,
    geohash: createGeohash(39.6403, -106.3781),
    serviceRadius: 40,
    tradeCategories: ['heating', 'thermostats'],
    specialty: 'Radiant floor heating systems',
    licenseNumber: 'HV-2024-456',
    yearsExperience: 20,
    createdAt: new Date(),
    lastActive: new Date(),
    verified: true,
    rating: 5.0,
    reviewCount: 45
  },
  {
    uid: 'prof_005',
    role: 'vendor',
    email: 'coloradostone@gmail.com',
    name: 'Colorado Stone Works',
    businessName: 'Colorado Stone Works',
    phone: '(303) 555-0127',
    zipCode: '80904',
    latitude: 38.8339,
    longitude: -104.8214,
    geohash: createGeohash(38.8339, -104.8214),
    serviceRadius: 80,
    productCategories: ['stone', 'slabs', 'tiles'],
    specialty: 'Natural stone countertops and flooring',
    yearsExperience: 18,
    createdAt: new Date(),
    lastActive: new Date(),
    verified: true,
    rating: 4.6,
    reviewCount: 124
  }
];

// In-memory leads storage
const leads: any[] = [];

/**
 * Create geohash for coordinates
 */
function createGeohash(latitude: number, longitude: number): string {
  return geofire.geohashForLocation([latitude, longitude]);
}

/**
 * Get coordinates from ZIP code
 */
export function getCoordinatesFromZip(zipCode: string): { lat: number; lng: number } | null {
  return ZIP_COORDS[zipCode] || null;
}

/**
 * Register a new professional (vendor or trade)
 */
export async function registerProfessional(profileData: Omit<ProfessionalProfile, 'uid' | 'geohash' | 'createdAt' | 'lastActive' | 'verified'>): Promise<string> {
  try {
    // Get coordinates from ZIP code
    const coords = getCoordinatesFromZip(profileData.zipCode);
    if (!coords) {
      throw new Error('Invalid ZIP code - coordinates not found');
    }

    // Create geohash for efficient geographic queries
    const geohash = createGeohash(coords.lat, coords.lng);

    // Create complete professional profile
    const professionalProfile: ProfessionalProfile = {
      ...profileData,
      uid: '',
      latitude: coords.lat,
      longitude: coords.lng,
      geohash,
      createdAt: new Date(),
      lastActive: new Date(),
      verified: false,
      rating: 0,
      reviewCount: 0
    };

    let professionalId = `prof_${Date.now()}`;

    // Try Firebase first
    if (isFirebaseAvailable && db) {
      try {
        const docRef = await addDoc(collection(db, 'professionals'), professionalProfile);
        professionalId = docRef.id;
        
        // Update the profile with the document ID
        await updateDoc(docRef, { uid: docRef.id });

        // Also add to users collection for authentication integration
        await setDoc(doc(db, 'users', docRef.id), {
          ...professionalProfile,
          uid: docRef.id,
          signInMethod: 'professional_registration'
        }, { merge: true });

        console.log(`✅ Professional registered in Firebase: ${profileData.role} - ${profileData.businessName || profileData.name}`);
      } catch (firebaseError) {
        console.log('⚠️ Firebase registration failed, using fallback:', firebaseError.message);
      }
    }

    // Add to fallback database
    const fallbackProfile = {
      ...professionalProfile,
      uid: professionalId
    };
    
    fallbackProfessionals.push(fallbackProfile);
    console.log(`✅ Professional registered in fallback: ${profileData.role} - ${profileData.businessName || profileData.name}`);
    
    return professionalId;
  } catch (error) {
    console.error('❌ Professional registration failed:', error);
    throw error;
  }
}

/**
 * Enhanced geohash-based professional matching with fallback
 */
async function matchProfessionalsByGeohash(
  role: 'vendor' | 'trade',
  origin: { lat: number; lng: number },
  category: string,
  maxRadius: number = 100
): Promise<ProfessionalProfile[]> {
  let matched: ProfessionalProfile[] = [];

  // Try Firebase first if available
  if (isFirebaseAvailable && db) {
    try {
      const radiusInM = maxRadius * 1609.34; // Convert miles to meters
      const center = [origin.lat, origin.lng];
      const bounds = geofire.geohashQueryBounds(center, radiusInM);

      // Query each geohash bound
      for (const b of bounds) {
        const q = query(
          collection(db, 'professionals'),
          where('role', '==', role),
          where('geohash', '>=', b[0]),
          where('geohash', '<=', b[1])
        );

        const snapshot = await getDocs(q);
        
        for (const doc of snapshot.docs) {
          const professional = doc.data() as ProfessionalProfile;
          
          // Check if professional serves the requested category
          const categoryField = role === 'vendor' ? 'productCategories' : 'tradeCategories';
          const categories = professional[categoryField] || [];
          
          const normalizedCategory = category.toLowerCase();
          const categoryMatch = categories.some((cat: string) => 
            cat.toLowerCase().includes(normalizedCategory) || 
            normalizedCategory.includes(cat.toLowerCase()) ||
            cat.toLowerCase() === normalizedCategory
          );

          if (categoryMatch) {
            // Calculate distance
            const distanceInM = geolib.getDistance(
              { latitude: origin.lat, longitude: origin.lng },
              { latitude: professional.latitude, longitude: professional.longitude }
            );
            const distanceInMi = geolib.convertDistance(distanceInM, 'mi');

            // Check if within professional's service radius
            if (distanceInMi <= professional.serviceRadius) {
              matched.push({
                ...professional,
                distance: distanceInMi
              } as ProfessionalProfile & { distance: number });
            }
          }
        }
      }
    } catch (error) {
      console.log('⚠️ Firebase matching failed, using fallback:', error.message);
    }
  }

  // If no Firebase matches or Firebase unavailable, use fallback
  if (matched.length === 0) {
    console.log('🔄 Using fallback professional database for matching');
    
    // Filter fallback professionals by role and category
    const filtered = fallbackProfessionals.filter(professional => {
      if (professional.role !== role) return false;
      
      const categoryField = role === 'vendor' ? 'productCategories' : 'tradeCategories';
      const categories = professional[categoryField] || [];
      
      const normalizedCategory = category.toLowerCase();
      const categoryMatch = categories.some((cat: string) => 
        cat.toLowerCase().includes(normalizedCategory) || 
        normalizedCategory.includes(cat.toLowerCase()) ||
        cat.toLowerCase() === normalizedCategory
      );

      if (!categoryMatch) return false;

      // Calculate distance
      const distanceInM = geolib.getDistance(
        { latitude: origin.lat, longitude: origin.lng },
        { latitude: professional.latitude, longitude: professional.longitude }
      );
      const distanceInMi = geolib.convertDistance(distanceInM, 'mi');

      // Check if within professional's service radius
      return distanceInMi <= professional.serviceRadius;
    });

    // Add distance to each professional
    matched = filtered.map(professional => {
      const distanceInM = geolib.getDistance(
        { latitude: origin.lat, longitude: origin.lng },
        { latitude: professional.latitude, longitude: professional.longitude }
      );
      const distanceInMi = geolib.convertDistance(distanceInM, 'mi');

      return {
        ...professional,
        distance: distanceInMi
      } as ProfessionalProfile & { distance: number };
    });
  }

  // Sort by distance and rating
  matched.sort((a: any, b: any) => {
    const distanceWeight = 0.7;
    const ratingWeight = 0.3;
    
    const scoreA = (a.distance * distanceWeight) + ((5 - (a.rating || 0)) * ratingWeight);
    const scoreB = (b.distance * distanceWeight) + ((5 - (b.rating || 0)) * ratingWeight);
    
    return scoreA - scoreB;
  });

  return matched;
}

/**
 * Submit a lead request and match with professionals
 */
export async function submitLeadAndMatch(leadData: LeadRequest): Promise<MatchResult> {
  try {
    // Get coordinates from ZIP code
    const coords = getCoordinatesFromZip(leadData.zipCode);
    if (!coords) {
      throw new Error('Invalid ZIP code - coordinates not found');
    }

    // Create lead document
    const leadDoc = {
      ...leadData,
      coordinates: coords,
      status: 'pending',
      matchedAt: serverTimestamp()
    };

    // Add lead to Firestore
    const leadRef = await addDoc(collection(db, 'leads'), leadDoc);
    
    // Also store in local storage for offline access
    const { leadStorage } = await import('./lead-matching');
    const leadWithId = {
      ...leadDoc,
      id: leadRef.id,
      categoriesRequested: leadData.materialCategories || [leadData.materialCategory].filter(Boolean)
    };
    leadStorage.set(leadRef.id, leadWithId);
    console.log('💾 Lead stored in local storage with ID:', leadRef.id);
    console.log('💾 Customer email:', leadData.customerEmail);
    console.log('💾 Total leads in storage:', leadStorage.size);

    // Match with vendors
    const matchedVendors = await matchProfessionalsByGeohash('vendor', coords, leadData.materialCategory);
    
    // Match with trades (if looking for professionals)
    let matchedTrades: ProfessionalProfile[] = [];
    if (leadData.isLookingForPro) {
      matchedTrades = await matchProfessionalsByGeohash('trade', coords, leadData.materialCategory);
    }

    // Calculate match statistics
    const totalMatches = matchedVendors.length + matchedTrades.length;
    const allMatches = [...matchedVendors, ...matchedTrades];
    const averageDistance = totalMatches > 0 ? 
      allMatches.reduce((sum: number, p: any) => sum + (p.distance || 0), 0) / totalMatches : 0;

    // Determine match status
    let status: 'matched' | 'partial' | 'no_match' = 'no_match';
    if (totalMatches >= 3) {
      status = 'matched';
    } else if (totalMatches > 0) {
      status = 'partial';
    }

    // Update lead with match results
    await updateDoc(leadRef, {
      matchedVendors: matchedVendors.map(v => v.uid),
      matchedTrades: matchedTrades.map(t => t.uid),
      totalMatches,
      averageDistance,
      status,
      matchedAt: serverTimestamp()
    });

    // Notify matched professionals
    await notifyMatchedProfessionals([...matchedVendors, ...matchedTrades], leadRef.id, leadData);

    const result: MatchResult = {
      leadId: leadRef.id,
      matchedVendors: matchedVendors.slice(0, 10), // Limit to top 10
      matchedTrades: matchedTrades.slice(0, 10), // Limit to top 10
      totalMatches,
      averageDistance,
      status
    };

    console.log(`✅ Lead matched: ${totalMatches} professionals found for ${leadData.materialCategory} in ${leadData.zipCode}`);
    return result;
  } catch (error) {
    console.error('❌ Lead submission and matching failed:', error);
    throw error;
  }
}

/**
 * Notify matched professionals about new lead
 */
async function notifyMatchedProfessionals(
  professionals: ProfessionalProfile[],
  leadId: string,
  leadData: LeadRequest
): Promise<void> {
  const notifications = professionals.map(async (professional) => {
    try {
      await addDoc(collection(db, 'notifications'), {
        recipientUid: professional.uid,
        type: 'new_lead',
        title: `New ${leadData.materialCategory} Lead`,
        message: `A customer in ${leadData.zipCode} is looking for ${leadData.materialCategory} services. Project: ${leadData.projectDetails.substring(0, 100)}...`,
        leadId,
        customerZip: leadData.zipCode,
        materialCategory: leadData.materialCategory,
        projectType: leadData.projectType,
        urgency: leadData.urgency,
        createdAt: serverTimestamp(),
        read: false
      });
    } catch (error) {
      console.error(`❌ Failed to notify professional ${professional.uid}:`, error);
    }
  });

  await Promise.all(notifications);
}

/**
 * Get professional profile by ID
 */
export async function getProfessionalProfile(uid: string): Promise<ProfessionalProfile | null> {
  try {
    const docRef = doc(db, 'professionals', uid);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data() as ProfessionalProfile;
    }
    return null;
  } catch (error) {
    console.error('❌ Failed to get professional profile:', error);
    return null;
  }
}

/**
 * Update professional profile
 */
export async function updateProfessionalProfile(uid: string, updates: Partial<ProfessionalProfile>): Promise<void> {
  try {
    const docRef = doc(db, 'professionals', uid);
    await updateDoc(docRef, {
      ...updates,
      lastActive: serverTimestamp()
    });

    // Also update in users collection
    await updateDoc(doc(db, 'users', uid), {
      ...updates,
      lastActive: serverTimestamp()
    });

    console.log(`✅ Professional profile updated: ${uid}`);
  } catch (error) {
    console.error('❌ Failed to update professional profile:', error);
    throw error;
  }
}

/**
 * Get leads for a professional
 */
export async function getLeadsForProfessional(professionalUid: string): Promise<any[]> {
  try {
    const q = query(
      collection(db, 'leads'),
      where('matchedVendors', 'array-contains', professionalUid)
    );

    const q2 = query(
      collection(db, 'leads'),
      where('matchedTrades', 'array-contains', professionalUid)
    );

    const [vendorSnapshot, tradeSnapshot] = await Promise.all([
      getDocs(q),
      getDocs(q2)
    ]);

    const leads = [];
    vendorSnapshot.forEach(doc => leads.push({ id: doc.id, ...doc.data() }));
    tradeSnapshot.forEach(doc => leads.push({ id: doc.id, ...doc.data() }));

    // Remove duplicates and sort by creation date
    const uniqueLeads = leads.filter((lead, index, self) => 
      index === self.findIndex(l => l.id === lead.id)
    );

    return uniqueLeads.sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds);
  } catch (error) {
    console.error('❌ Failed to get leads for professional:', error);
    return [];
  }
}

export {
  ZIP_COORDS,
  createGeohash,
  matchProfessionalsByGeohash
};