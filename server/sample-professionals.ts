import { collection, addDoc, doc, setDoc } from 'firebase/firestore';
import { db } from './firebase-init.js';
import { createGeohash, getCoordinatesFromZip } from './professional-matching.js';

/**
 * Sample professional database for testing the matching system
 */
export const sampleProfessionals = [
  // Colorado-based professionals (where user is located)
  {
    role: 'vendor',
    email: 'rockymountaintile@gmail.com',
    name: 'Rocky Mountain Tile Supply',
    businessName: 'Rocky Mountain Tile Supply',
    phone: '(303) 555-0123',
    zipCode: '80301',
    serviceRadius: 75,
    productCategories: ['tiles', 'stone', 'slabs'],
    specialty: 'Natural stone and ceramic tiles',
    yearsExperience: 12,
    verified: true,
    rating: 4.8,
    reviewCount: 156
  },
  {
    role: 'trade',
    email: 'denverflooringpro@gmail.com',
    name: 'Denver Flooring Professionals',
    businessName: 'Denver Flooring Professionals',
    phone: '(303) 555-0124',
    zipCode: '80202',
    serviceRadius: 50,
    tradeCategories: ['tiles', 'hardwood', 'vinyl', 'carpet'],
    specialty: 'Residential and commercial flooring installation',
    licenseNumber: 'FL-2024-789',
    yearsExperience: 8,
    verified: true,
    rating: 4.9,
    reviewCount: 98
  },
  {
    role: 'vendor',
    email: 'avonflooring@gmail.com',
    name: 'Avon Flooring Center',
    businessName: 'Avon Flooring Center',
    phone: '(970) 555-0125',
    zipCode: '81620',
    serviceRadius: 60,
    productCategories: ['hardwood', 'vinyl', 'carpet'],
    specialty: 'Mountain luxury flooring',
    yearsExperience: 15,
    verified: true,
    rating: 4.7,
    reviewCount: 73
  },
  {
    role: 'trade',
    email: 'vailheating@gmail.com',
    name: 'Vail Heating Solutions',
    businessName: 'Vail Heating Solutions',
    phone: '(970) 555-0126',
    zipCode: '81615',
    serviceRadius: 40,
    tradeCategories: ['heating', 'thermostats'],
    specialty: 'Radiant floor heating systems',
    licenseNumber: 'HV-2024-456',
    yearsExperience: 20,
    verified: true,
    rating: 5.0,
    reviewCount: 45
  },
  {
    role: 'vendor',
    email: 'coloradostone@gmail.com',
    name: 'Colorado Stone Works',
    businessName: 'Colorado Stone Works',
    phone: '(303) 555-0127',
    zipCode: '80904',
    serviceRadius: 80,
    productCategories: ['stone', 'slabs', 'tiles'],
    specialty: 'Natural stone countertops and flooring',
    yearsExperience: 18,
    verified: true,
    rating: 4.6,
    reviewCount: 124
  },
  
  // National professionals for broader coverage
  {
    role: 'vendor',
    email: 'nationaltileco@gmail.com',
    name: 'National Tile Company',
    businessName: 'National Tile Company',
    phone: '(800) 555-0128',
    zipCode: '10001',
    serviceRadius: 100,
    productCategories: ['tiles', 'stone', 'slabs'],
    specialty: 'Commercial and residential tile supply',
    yearsExperience: 25,
    verified: true,
    rating: 4.5,
    reviewCount: 312
  },
  {
    role: 'trade',
    email: 'eliteflooringny@gmail.com',
    name: 'Elite Flooring NYC',
    businessName: 'Elite Flooring NYC',
    phone: '(212) 555-0129',
    zipCode: '10001',
    serviceRadius: 50,
    tradeCategories: ['tiles', 'hardwood', 'vinyl'],
    specialty: 'High-end residential flooring',
    licenseNumber: 'NY-2024-123',
    yearsExperience: 12,
    verified: true,
    rating: 4.8,
    reviewCount: 89
  },
  {
    role: 'vendor',
    email: 'calstonesupp@gmail.com',
    name: 'California Stone Supply',
    businessName: 'California Stone Supply',
    phone: '(310) 555-0130',
    zipCode: '90210',
    serviceRadius: 75,
    productCategories: ['stone', 'slabs', 'tiles'],
    specialty: 'Premium natural stone and engineered surfaces',
    yearsExperience: 22,
    verified: true,
    rating: 4.7,
    reviewCount: 198
  },
  {
    role: 'trade',
    email: 'miamiflooringpro@gmail.com',
    name: 'Miami Flooring Professionals',
    businessName: 'Miami Flooring Professionals',
    phone: '(305) 555-0131',
    zipCode: '33101',
    serviceRadius: 60,
    tradeCategories: ['tiles', 'vinyl', 'carpet'],
    specialty: 'Tropical climate flooring solutions',
    licenseNumber: 'FL-2024-567',
    yearsExperience: 14,
    verified: true,
    rating: 4.6,
    reviewCount: 67
  },
  {
    role: 'vendor',
    email: 'texashardwood@gmail.com',
    name: 'Texas Hardwood Specialists',
    businessName: 'Texas Hardwood Specialists',
    phone: '(713) 555-0132',
    zipCode: '77001',
    serviceRadius: 90,
    productCategories: ['hardwood', 'vinyl'],
    specialty: 'Exotic and domestic hardwood flooring',
    yearsExperience: 16,
    verified: true,
    rating: 4.9,
    reviewCount: 145
  }
];

/**
 * Initialize sample professionals in Firebase
 */
export async function initializeSampleProfessionals(): Promise<void> {
  try {
    console.log('🔄 Initializing sample professionals...');
    
    for (const professional of sampleProfessionals) {
      // Get coordinates from ZIP code
      const coords = getCoordinatesFromZip(professional.zipCode);
      if (!coords) {
        console.log(`⚠️ No coordinates found for ZIP ${professional.zipCode}, skipping professional`);
        continue;
      }

      // Create geohash for efficient geographic queries
      const geohash = createGeohash(coords.lat, coords.lng);

      // Create complete professional profile
      const professionalProfile = {
        ...professional,
        latitude: coords.lat,
        longitude: coords.lng,
        geohash,
        createdAt: new Date(),
        lastActive: new Date(),
        availability: 'available',
        minimumProject: 500,
        certifications: ['Licensed', 'Insured', 'Bonded'],
        serviceAreas: [`${professional.zipCode} and surrounding areas`]
      };

      // Add to professionals collection
      const docRef = await addDoc(collection(db, 'professionals'), professionalProfile);
      
      // Update with document ID
      await setDoc(doc(db, 'professionals', docRef.id), {
        ...professionalProfile,
        uid: docRef.id
      }, { merge: true });

      // Also add to users collection for authentication integration
      await setDoc(doc(db, 'users', docRef.id), {
        ...professionalProfile,
        uid: docRef.id,
        signInMethod: 'professional_registration'
      }, { merge: true });

      console.log(`✅ Added professional: ${professional.businessName || professional.name} (${professional.role})`);
    }

    console.log('✅ Sample professionals initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize sample professionals:', error);
    throw error;
  }
}

/**
 * Check if sample professionals are already loaded
 */
export async function checkSampleProfessionalsLoaded(): Promise<boolean> {
  try {
    const snapshot = await collection(db, 'professionals').get();
    return snapshot.docs.length > 0;
  } catch (error) {
    console.error('❌ Failed to check sample professionals:', error);
    return false;
  }
}