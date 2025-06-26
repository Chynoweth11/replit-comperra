// Professional Network Service - Mock Firebase Integration
export interface Member {
  uid: string;
  name: string;
  email: string;
  type: 'pro' | 'vendor';
  services: string[];
  zipCode: string;
  coordinates: { lat: number; lon: number };
  subscription: 'basic' | 'pro' | 'credit';
  credits?: number;
  claimedLeads: string[];
  isAdmin?: boolean;
}

export interface Lead {
  id: string;
  customerName: string;
  email: string;
  phone: string;
  zipCode: string;
  coordinates: { lat: number; lon: number };
  serviceType: string;
  leadType: 'pro' | 'vendor';
  description: string;
  createdAt: string;
  distance?: number;
}

class FirebaseNetworkService {
  private MOCK_MEMBERS: Member[] = [];
  private MOCK_LEADS: Lead[] = [];
  
  private zipCodeDatabase: Record<string, { lat: number; lon: number }> = {
    "90210": { lat: 34.0901, lon: -118.4065 },
    "86001": { lat: 35.1983, lon: -111.6513 },
    "10001": { lat: 40.7505, lon: -73.9980 },
    "33139": { lat: 25.7907, lon: -80.1300 },
    "60611": { lat: 41.8918, lon: -87.6224 },
    "75201": { lat: 32.7811, lon: -96.7972 },
    "30309": { lat: 33.7901, lon: -84.3902 },
    "98101": { lat: 47.6062, lon: -122.3321 },
    "80202": { lat: 39.7547, lon: -105.0178 },
    "02108": { lat: 42.3751, lon: -71.0603 }
  };

  subscriptionTiers = {
    basic: { name: 'Basic', radius: 10, cost: '$0/mo', description: 'Perfect for getting started. Claim up to 4 leads per month.' },
    pro: { name: 'Pro', radius: 50, cost: '$49/mo', description: 'The best value for established businesses, with unlimited lead claims.' },
    credit: { name: 'Pay-as-you-go', radius: 50, cost: '$15/lead', description: 'A flexible option with no subscription. Simply buy credits to claim the leads you want.' }
  };

  private serviceCategoryMap = {
    'Tiles': { pro: 'Tile Installation', vendor: 'Tile Supplier' },
    'Stone & Slabs': { pro: 'Slabs/Countertop Supply & Installation', vendor: null },
    'Vinyl & LVT': { pro: 'Vinyl & LVT Installation', vendor: 'Vinyl & LVT Supplier' },
    'Hardwood': { pro: 'Hardwood Floor Installation', vendor: 'Hardwood Flooring Supplier' },
    'Carpet': { pro: 'Carpet Installation', vendor: 'Carpet Supplier' },
    'Heating & Thermostats': { pro: 'Heating & Thermostat Installation', vendor: 'Heating & Thermostat Product Seller' }
  };

  async submitLead(leadData: any): Promise<Lead> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const coords = this.zipCodeDatabase[leadData.zipCode];
        if (!coords) {
          reject({ message: 'Invalid ZIP code.' });
          return;
        }
        
        const newLead: Lead = {
          ...leadData,
          id: `lead_${Date.now()}`,
          coordinates: coords,
          createdAt: new Date().toISOString()
        };
        
        this.MOCK_LEADS.push(newLead);
        resolve(newLead);
      }, 1000);
    });
  }
}

export const firebaseNetworkService = new FirebaseNetworkService();