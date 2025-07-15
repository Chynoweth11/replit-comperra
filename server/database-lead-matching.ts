import { db } from './db';
import { users } from '../shared/schema';
import { eq, and } from 'drizzle-orm';

// In-memory storage for lead matches
const leadMatches = new Map<string, any[]>();

export interface LeadMatchData {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  zipCode: string;
  materialCategory: string;
  materialCategories: string[];
  projectType?: string;
  projectDetails?: string;
  budget?: number;
  timeline?: string;
  requestType?: string;
  productSpecs?: any;
  productUrl?: string;
  status?: string;
  createdAt?: string;
  customerType?: string;
  isLookingForPro?: boolean;
  professionalType?: string;
}

/**
 * Database-based lead matching system
 */
export async function matchLeadWithDatabase(leadData: LeadMatchData): Promise<void> {
  console.log('🔄 Starting database-based lead matching...');
  console.log('📋 Lead data:', JSON.stringify(leadData, null, 2));

  try {
    // Generate lead ID
    const leadId = `lead-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Determine which professionals to match with based on professional type
    let lookingForVendors = false;
    let lookingForTrades = false;
    
    if (leadData.professionalType === 'both') {
      lookingForVendors = true;
      lookingForTrades = true;
    } else if (leadData.professionalType === 'vendor' || (!leadData.isLookingForPro && leadData.professionalType !== 'trade')) {
      lookingForVendors = true;
    } else if (leadData.professionalType === 'trade' || leadData.isLookingForPro) {
      lookingForTrades = true;
    }
    
    console.log('🎯 Looking for vendors:', lookingForVendors);
    console.log('🎯 Looking for trades:', lookingForTrades);
    
    // Find matching professionals from database
    const matchedProfessionals = [];
    
    // Get vendors if needed
    if (lookingForVendors) {
      console.log('🔍 Searching for vendors in database...');
      const vendors = await db.select()
        .from(users)
        .where(eq(users.role, 'vendor'));
      
      console.log(`📊 Found ${vendors.length} vendors in database`);
      
      for (const vendor of vendors) {
        console.log(`🔍 Checking vendor: ${vendor.email} (ZIP: ${vendor.zipCode})`);
        
        // Check ZIP code proximity (simplified - same ZIP for now)
        if (vendor.zipCode === leadData.zipCode) {
          const match = {
            id: vendor.uid,
            role: 'vendor',
            email: vendor.email,
            name: vendor.name,
            phone: vendor.phone,
            companyName: vendor.companyName,
            zipCode: vendor.zipCode,
            materialCategories: leadData.materialCategories, // Assign all categories to vendor
            distance: '0 miles', // Same ZIP
            matchScore: 95 // High score for same ZIP
          };
          
          matchedProfessionals.push(match);
          console.log(`✅ Matched vendor: ${vendor.email}`);
        }
      }
    }
    
    // Get trades if needed
    if (lookingForTrades) {
      console.log('🔍 Searching for trades in database...');
      const trades = await db.select()
        .from(users)
        .where(eq(users.role, 'trade'));
      
      console.log(`📊 Found ${trades.length} trades in database`);
      
      for (const trade of trades) {
        console.log(`🔍 Checking trade: ${trade.email} (ZIP: ${trade.zipCode})`);
        
        // Check ZIP code proximity
        if (trade.zipCode === leadData.zipCode) {
          const match = {
            id: trade.uid,
            role: 'trade',
            email: trade.email,
            name: trade.name,
            phone: trade.phone,
            companyName: trade.companyName,
            zipCode: trade.zipCode,
            materialCategories: leadData.materialCategories,
            distance: '0 miles',
            matchScore: 95
          };
          
          matchedProfessionals.push(match);
          console.log(`✅ Matched trade: ${trade.email}`);
        }
      }
    }
    
    console.log(`🎯 Total matched professionals: ${matchedProfessionals.length}`);
    
    // Create lead object with matched professionals
    const leadWithMatches = {
      id: leadId,
      customerName: leadData.name,
      customerEmail: leadData.email,
      customerPhone: leadData.phone,
      zipCode: leadData.zipCode,
      materialCategory: leadData.materialCategory,
      materialCategories: leadData.materialCategories,
      projectType: leadData.projectType || 'General Project',
      projectDetails: leadData.projectDetails || 'Customer interested in materials/installation',
      budget: leadData.budget || null,
      timeline: leadData.timeline || 'Not specified',
      requestType: leadData.requestType || 'pricing',
      productSpecs: leadData.productSpecs || null,
      productUrl: leadData.productUrl || null,
      status: 'new',
      createdAt: new Date(),
      customerType: leadData.customerType,
      isLookingForPro: leadData.isLookingForPro,
      matchedProfessionals: matchedProfessionals
    };
    
    // Store lead for each matched professional
    for (const professional of matchedProfessionals) {
      // Create customized lead for this professional
      const customizedLead = {
        ...leadWithMatches,
        // Filter material categories to only include those relevant to this professional
        materialCategories: leadData.materialCategories, // For now, include all categories
        assignedTo: professional.email,
        professionalRole: professional.role,
        distance: professional.distance,
        matchScore: professional.matchScore
      };
      
      // Store in professional's lead list
      const existingLeads = leadMatches.get(professional.email) || [];
      existingLeads.push(customizedLead);
      leadMatches.set(professional.email, existingLeads);
      
      console.log(`📬 Assigned lead ${leadId} to ${professional.role} ${professional.email}`);
    }
    
    console.log(`✅ Lead matching completed successfully. Created ${matchedProfessionals.length} professional assignments.`);
    
  } catch (error) {
    console.error('❌ Database lead matching failed:', error);
    throw error;
  }
}

/**
 * Get leads for a specific professional by email
 */
export function getLeadsForProfessionalByEmail(email: string): any[] {
  const leads = leadMatches.get(email) || [];
  console.log(`🔍 Retrieved ${leads.length} leads for ${email}`);
  return leads;
}

/**
 * Get all lead matches for debugging
 */
export function getAllLeadMatches(): Map<string, any[]> {
  return leadMatches;
}

/**
 * Clear all lead matches (for testing)
 */
export function clearAllLeadMatches(): void {
  leadMatches.clear();
  console.log('🧹 Cleared all lead matches');
}