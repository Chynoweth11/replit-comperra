import { collection, query, where, getDocs, doc, getDoc, updateDoc, writeBatch, serverTimestamp, arrayUnion, arrayRemove, Timestamp } from 'firebase/firestore';
import { db } from './firebase-init';
import { calculateDistance } from './geohash-utils';

export interface VendorProfile {
  id: string;
  fullName: string;
  businessName?: string;
  materials: string[];
  zipCodesServed: string[];
  weeklyLeadLimit: number;
  leadsReceivedThisWeek: number;
  active: boolean;
  ratingAverage: number;
  totalReviews: number;
  reportCount: number;
  tier: 'free' | 'pro' | 'premium';
  yearsExperience?: number;
  specialties?: string[];
  serviceRadius: number;
  latitude?: number;
  longitude?: number;
  minimumProject?: number;
  createdAt: any;
  lastActive: any;
}

export interface LeadData {
  id: string;
  customerId: string;
  customerName: string;
  zipCode: string;
  material: string;
  materialCategory: string;
  projectType: string;
  budget?: number;
  timeline?: string;
  description?: string;
  urgency: 'low' | 'medium' | 'high';
  createdAt: any;
  status: 'new' | 'active' | 'completed' | 'archived';
  nonResponsiveVendors: Array<{vendorId: string; vendorName: string}>;
  intentScore?: number;
}

export interface VendorMatch {
  vendorId: string;
  vendorName: string;
  score: number;
  distance?: number;
  matchReasons: string[];
  tier: string;
  rating: number;
  totalReviews: number;
}

/**
 * Advanced lead matching algorithm with multiple scoring factors
 */
export async function smartMatchVendors(leadId: string, leadData: LeadData): Promise<VendorMatch[]> {
  try {
    // Get all active vendors
    const vendorsQuery = query(
      collection(db, 'vendors'),
      where('active', '==', true)
    );
    
    const vendorsSnapshot = await getDocs(vendorsQuery);
    const vendors: VendorProfile[] = vendorsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as VendorProfile[];

    // Get customer preferences
    const customerProfile = await getCustomerProfile(leadData.customerId);
    
    // Filter out blocked vendors
    const availableVendors = vendors.filter(vendor => 
      !customerProfile?.blockedVendors?.includes(vendor.id)
    );

    // Score each vendor
    const scoredVendors = await Promise.all(
      availableVendors.map(vendor => scoreVendor(vendor, leadData, customerProfile))
    );

    // Sort by score and return top matches
    const topMatches = scoredVendors
      .filter(match => match.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5); // Top 5 matches

    // Create vendor lead assignments
    await createVendorLeadAssignments(leadId, leadData, topMatches);

    return topMatches;
  } catch (error) {
    console.error('Error in smart matching:', error);
    throw error;
  }
}

/**
 * Score a vendor based on multiple factors
 */
async function scoreVendor(vendor: VendorProfile, leadData: LeadData, customerProfile: any): Promise<VendorMatch> {
  let score = 0;
  const matchReasons: string[] = [];

  // 1. Geographic proximity (50 points max)
  if (vendor.zipCodesServed?.includes(leadData.zipCode)) {
    score += 50;
    matchReasons.push('Serves your ZIP code');
  } else if (vendor.latitude && vendor.longitude && leadData.zipCode) {
    // Calculate distance if coordinates are available
    const leadCoords = getCoordinatesFromZip(leadData.zipCode);
    if (leadCoords) {
      const distance = calculateDistance(
        vendor.latitude,
        vendor.longitude,
        leadCoords.latitude,
        leadCoords.longitude
      );
      
      if (distance <= vendor.serviceRadius) {
        const proximityScore = Math.max(0, 30 - (distance / vendor.serviceRadius) * 30);
        score += proximityScore;
        matchReasons.push(`Within ${Math.round(distance)} miles`);
      }
    }
  }

  // 2. Material specialization (30 points max)
  if (vendor.materials?.some(material => 
    material.toLowerCase().includes(leadData.material.toLowerCase()) ||
    leadData.material.toLowerCase().includes(material.toLowerCase())
  )) {
    score += 30;
    matchReasons.push('Specializes in your material');
  }

  // 3. Capacity availability (20 points max)
  const remainingCapacity = vendor.weeklyLeadLimit - vendor.leadsReceivedThisWeek;
  if (remainingCapacity > 0) {
    score += Math.min(20, remainingCapacity * 4);
    matchReasons.push('Has available capacity');
  }

  // 4. Customer preferences (25 points max)
  if (customerProfile?.favoriteVendors?.includes(vendor.id)) {
    score += 25;
    matchReasons.push('Your favorite vendor');
  }

  // 5. Vendor reputation (15 points max)
  if (vendor.totalReviews >= 10) {
    const reputationScore = Math.min(15, (vendor.ratingAverage - 3) * 5);
    score += reputationScore;
    if (vendor.ratingAverage >= 4.5) {
      matchReasons.push('Highly rated');
    }
  } else if (vendor.totalReviews < 5) {
    score += 10; // Boost for new vendors
    matchReasons.push('New vendor');
  }

  // 6. Tier benefits (10 points max)
  if (vendor.tier === 'premium') {
    score += 10;
    matchReasons.push('Premium vendor');
  } else if (vendor.tier === 'pro') {
    score += 5;
    matchReasons.push('Pro vendor');
  }

  // 7. Budget alignment (10 points max)
  if (leadData.budget && vendor.minimumProject) {
    if (leadData.budget >= vendor.minimumProject) {
      score += 10;
      matchReasons.push('Budget aligned');
    } else {
      score -= 5; // Penalize if budget is too low
    }
  }

  // 8. Urgency match (5 points max)
  if (leadData.urgency === 'high' && vendor.tier !== 'free') {
    score += 5;
    matchReasons.push('Available for urgent projects');
  }

  // 9. Experience factor (5 points max)
  if (vendor.yearsExperience && vendor.yearsExperience >= 5) {
    score += 5;
    matchReasons.push('Experienced professional');
  }

  // 10. Recent activity (5 points max)
  if (vendor.lastActive) {
    const daysSinceActive = (Date.now() - vendor.lastActive.toMillis()) / (1000 * 60 * 60 * 24);
    if (daysSinceActive < 7) {
      score += 5;
      matchReasons.push('Recently active');
    }
  }

  return {
    vendorId: vendor.id,
    vendorName: vendor.fullName,
    score,
    matchReasons,
    tier: vendor.tier,
    rating: vendor.ratingAverage,
    totalReviews: vendor.totalReviews
  };
}

/**
 * Create vendor lead assignments in batch
 */
async function createVendorLeadAssignments(leadId: string, leadData: LeadData, matches: VendorMatch[]): Promise<void> {
  const batch = writeBatch(db);

  // Create vendor lead assignments
  matches.forEach(match => {
    const vendorLeadRef = doc(collection(db, 'vendorLeads'));
    batch.set(vendorLeadRef, {
      leadId,
      vendorId: match.vendorId,
      vendorName: match.vendorName,
      customerId: leadData.customerId,
      customerName: leadData.customerName,
      material: leadData.material,
      zipCode: leadData.zipCode,
      assignedAt: serverTimestamp(),
      status: 'assigned',
      notified: false,
      score: match.score,
      matchReasons: match.matchReasons,
      expiresAt: Timestamp.fromMillis(Date.now() + 48 * 60 * 60 * 1000) // 48 hours
    });

    // Update vendor's weekly lead count
    const vendorRef = doc(db, 'vendors', match.vendorId);
    batch.update(vendorRef, {
      leadsReceivedThisWeek: arrayUnion(leadId)
    });
  });

  // Update lead status
  const leadRef = doc(db, 'leads', leadId);
  batch.update(leadRef, {
    status: 'active',
    matchedAt: serverTimestamp(),
    matchedVendors: matches.map(m => m.vendorId)
  });

  await batch.commit();
}

/**
 * Handle expired leads (48-hour timeout)
 */
export async function processExpiredLeads(): Promise<void> {
  try {
    const fortyEightHoursAgo = Timestamp.fromMillis(Date.now() - 48 * 60 * 60 * 1000);
    
    const expiredQuery = query(
      collection(db, 'vendorLeads'),
      where('status', '==', 'assigned'),
      where('assignedAt', '<', fortyEightHoursAgo)
    );
    
    const expiredSnapshot = await getDocs(expiredQuery);
    
    if (!expiredSnapshot.empty) {
      const batch = writeBatch(db);
      const leadUpdates = new Map<string, any[]>();
      
      expiredSnapshot.forEach(docSnap => {
        const vendorLead = { id: docSnap.id, ...docSnap.data() };
        
        // Update vendor lead status
        const vendorLeadRef = doc(db, 'vendorLeads', vendorLead.id);
        batch.update(vendorLeadRef, { status: 'expired' });
        
        // Collect non-responsive vendors by lead
        if (!leadUpdates.has(vendorLead.leadId)) {
          leadUpdates.set(vendorLead.leadId, []);
        }
        leadUpdates.get(vendorLead.leadId)!.push({
          vendorId: vendorLead.vendorId,
          vendorName: vendorLead.vendorName
        });
      });
      
      // Update leads with non-responsive vendors
      leadUpdates.forEach((nonResponsiveVendors, leadId) => {
        const leadRef = doc(db, 'leads', leadId);
        batch.update(leadRef, {
          nonResponsiveVendors: arrayUnion(...nonResponsiveVendors)
        });
      });
      
      await batch.commit();
      console.log(`Processed ${expiredSnapshot.size} expired vendor leads`);
    }
  } catch (error) {
    console.error('Error processing expired leads:', error);
  }
}

/**
 * Get customer profile with preferences
 */
async function getCustomerProfile(customerId: string): Promise<any> {
  try {
    const customerRef = doc(db, 'customers', customerId);
    const customerDoc = await getDoc(customerRef);
    return customerDoc.exists() ? customerDoc.data() : null;
  } catch (error) {
    console.error('Error getting customer profile:', error);
    return null;
  }
}

/**
 * Get coordinates from ZIP code (simplified version)
 */
function getCoordinatesFromZip(zipCode: string): { latitude: number; longitude: number } | null {
  // This would integrate with a ZIP code database or API
  // For now, return null to use ZIP code matching
  return null;
}

/**
 * Update vendor lead status when vendor responds
 */
export async function updateVendorLeadStatus(vendorLeadId: string, status: 'viewed' | 'contacted' | 'declined'): Promise<void> {
  try {
    const vendorLeadRef = doc(db, 'vendorLeads', vendorLeadId);
    await updateDoc(vendorLeadRef, {
      status,
      respondedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating vendor lead status:', error);
    throw error;
  }
}

/**
 * Get leads for a specific vendor
 */
export async function getVendorLeads(vendorId: string): Promise<any[]> {
  try {
    const q = query(
      collection(db, 'vendorLeads'),
      where('vendorId', '==', vendorId)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting vendor leads:', error);
    return [];
  }
}

/**
 * Reset weekly lead counts for all vendors (run weekly)
 */
export async function resetWeeklyLeadCounts(): Promise<void> {
  try {
    const vendorsQuery = query(collection(db, 'vendors'));
    const vendorsSnapshot = await getDocs(vendorsQuery);
    
    const batch = writeBatch(db);
    
    vendorsSnapshot.forEach(doc => {
      const vendorRef = doc.ref;
      batch.update(vendorRef, {
        leadsReceivedThisWeek: 0,
        weeklyLeadCount: 0
      });
    });
    
    await batch.commit();
    console.log('Weekly lead counts reset for all vendors');
  } catch (error) {
    console.error('Error resetting weekly lead counts:', error);
    throw error;
  }
}