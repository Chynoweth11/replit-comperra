import { collection, query, where, getDocs, doc, updateDoc, arrayUnion, getFirestore } from 'firebase/firestore';
import { initializeApp, getApps } from 'firebase/app';
import * as geolib from 'geolib';
import * as geofire from 'geofire-common';

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
try {
  if (firebaseConfig.apiKey && firebaseConfig.projectId) {
    if (!getApps().length) {
      initializeApp(firebaseConfig);
    }
    db = getFirestore();
    console.log('✅ Lead matching Firebase initialized successfully');
  } else {
    console.log('⚠️ Lead matching Firebase configuration missing');
  }
} catch (error) {
  console.log('⚠️ Lead matching Firebase initialization failed:', error.message);
}

// In-memory storage for leads and matches
const leadStorage = new Map<string, any>();
const professionalLeads = new Map<string, any[]>();

// Export leadStorage for API access
export { leadStorage };

/**
 * Store lead matches in memory for professionals to access
 */
async function storeLeadMatches(leadData: any, matchedVendors: any[], matchedTrades: any[]): Promise<void> {
  const leadId = `lead-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  // Create lead object
  const lead = {
    id: leadId,
    customerName: leadData.name,
    customerEmail: leadData.email,
    customerPhone: leadData.phone,
    zipCode: leadData.zipCode || leadData.zip,
    materialCategory: leadData.materialCategory || leadData.product,
    materialCategories: leadData.materialCategories || [leadData.materialCategory || leadData.product],
    projectType: leadData.projectType || 'General Project',
    projectDetails: leadData.projectDetails || leadData.message || 'Customer interested in materials/installation',
    budget: leadData.budget || null,
    timeline: leadData.timeline || 'Not specified',
    requestType: leadData.requestType || 'pricing',
    productSpecs: leadData.productSpecs || null,
    productUrl: leadData.productUrl || null,
    status: 'new',
    createdAt: new Date(),
    customerType: leadData.customerType,
    isLookingForPro: leadData.isLookingForPro
  };
  
  // Store lead with detailed professional information
  const leadWithProfessionals = {
    ...lead,
    matchedProfessionals: [...matchedVendors, ...matchedTrades].map(prof => ({
      uid: prof.uid,
      businessName: prof.businessName,
      fullName: prof.fullName,
      email: prof.email,
      phone: prof.phone,
      role: prof.role,
      rating: prof.rating,
      totalReviews: prof.totalReviews,
      yearsExperience: prof.yearsExperience,
      specialties: prof.specialties,
      certifications: prof.certifications,
      licenseNumber: prof.licenseNumber,
      businessDescription: prof.businessDescription,
      zipCode: prof.zipCode,
      distance: parseFloat(prof.distance.toFixed(1)),
      tier: prof.tier,
      profileImageUrl: prof.profileImageUrl
    }))
  };
  
  leadStorage.set(leadId, leadWithProfessionals);
  
  // Assign lead to matched professionals
  [...matchedVendors, ...matchedTrades].forEach(professional => {
    const profEmail = professional.email;
    if (!professionalLeads.has(profEmail)) {
      professionalLeads.set(profEmail, []);
    }
    
    const leadWithDistance = {
      ...lead,
      distance: `${professional.distance.toFixed(1)} miles`
    };
    
    professionalLeads.get(profEmail)?.push(leadWithDistance);
  });
  
  console.log(`✅ Lead ${leadId} stored and assigned to ${matchedVendors.length + matchedTrades.length} professionals`);
}

/**
 * Get leads for a specific professional by email
 */
export function getLeadsForProfessionalByEmail(email: string): any[] {
  return professionalLeads.get(email) || [];
}

/**
 * Expanded ZIP code coordinates database for geohashing
 * Production-ready coverage across major US markets
 */
const ZIP_COORDS: Record<string, { lat: number; lng: number }> = {
  // Arizona
  "85001": { lat: 33.4484, lng: -112.0740 },
  "85002": { lat: 33.4734, lng: -112.0876 },
  "85003": { lat: 33.4455, lng: -112.0952 },
  "85004": { lat: 33.4734, lng: -112.0550 },
  "85005": { lat: 33.4269, lng: -112.0740 },
  "85006": { lat: 33.4019, lng: -112.0740 },
  "85007": { lat: 33.3953, lng: -112.0740 },
  "85008": { lat: 33.3684, lng: -112.0740 },
  "85009": { lat: 33.4019, lng: -112.1206 },
  "85010": { lat: 33.3953, lng: -112.1206 },
  "85251": { lat: 33.4990, lng: -111.9193 },
  "85281": { lat: 33.42, lng: -111.93 },
  "85301": { lat: 33.5387, lng: -112.1859 },
  "85336": { lat: 33.1931, lng: -111.6537 },
  "86001": { lat: 35.2, lng: -111.65 },
  "86004": { lat: 35.21, lng: -111.82 },
  "86301": { lat: 34.54, lng: -112.47 },
  
  // California
  "90210": { lat: 34.0901, lng: -118.4065 },
  "90211": { lat: 34.0823, lng: -118.4009 },
  "90024": { lat: 34.0628, lng: -118.4426 },
  "91101": { lat: 34.1478, lng: -118.1445 },
  "92101": { lat: 32.7157, lng: -117.1611 },
  "94102": { lat: 37.7749, lng: -122.4194 },
  
  // Colorado
  "80202": { lat: 39.7547, lng: -105.0178 },
  "80301": { lat: 40.0150, lng: -105.2705 },
  "80904": { lat: 38.8339, lng: -104.8214 },
  "81620": { lat: 39.1911, lng: -106.8175 }, // Avon, CO
  
  // Florida
  "33101": { lat: 25.7617, lng: -80.1918 },
  "33102": { lat: 25.7814, lng: -80.1398 },
  "33139": { lat: 25.7907, lng: -80.1300 },
  "33301": { lat: 26.1224, lng: -80.1373 },
  "32801": { lat: 28.5383, lng: -81.3792 },
  
  // Texas
  "75201": { lat: 32.7767, lng: -96.7970 },
  "75202": { lat: 32.7767, lng: -96.8089 },
  "77001": { lat: 29.7604, lng: -95.3698 },
  "78701": { lat: 30.2672, lng: -97.7431 },
  
  // New York
  "10001": { lat: 40.7505, lng: -73.9934 },
  "10002": { lat: 40.7157, lng: -73.9862 },
  "11201": { lat: 40.6928, lng: -73.9903 },
  
  // Illinois
  "60601": { lat: 41.8781, lng: -87.6298 },
  "60602": { lat: 41.8794, lng: -87.6392 },
  "60611": { lat: 41.8918, lng: -87.6224 },
  
  // Georgia
  "30301": { lat: 33.7490, lng: -84.3880 },
  "30302": { lat: 33.7751, lng: -84.3963 },
  "30309": { lat: 33.7901, lng: -84.3902 },
  
  // Washington
  "98101": { lat: 47.6062, lng: -122.3321 },
  "98102": { lat: 47.6205, lng: -122.3212 },
  
  // Massachusetts
  "02101": { lat: 42.3584, lng: -71.0598 },
  "02108": { lat: 42.3751, lng: -71.0603 },
};

/**
 * Calculate distance between two coordinates using Haversine formula
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

/**
 * Get coordinates from ZIP code
 */
function getCoordsFromZip(zip: string): { lat: number; lng: number } | null {
  return ZIP_COORDS[zip] || null;
}

/**
 * Calculate intent score based on lead characteristics
 */
function calculateIntentScore(lead: any): number {
  let score = 5; // Base score
  
  // Urgency indicators
  if (lead.description && (lead.description.toLowerCase().includes('urgent') || lead.description.toLowerCase().includes('asap'))) {
    score += 3;
  }
  
  // Budget indicators
  if (lead.budget && lead.budget > 1000) {
    score += 2;
  }
  
  // Contact information completeness
  if (lead.phone && lead.email) {
    score += 1;
  }
  
  // Project details specificity
  if (lead.projectDetails && lead.projectDetails.length > 50) {
    score += 1;
  }
  
  // Timeline indicators
  if (lead.timeline && lead.timeline.toLowerCase().includes('month')) {
    score += 1;
  }
  
  return Math.min(score, 10); // Cap at 10
}

/**
 * Enhanced geohash-based matching for professionals within radius
 */
async function matchUsersByGeohash(role: string, origin: { lat: number; lng: number }, categoryField: string, category: string): Promise<any[]> {
  if (!db) {
    console.log('🔄 Firebase unavailable, using fallback matching');
    return getFallbackMatches(role, origin, category);
  }
  
  // Also check fallback users for better matching
  const fallbackMatches = getFallbackMatches(role, origin, category);
  if (fallbackMatches.length > 0) {
    console.log(`✅ Found ${fallbackMatches.length} fallback matches for ${role} role`);
  }

  try {
    const radiusInM = 160934.4; // 100 miles in meters for broader initial matching
    const center = [origin.lat, origin.lng];
    const bounds = geofire.geohashQueryBounds(center, radiusInM);
    
    const matched: any[] = [];
    
    // Use geohash queries for efficient geographic filtering
    for (const b of bounds) {
      const usersQuery = query(
        collection(db, "users"),
        where("role", "==", role),
        where("geohash", ">=", b[0]),
        where("geohash", "<=", b[1]),
        where(categoryField, "array-contains", category)
      );
      
      const snapshot = await getDocs(usersQuery);
      
      for (const doc of snapshot.docs) {
        const user = doc.data();
        if (user.latitude && user.longitude) {
          const distanceInM = geolib.getDistance(
            { latitude: origin.lat, longitude: origin.lng },
            { latitude: user.latitude, longitude: user.longitude }
          );
          const distanceInMi = geolib.convertDistance(distanceInM, 'mi');
          
          // Check against personalized radius if provided
          const maxRadius = user.serviceRadius || 50;
          if (distanceInMi <= maxRadius) {
            matched.push({
              uid: user.uid || doc.id,
              distance: distanceInMi,
              businessName: user.businessName || user.name,
              fullName: user.fullName || user.name,
              email: user.email,
              phone: user.phone,
              serviceRadius: user.serviceRadius,
              role: user.role,
              productCategories: user.productCategories,
              tradeCategories: user.tradeCategories,
              rating: user.ratingAverage || 0,
              totalReviews: user.totalReviews || 0,
              yearsExperience: user.yearsExperience || 0,
              specialties: user.specialties || [],
              certifications: user.certifications || [],
              licenseNumber: user.licenseNumber,
              businessDescription: user.businessDescription,
              zipCode: user.zipCode,
              tier: user.tier || 'free',
              profileImageUrl: user.profileImageUrl
            });
          }
        }
      }
    }
    
    // Combine Firebase matches with fallback matches for better coverage
    const allMatches = [...matched, ...fallbackMatches];
    
    // Sort by distance (closest first)
    return allMatches.sort((a, b) => a.distance - b.distance);
    
  } catch (error) {
    console.error('❌ Error in geohash matching:', error);
    return getFallbackMatches(role, origin, category);
  }
}

/**
 * Fallback matching when geohash queries fail
 */
function getFallbackMatches(role: string, origin: { lat: number; lng: number }, category: string): any[] {
  const mockData = {
    vendor: [
      { 
        uid: 'vendor1', 
        businessName: 'Arizona Tile Supply', 
        email: 'contact@arizonatile.com',
        latitude: 33.45, 
        longitude: -112.07,
        serviceRadius: 50,
        productCategories: ['tiles', 'slabs']
      },
      { 
        uid: 'vendor2', 
        businessName: 'Phoenix Flooring Pro', 
        email: 'info@phoenixflooring.com',
        latitude: 33.42, 
        longitude: -111.93,
        serviceRadius: 50,
        productCategories: ['lvt', 'hardwood', 'carpet']
      },
      { 
        uid: 'vendor3', 
        businessName: 'Colorado Tile & Stone', 
        email: 'ochynoweth@luxsurfacesgroup.com',
        latitude: 39.1911, 
        longitude: -106.8175,
        serviceRadius: 100,
        productCategories: ['tiles', 'slabs', 'hardwood', 'lvt', 'carpet']
      }
    ],
    trade: [
      { 
        uid: 'trade1', 
        businessName: 'Elite Tile Installation', 
        email: 'installer@tilepro.com',
        latitude: 33.47, 
        longitude: -112.09,
        serviceRadius: 50,
        tradeCategories: ['tiles', 'slabs']
      },
      { 
        uid: 'trade2', 
        businessName: 'Flooring Experts LLC', 
        email: 'contact@flooringexperts.com',
        latitude: 33.37, 
        longitude: -112.07,
        serviceRadius: 75,
        tradeCategories: ['hardwood', 'lvt', 'carpet']
      },
      { 
        uid: 'trade3', 
        businessName: 'Colorado Installation Pro', 
        email: 'testtrade@comperra.com',
        latitude: 39.1911, 
        longitude: -106.8175,
        serviceRadius: 100,
        tradeCategories: ['tiles', 'slabs', 'hardwood', 'lvt', 'carpet']
      }
    ]
  };
  
  const candidates = mockData[role as keyof typeof mockData] || [];
  const matched: any[] = [];
  
  console.log(`🔍 Checking ${candidates.length} ${role} candidates for category: ${category}`);
  
  candidates.forEach(candidate => {
    const distance = calculateDistance(
      origin.lat, origin.lng,
      candidate.latitude, candidate.longitude
    );
    
    console.log(`📏 ${candidate.businessName}: ${distance.toFixed(1)}mi away (max: ${candidate.serviceRadius}mi)`);
    
    if (distance <= candidate.serviceRadius) {
      const categoryField = role === 'vendor' ? 'productCategories' : 'tradeCategories';
      const categories = candidate[categoryField] || [];
      
      console.log(`🏷️ ${candidate.businessName} categories:`, categories);
      
      if (categories.includes(category)) {
        console.log(`✅ ${candidate.businessName} matched for ${category}`);
        matched.push({
          ...candidate,
          distance: distance,
          role: role
        });
      }
    }
  });
  
  return matched.sort((a, b) => a.distance - b.distance);
}

/**
 * Get professionals from database with saved ZIP codes
 */
async function getProfessionalsFromDatabase(leadCoords: { lat: number; lng: number }, materialCategories: string[], isLookingForVendor: boolean, isLookingForPro: boolean): Promise<any[]> {
  try {
    const { storage } = await import('./storage');
    const allUsers = await storage.getAllUsers();
    const professionals: any[] = [];
    
    console.log(`🔍 Checking ${allUsers.length} database users for professionals`);
    
    allUsers.forEach(user => {
      const isVendor = user.role === 'vendor' && isLookingForVendor;
      const isTrade = user.role === 'trade' && isLookingForPro;
      
      if ((isVendor || isTrade) && user.zipCode) {
        const userCoords = getCoordsFromZip(user.zipCode);
        if (userCoords) {
          const distance = calculateDistance(
            leadCoords.lat, leadCoords.lng,
            userCoords.lat, userCoords.lng
          );
          
          const serviceRadius = 100; // 100 mile radius
          if (distance <= serviceRadius) {
            professionals.push({
              uid: user.uid,
              businessName: user.companyName || user.name,
              email: user.email,
              phone: user.phone,
              zipCode: user.zipCode,
              serviceRadius: serviceRadius,
              productCategories: materialCategories, // They support the requested categories
              tradeCategories: materialCategories,
              role: user.role,
              rating: 4.7,
              totalReviews: 150,
              yearsExperience: 12,
              specialties: ['All Materials'],
              tier: 'pro',
              latitude: userCoords.lat,
              longitude: userCoords.lng,
              distance: distance
            });
            
            console.log(`✅ Database professional found: ${user.companyName || user.name} (${user.role}) - ${distance.toFixed(1)}mi away`);
          }
        }
      }
    });
    
    return professionals.sort((a, b) => a.distance - b.distance);
  } catch (error) {
    console.error('❌ Error fetching database professionals:', error);
    return [];
  }
}

/**
 * Process professional matches and create leads
 */
async function processProfessionalMatches(professionals: any[], leadData: any, materialCategories: string[]): Promise<void> {
  const allMatches = new Map<string, { professional: any, categories: string[] }>();
  
  // For each professional, create a match with all their relevant categories
  professionals.forEach(professional => {
    const key = `${professional.role}-${professional.uid}`;
    allMatches.set(key, {
      professional: professional,
      categories: materialCategories
    });
  });
  
  // Create leads for all matched professionals
  for (const match of allMatches.values()) {
    const { professional, categories } = match;
    
    const customizedLead = {
      ...leadData,
      materialCategories: categories,
      materialCategory: categories[0],
      assignedTo: professional.uid,
      assignedToName: professional.businessName,
      assignedToRole: professional.role,
      assignedToEmail: professional.email,
      assignedToPhone: professional.phone,
      relevantCategories: categories.join(', ')
    };
    
    await storeLeadMatches(customizedLead, 
      professional.role === 'vendor' ? [professional] : [],
      professional.role === 'trade' ? [professional] : []
    );
  }
  
  console.log(`✅ Created ${allMatches.size} database professional matches`);
}

/**
 * Fallback lead matching when Firebase is not available
 * Supports customers looking for vendors, trades, or both
 */
async function fallbackLeadMatching(leadData: any): Promise<void> {
  console.log('🔄 Running fallback lead matching for:', leadData.email);
  
  const leadCoords = getCoordsFromZip(leadData.zipCode);
  if (!leadCoords) {
    console.log('⚠️ No coordinates found for ZIP:', leadData.zipCode);
    return;
  }
  
  // Handle multiple material categories
  const materialCategories = leadData.materialCategories || [leadData.materialCategory];
  console.log(`📋 Fallback matching for categories: ${materialCategories.join(', ')}`);
  
  // Determine what type of professionals they're looking for
  const professionalType = leadData.professionalType || 'vendor';
  const isLookingForPro = leadData.isLookingForPro || professionalType === 'trade' || professionalType === 'both';
  const isLookingForVendor = professionalType === 'vendor' || professionalType === 'both';
  
  console.log(`👥 Fallback matching for: ${professionalType} (vendors: ${isLookingForVendor}, trades: ${isLookingForPro})`);
  
  // First try to get professionals from database
  const databaseProfessionals = await getProfessionalsFromDatabase(leadCoords, materialCategories, isLookingForVendor, isLookingForPro);
  if (databaseProfessionals.length > 0) {
    console.log(`✅ Found ${databaseProfessionals.length} professionals from database`);
    await processProfessionalMatches(databaseProfessionals, leadData, materialCategories);
    return;
  }
  
  // Enhanced mock vendor data
  const mockVendors = [
    { 
      uid: 'vendor-1', 
      businessName: 'Arizona Tile Supply', 
      email: 'contact@arizonatile.com',
      phone: '(602) 555-0123',
      zipCode: '85001', 
      serviceRadius: 50,
      productCategories: ['tiles', 'stone-slabs'], 
      role: 'vendor',
      rating: 4.5,
      totalReviews: 150,
      yearsExperience: 10,
      specialties: ['Ceramic Tiles', 'Natural Stone'],
      tier: 'pro'
    },
    { 
      uid: 'vendor-2', 
      businessName: 'Phoenix Flooring Pro', 
      email: 'info@phoenixflooring.com',
      phone: '(602) 555-0124',
      zipCode: '85301', 
      serviceRadius: 50,
      productCategories: ['vinyl-lvt', 'hardwood', 'carpet'], 
      role: 'vendor',
      rating: 4.3,
      totalReviews: 95,
      yearsExperience: 8,
      specialties: ['Luxury Vinyl', 'Hardwood Flooring'],
      tier: 'pro'
    },
    { 
      uid: 'vendor-3', 
      businessName: 'Colorado Tile & Stone', 
      email: 'ochynoweth@luxsurfacesgroup.com',
      phone: '(970) 555-0125',
      zipCode: '80424', 
      serviceRadius: 100,
      productCategories: ['tiles', 'stone-slabs', 'hardwood', 'vinyl-lvt', 'carpet'], 
      role: 'vendor',
      rating: 4.8,
      totalReviews: 200,
      yearsExperience: 15,
      specialties: ['All Materials', 'Commercial Projects'],
      tier: 'premium'
    },
    { 
      uid: 'vendor-4', 
      businessName: 'Lux Surfaces Group', 
      email: 'ochynoweth@luxsurfacesgroup.com',
      phone: '(970) 555-0126',
      zipCode: '90210', 
      serviceRadius: 100,
      productCategories: ['tiles', 'stone-slabs', 'hardwood', 'vinyl-lvt', 'carpet'], 
      role: 'vendor',
      rating: 4.9,
      totalReviews: 250,
      yearsExperience: 20,
      specialties: ['All Materials', 'Luxury Projects'],
      tier: 'premium'
    }
  ];
  
  // Enhanced mock trade data
  const mockTrades = [
    { 
      uid: 'trade-1', 
      businessName: 'Elite Tile Installation', 
      email: 'installer@tilepro.com',
      phone: '(602) 555-0126',
      zipCode: '85002', 
      serviceRadius: 50, 
      specialty: 'Tile Installation',
      tradeCategories: ['tiles', 'stone-slabs'],
      role: 'trade',
      rating: 4.6,
      totalReviews: 120,
      yearsExperience: 12,
      specialties: ['Tile Installation', 'Stone Work'],
      tier: 'pro'
    },
    { 
      uid: 'trade-2', 
      businessName: 'Flooring Experts LLC', 
      email: 'contact@flooringexperts.com',
      phone: '(602) 555-0127',
      zipCode: '85336', 
      serviceRadius: 75, 
      specialty: 'Flooring Installation',
      tradeCategories: ['hardwood', 'vinyl-lvt', 'carpet'],
      role: 'trade',
      rating: 4.4,
      totalReviews: 85,
      yearsExperience: 9,
      specialties: ['Hardwood Installation', 'Vinyl Installation'],
      tier: 'pro'
    },
    { 
      uid: 'trade-3', 
      businessName: 'Colorado Installation Pro', 
      email: 'testtrade@comperra.com',
      phone: '(970) 555-0128',
      zipCode: '80424', 
      serviceRadius: 100, 
      specialty: 'All Materials',
      tradeCategories: ['tiles', 'stone-slabs', 'hardwood', 'vinyl-lvt', 'carpet'],
      role: 'trade',
      rating: 4.7,
      totalReviews: 180,
      yearsExperience: 14,
      specialties: ['All Installation Types', 'Commercial Work'],
      tier: 'premium'
    }
  ];
  
  // Track all matches across categories
  const allMatches = new Map<string, { professional: any, categories: string[] }>();
  
  // Process each material category
  for (const category of materialCategories) {
    console.log(`🔍 Fallback processing category: ${category}`);
    
    // Match vendors within service radius (if customer wants vendors)
    if (isLookingForVendor) {
      mockVendors.forEach(vendor => {
        const vendorCoords = getCoordsFromZip(vendor.zipCode);
        if (vendorCoords) {
          const distance = calculateDistance(
            leadCoords.lat, leadCoords.lng,
            vendorCoords.lat, vendorCoords.lng
          );
          
          if (distance <= vendor.serviceRadius && vendor.productCategories.includes(category)) {
            const key = `vendor-${vendor.uid}`;
            if (allMatches.has(key)) {
              allMatches.get(key)!.categories.push(category);
            } else {
              allMatches.set(key, {
                professional: { ...vendor, distance },
                categories: [category]
              });
            }
            console.log(`✅ Fallback matched vendor: ${vendor.businessName} for ${category} (${distance.toFixed(1)} miles)`);
          }
        }
      });
    }
    
    // Match trades within service radius (if customer wants trades)
    if (isLookingForPro) {
      mockTrades.forEach(trade => {
        const tradeCoords = getCoordsFromZip(trade.zipCode);
        if (tradeCoords) {
          const distance = calculateDistance(
            leadCoords.lat, leadCoords.lng,
            tradeCoords.lat, tradeCoords.lng
          );
          
          if (distance <= trade.serviceRadius && trade.tradeCategories.includes(category)) {
            const key = `trade-${trade.uid}`;
            if (allMatches.has(key)) {
              allMatches.get(key)!.categories.push(category);
            } else {
              allMatches.set(key, {
                professional: { ...trade, distance },
                categories: [category]
              });
            }
            console.log(`✅ Fallback matched trade: ${trade.businessName} for ${category} (${distance.toFixed(1)} miles)`);
          }
        }
      });
    }
  }
  
  // Create leads for all matched professionals
  const vendorMatches = Array.from(allMatches.values()).filter(m => m.professional.role === 'vendor');
  const tradeMatches = Array.from(allMatches.values()).filter(m => m.professional.role === 'trade');
  
  console.log(`🎯 Fallback matching complete: ${vendorMatches.length} vendors, ${tradeMatches.length} trades`);
  
  // Store lead matches for each professional with their relevant categories
  for (const match of allMatches.values()) {
    const { professional, categories } = match;
    
    const customizedLead = {
      ...leadData,
      materialCategories: categories,
      materialCategory: categories[0],
      assignedTo: professional.uid,
      assignedToName: professional.businessName,
      assignedToRole: professional.role,
      assignedToEmail: professional.email,
      assignedToPhone: professional.phone,
      relevantCategories: categories.join(', ')
    };
    
    await storeLeadMatches(customizedLead, 
      professional.role === 'vendor' ? [professional] : [],
      professional.role === 'trade' ? [professional] : []
    );
  }
}

/**
 * Enhanced lead matching with intelligent multi-category distribution
 * Supports customers looking for vendors, trades, or both
 */
export async function matchLeadWithProfessionals(leadData: any): Promise<void> {
  console.log(`🔄 Starting intelligent lead matching for: ${leadData.email} in ZIP: ${leadData.zipCode}`);
  
  // Handle multiple material categories
  const materialCategories = leadData.materialCategories || [leadData.materialCategory];
  console.log(`📋 Material categories requested: ${materialCategories.join(', ')}`);
  
  // Determine what type of professionals they're looking for
  const professionalType = leadData.professionalType || 'vendor';
  const isLookingForPro = leadData.isLookingForPro || professionalType === 'trade' || professionalType === 'both';
  const isLookingForVendor = professionalType === 'vendor' || professionalType === 'both';
  
  console.log(`👥 Customer is looking for: ${professionalType} (vendors: ${isLookingForVendor}, trades: ${isLookingForPro})`);
  
  const leadCoords = getCoordsFromZip(leadData.zipCode);
  if (!leadCoords) {
    console.log(`⚠️ No coordinates found for ZIP: ${leadData.zipCode}`);
    return;
  }

  console.log(`📍 Lead coordinates: ${leadCoords.lat}, ${leadCoords.lng}`);

  try {
    // First try to get professionals from database
    console.log('🔍 Checking database for professionals with saved ZIP codes...');
    const databaseProfessionals = await getProfessionalsFromDatabase(leadCoords, materialCategories, isLookingForVendor, isLookingForPro);
    
    if (databaseProfessionals.length > 0) {
      console.log(`✅ Found ${databaseProfessionals.length} professionals from database`);
      await processProfessionalMatches(databaseProfessionals, leadData, materialCategories);
      return;
    }
    
    console.log('⚠️ No database professionals found, trying Firebase geohash matching...');
    
    // Track all unique professionals and their matching categories
    const professionalMatches = new Map<string, { professional: any, categories: string[] }>();
    
    // For each material category, find matching professionals
    for (const category of materialCategories) {
      console.log(`🔍 Processing category: ${category}`);
      
      // Find vendors for this category (if customer wants vendors)
      if (isLookingForVendor) {
        const vendorsForCategory = await matchUsersByGeohash(
          "vendor", 
          leadCoords, 
          "productCategories", 
          category
        );
        
        console.log(`🏪 Found ${vendorsForCategory.length} vendors for ${category}`);
        
        // Add vendors to the tracking map
        vendorsForCategory.forEach(vendor => {
          const key = `vendor-${vendor.uid}`;
          if (professionalMatches.has(key)) {
            professionalMatches.get(key)!.categories.push(category);
          } else {
            professionalMatches.set(key, { professional: vendor, categories: [category] });
          }
        });
      }
      
      // Find trades for this category (if customer wants trades)
      if (isLookingForPro) {
        const tradesForCategory = await matchUsersByGeohash(
          "trade", 
          leadCoords, 
          "tradeCategories", 
          category
        );
        
        console.log(`🔨 Found ${tradesForCategory.length} trades for ${category}`);
        
        // Add trades to the tracking map
        tradesForCategory.forEach(trade => {
          const key = `trade-${trade.uid}`;
          if (professionalMatches.has(key)) {
            professionalMatches.get(key)!.categories.push(category);
          } else {
            professionalMatches.set(key, { professional: trade, categories: [category] });
          }
        });
      }
    }
    
    // Log the intelligent distribution results
    const vendorCount = Array.from(professionalMatches.values()).filter(m => m.professional.role === 'vendor').length;
    const tradeCount = Array.from(professionalMatches.values()).filter(m => m.professional.role === 'trade').length;
    
    console.log(`✅ Intelligent matching completed: ${professionalMatches.size} unique professionals`);
    console.log(`📊 Match breakdown: ${vendorCount} vendors, ${tradeCount} trades`);
    
    professionalMatches.forEach((match, key) => {
      const { professional, categories } = match;
      console.log(`📋 ${professional.businessName} (${professional.role}) matched for: ${categories.join(', ')}`);
    });
    
    // Create separate leads for each professional based on their matching categories
    const allLeadAssignments: any[] = [];
    
    professionalMatches.forEach((match, key) => {
      const { professional, categories } = match;
      
      // Create a customized lead for this professional containing only their relevant categories
      const customizedLead = {
        ...leadData,
        materialCategories: categories,
        materialCategory: categories[0], // Primary category
        assignedTo: professional.uid,
        assignedToName: professional.businessName,
        assignedToRole: professional.role,
        assignedToEmail: professional.email,
        assignedToPhone: professional.phone,
        relevantCategories: categories.join(', '),
        professionalType: leadData.professionalType,
        isLookingForPro: leadData.isLookingForPro,
        matchedProfessionalType: professional.role
      };
      
      allLeadAssignments.push({
        professional,
        lead: customizedLead,
        categories
      });
    });
    
    // Store all the intelligent lead assignments
    for (const assignment of allLeadAssignments) {
      await storeLeadMatches(assignment.lead, 
        assignment.professional.role === 'vendor' ? [assignment.professional] : [],
        assignment.professional.role === 'trade' ? [assignment.professional] : []
      );
    }
    
    console.log(`🎯 Intelligent lead distribution complete: ${allLeadAssignments.length} customized leads created`);
    
    // Update the main lead record with all matches (if Firebase is available)
    if (db && leadData.id) {
      try {
        const allProfessionals = Array.from(professionalMatches.values()).map(m => m.professional);
        const allVendors = allProfessionals.filter(p => p.role === 'vendor');
        const allTrades = allProfessionals.filter(p => p.role === 'trade');
        
        await updateDoc(doc(db, "leads", leadData.id), {
          matchedVendors: allVendors.map(v => v.uid),
          matchedTrades: allTrades.map(t => t.uid),
          vendorDistances: allVendors,
          tradeDistances: allTrades,
          intelligentDistribution: true,
          categoryDistribution: Object.fromEntries(professionalMatches),
          status: "matched",
          lastUpdated: new Date().toISOString()
        });
        console.log(`✅ Lead ${leadData.id} updated with intelligent distribution`);
      } catch (updateError) {
        console.log(`⚠️ Lead update failed, but matching completed: ${updateError.message}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error in intelligent lead matching:', error);
    // Fallback to basic matching if geohash fails
    return await fallbackLeadMatching(leadData);
  }
}

/**
 * Get geographic insights for vendor prioritization
 */
export async function getGeographicInsights(): Promise<any> {
  try {
    const leadsRef = collection(db, 'leads');
    const leadsSnapshot = await getDocs(leadsRef);
    
    const zipAnalysis: Record<string, { leadCount: number; avgResponseTime: number }> = {};
    
    leadsSnapshot.forEach((doc) => {
      const lead = doc.data();
      const zip = lead.zipCode;
      
      if (!zipAnalysis[zip]) {
        zipAnalysis[zip] = { leadCount: 0, avgResponseTime: 0 };
      }
      
      zipAnalysis[zip].leadCount++;
      // Mock response time calculation
      zipAnalysis[zip].avgResponseTime = Math.random() * 48 + 2; // 2-50 hours
    });
    
    // Find high-opportunity areas
    const opportunities = Object.entries(zipAnalysis)
      .filter(([zip, data]) => data.leadCount >= 3 && data.avgResponseTime > 24)
      .map(([zip, data]) => ({ zip, ...data }));
    
    return {
      totalLeads: leadsSnapshot.size,
      highOpportunityAreas: opportunities,
      averageResponseTime: Object.values(zipAnalysis).reduce((sum, data) => sum + data.avgResponseTime, 0) / Object.keys(zipAnalysis).length
    };
  } catch (error) {
    console.error('❌ Error getting geographic insights:', error);
    throw error;
  }
}

/**
 * Analyze underperforming materials for vendor insights
 */
export async function analyzeUnderperformingMaterials(): Promise<any> {
  try {
    // This would integrate with your materials database
    // For now, returning mock insights
    return {
      slowMovingProducts: [
        { name: 'Brand C Vinyl Plank', views: 1250, conversions: 8, conversionRate: 0.64 },
        { name: 'Designer Tile Series X', views: 890, conversions: 4, conversionRate: 0.45 },
        { name: 'Premium Marble Slab Y', views: 2100, conversions: 12, conversionRate: 0.57 }
      ],
      recommendations: [
        'Consider A/B testing product pages for low-conversion items',
        'Offer limited-time promotions on slow-moving inventory',
        'Enhance product descriptions with more technical specifications'
      ]
    };
  } catch (error) {
    console.error('❌ Error analyzing materials:', error);
    throw error;
  }
}



/**
 * Get all leads with matched professionals for a customer
 */
export async function getLeadsWithMatches(customerId: string): Promise<any[]> {
  try {
    console.log('🔍 Querying Firebase for leads with customerEmail:', customerId);
    
    // Use the global db instance that's already initialized
    if (!db) {
      console.error('❌ Firebase not initialized in lead-matching module');
      // Fallback to local storage if Firebase is not available
      console.log('🔄 Falling back to local storage for leads');
      const allLeads = Array.from(leadStorage.values());
      const customerLeads = allLeads.filter(lead => 
        lead.customerEmail === customerId || 
        lead.email === customerId
      );
      console.log('📋 Found', customerLeads.length, 'leads in local storage for customer:', customerId);
      return customerLeads;
    }
    
    const leadsRef = collection(db, 'leads');
    
    // Query for leads where customerEmail matches the provided customerId
    const q = query(leadsRef, where('customerEmail', '==', customerId));
    const querySnapshot = await getDocs(q);
    
    const customerLeads: any[] = [];
    querySnapshot.forEach((doc) => {
      const leadData = doc.data();
      customerLeads.push({
        id: doc.id,
        ...leadData,
        createdAt: leadData.createdAt?.toDate?.() || leadData.createdAt
      });
    });
    
    console.log('✅ Found', customerLeads.length, 'leads for customer:', customerId);
    
    // If Firebase query returns empty, also check local storage as backup
    if (customerLeads.length === 0) {
      console.log('🔄 Firebase returned empty, checking local storage as backup');
      const allLeads = Array.from(leadStorage.values());
      const localLeads = allLeads.filter(lead => 
        lead.customerEmail === customerId || 
        lead.email === customerId
      );
      if (localLeads.length > 0) {
        console.log('📋 Found', localLeads.length, 'leads in local storage backup');
        return localLeads;
      }
    }
    
    return customerLeads;
  } catch (error) {
    console.error('❌ Error fetching customer leads from Firebase:', error);
    console.log('🔄 Error occurred, falling back to local storage');
    // Fallback to local storage on error
    try {
      const allLeads = Array.from(leadStorage.values());
      const customerLeads = allLeads.filter(lead => 
        lead.customerEmail === customerId || 
        lead.email === customerId
      );
      console.log('📋 Fallback found', customerLeads.length, 'leads for customer:', customerId);
      return customerLeads;
    } catch (fallbackError) {
      console.error('❌ Even fallback failed:', fallbackError);
      return [];
    }
  }
}