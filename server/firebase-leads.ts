import { collection, addDoc } from "firebase/firestore";
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { matchLeadWithProfessionals } from './lead-matching.js';

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: `${process.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: `${process.env.VITE_FIREBASE_PROJECT_ID}.firebasestorage.app`,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase if not already initialized
if (!getApps().length) {
  initializeApp(firebaseConfig);
}

const db = getFirestore();

export interface LeadFormData {
  name?: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  zipCode?: string;
  message?: string;
  isLookingForPro?: boolean;
  customerType?: string;
  interest?: string;
  source?: string;
  materialCategory?: string;
  materialCategories?: string[];
  projectType?: string;
  budget?: number | string;
  timeline?: string;
  projectDetails?: string;
  description?: string;
  product?: string;
  requestType?: 'pricing' | 'sample';
  productSpecs?: any;
  productUrl?: string;
}

export async function submitLead(formData: LeadFormData): Promise<void> {
  console.log('🚀 submitLead function called with:', JSON.stringify(formData, null, 2));
  
  try {
    // Determine lead type based on intent
    let leadType = formData.isLookingForPro ? "trade" : "vendor";
    console.log('🎯 Lead type determined:', leadType);

    const leadData = {
      name: formData.name || "Anonymous",
      email: formData.email,
      phone: formData.phone || null,
      address: formData.address || null,
      city: formData.city || null,
      state: formData.state || null,
      zip: formData.zip || null,
      zipCode: formData.zipCode || formData.zip || null,
      requestDetails: formData.message || formData.description || null,
      type: leadType, // "vendor" or "trade"
      source: formData.source || "customer-request",
      customerType: formData.customerType || "homeowner",
      interest: formData.interest || formData.product || null,
      materialCategory: (formData.materialCategory || formData.materialCategories?.[0] || formData.interest || formData.product || "General").toLowerCase(),
      materialCategories: formData.materialCategories || [formData.materialCategory || "General"],
      projectType: formData.projectType || "General Inquiry",
      budget: formData.budget || null,
      timeline: formData.timeline || null,
      projectDetails: formData.projectDetails || formData.message || null,
      description: formData.description || formData.message || "",
      isLookingForPro: formData.isLookingForPro || false,
      requestType: formData.requestType || 'pricing',
      productSpecs: formData.productSpecs || null,
      productUrl: formData.productUrl || null,
      status: "new",
      intentScore: calculateIntentScore(formData),
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };

    let leadId = null;
    
    // Try to save to Firebase first
    try {
      const docRef = await addDoc(collection(db, "leads"), leadData);
      leadId = docRef.id;
      console.log(`✅ Lead submitted successfully: ${leadData.email} (${leadType}) with ID: ${leadId}`);
    } catch (fbError) {
      console.log(`⚠️ Firebase lead submission failed, continuing with matching: ${fbError.message}`);
      leadId = `temp_${Date.now()}`;
    }
    
    // Always trigger lead matching regardless of Firebase success/failure
    if (leadData.zipCode && leadData.materialCategory) {
      console.log(`🔄 Starting lead matching process for ${leadData.email} with material category: ${leadData.materialCategory}`);
      console.log(`📋 Lead details: ${leadData.requestType} request for ${leadData.materialCategories?.join(', ') || leadData.materialCategory}`);
      
      if (leadData.requestType === 'sample' && leadData.productSpecs) {
        console.log(`🎯 Sample request includes product specs: ${Object.keys(leadData.productSpecs).join(', ')}`);
      }
      
      try {
        // Add timeout to prevent hanging
        console.log('🔄 Calling matchLeadWithProfessionals with lead data:', { ...leadData, id: leadId });
        console.log('🔄 About to call matchLeadWithProfessionals...');
        
        const matchingPromise = matchLeadWithProfessionals({ ...leadData, id: leadId });
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Matching timeout')), 5000));
        
        await Promise.race([matchingPromise, timeoutPromise]);
        console.log('✅ Lead matching completed successfully');
      } catch (matchError) {
        console.log('⚠️ Lead matching failed or timed out:', matchError.message);
        console.log('⚠️ Error details:', matchError);
      }
    } else {
      console.log(`⚠️ Lead matching skipped - missing zipCode: ${leadData.zipCode}, materialCategory: ${leadData.materialCategory}`);
    }
    
  } catch (error) {
    console.error('❌ Error in lead submission process:', error);
    // Don't throw error - just log it so the API can still respond
    console.log('⚠️ Lead submission process completed with errors, but continuing...');
  }
}

// Calculate intent score based on lead characteristics
function calculateIntentScore(formData: LeadFormData): number {
  let score = 5; // Base score
  
  // Urgency indicators
  const description = formData.description || formData.message || "";
  if (description.toLowerCase().includes('urgent') || description.toLowerCase().includes('asap')) {
    score += 3;
  }
  
  // Budget indicators
  if (formData.budget && formData.budget > 1000) {
    score += 2;
  }
  
  // Contact information completeness
  if (formData.phone && formData.email) {
    score += 1;
  }
  
  // Project details specificity
  if (formData.projectDetails && formData.projectDetails.length > 50) {
    score += 1;
  }
  
  // Timeline indicators
  if (formData.timeline && formData.timeline.toLowerCase().includes('month')) {
    score += 1;
  }
  
  return Math.min(score, 10); // Cap at 10
}

// Determine urgency level based on timeline
function determineUrgency(timeline: string | undefined): 'low' | 'medium' | 'high' {
  if (!timeline) return 'low';
  
  const timelineLower = timeline.toLowerCase();
  
  if (timelineLower.includes('immediate') || timelineLower.includes('asap') || timelineLower.includes('urgent')) {
    return 'high';
  } else if (timelineLower.includes('week') || timelineLower.includes('month')) {
    return 'medium';
  } else {
    return 'low';
  }
}

// The actual matchLeadWithProfessionals function is imported from lead-matching.ts

// Save product to Firebase
export async function saveProduct(product: any): Promise<void> {
  try {
    await addDoc(collection(db, "comperra-products"), {
      name: product.name,
      category: product.category,
      finish: product.finish || null,
      price: product.price || "0.00",
      peiRating: product.peiRating || null,
      imageUrl: product.imageUrl || null,
      dimensions: product.dimensions || null,
      installLocation: product.installLocation || null,
      productUrl: product.productUrl || null,
      specifications: product.specifications || {},
      brand: product.brand || "Unknown",
      createdAt: new Date().toISOString()
    });
    console.log(`✅ Product saved to Firebase: ${product.name}`);
  } catch (error) {
    console.error('❌ Error saving product to Firebase:', error);
    throw error;
  }
}

// Save vendor to Firebase
export async function saveVendor(vendor: any): Promise<void> {
  try {
    await addDoc(collection(db, "vendors"), {
      companyName: vendor.companyName,
      email: vendor.email,
      plan: vendor.plan || "Basic",
      subscriptionStatus: vendor.subscriptionStatus || "Active",
      createdAt: new Date().toISOString()
    });
    console.log(`✅ Vendor saved to Firebase: ${vendor.companyName}`);
  } catch (error) {
    console.error('❌ Error saving vendor to Firebase:', error);
    throw error;
  }
}

// Save trade professional to Firebase
export async function saveTrade(trade: any): Promise<void> {
  try {
    await addDoc(collection(db, "trades"), {
      name: trade.name,
      trade: trade.trade,
      email: trade.email,
      phone: trade.phone || null,
      createdAt: new Date().toISOString()
    });
    console.log(`✅ Trade professional saved to Firebase: ${trade.name}`);
  } catch (error) {
    console.error('❌ Error saving trade professional to Firebase:', error);
    throw error;
  }
}

// Save customer to Firebase
export async function saveCustomer(customer: any): Promise<void> {
  try {
    await addDoc(collection(db, "customers"), {
      name: customer.name,
      email: customer.email,
      phone: customer.phone || null,
      preferences: customer.preferences || [],
      customerType: customer.customerType || "homeowner",
      createdAt: new Date().toISOString()
    });
    console.log(`✅ Customer saved to Firebase: ${customer.name}`);
  } catch (error) {
    console.error('❌ Error saving customer to Firebase:', error);
    throw error;
  }
}

// Save subscription selection to Firebase
export async function saveSubscription(subscriptionData: any): Promise<void> {
  try {
    await addDoc(collection(db, "subscriptions"), {
      userId: subscriptionData.userId,
      email: subscriptionData.email,
      planId: subscriptionData.planId,
      planName: subscriptionData.planName,
      price: subscriptionData.price,
      billingCycle: subscriptionData.billingCycle, // monthly, yearly, one-time
      status: subscriptionData.status || "active",
      startDate: new Date().toISOString(),
      features: subscriptionData.features || [],
      createdAt: new Date().toISOString()
    });
    console.log(`✅ Subscription saved to Firebase: ${subscriptionData.email} - ${subscriptionData.planName}`);
  } catch (error) {
    console.error('❌ Error saving subscription to Firebase:', error);
    throw error;
  }
}