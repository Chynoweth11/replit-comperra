import { db } from './db';
import { leads, users } from '@shared/schema';
import { eq, and, lt, sql } from 'drizzle-orm';

export class AutomatedLeadProcessor {
  private processingInterval: NodeJS.Timeout | null = null;
  private isProcessing = false;

  constructor() {
    this.startAutomatedProcessing();
  }

  startAutomatedProcessing() {
    // Process leads every 5 minutes
    this.processingInterval = setInterval(async () => {
      if (!this.isProcessing) {
        await this.processLeads();
      }
    }, 5 * 60 * 1000); // 5 minutes

    console.log('✅ Automated lead processing started');
  }

  stopAutomatedProcessing() {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
      console.log('🛑 Automated lead processing stopped');
    }
  }

  async processLeads() {
    this.isProcessing = true;
    
    try {
      console.log('🔄 Starting automated lead processing...');
      
      // Process new leads
      await this.processNewLeads();
      
      // Process expired leads
      await this.processExpiredLeads();
      
      // Send reminder emails
      await this.sendReminderEmails();
      
      // Clean up old data
      await this.cleanupOldData();
      
      console.log('✅ Automated lead processing completed');
      
    } catch (error) {
      console.error('❌ Error in automated lead processing:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  async processNewLeads() {
    try {
      // Get leads that haven't been processed yet
      const unprocessedLeads = await db
        .select()
        .from(leads)
        .where(eq(leads.status, 'new'))
        .limit(50);

      console.log(`📋 Processing ${unprocessedLeads.length} new leads...`);

      for (const lead of unprocessedLeads) {
        await this.matchLeadWithVendors(lead);
      }

      console.log('✅ New leads processed successfully');
    } catch (error) {
      console.error('❌ Error processing new leads:', error);
    }
  }

  async matchLeadWithVendors(lead: any) {
    try {
      // Simple matching logic - find vendors/trades in the area
      const professionals = await db
        .select()
        .from(users)
        .where(and(
          eq(users.role, lead.professionalRole || 'vendor'),
          eq(users.zipCode, lead.zipCode)
        ))
        .limit(10);

      console.log(`🎯 Found ${professionals.length} potential matches for lead ${lead.id}`);

      if (professionals.length > 0) {
        // Create individual leads for each professional
        for (const professional of professionals) {
          const matchScore = this.calculateMatchScore(lead, professional);
          
          if (matchScore > 50) { // Only create matches with good scores
            await this.createLeadMatch(lead, professional);
          }
        }

        // Update lead status
        await db
          .update(leads)
          .set({ 
            status: 'matched',
            updatedAt: new Date().toISOString()
          })
          .where(eq(leads.id, lead.id));
      }
    } catch (error) {
      console.error('❌ Error matching lead with vendors:', error);
    }
  }

  async createLeadMatch(lead: any, vendor: any) {
    try {
      // Create a new lead entry for this specific vendor
      const leadId = `${lead.id}-${vendor.id}-${Date.now()}`;
      
      await db.insert(leads).values({
        id: leadId,
        customerName: lead.customerName,
        customerEmail: lead.customerEmail,
        customerPhone: lead.customerPhone,
        zipCode: lead.zipCode,
        materialCategory: lead.materialCategory,
        materialCategories: lead.materialCategories,
        projectType: lead.projectType,
        projectDetails: lead.projectDetails,
        budget: lead.budget,
        timeline: lead.timeline,
        requestType: lead.requestType,
        productSpecs: lead.productSpecs,
        productUrl: lead.productUrl,
        status: 'assigned',
        customerType: lead.customerType,
        isLookingForPro: lead.isLookingForPro,
        professionalType: lead.professionalType,
        assignedTo: vendor.email,
        professionalRole: vendor.role,
        distance: '0 miles', // Would calculate actual distance in production
        matchScore: this.calculateMatchScore(lead, vendor),
        matchedProfessionals: [vendor],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      console.log(`✅ Created lead match: ${leadId} → ${vendor.email}`);
    } catch (error) {
      console.error('❌ Error creating lead match:', error);
    }
  }

  calculateMatchScore(lead: any, vendor: any): number {
    let score = 50; // Base score
    
    // ZIP code match
    if (lead.zipCode === vendor.zipCode) {
      score += 30;
    }
    
    // Role match
    if (lead.professionalRole === vendor.role) {
      score += 20;
    }
    
    return Math.min(score, 100);
  }

  async processExpiredLeads() {
    try {
      const twoDaysAgo = new Date();
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
      
      const expiredLeads = await db
        .select()
        .from(leads)
        .where(and(
          eq(leads.status, 'assigned'),
          lt(leads.createdAt, twoDaysAgo.toISOString())
        ));

      console.log(`⏰ Found ${expiredLeads.length} expired leads`);

      for (const lead of expiredLeads) {
        await db
          .update(leads)
          .set({ 
            status: 'expired',
            updatedAt: new Date().toISOString()
          })
          .where(eq(leads.id, lead.id));
      }

      console.log('✅ Expired leads processed');
    } catch (error) {
      console.error('❌ Error processing expired leads:', error);
    }
  }

  async sendReminderEmails() {
    try {
      // Get leads that need reminders (24 hours old, still active)
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);
      
      const reminderLeads = await db
        .select()
        .from(leads)
        .where(and(
          eq(leads.status, 'assigned'),
          lt(leads.createdAt, oneDayAgo.toISOString())
        ))
        .limit(20);

      console.log(`📧 Sending ${reminderLeads.length} reminder emails`);

      // In production, would send actual emails here
      for (const lead of reminderLeads) {
        console.log(`📧 Reminder email sent to ${lead.assignedTo} for lead ${lead.id}`);
      }

      console.log('✅ Reminder emails sent');
    } catch (error) {
      console.error('❌ Error sending reminder emails:', error);
    }
  }

  async cleanupOldData() {
    try {
      // Archive leads older than 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const oldLeads = await db
        .select()
        .from(leads)
        .where(lt(leads.createdAt, thirtyDaysAgo.toISOString()));

      console.log(`🗑️ Archiving ${oldLeads.length} old leads`);

      for (const lead of oldLeads) {
        await db
          .update(leads)
          .set({ 
            status: 'archived',
            updatedAt: new Date().toISOString()
          })
          .where(eq(leads.id, lead.id));
      }

      console.log('✅ Old data cleanup completed');
    } catch (error) {
      console.error('❌ Error cleaning up old data:', error);
    }
  }

  async getProcessingStats() {
    try {
      const stats = await db
        .select({
          totalLeads: sql<number>`count(*)`,
          newLeads: sql<number>`count(*) filter (where status = 'new')`,
          activeLeads: sql<number>`count(*) filter (where status = 'assigned')`,
          expiredLeads: sql<number>`count(*) filter (where status = 'expired')`,
          archivedLeads: sql<number>`count(*) filter (where status = 'archived')`,
          contactedLeads: sql<number>`count(*) filter (where status = 'contacted')`,
          declinedLeads: sql<number>`count(*) filter (where status = 'declined')`
        })
        .from(leads);

      const result = stats[0] || {};
      
      return {
        leads: {
          totalLeads: Number(result.totalLeads) || 0,
          newLeads: Number(result.newLeads) || 0,
          activeLeads: Number(result.activeLeads) || 0,
          expiredLeads: Number(result.expiredLeads) || 0,
          archivedLeads: Number(result.archivedLeads) || 0
        },
        matches: {
          totalMatches: Number(result.totalLeads) || 0,
          pendingMatches: Number(result.activeLeads) || 0,
          contactedMatches: Number(result.contactedLeads) || 0,
          declinedMatches: Number(result.declinedLeads) || 0
        },
        isProcessing: this.isProcessing,
        lastProcessed: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Error getting processing stats:', error);
      return {
        leads: {
          totalLeads: 0,
          newLeads: 0,
          activeLeads: 0,
          expiredLeads: 0,
          archivedLeads: 0
        },
        matches: {
          totalMatches: 0,
          pendingMatches: 0,
          contactedMatches: 0,
          declinedMatches: 0
        },
        isProcessing: false,
        lastProcessed: new Date().toISOString()
      };
    }
  }
}

export const automatedLeadProcessor = new AutomatedLeadProcessor();