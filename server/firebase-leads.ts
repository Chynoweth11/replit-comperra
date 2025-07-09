import { collection, addDoc } from "firebase/firestore";
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

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
  email: string;
  phone?: string;
  zip?: string;
  zipCode?: string;
  message?: string;
  isLookingForPro?: boolean;
  customerType?: string;
  interest?: string;
  source?: string;
  materialCategory?: string;
  projectType?: string;
  budget?: number;
  timeline?: string;
  projectDetails?: string;
  description?: string;
}

export async function submitLead(formData: LeadFormData): Promise<void> {
  try {
    // Determine lead type based on intent
    let leadType = formData.isLookingForPro ? "trade" : "vendor";

    const leadData = {
      email: formData.email,
      phone: formData.phone || null,
      zip: formData.zip || null,
      zipCode: formData.zipCode || formData.zip || null,
      requestDetails: formData.message || formData.description || null,
      type: leadType, // "vendor" or "trade"
      source: formData.source || "customer-request",
      customerType: formData.customerType || "homeowner",
      interest: formData.interest || null,
      materialCategory: formData.materialCategory || formData.interest || "General",
      projectType: formData.projectType || "General Inquiry",
      budget: formData.budget || null,
      timeline: formData.timeline || null,
      projectDetails: formData.projectDetails || null,
      description: formData.description || formData.message || "",
      status: "new",
      intentScore: calculateIntentScore(formData),
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };

    const docRef = await addDoc(collection(db, "leads"), leadData);
    console.log(`✅ Lead submitted successfully: ${leadData.email} (${leadType}) with ID: ${docRef.id}`);
    
    // Trigger lead matching if we have enough data
    if (leadData.zipCode && leadData.materialCategory) {
      await matchLeadWithProfessionals({ ...leadData, id: docRef.id });
    }
  } catch (error) {
    console.error('❌ Error submitting lead to Firebase:', error);
    throw error;
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

// Mock lead matching function (simplified version)
async function matchLeadWithProfessionals(leadData: any): Promise<void> {
  try {
    console.log('🔍 Starting lead matching for:', leadData.email);
    // In a real implementation, this would use the lead-matching.ts functionality
    // For now, we'll just log the attempt
    console.log('🎯 Lead matching would be triggered here with data:', {
      zipCode: leadData.zipCode,
      materialCategory: leadData.materialCategory,
      intentScore: leadData.intentScore
    });
  } catch (error) {
    console.error('❌ Error in lead matching:', error);
  }
}

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