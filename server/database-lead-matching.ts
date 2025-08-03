import { db } from './db';
import { users, leads, type InsertLead } from '../shared/schema';
import { eq, and } from 'drizzle-orm';
import * as geolib from 'geolib';
import * as geofire from 'geofire-common';

// Comprehensive ZIP code database for matching
const ZIP_COORDS: Record<string, { lat: number; lng: number }> = {
  // Colorado (Main service area)
  "80202": { lat: 39.7547, lng: -105.0178 }, // Denver
  "80301": { lat: 40.0150, lng: -105.2705 }, // Boulder
  "80904": { lat: 38.8339, lng: -104.8214 }, // Colorado Springs
  "81620": { lat: 39.1911, lng: -106.8175 }, // Avon
  "81615": { lat: 39.6403, lng: -106.3781 }, // Vail
  "81435": { lat: 37.9358, lng: -107.8123 }, // Telluride
  "81301": { lat: 37.2753, lng: -107.8801 }, // Durango
  "80424": { lat: 39.6403, lng: -106.0556 }, // Breckenridge
  "81224": { lat: 38.8675, lng: -106.0884 }, // Buena Vista
  
  // Major US markets
  "90210": { lat: 34.0901, lng: -118.4065 }, // Beverly Hills, CA
  "10001": { lat: 40.7505, lng: -73.9934 }, // New York, NY
  "60601": { lat: 41.8781, lng: -87.6298 }, // Chicago, IL
  "85001": { lat: 33.4484, lng: -112.0740 }, // Phoenix, AZ
};

const getCoordinatesFromZip = (zipCode: string): { lat: number; lng: number } | null => {
  return ZIP_COORDS[zipCode] || null;
};

// Fallback professional database
const fallbackProfessionals = [
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
    serviceRadius: 75,
    productCategories: ['tiles', 'stone', 'slabs'],
    specialty: 'Natural stone and ceramic tiles',
    yearsExperience: 12,
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
    uid: 'prof_003',
    role: 'vendor',
    email: 'avonflooring@gmail.com',
    name: 'Avon Flooring Center',
    businessName: 'Avon Flooring Center',
    phone: '(970) 555-0125',
    zipCode: '81620',
    latitude: 39.1911,
    longitude: -106.8175,
    serviceRadius: 60,
    productCategories: ['hardwood', 'vinyl', 'carpet'],
    specialty: 'Mountain luxury flooring',
    yearsExperience: 15,
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
    uid: 'prof_005',
    role: 'vendor',
    email: 'coloradostone@gmail.com',
    name: 'Colorado Stone Works',
    businessName: 'Colorado Stone Works',
    phone: '(303) 555-0127',
    zipCode: '80904',
    latitude: 38.8339,
    longitude: -104.8214,
    serviceRadius: 80,
    productCategories: ['stone', 'slabs', 'tiles'],
    specialty: 'Natural stone countertops and flooring',
    yearsExperience: 18,
    verified: true,
    rating: 4.6,
    reviewCount: 124
  }
];

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
export async function matchLeadWithDatabase(leadData: LeadMatchData): Promise<{ leadId: string; matchedProfessionals: any[] }> {
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
        
        // Skip vendors without ZIP codes
        if (!vendor.zipCode) {
          console.log(`⚠️ Skipping vendor ${vendor.email} - no ZIP code`);
          continue;
        }
        
        // Get coordinates for distance calculation
        const vendorCoords = getCoordinatesFromZip(vendor.zipCode);
        const customerCoords = getCoordinatesFromZip(leadData.zipCode);
        
        if (vendorCoords && customerCoords) {
          // Calculate distance
          const distanceInM = geolib.getDistance(
            { latitude: customerCoords.lat, longitude: customerCoords.lng },
            { latitude: vendorCoords.lat, longitude: vendorCoords.lng }
          );
          const distanceInMi = geolib.convertDistance(distanceInM, 'mi');
          
          // First priority: exact ZIP code match, then 50-mile radius for all professionals
          const isExactZipMatch = vendor.zipCode === leadData.zipCode;
          const isWithinRadius = distanceInMi <= 50;
          
          if (isExactZipMatch || isWithinRadius) {
            const match = {
              id: vendor.uid,
              role: 'vendor',
              email: vendor.email,
              name: vendor.name,
              phone: vendor.phone,
              companyName: vendor.companyName,
              zipCode: vendor.zipCode,
              materialCategories: leadData.materialCategories, // Assign all categories to vendor
              distance: isExactZipMatch ? '0 miles (same ZIP)' : `${distanceInMi.toFixed(1)} miles`,
              matchScore: isExactZipMatch ? 100 : Math.max(50, 100 - Math.floor(distanceInMi)) // Perfect score for exact ZIP
            };
            
            matchedProfessionals.push(match);
            console.log(`✅ Matched vendor: ${vendor.email} (${distanceInMi.toFixed(1)} miles)`);
          } else {
            console.log(`❌ Vendor ${vendor.email} too far: ${distanceInMi.toFixed(1)} miles`);
          }
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
        
        // Skip trades without ZIP codes
        if (!trade.zipCode) {
          console.log(`⚠️ Skipping trade ${trade.email} - no ZIP code`);
          continue;
        }
        
        // Get coordinates for distance calculation
        const tradeCoords = getCoordinatesFromZip(trade.zipCode);
        const customerCoords = getCoordinatesFromZip(leadData.zipCode);
        
        if (tradeCoords && customerCoords) {
          // Calculate distance
          const distanceInM = geolib.getDistance(
            { latitude: customerCoords.lat, longitude: customerCoords.lng },
            { latitude: tradeCoords.lat, longitude: tradeCoords.lng }
          );
          const distanceInMi = geolib.convertDistance(distanceInM, 'mi');
          
          // First priority: exact ZIP code match, then 50-mile radius for all professionals
          const isExactZipMatch = trade.zipCode === leadData.zipCode;
          const isWithinRadius = distanceInMi <= 50;
          
          if (isExactZipMatch || isWithinRadius) {
            const match = {
              id: trade.uid,
              role: 'trade',
              email: trade.email,
              name: trade.name,
              phone: trade.phone,
              companyName: trade.companyName,
              zipCode: trade.zipCode,
              materialCategories: leadData.materialCategories,
              distance: isExactZipMatch ? '0 miles (same ZIP)' : `${distanceInMi.toFixed(1)} miles`,
              matchScore: isExactZipMatch ? 100 : Math.max(50, 100 - Math.floor(distanceInMi)) // Perfect score for exact ZIP
            };
            
            matchedProfessionals.push(match);
            console.log(`✅ Matched trade: ${trade.email} (${distanceInMi.toFixed(1)} miles)`);
          } else {
            console.log(`❌ Trade ${trade.email} too far: ${distanceInMi.toFixed(1)} miles`);
          }
        }
      }
    }
    
    console.log(`🎯 Total matched professionals: ${matchedProfessionals.length}`);
    
    // If no database matches found, use fallback professionals
    if (matchedProfessionals.length === 0) {
      console.log('🔄 No database matches found, using fallback professionals...');
      
      const customerCoords = getCoordinatesFromZip(leadData.zipCode);
      if (customerCoords) {
        for (const professional of fallbackProfessionals) {
          // Check if professional role matches what we're looking for
          const isVendorMatch = lookingForVendors && professional.role === 'vendor';
          const isTradeMatch = lookingForTrades && professional.role === 'trade';
          
          if (isVendorMatch || isTradeMatch) {
            // Calculate distance
            const distanceInM = geolib.getDistance(
              { latitude: customerCoords.lat, longitude: customerCoords.lng },
              { latitude: professional.latitude, longitude: professional.longitude }
            );
            const distanceInMi = geolib.convertDistance(distanceInM, 'mi');
            
            // First priority: exact ZIP code match, then 50-mile radius for all professionals
            const isExactZipMatch = professional.zipCode === leadData.zipCode;
            const isWithinRadius = distanceInMi <= 50;
            
            if (isExactZipMatch || isWithinRadius) {
              // Check category match for trades
              let categoryMatch = true;
              if (professional.role === 'trade') {
                const categories = professional.tradeCategories || [];
                categoryMatch = leadData.materialCategories.some((category: string) => {
                  const normalizedCategory = category.toLowerCase().replace('-', ' ');
                  return categories.some((cat: string) => 
                    cat.toLowerCase().includes(normalizedCategory) ||
                    normalizedCategory.includes(cat.toLowerCase())
                  );
                });
              }
              
              if (categoryMatch) {
                const match = {
                  id: professional.uid,
                  role: professional.role,
                  email: professional.email,
                  name: professional.businessName || professional.name,
                  phone: professional.phone,
                  companyName: professional.businessName,
                  zipCode: professional.zipCode,
                  materialCategories: leadData.materialCategories,
                  distance: isExactZipMatch ? '0 miles (same ZIP)' : `${distanceInMi.toFixed(1)} miles`,
                  matchScore: isExactZipMatch ? 100 : Math.max(50, 100 - Math.floor(distanceInMi)), // Perfect score for exact ZIP
                  fallbackProfessional: true
                };
                
                matchedProfessionals.push(match);
                console.log(`✅ Matched fallback ${professional.role}: ${professional.email} (${distanceInMi.toFixed(1)} miles)`);
              }
            }
          }
        }
        
        console.log(`🎯 Total professionals after fallback: ${matchedProfessionals.length}`);
      }
    }
    
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
    
    // Store lead for each matched professional in database
    for (const professional of matchedProfessionals) {
      // Create customized lead for this professional
      const leadToInsert = {
        id: `${leadId}-${professional.email}`,
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
        customerType: leadData.customerType,
        isLookingForPro: leadData.isLookingForPro,
        professionalType: leadData.professionalType,
        assignedTo: professional.email,
        professionalRole: professional.role,
        distance: professional.distance,
        matchScore: professional.matchScore,
        matchedProfessionals: matchedProfessionals,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Insert into database
      await db.insert(leads).values([leadToInsert]);
      
      console.log(`📬 Assigned lead ${leadId} to ${professional.role} ${professional.email}`);
    }
    
    console.log(`✅ Lead matching completed successfully. Created ${matchedProfessionals.length} professional assignments.`);
    
    // Return the lead data with matched professionals
    return {
      leadId: leadId,
      matchedProfessionals: matchedProfessionals
    };
    
  } catch (error) {
    console.error('❌ Database lead matching failed:', error);
    throw error;
  }
}

/**
 * Get leads for a specific professional by email from database
 */
export async function getLeadsForProfessionalByEmail(email: string): Promise<any[]> {
  try {
    const professionalLeads = await db.select()
      .from(leads)
      .where(eq(leads.assignedTo, email))
      .orderBy(leads.createdAt);
    
    console.log(`🔍 Retrieved ${professionalLeads.length} leads for ${email}`);
    return professionalLeads;
  } catch (error) {
    console.error('❌ Error retrieving leads from database:', error);
    return [];
  }
}

/**
 * Get all lead matches for debugging
 */
export async function getAllLeadMatches(): Promise<any[]> {
  try {
    const allLeads = await db.select().from(leads);
    return allLeads;
  } catch (error) {
    console.error('❌ Error retrieving all leads:', error);
    return [];
  }
}

/**
 * Clear all lead matches (for testing)
 */
export async function clearAllLeadMatches(): Promise<void> {
  try {
    await db.delete(leads);
    console.log('🧹 Cleared all lead matches from database');
  } catch (error) {
    console.error('❌ Error clearing leads:', error);
  }
}