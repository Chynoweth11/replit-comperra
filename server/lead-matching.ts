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
    projectType: leadData.projectType || 'General Project',
    projectDetails: leadData.message || 'Customer interested in materials/installation',
    budget: leadData.budget || 0,
    timeline: leadData.timeline || 'Not specified',
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
 * Fallback lead matching when Firebase is not available
 */
async function fallbackLeadMatching(leadData: any): Promise<void> {
  console.log('🔄 Running fallback lead matching for:', leadData.email);
  
  const leadCoords = getCoordsFromZip(leadData.zipCode);
  if (!leadCoords) {
    console.log('⚠️ No coordinates found for ZIP:', leadData.zipCode);
    return;
  }
  
  // Mock vendor data for demonstration
  const mockVendors = [
    { 
      id: 'vendor1', 
      businessName: 'Arizona Tile Supply', 
      zipCode: '85001', 
      productCategories: ['tiles', 'slabs'], 
      email: 'contact@arizonatile.com' 
    },
    { 
      id: 'vendor2', 
      businessName: 'Phoenix Flooring Pro', 
      zipCode: '85301', 
      productCategories: ['lvt', 'hardwood'], 
      email: 'info@phoenixflooring.com' 
    }
  ];
  
  // Mock trade data for demonstration
  const mockTrades = [
    { 
      id: 'trade1', 
      specialty: 'Tile Installation', 
      zipCode: '85002', 
      serviceRadius: 50, 
      email: 'installer@tilepro.com' 
    },
    { 
      id: 'trade2', 
      specialty: 'Flooring Installation', 
      zipCode: '85336', 
      serviceRadius: 75, 
      email: 'contact@flooringexperts.com' 
    }
  ];
  
  const matchedVendors: string[] = [];
  const matchedTrades: string[] = [];
  
  // Match vendors within 50 miles
  mockVendors.forEach(vendor => {
    const vendorCoords = getCoordsFromZip(vendor.zipCode);
    if (vendorCoords) {
      const distance = calculateDistance(
        leadCoords.lat, leadCoords.lng,
        vendorCoords.lat, vendorCoords.lng
      );
      
      if (distance <= 50 && vendor.productCategories.includes(leadData.materialCategory)) {
        matchedVendors.push(vendor.id);
        console.log(`✅ Matched vendor: ${vendor.businessName} (${distance.toFixed(1)} miles)`);
      }
    }
  });
  
  // Match trades within service radius
  mockTrades.forEach(trade => {
    const tradeCoords = getCoordsFromZip(trade.zipCode);
    if (tradeCoords) {
      const distance = calculateDistance(
        leadCoords.lat, leadCoords.lng,
        tradeCoords.lat, tradeCoords.lng
      );
      
      const serviceRadius = trade.serviceRadius || 50;
      if (distance <= serviceRadius) {
        matchedTrades.push(trade.id);
        console.log(`✅ Matched trade: ${trade.specialty} (${distance.toFixed(1)} miles)`);
      }
    }
  });
  
  console.log(`🎯 Lead matching complete: ${matchedVendors.length} vendors, ${matchedTrades.length} trades`);
}

/**
 * Enhanced lead matching with category filtering and geographic proximity
 */
export async function matchLeadWithProfessionals(leadData: any): Promise<void> {
  console.log(`🔄 Starting enhanced geohash lead matching for: ${leadData.email} (${leadData.materialCategory}) in ZIP: ${leadData.zipCode}`);
  
  const leadCoords = getCoordsFromZip(leadData.zipCode);
  if (!leadCoords) {
    console.log(`⚠️ No coordinates found for ZIP: ${leadData.zipCode}`);
    return;
  }

  console.log(`📍 Lead coordinates: ${leadCoords.lat}, ${leadCoords.lng}`);

  try {
    // Use enhanced geohash matching for vendors
    const matchedVendors = await matchUsersByGeohash(
      "vendor", 
      leadCoords, 
      "productCategories", 
      leadData.materialCategory
    );

    // Use enhanced geohash matching for trades
    const matchedTrades = await matchUsersByGeohash(
      "trade", 
      leadCoords, 
      "tradeCategories", 
      leadData.materialCategory
    );

    console.log(`✅ Geohash matching completed: ${matchedVendors.length} vendors, ${matchedTrades.length} trades`);
    
    // Log detailed match results
    if (matchedVendors.length > 0) {
      console.log(`📍 Matched vendors:`, matchedVendors.map(v => `${v.businessName} (${v.distance.toFixed(1)}mi)`));
    } else {
      console.log(`⚠️ No vendors matched for category: ${leadData.materialCategory}`);
    }
    if (matchedTrades.length > 0) {
      console.log(`📍 Matched trades:`, matchedTrades.map(t => `${t.businessName} (${t.distance.toFixed(1)}mi)`));
    } else {
      console.log(`⚠️ No trades matched for category: ${leadData.materialCategory}`);
    }

    // Update lead with matched professionals (if Firebase is available)
    if (db && leadData.id) {
      try {
        await updateDoc(doc(db, "leads", leadData.id), {
          matchedVendors: matchedVendors.map(v => v.uid),
          matchedTrades: matchedTrades.map(t => t.uid),
          vendorDistances: matchedVendors,
          tradeDistances: matchedTrades,
          status: "matched",
          lastUpdated: new Date().toISOString()
        });
        console.log(`✅ Lead ${leadData.id} updated with ${matchedVendors.length + matchedTrades.length} matches`);
      } catch (updateError) {
        console.log(`⚠️ Lead update failed, but matching completed: ${updateError.message}`);
      }
    }

    // Always log successful matching regardless of Firebase status
    console.log(`📧 Lead matching successful for ${leadData.email}: ${matchedVendors.length + matchedTrades.length} total matches`);
    
    // Store leads in memory for professionals to access
    await storeLeadMatches(leadData, matchedVendors, matchedTrades);
  } catch (error) {
    console.error('❌ Error in enhanced lead matching:', error);
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
 * Get leads for a specific professional by email
 */
export function getLeadsForProfessionalByEmail(email: string): any[] {
  if (!professionalLeads.has(email)) {
    return [];
  }
  
  return professionalLeads.get(email) || [];
}

/**
 * Get all leads with matched professionals for a customer
 */
export function getLeadsWithMatches(customerId: string): any[] {
  // Get all leads from storage that could match this customer
  const allLeads = Array.from(leadStorage.values());
  
  // Filter leads for this customer (using email as customer ID for now)
  const customerLeads = allLeads.filter(lead => 
    lead.customerEmail === customerId || 
    lead.customerName === customerId
  );
  
  return customerLeads;
}