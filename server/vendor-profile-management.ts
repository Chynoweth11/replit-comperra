import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs, arrayUnion, arrayRemove, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase-init';

export interface VendorProfile {
  id: string;
  fullName: string;
  businessName?: string;
  email: string;
  phone?: string;
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
  certifications?: string[];
  licenseNumber?: string;
  insuranceVerified?: boolean;
  backgroundChecked?: boolean;
  profileImageUrl?: string;
  portfolioImages?: string[];
  businessDescription?: string;
  createdAt: any;
  updatedAt: any;
  lastActive: any;
  subscription?: {
    planId: string;
    planName: string;
    price: number;
    billingCycle: 'monthly' | 'yearly';
    features: string[];
    status: 'active' | 'canceled' | 'expired';
    nextBilling?: any;
  };
}

export interface CustomerProfile {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  customerType: 'homeowner' | 'designer' | 'architect' | 'trade' | 'other';
  favoriteVendors: string[];
  blockedVendors: string[];
  preferredMaterials?: string[];
  budgetRange?: string;
  projectHistory?: Array<{
    leadId: string;
    material: string;
    completedAt: any;
    rating?: number;
  }>;
  communicationPreferences?: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    callbacks: boolean;
  };
  createdAt: any;
  updatedAt: any;
}

/**
 * Create or update vendor profile
 */
export async function createVendorProfile(vendorData: Partial<VendorProfile>): Promise<VendorProfile> {
  try {
    // Build vendor profile with only defined values
    const vendorProfile: any = {
      id: vendorData.id || `vendor_${Date.now()}`,
      fullName: vendorData.fullName || '',
      email: vendorData.email || '',
      materials: vendorData.materials || [],
      zipCodesServed: vendorData.zipCodesServed || [],
      weeklyLeadLimit: vendorData.weeklyLeadLimit || 10,
      leadsReceivedThisWeek: 0,
      active: true,
      ratingAverage: 0,
      totalReviews: 0,
      reportCount: 0,
      tier: vendorData.tier || 'free',
      specialties: vendorData.specialties || [],
      serviceRadius: vendorData.serviceRadius || 25,
      certifications: vendorData.certifications || [],
      insuranceVerified: vendorData.insuranceVerified || false,
      backgroundChecked: vendorData.backgroundChecked || false,
      portfolioImages: vendorData.portfolioImages || [],
      createdAt: vendorData.createdAt || serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastActive: serverTimestamp()
    };

    // Only add optional fields if they have values
    if (vendorData.businessName) vendorProfile.businessName = vendorData.businessName;
    if (vendorData.phone) vendorProfile.phone = vendorData.phone;
    if (vendorData.yearsExperience !== undefined) vendorProfile.yearsExperience = vendorData.yearsExperience;
    if (vendorData.latitude !== undefined) vendorProfile.latitude = vendorData.latitude;
    if (vendorData.longitude !== undefined) vendorProfile.longitude = vendorData.longitude;
    if (vendorData.minimumProject !== undefined) vendorProfile.minimumProject = vendorData.minimumProject;
    if (vendorData.licenseNumber) vendorProfile.licenseNumber = vendorData.licenseNumber;
    if (vendorData.profileImageUrl) vendorProfile.profileImageUrl = vendorData.profileImageUrl;
    if (vendorData.businessDescription) vendorProfile.businessDescription = vendorData.businessDescription;
    if (vendorData.subscription) vendorProfile.subscription = vendorData.subscription;

    const vendorRef = doc(db, 'vendors', vendorProfile.id);
    await setDoc(vendorRef, vendorProfile);
    
    return vendorProfile;
  } catch (error) {
    console.error('Error creating vendor profile:', error);
    throw error;
  }
}

/**
 * Update vendor profile
 */
export async function updateVendorProfile(vendorId: string, updates: Partial<VendorProfile>): Promise<void> {
  try {
    // Clean updates to remove undefined values
    const cleanUpdates: any = {
      updatedAt: serverTimestamp()
    };
    
    // Only add fields that have values
    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined) {
        cleanUpdates[key] = value;
      }
    });

    const vendorRef = doc(db, 'vendors', vendorId);
    await updateDoc(vendorRef, cleanUpdates);
  } catch (error) {
    console.error('Error updating vendor profile:', error);
    throw error;
  }
}

/**
 * Get vendor profile
 */
export async function getVendorProfile(vendorId: string): Promise<VendorProfile | null> {
  try {
    const vendorRef = doc(db, 'vendors', vendorId);
    const vendorDoc = await getDoc(vendorRef);
    
    if (vendorDoc.exists()) {
      return { id: vendorDoc.id, ...vendorDoc.data() } as VendorProfile;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting vendor profile:', error);
    return null;
  }
}

/**
 * Create or update customer profile
 */
export async function createCustomerProfile(customerData: Partial<CustomerProfile>): Promise<CustomerProfile> {
  try {
    const customerProfile: CustomerProfile = {
      id: customerData.id || '',
      fullName: customerData.fullName || '',
      email: customerData.email || '',
      phone: customerData.phone,
      customerType: customerData.customerType || 'homeowner',
      favoriteVendors: customerData.favoriteVendors || [],
      blockedVendors: customerData.blockedVendors || [],
      preferredMaterials: customerData.preferredMaterials || [],
      budgetRange: customerData.budgetRange,
      projectHistory: customerData.projectHistory || [],
      communicationPreferences: customerData.communicationPreferences || {
        emailNotifications: true,
        smsNotifications: false,
        callbacks: true
      },
      createdAt: customerData.createdAt || serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const customerRef = doc(db, 'customers', customerProfile.id);
    await setDoc(customerRef, customerProfile);
    
    return customerProfile;
  } catch (error) {
    console.error('Error creating customer profile:', error);
    throw error;
  }
}

/**
 * Update customer profile
 */
export async function updateCustomerProfile(customerId: string, updates: Partial<CustomerProfile>): Promise<void> {
  try {
    const customerRef = doc(db, 'customers', customerId);
    await updateDoc(customerRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating customer profile:', error);
    throw error;
  }
}

/**
 * Get customer profile
 */
export async function getCustomerProfile(customerId: string): Promise<CustomerProfile | null> {
  try {
    const customerRef = doc(db, 'customers', customerId);
    const customerDoc = await getDoc(customerRef);
    
    if (customerDoc.exists()) {
      return { id: customerDoc.id, ...customerDoc.data() } as CustomerProfile;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting customer profile:', error);
    return null;
  }
}

/**
 * Toggle favorite vendor for customer
 */
export async function toggleFavoriteVendor(customerId: string, vendorId: string): Promise<void> {
  try {
    const customerRef = doc(db, 'customers', customerId);
    const customerDoc = await getDoc(customerRef);
    
    if (customerDoc.exists()) {
      const customerData = customerDoc.data();
      const favoriteVendors = customerData.favoriteVendors || [];
      
      if (favoriteVendors.includes(vendorId)) {
        // Remove from favorites
        await updateDoc(customerRef, {
          favoriteVendors: arrayRemove(vendorId),
          updatedAt: serverTimestamp()
        });
      } else {
        // Add to favorites
        await updateDoc(customerRef, {
          favoriteVendors: arrayUnion(vendorId),
          updatedAt: serverTimestamp()
        });
      }
    }
  } catch (error) {
    console.error('Error toggling favorite vendor:', error);
    throw error;
  }
}

/**
 * Toggle blocked vendor for customer
 */
export async function toggleBlockedVendor(customerId: string, vendorId: string): Promise<void> {
  try {
    const customerRef = doc(db, 'customers', customerId);
    const customerDoc = await getDoc(customerRef);
    
    if (customerDoc.exists()) {
      const customerData = customerDoc.data();
      const blockedVendors = customerData.blockedVendors || [];
      
      if (blockedVendors.includes(vendorId)) {
        // Unblock vendor
        await updateDoc(customerRef, {
          blockedVendors: arrayRemove(vendorId),
          updatedAt: serverTimestamp()
        });
      } else {
        // Block vendor and remove from favorites
        await updateDoc(customerRef, {
          blockedVendors: arrayUnion(vendorId),
          favoriteVendors: arrayRemove(vendorId),
          updatedAt: serverTimestamp()
        });
      }
    }
  } catch (error) {
    console.error('Error toggling blocked vendor:', error);
    throw error;
  }
}

/**
 * Get vendor statistics and metrics
 */
export async function getVendorMetrics(vendorId: string): Promise<any> {
  try {
    const vendorProfile = await getVendorProfile(vendorId);
    if (!vendorProfile) return null;

    // Get recent leads
    const leadsQuery = query(
      collection(db, 'vendorLeads'),
      where('vendorId', '==', vendorId)
    );
    const leadsSnapshot = await getDocs(leadsQuery);
    const leads = leadsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Calculate metrics
    const totalLeads = leads.length;
    const activeLeads = leads.filter(lead => lead.status === 'assigned' || lead.status === 'viewed').length;
    const respondedLeads = leads.filter(lead => lead.status === 'contacted').length;
    const expiredLeads = leads.filter(lead => lead.status === 'expired').length;
    
    const responseRate = totalLeads > 0 ? (respondedLeads / totalLeads) * 100 : 0;
    const conversionRate = totalLeads > 0 ? (respondedLeads / totalLeads) * 100 : 0;
    
    // Calculate average response time
    const respondedLeadsWithTime = leads.filter(lead => lead.respondedAt && lead.assignedAt);
    const avgResponseTime = respondedLeadsWithTime.length > 0 
      ? respondedLeadsWithTime.reduce((sum, lead) => {
          const responseTime = lead.respondedAt.toMillis() - lead.assignedAt.toMillis();
          return sum + responseTime;
        }, 0) / respondedLeadsWithTime.length
      : 0;

    return {
      totalLeads,
      activeLeads,
      respondedLeads,
      expiredLeads,
      responseRate,
      conversionRate,
      avgResponseTime: avgResponseTime / (1000 * 60 * 60), // Convert to hours
      weeklyLeadCount: vendorProfile.leadsReceivedThisWeek,
      weeklyLeadLimit: vendorProfile.weeklyLeadLimit,
      rating: vendorProfile.ratingAverage,
      totalReviews: vendorProfile.totalReviews,
      tier: vendorProfile.tier
    };
  } catch (error) {
    console.error('Error getting vendor metrics:', error);
    return null;
  }
}

/**
 * Update vendor subscription
 */
export async function updateVendorSubscription(vendorId: string, subscription: any): Promise<void> {
  try {
    const vendorRef = doc(db, 'vendors', vendorId);
    await updateDoc(vendorRef, {
      subscription,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating vendor subscription:', error);
    throw error;
  }
}

/**
 * Get vendors by material and location
 */
export async function getVendorsByMaterialAndLocation(material: string, zipCode: string): Promise<VendorProfile[]> {
  try {
    const vendorsQuery = query(
      collection(db, 'vendors'),
      where('active', '==', true),
      where('materials', 'array-contains', material)
    );
    
    const vendorsSnapshot = await getDocs(vendorsQuery);
    const vendors = vendorsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as VendorProfile[];

    // Filter by ZIP code
    const filteredVendors = vendors.filter(vendor => 
      vendor.zipCodesServed.includes(zipCode)
    );

    return filteredVendors;
  } catch (error) {
    console.error('Error getting vendors by material and location:', error);
    return [];
  }
}

/**
 * Update vendor last active timestamp
 */
export async function updateVendorLastActive(vendorId: string): Promise<void> {
  try {
    const vendorRef = doc(db, 'vendors', vendorId);
    await updateDoc(vendorRef, {
      lastActive: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating vendor last active:', error);
    // Don't throw error for this non-critical operation
  }
}