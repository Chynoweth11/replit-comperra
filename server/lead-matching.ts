import { collection, query, where, getDocs, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from './firebase-init';

/**
 * Mock ZIP code coordinates database
 * In production, this would be replaced with a real geocoding service
 */
const ZIP_COORDS: Record<string, { lat: number; lng: number }> = {
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
  "85301": { lat: 33.5387, lng: -112.1859 },
  "85336": { lat: 33.1931, lng: -111.6537 },
  "90210": { lat: 34.0901, lng: -118.4065 },
  "90211": { lat: 34.0823, lng: -118.4009 },
  "10001": { lat: 40.7505, lng: -73.9934 },
  "10002": { lat: 40.7157, lng: -73.9862 },
  "30301": { lat: 33.7490, lng: -84.3880 },
  "30302": { lat: 33.7751, lng: -84.3963 },
  "33101": { lat: 25.7617, lng: -80.1918 },
  "33102": { lat: 25.7814, lng: -80.1398 },
  "60601": { lat: 41.8781, lng: -87.6298 },
  "60602": { lat: 41.8794, lng: -87.6392 },
  "75201": { lat: 32.7767, lng: -96.7970 },
  "75202": { lat: 32.7767, lng: -96.8089 },
  "98101": { lat: 47.6062, lng: -122.3321 },
  "98102": { lat: 47.6205, lng: -122.3212 },
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
 * Enhanced lead matching with category filtering and geographic proximity
 */
export async function matchLeadWithProfessionals(leadData: any): Promise<void> {
  try {
    console.log('🔍 Starting lead matching for:', leadData.email);
    
    const leadCoords = getCoordsFromZip(leadData.zipCode);
    if (!leadCoords) {
      console.log('⚠️ No coordinates found for ZIP:', leadData.zipCode);
      return;
    }
    
    // Calculate intent score
    const intentScore = calculateIntentScore(leadData);
    console.log('📊 Intent score calculated:', intentScore);
    
    // Query vendors with product categories matching the lead's material category
    const vendorsRef = collection(db, 'users');
    const vendorQuery = query(
      vendorsRef,
      where('role', '==', 'vendor'),
      where('productCategories', 'array-contains', leadData.materialCategory)
    );
    
    const vendorSnapshot = await getDocs(vendorQuery);
    const matchedVendors: string[] = [];
    
    vendorSnapshot.forEach((doc) => {
      const vendor = doc.data();
      const vendorCoords = getCoordsFromZip(vendor.zipCode);
      
      if (vendorCoords) {
        const distance = calculateDistance(
          leadCoords.lat, leadCoords.lng,
          vendorCoords.lat, vendorCoords.lng
        );
        
        // Match vendors within 50 miles
        if (distance <= 50) {
          matchedVendors.push(doc.id);
          console.log(`✅ Matched vendor: ${vendor.businessName} (${distance.toFixed(1)} miles)`);
        }
      }
    });
    
    // Query trades within service radius
    const tradesRef = collection(db, 'users');
    const tradeQuery = query(
      tradesRef,
      where('role', '==', 'trade')
    );
    
    const tradeSnapshot = await getDocs(tradeQuery);
    const matchedTrades: string[] = [];
    
    tradeSnapshot.forEach((doc) => {
      const trade = doc.data();
      const tradeCoords = getCoordsFromZip(trade.zipCode);
      
      if (tradeCoords) {
        const distance = calculateDistance(
          leadCoords.lat, leadCoords.lng,
          tradeCoords.lat, tradeCoords.lng
        );
        
        // Match trades within their service radius
        const serviceRadius = trade.serviceRadius || 50;
        if (distance <= serviceRadius) {
          matchedTrades.push(doc.id);
          console.log(`✅ Matched trade: ${trade.specialty} (${distance.toFixed(1)} miles)`);
        }
      }
    });
    
    // Create lead document with matches
    const leadDoc = {
      ...leadData,
      intentScore,
      matchedVendors,
      matchedTrades,
      status: 'new',
      createdAt: new Date(),
      lastUpdated: new Date()
    };
    
    // Save lead to Firestore
    const leadsRef = collection(db, 'leads');
    await leadsRef.add(leadDoc);
    
    console.log(`🎯 Lead matching complete: ${matchedVendors.length} vendors, ${matchedTrades.length} trades`);
    
    // Update matched vendors and trades with lead reference
    for (const vendorId of matchedVendors) {
      await updateDoc(doc(db, 'users', vendorId), {
        matchedLeads: arrayUnion(leadDoc.id || 'temp-lead-id')
      });
    }
    
    for (const tradeId of matchedTrades) {
      await updateDoc(doc(db, 'users', tradeId), {
        matchedLeads: arrayUnion(leadDoc.id || 'temp-lead-id')
      });
    }
    
  } catch (error) {
    console.error('❌ Error in lead matching:', error);
    throw error;
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